# GLM Workout Engine Guide

**Generated:** 2025-01-15

---

## Overview

The Forge workout engine is a template-based program generation system that selects and adapts curated workout templates based on user preferences, limitations, and goals.

**Key Principles:**
- Templates are curated (not AI-generated at runtime)
- Adaptations are controlled and rule-based
- Safety constraints are never relaxed
- User preferences guide selection but don't override safety

---

## Engine Components

### 1. Template Selection Engine

**Location:** `src/services/templateProgramEngine.ts`

**Entry Point:** `matchTemplatesWithRelaxation()`

**Flow:**
```
ProgramRequest
→ matchTemplates() [score all templates]
→ Filter by hard constraints [rejections]
→ Sort by score
→ If no matches and stable library: try relaxations
→ Return compatible + rejected
```

**Hard Constraints (Never Relaxed):**
- Goal mismatch
- Modality mismatch (300-lib only)
- Equipment incompatibility
- Required exercise restrictions
- Required exercise equipment unavailability
- Limitation conflicts (without valid substitution)

**Soft Preferences (May Be Relaxed):**
- Split preference
- Session duration
- Day count
- Level

---

### 2. Template Scoring

**Location:** `src/services/templateProgramEngine.ts:619-657`

**Function:** `scoreTemplate()`

**Scoring Breakdown:**
```typescript
{
  goal: 35,      // Exact goal match
  days: 25,      // Exact day count match
  level: 15,     // Exact level match
  equipment: 10, // Exact equipment profile (6 if fits)
  duration: 5,   // Duration proximity (5 if ±10min, 3 if ±20min, 1 otherwise)
  focus: 5,      // Focus muscle hits (max 5)
  split: 5       // Exact split match
}
```

**Total Score:** Sum of breakdown (0-100 range)

**Sorting:**
1. Total score (descending)
2. Adaptation cost penalty (descending)
3. Duration proximity (ascending)
4. Equipment score (descending)
5. Split match (descending)
6. Previous template (avoid if forceNewVariation)
7. Template ID (ascending)

---

### 3. Hard Filter Logic

**Location:** `src/services/templateProgramEngine.ts:576-617`

**Function:** `templateRejections()`

**Rejection Codes:**

| Code | Condition | Severity |
|------|-----------|----------|
| GOAL_MISMATCH | template.goal !== request.goal | Hard |
| MODALITY_MISMATCH | template.modality !== request.modality (300-lib) | Hard |
| DAY_COUNT_MISMATCH | template.daysPerWeek !== request.daysPerWeek | Hard |
| LEVEL_MISMATCH | template.level !== request.level | Hard |
| EQUIPMENT_MISMATCH | Equipment profile unavailable | Hard |
| DURATION_INCOMPATIBLE | Duration outside template range (±15%) | Hard |
| SPLIT_MISMATCH | Split doesn't match preference | Soft |
| REQUIRED_EXERCISE_RESTRICTED | Required exercise in user restrictions | Hard |
| LIMITATION_CONFLICT | Required exercise conflicts with limitations | Hard |
| NO_VALID_SUBSTITUTION | Required exercise needs unavailable equipment | Hard |

**Equipment Compatibility:**

```typescript
function equipmentProfileFits(template, request): boolean {
  const available = requestEquipmentSet(request);

  if (template.equipmentProfile === 'full_gym') {
    return available.has('barbell') || available.has('machine') ||
      (available.has('dumbbell') && available.has('bench'));
  }
  if (template.equipmentProfile === 'dumbbell_only') {
    return available.has('dumbbell');
  }
  if (template.equipmentProfile === 'bodyweight_home') {
    return available.has('bodyweight') &&
      (request.equipmentProfile === 'bodyweight_home' || available.has('resistance_band'));
  }
  if (template.equipmentProfile === 'resistance_band_bodyweight') {
    return available.has('bodyweight') && available.has('resistance_band');
  }
  return true; // 'custom' always passes
}
```

---

### 4. Relaxation System

**Location:** `src/services/templateProgramEngine.ts:700-804`

**Function:** `createRelaxedRequestCandidates()`

**Relaxation Candidates (Stable Library Only):**

1. **Drop Split Preference**
   - Remove preferredSplit
   - Reason: "Split tercihini otomatik kabul ettik."

2. **Adjust Duration**
   - If < 50 min → 60 min
   - If > 75 min → 75 min
   - Reason: "Süre hedefini ... template toleransına çektik."

