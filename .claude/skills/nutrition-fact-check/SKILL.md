---
name: nutrition-fact-check
description: Verify or produce a cited nutrition-facts reference entry (calories/protein/carbs/fat per standard serving) for ONE food item, using a real web search, and persist it into the project's local nutrition-facts cache. Use this whenever a food name logged by a user is missing or stale in data/nutrition-facts.json.
---

# Nutrition Fact Check

Scope: exactly one repeatable task — take a single food name and turn it into a
trustworthy, cited entry in the project's nutrition reference cache
(`data/nutrition-facts.json`). This is intentionally narrow: it does not parse
whole meals, does not talk to the app's `/api` routes, and does not make
recommendations. Those are separate concerns handled elsewhere in the
capstone (`src/lib/ai.ts`).

## Why this exists

`src/lib/ai.ts` currently asks Gemini to *guess* calories/macros from its own
training knowledge every time a meal is logged, with no grounding and no
memory between requests. This skill builds a small, growing, cited reference
cache so those guesses can eventually be checked against (or replaced by)
real looked-up data for foods the app's users actually log.

## Input

A single food name, e.g. `"paneer curry"` or `"rajma chawal"`.

## Steps

1. **Check the cache first.** Read `data/nutrition-facts.json`. If an entry
   for this food (case-insensitive, trimmed) already exists and is less than
   90 days old (`verifiedAt` field), stop — nothing to do.
2. **Search.** Use the `search` MCP tool (Wikipedia) with the food name to
   find the best-matching article, then `readArticle` on that title. Look
   for a "Nutritional value per 100 g" style infobox in the article text
   (common on single-ingredient food articles like eggs, rice, chicken;
   usually absent on composite home-cooked dish articles, if an article
   exists for the dish at all).

   (An earlier version of this skill used a DuckDuckGo-scraping MCP server
   for this step. It was dropped because DuckDuckGo's anti-bot "anomaly
   detection" blocked essentially every request from this environment,
   even a single first call - it wasn't a real rate limit, since the
   server's own rate-limit counters showed zero on rejected calls.
   Wikipedia's official API doesn't have this problem.)
3. **Extract.** From the article text, produce ONE structured entry:
   - `food`: normalized food name (lowercase)
   - `servingSize`: a realistic single serving description (e.g. "1 medium
     bowl (~150g)")
   - `calories`, `proteinG`, `carbsG`, `fatG`: numbers, per that serving
   - `sourceTitle` and `sourceSnippet`: taken directly from the search result
     you used, so the number is traceable
   - `verifiedAt`: current ISO timestamp
   If the search results are too vague or contradictory to produce a
   confident estimate, do not fabricate one — skip the food and report it as
   "needs manual review" instead.
4. **Validate before writing.** Reject the entry (retry the search once with
   a reworded query, then give up and report "needs manual review") if:
   - any of the four macro numbers is missing, negative, or non-numeric
   - `calories` is outside roughly 5–1500 for a single serving
   - the implied macro calories (`4*protein + 4*carbs + 9*fat`) are off from
     the stated `calories` by more than ~40% (a sign the numbers don't
     belong together)
5. **Persist.** Read the current `data/nutrition-facts.json`, upsert the new
   entry keyed by normalized food name, and write the file back in full
   (pretty-printed JSON) via the filesystem MCP server. Never partially
   overwrite the file — always read-modify-write the whole object.

## Output

Report, for the one food processed: `written` (with the entry), `skipped`
(already cached and fresh), or `needs_review` (search didn't yield a
trustworthy answer) — plus which MCP tools were called and why.
