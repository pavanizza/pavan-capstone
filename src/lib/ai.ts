import { ContentListUnion, GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { DietaryPreference, FoodItem, Goal, Macros } from "./types";
import { isValidMacros } from "./nutritionValidation.mjs";
import { readNutritionFactsCache, lookupFreshEntry } from "./nutritionFactsCache.mjs";

/** Thrown when, after grounding + validation, no plausible food items are
 * left - e.g. the description wasn't food, or the model's guesses were
 * numerically implausible (garbage output). Handled specially by
 * /api/meals so the user gets an actionable message instead of a generic
 * 500 or - worse - silently-logged garbage macros. */
export class UnrecognizableMealError extends Error {}

// The full (non-lite) Flash tier is currently over capacity and returning 503s;
// the Lite model handles both tasks fine and responds reliably. Override via
// env if you want to try a heavier model for recommendations later.
const PARSE_MODEL = process.env.GEMINI_MODEL_PARSE || "gemini-flash-lite-latest";
const RECOMMEND_MODEL = process.env.GEMINI_MODEL_RECOMMEND || "gemini-flash-lite-latest";

let ai: GoogleGenAI | null = null;

/** Lazily constructs the Gemini client, failing loudly and specifically if
 * GEMINI_API_KEY isn't set. Without this check, the SDK silently falls
 * back to trying Google Cloud Application Default Credentials instead of
 * an API key, which surfaces as a confusing
 * "Could not load the default credentials" error that has nothing to do
 * with the actual problem (a missing/unset env var - e.g. forgetting to
 * add GEMINI_API_KEY in a hosting provider's dashboard). */
function getClient(): GoogleGenAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your environment (.env locally, or your hosting " +
        "provider's environment variables in production) and restart/redeploy.",
    );
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

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
  contents: ContentListUnion;
  schema: z.ZodType<T>;
}): Promise<T> {
  const response = await getClient().models.generateContent({
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

type RawParsedItem = { name: string; quantity: string; calories: number; protein: number; carbs: number; fat: number };

/** Shared by both text- and photo-based meal parsing: grounds each item
 * against the cited nutrition-facts cache when available, rejects
 * numerically implausible macros (same check the Assessment-2 agent uses
 * before trusting its own cache writes), and refuses to return an empty
 * result silently - callers get a clear, catchable error instead. */
function groundAndValidateItems(rawItems: RawParsedItem[], notFoodMessage: string): FoodItem[] {
  const cache = readNutritionFactsCache(process.cwd());

  const items: FoodItem[] = rawItems.flatMap((item) => {
    const cached = lookupFreshEntry(cache, item.name);
    const macros: Macros = cached
      ? { calories: cached.calories, protein: cached.proteinG, carbs: cached.carbsG, fat: cached.fatG }
      : { calories: item.calories, protein: item.protein, carbs: item.carbs, fat: item.fat };

    const validity = isValidMacros(macros);
    if (!validity.ok) return [];

    return [{ name: item.name, quantity: cached ? cached.servingSize : item.quantity, macros, grounded: !!cached }];
  });

  if (items.length === 0) {
    throw new UnrecognizableMealError(notFoodMessage);
  }

  return items;
}

const MEAL_PARSE_SYSTEM_INSTRUCTION = (dietaryPreference: DietaryPreference) =>
  "You are a nutrition estimation assistant specializing in Indian home-cooked meals as well as " +
  "common international foods. Split the meal into distinct food items. When an exact quantity " +
  "isn't given, assume a typical single serving size for that food. Estimate calories, protein, " +
  "carbohydrates, and fat as reasonably as possible using standard nutrition references - your " +
  "estimates do not need to be lab-precise, just realistic. The user's dietary preference is " +
  `'${dietaryPreference}'; flag no conflicts, just estimate what they described.`;

export async function parseMealWithAI(
  description: string,
  dietaryPreference: DietaryPreference,
): Promise<FoodItem[]> {
  const parsed = await generateStructured({
    model: PARSE_MODEL,
    schema: MealParseSchema,
    contents: description,
    systemInstruction: MEAL_PARSE_SYSTEM_INSTRUCTION(dietaryPreference),
  });

  return groundAndValidateItems(
    parsed.items,
    "Couldn't extract any plausible food items from that description. Try describing what you ate more specifically (e.g. \"2 rotis and dal\" instead of a single vague word).",
  );
}

export async function parseMealPhotoWithAI(
  imageBase64: string,
  mimeType: string,
  dietaryPreference: DietaryPreference,
): Promise<FoodItem[]> {
  const parsed = await generateStructured({
    model: PARSE_MODEL,
    schema: MealParseSchema,
    contents: [
      {
        text:
          "Identify every distinct food item visible in this photo of a meal and estimate its serving " +
          "size and macros. " +
          MEAL_PARSE_SYSTEM_INSTRUCTION(dietaryPreference),
      },
      { inlineData: { data: imageBase64, mimeType } },
    ],
    systemInstruction: MEAL_PARSE_SYSTEM_INSTRUCTION(dietaryPreference),
  });

  return groundAndValidateItems(
    parsed.items,
    "Couldn't identify any food in that photo. Try a clearer, well-lit photo taken directly above the plate.",
  );
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
