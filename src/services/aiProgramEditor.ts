import { hasExercise } from '@/services/exerciseCatalog';
import { getExerciseMeta, hasExerciseMeta, isSafeForLimitations } from '@/services/exerciseKB';
import type {
  EditContext,
  EditOperation,
  EditResult,
} from '@/types/aiProgramEdit';
import type { AIDayPrescription, AIProgramPlan } from '@/types/aiProgramPlan';

/**
 * Faz 9 (tam) — Program Editor
 *
 * AIProgramPlan üzerinde güvenli, guardrail'li düzenleme. Her operasyon
 * immutable: yeni plan döndürür. Güvenlik (pain/equipment) ihlali durumunda
 * operasyon uygulanır ama warning verilir; kullanıcının bilinçli kararı
 * korunur. Katalog bütünlüğü (geçersiz exerciseId) ihlali durumunda operasyon
 * reddedilir (session player sessizce düşürür).
 */

function clonePlan(plan: AIProgramPlan): AIProgramPlan {
  return JSON.parse(JSON.stringify(plan)) as AIProgramPlan;
}

function recomputeDayAggregates(day: AIDayPrescription): void {
  day.totalSets = day.exercises.reduce((sum, e) => sum + e.sets, 0);
  day.durationMin = Math.round(day.totalSets * 3);
  day.exerciseIds = day.exercises.map((e) => e.exerciseId);
}

function applyReplaceExercise(
  plan: AIProgramPlan,
  operation: Extract<EditOperation, { type: 'replaceExercise' }>,
  context: EditContext,
  warnings: string[],
): boolean {
  const week = plan.weeks[operation.weekIndex];
  const day = week?.days[operation.dayIndex];
  if (!day) return false;
  const exercise = day.exercises[operation.exerciseIndex];
  if (!exercise) return false;

  if (!hasExercise(operation.newExerciseId)) {
    warnings.push('Yeni hareket kataloğunda yok; değişiklik reddedildi.');
    return false;
  }
  if (!hasExerciseMeta(operation.newExerciseId)) {
    warnings.push('Yeni hareketin programlama metadatası yok; ilerleme takibi sınırlı olabilir.');
  }
  const meta = getExerciseMeta(operation.newExerciseId);
  if (meta && !isSafeForLimitations(meta, context.limitations)) {
    warnings.push('Yeni hareket bildirilen limitasyon için ideal olmayabilir; bilinçli seçim olarak uygulandı.');
  }
  exercise.exerciseId = operation.newExerciseId;
  recomputeDayAggregates(day);
  return true;
}

function applyUpdatePrescription(
  plan: AIProgramPlan,
  operation: Extract<EditOperation, { type: 'updatePrescription' }>,
  warnings: string[],
): boolean {
  const week = plan.weeks[operation.weekIndex];
  const day = week?.days[operation.dayIndex];
  if (!day) return false;
  const exercise = day.exercises[operation.exerciseIndex];
  if (!exercise) return false;

  if (operation.sets !== undefined) {
    if (operation.sets < 1 || operation.sets > 8) {
      warnings.push('Set sayısı 1-8 aralığında olmalı; değişiklik reddedildi.');
      return false;
    }
    exercise.sets = operation.sets;
  }
  if (operation.reps !== undefined) {
    if (operation.reps < 1 || operation.reps > 30) {
      warnings.push('Tekrar sayısı 1-30 aralığında olmalı; değişiklik reddedildi.');
      return false;
    }
    exercise.reps = operation.reps;
  }
  if (operation.rir !== undefined) {
    if (operation.rir < 0 || operation.rir > 6) {
      warnings.push('RIR 0-6 aralığında olmalı; değişiklik reddedildi.');
      return false;
    }
    exercise.rir = operation.rir;
  }
  recomputeDayAggregates(day);
  return true;
}

function applyRemoveExercise(
  plan: AIProgramPlan,
  operation: Extract<EditOperation, { type: 'removeExercise' }>,
  warnings: string[],
): boolean {
  const week = plan.weeks[operation.weekIndex];
  const day = week?.days[operation.dayIndex];
  if (!day) return false;
  if (day.exercises.length <= 1) {
    warnings.push('Günde en az bir hareket kalmalı; silme reddedildi.');
    return false;
  }
  if (operation.exerciseIndex < 0 || operation.exerciseIndex >= day.exercises.length) return false;
  day.exercises.splice(operation.exerciseIndex, 1);
  recomputeDayAggregates(day);
  return true;
}

function applyReorderExercise(
  plan: AIProgramPlan,
  operation: Extract<EditOperation, { type: 'reorderExercise' }>,
  warnings: string[],
): boolean {
  const week = plan.weeks[operation.weekIndex];
  const day = week?.days[operation.dayIndex];
  if (!day) return false;
  const { fromIndex, toIndex } = operation;
  if (fromIndex < 0 || fromIndex >= day.exercises.length || toIndex < 0 || toIndex >= day.exercises.length) {
    warnings.push('Geçersiz sıralama indeksi.');
    return false;
  }
  const [moved] = day.exercises.splice(fromIndex, 1);
  if (!moved) return false;
  day.exercises.splice(toIndex, 0, moved);
  return true;
}

export function applyEdit(plan: AIProgramPlan, operation: EditOperation, context: EditContext): EditResult {
  const cloned = clonePlan(plan);
  const warnings: string[] = [];

  if (operation.weekIndex < 0 || operation.weekIndex >= cloned.weeks.length) {
    return { plan, applied: false, warnings, error: 'Geçersiz hafta indeksi.' };
  }

  let applied = false;
  switch (operation.type) {
    case 'replaceExercise':
      applied = applyReplaceExercise(cloned, operation, context, warnings);
      break;
    case 'updatePrescription':
      applied = applyUpdatePrescription(cloned, operation, warnings);
      break;
    case 'removeExercise':
      applied = applyRemoveExercise(cloned, operation, warnings);
      break;
    case 'reorderExercise':
      applied = applyReorderExercise(cloned, operation, warnings);
      break;
  }

  if (!applied) {
    return { plan, applied: false, warnings, error: warnings[0] ?? 'Düzenleme uygulanamadı.' };
  }

  return { plan: cloned, applied: true, warnings };
}

export function applyEdits(plan: AIProgramPlan, operations: EditOperation[], context: EditContext): EditResult {
  let current = plan;
  const allWarnings: string[] = [];
  for (const operation of operations) {
    const result = applyEdit(current, operation, context);
    allWarnings.push(...result.warnings);
    if (!result.applied) {
      return { plan: current, applied: false, warnings: allWarnings, error: result.error };
    }
    current = result.plan;
  }
  return { plan: current, applied: true, warnings: allWarnings };
}
