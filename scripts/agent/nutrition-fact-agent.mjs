// Nutrition Fact Check Agent
//
// Runs the .claude/skills/nutrition-fact-check Skill in a real
// perceive -> reason -> act -> observe loop, once per distinct food name
// found in today's actually-logged meals (data/db.json, written by the
// running app). Talks to two real MCP servers over stdio:
//   - filesystem (@modelcontextprotocol/server-filesystem), scoped to ./data
//   - web-search (wikipedia-mcp - official Wikipedia API), no API key required
//
// (A DuckDuckGo-scraping MCP server was tried first and dropped - see
// .claude/skills/nutrition-fact-check/SKILL.md for why.)
//
// Usage: node scripts/agent/nutrition-fact-agent.mjs

import { GoogleGenAI } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const NPX_CMD = process.platform === "win32" ? "npx.cmd" : "npx";

const CACHE_FRESHNESS_DAYS = 90;
const MODEL = process.env.GEMINI_MODEL_PARSE || "gemini-flash-lite-latest";

const ExtractionResult = z.object({
  confident: z.boolean().describe("true only if the search results give a clear, consistent answer"),
  reason: z.string().describe("why confident/not confident, one sentence"),
  entry: z
    .object({
      food: z.string(),
      servingSize: z.string(),
      calories: z.number(),
      proteinG: z.number(),
      carbsG: z.number(),
      fatG: z.number(),
      sourceTitle: z.string(),
      sourceSnippet: z.string(),
    })
    .optional()
    .describe("only set when confident is true"),
});

function log(step, msg) {
  console.log(`[${step}] ${msg}`);
}

function loadSkillInstructions() {
  const skillPath = path.join(PROJECT_ROOT, ".claude", "skills", "nutrition-fact-check", "SKILL.md");
  const raw = fs.readFileSync(skillPath, "utf-8");
  // Strip the YAML frontmatter block; keep the instructions body.
  return raw.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
}

async function connectServer(label, args) {
  const transport = new StdioClientTransport({ command: NPX_CMD, args, stderr: "ignore" });
  const client = new Client({ name: `nutrition-fact-agent:${label}`, version: "1.0.0" });
  await client.connect(transport);
  return client;
}

function isValidEntry(entry) {
  if (!entry) return { ok: false, why: "no entry" };
  const { calories, proteinG, carbsG, fatG } = entry;
  const nums = [calories, proteinG, carbsG, fatG];
  if (nums.some((n) => typeof n !== "number" || !Number.isFinite(n) || n < 0)) {
    return { ok: false, why: "non-numeric or negative macro" };
  }
  if (calories < 5 || calories > 1500) {
    return { ok: false, why: `calories ${calories} outside plausible single-serving range` };
  }
  const implied = proteinG * 4 + carbsG * 4 + fatG * 9;
  const diffRatio = Math.abs(implied - calories) / calories;
  if (diffRatio > 0.4) {
    return { ok: false, why: `stated calories (${calories}) inconsistent with macros (implies ~${Math.round(implied)})` };
  }
  return { ok: true };
}

function normalizeFoodName(name) {
  return name.trim().toLowerCase();
}

