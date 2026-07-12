import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { useAppLocalization } from "@/providers/localization-context";
import {
  ANALYTICS_EVENTS,
  trackEvent,
  trackScreen,
} from "@/services/analyticsService";
import { getExerciseById, searchExercises } from "@/services/exerciseCatalog";
import { buildAIProgramDecisionBlueprint } from "@/services/aiProgramDecisionEngine";
import { orchestrateAIProgram } from "@/services/aiProgramOrchestrator";
import {
  GYM_EQUIPMENT,
  HOME_EQUIPMENT,
  buildAIProgramDecisionContext,
  createAIProgramDraftFromSavedPlan,
  createAIProgramDraftFromPhysiqueSeed,
  createInitialAIProgramDraft,
  getAIProgramStepOrder,
  mergeAIProgramDraft,
  summarizePhysiqueForProgram,
  validateAIProgramAnswers,
} from "@/services/aiProgramEngine";
import {
  clearAIProgramPhysiqueSeed,
  loadAIProgramPhysiqueSeed,
} from "@/services/aiProgramSeedStore";
import {
  loadAIProgramInstanceById,
  saveAIProgramInstance,
} from "@/services/aiProgramInstanceStore";
import { loadCoachPreferences } from "@/services/coachPreferences";
import {
  loadCycleTracking,
  summarizeCycleTracking,
} from "@/services/cycleTracking";
import { successFeedback } from "@/services/interactionFeedback";
import { safeGoBack } from "@/services/navigation";
import { loadProfile } from "@/services/profileStore";
import { getLogs } from "@/services/storageService";
import { repairText } from "@/services/textUtils";
import {
  colors,
  createDynamicStyles,
  layout,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { PhysiqueAnalysisLog } from "@/types/aiHub";
import type {
  AIProgramDraft,
  AIProgramEntryPath,
  AIProgramEquipmentKey,
  AIProgramExperience,
  AIProgramGoal,
  AIProgramLocation,
  AIProgramPainLimitation,
  AIProgramPriorityMuscle,
  AIProgramRecoveryQuality,
  AIProgramSleepContext,
  AIProgramStressContext,
} from "@/types/aiProgram";
import type { AIProgramPlan } from "@/types/aiProgramPlan";

const PROCESSING_STEPS = [
  "ai_program.processing_step_profile",
  "ai_program.processing_step_preferences",
  "ai_program.processing_step_recovery",
  "ai_program.processing_step_evidence",
  "ai_program.processing_step_split",
  "ai_program.processing_step_volume",
  "ai_program.processing_step_fatigue",
  "ai_program.processing_step_exercises",
  "ai_program.processing_step_progression",
  "ai_program.processing_step_quality",
] as const;

const STEP_ORDER = getAIProgramStepOrder();
const PRIORITY_OPTIONS: AIProgramPriorityMuscle[] = [
  "chest",
  "shoulders",
  "lats",
  "upper_back",
  "arms",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
  "core",
  "full_body_balance",
];
const LIMITATION_OPTIONS: AIProgramPainLimitation[] = [
  "none",
  "shoulder",
  "elbow",
  "wrist",
  "lower_back",
  "hip",
  "knee",
  "ankle",
  "other",
];
const GOAL_OPTIONS: AIProgramGoal[] = [
  "build_muscle",
  "lose_fat",
  "recomposition",
  "strength",
  "athletic_performance",
  "general_fitness",
  "return_to_training",
];
const EXPERIENCE_OPTIONS: AIProgramExperience[] = [
  "beginner",
  "returning",
  "intermediate",
  "advanced",
];
const LOCATION_OPTIONS: AIProgramLocation[] = ["gym", "home", "both"];
const RECOVERY_OPTIONS: AIProgramRecoveryQuality[] = ["great", "okay", "poor"];

const GOAL_ICONS: Record<AIProgramGoal, keyof typeof Ionicons.glyphMap> = {
  build_muscle: "barbell-outline",
  lose_fat: "flame-outline",
  recomposition: "sync-outline",
  strength: "trophy-outline",
  athletic_performance: "flash-outline",
  general_fitness: "heart-outline",
  return_to_training: "refresh-outline",
};
const LOCATION_ICONS: Record<
  AIProgramLocation,
  keyof typeof Ionicons.glyphMap
> = {
  gym: "business-outline",
  home: "home-outline",
  both: "shuffle-outline",
};
const EXPERIENCE_ICONS: Record<
  AIProgramExperience,
  keyof typeof Ionicons.glyphMap
> = {
  beginner: "leaf-outline",
  returning: "refresh-outline",
  intermediate: "trending-up-outline",
  advanced: "flash-outline",
};

type StepGroup = {
  steps: (typeof STEP_ORDER)[number][];
  labelKey: string;
};
const STEP_GROUPS: StepGroup[] = [
  { steps: ["goal", "days", "duration"], labelKey: "ai_program.group_goal" },
  {
    steps: ["location", "equipment"],
    labelKey: "ai_program.group_environment",
  },
  {
    steps: ["experience", "priority", "limitations"],
    labelKey: "ai_program.group_profile",
  },
  {
    steps: ["exercise_preferences", "recovery"],
    labelKey: "ai_program.group_preferences",
  },
];
const SLEEP_OPTIONS: AIProgramSleepContext[] = [
  "under_6h",
  "6_7h",
  "7_8h",
  "8h_plus",
];
const STRESS_OPTIONS: AIProgramStressContext[] = ["low", "medium", "high"];

export default function AIProgramBuilderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    entry?: string;
    regenerateFromId?: string;
  }>();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const processingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draft, setDraft] = useState<AIProgramDraft | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<AIProgramPlan | null>(
    null,
  );
  const [savingPlan, setSavingPlan] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processingIndex, setProcessingIndex] = useState<number>(-1);
  const [exercisePickerMode, setExercisePickerMode] = useState<
    "preferred" | "avoided" | null
  >(null);
  const [exercisePickerQuery, setExercisePickerQuery] = useState("");
  const [exitSheetVisible, setExitSheetVisible] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [
      profile,
      coachPreferences,
      cycleTracking,
      seed,
      physiqueLogs,
    ] = await Promise.all([
      loadProfile(),
      loadCoachPreferences(),
      loadCycleTracking(),
      loadAIProgramPhysiqueSeed(),
      getLogs("physique", 1).catch(() => []),
    ]);
    const regeneratePlan = params.regenerateFromId
      ? await loadAIProgramInstanceById(params.regenerateFromId)
      : null;

    const latestPhysiqueLog = physiqueLogs[0] as
      PhysiqueAnalysisLog | undefined;
    const latestPhysiqueSummary = seed
      ? summarizePhysiqueForProgram(
          seed.result,
          seed.createdAt,
          "current_result",
        )
      : latestPhysiqueLog
        ? summarizePhysiqueForProgram(
            latestPhysiqueLog.result,
            latestPhysiqueLog.createdAt,
            "saved_log",
          )
        : undefined;

    const entryPath = (
      params.entry === "physique_result" ? "physique_result" : "ai_hub"
    ) as AIProgramEntryPath;

    if (regeneratePlan) {
      const cycle =
        profile?.gender === "female"
          ? summarizeCycleTracking(cycleTracking)
          : null;
      const nextDraft = createAIProgramDraftFromSavedPlan({
        entryPath,
        profile,
        coachPreferences,
        plan: regeneratePlan,
      });
      const validation = validateAIProgramAnswers(nextDraft.answers);
      const hydratedDraft = mergeAIProgramDraft(nextDraft, {
        validationCodes: validation.blocking,
        cautionCodes: validation.cautions,
        decisionContext: buildAIProgramDecisionContext({
          draft: nextDraft,
          profile,
          cycle,
        }),
      });

      setGeneratedPlan(null);
      setPlanSaved(false);
      setDraft(hydratedDraft);
      setLoading(false);
      return;
    }

    const nextDraft = seed
      ? createAIProgramDraftFromPhysiqueSeed({
          entryPath,
          profile,
          coachPreferences,
          seed: { result: seed.result, createdAt: seed.createdAt },
        })
      : createInitialAIProgramDraft({
          entryPath,
          profile,
          coachPreferences,
          physiqueSummary: latestPhysiqueSummary,
        });

    const cycle =
      profile?.gender === "female"
        ? summarizeCycleTracking(cycleTracking)
        : null;
    const validation = validateAIProgramAnswers(nextDraft.answers);
    const hydratedDraft = mergeAIProgramDraft(nextDraft, {
      validationCodes: validation.blocking,
      cautionCodes: validation.cautions,
      decisionContext: buildAIProgramDecisionContext({
        draft: nextDraft,
        profile,
        cycle,
      }),
    });

    setGeneratedPlan(null);
    setPlanSaved(false);
    setDraft(hydratedDraft);
    if (seed) await clearAIProgramPhysiqueSeed();
    setLoading(false);
  }, [params.entry, params.regenerateFromId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void trackScreen("ai_program_builder_screen", {
        entry: params.entry ?? "ai_hub",
      });
      return () => {
        if (processingTimeout.current) clearTimeout(processingTimeout.current);
      };
    }, [params.entry, refresh]),
  );

  useEffect(() => {
    if (!draft || draft.generationStatus !== "processing") return;
    if (processingIndex >= PROCESSING_STEPS.length - 1) return;
    processingTimeout.current = setTimeout(() => {
      setProcessingIndex((current) => current + 1);
    }, 380);
    return () => {
      if (processingTimeout.current) clearTimeout(processingTimeout.current);
    };
  }, [draft, processingIndex]);

  useEffect(() => {
    if (!draft || draft.generationStatus !== "processing") return;
    if (processingIndex !== PROCESSING_STEPS.length - 1) return;

    void (async () => {
      const [profile, cycleTracking] = await Promise.all([
        loadProfile(),
        loadCycleTracking(),
      ]);
      const cycle =
        profile?.gender === "female"
          ? summarizeCycleTracking(cycleTracking)
          : null;
      const validation = validateAIProgramAnswers(draft.answers);
      const nextDraft = mergeAIProgramDraft(draft, {
        generationStatus: "ready",
        validationCodes: validation.blocking,
        cautionCodes: validation.cautions,
      });
      const decisionContext = buildAIProgramDecisionContext({
        draft: nextDraft,
        profile,
        cycle,
      });
      const decisionBlueprint =
        buildAIProgramDecisionBlueprint(decisionContext);
    const readyDraft = mergeAIProgramDraft(nextDraft, {
        decisionContext,
        decisionBlueprint,
        currentStep: "summary",
      });
      const orchestration = orchestrateAIProgram({
        draftId: nextDraft.id,
        context: decisionContext,
        blueprint: decisionBlueprint,
      });
      setGeneratedPlan(orchestration.plan);
      setDraft(readyDraft);
      successFeedback();
    })();
  }, [draft, processingIndex]);

  const updateDraft = useCallback(
    async (updater: (current: AIProgramDraft) => AIProgramDraft) => {
      setDraft((current) => {
        if (!current) return current;
        const next = updater(current);
        return next;
      });
    },
    [],
  );

  const currentStepIndex = draft ? STEP_ORDER.indexOf(draft.currentStep) : 0;
  const isSummary = draft?.currentStep === "summary";
  const isProcessing = draft?.generationStatus === "processing";
  const isReady = draft?.generationStatus === "ready";
  const activeGroupIndex = draft
    ? STEP_GROUPS.findIndex((group) => group.steps.includes(draft.currentStep))
    : -1;
  const activeGroup =
    activeGroupIndex >= 0 ? STEP_GROUPS[activeGroupIndex] : null;
  const stepInGroup =
    activeGroup && draft ? activeGroup.steps.indexOf(draft.currentStep) + 1 : 0;

  const validation = useMemo(
    () =>
      draft
        ? validateAIProgramAnswers(draft.answers)
        : { blocking: [], cautions: [] },
    [draft],
  );
  const pickerResults = useMemo(
    () => searchExercises(exercisePickerQuery).slice(0, 40),
    [exercisePickerQuery],
  );
  const preferredExerciseIds = draft?.answers.preferredExerciseIds ?? [];
  const avoidedExerciseIds = draft?.answers.avoidedExerciseIds ?? [];

  const exitVariant = useMemo<"none" | "answers" | "ready">(() => {
    if (!draft) return "none";
    if (generatedPlan && !planSaved) return "ready";
    if (isProcessing || draft.completedSteps.length > 0) return "answers";
    return "none";
  }, [draft, generatedPlan, isProcessing, planSaved]);

  const handleExit = useCallback(() => {
    safeGoBack(router);
  }, [router]);

  const requestExit = useCallback(() => {
    if (exitVariant === "none") {
      handleExit();
      return;
    }
    setExitSheetVisible(true);
  }, [exitVariant, handleExit]);

  const closeExitSheet = useCallback(() => {
    setExitSheetVisible(false);
  }, []);

  const completeStepAndMove = useCallback(async () => {
    if (!draft) return;
    const currentIndex = STEP_ORDER.indexOf(draft.currentStep);
    const nextStep =
      STEP_ORDER[Math.min(STEP_ORDER.length - 1, currentIndex + 1)];
    const validationState = validateAIProgramAnswers(draft.answers);
    const shouldBlock =
      (draft.currentStep === "goal" && !draft.answers.mainGoal) ||
      (draft.currentStep === "days" && !draft.answers.trainingDays) ||
      (draft.currentStep === "duration" && !draft.answers.sessionDurationMin) ||
      (draft.currentStep === "location" && !draft.answers.location) ||
      (draft.currentStep === "equipment" &&
        draft.answers.equipment.length === 0) ||
      validationState.blocking.includes("too_many_priority_muscles");

    if (shouldBlock) {
      Alert.alert(
        t("ai_program.incomplete_title"),
        t("ai_program.incomplete_body"),
      );
      return;
    }

    await updateDraft((current) =>
      mergeAIProgramDraft(current, {
        currentStep: nextStep,
        completedSteps: current.completedSteps.includes(current.currentStep)
          ? current.completedSteps
          : [...current.completedSteps, current.currentStep],
        validationCodes: validationState.blocking,
        cautionCodes: validationState.cautions,
      }),
    );
  }, [draft, t, updateDraft]);

  const moveBack = useCallback(async () => {
    if (!draft) return;
    if (isSummary || isProcessing || isReady) {
      requestExit();
      return;
    }
    const currentIndex = STEP_ORDER.indexOf(draft.currentStep);
    if (currentIndex <= 0) {
      requestExit();
      return;
    }
    await updateDraft((current) =>
      mergeAIProgramDraft(current, {
        currentStep: STEP_ORDER[currentIndex - 1],
      }),
    );
  }, [draft, isProcessing, isReady, isSummary, requestExit, updateDraft]);

  const startGeneration = useCallback(async () => {
    if (!draft) return;
    const currentValidation = validateAIProgramAnswers(draft.answers);
    if (currentValidation.blocking.length > 0) {
      Alert.alert(
        t("ai_program.incomplete_title"),
        t("ai_program.complete_critical"),
      );
      return;
    }

    setGeneratedPlan(null);
    setPlanSaved(false);
    await updateDraft((current) =>
      mergeAIProgramDraft(current, {
        generationStatus: "processing",
        validationCodes: currentValidation.blocking,
        cautionCodes: currentValidation.cautions,
      }),
    );
    setProcessingIndex(0);
    void trackEvent(ANALYTICS_EVENTS.aiProgramGenerationStarted, {
      entry: draft.entryPath,
      premium: false,
    });
  }, [draft, t, updateDraft]);

  const handleResetBuilder = useCallback(() => {
    Alert.alert(
      t("ai_program.reset_confirm_title"),
      t("ai_program.reset_confirm_body"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("ai_program.reset_confirm_action"),
          style: "destructive",
          onPress: () => {
            setGeneratedPlan(null);
            setPlanSaved(false);
            setProcessingIndex(-1);
            void refresh();
          },
        },
      ],
    );
  }, [refresh, t]);

  const handleSavePlan = useCallback(async () => {
    if (!generatedPlan) return;
    if (planSaved) {
      router.replace({
        pathname: "/ai-program-detail",
        params: { id: generatedPlan.id },
      });
      return;
    }

    setSavingPlan(true);
    try {
      await saveAIProgramInstance(generatedPlan);
      setPlanSaved(true);
      successFeedback();
      void trackEvent(ANALYTICS_EVENTS.aiProgramSaved, {
        planId: generatedPlan.id,
        daysPerWeek: generatedPlan.daysPerWeek,
        weekCount: generatedPlan.weekCount,
        premium: false,
      });
      router.replace({
        pathname: "/ai-program-detail",
        params: { id: generatedPlan.id },
      });
    } catch {
      Alert.alert(
        t("ai_program.save_error_title"),
        t("ai_program.save_error_body"),
      );
    } finally {
      setSavingPlan(false);
    }
  }, [generatedPlan, planSaved, router, t]);

  const openExercisePicker = useCallback((mode: "preferred" | "avoided") => {
    setExercisePickerMode(mode);
    setExercisePickerQuery("");
  }, []);

  const closeExercisePicker = useCallback(() => {
    setExercisePickerMode(null);
    setExercisePickerQuery("");
  }, []);

  const updateExerciseSelections = useCallback(
    async (mode: "preferred" | "avoided", nextIds: string[]) => {
      const names = nextIds
        .map((id) => getExerciseById(id)?.displayName)
        .filter((value): value is string => !!value);

      await updateDraft((current) =>
        mergeAIProgramDraft(current, {
          answers:
            mode === "preferred"
              ? {
                  preferredExerciseIds: nextIds,
                  preferredExercises: names.join(", "),
                }
              : {
                  avoidedExerciseIds: nextIds,
                  avoidedExercises: names.join(", "),
                },
        }),
      );
    },
    [updateDraft],
  );

  const toggleExerciseSelection = useCallback(
    (exerciseId: string) => {
      if (!draft || !exercisePickerMode) return;
      const currentIds =
        exercisePickerMode === "preferred"
          ? (draft.answers.preferredExerciseIds ?? [])
          : (draft.answers.avoidedExerciseIds ?? []);
      const nextIds = currentIds.includes(exerciseId)
        ? currentIds.filter((item) => item !== exerciseId)
        : [...currentIds, exerciseId];
      void updateExerciseSelections(exercisePickerMode, nextIds);
    },
    [draft, exercisePickerMode, updateExerciseSelections],
  );

  const removeSelectedExercise = useCallback(
    (mode: "preferred" | "avoided", exerciseId: string) => {
      if (!draft) return;
      const currentIds =
        mode === "preferred"
          ? (draft.answers.preferredExerciseIds ?? [])
          : (draft.answers.avoidedExerciseIds ?? []);
      void updateExerciseSelections(
        mode,
        currentIds.filter((item) => item !== exerciseId),
      );
    },
    [draft, updateExerciseSelections],
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            {
              paddingTop: insets.top,
              backgroundColor: colors.overlay,
              borderBottomColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={styles.headerInner}>
            <TouchableOpacity
              onPress={() => safeGoBack(router)}
              style={styles.iconButton}
            >
              <Ionicons name="chevron-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
              {t("ai_program.screen_title")}
            </Text>
            <View style={styles.headerSpacer} />
          </View>
        </View>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!draft) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top,
            backgroundColor: colors.overlay,
            borderBottomColor: colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.headerInner}>
          <TouchableOpacity
            onPress={() => void moveBack()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
            {t("ai_program.screen_title")}
          </Text>
          <TouchableOpacity
            onPress={() => requestExit()}
            accessibilityRole="button"
            style={styles.iconButton}
          >
            <Ionicons name="close" size={20} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.screenHeaderOffset,
            paddingBottom: spacing.md,
          },
        ]}
      >
        <GlassCard variant="panel" style={styles.progressCard}>
          {activeGroup && !isProcessing && !isReady ? (
            <>
              <Text style={[styles.eyebrow, { color: colors.secondary }]}>
                {t(activeGroup.labelKey)} ·{" "}
                {t("ai_program.step_progress")
                  .replace("{current}", String(stepInGroup))
                  .replace("{total}", String(activeGroup.steps.length))}
              </Text>
              <View style={styles.groupProgressRow}>
                {STEP_GROUPS.map((group, index) => (
                  <View
                    key={group.labelKey}
                    style={[
                      styles.groupSegment,
                      { backgroundColor: colors.surfaceContainerHighest },
                    ]}
                  >
                    <View
                      style={[
                        styles.groupSegmentFill,
                        {
                          backgroundColor: colors.primary,
                          width:
                            index < activeGroupIndex
                              ? "100%"
                              : index === activeGroupIndex
                                ? `${Math.max(20, (stepInGroup / group.steps.length) * 100)}%`
                                : "0%",
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.eyebrow, { color: colors.secondary }]}>
                {isProcessing
                  ? t("ai_program.processing_title")
                  : isReady
                    ? t("ai_program.ready_title")
                    : t("ai_program.step_progress")
                        .replace(
                          "{current}",
                          String(Math.max(1, currentStepIndex + 1)),
                        )
                        .replace("{total}", String(STEP_ORDER.length))}
              </Text>
              <View
                style={[
                  styles.progressRail,
                  { backgroundColor: colors.surfaceContainerHighest },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${isReady ? 100 : Math.max(8, ((currentStepIndex + 1) / STEP_ORDER.length) * 100)}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </>
          )}
        </GlassCard>

        {isProcessing ? (
          <GlassCard variant="panel" style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              {t("ai_program.processing_title")}
            </Text>
            <Text
              style={[styles.sectionBody, { color: colors.onSurfaceVariant }]}
            >
              {t("ai_program.processing_body")}
            </Text>
            <Text style={[styles.helperText, { color: colors.secondary }]}>
              {t("ai_program.processing_eta")}
            </Text>
            {draft.answers.useLatestPhysiqueAnalysis &&
            draft.latestPhysiqueSummary ? (
              <View
                style={[
                  styles.notice,
                  { backgroundColor: colors.secondaryContainer },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={colors.secondary}
                />
                <Text style={[styles.noticeText, { color: colors.onSurface }]}>
                  {t("ai_program.processing_physique_note")}
                </Text>
              </View>
            ) : null}
            <View style={styles.processingList}>
              {PROCESSING_STEPS.map((key, index) => {
                const complete = index <= processingIndex;
                return (
                  <View key={key} style={styles.processingRow}>
                    <Ionicons
                      name={complete ? "checkmark-circle" : "ellipse-outline"}
                      size={18}
                      color={complete ? colors.success : colors.outline}
                    />
                    <Text
                      style={[
                        styles.processingText,
                        {
                          color: complete
                            ? colors.onSurface
                            : colors.onSurfaceVariant,
                        },
                      ]}
                    >
                      {t(key)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </GlassCard>
        ) : isReady ? (
          generatedPlan ? (
            <ProgramReadyCard
              plan={generatedPlan}
              t={t}
              colors={colors}
              savingPlan={savingPlan}
              planSaved={planSaved}
              onSave={() => void handleSavePlan()}
              onReset={handleResetBuilder}
              onReview={() => {
                setGeneratedPlan(null);
                setPlanSaved(false);
                setProcessingIndex(-1);
                void updateDraft((current) =>
                  mergeAIProgramDraft(current, {
                    generationStatus: "idle",
                    currentStep: "summary",
                  }),
                );
              }}
            />
          ) : (
            <GlassCard variant="panel" style={styles.card}>
              <ActivityIndicator color={colors.primary} />
            </GlassCard>
          )
        ) : (
          <>
            {draft.currentStep === "intro" ? (
              <GlassCard variant="panel" style={styles.card}>
                <Text
                  style={[styles.sectionTitle, { color: colors.onSurface }]}
                >
                  {t("ai_program.intro_title")}
                </Text>
                <Text
                  style={[
                    styles.sectionBody,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t("ai_program.intro_body")}
                </Text>
                {draft.latestPhysiqueSummary ? (
                  <View
                    style={[
                      styles.notice,
                      { backgroundColor: colors.surfaceContainerLow },
                    ]}
                  >
                    <Ionicons
                      name="scan-outline"
                      size={18}
                      color={colors.secondary}
                    />
                    <Text
                      style={[styles.noticeText, { color: colors.onSurface }]}
                    >
                      {t("ai_program.intro_physique_ready")}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.actions}>
                  <PrimaryButton
                    label={t("ai_program.intro_start")}
                    onPress={() => void completeStepAndMove()}
                  />
                  {draft.latestPhysiqueSummary ? (
                    <SecondaryButton
                      label={t("ai_program.intro_use_physique")}
                      onPress={() => {
                        void updateDraft((current) =>
                          mergeAIProgramDraft(current, {
                            answers: { useLatestPhysiqueAnalysis: true },
                          }),
                        );
                        void completeStepAndMove();
                      }}
                    />
                  ) : null}
                </View>
              </GlassCard>
            ) : null}

            {draft.currentStep === "goal" ? (
              <StepCard
                title={t("ai_program.goal_title")}
                body={t("ai_program.goal_body")}
                colors={colors}
              >
                <ChipGrid>
                  {GOAL_OPTIONS.map((goal) => (
                    <ChoiceChip
                      key={goal}
                      label={t(`ai_program.goal_${goal}`)}
                      icon={GOAL_ICONS[goal]}
                      active={draft.answers.mainGoal === goal}
                      onPress={() =>
                        void updateDraft((current) =>
                          mergeAIProgramDraft(current, {
                            answers: { mainGoal: goal },
                          }),
                        )
                      }
                    />
                  ))}
                </ChipGrid>
              </StepCard>
            ) : null}

            {draft.currentStep === "days" ? (
              <StepCard
                title={t("ai_program.days_title")}
                body={t("ai_program.days_body")}
                colors={colors}
              >
                <ChipGrid>
                  {[2, 3, 4, 5, 6].map((days) => (
                    <ChoiceChip
                      key={days}
                      label={t("ai_program.days_value").replace(
                        "{days}",
                        String(days),
                      )}
                      active={draft.answers.trainingDays === days}
                      onPress={() =>
                        void updateDraft((current) =>
                          mergeAIProgramDraft(current, {
                            answers: {
                              trainingDays: days as 2 | 3 | 4 | 5 | 6,
                            },
                          }),
                        )
                      }
                    />
                  ))}
                </ChipGrid>
              </StepCard>
            ) : null}

            {draft.currentStep === "duration" ? (
              <StepCard
                title={t("ai_program.duration_title")}
                body={t("ai_program.duration_body")}
                colors={colors}
              >
                <ChipGrid>
                  {[30, 45, 60, 75, 90].map((duration) => (
                    <ChoiceChip
                      key={duration}
                      label={t("ai_program.duration_value").replace(
                        "{minutes}",
                        String(duration),
                      )}
                      active={draft.answers.sessionDurationMin === duration}
                      onPress={() =>
                        void updateDraft((current) =>
                          mergeAIProgramDraft(current, {
                            answers: {
                              sessionDurationMin: duration as
                                30 | 45 | 60 | 75 | 90,
                            },
                          }),
                        )
                      }
                    />
                  ))}
                </ChipGrid>
              </StepCard>
            ) : null}

            {draft.currentStep === "location" ? (
              <StepCard
                title={t("ai_program.location_title")}
                body={t("ai_program.location_body")}
                colors={colors}
              >
                <ChipGrid>
                  {LOCATION_OPTIONS.map((location) => (
                    <ChoiceChip
                      key={location}
                      label={t(`ai_program.location_${location}`)}
                      icon={LOCATION_ICONS[location]}
                      active={draft.answers.location === location}
                      onPress={() =>
                        void updateDraft((current) =>
                          mergeAIProgramDraft(current, {
                            answers: {
                              location,
                              equipment:
                                location === "gym"
                                  ? [
                                      "machines",
                                      "cables",
                                      "dumbbells",
                                      "barbells",
                                    ]
                                  : location === "home"
                                    ? ["bodyweight_only"]
                                    : [
                                        "dumbbells",
                                        "bands",
                                        "machines",
                                        "cables",
                                      ],
                            },
                          }),
                        )
                      }
                    />
                  ))}
                </ChipGrid>
              </StepCard>
            ) : null}

            {draft.currentStep === "equipment" ? (
              <StepCard
                title={t("ai_program.equipment_title")}
                body={t("ai_program.equipment_body")}
                colors={colors}
              >
                {draft.answers.location !== "home" ? (
                  <>
                    <Text
                      style={[
                        styles.groupLabel,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {t("ai_program.equipment_gym")}
                    </Text>
                    <ChipGrid>
                      {GYM_EQUIPMENT.map((item) => (
                        <ChoiceChip
                          key={item}
                          label={t(`ai_program.equipment_${item}`)}
                          active={draft.answers.equipment.includes(item)}
                          onPress={() => toggleEquipment(item, updateDraft)}
                        />
                      ))}
                    </ChipGrid>
                  </>
                ) : null}
                {draft.answers.location !== "gym" ? (
                  <>
                    <Text
                      style={[
                        styles.groupLabel,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {t("ai_program.equipment_home")}
                    </Text>
                    <ChipGrid>
                      {HOME_EQUIPMENT.map((item) => (
                        <ChoiceChip
                          key={item}
                          label={t(`ai_program.equipment_${item}`)}
                          active={draft.answers.equipment.includes(item)}
                          onPress={() => toggleEquipment(item, updateDraft)}
                        />
                      ))}
                    </ChipGrid>
                  </>
                ) : null}
              </StepCard>
            ) : null}

            {draft.currentStep === "experience" ? (
              <StepCard
                title={t("ai_program.experience_title")}
                body={t("ai_program.experience_body")}
                colors={colors}
              >
                <ChipGrid>
                  {EXPERIENCE_OPTIONS.map((experience) => (
                    <ChoiceChip
                      key={experience}
                      label={t(`ai_program.experience_${experience}`)}
                      icon={EXPERIENCE_ICONS[experience]}
                      active={draft.answers.experience === experience}
                      onPress={() =>
                        void updateDraft((current) =>
                          mergeAIProgramDraft(current, {
                            answers: { experience },
                          }),
                        )
                      }
                    />
                  ))}
                </ChipGrid>
                {draft.answers.experience ? (
                  <Text
                    style={[
                      styles.helperText,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {t(
                      `ai_program.experience_help_${draft.answers.experience}`,
                    )}
                  </Text>
                ) : null}
              </StepCard>
            ) : null}

            {draft.currentStep === "priority" ? (
              <StepCard
                title={t("ai_program.priority_title")}
                body={t("ai_program.priority_body")}
                colors={colors}
              >
                <ChipGrid>
                  {PRIORITY_OPTIONS.map((item) => (
                    <ChoiceChip
                      key={item}
                      label={t(`ai_program.priority_${item}`)}
                      active={draft.answers.priorityMuscles.includes(item)}
                      onPress={() => togglePriority(item, updateDraft)}
                    />
                  ))}
                </ChipGrid>
                <Text
                  style={[
                    styles.helperText,
                    {
                      color: validation.blocking.includes(
                        "too_many_priority_muscles",
                      )
                        ? colors.error
                        : colors.onSurfaceVariant,
                    },
                  ]}
                >
                  {t("ai_program.priority_helper").replace(
                    "{count}",
                    String(draft.answers.priorityMuscles.length),
                  )}
                </Text>
              </StepCard>
            ) : null}

            {draft.currentStep === "limitations" ? (
              <StepCard
                title={t("ai_program.limitations_title")}
                body={t("ai_program.limitations_body")}
                colors={colors}
              >
                <ChipGrid>
                  {LIMITATION_OPTIONS.map((item) => (
                    <ChoiceChip
                      key={item}
                      label={t(`ai_program.limitations_${item}`)}
                      active={draft.answers.painLimitations.includes(item)}
                      onPress={() => toggleLimitation(item, updateDraft)}
                    />
                  ))}
                </ChipGrid>
                {draft.answers.painLimitations.includes("other") ? (
                  <TextInput
                    value={draft.answers.limitationNote ?? ""}
                    onChangeText={(value) =>
                      void updateDraft((current) =>
                        mergeAIProgramDraft(current, {
                          answers: { limitationNote: value },
                        }),
                      )
                    }
                    placeholder={t("ai_program.limitations_note_placeholder")}
                    placeholderTextColor={colors.outline}
                    multiline
                    style={[
                      styles.input,
                      {
                        color: colors.onSurface,
                        backgroundColor: colors.surfaceContainerLowest,
                        borderColor: colors.outlineVariant,
                      },
                    ]}
                  />
                ) : null}
              </StepCard>
            ) : null}

            {draft.currentStep === "exercise_preferences" ? (
              <StepCard
                title={t("ai_program.exercise_title")}
                body={t("ai_program.exercise_body")}
                colors={colors}
              >
                <Text
                  style={[
                    styles.groupLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t("ai_program.exercise_keep")}
                </Text>
                <ExerciseSelectionField
                  actionLabel={t("ai_program.exercise_picker_open_preferred")}
                  emptyLabel={t("ai_program.exercise_picker_selected_empty")}
                  exerciseIds={preferredExerciseIds}
                  onOpen={() => openExercisePicker("preferred")}
                  onRemove={(exerciseId) =>
                    removeSelectedExercise("preferred", exerciseId)
                  }
                />
                <Text
                  style={[
                    styles.groupLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t("ai_program.exercise_avoid")}
                </Text>
                <ExerciseSelectionField
                  actionLabel={t("ai_program.exercise_picker_open_avoided")}
                  emptyLabel={t("ai_program.exercise_picker_selected_empty")}
                  exerciseIds={avoidedExerciseIds}
                  onOpen={() => openExercisePicker("avoided")}
                  onRemove={(exerciseId) =>
                    removeSelectedExercise("avoided", exerciseId)
                  }
                />
                <SecondaryButton
                  label={t("ai_program.skip_optional")}
                  onPress={() =>
                    void (async () => {
                      await updateDraft((current) =>
                        mergeAIProgramDraft(current, {
                          skippedSteps: current.skippedSteps.includes(
                            "exercise_preferences",
                          )
                            ? current.skippedSteps
                            : [...current.skippedSteps, "exercise_preferences"],
                        }),
                      );
                      await completeStepAndMove();
                    })()
                  }
                />
              </StepCard>
            ) : null}

            {draft.currentStep === "recovery" ? (
              <StepCard
                title={t("ai_program.recovery_title")}
                body={t("ai_program.recovery_body")}
                colors={colors}
              >
                <Text
                  style={[
                    styles.groupLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t("ai_program.recovery_state")}
                </Text>
                <ChipGrid>
                  {RECOVERY_OPTIONS.map((item) => (
                    <ChoiceChip
                      key={item}
                      label={t(`ai_program.recovery_${item}`)}
                      active={draft.answers.recoveryQuality === item}
                      onPress={() =>
                        void updateDraft((current) =>
                          mergeAIProgramDraft(current, {
                            answers: { recoveryQuality: item },
                          }),
                        )
                      }
                    />
                  ))}
                </ChipGrid>
                <Text
                  style={[
                    styles.groupLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t("ai_program.sleep_title")}
                </Text>
                <ChipGrid>
                  {SLEEP_OPTIONS.map((item) => (
                    <ChoiceChip
                      key={item}
                      label={t(`ai_program.sleep_${item}`)}
                      active={draft.answers.sleepContext === item}
                      onPress={() =>
                        void updateDraft((current) =>
                          mergeAIProgramDraft(current, {
                            answers: { sleepContext: item },
                          }),
                        )
                      }
                    />
                  ))}
                </ChipGrid>
                <Text
                  style={[
                    styles.groupLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t("ai_program.stress_title")}
                </Text>
                <ChipGrid>
                  {STRESS_OPTIONS.map((item) => (
                    <ChoiceChip
                      key={item}
                      label={t(`ai_program.stress_${item}`)}
                      active={draft.answers.stressContext === item}
                      onPress={() =>
                        void updateDraft((current) =>
                          mergeAIProgramDraft(current, {
                            answers: { stressContext: item },
                          }),
                        )
                      }
                    />
                  ))}
                </ChipGrid>
              </StepCard>
            ) : null}

            {isSummary ? (
              <GlassCard variant="panel" style={styles.card}>
                <Text
                  style={[styles.sectionTitle, { color: colors.onSurface }]}
                >
                  {t("ai_program.summary_title")}
                </Text>
                <Text
                  style={[
                    styles.sectionBody,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t("ai_program.summary_body")}
                </Text>
                <SummaryBlock draft={draft} t={t} colors={colors} />
                {validation.cautions.length > 0 ? (
                  <View style={styles.warningList}>
                    {validation.cautions.map((code) => (
                      <View
                        key={code}
                        style={[
                          styles.notice,
                          { backgroundColor: `${colors.tertiary}18` },
                        ]}
                      >
                        <Ionicons
                          name="alert-circle-outline"
                          size={18}
                          color={colors.tertiary}
                        />
                        <Text
                          style={[
                            styles.noticeText,
                            { color: colors.onSurface },
                          ]}
                        >
                          {t(`ai_program.validation_${code}`)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                <View style={styles.actions}>
                  <PrimaryButton
                    label={t("ai_program.summary_generate")}
                    onPress={() => void startGeneration()}
                  />
                </View>
              </GlassCard>
            ) : null}
          </>
        )}
      </ScrollView>

      {!isProcessing &&
      !isReady &&
      !isSummary &&
      draft.currentStep !== "intro" ? (
        <View
          style={[
            styles.footerBar,
            {
              backgroundColor: colors.overlay,
              borderTopColor: colors.outlineVariant,
              paddingBottom: insets.bottom + spacing.sm,
            },
          ]}
        >
          <PrimaryButton
            label={t("common.continue")}
            onPress={() => void completeStepAndMove()}
          />
        </View>
      ) : null}

      <Modal
        visible={exercisePickerMode != null}
        transparent
        animationType="fade"
        onRequestClose={closeExercisePicker}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.exercisePickerCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.exercisePickerHeader}>
              <Text
                style={[
                  styles.exercisePickerTitle,
                  { color: colors.onSurface },
                ]}
              >
                {exercisePickerMode === "preferred"
                  ? t("ai_program.exercise_picker_preferred_title")
                  : t("ai_program.exercise_picker_avoided_title")}
              </Text>
              <TouchableOpacity
                onPress={closeExercisePicker}
                style={[
                  styles.pickerCloseButton,
                  { backgroundColor: colors.surfaceContainerLow },
                ]}
              >
                <Ionicons name="close" size={18} color={colors.onSurface} />
              </TouchableOpacity>
            </View>
            <TextInput
              value={exercisePickerQuery}
              onChangeText={setExercisePickerQuery}
              placeholder={t("ai_program.exercise_picker_search")}
              placeholderTextColor={colors.outline}
              style={[
                styles.input,
                {
                  color: colors.onSurface,
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.outlineVariant,
                },
              ]}
            />
            <FlatList
              data={pickerResults}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.exercisePickerList}
              ListEmptyComponent={
                <Text
                  style={[
                    styles.helperText,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t("ai_program.exercise_picker_empty")}
                </Text>
              }
              renderItem={({ item }) => {
                const selectedIds =
                  exercisePickerMode === "preferred"
                    ? preferredExerciseIds
                    : avoidedExerciseIds;
                const active = selectedIds.includes(item.id);
                return (
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={() => toggleExerciseSelection(item.id)}
                    style={[
                      styles.exercisePickerRow,
                      {
                        borderColor: active
                          ? colors.primary
                          : colors.outlineVariant,
                        backgroundColor: active
                          ? `${colors.primary}14`
                          : colors.surfaceContainerLowest,
                      },
                    ]}
                  >
                    <View style={styles.exercisePickerCopy}>
                      <Text
                        style={[
                          styles.exercisePickerName,
                          { color: colors.onSurface },
                        ]}
                      >
                        {item.displayName}
                      </Text>
                      <Text
                        style={[
                          styles.exercisePickerMeta,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {repairText(item.muscleGroup)} ·{" "}
                        {repairText(item.equipment)}
                      </Text>
                    </View>
                    <Ionicons
                      name={active ? "checkmark-circle" : "ellipse-outline"}
                      size={20}
                      color={active ? colors.primary : colors.outline}
                    />
                  </TouchableOpacity>
                );
              }}
            />
            <TouchableOpacity
              activeOpacity={0.84}
              onPress={closeExercisePicker}
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[styles.primaryButtonText, { color: colors.onPrimary }]}
              >
                {t("ai_program.exercise_picker_done")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={exitSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={closeExitSheet}
      >
        <View style={styles.exitSheetBackdrop}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("ai_program.exit_continue_action")}
            activeOpacity={1}
            onPress={closeExitSheet}
            style={styles.exitSheetScrim}
          />
          <View
            style={[
              styles.exitSheet,
              {
                paddingBottom: insets.bottom + spacing.md,
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.exitSheetHandle} />
            <View style={styles.exitSheetHeader}>
              <View
                style={[
                  styles.exitSheetIcon,
                  {
                    backgroundColor:
                      exitVariant === "ready"
                        ? `${colors.primary}14`
                        : `${colors.tertiary}14`,
                  },
                ]}
              >
                <Ionicons
                  name={
                    exitVariant === "ready"
                      ? "bookmark-outline"
                      : "log-out-outline"
                  }
                  size={22}
                  color={
                    exitVariant === "ready"
                      ? colors.primary
                      : colors.tertiary
                  }
                />
              </View>
              <View style={styles.exitSheetCopy}>
                <Text
                  style={[styles.exitSheetTitle, { color: colors.onSurface }]}
                >
                  {t("ai_program.exit_sheet_title")}
                </Text>
                <Text
                  style={[
                    styles.exitSheetBody,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t(
                    exitVariant === "ready"
                      ? "ai_program.exit_sheet_ready_body"
                      : "ai_program.exit_sheet_unsaved_body",
                  )}
                </Text>
              </View>
            </View>
            <View style={styles.exitSheetActions}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.84}
                disabled={savingPlan}
                onPress={() => {
                  if (exitVariant === "ready") {
                    void handleSavePlan();
                  } else {
                    closeExitSheet();
                  }
                }}
                style={[
                  styles.exitSheetButton,
                  {
                    backgroundColor: colors.primary,
                    opacity: savingPlan ? 0.6 : 1,
                  },
                ]}
              >
                {savingPlan && exitVariant === "ready" ? (
                  <ActivityIndicator color={colors.onPrimary} />
                ) : (
                  <Text
                    style={[
                      styles.exitSheetButtonText,
                      { color: colors.onPrimary },
                    ]}
                  >
                    {t(
                      exitVariant === "ready"
                        ? "ai_program.exit_save_action"
                        : "ai_program.exit_continue_action",
                    )}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.82}
                disabled={savingPlan}
                onPress={() => {
                  closeExitSheet();
                  handleExit();
                }}
                style={styles.exitSheetTextButton}
              >
                <Text
                  style={[
                    styles.exitSheetDestructiveText,
                    { color: colors.error },
                  ]}
                >
                  {t("ai_program.exit_discard_action")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function toggleEquipment(
  item: AIProgramEquipmentKey,
  updateDraft: (
    updater: (current: AIProgramDraft) => AIProgramDraft,
  ) => Promise<void>,
) {
  return void updateDraft((current) => {
    const exists = current.answers.equipment.includes(item);
    return mergeAIProgramDraft(current, {
      answers: {
        equipment: exists
          ? current.answers.equipment.filter((value) => value !== item)
          : [...current.answers.equipment, item],
      },
    });
  });
}

function togglePriority(
  item: AIProgramPriorityMuscle,
  updateDraft: (
    updater: (current: AIProgramDraft) => AIProgramDraft,
  ) => Promise<void>,
) {
  return void updateDraft((current) => {
    const exists = current.answers.priorityMuscles.includes(item);
    const next = exists
      ? current.answers.priorityMuscles.filter((value) => value !== item)
      : [...current.answers.priorityMuscles, item];
    return mergeAIProgramDraft(current, { answers: { priorityMuscles: next } });
  });
}

function toggleLimitation(
  item: AIProgramPainLimitation,
  updateDraft: (
    updater: (current: AIProgramDraft) => AIProgramDraft,
  ) => Promise<void>,
) {
  return void updateDraft((current) => {
    const currentValues = current.answers.painLimitations;
    let next: AIProgramPainLimitation[] = currentValues;
    if (item === "none") {
      next = ["none"];
    } else {
      const filtered = currentValues.filter((value) => value !== "none");
      next = filtered.includes(item)
        ? filtered.filter((value) => value !== item)
        : [...filtered, item];
    }
    return mergeAIProgramDraft(current, { answers: { painLimitations: next } });
  });
}

function SummaryBlock({
  draft,
  t,
  colors,
}: {
  draft: AIProgramDraft;
  t: (key: string) => string;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  const rows = [
    [
      "ai_program.summary_goal",
      draft.answers.mainGoal
        ? t(`ai_program.goal_${draft.answers.mainGoal}`)
        : "—",
    ],
    [
      "ai_program.summary_days",
      draft.answers.trainingDays
        ? t("ai_program.days_value").replace(
            "{days}",
            String(draft.answers.trainingDays),
          )
        : "—",
    ],
    [
      "ai_program.summary_duration",
      draft.answers.sessionDurationMin
        ? t("ai_program.duration_value").replace(
            "{minutes}",
            String(draft.answers.sessionDurationMin),
          )
        : "—",
    ],
    [
      "ai_program.summary_location",
      draft.answers.location
        ? t(`ai_program.location_${draft.answers.location}`)
        : "—",
    ],
    [
      "ai_program.summary_experience",
      draft.answers.experience
        ? t(`ai_program.experience_${draft.answers.experience}`)
        : "—",
    ],
    [
      "ai_program.summary_priority",
      draft.answers.priorityMuscles.length
        ? draft.answers.priorityMuscles
            .map((item) => t(`ai_program.priority_${item}`))
            .join(", ")
        : t("ai_program.none"),
    ],
    [
      "ai_program.summary_recovery",
      draft.answers.recoveryQuality
        ? t(`ai_program.recovery_${draft.answers.recoveryQuality}`)
        : "—",
    ],
    [
      "ai_program.summary_physique",
      draft.answers.useLatestPhysiqueAnalysis && draft.latestPhysiqueSummary
        ? t("ai_program.summary_physique_used")
        : t("ai_program.summary_physique_not_used"),
    ],
  ] as const;

  return (
    <View style={styles.summaryGrid}>
      {rows.map(([labelKey, value]) => (
        <View
          key={labelKey}
          style={[
            styles.summaryTile,
            {
              borderColor: colors.outlineVariant,
              backgroundColor: colors.surfaceContainerLow,
            },
          ]}
        >
          <Text
            style={[styles.summaryLabel, { color: colors.onSurfaceVariant }]}
          >
            {t(labelKey)}
          </Text>
          <Text style={[styles.summaryValue, { color: colors.onSurface }]}>
            {value}
          </Text>
        </View>
      ))}
    </View>
  );
}

function ProgramReadyCard({
  plan,
  t,
  colors,
  savingPlan,
  planSaved,
  onSave,
  onReset,
  onReview,
}: {
  plan: AIProgramPlan;
  t: (key: string) => string;
  colors: ReturnType<typeof useAppTheme>["colors"];
  savingPlan: boolean;
  planSaved: boolean;
  onSave: () => void;
  onReset: () => void;
  onReview: () => void;
}) {
  const firstWeek = plan.weeks[0];
  const validationErrors = plan.validation.issues.filter(
    (issue) => issue.severity === "error",
  );
  const coachNote =
    plan.explanation.whyThisPlan[0] ?? plan.explanation.headline;
  const supportNote =
    plan.explanation.uncertaintyNotes[0] ??
    plan.explanation.whyThisPlan[1] ??
    "";

  return (
    <View
      style={[
        styles.readyCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={[styles.readyHero, { backgroundColor: colors.primary }]}>
        <View style={[styles.readyHeroGlow, { backgroundColor: `${colors.secondary}55` }]} />
        <View style={styles.readyBadgeRow}>
          <View style={[styles.readyBadge, { backgroundColor: colors.whiteAlpha20 }]}>
            <Ionicons name="checkmark-circle" size={15} color={colors.onPrimary} />
            <Text style={[styles.readyBadgeText, { color: colors.onPrimary }]}>
              {t("ai_program.ready_title")}
            </Text>
          </View>
        </View>
        <Text numberOfLines={2} style={[styles.readyTitle, { color: colors.onPrimary }]}>
          {repairText(plan.title)}
        </Text>
        <Text numberOfLines={2} style={[styles.readySubtitle, { color: colors.whiteAlpha60 }]}>
          {repairText(plan.subtitle)}
        </Text>
      </View>
      <View style={styles.readyContent}>
      <Text style={[styles.readySummary, { color: colors.onSurfaceVariant }]}>
        {t("ai_program.ready_body")}
      </Text>

      <View style={styles.readyMetaGrid}>
        <ReadyMetaPill
          icon="calendar-outline"
          label={`${plan.daysPerWeek} ${t("ai_program.meta_days_week")}`}
          colors={colors}
        />
        <ReadyMetaPill
          icon="albums-outline"
          label={`${plan.weekCount} ${t("ai_program.meta_weeks")}`}
          colors={colors}
        />
        <ReadyMetaPill
          icon="barbell-outline"
          label={repairText(plan.trainingStyle)}
          colors={colors}
        />
      </View>

      <View style={[styles.readyCoachNote, { backgroundColor: `${colors.secondary}12` }]}>
        <Ionicons name="bulb-outline" size={18} color={colors.secondary} />
        <Text numberOfLines={3} style={[styles.readyCoachText, { color: colors.onSurface }]}>
          {repairText(coachNote)}
        </Text>
      </View>

      {firstWeek ? (
        <View style={styles.readyWeekBlock}>
          <Text style={[styles.readyGroupLabel, { color: colors.onSurfaceVariant }]}>
            {repairText(firstWeek.title)}
          </Text>
          <View style={styles.readyDayList}>
          {firstWeek.days.slice(0, 3).map((day) => (
            <View
              key={day.id}
              style={[
                styles.readyDayCard,
                {
                  backgroundColor: colors.surfaceContainerLowest,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={[styles.readyDayIcon, { backgroundColor: `${colors.primary}12` }]}>
                <Ionicons name="fitness-outline" size={16} color={colors.primary} />
              </View>
              <View style={styles.readyDayCopy}>
              <Text
                numberOfLines={1}
                style={[styles.readyDayTitle, { color: colors.onSurface }]}
              >
                {repairText(day.title)}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.readyDayMeta,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {day.exercises.length} {t("ai_program.meta_exercises")} ·{" "}
                {day.totalSets} {t("ai_program.meta_sets")} · {day.durationMin}{" "}
                {t("ai_program.meta_min")}
              </Text>
              </View>
            </View>
          ))}
          </View>
        </View>
      ) : null}

      {supportNote || validationErrors.length > 0 ? (
        <View
          style={[
            styles.readySupportNote,
            {
              backgroundColor:
                validationErrors.length > 0
                  ? `${colors.error}12`
                  : `${colors.tertiary}12`,
            },
          ]}
        >
          <Ionicons
            name={validationErrors.length > 0 ? "alert-circle-outline" : "information-circle-outline"}
            size={17}
            color={validationErrors.length > 0 ? colors.error : colors.tertiary}
          />
          <Text numberOfLines={2} style={[styles.readySupportText, { color: colors.onSurfaceVariant }]}>
            {validationErrors.length > 0
              ? t("ai_program.validation_warning")
              : repairText(supportNote)}
          </Text>
        </View>
      ) : null}

      <View style={styles.readyActions}>
        <TouchableOpacity
          activeOpacity={0.84}
          onPress={onSave}
          disabled={savingPlan}
          style={[
            styles.readyPrimaryButton,
            {
              backgroundColor: planSaved ? colors.success : colors.primary,
              opacity: savingPlan ? 0.6 : 1,
            },
          ]}
        >
          {savingPlan ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : (
            <>
            <Ionicons
              name={planSaved ? "open-outline" : "bookmark-outline"}
              size={18}
              color={colors.onPrimary}
            />
            <Text
              numberOfLines={1}
              style={[styles.readyPrimaryButtonText, { color: colors.onPrimary }]}
            >
              {planSaved
                ? t("ai_program.open_plan")
                : t("ai_program.save_open_plan")}
            </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={onReview}
          style={[
            styles.readySecondaryButton,
            {
              borderColor: colors.outlineVariant,
              backgroundColor: colors.surfaceContainerLowest,
            },
          ]}
        >
          <Ionicons name="create-outline" size={17} color={colors.onSurface} />
          <Text
            numberOfLines={1}
            style={[styles.readySecondaryButtonText, { color: colors.onSurface }]}
          >
            {t("ai_program.ready_review")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={onReset}
          style={styles.readyResetButton}
        >
          <Text
            numberOfLines={1}
            style={[styles.readyResetText, { color: colors.error }]}
          >
            {t("ai_program.reset_plan")}
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </View>
  );
}

function ReadyMetaPill({
  icon,
  label,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View style={[styles.readyMetaPill, { backgroundColor: colors.surfaceContainerLowest }]}>
      <Ionicons name={icon} size={14} color={colors.primary} />
      <Text numberOfLines={1} style={[styles.readyMetaText, { color: colors.onSurface }]}>
        {label}
      </Text>
    </View>
  );
}

function ExerciseSelectionField({
  actionLabel,
  emptyLabel,
  exerciseIds,
  onOpen,
  onRemove,
}: {
  actionLabel: string;
  emptyLabel: string;
  exerciseIds: string[];
  onOpen: () => void;
  onRemove: (exerciseId: string) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.exerciseField}>
      <View style={styles.exerciseChipList}>
        {exerciseIds.length > 0 ? (
          exerciseIds.map((exerciseId) => {
            const exercise = getExerciseById(exerciseId);
            if (!exercise) return null;
            return (
              <TouchableOpacity
                key={exerciseId}
                activeOpacity={0.82}
                onPress={() => onRemove(exerciseId)}
                style={[
                  styles.selectedExerciseChip,
                  {
                    borderColor: colors.outlineVariant,
                    backgroundColor: colors.surfaceContainerLow,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.selectedExerciseText,
                    { color: colors.onSurface },
                  ]}
                >
                  {exercise.displayName}
                </Text>
                <Ionicons
                  name="close-circle"
                  size={16}
                  color={colors.outline}
                />
              </TouchableOpacity>
            );
          })
        ) : (
          <Text style={[styles.helperText, { color: colors.onSurfaceVariant }]}>
            {emptyLabel}
          </Text>
        )}
      </View>
      <SecondaryButton label={actionLabel} onPress={onOpen} />
    </View>
  );
}

function StepCard({
  title,
  body,
  children,
  colors,
}: {
  title: string;
  body: string;
  children: ReactNode;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <GlassCard variant="panel" style={styles.card}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
        {title}
      </Text>
      <Text style={[styles.sectionBody, { color: colors.onSurfaceVariant }]}>
        {body}
      </Text>
      {children}
    </GlassCard>
  );
}

function ChipGrid({ children }: { children: ReactNode }) {
  return <View style={styles.chipGrid}>{children}</View>;
}

function ChoiceChip({
  label,
  active,
  icon,
  onPress,
}: {
  label: string;
  active: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const foreground = active ? colors.onPrimary : colors.onSurface;
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
          borderColor: active ? colors.primary : colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.chipContent}>
        {icon ? <Ionicons name={icon} size={15} color={foreground} /> : null}
        <Text style={[styles.chipText, { color: foreground }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.84}
      onPress={onPress}
      style={[styles.primaryButton, { backgroundColor: colors.primary }]}
    >
      <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.secondaryButton,
        {
          borderColor: colors.outlineVariant,
          backgroundColor: colors.surfaceContainerLow,
        },
      ]}
    >
      <Text style={[styles.secondaryButtonText, { color: colors.onSurface }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    borderBottomWidth: 1,
  },
  headerInner: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    minHeight: 68,
    paddingHorizontal: spacing.containerMargin,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 44,
    height: 44,
  },
  headerTitle: {
    ...typography.screenTitle,
    flex: 1,
    textAlign: "center",
  },
  scroll: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.gutter,
  },
  progressCard: { padding: spacing.cardPadding, gap: spacing.sm },
  eyebrow: { ...typography.labelCaps },
  progressRail: { height: 8, borderRadius: radius.full, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: radius.full },
  groupProgressRow: { flexDirection: "row", gap: spacing.xs },
  groupSegment: {
    flex: 1,
    height: 6,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  groupSegmentFill: { height: "100%", borderRadius: radius.full },
  footerBar: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.sm,
  },
  card: { padding: spacing.cardPadding, gap: spacing.smPlus },
  readyCard: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    ...shadowStyle("floating"),
  },
  readyHero: {
    minHeight: 152,
    padding: 18,
    gap: 8,
    overflow: "hidden",
  },
  readyHeroGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -72,
    right: -54,
  },
  readyBadgeRow: { flexDirection: "row" },
  readyBadge: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  readyBadgeText: { ...typography.labelCaps, fontSize: 10 },
  readyTitle: { ...typography.displayLgMobile, fontSize: 28, lineHeight: 34 },
  readySubtitle: { ...typography.bodySm, lineHeight: 20 },
  readyContent: { padding: 18, gap: 12 },
  readySummary: { ...typography.bodySm, lineHeight: 20 },
  readyMetaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  readyMetaPill: {
    minHeight: 34,
    maxWidth: "100%",
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  readyMetaText: { ...typography.labelMd, fontSize: 12, lineHeight: 16, flexShrink: 1 },
  readyCoachNote: {
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  readyCoachText: { ...typography.bodySm, lineHeight: 19, flex: 1 },
  readyWeekBlock: { gap: 6 },
  readyGroupLabel: { ...typography.labelCaps },
  readyDayList: { gap: 6 },
  readyDayCard: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  readyDayIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  readyDayCopy: { flex: 1, minWidth: 0, gap: 2 },
  readyDayTitle: { ...typography.labelMd },
  readyDayMeta: { ...typography.bodySm, lineHeight: 18 },
  readySupportNote: {
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  readySupportText: { ...typography.bodySm, lineHeight: 18, flex: 1 },
  readyActions: { gap: 8, paddingTop: 2 },
  readyPrimaryButton: {
    minHeight: 52,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
  },
  readyPrimaryButtonText: { ...typography.buttonLg, flexShrink: 1 },
  readySecondaryButton: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
  },
  readySecondaryButtonText: { ...typography.buttonSm, flexShrink: 1 },
  readyResetButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  readyResetText: { ...typography.labelMd },
  sectionTitle: { ...typography.headlineMd },
  sectionBody: { ...typography.bodySm, lineHeight: 20 },
  helperText: { ...typography.bodySm, lineHeight: 19 },
  notice: {
    borderRadius: radius.xl,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noticeText: { ...typography.bodySm, flex: 1, lineHeight: 19 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 42,
    borderRadius: radius.full,
    paddingHorizontal: spacing.smPlus,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    justifyContent: "center",
  },
  chipContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  chipText: { ...typography.labelMd, textAlign: "center" },
  actions: { gap: 10 },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  primaryButtonText: { ...typography.buttonLg },
  secondaryButton: {
    minHeight: 50,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: { ...typography.buttonLg },
  tertiaryButton: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  groupLabel: { ...typography.labelCaps },
  input: {
    minHeight: 50,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.smPlus,
    paddingVertical: spacing.sm,
    ...typography.bodyMd,
  },
  exerciseField: { gap: 10 },
  exerciseChipList: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  selectedExerciseChip: {
    maxWidth: "100%",
    minHeight: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedExerciseText: { ...typography.bodySm, flexShrink: 1 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.blackAlpha80,
    justifyContent: "center",
    padding: spacing.containerMargin,
  },
  exercisePickerCard: {
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.cardPadding,
    gap: 12,
    maxHeight: "82%",
  },
  exercisePickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  exercisePickerTitle: {
    ...typography.sectionTitle,
    flex: 1,
  },
  pickerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  exercisePickerList: { gap: 8, paddingVertical: 4 },
  exercisePickerRow: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.smPlus,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  exercisePickerCopy: { flex: 1, gap: 4 },
  exercisePickerName: { ...typography.labelMd },
  exercisePickerMeta: { ...typography.bodySm, lineHeight: 18 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryTile: {
    width: "48%",
    minHeight: 88,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.smPlus,
    gap: 8,
  },
  summaryLabel: { ...typography.labelMd },
  summaryValue: { ...typography.bodyMd },
  warningList: { gap: 8 },
  processingList: { gap: 10 },
  processingRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  processingText: { ...typography.bodySm, lineHeight: 19, flex: 1 },
  metaRow: { flexDirection: "row", flexWrap: "wrap" },
  metaPill: {
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaPillText: { ...typography.labelMd },
  dayPreviewList: { gap: 4 },
  dayPreviewRow: { paddingVertical: 10, borderBottomWidth: 1, gap: 2 },
  dayPreviewTitle: { ...typography.labelMd },
  dayPreviewMeta: { ...typography.bodySm, lineHeight: 18 },
  centerState: { flex: 1, alignItems: "center", justifyContent: "center" },
  exitSheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  exitSheetScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(4, 9, 14, 0.42)",
  },
  exitSheet: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    borderTopLeftRadius: radius["3xl"],
    borderTopRightRadius: radius["3xl"],
    borderWidth: 1,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.md,
    ...shadowStyle("floating"),
  },
  exitSheetHandle: {
    width: 44,
    height: 5,
    borderRadius: radius.full,
    alignSelf: "center",
    backgroundColor: "rgba(120, 130, 145, 0.38)",
  },
  exitSheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  exitSheetIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  exitSheetCopy: { flex: 1, minWidth: 0, gap: spacing.unit },
  exitSheetTitle: { ...typography.headlineMd, fontSize: 19, lineHeight: 25 },
  exitSheetBody: { ...typography.bodySm, lineHeight: 20 },
  exitSheetActions: { gap: spacing.sm },
  exitSheetButton: {
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  exitSheetButtonText: { ...typography.buttonLg, textAlign: "center" },
  exitSheetTextButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  exitSheetDestructiveText: { ...typography.labelMd, textAlign: "center" },
}));
