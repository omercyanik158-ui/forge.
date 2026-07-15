import type { ExerciseLibraryItem } from '@/types';

export const FORGE_EXERCISE_ID_MAP_300 = {
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
  "dumbbell_shoulder_press": "csv-shoulder-press-dumbbell",
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
  "weighted_dip": "csv-dip-weighted",
  "cat_cow": "forge-cat-cow",
  "childs_pose": "forge-childs-pose",
  "downward_dog": "forge-downward-dog",
  "cobra_pose": "forge-cobra-pose",
  "low_lunge_pose": "forge-low-lunge-pose",
  "warrior_one": "forge-warrior-one",
  "warrior_two": "forge-warrior-two",
  "reverse_warrior": "forge-reverse-warrior",
  "triangle_pose": "forge-triangle-pose",
  "extended_side_angle": "forge-extended-side-angle",
  "chair_pose": "forge-chair-pose",
  "tree_pose": "forge-tree-pose",
  "eagle_pose": "forge-eagle-pose",
  "half_moon_pose": "forge-half-moon-pose",
  "bridge_pose": "forge-bridge-pose",
  "happy_baby": "forge-happy-baby",
  "supine_twist": "forge-supine-twist",
  "seated_forward_fold": "forge-seated-forward-fold",
  "pigeon_pose": "forge-pigeon-pose",
  "thread_the_needle": "forge-thread-the-needle",
  "sun_salutation_a": "forge-sun-salutation-a",
  "sun_salutation_b": "forge-sun-salutation-b",
  "boat_pose": "forge-boat-pose",
  "side_plank_yoga": "forge-side-plank-yoga",
  "locust_pose": "forge-locust-pose",
  "corpse_pose": "forge-corpse-pose",
  "box_breathing": "forge-box-breathing",
  "diaphragmatic_breathing": "forge-diaphragmatic-breathing",
  "pilates_hundred": "forge-pilates-hundred",
  "pilates_roll_up": "forge-pilates-roll-up",
  "pilates_single_leg_circle": "forge-pilates-single-leg-circle",
  "pilates_single_leg_stretch": "forge-pilates-single-leg-stretch",
  "pilates_double_leg_stretch": "forge-pilates-double-leg-stretch",
  "pilates_scissors": "forge-pilates-scissors",
  "pilates_criss_cross": "forge-pilates-criss-cross",
  "pilates_spine_stretch": "forge-pilates-spine-stretch",
  "pilates_saw": "forge-pilates-saw",
  "pilates_swan": "forge-pilates-swan",
  "pilates_single_leg_kick": "forge-pilates-single-leg-kick",
  "pilates_double_leg_kick": "forge-pilates-double-leg-kick",
  "pilates_shoulder_bridge": "forge-pilates-shoulder-bridge",
  "pilates_side_kick": "forge-pilates-side-kick",
  "pilates_teaser": "forge-pilates-teaser",
  "pilates_swimming": "forge-pilates-swimming",
  "pilates_leg_pull_front": "forge-pilates-leg-pull-front",
  "pilates_leg_pull_back": "forge-pilates-leg-pull-back",
  "pilates_side_bend": "forge-pilates-side-bend",
  "pilates_seal": "forge-pilates-seal",
  "pilates_push_up": "forge-pilates-push-up",
  "pilates_wall_roll_down": "forge-pilates-wall-roll-down",
  "pilates_clamshell": "forge-pilates-clamshell",
  "pilates_dead_bug": "forge-pilates-dead-bug",
  "pilates_bird_dog": "forge-pilates-bird-dog",
  "pilates_toe_taps": "forge-pilates-toe-taps",
  "pilates_wall_sit": "forge-pilates-wall-sit",
  "pilates_calf_raise": "forge-pilates-calf-raise",
  "pilates_breathing": "forge-pilates-breathing"
} as const;

