import type { AIProgramPainLimitation } from './aiProgram';

/**
 * Faz 10 — Adaptive Loop
 *
 * Bu faz, antrenman sonuçlarından programa geri besleme sağlar:
 * seans bazlı RIR/RPE/ağrı yakalama, plato tespiti, autoregülasyon
 * ve blok bazlı geçiş önerileri. Constitution: reaktif kararlar ölçülü
 * ve açıklanabilirdir; belirsizlikte güvenli tarafa kayar.
 */

/**
 * Seans bazlı geri besleme. WorkoutLog'a RIR/RPE eklemek yerine ayrı
 * kayıt olarak tutulur (WorkoutLog şemasını bozmamak için). Kullanıcı
 * seans bitiminde bu veriyi opsiyonel girer.
 */
export type SessionFeedback = {
  id: string;
  planId?: string;
  programDayId?: string;
  exerciseIds: string[];
  completedAt: string;
  /** Algılanan zorluk 1-10 (RPE). */
  perceivedExertion: number;
  /** Ortalama tekrar yedeği (RIR). */
  averageRir: number;
  /** Seans sırasında/sonrasında bildirilen ağrı/limitasyon. */
  painReported: AIProgramPainLimitation[];
  /** Sonraki gün toparlanma algısı. */
  recoveryNextDay: 'poor' | 'okay' | 'good';
  notes?: string;
};

export type PlateauAssessment = {
  exerciseId: string;
  exerciseName: string;
  isStalled: boolean;
  /** İlerleme olmayan son seans sayısı. */
  sessionsWithoutProgress: number;
  recommendation: 'deload' | 'volume_adjust' | 'continue' | 'technique_focus';
  rationale: string;
};

export type AutoregulationTrigger =
  | 'high_rpe_trend'
  | 'low_rpe_trend'
  | 'pain_reported'
  | 'poor_recovery'
  | 'plateau_detected'
  | 'strong_progress';

export type AutoregulationAdjustment = {
  /** -1 hacim düşür, 0 aynı, +1 hacım artır. */
  volumeChange: number;
  /** -1 intensity düşür, 0 aynı, +1 intensity artır. */
  intensityChange: number;
  suggestDeload: boolean;
  triggers: AutoregulationTrigger[];
  rationale: string;
};

export type BlockTransitionRecommendation = {
  recommendation: 'progress' | 'maintain' | 'deload_reset' | 'change_focus';
  volumeDirectionTarget: 'conservative' | 'moderate' | 'moderate_high' | 'specialization';
  rationale: string;
  confidence: 'low' | 'medium' | 'high';
};
