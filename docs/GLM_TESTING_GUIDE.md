# GLM Testing Guide

**Generated:** 2025-01-15

---

## Test Overview

**Test Framework:** Vitest 4.1.10

**Test Status (Phase 1):**
- Total: 475 tests
- Passed: 474
- Failed: 1 (repository hygiene, unrelated)

**Key Suites:**
- 300-library integration: 7/7 ✅
- Selection engine: 36/36 ✅
- Runtime template engine: 6/6 ✅
- Physique adaptation: ✅
- Limitation filtering: ✅
- Progression rules: ✅

---

## Running Tests

### Run All Tests
```bash
npm run test
```

### Run Specific Test File
```bash
npm run test -- tests/forge-workout-library-300-integration.test.ts
```

### Run Tests Matching Pattern
```bash
npm run test -- -t "lose_fat"
```

### Watch Mode (Development)
```bash
npm run test -- --watch
```

---

## Test Files

### 300-Library Tests

**File:** `tests/forge-workout-library-300-integration.test.ts`

**Coverage:**
- Template loading
- Equipment matching
- Goal/modality mapping
- Day count validation
- Level filtering
- Template count verification

**Status:** 7/7 passed ✅

**Tests:**
1. 300-library loads correctly
2. general_fitness templates exist
3. 4-day templates exist
4. Equipment profiles work
5. Goal mapping works
6. Modality filtering works
7. Template count matches manifest

---

### Selection Engine Tests

**File:** `tests/phase-3-selection-engine.test.ts`

**Coverage:**
- Template matching
- Scoring system
- Relaxation logic (stable library)
- Rejection reasons
- Sorting logic

**Status:** 36/36 passed ✅

**Key Tests:**
- Strict matching works
- Relaxation applied for stable library
- No relaxation for 300-library
- Scoring breakdown correct
- Sorting order correct
- Equipment rejection works
- Goal rejection works
- Level rejection works
- Day count rejection works

---

### Runtime Template Engine Tests

**File:** `tests/runtime-template-engine.test.ts`

**Coverage:**
- Program building
- Template selection
- Adaptation application
- Validation
- Fingerprinting

**Status:** 6/6 passed ✅

**Tests:**
1. Build program from request
2. Reuse existing program by fingerprint
3. Apply physique adaptations
4. Validate adapted program
5. Handle limitations
6. Generate valid weeks

---

### Other Test Files

| File | Status | Coverage |
|------|--------|----------|
| tests/phase-4-physique-adaptation.test.ts | ✅ | Physique focus adaptation |
| tests/phase-3-limitation-filtering.test.ts | ✅ | Injury limitation handling |
| tests/phase-5-exercise-progression-rules.test.ts | ✅ | Progression rules |
| tests/workout-exercise-ordering.test.ts | ✅ | Exercise ordering |
| tests/template-semantic-validation.test.ts | ✅ | Template validation |
| tests/program-template-library.test.ts | ✅ | Template library loading |

---

## Writing Tests

### Test Template Matching

```typescript
import { createProgramRequestFromAnswers, matchTemplatesWithRelaxation } from '@/services/templateProgramEngine';

describe('Template Matching', () => {
  it('should find templates for lose_fat + 4 days + gym equipment', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'lose_fat',
        trainingDays: 4,
        location: 'gym',
        equipment: ['barbells', 'machines', 'cables', 'dumbbells'],
        experience: 'intermediate',
        priorityMuscles: [],
        painLimitations: ['none'],
        useLatestPhysiqueAnalysis: false,
      },
    });

    const { compatible, rejected } = matchTemplatesWithRelaxation(request);

    expect(compatible.length).toBeGreaterThan(0);
    expect(rejected.length).toBeGreaterThan(0); // Some templates should be rejected
  });

  it('should reject templates with wrong day count', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'strength',
        trainingDays: 7, // Only 2-6 supported
        equipment: ['barbells'],
        experience: 'beginner',
        priorityMuscles: [],
        painLimitations: ['none'],
        useLatestPhysiqueAnalysis: false,
      },
    });

    const { compatible } = matchTemplatesWithRelaxation(request);

    expect(compatible.length).toBe(0);
  });
});
```

### Test Equipment Matching

