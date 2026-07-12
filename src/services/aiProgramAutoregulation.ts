import type { SessionFeedback, PlateauAssessment, AutoregulationAdjustment, AutoregulationTrigger, BlockTransitionRecommendation } from '@/types/aiProgramFeedback';

/**
 * Faz 10 — Autoregulation Engine
 *
 * Seans geri bildirimleri + plato tespitlerinden hacim/intensity ayarlama
 * önerisi üretir. Constitution: belirsizlikte güvenli tarafa kayar; yüksek
 * RPE/ağrı/zayıf toparlanma her zaman hacmi düşürür.
 */

const HIGH_RPE_THRESHOLD = 8.5;
const RECENT_FEEDBACK_WINDOW = 5;

function averageRpe(feedbacks: SessionFeedback[]): number {
  if (feedbacks.length === 0) return 0;
  return feedbacks.reduce((sum, f) => sum + f.perceivedExertion, 0) / feedbacks.length;
}

function averageRir(feedbacks: SessionFeedback[]): number {
  if (feedbacks.length === 0) return 0;
  return feedbacks.reduce((sum, f) => sum + f.averageRir, 0) / feedbacks.length;
}

export function computeAutoregulation(feedbacks: SessionFeedback[], plateaus: PlateauAssessment[]): AutoregulationAdjustment {
  const triggers: AutoregulationTrigger[] = [];
  const recent = feedbacks.slice(0, RECENT_FEEDBACK_WINDOW);
  const avgRpe = averageRpe(recent);
  const avgRir = averageRir(recent);

  const anyPain = recent.some((f) => f.painReported.some((p) => p !== 'none' && p !== 'other'));
  const poorRecovery = recent.length > 0 && recent.filter((f) => f.recoveryNextDay === 'poor').length >= Math.ceil(recent.length / 2);
  const stalledCount = plateaus.filter((p) => p.isStalled).length;
  const strongProgress = recent.length >= 3 && avgRir >= 3 && !anyPain && stalledCount === 0;

  let volumeChange = 0;
  let intensityChange = 0;
  let suggestDeload = false;

  if (anyPain) {
    triggers.push('pain_reported');
    volumeChange = -1;
    intensityChange = -1;
  }
  if (poorRecovery) {
    triggers.push('poor_recovery');
    volumeChange = Math.min(volumeChange, -1);
  }
  if (avgRpe >= HIGH_RPE_THRESHOLD && recent.length >= 2) {
    triggers.push('high_rpe_trend');
    volumeChange = Math.min(volumeChange, -1);
  }
  if (stalledCount >= 2) {
    triggers.push('plateau_detected');
    suggestDeload = stalledCount >= 3;
    if (!suggestDeload) volumeChange = Math.min(volumeChange, 0);
  }
  if (strongProgress && triggers.length === 0) {
    triggers.push('strong_progress');
    volumeChange = 1;
    intensityChange = 1;
  }

  const rationaleParts: string[] = [];
  if (avgRpe > 0) rationaleParts.push(`ortalama RPE ${avgRpe.toFixed(1)}`);
  if (avgRir > 0) rationaleParts.push(`ortalama RIR ${avgRir.toFixed(1)}`);
  if (anyPain) rationaleParts.push('ağrı bildirildi');
  if (poorRecovery) rationaleParts.push('zayıf toparlanma eğilimi');
  if (stalledCount > 0) rationaleParts.push(`${stalledCount} harekette plato`);
  if (strongProgress) rationaleParts.push('güçlü ilerleme');

  return {
    volumeChange,
    intensityChange,
    suggestDeload,
    triggers,
    rationale: rationaleParts.length > 0 ? rationaleParts.join('; ') : 'Yeterli veri yok; mevcut planı koru.',
  };
}

/**
 * Bir bloğun tüm geri bildirim ve plato verisinden sonraki blok önerisi.
 */
export function recommendBlockTransition(
  feedbacks: SessionFeedback[],
  plateaus: PlateauAssessment[],
  currentVolumeDirection: 'conservative' | 'moderate' | 'moderate_high' | 'specialization',
): BlockTransitionRecommendation {
  const adjustment = computeAutoregulation(feedbacks, plateaus);
  const stalled = plateaus.filter((p) => p.isStalled).length;
  const painPresent = feedbacks.some((f) => f.painReported.some((p) => p !== 'none' && p !== 'other'));

  if (adjustment.suggestDeload || painPresent) {
    return {
      recommendation: 'deload_reset',
      volumeDirectionTarget: 'conservative',
      rationale: 'Ağrı veya yaygın plato nedeniyle toparlanma öncelikli; bir alt hacim seviyesine dön.',
      confidence: stalled >= 3 ? 'high' : 'medium',
    };
  }

  if (adjustment.volumeChange < 0) {
    return {
      recommendation: 'maintain',
      volumeDirectionTarget: 'moderate',
      rationale: 'Yüksek RPE veya zayıf toparlanma; hacmi artırmadan aynı seviyeyi koru.',
      confidence: 'medium',
    };
  }

  if (adjustment.volumeChange > 0 && currentVolumeDirection !== 'specialization') {
    return {
      recommendation: 'progress',
      volumeDirectionTarget: currentVolumeDirection === 'conservative' ? 'moderate' : 'moderate_high',
      rationale: 'Güçlü ilerleme ve iyi toparlanma; bir kademe hacim artışı ölçülü.',
      confidence: 'medium',
    };
  }

  return {
    recommendation: 'maintain',
    volumeDirectionTarget: currentVolumeDirection,
    rationale: 'Belirgin sinyal yok; mevcut hacmi koru ve ilerlemeyi izle.',
    confidence: 'low',
  };
}
