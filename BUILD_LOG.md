# Build Log

| Date | Time Spent | Rough Tokens Used | What Shipped |
| :--- | :--- | :--- | :--- |
| 2026-09-17 | 1 hour | ~10,000 tokens | Initialized repo, added plan.md and BUILD_LOG.md, opened initial PR. |
| 2026-09-17 | 2 hours | ~70,000 tokens (est.) | Built MVP: Next.js 16 + Tailwind v4 app scaffold, deterministic BMR/TDEE/macro-target calculator, JSON-file profile+meal store, Gemini-powered meal parser and next-meal recommendation agent (structured outputs via Zod), profile/dashboard/meal-log/recommendation UI. Verified with `npm run build` and manual API smoke tests. |
| 2026-09-17 | ~2.5 hours | ~120,000 tokens (est.) | Agentic-AI exercise: added a scoped custom Skill (`.claude/skills/nutrition-fact-check`), an agent (`scripts/agent/nutrition-fact-agent.mjs`) that runs it in a real perceive→reason→act→observe loop over 2 MCP servers (filesystem + Wikipedia web-search), chained end-to-end against real logged-meal data. Also fixed dietary-preference options to lead with "non-vegetarian" (the primary category for this app's food domain) instead of a vague "none". Shipped as 3 separate PRs (non-veg fix, Skill+MCP config, agent+docs), each merged individually. |