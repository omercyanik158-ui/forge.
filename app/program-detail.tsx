import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { GlassCard } from "@/components/GlassCard";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useAppLocalization } from "@/providers/localization-context";
import { getPremiumMarketSnapshot } from "@/services/market";
import { safeGoBack } from "@/services/navigation";
import { getProgramById, type ProgramDay, type ProgramWeek } from "@/services/programCatalog";
import {
  loadFavoriteProgramIds,
  toggleFavoriteProgram,
} from "@/services/programFavoriteStore";
import { addUserProgram } from "@/services/userProgramsStore";
import { localizeProgramPlan } from "@/services/program-localization";
import { loadProgramProgress } from "@/services/programProgressStore";
import { loadProfile } from "@/services/profileStore";
import { canAccessPremiumPrograms } from "@/services/subscription";
import { normalizeProgramText, repairText } from "@/services/textUtils";
import {
  colors,
  createDynamicStyles,
  layout,
  radius,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { UserProfile } from "@/types";

export default function ProgramDetailScreen() {
  useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resolved, t } = useAppLocalization();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const program = useMemo(() => {
    const source = id ? getProgramById(id) : undefined;
    return source ? localizeProgramPlan(source, resolved.language) : undefined;
  }, [id, resolved.language]);
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const premiumOffer = getPremiumMarketSnapshot(resolved);
  const locked =
    !!program &&
    program.tier === "premium" &&
    !canAccessPremiumPrograms(profile);

  const refresh = useCallback(async () => {
    const [loadedProfile, progress, favoriteIds] = await Promise.all([
      loadProfile(),
      program ? loadProgramProgress(program.id) : Promise.resolve([]),
      loadFavoriteProgramIds(),
    ]);
    setProfile(loadedProfile);
    setCompletedDays(progress);
    setIsFavorite(!!program && favoriteIds.includes(program.id));

    if (program && !locked) {
      void addUserProgram(program.id);
    }
  }, [program, locked]);

  const handleToggleFavorite = useCallback(async () => {
    if (!program) return;
    setIsFavorite((prev) => !prev);
    const nextIds = await toggleFavoriteProgram(program.id);
    setIsFavorite(nextIds.includes(program.id));
  }, [program]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const visibleWeeks = locked
    ? (program?.weeks.slice(0, 1) ?? [])
    : (program?.weeks ?? []);
  const activeWeek = visibleWeeks[Math.min(activeWeekIndex, Math.max(visibleWeeks.length - 1, 0))];
  const totalDayCount = useMemo(
    () => program?.weeks.reduce((sum, week) => sum + week.days.length, 0) ?? 0,
    [program],
  );
  const progressPercent =
    totalDayCount > 0 ? Math.round((completedDays.length / totalDayCount) * 100) : 0;
  const nextDayId = useMemo(() => {
    if (!program) return null;
    for (const week of program.weeks) {
      for (const day of week.days) {
        if (!completedDays.includes(day.id)) return day.id;
      }
    }
    return program.weeks[0]?.days[0]?.id ?? null;
  }, [completedDays, program]);
  const nextDay = useMemo(
    () =>
      nextDayId
        ? program?.weeks.flatMap((week) => week.days).find((day) => day.id === nextDayId)
        : null,
    [nextDayId, program],
  );

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.topBarInner}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("migrated.program_detail_001")}
            onPress={() => safeGoBack(router)}
            activeOpacity={0.7}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={25} color={colors.onSurface} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>
            {t("migrated.program_detail_002")}
          </Text>
          {program ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={
                isFavorite
                  ? t("program_detail.remove_favorite_a11y")
                  : t("program_detail.add_favorite_a11y")
              }
              onPress={handleToggleFavorite}
              activeOpacity={0.7}
              style={styles.iconButton}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={23}
                color={isFavorite ? colors.secondary : colors.onSurface}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconButton} />
          )}
        </View>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
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
        {program ? (
          <>
            <GlassCard variant="panel" style={styles.heroCard}>
              <View style={[styles.badge, { backgroundColor: `${program.color}24` }]}>
                <Ionicons name="barbell-outline" size={13} color={program.color} />
                <Text style={[styles.badgeText, { color: program.color }]}>
                  {program.tier === "premium" ? "PREMIUM" : t("migrated.program_detail_003")}
                </Text>
              </View>
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.programTitle}>
                {normalizeProgramText(program.title)}
              </Text>
              <Text numberOfLines={2} style={styles.programBody}>
                {repairText(program.summary)}
              </Text>
              <View style={styles.pillRow}>
                <MetaPill label={program.goal} />
                <MetaPill label={program.duration} />
                <MetaPill label={`${program.daysPerWeek} gün / hafta`} />
                <MetaPill label={repairText(program.trainingStyle)} />
              </View>
              {!locked && nextDay ? (
                <View style={styles.heroBody}>
                  <ProgressRing
                    size={92}
                    strokeWidth={8}
                    progress={progressPercent}
                    color={colors.success}
                    centerValue={`${progressPercent}%`}
                  />
                  <View style={styles.heroBodyCopy}>
                    <Text style={styles.progressLabel}>
                      {completedDays.length}/{totalDayCount} gün tamamlandı
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.84}
                      onPress={() =>
                        router.push({
                          pathname: "/program-session",
                          params: { programId: program.id, dayId: nextDay.id },
                        })
                      }
                      style={[styles.primaryButton, { backgroundColor: colors.primary }]}
                    >
                      <Ionicons name="play" size={18} color={colors.onPrimary} />
                      <Text style={styles.primaryButtonText}>Antrenmanı başlat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}
            </GlassCard>

            {locked ? (
              <PremiumFeatureCard
                title={t("migrated.program_detail_004")}
                body={t("migrated.program_detail_dynamic_004")}
                note={premiumOffer.valueComparison}
                ctaLabel={t("migrated.program_detail_005")}
                onPress={() => router.push("/premium")}
              />
            ) : null}

            {visibleWeeks.length > 1 ? (
              <WeekTabs
                weeks={visibleWeeks}
                activeIndex={Math.min(activeWeekIndex, visibleWeeks.length - 1)}
                completedDayIds={completedDays}
                onSelect={setActiveWeekIndex}
              />
            ) : null}

            {activeWeek ? (
              <GlassCard variant="panel" style={styles.sectionCard}>
                <View style={styles.weekHeader}>
                  <Text style={styles.sectionBody}>{repairText(activeWeek.guidance)}</Text>
                  {locked ? <Ionicons name="lock-closed" size={18} color={colors.secondary} /> : null}
                </View>
                <View style={styles.dayList}>
                {activeWeek.days.map((programDay) => (
                  <ProgramDayCard
                    key={programDay.id}
                    day={programDay}
                    completed={completedDays.includes(programDay.id)}
                    recommended={programDay.id === nextDayId}
                    locked={locked}
                    onOpenSession={() =>
                      locked
                        ? router.push("/premium")
                        : router.push({
                            pathname: "/program-session",
                            params: {
                              programId: program.id,
                              dayId: programDay.id,
                            },
                          })
                    }
                  />
                ))}
                </View>
              </GlassCard>
            ) : null}

            {locked ? (
              <GlassCard variant="panel" style={styles.lockedWeeksCard}>
                <View style={styles.lockedIcon}>
                  <Ionicons
                    name="lock-closed"
                    size={20}
                    color={colors.secondary}
                  />
                </View>
                <View style={styles.lockedCopy}>
                  <Text style={styles.lockedTitle}>
                    {t("migrated.program_detail_dynamic_005").replace(
                      "{count}",
                      `${Math.max(program.weeks.length - 1, 0)}`,
                    )}
                  </Text>
                  <Text style={styles.lockedBody}>
                    {t("migrated.program_detail_dynamic_006")}
                  </Text>
                </View>
              </GlassCard>
            ) : null}
          </>
        ) : (
          <GlassCard variant="panel" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              {t("migrated.program_detail_006")}
            </Text>
            <Text style={styles.emptyBody}>
              {t("migrated.program_detail_007")}
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

function ProgramDayCard({
  day,
  completed,
  recommended,
  locked,
  onOpenSession,
}: {
  day: ProgramDay;
  completed: boolean;
  recommended: boolean;
  locked: boolean;
  onOpenSession: () => void;
}) {
  const actionIcon: keyof typeof Ionicons.glyphMap = locked
    ? "lock-closed"
    : completed
      ? "checkmark"
      : recommended
        ? "sparkles"
        : "play";
  const actionBackground = locked
    ? colors.secondaryContainer
    : completed
      ? colors.success
      : colors.primary;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.86}
      onPress={onOpenSession}
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
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.dayTitle}>
            {normalizeProgramText(day.title)}
          </Text>
          <Text style={styles.dayMeta}>
            {day.exercises.length} hareket - {day.exercises.reduce((sum, item) => sum + item.sets, 0)} set - {day.durationMin} dk
          </Text>
          {recommended && !completed && !locked ? (
            <Text style={styles.dayRecommendation}>Sıradaki antrenman</Text>
          ) : null}
        </View>
        <View style={[styles.dayAction, { backgroundColor: actionBackground }]}>
          <Ionicons
            name={actionIcon}
            size={15}
            color={locked ? colors.onSurface : colors.onPrimary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function WeekTabs({
  weeks,
  activeIndex,
  completedDayIds,
  onSelect,
}: {
  weeks: ProgramWeek[];
  activeIndex: number;
  completedDayIds: string[];
  onSelect: (index: number) => void;
}) {
  const { t } = useAppLocalization();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekTabsContent}>
      {weeks.map((week, index) => {
        const active = index === activeIndex;
        const weekDone = week.days.every((day) => completedDayIds.includes(day.id));
        return (
          <TouchableOpacity
            key={week.id}
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
              {t("ai_program.detail_week_label").replace("{count}", String(index + 1))}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaPillText}>{label}</Text>
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
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    backgroundColor: colors.overlay,
    borderBottomColor: colors.outlineVariant,
    borderBottomWidth: 1,
  },
  topBarInner: {
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
  topBarTitle: { ...typography.headlineMd, color: colors.onSurface },
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
  programTitle: { ...typography.headlineMd, color: colors.onSurface, minWidth: 0 },
  programBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaPill: {
    minHeight: 32,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  metaPillText: { ...typography.bodyXs, color: colors.onSurface },
  heroBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  heroBodyCopy: { flex: 1, gap: 10 },
  progressLabel: { ...typography.labelMd, color: colors.onSurface },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: { ...typography.buttonLg, color: colors.onPrimary },
  sectionCard: { padding: spacing.cardPadding, gap: spacing.sm },
  sectionBody: { ...typography.bodySm, color: colors.onSurfaceVariant, lineHeight: 20, flex: 1 },
  weekHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
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
  dayTitle: { ...typography.cardTitle, color: colors.onSurface, lineHeight: 22 },
  dayMeta: { ...typography.bodySm, color: colors.onSurface, lineHeight: 18 },
  dayRecommendation: { ...typography.labelMd, color: colors.primary, fontSize: 12 },
  dayAction: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedWeeksCard: {
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lockedIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedCopy: { flex: 1, gap: 3 },
  lockedTitle: { ...typography.labelMd, color: colors.onSurface },
  lockedBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  emptyCard: { padding: 24, gap: 10, alignItems: "center" },
  emptyTitle: { ...typography.headlineMd, color: colors.onSurface },
  emptyBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
}));
