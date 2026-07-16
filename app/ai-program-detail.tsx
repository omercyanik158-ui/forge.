import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useAppLocalization } from "@/providers/localization-context";
import { loadAIProgramInstanceById } from "@/services/aiProgramInstanceStore";
import { safeGoBack } from "@/services/navigation";
import { loadAIProgramProgress } from "@/services/programProgressStore";
import { normalizeProgramText, repairText } from "@/services/textUtils";
import {
  createDynamicStyles,
  layout,
  radius,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { AIDayPrescription, AIGeneratedWeek, AIProgramPlan } from "@/types/aiProgramPlan";

type DayState = "completed" | "recommended" | "available";

function normalizeAIDetailDayTitle(day: AIDayPrescription): string {
  const title = normalizeProgramText(day.title);
  const lower = title.toLocaleLowerCase("tr-TR");
  const upperLowerSuffix = String.fromCharCode(65 + Math.floor(day.dayIndex / 2));
  const flowSuffix = String.fromCharCode(65 + (day.dayIndex % 3));

  if (lower.includes("üst") || lower.includes("ust")) {
    return `Üst Vücut ${upperLowerSuffix}`;
  }
  if (lower.includes("alt")) {
    return `Alt Vücut ${upperLowerSuffix}`;
  }
  if (lower.includes("tüm") || lower.includes("tam")) {
    return `Tüm Vücut ${flowSuffix}`;
  }

  return title;
}

export default function AIProgramDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [plan, setPlan] = useState<AIProgramPlan | null>(null);
  const [completedDayIds, setCompletedDayIds] = useState<string[]>([]);
  const [reasonExpanded, setReasonExpanded] = useState(false);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);

  const refresh = useCallback(async () => {
    if (!id) {
      setPlan(null);
      setCompletedDayIds([]);
      return;
    }

    const [loadedPlan, progress] = await Promise.all([
      loadAIProgramInstanceById(id),
      loadAIProgramProgress(id),
    ]);
    setPlan(loadedPlan);
    setCompletedDayIds(progress);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const totalDayCount = useMemo(
    () => plan?.weeks.reduce((sum, week) => sum + week.days.length, 0) ?? 0,
    [plan],
  );
  const progressPercent =
    totalDayCount > 0 ? Math.round((completedDayIds.length / totalDayCount) * 100) : 0;

  const nextDayId = useMemo(() => {
    if (!plan) return null;
    for (const week of plan.weeks) {
      for (const day of week.days) {
        if (!completedDayIds.includes(day.id)) return day.id;
      }
    }
    return plan.weeks[0]?.days[0]?.id ?? null;
  }, [plan, completedDayIds]);

  const dayState = useCallback(
    (dayId: string): DayState => {
      if (completedDayIds.includes(dayId)) return "completed";
      if (dayId === nextDayId) return "recommended";
      return "available";
    },
    [completedDayIds, nextDayId],
  );

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
            <Ionicons name="chevron-back" size={25} color={colors.onSurface} />
          </TouchableOpacity>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.onSurface }]}>
            {t("ai_program.detail_screen_title")}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.screenHeaderOffset,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        {plan ? (
          <>
            <GlassCard variant="panel" style={styles.heroCard}>
              <View style={[styles.badge, { backgroundColor: `${colors.primary}24` }]}>
                <Ionicons name="sparkles-outline" size={13} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {t("ai_program.detail_badge")}
                </Text>
              </View>

              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, { color: colors.onSurface }]}>
                {normalizeProgramText(plan.title)}
              </Text>
              <Text numberOfLines={2} style={[styles.programBody, { color: colors.onSurfaceVariant }]}>
                {normalizeProgramText(plan.subtitle)}
              </Text>

              <View style={styles.pillRow}>
                <MetaPill label={t('ai_program.goal_' + plan.goal)} />
                <MetaPill label={`${plan.weekCount} hafta`} />
                <MetaPill label={`${plan.daysPerWeek} gün`} />
                <MetaPill label={normalizeProgramText(plan.trainingStyle)} />
              </View>

              {nextDayId ? (
                <View style={styles.heroBody}>
                  <ProgressRing
                    size={92}
                    strokeWidth={8}
                    progress={progressPercent}
                    color={colors.success}
                    centerValue={`${progressPercent}%`}
                  />
                  <View style={styles.heroBodyCopy}>
                    <Text style={[styles.progressLabel, { color: colors.onSurface }]}>
                      {completedDayIds.length}/{totalDayCount} {t("ai_program.detail_days_done")}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.84}
                      onPress={() =>
                        router.push({
                          pathname: "/program-session",
                          params: { aiProgramId: plan.id, aiDayId: nextDayId },
                        })
                      }
                      style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    >
                      <Ionicons name="play" size={18} color={colors.onPrimary} />
                      <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
                        {t("ai_program.detail_continue_cta")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </GlassCard>

            <GlassCard style={styles.sectionCard}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.8}
                onPress={() => setReasonExpanded((prev) => !prev)}
                style={styles.reasonHeader}
              >
                <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                  {t("ai_program.detail_reason_title")}
                </Text>
                <View style={styles.reasonToggle}>
                  <Text style={[styles.reasonToggleText, { color: colors.primary }]}>
                    {reasonExpanded
                      ? t("ai_program.detail_reason_hide")
                      : t("ai_program.detail_reason_show")}
                  </Text>
                  <Ionicons
                    name={reasonExpanded ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.primary}
                  />
                </View>
              </TouchableOpacity>
              {reasonExpanded ? (
                <View style={styles.reasonList}>
                  {plan.explanation.whyThisPlan.slice(0, 4).map((line) => (
                    <View key={line} style={styles.reasonRow}>
                      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                      <Text style={[styles.reasonText, { color: colors.onSurfaceVariant }]}>
                        {normalizeProgramText(line)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </GlassCard>

            {plan.weeks.length > 1 ? (
              <WeekTabs
                weeks={plan.weeks}
                activeIndex={activeWeekIndex}
                onSelect={setActiveWeekIndex}
                completedDayIds={completedDayIds}
                t={t}
              />
            ) : null}

            {plan.weeks[activeWeekIndex] ? (
              <WeekSection
                key={`${plan.id}-${plan.weeks[activeWeekIndex].weekIndex}`}
                planId={plan.id}
                week={plan.weeks[activeWeekIndex]}
                dayState={dayState}
              />
            ) : null}
          </>
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
              {t("ai_program.detail_empty_title")}
            </Text>
            <Text style={[styles.sectionBody, { color: colors.onSurfaceVariant }]}>
              {t("ai_program.detail_empty_body")}
            </Text>
            <TouchableOpacity
              activeOpacity={0.84}
              onPress={() => router.replace("/ai-program-builder")}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.onPrimary }]}>
                {t("ai_program.detail_open_builder")}
              </Text>
            </TouchableOpacity>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

function WeekTabs({
  weeks,
  activeIndex,
  onSelect,
  completedDayIds,
  t,
}: {
  weeks: AIGeneratedWeek[];
  activeIndex: number;
  onSelect: (index: number) => void;
  completedDayIds: string[];
  t: (key: string) => string;
}) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.weekTabsContent}
    >
      {weeks.map((week, index) => {
        const active = index === activeIndex;
        const weekDone = week.days.every((day) => completedDayIds.includes(day.id));
        return (
          <TouchableOpacity
            key={week.weekIndex}
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => onSelect(index)}
            style={[
              styles.weekTab,
              {
                backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
                borderColor: active ? colors.primary : colors.outlineVariant,
              },
            ]}
          >
            {weekDone ? (
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={active ? colors.onPrimary : colors.success}
              />
            ) : null}
            <Text style={[styles.weekTabText, { color: active ? colors.onPrimary : colors.onSurface }]}>
              {t("ai_program.detail_week_label").replace("{count}", String(week.weekIndex + 1))}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function WeekSection({
  planId,
  week,
  dayState,
}: {
  planId: string;
  week: AIGeneratedWeek;
  dayState: (dayId: string) => DayState;
}) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <GlassCard style={styles.sectionCard}>
      <View style={styles.weekHeader}>
        <View style={styles.weekHeaderCopy}>
          <Text style={[styles.sectionBody, { color: colors.onSurfaceVariant }]}>
            {repairText(week.guidance)}
          </Text>
        </View>
      </View>

      <View style={styles.dayList}>
        {week.days.map((day) => (
          <DayCard
            key={day.id}
            day={day}
            state={dayState(day.id)}
            t={t}
            onPress={() =>
              router.push({
                pathname: "/program-session",
                params: { aiProgramId: planId, aiDayId: day.id },
              })
            }
          />
        ))}
      </View>
    </GlassCard>
  );
}

function DayCard({
  day,
  state,
  onPress,
  t,
}: {
  day: AIDayPrescription;
  state: DayState;
  onPress: () => void;
  t: (key: string) => string;
}) {
  const { colors } = useAppTheme();
  const recommended = state === "recommended";
  const completed = state === "completed";

  const actionIcon: keyof typeof Ionicons.glyphMap = completed
    ? "checkmark"
    : recommended
      ? "sparkles"
      : "play";
  const actionBackground = completed ? colors.success : colors.primary;
  const actionA11y = completed
    ? t("ai_program.detail_day_completed_a11y")
    : recommended
      ? t("ai_program.detail_day_recommended_a11y")
      : t("ai_program.detail_day_available_a11y");

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${normalizeAIDetailDayTitle(day)}, ${actionA11y}`}
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.dayCard,
        {
          borderColor: completed ? `${colors.success}45` : colors.outlineVariant,
          backgroundColor: colors.surfaceContainerLow,
        },
      ]}
    >
      <View style={styles.dayHeader}>
        <View style={styles.dayCopy}>
          <Text numberOfLines={2} ellipsizeMode="tail" style={[styles.dayTitle, { color: colors.onSurface }]}>
            {normalizeAIDetailDayTitle(day)}
          </Text>
          <Text style={[styles.dayMeta, { color: colors.onSurface }]}>
            {day.exercises.length} hareket - {day.totalSets} set - {day.durationMin} dk
          </Text>
          {recommended && !completed ? (
            <Text style={[styles.dayRecommendation, { color: colors.primary }]}>
              Sıradaki antrenman
            </Text>
          ) : null}
        </View>
        <View style={[styles.dayAction, { backgroundColor: actionBackground }]}>
          <Ionicons name={actionIcon} size={15} color={colors.onPrimary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MetaPill({ label }: { label: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.metaPill, { backgroundColor: colors.surfaceContainerLow }]}>
      <Text style={[styles.metaPillText, { color: colors.onSurface }]}>{label}</Text>
    </View>
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
    height: 64,
    paddingHorizontal: 16,
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
  headerTitle: { ...typography.headlineMd },
  headerSpacer: { width: 44, height: 44 },
  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.gutter,
  },
  heroCard: { padding: spacing.lg, gap: spacing.sm },
  badge: {
    alignSelf: "flex-start",
    minHeight: 26,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeText: { ...typography.labelCaps },
  title: { ...typography.headlineMd, minWidth: 0 },
  programBody: {
    ...typography.bodySm,
    lineHeight: 20,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaPill: {
    minHeight: 32,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  metaPillText: { ...typography.bodyXs },
  heroBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  heroBodyCopy: { flex: 1, gap: 10 },
  progressLabel: { ...typography.labelMd },
  sectionCard: { padding: spacing.cardPadding, gap: spacing.sm },
  sectionTitle: { ...typography.sectionTitle },
  sectionBody: { ...typography.bodySm, lineHeight: 20, flex: 1 },
  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  reasonToggle: { flexDirection: "row", alignItems: "center", gap: 4 },
  reasonToggleText: { ...typography.labelMd, fontSize: 13 },
  reasonList: { gap: 10, marginTop: spacing.xs },
  reasonRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  reasonText: { ...typography.bodySm, flex: 1, lineHeight: 20 },
  weekTabsContent: { gap: 8, paddingRight: 8 },
  weekTab: {
    minHeight: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  weekTabText: { ...typography.labelMd, fontSize: 13 },
  weekHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  weekHeaderCopy: { flex: 1 },
  dayList: { gap: 10 },
  dayCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.smPlus,
    gap: 10,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  dayCopy: { flex: 1, minWidth: 0, gap: 4 },
  dayTitle: { ...typography.cardTitle, lineHeight: 22 },
  dayMeta: { ...typography.bodySm, lineHeight: 18 },
  dayRecommendation: { ...typography.labelMd, fontSize: 12 },
  dayAction: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: { ...typography.buttonLg },
  emptyCard: { padding: spacing.cardPadding, gap: spacing.smPlus },
}));
