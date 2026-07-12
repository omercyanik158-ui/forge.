import type { AIProgramPriorityMuscle } from '@/types/aiProgram';
import type {
  EffortCeiling,
  FatigueBudget,
  MuscleVolumeTarget,
  SessionVolumeBlueprint,
  VolumeBand,
  VolumeEngineInput,
} from '@/types/aiProgramVolume';
import type { PriorityMuscleBucket } from '@/types/exerciseKB';

/**
 * Faz 5 — Volume, Intensity & Set/Rep Engine
 *
 * Faz 3 blueprint'inin volumeDirection alanını somut haftalık set hedeflerine
 * çevirir. Constitution'a uygun olarak tüm rakamlar kanıt ortalaması tahminleridir;
 * her hedefle birlikte rationale ve uncertainty notu taşınır.
 */

/**
 * AIProgramPriorityMuscle -> PriorityMuscleBucket eşlemesi. full_body_balance
 * özel bir bucket değil; dengeli çalışma anlamına gelir, bu yüzden null döner
 * (Faz 8 bunu "öncelik yok, tüm bucket'lar dengeli" olarak yorumlar).
 */
export function priorityMuscleToBucket(muscle: AIProgramPriorityMuscle): PriorityMuscleBucket | null {
  if (muscle === 'full_body_balance') return null;
  return muscle as PriorityMuscleBucket;
}

/**
 * Kas bucket'ı bazında hacim bantları (haftalık set).
 * Hypertrophy evidence ortalaması (Schoenfeld vb. meta-analizlerin genel
 * aralıkları). İnsanlar arası değişkenlik yüksektir.
 */
const VOLUME_BANDS: Record<PriorityMuscleBucket, VolumeBand> = {
  chest: { bucket: 'chest', mev: 8, mav: 12, mrv: 20 },
  shoulders: { bucket: 'shoulders', mev: 6, mav: 10, mrv: 16 },
  lats: { bucket: 'lats', mev: 8, mav: 12, mrv: 20 },
  upper_back: { bucket: 'upper_back', mev: 8, mav: 12, mrv: 20 },
  arms: { bucket: 'arms', mev: 6, mav: 8, mrv: 12 },
  glutes: { bucket: 'glutes', mev: 6, mav: 10, mrv: 16 },
  quads: { bucket: 'quads', mev: 8, mav: 12, mrv: 20 },
  hamstrings: { bucket: 'hamstrings', mev: 6, mav: 10, mrv: 16 },
  calves: { bucket: 'calves', mev: 8, mav: 12, mrv: 16 },
  core: { bucket: 'core', mev: 4, mav: 8, mrv: 12 },
};

const ALL_BUCKETS = Object.keys(VOLUME_BANDS) as PriorityMuscleBucket[];

function directionToFraction(direction: VolumeEngineInput['volumeDirection'], isPriority: boolean): number {
  switch (direction) {
    case 'conservative':
      return 0.05;
    case 'moderate':
      return 0.4;
    case 'moderate_high':
      return 0.6;
    case 'specialization':
      return isPriority ? 0.85 : 0.45;
  }
}

function experienceFactor(experience: VolumeEngineInput['experience'], isPriority: boolean): number {
  switch (experience) {
    case 'beginner':
      return 0.8;
    case 'returning':
      return 0.9;
    case 'intermediate':
      return 1.0;
    case 'advanced':
      // advanced bonus sadece öncelik kaslarına; diğerleri baseline
      return isPriority ? 1.1 : 1.0;
  }
}

function recoveryFactor(recovery: VolumeEngineInput['recoveryQuality']): number {
  switch (recovery) {
    case 'poor':
      return 0.8;
    case 'okay':
      return 1.0;
    case 'great':
      return 1.1;
  }
}

function baseFrequency(days: number, isPriority: boolean): number {
  let freq: number;
  if (days <= 2) freq = 1;
  else if (days === 3) freq = 2;
  else freq = 2;
  if (isPriority) freq = Math.min(3, freq + 1);
  return freq;
}

