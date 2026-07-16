# GLM Architecture Map

**Generated:** 2025-01-15

---

## Directory Structure

```
forgevolution-main/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout
│   ├── (tabs)/_layout.tsx       # Tab navigation
│   └── ai-program-builder.tsx   # Program builder UI
├── src/
│   ├── components/              # Reusable components
│   ├── config/                  # Configuration files
│   ├── data/                    # Data access layer
│   ├── features/                # Feature modules
│   ├── providers/               # Context providers
│   ├── screens/                 # Screen components
│   ├── services/                # Business logic
│   ├── theme/                   # Styling system
│   ├── types/                   # TypeScript type definitions
│   └── workout-programming/    # Workout engine core
│       ├── adaptation/          # Physique adaptation
│       ├── data/                # Generated CSV data
│       ├── engine/              # Program creation entry
│       ├── fingerprint/         # Request fingerprinting
│       ├── instantiation/       # Program instantiation
│       ├── limitations/         # Injury/movement limitations
│       ├── ordering/            # Exercise ordering logic
│       ├── persistence/         # Program storage
│       ├── progression/         # Progression rules
│       ├── reports/             # Validation and reporting
│       ├── selection/           # Template selection
│       ├── templates/           # Template management
│       ├── types/               # Workout programming types
│       └── validation/          # Program validation
├── data/
│   └── forge_workout_library_300/  # 300-template library
│       ├── forge_program_templates_300.csv
│       ├── forge_template_exercises_300.csv
│       ├── forge_exercise_catalog_300.csv
│       ├── forge_progression_rules_300.csv
│       ├── forge_adaptation_rules.csv
│       ├── forge_exercise_substitutions.csv
│       ├── forge_research_sources.csv
│       ├── library_summary.csv
│       ├── manifest.json
│       └── INTEGRATION_NOTES.md
├── tests/                       # Test files
└── docs/                        # Documentation

```

---

## Key File Locations

**Entry Points:**
- App entry: `app/_layout.tsx`
- Builder: `app/ai-program-builder.tsx`

**Workout Engine Core:**
- Template selection: `src/services/templateProgramEngine.ts`
- Program creation: `src/workout-programming/engine/createPersonalizedProgram.ts`
- Program instantiation: `src/workout-programming/instantiation/instantiateUserProgram.ts`
- Request normalization: `src/workout-programming/selection/normalizeProgramRequest.ts`

**Feature Flags:**
- `src/services/workoutEngineFeatureFlags.ts`

**Generated Data:**
- `src/workout-programming/generated/templates300.generated.ts`
- `src/workout-programming/generated/templates.generated.ts` (stable)
- `src/workout-programming/generated/adaptationRules300.generated.ts`
- `src/workout-programming/generated/progressionRules300.generated.ts`
- `src/workout-programming/generated/exerciseCatalog300.generated.ts`
- `src/workout-programming/generated/substitutions300.generated.ts`

**Type Definitions:**
- `src/types/aiProgram.ts` - Core AI program types
- `src/types/aiProgramDecision.ts` - Decision blueprint types
- `src/types/aiProgramPlan.ts` - Program plan types
- `src/workout-programming/types/csvWorkoutBrain.ts` - CSV data types

---

## Data Flow

```
User Input (ai-program-builder.tsx)
    ↓
AIProgramDraft (aiProgramEngine.ts)
    ↓
createProgramRequestFromAnswers (templateProgramEngine.ts)
    ↓
ProgramRequest { goal, modality, level, daysPerWeek, equipment, etc. }
    ↓
matchTemplatesWithRelaxation (templateProgramEngine.ts)
    ↓
TemplateMatchResult[] { compatible, rejected }
    ↓
selectTemplateWithRelaxation (templateProgramEngine.ts)
    ↓
buildTemplateProgram (templateProgramEngine.ts)
    ↓
adaptTemplate (templateProgramEngine.ts)
    ↓
orderProgramWorkouts (ordering/orderWorkoutExercises.ts)
    ↓
validateProgram (templateProgramEngine.ts)
    ↓
TemplateEngineResult { plan, request, match, adaptations, validation }
    ↓
AIProgramPlan (aiProgramPlan.ts)
    ↓
Storage (aiProgramInstanceStore.ts)
```

