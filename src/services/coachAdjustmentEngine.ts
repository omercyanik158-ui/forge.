import { computeAutoregulation } from './aiProgramAutoregulation';
import { assessAllPlateaus } from './aiProgramPlateauDetector';
import type { ExerciseStrengthProgress } from './strengthProgress';
import type { CycleIntensity } from './personalCoach';
import type { SessionFeedback } from '@/types/aiProgramFeedback';
import type {
  CoachAdjustment,
  CoachAdjustmentDecision,
  CoachAdjustmentReason,
  WeeklyCoachReview,
} from '@/types/coachAdjustment';
import type { AIProgramPainLimitation } from '@/types/aiProgram';
import type { AIProgramPlan } from '@/types/aiProgramPlan';

type CoachAdjustmentInput = {
  plan?: AIProgramPlan | null;
  feedbacks: SessionFeedback[];
  strengthProgress: ExerciseStrengthProgress[];
  cycleIntensity?: CycleIntensity;
  physiqueFocusMuscles?: string[];
};

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function collectPain(feedbacks: SessionFeedback[]): AIProgramPainLimitation[] {
  return unique(
    feedbacks
      .flatMap((item) => item.painReported)
      .filter((item) => item !== 'none'),
  );
}

function reasonFromTrigger(trigger: string): CoachAdjustmentReason | null {
  if (trigger === 'high_rpe_trend') return 'high_rpe_trend';
  if (trigger === 'poor_recovery') return 'poor_recovery';
  if (trigger === 'pain_reported') return 'pain_reported';
  if (trigger === 'plateau_detected') return 'plateau_detected';
  if (trigger === 'strong_progress') return 'strong_progress';
  return null;
}

function confidenceFor(feedbackCount: number, reasonCount: number): CoachAdjustment['confidence'] {
  if (feedbackCount >= 4 && reasonCount >= 2) return 'high';
  if (feedbackCount >= 2 || reasonCount >= 2) return 'medium';
  return 'low';
}

function textForDecision(decision: CoachAdjustmentDecision): Pick<CoachAdjustment, 'title' | 'summary' | 'nextSessionFocus'> {
  switch (decision) {
    case 'progress':
      return {
        title: 'Küçük progresyon hazır',
        summary: 'Verini gördük; iyi toparlanma ve rahat efor sinyali nedeniyle sıradaki seansta küçük ilerleme alanı var.',
        nextSessionFocus: 'Form bozulmadan ağırlık veya tekrar artışını küçük tut.',
      };
    case 'reduce_volume':
      return {
        title: 'Hacim biraz azaltıldı',
        summary: 'Son sinyaller yorgunluk biriktiğini gösteriyor; program aynı kalırken sıradaki yük daha kontrollü tutulacak.',
        nextSessionFocus: 'Ana hareketleri temiz tamamla, ekstra set kovalamadan çık.',
      };
    case 'reduce_intensity':
      return {
        title: 'Efor yumuşatıldı',
        summary: 'RPE, toparlanma veya döngü sinyali nedeniyle sıradaki seansta daha fazla tekrar yedeği bırakılacak.',
        nextSessionFocus: 'RIR hedefini koru; zorlamayı son sete taşıma.',
      };
    case 'deload':
      return {
        title: 'Toparlanma haftası önerildi',
        summary: 'Ağrı, plato veya yüksek yorgunluk sinyali nedeniyle bu hafta yükü belirgin yumuşatmak daha güvenli.',
        nextSessionFocus: 'Teknik, hareket açıklığı ve rahat tempo öncelikli.',
      };
    case 'swap_exercise':
      return {
        title: 'Hareket değişimi önerildi',
        summary: 'Ağrı sinyali olduğu için aynı kas grubunu daha uyumlu bir hareketle çalışmak daha doğru olabilir.',
        nextSessionFocus: 'Ağrı oluşturan hareketi zorlamadan alternatif seç.',
      };
    case 'repeat_week':
      return {
        title: 'Haftayı tekrar et',
        summary: 'Performans sinyali henüz bir üst adıma hazır görünmüyor; aynı haftayı daha temiz tamamlamak daha iyi.',
        nextSessionFocus: 'Aynı hedefleri daha stabil tekrar etmeye odaklan.',
      };
    case 'maintain':
    default:
      return {
        title: 'Plan korunuyor',
        summary: 'Belirgin risk veya güçlü artış sinyali yok; mevcut plan aynı ritimde devam edecek.',
        nextSessionFocus: 'Logları düzenli tut; kararlar daha netleşecek.',
      };
  }
}

