// Nutrition Fact Check Agent - shared core.
//
// Runs the .claude/skills/nutrition-fact-check Skill in a real
// perceive -> reason -> act -> observe loop over MCP servers (filesystem +
// Wikipedia web-search). This module is imported by BOTH:
//   - scripts/agent/nutrition-fact-agent.mjs (standalone CLI / cron use)
//   - src/app/api/nutrition-facts/refresh/route.ts (triggered from the app)
// so the mechanism from Assessment 2 is the actual thing powering the
// capstone's live "Verify nutrition facts" feature, not a parallel copy.
//
// Plain ESM (not .ts): the CLI script runs it directly with `node`, with
// no build step, so this module (and its dependencies) must too.

import { GoogleGenAI } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { isValidMacros } from "./nutritionValidation.mjs";

const NPX_CMD = process.platform === "win32" ? "npx.cmd" : "npx";
const CACHE_FRESHNESS_DAYS = 90;

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

function normalizeFoodName(name) {
  return name.trim().toLowerCase();
}

function loadSkillInstructions(projectRoot) {
  const skillPath = path.join(projectRoot, ".claude", "skills", "nutrition-fact-check", "SKILL.md");
  const raw = fs.readFileSync(skillPath, "utf-8");
  return raw.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
}

// Module-level singleton so an API route serving multiple requests within
// the same long-running Next.js dev/prod server process reuses the same
// MCP connections instead of paying npx cold-start cost every request.
// The standalone CLI script calls closeMcpClients() once at the end since
// it's a one-shot process.
let clientsPromise = null;

async function connectServer(label, args) {
  const transport = new StdioClientTransport({ command: NPX_CMD, args, stderr: "ignore" });
  const client = new Client({ name: `nutrition-fact-agent:${label}`, version: "1.0.0" });
  await client.connect(transport);
  return client;
}

async function getClients(projectRoot) {
  if (!clientsPromise) {
    clientsPromise = (async () => {
      const fsClient = await connectServer("filesystem", [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        path.join(projectRoot, "data"),
      ]);
      const searchClient = await connectServer("web-search", ["-y", "wikipedia-mcp"]);
      return { fsClient, searchClient };
    })().catch((err) => {
      clientsPromise = null; // let the next call retry instead of caching a broken promise
      throw err;
    });
  }
  return clientsPromise;
}

export async function closeMcpClients() {
  if (!clientsPromise) return;
  const { fsClient, searchClient } = await clientsPromise.catch(() => ({}));
  await fsClient?.close();
  await searchClient?.close();
  clientsPromise = null;
}

/** Perceive step, part 1: today's distinct food names from the real app's log. */
export function getTodaysFoodNames(projectRoot) {
  const dbPath = path.join(projectRoot, "data", "db.json");
  let db;
  try {
    db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
  } catch {
    return [];
  }
  const today = new Date().toISOString().slice(0, 10);
  const todaysMeals = db.days?.[today]?.meals ?? [];
  return [...new Set(todaysMeals.flatMap((m) => m.items.map((i) => normalizeFoodName(i.name))))];
}

/**
 * Runs the full loop for the given list of foods.
 * @param {{projectRoot: string, foods: string[], model?: string, onStep?: (step: string, food: string, msg: string) => void}} opts
 */
