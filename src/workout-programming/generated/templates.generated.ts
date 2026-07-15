import type { ForgeGeneratedTemplate } from '../types/csvWorkoutBrain';

export const FORGE_PROGRAM_TEMPLATES = [
  {
    "templateId": "forge_strength_fullbody_beginner_3d_v1",
    "version": 2,
    "status": "active",
    "nameTr": "Temel Güç 3 Gün",
    "goal": "strength",
    "level": "beginner",
    "split": "full_body",
    "daysPerWeek": 3,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 45,
      "target": 60,
      "max": 75
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "linear_beginner",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "quads",
      "hamstrings",
      "glutes"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Başlangıç seviyesinde temel kaldırış tekniği ve lineer güç gelişimi.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Full Body A",
        "focus": [
          "Squat + Bench"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 5,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 2,
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
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 5,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 3.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dead_bug",
            "exerciseId": "forge-dead-bug",
            "exerciseName": "Dead Bug",
            "order": 6,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Full Body B",
        "focus": [
          "Hinge + Press"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "conventional_deadlift",
            "exerciseId": "csv-deadlift-barbell",
            "exerciseName": "Conventional Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings",
              "back"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "main_lift",
            "sets": 2,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 3.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 2,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 6,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "goblet_squat",
            "exerciseId": "csv-goblet-squat",
            "exerciseName": "Goblet Squat",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 4,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 5,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "plank",
            "exerciseId": "csv-plank",
            "exerciseName": "Plank",
            "order": 6,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 30,
            "repsMax": 45,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": "reps_min/reps_max saniye"
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Full Body C",
        "focus": [
          "Squat + Bench Varyasyonu"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 5,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "paused_bench_press",
            "exerciseId": "csv-bench-press-paused",
            "exerciseName": "Paused Bench Press",
            "order": 2,
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
            "role": "main_lift",
            "sets": 3,
            "repsMin": 4,
            "repsMax": 6,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 4,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 5,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": "Replaced triceps isolation to restore posterior-chain exposure on full-body day."
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 6,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_strength_upper_lower_beginner_4d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Dengeli Güç 4 Gün",
    "goal": "strength",
    "level": "beginner",
    "split": "upper_lower",
    "daysPerWeek": 4,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 45,
      "target": 60,
      "max": 75
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "linear_beginner",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "quads",
      "hamstrings",
      "glutes"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Dört güne yayılan başlangıç upper/lower güç programı.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Upper A",
        "focus": [
          "Bench Öncelikli"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 5,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 2,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Lower A",
        "focus": [
          "Squat Öncelikli"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 5,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Upper B",
        "focus": [
          "Press + Çekiş"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 1,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 5,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "close_grip_bench",
            "exerciseId": "csv-bench-press-close-grip",
            "exerciseName": "Close-Grip Bench Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Lower B",
        "focus": [
          "Deadlift Öncelikli"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "conventional_deadlift",
            "exerciseId": "csv-deadlift-barbell",
            "exerciseName": "Conventional Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings",
              "back"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "main_lift",
            "sets": 2,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 3.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "front_squat",
            "exerciseId": "csv-front-squat-barbell",
            "exerciseName": "Front Squat",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 7,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "plank",
            "exerciseId": "csv-plank",
            "exerciseName": "Plank",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 30,
            "repsMax": 45,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": "saniye"
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_strength_fullbody_intermediate_3d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Orta Seviye Güç 3 Gün",
    "goal": "strength",
    "level": "intermediate",
    "split": "full_body",
    "daysPerWeek": 3,
    "durationWeeks": 10,
    "sessionMinutes": {
      "min": 60,
      "target": 75,
      "max": 90
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "undulating_strength",
    "compatibleFocusMuscles": [
      "chest",
      "lats",
      "upper_back",
      "quads",
      "hamstrings",
      "glutes"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Ağır, orta ve teknik maruziyetleri dalgalandıran üç günlük güç planı.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Heavy",
        "focus": [
          "Ağır Squat + Bench"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 4,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 2,
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
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 2.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "ab_wheel",
            "exerciseId": "csv-ab-wheel",
            "exerciseName": "Ab Wheel Rollout",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "ab_wheel"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Medium",
        "focus": [
          "Deadlift + OHP"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "conventional_deadlift",
            "exerciseId": "csv-deadlift-barbell",
            "exerciseName": "Conventional Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings",
              "back"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 3,
            "repsMax": 4,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 2,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 4,
            "repsMax": 6,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "front_squat",
            "exerciseId": "csv-front-squat-barbell",
            "exerciseName": "Front Squat",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 7,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "face_pull",
            "exerciseId": "csv-face-pull",
            "exerciseName": "Face Pull",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Volume/Technique",
        "focus": [
          "Teknik ve Hacim"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "paused_bench_press",
            "exerciseId": "csv-bench-press-paused",
            "exerciseName": "Paused Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 6,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 6,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 3,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 4,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 6,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_strength_upper_lower_intermediate_4d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Güç Upper/Lower 4 Gün",
    "goal": "strength",
    "level": "intermediate",
    "split": "upper_lower",
    "daysPerWeek": 4,
    "durationWeeks": 10,
    "sessionMinutes": {
      "min": 60,
      "target": 75,
      "max": 90
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "top_set_backoff",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "quads",
      "hamstrings",
      "glutes"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Ana liftlerde üst set ve back-off kullanan orta seviye program.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Upper Strength A",
        "focus": [
          "Bench"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 6,
            "targetRir": 2.0,
            "restSeconds": 210,
            "required": true,
            "notes": "İlk set üst set, kalanlar back-off"
          },
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 7,
            "targetRir": 3.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Lower Strength A",
        "focus": [
          "Squat"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 6,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": "İlk set üst set, kalanlar back-off"
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Upper Strength B",
        "focus": [
          "OHP + Bench Hacim"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 1,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 6,
            "targetRir": 2.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "paused_bench_press",
            "exerciseId": "csv-bench-press-paused",
            "exerciseName": "Paused Bench Press",
            "order": 2,
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
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 7,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Lower Strength B",
        "focus": [
          "Deadlift"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "conventional_deadlift",
            "exerciseId": "csv-deadlift-barbell",
            "exerciseName": "Conventional Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings",
              "back"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 2,
            "repsMax": 5,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "front_squat",
            "exerciseId": "csv-front-squat-barbell",
            "exerciseName": "Front Squat",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 4,
            "repsMax": 7,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pallof_press",
            "exerciseId": "forge-pallof-press",
            "exerciseName": "Pallof Press",
            "order": 5,
            "movementPattern": "anti_rotation",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "cable_or_band"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_strength_intermediate_5d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Yoğun Güç 5 Gün",
    "goal": "strength",
    "level": "intermediate",
    "split": "strength_split",
    "daysPerWeek": 5,
    "durationWeeks": 10,
    "sessionMinutes": {
      "min": 55,
      "target": 70,
      "max": 85
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "undulating_strength",
    "compatibleFocusMuscles": [
      "chest",
      "lats",
      "upper_back",
      "quads",
      "hamstrings",
      "glutes",
      "triceps"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Daha sık teknik maruziyet isteyen orta seviye kullanıcılar için.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Squat Heavy",
        "focus": [
          "Ağır Squat"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 5,
            "repsMin": 2,
            "repsMax": 4,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "ab_wheel",
            "exerciseId": "csv-ab-wheel",
            "exerciseName": "Ab Wheel Rollout",
            "order": 4,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "ab_wheel"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Bench Heavy",
        "focus": [
          "Ağır Bench"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 5,
            "repsMin": 2,
            "repsMax": 4,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "close_grip_bench",
            "exerciseId": "csv-bench-press-close-grip",
            "exerciseName": "Close-Grip Bench Press",
            "order": 3,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "face_pull",
            "exerciseId": "csv-face-pull",
            "exerciseName": "Face Pull",
            "order": 4,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Deadlift",
        "focus": [
          "Deadlift"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "conventional_deadlift",
            "exerciseId": "csv-deadlift-barbell",
            "exerciseName": "Conventional Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings",
              "back"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 2,
            "repsMax": 4,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "front_squat",
            "exerciseId": "csv-front-squat-barbell",
            "exerciseName": "Front Squat",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 7,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Press",
        "focus": [
          "OHP + Üst Gövde"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 1,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 2.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "paused_bench_press",
            "exerciseId": "csv-bench-press-paused",
            "exerciseName": "Paused Bench Press",
            "order": 2,
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
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 6,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 5,
        "name": "Technique",
        "focus": [
          "Teknik Hacim"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 6,
            "targetRir": 4.0,
            "restSeconds": 150,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 2,
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
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 6,
            "targetRir": 4.0,
            "restSeconds": 150,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 4,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 5,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_strength_advanced_4d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "İleri Güç 4 Gün",
    "goal": "strength",
    "level": "advanced",
    "split": "upper_lower",
    "daysPerWeek": 4,
    "durationWeeks": 12,
    "sessionMinutes": {
      "min": 75,
      "target": 90,
      "max": 105
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "top_set_backoff",
    "compatibleFocusMuscles": [
      "chest",
      "lats",
      "upper_back",
      "quads",
      "hamstrings",
      "glutes"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 3,
    "maxFocusMuscles": 2,
    "descriptionTr": "İleri seviye için yüksek özgüllük ve kontrollü aksesuar hacmi.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Squat + Bench",
        "focus": [
          "Competition Focus"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 5,
            "repsMin": 2,
            "repsMax": 5,
            "targetRir": 1.0,
            "restSeconds": 300,
            "required": true,
            "notes": "Top set + back-off"
          },
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 2,
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
            "role": "main_lift",
            "sets": 5,
            "repsMin": 2,
            "repsMax": 5,
            "targetRir": 1.0,
            "restSeconds": 240,
            "required": true,
            "notes": "Top set + back-off"
          },
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "ab_wheel",
            "exerciseId": "csv-ab-wheel",
            "exerciseName": "Ab Wheel Rollout",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "ab_wheel"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Deadlift + Press",
        "focus": [
          "Heavy Hinge"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "conventional_deadlift",
            "exerciseId": "csv-deadlift-barbell",
            "exerciseName": "Conventional Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings",
              "back"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 2,
            "repsMax": 4,
            "targetRir": 1.0,
            "restSeconds": 300,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 2,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 6,
            "targetRir": 2.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "front_squat",
            "exerciseId": "csv-front-squat-barbell",
            "exerciseName": "Front Squat",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 4,
            "repsMax": 6,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "face_pull",
            "exerciseId": "csv-face-pull",
            "exerciseName": "Face Pull",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Bench Volume",
        "focus": [
          "Bench Volume"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "paused_bench_press",
            "exerciseId": "csv-bench-press-paused",
            "exerciseName": "Paused Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 5,
            "repsMin": 4,
            "repsMax": 6,
            "targetRir": 2.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "close_grip_bench",
            "exerciseId": "csv-bench-press-close-grip",
            "exerciseName": "Close-Grip Bench Press",
            "order": 3,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Lower Volume",
        "focus": [
          "Squat/Hinge Volume"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 4,
            "repsMax": 6,
            "targetRir": 2.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_hypertrophy_fullbody_beginner_3d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Kas Gelişimi Full Body 3 Gün",
    "goal": "hypertrophy",
    "level": "beginner",
    "split": "full_body",
    "daysPerWeek": 3,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 45,
      "target": 60,
      "max": 75
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes",
      "calves"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Üç güne dengeli dağıtılmış full-body hipertrofi programı.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Full Body A",
        "focus": [
          "Quad + Chest"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "hack_squat",
            "exerciseId": "csv-hack-squat",
            "exerciseName": "Hack Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Full Body B",
        "focus": [
          "Hinge + Back"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 2,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 3,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 4,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_curl",
            "exerciseId": "csv-incline-curl-dumbbell",
            "exerciseName": "Incline Dumbbell Curl",
            "order": 6,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "incline_bench"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Full Body C",
        "focus": [
          "Balanced"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_bench_press",
            "exerciseId": "csv-bench-press-dumbbell",
            "exerciseName": "Dumbbell Bench Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "cable_lateral_raise",
            "exerciseId": "csv-lateral-raise-cable",
            "exerciseName": "Cable Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_triceps_extension",
            "exerciseId": "csv-overhead-tricep-extension-cable",
            "exerciseName": "Overhead Triceps Extension",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable_or_dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 7,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_hypertrophy_fullbody_intermediate_3d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Yoğun Full Body Hipertrofi 3 Gün",
    "goal": "hypertrophy",
    "level": "intermediate",
    "split": "full_body",
    "daysPerWeek": 3,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 55,
      "target": 70,
      "max": 85
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes",
      "calves"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Üç güne dengeli dağıtılmış full-body hipertrofi programı.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Full Body A",
        "focus": [
          "Quad + Chest"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "hack_squat",
            "exerciseId": "csv-hack-squat",
            "exerciseName": "Hack Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Full Body B",
        "focus": [
          "Hinge + Back"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 2,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 3,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 4,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_curl",
            "exerciseId": "csv-incline-curl-dumbbell",
            "exerciseName": "Incline Dumbbell Curl",
            "order": 6,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "incline_bench"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Full Body C",
        "focus": [
          "Balanced"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_bench_press",
            "exerciseId": "csv-bench-press-dumbbell",
            "exerciseName": "Dumbbell Bench Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "cable_lateral_raise",
            "exerciseId": "csv-lateral-raise-cable",
            "exerciseName": "Cable Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_triceps_extension",
            "exerciseId": "csv-overhead-tricep-extension-cable",
            "exerciseName": "Overhead Triceps Extension",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable_or_dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 7,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_hypertrophy_upper_lower_beginner_4d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Hipertrofi Upper/Lower Başlangıç",
    "goal": "hypertrophy",
    "level": "beginner",
    "split": "upper_lower",
    "daysPerWeek": 4,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 45,
      "target": 60,
      "max": 75
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes",
      "calves"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Öğrenmesi kolay dört günlük kas gelişimi programı.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Upper A",
        "focus": [
          "Göğüs + Sırt"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "dumbbell_bench_press",
            "exerciseId": "csv-bench-press-dumbbell",
            "exerciseName": "Dumbbell Bench Press",
            "order": 1,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 2,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_shoulder_press",
            "exerciseId": "csv-shoulder-press-machine",
            "exerciseName": "Machine Shoulder Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 4,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "cable_curl",
            "exerciseId": "csv-bicep-curl-cable",
            "exerciseName": "Cable Curl",
            "order": 7,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Lower A",
        "focus": [
          "Quad"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_extension",
            "exerciseId": "csv-leg-extension",
            "exerciseName": "Leg Extension",
            "order": 3,
            "movementPattern": "knee_extension",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Upper B",
        "focus": [
          "Üst Göğüs + Üst Sırt"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "neutral_grip_pulldown",
            "exerciseId": "csv-neutral-grip-pulldowns",
            "exerciseName": "Neutral-Grip Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 4,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_triceps_extension",
            "exerciseId": "csv-overhead-tricep-extension-cable",
            "exerciseName": "Overhead Triceps Extension",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable_or_dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 7,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Lower B",
        "focus": [
          "Posterior Chain"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "hack_squat",
            "exerciseId": "csv-hack-squat",
            "exerciseName": "Hack Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_calf_raise",
            "exerciseId": "csv-seated-calf-raise",
            "exerciseName": "Seated Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_hypertrophy_upper_lower_intermediate_4d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Kas Gelişimi Upper/Lower 4 Gün",
    "goal": "hypertrophy",
    "level": "intermediate",
    "split": "upper_lower",
    "daysPerWeek": 4,
    "durationWeeks": 10,
    "sessionMinutes": {
      "min": 60,
      "target": 75,
      "max": 90
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes",
      "calves"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Orta seviye için dengeli hacim ve iki maruziyet.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Upper A",
        "focus": [
          "Göğüs Öncelikli"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_barbell_press",
            "exerciseId": "csv-incline-bench-press-barbell",
            "exerciseName": "Incline Barbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_bench_press",
            "exerciseId": "csv-bench-press-dumbbell",
            "exerciseName": "Dumbbell Bench Press",
            "order": 3,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_curl",
            "exerciseId": "csv-incline-curl-dumbbell",
            "exerciseName": "Incline Dumbbell Curl",
            "order": 7,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "incline_bench"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Lower A",
        "focus": [
          "Quad Öncelikli"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_extension",
            "exerciseId": "csv-leg-extension",
            "exerciseName": "Leg Extension",
            "order": 4,
            "movementPattern": "knee_extension",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 5,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 6,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Upper B",
        "focus": [
          "Sırt + Omuz"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 1,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 4,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_triceps_extension",
            "exerciseId": "csv-overhead-tricep-extension-cable",
            "exerciseName": "Overhead Triceps Extension",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable_or_dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 7,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Lower B",
        "focus": [
          "Glute/Hamstring"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "hack_squat",
            "exerciseId": "csv-hack-squat",
            "exerciseName": "Hack Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_calf_raise",
            "exerciseId": "csv-seated-calf-raise",
            "exerciseName": "Seated Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hanging_leg_raise",
            "exerciseId": "csv-hanging-leg-raise",
            "exerciseName": "Hanging Leg Raise",
            "order": 6,
            "movementPattern": "hip_flexion",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_hypertrophy_intermediate_5d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Yoğun Hipertrofi 5 Gün",
    "goal": "hypertrophy",
    "level": "intermediate",
    "split": "body_part",
    "daysPerWeek": 5,
    "durationWeeks": 10,
    "sessionMinutes": {
      "min": 55,
      "target": 70,
      "max": 85
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes",
      "calves"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Beş güne yayılmış, kas gruplarını haftada birden fazla uyaran hipertrofi planı.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Upper Chest + Back",
        "focus": [
          "Üst Göğüs"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_barbell_press",
            "exerciseId": "csv-incline-bench-press-barbell",
            "exerciseName": "Incline Barbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 3,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "low_to_high_cable_fly",
            "exerciseId": "csv-incline-chest-fly",
            "exerciseName": "Low-to-High Cable Fly",
            "order": 5,
            "movementPattern": "chest_adduction",
            "primaryMuscles": [
              "upper_chest"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "face_pull",
            "exerciseId": "csv-face-pull",
            "exerciseName": "Face Pull",
            "order": 6,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Lower Quad",
        "focus": [
          "Quads"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_extension",
            "exerciseId": "csv-leg-extension",
            "exerciseName": "Leg Extension",
            "order": 4,
            "movementPattern": "knee_extension",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Shoulders + Arms",
        "focus": [
          "Delts/Arms"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 1,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 2,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 3,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_curl",
            "exerciseId": "csv-bicep-curl-barbell",
            "exerciseName": "Barbell Curl",
            "order": 4,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_curl",
            "exerciseId": "csv-incline-curl-dumbbell",
            "exerciseName": "Incline Dumbbell Curl",
            "order": 5,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "incline_bench"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_triceps_extension",
            "exerciseId": "csv-overhead-tricep-extension-cable",
            "exerciseName": "Overhead Triceps Extension",
            "order": 7,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable_or_dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Back + Chest",
        "focus": [
          "Sırt Öncelikli"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 1,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_bench_press",
            "exerciseId": "csv-bench-press-dumbbell",
            "exerciseName": "Dumbbell Bench Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 4,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "straight_arm_pulldown",
            "exerciseId": "csv-standing-pullover-cable",
            "exerciseName": "Straight-Arm Pulldown",
            "order": 5,
            "movementPattern": "shoulder_extension",
            "primaryMuscles": [
              "lats"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "cable_fly",
            "exerciseId": "csv-chest-fly-cable",
            "exerciseName": "Cable Fly",
            "order": 6,
            "movementPattern": "chest_adduction",
            "primaryMuscles": [
              "chest"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 5,
        "name": "Lower Posterior",
        "focus": [
          "Hamstring/Glute"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hack_squat",
            "exerciseId": "csv-hack-squat",
            "exerciseName": "Hack Squat",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 3,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_calf_raise",
            "exerciseId": "csv-seated-calf-raise",
            "exerciseName": "Seated Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "ab_wheel",
            "exerciseId": "csv-ab-wheel",
            "exerciseName": "Ab Wheel Rollout",
            "order": 6,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "ab_wheel"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_hypertrophy_bodypart_intermediate_5d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Klasik Hipertrofi 5 Gün",
    "goal": "hypertrophy",
    "level": "intermediate",
    "split": "body_part",
    "daysPerWeek": 5,
    "durationWeeks": 10,
    "sessionMinutes": {
      "min": 55,
      "target": 70,
      "max": 85
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes",
      "calves"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Klasik bölgesel görünümde, ancak ikincil maruziyetlerle dengelenmiş program.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Chest + Triceps",
        "focus": [
          "Göğüs"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 3,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "cable_fly",
            "exerciseId": "csv-chest-fly-cable",
            "exerciseName": "Cable Fly",
            "order": 4,
            "movementPattern": "chest_adduction",
            "primaryMuscles": [
              "chest"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_triceps_extension",
            "exerciseId": "csv-overhead-tricep-extension-cable",
            "exerciseName": "Overhead Triceps Extension",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable_or_dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Back + Biceps",
        "focus": [
          "Sırt"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 1,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 4,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_curl",
            "exerciseId": "csv-bicep-curl-barbell",
            "exerciseName": "Barbell Curl",
            "order": 5,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 6,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Legs",
        "focus": [
          "Bacak"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_extension",
            "exerciseId": "csv-leg-extension",
            "exerciseName": "Leg Extension",
            "order": 5,
            "movementPattern": "knee_extension",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 6,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Shoulders + Arms",
        "focus": [
          "Omuz"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 1,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 2,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 3,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_curl",
            "exerciseId": "csv-incline-curl-dumbbell",
            "exerciseName": "Incline Dumbbell Curl",
            "order": 4,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "incline_bench"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "skull_crusher",
            "exerciseId": "csv-skull-crusher",
            "exerciseName": "Skull Crusher",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "ez_bar",
              "bench"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 5,
        "name": "Upper Pump",
        "focus": [
          "İkincil Üst Vücut"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_barbell_press",
            "exerciseId": "csv-incline-bench-press-barbell",
            "exerciseName": "Incline Barbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "neutral_grip_pulldown",
            "exerciseId": "csv-neutral-grip-pulldowns",
            "exerciseName": "Neutral-Grip Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "low_to_high_cable_fly",
            "exerciseId": "csv-incline-chest-fly",
            "exerciseName": "Low-to-High Cable Fly",
            "order": 4,
            "movementPattern": "chest_adduction",
            "primaryMuscles": [
              "upper_chest"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "cable_lateral_raise",
            "exerciseId": "csv-lateral-raise-cable",
            "exerciseName": "Cable Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "cable_curl",
            "exerciseId": "csv-bicep-curl-cable",
            "exerciseName": "Cable Curl",
            "order": 7,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_hypertrophy_ppl_intermediate_6d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Push Pull Legs 6 Gün",
    "goal": "hypertrophy",
    "level": "intermediate",
    "split": "push_pull_legs",
    "daysPerWeek": 6,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 50,
      "target": 65,
      "max": 80
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes",
      "calves"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 3,
    "maxFocusMuscles": 2,
    "descriptionTr": "Orta seviye, yüksek frekanslı PPL; toparlanması iyi kullanıcılar için.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Push A",
        "focus": [
          "Göğüs"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Pull A",
        "focus": [
          "Lats"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 1,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 4,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_curl",
            "exerciseId": "csv-incline-curl-dumbbell",
            "exerciseName": "Incline Dumbbell Curl",
            "order": 5,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "incline_bench"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Legs A",
        "focus": [
          "Quad"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 3,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_extension",
            "exerciseId": "csv-leg-extension",
            "exerciseName": "Leg Extension",
            "order": 4,
            "movementPattern": "knee_extension",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Push B",
        "focus": [
          "Üst Göğüs/Omuz"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_barbell_press",
            "exerciseId": "csv-incline-bench-press-barbell",
            "exerciseName": "Incline Barbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_shoulder_press",
            "exerciseId": "csv-shoulder-press-machine",
            "exerciseName": "Machine Shoulder Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "cable_lateral_raise",
            "exerciseId": "csv-lateral-raise-cable",
            "exerciseName": "Cable Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_triceps_extension",
            "exerciseId": "csv-overhead-tricep-extension-cable",
            "exerciseName": "Overhead Triceps Extension",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable_or_dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 5,
        "name": "Pull B",
        "focus": [
          "Upper Back"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 1,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "neutral_grip_pulldown",
            "exerciseId": "csv-neutral-grip-pulldowns",
            "exerciseName": "Neutral-Grip Pulldown",
            "order": 2,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "face_pull",
            "exerciseId": "csv-face-pull",
            "exerciseName": "Face Pull",
            "order": 4,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 5,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 6,
        "name": "Legs B",
        "focus": [
          "Posterior"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "hack_squat",
            "exerciseId": "csv-hack-squat",
            "exerciseName": "Hack Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_calf_raise",
            "exerciseId": "csv-seated-calf-raise",
            "exerciseName": "Seated Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_hypertrophy_upper_lower_advanced_4d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "İleri Hipertrofi Upper/Lower",
    "goal": "hypertrophy",
    "level": "advanced",
    "split": "upper_lower",
    "daysPerWeek": 4,
    "durationWeeks": 10,
    "sessionMinutes": {
      "min": 70,
      "target": 85,
      "max": 100
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes",
      "calves"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 3,
    "maxFocusMuscles": 2,
    "descriptionTr": "İleri seviye için daha yüksek ama kontrollü hacimli upper/lower.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Upper A",
        "focus": [
          "Göğüs Öncelikli"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_barbell_press",
            "exerciseId": "csv-incline-bench-press-barbell",
            "exerciseName": "Incline Barbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_bench_press",
            "exerciseId": "csv-bench-press-dumbbell",
            "exerciseName": "Dumbbell Bench Press",
            "order": 3,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_curl",
            "exerciseId": "csv-incline-curl-dumbbell",
            "exerciseName": "Incline Dumbbell Curl",
            "order": 7,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "incline_bench"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Lower A",
        "focus": [
          "Quad Öncelikli"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_extension",
            "exerciseId": "csv-leg-extension",
            "exerciseName": "Leg Extension",
            "order": 4,
            "movementPattern": "knee_extension",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 5,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 6,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Upper B",
        "focus": [
          "Sırt + Omuz"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 1,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 4,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_triceps_extension",
            "exerciseId": "csv-overhead-tricep-extension-cable",
            "exerciseName": "Overhead Triceps Extension",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable_or_dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 7,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Lower B",
        "focus": [
          "Glute/Hamstring"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "hack_squat",
            "exerciseId": "csv-hack-squat",
            "exerciseName": "Hack Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_calf_raise",
            "exerciseId": "csv-seated-calf-raise",
            "exerciseName": "Seated Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hanging_leg_raise",
            "exerciseId": "csv-hanging-leg-raise",
            "exerciseName": "Hanging Leg Raise",
            "order": 6,
            "movementPattern": "hip_flexion",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_hypertrophy_ppl_advanced_6d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "İleri PPL 6 Gün",
    "goal": "hypertrophy",
    "level": "advanced",
    "split": "push_pull_legs",
    "daysPerWeek": 6,
    "durationWeeks": 10,
    "sessionMinutes": {
      "min": 60,
      "target": 75,
      "max": 90
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes",
      "calves"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 2,
    "maxFocusMuscles": 2,
    "descriptionTr": "İleri seviye için daha yüksek hacim; agresif adaptasyon kabul etmez.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Push A",
        "focus": [
          "Göğüs"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Pull A",
        "focus": [
          "Lats"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 1,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 4,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_curl",
            "exerciseId": "csv-incline-curl-dumbbell",
            "exerciseName": "Incline Dumbbell Curl",
            "order": 5,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "incline_bench"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Legs A",
        "focus": [
          "Quad"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 3,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_extension",
            "exerciseId": "csv-leg-extension",
            "exerciseName": "Leg Extension",
            "order": 4,
            "movementPattern": "knee_extension",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Push B",
        "focus": [
          "Üst Göğüs/Omuz"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_barbell_press",
            "exerciseId": "csv-incline-bench-press-barbell",
            "exerciseName": "Incline Barbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_shoulder_press",
            "exerciseId": "csv-shoulder-press-machine",
            "exerciseName": "Machine Shoulder Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "cable_lateral_raise",
            "exerciseId": "csv-lateral-raise-cable",
            "exerciseName": "Cable Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_triceps_extension",
            "exerciseId": "csv-overhead-tricep-extension-cable",
            "exerciseName": "Overhead Triceps Extension",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable_or_dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 5,
        "name": "Pull B",
        "focus": [
          "Upper Back"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 1,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "neutral_grip_pulldown",
            "exerciseId": "csv-neutral-grip-pulldowns",
            "exerciseName": "Neutral-Grip Pulldown",
            "order": 2,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "face_pull",
            "exerciseId": "csv-face-pull",
            "exerciseName": "Face Pull",
            "order": 4,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 5,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 6,
        "name": "Legs B",
        "focus": [
          "Posterior"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "hack_squat",
            "exerciseId": "csv-hack-squat",
            "exerciseName": "Hack Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_calf_raise",
            "exerciseId": "csv-seated-calf-raise",
            "exerciseName": "Seated Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_powerbuilding_intermediate_4d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Güç ve Kas 4 Gün",
    "goal": "powerbuilding",
    "level": "intermediate",
    "split": "powerbuilding",
    "daysPerWeek": 4,
    "durationWeeks": 10,
    "sessionMinutes": {
      "min": 65,
      "target": 80,
      "max": 95
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "powerbuilding_hybrid",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Ana liftlerde güç, sonrasında hipertrofi aksesuarları.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Upper Power",
        "focus": [
          "Bench Güç"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 2.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Lower Power",
        "focus": [
          "Squat Güç"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Upper Hypertrophy",
        "focus": [
          "Göğüs/Sırt"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 3,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "neutral_grip_pulldown",
            "exerciseId": "csv-neutral-grip-pulldowns",
            "exerciseName": "Neutral-Grip Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_curl",
            "exerciseId": "csv-incline-curl-dumbbell",
            "exerciseName": "Incline Dumbbell Curl",
            "order": 6,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "incline_bench"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Lower Hypertrophy",
        "focus": [
          "Bacak"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "conventional_deadlift",
            "exerciseId": "csv-deadlift-barbell",
            "exerciseName": "Conventional Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings",
              "back"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hack_squat",
            "exerciseId": "csv-hack-squat",
            "exerciseName": "Hack Squat",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 3,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 4,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 5,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_calf_raise",
            "exerciseId": "csv-seated-calf-raise",
            "exerciseName": "Seated Calf Raise",
            "order": 6,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_powerbuilding_intermediate_5d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Powerbuilding 5 Gün",
    "goal": "powerbuilding",
    "level": "intermediate",
    "split": "powerbuilding",
    "daysPerWeek": 5,
    "durationWeeks": 10,
    "sessionMinutes": {
      "min": 60,
      "target": 75,
      "max": 90
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "powerbuilding_hybrid",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Ana liftleri ayrı günlere dağıtan beş günlük hibrit program.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Squat",
        "focus": [
          "Squat + Quad"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_extension",
            "exerciseId": "csv-leg-extension",
            "exerciseName": "Leg Extension",
            "order": 4,
            "movementPattern": "knee_extension",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Bench",
        "focus": [
          "Bench + Chest"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 2.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 3,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Back",
        "focus": [
          "Back"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 1,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 2,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "straight_arm_pulldown",
            "exerciseId": "csv-standing-pullover-cable",
            "exerciseName": "Straight-Arm Pulldown",
            "order": 4,
            "movementPattern": "shoulder_extension",
            "primaryMuscles": [
              "lats"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_curl",
            "exerciseId": "csv-bicep-curl-barbell",
            "exerciseName": "Barbell Curl",
            "order": 5,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 6,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Press",
        "focus": [
          "OHP + Delts"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 1,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 6,
            "targetRir": 2.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "close_grip_bench",
            "exerciseId": "csv-bench-press-close-grip",
            "exerciseName": "Close-Grip Bench Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 5,
        "name": "Deadlift",
        "focus": [
          "Posterior"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "conventional_deadlift",
            "exerciseId": "csv-deadlift-barbell",
            "exerciseName": "Conventional Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings",
              "back"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 2,
            "repsMax": 5,
            "targetRir": 2.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "front_squat",
            "exerciseId": "csv-front-squat-barbell",
            "exerciseName": "Front Squat",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 3,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "ab_wheel",
            "exerciseId": "csv-ab-wheel",
            "exerciseName": "Ab Wheel Rollout",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "ab_wheel"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_powerbuilding_advanced_4d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "İleri Güç ve Kas 4 Gün",
    "goal": "powerbuilding",
    "level": "advanced",
    "split": "powerbuilding",
    "daysPerWeek": 4,
    "durationWeeks": 12,
    "sessionMinutes": {
      "min": 75,
      "target": 90,
      "max": 105
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "powerbuilding_hybrid",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 2,
    "maxFocusMuscles": 2,
    "descriptionTr": "İleri seviye, daha yüksek özgüllük ve sınırlı otomatik adaptasyon.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Upper Power",
        "focus": [
          "Bench Güç"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 1.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 1.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 6,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Lower Power",
        "focus": [
          "Squat Güç"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 1.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 3,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Upper Hypertrophy",
        "focus": [
          "Göğüs/Sırt"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 3,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "neutral_grip_pulldown",
            "exerciseId": "csv-neutral-grip-pulldowns",
            "exerciseName": "Neutral-Grip Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_curl",
            "exerciseId": "csv-incline-curl-dumbbell",
            "exerciseName": "Incline Dumbbell Curl",
            "order": 6,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "incline_bench"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Lower Hypertrophy",
        "focus": [
          "Bacak"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "conventional_deadlift",
            "exerciseId": "csv-deadlift-barbell",
            "exerciseName": "Conventional Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings",
              "back"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 1.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hack_squat",
            "exerciseId": "csv-hack-squat",
            "exerciseName": "Hack Squat",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 3,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 4,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 5,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_calf_raise",
            "exerciseId": "csv-seated-calf-raise",
            "exerciseName": "Seated Calf Raise",
            "order": 6,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_powerbuilding_advanced_5d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "İleri Powerbuilding 5 Gün",
    "goal": "powerbuilding",
    "level": "advanced",
    "split": "powerbuilding",
    "daysPerWeek": 5,
    "durationWeeks": 12,
    "sessionMinutes": {
      "min": 65,
      "target": 80,
      "max": 95
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "powerbuilding_hybrid",
    "compatibleFocusMuscles": [
      "chest",
      "upper_chest",
      "lats",
      "upper_back",
      "side_delts",
      "rear_delts",
      "biceps",
      "triceps",
      "quads",
      "hamstrings",
      "glutes"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 2,
    "maxFocusMuscles": 2,
    "descriptionTr": "İleri seviye, daha yüksek özgüllük ve sınırlı otomatik adaptasyon.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Squat",
        "focus": [
          "Squat + Quad"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 1.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_extension",
            "exerciseId": "csv-leg-extension",
            "exerciseName": "Leg Extension",
            "order": 4,
            "movementPattern": "knee_extension",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 5,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Bench",
        "focus": [
          "Bench + Chest"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 5,
            "targetRir": 1.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 3,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "triceps_pushdown",
            "exerciseId": "csv-tricep-pushdown-cable",
            "exerciseName": "Triceps Pushdown",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Back",
        "focus": [
          "Back"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 1,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 2,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "straight_arm_pulldown",
            "exerciseId": "csv-standing-pullover-cable",
            "exerciseName": "Straight-Arm Pulldown",
            "order": 4,
            "movementPattern": "shoulder_extension",
            "primaryMuscles": [
              "lats"
            ],
            "equipment": [
              "cable"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_curl",
            "exerciseId": "csv-bicep-curl-barbell",
            "exerciseName": "Barbell Curl",
            "order": 5,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hammer_curl",
            "exerciseId": "csv-hammer-curl",
            "exerciseName": "Hammer Curl",
            "order": 6,
            "movementPattern": "elbow_flexion",
            "primaryMuscles": [
              "biceps",
              "forearms"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Press",
        "focus": [
          "OHP + Delts"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 1,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 4,
            "repsMin": 3,
            "repsMax": 6,
            "targetRir": 1.0,
            "restSeconds": 210,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "close_grip_bench",
            "exerciseId": "csv-bench-press-close-grip",
            "exerciseName": "Close-Grip Bench Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_pec_deck",
            "exerciseId": "csv-reverse-pec-deck",
            "exerciseName": "Reverse Pec Deck",
            "order": 5,
            "movementPattern": "horizontal_abduction",
            "primaryMuscles": [
              "rear_delts",
              "upper_back"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 1.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 5,
        "name": "Deadlift",
        "focus": [
          "Posterior"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "conventional_deadlift",
            "exerciseId": "csv-deadlift-barbell",
            "exerciseName": "Conventional Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings",
              "back"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 2,
            "repsMax": 5,
            "targetRir": 1.0,
            "restSeconds": 240,
            "required": true,
            "notes": ""
          },
          {
            "canonicalExerciseId": "front_squat",
            "exerciseId": "csv-front-squat-barbell",
            "exerciseName": "Front Squat",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 2.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 3,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 1.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "ab_wheel",
            "exerciseId": "csv-ab-wheel",
            "exerciseName": "Ab Wheel Rollout",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "ab_wheel"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_general_fitness_beginner_gym_3d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Genel Fitness Başlangıç 3 Gün",
    "goal": "general_fitness",
    "level": "beginner",
    "split": "full_body",
    "daysPerWeek": 3,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 35,
      "target": 50,
      "max": 65
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "linear_beginner",
    "compatibleFocusMuscles": [
      "chest",
      "lats",
      "upper_back",
      "side_delts",
      "quads",
      "hamstrings",
      "glutes",
      "core"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Temel hareket paternlerini kapsayan sade ve sürdürülebilir plan.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Full Body A",
        "focus": [
          "Temel"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "goblet_squat",
            "exerciseId": "csv-goblet-squat",
            "exerciseName": "Goblet Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_rdl",
            "exerciseId": "csv-romanian-deadlift-dumbbell",
            "exerciseName": "Dumbbell Romanian Deadlift",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "farmer_carry",
            "exerciseId": "forge-farmer-carry",
            "exerciseName": "Farmer Carry",
            "order": 5,
            "movementPattern": "loaded_carry",
            "primaryMuscles": [
              "grip",
              "core"
            ],
            "equipment": [
              "dumbbell_or_kettlebell"
            ],
            "role": "conditioning",
            "sets": 3,
            "repsMin": 30,
            "repsMax": 45,
            "targetRir": 3.0,
            "restSeconds": 75,
            "required": false,
            "notes": "metre veya saniye"
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Full Body B",
        "focus": [
          "Temel"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 2,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pallof_press",
            "exerciseId": "forge-pallof-press",
            "exerciseName": "Pallof Press",
            "order": 5,
            "movementPattern": "anti_rotation",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "cable_or_band"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Full Body C",
        "focus": [
          "Temel"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "reverse_lunge",
            "exerciseId": "csv-reverse-lunge-dumbbell",
            "exerciseName": "Reverse Lunge",
            "order": 1,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_bench_press",
            "exerciseId": "csv-bench-press-dumbbell",
            "exerciseName": "Dumbbell Bench Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "neutral_grip_pulldown",
            "exerciseId": "csv-neutral-grip-pulldowns",
            "exerciseName": "Neutral-Grip Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_walk",
            "exerciseId": "forge-incline-walk",
            "exerciseName": "Incline Treadmill Walk",
            "order": 5,
            "movementPattern": "conditioning",
            "primaryMuscles": [
              "cardio"
            ],
            "equipment": [
              "treadmill"
            ],
            "role": "conditioning",
            "sets": 1,
            "repsMin": 10,
            "repsMax": 20,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": "dakika"
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_general_fitness_beginner_gym_4d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Genel Fitness 4 Gün",
    "goal": "general_fitness",
    "level": "beginner",
    "split": "upper_lower",
    "daysPerWeek": 4,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 30,
      "target": 45,
      "max": 60
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "lats",
      "upper_back",
      "side_delts",
      "quads",
      "hamstrings",
      "glutes",
      "core"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Kısa seanslarla dört güne dağıtılmış genel fitness.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Upper A",
        "focus": [
          "Üst Vücut"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "machine_chest_press",
            "exerciseId": "csv-chest-press-machine",
            "exerciseName": "Machine Chest Press",
            "order": 1,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 2,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 4,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "plank",
            "exerciseId": "csv-plank",
            "exerciseName": "Plank",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 30,
            "repsMax": 45,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": "saniye"
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Lower A",
        "focus": [
          "Alt Vücut"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "leg_press",
            "exerciseId": "csv-leg-press",
            "exerciseName": "Leg Press",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "machine"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_rdl",
            "exerciseId": "csv-romanian-deadlift-dumbbell",
            "exerciseName": "Dumbbell Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_lunge",
            "exerciseId": "csv-reverse-lunge-dumbbell",
            "exerciseName": "Reverse Lunge",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "accessory_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 4,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Upper B",
        "focus": [
          "Üst Vücut"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "dumbbell_bench_press",
            "exerciseId": "csv-bench-press-dumbbell",
            "exerciseName": "Dumbbell Bench Press",
            "order": 1,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "assisted_pull_up",
            "exerciseId": "csv-pull-up-assisted",
            "exerciseName": "Assisted Pull-Up",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "assisted_machine"
            ],
            "role": "secondary_compound",
            "sets": 2,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pallof_press",
            "exerciseId": "forge-pallof-press",
            "exerciseName": "Pallof Press",
            "order": 5,
            "movementPattern": "anti_rotation",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "cable_or_band"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Lower B",
        "focus": [
          "Alt Vücut"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "goblet_squat",
            "exerciseId": "csv-goblet-squat",
            "exerciseName": "Goblet Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 3,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "step_up",
            "exerciseId": "forge-step-up",
            "exerciseName": "Step Up",
            "order": 4,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_walk",
            "exerciseId": "forge-incline-walk",
            "exerciseName": "Incline Treadmill Walk",
            "order": 5,
            "movementPattern": "conditioning",
            "primaryMuscles": [
              "cardio"
            ],
            "equipment": [
              "treadmill"
            ],
            "role": "conditioning",
            "sets": 1,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": "dakika"
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_general_fitness_dumbbell_beginner_3d_v1",
    "version": 2,
    "status": "active",
    "nameTr": "Dambıl ile Full Body 3 Gün",
    "goal": "general_fitness",
    "level": "beginner",
    "split": "full_body",
    "daysPerWeek": 3,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 30,
      "target": 45,
      "max": 60
    },
    "equipmentProfile": "dumbbell_only",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "lats",
      "upper_back",
      "side_delts",
      "quads",
      "hamstrings",
      "glutes",
      "core"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Dambıl ve bench ile uygulanabilen başlangıç programı.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Dumbbell A",
        "focus": [
          "Full Body"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "goblet_squat",
            "exerciseId": "csv-goblet-squat",
            "exerciseName": "Goblet Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_bench_press",
            "exerciseId": "csv-bench-press-dumbbell",
            "exerciseName": "Dumbbell Bench Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "one_arm_dumbbell_row",
            "exerciseId": "csv-single-arm-row-dumbbell",
            "exerciseName": "One-Arm Dumbbell Row",
            "order": 3,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_rdl",
            "exerciseId": "csv-romanian-deadlift-dumbbell",
            "exerciseName": "Dumbbell Romanian Deadlift",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 5,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Dumbbell B",
        "focus": [
          "Full Body"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 1,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_shoulder_press",
            "exerciseId": "csv-shoulder-press-plate-loaded",
            "exerciseName": "Dumbbell Shoulder Press",
            "order": 2,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "one_arm_dumbbell_row",
            "exerciseId": "csv-single-arm-row-dumbbell",
            "exerciseName": "One-Arm Dumbbell Row",
            "order": 3,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "single_leg_glute_bridge",
            "exerciseId": "forge-single-leg-glute-bridge",
            "exerciseName": "Single-Leg Glute Bridge",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dead_bug",
            "exerciseId": "forge-dead-bug",
            "exerciseName": "Dead Bug",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Dumbbell C",
        "focus": [
          "Full Body"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_rdl",
            "exerciseId": "csv-romanian-deadlift-dumbbell",
            "exerciseName": "Dumbbell Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_lunge",
            "exerciseId": "csv-reverse-lunge-dumbbell",
            "exerciseName": "Reverse Lunge",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "one_arm_dumbbell_row",
            "exerciseId": "csv-single-arm-row-dumbbell",
            "exerciseName": "One-Arm Dumbbell Row",
            "order": 4,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": "Added to restore full-body pulling balance."
          },
          {
            "canonicalExerciseId": "overhead_triceps_extension",
            "exerciseId": "csv-overhead-tricep-extension-cable",
            "exerciseName": "Overhead Triceps Extension",
            "order": 5,
            "movementPattern": "elbow_extension",
            "primaryMuscles": [
              "triceps"
            ],
            "equipment": [
              "cable_or_dumbbell"
            ],
            "role": "isolation",
            "sets": 2,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "farmer_carry",
            "exerciseId": "forge-farmer-carry",
            "exerciseName": "Farmer Carry",
            "order": 6,
            "movementPattern": "loaded_carry",
            "primaryMuscles": [
              "grip",
              "core"
            ],
            "equipment": [
              "dumbbell_or_kettlebell"
            ],
            "role": "conditioning",
            "sets": 3,
            "repsMin": 30,
            "repsMax": 45,
            "targetRir": 3.0,
            "restSeconds": 75,
            "required": false,
            "notes": "metre veya saniye"
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_home_bodyweight_beginner_3d_v1",
    "version": 2,
    "status": "active",
    "nameTr": "Evde Başlangıç 3 Gün",
    "goal": "general_fitness",
    "level": "beginner",
    "split": "home_bodyweight",
    "daysPerWeek": 3,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 25,
      "target": 35,
      "max": 50
    },
    "equipmentProfile": "bodyweight_home",
    "progressionRuleId": "bodyweight_rep_leverage",
    "compatibleFocusMuscles": [
      "chest",
      "front_delts",
      "triceps",
      "lats",
      "upper_back",
      "quads",
      "hamstrings",
      "glutes",
      "core"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Evde başlangıç programı; çekiş çalışması için direnç bandı önerilir.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Home A",
        "focus": [
          "Full Body"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bodyweight_squat",
            "exerciseId": "forge-bodyweight-squat",
            "exerciseName": "Bodyweight Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "push_up",
            "exerciseId": "csv-push-up",
            "exerciseName": "Push-Up",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "band_row",
            "exerciseId": "forge-band-row",
            "exerciseName": "Resistance-Band Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "resistance_band"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": "Added to restore realistic home pulling exposure with a band."
          },
          {
            "canonicalExerciseId": "single_leg_glute_bridge",
            "exerciseId": "forge-single-leg-glute-bridge",
            "exerciseName": "Single-Leg Glute Bridge",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "plank",
            "exerciseId": "csv-plank",
            "exerciseName": "Plank",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 30,
            "repsMax": 60,
            "targetRir": 2.0,
            "restSeconds": 60,
            "required": false,
            "notes": "saniye"
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Home B",
        "focus": [
          "Full Body"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "reverse_lunge",
            "exerciseId": "csv-reverse-lunge-dumbbell",
            "exerciseName": "Reverse Lunge",
            "order": 1,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pike_push_up",
            "exerciseId": "forge-pike-push-up",
            "exerciseName": "Pike Push-Up",
            "order": 2,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "single_leg_glute_bridge",
            "exerciseId": "forge-single-leg-glute-bridge",
            "exerciseName": "Single-Leg Glute Bridge",
            "order": 3,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dead_bug",
            "exerciseId": "forge-dead-bug",
            "exerciseName": "Dead Bug",
            "order": 4,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "band_row",
            "exerciseId": "forge-band-row",
            "exerciseName": "Resistance-Band Row",
            "order": 5,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "resistance_band"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": "Replaced duplicate push-up with pulling work for home balance."
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Home C",
        "focus": [
          "Full Body"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bodyweight_squat",
            "exerciseId": "forge-bodyweight-squat",
            "exerciseName": "Bodyweight Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 15,
            "repsMax": 25,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "push_up",
            "exerciseId": "csv-push-up",
            "exerciseName": "Push-Up",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "band_row",
            "exerciseId": "forge-band-row",
            "exerciseName": "Resistance-Band Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "resistance_band"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": "Added to restore realistic home pulling exposure with a band."
          },
          {
            "canonicalExerciseId": "single_leg_glute_bridge",
            "exerciseId": "forge-single-leg-glute-bridge",
            "exerciseName": "Single-Leg Glute Bridge",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": "Added to restore posterior-chain exposure on the full-body home day."
          },
          {
            "canonicalExerciseId": "plank",
            "exerciseId": "csv-plank",
            "exerciseName": "Plank",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 30,
            "repsMax": 60,
            "targetRir": 2.0,
            "restSeconds": 60,
            "required": false,
            "notes": "saniye"
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_home_band_beginner_3d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Evde Band ile 3 Gün",
    "goal": "general_fitness",
    "level": "beginner",
    "split": "home_bodyweight",
    "daysPerWeek": 3,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 25,
      "target": 40,
      "max": 55
    },
    "equipmentProfile": "resistance_band_bodyweight",
    "progressionRuleId": "bodyweight_rep_leverage",
    "compatibleFocusMuscles": [
      "chest",
      "lats",
      "upper_back",
      "side_delts",
      "quads",
      "hamstrings",
      "glutes",
      "core"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Direnç bandı sayesinde itiş ve çekiş dengesi kurulan ev programı.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Band A",
        "focus": [
          "Full Body"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bodyweight_squat",
            "exerciseId": "forge-bodyweight-squat",
            "exerciseName": "Bodyweight Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "secondary_compound",
            "sets": 4,
            "repsMin": 12,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "push_up",
            "exerciseId": "csv-push-up",
            "exerciseName": "Push-Up",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "band_row",
            "exerciseId": "forge-band-row",
            "exerciseName": "Resistance-Band Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "resistance_band"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "single_leg_glute_bridge",
            "exerciseId": "forge-single-leg-glute-bridge",
            "exerciseName": "Single-Leg Glute Bridge",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dead_bug",
            "exerciseId": "forge-dead-bug",
            "exerciseName": "Dead Bug",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Band B",
        "focus": [
          "Full Body"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "split_squat",
            "exerciseId": "csv-lunge-bodyweight",
            "exerciseName": "Split Squat",
            "order": 1,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pike_push_up",
            "exerciseId": "forge-pike-push-up",
            "exerciseName": "Pike Push-Up",
            "order": 2,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "band_pulldown",
            "exerciseId": "forge-band-pulldown",
            "exerciseName": "Resistance-Band Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "resistance_band"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "single_leg_glute_bridge",
            "exerciseId": "forge-single-leg-glute-bridge",
            "exerciseName": "Single-Leg Glute Bridge",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "hamstrings"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "plank",
            "exerciseId": "csv-plank",
            "exerciseName": "Plank",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 30,
            "repsMax": 60,
            "targetRir": 2.0,
            "restSeconds": 60,
            "required": false,
            "notes": "saniye"
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Band C",
        "focus": [
          "Full Body"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "reverse_lunge",
            "exerciseId": "csv-reverse-lunge-dumbbell",
            "exerciseName": "Reverse Lunge",
            "order": 1,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 8,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "push_up",
            "exerciseId": "csv-push-up",
            "exerciseName": "Push-Up",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 6,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "band_row",
            "exerciseId": "forge-band-row",
            "exerciseName": "Resistance-Band Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "resistance_band"
            ],
            "role": "accessory_compound",
            "sets": 4,
            "repsMin": 10,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "band_pulldown",
            "exerciseId": "forge-band-pulldown",
            "exerciseName": "Resistance-Band Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "resistance_band"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 20,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pallof_press",
            "exerciseId": "forge-pallof-press",
            "exerciseName": "Pallof Press",
            "order": 5,
            "movementPattern": "anti_rotation",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "cable_or_band"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_general_fitness_intermediate_3d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Atletik Genel Fitness 3 Gün",
    "goal": "general_fitness",
    "level": "intermediate",
    "split": "full_body",
    "daysPerWeek": 3,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 45,
      "target": 60,
      "max": 75
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "lats",
      "upper_back",
      "quads",
      "hamstrings",
      "glutes",
      "core"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Direnç, taşıma ve kısa kondisyon bloklarını birleştirir.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Strength Base",
        "focus": [
          "Squat/Push/Pull"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "dumbbell_bench_press",
            "exerciseId": "csv-bench-press-dumbbell",
            "exerciseName": "Dumbbell Bench Press",
            "order": 2,
            "movementPattern": "horizontal_push",
            "primaryMuscles": [
              "chest",
              "triceps"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "farmer_carry",
            "exerciseId": "forge-farmer-carry",
            "exerciseName": "Farmer Carry",
            "order": 5,
            "movementPattern": "loaded_carry",
            "primaryMuscles": [
              "grip",
              "core"
            ],
            "equipment": [
              "dumbbell_or_kettlebell"
            ],
            "role": "conditioning",
            "sets": 4,
            "repsMin": 30,
            "repsMax": 45,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": "metre veya saniye"
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Unilateral + Core",
        "focus": [
          "Tek Taraflı"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bulgarian_split_squat",
            "exerciseId": "csv-bulgarian-split-squat-dumbbell",
            "exerciseName": "Bulgarian Split Squat",
            "order": 1,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 2,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 3.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "seated_cable_row",
            "exerciseId": "csv-seated-row-cable",
            "exerciseName": "Seated Cable Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 4,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pallof_press",
            "exerciseId": "forge-pallof-press",
            "exerciseName": "Pallof Press",
            "order": 5,
            "movementPattern": "anti_rotation",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "cable_or_band"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bike_intervals",
            "exerciseId": "forge-bike-intervals",
            "exerciseName": "Stationary Bike Intervals",
            "order": 6,
            "movementPattern": "conditioning",
            "primaryMuscles": [
              "cardio"
            ],
            "equipment": [
              "stationary_bike"
            ],
            "role": "conditioning",
            "sets": 1,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": "dakika"
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Mixed",
        "focus": [
          "Full Body"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "trap_bar_deadlift",
            "exerciseId": "csv-trap-bar-deadlift",
            "exerciseName": "Trap Bar Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "quads",
              "hamstrings"
            ],
            "equipment": [
              "trap_bar"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 4,
            "repsMax": 6,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 2,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 3,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "step_up",
            "exerciseId": "forge-step-up",
            "exerciseName": "Step Up",
            "order": 4,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell",
              "bench"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "ab_wheel",
            "exerciseId": "csv-ab-wheel",
            "exerciseName": "Ab Wheel Rollout",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "ab_wheel"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "incline_walk",
            "exerciseId": "forge-incline-walk",
            "exerciseName": "Incline Treadmill Walk",
            "order": 6,
            "movementPattern": "conditioning",
            "primaryMuscles": [
              "cardio"
            ],
            "equipment": [
              "treadmill"
            ],
            "role": "conditioning",
            "sets": 1,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": "dakika"
          }
        ]
      }
    ]
  },
  {
    "templateId": "forge_general_fitness_intermediate_4d_v1",
    "version": 1,
    "status": "active",
    "nameTr": "Atletik Upper/Lower 4 Gün",
    "goal": "general_fitness",
    "level": "intermediate",
    "split": "upper_lower",
    "daysPerWeek": 4,
    "durationWeeks": 8,
    "sessionMinutes": {
      "min": 40,
      "target": 55,
      "max": 70
    },
    "equipmentProfile": "full_gym",
    "progressionRuleId": "double_progression",
    "compatibleFocusMuscles": [
      "chest",
      "lats",
      "upper_back",
      "side_delts",
      "quads",
      "hamstrings",
      "glutes",
      "core"
    ],
    "maxExtraSetsPerFocusMuscleWeek": 4,
    "maxFocusMuscles": 2,
    "descriptionTr": "Orta seviye kullanıcı için direnç ve kondisyon dengesi.",
    "sourceBasis": "Forge Programming Bible v1 + aggregate dataset patterns + evidence-informed guardrails",
    "workouts": [
      {
        "dayIndex": 1,
        "name": "Upper A",
        "focus": [
          "Upper"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "bench_press",
            "exerciseId": "csv-bench-press-barbell",
            "exerciseName": "Barbell Bench Press",
            "order": 1,
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
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "barbell_row",
            "exerciseId": "csv-barbell-row",
            "exerciseName": "Barbell Row",
            "order": 2,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 3.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "overhead_press",
            "exerciseId": "csv-overhead-press-barbell",
            "exerciseName": "Barbell Overhead Press",
            "order": 3,
            "movementPattern": "vertical_push",
            "primaryMuscles": [
              "front_delts",
              "triceps"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 2,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 3.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lat_pulldown",
            "exerciseId": "csv-lat-pulldown",
            "exerciseName": "Lat Pulldown",
            "order": 4,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "cable"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "farmer_carry",
            "exerciseId": "forge-farmer-carry",
            "exerciseName": "Farmer Carry",
            "order": 5,
            "movementPattern": "loaded_carry",
            "primaryMuscles": [
              "grip",
              "core"
            ],
            "equipment": [
              "dumbbell_or_kettlebell"
            ],
            "role": "conditioning",
            "sets": 3,
            "repsMin": 30,
            "repsMax": 45,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": "metre veya saniye"
          }
        ]
      },
      {
        "dayIndex": 2,
        "name": "Lower A",
        "focus": [
          "Lower"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "back_squat",
            "exerciseId": "csv-squat-barbell",
            "exerciseName": "Back Squat",
            "order": 1,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "barbell",
              "rack"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 5,
            "repsMax": 8,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "romanian_deadlift",
            "exerciseId": "csv-romanian-deadlift-barbell",
            "exerciseName": "Romanian Deadlift",
            "order": 2,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "hamstrings",
              "glutes"
            ],
            "equipment": [
              "barbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 10,
            "targetRir": 3.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "reverse_lunge",
            "exerciseId": "csv-reverse-lunge-dumbbell",
            "exerciseName": "Reverse Lunge",
            "order": 3,
            "movementPattern": "lunge",
            "primaryMuscles": [
              "quads",
              "glutes"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "accessory_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "standing_calf_raise",
            "exerciseId": "csv-standing-calf-raise",
            "exerciseName": "Standing Calf Raise",
            "order": 4,
            "movementPattern": "calf_raise",
            "primaryMuscles": [
              "calves"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "plank",
            "exerciseId": "csv-plank",
            "exerciseName": "Plank",
            "order": 5,
            "movementPattern": "anti_extension",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "bodyweight"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 30,
            "repsMax": 60,
            "targetRir": 2.0,
            "restSeconds": 60,
            "required": false,
            "notes": "saniye"
          }
        ]
      },
      {
        "dayIndex": 3,
        "name": "Upper B",
        "focus": [
          "Upper"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "incline_dumbbell_press",
            "exerciseId": "csv-incline-bench-press-dumbbell",
            "exerciseName": "Incline Dumbbell Press",
            "order": 1,
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
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pull_up",
            "exerciseId": "csv-pull-up-bodyweight",
            "exerciseName": "Pull-Up",
            "order": 2,
            "movementPattern": "vertical_pull",
            "primaryMuscles": [
              "lats",
              "biceps"
            ],
            "equipment": [
              "pullup_bar"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 6,
            "repsMax": 10,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "chest_supported_row",
            "exerciseId": "csv-chest-supported-row-dumbbell",
            "exerciseName": "Chest-Supported Row",
            "order": 3,
            "movementPattern": "horizontal_pull",
            "primaryMuscles": [
              "upper_back",
              "lats",
              "biceps"
            ],
            "equipment": [
              "machine_or_dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "lateral_raise",
            "exerciseId": "csv-lateral-raise-dumbbell",
            "exerciseName": "Dumbbell Lateral Raise",
            "order": 4,
            "movementPattern": "shoulder_abduction",
            "primaryMuscles": [
              "side_delts"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 12,
            "repsMax": 18,
            "targetRir": 2.0,
            "restSeconds": 75,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "bike_intervals",
            "exerciseId": "forge-bike-intervals",
            "exerciseName": "Stationary Bike Intervals",
            "order": 5,
            "movementPattern": "conditioning",
            "primaryMuscles": [
              "cardio"
            ],
            "equipment": [
              "stationary_bike"
            ],
            "role": "conditioning",
            "sets": 1,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 3.0,
            "restSeconds": 60,
            "required": false,
            "notes": "dakika"
          }
        ]
      },
      {
        "dayIndex": 4,
        "name": "Lower B",
        "focus": [
          "Lower"
        ],
        "exercises": [
          {
            "canonicalExerciseId": "trap_bar_deadlift",
            "exerciseId": "csv-trap-bar-deadlift",
            "exerciseName": "Trap Bar Deadlift",
            "order": 1,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes",
              "quads",
              "hamstrings"
            ],
            "equipment": [
              "trap_bar"
            ],
            "role": "main_lift",
            "sets": 3,
            "repsMin": 4,
            "repsMax": 6,
            "targetRir": 3.0,
            "restSeconds": 180,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "goblet_squat",
            "exerciseId": "csv-goblet-squat",
            "exerciseName": "Goblet Squat",
            "order": 2,
            "movementPattern": "squat",
            "primaryMuscles": [
              "quads"
            ],
            "equipment": [
              "dumbbell"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 120,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "hip_thrust",
            "exerciseId": "csv-hip-thrust-barbell",
            "exerciseName": "Barbell Hip Thrust",
            "order": 3,
            "movementPattern": "hinge",
            "primaryMuscles": [
              "glutes"
            ],
            "equipment": [
              "barbell",
              "bench"
            ],
            "role": "secondary_compound",
            "sets": 3,
            "repsMin": 8,
            "repsMax": 12,
            "targetRir": 2.0,
            "restSeconds": 150,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "leg_curl",
            "exerciseId": "csv-leg-curl",
            "exerciseName": "Leg Curl",
            "order": 4,
            "movementPattern": "knee_flexion",
            "primaryMuscles": [
              "hamstrings"
            ],
            "equipment": [
              "machine"
            ],
            "role": "isolation",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 90,
            "required": false,
            "notes": ""
          },
          {
            "canonicalExerciseId": "pallof_press",
            "exerciseId": "forge-pallof-press",
            "exerciseName": "Pallof Press",
            "order": 5,
            "movementPattern": "anti_rotation",
            "primaryMuscles": [
              "core"
            ],
            "equipment": [
              "cable_or_band"
            ],
            "role": "core",
            "sets": 3,
            "repsMin": 10,
            "repsMax": 15,
            "targetRir": 2.0,
            "restSeconds": 60,
            "required": false,
            "notes": ""
          }
        ]
      }
    ]
  }
] as const satisfies readonly ForgeGeneratedTemplate[];