3. **Adjust Day Count**
   - Try nearest values: [3, 4, 5, 6]
   - Prefer closest to request
   - Reason: "... gün için tam eşleşme yoktu; en yakın güvenli ... günlük planı değerlendirdik."

4. **Adjust Level**
   - advanced → intermediate
   - intermediate → beginner
   - Reason: "... seviyede tam eşleşme yoktu; ... curated template güvenli alternatif."

5. **Adjust Goal**
   - non-general_fitness → general_fitness
   - Reason: "... hedefinde tam eşleşme yoktu; güvenli general fitness template alternatif."

6. **Combined Relaxations**
   - Split + duration
   - Split + duration + day count
   - Split + duration + goal + day count + level

**Important:** 300-library does NOT use relaxations.

---

### 5. Adaptation System

**Location:** `src/services/templateProgramEngine.ts:985-1075`

**Function:** `adaptTemplate()`

**Adaptation Types:**

| Type | Description | Trigger |
|------|-------------|---------|
| exercise_substitution | Replace unavailable exercise | Equipment mismatch |
| limitation_substitution | Replace conflicting exercise | Injury/limitation |
| priority_change | Reorder for focus muscle | Physique focus |
| volume_added | Add sets for focus muscle | Physique focus |
| volume_removed | Remove sets | (rare) |
| volume_reallocated | Move sets | (rare) |
| focus_reordered | Change exercise order | Focus muscle |

**Physique Focus Adaptation:**

1. **Normalize Focus Areas**
   - Combine manual + AI-selected
   - Remove duplicates
   - Validate against template compatibility

2. **Select Focus Muscles**
   - Max 2 muscles per program
   - Priority: high > medium
   - Confidence threshold: 0.6

3. **Apply Adaptations**
   - Priority change: Reorder preferred exercises
   - Volume addition: Add sets for focus muscles
   - Volume caps: 2 sets (beginner), 4 sets (intermediate+)

**Limitation Substitutions:**

1. **Find Conflicts**
   - Check each exercise against limitations
   - Use limitation rules

2. **Find Substitutions**
   - Use reviewed substitutions list
   - Check equipment compatibility
   - Check for new conflicts

3. **Apply Replacement**
   - Swap exercise ID
   - Update equipment list
   - Record adaptation

---

### 6. Validation System

**Location:** `src/services/templateProgramEngine.ts:1077-1132`

**Function:** `validateProgram()`

**Validation Checks:**

| Check | Error Code | Condition |
|-------|------------|-----------|
| Day count | day_count_mismatch | Requested days not preserved |
| Focus cap | focus_cap_exceeded | > 2 focus muscles adapted |
| Volume cap | physique_volume_cap_exceeded | Added sets exceed cap |
| Empty day | empty_day | Workout has no exercises |
| Missing exercise | missing_exercise | Exercise ID not in catalog |
| Duplicate exercise | duplicate_exercise | Same exercise twice in one day |
| Restricted exercise | restricted_exercise | Restricted exercise remains |
| Limitation conflict | limitation_conflict | Required exercise conflicts |
| Equipment uncertainty | equipment_uncertain | Equipment may not match |
| Main lift order | main_lift_after_isolation | Main lift after isolation |
| Invalid prescription | invalid_prescription | Invalid sets/reps |
| Set cap exceeded | exercise_set_cap_exceeded | > 6 sets for one exercise |
| Duration limit | session_duration_limit | Exceeds max duration |
| Pattern redundancy | same_pattern_redundancy | > 3 of same pattern |

**Result:**
```typescript
{
  valid: boolean;
  errors: TemplateValidationIssue[];
  warnings: TemplateValidationIssue[];
}
```

**Validation Rule:** Invalid programs must NOT be persisted.

---

### 7. Program Generation Flow

**Entry Point:** `buildTemplateProgram()`

**Location:** `src/services/templateProgramEngine.ts:1316-1402`

**Flow:**
```
1. Check existing plan (fingerprint match)
   → If matches, reuse existing

2. Select template (with relaxation)
   → selectTemplateWithRelaxation()

3. Adapt template
   → adaptTemplate()

4. Generate adaptation fingerprint
   → fingerprintPhysiqueAdaptation()

5. Order exercises
   → orderProgramWorkouts()

6. Validate program
   → validateProgram()

7. Build artifacts
   → artifacts() [blueprint, volume, assembly, progression]

8. Create plan
   → AIProgramPlan object

9. Return result
   → TemplateEngineResult
```

---

### 8. Fingerprinting

