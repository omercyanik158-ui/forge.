import type { ForgeAdaptationRule } from '../types/csvWorkoutBrain';

export const FORGE_ADAPTATION_RULES = [
  {
    "focusMuscle": "upper_chest",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "substitute_or_reorder",
    "targetMovementPattern": "incline_push",
    "preferredExerciseIds": [
      "incline_barbell_press",
      "incline_dumbbell_press",
      "low_to_high_cable_fly"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Ana lift progresyonunu bozma; aynı seansta üçten fazla press paterni oluşturma.",
    "userFacingCopyTr": "Üst göğüs odağı için incline hareketlere kontrollü öncelik verildi."
  },
  {
    "focusMuscle": "chest",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "add_or_substitute",
    "targetMovementPattern": "horizontal_push",
    "preferredExerciseIds": [
      "bench_press",
      "dumbbell_bench_press",
      "machine_chest_press",
      "cable_fly"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Sırt hacmini azaltarak göğüs uzmanlaşması yapma; omuz/triceps yorgunluğunu kontrol et.",
    "userFacingCopyTr": "Göğüs gelişimine küçük ve kontrollü bir hacim önceliği eklendi."
  },
  {
    "focusMuscle": "lats",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "vertical_pull",
    "preferredExerciseIds": [
      "pull_up",
      "lat_pulldown",
      "neutral_grip_pulldown",
      "straight_arm_pulldown"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Yatay çekişi tamamen kaldırma; dirsek fleksör hacmini kontrol et.",
    "userFacingCopyTr": "Lat odağı için dikey çekişler önceliklendirildi."
  },
  {
    "focusMuscle": "upper_back",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "horizontal_pull",
    "preferredExerciseIds": [
      "chest_supported_row",
      "barbell_row",
      "seated_cable_row",
      "reverse_pec_deck"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Bel yorgunluğu yüksekse chest-supported seç; fazla row tekrarından kaçın.",
    "userFacingCopyTr": "Üst sırt odağı için yatay çekişler dengeli biçimde güçlendirildi."
  },
  {
    "focusMuscle": "side_delts",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "shoulder_abduction",
    "preferredExerciseIds": [
      "lateral_raise",
      "cable_lateral_raise"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Press hacmini otomatik artırma; izolasyon setlerini iki güne böl.",
    "userFacingCopyTr": "Yan omuz için düşük yorgunluklu ek çalışma eklendi."
  },
  {
    "focusMuscle": "rear_delts",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "horizontal_abduction",
    "preferredExerciseIds": [
      "reverse_pec_deck",
      "face_pull"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Üst sırt row hacmiyle birlikte toplam arka omuz yükünü kontrol et.",
    "userFacingCopyTr": "Arka omuz odağı için kontrollü aksesuar çalışması eklendi."
  },
  {
    "focusMuscle": "biceps",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "elbow_flexion",
    "preferredExerciseIds": [
      "incline_dumbbell_curl",
      "barbell_curl",
      "hammer_curl",
      "cable_curl"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Çekiş hacminden gelen dolaylı yükü hesaba kat; dirsek şikâyetinde nötr tutuş seç.",
    "userFacingCopyTr": "Biceps için sınırlı doğrudan hacim eklendi."
  },
  {
    "focusMuscle": "triceps",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "elbow_extension",
    "preferredExerciseIds": [
      "triceps_pushdown",
      "overhead_triceps_extension",
      "close_grip_bench"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Bench/OHP hacmini hesaba kat; dirsek stresini izle.",
    "userFacingCopyTr": "Triceps için sınırlı doğrudan hacim eklendi."
  },
  {
    "focusMuscle": "quads",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "squat",
    "preferredExerciseIds": [
      "back_squat",
      "front_squat",
      "hack_squat",
      "leg_press",
      "leg_extension"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Hinge hacmini tamamen kaldırma; diz toleransına göre seçim yap.",
    "userFacingCopyTr": "Quadriceps odağı için squat ve diz ekstansiyonu paternleri önceliklendirildi."
  },
  {
    "focusMuscle": "hamstrings",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "hinge,knee_flexion",
    "preferredExerciseIds": [
      "romanian_deadlift",
      "dumbbell_rdl",
      "leg_curl",
      "nordic_curl"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Deadlift gününe aşırı hinge ekleme; bel yorgunluğunu kontrol et.",
    "userFacingCopyTr": "Hamstring odağı için hinge ve knee-flexion dengesi güçlendirildi."
  },
  {
    "focusMuscle": "glutes",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "hinge,lunge",
    "preferredExerciseIds": [
      "hip_thrust",
      "bulgarian_split_squat",
      "reverse_lunge",
      "romanian_deadlift"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Squat/hinge toplam yorgunluğunu aşma.",
    "userFacingCopyTr": "Glute odağı için kalça ekstansiyonu ve tek taraflı çalışma artırıldı."
  },
  {
    "focusMuscle": "calves",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "calf_raise",
    "preferredExerciseIds": [
      "standing_calf_raise",
      "seated_calf_raise"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Seans süresini aşmamak için düşük öncelikli izolasyonla yer değiştir.",
    "userFacingCopyTr": "Calf odağı için ek doğrudan çalışma eklendi."
  },
  {
    "focusMuscle": "core",
    "goal": "hypertrophy",
    "priority": "high",
    "actionType": "add_core",
    "targetMovementPattern": "anti_extension,anti_rotation",
    "preferredExerciseIds": [
      "ab_wheel",
      "plank",
      "dead_bug",
      "pallof_press",
      "hanging_leg_raise"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Ana liftlerden önce yorucu core çalışması koyma.",
    "userFacingCopyTr": "Core odağı için antrenman sonuna kontrollü çalışma eklendi."
  },
  {
    "focusMuscle": "upper_chest",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "substitute_or_reorder",
    "targetMovementPattern": "incline_push",
    "preferredExerciseIds": [
      "incline_barbell_press",
      "incline_dumbbell_press",
      "low_to_high_cable_fly"
    ],
    "maxExtraDirectSetsWeek": 3,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Ana lift progresyonunu bozma; aynı seansta üçten fazla press paterni oluşturma.",
    "userFacingCopyTr": "Üst göğüs odağı için incline hareketlere kontrollü öncelik verildi."
  },
  {
    "focusMuscle": "chest",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "add_or_substitute",
    "targetMovementPattern": "horizontal_push",
    "preferredExerciseIds": [
      "bench_press",
      "dumbbell_bench_press",
      "machine_chest_press",
      "cable_fly"
    ],
    "maxExtraDirectSetsWeek": 3,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Sırt hacmini azaltarak göğüs uzmanlaşması yapma; omuz/triceps yorgunluğunu kontrol et.",
    "userFacingCopyTr": "Göğüs gelişimine küçük ve kontrollü bir hacim önceliği eklendi."
  },
  {
    "focusMuscle": "lats",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "vertical_pull",
    "preferredExerciseIds": [
      "pull_up",
      "lat_pulldown",
      "neutral_grip_pulldown",
      "straight_arm_pulldown"
    ],
    "maxExtraDirectSetsWeek": 3,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Yatay çekişi tamamen kaldırma; dirsek fleksör hacmini kontrol et.",
    "userFacingCopyTr": "Lat odağı için dikey çekişler önceliklendirildi."
  },
  {
    "focusMuscle": "upper_back",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "horizontal_pull",
    "preferredExerciseIds": [
      "chest_supported_row",
      "barbell_row",
      "seated_cable_row",
      "reverse_pec_deck"
    ],
    "maxExtraDirectSetsWeek": 3,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Bel yorgunluğu yüksekse chest-supported seç; fazla row tekrarından kaçın.",
    "userFacingCopyTr": "Üst sırt odağı için yatay çekişler dengeli biçimde güçlendirildi."
  },
  {
    "focusMuscle": "side_delts",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "shoulder_abduction",
    "preferredExerciseIds": [
      "lateral_raise",
      "cable_lateral_raise"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Press hacmini otomatik artırma; izolasyon setlerini iki güne böl.",
    "userFacingCopyTr": "Yan omuz için düşük yorgunluklu ek çalışma eklendi."
  },
  {
    "focusMuscle": "rear_delts",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "horizontal_abduction",
    "preferredExerciseIds": [
      "reverse_pec_deck",
      "face_pull"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Üst sırt row hacmiyle birlikte toplam arka omuz yükünü kontrol et.",
    "userFacingCopyTr": "Arka omuz odağı için kontrollü aksesuar çalışması eklendi."
  },
  {
    "focusMuscle": "biceps",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "elbow_flexion",
    "preferredExerciseIds": [
      "incline_dumbbell_curl",
      "barbell_curl",
      "hammer_curl",
      "cable_curl"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Çekiş hacminden gelen dolaylı yükü hesaba kat; dirsek şikâyetinde nötr tutuş seç.",
    "userFacingCopyTr": "Biceps için sınırlı doğrudan hacim eklendi."
  },
  {
    "focusMuscle": "triceps",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "elbow_extension",
    "preferredExerciseIds": [
      "triceps_pushdown",
      "overhead_triceps_extension",
      "close_grip_bench"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Bench/OHP hacmini hesaba kat; dirsek stresini izle.",
    "userFacingCopyTr": "Triceps için sınırlı doğrudan hacim eklendi."
  },
  {
    "focusMuscle": "quads",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "squat",
    "preferredExerciseIds": [
      "back_squat",
      "front_squat",
      "hack_squat",
      "leg_press",
      "leg_extension"
    ],
    "maxExtraDirectSetsWeek": 3,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Hinge hacmini tamamen kaldırma; diz toleransına göre seçim yap.",
    "userFacingCopyTr": "Quadriceps odağı için squat ve diz ekstansiyonu paternleri önceliklendirildi."
  },
  {
    "focusMuscle": "hamstrings",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "hinge,knee_flexion",
    "preferredExerciseIds": [
      "romanian_deadlift",
      "dumbbell_rdl",
      "leg_curl",
      "nordic_curl"
    ],
    "maxExtraDirectSetsWeek": 3,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Deadlift gününe aşırı hinge ekleme; bel yorgunluğunu kontrol et.",
    "userFacingCopyTr": "Hamstring odağı için hinge ve knee-flexion dengesi güçlendirildi."
  },
  {
    "focusMuscle": "glutes",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "hinge,lunge",
    "preferredExerciseIds": [
      "hip_thrust",
      "bulgarian_split_squat",
      "reverse_lunge",
      "romanian_deadlift"
    ],
    "maxExtraDirectSetsWeek": 3,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Squat/hinge toplam yorgunluğunu aşma.",
    "userFacingCopyTr": "Glute odağı için kalça ekstansiyonu ve tek taraflı çalışma artırıldı."
  },
  {
    "focusMuscle": "calves",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "calf_raise",
    "preferredExerciseIds": [
      "standing_calf_raise",
      "seated_calf_raise"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Seans süresini aşmamak için düşük öncelikli izolasyonla yer değiştir.",
    "userFacingCopyTr": "Calf odağı için ek doğrudan çalışma eklendi."
  },
  {
    "focusMuscle": "core",
    "goal": "powerbuilding",
    "priority": "high",
    "actionType": "add_core",
    "targetMovementPattern": "anti_extension,anti_rotation",
    "preferredExerciseIds": [
      "ab_wheel",
      "plank",
      "dead_bug",
      "pallof_press",
      "hanging_leg_raise"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Ana liftlerden önce yorucu core çalışması koyma.",
    "userFacingCopyTr": "Core odağı için antrenman sonuna kontrollü çalışma eklendi."
  },
  {
    "focusMuscle": "upper_chest",
    "goal": "strength",
    "priority": "high",
    "actionType": "substitute_or_reorder",
    "targetMovementPattern": "incline_push",
    "preferredExerciseIds": [
      "incline_barbell_press",
      "incline_dumbbell_press",
      "low_to_high_cable_fly"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Ana lift progresyonunu bozma; aynı seansta üçten fazla press paterni oluşturma.",
    "userFacingCopyTr": "Üst göğüs odağı için incline hareketlere kontrollü öncelik verildi."
  },
  {
    "focusMuscle": "chest",
    "goal": "strength",
    "priority": "high",
    "actionType": "add_or_substitute",
    "targetMovementPattern": "horizontal_push",
    "preferredExerciseIds": [
      "bench_press",
      "dumbbell_bench_press",
      "machine_chest_press",
      "cable_fly"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Sırt hacmini azaltarak göğüs uzmanlaşması yapma; omuz/triceps yorgunluğunu kontrol et.",
    "userFacingCopyTr": "Göğüs gelişimine küçük ve kontrollü bir hacim önceliği eklendi."
  },
  {
    "focusMuscle": "lats",
    "goal": "strength",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "vertical_pull",
    "preferredExerciseIds": [
      "pull_up",
      "lat_pulldown",
      "neutral_grip_pulldown",
      "straight_arm_pulldown"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Yatay çekişi tamamen kaldırma; dirsek fleksör hacmini kontrol et.",
    "userFacingCopyTr": "Lat odağı için dikey çekişler önceliklendirildi."
  },
  {
    "focusMuscle": "upper_back",
    "goal": "strength",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "horizontal_pull",
    "preferredExerciseIds": [
      "chest_supported_row",
      "barbell_row",
      "seated_cable_row",
      "reverse_pec_deck"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Bel yorgunluğu yüksekse chest-supported seç; fazla row tekrarından kaçın.",
    "userFacingCopyTr": "Üst sırt odağı için yatay çekişler dengeli biçimde güçlendirildi."
  },
  {
    "focusMuscle": "side_delts",
    "goal": "strength",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "shoulder_abduction",
    "preferredExerciseIds": [
      "lateral_raise",
      "cable_lateral_raise"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Press hacmini otomatik artırma; izolasyon setlerini iki güne böl.",
    "userFacingCopyTr": "Yan omuz için düşük yorgunluklu ek çalışma eklendi."
  },
  {
    "focusMuscle": "rear_delts",
    "goal": "strength",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "horizontal_abduction",
    "preferredExerciseIds": [
      "reverse_pec_deck",
      "face_pull"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Üst sırt row hacmiyle birlikte toplam arka omuz yükünü kontrol et.",
    "userFacingCopyTr": "Arka omuz odağı için kontrollü aksesuar çalışması eklendi."
  },
  {
    "focusMuscle": "biceps",
    "goal": "strength",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "elbow_flexion",
    "preferredExerciseIds": [
      "incline_dumbbell_curl",
      "barbell_curl",
      "hammer_curl",
      "cable_curl"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Çekiş hacminden gelen dolaylı yükü hesaba kat; dirsek şikâyetinde nötr tutuş seç.",
    "userFacingCopyTr": "Biceps için sınırlı doğrudan hacim eklendi."
  },
  {
    "focusMuscle": "triceps",
    "goal": "strength",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "elbow_extension",
    "preferredExerciseIds": [
      "triceps_pushdown",
      "overhead_triceps_extension",
      "close_grip_bench"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Bench/OHP hacmini hesaba kat; dirsek stresini izle.",
    "userFacingCopyTr": "Triceps için sınırlı doğrudan hacim eklendi."
  },
  {
    "focusMuscle": "quads",
    "goal": "strength",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "squat",
    "preferredExerciseIds": [
      "back_squat",
      "front_squat",
      "hack_squat",
      "leg_press",
      "leg_extension"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Hinge hacmini tamamen kaldırma; diz toleransına göre seçim yap.",
    "userFacingCopyTr": "Quadriceps odağı için squat ve diz ekstansiyonu paternleri önceliklendirildi."
  },
  {
    "focusMuscle": "hamstrings",
    "goal": "strength",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "hinge,knee_flexion",
    "preferredExerciseIds": [
      "romanian_deadlift",
      "dumbbell_rdl",
      "leg_curl",
      "nordic_curl"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Deadlift gününe aşırı hinge ekleme; bel yorgunluğunu kontrol et.",
    "userFacingCopyTr": "Hamstring odağı için hinge ve knee-flexion dengesi güçlendirildi."
  },
  {
    "focusMuscle": "glutes",
    "goal": "strength",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "hinge,lunge",
    "preferredExerciseIds": [
      "hip_thrust",
      "bulgarian_split_squat",
      "reverse_lunge",
      "romanian_deadlift"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Squat/hinge toplam yorgunluğunu aşma.",
    "userFacingCopyTr": "Glute odağı için kalça ekstansiyonu ve tek taraflı çalışma artırıldı."
  },
  {
    "focusMuscle": "calves",
    "goal": "strength",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "calf_raise",
    "preferredExerciseIds": [
      "standing_calf_raise",
      "seated_calf_raise"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Seans süresini aşmamak için düşük öncelikli izolasyonla yer değiştir.",
    "userFacingCopyTr": "Calf odağı için ek doğrudan çalışma eklendi."
  },
  {
    "focusMuscle": "core",
    "goal": "strength",
    "priority": "high",
    "actionType": "add_core",
    "targetMovementPattern": "anti_extension,anti_rotation",
    "preferredExerciseIds": [
      "ab_wheel",
      "plank",
      "dead_bug",
      "pallof_press",
      "hanging_leg_raise"
    ],
    "maxExtraDirectSetsWeek": 2,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Ana liftlerden önce yorucu core çalışması koyma.",
    "userFacingCopyTr": "Core odağı için antrenman sonuna kontrollü çalışma eklendi."
  },
  {
    "focusMuscle": "upper_chest",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "substitute_or_reorder",
    "targetMovementPattern": "incline_push",
    "preferredExerciseIds": [
      "incline_barbell_press",
      "incline_dumbbell_press",
      "low_to_high_cable_fly"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Ana lift progresyonunu bozma; aynı seansta üçten fazla press paterni oluşturma.",
    "userFacingCopyTr": "Üst göğüs odağı için incline hareketlere kontrollü öncelik verildi."
  },
  {
    "focusMuscle": "chest",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "add_or_substitute",
    "targetMovementPattern": "horizontal_push",
    "preferredExerciseIds": [
      "bench_press",
      "dumbbell_bench_press",
      "machine_chest_press",
      "cable_fly"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Sırt hacmini azaltarak göğüs uzmanlaşması yapma; omuz/triceps yorgunluğunu kontrol et.",
    "userFacingCopyTr": "Göğüs gelişimine küçük ve kontrollü bir hacim önceliği eklendi."
  },
  {
    "focusMuscle": "lats",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "vertical_pull",
    "preferredExerciseIds": [
      "pull_up",
      "lat_pulldown",
      "neutral_grip_pulldown",
      "straight_arm_pulldown"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Yatay çekişi tamamen kaldırma; dirsek fleksör hacmini kontrol et.",
    "userFacingCopyTr": "Lat odağı için dikey çekişler önceliklendirildi."
  },
  {
    "focusMuscle": "upper_back",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "horizontal_pull",
    "preferredExerciseIds": [
      "chest_supported_row",
      "barbell_row",
      "seated_cable_row",
      "reverse_pec_deck"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Bel yorgunluğu yüksekse chest-supported seç; fazla row tekrarından kaçın.",
    "userFacingCopyTr": "Üst sırt odağı için yatay çekişler dengeli biçimde güçlendirildi."
  },
  {
    "focusMuscle": "side_delts",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "shoulder_abduction",
    "preferredExerciseIds": [
      "lateral_raise",
      "cable_lateral_raise"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Press hacmini otomatik artırma; izolasyon setlerini iki güne böl.",
    "userFacingCopyTr": "Yan omuz için düşük yorgunluklu ek çalışma eklendi."
  },
  {
    "focusMuscle": "rear_delts",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "horizontal_abduction",
    "preferredExerciseIds": [
      "reverse_pec_deck",
      "face_pull"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Üst sırt row hacmiyle birlikte toplam arka omuz yükünü kontrol et.",
    "userFacingCopyTr": "Arka omuz odağı için kontrollü aksesuar çalışması eklendi."
  },
  {
    "focusMuscle": "biceps",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "elbow_flexion",
    "preferredExerciseIds": [
      "incline_dumbbell_curl",
      "barbell_curl",
      "hammer_curl",
      "cable_curl"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Çekiş hacminden gelen dolaylı yükü hesaba kat; dirsek şikâyetinde nötr tutuş seç.",
    "userFacingCopyTr": "Biceps için sınırlı doğrudan hacim eklendi."
  },
  {
    "focusMuscle": "triceps",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "elbow_extension",
    "preferredExerciseIds": [
      "triceps_pushdown",
      "overhead_triceps_extension",
      "close_grip_bench"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Bench/OHP hacmini hesaba kat; dirsek stresini izle.",
    "userFacingCopyTr": "Triceps için sınırlı doğrudan hacim eklendi."
  },
  {
    "focusMuscle": "quads",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "squat",
    "preferredExerciseIds": [
      "back_squat",
      "front_squat",
      "hack_squat",
      "leg_press",
      "leg_extension"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Hinge hacmini tamamen kaldırma; diz toleransına göre seçim yap.",
    "userFacingCopyTr": "Quadriceps odağı için squat ve diz ekstansiyonu paternleri önceliklendirildi."
  },
  {
    "focusMuscle": "hamstrings",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "hinge,knee_flexion",
    "preferredExerciseIds": [
      "romanian_deadlift",
      "dumbbell_rdl",
      "leg_curl",
      "nordic_curl"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Deadlift gününe aşırı hinge ekleme; bel yorgunluğunu kontrol et.",
    "userFacingCopyTr": "Hamstring odağı için hinge ve knee-flexion dengesi güçlendirildi."
  },
  {
    "focusMuscle": "glutes",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "substitute_or_add",
    "targetMovementPattern": "hinge,lunge",
    "preferredExerciseIds": [
      "hip_thrust",
      "bulgarian_split_squat",
      "reverse_lunge",
      "romanian_deadlift"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Squat/hinge toplam yorgunluğunu aşma.",
    "userFacingCopyTr": "Glute odağı için kalça ekstansiyonu ve tek taraflı çalışma artırıldı."
  },
  {
    "focusMuscle": "calves",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "add_isolation",
    "targetMovementPattern": "calf_raise",
    "preferredExerciseIds": [
      "standing_calf_raise",
      "seated_calf_raise"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Seans süresini aşmamak için düşük öncelikli izolasyonla yer değiştir.",
    "userFacingCopyTr": "Calf odağı için ek doğrudan çalışma eklendi."
  },
  {
    "focusMuscle": "core",
    "goal": "general_fitness",
    "priority": "high",
    "actionType": "add_core",
    "targetMovementPattern": "anti_extension,anti_rotation",
    "preferredExerciseIds": [
      "ab_wheel",
      "plank",
      "dead_bug",
      "pallof_press",
      "hanging_leg_raise"
    ],
    "maxExtraDirectSetsWeek": 4,
    "maxFrequencyIncreasePerWeek": 1,
    "constraints": "Ana liftlerden önce yorucu core çalışması koyma.",
    "userFacingCopyTr": "Core odağı için antrenman sonuna kontrollü çalışma eklendi."
  }
] as const satisfies readonly ForgeAdaptationRule[];
