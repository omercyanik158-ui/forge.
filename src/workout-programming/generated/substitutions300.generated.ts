import type { ForgeExerciseSubstitution } from '../types/csvWorkoutBrain';

export const FORGE_EXERCISE_SUBSTITUTIONS_300 = [
  {
    "sourceExerciseId": "back_squat",
    "alternativeExerciseId": "front_squat",
    "sourceAppExerciseId": "csv-squat-barbell",
    "alternativeAppExerciseId": "csv-front-squat-barbell",
    "movementPattern": "squat",
    "alternativeEquipment": [
      "barbell",
      "rack"
    ],
    "reason": "quad emphasis",
    "constraint": "Kısıt yoksa",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "back_squat",
    "alternativeExerciseId": "hack_squat",
    "sourceAppExerciseId": "csv-squat-barbell",
    "alternativeAppExerciseId": "csv-hack-squat",
    "movementPattern": "squat",
    "alternativeEquipment": [
      "machine"
    ],
    "reason": "lower skill / less axial load",
    "constraint": "Tam spor salonu",
    "preserveRole": true,
    "deterministicRank": 2
  },
  {
    "sourceExerciseId": "back_squat",
    "alternativeExerciseId": "leg_press",
    "sourceAppExerciseId": "csv-squat-barbell",
    "alternativeAppExerciseId": "csv-leg-press",
    "movementPattern": "squat",
    "alternativeEquipment": [
      "machine"
    ],
    "reason": "lower back friendly",
    "constraint": "Ana lift zorunlu değilse",
    "preserveRole": true,
    "deterministicRank": 3
  },
  {
    "sourceExerciseId": "back_squat",
    "alternativeExerciseId": "goblet_squat",
    "sourceAppExerciseId": "csv-squat-barbell",
    "alternativeAppExerciseId": "csv-goblet-squat",
    "movementPattern": "squat",
    "alternativeEquipment": [
      "dumbbell"
    ],
    "reason": "beginner/home fallback",
    "constraint": "Yük kapasitesi sınırlı",
    "preserveRole": true,
    "deterministicRank": 4
  },
  {
    "sourceExerciseId": "conventional_deadlift",
    "alternativeExerciseId": "trap_bar_deadlift",
    "sourceAppExerciseId": "csv-deadlift-barbell",
    "alternativeAppExerciseId": "csv-trap-bar-deadlift",
    "movementPattern": "hinge",
    "alternativeEquipment": [
      "trap_bar"
    ],
    "reason": "more quad / often simpler",
    "constraint": "Trap bar varsa",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "conventional_deadlift",
    "alternativeExerciseId": "romanian_deadlift",
    "sourceAppExerciseId": "csv-deadlift-barbell",
    "alternativeAppExerciseId": "csv-romanian-deadlift-barbell",
    "movementPattern": "hinge",
    "alternativeEquipment": [
      "barbell"
    ],
    "reason": "less floor-pull specificity",
    "constraint": "Strength ana lift zorunlu değilse",
    "preserveRole": true,
    "deterministicRank": 2
  },
  {
    "sourceExerciseId": "romanian_deadlift",
    "alternativeExerciseId": "dumbbell_rdl",
    "sourceAppExerciseId": "csv-romanian-deadlift-barbell",
    "alternativeAppExerciseId": "csv-romanian-deadlift-dumbbell",
    "movementPattern": "hinge",
    "alternativeEquipment": [
      "dumbbell"
    ],
    "reason": "equipment fallback",
    "constraint": "Dambıl varsa",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "bench_press",
    "alternativeExerciseId": "dumbbell_bench_press",
    "sourceAppExerciseId": "csv-bench-press-barbell",
    "alternativeAppExerciseId": "csv-bench-press-dumbbell",
    "movementPattern": "horizontal_push",
    "alternativeEquipment": [
      "dumbbell",
      "bench"
    ],
    "reason": "more freedom",
    "constraint": "Ana lift zorunlu değilse",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "bench_press",
    "alternativeExerciseId": "machine_chest_press",
    "sourceAppExerciseId": "csv-bench-press-barbell",
    "alternativeAppExerciseId": "csv-chest-press-machine",
    "movementPattern": "horizontal_push",
    "alternativeEquipment": [
      "machine"
    ],
    "reason": "stability / beginner",
    "constraint": "Ana lift zorunlu değilse",
    "preserveRole": true,
    "deterministicRank": 2
  },
  {
    "sourceExerciseId": "incline_barbell_press",
    "alternativeExerciseId": "incline_dumbbell_press",
    "sourceAppExerciseId": "csv-incline-bench-press-barbell",
    "alternativeAppExerciseId": "csv-incline-bench-press-dumbbell",
    "movementPattern": "incline_push",
    "alternativeEquipment": [
      "dumbbell",
      "incline_bench"
    ],
    "reason": "equipment/comfort",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "overhead_press",
    "alternativeExerciseId": "dumbbell_shoulder_press",
    "sourceAppExerciseId": "csv-overhead-press-barbell",
    "alternativeAppExerciseId": "csv-shoulder-press-dumbbell",
    "movementPattern": "vertical_push",
    "alternativeEquipment": [
      "dumbbell",
      "bench"
    ],
    "reason": "equipment/comfort",
    "constraint": "Ana lift zorunlu değilse",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "overhead_press",
    "alternativeExerciseId": "machine_shoulder_press",
    "sourceAppExerciseId": "csv-overhead-press-barbell",
    "alternativeAppExerciseId": "csv-shoulder-press-machine",
    "movementPattern": "vertical_push",
    "alternativeEquipment": [
      "machine"
    ],
    "reason": "stability",
    "constraint": "Ana lift zorunlu değilse",
    "preserveRole": true,
    "deterministicRank": 2
  },
  {
    "sourceExerciseId": "barbell_row",
    "alternativeExerciseId": "chest_supported_row",
    "sourceAppExerciseId": "csv-barbell-row",
    "alternativeAppExerciseId": "csv-chest-supported-row-dumbbell",
    "movementPattern": "horizontal_pull",
    "alternativeEquipment": [
      "machine_or_dumbbell"
    ],
    "reason": "reduce lower-back fatigue",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "barbell_row",
    "alternativeExerciseId": "seated_cable_row",
    "sourceAppExerciseId": "csv-barbell-row",
    "alternativeAppExerciseId": "csv-seated-row-cable",
    "movementPattern": "horizontal_pull",
    "alternativeEquipment": [
      "cable"
    ],
    "reason": "stable alternative",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 2
  },
  {
    "sourceExerciseId": "pull_up",
    "alternativeExerciseId": "assisted_pull_up",
    "sourceAppExerciseId": "csv-pull-up-bodyweight",
    "alternativeAppExerciseId": "csv-pull-up-assisted",
    "movementPattern": "vertical_pull",
    "alternativeEquipment": [
      "assisted_machine"
    ],
    "reason": "strength regression",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "pull_up",
    "alternativeExerciseId": "lat_pulldown",
    "sourceAppExerciseId": "csv-pull-up-bodyweight",
    "alternativeAppExerciseId": "csv-lat-pulldown",
    "movementPattern": "vertical_pull",
    "alternativeEquipment": [
      "cable"
    ],
    "reason": "load control",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 2
  },
  {
    "sourceExerciseId": "lat_pulldown",
    "alternativeExerciseId": "band_pulldown",
    "sourceAppExerciseId": "csv-lat-pulldown",
    "alternativeAppExerciseId": "forge-band-pulldown",
    "movementPattern": "vertical_pull",
    "alternativeEquipment": [
      "resistance_band"
    ],
    "reason": "home fallback",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "seated_cable_row",
    "alternativeExerciseId": "band_row",
    "sourceAppExerciseId": "csv-seated-row-cable",
    "alternativeAppExerciseId": "forge-band-row",
    "movementPattern": "horizontal_pull",
    "alternativeEquipment": [
      "resistance_band"
    ],
    "reason": "home fallback",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "bulgarian_split_squat",
    "alternativeExerciseId": "reverse_lunge",
    "sourceAppExerciseId": "csv-bulgarian-split-squat-dumbbell",
    "alternativeAppExerciseId": "csv-reverse-lunge-dumbbell",
    "movementPattern": "lunge",
    "alternativeEquipment": [
      "dumbbell"
    ],
    "reason": "balance/comfort",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "leg_curl",
    "alternativeExerciseId": "nordic_curl",
    "sourceAppExerciseId": "csv-leg-curl",
    "alternativeAppExerciseId": "csv-nordic-curl",
    "movementPattern": "knee_flexion",
    "alternativeEquipment": [
      "bodyweight"
    ],
    "reason": "home/high difficulty",
    "constraint": "Regresyon gerekebilir",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "lateral_raise",
    "alternativeExerciseId": "cable_lateral_raise",
    "sourceAppExerciseId": "csv-lateral-raise-dumbbell",
    "alternativeAppExerciseId": "csv-lateral-raise-cable",
    "movementPattern": "shoulder_abduction",
    "alternativeEquipment": [
      "cable"
    ],
    "reason": "constant tension",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "reverse_pec_deck",
    "alternativeExerciseId": "face_pull",
    "sourceAppExerciseId": "csv-reverse-pec-deck",
    "alternativeAppExerciseId": "csv-face-pull",
    "movementPattern": "horizontal_abduction",
    "alternativeEquipment": [
      "cable"
    ],
    "reason": "equipment fallback",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "barbell_curl",
    "alternativeExerciseId": "cable_curl",
    "sourceAppExerciseId": "csv-bicep-curl-barbell",
    "alternativeAppExerciseId": "csv-bicep-curl-cable",
    "movementPattern": "elbow_flexion",
    "alternativeEquipment": [
      "cable"
    ],
    "reason": "joint comfort",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "incline_dumbbell_curl",
    "alternativeExerciseId": "hammer_curl",
    "sourceAppExerciseId": "csv-incline-curl-dumbbell",
    "alternativeAppExerciseId": "csv-hammer-curl",
    "movementPattern": "elbow_flexion",
    "alternativeEquipment": [
      "dumbbell"
    ],
    "reason": "neutral grip",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "triceps_pushdown",
    "alternativeExerciseId": "overhead_triceps_extension",
    "sourceAppExerciseId": "csv-tricep-pushdown-cable",
    "alternativeAppExerciseId": "csv-overhead-tricep-extension-cable",
    "movementPattern": "elbow_extension",
    "alternativeEquipment": [
      "cable_or_dumbbell"
    ],
    "reason": "long-head bias",
    "constraint": "Dirsek toleransı",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "plank",
    "alternativeExerciseId": "dead_bug",
    "sourceAppExerciseId": "csv-plank",
    "alternativeAppExerciseId": "forge-dead-bug",
    "movementPattern": "anti_extension",
    "alternativeEquipment": [
      "bodyweight"
    ],
    "reason": "beginner regression",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  },
  {
    "sourceExerciseId": "ab_wheel",
    "alternativeExerciseId": "plank",
    "sourceAppExerciseId": "csv-ab-wheel",
    "alternativeAppExerciseId": "csv-plank",
    "movementPattern": "anti_extension",
    "alternativeEquipment": [
      "bodyweight"
    ],
    "reason": "regression",
    "constraint": "",
    "preserveRole": true,
    "deterministicRank": 1
  }
] as const satisfies readonly ForgeExerciseSubstitution[];
