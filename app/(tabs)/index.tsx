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
import { useScrollToTop } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { GlassCard } from "@/components/GlassCard";
import { ProgressRing } from "@/components/ProgressRing";
import { MacroBar } from "@/components/MacroBar";
import { AnalysisSummaryCard } from "@/components/AnalysisSummaryCard";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
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
import {
  loadNutritionSummary,
  type NutritionSummary,
} from "@/services/mealInsights";
import { loadMealsForDate } from "@/services/mealStore";
import { loadProfile } from "@/services/profileStore";
import {
  loadTrainingAnalysis,
  type TrainingAnalysis,
} from "@/services/trainingAnalysis";
import { weeklyWorkoutSummary } from "@/services/workoutStore";
import { canAccessTrainingInsights } from "@/services/subscription";
import { formatPersonName } from "@/services/textUtils";
import type { CoachPreferences, Meal, UserProfile } from "@/types";
import { selectAutomaticHomeCards } from "@/services/coachPreferences";

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
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [analysis, setAnalysis] = useState<TrainingAnalysis | null>(null);
  const [weeklyTraining, setWeeklyTraining] = useState<WeeklyWorkout>({
    count: 0,
    minutes: 0,
    kcal: 0,
  });
  const [homeCards, setHomeCards] = useState<CoachPreferences["homeCards"]>([
    "energy",
    "coach",
    "weekly",
    "analysis",
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setLoadError(null);

    try {
      const results = await Promise.allSettled([
        loadProfile(),
        loadMealsForDate(dateKey()),
        loadNutritionSummary(),
        weeklyWorkoutSummary(),
        loadTrainingAnalysis(),
      ] as const);

      const loadedProfile =
        results[0].status === "fulfilled" ? results[0].value : null;
      const dailyMeals =
        results[1].status === "fulfilled" ? results[1].value : [];
      const nutritionSummary =
        results[2].status === "fulfilled" ? results[2].value : null;
      const workouts =
        results[3].status === "fulfilled"
          ? results[3].value
          : { count: 0, minutes: 0, kcal: 0 };
      const trainingAnalysis =
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
      setSummary(nutritionSummary);
      setWeeklyTraining(workouts);
      setAnalysis(trainingAnalysis);
      setHomeCards(
        selectAutomaticHomeCards({
          hasMealsToday: dailyMeals.length > 0,
          weeklyMealCount: nutritionSummary?.weekly.mealCount ?? 0,
          weeklyWorkoutCount: workouts.count,
          streakCount: getStreakCount(loadedProfile?.streak),
          hasAnalysis: Boolean(trainingAnalysis),
          canAccessAnalysis: canAccessTrainingInsights(loadedProfile),
        }),
      );
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
  const progress = goal > 0 ? Math.min((totals.kcal / goal) * 100, 100) : 0;
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
      <TopBar />
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
        {homeCards.map((card) => {
          if (card === "energy") {
            return (
              <CaloriesCard
                key="energy"
                consumed={totals.kcal}
                goal={goal}
                remaining={remaining}
                progress={progress}
                proteinPct={proteinPct}
                carbsPct={carbsPct}
                fatPct={fatPct}
                onAddMeal={() => router.push("/nutrition")}
              />
            );
          }
          if (card === "coach") {
            return (
              <CoachHomeCard
                key="coach"
                onPress={() => router.push("/personal-coach")}
              />
            );
          }
          if (card === "weekly") {
            return (
              <WeeklyPulseCard
                key="weekly"
                streak={getStreakCount(profile?.streak)}
                workoutCount={weeklyTraining.count}
                workoutMinutes={weeklyTraining.minutes}
                weeklyMeals={summary?.weekly.mealCount ?? 0}
                onOpenWorkout={() => router.push("/workout-progress")}
                onOpenGoals={() => router.push("/goals")}
              />
            );
          }
          if (
            card === "analysis" &&
            analysis &&
            canAccessTrainingInsights(profile)
          ) {
            return (
              <AnalysisSummaryCard
                key="analysis"
                analysis={analysis}
                onOpenDetails={() => router.push("/workout-progress")}
              />
            );
          }
          if (card === "analysis") {
            return (
              <PremiumFeatureCard
                key="analysis"
                title={t({
                  tr: "Haftalık antrenman değerlendirmesi",
                  en: "Weekly training analysis",
                })}
                body={t({
                  tr: "Kas dağılımını, eksik kalan bölgeleri ve itiş/çekiş dengesini premium ile aç.",
                  en: "Unlock muscle distribution, lagging body parts, and push/pull balance with premium.",
                })}
                note={t({
                  tr: "Premium ile haftalık kas dengesi, eksik bölge analizi ve daha net yönlendirmeler açılır.",
                  en: "Premium unlocks weekly muscle balance, lagging area insights, and clearer guidance.",
                })}
                ctaLabel={t({ tr: "Premium'u incele", en: "Explore premium" })}
                onPress={() => router.push("/premium")}
              />
            );
          }
          return null;
        })}
        <SummaryPeriodsCard
          summary={summary}
          onOpenDetails={() => router.push("/calorie-insights")}
        />
      </ScrollView>
    </View>
  );
}

function CoachHomeCard({ onPress }: { onPress: () => void }) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.84}>
      <GlassCard variant="panel" style={styles.coachCard}>
        <View
          style={[
            styles.headingIcon,
            { backgroundColor: `${colors.tertiary}18` },
          ]}
        >
          <Ionicons name="sparkles-outline" size={18} color={colors.tertiary} />
        </View>
        <View style={styles.coachCopy}>
          <View
            style={[
              styles.coachNoteBadge,
              { backgroundColor: `${colors.tertiary}14` },
            ]}
          >
            <Text style={[styles.coachNoteBadgeText, { color: colors.tertiary }]}>
              AI KOÇ NOTU
            </Text>
          </View>
          <Text style={[styles.weeklyTitle, { color: colors.onSurface }]}>
            {t({ tr: "Bugünün koç önerisi", en: "Today's coach note" })}
          </Text>
          <Text
            style={[styles.summaryBody, { color: colors.onSurfaceVariant }]}
          >
            {t({
              tr: "Haftalık ritmine göre bugünkü en doğru sonraki adımı gör.",
              en: "See the best next step for today's rhythm.",
            })}
          </Text>
        </View>
        <View style={[styles.coachArrow, { backgroundColor: colors.tertiary }]}>
          <Ionicons name="arrow-forward" size={18} color={colors.onTertiary} />
        </View>
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
  progress,
  proteinPct,
  carbsPct,
  fatPct,
  onAddMeal,
}: {
  consumed: number;
  goal: number;
  remaining: number;
  progress: number;
  proteinPct: number;
  carbsPct: number;
  fatPct: number;
  onAddMeal: () => void;
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
      <View style={[styles.glow, { backgroundColor: `${colors.primary}22` }]} />
      <View style={styles.calorieCardHeader}>
        <View>
          <Text style={[styles.calorieCardTitle, { color: colors.onSurface }]}>
            {t({ tr: "Günlük enerji", en: "Daily energy" })}
          </Text>
          <Text
            style={[
              styles.calorieCardSubtitle,
              { color: colors.onSurfaceVariant },
            ]}
          >
            {t({
              tr: "Bugünkü hedefin ve makro dengesi",
              en: "Your goal and macro balance for today",
            })}
          </Text>
        </View>
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
      <View style={styles.ringWrapper}>
        <View style={styles.ringFrame}>
          <ProgressRing
            size={176}
            progress={progress}
            centerValue={formatNumber(Math.round(remaining))}
            centerLabel={t({ tr: "KALORİ KALDI", en: "CALORIES LEFT" })}
          />
        </View>
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
      {consumed === 0 ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t({
            tr: "İlk öğününü ekle",
            en: "Add your first meal",
          })}
          onPress={onAddMeal}
          activeOpacity={0.84}
          style={[
            styles.calorieEmptyAction,
            { backgroundColor: colors.primary },
          ]}
        >
          <Ionicons
            name="add-circle-outline"
            size={18}
            color={colors.onPrimary}
          />
          <Text
            style={[styles.calorieEmptyActionText, { color: colors.onPrimary }]}
          >
            {t({ tr: "İlk öğününü ekle", en: "Add your first meal" })}
          </Text>
        </TouchableOpacity>
      ) : null}
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