---

## Type System

**Core Types:**

```typescript
// User input type
type AIProgramAnswers = {
  mainGoal?: AIProgramGoal;           // 'lose_fat', 'build_muscle', etc.
  trainingDays?: 2 | 3 | 4 | 5 | 6;
  equipment: AIProgramEquipmentKey[];  // Array of equipment
  location?: AIProgramLocation;        // 'gym', 'home', 'both'
  experience?: AIProgramExperience;    // 'beginner', etc.
  // ... other fields
};

// Internal request type
type ProgramRequest = {
  userId: string;
  goal: TemplateGoal;                   // 'strength', 'hypertrophy', etc.
  modality?: TemplateModality;         // Modalities for 300-lib
  level: TemplateLevel;
  daysPerWeek: number;
  preferredSessionMinutes: number;
  equipmentProfile: TemplateEquipmentProfile;
  availableEquipment: string[];
  focusMuscles: string[];
  // ... other fields
};

// Template type
type ProgramTemplate = ForgeGeneratedTemplate & {
  id: string;
  name: string;
  focusMuscles: string[];
};

// Result type
type TemplateEngineResult = {
  plan: AIProgramPlan;
  request: ProgramRequest;
  effectiveRequest: ProgramRequest;
  selectedTemplateId: string;
  matchMode: 'strict_match' | 'relaxed_match' | 'no_safe_match';
  match: TemplateMatchResult;
  // ... other fields
};
```

---

## Goal Mapping

**User Goal → Template Goal:**

```typescript
function goalFromAnswers(answers: AIProgramAnswers): TemplateGoal {
  if (answers.mainGoal === 'strength') return 'strength';
  if (answers.mainGoal === 'build_muscle') return 'hypertrophy';
  if (answers.mainGoal === 'recomposition') return 'powerbuilding';
  return 'general_fitness';  // lose_fat, athletic_performance, etc. → general_fitness
}
```

**User Goal → Template Modality:**

```typescript
function modalityFromAnswers(answers: AIProgramAnswers): TemplateModality {
  if (answers.mainGoal === 'home_workout') return 'home';
  if (answers.mainGoal === 'yoga') return 'yoga';
  if (answers.mainGoal === 'pilates') return 'pilates';
  if (answers.mainGoal === 'strength') return 'strength';
  if (answers.mainGoal === 'build_muscle') return 'hypertrophy';
  if (answers.mainGoal === 'recomposition') return 'powerbuilding';
  return 'general_fitness';  // lose_fat → general_fitness
}
```

---

## Equipment Mapping

**Location + Equipment → Equipment Profile:**

```typescript
function equipmentProfileFromAnswers(answers, equipment): TemplateEquipmentProfile {
  if (answers.location === 'home') {
    if (equipment.includes('resistance_band')) return 'resistance_band_bodyweight';
    if (equipment.includes('dumbbell')) return 'dumbbell_only';
    return 'bodyweight_home';
  }
  if (equipment.includes('barbell') || equipment.includes('machine') || equipment.includes('cable')) {
    return 'full_gym';
  }
  if (equipment.includes('dumbbell')) return 'dumbbell_only';
  if (equipment.includes('resistance_band')) return 'resistance_band_bodyweight';
  if (equipment.includes('bodyweight')) return 'bodyweight_home';
  return 'custom';  // Empty equipment → 'custom'
}
```

**Equipment Profiles:**
- `full_gym` - Barbell, machines, cables, dumbbells, bench
- `dumbbell_only` - Dumbbells only
- `bodyweight_home` - Bodyweight only
- `resistance_band_bodyweight` - Bands + bodyweight
- `custom` - Other combinations (including empty!)

---

## 300-Library Special Behavior

