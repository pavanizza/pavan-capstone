import { NextRequest, NextResponse } from "next/server";
import { sumMacros } from "@/lib/nutrition";
import { getOrCreateTodayLog, readDB, writeDB } from "@/lib/store";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDB();
  const dayLog = getOrCreateTodayLog(db);

  const before = dayLog.meals.length;
  dayLog.meals = dayLog.meals.filter((meal) => meal.id !== id);

  if (dayLog.meals.length === before) {
    return NextResponse.json({ error: "Meal not found in today's log." }, { status: 404 });
  }

  dayLog.totals = sumMacros(dayLog.meals.map((m) => m.totals));
  db.lastRecommendation = null;
  writeDB(db);

  return NextResponse.json({ dayLog });
}