```typescript
describe('Equipment Matching', () => {
  it('should match full_gym templates with barbell equipment', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'strength',
        trainingDays: 4,
        location: 'gym',
        equipment: ['barbells', 'machines', 'cables', 'dumbbells'],
        experience: 'intermediate',
        priorityMuscles: [],
        painLimitations: ['none'],
        useLatestPhysiqueAnalysis: false,
      },
    });

    const { compatible } = matchTemplatesWithRelaxation(request);

    const fullGymTemplates = compatible.filter(m => {
      const template = PROGRAM_TEMPLATES.find(t => t.id === m.templateId);
      return template?.equipmentProfile === 'full_gym';
    });

    expect(fullGymTemplates.length).toBeGreaterThan(0);
  });

  it('should reject full_gym templates with no equipment', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'lose_fat',
        trainingDays: 4,
        equipment: [], // Empty equipment
        experience: 'beginner',
        priorityMuscles: [],
        painLimitations: ['none'],
        useLatestPhysiqueAnalysis: false,
      },
    });

    const { compatible } = matchTemplatesWithRelaxation(request);

    // Should find very few or no templates
    // Most templates require some equipment
    expect(compatible.length).toBe(0);
  });
});
```

### Test Limitation Handling

```typescript
describe('Limitation Handling', () => {
  it('should substitute exercises for shoulder limitations', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'strength',
        trainingDays: 3,
        location: 'gym',
        equipment: ['barbells'],
        experience: 'intermediate',
        priorityMuscles: [],
        painLimitations: ['shoulder'],
        useLatestPhysiqueAnalysis: false,
      },
    });

    const result = buildTemplateProgram({ request, existingPlan: null });

    expect(result.validation.valid).toBe(true);

    // Check that shoulder-conflicting exercises were substituted
    const shoulderSubstitutions = result.adaptations.filter(
      a => a.type === 'limitation_substitution' && a.triggeringLimitation === 'shoulder'
    );

    expect(shoulderSubstitutions.length).toBeGreaterThan(0);
  });
});
```

### Test Goal Mapping

```typescript
describe('Goal Mapping', () => {
  it('should map lose_fat to general_fitness', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'lose_fat',
        trainingDays: 4,
        equipment: ['barbells'],
        experience: 'beginner',
        priorityMuscles: [],
        painLimitations: ['none'],
        useLatestPhysiqueAnalysis: false,
      },
    });

    expect(request.goal).toBe('general_fitness');
    expect(request.modality).toBe('general_fitness');
  });

  it('should map build_muscle to hypertrophy', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'build_muscle',
        trainingDays: 4,
        equipment: ['dumbbells'],
        experience: 'intermediate',
        priorityMuscles: [],
        painLimitations: ['none'],
        useLatestPhysiqueAnalysis: false,
      },
    });

    expect(request.goal).toBe('hypertrophy');
    expect(request.modality).toBe('hypertrophy');
  });
});
```

---

## Test Cases for No-Match Bug

### Case A: lose_fat + 4 days (minimal input)

```typescript
describe('No-Match Bug - Case A', () => {
  it('should handle lose_fat + 4 days with unspecified fields', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'lose_fat',
        trainingDays: 4,
        equipment: [], // Unspecified
        experience: undefined, // Unspecified
        priorityMuscles: [],
        painLimitations: [],
        useLatestPhysiqueAnalysis: false,
      },
    });

    // This currently fails with "No compatible program found"
    const { compatible, rejected } = matchTemplatesWithRelaxation(request);

    console.log('Compatible templates:', compatible.length);
    console.log('Rejected templates:', rejected.length);

    // Analyze rejection reasons
    const rejectionCounts = rejected.reduce((acc, r) => {
      r.rejectionReasons?.forEach(code => {
        acc[code] = (acc[code] || 0) + 1;
      });
      return acc;
    }, {});

    console.log('Rejection counts:', rejectionCounts);

    // Expected: Should find templates after fix
    // expect(compatible.length).toBeGreaterThan(0);
  });
});
```

### Case B: lose_fat + 4 days + gym equipment

```typescript
it('should find templates for lose_fat + 4 days + gym', () => {
  const request = createProgramRequestFromAnswers({
    answers: {
      mainGoal: 'lose_fat',
      trainingDays: 4,
      location: 'gym',
      equipment: ['barbells', 'machines', 'cables', 'dumbbells'],
      experience: 'intermediate',
      priorityMuscles: [],
      painLimitations: ['none'],
      useLatestPhysiqueAnalysis: false,
    },
  });

  const { compatible } = matchTemplatesWithRelaxation(request);

  expect(compatible.length).toBeGreaterThan(0);
});
```

### Case C: strength + 2 days + gym

```typescript
it('should find templates for strength + 2 days + gym', () => {
  const request = createProgramRequestFromAnswers({
    answers: {
      mainGoal: 'strength',
      trainingDays: 2,
      location: 'gym',
      equipment: ['barbells'],
      experience: 'beginner',
      priorityMuscles: [],
      painLimitations: ['none'],
      useLatestPhysiqueAnalysis: false,
    },
  });

  const { compatible } = matchTemplatesWithRelaxation(request);

  expect(compatible.length).toBeGreaterThan(0);
});
```

