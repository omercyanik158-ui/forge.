import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter, useScrollToTop } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type FlashListRef } from "@shopify/flash-list";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AIActionButton } from "@/components/ai-hub/ai-action-button";
import { AICaptureGuidance } from "@/components/ai-hub/ai-capture-guidance";
import { AIHistoryCard } from "@/components/ai-hub/ai-history-card";
import { AIImageCard } from "@/components/ai-hub/ai-image-card";
import { AiLimitReachedModal } from "@/components/ai-hub/AiLimitReachedModal";
import { FoodResultCard } from "@/components/ai-hub/food-result-card";
import { PhysiqueResultCard } from "@/components/ai-hub/physique-result-card";
import { GlassCard } from "@/components/GlassCard";
import { ProgramInfluenceCard } from "@/components/ProgramInfluenceCard";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { TopBar } from "@/components/TopBar";
import { useAppLocalization } from "@/providers/localization-context";
import { compareFood, comparePhysique } from "@/services/aiHubComparison";
import { saveAIProgramPhysiqueSeed } from "@/services/aiProgramSeedStore";
import { resolvePrimaryAIProgramId } from "@/services/aiProgramInstanceStore";
import {
  buildProgramInfluenceSummary,
  summarizePhysiqueForProgram,
} from "@/services/aiProgramEngine";
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