function buildVolumeTarget(
  bucket: PriorityMuscleBucket,
  input: VolumeEngineInput,
): MuscleVolumeTarget {
  const band = VOLUME_BANDS[bucket];
  const isPriority = input.priorityMuscles.includes(bucket);
  const fraction = directionToFraction(input.volumeDirection, isPriority);
  const expFactor = experienceFactor(input.experience, isPriority);
  const recFactor = recoveryFactor(input.recoveryQuality);

  const raw = band.mev + fraction * (band.mrv - band.mev);
  const modified = raw * expFactor * recFactor;
  const weeklySets = Math.max(3, Math.min(Math.round(modified), band.mrv));

  const frequency = baseFrequency(input.recommendedTrainingDays, isPriority);
  const perSessionSets = Math.max(1, Math.round(weeklySets / frequency));

  const rationaleParts: string[] = [
    `${input.volumeDirection.replace('_', ' ')} yönelim -> ${band.mev}-${band.mrv} bandında ${weeklySets} set`,
  ];
  if (isPriority) rationaleParts.push('öncelik kası olduğu için ek frekans/yoğunluk');
  if (input.experience === 'beginner') rationaleParts.push('başlangıç seviyesi nedeniyle düşürüldü');
  if (input.recoveryQuality === 'poor') rationaleParts.push('zayıf toparlanma nedeniyle düşürüldü');

  return {
    bucket,
    weeklySets,
    band,
    frequency,
    perSessionSets,
    isPriority,
    rationale: rationaleParts.join('; '),
  };
}

function buildEffortCeiling(experience: VolumeEngineInput['experience'], recovery: VolumeEngineInput['recoveryQuality']): EffortCeiling {
  let rirMin: number;
  let rirMax: number;
  switch (experience) {
    case 'beginner':
      rirMin = 2;
      rirMax = 4;
      break;
    case 'returning':
      rirMin = 2;
      rirMax = 3;
      break;
    case 'intermediate':
      rirMin = 1;
      rirMax = 3;
      break;
    case 'advanced':
      rirMin = 0;
      rirMax = 2;
      break;
  }
  if (recovery === 'poor') {
    rirMin += 1;
    rirMax += 1;
  }
  const recoveryNote = recovery === 'poor' ? ' Zayıf toparlanma RIR tavanını yükseltti (daha az yorgunluk).' : '';
  return {
    rirMin,
    rirMax,
    rationale: `${experience} seviyesi için RIR ${rirMin}-${rirMax} hedeflendi.${recoveryNote}`,
  };
}

function buildFatigueBudget(input: VolumeEngineInput): FatigueBudget {
  let weeklyBase: number;
  switch (input.experience) {
    case 'beginner':
      weeklyBase = 40;
      break;
    case 'returning':
      weeklyBase = 48;
      break;
    case 'intermediate':
      weeklyBase = 60;
      break;
    case 'advanced':
      weeklyBase = 70;
      break;
  }
  if (input.recoveryQuality === 'poor') weeklyBase -= 12;
  if (input.recoveryQuality === 'great') weeklyBase += 8;
  weeklyBase = Math.max(24, weeklyBase);

  // Tek seans: her set ~3 dakika (çalışma + dinlenme) tahminiyle.
  const perSession = Math.max(8, Math.round(input.sessionDurationMin / 3));

  return {
    weeklySetCeiling: weeklyBase,
    perSessionSetCeiling: perSession,
    rationale: `${input.experience} + ${input.recoveryQuality} toparlanma için haftalık ${weeklyBase} set tavanı; ${input.sessionDurationMin} dakika seans için ${perSession} set/seans.`,
  };
}

export function buildSessionVolumeBlueprint(input: VolumeEngineInput): SessionVolumeBlueprint {
  const targets = ALL_BUCKETS.map((bucket) => buildVolumeTarget(bucket, input));
  const totalWeeklySets = targets.reduce((sum, target) => sum + target.weeklySets, 0);
  const effort = buildEffortCeiling(input.experience, input.recoveryQuality);
  const fatigue = buildFatigueBudget(input);

  const assumptions: string[] = [
    `${input.recommendedTrainingDays} gün split'i kas sıklığını dengeli dağıttığı varsayıldı.`,
    `${input.sessionDurationMin} dakika seans süreleri set sayısını sınırlar.`,
  ];
  if (input.experience === 'beginner' || input.experience === 'returning') {
    assumptions.push('Düşük deneyim seviyesi tolere edilebilir hacmi sınırlar.');
  }
  if (input.recoveryQuality === 'poor') {
    assumptions.push('Zayıf toparlanma tüm hacim ve çaba hedeflerini düşürdü.');
  }

  const uncertaintyNotes: string[] = [
    'Hacim bantları popülasyon ortalamasıdır; bireysel tolerans değişir.',
    'MEV/MAV/MRV literatür tahminleridir, kesin sınır değildir.',
  ];
  if (totalWeeklySets > fatigue.weeklySetCeiling) {
    uncertaintyNotes.push(
      `Toplam haftalık set (${totalWeeklySets}) yorgunluk tavanını (${fatigue.weeklySetCeiling}) aşıyor; Faz 6 seans dağılımını ölçeklendirmeli.`,
    );
  }

  return {
    targets,
    totalWeeklySets,
    effort,
    fatigue,
    assumptions,
    uncertaintyNotes,
  };
}
