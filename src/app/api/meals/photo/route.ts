import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { parseMealPhotoWithAI, UnrecognizableMealError } from "@/lib/ai";
import { sumMacros } from "@/lib/nutrition";
import { getOrCreateTodayLog, readDB, writeDB } from "@/lib/store";
import { MealEntry } from "@/lib/types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB of raw bytes (base64 is ~4/3 of that)

export async function POST(req: NextRequest) {
  const { imageBase64, mimeType } = await req.json();

  if (!imageBase64 || typeof imageBase64 !== "string") {
    return NextResponse.json({ error: "A photo is required." }, { status: 400 });
  }
  if (!mimeType || typeof mimeType !== "string" || !mimeType.startsWith("image/")) {
    return NextResponse.json({ error: "Unsupported or missing image type." }, { status: 400 });
  }
  if (imageBase64.length > (MAX_IMAGE_BYTES * 4) / 3) {
    return NextResponse.json({ error: "That photo is too large. Try a smaller image." }, { status: 413 });
  }

  const db = readDB();
  if (!db.profile) {
    return NextResponse.json({ error: "Create a profile before logging meals." }, { status: 400 });
  }

  let items;
  try {
    items = await parseMealPhotoWithAI(imageBase64, mimeType, db.profile.dietaryPreference);
  } catch (err) {
    if (err instanceof UnrecognizableMealError) {
      return NextResponse.json({ error: err.message }, { status: 422 });
    }
    const message = err instanceof Error ? err.message : "Unknown AI error";
    return NextResponse.json({ error: `Could not analyze that photo: ${message}` }, { status: 502 });
  }

  const meal: MealEntry = {
    id: randomUUID(),
    time: new Date().toISOString(),
    description: items.map((item) => item.name).join(", "),
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