type AIHubView = "home" | "physique";

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
  const [mode, setMode] = useState<AIHubMode>("physique");
  const [hubView, setHubView] = useState<AIHubView>("home");
  const [programSheetVisible, setProgramSheetVisible] = useState(false);
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
  const [refreshedAtMs, setRefreshedAtMs] = useState(0);
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
    () => {
      const filtered = logs.filter((log) => log.type === mode);
      return premium ? filtered : filtered.slice(0, 2);
    },
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
      nextRewardedState,
      mealAdAvailable,
      physiqueAdAvailable,
    ] = await Promise.all([
      loadProfile(),
      getLogs().catch(() => []),
      loadAIHubAccessState(),
      getCurrentAppUserId(),
      getCurrentDeviceId(),
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
    setSavedProgramId(await resolvePrimaryAIProgramId());
    setRewardedAvailability({
      [REWARDED_AD_TYPES.mealAnalysis]: mealAdAvailable,
      [REWARDED_AD_TYPES.physiqueAnalysis]: physiqueAdAvailable,
    });
    setRefreshedAtMs(Date.now());
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
      if (params.mode === "food" && premium) {
        setMode("food");
        setHubView("home");
        return;
      }
      if (params.mode === "physique") {
        setMode(params.mode);
        setHubView("physique");
        return;
      }
      setMode("physique");
      setHubView("home");
    }, [params.mode, premium]),
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

  const openNewProgramBuilder = () => {
    setProgramSheetVisible(false);
    router.push({
      pathname: "/ai-program-builder",
      params: { fresh: "1" },
    });
  };

  const openRegenerateProgram = () => {
    if (!savedProgramId) return;
    setProgramSheetVisible(false);
    router.push({
      pathname: "/ai-program-builder",
      params: { regenerateFromId: savedProgramId },
    });
  };

  const openPhysiqueFlow = () => {
    setProgramSheetVisible(false);
    setMode("physique");
    setHubView("physique");
  };

  const openProgramBuilderFromPhysique = (regenerate = false) => {
    if (!physiqueResult) return;
    void saveAIProgramPhysiqueSeed({
      result: physiqueResult,
      createdAt: new Date().toISOString(),
      source: "current_result",
    }).then(() => {
      router.push({
        pathname: "/ai-program-builder",
        params: regenerate && savedProgramId
          ? { entry: "physique_result", regenerateFromId: savedProgramId }
          : { entry: "physique_result" },
      });
    });
  };

  const currentProgramInfluence = physiqueResult
    ? buildProgramInfluenceSummary(
        summarizePhysiqueForProgram(
          physiqueResult,
          new Date().toISOString(),
          "current_result",
        ),
      )
    : undefined;

  const latestPhysiqueLog = useMemo(
    () => logs.find((log): log is PhysiqueAnalysisLog => log.type === "physique") ?? null,
    [logs],
  );
  const latestFocusArea = latestPhysiqueLog?.result.eksikBolgeler[0];
  const latestExerciseFocus = latestPhysiqueLog?.result.odaklanmasiGerekenHareketler[0];
  const analysisAgeLabel = latestPhysiqueLog
    ? (() => {
        const diffMs = (refreshedAtMs || new Date(latestPhysiqueLog.createdAt).getTime()) - new Date(latestPhysiqueLog.createdAt).getTime();
        const diffDays = Math.max(0, Math.floor(diffMs / 86_400_000));
        if (diffDays === 0) return t({ tr: "bugün", en: "today" });
        return t({ tr: `${diffDays} gün önce`, en: `${diffDays} days ago` });
      })()
    : t({ tr: "henüz yok", en: "not yet" });
  const firstName = profile?.name?.trim().split(/\s+/)[0] || t({ tr: "sporcu", en: "athlete" });
  const coachRecommendation = latestFocusArea
    ? t({
        tr: `Son vücut analizine göre ${latestFocusArea} odağın öne çıkıyor. Bugün programında ${latestExerciseFocus ?? "ana destek hareketlerine"} öncelik vermeni öneririm.`,
        en: `Your last physique analysis highlights ${latestFocusArea}. Today, prioritize ${latestExerciseFocus ?? "your key support lifts"} in your program.`,
      })
    : t({
        tr: "Bugünkü önerin hazır. İlk vücut analizini yaptığında FORGE program odağını ve gelişim takibini buna göre şekillendirecek.",
        en: "Today's recommendation is ready. After your first physique analysis, FORGE will shape program focus and progress tracking from it.",
      });

  const header = (
    <View style={styles.headerContent}>
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
      ) : hubView === "home" ? (
        <View style={styles.homeFlow}>
          <CoachRecommendationCard
            firstName={firstName}
            body={coachRecommendation}
            onPrimary={() => router.push("/(tabs)/fitness")}
            onWhy={openPhysiqueFlow}
          />

          <PhysiqueAnalysisHomeCard
            ageLabel={analysisAgeLabel}
            remainingLabel={
              premium
                ? t({ tr: "Premium", en: "Premium" })
                : t({ tr: `${remainingPhysiqueAnalyses} hak`, en: `${remainingPhysiqueAnalyses} left` })
            }
            onStart={openPhysiqueFlow}
          />

          <PersonalProgramHomeCard
            hasSavedProgram={Boolean(savedProgramId)}
            onOpen={() => setProgramSheetVisible(true)}
            onUpdate={savedProgramId ? openRegenerateProgram : openPhysiqueFlow}
          />

          <View style={styles.toolsBlock}>
            <Text style={[styles.toolsTitle, { color: colors.onSurface }]}>
              {t({ tr: "Araçlar", en: "Tools" })}
            </Text>
            <ToolRow
              icon="restaurant-outline"
              title={t({ tr: "Öğün Analizi", en: "Meal Analysis" })}
              body={t({ tr: "Fotoğraftan kalori ve makro tahmini", en: "Estimate calories and macros from a photo" })}
              onPress={() => {
                if (premium) {
                  setMode("food");
                  setHubView("home");
                } else {
                  router.push("/premium");
                }
              }}
            />
            <ToolRow
              icon="git-compare-outline"
              title={t({ tr: "Gelişim Karşılaştırma", en: "Progress Comparison" })}
              body={t({ tr: "Vücut fotoğraflarını zamanla kıyasla", en: "Compare physique photos over time" })}
              onPress={() => router.push("/body-progress")}
            />
          </View>
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
                  strengths: t({ tr: "Güçlü yönler", en: "Strengths" }),
                  improvements: t({ tr: "Geliştirilecek alanlar", en: "Improvement areas" }),
                  priorities: t({ tr: "Öncelik sıralaması", en: "Priority roadmap" }),
                  vTaper: t({ tr: "V-Taper görünümü", en: "V-taper look" }),
                  posture: t({ tr: "Postür notu", en: "Posture note" }),
                  fatDistribution: t({ tr: "Yağ dağılımı", en: "Fat distribution" }),
                }}
              />
              <ProgramInfluenceCard influence={currentProgramInfluence} />
              <AIActionButton
                label={t({
                  tr: "Bu değişimi Body Progress’te takip et",
                  en: "Track this change in Body Progress",
                })}
                icon="analytics-outline"
                secondary
                onPress={() => router.push("/body-progress")}
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
                label={t({ tr: "Bu analize göre program oluştur", en: "Build from this analysis" })}
                icon="barbell-outline"
                onPress={() => openProgramBuilderFromPhysique(false)}
              />
              {savedProgramId ? (
                <AIActionButton
                  label={t({ tr: "Programı bu sonuca göre güncelle", en: "Update program from this result" })}
                  icon="refresh-outline"
                  secondary
                  onPress={() => openProgramBuilderFromPhysique(true)}
                />
              ) : null}
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
        hubView !== "home" ? (
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
        ) : null
      ) : hasSavedAnalyses && hubView !== "home" ? (
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
      <TopBar
        showAvatar
        showAction
        actionIcon="settings-outline"
        onActionPress={() => router.push("/settings-privacy")}
      />
      <FlashList<AIHubLog>
        ref={listRef}
        data={premium && hubView !== "home" ? visibleLogs : []}
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
          premium && hubView !== "home" ? (
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
      <AIProgramChoiceSheet
        visible={programSheetVisible}
        hasSavedProgram={Boolean(savedProgramId)}
        onClose={() => setProgramSheetVisible(false)}
        onFresh={openNewProgramBuilder}
        onAnalyze={openPhysiqueFlow}
        onRegenerate={openRegenerateProgram}
      />
    </View>
  );
}