function chooseDecision(params: {
  reasons: CoachAdjustmentReason[];
  pain: AIProgramPainLimitation[];
  stalledCount: number;
  suggestDeload: boolean;
  volumeChange: number;
  intensityChange: number;
}): CoachAdjustmentDecision {
  if (params.pain.length > 0) return 'swap_exercise';
  if (params.suggestDeload || params.stalledCount >= 3) return 'deload';
  if (params.stalledCount >= 2) return 'repeat_week';
  if (params.reasons.includes('cycle_lighter')) return 'reduce_intensity';
  if (params.volumeChange < 0) return 'reduce_volume';
  if (params.intensityChange < 0) return 'reduce_intensity';
  if (params.volumeChange > 0 || params.intensityChange > 0) return 'progress';
  return 'maintain';
}

export function buildCoachAdjustment(input: CoachAdjustmentInput): Omit<CoachAdjustment, 'id' | 'createdAt'> {
  const planFeedbacks = input.plan?.id
    ? input.feedbacks.filter((item) => item.planId === input.plan?.id)
    : input.feedbacks;
  const recentFeedbacks = planFeedbacks.slice(0, 5);
  const plateaus = assessAllPlateaus(input.strengthProgress);
  const autoregulation = computeAutoregulation(recentFeedbacks, plateaus);
  const pain = collectPain(recentFeedbacks);
  const stalled = plateaus.filter((item) => item.isStalled);
  const reasons = unique([
    ...autoregulation.triggers.map(reasonFromTrigger).filter((item): item is CoachAdjustmentReason => item !== null),
    ...(input.cycleIntensity === 'lighter' ? ['cycle_lighter' as const] : []),
    ...((input.physiqueFocusMuscles?.length ?? 0) > 0 ? ['physique_focus' as const] : []),
  ]);
  const finalReasons = reasons.length > 0 ? reasons : ['insufficient_data' as const];
  const decision = chooseDecision({
    reasons: finalReasons,
    pain,
    stalledCount: stalled.length,
    suggestDeload: autoregulation.suggestDeload,
    volumeChange: autoregulation.volumeChange,
    intensityChange: autoregulation.intensityChange,
  });
  const copy = textForDecision(decision);

  return {
    planId: input.plan?.id,
    programDayId: input.plan?.weeks[0]?.days[0]?.id,
    decision,
    reasons: finalReasons,
    title: copy.title,
    summary: copy.summary,
    nextSessionFocus: copy.nextSessionFocus,
    confidence: confidenceFor(recentFeedbacks.length, finalReasons.length),
    affectedExerciseIds: unique(stalled.map((item) => item.exerciseId)),
    painReported: pain,
  };
}

export function buildWeeklyCoachReview(adjustment: CoachAdjustment): WeeklyCoachReview {
  return {
    id: `weekly-review-${adjustment.id}`,
    createdAt: adjustment.createdAt,
    planId: adjustment.planId,
    observed: adjustment.reasons.includes('insufficient_data')
      ? 'Henüz sınırlı veri var; FORGE önce ritmini izliyor.'
      : adjustment.summary,
    adjustment: adjustment.title,
    rationale: adjustment.reasons.join(', '),
    nextFocus: adjustment.nextSessionFocus,
    latestAdjustment: adjustment,
  };
}
