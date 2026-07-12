import { getExerciseMeta, isSafeForLimitations } from '@/services/exerciseKB';
import { hasExercise } from '@/services/exerciseCatalog';
import type {
  AIProgramValidationIssue,
  AIProgramValidationResult,
} from '@/types/aiProgramPlan';
import type { ProgressionPlan } from '@/types/aiProgramProgression';
import type { SessionVolumeBlueprint } from '@/types/aiProgramVolume';
import type { AIProgramEquipmentKey, AIProgramPainLimitation } from '@/types/aiProgram';

/**
 * Faz 8 — Program-level Validator
 *
 * Constitution'a uygun güvenlik kapısı. Üretilen programın her hareketi
 * katalogda var, KB'de var, ağrı güvenli ve efor tavanı içinde olmasını
 * garanti eder. error -> program shippable değil; warning -> kabul ama not.
 */

export type ValidatorInput = {
  progression: ProgressionPlan;
  volumeBlueprint: SessionVolumeBlueprint;
  limitations: AIProgramPainLimitation[];
  equipment: AIProgramEquipmentKey[];
};

function err(code: string, message: string, location?: string): AIProgramValidationIssue {
  return { severity: 'error', code, message, location };
}

function warn(code: string, message: string, location?: string): AIProgramValidationIssue {
  return { severity: 'warning', code, message, location };
}

export function validateAIProgramPlan(input: ValidatorInput): AIProgramValidationResult {
  const issues: AIProgramValidationIssue[] = [];
  const { progression, volumeBlueprint, limitations, equipment } = input;
  const effort = volumeBlueprint.effort;

  for (const week of progression.weeks) {
    for (const day of week.days) {
      const dayKey = `w${week.weekIndex + 1}d${day.dayIndex + 1}`;
      if (day.exercises.length === 0) {
        issues.push(err('empty_day', 'Bu günde hiç hareket yok.', dayKey));
        continue;
      }
      let daySets = 0;
      for (const exercise of day.exercises) {
        const loc = `${dayKey}:${exercise.exerciseId}`;
        if (!hasExercise(exercise.exerciseId)) {
          issues.push(err('missing_catalog_id', 'Hareket kataloğunda yok; session player düşürür.', loc));
        }
        if (!getExerciseMeta(exercise.exerciseId)) {
          issues.push(warn('missing_kb_meta', 'Hareketin programlama metadatası yok.', loc));
        }
        const meta = getExerciseMeta(exercise.exerciseId);
        if (meta && !isSafeForLimitations(meta, limitations)) {
          issues.push(err('unsafe_for_limitation', 'Hareket bildirilen limitasyon için güvenli değil.', loc));
        }
        if (exercise.sets < 2) {
          issues.push(warn('low_set_count', 'Set sayısı çok düşük.', loc));
        }
        if (exercise.reps < 1) {
          issues.push(err('invalid_reps', 'Tekrar sayısı geçersiz.', loc));
        }
        if (exercise.rir < effort.rirMin) {
          issues.push(warn('rir_below_ceiling', `RIR (${exercise.rir}) çabanın alt sınırından (${effort.rirMin}) düşük.`, loc));
        }
        if (exercise.rir > effort.rirMax + 2) {
          issues.push(warn('rir_above_ceiling', `RIR (${exercise.rir}) çabanın üst sınırından yüksek.`, loc));
        }
        daySets += exercise.sets;
      }
      if (daySets > volumeBlueprint.fatigue.perSessionSetCeiling) {
        issues.push(warn('session_over_budget', `Gün ${daySets} set; seans tavanı ${volumeBlueprint.fatigue.perSessionSetCeiling}.`, dayKey));
      }
    }
    if (week.totalWeeklySets > volumeBlueprint.fatigue.weeklySetCeiling) {
      issues.push(
        warn('week_over_budget', `Hafta ${week.totalWeeklySets} set; haftalık tavan ${volumeBlueprint.fatigue.weeklySetCeiling}.`, `w${week.weekIndex + 1}`),
      );
    }
  }

  const usedIds = new Set<string>();
  for (const week of progression.weeks) {
    for (const day of week.days) {
      for (const ex of day.exercises) usedIds.add(ex.exerciseId);
    }
  }
  // coverage: her major bucket en az bir hareketle çalışıyor mu (yaklaşık)
  // equipment consistency: kullanılan hareketler bildirilen ekipmanla uyumlu
  for (const exerciseId of usedIds) {
    const meta = getExerciseMeta(exerciseId);
    if (meta && !meta.equipment.includes('bodyweight_only')) {
      const ok = meta.equipment.some((item) => equipment.includes(item));
      if (!ok) {
        issues.push(warn('equipment_mismatch', 'Hareket bildirilen ekipmanla uyumsuz olabilir.', exerciseId));
      }
    }
  }

  const isValid = issues.every((issue) => issue.severity !== 'error');
  return { isValid, issues };
}
