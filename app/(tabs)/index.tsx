import {
  createDynamicStyles,
  layout,
  radius,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter, useScrollToTop } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { GlassCard } from "@/components/GlassCard";
import { MacroBar } from "@/components/MacroBar";
import { useAppLocalization } from "@/providers/localization-context";
import { getStreakCount } from "@/services/achievementStore";
import {
  DEFAULT_DAILY_CALORIE_GOAL,
  calorieGoal,
  macroGoals,
  macroGoalsFromCalories,
  mealTotals,
} from "@/services/calculations";
import { dateKey } from "@/services/dateUtils";
import { formatNumber } from "@/services/localization";
import { loadMealsForDate } from "@/services/mealStore";
import { loadProfile } from "@/services/profileStore";
import {
  loadTrainingAnalysis,
  type TrainingAnalysis,
} from "@/services/trainingAnalysis";
import { weeklyWorkoutSummary } from "@/services/workoutStore";
import { formatPersonName } from "@/services/textUtils";
import {
  loadBodyProgress,
  type BodyProgressSnapshot,
} from "@/services/bodyProgress";
import type { Meal, UserProfile } from "@/types";

type WeeklyWorkout = {
  count: number;
  minutes: number;
  kcal: number;
};

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [analysis, setAnalysis] = useState<TrainingAnalysis | null>(null);
  const [bodyProgress, setBodyProgress] = useState<BodyProgressSnapshot | null>(null);
  const [weeklyTraining, setWeeklyTraining] = useState<WeeklyWorkout>({
    count: 0,
    minutes: 0,
    kcal: 0,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);

    try {
      const results = await Promise.allSettled([
        loadProfile(),
        loadMealsForDate(dateKey()),
        weeklyWorkoutSummary(),
        loadTrainingAnalysis(),
        loadBodyProgress(),
      ] as const);

      const loadedProfile =
        results[0].status === "fulfilled" ? results[0].value : null;
      const dailyMeals =
        results[1].status === "fulfilled" ? results[1].value : [];
      const workouts =
        results[2].status === "fulfilled"
          ? results[2].value
          : { count: 0, minutes: 0, kcal: 0 };
      const trainingAnalysis =
        results[3].status === "fulfilled" ? results[3].value : null;
      const progressSnapshot =
        results[4].status === "fulfilled" ? results[4].value : null;

      const failedResult = results.find(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected",
      );

      if (failedResult) {
        console.warn("[Dashboard] Bazı veriler yüklenemedi:", failedResult.reason);
        setLoadError(
          t({
            tr: "Bazı veriler şu anda yüklenemedi. Ekranı aşağı çekerek tekrar deneyebilirsin.",
            en: "Some data could not be loaded. Pull down to try again.",
          }),
        );
      }

      setProfile(loadedProfile);
      setMeals(dailyMeals);
      setWeeklyTraining(workouts);
      setAnalysis(trainingAnalysis);
      setBodyProgress(progressSnapshot);
    } catch (error) {
      console.warn("[Dashboard] Ana sayfa yenilenemedi:", error);
      setLoadError(
        t({
          tr: "Ana sayfa verileri yüklenemedi. Tekrar denemek için aşağı çek.",
          en: "Dashboard data could not be loaded. Pull down to retry.",
        }),
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });

      void refresh();
    }, [refresh]),
  );

  const totals = mealTotals(meals);
  const goal = profile ? calorieGoal(profile) : DEFAULT_DAILY_CALORIE_GOAL;
  const remaining = Math.max(goal - totals.kcal, 0);
  const macros = profile ? macroGoals(profile) : macroGoalsFromCalories(goal);
  const proteinPct =
    macros.proteinG > 0
      ? Math.min((totals.protein / macros.proteinG) * 100, 100)
      : 0;
  const carbsPct =
    macros.carbsG > 0 ? Math.min((totals.carbs / macros.carbsG) * 100, 100) : 0;
  const fatPct =
    macros.fatG > 0 ? Math.min((totals.fat / macros.fatG) * 100, 100) : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        showAvatar
        showAction
        actionIcon="settings-outline"
        onActionPress={() => router.push("/settings-privacy")}
      />
      <ScrollView
        ref={scrollRef}
        style={[styles.scroll, { backgroundColor: colors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.screenHeaderOffset,
            paddingBottom: spacing.tabContentBottom,
          },
        ]}
        alwaysBounceVertical
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refresh} />
        }
      >
        {isRefreshing && !profile && meals.length === 0 ? (
          <View style={styles.initialLoading}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.initialLoadingText, { color: colors.onSurfaceVariant }]}>
              {t({ tr: "Veriler hazırlanıyor…", en: "Preparing your data…" })}
            </Text>
          </View>
        ) : null}

        {loadError ? (
          <GlassCard variant="panel" style={styles.errorCard}>
            <Ionicons name="warning-outline" size={18} color={colors.tertiary} />
            <Text style={[styles.errorText, { color: colors.onSurfaceVariant }]}>
              {loadError}
            </Text>
          </GlassCard>
        ) : null}

        <GreetingSection name={profile?.name} />
        <DailyPriorityCard
          hasMealsToday={meals.length > 0}
          weeklyWorkoutCount={weeklyTraining.count}
          onPrimaryAction={(action) => {
            if (action === "meal") router.push("/nutrition");
            if (action === "train") router.push("/(tabs)/fitness");
            if (action === "coach") router.push("/personal-coach");
          }}
        />
        <CoachHomeCard
          analysis={analysis}
          onPress={() => router.push("/personal-coach")}
        />
        <CaloriesCard
          consumed={totals.kcal}
          goal={goal}
          remaining={remaining}
          proteinPct={proteinPct}
          carbsPct={carbsPct}
          fatPct={fatPct}
        />
        <WeeklyAnalysisSection
          snapshot={bodyProgress}
          onOpenDetails={() => router.push("/body-progress")}
          onStartAnalysis={() => router.push({ pathname: "/ai", params: { mode: "physique" } })}
        />
        <WeeklyStatsGrid
          streak={getStreakCount(profile?.streak)}
          workoutCount={weeklyTraining.count}
          weeklyCalories={weeklyTraining.kcal}
          onOpenProgress={() => router.push("/body-progress")}
        />
        <RecentDevelopmentsCard
          proteinPct={proteinPct}
          workoutCount={weeklyTraining.count}
        />
      </ScrollView>
    </View>
  );
}