**Key Difference: Relaxation Policy**

```typescript
export function matchTemplatesWithRelaxation(request: ProgramRequest): ... {
  const strict = matchTemplates(request);

  // 300-LIBRARY: NO RELAXATIONS
  if (WORKOUT_LIBRARY_VERSION === '300') {
    return {
      ...strict,
      effectiveRequest: request,
      matchMode: strict.compatible.length > 0 ? 'strict_match' : 'no_safe_match',
      relaxationsApplied: [],
      strictRejected: strict.rejected,
    };
  }

  // STABLE LIBRARY: WITH RELAXATIONS
  if (strict.compatible.length > 0) {
    return { ...strict, matchMode: 'strict_match', relaxationsApplied: [] };
  }

  // Try relaxed candidates...
  for (const candidate of createRelaxedRequestCandidates(request)) {
    const relaxed = matchTemplates(candidate.request);
    if (relaxed.compatible.length > 0) {
      return { /* relaxed match */ };
    }
  }

  return { compatible: [], matchMode: 'no_safe_match', ... };
}
```

**Impact:**
- 300-library uses strict-only matching
- No fallback to relaxed candidates
- Empty compatible array = no-match error

---

## Hard Filter Logic

**Template Rejection Reasons:**

```typescript
type TemplateRejectionCode =
  | 'GOAL_MISMATCH'              // template.goal !== request.goal
  | 'MODALITY_MISMATCH'          // template.modality !== request.modality (300-only)
  | 'DAY_COUNT_MISMATCH'         // template.daysPerWeek !== request.daysPerWeek
  | 'LEVEL_MISMATCH'             // template.level !== request.level
  | 'EQUIPMENT_MISMATCH'         // template.equipmentProfile unavailable
  | 'DURATION_INCOMPATIBLE'       // Session duration outside template range
  | 'SPLIT_MISMATCH'             // template.split !== request.preferredSplit
  | 'REQUIRED_EXERCISE_RESTRICTED'
  | 'LIMITATION_CONFLICT'
  | 'NO_VALID_SUBSTITUTION';
```

**Equipment Compatibility Check:**

```typescript
function equipmentProfileFits(template: ProgramTemplate, request: ProgramRequest): boolean {
  const available = requestEquipmentSet(request);

  if (template.equipmentProfile === 'resistance_band_bodyweight') {
    return available.has('bodyweight') && available.has('resistance_band');
  }
  if (template.equipmentProfile === 'bodyweight_home') {
    return available.has('bodyweight') &&
      (request.equipmentProfile === 'bodyweight_home' || available.has('resistance_band'));
  }
  if (template.equipmentProfile === 'dumbbell_only') {
    return available.has('dumbbell');
  }
  if (template.equipmentProfile === 'full_gym') {
    return available.has('barbell') || available.has('machine') ||
      (available.has('dumbbell') && available.has('bench'));
  }
  return true;  // 'custom' profile always passes
}
```

---

## Scoring System

**Template Scoring (Breakdown):**

```typescript
{
  goal: 35,      // Exact goal match
  days: 25,      // Exact day count match
  level: 15,     // Exact level match
  equipment: 10, // Equipment profile match (6 if fits but not exact)
  duration: 5,   // Duration proximity
  focus: 5,      // Focus muscle hits
  split: 5       // Exact split match
}
```

**Total Score Range:** 0-100 points

**Sorting Priority:**
1. Total score (descending)
2. Adaptation cost penalty (descending)
3. Duration proximity (ascending)
4. Equipment score (descending)
5. Split match (descending)
6. Previous template avoidance (if forceNewVariation)
7. Template ID (alphabetical)

---

## Adaptation System

**Adaptation Types:**
- `priority_change` - Reorder exercises for focus muscles
- `exercise_substitution` - Replace unavailable exercises
- `limitation_substitution` - Replace exercises conflicting with limitations
- `volume_added` - Add sets for focus muscles
- `volume_removed` - Remove sets
- `volume_reallocated` - Move sets between exercises
- `focus_reordered` - Change exercise order for focus