async function main() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const skillInstructions = loadSkillInstructions();

  log("BOOT", "connecting to MCP servers (filesystem, web-search)...");
  const fsClient = await connectServer("filesystem", [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    path.join(PROJECT_ROOT, "data"),
  ]);
  const searchClient = await connectServer("web-search", ["-y", "wikipedia-mcp"]);
  log("BOOT", "connected.");

  // ---- PERCEIVE: read today's real logged meals + the current cache ----
  log("PERCEIVE", "reading data/db.json (today's real logged meals)...");
  const dbResult = await fsClient.callTool({ name: "read_text_file", arguments: { path: "db.json" } });
  const db = JSON.parse(dbResult.content[0].text);
  const today = new Date().toISOString().slice(0, 10);
  const todaysMeals = db.days?.[today]?.meals ?? [];
  const foodNames = [...new Set(todaysMeals.flatMap((m) => m.items.map((i) => normalizeFoodName(i.name))))];
  log("PERCEIVE", `found ${foodNames.length} distinct food(s) logged today: ${foodNames.join(", ") || "(none)"}`);

  if (foodNames.length === 0) {
    log("PERCEIVE", "nothing to do - no meals logged today. Log a meal through the app first.");
    await fsClient.close();
    await searchClient.close();
    return;
  }

  let cache = {};
  try {
    const cacheResult = await fsClient.callTool({ name: "read_text_file", arguments: { path: "nutrition-facts.json" } });
    cache = JSON.parse(cacheResult.content[0].text);
    log("PERCEIVE", `loaded existing cache with ${Object.keys(cache).length} entr(y/ies).`);
  } catch {
    log("PERCEIVE", "no existing cache found - starting fresh.");
  }

  const report = { written: [], skipped: [], needsReview: [] };

  // ---- loop: one perceive->reason->act->observe pass per food ----
  for (const food of foodNames) {
    log("REASON", `[${food}] checking cache freshness...`);
    const cached = cache[food];
    const isFresh =
      cached && Date.now() - new Date(cached.verifiedAt).getTime() < CACHE_FRESHNESS_DAYS * 24 * 60 * 60 * 1000;

    if (isFresh) {
      log("REASON", `[${food}] already cached and fresh (verified ${cached.verifiedAt}) - skipping.`);
      report.skipped.push(food);
      continue;
    }
    log("REASON", `[${food}] missing or stale in cache - needs a lookup.`);

    // ---- ACT: search Wikipedia, fetch the best matching article, then ask ----
    // ---- Gemini (following the Skill) to extract a structured entry ----
    log("ACT", `[${food}] searching Wikipedia via MCP (search)...`);
    const searchResult = await searchClient.callTool({ name: "search", arguments: { query: food } });
    const searchText = searchResult.content.map((c) => c.text).join("\n\n");
    const titleMatch = searchText.match(/\*\*(.+?)\*\*/);
    const articleTitle = titleMatch?.[1];

    let articleExcerpt = "(no matching Wikipedia article found)";
    let sourceUrl = null;
    if (articleTitle) {
      log("ACT", `[${food}] best match: "${articleTitle}" - fetching article via MCP (readArticle)...`);
      const urlMatch = searchText.match(/Article link: (\S+)/);
      sourceUrl = urlMatch?.[1] ?? null;
      const articleResult = await searchClient.callTool({ name: "readArticle", arguments: { title: articleTitle } });
      const articleText = articleResult.content.map((c) => c.text).join("\n");
      const nutritionIdx = articleText.search(/kcal|nutritional value/i);
      articleExcerpt =
        nutritionIdx >= 0
          ? articleText.slice(Math.max(0, nutritionIdx - 400), nutritionIdx + 1200)
          : articleText.slice(0, 1500);
    } else {
      log("ACT", `[${food}] no matching Wikipedia article found.`);
    }

    log("ACT", `[${food}] asking Gemini to extract a cited entry per the Skill's rules...`);
    const response = await ai.models.generateContent({
      model: MODEL,
      contents:
        `Food to look up: "${food}"\n\n` +
        `Wikipedia article: ${articleTitle ?? "(none found)"}${sourceUrl ? ` (${sourceUrl})` : ""}\n\n` +
        `Relevant excerpt:\n${articleExcerpt}`,
      config: {
        systemInstruction: skillInstructions,
        responseMimeType: "application/json",
        responseJsonSchema: z.toJSONSchema(ExtractionResult),
      },
    });

    let extraction;
    try {
      extraction = ExtractionResult.parse(JSON.parse(response.text));
    } catch (err) {
      log("ACT", `[${food}] model output failed schema validation: ${err.message} - marking needs_review.`);
      report.needsReview.push({ food, why: "unparseable model output" });
      continue;
    }

    if (!extraction.confident || !extraction.entry) {
      log("ACT", `[${food}] model was not confident (${extraction.reason}) - marking needs_review.`);
      report.needsReview.push({ food, why: extraction.reason });
      continue;
    }

    const validity = isValidEntry(extraction.entry);
    if (!validity.ok) {
      log("ACT", `[${food}] entry failed validation (${validity.why}) - marking needs_review.`);
      report.needsReview.push({ food, why: validity.why });
      continue;
    }

    const entry = { ...extraction.entry, verifiedAt: new Date().toISOString() };
    cache[food] = entry;
    log("ACT", `[${food}] writing updated cache via MCP (write_file)...`);
    await fsClient.callTool({
      name: "write_file",
      arguments: { path: "nutrition-facts.json", content: JSON.stringify(cache, null, 2) },
    });

    // ---- OBSERVE: re-read the file back and re-validate before trusting the write ----
    log("OBSERVE", `[${food}] re-reading cache to confirm the write landed correctly...`);
    const verifyResult = await fsClient.callTool({ name: "read_text_file", arguments: { path: "nutrition-facts.json" } });
    const verifyCache = JSON.parse(verifyResult.content[0].text);
    const verifyEntry = verifyCache[food];
    const verifyValidity = isValidEntry(verifyEntry);
    if (!verifyEntry || verifyValidity.ok === false) {
      log("OBSERVE", `[${food}] post-write verification FAILED (${verifyValidity.why}) - marking needs_review.`);
      report.needsReview.push({ food, why: `post-write verification failed: ${verifyValidity.why}` });
      continue;
    }
    log("OBSERVE", `[${food}] verified OK: ${entry.calories} kcal / P${entry.proteinG} C${entry.carbsG} F${entry.fatG} (source: "${entry.sourceTitle}")`);
    report.written.push(food);
  }

  await fsClient.close();
  await searchClient.close();

  console.log("\n=== SUMMARY ===");
  console.log(`written:      ${report.written.join(", ") || "(none)"}`);
  console.log(`skipped:      ${report.skipped.join(", ") || "(none)"}`);
  console.log(`needs_review: ${report.needsReview.map((r) => `${r.food} (${r.why})`).join("; ") || "(none)"}`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