### Case D: home + bodyweight + 3 days

```typescript
it('should find templates for home + bodyweight + 3 days', () => {
  const request = createProgramRequestFromAnswers({
    answers: {
      mainGoal: 'lose_fat',
      trainingDays: 3,
      location: 'home',
      equipment: ['bodyweight_only'],
      experience: 'beginner',
      priorityMuscles: [],
      painLimitations: ['none'],
      useLatestPhysiqueAnalysis: false,
    },
  });

  const { compatible } = matchTemplatesWithRelaxation(request);

  expect(compatible.length).toBeGreaterThan(0);
});
```

### Case E: yoga + 3 days

```typescript
it('should find templates for yoga + 3 days', () => {
  const request = createProgramRequestFromAnswers({
    answers: {
      mainGoal: 'yoga',
      trainingDays: 3,
      location: 'home',
      equipment: ['bodyweight_only'],
      experience: 'beginner',
      priorityMuscles: [],
      painLimitations: ['none'],
      useLatestPhysiqueAnalysis: false,
    },
  });

  const { compatible } = matchTemplatesWithRelaxation(request);

  expect(compatible.length).toBeGreaterThan(0);

  // Check modality
  const yogaTemplates = compatible.filter(m => {
    const template = PROGRAM_TEMPLATES.find(t => t.id === m.templateId);
    return template?.modality === 'yoga';
  });

  expect(yogaTemplates.length).toBeGreaterThan(0);
});
```

### Case F: pilates + 3 days

```typescript
it('should find templates for pilates + 3 days', () => {
  const request = createProgramRequestFromAnswers({
    answers: {
      mainGoal: 'pilates',
      trainingDays: 3,
      location: 'home',
      equipment: ['bodyweight_only'],
      experience: 'beginner',
      priorityMuscles: [],
      painLimitations: ['none'],
      useLatestPhysiqueAnalysis: false,
    },
  });

  const { compatible } = matchTemplatesWithRelaxation(request);

  expect(compatible.length).toBeGreaterThan(0);

  // Check modality
  const pilatesTemplates = compatible.filter(m => {
    const template = PROGRAM_TEMPLATES.find(t => t.id === m.templateId);
    return template?.modality === 'pilates';
  });

  expect(pilatesTemplates.length).toBeGreaterThan(0);
});
```

### Case G: Shoulder limitation

```typescript
it('should exclude unsafe templates for shoulder limitation', () => {
  const request = createProgramRequestFromAnswers({
    answers: {
      mainGoal: 'strength',
      trainingDays: 4,
      location: 'gym',
      equipment: ['barbells'],
      experience: 'intermediate',
      priorityMuscles: [],
      painLimitations: ['shoulder'],
      useLatestPhysiqueAnalysis: false,
    },
  });

  const { compatible } = matchTemplatesWithRelaxation(request);

  // Should find templates with substitutions
  expect(compatible.length).toBeGreaterThan(0);

  // Build program and check adaptations
  const result = buildTemplateProgram({ request, existingPlan: null });

  const shoulderSubs = result.adaptations.filter(
    a => a.type === 'limitation_substitution' && a.triggeringLimitation === 'shoulder'
  );

  expect(shoulderSubs.length).toBeGreaterThan(0);
});
```

### Case H: Impossible request

```typescript
it('should provide actionable feedback for impossible request', () => {
  const request = createProgramRequestFromAnswers({
    answers: {
      mainGoal: 'strength',
      trainingDays: 7, // Not supported
      location: 'home',
      equipment: ['bodyweight_only'],
      experience: 'advanced',
      priorityMuscles: ['chest', 'shoulders', 'arms', 'lats', 'upper_back', 'glutes', 'quads', 'hamstrings'], // Too many
      painLimitations: ['shoulder', 'knee', 'lower_back'], // Multiple limitations
      useLatestPhysiqueAnalysis: false,
    },
  });

  const { compatible, rejected } = matchTemplatesWithRelaxation(request);

  expect(compatible.length).toBe(0);

  // Analyze rejection reasons
  const rejectionCounts = rejected.reduce((acc, r) => {
    r.rejectionReasons?.forEach(code => {
      acc[code] = (acc[code] || 0) + 1;
    });
    return acc;
  }, {});

  // Should have actionable rejection reasons
  expect(Object.keys(rejectionCounts).length).toBeGreaterThan(0);

  // TODO: Future enhancement - provide actionable suggestions
  // const suggestions = generateSuggestions(rejectionCounts);
  // expect(suggestions).toContain('Reduce training days to 2-6');
});
```

---

## Test Commands

### Before Implementing Fix
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- tests/forge-workout-library-300-integration.test.ts

