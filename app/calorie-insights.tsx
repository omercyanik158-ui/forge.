import {
  createDynamicStyles,
  useAppTheme,
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  DEFAULT_DAILY_CALORIE_GOAL,
  calorieGoal,
} from "@/services/calculations";
import {
  loadNutritionSummary,
  type DailyNutritionPoint,
  type NutritionSummary,
  type PeriodSummary,
} from "@/services/mealInsights";
import { loadProfile } from "@/services/profileStore";
import type { UserProfile } from "@/types";
import { useAppLocalization } from "@/providers/localization-context";
import { formatNumber } from "@/services/localization";

export default function CalorieInsightsScreen() {
  useAppTheme();
  const { t } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<NutritionSummary | null>(null);

  const refresh = useCallback(async () => {
    const [loadedProfile, loadedSummary] = await Promise.all([
      loadProfile(),
      loadNutritionSummary(),
    ]);
    setProfile(loadedProfile);
    setSummary(loadedSummary);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const goal = profile ? calorieGoal(profile) : DEFAULT_DAILY_CALORIE_GOAL;

  return (
    <View style={styles.container}>
      <ScreenHeader title={t("migrated.calorie_insights_001")} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.screenHeaderOffset,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.headerTitle}>
            {t("migrated.calorie_insights_002")}
          </Text>
          <Text style={styles.headerBody}>
            {t("migrated.calorie_insights_003")}
          </Text>
        </View>

        {summary ? (
          <>
            <NutritionTrendCard points={summary.last7Days} goal={goal} />
            <PeriodCard
              summary={summary.daily}
              goal={goal}
              accent={colors.secondary}
            />
            <PeriodCard
              summary={summary.weekly}
              goal={goal * summary.weeklyDaysElapsed}
              accent={colors.primary}
              dailyAverage={summary.weeklyDailyAverage}
              activeDays={summary.activeDays}
              dailyGoal={goal}
            />
            <PeriodCard
              summary={summary.monthly}
              goal={goal * summary.monthlyDaysElapsed}
              accent={colors.tertiary}
            />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function NutritionTrendCard({
  points,
  goal,
}: {
  points: DailyNutritionPoint[];
  goal: number;
}) {
  const { t } = useAppLocalization();
  const maxKcal = Math.max(goal, ...points.map((point) => point.kcal), 1);

  return (
    <GlassCard variant="panel" style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {t("migrated.calorie_insights_004")}
        </Text>
        <Text style={styles.cardMeals}>
          {t("migrated.calorie_insights_005")}
        </Text>
      </View>
      <View style={styles.chartRow}>
        {points.map((point) => {
          const pct = Math.max(8, Math.min((point.kcal / maxKcal) * 100, 100));
          const nearGoal =
            goal > 0 && point.kcal >= goal * 0.85 && point.kcal <= goal * 1.15;

          return (
            <View key={point.date} style={styles.chartItem}>
              <View style={styles.chartTrack}>
                <View
                  style={[
                    styles.chartFill,
                    {
                      height: `${pct}%`,
                      backgroundColor: nearGoal
                        ? colors.success
                        : colors.primary,
                    },
                  ]}
                />
              </View>
              <Text style={styles.chartLabel}>{point.label}</Text>
              <Text style={styles.chartValue}>{Math.round(point.kcal)}</Text>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

function PeriodCard({
  summary,
  goal,
  accent,
  dailyAverage,
  activeDays,
  dailyGoal,
}: {
  summary: PeriodSummary;
  goal: number;
  accent: string;
  dailyAverage?: number;
  activeDays?: number;
  dailyGoal?: number;
}) {
  const { t } = useAppLocalization();
  const progress = goal > 0 ? Math.min((summary.kcal / goal) * 100, 100) : 0;
  const showAverage = dailyAverage != null && activeDays != null;
  const paceNote = buildPaceNote(dailyAverage, dailyGoal, t);

  return (
    <GlassCard variant="panel" style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{summary.label}</Text>
        <Text style={[styles.cardMeals, { color: accent }]}>
          {summary.mealCount} {t("migrated.calorie_insights_006")}
        </Text>
      </View>
      <Text style={styles.cardKcal}>
        {formatNumber(Math.round(summary.kcal))} kcal
      </Text>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: accent },
          ]}
        />
      </View>
      {showAverage ? (
        <View style={styles.averageRow}>
          <Text style={styles.averageText}>
            {t("migrated.calorie_insights_007")} ~{formatNumber(dailyAverage!)}{" "}
            kcal · {activeDays}/7 {t("migrated.calorie_insights_008")}
          </Text>
          {paceNote ? <Text style={styles.paceText}>{paceNote}</Text> : null}
        </View>
      ) : null}
      <View style={styles.macroRow}>
        <MacroStat label="Protein" value={`${Math.round(summary.protein)} g`} />
        <MacroStat
          label={t("migrated.calorie_insights_009")}
          value={`${Math.round(summary.carbs)} g`}
        />
        <MacroStat
          label={t("migrated.calorie_insights_010")}
          value={`${Math.round(summary.fat)} g`}
        />
      </View>
    </GlassCard>
  );
}

function buildPaceNote(
  dailyAverage: number | undefined,
  dailyGoal: number | undefined,
  t: (message: string | { tr: string; en: string }) => string,
): string | null {
  if (
    dailyAverage == null ||
    dailyGoal == null ||
    dailyGoal <= 0 ||
    dailyAverage <= 0
  )
    return null;

  const ratio = dailyAverage / dailyGoal;
  if (ratio >= 0.85 && ratio <= 1.15) return t("migrated.calorie_insights_011");
  if (ratio < 0.85) return t("migrated.calorie_insights_012");
  return t("migrated.calorie_insights_013");
}

function MacroStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroBlock}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.gutter,
  },
  headerBlock: { gap: spacing.xs },
  headerTitle: { ...typography.sectionTitle, color: colors.onSurface },
  headerBody: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  card: { padding: spacing.cardPadding, gap: spacing.smPlus },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.onSurface,
  },
  cardMeals: { ...typography.labelMd, color: colors.onSurface },
  cardKcal: { ...typography.displayLgMobile, color: colors.onSurface },
  chartRow: {
    minHeight: 150,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  chartItem: { flex: 1, alignItems: "center", gap: 6 },
  chartTrack: {
    width: "100%",
    height: 96,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerHighest,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartFill: {
    width: "100%",
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  chartLabel: {
    ...typography.bodyXs,
    color: colors.onSurfaceVariant,
  },
  chartValue: { ...typography.labelXs, color: colors.outline },
  progressTrack: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: radius.full },
  averageRow: { gap: 4 },
  averageText: { ...typography.bodySm, color: colors.onSurface },
  paceText: { ...typography.labelMd, color: colors.secondary },
  macroRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  macroBlock: { flex: 1, gap: 4 },
  macroLabel: { ...typography.bodySm, color: colors.outline },
  macroValue: { ...typography.labelMd, color: colors.onSurface },
}));