function SummaryPeriodsCard({
  summary,
  onOpenDetails,
}: {
  summary: NutritionSummary | null;
  onOpenDetails: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  if (!summary) return null;

  return (
    <GlassCard variant="panel" style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryHeadingRow}>
          <View
            style={[
              styles.headingIcon,
              { backgroundColor: `${colors.primary}14` },
            ]}
          >
            <Ionicons
              name="stats-chart-outline"
              size={17}
              color={colors.primary}
            />
          </View>
          <View>
            <Text style={[styles.summaryTitle, { color: colors.onSurface }]}>
              {t({ tr: "Kalori ", en: "Calorie " })}
              <Text style={{ color: colors.primary }}>
                {t({ tr: "ritmi", en: "rhythm" })}
              </Text>
            </Text>
            <Text
              style={[styles.summaryBody, { color: colors.onSurfaceVariant }]}
            >
              {t({
                tr: "Günlük, haftalık ve aylık görünüm",
                en: "Daily, weekly, and monthly view",
              })}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t({
            tr: "Kalori ritmi detayını aç",
            en: "Open calorie rhythm details",
          })}
          onPress={onOpenDetails}
          activeOpacity={0.8}
          style={styles.summaryAction}
        >
          <Text style={[styles.summaryActionText, { color: colors.secondary }]}>
            {t({ tr: "Detay", en: "Details" })}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.secondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.summaryGrid}>
        <PeriodMiniCard
          label={summary.daily.label}
          value={`${Math.round(summary.daily.kcal)}`}
          mealCount={summary.daily.mealCount}
          accent={colors.secondary}
        />
        <PeriodMiniCard
          label={summary.weekly.label}
          value={`${Math.round(summary.weekly.kcal)}`}
          mealCount={summary.weekly.mealCount}
          accent={colors.primary}
        />
        <PeriodMiniCard
          label={summary.monthly.label}
          value={`${Math.round(summary.monthly.kcal)}`}
          mealCount={summary.monthly.mealCount}
          accent={colors.tertiary}
        />
      </View>
    </GlassCard>
  );
}

