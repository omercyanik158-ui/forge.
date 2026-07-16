import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_DEFS,
  getAchievementCategoryLabel,
  getAchievementCopy,
  getStreakCount,
  getUnlockedSet,
  loadAchievementProgress,
  refreshAchievements,
  type AchievementProgress,
} from "@/services/achievementStore";
import { loadProfile } from "@/services/profileStore";
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
import { useAppLocalization } from "@/providers/localization-context";

export default function AchievementsScreen() {
  useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useAppLocalization();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<Record<string, AchievementProgress>>(
    {},
  );

  const refresh = useCallback(async () => {
    const loaded = await loadProfile();
    if (!loaded) return;
    const updated = await refreshAchievements(loaded);
    setProfile(updated);
    setProgress(await loadAchievementProgress(updated));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const unlocked = getUnlockedSet(profile);
  const unlockedCount = ACHIEVEMENT_DEFS.filter((definition) =>
    unlocked.has(definition.id),
  ).length;
  const completionPct = Math.round(
    (unlockedCount / ACHIEVEMENT_DEFS.length) * 100,
  );
  const nextAchievement = useMemo(
    () =>
      ACHIEVEMENT_DEFS.filter(
        (definition) => !unlocked.has(definition.id),
      ).sort(
        (a, b) => (progress[b.id]?.pct ?? 0) - (progress[a.id]?.pct ?? 0),
      )[0],
    [progress, unlocked],
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title={t("migrated.achievements_001")} />

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
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View
              style={[
                styles.heroIcon,
                { backgroundColor: `${colors.tertiary}20` },
              ]}
            >
              <Ionicons name="trophy" size={30} color={colors.tertiary} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>
                {t("migrated.achievements_002")}
              </Text>
              <Text style={styles.heroTitle}>
                {unlockedCount} / {ACHIEVEMENT_DEFS.length}{" "}
                {t("migrated.achievements_003")}
              </Text>
            </View>
            <View
              style={[
                styles.percentBadge,
                { backgroundColor: colors.successContainer },
              ]}
            >
              <Text style={[styles.percentText, { color: colors.success }]}>
                %{completionPct}
              </Text>
            </View>
          </View>
          <View style={styles.completionBar}>
            <View
              style={[styles.completionFill, { width: `${completionPct}%` }]}
            />
          </View>
          <View style={styles.heroStats}>
            <HeroStat
              icon="flame"
              value={`${getStreakCount(profile?.streak)} ${t("migrated.achievements_004")}`}
              label={t("migrated.achievements_005")}
              color={colors.tertiary}
            />
            <HeroStat
              icon="ribbon"
              value={`${unlockedCount}`}
              label={t("migrated.achievements_006")}
              color={colors.success}
            />
            <HeroStat
              icon="lock-closed"
              value={`${ACHIEVEMENT_DEFS.length - unlockedCount}`}
              label={t("migrated.achievements_007")}
              color={colors.secondary}
            />
          </View>
        </GlassCard>

        {nextAchievement ? (
          <GlassCard variant="panel" style={styles.nextCard}>
            <View
              style={[
                styles.nextIcon,
                { backgroundColor: `${colors.primary}18` },
              ]}
            >
              <Ionicons
                name={nextAchievement.icon as keyof typeof Ionicons.glyphMap}
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.nextCopy}>
              <Text style={styles.nextEyebrow}>
                {t("migrated.achievements_008")}
              </Text>
              <Text style={styles.nextTitle}>
                {getAchievementCopy(nextAchievement).title}
              </Text>
              <Text style={styles.nextBody}>
                {progress[nextAchievement.id]?.current ?? 0}/
                {nextAchievement.target} ·{" "}
                {getAchievementCopy(nextAchievement).description}
              </Text>
            </View>
          </GlassCard>
        ) : null}

        {ACHIEVEMENT_CATEGORIES.map((category) => {
          const definitions = ACHIEVEMENT_DEFS.filter(
            (definition) => definition.category === category,
          );
          const categoryUnlocked = definitions.filter((definition) =>
            unlocked.has(definition.id),
          ).length;
          return (
            <View key={category} style={styles.categoryBlock}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>
                  {getAchievementCategoryLabel(category)}
                </Text>
                <Text style={styles.categoryCount}>
                  {categoryUnlocked}/{definitions.length}
                </Text>
              </View>
              <View style={styles.badgeGrid}>
                {definitions.map((definition) => {
                  const isUnlocked = unlocked.has(definition.id);
                  const itemProgress = progress[definition.id] ?? {
                    current: 0,
                    target: definition.target,
                    pct: 0,
                  };
                  return (
                    <GlassCard
                      key={definition.id}
                      variant="panel"
                      style={[
                        styles.badgeCard,
                        !isUnlocked && styles.badgeLocked,
                      ]}
                    >
                      <View
                        style={[
                          styles.badgeIcon,
                          {
                            backgroundColor: isUnlocked
                              ? `${colors.success}20`
                              : colors.surfaceContainer,
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            isUnlocked
                              ? (definition.icon as keyof typeof Ionicons.glyphMap)
                              : "lock-closed"
                          }
                          size={27}
                          color={isUnlocked ? colors.success : colors.outline}
                        />
                      </View>
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.badgeTitle,
                          {
                            color: isUnlocked
                              ? colors.onSurface
                              : colors.onSurfaceVariant,
                          },
                        ]}
                      >
                        {getAchievementCopy(definition).title}
                      </Text>
                      <Text
                        numberOfLines={3}
                        style={[
                          styles.badgeBody,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {getAchievementCopy(definition).description}
                      </Text>
                      <View style={styles.badgeProgressRow}>
                        <View
                          style={[
                            styles.badgeProgressRail,
                            { backgroundColor: colors.surfaceContainerHigh },
                          ]}
                        >
                          <View
                            style={[
                              styles.badgeProgressFill,
                              {
                                width: `${itemProgress.pct}%`,
                                backgroundColor: isUnlocked
                                  ? colors.success
                                  : colors.primary,
                              },
                            ]}
                          />
                        </View>
                        <Text
                          style={[
                            styles.badgeProgressText,
                            {
                              color: isUnlocked
                                ? colors.success
                                : colors.outline,
                            },
                          ]}
                        >
                          {isUnlocked
                            ? t("migrated.achievements_009")
                            : `${itemProgress.current}/${itemProgress.target}`}
                        </Text>
                      </View>
                    </GlassCard>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function HeroStat({
  icon,
  value,
  label,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View style={styles.heroStat}>
      <Ionicons name={icon} size={17} color={color} />
      <Text style={[styles.heroStatValue, { color: colors.onSurface }]}>
        {value}
      </Text>
      <Text style={[styles.heroStatLabel, { color: colors.onSurfaceVariant }]}>
        {label}
      </Text>
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
  heroCard: { padding: spacing.xl, gap: spacing.md },
  heroTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: { flex: 1, gap: 3 },
  heroEyebrow: { ...typography.labelCaps, color: colors.secondary },
  heroTitle: {
    ...typography.screenTitle,
    color: colors.onSurface,
  },
  percentBadge: {
    minWidth: 52,
    height: 38,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: { ...typography.labelMd, fontVariant: ["tabular-nums"] },
  completionBar: {
    height: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  completionFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: radius.full,
  },
  heroStats: { flexDirection: "row", gap: 8 },
  heroStat: {
    flex: 1,
    minHeight: 78,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  heroStatValue: { ...typography.labelMd },
  heroStatLabel: { ...typography.bodyXs },
  nextCard: {
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  nextIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  nextCopy: { flex: 1, gap: 2 },
  nextEyebrow: { ...typography.labelCaps, color: colors.primary },
  nextTitle: { ...typography.cardTitle, color: colors.onSurface },
  nextBody: { ...typography.bodySm, color: colors.onSurfaceVariant },
  categoryBlock: { gap: 12 },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  categoryTitle: { ...typography.sectionTitle, color: colors.onSurface },
  categoryCount: { ...typography.labelMd, color: colors.primary },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  badgeCard: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 210,
    padding: spacing.smPlus,
    gap: 8,
  },
  badgeLocked: { opacity: 0.86 },
  badgeIcon: {
    width: 50,
    height: 50,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitle: { ...typography.labelMd, lineHeight: 19 },
  badgeBody: { ...typography.bodyXs, lineHeight: 16, flex: 1 },
  badgeProgressRow: { gap: 5 },
  badgeProgressRail: {
    height: 5,
    borderRadius: radius.full,
    overflow: "hidden",
  },
  badgeProgressFill: { height: "100%", borderRadius: radius.full },
  badgeProgressText: {
    ...typography.labelXs,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
}));
