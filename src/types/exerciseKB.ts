import type { AIProgramEquipmentKey, AIProgramPainLimitation } from './aiProgram';

/**
 * Faz 4 — Exercise Knowledge Base & Taxonomy
 *
 * Bu katman, egzersiz kataloğunun (src/data/exercises.ts) üzerinde duran
 * programlama amaçlı metadata overlay'idir. Katalog isim ve görsel sağlar;
 * bu katman hareketin programlama anlamını (pattern, kas rolü, yorgunluk
 * maliyeti, ekipman/ağrı uyumu) sağlar.
 *
 * Constitution (FORGE_AI_CONSTITUTION.md) bu katmanın tahrif edilmesini
 * yasaklar: uydurulmuş S:F oranı, uydurulmuş eklem yükü veya uydurulmuş
 * kanıt güveni kabul edilemez. Bu yüzden her alan kanıt güveni seviyesi
 * taşır ve S:F "bant" olarak ifade edilir (low/moderate/high), asla sahte
 * nokta tahmini olarak değil.
 */

/**
 * Biyomekanik hareket deseni. Mevcut hareket havuzunu pattern bazlı
 * kapsama ve tekrar önlemeye (redundancy prevention) olanak tanır.
 */
export type MovementPattern =
  | 'horizontal_push' // bench, pushup, dumbbell press
  | 'vertical_push' // overhead press
  | 'shoulder_abduction' // lateral raise (yan omuz izolasyonu)
  | 'horizontal_pull' // row varyasyonları
  | 'vertical_pull' // pulldown, pullup
  | 'scapular_retraction' // face pull, back fly
  | 'squat_pattern' // squat, leg press
  | 'hinge_pattern' // deadlift, RDL, good morning
  | 'lunge_pattern' // lunge, split squat
  | 'knee_extension' // leg extension
  | 'knee_flexion' // leg curl
  | 'hip_extension' // hip thrust, bridge
  | 'plantar_flexion' // calf raise
  | 'elbow_flexion' // bicep curl
  | 'elbow_extension' // tricep extension
  | 'core_anti_extension' // plank, dead bug, ab wheel
  | 'core_flexion' // crunch
  | 'core_anti_rotation' // side bridge, pallof
  | 'core_rotation' // russian twist, windmill
  | 'conditioning' // air bike, mobility, ısınma
  | 'carry'; // farmer walk

/**
 * Anatomik kas rolü. AIProgramPriorityMuscle'dan daha ince tannelidir
 * (omuzu front/side/rear, göğsü upper/mid/lower olarak ayırır). Faz 5/6,
 * MuscleRole -> AIProgramPriorityMuscle eşlemesiyle hacim/öncelik dağıtımı yapacak.
 */
export type MuscleRole =
  | 'upper_chest'
  | 'mid_chest'
  | 'lower_chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'lats'
  | 'upper_back'
  | 'traps'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'upper_abs'
  | 'obliques'
  | 'lower_back'
  | 'glutes'
  | 'quads'
  | 'quads_rectus'
  | 'quads_vastus'
  | 'hamstrings'
  | 'calves'
  | 'gastrocnemius'
  | 'soleus'
  | 'adductors';

/**
 * Hareket kategorisi. Sıralama ve yorgunluk bütçesinde kullanılır:
 * compound (çok eklemli, yüksek sistemik yük) once, izolasyon sonra.
 */
export type ExerciseCategory = 'compound' | 'accessory' | 'isolation';

/**
 * Stimulus-to-fatigue bandı. Kanıt ortalama popülasyon tahminleridir,
 * nokta tahmini değildir. Constitution uncertainty policy gereği bant
 * olarak ifade edilir.
 *
 * - low: az yorgunluk, bol set verilebilir (lateral raise, leg extension)
 * - moderate: orta (dumbbell press, cable row)
 * - high: yüksek sistemik yük, dikkatli dozaj (deadlift, barbell squat)
 */
export type StimulusToFatigue = 'low' | 'moderate' | 'high';

/**
 * Eklem yükü seviyesi, AIProgramPainLimitation alanlarına göre.
 * Faz 6, ağrı bildiren kullanıcılar için hareket filtrelemede kullanır.
 */
export type JointDemandLevel = 'minimal' | 'low' | 'moderate' | 'high';

/**
 * Belirli bir ağrı/limitasyon için hareket uyumu.
 * - preferred: bu limitasyon için güvenli alternatif
 * - acceptable: nötr
 * - caution: dikkatli olunmalı
 * - avoid: kaçınılmalı
 */
export type PainCompatibility = 'preferred' | 'acceptable' | 'caution' | 'avoid';

/**
 * İlerleme arketipi. Faz 7 (progression) bunu okuyarak her harekete
 * uygun ilerleme şeması seçer (yük-led, teknik-led, pompa, dayanıklılık).
 */
export type ProgressionArchetype = 'load_led' | 'technique_led' | 'pump' | 'endurance';

export type JointDemands = Partial<Record<Exclude<AIProgramPainLimitation, 'none' | 'other'>, JointDemandLevel>>;

/**
 * Tek bir egzersizin programlama metadatası. exerciseId alanı src/data/exercises.ts
 * kataloğundaki bir id'ye eşleşmek ZORUNDA; aksi halde Faz 8 program
 * seviye doğrulayıcısı reddeder ve session player sessizce düşürür.
 */
export type ExerciseProgrammingMeta = {
  exerciseId: string;
  pattern: MovementPattern;
  /**
   * Aynı pattern içindeki açı/bölge varyantı (örn. flat vs incline bench).
   * Yalnızca push pattern'lerinde anlamlıdır; belirtilmezse pattern'in
   * kendisi tek diversity anahtarı olarak kullanılır. Faz 6 seçim motoru
   * bunu pattern ile birleştirip "aynı bölgeyi iki kez seçme" hatasını önler.
   */
  angleVariant?: 'flat' | 'incline' | 'decline';
  primaryMuscles: MuscleRole[];
  secondaryMuscles: MuscleRole[];
  category: ExerciseCategory;
  stimulusToFatigue: StimulusToFatigue;
  jointDemands: JointDemands;
  painCompatibility: Partial<Record<AIProgramPainLimitation, PainCompatibility>>;
  equipment: AIProgramEquipmentKey[];
  progressionArchetype: ProgressionArchetype;
  defaultSetBand: { min: number; max: number };
  defaultRepRange: { min: number; max: number };
  defaultRestSeconds: number;
  defaultRir: number;
  evidenceConfidence: 'low' | 'moderate' | 'high';
};

/**
 * Değiştirme indeksi girişi: aynı biyomekanik amaca hizmet eden
 * hareket grubu. Faz 6 (seçim) ve Faz 9 (swap) bunu kullanır.
 * Bir grubun üyeleri birbirinin alternatifi kabul edilir, ancak
 * ekipman ve ağrı uyumu yine Faz 6'da filtrelenir.
 */
export type ReplacementGroup = {
  id: string;
  pattern: MovementPattern;
  primaryMuscle: MuscleRole;
  exerciseIds: string[];
  rationale: string;
};

/**
 * Faz 5'in MuscleRole -> AIProgramPriorityMuscle eşlemesi için yardımcı.
 * Bir hareketin "hangi öncelik kasına" hizmet ettiğini söyler.
 */
export type PriorityMuscleBucket =
  | 'chest'
  | 'shoulders'
  | 'lats'
  | 'upper_back'
  | 'arms'
  | 'glutes'
  | 'quads'
  | 'hamstrings'
  | 'calves'
  | 'core';
