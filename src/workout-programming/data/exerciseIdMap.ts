import type { ExerciseLibraryItem } from '@/types';

export const FORGE_EXERCISE_ID_MAP = {
  "ab_wheel": "csv-ab-wheel",
  "assisted_pull_up": "csv-pull-up-assisted",
  "back_squat": "csv-squat-barbell",
  "band_pulldown": "forge-band-pulldown",
  "band_row": "forge-band-row",
  "barbell_curl": "csv-bicep-curl-barbell",
  "barbell_row": "csv-barbell-row",
  "bench_press": "csv-bench-press-barbell",
  "bike_intervals": "forge-bike-intervals",
  "bodyweight_squat": "forge-bodyweight-squat",
  "bulgarian_split_squat": "csv-bulgarian-split-squat-dumbbell",
  "cable_curl": "csv-bicep-curl-cable",
  "cable_fly": "csv-chest-fly-cable",
  "cable_lateral_raise": "csv-lateral-raise-cable",
  "chest_supported_row": "csv-chest-supported-row-dumbbell",
  "close_grip_bench": "csv-bench-press-close-grip",
  "conventional_deadlift": "csv-deadlift-barbell",
  "dead_bug": "forge-dead-bug",
  "dumbbell_bench_press": "csv-bench-press-dumbbell",
  "dumbbell_rdl": "csv-romanian-deadlift-dumbbell",
  "dumbbell_shoulder_press": "csv-shoulder-press-plate-loaded",
  "face_pull": "csv-face-pull",
  "farmer_carry": "forge-farmer-carry",
  "front_squat": "csv-front-squat-barbell",
  "goblet_squat": "csv-goblet-squat",
  "hack_squat": "csv-hack-squat",
  "hammer_curl": "csv-hammer-curl",
  "hanging_leg_raise": "csv-hanging-leg-raise",
  "hip_thrust": "csv-hip-thrust-barbell",
  "incline_barbell_press": "csv-incline-bench-press-barbell",
  "incline_dumbbell_curl": "csv-incline-curl-dumbbell",
  "incline_dumbbell_press": "csv-incline-bench-press-dumbbell",
  "incline_walk": "forge-incline-walk",
  "inverted_row": "csv-inverted-row",
  "lat_pulldown": "csv-lat-pulldown",
  "lateral_raise": "csv-lateral-raise-dumbbell",
  "leg_curl": "csv-leg-curl",
  "leg_extension": "csv-leg-extension",
  "leg_press": "csv-leg-press",
  "low_to_high_cable_fly": "csv-incline-chest-fly",
  "machine_chest_press": "csv-chest-press-machine",
  "machine_shoulder_press": "csv-shoulder-press-machine",
  "neutral_grip_pulldown": "csv-neutral-grip-pulldowns",
  "nordic_curl": "csv-nordic-curl",
  "one_arm_dumbbell_row": "csv-single-arm-row-dumbbell",
  "overhead_press": "csv-overhead-press-barbell",
  "overhead_triceps_extension": "csv-overhead-tricep-extension-cable",
  "pallof_press": "forge-pallof-press",
  "paused_bench_press": "csv-bench-press-paused",
  "pike_push_up": "forge-pike-push-up",
  "plank": "csv-plank",
  "pull_up": "csv-pull-up-bodyweight",
  "push_up": "csv-push-up",
  "reverse_lunge": "csv-reverse-lunge-dumbbell",
  "reverse_pec_deck": "csv-reverse-pec-deck",
  "romanian_deadlift": "csv-romanian-deadlift-barbell",
  "seated_cable_row": "csv-seated-row-cable",
  "seated_calf_raise": "csv-seated-calf-raise",
  "single_leg_glute_bridge": "forge-single-leg-glute-bridge",
  "skull_crusher": "csv-skull-crusher",
  "split_squat": "csv-lunge-bodyweight",
  "standing_calf_raise": "csv-standing-calf-raise",
  "step_up": "forge-step-up",
  "straight_arm_pulldown": "csv-standing-pullover-cable",
  "trap_bar_deadlift": "csv-trap-bar-deadlift",
  "triceps_pushdown": "csv-tricep-pushdown-cable",
  "weighted_dip": "csv-dip-weighted"
} as const;

