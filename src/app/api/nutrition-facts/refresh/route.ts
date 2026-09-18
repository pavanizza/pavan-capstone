import { NextResponse } from "next/server";
import { getTodaysFoodNames, runNutritionFactCheck } from "@/lib/nutritionFactAgent.mjs";

// Triggers the Assessment-2 agent (perceive -> reason -> act -> observe over
// the filesystem + Wikipedia MCP servers) for today's actually-logged foods.
// This is a deliberately on-demand, non-blocking enrichment step - see
// README.md "Nutrition fact-check agent" for why it isn't run inline on
// every meal log (MCP server cold-start + a real web search per food would
// make the core "log a meal" flow slow and fragile).
export async function POST() {
  const projectRoot = process.cwd();
  const foods = getTodaysFoodNames(projectRoot);

  if (foods.length === 0) {
    return NextResponse.json({ error: "No meals logged today - log a meal first." }, { status: 400 });
  }

  const steps: { step: string; food: string; msg: string }[] = [];
  try {
    const report = await runNutritionFactCheck({
      projectRoot,
      foods,
      onStep: (step: string, food: string, msg: string) => steps.push({ step, food, msg }),
    });
    return NextResponse.json({ report, steps });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Nutrition fact-check agent failed: ${message}` }, { status: 502 });
  }
}