function CoachHomeCard({
  analysis,
  onPress,
}: {
  analysis: TrainingAnalysis | null;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const note = analysis?.headlineDetail
    ?? t({
      tr: "Protein alımın son 3 gündür hedefin altında kalıyor.",
      en: "Your protein intake has been under target for the last 3 days.",
    });
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.84}>
      <GlassCard
        variant="panel"
        style={[styles.coachCard, { borderColor: colors.primary }]}
      >
        <View
          style={[
            styles.headingIcon,
            { backgroundColor: `${colors.primary}14` },
          ]}
        >
          <Ionicons name="sparkles" size={18} color={colors.primary} />
        </View>
        <View style={styles.coachCopy}>
          <Text style={[styles.coachNoteBadgeText, { color: colors.primary }]}>
            {t({ tr: "AI KOÇ NOTU", en: "AI COACH NOTE" })}
          </Text>
          <Text
            numberOfLines={2}
            style={[styles.summaryBody, { color: colors.onSurfaceVariant }]}
          >
            {note}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.onSurfaceVariant} />
      </GlassCard>
    </TouchableOpacity>
  );
}

function greetingForHour(
  hour: number,
  t: (messages: { tr: string; en: string }) => string,
): string {
  if (hour < 5) return t({ tr: "İyi geceler", en: "Good night" });
  if (hour < 12) return t({ tr: "Günaydın", en: "Good morning" });
  if (hour < 18) return t({ tr: "İyi günler", en: "Good afternoon" });
  if (hour < 22) return t({ tr: "İyi akşamlar", en: "Good evening" });
  return t({ tr: "İyi geceler", en: "Good night" });
}

