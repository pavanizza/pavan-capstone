// Reads the nutrition-facts cache built by the Assessment-2 agent
// (data/nutrition-facts.json). Plain ESM so it's importable from both the
// Next.js app and the standalone CLI script.

import fs from "fs";
import path from "path";

const CACHE_FRESHNESS_DAYS = 90;

/**
 * @param {string} projectRoot
 * @returns {Record<string, any>}
 */
export function readNutritionFactsCache(projectRoot) {
  const cachePath = path.join(projectRoot, "data", "nutrition-facts.json");
  try {
    return JSON.parse(fs.readFileSync(cachePath, "utf-8"));
  } catch {
    return {};
  }
}

/**
 * @param {Record<string, any>} cache
 * @param {string} foodName
 * @returns {any | null} the cached entry if present and fresh, else null
 */
export function lookupFreshEntry(cache, foodName) {
  const entry = cache[foodName.trim().toLowerCase()];
  if (!entry) return null;
  const ageMs = Date.now() - new Date(entry.verifiedAt).getTime();
  if (ageMs > CACHE_FRESHNESS_DAYS * 24 * 60 * 60 * 1000) return null;
  return entry;
}
