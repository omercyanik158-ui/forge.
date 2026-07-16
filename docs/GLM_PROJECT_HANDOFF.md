# GLM Project Handoff Document

**Generated:** 2025-01-15
**Project:** Forge Fitness App
**Status:** Phase 1 Complete - Repository Onboarding

---

## Repository Summary

Forge is a React Native Expo TypeScript fitness application built with:
- **Expo:** 57.0.0
- **React Native:** 0.86.0
- **React:** 19.2.3
- **TypeScript:** 6.0.3
- **Test Framework:** Vitest 4.1.10
- **Lint:** ESLint with Expo config

---

## Current Validation Status

**Passed:**
- `npx tsc --noEmit` ✅
- `npm run lint` ✅
- 300-template integration tests: 7/7 ✅
- Selection engine tests: 36/36 ✅
- Runtime template engine tests: 6/6 ✅
- Overall: 474/475 tests passed (1 unrelated hygiene check failed)

**Not Completed:**
- Manual iOS and Android QA (pending)
- Production deployment readiness assessment

---

## Package Information

**Key Dependencies:**
- Expo Router for navigation
- Zustand for state management
- Supabase for backend
- AsyncStorage for local persistence
- Revenue Cat (purchases) for premium/paywall

**Scripts:**
- `npm run test` - Run Vitest tests
- `npm run typecheck` - TypeScript check
- `npm run lint` - ESLint check
- `npm start` - Start Expo dev server

---

## Environment Variables

**Current `.env` Configuration:**
```
EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION=300
EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE=true
EXPO_PUBLIC_PROGRESSION_WRITES=true
EXPO_PUBLIC_PHYSIQUE_ADAPTATION_WRITES=true
```

**Feature Flag Implementation:**
- All environment variables accessed via static `process.env.EXPO_PUBLIC_*` format ✅
- Feature flags properly centralized in `src/services/workoutEngineFeatureFlags.ts` ✅

---

## Known Issues

1. **No-Match Bug (Primary Focus):**
   - User selects: goal=fat_loss, days=4, leaves other fields unspecified
   - Result: "No compatible program found"
   - Root cause identified in Phase 2 diagnosis

2. **Test Hygiene:**
   - 1/475 tests failing in repository hygiene check (unrelated to core functionality)

---

## Files Inspected (Phase 1)

**Core Engine:**
- `src/services/templateProgramEngine.ts` - Main template selection and program building
- `src/services/workoutEngineFeatureFlags.ts` - Feature flag management
- `src/services/programRecommendationEngine.ts` - Recommendation wrapper
- `src/workout-programming/engine/createPersonalizedProgram.ts` - Entry point

**Builder Flow:**
- `app/ai-program-builder.tsx` - Program builder UI
- `src/services/aiProgramEngine.ts` - Builder state management
- `src/workout-programming/selection/normalizeProgramRequest.ts` - Request normalization

**Types:**
- `src/types/aiProgram.ts` - Core type definitions

**Tests:**
- `tests/forge-workout-library-300-integration.test.ts`
- `tests/phase-3-selection-engine.test.ts`
- `tests/runtime-template-engine.test.ts`

---

## 300-Template Library Information

**Location:** `data/forge_workout_library_300/`

**Metrics:**
- 300 templates
- 6,565 exercise rows
- 127 exercises
- 7 progression rules
- 52 adaptation rules
- 27 substitutions

**Modalities:**
- strength: 45 templates
- hypertrophy: 90 templates
- powerbuilding: 40 templates
- general_fitness: 45 templates
- home: 30 templates
- yoga: 25 templates
- pilates: 25 templates

**Important Caveat:**
The 300-template package was deterministically generated from archetypes. It should NOT be treated as 300 individually hand-authored expert programs.

---

## Safety and Architectural Constraints

**Hard Constraints (Must NOT weaken):**
- injuries / movement limitations
- unsafe movement restrictions
- explicit equipment restrictions
- modality mismatches
- home vs gym environment
- weekly day count (when explicitly selected)
- medically or mechanically unsafe combinations

**Soft Preferences (May be relaxed):**
- level
- session duration
- split
- focus muscles
- training style
- intensity
- exact weekly volume

**Stable Fallback:**
- The 26-template stable library must remain as a safe fallback
- Do NOT remove the stable library option

---

## Architecture Notes

**Runtime Flow:**
```
builder state
→ normalized program request
→ active library selection (stable vs 300)
→ hard filtering
→ scoring/ranking
→ selected template
→ program generation
→ activation
→ storage
```

**Library Selection:**
- Controlled by `EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION` environment variable
- Static access: `process.env.EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION`
- Defaults to 'stable' if not set or invalid value
- Active templates loaded via `PROGRAM_TEMPLATES` constant

**300-Library Behavior:**
- When WORKOUT_LIBRARY_VERSION === '300', relaxations are NOT applied
- This is by design - the 300-library should use strict matching
- However, this may be causing the no-match issue for sparse inputs

---

## Uncertainties (Unresolved)

1. **Equipment Default Behavior:**
   - What should happen when user doesn't specify any equipment?
   - Current behavior: empty equipment array → 'custom' profile → most templates rejected

2. **Goal Mapping:**
   - 'lose_fat' maps to 'general_fitness' for both goal and modality
   - Is this the intended behavior?

3. **Relaxation Policy:**
   - Should 300-library allow ANY relaxation?
   - Or should it be strict-only as currently implemented?

---

## Next Steps (Phase 2)

1. Diagnose exact behavior for lose_fat + 4 days + unspecified fields
2. Verify template rejection counts by reason
3. Identify root cause (equipment defaults, relaxation policy, or other)
4. Propose smallest safe fix
5. Implement top-3 recommendation system

---

## Manual QA Checklist (Not Completed)

- [ ] iOS app testing
- [ ] Android app testing
- [ ] Equipment selection flow
- [ ] Goal selection flow
- [ ] Day count selection flow
- [ ] Limitation handling
- [ ] Exercise substitutions
- [ ] Program activation
- [ ] Progression writes
- [ ] Physique adaptation writes

---

## Documentation Created

1. `docs/GLM_PROJECT_HANDOFF.md` - This file
2. `docs/GLM_ARCHITECTURE_MAP.md` - Detailed architecture mapping
3. `docs/GLM_CURRENT_STATUS.md` - Current implementation status
4. `docs/GLM_WORKOUT_ENGINE_GUIDE.md` - Workout engine guide
5. `docs/GLM_TESTING_GUIDE.md` - Testing guide

---

**Phase 1 Complete. Ready for Phase 2: Bug Diagnosis.**
