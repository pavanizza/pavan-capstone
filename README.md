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

```bash
npm install
cp .env.example .env.local
# edit .env.local and set GEMINI_API_KEY (get one at https://aistudio.google.com/apikey)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first load you'll be asked to fill in a basic nutrition profile (age, height, weight, activity level, goal, dietary preference) - this computes your daily calorie/macro targets. From there you can log meals in natural language and ask for a next-meal recommendation.

## How it works

1. **Profile** (`/api/profile`) - deterministically computes daily calorie/macro targets (Mifflin-St Jeor BMR × activity multiplier, goal adjustment, macro split).
2. **Meal logging** (`/api/meals`) - sends your description to Gemini, which returns a structured list of food items with estimated calories/protein/carbs/fat; the app sums these into your daily totals.
3. **Recommendation** (`/api/recommend`) - the app computes your remaining calories/macros for the day and asks Gemini to suggest one realistic next meal that fits the gap, your goal, and dietary preference.

## Project structure

```
src/app/                 pages + API routes (App Router)
src/components/          UI components (profile form, dashboard, meal log, recommendation)
src/lib/types.ts          shared types
src/lib/nutrition.ts      deterministic BMR/TDEE/macro math
src/lib/store.ts          local JSON file persistence
src/lib/ai.ts             Gemini API calls (meal parsing + recommendation)
scripts/agent/            nutrition-fact-check agent (see below)
.claude/skills/           custom Claude Code Skill(s)
.mcp.json                 MCP server config used by the agent
```

## Nutrition fact-check agent

`src/lib/ai.ts` asks Gemini to *guess* a meal's calories/macros from its own
training knowledge every time, with no grounding and no memory between
requests. `scripts/agent/nutrition-fact-agent.mjs` is a separate agent that
builds a small, cited reference cache (`data/nutrition-facts.json`) so those
guesses can eventually be checked against real looked-up data.

It runs the [`.claude/skills/nutrition-fact-check`](.claude/skills/nutrition-fact-check/SKILL.md)
Skill in a real **perceive → reason → act → observe** loop, once per distinct
food name found in today's actually-logged meals:

1. **Perceive** - reads today's meals from `data/db.json` and the existing
   cache, both via the `filesystem` MCP server.
2. **Reason** - decides which foods are missing or stale in the cache.
3. **Act** - searches Wikipedia via the `web-search` MCP server
   (`wikipedia-mcp`, official API), asks Gemini to extract a structured,
   cited entry per the Skill's rules, and writes it back via `filesystem`.
4. **Observe** - re-reads the file to confirm the write landed and the
   entry is still numerically sane before counting it as done.

Foods the model isn't confident about (no nutrition data on Wikipedia, or an
incomplete/inconsistent match) are reported as `needs_review` rather than
given a fabricated number.

Run it (after logging at least one meal through the app so there's real data
to perceive):

```bash
npm run agent:nutrition-fact-check
```