**Physique Focus Adaptation:**
- Controlled by `src/workout-programming/adaptation/physiqueFocusRules.ts`
- Uses adaptation rules from generated data
- Max 2 focus muscles per program
- Volume caps: 2 sets (beginner), 4 sets (intermediate+)

---

## Validation System

**Validation Checks:**
- Day count preserved
- Focus muscle cap not exceeded
- Weekly set cap not exceeded
- No empty workout days
- No duplicate exercises
- No restricted exercises
- No limitation conflicts
- Main lifts before isolations
- Valid sets/reps prescriptions
- Set caps not exceeded
- Session duration limits

**Validation Result:**
```typescript
type ProgramValidationResult = {
  valid: boolean;
  errors: TemplateValidationIssue[];
  warnings: TemplateValidationIssue[];
};
```

---

## Storage Layer

**Program Storage:**
- `src/services/aiProgramInstanceStore.ts` - Active programs
- `src/services/activeAIProgramStore.ts` - Current active program
- `src/workout-programming/persistence/programInstanceRepository.ts` - Repository layer

**Storage Keys:**
- `ai_program_instances` - All saved programs
- `active_ai_program_id` - Current active program ID

---

## State Management

**Zustand Stores (if used):**
- Not directly inspected in Phase 1
- Likely used for UI state management

**Builder State:**
- Managed via `AIProgramDraft` type
- Merged via `mergeAIProgramDraft` function
- Step progression tracked in `currentStep` field

---

## Important Constants

**Workout Library Version:**
```typescript
export const WORKOUT_LIBRARY_VERSION = getWorkoutLibraryVersionState().version;
// Returns: 'stable' or '300'
```

**Active Templates:**
```typescript
const ACTIVE_PROGRAM_TEMPLATES = WORKOUT_LIBRARY_VERSION === '300'
  ? FORGE_PROGRAM_TEMPLATES_300
  : FORGE_PROGRAM_TEMPLATES_STABLE;
```

**Template Engine Enabled:**
```typescript
export const USE_TEMPLATE_PROGRAM_ENGINE =
  getTemplateProgramEngineFeatureState().enabled;
// Returns: boolean (from EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE)
```

---

## External Dependencies

**Supabase:**
- Used for backend services
- Location: `src/server/` (not inspected in Phase 1)

**PostHog:**
- Analytics service
- Used for tracking program creation events

**Revenue Cat:**
- Premium/paywall system
- Location: `src/features/premium/`

---

## Testing Structure

**Test Files:**
- `tests/forge-workout-library-300-integration.test.ts` - 300-lib integration
- `tests/phase-3-selection-engine.test.ts` - Template selection
- `tests/runtime-template-engine.test.ts` - Runtime engine
- `tests/phase-4-physique-adaptation.test.ts` - Physique adaptation
- `tests/phase-5-exercise-progression-rules.test.ts` - Progression
- `tests/phase-3-limitation-filtering.test.ts` - Limitations
- And 35+ other test files

**Test Status (Phase 1):**
- 474/475 tests passed
- 1 failed: repository hygiene check (unrelated)

---

## Unresolved Architectural Questions

1. **Equipment Default Policy:**
   - What should happen when equipment array is empty?
   - Current: 'custom' profile + empty equipment set
   - Should default to a sensible equipment set?

2. **300-Library Relaxation:**
   - Should 300-library allow ANY relaxation?
   - Current: strict-only
   - Could cause no-match for sparse inputs

3. **Goal Mapping:**
   - 'lose_fat' → 'general_fitness' (both goal and modality)
   - Is this intentional or a simplification?

4. **Level Defaulting:**
   - When experience is undefined, defaults to 'beginner'
   - Should this be treated as a hard filter or soft preference?

5. **Top-3 Recommendations:**
   - Feature is mentioned in requirements but not implemented
   - Should return ranked alternatives instead of single best match

---

**Architecture documentation complete.**
