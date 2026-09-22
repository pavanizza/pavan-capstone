// Mirrors the web app's src/lib/types.ts. Kept as a separate copy rather
// than a shared package - the mobile app and the Next.js app have
// independent build systems, and this is a small, stable set of types.

export type Sex = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

export type Goal = "lose" | "maintain" | "gain";

export type DietaryPreference = "non_vegetarian" | "vegetarian" | "eggetarian" | "vegan" | "pescatarian";

export interface Macros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface UserProfile {
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  dietaryPreference: DietaryPreference;
  targets: Macros;
}

export interface FoodItem {
  name: string;
  quantity: string;
  macros: Macros;
  grounded?: boolean;
}

export interface MealEntry {
  id: string;
  time: string;
  description: string;
  items: FoodItem[];
  totals: Macros;
}

export interface DayLog {
  date: string;
  meals: MealEntry[];
  totals: Macros;
}

export interface Recommendation {
  mealName: string;
  description: string;
  items: { name: string; quantity: string }[];
  estimatedMacros: Macros;
  rationale: string;
  generatedAt: string;
}

export interface NutritionFactCheckReport {
  written: string[];
  skipped: string[];
  needsReview: { food: string; why: string }[];
}