function CoachRecommendationCard({
  firstName,
  body,
  onPrimary,
  onWhy,
}: {
  firstName: string;
  body: string;
  onPrimary: () => void;
  onWhy: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  return (
    <GlassCard variant="panel" style={styles.coachCard}>
      <View style={styles.coachHeader}>
        <View style={[styles.coachSparkIcon, { backgroundColor: `${colors.primary}12` }]}>
          <Ionicons name="sparkles" size={24} color={colors.primary} />
        </View>
        <View style={styles.coachCopy}>
          <Text style={[styles.homeEyebrow, { color: colors.primary }]}>
            AI HUB
          </Text>
          <Text style={[styles.coachTitle, { color: colors.onSurface }]}>
            {t({ tr: `Günaydın ${firstName}`, en: `Good morning ${firstName}` })}
          </Text>
        </View>
      </View>
      <Text style={[styles.coachBody, { color: colors.onSurfaceVariant }]}>
        {body}
      </Text>
      <View style={styles.coachActions}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onPrimary}
          style={[styles.coachPrimaryButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.coachPrimaryText, { color: colors.onPrimary }]}>
            {t({ tr: "Antrenmanı Görüntüle", en: "View workout" })}
          </Text>
          <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onWhy}
          style={[styles.coachSecondaryButton, { borderColor: colors.primary }]}
        >
          <Text style={[styles.coachSecondaryText, { color: colors.primary }]}>
            {t({ tr: "Neden?", en: "Why?" })}
          </Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

function PhysiqueAnalysisHomeCard({
  ageLabel,
  remainingLabel,
  onStart,
}: {
  ageLabel: string;
  remainingLabel: string;
  onStart: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  return (
    <GlassCard variant="panel" style={styles.homeCard}>
      <View style={styles.homeCardHeader}>
        <View style={[styles.homeIcon, { backgroundColor: `${colors.secondary}18` }]}>
          <Ionicons name="body-outline" size={22} color={colors.secondary} />
        </View>
        <Text style={[styles.homeCardTitle, { color: colors.onSurface }]}>
          {t({ tr: "Vücut Analizi", en: "Physique Analysis" })}
        </Text>
        <Text style={[styles.homeMeta, { color: colors.onSurfaceVariant }]}>
          {ageLabel}
        </Text>
      </View>

      <View style={[styles.noticeBox, { backgroundColor: colors.surfaceContainerLow }]}>
        <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
        <Text style={[styles.noticeText, { color: colors.onSurfaceVariant }]}>
          {t({
            tr: "Yeni bir analiz, kişiselleştirilmiş önerilerini günceller.",
            en: "A new analysis updates your personalized recommendations.",
          })}
        </Text>
      </View>

      <View style={styles.estimateRow}>
        <Text style={[styles.estimateLabel, { color: colors.onSurfaceVariant }]}>
          {t({ tr: "Süre tahmini:", en: "Time estimate:" })}
        </Text>
        <Text style={[styles.estimateValue, { color: colors.onSurface }]}>
          {t({ tr: "30-60 saniye", en: "30-60 seconds" })}
        </Text>
      </View>
      <View style={styles.estimateRow}>
        <Text style={[styles.estimateLabel, { color: colors.onSurfaceVariant }]}>
          {t({ tr: "Kullanım:", en: "Usage:" })}
        </Text>
        <Text style={[styles.estimateValue, { color: colors.primary }]}>
          {remainingLabel}
        </Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.84}
        onPress={onStart}
        style={[styles.darkActionButton, { backgroundColor: colors.inverseSurface }]}
      >
        <Ionicons name="camera-outline" size={19} color={colors.inverseOnSurface} />
        <Text style={[styles.darkActionText, { color: colors.inverseOnSurface }]}>
          {t({ tr: "Yeni Analiz Başlat", en: "Start New Analysis" })}
        </Text>
      </TouchableOpacity>
    </GlassCard>
  );
}

function PersonalProgramHomeCard({
  hasSavedProgram,
  onOpen,
  onUpdate,
}: {
  hasSavedProgram: boolean;
  onOpen: () => void;
  onUpdate: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  return (
    <GlassCard variant="panel" style={styles.homeCard}>
      <View style={styles.homeCardHeader}>
        <View style={[styles.homeIcon, { backgroundColor: `${colors.primary}14` }]}>
          <Ionicons name="barbell-outline" size={22} color={colors.primary} />
        </View>
        <Text style={[styles.homeCardTitle, { color: colors.onSurface }]}>
          {t({ tr: "Kişisel Program", en: "Personal Program" })}
        </Text>
      </View>

      <View style={styles.programStatsRow}>
        <View style={styles.programStat}>
          <Text style={[styles.programStatLabel, { color: colors.onSurfaceVariant }]}>
            {t({ tr: "Odak", en: "Focus" })}
          </Text>
          <Text style={[styles.programStatValue, { color: colors.onSurface }]}>
            {hasSavedProgram
              ? t({ tr: "Program Hazır", en: "Plan Ready" })
              : t({ tr: "Hedeflerine Göre", en: "From Goals" })}
          </Text>
        </View>
        <View style={styles.programStat}>
          <Text style={[styles.programStatLabel, { color: colors.onSurfaceVariant }]}>
            {t({ tr: "Sıradaki", en: "Next" })}
          </Text>
          <Text style={[styles.programStatValue, { color: colors.onSurface }]}>
            {hasSavedProgram
              ? t({ tr: "Programı Aç", en: "Open Plan" })
              : t({ tr: "Plan Önerisi | 5-10 dk", en: "Plan Match | 5-10 min" })}
          </Text>
        </View>
      </View>

      <View style={styles.programHomeActions}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onOpen}
          style={[styles.programMainButton, { backgroundColor: `${colors.primary}14` }]}
        >
          <Text style={[styles.programMainText, { color: colors.onSurface }]}>
            {hasSavedProgram
              ? t({ tr: "Programı Aç", en: "Open Program" })
              : t({ tr: "Plan önerisi al", en: "Get plan recommendation" })}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onUpdate}
          style={[styles.programOutlineButton, { borderColor: colors.outlineVariant }]}
        >
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={[styles.programOutlineText, { color: colors.primary }]}>
            {hasSavedProgram
              ? t({ tr: "Yeniden öner", en: "Recommend again" })
              : t({ tr: "Analizle Başla", en: "Start with Analysis" })}
          </Text>
        </TouchableOpacity>
      </View>
    </GlassCard>
  );
}

