import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { parseMealWithAI, UnrecognizableMealError } from "@/lib/ai";
import { sumMacros } from "@/lib/nutrition";
import { getOrCreateTodayLog, readDB, writeDB } from "@/lib/store";
import { MealEntry } from "@/lib/types";

export async function GET() {
  const db = readDB();
  const dayLog = getOrCreateTodayLog(db);
  return NextResponse.json({ dayLog });
}

export async function POST(req: NextRequest) {
  const { description } = await req.json();

  if (!description || typeof description !== "string" || !description.trim()) {
    return NextResponse.json({ error: "A meal description is required." }, { status: 400 });
  }

  const db = readDB();
  if (!db.profile) {
    return NextResponse.json({ error: "Create a profile before logging meals." }, { status: 400 });
  }

  let items;
  try {
    items = await parseMealWithAI(description.trim(), db.profile.dietaryPreference);
  } catch (err) {
    if (err instanceof UnrecognizableMealError) {
      // Realistic failure case, handled gracefully: bad/garbage AI output or
      // non-food input never reaches the user's daily totals.
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    const message = err instanceof Error ? err.message : "Unknown AI error";
    return NextResponse.json({ error: `Could not interpret that meal: ${message}` }, { status: 502 });
  }

  const meal: MealEntry = {
    id: randomUUID(),
    time: new Date().toISOString(),
    description: description.trim(),
    items,
    totals: sumMacros(items.map((item) => item.macros)),
  };

  const dayLog = getOrCreateTodayLog(db);
  dayLog.meals.push(meal);
  dayLog.totals = sumMacros(dayLog.meals.map((m) => m.totals));
  db.lastRecommendation = null;
  writeDB(db);

  return NextResponse.json({ meal, dayLog });
}
