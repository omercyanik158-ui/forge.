import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { ExerciseImageModal } from "@/components/ExerciseImageModal";
import { useAppLocalization } from "@/providers/localization-context";
import { getExerciseById } from "@/services/exerciseCatalog";
import { processEngagement } from "@/services/achievementStore";
import { loadAIProgramInstanceById } from "@/services/aiProgramInstanceStore";
import { getCustomWorkoutById } from "@/services/customWorkoutStore";
import {
  getSwapOptions,
  type SwapOption,
} from "@/services/aiProgramSwapService";
import { formatNumber, weightUnitLabel } from "@/services/localization";
import { loadMeals } from "@/services/mealStore";
import {
  completeAIProgramDay,
  completeProgramDay,
} from "@/services/programProgressStore";
import { getProgramById } from "@/services/programCatalog";
import { localizeProgramPlan } from "@/services/program-localization";
import { loadProfile } from "@/services/profileStore";
import { canAccessPremiumPrograms } from "@/services/subscription";
import { loadCoachPreferences } from "@/services/coachPreferences";
import { buildCoachAdjustment } from "@/services/coachAdjustmentEngine";
import {
  loadLatestCoachAdjustment,
  saveCoachAdjustment,
} from "@/services/coachAdjustmentStore";
import {
  loadFeedbackForPlan,
  saveSessionFeedback,
} from "@/services/aiProgramFeedbackStore";
import { loadStrengthProgress } from "@/services/strengthProgress";
import {
  applyCycleIntensity,
  computeCycleIntensity,
  type CycleIntensity,
} from "@/services/personalCoach";
import {
  loadCycleTracking,
  summarizeCycleTracking,
} from "@/services/cycleTracking";
import { normalizeProgramText, repairText } from "@/services/textUtils";
import { loadWorkoutLogs, saveWorkoutLog } from "@/services/workoutStore";
import {
  clearWorkoutSessionDraft,
  loadWorkoutSessionDraft,
  saveWorkoutSessionDraft,
} from "@/services/workoutSessionDraftStore";
import {
  createDynamicStyles,
  layout,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type {
  CoachPreferences,
  ExerciseLibraryItem,
  WarmupItem,
  WorkoutLog,
  WorkoutSetLogEntry,
} from "@/types";
import type {
  AIProgramEquipmentKey,
  AIProgramPainLimitation,
} from "@/types/aiProgram";
import type { SessionFeedback } from "@/types/aiProgramFeedback";
import type { CoachAdjustment } from "@/types/coachAdjustment";

type SessionParams = {
  programId?: string;
  dayId?: string;
  customWorkoutId?: string;
  aiProgramId?: string;
  aiDayId?: string;
};

type SessionExercise = {
  exercise: ExerciseLibraryItem;
  sets: number;
  reps: number;
  repLabel: string;
  restSeconds: number;
  rir: number;
  weightKg?: number;
  alternatives?: string[];
};

type SessionPlan = {
  title: string;
  subtitle: string;
  difficulty: string;
  durationMin: number;
  source: "program" | "custom" | "ai_program";
  programId?: string;
  programDayId?: string;
  customWorkoutId?: string;
  aiProgramId?: string;
  aiProgramDayId?: string;
  cycleIntensity?: CycleIntensity;
  coachAdjustment?: CoachAdjustment | null;
  warmup?: WarmupItem[];
  exercises: SessionExercise[];
};

type PersistSessionResult = {
  newAchievementCount: number;
  log: WorkoutLog;
};

function mapCoachEquipmentToAIEquipment(
  equipment: CoachPreferences["equipment"],
): AIProgramEquipmentKey[] {
  if (equipment === "bodyweight") return ["bodyweight_only"];
  if (equipment === "home") {
    return [
      "bodyweight_only",
      "dumbbells",
      "adjustable_dumbbells",
      "bands",
      "bench",
      "kettlebell",
    ];
  }

  return [
    "machines",
    "cables",
    "dumbbells",
    "adjustable_dumbbells",
    "barbells",
    "smith_machine",
    "pullup_station",
    "pullup_bar",
    "leg_press",
    "cardio_machines",
    "bench",
    "kettlebell",
    "bands",
  ];
}

function mapCoachLimitationToAI(
  limitation: CoachPreferences["limitations"][number],
): AIProgramPainLimitation {
  if (limitation === "back") return "lower_back";
  return limitation;
}

function applyCoachAdjustmentToExercise(
  exercise: SessionExercise,
  adjustment?: CoachAdjustment | null,
  cycleIntensity?: CycleIntensity,
): SessionExercise {
  if (!adjustment) return exercise;

  if (adjustment.decision === "deload") {
    return {
      ...exercise,
      sets: Math.max(2, Math.round(exercise.sets * 0.7)),
      rir: Math.min(5, exercise.rir + 2),
      restSeconds: Math.round(exercise.restSeconds * 1.15),
    };
  }
  if (adjustment.decision === "reduce_volume") {
    return {
      ...exercise,
      sets: Math.max(2, exercise.sets - 1),
      rir: Math.min(5, exercise.rir + 1),
    };
  }
  if (
    adjustment.decision === "reduce_intensity" ||
    adjustment.decision === "swap_exercise"
  ) {
    return { ...exercise, rir: Math.min(5, exercise.rir + 1) };
  }
  if (adjustment.decision === "progress") {
    if (cycleIntensity === "lighter") {
      return exercise;
    }
    return { ...exercise, rir: Math.max(1, exercise.rir - 1) };
  }

  return exercise;
}

type DraftSet = {
  key: string;
  exerciseId: string;
  order: number;
  kg: string;
  reps: string;
  done: boolean;
};

export default function ProgramSessionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();
  const { resolved, t } = useAppLocalization();
  const params = useLocalSearchParams<SessionParams>();
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [sets, setSets] = useState<DraftSet[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [invalidSetKey, setInvalidSetKey] = useState<string | null>(null);
  const [exitSheetVisible, setExitSheetVisible] = useState(false);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [checkInRpe, setCheckInRpe] = useState(7);
  const [checkInRir, setCheckInRir] = useState(2);
  const [checkInRecovery, setCheckInRecovery] = useState<SessionFeedback["recoveryNextDay"]>("okay");
  const [checkInPain, setCheckInPain] = useState<AIProgramPainLimitation>("none");
  const [checkInNotes, setCheckInNotes] = useState("");
  const [swapSheetOptions, setSwapSheetOptions] = useState<SwapOption[]>([]);
  const [swapSheetVisible, setSwapSheetVisible] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [optionalWarmupSets, setOptionalWarmupSets] = useState<Record<string, boolean>>({});
  const [selectedExerciseImage, setSelectedExerciseImage] = useState<{
    title: string;
    imageUrls: string[];
  } | null>(null);
  const startedAt = useRef<number | null>(null);
  const initialSets = useRef<DraftSet[]>([]);
  const unitLabel = weightUnitLabel();

  const [sessionKey, setSessionKey] = useState(
    params.customWorkoutId
      ? `custom:${params.customWorkoutId}`
      : params.aiProgramId
        ? `ai:${params.aiProgramId}:${params.aiDayId ?? ""}`
        : `program:${params.programId ?? ""}:${params.dayId ?? ""}`,
  );

  const persistDraftNow = useCallback(async () => {
    if (!plan || !draftReady || sets.length === 0) return;
    setDraftStatus("saving");
    try {
      await saveWorkoutSessionDraft(sessionKey, sets, activeIndex);
      setDraftStatus("saved");
    } catch {
      setDraftStatus("idle");
    }
  }, [activeIndex, draftReady, plan, sessionKey, sets]);

  useEffect(() => {
    if (!plan || !draftReady || sets.length === 0) return;
    const timeout = setTimeout(() => {
      void persistDraftNow();
    }, 350);
    return () => clearTimeout(timeout);
  }, [persistDraftNow, plan, draftReady, sets.length]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        void persistDraftNow();
      }
    });
    return () => {
      subscription.remove();
      void persistDraftNow();
    };
  }, [persistDraftNow]);

  useEffect(() => {
    let mounted = true;
    async function prepare() {
      setLoading(true);
      setDraftReady(false);
      setResumed(false);
      const [logs, profile, cycleTracking] = await Promise.all([
        loadWorkoutLogs(),
        loadProfile(),
        loadCycleTracking(),
      ]);
      const cycle =
        profile?.gender === "female"
          ? summarizeCycleTracking(cycleTracking)
          : null;
      const intensity = computeCycleIntensity(cycle);
      const baseSessionKey = params.customWorkoutId
        ? `custom:${params.customWorkoutId}`
        : params.aiProgramId
          ? `ai:${params.aiProgramId}:${params.aiDayId ?? ""}`
          : `program:${params.programId ?? ""}:${params.dayId ?? ""}`;
      const nextSessionKey =
        intensity !== "normal"
          ? `${baseSessionKey}:${intensity}`
          : baseSessionKey;
      let nextPlan: SessionPlan | null = null;

      if (params.customWorkoutId) {
        const workout = await getCustomWorkoutById(params.customWorkoutId);
        if (workout) {
          nextPlan = {
            title: repairText(workout.title),
            subtitle: workout.note
              ? repairText(workout.note)
              : t("session.custom_plan_subtitle"),
            difficulty: t("session.custom_difficulty"),
            durationMin: Math.max(
              20,
              workout.exercises.reduce((sum, item) => sum + item.sets * 3, 0),
            ),
            source: "custom",
            customWorkoutId: workout.id,
            cycleIntensity: intensity,
            warmup: [],
            exercises: workout.exercises.flatMap((entry) => {
              const exercise = getExerciseById(entry.exerciseId);
              if (!exercise) return [];
              const adjusted = applyCycleIntensity(
                {
                  sets: entry.sets,
                  reps: entry.reps,
                  repLabel: t({
                    tr: `${entry.reps} tekrar`,
                    en: `${entry.reps} reps`,
                  }),
                  restSeconds: 90,
                  rir: 2,
                },
                intensity,
              );
              return [{ exercise, ...adjusted, weightKg: entry.weightKg }];
            }),
          };
        }
      } else if (params.aiProgramId && params.aiDayId) {
        const [aiProgram, coachAdjustment] = await Promise.all([
          loadAIProgramInstanceById(params.aiProgramId),
          loadLatestCoachAdjustment(params.aiProgramId),
        ]);
        const aiDay = aiProgram?.weeks
          .flatMap((week) => week.days)
          .find((item) => item.id === params.aiDayId);
        if (aiProgram && aiDay) {
          nextPlan = {
            title: normalizeProgramText(aiProgram.title),
            subtitle: normalizeProgramText(aiDay.title),
            difficulty: repairText(aiDay.difficulty),
            durationMin: aiDay.durationMin,
            source: "ai_program",
            aiProgramId: aiProgram.id,
            aiProgramDayId: aiDay.id,
            cycleIntensity: intensity,
            coachAdjustment,
            warmup: aiDay.warmup ?? [],
            exercises: aiDay.exercises.flatMap((entry) => {
              const exercise = getExerciseById(entry.exerciseId);
              if (!exercise) return [];
              const adjusted = applyCycleIntensity(entry, intensity);
              return [
                applyCoachAdjustmentToExercise(
                  { exercise, ...adjusted },
                  coachAdjustment,
                  intensity,
                ),
              ];
            }),
          };
        }
      } else if (params.programId && params.dayId) {
        const sourceProgram = getProgramById(params.programId);
        const program = sourceProgram
          ? localizeProgramPlan(sourceProgram, resolved.language)
          : undefined;
        if (program?.tier === "premium" && !canAccessPremiumPrograms(profile)) {
          router.replace("/premium");
          return;
        }
        const programDay = program?.weeks
          .flatMap((week) => week.days)
          .find((item) => item.id === params.dayId);
        if (program && programDay) {
          nextPlan = {
            title: normalizeProgramText(program.title),
            subtitle: normalizeProgramText(programDay.title),
            difficulty: repairText(programDay.difficulty),
            durationMin: programDay.durationMin,
            source: "program",
            programId: program.id,
            programDayId: programDay.id,
            cycleIntensity: intensity,
            warmup: programDay.warmup ?? [],
            exercises: programDay.exercises.flatMap((entry) => {
              const exercise = getExerciseById(entry.exerciseId);
              return exercise
                ? [{ exercise, ...applyCycleIntensity(entry, intensity) }]
                : [];
            }),
          };
        }
      }

      if (!mounted) return;
      if (nextPlan && nextPlan.source === "custom") {
        nextPlan.durationMin = Math.max(
          15,
          nextPlan.exercises.reduce(
            (sum, exercise) => sum + exercise.sets * 3,
            0,
          ),
        );
      }
      setSessionKey(nextSessionKey);
      const baseSets = buildDraftSets(nextPlan, logs);
      const draft = nextPlan
        ? await loadWorkoutSessionDraft(nextSessionKey)
        : null;
      const mergedSets = draft
        ? baseSets.map(
            (base) =>
              draft.sets.find(
                (saved) =>
                  saved.key === base.key &&
                  saved.exerciseId === base.exerciseId,
              ) ?? base,
          )
        : baseSets;
      initialSets.current = baseSets.map((set) => ({ ...set }));
      setPlan(nextPlan);
      setSets(mergedSets);
      setOptionalWarmupSets({});
      setActiveIndex(
        draft && nextPlan
          ? Math.min(
              Math.max(0, draft.activeIndex),
              Math.max(0, nextPlan.exercises.length - 1),
            )
          : 0,
      );
      setResumed(!!draft && draft.sets.some((set) => set.done));
      startedAt.current = Date.now();
      setDraftStatus(draft ? "saved" : "idle");
      setDraftReady(true);
      setLoading(false);
    }
    prepare().catch(() => {
      if (mounted) setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [
    params.aiDayId,
    params.aiProgramId,
    params.customWorkoutId,
    params.dayId,
    params.programId,
    resolved.language,
    router,
    t,
  ]);

  const activeExercise = plan?.exercises[activeIndex] ?? null;
  const activeWarmupKey =
    activeExercise && shouldOfferOptionalWarmup(activeExercise, activeIndex)
      ? optionalWarmupKey(activeExercise, activeIndex)
      : null;
  const activeSets = sets.filter(
    (set) => set.exerciseId === activeExercise?.exercise.id,
  );
  const completedSets = sets.filter((set) => set.done).length;
  const progress =
    sets.length > 0 ? Math.round((completedSets / sets.length) * 100) : 0;
  const allDone = sets.length > 0 && completedSets === sets.length;

  const updateSet = useCallback(
    (key: string, field: "kg" | "reps", value: string) => {
      setSets((current) =>
        current.map((set) =>
          set.key === key
            ? { ...set, [field]: sanitizeNumber(value, field === "kg") }
            : set,
        ),
      );
      setInvalidSetKey((current) => (current === key ? null : current));
    },
    [],
  );

  const toggleSet = useCallback(
    (key: string) => {
      const target = sets.find((set) => set.key === key);
      if (!target) return;
      if (!target.done && !isDraftSetReady(target)) {
        setInvalidSetKey(key);
        return;
      }
      setSets((current) =>
        current.map((set) => {
          if (set.key !== key) return set;
          return { ...set, done: !set.done };
        }),
      );
      setInvalidSetKey(null);
      Keyboard.dismiss();
      if (process.env.EXPO_OS === "ios")
        Haptics.selectionAsync().catch(() => {});
    },
    [sets],
  );

  const toggleOptionalWarmupSet = useCallback((key: string) => {
    setOptionalWarmupSets((current) => ({ ...current, [key]: !current[key] }));
    if (process.env.EXPO_OS === "ios")
      Haptics.selectionAsync().catch(() => {});
  }, []);

  const moveToExercise = useCallback(
    (nextIndex: number) => {
      if (!plan) return;
      const clampedIndex = Math.max(
        0,
        Math.min(plan.exercises.length - 1, nextIndex),
      );
      setActiveIndex(clampedIndex);
      Keyboard.dismiss();
    },
    [plan],
  );

  const swapActiveExercise = useCallback(async () => {
    if (!plan || !activeExercise) return;
    const preferences = await loadCoachPreferences();
    const usedExerciseIds = plan.exercises
      .filter((_, index) => index !== activeIndex)
      .map((entry) => entry.exercise.id);
    const options = getSwapOptions({
      exerciseId: activeExercise.exercise.id,
      availableEquipment: mapCoachEquipmentToAIEquipment(preferences.equipment),
      limitations: preferences.limitations.map(mapCoachLimitationToAI),
      excludeExerciseIds: usedExerciseIds,
      fallbackExerciseIds: activeExercise.alternatives ?? [],
    }).slice(0, 4);
    const candidates = options
      .map((option) => option.exerciseId)
      .map((id) => getExerciseById(id))
      .filter((item): item is ExerciseLibraryItem => !!item)
      .filter(
        (item) =>
          preferences.equipment !== "bodyweight" ||
          /body|none|vücut/i.test(`${item.equipment} ${item.name}`),
      )
      .filter(
        (item) =>
          !preferences.limitations.some((limitation) => {
            const text =
              `${item.displayName} ${item.name} ${item.muscleGroup}`.toLocaleLowerCase(
                "tr-TR",
              );
            if (limitation === "knee")
              return /squat|lunge|leg press|çömel|hamle/.test(text);
            if (limitation === "back")
              return /deadlift|row|good morning|bel/.test(text);
            return /overhead|shoulder press|omuz press/.test(text);
          }),
      );
    setSwapSheetOptions(candidates.length >= 0 ? options : []);
    setSwapSheetVisible(true);
  }, [activeExercise, activeIndex, plan]);

  const selectSwapOption = useCallback(
    (option: SwapOption) => {
      if (!activeExercise) return;
      const candidate = getExerciseById(option.exerciseId);
      if (!candidate) return;
      const oldId = activeExercise.exercise.id;
      setPlan((current) =>
        current
          ? {
              ...current,
              exercises: current.exercises.map((entry, index) =>
                index === activeIndex
                  ? {
                      ...entry,
                      exercise: candidate,
                      alternatives: [
                        oldId,
                        ...(activeExercise.alternatives ?? []),
                      ].filter((id) => id !== candidate.id),
                    }
                  : entry,
              ),
            }
          : current,
      );
      setSets((current) =>
        current.map((set) =>
          set.exerciseId === oldId
            ? {
                ...set,
                key: set.key.replace(oldId, candidate.id),
                exerciseId: candidate.id,
              }
            : set,
        ),
      );
      setSwapSheetVisible(false);
      setSwapSheetOptions([]);
    },
    [activeExercise, activeIndex],
  );

  const leaveSession = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (plan?.source === "program" && plan.programId) {
      router.replace({
        pathname: "/program-detail",
        params: { id: plan.programId },
      });
    } else if (plan?.source === "ai_program" && plan.aiProgramId) {
      router.replace({
        pathname: "/ai-program-detail",
        params: { id: plan.aiProgramId },
      });
    } else {
      router.replace("/(tabs)/fitness");
    }
  };

  const persistSession = async (partial: boolean): Promise<PersistSessionResult | null> => {
    if (!plan || saving) return null;
    const sourceSets = partial ? sets.filter((set) => set.done) : sets;
    if (sourceSets.length === 0) return null;
    setSaving(true);
    try {
      const completedAt = new Date().toISOString();
      const warmupEntries: WorkoutSetLogEntry[] = plan.exercises.flatMap((entry, index) => {
        const key = optionalWarmupKey(entry, index);
        if (!optionalWarmupSets[key] || !shouldOfferOptionalWarmup(entry, index)) return [];
        return [
          {
            order: index + 1,
            kind: "warmup" as const,
            exerciseId: entry.exercise.id,
            kg: 0,
            reps: Math.max(1, Math.min(12, entry.reps)),
            completedAt,
          },
        ];
      });
      const setEntries: WorkoutSetLogEntry[] = sourceSets.map((set, index) => ({
        order: index + 1,
        kind: "working",
        exerciseId: set.exerciseId,
        kg: Number(set.kg) || 0,
        reps: Math.max(1, Number(set.reps) || 1),
        completedAt,
      }));
      const elapsedMinutes = Math.max(
        1,
        Math.round((Date.now() - (startedAt.current ?? Date.now())) / 60000),
      );
      const exerciseIds = [...new Set(sourceSets.map((set) => set.exerciseId))];
      const muscleGroups = [
        ...new Set(
          plan.exercises
            .filter((entry) => exerciseIds.includes(entry.exercise.id))
            .map((entry) => repairText(entry.exercise.muscleGroup)),
        ),
      ];
      const baseTitle =
        plan.source === "program"
          ? `${plan.title} · ${plan.subtitle}`
          : plan.title;
      const currentProfile = await loadProfile();
      const estimatedKcal = Math.max(
        1,
        Math.round(
          (6 * 3.5 * (currentProfile?.weightKg ?? 75) * elapsedMinutes) / 200,
        ),
      );
      const log: WorkoutLog = {
        id: `${Date.now()}-${plan.source}-${plan.programDayId ?? plan.customWorkoutId ?? "session"}`,
        title: partial
          ? `${baseTitle} · ${t("session.partial_suffix")}`
          : baseTitle,
        durationMin: elapsedMinutes,
        kcal: estimatedKcal,
        difficulty: plan.difficulty,
        completedAt,
        source: plan.source,
        programId: plan.programId,
        programDayId: plan.programDayId,
        customWorkoutId: plan.customWorkoutId,
        aiProgramId: plan.aiProgramId,
        aiProgramDayId: plan.aiProgramDayId,
        exerciseIds,
        muscleGroups,
        setEntries: [...warmupEntries, ...setEntries],
      };
      await saveWorkoutLog(log);
      if (
        !partial &&
        plan.source === "program" &&
        plan.programId &&
        plan.programDayId
      ) {
        const program = getProgramById(plan.programId);
        const day = program?.weeks
          .flatMap((week) => week.days)
          .find((entry) => entry.id === plan.programDayId);
        if (day) await completeProgramDay(plan.programId, day);
      }
      if (
        !partial &&
        plan.source === "ai_program" &&
        plan.aiProgramId &&
        plan.aiProgramDayId
      ) {
        await completeAIProgramDay(plan.aiProgramId, plan.aiProgramDayId);
      }
      let newAchievementCount = 0;
      if (currentProfile) {
        const updatedProfile = await processEngagement(
          currentProfile,
          await loadMeals(),
        );
        newAchievementCount = Math.max(
          0,
          (updatedProfile.achievements?.length ?? 0) -
            (currentProfile.achievements?.length ?? 0),
        );
      }
      await clearWorkoutSessionDraft();
      setDraftStatus("idle");
      if (process.env.EXPO_OS === "ios")
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      return { newAchievementCount, log };
    } catch {
      Alert.alert(
        t("session.save_failed_title"),
        t("session.save_failed_body"),
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  const completeSession = async (saveCheckIn: boolean) => {
    const result = await persistSession(false);
    if (result == null) return;
    setCheckInVisible(false);
    if (saveCheckIn) {
      try {
        const feedback = await saveSessionFeedback({
          planId: plan?.aiProgramId,
          programDayId: plan?.aiProgramDayId ?? plan?.programDayId,
          exerciseIds: result.log.exerciseIds ?? [],
          completedAt: result.log.completedAt,
          perceivedExertion: checkInRpe,
          averageRir: checkInRir,
          painReported: [checkInPain],
          recoveryNextDay: checkInRecovery,
          notes: checkInNotes.trim() || undefined,
        });
        if (plan?.source === "ai_program" && plan.aiProgramId) {
          const [aiProgram, feedbacks, strength] = await Promise.all([
            loadAIProgramInstanceById(plan.aiProgramId),
            loadFeedbackForPlan(plan.aiProgramId),
            loadStrengthProgress(),
          ]);
          const adjustment = buildCoachAdjustment({
            plan: aiProgram,
            feedbacks: [
              feedback,
              ...feedbacks.filter((item) => item.id !== feedback.id),
            ],
            strengthProgress: strength.exercises,
            cycleIntensity: plan.cycleIntensity,
            physiqueFocusMuscles: aiProgram?.influenceSummary?.focusLabels,
          });
          await saveCoachAdjustment({
            ...adjustment,
            programDayId: plan.aiProgramDayId,
          });
        }
      } catch {
        // Workout history is the source of truth; coach feedback can be retried next session.
      }
    }
    const achievementMessage =
      result.newAchievementCount > 0
        ? t("session.achievement_suffix").replace(
            "{n}",
            String(result.newAchievementCount),
          )
        : "";
    const contributionMessage =
      plan?.exercises.length
        ? `\n\n${t({
            tr: "Bu seans Body Progress tarafında ağırlık gelişimi ve odak kas takibine katkı verdi.",
            en: "This session now contributes to Body Progress, strength trends, and focus muscle tracking.",
          })}`
        : "";
    Alert.alert(
      t("session.completed_title"),
      `${completedSets} ${t("session.completed_body")}${achievementMessage}${contributionMessage}`,
      [{ text: t("session.great"), onPress: leaveSession }],
    );
  };

  const finishSession = async () => {
    if (!allDone) return;
    setCheckInVisible(true);
  };

  const restartSession = () => {
    Alert.alert(t("session.restart_title"), t("session.restart_body"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("session.restart_action"),
        style: "destructive",
        onPress: async () => {
          await clearWorkoutSessionDraft();
          setSets(initialSets.current.map((set) => ({ ...set })));
          setOptionalWarmupSets({});
          setActiveIndex(0);
          setInvalidSetKey(null);
          setResumed(false);
          setDraftStatus("idle");
          startedAt.current = Date.now();
        },
      },
    ]);
  };

  const savePartialSession = async (showConfirmation = true) => {
    const savedSetCount = sets.filter((set) => set.done).length;
    const result = await persistSession(true);
    if (result == null) return;
    if (!showConfirmation) {
      leaveSession();
      return;
    }
    Alert.alert(
      t("session.partial_saved_title"),
      t("session.partial_saved_body").replace("{n}", String(savedSetCount)),
      [{ text: t("session.ok"), onPress: leaveSession }],
    );
  };

  const keepDraftAndExit = async () => {
    await persistDraftNow();
    setExitSheetVisible(false);
    leaveSession();
  };

  const discardSession = async () => {
    setExitSheetVisible(false);
    await clearWorkoutSessionDraft();
    leaveSession();
  };

  const endSession = () => {
    if (completedSets > 0) {
      setExitSheetVisible(true);
      return;
    }
    void discardSession();
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top,
            backgroundColor: themeColors.overlay,
            borderBottomColor: themeColors.outlineVariant,
          },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("session.exit_workout")}
          onPress={endSession}
          style={styles.iconButton}
          activeOpacity={0.75}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={themeColors.onSurface}
          />
        </TouchableOpacity>
        <View style={styles.topTitleCopy}>
          <Text
            numberOfLines={1}
            style={[styles.topTitle, { color: themeColors.onSurface }]}
          >
            {plan?.subtitle ?? t("session.workout")}
          </Text>
          <Text
            style={[
              styles.topSubtitle,
              { color: themeColors.onSurfaceVariant },
            ]}
          >
            {completedSets}/{sets.length} {t("session.set_word")}
          </Text>
        </View>
        <View
          style={[
            styles.progressBadge,
            { backgroundColor: themeColors.successContainer },
          ]}
        >
          <Text
            style={[styles.progressBadgeText, { color: themeColors.success }]}
          >
            %{progress}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={themeColors.primary} />
          </View>
        ) : !plan || plan.exercises.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons
              name="alert-circle-outline"
              size={32}
              color={themeColors.outline}
            />
            <Text style={[styles.emptyTitle, { color: themeColors.onSurface }]}>
              {t("session.open_failed_title")}
            </Text>
            <Text
              style={[
                styles.emptyBody,
                { color: themeColors.onSurfaceVariant },
              ]}
            >
              {t("session.open_failed_body")}
            </Text>
          </View>
        ) : (
          <ScrollView
            contentInsetAdjustmentBehavior="never"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              {
                paddingTop: insets.top + spacing.screenHeaderOffset,
                paddingBottom: insets.bottom + spacing.md,
              },
            ]}
          >
            <GlassCard variant="panel" style={styles.sessionHero}>
              <Text
                style={[
                  styles.sessionEyebrow,
                  { color: themeColors.secondary },
                ]}
              >
                {plan.source === "program"
                  ? plan.title
                  : plan.source === "ai_program"
                    ? "AI Signature"
                    : t("session.custom_plan_label")}
              </Text>
              <Text
                style={[styles.sessionTitle, { color: themeColors.onSurface }]}
              >
                {plan.subtitle}
              </Text>
              <View
                style={[
                  styles.progressRail,
                  { backgroundColor: themeColors.surfaceContainerHighest },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                      backgroundColor: themeColors.success,
                    },
                  ]}
                />
              </View>
              <View style={styles.sessionMeta}>
                <Meta
                  icon="barbell-outline"
                  label={`${plan.exercises.length} ${t("session.exercises_word")}`}
                />
                <Meta
                  icon="layers-outline"
                  label={`${sets.length} ${t("session.set_word")}`}
                />
                <Meta
                  icon="time-outline"
                  label={`~${plan.durationMin} ${t("session.min_word")}`}
                />
              </View>
              <View
                style={[
                  styles.draftNotice,
                  {
                    backgroundColor: themeColors.surfaceContainerLow,
                    borderColor: themeColors.outlineVariant,
                  },
                ]}
              >
                <Ionicons
                  name={
                    draftStatus === "saving"
                      ? "cloud-upload-outline"
                      : "shield-checkmark-outline"
                  }
                  size={16}
                  color={themeColors.secondary}
                />
                <Text
                  style={[
                    styles.draftNoticeText,
                    { color: themeColors.onSurfaceVariant },
                  ]}
                >
                  {t(
                    draftStatus === "saving"
                      ? "session.draft_saving"
                      : draftStatus === "saved"
                        ? "session.draft_saved"
                        : "session.draft_ready",
                  )}
                </Text>
              </View>
              {plan.cycleIntensity === "lighter" ||
              plan.cycleIntensity === "strong" ? (
                <View
                  style={[
                    styles.cycleNotice,
                    {
                      backgroundColor:
                        plan.cycleIntensity === "lighter"
                          ? `${themeColors.secondary}12`
                          : `${themeColors.primary}12`,
                      borderColor:
                        plan.cycleIntensity === "lighter"
                          ? `${themeColors.secondary}3D`
                          : `${themeColors.primary}3D`,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      plan.cycleIntensity === "lighter"
                        ? "leaf-outline"
                        : "flame-outline"
                    }
                    size={16}
                    color={
                      plan.cycleIntensity === "lighter"
                        ? themeColors.secondary
                        : themeColors.primary
                    }
                  />
                  <View style={styles.cycleNoticeCopy}>
                    <Text
                      style={[
                        styles.cycleNoticeLabel,
                        { color: themeColors.onSurface },
                      ]}
                    >
                      {t("cycle.session_notice_label")}
                    </Text>
                    <Text
                      style={[
                        styles.cycleNoticeBody,
                        { color: themeColors.onSurfaceVariant },
                      ]}
                    >
                      {t(
                        plan.cycleIntensity === "lighter"
                          ? {
                              tr: "Bugün döngü fazın nedeniyle yük biraz yumuşatıldı. Set, efor ve dinlenme ayarlandı.",
                              en: "Today's load was softened for your cycle phase. Sets, effort, and rest were adjusted.",
                            }
                          : "cycle.session_notice_strong",
                      )}
                    </Text>
                  </View>
                </View>
              ) : null}
              {plan.coachAdjustment ? (
                <View
                  style={[
                    styles.cycleNotice,
                    {
                      backgroundColor: `${themeColors.success}12`,
                      borderColor: `${themeColors.success}38`,
                    },
                  ]}
                >
                  <Ionicons
                    name="pulse-outline"
                    size={16}
                    color={themeColors.success}
                  />
                  <View style={styles.cycleNoticeCopy}>
                    <Text
                      style={[
                        styles.cycleNoticeLabel,
                        { color: themeColors.onSurface },
                      ]}
                    >
                      {plan.coachAdjustment.title}
                    </Text>
                    <Text
                      style={[
                        styles.cycleNoticeBody,
                        { color: themeColors.onSurfaceVariant },
                      ]}
                    >
                      {plan.coachAdjustment.nextSessionFocus}
                    </Text>
                  </View>
                </View>
              ) : null}
              {resumed ? (
                <View
                  style={[
                    styles.resumeNotice,
                    {
                      backgroundColor: themeColors.successContainer,
                      borderColor: `${themeColors.success}38`,
                    },
                  ]}
                >
                  <View style={styles.resumeHeading}>
                    <Ionicons
                      name="refresh-circle-outline"
                      size={18}
                      color={themeColors.success}
                    />
                    <View style={styles.resumeCopy}>
                      <Text
                        style={[
                          styles.resumeTitle,
                          { color: themeColors.onSurface },
                        ]}
                      >
                        {t("session.resume_title")}
                      </Text>
                      <Text
                        style={[
                          styles.resumeNoticeText,
                          { color: themeColors.onSurfaceVariant },
                        ]}
                      >
                        {completedSets} {t("session.resume_body")}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.resumeActions}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={restartSession}
                      activeOpacity={0.78}
                      style={[
                        styles.resumeButton,
                        {
                          backgroundColor: themeColors.surfaceContainerLowest,
                          borderColor: themeColors.outlineVariant,
                        },
                      ]}
                    >
                      <Ionicons
                        name="refresh-outline"
                        size={16}
                        color={themeColors.onSurface}
                      />
                      <Text
                        style={[
                          styles.resumeButtonText,
                          { color: themeColors.onSurface },
                        ]}
                      >
                        {t("session.restart_action")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      onPress={endSession}
                      activeOpacity={0.78}
                      style={[
                        styles.resumeButton,
                        {
                          backgroundColor: `${themeColors.error}10`,
                          borderColor: `${themeColors.error}45`,
                        },
                      ]}
                    >
                      <Ionicons
                        name="stop-circle-outline"
                        size={16}
                        color={themeColors.error}
                      />
                      <Text
                        style={[
                          styles.resumeButtonText,
                          { color: themeColors.error },
                        ]}
                      >
                        {t("session.leave_workout_action")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </GlassCard>

            {activeExercise ? (
              <GlassCard variant="panel" style={styles.activeCard}>
                <View style={styles.activeHeader}>
                  <View
                    style={[
                      styles.exerciseOrder,
                      { backgroundColor: `${themeColors.primary}1C` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.exerciseOrderText,
                        { color: themeColors.primary },
                      ]}
                    >
                      {activeIndex + 1}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.82}
                    onPress={() =>
                      setSelectedExerciseImage({
                        title: activeExercise.exercise.displayName,
                        imageUrls: activeExercise.exercise.imageUrls,
                      })
                    }
                    style={[
                      styles.activeImageWrap,
                      { backgroundColor: themeColors.surfaceContainerLow, borderColor: themeColors.outlineVariant },
                    ]}
                  >
                    {activeExercise.exercise.imageUrls[0] ? (
                      <GlassImage uri={activeExercise.exercise.imageUrls[0]} />
                    ) : (
                      <Ionicons name="image-outline" size={18} color={themeColors.outline} />
                    )}
                  </TouchableOpacity>
                  <View style={styles.activeCopy}>
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      style={[
                        styles.activeTitle,
                        { color: themeColors.onSurface },
                      ]}
                    >
                      {repairText(activeExercise.exercise.displayName)}
                    </Text>
                    <Text
                      style={[
                        styles.activeMeta,
                        { color: themeColors.onSurfaceVariant },
                      ]}
                    >
                      {repairText(activeExercise.exercise.muscleGroup)} ·{" "}
                      {activeExercise.repLabel} · {activeExercise.rir} RIR
                    </Text>
                  </View>
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => void swapActiveExercise()}
                    activeOpacity={0.78}
                    style={[
                      styles.swapButton,
                      {
                        borderColor: themeColors.outlineVariant,
                        backgroundColor: themeColors.surfaceContainerLow,
                      },
                    ]}
                  >
                    <Ionicons
                      name="swap-horizontal-outline"
                      size={17}
                      color={themeColors.primary}
                    />
                    <Text
                      style={[
                        styles.swapButtonText,
                        { color: themeColors.primary },
                      ]}
                    >
                      {t("coach.swap_exercise")}
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeExercise && activeWarmupKey ? (
                  <TouchableOpacity
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: Boolean(optionalWarmupSets[activeWarmupKey]) }}
                    activeOpacity={0.78}
                    onPress={() => toggleOptionalWarmupSet(activeWarmupKey)}
                    style={[
                      styles.optionalWarmupRow,
                      {
                        backgroundColor: optionalWarmupSets[activeWarmupKey]
                          ? `${themeColors.secondary}18`
                          : themeColors.surfaceContainerLow,
                        borderColor: optionalWarmupSets[activeWarmupKey]
                          ? `${themeColors.secondary}55`
                          : themeColors.outlineVariant,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.optionalWarmupIcon,
                        { backgroundColor: `${themeColors.secondary}18` },
                      ]}
                    >
                      <Ionicons
                        name={optionalWarmupSets[activeWarmupKey] ? "checkmark" : "flame-outline"}
                        size={16}
                        color={themeColors.secondary}
                      />
                    </View>
                    <View style={styles.optionalWarmupCopy}>
                      <Text style={[styles.optionalWarmupTitle, { color: themeColors.onSurface }]}>
                        Opsiyonel ısınma seti
                      </Text>
                      <Text style={[styles.optionalWarmupMeta, { color: themeColors.onSurfaceVariant }]}>
                        1 hafif hazırlık seti · çalışma setlerine eklenmez
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : null}

                <View style={styles.setTableHeader}>
                  <Text
                    style={[
                      styles.setTableLabel,
                      { color: themeColors.outline },
                    ]}
                  >
                    SET
                  </Text>
                  <Text
                    style={[
                      styles.setTableLabel,
                      { color: themeColors.outline },
                    ]}
                  >
                    {unitLabel.toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.setTableLabel,
                      { color: themeColors.outline },
                    ]}
                  >
                    {t("session.set_table_reps")}
                  </Text>
                  <Text
                    style={[
                      styles.doneColumnLabel,
                      { color: themeColors.outline },
                    ]}
                  >
                    {t("session.set_table_done")}
                  </Text>
                </View>
                <View style={styles.setList}>
                  {activeSets.map((set) => (
                    <View
                      key={set.key}
                      style={[
                        styles.setRow,
                        {
                          backgroundColor: set.done
                            ? themeColors.successContainer
                            : themeColors.surfaceContainerLow,
                          borderColor:
                            invalidSetKey === set.key
                              ? themeColors.error
                              : set.done
                                ? `${themeColors.success}55`
                                : themeColors.outlineVariant,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.setNumber,
                          {
                            backgroundColor:
                              themeColors.surfaceContainerHighest,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.setNumberText,
                            { color: themeColors.onSurface },
                          ]}
                        >
                          {set.order}
                        </Text>
                      </View>
                      <TextInput
                        value={set.kg}
                        onChangeText={(value) =>
                          updateSet(set.key, "kg", value)
                        }
                        keyboardType="decimal-pad"
                        selectTextOnFocus
                        placeholder="0"
                        placeholderTextColor={themeColors.outline}
                        style={[
                          styles.setInput,
                          {
                            color: themeColors.onSurface,
                            backgroundColor: themeColors.surfaceContainerLowest,
                            borderColor: themeColors.outlineVariant,
                          },
                        ]}
                      />
                      <TextInput
                        value={set.reps}
                        onChangeText={(value) =>
                          updateSet(set.key, "reps", value)
                        }
                        keyboardType="number-pad"
                        selectTextOnFocus
                        placeholder="0"
                        placeholderTextColor={themeColors.outline}
                        style={[
                          styles.setInput,
                          {
                            color: themeColors.onSurface,
                            backgroundColor: themeColors.surfaceContainerLowest,
                            borderColor: themeColors.outlineVariant,
                          },
                        ]}
                      />
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`${set.order}. ${t(set.done ? "session.set_edit_label" : "session.set_confirm_label")}`}
                        onPress={() => toggleSet(set.key)}
                        activeOpacity={0.75}
                        style={[
                          styles.doneButton,
                          {
                            backgroundColor: set.done
                              ? themeColors.success
                              : themeColors.primary,
                          },
                        ]}
                      >
                        {set.done ? (
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color={themeColors.onSuccess}
                          />
                        ) : (
                          <Text
                            style={[
                              styles.okText,
                              { color: themeColors.onPrimary },
                            ]}
                          >
                            OK
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                {invalidSetKey ? (
                  <View
                    style={[
                      styles.inputError,
                      { backgroundColor: `${themeColors.error}12` },
                    ]}
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={16}
                      color={themeColors.error}
                    />
                    <Text
                      style={[
                        styles.inputErrorText,
                        { color: themeColors.error },
                      ]}
                    >
                      {t("session.input_error")}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.exerciseNav}>
                  <TouchableOpacity
                    disabled={activeIndex === 0}
                    onPress={() => moveToExercise(activeIndex - 1)}
                    style={[
                      styles.navButton,
                      {
                        borderColor: themeColors.outlineVariant,
                        opacity: activeIndex === 0 ? 0.45 : 1,
                      },
                    ]}
                  >
                    <Ionicons
                      name="chevron-back"
                      size={18}
                      color={themeColors.onSurface}
                    />
                    <Text
                      style={[styles.navText, { color: themeColors.onSurface }]}
                    >
                      {t("session.previous")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={activeIndex === plan.exercises.length - 1}
                    onPress={() => moveToExercise(activeIndex + 1)}
                    style={[
                      styles.navButton,
                      {
                        backgroundColor: themeColors.primary,
                        borderColor: themeColors.primary,
                        opacity:
                          activeIndex === plan.exercises.length - 1 ? 0.45 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.navText, { color: themeColors.onPrimary }]}
                    >
                      {t("session.next")}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={themeColors.onPrimary}
                    />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ) : null}

            {plan?.warmup && plan.warmup.length > 0 ? (
              <GlassCard variant="panel" style={styles.warmupCard}>
                <Text style={[styles.warmupTitle, { color: themeColors.onSurface }]}>
                  Isınma
                </Text>
                <View style={styles.warmupList}>
                  {plan.warmup.map((item, index) => (
                    <View key={`${item.title}-${index}`} style={styles.warmupRow}>
                      <View
                        style={[
                          styles.warmupOrder,
                          { backgroundColor: `${themeColors.secondary}18` },
                        ]}
                      >
                        <Text style={[styles.warmupOrderText, { color: themeColors.secondary }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.warmupCopy}>
                        <Text style={[styles.warmupItemTitle, { color: themeColors.onSurface }]}>
                          {repairText(item.title)}
                        </Text>
                        <Text style={[styles.warmupItemMeta, { color: themeColors.onSurfaceVariant }]}>
                          {item.repsLabel ?? (item.durationSec ? `${item.durationSec} sn` : "Hazırlık")}
                          {item.note ? ` · ${repairText(item.note)}` : ""}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </GlassCard>
            ) : null}

            <GlassCard variant="panel" style={styles.flowCard}>
              <Text
                style={[styles.flowTitle, { color: themeColors.onSurface }]}
              >
                {t("session.flow_title")}
              </Text>
              <View style={styles.flowList}>
                {plan.exercises.map((entry, index) => {
                  const exerciseSets = sets.filter(
                    (set) => set.exerciseId === entry.exercise.id,
                  );
                  const doneCount = exerciseSets.filter(
                    (set) => set.done,
                  ).length;
                  const complete =
                    exerciseSets.length > 0 &&
                    doneCount === exerciseSets.length;
                  return (
                    <TouchableOpacity
                      key={`${entry.exercise.id}-${index}`}
                      onPress={() => moveToExercise(index)}
                      activeOpacity={0.8}
                      style={[
                        styles.flowRow,
                        {
                          backgroundColor:
                            index === activeIndex
                              ? `${themeColors.primary}12`
                              : themeColors.surfaceContainerLow,
                          borderColor:
                            index === activeIndex
                              ? themeColors.primary
                              : themeColors.outlineVariant,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.flowOrder,
                          {
                            backgroundColor: complete
                              ? themeColors.success
                              : themeColors.surfaceContainerHighest,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.flowOrderText,
                            {
                              color: complete
                                ? themeColors.onSuccess
                                : themeColors.onSurfaceVariant,
                            },
                          ]}
                        >
                          {complete ? "✓" : index + 1}
                        </Text>
                      </View>
                      <View style={styles.flowCopy}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.flowName,
                            { color: themeColors.onSurface },
                          ]}
                        >
                          {repairText(entry.exercise.displayName)}
                        </Text>
                        <Text
                          style={[
                            styles.flowMeta,
                            { color: themeColors.onSurfaceVariant },
                          ]}
                        >
                          {doneCount}/{entry.sets} {t("session.set_word")} ·{" "}
                          {entry.repLabel}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color={themeColors.outline}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </GlassCard>

            <GlassCard variant="panel" style={styles.finishCard}>
              <View style={styles.finishCardHeader}>
                <View style={styles.finishCardCopy}>
                  <Text
                    style={[
                      styles.finishCardTitle,
                      { color: themeColors.onSurface },
                    ]}
                  >
                    {t("session.finish_card_title")}
                  </Text>
                  <Text
                    style={[
                      styles.finishCardBody,
                      { color: themeColors.onSurfaceVariant },
                    ]}
                  >
                    {allDone
                      ? t("session.finish_card_all_done")
                      : `${formatNumber(sets.length - completedSets)} ${t("session.sets_left")}`}
                  </Text>
                </View>
                <View
                  style={[
                    styles.finishStatusIcon,
                    {
                      backgroundColor: allDone
                        ? themeColors.successContainer
                        : themeColors.surfaceContainerHigh,
                    },
                  ]}
                >
                  <Ionicons
                    name={allDone ? "checkmark-circle" : "lock-closed-outline"}
                    size={22}
                    color={allDone ? themeColors.success : themeColors.outline}
                  />
                </View>
              </View>
              <TouchableOpacity
                disabled={!allDone || saving}
                onPress={finishSession}
                activeOpacity={allDone ? 0.85 : 1}
                style={[
                  styles.finishButton,
                  {
                    backgroundColor: allDone
                      ? themeColors.success
                      : themeColors.surfaceContainerHigh,
                  },
                ]}
              >
                {saving ? (
                  <ActivityIndicator color={themeColors.onSuccess} />
                ) : (
                  <Ionicons
                    name="checkmark-done"
                    size={20}
                    color={allDone ? themeColors.onSuccess : themeColors.outline}
                  />
                )}
                <Text
                  style={[
                    styles.finishText,
                    {
                      color: allDone
                        ? themeColors.onSuccess
                        : themeColors.onSurfaceVariant,
                    },
                  ]}
                >
                  {saving
                    ? t("common.saving")
                    : t("session.finish_card_button")}
                </Text>
              </TouchableOpacity>
            </GlassCard>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      <Modal
        visible={checkInVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCheckInVisible(false)}
      >
        <View style={styles.exitSheetBackdrop}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("common.cancel")}
            activeOpacity={1}
            onPress={() => setCheckInVisible(false)}
            style={styles.exitSheetScrim}
          />
          <View
            style={[
              styles.checkInSheet,
              {
                paddingBottom: insets.bottom + spacing.md,
                backgroundColor: themeColors.surface,
                borderColor: themeColors.outlineVariant,
              },
            ]}
          >
            <View style={styles.exitSheetHandle} />
            <Text style={[styles.exitSheetTitle, { color: themeColors.onSurface }]}>
              {t({ tr: "Koç check-in", en: "Coach check-in" })}
            </Text>
            <Text style={[styles.exitSheetBody, { color: themeColors.onSurfaceVariant }]}>
              {t({
                tr: "Bunu doldurursan FORGE gelecek haftayı daha doğru ayarlar.",
                en: "Fill this in so FORGE can tune next week more accurately.",
              })}
            </Text>

            <CheckInScale
              title={t({ tr: "Bugün ne kadar zordu?", en: "How hard was today?" })}
              value={checkInRpe}
              values={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
              onChange={setCheckInRpe}
            />
            <CheckInScale
              title={t({ tr: "Kaç tekrar yedekte kaldı?", en: "How many reps in reserve?" })}
              value={checkInRir}
              values={[0, 1, 2, 3, 4, 5]}
              onChange={setCheckInRir}
            />

            <View style={styles.checkInGroup}>
              <Text style={[styles.checkInLabel, { color: themeColors.onSurface }]}>
                {t({ tr: "Ağrı var mı?", en: "Any pain?" })}
              </Text>
              <View style={styles.checkInChips}>
                {(["none", "knee", "shoulder", "lower_back"] as AIProgramPainLimitation[]).map((item) => (
                  <TouchableOpacity
                    key={item}
                    accessibilityRole="button"
                    activeOpacity={0.82}
                    onPress={() => setCheckInPain(item)}
                    style={[
                      styles.checkInChip,
                      {
                        backgroundColor: checkInPain === item ? themeColors.primary : themeColors.surfaceContainerLowest,
                        borderColor: checkInPain === item ? themeColors.primary : themeColors.outlineVariant,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.checkInChipText,
                        { color: checkInPain === item ? themeColors.onPrimary : themeColors.onSurface },
                      ]}
                    >
                      {item === "none"
                        ? t({ tr: "Yok", en: "None" })
                        : item === "knee"
                          ? t({ tr: "Diz", en: "Knee" })
                          : item === "shoulder"
                            ? t({ tr: "Omuz", en: "Shoulder" })
                            : t({ tr: "Bel", en: "Lower back" })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.checkInGroup}>
              <Text style={[styles.checkInLabel, { color: themeColors.onSurface }]}>
                {t({ tr: "Toparlanman nasıl?", en: "How is your recovery?" })}
              </Text>
              <View style={styles.checkInChips}>
                {(["poor", "okay", "good"] as SessionFeedback["recoveryNextDay"][]).map((item) => (
                  <TouchableOpacity
                    key={item}
                    accessibilityRole="button"
                    activeOpacity={0.82}
                    onPress={() => setCheckInRecovery(item)}
                    style={[
                      styles.checkInChip,
                      {
                        backgroundColor: checkInRecovery === item ? themeColors.primary : themeColors.surfaceContainerLowest,
                        borderColor: checkInRecovery === item ? themeColors.primary : themeColors.outlineVariant,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.checkInChipText,
                        { color: checkInRecovery === item ? themeColors.onPrimary : themeColors.onSurface },
                      ]}
                    >
                      {item === "poor"
                        ? t({ tr: "Zayıf", en: "Poor" })
                        : item === "good"
                          ? t({ tr: "İyi", en: "Good" })
                          : t({ tr: "Orta", en: "Okay" })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TextInput
              value={checkInNotes}
              onChangeText={setCheckInNotes}
              placeholder={t({ tr: "Kısa not (opsiyonel)", en: "Short note (optional)" })}
              placeholderTextColor={themeColors.onSurfaceVariant}
              multiline
              style={[
                styles.checkInInput,
                {
                  color: themeColors.onSurface,
                  backgroundColor: themeColors.surfaceContainerLowest,
                  borderColor: themeColors.outlineVariant,
                },
              ]}
            />

            <View style={styles.exitSheetActions}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                disabled={saving}
                onPress={() => {
                  void completeSession(false);
                }}
                style={[
                  styles.exitSheetButton,
                  {
                    backgroundColor: themeColors.surfaceContainerLowest,
                    borderWidth: 1,
                    borderColor: themeColors.outlineVariant,
                  },
                ]}
              >
                <Text style={[styles.exitSheetButtonText, { color: themeColors.onSurface }]}>
                  {t({ tr: "Atla", en: "Skip" })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                disabled={saving}
                onPress={() => {
                  void completeSession(true);
                }}
                style={[styles.exitSheetButton, { backgroundColor: themeColors.primary }]}
              >
                <Text style={[styles.exitSheetButtonText, { color: themeColors.onPrimary }]}>
                  {saving ? t("common.saving") : t({ tr: "Kaydet ve tamamla", en: "Save and finish" })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={exitSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExitSheetVisible(false)}
      >
        <View style={styles.exitSheetBackdrop}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("session.continue_workout_action")}
            activeOpacity={1}
            onPress={() => setExitSheetVisible(false)}
            style={styles.exitSheetScrim}
          />
          <View
            style={[
              styles.exitSheet,
              {
                paddingBottom: insets.bottom + spacing.md,
                backgroundColor: themeColors.surface,
                borderColor: themeColors.outlineVariant,
              },
            ]}
          >
            <View style={styles.exitSheetHandle} />
            <View style={styles.exitSheetHeader}>
              <View
                style={[
                  styles.exitSheetIcon,
                  { backgroundColor: `${themeColors.primary}14` },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={22}
                  color={themeColors.primary}
                />
              </View>
              <View style={styles.exitSheetCopy}>
                <Text
                  style={[
                    styles.exitSheetTitle,
                    { color: themeColors.onSurface },
                  ]}
                >
                  {t("session.exit_sheet_title")}
                </Text>
                <Text
                  style={[
                    styles.exitSheetBody,
                    { color: themeColors.onSurfaceVariant },
                  ]}
                >
                  {t("session.exit_sheet_body").replace(
                    "{n}",
                    formatNumber(completedSets),
                  )}
                </Text>
              </View>
            </View>
            <View style={styles.exitSheetActions}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => {
                  void keepDraftAndExit();
                }}
                style={[
                  styles.exitSheetButton,
                  { backgroundColor: themeColors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.exitSheetButtonText,
                    { color: themeColors.onPrimary },
                  ]}
                >
                  {t("session.keep_draft_action")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => {
                  setExitSheetVisible(false);
                  void savePartialSession(false);
                }}
                style={[
                  styles.exitSheetButton,
                  {
                    backgroundColor: themeColors.surfaceContainerLow,
                    borderColor: themeColors.outlineVariant,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.exitSheetSecondaryText,
                    { color: themeColors.onSurface },
                  ]}
                >
                  {t("session.save_and_exit_action")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => {
                  void discardSession();
                }}
                style={styles.exitSheetTextButton}
              >
                <Text
                  style={[
                    styles.exitSheetDestructiveText,
                    { color: themeColors.error },
                  ]}
                >
                  {t("session.discard_exit_action")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                onPress={() => setExitSheetVisible(false)}
                style={styles.exitSheetTextButton}
              >
                <Text
                  style={[
                    styles.exitSheetSecondaryText,
                    { color: themeColors.onSurfaceVariant },
                  ]}
                >
                  {t("session.continue_workout_action")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={swapSheetVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSwapSheetVisible(false)}
      >
        <View style={styles.swapSheetBackdrop}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("common.cancel")}
            activeOpacity={1}
            onPress={() => setSwapSheetVisible(false)}
            style={styles.swapSheetScrim}
          />
          <View
            style={[
              styles.swapSheet,
              {
                paddingBottom: insets.bottom + spacing.md,
                backgroundColor: themeColors.surface,
                borderColor: themeColors.outlineVariant,
              },
            ]}
          >
            <View style={styles.swapSheetHandle} />
            <View style={styles.swapSheetHeader}>
              <View style={styles.swapSheetTitleBlock}>
                <Text
                  style={[
                    styles.swapSheetEyebrow,
                    { color: themeColors.primary },
                  ]}
                >
                  HAREKETİ DEĞİŞTİR
                </Text>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.swapSheetTitle,
                    { color: themeColors.onSurface },
                  ]}
                >
                  {activeExercise
                    ? repairText(activeExercise.exercise.displayName)
                    : t("coach.swap_exercise")}
                </Text>
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t("common.cancel")}
                activeOpacity={0.75}
                onPress={() => setSwapSheetVisible(false)}
                style={[
                  styles.swapSheetClose,
                  { backgroundColor: themeColors.surfaceContainerLow },
                ]}
              >
                <Ionicons name="close" size={20} color={themeColors.onSurface} />
              </TouchableOpacity>
            </View>

            {swapSheetOptions.length > 0 ? (
              <View style={styles.swapOptionList}>
                {swapSheetOptions.map((option) => (
                  <TouchableOpacity
                    key={option.exerciseId}
                    accessibilityRole="button"
                    activeOpacity={0.86}
                    onPress={() => selectSwapOption(option)}
                    style={[
                      styles.swapOptionCard,
                      {
                        backgroundColor: themeColors.surfaceContainerLow,
                        borderColor: themeColors.outlineVariant,
                      },
                    ]}
                  >
                    <View style={styles.swapOptionCopy}>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.swapOptionTitle,
                          { color: themeColors.onSurface },
                        ]}
                      >
                        {repairText(option.displayName)}
                      </Text>
                      <View style={styles.swapChipRow}>
                        <View
                          style={[
                            styles.swapChip,
                            { backgroundColor: `${themeColors.primary}14` },
                          ]}
                        >
                          <Text
                            style={[
                              styles.swapChipText,
                              { color: themeColors.primary },
                            ]}
                          >
                            {repairText(option.targetLabel)}
                          </Text>
                        </View>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.swapOptionMeta,
                            { color: themeColors.onSurfaceVariant },
                          ]}
                        >
                          {repairText(option.why)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.swapSelectButton,
                        { backgroundColor: themeColors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.swapSelectText,
                          { color: themeColors.onPrimary },
                        ]}
                      >
                        Seç
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View
                style={[
                  styles.swapEmptyCard,
                  {
                    backgroundColor: themeColors.surfaceContainerLow,
                    borderColor: themeColors.outlineVariant,
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={24}
                  color={themeColors.outline}
                />
                <Text
                  style={[
                    styles.swapEmptyTitle,
                    { color: themeColors.onSurface },
                  ]}
                >
                  Güvenli yakın alternatif bulamadık
                </Text>
                <Text
                  style={[
                    styles.swapEmptyBody,
                    { color: themeColors.onSurfaceVariant },
                  ]}
                >
                  Bu hareket için aynı bölge ve aynı açıya uygun seçenek yok.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <ExerciseImageModal
        visible={selectedExerciseImage != null}
        title={selectedExerciseImage?.title ?? ""}
        imageUrls={selectedExerciseImage?.imageUrls ?? []}
        onClose={() => setSelectedExerciseImage(null)}
      />
    </View>
  );
}

function GlassImage({ uri }: { uri: string }) {
  return (
    <Image
      source={{ uri }}
      style={styles.activeImage}
      contentFit="cover"
      cachePolicy="disk"
      transition={160}
    />
  );
}

function shouldOfferOptionalWarmup(entry: SessionExercise, index: number): boolean {
  return index < 2 && entry.sets >= 3;
}

function optionalWarmupKey(entry: SessionExercise, index: number): string {
  return `warmup:${index}:${entry.exercise.id}`;
}

function buildDraftSets(
  plan: SessionPlan | null,
  logs: WorkoutLog[],
): DraftSet[] {
  if (!plan) return [];
  return plan.exercises.flatMap((entry) => {
    const previous = logs.find((log) =>
      log.setEntries?.some((set) => set.exerciseId === entry.exercise.id),
    );
    const previousSets =
      previous?.setEntries?.filter(
        (set) => set.exerciseId === entry.exercise.id && set.kind === "working",
      ) ?? [];
    return Array.from({ length: entry.sets }, (_, index) => {
      const previousKg =
        previousSets[index]?.kg ?? previousSets[previousSets.length - 1]?.kg;
      const kg = entry.weightKg ?? previousKg;
      return {
        key: `${entry.exercise.id}-${index + 1}`,
        exerciseId: entry.exercise.id,
        order: index + 1,
        kg: kg != null && kg >= 0 ? String(kg) : "",
        reps: String(entry.reps),
        done: false,
      };
    });
  });
}

function sanitizeNumber(value: string, allowDecimal: boolean): string {
  const clean = value
    .replace(",", ".")
    .replace(allowDecimal ? /[^0-9.]/g : /[^0-9]/g, "");
  if (!allowDecimal) return clean.slice(0, 3);
  const [whole, ...fractions] = clean.split(".");
  return fractions.length > 0
    ? `${whole}.${fractions.join("").slice(0, 1)}`
    : whole.slice(0, 4);
}

function isDraftSetReady(set: DraftSet): boolean {
  return (
    set.kg.trim() !== "" &&
    Number.isFinite(Number(set.kg)) &&
    Number(set.kg) >= 0 &&
    Number.isFinite(Number(set.reps)) &&
    Number(set.reps) > 0
  );
}

function Meta({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const { colors: themeColors } = useAppTheme();
  return (
    <View
      style={[
        styles.metaPill,
        { backgroundColor: themeColors.surfaceContainerHighest },
      ]}
    >
      <Ionicons name={icon} size={14} color={themeColors.onSurfaceVariant} />
      <Text style={[styles.metaText, { color: themeColors.onSurfaceVariant }]}>
        {label}
      </Text>
    </View>
  );
}

function CheckInScale({
  title,
  value,
  values,
  onChange,
}: {
  title: string;
  value: number;
  values: number[];
  onChange: (value: number) => void;
}) {
  const { colors: themeColors } = useAppTheme();
  return (
    <View style={styles.checkInGroup}>
      <Text style={[styles.checkInLabel, { color: themeColors.onSurface }]}>
        {title}
      </Text>
      <View style={styles.checkInChips}>
        {values.map((item) => {
          const active = item === value;
          return (
            <TouchableOpacity
              key={item}
              accessibilityRole="button"
              activeOpacity={0.82}
              onPress={() => onChange(item)}
              style={[
                styles.checkInNumberChip,
                {
                  backgroundColor: active
                    ? themeColors.primary
                    : themeColors.surfaceContainerLowest,
                  borderColor: active
                    ? themeColors.primary
                    : themeColors.outlineVariant,
                },
              ]}
            >
              <Text
                style={[
                  styles.checkInChipText,
                  { color: active ? themeColors.onPrimary : themeColors.onSurface },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  flex: { flex: 1 },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    minHeight: 78,
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle("sm"),
  },
  topTitleCopy: { flex: 1, alignItems: "center", gap: 1 },
  topTitle: { ...typography.buttonLg },
  topSubtitle: { ...typography.bodyXs },
  progressBadge: {
    minWidth: 48,
    height: 32,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBadgeText: { ...typography.numericMd },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.section + 4,
    gap: spacing.xs + 2,
  },
  emptyTitle: { ...typography.sectionTitle },
  emptyBody: { ...typography.bodyMd, textAlign: "center" },
  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.gutter,
  },
  sessionHero: { padding: spacing.lg, gap: spacing.sm },
  sessionEyebrow: { ...typography.labelCaps },
  sessionTitle: {
    ...typography.headlineLgMobile,
  },
  progressRail: { height: 8, borderRadius: radius.full, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  sessionMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaPill: {
    minHeight: 34,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm - 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: { ...typography.bodySm },
  draftNotice: {
    minHeight: 46,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  draftNoticeText: { ...typography.bodySm, flex: 1, lineHeight: 18 },
  resumeNotice: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    padding: spacing.smPlus,
    gap: spacing.sm,
  },
  cycleNotice: {
    marginTop: 4,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  cycleNoticeCopy: { flex: 1, gap: 3 },
  cycleNoticeLabel: { ...typography.labelMd },
  cycleNoticeBody: { ...typography.bodySm, lineHeight: 17 },
  resumeHeading: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  resumeCopy: { flex: 1, gap: 2 },
  resumeTitle: { ...typography.labelMd },
  resumeNoticeText: { ...typography.bodySm, lineHeight: 17 },
  resumeActions: { flexDirection: "row", gap: 8 },
  resumeButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  resumeButtonText: { ...typography.buttonSm },
  activeCard: { padding: spacing.cardPadding, gap: spacing.md },
  activeHeader: { flexDirection: "row", alignItems: "center", gap: 12, flexWrap: "wrap" },
  activeImageWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  activeImage: { width: "100%", height: "100%" },
  exerciseOrder: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseOrderText: { ...typography.headlineMd },
  activeCopy: { flex: 1, minWidth: 150, gap: 3 },
  activeTitle: { ...typography.sectionTitle, lineHeight: 24 },
  activeMeta: { ...typography.bodySm, lineHeight: 18 },
  optionalWarmupRow: {
    minHeight: 58,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionalWarmupIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  optionalWarmupCopy: { flex: 1, minWidth: 0, gap: 2 },
  optionalWarmupTitle: { ...typography.labelMd },
  optionalWarmupMeta: { ...typography.bodySm, lineHeight: 17 },
  warmupCard: { padding: spacing.cardPadding, gap: spacing.sm },
  warmupTitle: { ...typography.cardTitle },
  warmupList: { gap: 8 },
  warmupRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  warmupOrder: {
    width: 32,
    height: 32,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  warmupOrderText: { ...typography.labelMd },
  warmupCopy: { flex: 1, gap: 2 },
  warmupItemTitle: { ...typography.labelMd },
  warmupItemMeta: { ...typography.bodySm },
  setTableHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  setTableLabel: { ...typography.labelCaps, flex: 1, textAlign: "center" },
  doneColumnLabel: { ...typography.labelCaps, width: 52, textAlign: "center" },
  setList: { gap: 8 },
  setRow: {
    minHeight: 60,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  setNumber: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  setNumberText: { ...typography.labelMd },
  setInput: {
    flex: 1,
    minWidth: 0,
    height: 44,
    borderWidth: 1,
    borderRadius: radius.lg,
    textAlign: "center",
    paddingHorizontal: 6,
    ...typography.labelMd,
    fontVariant: ["tabular-nums"],
  },
  doneButton: {
    width: 54,
    height: 46,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  okText: { ...typography.buttonSm },
  inputError: {
    minHeight: 40,
    borderRadius: radius.lg,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  inputErrorText: { ...typography.bodySm, flex: 1 },
  exerciseNav: { flexDirection: "row", gap: 10 },
  navButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: radius.xl,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  navText: { ...typography.buttonLg },
  flowCard: { padding: spacing.cardPadding, gap: spacing.smPlus },
  flowTitle: { ...typography.cardTitle },
  flowList: { gap: 8 },
  flowRow: {
    minHeight: 66,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  flowOrder: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  flowOrderText: { ...typography.labelMd },
  flowCopy: { flex: 1, minWidth: 0, gap: 2 },
  flowName: { ...typography.labelMd },
  flowMeta: { ...typography.bodySm },
  finishCard: { padding: spacing.cardPadding, gap: spacing.md },
  finishCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  finishCardCopy: { flex: 1, minWidth: 0, gap: 3 },
  finishCardTitle: { ...typography.cardTitle },
  finishCardBody: { ...typography.bodySm },
  finishStatusIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  finishButton: {
    minHeight: 56,
    borderRadius: radius["2xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    ...shadowStyle("md"),
  },
  finishText: { ...typography.buttonLg },
  exitSheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  exitSheetScrim: {
    ...StyleSheet.absoluteFill,
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
  },
  checkInSheet: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    borderTopLeftRadius: radius["3xl"],
    borderTopRightRadius: radius["3xl"],
    borderWidth: 1,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.smPlus,
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
    gap: 12,
  },
  exitSheetIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  exitSheetCopy: { flex: 1, minWidth: 0, gap: 4 },
  exitSheetTitle: { ...typography.headlineMd, fontSize: 19, lineHeight: 25 },
  exitSheetBody: { ...typography.bodySm, lineHeight: 20 },
  exitSheetActions: { gap: 10 },
  exitSheetButton: {
    minHeight: 50,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  exitSheetButtonText: { ...typography.buttonLg, textAlign: "center" },
  exitSheetSecondaryText: { ...typography.labelMd, textAlign: "center" },
  exitSheetDestructiveText: { ...typography.labelMd, textAlign: "center" },
  exitSheetTextButton: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  checkInGroup: { gap: 8 },
  checkInLabel: { ...typography.labelMd },
  checkInChips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  checkInChip: {
    minHeight: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  checkInNumberChip: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  checkInChipText: { ...typography.buttonSm },
  checkInInput: {
    minHeight: 58,
    maxHeight: 92,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top",
    ...typography.bodySm,
  },
  swapSheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  swapSheetScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(4, 9, 14, 0.48)",
  },
  swapSheet: {
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
  swapSheetHandle: {
    width: 44,
    height: 5,
    borderRadius: radius.full,
    alignSelf: "center",
    backgroundColor: "rgba(120, 130, 145, 0.38)",
  },
  swapSheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.smPlus,
  },
  swapSheetTitleBlock: { flex: 1, minWidth: 0, gap: 4 },
  swapSheetEyebrow: { ...typography.labelCaps },
  swapSheetTitle: { ...typography.headlineMd, lineHeight: 26 },
  swapSheetClose: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  swapOptionList: { gap: 10 },
  swapOptionCard: {
    minHeight: 78,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    ...shadowStyle("sm"),
  },
  swapOptionCopy: { flex: 1, minWidth: 0, gap: 8 },
  swapOptionTitle: { ...typography.cardTitle, lineHeight: 23 },
  swapChipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  swapChip: {
    minHeight: 26,
    borderRadius: radius.full,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  swapChipText: { ...typography.labelXs },
  swapOptionMeta: { ...typography.bodyXs, flex: 1 },
  swapSelectButton: {
    minWidth: 58,
    minHeight: 40,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  swapSelectText: { ...typography.buttonSm },
  swapEmptyCard: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: "center",
    gap: 8,
  },
  swapEmptyTitle: { ...typography.cardTitle, textAlign: "center" },
  swapEmptyBody: {
    ...typography.bodySm,
    textAlign: "center",
    lineHeight: 19,
  },
  swapButton: {
    minHeight: 42,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  swapButtonText: { ...typography.buttonSm },
}));