function GreetingSection({ name }: { name?: string }) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const greeting = greetingForHour(new Date().getHours(), t);
  const displayName = formatPersonName(name) || t({ tr: "Sporcu", en: "Athlete" });

  return (
    <View style={styles.greetingSection}>
      <View
        style={[
          styles.greetingEyebrow,
          { backgroundColor: `${colors.primary}14` },
        ]}
      >
        <Ionicons name="pulse-outline" size={12} color={colors.primary} />
        <Text style={[typography.labelCaps, { color: colors.primary }]}>
          {t({ tr: "PERFORMANS PANOSU", en: "PERFORMANCE BOARD" })}
        </Text>
      </View>
      <Text
        style={[
          typography.displayLgMobile,
          styles.greeting,
          { color: colors.onSurface },
        ]}
      >
        {greeting}, <Text style={{ color: colors.primary }}>{displayName}</Text>
      </Text>
      <Text style={[styles.greetingBody, { color: colors.onSurfaceVariant }]}>
        {t({
          tr: "Bugünkü ritmini ve haftalık ilerleyişini buradan takip et.",
          en: "Track your daily rhythm and weekly progress from here.",
        })}
      </Text>
    </View>
  );
}

type DailyPriorityAction = "meal" | "train" | "coach";

function DailyPriorityCard({
  hasMealsToday,
  weeklyWorkoutCount,
  onPrimaryAction,
}: {
  hasMealsToday: boolean;
  weeklyWorkoutCount: number;
  onPrimaryAction: (action: DailyPriorityAction) => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const action: DailyPriorityAction = !hasMealsToday
    ? "meal"
    : weeklyWorkoutCount < 3
      ? "train"
      : "coach";
  const model = {
    meal: {
      icon: "restaurant-outline" as const,
      title: t({ tr: "Bugünkü önceliğin", en: "Today's priority" }),
      body: t({
        tr: "İlk öğününü ekle; koç kalori ve makro ritmini buna göre güncellesin.",
        en: "Add your first meal so the coach can update your calorie and macro rhythm.",
      }),
      cta: t({ tr: "Öğün ekle", en: "Add meal" }),
      accent: colors.primary,
    },
    train: {
      icon: "barbell-outline" as const,
      title: t({ tr: "Bugünkü önceliğin", en: "Today's priority" }),
      body: t({
        tr: "Haftalık ritmin için sıradaki antrenmanı başlatmaya hazırsın.",
        en: "You are ready to start the next workout for your weekly rhythm.",
      }),
      cta: t({ tr: "Antrenmana git", en: "Go to training" }),
      accent: colors.secondary,
    },
    coach: {
      icon: "sparkles-outline" as const,
      title: t({ tr: "Bugünkü önceliğin", en: "Today's priority" }),
      body: t({
        tr: "Ritmin iyi görünüyor. Koç notunu açıp bugünkü ince ayarı gör.",
        en: "Your rhythm looks good. Open the coach note for today's fine-tuning.",
      }),
      cta: t({ tr: "Koç önerisini aç", en: "Open coach note" }),
      accent: colors.tertiary,
    },
  }[action];
  const displayModel = {
    ...model,
    title: t({ tr: "Bugünkü önceliğin", en: "Today's priority" }),
    body:
      action === "meal"
        ? t({
            tr: "İlk öğününü ekle; koç kalori ve makro ritmini buna göre güncellesin.",
            en: "Add your first meal so the coach can update your calorie and macro rhythm.",
          })
        : action === "train"
          ? t({
              tr: "Haftalık ritmin için sıradaki antrenmanı başlatmaya hazırsın.",
              en: "You are ready to start the next workout for your weekly rhythm.",
            })
          : t({
              tr: "Ritmin iyi görünüyor. Koç notunu açıp bugünkü ince ayarı gör.",
              en: "Your rhythm looks good. Open the coach note for today's fine-tuning.",
            }),
    cta:
      action === "meal"
        ? t({ tr: "Öğün ekle", en: "Add meal" })
        : action === "train"
          ? t({ tr: "Antrenmana git", en: "Go to training" })
          : t({ tr: "Koç önerisini aç", en: "Open coach note" }),
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.86}
      onPress={() => onPrimaryAction(action)}
    >
      <GlassCard
        variant="panel"
        style={[
          styles.priorityCard,
          { borderColor: `${displayModel.accent}38`, backgroundColor: colors.surface },
        ]}
      >
        <View
          pointerEvents="none"
          style={[
            styles.priorityGlow,
            { backgroundColor: `${displayModel.accent}20` },
          ]}
        />
        <View style={styles.priorityHeader}>
          <View
            style={[
              styles.priorityIcon,
              { backgroundColor: `${displayModel.accent}16` },
            ]}
          >
            <Ionicons name={displayModel.icon} size={22} color={displayModel.accent} />
          </View>
          <View style={styles.priorityCopy}>
            <Text style={[styles.priorityTitle, { color: colors.onSurface }]}>
              {displayModel.title}
            </Text>
            <Text
              numberOfLines={2}
              style={[
                styles.priorityBody,
                { color: colors.onSurfaceVariant },
              ]}
            >
              {displayModel.body}
            </Text>
          </View>
        </View>
        <View style={[styles.priorityButton, { backgroundColor: displayModel.accent }]}>
          <Text style={[styles.priorityButtonText, { color: colors.white }]}>
            {displayModel.cta}
          </Text>
          <Ionicons name="arrow-forward" size={17} color={colors.white} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

function CaloriesCard({
  consumed,
  goal,
  remaining,
  proteinPct,
  carbsPct,
  fatPct,
}: {
  consumed: number;
  goal: number;
  remaining: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <GlassCard
      style={[
        styles.caloriesCard,
        { backgroundColor: colors.surface, borderColor: colors.outlineVariant },
      ]}
    >
      <View style={styles.calorieCardHeader}>
        <Text style={[styles.calorieCardTitle, { color: colors.onSurface }]}>
          {t({ tr: "Günlük enerji", en: "Daily energy" })}
        </Text>
        <View
          style={[
            styles.calorieStatusChip,
            { backgroundColor: colors.successContainer },
          ]}
        >
          <Ionicons name="pulse-outline" size={14} color={colors.success} />
          <Text style={[styles.calorieStatusText, { color: colors.success }]}>
            {t({ tr: "Canlı", en: "Live" })}
          </Text>
        </View>
      </View>
      <View style={styles.energyNumberBlock}>
        <Text style={[styles.energyNumber, { color: colors.onSurface }]}>
          {formatNumber(Math.round(remaining))}
        </Text>
        <Text style={[styles.energyLabel, { color: colors.onSurfaceVariant }]}>
          {t({ tr: "KALORİ KALDI", en: "CALORIES LEFT" })}
        </Text>
      </View>
      <View style={styles.macros}>
        <Macro
          label={t({ tr: "PROTEİN", en: "PROTEIN" })}
          value={`${Math.round(proteinPct)}%`}
          progress={proteinPct}
          color={colors.success}
          glow={`${colors.success}47`}
        />
        <Macro
          label={t({ tr: "KARBONHİDRAT", en: "CARBS" })}
          value={`${Math.round(carbsPct)}%`}
          progress={carbsPct}
          color={colors.secondary}
          glow={`${colors.secondary}47`}
        />
        <Macro
          label={t({ tr: "YAĞ", en: "FAT" })}
          value={`${Math.round(fatPct)}%`}
          progress={fatPct}
          color={colors.tertiary}
          glow={`${colors.tertiary}47`}
        />
      </View>
      <View
        style={[
          styles.calorieFooter,
          { borderTopColor: colors.outlineVariant },
        ]}
      >
        <View
          style={[
            styles.calorieSummaryPill,
            { backgroundColor: colors.surfaceContainer },
          ]}
        >
          <View style={styles.calorieSummaryColumn}>
            <Text
              style={[
                styles.calorieSummaryLabel,
                { color: colors.onSurfaceVariant },
              ]}
            >
              {t({ tr: "Alınan", en: "Consumed" })}
            </Text>
            <Text
              style={[styles.calorieSummaryValue, { color: colors.onSurface }]}
            >
              {formatNumber(Math.round(consumed))} kcal
            </Text>
          </View>
          <View
            style={[
              styles.calorieSummaryDivider,
              { backgroundColor: colors.outlineVariant },
            ]}
          />
          <View style={styles.calorieSummaryColumn}>
            <Text
              style={[
                styles.calorieSummaryLabel,
                { color: colors.onSurfaceVariant },
              ]}
            >
              {t({ tr: "Hedef", en: "Goal" })}
            </Text>
            <Text
              style={[styles.calorieSummaryValue, { color: colors.onSurface }]}
            >
              {formatNumber(goal)} kcal
            </Text>
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

function Macro({
  label,
  value,
  progress,
  color,
  glow,
}: {
  label: string;
  value: string;
  progress: number;
  color: string;
  glow: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.macro}>
      <View style={styles.macroHeader}>
        <Text style={[typography.labelCaps, { color }]}>{label}</Text>
        <Text style={[typography.bodySm, { color: colors.onSurface }]}>
          {value}
        </Text>
      </View>
      <MacroBar progress={progress} color={color} glowColor={glow} />
    </View>
  );
}

function WeeklyAnalysisSection({
  snapshot,
  onOpenDetails,
  onStartAnalysis,
}: {
  snapshot: BodyProgressSnapshot | null;
  onOpenDetails: () => void;
  onStartAnalysis: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const latestScore = snapshot?.latestPhysiqueScore ?? null;

  return (
    <View style={styles.weeklyAnalysisSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
          {t({ tr: "Haftalık Analiz", en: "Weekly Analysis" })}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.8}
          onPress={onOpenDetails}
          style={styles.sectionAction}
        >
          <Text style={[styles.sectionActionText, { color: colors.primary }]}>
            {t({ tr: "Detay", en: "Details" })}
          </Text>
          <Ionicons name="chevron-forward" size={15} color={colors.primary} />
        </TouchableOpacity>
      </View>
      <GlassCard variant="panel" style={styles.analysisRowCard}>
        <View style={[styles.analysisIcon, { backgroundColor: `${colors.primary}12` }]}>
          <Ionicons name="body-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.analysisCopy}>
          <Text style={[styles.analysisTitle, { color: colors.onSurface }]}>
            {t({ tr: "Vücut Analizi", en: "Physique Analysis" })}
          </Text>
          <Text style={[styles.analysisBody, { color: colors.onSurfaceVariant }]}>
            {latestScore
              ? t({
                  tr: `Son skor ${Math.round(latestScore.score)} / 100`,
                  en: `Latest score ${Math.round(latestScore.score)} / 100`,
                })
              : t({ tr: "Henüz veri yok", en: "No data yet" })}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={latestScore ? onOpenDetails : onStartAnalysis}
          style={[styles.analysisAction, { backgroundColor: `${colors.primary}12` }]}
        >
          <Text style={[styles.analysisActionText, { color: colors.primary }]}>
            {latestScore ? t({ tr: "TAKİP ET", en: "TRACK" }) : t({ tr: "ANALİZ BAŞLAT", en: "START ANALYSIS" })}
          </Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
}

function WeeklyStatsGrid({
  streak,
  workoutCount,
  weeklyCalories,
  onOpenProgress,
}: {
  streak: number;
  workoutCount: number;
  weeklyCalories: number;
  onOpenProgress: () => void;
}) {
  const { t } = useAppLocalization();

  return (
    <View style={styles.weeklyStatsGrid}>
      <MetricTile
        icon="flame-outline"
        value={`${streak}`}
        label={t({ tr: "ANTRENMAN\nSERİSİ", en: "WORKOUT\nSTREAK" })}
        onPress={onOpenProgress}
      />
      <MetricTile
        icon="bar-chart"
        value={weeklyCalories > 0 ? formatNumber(Math.round(weeklyCalories / 7)) : `${workoutCount}`}
        label={weeklyCalories > 0 ? t({ tr: "HAF. KALORİ\nORT.", en: "WEEKLY CAL\nAVG." }) : t({ tr: "HAF. ANTRENMAN\nSAYISI", en: "WEEKLY WORKOUT\nCOUNT" })}
        onPress={onOpenProgress}
      />
    </View>
  );
}

function MetricTile({
  icon,
  value,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.84} onPress={onPress} style={[styles.metricTile, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <View style={styles.metricTileCopy}>
        <Text style={[styles.metricTileValue, { color: colors.onSurface }]}>{value}</Text>
        <Text style={[styles.metricTileLabel, { color: colors.onSurfaceVariant }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

function RecentDevelopmentsCard({
  proteinPct,
  workoutCount,
}: {
  proteinPct: number;
  workoutCount: number;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const proteinMessage = proteinPct >= 75
    ? t({ tr: "Protein alımı hedefine daha yakın.", en: "Protein intake is closer to target." })
    : t({ tr: "Protein alımı hedefinin altında kalıyor.", en: "Protein intake is staying below target." });
  const workoutMessage = workoutCount >= 2
    ? t({ tr: "Antrenman istikrarı bu hafta arttı.", en: "Training consistency improved this week." })
    : t({ tr: "Bu hafta antrenman ritmi henüz kuruluyor.", en: "Training rhythm is still building this week." });

  return (
    <View style={styles.recentSection}>
      <Text style={[styles.recentHeading, { color: colors.onSurfaceVariant }]}>
        {t({ tr: "SON GELİŞMELER", en: "LATEST UPDATES" })}
      </Text>
      <GlassCard variant="panel" style={styles.recentCard}>
        <RecentDevelopmentItem text={proteinMessage} meta={t({ tr: "DÜN", en: "YESTERDAY" })} />
        <View style={[styles.recentDivider, { backgroundColor: colors.outlineVariant }]} />
        <RecentDevelopmentItem text={workoutMessage} meta={t({ tr: "2 GÜN ÖNCE", en: "2 DAYS AGO" })} />
      </GlassCard>
    </View>
  );
}

function RecentDevelopmentItem({ text, meta }: { text: string; meta: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.recentItem}>
      <View style={[styles.recentDot, { backgroundColor: colors.primary }]} />
      <Text style={[styles.recentText, { color: colors.onSurface }]}>{text}</Text>
      <Text style={[styles.recentMeta, { color: colors.onSurfaceVariant }]}>{meta}</Text>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: 18,
  },
  initialLoading: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  initialLoadingText: { ...typography.bodySm },
  errorCard: {
    padding: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  errorText: { ...typography.bodySm, flex: 1 },
  greetingSection: { gap: spacing.xs - 1 },
  greetingEyebrow: {
    alignSelf: "flex-start",
    minHeight: 26,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 2,
  },
  greeting: { ...typography.headlineLgMobile, marginTop: 2 },
  greetingBody: { ...typography.bodySm },
  priorityCard: {
    padding: spacing.cardPadding,
    gap: spacing.md,
    overflow: "hidden",
  },
  priorityGlow: {
    position: "absolute",
    width: 170,
    height: 170,
    borderRadius: radius.full,
    right: -54,
    top: -72,
    opacity: 0.9,
  },
  priorityHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  priorityIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  priorityCopy: { flex: 1, minWidth: 0, gap: 3 },
  priorityTitle: { ...typography.cardTitle },
  priorityBody: { ...typography.bodySm, lineHeight: 19 },
  priorityButton: {
    minHeight: 50,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  priorityButtonText: { ...typography.buttonLg },
  caloriesCard: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: 72,
    left: "50%",
    marginLeft: -76,
    width: 152,
    height: 152,
    borderRadius: radius.full,
    opacity: 0.22,
  },
  calorieCardHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  calorieCardTitle: { ...typography.cardTitle },
  calorieCardSubtitle: { ...typography.bodyXs, marginTop: 2 },
  calorieStatusChip: {
    minHeight: 28,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 3,
  },
  calorieStatusText: { ...typography.labelXs },
  energyNumberBlock: {
    minHeight: 166,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  energyNumber: { ...typography.statsNumber, fontSize: 31, lineHeight: 36 },
  energyLabel: { ...typography.labelCaps, fontSize: 10, letterSpacing: 1.2 },
  ringWrapper: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  ringFrame: { width: "100%", alignItems: "center", justifyContent: "center" },
  macros: { width: "100%", marginTop: spacing.xs - 2, gap: spacing.xs },
  macro: { gap: spacing.xs - 3 },
  macroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  calorieFooter: {
    width: "100%",
    marginTop: spacing.smPlus,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    alignItems: "center",
  },
  calorieSummaryPill: {
    width: "100%",
    minHeight: 56,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  calorieSummaryColumn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  calorieSummaryDivider: { width: 1, height: 28, borderRadius: radius.full },
  calorieSummaryLabel: { ...typography.labelCaps, textAlign: "center" },
  calorieSummaryValue: { ...typography.numericMd, textAlign: "center" },
  calorieEmptyAction: {
    minHeight: 50,
    width: "100%",
    marginTop: spacing.xs + 2,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.mdPlus,
  },
  calorieEmptyActionText: { ...typography.buttonLg, textAlign: "center" },
  summaryCard: { padding: spacing.cardPadding, gap: spacing.smPlus },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  summaryHeadingRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  headingIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryTitle: { ...typography.cardTitle },
  weeklyTitle: { ...typography.cardTitle, flexShrink: 1 },
  summaryBody: { ...typography.bodySm },
  summaryAction: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  summaryActionText: { ...typography.buttonSm },
  summaryGrid: { flexDirection: "row", gap: spacing.xs + 2 },
  periodCard: {
    flex: 1,
    minHeight: 88,
    padding: spacing.sm,
    borderRadius: radius.lg,
    justifyContent: "space-between",
  },
  periodLabel: { ...typography.bodyXs },
  periodValue: { ...typography.sectionTitle },
  periodMeta: { ...typography.bodyXs },
  pulseCard: { padding: spacing.cardPadding, gap: spacing.md },
  pulseGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs + 2 },
  pulseStat: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 80,
    padding: spacing.sm,
    borderRadius: radius.lg,
    justifyContent: "space-between",
  },
  pulseStatLabel: { ...typography.bodyXs },
  pulseStatValue: { ...typography.cardTitle },
  pulseButton: {
    minHeight: 46,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  pulseButtonText: { ...typography.buttonLg },
  coachCard: {
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1.5,
  },
  coachCopy: { flex: 1, gap: 4 },
  coachNoteBadge: {
    alignSelf: "flex-start",
    minHeight: 22,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    justifyContent: "center",
  },
  coachNoteBadgeText: { ...typography.labelXs, fontSize: 9 },
  coachArrow: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { ...typography.sectionTitle, fontSize: 20, lineHeight: 26 },
  weeklyAnalysisSection: { gap: 10 },
  analysisRowCard: {
    minHeight: 58,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  analysisIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  analysisCopy: { flex: 1, gap: 2 },
  analysisTitle: { ...typography.cardTitle, fontSize: 18, lineHeight: 23 },
  analysisBody: { ...typography.bodyXs },
  analysisAction: {
    minHeight: 42,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  analysisActionText: { ...typography.labelXs, fontSize: 10, letterSpacing: 0.4 },
  weeklyStatsGrid: { flexDirection: "row", gap: 12 },
  metricTile: {
    flex: 1,
    minHeight: 124,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  metricTileCopy: { gap: 2 },
  metricTileValue: { ...typography.statsNumber, fontSize: 31, lineHeight: 35 },
  metricTileLabel: { ...typography.labelCaps, fontSize: 9, lineHeight: 12 },
  recentSection: { gap: 9 },
  recentHeading: { ...typography.labelCaps, letterSpacing: 1.8 },
  recentCard: { paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  recentItem: { minHeight: 34, flexDirection: "row", alignItems: "center", gap: 10 },
  recentDot: { width: 7, height: 7, borderRadius: radius.full },
  recentText: { ...typography.bodySm, flex: 1 },
  recentMeta: { ...typography.labelXs, fontSize: 9 },
  recentDivider: { height: 1, marginLeft: 17 },
  sectionAction: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionActionText: { ...typography.buttonSm },
}));
