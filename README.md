# NutriAgent

> Log what you ate. The AI tracks it and tells you what to eat next.

An AI-powered calorie and macro tracking assistant. Instead of manually searching a food database, describe your meal in plain language ("I had 2 rotis, paneer curry and a bowl of curd") and the app estimates calories/macros, updates your daily totals, and can recommend a next meal that fills your remaining nutritional gap.

See [plan.md](plan.md) for the full project scope and [BUILD_LOG.md](BUILD_LOG.md) for a running log of work sessions.

## Stack

- **Next.js 16** (App Router, TypeScript) - single full-stack app
- **Tailwind CSS v4** for styling
- **Google Gemini API** (`@google/genai`, `gemini-flash-lite-latest`) for meal parsing and next-meal recommendations, with structured JSON outputs validated via Zod
- Deterministic BMR/TDEE/macro-target math lives in application code ([src/lib/nutrition.ts](src/lib/nutrition.ts)), not the LLM
- A local JSON file ([data/db.json](data/db.json), git-ignored) stores the profile and meal log - no accounts/database yet, that's a post-MVP goal

## Setup

Requirements: Node.js 18+, and internet access on first run (`npx` downloads
two small MCP server packages the first time you use the nutrition
fact-check feature - see below).

```bash
git clone https://github.com/pavanizza/pavan-capstone.git
cd pavan-capstone
npm install
cp .env.example .env
# edit .env and set GEMINI_API_KEY (get one at https://aistudio.google.com/apikey)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first load you'll be asked to fill in a basic nutrition profile (age, height, weight, activity level, goal, dietary preference) - this computes your daily calorie/macro targets. From there you can log meals in natural language ("2 rotis, paneer curry and a bowl of curd") and ask for a next-meal recommendation. Everything is stored locally in `data/db.json` (git-ignored) - no account, no external database.

## How it works

1. **Profile** (`/api/profile`) - deterministically computes daily calorie/macro targets (Mifflin-St Jeor BMR × activity multiplier, goal adjustment, macro split). No LLM involved.
2. **Meal logging** (`/api/meals`) - sends your description to Gemini, which returns a structured list of food items with estimated calories/protein/carbs/fat. Each item is checked against the nutrition-facts cache first (see below) and against a macro-plausibility validator before it's trusted - see **Hardening** below.
3. **Recommendation** (`/api/recommend`) - the app computes your remaining calories/macros for the day and asks Gemini to suggest one realistic next meal that fits the gap, your goal, and dietary preference.
4. **Nutrition fact-check agent** (`/api/nutrition-facts/refresh`, or `npm run agent:nutrition-fact-check`) - grounds the foods you've actually logged against cited Wikipedia data. See below.

## Nutrition fact-check agent (grounding + hardening)

Gemini guesses a meal's calories/macros from its own training knowledge, with no grounding and no memory between requests. This project builds a small, cited reference cache (`data/nutrition-facts.json`) so those guesses can be checked against real looked-up data - and uses that same checking logic to harden meal logging against bad AI output.

**The mechanism, and where it lives now:** what started (in an earlier assignment) as a standalone script now backs a real feature of the app itself. The core loop lives in [`src/lib/nutritionFactAgent.mjs`](src/lib/nutritionFactAgent.mjs) and is called from two places:
- `POST /api/nutrition-facts/refresh` - triggered by the **"Verify nutrition facts"** button on the dashboard
- `scripts/agent/nutrition-fact-agent.mjs` - a thin CLI wrapper around the same module, for manual/cron use

It runs the [`.claude/skills/nutrition-fact-check`](.claude/skills/nutrition-fact-check/SKILL.md)
Skill in a real **perceive → reason → act → observe** loop, once per distinct
food name found in today's actually-logged meals:

1. **Perceive** - reads today's meals from `data/db.json` and the existing cache, both via the `filesystem` MCP server.
2. **Reason** - decides which foods are missing or stale in the cache.
3. **Act** - searches Wikipedia via the `web-search` MCP server (`wikipedia-mcp`, official API), asks Gemini to extract a structured, cited entry per the Skill's rules, and writes it back via `filesystem`.
4. **Observe** - re-reads the file to confirm the write landed and the entry is still numerically sane before counting it as done.

Foods the model isn't confident about (no nutrition data on Wikipedia, or an incomplete/inconsistent match) are reported as `needs_review` rather than given a fabricated number.

**Why it's on-demand, not inline on every meal log:** each food lookup spawns two MCP server processes and a real web search - a few seconds per food. Blocking "log a meal" on that would make the core flow slow and dependent on Wikipedia being up. Instead, meal logging stays fast (a local cache read) and opportunistically benefits from whatever the agent has already grounded; running the agent (via the button or the CLI) is a separate, on-demand enrichment step that fills in the cache for next time.

**Grounding in the live flow:** when you log a meal, `parseMealWithAI` (in [`src/lib/ai.ts`](src/lib/ai.ts)) checks each identified food against the cache. A fresh cache hit overrides the model's fresh guess with the cited numbers, and the item shows a `✓ verified` badge in the meal history.

**Hardening:** every item's macros - whether cache-grounded or freshly guessed - are run through [`isValidMacros`](src/lib/nutritionValidation.mjs) (the same check the agent uses before trusting its own writes to the cache): calories must fall in a plausible single-serving range, and `4×protein + 4×carbs + 9×fat` must roughly match the stated calories. If every item in a description fails this check (e.g. an extreme/unrealistic quantity like "50 kilograms of rice" pushes calories far out of range, or the model returns something numerically inconsistent), `/api/meals` returns a `422` with an actionable message instead of silently logging garbage into your daily totals or crashing.

Known limitation, found by testing: this check catches numerically-implausible output, not "is this actually what the user ate." A gibberish description ("asdkfjh qwerty running marathon") once got interpreted as "Energy Gel" (100 kcal, macros that add up correctly) - internally consistent, so it passed, even though it's not a real answer. Catching that class of failure would need a different check (e.g. an explicit confidence/relevance signal from the model), which is a reasonable next iteration.

Run the agent manually (after logging at least one meal through the app so there's real data to perceive):

```bash
npm run agent:nutrition-fact-check
```

## Project structure

```
src/app/                          pages + API routes (App Router)
src/app/api/nutrition-facts/refresh/  triggers the fact-check agent from the running app
src/components/                   UI components (profile form, dashboard, meal log, recommendation, fact-check panel)
src/lib/types.ts                  shared types
src/lib/nutrition.ts              deterministic BMR/TDEE/macro math
src/lib/store.ts                  local JSON file persistence
src/lib/ai.ts                     Gemini API calls (meal parsing + recommendation), grounding + hardening
src/lib/nutritionFactAgent.mjs    the perceive→reason→act→observe agent core (shared by the API route and the CLI script)
src/lib/nutritionValidation.mjs   shared macro-plausibility check
src/lib/nutritionFactsCache.mjs   reads data/nutrition-facts.json
scripts/agent/                    CLI wrapper around src/lib/nutritionFactAgent.mjs
.claude/skills/                   custom Claude Code Skill(s)
.mcp.json                         MCP server config used by the agent
```
