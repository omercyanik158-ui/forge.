import type { ForgeCanonicalExercise } from '../types/csvWorkoutBrain';

export const FORGE_CANONICAL_EXERCISES = [
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
    "appExerciseId": "csv-shoulder-press-plate-loaded"
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
  }
] as const satisfies readonly ForgeCanonicalExercise[];