export const FORGE_REVIEWED_EXERCISES_300 = [
  {
    "id": "forge-band-pulldown",
    "name": "Resistance-Band Pulldown",
    "displayName": "Resistance-Band Pulldown",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Kol",
      "Sırt"
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
      "Kol",
      "Sırt"
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
    "muscleGroup": "Bacak",
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
    "muscleGroup": "Karın",
    "targetMuscles": [
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
    "muscleGroup": "Bacak",
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
      "Kol",
      "Omuz"
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
      "Bacak"
    ],
    "secondaryMuscles": [],
    "equipment": "dumbbell,bench",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-cat-cow",
    "name": "Cat-Cow",
    "displayName": "Cat-Cow",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Karın",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-childs-pose",
    "name": "Child's Pose",
    "displayName": "Child's Pose",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Karın",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-downward-dog",
    "name": "Downward-Facing Dog",
    "displayName": "Downward-Facing Dog",
    "muscleGroup": "Omuz",
    "targetMuscles": [
      "Bacak",
      "Omuz"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-cobra-pose",
    "name": "Cobra Pose",
    "displayName": "Cobra Pose",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Göğüs",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-low-lunge-pose",
    "name": "Low Lunge",
    "displayName": "Low Lunge",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Bacak",
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
    "id": "forge-warrior-one",
    "name": "Warrior I",
    "displayName": "Warrior I",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
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
    "id": "forge-warrior-two",
    "name": "Warrior II",
    "displayName": "Warrior II",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
      "Omuz"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-reverse-warrior",
    "name": "Reverse Warrior",
    "displayName": "Reverse Warrior",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Karın",
      "Omuz"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-triangle-pose",
    "name": "Triangle Pose",
    "displayName": "Triangle Pose",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
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
    "id": "forge-extended-side-angle",
    "name": "Extended Side Angle",
    "displayName": "Extended Side Angle",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
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
    "id": "forge-chair-pose",
    "name": "Chair Pose",
    "displayName": "Chair Pose",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
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
    "id": "forge-tree-pose",
    "name": "Tree Pose",
    "displayName": "Tree Pose",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
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
    "id": "forge-eagle-pose",
    "name": "Eagle Pose",
    "displayName": "Eagle Pose",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
      "Omuz",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-half-moon-pose",
    "name": "Half Moon Pose",
    "displayName": "Half Moon Pose",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
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
    "id": "forge-bridge-pose",
    "name": "Yoga Bridge",
    "displayName": "Yoga Bridge",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-happy-baby",
    "name": "Happy Baby",
    "displayName": "Happy Baby",
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
    "id": "forge-supine-twist",
    "name": "Supine Twist",
    "displayName": "Supine Twist",
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
    "id": "forge-seated-forward-fold",
    "name": "Seated Forward Fold",
    "displayName": "Seated Forward Fold",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pigeon-pose",
    "name": "Pigeon Pose",
    "displayName": "Pigeon Pose",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
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
    "id": "forge-thread-the-needle",
    "name": "Thread the Needle",
    "displayName": "Thread the Needle",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Omuz",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-sun-salutation-a",
    "name": "Sun Salutation A",
    "displayName": "Sun Salutation A",
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
    "id": "forge-sun-salutation-b",
    "name": "Sun Salutation B",
    "displayName": "Sun Salutation B",
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
    "id": "forge-boat-pose",
    "name": "Boat Pose",
    "displayName": "Boat Pose",
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
    "id": "forge-side-plank-yoga",
    "name": "Yoga Side Plank",
    "displayName": "Yoga Side Plank",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Karın",
      "Omuz"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-locust-pose",
    "name": "Locust Pose",
    "displayName": "Locust Pose",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Bacak",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-corpse-pose",
    "name": "Savasana",
    "displayName": "Savasana",
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
    "id": "forge-box-breathing",
    "name": "Box Breathing",
    "displayName": "Box Breathing",
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
    "id": "forge-diaphragmatic-breathing",
    "name": "Diaphragmatic Breathing",
    "displayName": "Diaphragmatic Breathing",
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
    "id": "forge-pilates-hundred",
    "name": "Pilates Hundred",
    "displayName": "Pilates Hundred",
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
    "id": "forge-pilates-roll-up",
    "name": "Pilates Roll-Up",
    "displayName": "Pilates Roll-Up",
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
    "id": "forge-pilates-single-leg-circle",
    "name": "Single-Leg Circle",
    "displayName": "Single-Leg Circle",
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
    "id": "forge-pilates-single-leg-stretch",
    "name": "Single-Leg Stretch",
    "displayName": "Single-Leg Stretch",
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
    "id": "forge-pilates-double-leg-stretch",
    "name": "Double-Leg Stretch",
    "displayName": "Double-Leg Stretch",
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
    "id": "forge-pilates-scissors",
    "name": "Pilates Scissors",
    "displayName": "Pilates Scissors",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Bacak",
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
    "id": "forge-pilates-criss-cross",
    "name": "Pilates Criss-Cross",
    "displayName": "Pilates Criss-Cross",
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
    "id": "forge-pilates-spine-stretch",
    "name": "Spine Stretch Forward",
    "displayName": "Spine Stretch Forward",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Karın",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-saw",
    "name": "Pilates Saw",
    "displayName": "Pilates Saw",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Karın",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-swan",
    "name": "Pilates Swan",
    "displayName": "Pilates Swan",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Bacak",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-single-leg-kick",
    "name": "Single-Leg Kick",
    "displayName": "Single-Leg Kick",
    "muscleGroup": "Bacak",
    "targetMuscles": [
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
    "id": "forge-pilates-double-leg-kick",
    "name": "Double-Leg Kick",
    "displayName": "Double-Leg Kick",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-shoulder-bridge",
    "name": "Pilates Shoulder Bridge",
    "displayName": "Pilates Shoulder Bridge",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
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
    "id": "forge-pilates-side-kick",
    "name": "Side Kick Series",
    "displayName": "Side Kick Series",
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
    "id": "forge-pilates-teaser",
    "name": "Pilates Teaser",
    "displayName": "Pilates Teaser",
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
    "id": "forge-pilates-swimming",
    "name": "Pilates Swimming",
    "displayName": "Pilates Swimming",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Bacak",
      "Omuz",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-leg-pull-front",
    "name": "Leg Pull Front",
    "displayName": "Leg Pull Front",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Bacak",
      "Karın",
      "Omuz"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-leg-pull-back",
    "name": "Leg Pull Back",
    "displayName": "Leg Pull Back",
    "muscleGroup": "Bacak",
    "targetMuscles": [
      "Bacak",
      "Omuz"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-side-bend",
    "name": "Pilates Side Bend",
    "displayName": "Pilates Side Bend",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Karın",
      "Omuz"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-seal",
    "name": "Pilates Seal",
    "displayName": "Pilates Seal",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Karın",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-push-up",
    "name": "Pilates Push-Up",
    "displayName": "Pilates Push-Up",
    "muscleGroup": "Göğüs",
    "targetMuscles": [
      "Göğüs",
      "Karın",
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
    "id": "forge-pilates-wall-roll-down",
    "name": "Wall Roll-Down",
    "displayName": "Wall Roll-Down",
    "muscleGroup": "Sırt",
    "targetMuscles": [
      "Bacak",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-clamshell",
    "name": "Pilates Clamshell",
    "displayName": "Pilates Clamshell",
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
    "id": "forge-pilates-dead-bug",
    "name": "Pilates Dead Bug",
    "displayName": "Pilates Dead Bug",
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
    "id": "forge-pilates-bird-dog",
    "name": "Pilates Bird Dog",
    "displayName": "Pilates Bird Dog",
    "muscleGroup": "Karın",
    "targetMuscles": [
      "Bacak",
      "Karın",
      "Sırt"
    ],
    "secondaryMuscles": [],
    "equipment": "bodyweight",
    "difficulty": "Orta",
    "imageUrls": [],
    "defaultSets": 3,
    "defaultReps": 10
  },
  {
    "id": "forge-pilates-toe-taps",
    "name": "Pilates Toe Taps",
    "displayName": "Pilates Toe Taps",
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
    "id": "forge-pilates-wall-sit",
    "name": "Pilates Wall Sit",
    "displayName": "Pilates Wall Sit",
    "muscleGroup": "Bacak",
    "targetMuscles": [
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
    "id": "forge-pilates-calf-raise",
    "name": "Pilates Calf Raise",
    "displayName": "Pilates Calf Raise",
    "muscleGroup": "Bacak",
    "targetMuscles": [
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
    "id": "forge-pilates-breathing",
    "name": "Pilates Lateral Breathing",
    "displayName": "Pilates Lateral Breathing",
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
  }
] as const satisfies readonly ExerciseLibraryItem[];

export const FORGE_EXERCISE_MAPPING_NOTES_300 = [
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
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "band_row",
    "app": "forge-band-row",
    "type": "generated_reviewed_entry"
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
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "bodyweight_squat",
    "app": "forge-bodyweight-squat",
    "type": "generated_reviewed_entry"
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
    "type": "generated_reviewed_entry"
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
    "app": "csv-shoulder-press-dumbbell",
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
    "type": "generated_reviewed_entry"
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
    "type": "generated_reviewed_entry"
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
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "paused_bench_press",
    "app": "csv-bench-press-paused",
    "type": "reviewed_alias"
  },
  {
    "canonical": "pike_push_up",
    "app": "forge-pike-push-up",
    "type": "generated_reviewed_entry"
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
    "type": "generated_reviewed_entry"
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
    "type": "generated_reviewed_entry"
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
  },
  {
    "canonical": "cat_cow",
    "app": "forge-cat-cow",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "childs_pose",
    "app": "forge-childs-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "downward_dog",
    "app": "forge-downward-dog",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "cobra_pose",
    "app": "forge-cobra-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "low_lunge_pose",
    "app": "forge-low-lunge-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "warrior_one",
    "app": "forge-warrior-one",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "warrior_two",
    "app": "forge-warrior-two",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "reverse_warrior",
    "app": "forge-reverse-warrior",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "triangle_pose",
    "app": "forge-triangle-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "extended_side_angle",
    "app": "forge-extended-side-angle",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "chair_pose",
    "app": "forge-chair-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "tree_pose",
    "app": "forge-tree-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "eagle_pose",
    "app": "forge-eagle-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "half_moon_pose",
    "app": "forge-half-moon-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "bridge_pose",
    "app": "forge-bridge-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "happy_baby",
    "app": "forge-happy-baby",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "supine_twist",
    "app": "forge-supine-twist",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "seated_forward_fold",
    "app": "forge-seated-forward-fold",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pigeon_pose",
    "app": "forge-pigeon-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "thread_the_needle",
    "app": "forge-thread-the-needle",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "sun_salutation_a",
    "app": "forge-sun-salutation-a",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "sun_salutation_b",
    "app": "forge-sun-salutation-b",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "boat_pose",
    "app": "forge-boat-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "side_plank_yoga",
    "app": "forge-side-plank-yoga",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "locust_pose",
    "app": "forge-locust-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "corpse_pose",
    "app": "forge-corpse-pose",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "box_breathing",
    "app": "forge-box-breathing",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "diaphragmatic_breathing",
    "app": "forge-diaphragmatic-breathing",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_hundred",
    "app": "forge-pilates-hundred",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_roll_up",
    "app": "forge-pilates-roll-up",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_single_leg_circle",
    "app": "forge-pilates-single-leg-circle",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_single_leg_stretch",
    "app": "forge-pilates-single-leg-stretch",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_double_leg_stretch",
    "app": "forge-pilates-double-leg-stretch",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_scissors",
    "app": "forge-pilates-scissors",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_criss_cross",
    "app": "forge-pilates-criss-cross",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_spine_stretch",
    "app": "forge-pilates-spine-stretch",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_saw",
    "app": "forge-pilates-saw",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_swan",
    "app": "forge-pilates-swan",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_single_leg_kick",
    "app": "forge-pilates-single-leg-kick",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_double_leg_kick",
    "app": "forge-pilates-double-leg-kick",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_shoulder_bridge",
    "app": "forge-pilates-shoulder-bridge",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_side_kick",
    "app": "forge-pilates-side-kick",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_teaser",
    "app": "forge-pilates-teaser",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_swimming",
    "app": "forge-pilates-swimming",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_leg_pull_front",
    "app": "forge-pilates-leg-pull-front",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_leg_pull_back",
    "app": "forge-pilates-leg-pull-back",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_side_bend",
    "app": "forge-pilates-side-bend",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_seal",
    "app": "forge-pilates-seal",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_push_up",
    "app": "forge-pilates-push-up",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_wall_roll_down",
    "app": "forge-pilates-wall-roll-down",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_clamshell",
    "app": "forge-pilates-clamshell",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_dead_bug",
    "app": "forge-pilates-dead-bug",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_bird_dog",
    "app": "forge-pilates-bird-dog",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_toe_taps",
    "app": "forge-pilates-toe-taps",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_wall_sit",
    "app": "forge-pilates-wall-sit",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_calf_raise",
    "app": "forge-pilates-calf-raise",
    "type": "generated_reviewed_entry"
  },
  {
    "canonical": "pilates_breathing",
    "app": "forge-pilates-breathing",
    "type": "generated_reviewed_entry"
  }
] as const;
