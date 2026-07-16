import {
  createDynamicStyles,
  useAppTheme,
  colors,
  layout,
  radius,
  spacing,
  typography,
} from "@/theme";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { AnalysisRegionList } from "@/components/AnalysisRegionList";
import { GlassCard } from "@/components/GlassCard";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppLocalization } from "@/providers/localization-context";
import {
  formatDate,
  formatWeightValue,
  weightUnitLabel,
} from "@/services/localization";
import {
  loadTrainingAnalysis,
  type TrainingAnalysis,
} from "@/services/trainingAnalysis";
import { repairText } from "@/services/textUtils";
import {
  loadWorkoutInsights,
  type DailyWorkoutPoint,
  type WorkoutInsights,
} from "@/services/workoutInsights";
import { loadWorkoutLogs } from "@/services/workoutStore";
import { loadProgressionDecisions } from "@/workout-programming";
import { loadProfile } from "@/services/profileStore";
import { getExerciseById } from "@/services/exerciseCatalog";
import { canAccessTrainingInsights } from "@/services/subscription";
import type { WorkoutLog, WorkoutSetLogEntry, UserProfile } from "@/types";
import type { AppliedProgressionDecision } from "@/types/aiProgramProgression";

type BestSetResult = {
  entry: WorkoutSetLogEntry;
  log: WorkoutLog;
  volume: number;
} | null;

