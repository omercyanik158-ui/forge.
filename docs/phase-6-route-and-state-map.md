# Phase 6 Route And State Map

## Routes

| Route | Responsibility | Engine Entry Point |
|---|---|---|
| `/(tabs)/fitness` | Active program home, start next workout | `loadActiveAIProgram` |
| `/ai-program-builder` | Canonical preference collection and program review | `buildOrReuseRecommendedAIProgram` |
| `/ai-program-detail` | Saved program overview | AI program instance store |
| `/program-session` | Workout execution, logging, progression preview/completion | `getExerciseProgressionPreview`, `processAIProgramWorkoutProgression` |
| `/workout-progress` | Workout insights and persisted target decisions | `loadProgressionDecisions` |
| `/body-progress` | Body/strength progress hub | body progress service |

## State Owners

| State | Owner | Storage Key |
|---|---|---|
| Builder draft | `/ai-program-builder` local draft | local component state |
| Saved AI programs | `aiProgramInstanceStore` | `@forge/ai-program-instances` |
| Active AI program | `activeAIProgramStore` | `@forge/active-ai-program` |
| Workout logs | `workoutStore` | `@forge/workouts` |
| Program progress | `programProgressStore` | `@forge/program-progress` |
| Progression decisions | `progressionDecisionRepository` | `@forge/progression-decisions` |
| Coach adjustments | `coachAdjustmentStore` | `@forge/coach-adjustments` |

## Deprecated Paths

- Old local AI program orchestration is no longer reachable from `/ai-program-builder`.
- Template program engine is the required production path.

## Engine Entry Points

- Selection: `createPersonalizedProgram`
- Request normalization: `normalizeProgramRequest`
- Physique adaptation: `adaptProgramForPhysique`
- Program instantiation: `instantiateUserProgram`
- Progression preview: `getExerciseProgressionPreview`
- Progression completion: `processAIProgramWorkoutProgression`