export async function runNutritionFactCheck({ projectRoot, foods, model, onStep }) {
  const log = onStep ?? (() => {});
  const MODEL = model || process.env.GEMINI_MODEL_PARSE || "gemini-flash-lite-latest";
  if (!process.env.GEMINI_API_KEY) {
    // Fail clearly here too - without this, the SDK falls back to trying
    // Google Cloud Application Default Credentials and throws a confusing
    // "Could not load the default credentials" error instead.
    throw new Error("GEMINI_API_KEY is not set. Add it to your environment and restart/redeploy.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const skillInstructions = loadSkillInstructions(projectRoot);
  const { fsClient, searchClient } = await getClients(projectRoot);

  let cache = {};
  try {
    const cacheResult = await fsClient.callTool({ name: "read_text_file", arguments: { path: "nutrition-facts.json" } });
    cache = JSON.parse(cacheResult.content[0].text);
  } catch {
    cache = {};
  }

  const report = { written: [], skipped: [], needsReview: [] };

  for (const food of foods) {
    const cached = cache[food];
    const isFresh =
      cached && Date.now() - new Date(cached.verifiedAt).getTime() < CACHE_FRESHNESS_DAYS * 24 * 60 * 60 * 1000;

    if (isFresh) {
      log("REASON", food, "already cached and fresh - skipping.");
      report.skipped.push(food);
      continue;
    }
    log("REASON", food, "missing or stale in cache - needs a lookup.");

    log("ACT", food, "searching Wikipedia via MCP (search)...");
    let searchText;
    try {
      const searchResult = await searchClient.callTool({ name: "search", arguments: { query: food } });
      searchText = searchResult.content.map((c) => c.text).join("\n\n");
    } catch (err) {
      log("ACT", food, `web-search MCP call failed (${err.message}) - marking needs_review.`);
      report.needsReview.push({ food, why: `web-search failed: ${err.message}` });
      continue;
    }

    const titleMatch = searchText.match(/\*\*(.+?)\*\*/);
    const articleTitle = titleMatch?.[1];
    let articleExcerpt = "(no matching Wikipedia article found)";
    let sourceUrl = null;
    if (articleTitle) {
      log("ACT", food, `best match: "${articleTitle}" - fetching article via MCP (readArticle)...`);
      const urlMatch = searchText.match(/Article link: (\S+)/);
      sourceUrl = urlMatch?.[1] ?? null;
      const articleResult = await searchClient.callTool({ name: "readArticle", arguments: { title: articleTitle } });
      const articleText = articleResult.content.map((c) => c.text).join("\n");
      const nutritionIdx = articleText.search(/kcal|nutritional value/i);
      articleExcerpt =
        nutritionIdx >= 0
          ? articleText.slice(Math.max(0, nutritionIdx - 400), nutritionIdx + 1200)
          : articleText.slice(0, 1500);
    }

    log("ACT", food, "asking Gemini to extract a cited entry per the Skill's rules...");
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
      log("ACT", food, `model output failed schema validation - marking needs_review.`);
      report.needsReview.push({ food, why: "unparseable model output" });
      continue;
    }

    if (!extraction.confident || !extraction.entry) {
      log("ACT", food, `model was not confident (${extraction.reason}) - marking needs_review.`);
      report.needsReview.push({ food, why: extraction.reason });
      continue;
    }

    const validity = isValidMacros({
      calories: extraction.entry.calories,
      proteinG: extraction.entry.proteinG,
      carbsG: extraction.entry.carbsG,
      fatG: extraction.entry.fatG,
    });
    if (!validity.ok) {
      log("ACT", food, `entry failed validation (${validity.why}) - marking needs_review.`);
      report.needsReview.push({ food, why: validity.why });
      continue;
    }

    const entry = { ...extraction.entry, verifiedAt: new Date().toISOString() };
    cache[food] = entry;
    log("ACT", food, "writing updated cache via MCP (write_file)...");
    await fsClient.callTool({
      name: "write_file",
      arguments: { path: "nutrition-facts.json", content: JSON.stringify(cache, null, 2) },
    });

    log("OBSERVE", food, "re-reading cache to confirm the write landed correctly...");
    const verifyResult = await fsClient.callTool({ name: "read_text_file", arguments: { path: "nutrition-facts.json" } });
    const verifyCache = JSON.parse(verifyResult.content[0].text);
    const verifyValidity = isValidMacros({
      calories: verifyCache[food]?.calories,
      proteinG: verifyCache[food]?.proteinG,
      carbsG: verifyCache[food]?.carbsG,
      fatG: verifyCache[food]?.fatG,
    });
    if (!verifyCache[food] || !verifyValidity.ok) {
      log("OBSERVE", food, `post-write verification FAILED (${verifyValidity.why}) - marking needs_review.`);
      report.needsReview.push({ food, why: `post-write verification failed: ${verifyValidity.why}` });
      continue;
    }
    log(
      "OBSERVE",
      food,
      `verified OK: ${entry.calories} kcal / P${entry.proteinG} C${entry.carbsG} F${entry.fatG} (source: "${entry.sourceTitle}")`,
    );
    report.written.push(food);
  }

  return report;
}