export default function WorkoutProgressScreen() {
  useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useAppLocalization();
  const [insights, setInsights] = useState<WorkoutInsights | null>(null);
  const [analysis, setAnalysis] = useState<TrainingAnalysis | null>(null);
  const [recentLogs, setRecentLogs] = useState<WorkoutLog[]>([]);
  const [progressionDecisions, setProgressionDecisions] = useState<AppliedProgressionDecision[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refresh = useCallback(async () => {
    const [loadedInsights, loadedAnalysis, logs, loadedProfile, decisions] =
      await Promise.all([
        loadWorkoutInsights(),
        loadTrainingAnalysis(),
        loadWorkoutLogs(),
        loadProfile(),
        loadProgressionDecisions(),
      ]);
    setInsights(loadedInsights);
    setAnalysis(loadedAnalysis);
    setRecentLogs(logs.slice(0, 6));
    setProfile(loadedProfile);
    setProgressionDecisions(decisions.slice(0, 8));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const bestSet = useMemo(() => findBestSet(recentLogs), [recentLogs]);
  const insightsUnlocked = canAccessTrainingInsights(profile);
  const unit = weightUnitLabel();

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t({ tr: "Antrenman içgörüleri", en: "Training insights" })}
      />

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
        {insights ? (
          <>
            {analysis && insightsUnlocked ? (
              <GlassCard variant="panel" style={styles.headlineCard}>
                <Text style={styles.headlineTitle}>{analysis.headline}</Text>
                <Text style={styles.headlineBody}>
                  {analysis.headlineDetail}
                </Text>
              </GlassCard>
            ) : null}

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t({
                tr: "Ağırlık ve tekrar gelişimini aç",
                en: "Open strength progress",
              })}
              activeOpacity={0.84}
              onPress={() => router.push("/strength-progress")}
            >
              <GlassCard style={styles.strengthEntryCard}>
                <View style={styles.strengthEntryIcon}>
                  <Ionicons
                    name="trending-up"
                    size={22}
                    color={colors.onPrimary}
                  />
                </View>
                <View style={styles.strengthEntryCopy}>
                  <Text style={styles.strengthEntryTitle}>
                    {t({ tr: "Ağırlık gelişimi", en: "Strength progress" })}
                  </Text>
                  <Text style={styles.strengthEntryBody}>
                    {t({
                      tr: "Bench Press gibi hareketlerde ilk ve güncel ağırlık/tekrar değerlerini karşılaştır.",
                      en: "Compare starting and current weight and rep values for lifts like Bench Press.",
                    })}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.onPrimary}
                />
              </GlassCard>
            </TouchableOpacity>

            <View style={styles.grid}>
              <InsightCard
                title={insights.weekly.label}
                value={`${insights.weekly.sessions} ${t({ tr: "seans", en: "sessions" })}`}
                sub={`${insights.weekly.minutes} ${t({ tr: "dk", en: "min" })} · ${insights.weekly.kcal} kcal · ${insights.weekly.sets} ${t({ tr: "set", en: "sets" })}`}
                accent={colors.secondary}
              />
              <InsightCard
                title={insights.monthly.label}
                value={`${insights.monthly.sessions} ${t({ tr: "seans", en: "sessions" })}`}
                sub={`${insights.monthly.minutes} ${t({ tr: "dk", en: "min" })} · ${insights.monthly.kcal} kcal · ${insights.monthly.sets} ${t({ tr: "set", en: "sets" })}`}
                accent={colors.primary}
              />
            </View>

            <GlassCard variant="panel" style={styles.card}>
              <Text style={styles.cardTitle}>
                {t({ tr: "Son koç hedefleri", en: "Recent target updates" })}
              </Text>
              {progressionDecisions.length > 0 ? (
                progressionDecisions.slice(0, 5).map((decision) => (
                  <ProgressionDecisionRow key={decision.decisionId} decision={decision} />
                ))
              ) : (
                <Text style={styles.emptyText}>
                  {t({
                    tr: "AI program seanslarını tamamladıkça artış, tekrar, hafifletme ve deload kararları burada görünür.",
                    en: "As you complete AI program sessions, increases, repeats, reductions and deload recommendations appear here.",
                  })}
                </Text>
              )}
            </GlassCard>

            <View style={styles.grid}>
              <InsightCard
                title={t({ tr: "Haftalık hacim", en: "Weekly volume" })}
                value={`${formatWeightValue(Math.round(insights.weekly.volumeKg), 0)} ${unit}`}
                sub={t({
                  tr: "Kaydedilen çalışma setlerinden hesaplandı",
                  en: "Calculated from logged working sets",
                })}
                accent={colors.tertiary}
              />
              <InsightCard
                title={t({ tr: "Aylık hacim", en: "Monthly volume" })}
                value={`${formatWeightValue(Math.round(insights.monthly.volumeKg), 0)} ${unit}`}
                sub={t({
                  tr: "Program ve egzersiz kayıtları dahil",
                  en: "Includes program and exercise logs",
                })}
                accent={colors.primaryContainer}
              />
            </View>

            {bestSet ? (
              <GlassCard variant="panel" style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>
                    {t({ tr: "Öne çıkan set", en: "Highlighted set" })}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {formatLogTime(bestSet.log.completedAt)}
                  </Text>
                </View>
                <Text style={styles.bestSetValue}>
                  {formatWeightValue(bestSet.entry.kg)} {unit} x{" "}
                  {bestSet.entry.reps}
                </Text>
                <Text style={styles.bestSetHint}>
                  {repairText(bestSet.log.title)} ·{" "}
                  {formatWeightValue(Math.round(bestSet.volume), 0)} {unit}{" "}
                  {t({ tr: "hacim", en: "volume" })}
                </Text>
              </GlassCard>
            ) : null}

            <WorkoutTrendCard points={insights.last7Days} />

            {analysis && insightsUnlocked ? (
              <AnalysisRegionList analysis={analysis} />
            ) : null}
            {analysis?.sufficiency === "sufficient" && insightsUnlocked ? (
              <PplBalanceCard analysis={analysis} />
            ) : null}
            {!insightsUnlocked ? (
              <PremiumFeatureCard
                title={t({
                  tr: "Kas dengesi analizi",
                  en: "Muscle balance analysis",
                })}
                body={t({
                  tr: "Haftalık bölge dağılımını ve itiş/çekiş dengesini premium ile görüntüle.",
                  en: "View weekly muscle distribution and push/pull balance with premium.",
                })}
                ctaLabel={t({ tr: "Premium'u incele", en: "Explore premium" })}
                onPress={() => router.push("/premium")}
              />
            ) : null}

            <GlassCard variant="panel" style={styles.card}>
              <Text style={styles.cardTitle}>
                {t({
                  tr: "Kas grubu dağılımı",
                  en: "Muscle group distribution",
                })}
              </Text>
              {insights.topMuscleGroups.length > 0 ? (
                insights.topMuscleGroups.map((group) => (
                  <View key={group.name} style={styles.row}>
                    <Text style={styles.rowLabel}>
                      {repairText(group.name)}
                    </Text>
                    <View style={styles.rowRight}>
                      <View style={styles.miniTrack}>
                        <View
                          style={[
                            styles.miniFill,
                            { width: `${Math.min(group.count * 20, 100)}%` },
                          ]}
                        />
                      </View>
                      <Text style={styles.rowValue}>
                        {group.count} {t({ tr: "kayıt", en: "logs" })}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  {t({
                    tr: "Henüz kas grubu verisi oluşmadı. Egzersiz ve program tamamladıkça burada görünür.",
                    en: "No muscle group data yet. It will appear here as you complete exercises and programs.",
                  })}
                </Text>
              )}
            </GlassCard>

            <GlassCard variant="panel" style={styles.card}>
              <Text style={styles.cardTitle}>
                {t({ tr: "Kaynak karışımı", en: "Source mix" })}
              </Text>
              <View style={styles.grid}>
                <InsightCard
                  title={t({ tr: "Egzersizler", en: "Exercises" })}
                  value={`${insights.recentSources.exercise}`}
                  sub={t({
                    tr: "Detay ekranından gelen kayıt",
                    en: "Logged from exercise details",
                  })}
                  accent={colors.tertiary}
                />
                <InsightCard
                  title={t({ tr: "Program günleri", en: "Program days" })}
                  value={`${insights.recentSources.program}`}
                  sub={t({
                    tr: "Program akışından gelen kayıt",
                    en: "Logged from program flow",
                  })}
                  accent={colors.primaryContainer}
                />
                <InsightCard
                  title={t({ tr: "Kişisel planlar", en: "Custom plans" })}
                  value={`${insights.recentSources.custom}`}
                  sub={t({
                    tr: "Kendi planlarından gelen kayıt",
                    en: "Logged from your own plans",
                  })}
                  accent={colors.secondary}
                />
              </View>
            </GlassCard>

            <RecentSetLogsCard logs={recentLogs} />
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function WorkoutTrendCard({ points }: { points: DailyWorkoutPoint[] }) {
  const { t } = useAppLocalization();
  const maxSessions = Math.max(...points.map((point) => point.sessions), 1);

  return (
    <GlassCard variant="panel" style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {t({ tr: "Bu hafta", en: "This week" })}
        </Text>
        <Text style={styles.cardMeta}>
          {t({ tr: "Seans ritmi", en: "Session rhythm" })}
        </Text>
      </View>
      <View style={styles.chartRow}>
        {points.map((point) => {
          const pct = Math.max(8, (point.sessions / maxSessions) * 100);
          return (
            <View key={point.date} style={styles.chartItem}>
              <View style={styles.chartTrack}>
                <View style={[styles.chartFill, { height: `${pct}%` }]} />
              </View>
              <Text style={styles.chartLabel}>{point.label}</Text>
              <Text style={styles.chartValue}>{point.sessions}</Text>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

function InsightCard({
  title,
  value,
  sub,
  accent,
}: {
  title: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <GlassCard variant="panel" style={styles.insightCard}>
      <Text style={[styles.insightTitle, { color: accent }]}>{title}</Text>
      <Text style={styles.insightValue}>{value}</Text>
      <Text style={styles.insightSub}>{sub}</Text>
    </GlassCard>
  );
}

function PplBalanceCard({ analysis }: { analysis: TrainingAnalysis }) {
  const { t } = useAppLocalization();
  const { push, pull, legs } = analysis.ppl;
  const total = push + pull + legs;
  const sides: { label: string; value: number; accent: string }[] = [
    {
      label: t({ tr: "İtiş (push)", en: "Push" }),
      value: push,
      accent: colors.primary,
    },
    {
      label: t({ tr: "Çekiş (pull)", en: "Pull" }),
      value: pull,
      accent: colors.secondary,
    },
    {
      label: t({ tr: "Bacak (legs)", en: "Legs" }),
      value: legs,
      accent: colors.tertiary,
    },
  ];
  const maxSets = Math.max(push, pull, legs, 1);

  return (
    <GlassCard variant="panel" style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {t({ tr: "İtiş / Çekiş / Bacak", en: "Push / Pull / Legs" })}
        </Text>
        <Text style={styles.cardMeta}>
          {t({ tr: "Set dengesi", en: "Set balance" })}
        </Text>
      </View>

      <Text style={styles.pplNote}>{analysis.pplPhrase}</Text>

      {total > 0 ? (
        <View style={styles.pplRows}>
          {sides.map((side) => {
            const pct = Math.max(
              6,
              Math.min((side.value / maxSets) * 100, 100),
            );
            return (
              <View key={side.label} style={styles.pplRow}>
                <Text style={styles.pplLabel}>{side.label}</Text>
                <View style={styles.pplTrack}>
                  <View
                    style={[
                      styles.pplFill,
                      { width: `${pct}%`, backgroundColor: side.accent },
                    ]}
                  />
                </View>
                <Text style={styles.pplValue}>{Math.round(side.value)}</Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={styles.emptyText}>
          {t({
            tr: "Bu hafta itiş/çekiş/bacak verisi henüz oluşmadı.",
            en: "No push/pull/legs data has formed this week yet.",
          })}
        </Text>
      )}
    </GlassCard>
  );
}

function RecentSetLogsCard({ logs }: { logs: WorkoutLog[] }) {
  const router = useRouter();
  const { t } = useAppLocalization();
  const unit = weightUnitLabel();

  return (
    <GlassCard variant="panel" style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {t({ tr: "Son kayıt detayları", en: "Recent log details" })}
        </Text>
        <Text style={styles.cardMeta}>
          {t({ tr: "Set bazlı özet", en: "Set-based summary" })}
        </Text>
      </View>

      {logs.length > 0 ? (
        <View style={styles.logRows}>
          {logs.map((log) => {
            const setCount = log.setEntries?.length ?? 0;
            const volume =
              log.setEntries?.reduce(
                (sum, entry) => sum + entry.kg * entry.reps,
                0,
              ) ?? 0;

            return (
              <TouchableOpacity
                key={log.id}
                style={styles.logRow}
                activeOpacity={0.8}
                onPress={() =>
                  router.push({
                    pathname: "/workout-log-detail",
                    params: { id: log.id },
                  })
                }
              >
                <View style={styles.logLeft}>
                  <Text style={styles.logTitle}>{repairText(log.title)}</Text>
                  <Text style={styles.logMeta}>
                    {log.durationMin} {t({ tr: "dk", en: "min" })} · ~{log.kcal}{" "}
                    kcal
                    {setCount > 0
                      ? ` · ${setCount} ${t({ tr: "set", en: "sets" })} · ${formatWeightValue(Math.round(volume), 0)} ${unit}`
                      : ""}
                  </Text>
                </View>
                <Text style={styles.logDate}>
                  {formatLogTime(log.completedAt)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <Text style={styles.emptyText}>
          {t({ tr: "Henüz kayıt bulunmuyor.", en: "No logs yet." })}
        </Text>
      )}
    </GlassCard>
  );
}

function ProgressionDecisionRow({ decision }: { decision: AppliedProgressionDecision }) {
  const exerciseName = repairText(getExerciseById(decision.exerciseId)?.displayName ?? decision.exerciseId);
  const icon = decision.decision.type === 'increase_load'
    ? 'trending-up'
    : decision.decision.type === 'recommend_deload'
      ? 'leaf-outline'
      : decision.decision.type === 'reduce_load'
        ? 'arrow-down-circle-outline'
        : 'reload-outline';
  const nextLoad = decision.nextState.targetLoadKg;
  const detail = nextLoad !== undefined && nextLoad > 0
    ? `${decision.decision.explanation} · Sonraki hedef ${formatWeightValue(nextLoad)} ${weightUnitLabel()}`
    : decision.decision.explanation;
  return (
    <View style={styles.progressionRow}>
      <View style={styles.progressionIcon}>
        <Ionicons name={icon} size={17} color={colors.primary} />
      </View>
      <View style={styles.progressionCopy}>
        <Text style={styles.progressionTitle}>{exerciseName}</Text>
        <Text style={styles.progressionBody}>{repairText(detail)}</Text>
      </View>
    </View>
  );
}

function findBestSet(logs: WorkoutLog[]): BestSetResult {
  let best: BestSetResult = null;

  for (const log of logs) {
    for (const entry of log.setEntries ?? []) {
      const volume = entry.kg * entry.reps;
      if (
        !best ||
        entry.kg > best.entry.kg ||
        (entry.kg === best.entry.kg && volume > best.volume)
      ) {
        best = { entry, log, volume };
      }
    }
  }

  return best;
}

function formatLogTime(isoDate: string): string {
  return formatDate(new Date(isoDate), {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  headlineCard: { padding: spacing.cardPadding, gap: spacing.xs },
  headlineTitle: { ...typography.cardTitle, color: colors.onSurface },
  headlineBody: { ...typography.bodySm, color: colors.onSurfaceVariant },
  strengthEntryCard: {
    minHeight: 92,
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  strengthEntryIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.xl,
    backgroundColor: colors.whiteAlpha20,
    alignItems: "center",
    justifyContent: "center",
  },
  strengthEntryCopy: { flex: 1, gap: 3 },
  strengthEntryTitle: {
    ...typography.cardTitle,
    color: colors.onPrimary,
  },
  strengthEntryBody: {
    ...typography.bodySm,
    color: colors.whiteAlpha60,
    lineHeight: 17,
  },
  grid: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  insightCard: {
    flexBasis: "47%",
    flexGrow: 1,
    padding: spacing.md,
    minHeight: 112,
    gap: spacing.xs,
  },
  insightTitle: { ...typography.bodyXs },
  insightValue: {
    ...typography.sectionTitle,
    color: colors.onSurface,
  },
  insightSub: { ...typography.bodySm, color: colors.onSurfaceVariant },
  card: { padding: spacing.cardPadding, gap: spacing.smPlus },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  cardTitle: { ...typography.cardTitle, color: colors.onSurface },
  cardMeta: { ...typography.labelMd, color: colors.onSurfaceVariant },
  bestSetValue: { ...typography.headlineLgMobile, color: colors.secondary },
  bestSetHint: { ...typography.bodySm, color: colors.onSurface },
  progressionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  progressionIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  progressionCopy: { flex: 1, gap: 2 },
  progressionTitle: { ...typography.labelMd, color: colors.onSurface },
  progressionBody: { ...typography.bodySm, color: colors.onSurfaceVariant, lineHeight: 18 },
  chartRow: {
    minHeight: 142,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },
  chartItem: { flex: 1, alignItems: "center", gap: 6 },
  chartTrack: {
    width: "100%",
    height: 92,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerHighest,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartFill: {
    width: "100%",
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
    backgroundColor: colors.secondary,
  },
  chartLabel: {
    ...typography.bodyXs,
    color: colors.onSurfaceVariant,
  },
  chartValue: { ...typography.labelXs, color: colors.outline },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  rowLabel: { ...typography.bodyMd, color: colors.onSurface, flex: 1 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  rowValue: {
    ...typography.labelMd,
    color: colors.secondary,
    minWidth: 56,
    textAlign: "right",
  },
  miniTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
    overflow: "hidden",
  },
  miniFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
  },
  pplNote: { ...typography.bodyMd, color: colors.onSurface },
  pplRows: { gap: 12 },
  pplRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pplLabel: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    minWidth: 104,
  },
  pplTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
    overflow: "hidden",
  },
  pplFill: { height: "100%", borderRadius: radius.full },
  pplValue: {
    ...typography.labelMd,
    color: colors.onSurface,
    minWidth: 28,
    textAlign: "right",
  },
  logRows: { gap: 12 },
  logRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  logLeft: { flex: 1, gap: 3 },
  logTitle: { ...typography.labelMd, color: colors.onSurface },
  logMeta: { ...typography.bodySm, color: colors.onSurface },
  logDate: { ...typography.bodySm, color: colors.outline },
  emptyText: { ...typography.bodySm, color: colors.onSurfaceVariant },
}));
