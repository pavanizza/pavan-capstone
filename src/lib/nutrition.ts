import { ActivityLevel, Goal, Macros, UserProfile } from "./types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const CALORIE_ADJUSTMENT: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 400,
};

const PROTEIN_PER_KG: Record<Goal, number> = {
  lose: 2.0,
  maintain: 1.8,
  gain: 2.0,
};

const FAT_CALORIE_SHARE = 0.25;

export function calculateBMR(profile: Pick<UserProfile, "sex" | "weightKg" | "heightCm" | "age">): number {
  const { sex, weightKg, heightCm, age } = profile;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "male" ? base + 5 : base - 161;
}

export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calculateTargets(
  profile: Pick<UserProfile, "sex" | "weightKg" | "heightCm" | "age" | "activityLevel" | "goal">,
): Macros {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const calories = Math.round(tdee + CALORIE_ADJUSTMENT[profile.goal]);

  const protein = Math.round(profile.weightKg * PROTEIN_PER_KG[profile.goal]);
  const fatCalories = calories * FAT_CALORIE_SHARE;
  const fat = Math.round(fatCalories / 9);
  const remainingCalories = calories - protein * 4 - fatCalories;
  const carbs = Math.round(Math.max(remainingCalories, 0) / 4);

  return { calories, protein, carbs, fat };
}

export function sumMacros(items: Macros[]): Macros {
  return items.reduce(
    (total, item) => ({
      calories: total.calories + item.calories,
      protein: total.protein + item.protein,
      carbs: total.carbs + item.carbs,
      fat: total.fat + item.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function remainingMacros(targets: Macros, consumed: Macros): Macros {
  return {
    calories: Math.round(targets.calories - consumed.calories),
    protein: Math.round(targets.protein - consumed.protein),
    carbs: Math.round(targets.carbs - consumed.carbs),
    fat: Math.round(targets.fat - consumed.fat),
  };
}
