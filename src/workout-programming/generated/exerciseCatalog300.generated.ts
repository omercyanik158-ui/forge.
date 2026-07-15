import type { ForgeCanonicalExercise } from '../types/csvWorkoutBrain';

export const FORGE_CANONICAL_EXERCISES_300 = [
  {
    "canonicalExerciseId": "ab_wheel",
    "exerciseName": "Ab Wheel Rollout",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core"
    ],
    "equipment": [
      "ab_wheel"
    ],
    "defaultRole": "core",
    "appExerciseId": "csv-ab-wheel"
  },
  {
    "canonicalExerciseId": "assisted_pull_up",
    "exerciseName": "Assisted Pull-Up",
    "movementPattern": "vertical_pull",
    "primaryMuscles": [
      "lats",
      "biceps"
    ],
    "equipment": [
      "assisted_machine"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-pull-up-assisted"
  },
  {
    "canonicalExerciseId": "back_squat",
    "exerciseName": "Back Squat",
    "movementPattern": "squat",
    "primaryMuscles": [
      "quads"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "defaultRole": "main_lift",
    "appExerciseId": "csv-squat-barbell"
  },
  {
    "canonicalExerciseId": "band_pulldown",
    "exerciseName": "Resistance-Band Pulldown",
    "movementPattern": "vertical_pull",
    "primaryMuscles": [
      "lats",
      "biceps"
    ],
    "equipment": [
      "resistance_band"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "forge-band-pulldown"
  },
  {
    "canonicalExerciseId": "band_row",
    "exerciseName": "Resistance-Band Row",
    "movementPattern": "horizontal_pull",
    "primaryMuscles": [
      "upper_back",
      "lats",
      "biceps"
    ],
    "equipment": [
      "resistance_band"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "forge-band-row"
  },
  {
    "canonicalExerciseId": "barbell_curl",
    "exerciseName": "Barbell Curl",
    "movementPattern": "elbow_flexion",
    "primaryMuscles": [
      "biceps"
    ],
    "equipment": [
      "barbell"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-bicep-curl-barbell"
  },
  {
    "canonicalExerciseId": "barbell_row",
    "exerciseName": "Barbell Row",
    "movementPattern": "horizontal_pull",
    "primaryMuscles": [
      "upper_back",
      "lats",
      "biceps"
    ],
    "equipment": [
      "barbell"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-barbell-row"
  },
  {
    "canonicalExerciseId": "bench_press",
    "exerciseName": "Barbell Bench Press",
    "movementPattern": "horizontal_push",
    "primaryMuscles": [
      "chest",
      "triceps",
      "front_delts"
    ],
    "equipment": [
      "barbell",
      "bench",
      "rack"
    ],
    "defaultRole": "main_lift",
    "appExerciseId": "csv-bench-press-barbell"
  },
  {
    "canonicalExerciseId": "bike_intervals",
    "exerciseName": "Stationary Bike Intervals",
    "movementPattern": "conditioning",
    "primaryMuscles": [
      "cardio"
    ],
    "equipment": [
      "stationary_bike"
    ],
    "defaultRole": "conditioning",
    "appExerciseId": "forge-bike-intervals"
  },
  {
    "canonicalExerciseId": "bodyweight_squat",
    "exerciseName": "Bodyweight Squat",
    "movementPattern": "squat",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "forge-bodyweight-squat"
  },
  {
    "canonicalExerciseId": "bulgarian_split_squat",
    "exerciseName": "Bulgarian Split Squat",
    "movementPattern": "lunge",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "csv-bulgarian-split-squat-dumbbell"
  },
  {
    "canonicalExerciseId": "cable_curl",
    "exerciseName": "Cable Curl",
    "movementPattern": "elbow_flexion",
    "primaryMuscles": [
      "biceps"
    ],
    "equipment": [
      "cable"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-bicep-curl-cable"
  },
  {
    "canonicalExerciseId": "cable_fly",
    "exerciseName": "Cable Fly",
    "movementPattern": "chest_adduction",
    "primaryMuscles": [
      "chest"
    ],
    "equipment": [
      "cable"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-chest-fly-cable"
  },
  {
    "canonicalExerciseId": "cable_lateral_raise",
    "exerciseName": "Cable Lateral Raise",
    "movementPattern": "shoulder_abduction",
    "primaryMuscles": [
      "side_delts"
    ],
    "equipment": [
      "cable"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-lateral-raise-cable"
  },
  {
    "canonicalExerciseId": "chest_supported_row",
    "exerciseName": "Chest-Supported Row",
    "movementPattern": "horizontal_pull",
    "primaryMuscles": [
      "upper_back",
      "lats",
      "biceps"
    ],
    "equipment": [
      "machine_or_dumbbell"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-chest-supported-row-dumbbell"
  },
  {
    "canonicalExerciseId": "close_grip_bench",
    "exerciseName": "Close-Grip Bench Press",
    "movementPattern": "horizontal_push",
    "primaryMuscles": [
      "triceps",
      "chest"
    ],
    "equipment": [
      "barbell",
      "bench",
      "rack"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-bench-press-close-grip"
  },
  {
    "canonicalExerciseId": "conventional_deadlift",
    "exerciseName": "Conventional Deadlift",
    "movementPattern": "hinge",
    "primaryMuscles": [
      "glutes",
      "hamstrings",
      "back"
    ],
    "equipment": [
      "barbell"
    ],
    "defaultRole": "main_lift",
    "appExerciseId": "csv-deadlift-barbell"
  },
  {
    "canonicalExerciseId": "dead_bug",
    "exerciseName": "Dead Bug",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-dead-bug"
  },
  {
    "canonicalExerciseId": "dumbbell_bench_press",
    "exerciseName": "Dumbbell Bench Press",
    "movementPattern": "horizontal_push",
    "primaryMuscles": [
      "chest",
      "triceps"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-bench-press-dumbbell"
  },
  {
    "canonicalExerciseId": "dumbbell_rdl",
    "exerciseName": "Dumbbell Romanian Deadlift",
    "movementPattern": "hinge",
    "primaryMuscles": [
      "hamstrings",
      "glutes"
    ],
    "equipment": [
      "dumbbell"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-romanian-deadlift-dumbbell"
  },
  {
    "canonicalExerciseId": "dumbbell_shoulder_press",
    "exerciseName": "Dumbbell Shoulder Press",
    "movementPattern": "vertical_push",
    "primaryMuscles": [
      "front_delts",
      "triceps"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-shoulder-press-dumbbell"
  },
  {
    "canonicalExerciseId": "face_pull",
    "exerciseName": "Face Pull",
    "movementPattern": "horizontal_abduction",
    "primaryMuscles": [
      "rear_delts",
      "upper_back"
    ],
    "equipment": [
      "cable"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-face-pull"
  },
  {
    "canonicalExerciseId": "farmer_carry",
    "exerciseName": "Farmer Carry",
    "movementPattern": "loaded_carry",
    "primaryMuscles": [
      "grip",
      "core"
    ],
    "equipment": [
      "dumbbell_or_kettlebell"
    ],
    "defaultRole": "conditioning",
    "appExerciseId": "forge-farmer-carry"
  },
  {
    "canonicalExerciseId": "front_squat",
    "exerciseName": "Front Squat",
    "movementPattern": "squat",
    "primaryMuscles": [
      "quads"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-front-squat-barbell"
  },
  {
    "canonicalExerciseId": "goblet_squat",
    "exerciseName": "Goblet Squat",
    "movementPattern": "squat",
    "primaryMuscles": [
      "quads"
    ],
    "equipment": [
      "dumbbell"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-goblet-squat"
  },
  {
    "canonicalExerciseId": "hack_squat",
    "exerciseName": "Hack Squat",
    "movementPattern": "squat",
    "primaryMuscles": [
      "quads"
    ],
    "equipment": [
      "machine"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-hack-squat"
  },
  {
    "canonicalExerciseId": "hammer_curl",
    "exerciseName": "Hammer Curl",
    "movementPattern": "elbow_flexion",
    "primaryMuscles": [
      "biceps",
      "forearms"
    ],
    "equipment": [
      "dumbbell"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-hammer-curl"
  },
  {
    "canonicalExerciseId": "hanging_leg_raise",
    "exerciseName": "Hanging Leg Raise",
    "movementPattern": "hip_flexion",
    "primaryMuscles": [
      "core"
    ],
    "equipment": [
      "pullup_bar"
    ],
    "defaultRole": "core",
    "appExerciseId": "csv-hanging-leg-raise"
  },
  {
    "canonicalExerciseId": "hip_thrust",
    "exerciseName": "Barbell Hip Thrust",
    "movementPattern": "hinge",
    "primaryMuscles": [
      "glutes"
    ],
    "equipment": [
      "barbell",
      "bench"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-hip-thrust-barbell"
  },
  {
    "canonicalExerciseId": "incline_barbell_press",
    "exerciseName": "Incline Barbell Press",
    "movementPattern": "incline_push",
    "primaryMuscles": [
      "upper_chest",
      "triceps",
      "front_delts"
    ],
    "equipment": [
      "barbell",
      "incline_bench",
      "rack"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-incline-bench-press-barbell"
  },
  {
    "canonicalExerciseId": "incline_dumbbell_curl",
    "exerciseName": "Incline Dumbbell Curl",
    "movementPattern": "elbow_flexion",
    "primaryMuscles": [
      "biceps"
    ],
    "equipment": [
      "dumbbell",
      "incline_bench"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-incline-curl-dumbbell"
  },
  {
    "canonicalExerciseId": "incline_dumbbell_press",
    "exerciseName": "Incline Dumbbell Press",
    "movementPattern": "incline_push",
    "primaryMuscles": [
      "upper_chest",
      "triceps",
      "front_delts"
    ],
    "equipment": [
      "dumbbell",
      "incline_bench"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-incline-bench-press-dumbbell"
  },
  {
    "canonicalExerciseId": "incline_walk",
    "exerciseName": "Incline Treadmill Walk",
    "movementPattern": "conditioning",
    "primaryMuscles": [
      "cardio"
    ],
    "equipment": [
      "treadmill"
    ],
    "defaultRole": "conditioning",
    "appExerciseId": "forge-incline-walk"
  },
  {
    "canonicalExerciseId": "inverted_row",
    "exerciseName": "Inverted Row",
    "movementPattern": "horizontal_pull",
    "primaryMuscles": [
      "upper_back",
      "lats",
      "biceps"
    ],
    "equipment": [
      "bar_or_rings"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "csv-inverted-row"
  },
  {
    "canonicalExerciseId": "lat_pulldown",
    "exerciseName": "Lat Pulldown",
    "movementPattern": "vertical_pull",
    "primaryMuscles": [
      "lats",
      "biceps"
    ],
    "equipment": [
      "cable"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-lat-pulldown"
  },
  {
    "canonicalExerciseId": "lateral_raise",
    "exerciseName": "Dumbbell Lateral Raise",
    "movementPattern": "shoulder_abduction",
    "primaryMuscles": [
      "side_delts"
    ],
    "equipment": [
      "dumbbell"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-lateral-raise-dumbbell"
  },
  {
    "canonicalExerciseId": "leg_curl",
    "exerciseName": "Leg Curl",
    "movementPattern": "knee_flexion",
    "primaryMuscles": [
      "hamstrings"
    ],
    "equipment": [
      "machine"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-leg-curl"
  },
  {
    "canonicalExerciseId": "leg_extension",
    "exerciseName": "Leg Extension",
    "movementPattern": "knee_extension",
    "primaryMuscles": [
      "quads"
    ],
    "equipment": [
      "machine"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-leg-extension"
  },
  {
    "canonicalExerciseId": "leg_press",
    "exerciseName": "Leg Press",
    "movementPattern": "squat",
    "primaryMuscles": [
      "quads"
    ],
    "equipment": [
      "machine"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-leg-press"
  },
  {
    "canonicalExerciseId": "low_to_high_cable_fly",
    "exerciseName": "Low-to-High Cable Fly",
    "movementPattern": "chest_adduction",
    "primaryMuscles": [
      "upper_chest"
    ],
    "equipment": [
      "cable"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-incline-chest-fly"
  },
  {
    "canonicalExerciseId": "machine_chest_press",
    "exerciseName": "Machine Chest Press",
    "movementPattern": "horizontal_push",
    "primaryMuscles": [
      "chest",
      "triceps"
    ],
    "equipment": [
      "machine"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-chest-press-machine"
  },
  {
    "canonicalExerciseId": "machine_shoulder_press",
    "exerciseName": "Machine Shoulder Press",
    "movementPattern": "vertical_push",
    "primaryMuscles": [
      "front_delts",
      "triceps"
    ],
    "equipment": [
      "machine"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-shoulder-press-machine"
  },
  {
    "canonicalExerciseId": "neutral_grip_pulldown",
    "exerciseName": "Neutral-Grip Pulldown",
    "movementPattern": "vertical_pull",
    "primaryMuscles": [
      "lats",
      "biceps"
    ],
    "equipment": [
      "cable"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-neutral-grip-pulldowns"
  },
  {
    "canonicalExerciseId": "nordic_curl",
    "exerciseName": "Nordic Curl",
    "movementPattern": "knee_flexion",
    "primaryMuscles": [
      "hamstrings"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-nordic-curl"
  },
  {
    "canonicalExerciseId": "one_arm_dumbbell_row",
    "exerciseName": "One-Arm Dumbbell Row",
    "movementPattern": "horizontal_pull",
    "primaryMuscles": [
      "lats",
      "upper_back",
      "biceps"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-single-arm-row-dumbbell"
  },
  {
    "canonicalExerciseId": "overhead_press",
    "exerciseName": "Barbell Overhead Press",
    "movementPattern": "vertical_push",
    "primaryMuscles": [
      "front_delts",
      "triceps"
    ],
    "equipment": [
      "barbell",
      "rack"
    ],
    "defaultRole": "main_lift",
    "appExerciseId": "csv-overhead-press-barbell"
  },
  {
    "canonicalExerciseId": "overhead_triceps_extension",
    "exerciseName": "Overhead Triceps Extension",
    "movementPattern": "elbow_extension",
    "primaryMuscles": [
      "triceps"
    ],
    "equipment": [
      "cable_or_dumbbell"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-overhead-tricep-extension-cable"
  },
  {
    "canonicalExerciseId": "pallof_press",
    "exerciseName": "Pallof Press",
    "movementPattern": "anti_rotation",
    "primaryMuscles": [
      "core"
    ],
    "equipment": [
      "cable_or_band"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pallof-press"
  },
  {
    "canonicalExerciseId": "paused_bench_press",
    "exerciseName": "Paused Bench Press",
    "movementPattern": "horizontal_push",
    "primaryMuscles": [
      "chest",
      "triceps",
      "front_delts"
    ],
    "equipment": [
      "barbell",
      "bench",
      "rack"
    ],
    "defaultRole": "main_lift",
    "appExerciseId": "csv-bench-press-paused"
  },
  {
    "canonicalExerciseId": "pike_push_up",
    "exerciseName": "Pike Push-Up",
    "movementPattern": "vertical_push",
    "primaryMuscles": [
      "front_delts",
      "triceps"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "forge-pike-push-up"
  },
  {
    "canonicalExerciseId": "plank",
    "exerciseName": "Plank",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "csv-plank"
  },
  {
    "canonicalExerciseId": "pull_up",
    "exerciseName": "Pull-Up",
    "movementPattern": "vertical_pull",
    "primaryMuscles": [
      "lats",
      "biceps"
    ],
    "equipment": [
      "pullup_bar"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-pull-up-bodyweight"
  },
  {
    "canonicalExerciseId": "push_up",
    "exerciseName": "Push-Up",
    "movementPattern": "horizontal_push",
    "primaryMuscles": [
      "chest",
      "triceps"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "csv-push-up"
  },
  {
    "canonicalExerciseId": "reverse_lunge",
    "exerciseName": "Reverse Lunge",
    "movementPattern": "lunge",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "equipment": [
      "dumbbell"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "csv-reverse-lunge-dumbbell"
  },
  {
    "canonicalExerciseId": "reverse_pec_deck",
    "exerciseName": "Reverse Pec Deck",
    "movementPattern": "horizontal_abduction",
    "primaryMuscles": [
      "rear_delts",
      "upper_back"
    ],
    "equipment": [
      "machine"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-reverse-pec-deck"
  },
  {
    "canonicalExerciseId": "romanian_deadlift",
    "exerciseName": "Romanian Deadlift",
    "movementPattern": "hinge",
    "primaryMuscles": [
      "hamstrings",
      "glutes"
    ],
    "equipment": [
      "barbell"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-romanian-deadlift-barbell"
  },
  {
    "canonicalExerciseId": "seated_cable_row",
    "exerciseName": "Seated Cable Row",
    "movementPattern": "horizontal_pull",
    "primaryMuscles": [
      "upper_back",
      "lats",
      "biceps"
    ],
    "equipment": [
      "cable"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-seated-row-cable"
  },
  {
    "canonicalExerciseId": "seated_calf_raise",
    "exerciseName": "Seated Calf Raise",
    "movementPattern": "calf_raise",
    "primaryMuscles": [
      "calves"
    ],
    "equipment": [
      "machine"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-seated-calf-raise"
  },
  {
    "canonicalExerciseId": "single_leg_glute_bridge",
    "exerciseName": "Single-Leg Glute Bridge",
    "movementPattern": "hinge",
    "primaryMuscles": [
      "glutes",
      "hamstrings"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "forge-single-leg-glute-bridge"
  },
  {
    "canonicalExerciseId": "skull_crusher",
    "exerciseName": "Skull Crusher",
    "movementPattern": "elbow_extension",
    "primaryMuscles": [
      "triceps"
    ],
    "equipment": [
      "ez_bar",
      "bench"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-skull-crusher"
  },
  {
    "canonicalExerciseId": "split_squat",
    "exerciseName": "Split Squat",
    "movementPattern": "lunge",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "csv-lunge-bodyweight"
  },
  {
    "canonicalExerciseId": "standing_calf_raise",
    "exerciseName": "Standing Calf Raise",
    "movementPattern": "calf_raise",
    "primaryMuscles": [
      "calves"
    ],
    "equipment": [
      "machine"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-standing-calf-raise"
  },
  {
    "canonicalExerciseId": "step_up",
    "exerciseName": "Step Up",
    "movementPattern": "lunge",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "equipment": [
      "dumbbell",
      "bench"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "forge-step-up"
  },
  {
    "canonicalExerciseId": "straight_arm_pulldown",
    "exerciseName": "Straight-Arm Pulldown",
    "movementPattern": "shoulder_extension",
    "primaryMuscles": [
      "lats"
    ],
    "equipment": [
      "cable"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-standing-pullover-cable"
  },
  {
    "canonicalExerciseId": "trap_bar_deadlift",
    "exerciseName": "Trap Bar Deadlift",
    "movementPattern": "hinge",
    "primaryMuscles": [
      "glutes",
      "quads",
      "hamstrings"
    ],
    "equipment": [
      "trap_bar"
    ],
    "defaultRole": "main_lift",
    "appExerciseId": "csv-trap-bar-deadlift"
  },
  {
    "canonicalExerciseId": "triceps_pushdown",
    "exerciseName": "Triceps Pushdown",
    "movementPattern": "elbow_extension",
    "primaryMuscles": [
      "triceps"
    ],
    "equipment": [
      "cable"
    ],
    "defaultRole": "isolation",
    "appExerciseId": "csv-tricep-pushdown-cable"
  },
  {
    "canonicalExerciseId": "weighted_dip",
    "exerciseName": "Weighted Dip",
    "movementPattern": "vertical_push",
    "primaryMuscles": [
      "chest",
      "triceps"
    ],
    "equipment": [
      "dip_station",
      "weight"
    ],
    "defaultRole": "secondary_compound",
    "appExerciseId": "csv-dip-weighted"
  },
  {
    "canonicalExerciseId": "mountain_pose",
    "exerciseName": "Mountain Pose",
    "movementPattern": "posture",
    "primaryMuscles": [
      "core",
      "glutes"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility"
  },
  {
    "canonicalExerciseId": "cat_cow",
    "exerciseName": "Cat-Cow",
    "movementPattern": "spinal_mobility",
    "primaryMuscles": [
      "core",
      "back"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-cat-cow"
  },
  {
    "canonicalExerciseId": "childs_pose",
    "exerciseName": "Child's Pose",
    "movementPattern": "recovery",
    "primaryMuscles": [
      "back",
      "hips"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-childs-pose"
  },
  {
    "canonicalExerciseId": "downward_dog",
    "exerciseName": "Downward-Facing Dog",
    "movementPattern": "full_body_mobility",
    "primaryMuscles": [
      "shoulders",
      "hamstrings",
      "calves"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-downward-dog"
  },
  {
    "canonicalExerciseId": "cobra_pose",
    "exerciseName": "Cobra Pose",
    "movementPattern": "spinal_extension",
    "primaryMuscles": [
      "back",
      "chest"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-cobra-pose"
  },
  {
    "canonicalExerciseId": "sphinx_pose",
    "exerciseName": "Sphinx Pose",
    "movementPattern": "spinal_extension",
    "primaryMuscles": [
      "back",
      "chest"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility"
  },
  {
    "canonicalExerciseId": "low_lunge_pose",
    "exerciseName": "Low Lunge",
    "movementPattern": "hip_flexor_mobility",
    "primaryMuscles": [
      "hips",
      "quads"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-low-lunge-pose"
  },
  {
    "canonicalExerciseId": "warrior_one",
    "exerciseName": "Warrior I",
    "movementPattern": "lunge_hold",
    "primaryMuscles": [
      "quads",
      "glutes",
      "hips"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "isometric",
    "appExerciseId": "forge-warrior-one"
  },
  {
    "canonicalExerciseId": "warrior_two",
    "exerciseName": "Warrior II",
    "movementPattern": "lunge_hold",
    "primaryMuscles": [
      "quads",
      "glutes",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "isometric",
    "appExerciseId": "forge-warrior-two"
  },
  {
    "canonicalExerciseId": "reverse_warrior",
    "exerciseName": "Reverse Warrior",
    "movementPattern": "lateral_flexion",
    "primaryMuscles": [
      "obliques",
      "hips",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-reverse-warrior"
  },
  {
    "canonicalExerciseId": "triangle_pose",
    "exerciseName": "Triangle Pose",
    "movementPattern": "lateral_hinge",
    "primaryMuscles": [
      "hamstrings",
      "hips",
      "obliques"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-triangle-pose"
  },
  {
    "canonicalExerciseId": "extended_side_angle",
    "exerciseName": "Extended Side Angle",
    "movementPattern": "lunge_hold",
    "primaryMuscles": [
      "quads",
      "glutes",
      "obliques"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "isometric",
    "appExerciseId": "forge-extended-side-angle"
  },
  {
    "canonicalExerciseId": "chair_pose",
    "exerciseName": "Chair Pose",
    "movementPattern": "squat_hold",
    "primaryMuscles": [
      "quads",
      "glutes",
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "isometric",
    "appExerciseId": "forge-chair-pose"
  },
  {
    "canonicalExerciseId": "tree_pose",
    "exerciseName": "Tree Pose",
    "movementPattern": "balance",
    "primaryMuscles": [
      "glutes",
      "calves",
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "balance",
    "appExerciseId": "forge-tree-pose"
  },
  {
    "canonicalExerciseId": "eagle_pose",
    "exerciseName": "Eagle Pose",
    "movementPattern": "balance",
    "primaryMuscles": [
      "glutes",
      "upper_back",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "balance",
    "appExerciseId": "forge-eagle-pose"
  },
  {
    "canonicalExerciseId": "half_moon_pose",
    "exerciseName": "Half Moon Pose",
    "movementPattern": "balance",
    "primaryMuscles": [
      "glutes",
      "core",
      "hips"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "balance",
    "appExerciseId": "forge-half-moon-pose"
  },
  {
    "canonicalExerciseId": "bridge_pose",
    "exerciseName": "Yoga Bridge",
    "movementPattern": "hip_extension",
    "primaryMuscles": [
      "glutes",
      "hamstrings",
      "back"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "isometric",
    "appExerciseId": "forge-bridge-pose"
  },
  {
    "canonicalExerciseId": "happy_baby",
    "exerciseName": "Happy Baby",
    "movementPattern": "hip_mobility",
    "primaryMuscles": [
      "hips",
      "adductors"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-happy-baby"
  },
  {
    "canonicalExerciseId": "supine_twist",
    "exerciseName": "Supine Twist",
    "movementPattern": "rotation_mobility",
    "primaryMuscles": [
      "spine",
      "obliques"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-supine-twist"
  },
  {
    "canonicalExerciseId": "seated_forward_fold",
    "exerciseName": "Seated Forward Fold",
    "movementPattern": "hamstring_mobility",
    "primaryMuscles": [
      "hamstrings",
      "back"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-seated-forward-fold"
  },
  {
    "canonicalExerciseId": "pigeon_pose",
    "exerciseName": "Pigeon Pose",
    "movementPattern": "hip_mobility",
    "primaryMuscles": [
      "glutes",
      "hips"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-pigeon-pose"
  },
  {
    "canonicalExerciseId": "thread_the_needle",
    "exerciseName": "Thread the Needle",
    "movementPattern": "thoracic_rotation",
    "primaryMuscles": [
      "upper_back",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-thread-the-needle"
  },
  {
    "canonicalExerciseId": "sun_salutation_a",
    "exerciseName": "Sun Salutation A",
    "movementPattern": "flow",
    "primaryMuscles": [
      "full_body"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "conditioning",
    "appExerciseId": "forge-sun-salutation-a"
  },
  {
    "canonicalExerciseId": "sun_salutation_b",
    "exerciseName": "Sun Salutation B",
    "movementPattern": "flow",
    "primaryMuscles": [
      "full_body"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "conditioning",
    "appExerciseId": "forge-sun-salutation-b"
  },
  {
    "canonicalExerciseId": "boat_pose",
    "exerciseName": "Boat Pose",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core",
      "hip_flexors"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-boat-pose"
  },
  {
    "canonicalExerciseId": "side_plank_yoga",
    "exerciseName": "Yoga Side Plank",
    "movementPattern": "anti_lateral_flexion",
    "primaryMuscles": [
      "core",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-side-plank-yoga"
  },
  {
    "canonicalExerciseId": "locust_pose",
    "exerciseName": "Locust Pose",
    "movementPattern": "spinal_extension",
    "primaryMuscles": [
      "back",
      "glutes"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "isometric",
    "appExerciseId": "forge-locust-pose"
  },
  {
    "canonicalExerciseId": "corpse_pose",
    "exerciseName": "Savasana",
    "movementPattern": "recovery",
    "primaryMuscles": [
      "full_body"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "recovery",
    "appExerciseId": "forge-corpse-pose"
  },
  {
    "canonicalExerciseId": "box_breathing",
    "exerciseName": "Box Breathing",
    "movementPattern": "breathing",
    "primaryMuscles": [
      "respiratory"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "recovery",
    "appExerciseId": "forge-box-breathing"
  },
  {
    "canonicalExerciseId": "diaphragmatic_breathing",
    "exerciseName": "Diaphragmatic Breathing",
    "movementPattern": "breathing",
    "primaryMuscles": [
      "respiratory"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "recovery",
    "appExerciseId": "forge-diaphragmatic-breathing"
  },
  {
    "canonicalExerciseId": "pilates_hundred",
    "exerciseName": "Pilates Hundred",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core",
      "hip_flexors"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-hundred"
  },
  {
    "canonicalExerciseId": "pilates_roll_up",
    "exerciseName": "Pilates Roll-Up",
    "movementPattern": "spinal_flexion",
    "primaryMuscles": [
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-roll-up"
  },
  {
    "canonicalExerciseId": "pilates_single_leg_circle",
    "exerciseName": "Single-Leg Circle",
    "movementPattern": "hip_control",
    "primaryMuscles": [
      "hips",
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-pilates-single-leg-circle"
  },
  {
    "canonicalExerciseId": "pilates_rolling_like_ball",
    "exerciseName": "Rolling Like a Ball",
    "movementPattern": "spinal_control",
    "primaryMuscles": [
      "core",
      "back"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility"
  },
  {
    "canonicalExerciseId": "pilates_single_leg_stretch",
    "exerciseName": "Single-Leg Stretch",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core",
      "hip_flexors"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-single-leg-stretch"
  },
  {
    "canonicalExerciseId": "pilates_double_leg_stretch",
    "exerciseName": "Double-Leg Stretch",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core",
      "hip_flexors"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-double-leg-stretch"
  },
  {
    "canonicalExerciseId": "pilates_scissors",
    "exerciseName": "Pilates Scissors",
    "movementPattern": "hip_flexion_control",
    "primaryMuscles": [
      "core",
      "hamstrings"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-scissors"
  },
  {
    "canonicalExerciseId": "pilates_criss_cross",
    "exerciseName": "Pilates Criss-Cross",
    "movementPattern": "rotation",
    "primaryMuscles": [
      "obliques",
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-criss-cross"
  },
  {
    "canonicalExerciseId": "pilates_spine_stretch",
    "exerciseName": "Spine Stretch Forward",
    "movementPattern": "spinal_mobility",
    "primaryMuscles": [
      "back",
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-pilates-spine-stretch"
  },
  {
    "canonicalExerciseId": "pilates_saw",
    "exerciseName": "Pilates Saw",
    "movementPattern": "rotation_mobility",
    "primaryMuscles": [
      "obliques",
      "back"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-pilates-saw"
  },
  {
    "canonicalExerciseId": "pilates_swan",
    "exerciseName": "Pilates Swan",
    "movementPattern": "spinal_extension",
    "primaryMuscles": [
      "back",
      "glutes"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "isometric",
    "appExerciseId": "forge-pilates-swan"
  },
  {
    "canonicalExerciseId": "pilates_single_leg_kick",
    "exerciseName": "Single-Leg Kick",
    "movementPattern": "knee_flexion",
    "primaryMuscles": [
      "hamstrings",
      "glutes"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory",
    "appExerciseId": "forge-pilates-single-leg-kick"
  },
  {
    "canonicalExerciseId": "pilates_double_leg_kick",
    "exerciseName": "Double-Leg Kick",
    "movementPattern": "knee_flexion",
    "primaryMuscles": [
      "hamstrings",
      "back"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory",
    "appExerciseId": "forge-pilates-double-leg-kick"
  },
  {
    "canonicalExerciseId": "pilates_shoulder_bridge",
    "exerciseName": "Pilates Shoulder Bridge",
    "movementPattern": "hip_extension",
    "primaryMuscles": [
      "glutes",
      "hamstrings",
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory",
    "appExerciseId": "forge-pilates-shoulder-bridge"
  },
  {
    "canonicalExerciseId": "pilates_side_kick",
    "exerciseName": "Side Kick Series",
    "movementPattern": "hip_abduction",
    "primaryMuscles": [
      "side_glutes",
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory",
    "appExerciseId": "forge-pilates-side-kick"
  },
  {
    "canonicalExerciseId": "pilates_teaser",
    "exerciseName": "Pilates Teaser",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core",
      "hip_flexors"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-teaser"
  },
  {
    "canonicalExerciseId": "pilates_swimming",
    "exerciseName": "Pilates Swimming",
    "movementPattern": "posterior_chain",
    "primaryMuscles": [
      "back",
      "glutes",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "conditioning",
    "appExerciseId": "forge-pilates-swimming"
  },
  {
    "canonicalExerciseId": "pilates_leg_pull_front",
    "exerciseName": "Leg Pull Front",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core",
      "glutes",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-leg-pull-front"
  },
  {
    "canonicalExerciseId": "pilates_leg_pull_back",
    "exerciseName": "Leg Pull Back",
    "movementPattern": "hip_extension",
    "primaryMuscles": [
      "glutes",
      "hamstrings",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory",
    "appExerciseId": "forge-pilates-leg-pull-back"
  },
  {
    "canonicalExerciseId": "pilates_side_bend",
    "exerciseName": "Pilates Side Bend",
    "movementPattern": "anti_lateral_flexion",
    "primaryMuscles": [
      "obliques",
      "shoulders"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-side-bend"
  },
  {
    "canonicalExerciseId": "pilates_seal",
    "exerciseName": "Pilates Seal",
    "movementPattern": "spinal_control",
    "primaryMuscles": [
      "core",
      "back"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-pilates-seal"
  },
  {
    "canonicalExerciseId": "pilates_push_up",
    "exerciseName": "Pilates Push-Up",
    "movementPattern": "horizontal_push",
    "primaryMuscles": [
      "chest",
      "triceps",
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory_compound",
    "appExerciseId": "forge-pilates-push-up"
  },
  {
    "canonicalExerciseId": "pilates_wall_roll_down",
    "exerciseName": "Wall Roll-Down",
    "movementPattern": "spinal_mobility",
    "primaryMuscles": [
      "back",
      "hamstrings"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "mobility",
    "appExerciseId": "forge-pilates-wall-roll-down"
  },
  {
    "canonicalExerciseId": "pilates_clamshell",
    "exerciseName": "Pilates Clamshell",
    "movementPattern": "hip_external_rotation",
    "primaryMuscles": [
      "side_glutes",
      "hips"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory",
    "appExerciseId": "forge-pilates-clamshell"
  },
  {
    "canonicalExerciseId": "pilates_dead_bug",
    "exerciseName": "Pilates Dead Bug",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-dead-bug"
  },
  {
    "canonicalExerciseId": "pilates_bird_dog",
    "exerciseName": "Pilates Bird Dog",
    "movementPattern": "anti_rotation",
    "primaryMuscles": [
      "core",
      "glutes",
      "back"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-bird-dog"
  },
  {
    "canonicalExerciseId": "pilates_toe_taps",
    "exerciseName": "Pilates Toe Taps",
    "movementPattern": "anti_extension",
    "primaryMuscles": [
      "core",
      "hip_flexors"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "core",
    "appExerciseId": "forge-pilates-toe-taps"
  },
  {
    "canonicalExerciseId": "pilates_wall_sit",
    "exerciseName": "Pilates Wall Sit",
    "movementPattern": "squat_hold",
    "primaryMuscles": [
      "quads",
      "glutes"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "isometric",
    "appExerciseId": "forge-pilates-wall-sit"
  },
  {
    "canonicalExerciseId": "pilates_calf_raise",
    "exerciseName": "Pilates Calf Raise",
    "movementPattern": "calf_raise",
    "primaryMuscles": [
      "calves"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "accessory",
    "appExerciseId": "forge-pilates-calf-raise"
  },
  {
    "canonicalExerciseId": "pilates_breathing",
    "exerciseName": "Pilates Lateral Breathing",
    "movementPattern": "breathing",
    "primaryMuscles": [
      "respiratory",
      "core"
    ],
    "equipment": [
      "bodyweight"
    ],
    "defaultRole": "recovery",
    "appExerciseId": "forge-pilates-breathing"
  }
] as const satisfies readonly ForgeCanonicalExercise[];