function ToolRow({
  icon,
  title,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.84}
      onPress={onPress}
      style={[
        styles.toolRow,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={[styles.toolIcon, { backgroundColor: `${colors.secondary}14` }]}>
        <Ionicons name={icon} size={21} color={colors.secondary} />
      </View>
      <View style={styles.toolCopy}>
        <Text style={[styles.toolTitle, { color: colors.onSurface }]}>
          {title}
        </Text>
        <Text style={[styles.toolBody, { color: colors.onSurfaceVariant }]}>
          {body}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}

function AIProgramChoiceSheet({
  visible,
  hasSavedProgram,
  onClose,
  onFresh,
  onAnalyze,
  onRegenerate,
}: {
  visible: boolean;
  hasSavedProgram: boolean;
  onClose: () => void;
  onFresh: () => void;
  onAnalyze: () => void;
  onRegenerate: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t({ tr: "Program seçeneklerini kapat", en: "Close program options" })}
          activeOpacity={1}
          onPress={onClose}
          style={styles.sheetBackdrop}
        />
        <View
          style={[
            styles.sheetCard,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={[styles.sheetGrabber, { backgroundColor: colors.outlineVariant }]} />
          <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>
            {t({ tr: "Kişisel Program", en: "Personal Program" })}
          </Text>
          <Text style={[styles.sheetBody, { color: colors.onSurfaceVariant }]}>
            {t({
              tr: "Fotoğraf zorunlu değil. Hedef, seviye, ekipman, gün sayısı ve odak bölgelerini seç; sana en uygun planı önerelim.",
              en: "Photos are optional. Choose your goal, level, equipment, weekly days, and focus areas; we recommend the best-fit plan.",
            })}
          </Text>
          <View style={styles.sheetActionList}>
            <ProgramChoiceRow
              icon="sparkles-outline"
              title={t({ tr: "Hedeflerime göre plan öner", en: "Recommend a plan from my goals" })}
              body={t({
                tr: "Fotoğraf şart değil. Hedefin, seviyen, ekipmanın ve gün sayına göre en uygun planı seçelim.",
                en: "No photo required. We select the best-fit plan from your goal, level, equipment, and weekly days.",
              })}
              onPress={onFresh}
            />
            <ProgramChoiceRow
              icon="body-outline"
              title={t({ tr: "Vücut analiziyle daha kişisel hale getir", en: "Personalize with physique analysis" })}
              body={t({
                tr: "Önce analiz yorumunu gör, sonra program odağını buna göre şekillendir.",
                en: "Review the analysis first, then shape the program focus from it.",
              })}
              onPress={onAnalyze}
            />
            {hasSavedProgram ? (
              <ProgramChoiceRow
                icon="refresh-outline"
                title={t({ tr: "Mevcut programı güncelle", en: "Update current program" })}
                body={t({
                  tr: "Kayıtlı programını güncel cevaplarınla yeniden düzenle.",
                  en: "Regenerate your saved program with updated answers.",
                })}
                onPress={onRegenerate}
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ProgramChoiceRow({
  icon,
  title,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.84}
      onPress={onPress}
      style={[styles.sheetActionRowTall, { backgroundColor: colors.surfaceContainerLowest }]}
    >
      <View style={[styles.sheetActionIcon, { backgroundColor: `${colors.primary}14` }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.sheetActionCopy}>
        <Text style={[styles.sheetActionTitle, { color: colors.onSurface }]}>{title}</Text>
        <Text style={[styles.sheetActionBody, { color: colors.onSurfaceVariant }]}>{body}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
    </TouchableOpacity>
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
  homeFlow: { gap: spacing.section },
  coachCard: {
    borderRadius: radius["3xl"],
    padding: spacing.lg,
    gap: spacing.md,
    ...shadowStyle("floating"),
  },
  coachHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  coachSparkIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  coachCopy: { flex: 1 },
  homeEyebrow: { ...typography.labelCaps },
  coachTitle: { ...typography.sectionTitle },
  coachBody: { ...typography.bodyMd },
  coachActions: { flexDirection: "row", gap: spacing.sm },
  coachPrimaryButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  coachPrimaryText: { ...typography.buttonLg },
  coachSecondaryButton: {
    minWidth: 88,
    minHeight: 56,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  coachSecondaryText: { ...typography.buttonLg },
  homeCard: {
    borderRadius: radius["3xl"],
    padding: spacing.lg,
    gap: spacing.md,
    ...shadowStyle("sm"),
  },
  homeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  homeIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  homeCardTitle: { ...typography.cardTitle, flex: 1 },
  homeMeta: { ...typography.bodyXs },
  noticeBox: {
    borderRadius: radius.lg,
    padding: spacing.sm,
    flexDirection: "row",
    gap: spacing.xs,
    alignItems: "flex-start",
  },
  noticeText: { ...typography.bodySm, flex: 1 },
  estimateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  estimateLabel: { ...typography.bodySm },
  estimateValue: { ...typography.labelMd },
  darkActionButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  darkActionText: { ...typography.buttonLg },
  programStatsRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  programStat: { flex: 1, gap: 4 },
  programStatLabel: { ...typography.labelXs },
  programStatValue: { ...typography.labelMd },
  programHomeActions: { flexDirection: "row", gap: spacing.sm },
  programMainButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  programMainText: { ...typography.buttonSm, textAlign: "center" },
  programOutlineButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  programOutlineText: { ...typography.buttonSm, textAlign: "center" },
  toolsBlock: { gap: spacing.sm },
  toolsTitle: { ...typography.sectionTitle, marginBottom: spacing.xs },
  toolRow: {
    minHeight: 76,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...shadowStyle("sm"),
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  toolCopy: { flex: 1, gap: 3 },
  toolTitle: { ...typography.labelMd },
  toolBody: { ...typography.bodyXs },
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
  decisionGrid: { gap: spacing.smPlus },
  decisionCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    ...shadowStyle("floating"),
  },
  decisionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  decisionCopy: { gap: 5 },
  decisionTitle: { ...typography.cardTitle },
  decisionBody: { ...typography.bodySm },
  decisionFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
  decisionCta: { ...typography.buttonSm },
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
  sheetOverlay: { flex: 1, justifyContent: "flex-end" },
  sheetBackdrop: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(8, 12, 18, 0.42)",
  },
  sheetCard: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 12,
  },
  sheetGrabber: {
    alignSelf: "center",
    width: 42,
    height: 4,
    borderRadius: radius.full,
    marginBottom: 2,
  },
  sheetTitle: { ...typography.cardTitle },
  sheetBody: { ...typography.bodySm },
  sheetActionList: { gap: 10 },
  sheetActionRowTall: {
    minHeight: 82,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sheetActionIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetActionCopy: { flex: 1, gap: 3 },
  sheetActionTitle: { ...typography.labelMd },
  sheetActionBody: { ...typography.bodyXs, lineHeight: 17 },
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