**Request Fingerprint:**
```typescript
function fingerprintProgramRequest(request, seed): string {
  // Hash of:
  // - goal, modality, level
  // - daysPerWeek, preferredSessionMinutes
  // - equipmentProfile, availableEquipment
  // - focusMuscles, physiqueFocus
  // - restrictedExerciseIds, limitations
  // - preferredSplit, forceNewVariation, previousTemplateId
  // - templateVersionSeed, adaptationVersion
}
```

**Adaptation Fingerprint:**
```typescript
function fingerprintPhysiqueAdaptation(input): string {
  // Hash of:
  // - requestFingerprint
  // - templateId, templateVersion
  // - focusAreas (muscle, confidence, severity, source)
  // - equipment, limitations
  // - adaptation/substitution rule versions
}
```

**Purpose:**
- Detect if program needs regeneration
- Enable program reuse without changes
- Track adaptation state

---

## Usage Examples

### Example 1: Basic Selection

```typescript
import { createProgramRequestFromAnswers, matchTemplatesWithRelaxation } from '@/services/templateProgramEngine';

// Create request from user answers
const request = createProgramRequestFromAnswers({
  userId: 'user123',
  answers: {
    mainGoal: 'build_muscle',
    trainingDays: 4,
    experience: 'intermediate',
    location: 'gym',
    equipment: ['barbells', 'machines', 'cables', 'dumbbells'],
    priorityMuscles: ['chest', 'quads'],
    painLimitations: ['none'],
    useLatestPhysiqueAnalysis: false,
  },
});

// Match templates
const { compatible, rejected, matchMode } = matchTemplatesWithRelaxation(request);

console.log(`Found ${compatible.length} compatible templates`);
console.log(`Mode: ${matchMode}`);
```

### Example 2: With Limitations

```typescript
const request = createProgramRequestFromAnswers({
  userId: 'user456',
  answers: {
    mainGoal: 'strength',
    trainingDays: 3,
    experience: 'beginner',
    location: 'gym',
    equipment: ['barbells'],
    priorityMuscles: ['full_body_balance'],
    painLimitations: ['shoulder'], // Shoulder injury
    useLatestPhysiqueAnalysis: false,
  },
});

// Engine will:
// 1. Filter out templates with barbell overhead press
// 2. Substitute shoulder-conflicting exercises
// 3. Validate substitutions are reviewed
```

### Example 3: Build Complete Program

```typescript
import { buildTemplateProgram } from '@/services/templateProgramEngine';

const result = buildTemplateProgram({
  request: programRequest,
  existingPlan: null,
});

if (result.validation.valid) {
  console.log(`Generated program: ${result.plan.title}`);
  console.log(`Template: ${result.selectedTemplateId}`);
  console.log(`Match mode: ${result.matchMode}`);
  console.log(`Adaptations: ${result.adaptations.length}`);
} else {
  console.error('Validation failed:', result.validation.errors);
}
```

---

## Common Patterns

### Pattern 1: Handling No-Match

```typescript
const { compatible, rejected, matchMode } = matchTemplatesWithRelaxation(request);

if (compatible.length === 0) {
  // Analyze rejections
  const rejectionCounts = rejected.reduce((acc, r) => {
    r.rejectionReasons?.forEach(code => {
      acc[code] = (acc[code] || 0) + 1;
    });
    return acc;
  }, {});

  console.log('Rejection counts:', rejectionCounts);
  // Suggest fixes based on most common rejections
}
```

### Pattern 2: Getting Top-3 Matches

```typescript
const { compatible } = matchTemplatesWithRelaxation(request);

const top3 = compatible.slice(0, 3).map(match => {
  const template = PROGRAM_TEMPLATES.find(t => t.id === match.templateId);
  return {
    templateId: match.templateId,
    title: template?.name,
    score: match.totalScore,
    matchReasons: match.explanation,
  };
});
```

### Pattern 3: Understanding Adaptations

```typescript
const result = buildTemplateProgram({ request, existingPlan: null });

result.adaptations.forEach(adaptation => {
  switch (adaptation.type) {
    case 'exercise_substitution':
      console.log(`Substituted ${adaptation.exerciseId} → ${adaptation.replacementExerciseId}`);
      console.log(`Reason: ${adaptation.reason}`);
      break;
    case 'volume_added':
      console.log(`Added ${adaptation.setsChanged} sets to ${adaptation.exerciseId}`);
      console.log(`Focus: ${adaptation.focusMuscle}`);
      break;
    // ... other types
  }
});
```

