import { NextRequest, NextResponse } from "next/server";
import { calculateTargets } from "@/lib/nutrition";
import { readDB, writeDB } from "@/lib/store";
import { UserProfile } from "@/lib/types";

export async function GET() {
  const db = readDB();
  return NextResponse.json({ profile: db.profile });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const profile: UserProfile = {
    name: body.name,
    age: Number(body.age),
    sex: body.sex,
    heightCm: Number(body.heightCm),
    weightKg: Number(body.weightKg),
    activityLevel: body.activityLevel,
    goal: body.goal,
    dietaryPreference: body.dietaryPreference,
    avatarId: typeof body.avatarId === "string" ? body.avatarId : undefined,
    targets: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  };

  profile.targets = calculateTargets(profile);

  const db = readDB();
  db.profile = profile;
  writeDB(db);

  return NextResponse.json({ profile });
}
