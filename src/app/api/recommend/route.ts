import { NextResponse } from "next/server";
import { recommendNextMealWithAI } from "@/lib/ai";
import { remainingMacros } from "@/lib/nutrition";
import { getOrCreateTodayLog, readDB, writeDB } from "@/lib/store";
import { Recommendation } from "@/lib/types";

export async function POST() {
  const db = readDB();
  if (!db.profile) {
    return NextResponse.json({ error: "Create a profile before requesting a recommendation." }, { status: 400 });
  }

  const dayLog = getOrCreateTodayLog(db);
  const remaining = remainingMacros(db.profile.targets, dayLog.totals);

  let result;
  try {
    result = await recommendNextMealWithAI({
      goal: db.profile.goal,
      dietaryPreference: db.profile.dietaryPreference,
      targets: db.profile.targets,
      consumedToday: dayLog.totals,
      remaining,
      mealsEatenToday: dayLog.meals.map((m) => m.description),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown AI error";
    return NextResponse.json({ error: `Could not generate a recommendation: ${message}` }, { status: 502 });
  }

  const recommendation: Recommendation = { ...result, generatedAt: new Date().toISOString() };
  db.lastRecommendation = recommendation;
  writeDB(db);

  return NextResponse.json({ recommendation });
}
