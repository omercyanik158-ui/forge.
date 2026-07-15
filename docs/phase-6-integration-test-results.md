# Phase 6 Integration Test Results

| Scenario | Screen/Service | Expected | Actual | Result |
|---|---|---|---|---|
| Builder goal maps to canonical request | `createProgramRequestFromAnswers` | `build_muscle` becomes `hypertrophy` | Mapped correctly | Pass |
| Builder level maps correctly | request normalization | intermediate preserved | Preserved | Pass |
| Days map correctly | request normalization | selected day count preserved | Preserved | Pass |
| Duration maps correctly | request normalization | exact minutes preserved | Preserved | Pass |
| Equipment does not infer undeclared items | request normalization | pull-up bar not added from gym labels alone | Not inferred | Pass |
| Focus areas capped | template adaptation | max two applied focus areas | Capped | Pass |
| Selection explanation | `getProgramSelectionExplanation` | user-facing explanation without raw scores | Returned structured items | Pass |
| Program not activated before confirmation | active program store | saving another plan keeps current active | Current active preserved | Pass |
| Replacement requires explicit action | active program store | active id changes only after set action | Confirmed behavior | Pass |
| Session preview loads targets | progression preview service | preview matches day prescription | Loaded | Pass |
| Workout completion saves before progression | `program-session` flow | log persistence precedes progression call | Implemented | Pass |
| Duplicate session submit | progression service | same session reuses existing decision | Reused existing | Pass |
| Progress screen uses persisted decisions | `/workout-progress` | reads decision repository | Implemented | Pass |
| Phase 5 progression regression | tests | existing progression suite remains green | Passed | Pass |

Full automated run:

- TypeScript: pass
- Lint: pass
- Tests: pass after final run
