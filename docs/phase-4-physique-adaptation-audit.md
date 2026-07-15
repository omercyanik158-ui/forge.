# FORGE Phase 4 Physique Adaptation Audit

Date: 2026-07-15

## Current Architecture

The selected CSV template remains the structural source of truth. Physique analysis now applies only small deterministic changes after Phase 3 selection, equipment filtering and limitation filtering.

Runtime order:

1. Select compatible template with Phase 3 engine.
2. Apply limitation-aware substitutions.
3. Apply equipment substitutions.
4. Normalize and select physique focus areas.
5. Apply focus priority records.
6. Apply conservative set-volume additions when allowed.
7. Run focus-aware workout ordering.
8. Validate final program.
9. Return structured adaptations, adaptation fingerprint and user-facing rationale.

## Input Normalization

Canonical supported focus muscles:

- `upper_chest`
- `chest`
- `lats`
- `upper_back`
- `rear_delts`
- `side_delts`
- `front_delts`
- `biceps`
- `triceps`
- `quads`
- `hamstrings`
- `glutes`
- `calves`
- `abs`

Localized mappings include:

- `üst göğüs` -> `upper_chest`
- `kanat` -> `lats`
- `arka omuz` -> `rear_delts`
- `yan omuz` -> `side_delts`
- `ön bacak` -> `quads`
- `arka bacak` -> `hamstrings`

Manual focus selections are represented separately from AI physique findings and are treated as confidence `1.0`.

## Confidence Behavior

- `< 0.60`: ignored for adaptation.
- `0.60-0.74`: priority/order only.
- `0.75-0.89`: priority/order and conservative volume allowed.
- `>= 0.90`: same adaptation types, still capped.
- Manual focus: accepted at full confidence but still capped and safety-checked.

The engine selects at most two focus muscles by manual source first, confidence, severity and canonical order.

## Goal-Specific Behavior

- Hypertrophy: priority and small capped set additions are allowed.
- General fitness: priority and minimal additions only; movement balance is preserved.
- Strength: required main lifts remain untouched; focus changes affect accessories only and volume is capped.
- Powerbuilding: heavy block is preserved; accessory portion may be adapted.

## Volume Limits

- Beginner: max weekly physique set increase `2`.
- Intermediate/advanced: max weekly physique set increase `4`.
- One exercise receives at most `+1` set per adaptation pass.
- Final validation fails if per-exercise set cap or session duration cap is exceeded.

## Safety And Validation

Final validation checks:

- Same day count.
- Same selected template goal/split metadata.
- Required lifts remain unless Phase 3 limitation/equipment substitution required replacement.
- No restricted exercise is reintroduced.
- No limitation-conflicting required exercise remains.
- No duplicate exercise in a workout.
- Session duration remains inside template max.
- Weekly physique set delta stays within cap.
- Semantic validation still passes after ordering.

## Persistence And Reuse

Each adapted result now has a versioned fingerprint:

`forge-physique-adaptation:v1:<hash>`

The fingerprint includes request fingerprint, template ID/version, normalized focus areas, equipment, limitations, adaptation rules version, substitution rules version and ordering rules version.

Existing active programs are not silently mutated. `createPhysiqueAdaptationProposal` returns a confirmation-required proposal with proposed changes and affected days.

## UI Copy Audit

Current result copy already leans toward coaching language: focus areas, priorities and program effect. Phase 4 did not add medical claims. Future UI should continue using “suggested focus area” and “program adjustment suggestion” rather than deficiency or guaranteed-result language.

## Bugs Found And Fixed

- Physique focus used free-text muscle strings directly.
- Low-confidence AI focus could influence `focusMuscles` indirectly.
- Manual and AI focus were merged too early.
- Adaptation had no versioned fingerprint.
- Focus-aware order changes were not reflected in semantic validation.
- Volume cap validation was missing.
- Existing active program confirmation proposal did not exist.

## Remaining Limitations

- Physique substitutions are conservative and primarily implemented as priority/order plus capped set additions.
- No new base template or progression behavior was added.
- Full active-program UI confirmation screen is not redesigned in this phase; structured proposal data is available.

## Completion

PHASE 4 is complete. PHASE 5 was not started.