function PeriodMiniCard({
  label,
  value,
  mealCount,
  accent,
}: {
  label: string;
  value: string;
  mealCount: number;
  accent: string;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <View
      style={[styles.periodCard, { backgroundColor: colors.surfaceContainer }]}
    >
      <Text style={[styles.periodLabel, { color: accent }]}>{label}</Text>
      <Text style={[styles.periodValue, { color: colors.onSurface }]}>
        {formatNumber(Number(value))}
      </Text>
      <Text style={[styles.periodMeta, { color: colors.onSurfaceVariant }]}>
        {mealCount} {t({ tr: "öğün", en: "meals" })}
      </Text>
    </View>
  );
}

function WeeklyPulseCard({
  streak,
  workoutCount,
  workoutMinutes,
  weeklyMeals,
  onOpenWorkout,
  onOpenGoals,
}: {
  streak: number;
  workoutCount: number;
  workoutMinutes: number;
  weeklyMeals: number;
  onOpenWorkout: () => void;
  onOpenGoals: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <GlassCard variant="panel" style={styles.pulseCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.summaryHeadingRow}>
          <View
            style={[
              styles.headingIcon,
              { backgroundColor: `${colors.primary}14` },
            ]}
          >
            <Ionicons
              name="trending-up-outline"
              size={18}
              color={colors.primary}
            />
          </View>
          <Text style={[styles.weeklyTitle, { color: colors.onSurface }]}>
            {t({ tr: "Bu haftaki ", en: "This week's " })}
            <Text style={{ color: colors.primary }}>
              {t({ tr: "ilerleyiş", en: "progress" })}
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t({ tr: "Hedefleri aç", en: "Open goals" })}
          activeOpacity={0.8}
          onPress={onOpenGoals}
          style={styles.sectionAction}
        >
          <Text style={[styles.sectionActionText, { color: colors.secondary }]}>
            {t({ tr: "Hedefler", en: "Goals" })}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.secondary} />
        </TouchableOpacity>
      </View>
      <View style={styles.pulseGrid}>
        <PulseStat
          label={t({ tr: "Seri", en: "Streak" })}
          value={`${streak} ${t({ tr: "gün", en: "days" })}`}
          accent={colors.tertiary}
        />
        <PulseStat
          label={t({ tr: "Antrenman", en: "Workouts" })}
          value={`${workoutCount} ${t({ tr: "seans", en: "sessions" })}`}
          accent={colors.secondary}
        />
        <PulseStat
          label={t({ tr: "Toplam süre", en: "Total time" })}
          value={`${workoutMinutes} ${t({ tr: "dk", en: "min" })}`}
          accent={colors.primary}
        />
        <PulseStat
          label={t({ tr: "Beslenme", en: "Nutrition" })}
          value={`${weeklyMeals} ${t({ tr: "öğün", en: "meals" })}`}
          accent={colors.primary}
        />
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={t({
          tr: "Antrenman ilerleme ekranını aç",
          en: "Open workout progress screen",
        })}
        style={[styles.pulseButton, { backgroundColor: colors.secondary }]}
        onPress={onOpenWorkout}
        activeOpacity={0.85}
      >
        <Ionicons
          name="analytics-outline"
          size={18}
          color={colors.onSecondary}
        />
        <Text style={[styles.pulseButtonText, { color: colors.onSecondary }]}>
          {t({ tr: "İlerleme ekranına git", en: "Go to progress" })}
        </Text>
      </TouchableOpacity>
    </GlassCard>
  );
}

function PulseStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[styles.pulseStat, { backgroundColor: colors.surfaceContainer }]}
    >
      <Text style={[styles.pulseStatLabel, { color: accent }]}>{label}</Text>
      <Text style={[styles.pulseStatValue, { color: colors.onSurface }]}>
        {value}
      </Text>
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
    gap: spacing.sectionGap,
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
    paddingHorizontal: spacing.mdPlus,
    paddingTop: spacing.mdPlus,
    paddingBottom: spacing.md,
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
    padding: spacing.cardPadding,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
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
  sectionAction: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sectionActionText: { ...typography.buttonSm },
}));