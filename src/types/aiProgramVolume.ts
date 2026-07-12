import type {
  AIProgramExperience,
  AIProgramRecoveryQuality,
} from './aiProgram';
import type { PriorityMuscleBucket } from './exerciseKB';

/**
 * Faz 5 — Volume, Intensity & Set/Rep Architecture
 *
 * Bu faz, Faz 3 karar motorunun ürettiği AIProgramDecisionBlueprint'in
 * volumeDirection alanını (conservative / moderate / moderate_high /
 * specialization) somut haftalık set hedeflerine çevirir.
 *
 * Constitution uncertainty policy gereği tüm rakamlar KANIT ORTALAMASI
 * tahminleridir, nokta tahminleri değildir. MEV/MAV/MRV bantları literatür
 * ortalamasıdır ve bireysel tolerans değişir; bu yüzden her hedefle birlikte
 * rationale ve uncertaintyNotes taşınır.
 */

/**
 * Bir kas bucket'ı için hacim bandı (haftalık set).
 * - mev: minimum etkili hacim (maintenance/entry)
 * - mav: maksimum uyarlanabilir hacim (optimal uyarı bölgesi)
 * - mrv: maksimum toparlanabilir hacim (üst sınır)
 *
 * Değerler hypertrophy evidence ortalamasıdır (Schoenfeld ve benzeri
 * meta-analiz/pozisyon bildirilerinin genel aralıkları). İnsanlar arası
 * değişkenlik yüksektir; bu yüzden bant olarak sunulur.
 */
export type VolumeBand = {
  bucket: PriorityMuscleBucket;
  mev: number;
  mav: number;
  mrv: number;
};

/**
 * Tek bir kas bucket'ı için nihai haftalık hacim hedefi.
 */
export type MuscleVolumeTarget = {
  bucket: PriorityMuscleBucket;
  /** Nihai haftalık set hedefi (modifiye edilmis). */
  weeklySets: number;
  /** Ham kanıt bandı (modifiye öncesi referans). */
  band: VolumeBand;
  /** Haftalık sıklık (kaç seansta dağıtılacağı). */
  frequency: number;
  /** Tek seans başına düşen set sayısı (weeklySets / frequency, yuvarlanmış). */
  perSessionSets: number;
  isPriority: boolean;
  rationale: string;
};

/**
 * Çaba tavanı: RIR (reps in reserve) bandı. Faz 7 progression ve Faz 6
 * set/rep seçimi bunu kullanır. Constitution: düşük güven yüksek çabaya
 * izin vermez.
 */
export type EffortCeiling = {
  rirMin: number;
  rirMax: number;
  rationale: string;
};

/**
 * Yorgunluk bütçesi: toplam haftalık ve tek seans set üst sınırları.
 * Bunlar güvenlik tavanıdır; Faz 6 bunları aşamaz.
 */
export type FatigueBudget = {
  weeklySetCeiling: number;
  perSessionSetCeiling: number;
  rationale: string;
};

/**
 * Faz 5'in ana çıktısı. Faz 6 (seçim) ve Faz 7 (ilerleme) bunu tüketir.
 */
export type SessionVolumeBlueprint = {
  targets: MuscleVolumeTarget[];
  totalWeeklySets: number;
  effort: EffortCeiling;
  fatigue: FatigueBudget;
  assumptions: string[];
  uncertaintyNotes: string[];
};

/**
 * Faz 5 motoruna girdi. Faz 8 orkestratörü bunu context + blueprint'ten
 * hazırlar.
 */
export type VolumeEngineInput = {
  volumeDirection: 'conservative' | 'moderate' | 'moderate_high' | 'specialization';
  recommendedTrainingDays: number;
  sessionDurationMin: number;
  experience: AIProgramExperience;
  recoveryQuality: AIProgramRecoveryQuality;
  priorityMuscles: PriorityMuscleBucket[];
};
