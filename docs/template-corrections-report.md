# FORGE Template Corrections Report

Date: 2026-07-15

This report documents only proven programming defects found during the semantic audit. The corrections were made in the CSV source files, then regenerated into production TypeScript data.

## Corrected Templates

### `forge_strength_fullbody_beginner_3d_v1`

Issue: Day 3 had squat, bench variation, row, and unilateral quad work, but no posterior-chain, hinge, or knee-flexion exposure. This violated the full-body invariant.

Fix:
- Replaced triceps isolation with `Leg Curl`.
- Incremented template version from `1` to `2`.

Final structure:
- Day 1 #1: Back Squat (`squat`, `main_lift`) `3x5-5`
- Day 1 #2: Barbell Bench Press (`horizontal_push`, `main_lift`) `3x5-5`
- Day 1 #3: Lat Pulldown (`vertical_pull`, `secondary_compound`) `3x8-10`
- Day 1 #4: Romanian Deadlift (`hinge`, `secondary_compound`) `2x8-10`
- Day 1 #5: Dumbbell Lateral Raise (`shoulder_abduction`, `isolation`) `2x12-18`
- Day 1 #6: Dead Bug (`anti_extension`, `core`) `3x8-12`
- Day 2 #1: Conventional Deadlift (`hinge`, `main_lift`) `2x3-5`
- Day 2 #2: Barbell Overhead Press (`vertical_push`, `main_lift`) `3x5-6`
- Day 2 #3: Goblet Squat (`squat`, `secondary_compound`) `3x8-10`
- Day 2 #4: Seated Cable Row (`horizontal_pull`, `secondary_compound`) `3x8-12`
- Day 2 #5: Leg Curl (`knee_flexion`, `isolation`) `2x10-15`
- Day 2 #6: Plank (`anti_extension`, `core`) `3x30-45`
- Day 3 #1: Back Squat (`squat`, `main_lift`) `3x5-5`
- Day 3 #2: Paused Bench Press (`horizontal_push`, `main_lift`) `3x4-6`
- Day 3 #3: Chest-Supported Row (`horizontal_pull`, `secondary_compound`) `3x8-12`
- Day 3 #4: Bulgarian Split Squat (`lunge`, `accessory_compound`) `2x8-10`
- Day 3 #5: Leg Curl (`knee_flexion`, `isolation`) `2x10-15`
- Day 3 #6: Hammer Curl (`elbow_flexion`, `isolation`) `2x10-15`

Regression test:
- `template-semantic-validation.test.ts` now fails if a full-body day lacks posterior-chain exposure.

### `forge_general_fitness_dumbbell_beginner_3d_v1`

Issue: Day 3 had no upper-body pull and the order began with a lower-body accessory before the main upper/lower work. This violated full-body balance and ordering clarity.

Fix:
- Reordered Day 3 into press, hinge, lunge, row, triceps, carry.
- Replaced arm isolation with `One-Arm Dumbbell Row`.
- Incremented template version from `1` to `2`.

Final structure:
- Day 1 #1: Goblet Squat (`squat`, `secondary_compound`) `3x8-12`
- Day 1 #2: Dumbbell Bench Press (`horizontal_push`, `secondary_compound`) `3x8-12`
- Day 1 #3: One-Arm Dumbbell Row (`horizontal_pull`, `secondary_compound`) `3x8-12`
- Day 1 #4: Dumbbell Romanian Deadlift (`hinge`, `secondary_compound`) `3x8-12`
- Day 1 #5: Dumbbell Lateral Raise (`shoulder_abduction`, `isolation`) `2x12-18`
- Day 2 #1: Bulgarian Split Squat (`lunge`, `accessory_compound`) `3x8-12`
- Day 2 #2: Dumbbell Shoulder Press (`vertical_push`, `secondary_compound`) `3x8-12`
- Day 2 #3: One-Arm Dumbbell Row (`horizontal_pull`, `secondary_compound`) `3x10-15`
- Day 2 #4: Single-Leg Glute Bridge (`hinge`, `accessory_compound`) `3x10-15`
- Day 2 #5: Dead Bug (`anti_extension`, `core`) `3x8-12`
- Day 3 #1: Incline Dumbbell Press (`incline_push`, `secondary_compound`) `3x8-12`
- Day 3 #2: Dumbbell Romanian Deadlift (`hinge`, `secondary_compound`) `3x10-15`
- Day 3 #3: Reverse Lunge (`lunge`, `accessory_compound`) `3x8-12`
- Day 3 #4: One-Arm Dumbbell Row (`horizontal_pull`, `accessory_compound`) `3x8-12`
- Day 3 #5: Overhead Triceps Extension (`elbow_extension`, `isolation`) `2x10-15`
- Day 3 #6: Farmer Carry (`loaded_carry`, `conditioning`) `3x30-45`

Regression test:
- `template-semantic-validation.test.ts` now fails if a full-body day has zero pulling work.

### `forge_home_bodyweight_beginner_3d_v1`

Issue: The weekly program had no pull pattern. The description acknowledged a pulling limitation, but the generated user-facing program could still look balanced.

Fix:
- Added `Resistance-Band Row` to all three home days.
- Restored posterior-chain exposure on Day 3 with `Single-Leg Glute Bridge`.
- Changed equipment profile to `bodyweight_home` and description to clearly state that a resistance band is recommended for pulling.
- Incremented template version from `1` to `2`.

Final structure:
- Day 1 #1: Bodyweight Squat (`squat`, `secondary_compound`) `4x12-20`
- Day 1 #2: Push-Up (`horizontal_push`, `accessory_compound`) `4x6-15`
- Day 1 #3: Resistance-Band Row (`horizontal_pull`, `accessory_compound`) `3x10-15`
- Day 1 #4: Single-Leg Glute Bridge (`hinge`, `accessory_compound`) `3x10-20`
- Day 1 #5: Plank (`anti_extension`, `core`) `3x30-60`
- Day 2 #1: Reverse Lunge (`lunge`, `accessory_compound`) `4x8-15`
- Day 2 #2: Pike Push-Up (`vertical_push`, `accessory_compound`) `3x6-12`
- Day 2 #3: Single-Leg Glute Bridge (`hinge`, `accessory_compound`) `4x10-20`
- Day 2 #4: Dead Bug (`anti_extension`, `core`) `3x8-15`
- Day 2 #5: Resistance-Band Row (`horizontal_pull`, `accessory_compound`) `3x10-15`
- Day 3 #1: Bodyweight Squat (`squat`, `secondary_compound`) `4x15-25`
- Day 3 #2: Push-Up (`horizontal_push`, `accessory_compound`) `4x6-15`
- Day 3 #3: Resistance-Band Row (`horizontal_pull`, `accessory_compound`) `3x10-15`
- Day 3 #4: Single-Leg Glute Bridge (`hinge`, `accessory_compound`) `3x10-20`
- Day 3 #5: Plank (`anti_extension`, `core`) `3x30-60`

Regression test:
- General fitness weekly coverage now fails if push, pull, knee-dominant, posterior-chain, or core work disappears.

## Files Updated By Corrections

- `data/forge_workout_csv_pack/forge_template_exercises.csv`
- `data/forge_workout_csv_pack/forge_program_templates.csv`
- Generated files under `src/workout-programming/generated/`

## Validation Result

- Active templates audited: 26
- Corrected templates: 3
- Mapping gaps after regeneration: 0
- Semantic template errors after fixes: 0