---

## Debugging

### Debug Template Matching

```typescript
// Enable detailed logging
const request = createProgramRequestFromAnswers({...});

// Get all templates with scores
const allScores = PROGRAM_TEMPLATES.map(template => {
  const result = scoreTemplate(template, request);
  return {
    templateId: template.id,
    score: result.totalScore,
    rejections: result.rejectionReasons,
  };
}).sort((a, b) => b.score - a.score);

console.table(allScores);
```

### Debug Equipment Matching

```typescript
import { requestEquipmentSet, equipmentProfileFits } from '@/services/templateProgramEngine';

const request = createProgramRequestFromAnswers({...});
const available = requestEquipmentSet(request);

console.log('Available equipment:', Array.from(available));

PROGRAM_TEMPLATES.forEach(template => {
  const fits = equipmentProfileFits(template, request);
  console.log(`${template.id}: ${fits ? '✅' : '❌'}`);
});
```

### Debug Rejection Reasons

```typescript
const { rejected } = matchTemplatesWithRelaxation(request);

rejected.forEach(match => {
  console.log(`${match.templateId}:`);
  match.rejectionDetails?.forEach(detail => {
    console.log(`  - ${detail.code}: ${detail.message}`);
  });
});
```

---

## Best Practices

### 1. Always Validate

```typescript
const result = buildTemplateProgram({ request, existingPlan: null });

if (!result.validation.valid) {
  // Handle errors - never persist invalid programs
  throw new Error(`Program validation failed: ${result.validation.errors.map(e => e.code).join(', ')}`);
}
```

### 2. Check Fingerprints Before Regenerating

```typescript
const existingPlan = await loadAIProgramInstanceById(planId);
const requestFingerprint = fingerprintProgramRequest(request);

if (existingPlan?.requestFingerprint === requestFingerprint) {
  // Reuse existing - no changes needed
  return existingPlan;
}
```

### 3. Handle No-Match Gracefully

```typescript
const { compatible, rejected } = matchTemplatesWithRelaxation(request);

if (compatible.length === 0) {
  // Don't just show "No program found"
  // Explain WHY and suggest fixes
  const commonRejections = analyzeRejections(rejected);
  const suggestions = generateSuggestions(commonRejections);
  // Show helpful message with suggestions
}
```

### 4. Respect Hard Constraints

```typescript
// NEVER relax these:
- Goal mismatches
- Equipment incompatibilities
- Required exercise restrictions
- Limitation conflicts

// Only relax these:
- Split preference
- Duration preference
- Day count (if reasonable alternative exists)
- Level (if safe alternative exists)
```

---

## Testing

### Test Template Matching

```typescript
describe('lose_fat + 4 days', () => {
  it('should find compatible templates', () => {
    const request = createProgramRequestFromAnswers({
      answers: {
        mainGoal: 'lose_fat',
        trainingDays: 4,
        equipment: ['barbells', 'machines'], // Specify equipment!
        // ... other fields
      },
    });

    const { compatible } = matchTemplatesWithRelaxation(request);
    expect(compatible.length).toBeGreaterThan(0);
  });
});
```

### Test Equipment Matching

```typescript
it('should handle empty equipment gracefully', () => {
  const request = createProgramRequestFromAnswers({
    answers: {
      mainGoal: 'lose_fat',
      trainingDays: 4,
      equipment: [], // Empty!
      // ... other fields
    },
  });

  const result = buildTemplateProgram({ request });
  expect(result.validation.valid).toBe(true);
});
```

---

## Troubleshooting

**Q: Why do I get "No compatible program found"?**

A: Check:
1. Are you specifying equipment? Empty equipment causes most templates to be rejected.
2. Is your goal/modality combination valid?
3. Are your limitations too restrictive?
4. Is the day count supported for your goal/level?

**Q: Why aren't relaxations applied in 300-library mode?**

A: This is by design. The 300-library uses strict matching only. If you need relaxations, switch to stable library or adjust your request.

**Q: How do I enable relaxations for 300-library?**

A: You'd need to modify the `matchTemplatesWithRelaxation` function to remove the early return for 300-library mode. However, this is a design decision that should be carefully considered.

**Q: What's the difference between goal and modality?**

A: Goal is the training outcome (strength, hypertrophy, etc.). Modality is the training style (strength, hypertrophy, home, yoga, pilates). For example, yoga has goal=general_fitness but modality=yoga.

---

**Engine documentation complete.**
