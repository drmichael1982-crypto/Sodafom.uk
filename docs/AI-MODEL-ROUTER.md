# Sodafom AI model router

This branch introduces a server-side, cost-aware model-selection policy.

## Default routing

- Routine / low-risk / repetitive work: `gpt-5.6-luna`, low reasoning.
- Normal coding or medium-risk work: `gpt-5.6-terra`, medium reasoning.
- Complex coding and final integration review: `gpt-5.6-sol`, high reasoning.
- Architecture, security review, high-risk work, or repeated failures: `gpt-6-astra`, high reasoning.

## Escalation

A failed job can move Luna -> Terra -> Sol -> Astra. Two failed attempts route directly to Astra. This prevents expensive models being the default while still allowing difficult jobs to reach the strongest model.

## Safety and deployment rules

- Model selection and API calls must stay server-side.
- `OPENAI_API_KEY` must come from the Railway/server environment and must never be committed to GitHub or exposed to browser/mobile code.
- Log model ID, job category, outcome, token usage/cost metadata when available, and escalation reason. Do not log secrets or unnecessary child data.
- Production merge/deploy remains a separate approval step.
- Child-facing AI must keep the project's separate Local-first/OpenAI-fallback policy; this router is primarily for development/agent work unless explicitly integrated into a child-safe server route.

## Integration

Import `routeAiJob` from `src/server/ai/model-router.ts`, classify the server-side job, then pass the returned `model` and `reasoning` to the OpenAI Responses API call. Use `nextEscalation` after a failed/insufficient result when retry policy permits.
