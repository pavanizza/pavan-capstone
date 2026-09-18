// Shared macro-plausibility check. Plain ESM (not .ts) so it can be
// imported both by the Next.js app (src/lib/ai.ts) and by the standalone
// CLI script (scripts/agent/nutrition-fact-agent.mjs) without a build step.

/**
 * @param {{calories: number, protein?: number, proteinG?: number, carbs?: number, carbsG?: number, fat?: number, fatG?: number}} macros
 * @returns {{ok: boolean, why?: string}}
 */
export function isValidMacros(macros) {
  if (!macros) return { ok: false, why: "no macros" };

  const calories = macros.calories;
  const protein = macros.protein ?? macros.proteinG;
  const carbs = macros.carbs ?? macros.carbsG;
  const fat = macros.fat ?? macros.fatG;

  const nums = [calories, protein, carbs, fat];
  if (nums.some((n) => typeof n !== "number" || !Number.isFinite(n) || n < 0)) {
    return { ok: false, why: "non-numeric or negative macro" };
  }
  if (calories < 1 || calories > 1500) {
    return { ok: false, why: `calories ${calories} outside plausible single-serving range (1-1500)` };
  }
  const implied = protein * 4 + carbs * 4 + fat * 9;
  const diffRatio = Math.abs(implied - calories) / calories;
  if (diffRatio > 0.4) {
    return {
      ok: false,
      why: `stated calories (${calories}) inconsistent with macros (implies ~${Math.round(implied)})`,
    };
  }
  return { ok: true };
}