export const FORGE_REVIEWED_EXERCISES = [
  {
    "id": "forge-band-pulldown",
    "name": "Resistance-Band Pulldown",
    "displayName": "Resistance-Band Pulldown",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Sırt",
      "Kol"
    ],
    "secondaryMuscles": [],
    "equipment": "resistance_band",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-band-row",
    "name": "Resistance-Band Row",
    "displayName": "Resistance-Band Row",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Sırt",
      "Sırt",
      "Kol"
    ],
    "secondaryMuscles": [],
    "equipment": "resistance_band",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-bike-intervals",
    "name": "Stationary Bike Intervals",
    "displayName": "Stationary Bike Intervals",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Bacak"
    ],
    "secondaryMuscles": [],
    "equipment": "stationary_bike",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-bodyweight-squat",
    "name": "Bodyweight Squat",
    "displayName": "Bodyweight Squat",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
      "Bacak"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-dead-bug",
    "name": "Dead Bug",
    "displayName": "Dead Bug",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Karın"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-farmer-carry",
    "name": "Farmer Carry",
    "displayName": "Farmer Carry",
    "muscleGroup": "Kol",
    "targetMuscles": [
      "Kol",
      "Karın"
    ],
    "secondaryMuscles": [],
    "equipment": "dumbbell_or_kettlebell",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-incline-walk",
    "name": "Incline Treadmill Walk",
    "displayName": "Incline Treadmill Walk",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Bacak"
    ],
    "secondaryMuscles": [],
    "equipment": "treadmill",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pallof-press",
    "name": "Pallof Press",
    "displayName": "Pallof Press",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Karın"
    ],
    "secondaryMuscles": [],
    "equipment": "cable_or_band",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pike-push-up",
    "name": "Pike Push-Up",
    "displayName": "Pike Push-Up",
    "muscleGroup": "Omuz",
    "targetMuscles": [
      "Omuz",
      "Kol"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-single-leg-glute-bridge",
    "name": "Single-Leg Glute Bridge",
    "displayName": "Single-Leg Glute Bridge",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
      "Bacak"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-step-up",
    "name": "Step Up",
    "displayName": "Step Up",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
      "Bacak"
    ],
    "secondaryMuscles": [],
    "equipment": "dumbbell,bench",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  }
] as const satisfies readonly ExerciseLibraryItem[];

