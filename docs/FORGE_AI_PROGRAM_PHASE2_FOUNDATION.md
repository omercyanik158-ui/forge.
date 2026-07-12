# FORGE AI Program Experience — Phase 2 Foundation

## Scope

Phase 2 does not generate a workout plan.

It builds the native setup flow, profiling model, validation layer, draft recovery behavior, and the internal decision context that later program-generation modules will consume.

## Native Entry Paths

Two supported entry paths:

- Direct from AI Hub via the `AI Training Program` capability card.
- From a completed physique-analysis result via `Build from this analysis`.

Physique analysis is treated only as a soft personalization signal.

It must never:

- act as diagnosis
- override explicit pain reports
- override explicit preferences
- claim exact body-fat precision

## UX Flow

The user experience is intentionally guided, not conversational.

Implemented flow:

1. Intro
2. Goal
3. Training days
4. Session duration
5. Location
6. Equipment
7. Experience
8. Priority muscles
9. Pain / limitation context
10. Exercise preferences
11. Recovery context
12. Summary
13. Processing
14. Ready state

## Data Model

Primary model:

- `AIProgramDraft`

Contains:

- entry path
- step progress
- selected answers
- validation codes
- caution codes
- optional physique summary
- generation status
- final decision context

Secondary model:

- `AIProgramDecisionContext`

Contains:

- `userProfile`
- `scientific`
- `ux`

This is the future handoff object for the real program engine.

## Scientific Context Strategy

Phase 2 does not retrieve or cite studies.

Instead it prepares the structure future modules must use:

- evidence categories
- uncertainty notes
- programming constraints
- risk factors
- expected adaptation focus

This keeps Phase 2 aligned with the immutable constitution without pretending to run evidence retrieval yet.

## Validation Layer

Current validation rules:

- max 3 priority muscles
- training days required
- session duration required
- location required
- equipment required
- pain / limitation status required
- beginner + 6 days triggers caution
- poor recovery + high frequency triggers caution
- any pain report triggers conservative flag

## Draft / Resume

Draft behavior:

- answers save locally
- unfinished setup can resume
- restart is supported
- physique handoff seed is stored separately, then merged into a new draft

Storage keys:

- `@forge/ai-program-draft`
- `@forge/ai-program-physique-seed`

## Processing Screen

The processing screen is intentionally native and step-based.

It does not expose chat.

Its job in Phase 2 is to:

- reinforce user trust
- show evidence-based workflow language
- end in a ready context, not a final program

## Phase 3 Dependency

Before real workout generation is added, the next module must consume:

- `docs/FORGE_AI_CONSTITUTION.md`
- `AIProgramDecisionContext`
- current validation and caution flags

Future generation is not allowed to bypass these layers.