# Run with coverage
npm run test -- --coverage
```

### After Implementing Fix
```bash
# Run all tests to ensure no regression
npm run test

# Run selection engine tests
npm run test -- tests/phase-3-selection-engine.test.ts

# Run 300-library tests
npm run test -- tests/forge-workout-library-300-integration.test.ts

# Run runtime tests
npm run test -- tests/runtime-template-engine.test.ts

# TypeScript check
npx tsc --noEmit

# Lint check
npm run lint
```

---

## Test Coverage

**Current Coverage Areas:**
- ✅ Template loading
- ✅ Goal/modality mapping
- ✅ Equipment matching
- ✅ Day count validation
- ✅ Level filtering
- ✅ Template scoring
- ✅ Relaxation logic (stable)
- ✅ Adaptation system
- ✅ Limitation handling
- ✅ Validation system
- ✅ Fingerprinting

**Missing Coverage (Phase 1):**
- ⚠️ Empty equipment handling (not tested)
- ⚠️ No-match scenarios (not tested)
- ⚠️ Sparse input handling (not tested)
- ⚠️ Error messaging (not tested)

---

## Debugging Tests

### Enable Debug Output

```typescript
describe('Debug', () => {
  it('should show template matching details', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'lose_fat',
        trainingDays: 4,
        equipment: [],
        experience: undefined,
        priorityMuscles: [],
        painLimitations: [],
        useLatestPhysiqueAnalysis: false,
      },
    });

    console.log('Request:', request);
    console.log('Available equipment:', request.availableEquipment);
    console.log('Equipment profile:', request.equipmentProfile);

    const { compatible, rejected } = matchTemplatesWithRelaxation(request);

    console.log('Compatible:', compatible.length);
    console.log('Rejected:', rejected.length);

    if (rejected.length > 0) {
      console.log('First 5 rejections:');
      rejected.slice(0, 5).forEach(r => {
        console.log(`  ${r.templateId}:`, r.rejectionReasons);
      });
    }
  });
});
```

### Test Specific Template

```typescript
it('should match specific template', () => {
  const templateId = 'forge_general_fitness_beginner_4d_gym_full_body_v01';

  const template = PROGRAM_TEMPLATES.find(t => t.id === templateId);
  expect(template).toBeDefined();

  const request = createProgramRequestFromAnswers({
    answers: {
      mainGoal: 'lose_fat',
      trainingDays: 4,
      location: 'gym',
      equipment: ['barbells', 'machines', 'cables', 'dumbbells'],
      experience: 'beginner',
      priorityMuscles: [],
      painLimitations: ['none'],
      useLatestPhysiqueAnalysis: false,
    },
  });

  const { compatible } = matchTemplatesWithRelaxation(request);

  const match = compatible.find(m => m.templateId === templateId);
  console.log('Match:', match);

  expect(match).toBeDefined();
});
```

---

## Test-Driven Development for Fix

### Step 1: Write Failing Test

```typescript
describe('No-Match Bug Fix', () => {
  it('should find templates for lose_fat + 4 days with unspecified equipment', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'lose_fat',
        trainingDays: 4,
        equipment: [], // Unspecified
        experience: undefined, // Unspecified
        priorityMuscles: [],
        painLimitations: [],
        useLatestPhysiqueAnalysis: false,
      },
    });

    const { compatible } = matchTemplatesWithRelaxation(request);

    // This should pass after fix
    expect(compatible.length).toBeGreaterThan(0);
  });
});
```

### Step 2: Run Test (Should Fail)

```bash
npm run test -- -t "lose_fat + 4 days with unspecified equipment"
```

### Step 3: Implement Fix

```typescript
// In templateProgramEngine.ts or equivalent
// Add equipment default logic
```

### Step 4: Run Test (Should Pass)

```bash
npm run test -- -t "lose_fat + 4 days with unspecified equipment"
```

### Step 5: Verify No Regressions

```bash
npm run test
```

---

## Manual Testing Checklist

### Builder Flow
- [ ] Select lose_fat goal
- [ ] Select 4 days
- [ ] Skip other fields
- [ ] Generate program
- [ ] Should get program (not error)

### Equipment Selection
- [ ] Select gym location
- [ ] Equipment auto-fills
- [ ] Generate program
- [ ] Should get program

### Goal Selection
- [ ] Select each goal
- [ ] Generate program
- [ ] Should get program for each

### Modality Selection (300-lib)
- [ ] Select yoga
- [ ] Select 3 days
- [ ] Generate program
- [ ] Should get yoga program

### Limitation Selection
- [ ] Select shoulder limitation
- [ ] Generate program
- [ ] Should get program with substitutions

---

**Testing guide complete.**
