export { PROGRAM_TEMPLATE_REGISTRY, getProgramTemplateById } from "./templates/registry";
export { PROGRAM_TEMPLATE_DEFINITIONS } from "./templates/catalog";
export { calculateTemplateVolumeReport } from "./reports/templateVolume";
export { validateProgramTemplate, validateProgramTemplateRegistry } from "./validation/validateProgramTemplate";
export {
  analyzeTemplateSemantics,
  validateAllActiveTemplateSemantics,
  validateInstantiatedProgramSemantics,
  validateTemplateSemantics,
} from "./validation/semanticProgramValidation";
export { normalizeProgramRequest } from "./selection/normalizeProgramRequest";
export { filterCompatibleTemplates } from "./selection/filterTemplates";
export { scoreTemplate } from "./selection/scoreTemplate";
export { selectTemplateDeterministically } from "./selection/selectTemplateDeterministically";
export { getTemplateSelectionDebugReport } from "./selection/getTemplateSelectionDebugReport";
export { getSupportedProgramOptions } from "@/services/templateProgramEngine";
export {
  EXERCISE_LIMITATION_RULES,
  getExerciseLimitationConflicts,
  getExerciseLimitationRule,
  normalizeLimitations,
  normalizeLimitationValue,
} from "./limitations/exerciseLimitationRules";
export type { CanonicalLimitation, ExerciseLimitationRule } from "./limitations/exerciseLimitationRules";
export { createProgramRequestFingerprint } from "./fingerprint/createProgramRequestFingerprint";
export { instantiateUserProgram } from "./instantiation/instantiateUserProgram";
export { getDeterministicSubstitutionCandidates } from "./adaptation/applyExerciseSubstitutions";
export { getAdaptationRulesForFocus, getEligiblePhysiqueFocusMuscles } from "./adaptation/adaptProgramForPhysique";
export {
  focusAreaAllowsVolume,
  normalizeFocusMuscleValue,
  normalizePhysiqueFocusAreas,
  selectPhysiqueFocusAreas,
} from "./adaptation/physiqueFocusRules";
export {
  createPhysiqueAdaptationProposal,
  getPhysiqueAdaptationDebugReport,
} from "./adaptation/getPhysiqueAdaptationDebugReport";
export type {
  PhysiqueAdaptationDebugReport,
  PhysiqueAdaptationProposal,
} from "./adaptation/getPhysiqueAdaptationDebugReport";
export type {
  CanonicalFocusMuscle,
  IgnoredPhysiqueFocusArea,
  PhysiqueFocusArea,
  PhysiqueFocusSeverity,
  PhysiqueFocusSource,
} from "./adaptation/physiqueFocusRules";
export { validateInstantiatedProgram } from "./validation/validateInstantiatedProgram";
export { orderProgramWorkouts, orderWorkoutExercises } from "./ordering/orderWorkoutExercises";
export { findExistingProgramByFingerprint, persistValidProgramInstance } from "./persistence/programInstanceRepository";
export { createPersonalizedProgram } from "./engine/createPersonalizedProgram";
export {
  createProgressionFingerprint,
  evaluateProgressionDecision,
} from "./progression/evaluateProgressionDecision";
export {
  clearProgressionDecisions,
  findProgressionDecisionByFingerprint,
  loadExerciseProgressionState,
  loadProgressionDecisions,
  loadProgressionStates,
  persistProgressionDecision,
} from "./progression/progressionDecisionRepository";
export {
  getExerciseProgressionPreview,
  previewProgressionFingerprint,
  processAIProgramWorkoutProgression,
} from "./progression/createProgramProgressionService";
export { getProgressionDebugReport } from "./progression/getProgressionDebugReport";
export {
  createInitialProgressionState,
  defaultProgressionRule,
  inferEquipmentKind,
  normalizeCompletedExerciseLog,
  roundLoadForEquipment,
  validateCompletedExerciseLog,
  validateProgressionRule,
} from "./progression/progressionUtils";
export type {
  ProgramTemplate,
  ProgramTemplateGoal,
  ProgramTemplateLevel,
  ProgramTemplateSplit,
  ProgramTemplateProgressionModel,
  TemplateExercise,
  TemplateExerciseRole,
  TemplateMovementPattern,
  TemplateMuscleGroup,
  TemplateValidationIssue,
  TemplateValidationResult,
  TemplateVolumeReport,
  WorkoutDayTemplate,
} from "./types/programTemplate";
export type {
  SemanticDayMetrics,
  SemanticTemplateMetrics,
  SemanticValidationIssue,
  SemanticValidationResult,
  SemanticValidationStatus,
} from "./validation/semanticProgramValidation";
export type {
  ProgressionDebugReport,
} from "./progression/getProgressionDebugReport";
