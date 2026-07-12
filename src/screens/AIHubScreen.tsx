import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter, useScrollToTop } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { AIActionButton } from "@/components/ai-hub/ai-action-button";
import { AICaptureGuidance } from "@/components/ai-hub/ai-capture-guidance";
import { AIHistoryCard } from "@/components/ai-hub/ai-history-card";
import { AIImageCard } from "@/components/ai-hub/ai-image-card";
import { AiLimitReachedModal } from "@/components/ai-hub/AiLimitReachedModal";
import { AISegmentedControl } from "@/components/ai-hub/ai-segmented-control";
import { FoodResultCard } from "@/components/ai-hub/food-result-card";
import { PhysiqueResultCard } from "@/components/ai-hub/physique-result-card";
import { GlassCard } from "@/components/GlassCard";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { TopBar } from "@/components/TopBar";
import { useAppLocalization } from "@/providers/localization-context";
import { compareFood, comparePhysique } from "@/services/aiHubComparison";
import { saveAIProgramPhysiqueSeed } from "@/services/aiProgramSeedStore";
import { loadAIProgramInstances } from "@/services/aiProgramInstanceStore";
import {
  ANALYTICS_EVENTS,
  trackEvent,
  trackScreen,
} from "@/services/analyticsService";
import { buildAiLimitModalModel } from "@/services/aiLimitModalModel";
import {
  consumeAiQuotaAfterSuccess,
  getAIQuotaDecision,
} from "@/services/aiQuotaGate";
import {
  getRemainingFreePhysiqueAnalyses,
  loadAIHubAccessState,
  type AIHubAccessState,
} from "@/services/aiHubAccess";
import {
  buildAIImageVariants,
  pickAIImage,
  type AIImageKind,
  type AIImageSource,
} from "@/services/aiImageService";
import {
  analyzeFood,
  analyzePhysique,
  AIHubApiError,
} from "@/services/geminiService";
import {
  getCurrentAppUserId,
  getCurrentDeviceId,
} from "@/services/accountIdentity";
import { successFeedback } from "@/services/interactionFeedback";
import { saveMeal } from "@/services/mealStore";
import { loadProfile } from "@/services/profileStore";
import {
  getRewardedAdStatus,
  initializeRewardedAds,
  loadRewardedAd,
  showRewardedAd,
} from "@/services/rewardedAdService";
import {
  loadRewardedCreditState,
  syncRewardedCreditStateFromSnapshot,
  type RewardedCreditState,
} from "@/services/rewardedCreditStore";
import {
  claimRewardedCredit,
  fetchRewardedCreditSnapshot,
} from "@/services/rewardedCreditApi";
import { deleteLog, getLogs, saveLog } from "@/services/storageService";
import { isPremium } from "@/services/subscription";
import {
  createDynamicStyles,
  layout,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { MealType, UserProfile } from "@/types";
import type {
  AIHubLog,
  AIHubMode,
  FoodAnalysisLog,
  FoodAnalysisResult,
  PhysiqueAnalysisLog,
  PhysiqueAnalysisResult,
  PreparedAIImage,
} from "@/types/aiHub";
import {
  REWARDED_AD_TYPES,
  type RewardedCreditType,
} from "@/config/rewardedAds";

type ImageSlot = "food" | "front" | "back";

const DEFAULT_ACCESS_STATE: AIHubAccessState = {
  mealUsageTimestamps: [],
  physiqueUsageTimestamps: [],
};

const DEFAULT_REWARDED_STATE: RewardedCreditState = {
  credits: {
    [REWARDED_AD_TYPES.mealAnalysis]: 0,
    [REWARDED_AD_TYPES.physiqueAnalysis]: 0,
  },
  dailyRewardCount: 0,
};

function shouldRetryAnalysis(error: unknown): boolean {
  if (!(error instanceof AIHubApiError)) return false;
  return error.code === "CONTENT_BLOCKED" || error.code === "AI_PROVIDER_ERROR";
}

function normalizeBase64Image(value: string): string {
  return value.replace(/^data:image\/[a-zA-Z0-9.+-]+;base64,/, "");
}

function createAnalysisRequestId(type: AIHubMode): string {
  return `${type}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

function createRewardedClaimId(type: RewardedCreditType): string {
  return `rewarded:${type}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

export default function AIHubScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: AIHubMode | string }>();
  const { colors } = useAppTheme();
  const { t, resolved } = useAppLocalization();
  const requestController = useRef<AbortController | null>(null);
  const listRef = useRef<FlashListRef<AIHubLog>>(null);
  const focusedModeRef = useRef<AIHubMode>("food");
  const focusedPremiumRef = useRef(false);
  useScrollToTop(listRef);
  const [mode, setMode] = useState<AIHubMode>("food");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [appUserId, setAppUserId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [logs, setLogs] = useState<AIHubLog[]>([]);
  const [accessState, setAccessState] =
    useState<AIHubAccessState>(DEFAULT_ACCESS_STATE);
  const [rewardedState, setRewardedState] = useState<RewardedCreditState>(
    DEFAULT_REWARDED_STATE,
  );
  const [rewardedAvailability, setRewardedAvailability] = useState<
    Record<RewardedCreditType, boolean>
  >({
    [REWARDED_AD_TYPES.mealAnalysis]: false,
    [REWARDED_AD_TYPES.physiqueAnalysis]: false,
  });
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rewardedLoading, setRewardedLoading] = useState(false);
  const [rewardedFeedback, setRewardedFeedback] = useState<
    string | undefined
  >();
  const [limitModalType, setLimitModalType] =
    useState<RewardedCreditType | null>(null);
  const [foodImage, setFoodImage] = useState<PreparedAIImage | null>(null);
  const [frontImage, setFrontImage] = useState<PreparedAIImage | null>(null);
  const [backImage, setBackImage] = useState<PreparedAIImage | null>(null);
  const [foodResult, setFoodResult] = useState<FoodAnalysisResult | null>(null);
  const [physiqueResult, setPhysiqueResult] =
    useState<PhysiqueAnalysisResult | null>(null);
  const [adultConsent, setAdultConsent] = useState(false);
  const [retainMedia, setRetainMedia] = useState(false);
  const [savedProgramId, setSavedProgramId] = useState<string | null>(null);

  const premium = isPremium(profile);
  const remainingPhysiqueAnalyses = premium
    ? Number.POSITIVE_INFINITY
    : getRemainingFreePhysiqueAnalyses(accessState);
  const foodQuotaDecision = getAIQuotaDecision({
    profile,
    accessState,
    rewardedState,
    creditType: REWARDED_AD_TYPES.mealAnalysis,
    rewardedAdAvailable: rewardedAvailability[REWARDED_AD_TYPES.mealAnalysis],
  });
  const physiqueQuotaDecision = getAIQuotaDecision({
    profile,
    accessState,
    rewardedState,
    creditType: REWARDED_AD_TYPES.physiqueAnalysis,
    rewardedAdAvailable:
      rewardedAvailability[REWARDED_AD_TYPES.physiqueAnalysis],
  });
  const visibleLogs = useMemo(
    () => (premium ? logs.filter((log) => log.type === mode) : []),
    [logs, mode, premium],
  );
  const hasSavedAnalyses = logs.length > 0;

  useEffect(() => {
    focusedModeRef.current = mode;
    focusedPremiumRef.current = premium;
  }, [mode, premium]);

  const refresh = useCallback(async () => {
    await initializeRewardedAds();
    const [
      nextProfile,
      nextLogs,
      nextAccessState,
      nextAppUserId,
      nextDeviceId,
      nextSavedPrograms,
      nextRewardedState,
      mealAdAvailable,
      physiqueAdAvailable,
    ] = await Promise.all([
      loadProfile(),
      getLogs().catch(() => []),
      loadAIHubAccessState(),
      getCurrentAppUserId(),
      getCurrentDeviceId(),
      loadAIProgramInstances(),
      loadRewardedCreditState(),
      loadRewardedAd(REWARDED_AD_TYPES.mealAnalysis),
      loadRewardedAd(REWARDED_AD_TYPES.physiqueAnalysis),
    ]);
    const rewardedSnapshot = nextAppUserId
      ? await fetchRewardedCreditSnapshot(nextAppUserId).catch(() => null)
      : null;
    const resolvedRewardedState = rewardedSnapshot
      ? await syncRewardedCreditStateFromSnapshot(rewardedSnapshot)
      : nextRewardedState;
    setProfile(nextProfile);
    setLogs(nextLogs);
    setAccessState(nextAccessState);
    setRewardedState(resolvedRewardedState);
    setAppUserId(nextAppUserId);
    setDeviceId(nextDeviceId);
    setSavedProgramId(nextSavedPrograms[0]?.id ?? null);
    setRewardedAvailability({
      [REWARDED_AD_TYPES.mealAnalysis]: mealAdAvailable,
      [REWARDED_AD_TYPES.physiqueAnalysis]: physiqueAdAvailable,
    });
    setLoadingHistory(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: 0, animated: false });
      });
      refresh().catch(() => setLoadingHistory(false));
      const focusedMode = focusedModeRef.current;
      const focusedPremium = focusedPremiumRef.current;
      void trackScreen("ai_hub_screen", {
        mode: focusedMode,
        premium: focusedPremium,
      });
      void trackEvent(ANALYTICS_EVENTS.aiHubOpened, {
        mode: focusedMode,
        premium: focusedPremium,
      });
      return () => requestController.current?.abort();
    }, [refresh]),
  );

  useFocusEffect(
    useCallback(() => {
      if (params.mode === "food" || params.mode === "physique") {
        setMode(params.mode);
      }
    }, [params.mode]),
  );

  const alertError = useCallback(
    (error: unknown) => {
      const code =
        error instanceof AIHubApiError
          ? error.code
          : error instanceof Error
            ? error.message
            : "UNKNOWN";
      const blockReason =
        error instanceof AIHubApiError ? error.details?.blockReason : undefined;
      const keyByCode: Record<string, string> = {
        CAMERA_PERMISSION_DENIED: "ai_hub.err_camera",
        AI_NOT_CONFIGURED: "ai_hub.err_not_configured",
        TIMEOUT: "ai_hub.err_timeout",
        NETWORK_ERROR: "ai_hub.err_network",
        INVALID_IMAGE: "ai_hub.err_invalid_image",
        RATE_LIMITED: "ai_hub.err_rate_limited",
        AI_PROVIDER_ERROR: "ai_hub.err_provider",
        ADULT_ONLY: "ai_hub.err_adult_only",
        DISTINCT_IMAGES_REQUIRED: "ai_hub.err_distinct_physique_images",
      };
      let message: string;
      if (code === "CONTENT_BLOCKED") {
        message =
          blockReason === "SAFETY" || blockReason === "PROHIBITED_CONTENT"
            ? t("ai_hub.err_blocked_sensitive")
            : t("ai_hub.err_blocked_default");
      } else if (keyByCode[code]) {
        message = t(keyByCode[code]);
      } else {
        message = t("ai_hub.alert_unknown");
      }
      Alert.alert(t("ai_hub.alert_failed_title"), message);
    },
    [t],
  );

  const closeLimitModal = useCallback(() => {
    setLimitModalType(null);
    setRewardedLoading(false);
    setRewardedFeedback(undefined);
  }, []);

  const openLimitModal = useCallback(
    (creditType: RewardedCreditType) => {
      const decision =
        creditType === REWARDED_AD_TYPES.mealAnalysis
          ? foodQuotaDecision
          : physiqueQuotaDecision;
      const model = buildAiLimitModalModel(creditType, decision);
      setLimitModalType(creditType);
      setRewardedFeedback(undefined);
      void trackEvent(ANALYTICS_EVENTS.aiQuotaBlocked, {
        creditType,
        blockedReason: model.blockedReason ?? "none",
        premium,
      });
      void trackEvent(ANALYTICS_EVENTS.rewardedAdPromptShown, {
        creditType,
        blockedReason: model.blockedReason ?? "none",
        premium,
      });
      if (model.blockedReason === "daily_cap_reached") {
        void trackEvent(ANALYTICS_EVENTS.rewardedDailyCapReached, {
          creditType,
          premium,
        });
      }
    },
    [foodQuotaDecision, physiqueQuotaDecision, premium],
  );

  const handleUpgradeFromLimit = useCallback(() => {
    if (!limitModalType) return;
    void trackEvent(ANALYTICS_EVENTS.premiumPromptFromAiLimit, {
      creditType: limitModalType,
      premium,
    });
    closeLimitModal();
    router.push("/premium");
  }, [closeLimitModal, limitModalType, premium, router]);

  const handleRewardedAd = useCallback(async () => {
    if (!limitModalType || rewardedLoading) return;
    setRewardedLoading(true);
    setRewardedFeedback(undefined);
    void trackEvent(ANALYTICS_EVENTS.rewardedAdStarted, {
      creditType: limitModalType,
      premium,
    });

    const outcome = await showRewardedAd(limitModalType);
    const availability = getRewardedAdStatus().availableByType;
    setRewardedAvailability({
      [REWARDED_AD_TYPES.mealAnalysis]:
        availability[REWARDED_AD_TYPES.mealAnalysis] === true,
      [REWARDED_AD_TYPES.physiqueAnalysis]:
        availability[REWARDED_AD_TYPES.physiqueAnalysis] === true,
    });

    if (outcome === "completed") {
      if (!appUserId || !deviceId) {
        setRewardedFeedback(t("rewarded_ads.unavailable_feedback"));
        setRewardedLoading(false);
        return;
      }
      const serverGrant = await claimRewardedCredit({
        creditType: limitModalType,
        appUserId,
        deviceId,
        premium,
        idempotencyKey: createRewardedClaimId(limitModalType),
      });
      if (!serverGrant.granted) {
        void trackEvent(ANALYTICS_EVENTS.rewardedAdFailed, {
          creditType: limitModalType,
          premium,
          reason: serverGrant.reason ?? "server_rejected",
        });
        setRewardedFeedback(
          serverGrant.reason === "daily_cap_reached"
            ? t("rewarded_ads.daily_cap_body")
            : t("rewarded_ads.unavailable_feedback"),
        );
        setRewardedLoading(false);
        return;
      }

      if (serverGrant.snapshot) {
        const syncedState = await syncRewardedCreditStateFromSnapshot(
          serverGrant.snapshot,
        );
        setRewardedState(syncedState);
        void trackEvent(ANALYTICS_EVENTS.rewardedAdCompleted, {
          creditType: limitModalType,
          premium,
        });
        void trackEvent(ANALYTICS_EVENTS.rewardedCreditGranted, {
          creditType: limitModalType,
          premium,
        });
        setRewardedFeedback(t("rewarded_ads.success"));
        setRewardedLoading(false);
        setTimeout(() => {
          closeLimitModal();
        }, 500);
        successFeedback();
        return;
      }
      setRewardedFeedback(t("rewarded_ads.unavailable_feedback"));
    }

    const eventByOutcome = {
      skipped: ANALYTICS_EVENTS.rewardedAdSkipped,
      failed: ANALYTICS_EVENTS.rewardedAdFailed,
      unavailable: ANALYTICS_EVENTS.rewardedAdUnavailable,
      unsupported: ANALYTICS_EVENTS.rewardedAdUnavailable,
    } as const;
    const feedbackByOutcome = {
      skipped: t("rewarded_ads.failed"),
      failed: t("rewarded_ads.failed"),
      unavailable: t("rewarded_ads.unavailable_feedback"),
      unsupported: t("rewarded_ads.unavailable_feedback"),
    } as const;
    if (outcome in eventByOutcome) {
      void trackEvent(eventByOutcome[outcome as keyof typeof eventByOutcome], {
        creditType: limitModalType,
        premium,
      });
      setRewardedFeedback(
        feedbackByOutcome[outcome as keyof typeof feedbackByOutcome],
      );
    }
    setRewardedLoading(false);
  }, [
    closeLimitModal,
    appUserId,
    deviceId,
    limitModalType,
    premium,
    rewardedLoading,
    t,
  ]);

  const selectImage = useCallback(
    (slot: ImageSlot) => {
      const kind: AIImageKind = slot === "food" ? "food" : "physique";
      const run = async (source: AIImageSource) => {
        try {
          const image = await pickAIImage(source, kind);
          if (!image) return;
          if (slot === "food") {
            setFoodImage(image);
            setFoodResult(null);
          } else if (slot === "front") {
            setFrontImage(image);
            setPhysiqueResult(null);
          } else {
            setBackImage(image);
            setPhysiqueResult(null);
          }
        } catch (error) {
          alertError(error);
        }
      };

      Alert.alert(
        t("ai_hub.alert_add_photo_title"),
        t("ai_hub.alert_add_photo_body"),
        [
          {
            text: t("ai_hub.source_camera"),
            onPress: () => void run("camera"),
          },
          {
            text: t("ai_hub.source_library"),
            onPress: () => void run("library"),
          },
          { text: t("common.cancel"), style: "cancel" },
        ],
      );
    },
    [alertError, t],
  );

  const runFoodAnalysis = async () => {
    if (!foodImage) {
      return;
    }
    if (!foodQuotaDecision.allowed) {
      openLimitModal(REWARDED_AD_TYPES.mealAnalysis);
      return;
    }
    const controller = new AbortController();
    requestController.current = controller;
    setAnalyzing(true);
    void trackEvent(ANALYTICS_EVENTS.foodAnalysisStarted, {
      premium,
      retainMedia,
    });
    void trackEvent(ANALYTICS_EVENTS.aiQuotaAllowed, {
      creditType: REWARDED_AD_TYPES.mealAnalysis,
      premium,
      source: foodQuotaDecision.source,
    });
    try {
      let result: FoodAnalysisResult | null = null;
      let lastError: unknown;
      const variants = [foodImage, ...(await buildAIImageVariants(foodImage))];
      const requestId = createAnalysisRequestId("food");

      for (const variant of variants) {
        try {
          const response = await analyzeFood(variant.base64, {
            language: resolved.language,
            premium,
            appUserId: appUserId ?? undefined,
            requestId,
            signal: controller.signal,
          });
          result = response.result;
          break;
        } catch (error) {
          lastError = error;
          if (!shouldRetryAnalysis(error)) throw error;
        }
      }

      if (!result) throw lastError;
      const nextQuotaState = await consumeAiQuotaAfterSuccess({
        profile,
        accessState,
        rewardedState,
        creditType: REWARDED_AD_TYPES.mealAnalysis,
      });
      setAccessState(nextQuotaState.accessState);
      setRewardedState(nextQuotaState.rewardedState);
      if (nextQuotaState.consumedSource === "rewarded_credit") {
        void trackEvent(ANALYTICS_EVENTS.rewardedCreditUsed, {
          creditType: REWARDED_AD_TYPES.mealAnalysis,
          premium,
        });
        void trackEvent(ANALYTICS_EVENTS.aiQuotaRewardedCreditUsed, {
          creditType: REWARDED_AD_TYPES.mealAnalysis,
          premium,
        });
      }
      setFoodResult(result);
      void trackEvent(ANALYTICS_EVENTS.foodAnalysisCompleted, {
        premium,
        confidence: result.guvenPuani,
      });
      successFeedback();
    } catch (error) {
      void trackEvent(ANALYTICS_EVENTS.foodAnalysisFailed, {
        premium,
        code: error instanceof AIHubApiError ? error.code : "UNKNOWN",
      });
      alertError(error);
    } finally {
      setAnalyzing(false);
      requestController.current = null;
    }
  };

  const runPhysiqueAnalysis = async () => {
    if (!frontImage || !backImage || !adultConsent) return;
    if (!physiqueQuotaDecision.allowed) {
      openLimitModal(REWARDED_AD_TYPES.physiqueAnalysis);
      return;
    }
    if (!profile || profile.age < 18) {
      Alert.alert(t("ai_hub.alert_failed_title"), t("ai_hub.err_adult_only"));
      return;
    }
    if (
      normalizeBase64Image(frontImage.base64) ===
      normalizeBase64Image(backImage.base64)
    ) {
      Alert.alert(
        t("ai_hub.alert_failed_title"),
        t("ai_hub.err_distinct_physique_images"),
      );
      return;
    }
    const controller = new AbortController();
    requestController.current = controller;
    setAnalyzing(true);
    void trackEvent(ANALYTICS_EVENTS.physiqueAnalysisStarted, {
      premium,
      remainingFreeAnalyses: Number.isFinite(remainingPhysiqueAnalyses)
        ? remainingPhysiqueAnalyses
        : -1,
      retainMedia,
    });
    void trackEvent(ANALYTICS_EVENTS.aiQuotaAllowed, {
      creditType: REWARDED_AD_TYPES.physiqueAnalysis,
      premium,
      source: physiqueQuotaDecision.source,
    });
    try {
      let result: PhysiqueAnalysisResult | null = null;
      let lastError: unknown;
      const frontVariants = [
        frontImage,
        ...(await buildAIImageVariants(frontImage)),
      ];
      const backVariants = [
        backImage,
        ...(await buildAIImageVariants(backImage)),
      ];
      const pairs = Math.min(frontVariants.length, backVariants.length);
      const requestId = createAnalysisRequestId("physique");

      for (let index = 0; index < pairs; index += 1) {
        try {
          const response = await analyzePhysique(
            frontVariants[index].base64,
            backVariants[index].base64,
            {
              language: resolved.language,
              premium,
              appUserId: appUserId ?? undefined,
              age: profile.age,
              requestId,
              signal: controller.signal,
            },
          );
          result = response.result;
          break;
        } catch (error) {
          lastError = error;
          if (!shouldRetryAnalysis(error)) throw error;
        }
      }

      if (!result) throw lastError;
      const nextQuotaState = await consumeAiQuotaAfterSuccess({
        profile,
        accessState,
        rewardedState,
        creditType: REWARDED_AD_TYPES.physiqueAnalysis,
      });
      setAccessState(nextQuotaState.accessState);
      setRewardedState(nextQuotaState.rewardedState);
      if (nextQuotaState.consumedSource === "rewarded_credit") {
        void trackEvent(ANALYTICS_EVENTS.rewardedCreditUsed, {
          creditType: REWARDED_AD_TYPES.physiqueAnalysis,
          premium,
        });
        void trackEvent(ANALYTICS_EVENTS.aiQuotaRewardedCreditUsed, {
          creditType: REWARDED_AD_TYPES.physiqueAnalysis,
          premium,
        });
      }
      setPhysiqueResult(result);
      void trackEvent(ANALYTICS_EVENTS.physiqueAnalysisCompleted, {
        premium,
        confidence: result.guvenPuani,
      });
      successFeedback();
    } catch (error) {
      void trackEvent(ANALYTICS_EVENTS.physiqueAnalysisFailed, {
        premium,
        code: error instanceof AIHubApiError ? error.code : "UNKNOWN",
      });
      alertError(error);
    } finally {
      setAnalyzing(false);
      requestController.current = null;
    }
  };

  const saveFoodEntry = async (mealType: MealType) => {
    if (!foodImage || !foodResult || saving) return;
    setSaving(true);
    try {
      const log = await saveLog({
        type: "food",
        primaryImageUri: foodImage.uri,
        result: foodResult,
        retainMedia,
      });
      await saveMeal({
        id: `ai-meal-${Date.now()}`,
        name: foodResult.yemekAdi,
        kcal: foodResult.kalori,
        protein: foodResult.protein,
        carbs: foodResult.karbonhidrat,
        fat: foodResult.yag,
        portion: foodResult.porsiyon,
        createdAt: new Date().toISOString(),
        source: "manual",
        mealType,
        imageUrl: log.primaryImageUri,
      });
      setLogs((current) => [log, ...current]);
      setFoodImage(null);
      setFoodResult(null);
      void trackEvent(ANALYTICS_EVENTS.foodAnalysisSaved, {
        mealType,
        premium,
      });
      void trackEvent(ANALYTICS_EVENTS.mealLogged, {
        source: "ai_hub",
        mealType,
      });
      successFeedback();
      Alert.alert(t("ai_hub.saved_food_title"), t("ai_hub.saved_food_body"));
    } catch (error) {
      alertError(error);
    } finally {
      setSaving(false);
    }
  };

  const chooseMealType = () => {
    const choices: [MealType, string][] = [
      ["breakfast", "ai_hub.meal_breakfast"],
      ["lunch", "ai_hub.meal_lunch"],
      ["dinner", "ai_hub.meal_dinner"],
      ["snack", "ai_hub.meal_snack"],
    ];
    Alert.alert(t("ai_hub.choose_meal"), undefined, [
      ...choices.map(([value, key]) => ({
        text: t(key),
        onPress: () => void saveFoodEntry(value),
      })),
      { text: t("common.cancel"), style: "cancel" as const },
    ]);
  };

  const savePhysiqueEntry = async () => {
    if (!frontImage || !backImage || !physiqueResult || saving) return;
    setSaving(true);
    try {
      const log = await saveLog({
        type: "physique",
        primaryImageUri: frontImage.uri,
        secondaryImageUri: backImage.uri,
        result: physiqueResult,
        retainMedia,
      });
      setLogs((current) => [log, ...current]);
      setFrontImage(null);
      setBackImage(null);
      setPhysiqueResult(null);
      setAdultConsent(false);
      void trackEvent(ANALYTICS_EVENTS.physiqueAnalysisSaved, {
        premium,
      });
      successFeedback();
      Alert.alert(
        t("ai_hub.saved_physique_title"),
        t("ai_hub.saved_physique_body"),
      );
    } catch (error) {
      alertError(error);
    } finally {
      setSaving(false);
    }
  };

  const removeLog = (log: AIHubLog) => {
    Alert.alert(t("ai_hub.delete_title"), t("ai_hub.delete_body"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLog(log.id);
            setLogs((current) => current.filter((item) => item.id !== log.id));
          } catch (error) {
            alertError(error);
          }
        },
      },
    ]);
  };

  const comparisonFor = useCallback(
    (log: AIHubLog): string | undefined => {
      const sameType = logs.filter((item) => item.type === log.type);
      const index = sameType.findIndex((item) => item.id === log.id);
      const previous = sameType[index + 1];
      if (!previous || previous.type !== log.type) return undefined;
      if (log.type === "food")
        return t(compareFood(log, previous as FoodAnalysisLog).summary);
      return t(comparePhysique(log, previous as PhysiqueAnalysisLog).summary);
    },
    [logs, t],
  );

  const heroStatus = premium
    ? {
        title: t("ai_hub.status_premium_title"),
        body: t("ai_hub.status_premium_body"),
      }
    : remainingPhysiqueAnalyses > 0
      ? {
          title: t("ai_hub.status_free_title"),
          body: t("ai_hub.status_free_body"),
        }
      : {
          title: t("ai_hub.status_used_title"),
          body: t("ai_hub.status_used_body"),
        };

  const openSavedProgram = () => {
    if (savedProgramId) {
      router.push({
        pathname: "/ai-program-detail",
        params: { id: savedProgramId },
      });
    }
  };

  const openNewProgramBuilder = () => {
    router.push({
      pathname: "/ai-program-builder",
      params: { fresh: "1" },
    });
  };

  const openProgramBuilderFromPhysique = () => {
    if (!physiqueResult) return;
    void saveAIProgramPhysiqueSeed({
      result: physiqueResult,
      createdAt: new Date().toISOString(),
      source: "current_result",
    }).then(() => {
      router.push({
        pathname: "/ai-program-builder",
        params: { entry: "physique_result" },
      });
    });
  };

  const header = (
    <View style={styles.headerContent}>
      <View
        style={[
          styles.hero,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.heroTopRow}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: colors.secondaryContainer },
            ]}
          >
            <Ionicons name="sparkles" size={24} color={colors.secondary} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: colors.secondary }]}>
              {t("ai_hub.eyebrow")}
            </Text>
            <Text style={[styles.title, { color: colors.onSurface }]}>
              {t({
                tr: "AI ile hızlı karar al",
                en: "Decide faster with AI",
              })}
            </Text>
            <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
              {t({
                tr: "Program kur, öğün analiz et, fizik raporunu koç notuna çevir.",
                en: "Build a plan, analyze meals, and turn physique reports into coaching notes.",
              })}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.heroDivider,
            { backgroundColor: colors.outlineVariant },
          ]}
        />

        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor: premium
                  ? `${colors.success}18`
                  : `${colors.secondary}18`,
              },
            ]}
          >
            <Ionicons
              name={
                premium
                  ? "checkmark-circle"
                  : remainingPhysiqueAnalyses > 0
                    ? "flash-outline"
                    : "lock-closed-outline"
              }
              size={18}
              color={premium ? colors.success : colors.secondary}
            />
          </View>
          <View style={styles.statusCopy}>
            <Text style={[styles.statusTitle, { color: colors.onSurface }]}>
              {heroStatus.title}
            </Text>
            <Text
              style={[styles.statusBody, { color: colors.onSurfaceVariant }]}
            >
              {heroStatus.body}
            </Text>
          </View>
        </View>
      </View>

      <View
        style={[
          styles.programCard,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <View style={styles.programHeader}>
          <View
            style={[
              styles.programIcon,
              { backgroundColor: `${colors.primary}18` },
            ]}
          >
            <Ionicons name="barbell-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.programCopy}>
            <Text style={[typography.cardTitle, { color: colors.onSurface }]}>
              {t({ tr: "AI program koçu", en: "AI program coach" })}
            </Text>
            <Text
              style={[typography.bodyXs, { color: colors.onSurfaceVariant }]}
            >
              {t({
                tr: "AI programını burada oluştur, sonra Antrenman sekmesinde uygula ve yönet.",
                en: "Create your AI program here, then use and manage it in the Training tab.",
              })}
            </Text>
          </View>
        </View>
        {savedProgramId ? (
          <View style={styles.programActions}>
            <AIActionButton
              label={t("ai_program.feature_view")}
              icon="eye-outline"
              secondary
              style={styles.programActionButton}
              onPress={openSavedProgram}
            />
            <AIActionButton
              label={t("ai_program.feature_start")}
              icon="sparkles-outline"
              style={styles.programActionButton}
              onPress={openNewProgramBuilder}
            />
          </View>
        ) : null}
        {!savedProgramId ? (
          <View style={styles.programActions}>
            <AIActionButton
              label={t("ai_program.feature_start")}
              icon="sparkles-outline"
              style={styles.programActionButton}
              onPress={openNewProgramBuilder}
            />
          </View>
        ) : null}
      </View>

      <AISegmentedControl
        value={mode}
        foodLabel={t("ai_hub.tab_food")}
        physiqueLabel={t("ai_hub.tab_physique")}
        onChange={(value) => {
          setMode(value);
          void trackEvent(ANALYTICS_EVENTS.aiHubModeChanged, {
            mode: value,
            premium,
          });
        }}
      />

      {mode === "food" ? (
        <View style={styles.flow}>
          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              {t("ai_hub.food_section_title")}
            </Text>
            <Text
              style={[styles.sectionBody, { color: colors.onSurfaceVariant }]}
            >
              {t({
                tr: "Fotoxrafı yükle, kalori ve makroyu düzenleyip günlüxe kaydet.",
                en: "Upload a photo, adjust calories and macros, then save it.",
              })}
            </Text>
          </View>
          {!premium ? (
            <PremiumFeatureCard
              title={t("ai_hub.food_premium_title")}
              body={t("ai_hub.food_premium_body")}
              note={t("ai_hub.food_premium_note")}
              ctaLabel={t("ai_hub.unlock_premium")}
              onPress={() => router.push("/premium")}
            />
          ) : null}
          <AICaptureGuidance
            title={t("ai_hub.capture_food_title")}
            accent="tertiary"
            tips={[
              {
                icon: "scan-outline",
                label: t("ai_hub.capture_food_tip_frame"),
              },
              {
                icon: "sunny-outline",
                label: t("ai_hub.capture_food_tip_light"),
              },
              {
                icon: "phone-portrait-outline",
                label: t("ai_hub.capture_food_tip_angle"),
              },
            ]}
          />
          <AIImageCard
            label={t("ai_hub.food_card_label")}
            hint={t("ai_hub.food_card_hint")}
            uri={foodImage?.uri}
            onPress={() => selectImage("food")}
            onRemove={
              foodImage
                ? () => {
                    setFoodImage(null);
                    setFoodResult(null);
                  }
                : undefined
            }
          />
          <AIActionButton
            label={t("ai_hub.food_analyze_action")}
            loading={analyzing}
            disabled={!foodImage}
            onPress={() => void runFoodAnalysis()}
          />
          {analyzing ? (
            <View
              style={[
                styles.disclaimer,
                { backgroundColor: colors.surfaceContainerLow },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={19}
                color={colors.secondary}
              />
              <Text
                style={[styles.disclaimerText, { color: colors.onSurface }]}
              >
                {t("ai_hub.processing_notice")}
              </Text>
            </View>
          ) : null}
          {foodResult ? (
            <>
              <FoodResultCard
                result={foodResult}
                onChange={setFoodResult}
                labels={{
                  title: t("ai_hub.food_result_title"),
                  portion: t("ai_hub.food_result_portion"),
                  grams: t("ai_hub.food_result_grams"),
                  scaleHint: t("ai_hub.food_result_scale_hint"),
                  calories: t("ai_hub.food_result_calories"),
                  protein: t("ai_hub.food_result_protein"),
                  carbs: t("ai_hub.food_result_carbs"),
                  fat: t("ai_hub.food_result_fat"),
                  confidence: t("ai_hub.food_result_confidence"),
                  confidenceNote: t("ai_hub.confidence_note"),
                }}
              />
              <MediaRetentionToggle
                value={retainMedia}
                onChange={setRetainMedia}
                label={t("ai_hub.retain_media")}
              />
              <AIActionButton
                label={
                  saving ? t("common.saving") : t("ai_hub.food_save_action")
                }
                icon="bookmark-outline"
                loading={saving}
                onPress={chooseMealType}
              />
            </>
          ) : null}
        </View>
      ) : (
        <View style={styles.flow}>
          <View style={styles.sectionHeading}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              {t("ai_hub.physique_section_title")}
            </Text>
            <Text
              style={[styles.sectionBody, { color: colors.onSurfaceVariant }]}
            >
              {t({
                tr: "Ön ve arka pozdan odak bölgelerini ve program sinyalini çıkar.",
                en: "Use front and back poses to extract focus areas and plan signals.",
              })}
            </Text>
          </View>
          <AICaptureGuidance
            title={t("ai_hub.capture_physique_title")}
            accent="secondary"
            tips={[
              {
                icon: "body-outline",
                label: t("ai_hub.capture_physique_tip_frame"),
              },
              {
                icon: "accessibility-outline",
                label: t("ai_hub.capture_physique_tip_pose"),
              },
              {
                icon: "image-outline",
                label: t("ai_hub.capture_physique_tip_background"),
              },
            ]}
          />
          <View style={styles.poseRow}>
            <AIImageCard
              aspect="portrait"
              label={t("ai_hub.front_label")}
              hint={t("ai_hub.pose_hint")}
              uri={frontImage?.uri}
              onPress={() => selectImage("front")}
              onRemove={
                frontImage
                  ? () => {
                      setFrontImage(null);
                      setPhysiqueResult(null);
                    }
                  : undefined
              }
            />
            <AIImageCard
              aspect="portrait"
              label={t("ai_hub.back_label")}
              hint={t("ai_hub.pose_hint")}
              uri={backImage?.uri}
              onPress={() => selectImage("back")}
              onRemove={
                backImage
                  ? () => {
                      setBackImage(null);
                      setPhysiqueResult(null);
                    }
                  : undefined
              }
            />
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: adultConsent }}
            onPress={() => setAdultConsent((value) => !value)}
            style={[
              styles.consent,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: adultConsent
                  ? colors.primary
                  : colors.outlineVariant,
              },
            ]}
          >
            <Ionicons
              name={adultConsent ? "checkbox" : "square-outline"}
              size={23}
              color={adultConsent ? colors.primary : colors.onSurfaceVariant}
            />
            <Text style={[styles.consentText, { color: colors.onSurface }]}>
              {t("ai_hub.consent")}
            </Text>
          </Pressable>
          <View
            style={[
              styles.disclaimer,
              { backgroundColor: colors.surfaceContainerLow },
            ]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={19}
              color={colors.secondary}
            />
            <Text style={[styles.disclaimerText, { color: colors.onSurface }]}>
              {profile && profile.age >= 18
                ? t("ai_hub.physique_privacy_notice")
                : t("ai_hub.physique_age_gate_notice")}
            </Text>
          </View>
          <MediaRetentionToggle
            value={retainMedia}
            onChange={setRetainMedia}
            label={t("ai_hub.retain_media")}
          />
          <AIActionButton
            label={t(
              premium
                ? "ai_hub.analyze_physique_premium"
                : "ai_hub.analyze_physique_free",
            )}
            loading={analyzing}
            disabled={!frontImage || !backImage || !adultConsent}
            onPress={() => void runPhysiqueAnalysis()}
          />
          {analyzing ? (
            <View
              style={[
                styles.disclaimer,
                { backgroundColor: colors.surfaceContainerLow },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={19}
                color={colors.secondary}
              />
              <Text
                style={[styles.disclaimerText, { color: colors.onSurface }]}
              >
                {t("ai_hub.processing_notice")}
              </Text>
            </View>
          ) : null}
          {physiqueResult ? (
            <>
              <PhysiqueResultCard
                result={physiqueResult}
                labels={{
                  report: t("ai_hub.physique_report_label"),
                  estimate: t("ai_hub.physique_estimate"),
                  focus: t("ai_hub.physique_focus"),
                  exercises: t("ai_hub.physique_exercises"),
                  muscle: t("ai_hub.physique_muscle"),
                  pose: t("ai_hub.physique_pose"),
                  confidence: t("ai_hub.food_result_confidence"),
                  confidenceNote: t("ai_hub.confidence_note"),
                }}
              />
              <AIActionButton
                label={
                  saving ? t("common.saving") : t("ai_hub.physique_save_action")
                }
                icon="bookmark-outline"
                loading={saving}
                onPress={() => void savePhysiqueEntry()}
              />
              <AIActionButton
                label={t("ai_program.feature_from_physique")}
                icon="barbell-outline"
                onPress={openProgramBuilderFromPhysique}
              />
              {!premium ? (
                <PremiumFeatureCard
                  title={t("ai_hub.physique_comparison_title")}
                  body={t("ai_hub.physique_comparison_body")}
                  ctaLabel={t("ai_hub.unlock_comparisons")}
                  onPress={() => router.push("/premium")}
                />
              ) : null}
            </>
          ) : null}
          <View
            style={[
              styles.disclaimer,
              { backgroundColor: colors.tertiaryContainer },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={19}
              color={colors.tertiary}
            />
            <Text style={[styles.disclaimerText, { color: colors.onSurface }]}>
              {t("ai_hub.disclaimer")}
            </Text>
          </View>
        </View>
      )}

      {premium ? (
        <View style={styles.historyHeading}>
          <View>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              {t("ai_hub.history_title")}
            </Text>
            <Text
              style={[styles.sectionBody, { color: colors.onSurfaceVariant }]}
            >
              {t("ai_hub.history_body")}
            </Text>
          </View>
          <View
            style={[
              styles.countBadge,
              { backgroundColor: colors.secondaryContainer },
            ]}
          >
            <Text style={[styles.countText, { color: colors.secondary }]}>
              {visibleLogs.length}
            </Text>
          </View>
        </View>
      ) : hasSavedAnalyses ? (
        <PremiumFeatureCard
          title={t("ai_hub.history_ready_title")}
          body={t("ai_hub.history_ready_body")}
          ctaLabel={t("ai_hub.open_history")}
          onPress={() => router.push("/premium")}
        />
      ) : null}
    </View>
  );
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar />
      <FlashList<AIHubLog>
        ref={listRef}
        data={premium ? visibleLogs : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AIHistoryCard
            log={item}
            localeLabel={t}
            comparison={comparisonFor(item)}
            onDelete={removeLog}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={
          premium ? (
            loadingHistory ? (
              <GlassCard variant="panel" style={styles.loadingCard}>
                <ActivityIndicator
                  color={colors.primary}
                  style={styles.loader}
                />
                <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                  {mode === "food"
                    ? t("ai_hub.history_title")
                    : t("ai_hub.history_title")}
                </Text>
                <Text
                  style={[styles.emptyBody, { color: colors.onSurfaceVariant }]}
                >
                  {t("ai_hub.history_body")}
                </Text>
              </GlassCard>
            ) : (
              <GlassCard variant="panel" style={styles.emptyCard}>
                <Ionicons
                  name="albums-outline"
                  size={28}
                  color={colors.secondary}
                />
                <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                  {t("ai_hub.empty_title")}
                </Text>
                <Text
                  style={[styles.emptyBody, { color: colors.onSurfaceVariant }]}
                >
                  {t("ai_hub.empty_body")}
                </Text>
              </GlassCard>
            )
          ) : null
        }
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: insets.top + spacing.screenHeaderOffset,
            paddingBottom: spacing.tabContentBottom,
          },
        ]}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
      <AiLimitReachedModal
        visible={limitModalType !== null}
        creditType={limitModalType ?? REWARDED_AD_TYPES.physiqueAnalysis}
        decision={
          limitModalType === REWARDED_AD_TYPES.mealAnalysis
            ? foodQuotaDecision
            : physiqueQuotaDecision
        }
        title={t("rewarded_ads.limit_title")}
        body={t("rewarded_ads.limit_body")}
        dailyCapBody={t("rewarded_ads.daily_cap_body")}
        unavailableBody={t("rewarded_ads.unavailable_body")}
        primaryLabel={t("rewarded_ads.upgrade_cta")}
        secondaryLabel={t("rewarded_ads.watch_cta")}
        loading={rewardedLoading}
        feedback={rewardedFeedback}
        onClose={closeLimitModal}
        onUpgrade={handleUpgradeFromLimit}
        onWatchAd={() => void handleRewardedAd()}
      />
    </View>
  );
}

function MediaRetentionToggle({
  value,
  onChange,
  label,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[
        styles.consent,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: value ? colors.secondary : colors.outlineVariant,
        },
      ]}
    >
      <Ionicons
        name={value ? "checkbox" : "square-outline"}
        size={23}
        color={value ? colors.secondary : colors.onSurfaceVariant}
      />
      <Text style={[styles.consentText, { color: colors.onSurface }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  listContent: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
  },
  headerContent: { gap: spacing.section, paddingBottom: spacing.section },
  hero: {
    borderRadius: radius["4xl"],
    borderWidth: 1,
    padding: spacing.section - 6,
    gap: spacing.smPlus,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.smPlus,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: { flex: 1, gap: spacing.xs - 2 },
  heroDivider: { height: 1, width: "100%" },
  eyebrow: { ...typography.labelCaps },
  title: { ...typography.headlineLgMobile },
  subtitle: { ...typography.bodySm },
  statusCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  statusCopy: { flex: 1, gap: 5 },
  statusTitle: { ...typography.labelMd },
  statusBody: { ...typography.bodySm },
  flow: { gap: spacing.md },
  programCard: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    ...shadowStyle("floating"),
  },
  programHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  programIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  programCopy: { flex: 1, gap: 4 },
  programActions: {
    flexDirection: "row",
    gap: 10,
  },
  programActionButton: { flex: 1 },
  sectionHeading: { gap: 4 },
  sectionTitle: { ...typography.sectionTitle },
  sectionBody: { ...typography.bodySm },
  poseRow: { flexDirection: "row", gap: spacing.sm },
  consent: {
    minHeight: 64,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    padding: spacing.smPlus,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs + 2,
  },
  consentText: { ...typography.bodySm, flex: 1 },
  disclaimer: {
    borderRadius: radius["2xl"],
    padding: spacing.smPlus,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs + 2,
  },
  disclaimerText: { ...typography.bodySm, flex: 1 },
  historyHeading: {
    paddingTop: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  countBadge: {
    minWidth: 40,
    height: 32,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { ...typography.numericMd },
  separator: { height: spacing.sm },
  loader: { paddingVertical: 4 },
  loadingCard: {
    minHeight: 164,
    padding: spacing.section - 6,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  emptyCard: {
    minHeight: 172,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  emptyTitle: { ...typography.cardTitle },
  emptyBody: { ...typography.bodySm, textAlign: "center", maxWidth: 320 },
}));
