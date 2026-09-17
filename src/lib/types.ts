export type Sex = "male" | "female";

export type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type Goal = "lose" | "maintain" | "gain";

export type DietaryPreference =
  | "none"
  | "vegetarian"
  | "eggetarian"
  | "vegan"
  | "pescatarian";

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

export interface DB {
  profile: UserProfile | null;
  days: Record<string, DayLog>;
  lastRecommendation: Recommendation | null;
}
