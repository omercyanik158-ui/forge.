# Phase 6 UI/UX Integration Audit

## Existing User Flow

- AI Hub and Fitness both route users into `/ai-program-builder`.
- The builder collected preferences, but old local generation imports were still present.
- Fitness treated the newest saved AI program as active, which could make a newly saved program appear active without explicit confirmation.
- Workout sessions saved logs first, then ran progression, but the UI did not show next-session targets before training.
- Workout Progress showed strength/log analytics, but not persisted progression decisions.

## New Canonical Flow

1. User enters preferences in `/ai-program-builder`.
2. Answers are normalized into `ProgramRequest`.
3. Template engine selects a compatible reviewed program.
4. Optional focus/physique adaptations are applied.
5. Review card explains the selected program, alternatives and adaptations.
6. User saves the program.
7. User explicitly chooses whether to activate it or keep current active program.
8. Fitness reads the explicit active program.
9. Session screen shows progression preview targets.
10. Workout log is saved before progression runs.
11. Persisted progression decisions appear in completion summary and progress history.

## Screen Map

- `/(tabs)/fitness`: active program home surface.
- `/ai-program-builder`: single canonical program creation and review flow.
- `/ai-program-detail`: saved program details.
- `/program-session`: workout execution and progression preview/completion.
- `/workout-progress`: training insights and persisted progression decisions.
- `/body-progress`: body/strength progress hub.

## State Owners

- Builder form state: `/ai-program-builder` draft model.
- Program instances: `@forge/ai-program-instances`.
- Explicit active program: `@forge/active-ai-program`.
- Workout logs: `@forge/workouts`.
- Program day completion: `@forge/program-progress`.
- Progression decisions/states: `@forge/progression-decisions`.

## Fixes Applied

- Removed reachable old local generator path from the builder.
- Added explicit active AI program persistence.
- Added activation confirmation after saving.
- Added “save only” behavior that does not silently replace active program.
- Fitness tab now prioritizes explicit active program instead of newest saved program.
- Session screen consumes progression previews.
- Completion summary includes persisted progression changes.
- Workout Progress reads persisted progression decisions instead of recalculating history.
- Added structured selection explanation service.
- Added integration tests for request mapping, focus cap, active safety and progression idempotency.

## Bugs Found

- Newest saved AI plan could silently become the active plan.
- Duplicate progression processing could create a new fingerprint after state changed.
- Ready screen exposed raw alternative score.
- Obsolete generator imports kept the old local-programming path reachable.

## Remaining Limitations

- No full visual redesign was done.
- No-match UI currently uses a clear alert; a richer action sheet can be added in a later UI pass.
- Per-set RIR/RPE inputs are still not exposed in the session UI.
- Time/distance progression contracts exist, but current set logging is reps/load-first.
