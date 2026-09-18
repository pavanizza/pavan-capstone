// Nutrition Fact Check Agent - CLI entry point.
//
// Thin wrapper around src/lib/nutritionFactAgent.mjs, the same module the
// live app calls from POST /api/nutrition-facts/refresh. Kept as a
// standalone script for manual runs / cron use outside the running app.
//
// Usage: node scripts/agent/nutrition-fact-agent.mjs

import path from "path";
import { fileURLToPath } from "url";
import { getTodaysFoodNames, runNutritionFactCheck, closeMcpClients } from "../../src/lib/nutritionFactAgent.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

function onStep(step, food, msg) {
  console.log(`[${step}] [${food}] ${msg}`);
}

async function main() {
  console.log("[BOOT] connecting to MCP servers (filesystem, web-search)...");
  const foods = getTodaysFoodNames(PROJECT_ROOT);
  console.log(`[PERCEIVE] found ${foods.length} distinct food(s) logged today: ${foods.join(", ") || "(none)"}`);

  if (foods.length === 0) {
    console.log("[PERCEIVE] nothing to do - no meals logged today. Log a meal through the app first.");
    return;
  }

  const report = await runNutritionFactCheck({ projectRoot: PROJECT_ROOT, foods, onStep });

  console.log("\n=== SUMMARY ===");
  console.log(`written:      ${report.written.join(", ") || "(none)"}`);
  console.log(`skipped:      ${report.skipped.join(", ") || "(none)"}`);
  console.log(`needs_review: ${report.needsReview.map((r) => `${r.food} (${r.why})`).join("; ") || "(none)"}`);
}

main()
  .catch((err) => {
    console.error("FATAL:", err);
    process.exitCode = 1;
  })
  .finally(() => closeMcpClients());
