import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { DietaryPreference, FoodItem, Goal, Macros } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// The full (non-lite) Flash tier is currently over capacity and returning 503s;
// the Lite model handles both tasks fine and responds reliably. Override via
// env if you want to try a heavier model for recommendations later.
const PARSE_MODEL = process.env.GEMINI_MODEL_PARSE || "gemini-flash-lite-latest";
const RECOMMEND_MODEL = process.env.GEMINI_MODEL_RECOMMEND || "gemini-flash-lite-latest";

const MealParseSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().describe("Name of the food item, e.g. 'Roti' or 'Paneer curry'"),
        quantity: z
          .string()
          .describe("Human-readable serving size, e.g. '2 rotis' or '1 medium bowl (~150g)'"),
        calories: z.number().describe("Estimated calories for this serving"),
        protein: z.number().describe("Estimated protein in grams for this serving"),
        carbs: z.number().describe("Estimated carbohydrates in grams for this serving"),
        fat: z.number().describe("Estimated fat in grams for this serving"),
      }),
    )
    .min(1),
});

async function generateStructured<T>(input: {
  model: string;
  systemInstruction: string;
  contents: string;
  schema: z.ZodType<T>;
}): Promise<T> {
  const response = await ai.models.generateContent({
    model: input.model,
    contents: input.contents,
    config: {
      systemInstruction: input.systemInstruction,
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(input.schema),
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  return input.schema.parse(JSON.parse(response.text));
}

export async function parseMealWithAI(
  description: string,
  dietaryPreference: DietaryPreference,
): Promise<FoodItem[]> {
  const parsed = await generateStructured({
    model: PARSE_MODEL,
    schema: MealParseSchema,
    contents: description,
    systemInstruction:
      "You are a nutrition estimation assistant specializing in Indian home-cooked meals as well as " +
      "common international foods. Given a natural-language description of a meal, split it into " +
      "distinct food items. When the user does not give an exact quantity, assume a typical single " +
      "serving size for that food. Estimate calories, protein, carbohydrates, and fat as reasonably " +
      "as possible using standard nutrition references - your estimates do not need to be lab-precise, " +
      `just realistic. The user's dietary preference is '${dietaryPreference}'; flag no conflicts, just estimate what they described.`,
  });

  return parsed.items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    macros: {
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    },
  }));
}

const RecommendationSchema = z.object({
  mealName: z.string().describe("Short, appetizing name for the recommended meal"),
  description: z.string().describe("1-2 sentence natural-language description of the meal"),
  items: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.string().describe("Suggested serving size"),
      }),
    )
    .min(1),
  estimatedMacros: z.object({
    calories: z.number(),
    protein: z.number(),
    carbs: z.number(),
    fat: z.number(),
  }),
  rationale: z
    .string()
    .describe("Brief explanation of why this meal fits the user's remaining calories/macros and goal"),
});

export interface RecommendationContext {
  goal: Goal;
  dietaryPreference: DietaryPreference;
  targets: Macros;
  consumedToday: Macros;
  remaining: Macros;
  mealsEatenToday: string[];
}

export async function recommendNextMealWithAI(ctx: RecommendationContext) {
  return generateStructured({
    model: RECOMMEND_MODEL,
    schema: RecommendationSchema,
    contents: JSON.stringify(
      {
        goal: ctx.goal,
        dietaryPreference: ctx.dietaryPreference,
        dailyTargets: ctx.targets,
        consumedSoFarToday: ctx.consumedToday,
        remainingForToday: ctx.remaining,
        mealsEatenToday: ctx.mealsEatenToday,
      },
      null,
      2,
    ),
    systemInstruction:
      "You are a nutrition coach that recommends a single next meal for a user tracking their calories " +
      "and macros. Analyze their remaining calories and macros for the day, identify the most important " +
      "nutritional gap (e.g. low on protein, too many carbs left, few calories remaining), and suggest one " +
      "realistic, appetizing meal that fits their remaining budget, dietary preference, and goal. Prefer " +
      "foods consistent with what they have already been eating today when relevant. If remaining calories " +
      "are very low or negative, suggest a small, light option instead of a full meal.",
  });
}