export const FORGE_EXERCISE_MAPPING_NOTES = [
  {
    "canonical": "ab_wheel",
    "app": "csv-ab-wheel",
    "type": "reviewed_alias"
  },
  {
    "canonical": "assisted_pull_up",
    "app": "csv-pull-up-assisted",
    "type": "reviewed_alias"
  },
  {
    "canonical": "back_squat",
    "app": "csv-squat-barbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "band_pulldown",
    "app": "forge-band-pulldown",
    "type": "reviewed_entry"
  },
  {
    "canonical": "band_row",
    "app": "forge-band-row",
    "type": "reviewed_entry"
  },
  {
    "canonical": "barbell_curl",
    "app": "csv-bicep-curl-barbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "barbell_row",
    "app": "csv-barbell-row",
    "type": "exact_name"
  },
  {
    "canonical": "bench_press",
    "app": "csv-bench-press-barbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "bike_intervals",
    "app": "forge-bike-intervals",
    "type": "reviewed_entry"
  },
  {
    "canonical": "bodyweight_squat",
    "app": "forge-bodyweight-squat",
    "type": "reviewed_entry"
  },
  {
    "canonical": "bulgarian_split_squat",
    "app": "csv-bulgarian-split-squat-dumbbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "cable_curl",
    "app": "csv-bicep-curl-cable",
    "type": "reviewed_alias"
  },
  {
    "canonical": "cable_fly",
    "app": "csv-chest-fly-cable",
    "type": "reviewed_alias"
  },
  {
    "canonical": "cable_lateral_raise",
    "app": "csv-lateral-raise-cable",
    "type": "reviewed_alias"
  },
  {
    "canonical": "chest_supported_row",
    "app": "csv-chest-supported-row-dumbbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "close_grip_bench",
    "app": "csv-bench-press-close-grip",
    "type": "reviewed_alias"
  },
  {
    "canonical": "conventional_deadlift",
    "app": "csv-deadlift-barbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "dead_bug",
    "app": "forge-dead-bug",
    "type": "reviewed_entry"
  },
  {
    "canonical": "dumbbell_bench_press",
    "app": "csv-bench-press-dumbbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "dumbbell_rdl",
    "app": "csv-romanian-deadlift-dumbbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "dumbbell_shoulder_press",
    "app": "csv-shoulder-press-plate-loaded",
    "type": "reviewed_alias"
  },
  {
    "canonical": "face_pull",
    "app": "csv-face-pull",
    "type": "exact_name"
  },
  {
    "canonical": "farmer_carry",
    "app": "forge-farmer-carry",
    "type": "reviewed_entry"
  },
  {
    "canonical": "front_squat",
    "app": "csv-front-squat-barbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "goblet_squat",
    "app": "csv-goblet-squat",
    "type": "exact_name"
  },
  {
    "canonical": "hack_squat",
    "app": "csv-hack-squat",
    "type": "exact_name"
  },
  {
    "canonical": "hammer_curl",
    "app": "csv-hammer-curl",
    "type": "exact_name"
  },
  {
    "canonical": "hanging_leg_raise",
    "app": "csv-hanging-leg-raise",
    "type": "exact_name"
  },
  {
    "canonical": "hip_thrust",
    "app": "csv-hip-thrust-barbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "incline_barbell_press",
    "app": "csv-incline-bench-press-barbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "incline_dumbbell_curl",
    "app": "csv-incline-curl-dumbbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "incline_dumbbell_press",
    "app": "csv-incline-bench-press-dumbbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "incline_walk",
    "app": "forge-incline-walk",
    "type": "reviewed_entry"
  },
  {
    "canonical": "inverted_row",
    "app": "csv-inverted-row",
    "type": "exact_name"
  },
  {
    "canonical": "lat_pulldown",
    "app": "csv-lat-pulldown",
    "type": "exact_name"
  },
  {
    "canonical": "lateral_raise",
    "app": "csv-lateral-raise-dumbbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "leg_curl",
    "app": "csv-leg-curl",
    "type": "exact_name"
  },
  {
    "canonical": "leg_extension",
    "app": "csv-leg-extension",
    "type": "exact_name"
  },
  {
    "canonical": "leg_press",
    "app": "csv-leg-press",
    "type": "exact_name"
  },
  {
    "canonical": "low_to_high_cable_fly",
    "app": "csv-incline-chest-fly",
    "type": "reviewed_alias"
  },
  {
    "canonical": "machine_chest_press",
    "app": "csv-chest-press-machine",
    "type": "reviewed_alias"
  },
  {
    "canonical": "machine_shoulder_press",
    "app": "csv-shoulder-press-machine",
    "type": "reviewed_alias"
  },
  {
    "canonical": "neutral_grip_pulldown",
    "app": "csv-neutral-grip-pulldowns",
    "type": "reviewed_alias"
  },
  {
    "canonical": "nordic_curl",
    "app": "csv-nordic-curl",
    "type": "exact_name"
  },
  {
    "canonical": "one_arm_dumbbell_row",
    "app": "csv-single-arm-row-dumbbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "overhead_press",
    "app": "csv-overhead-press-barbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "overhead_triceps_extension",
    "app": "csv-overhead-tricep-extension-cable",
    "type": "reviewed_alias"
  },
  {
    "canonical": "pallof_press",
    "app": "forge-pallof-press",
    "type": "reviewed_entry"
  },
  {
    "canonical": "paused_bench_press",
    "app": "csv-bench-press-paused",
    "type": "reviewed_alias"
  },
  {
    "canonical": "pike_push_up",
    "app": "forge-pike-push-up",
    "type": "reviewed_entry"
  },
  {
    "canonical": "plank",
    "app": "csv-plank",
    "type": "exact_name"
  },
  {
    "canonical": "pull_up",
    "app": "csv-pull-up-bodyweight",
    "type": "reviewed_alias"
  },
  {
    "canonical": "push_up",
    "app": "csv-push-up",
    "type": "exact_name"
  },
  {
    "canonical": "reverse_lunge",
    "app": "csv-reverse-lunge-dumbbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "reverse_pec_deck",
    "app": "csv-reverse-pec-deck",
    "type": "exact_name"
  },
  {
    "canonical": "romanian_deadlift",
    "app": "csv-romanian-deadlift-barbell",
    "type": "reviewed_alias"
  },
  {
    "canonical": "seated_cable_row",
    "app": "csv-seated-row-cable",
    "type": "reviewed_alias"
  },
  {
    "canonical": "seated_calf_raise",
    "app": "csv-seated-calf-raise",
    "type": "exact_name"
  },
  {
    "canonical": "single_leg_glute_bridge",
    "app": "forge-single-leg-glute-bridge",
    "type": "reviewed_entry"
  },
  {
    "canonical": "skull_crusher",
    "app": "csv-skull-crusher",
    "type": "exact_name"
  },
  {
    "canonical": "split_squat",
    "app": "csv-lunge-bodyweight",
    "type": "reviewed_alias"
  },
  {
    "canonical": "standing_calf_raise",
    "app": "csv-standing-calf-raise",
    "type": "exact_name"
  },
  {
    "canonical": "step_up",
    "app": "forge-step-up",
    "type": "reviewed_entry"
  },
  {
    "canonical": "straight_arm_pulldown",
    "app": "csv-standing-pullover-cable",
    "type": "reviewed_alias"
  },
  {
    "canonical": "trap_bar_deadlift",
    "app": "csv-trap-bar-deadlift",
    "type": "exact_name"
  },
  {
    "canonical": "triceps_pushdown",
    "app": "csv-tricep-pushdown-cable",
    "type": "reviewed_alias"
  },
  {
    "canonical": "weighted_dip",
    "app": "csv-dip-weighted",
    "type": "reviewed_alias"
  }
] as const;

export const FORGE_EXERCISE_MAPPING_GAPS = [] as const;
