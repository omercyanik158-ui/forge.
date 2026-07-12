import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter, useScrollToTop } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { GlassCard } from "@/components/GlassCard";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { TopBar } from "@/components/TopBar";
import { useAuth } from "@/providers/auth-context";
import { useAppLocalization } from "@/providers/localization-context";
import { ACHIEVEMENT_DEFS, getStreakCount } from "@/services/achievementStore";
import { goalProgress } from "@/services/calculations";
import {
  formatHeightValue,
  formatWeightValue,
  weightUnitLabel,
} from "@/services/localization";
import { getPremiumMarketSnapshot } from "@/services/market";
import { loadNutritionSummary } from "@/services/mealInsights";
import { loadProfile } from "@/services/profileStore";
import { restorePremiumPurchases } from "@/services/purchaseService";
import { isPremium } from "@/services/subscription";
import { formatPersonName } from "@/services/textUtils";
import { weeklyWorkoutSummary } from "@/services/workoutStore";
import {
  colors,
  createDynamicStyles,
  layout,
  radius,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { GoalType, UserProfile } from "@/types";

type StatItem = { value: string; label: string; color: string };
type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sub: string;
  color: string;
  tint: string;
  onPress?: () => void;
};
type SettingGroup = { title: string; items: SettingItem[] };
type WeeklySnapshot = { workouts: number; minutes: number; meals: number };

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();
  const { t, resolved } = useAppLocalization();
  const { guestAccess, session, signOut, sync, syncNow } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [snapshot, setSnapshot] = useState<WeeklySnapshot>({
    workouts: 0,
    minutes: 0,
    meals: 0,
  });

  const refresh = useCallback(async () => {
    const [loadedProfile, workouts, nutritionSummary] = await Promise.all([
      loadProfile(),
      weeklyWorkoutSummary(),
      loadNutritionSummary(),
    ]);
    setProfile(loadedProfile);
    setSnapshot({
      workouts: workouts.count,
      minutes: workouts.minutes,
      meals: nutritionSummary.weekly.mealCount,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
      refresh();
    }, [refresh]),
  );

  const goalProgressPct = profile ? (goalProgress(profile)?.pct ?? null) : null;
  const premium = isPremium(profile);
  const premiumOffer = getPremiumMarketSnapshot(resolved);

  const stats: StatItem[] = profile
    ? [
        {
          value: `${formatWeightValue(profile.weightKg)} ${weightUnitLabel(resolved)}`,
          label: t("profile.stat_weight"),
          color: colors.primary,
        },
        {
          value:
            profile.bodyFatPct != null
              ? `%${profile.bodyFatPct}`
              : t("profile.stat_none"),
          label: t("profile.stat_bodyfat"),
          color: colors.success,
        },
        {
          value: `${formatHeightValue(profile.heightCm)} ${resolved.measurementSystem === "imperial" ? "in" : "cm"}`,
          label: t("profile.stat_height"),
          color: colors.tertiary,
        },
        {
          value:
            goalProgressPct != null
              ? `%${goalProgressPct}`
              : profile.goalType === "gain"
                ? t("profile.stat_muscle_gain")
                : profile.goalType === "loss"
                  ? t("profile.stat_fat_loss")
                  : profile.goalType === "maintain"
                    ? t("profile.stat_maintain")
                    : t("profile.stat_none"),
          label:
            goalProgressPct != null
              ? t("profile.stat_goal_progress")
              : t("profile.stat_active_goal"),
          color: colors.primary,
        },
      ]
    : [];

  const goalLabel: Record<GoalType, string> = {
    gain: t("profile.goal_muscle_gain"),
    loss: t("profile.goal_fat_loss"),
    maintain: t("profile.goal_maintain"),
  };

  const goalSub = profile?.goalType
    ? profile.targetWeightKg != null
      ? `${goalLabel[profile.goalType]} (${formatWeightValue(profile.targetWeightKg)} ${weightUnitLabel(resolved)})`
      : goalLabel[profile.goalType]
    : t("profile.set_goal");

  const unlockedCount = profile?.achievements?.length ?? 0;
  const totalAchievements = ACHIEVEMENT_DEFS.length;
  const streakCount = getStreakCount(profile?.streak);

  const groups: SettingGroup[] = [
    {
      title: t("profile.group_personal"),
      items: [
        {
          icon: "sparkles",
          title: t("coach.screen_title"),
          sub: t("coach.home_body"),
          color: colors.tertiary,
          tint: `${colors.tertiary}29`,
          onPress: () => router.push("/personal-coach"),
        },
        {
          icon: "person-circle",
          title: t("profile.account_details"),
          sub: t("profile.account_sub"),
          color: colors.primary,
          tint: `${colors.primary}24`,
          onPress: () => router.push("/onboarding?edit=account"),
        },
        {
          icon: "barbell",
          title: t("profile.body_measurements"),
          sub: t("profile.body_sub"),
          color: colors.tertiary,
          tint: `${colors.tertiary}29`,
          onPress: () => router.push("/onboarding?edit=body"),
        },
        ...(profile?.gender === "female"
          ? [
              {
                icon: "moon",
                title: t("profile.cycle_tracking"),
                sub: t("profile.cycle_tracking_sub"),
                color: colors.secondary,
                tint: `${colors.secondary}24`,
                onPress: () => router.push("/cycle-tracking"),
              } satisfies SettingItem,
            ]
          : []),
      ],
    },
    {
      title: t("profile.group_goals"),
      items: [
        {
          icon: "flag",
          title: t("profile.active_goals"),
          sub: goalSub,
          color: colors.success,
          tint: `${colors.success}29`,
          onPress: () => router.push("/goals"),
        },
        {
          icon: "trophy",
          title: t("profile.achievements"),
          sub: t({
            tr: `${unlockedCount}/${totalAchievements} rozet · ${streakCount} gün seri`,
            en: `${unlockedCount}/${totalAchievements} badges · ${streakCount} day streak`,
          }),
          color: colors.tertiary,
          tint: `${colors.tertiary}29`,
          onPress: () => router.push("/achievements"),
        },
      ],
    },
    {
      title: t("profile.group_settings"),
      items: [
        {
          icon: "color-palette",
          title: t("profile.appearance"),
          sub: t("profile.appearance_sub"),
          color: colors.primary,
          tint: `${colors.primary}24`,
          onPress: () => router.push("/settings-appearance"),
        },
        {
          icon: "notifications",
          title: t("profile.notifications"),
          sub: t("profile.notifications_sub"),
          color: colors.success,
          tint: `${colors.success}29`,
          onPress: () => router.push("/settings-notifications"),
        },
        {
          icon: "shield-checkmark",
          title: t("profile.privacy_security"),
          sub: t("profile.privacy_sub"),
          color: colors.tertiary,
          tint: `${colors.tertiary}29`,
          onPress: () => router.push("/settings-privacy"),
        },
        {
          icon: "globe-outline",
          title: t("profile.region_pricing"),
          sub: `${(resolved.regionCode ?? premiumOffer.market).toUpperCase()} · ${premiumOffer.currencyCode}`,
          color: themeColors.secondary,
          tint: `${themeColors.secondary}24`,
          onPress: () => router.push("/settings-language"),
        },
      ],
    },
  ];

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <TopBar />
      <ScrollView
        ref={scrollRef}
        style={[styles.scroll, { backgroundColor: themeColors.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.screenHeaderOffset,
            paddingBottom: spacing.tabContentBottom,
          },
        ]}
        alwaysBounceVertical
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader
          name={profile?.name}
          premium={premium}
          freeLabel={t("profile.free_plan")}
        />
        <AccountSyncCard
          signedIn={Boolean(session?.user)}
          guestAccess={guestAccess}
          email={session?.user?.email ?? null}
          syncing={sync.status === "syncing"}
          syncError={sync.status === "error" ? sync.errorMessage : undefined}
          lastSyncAt={sync.lastSuccessfulAt}
          onSync={() => void syncNow()}
          onRestore={async () => {
            const result = await restorePremiumPurchases();
            Alert.alert(t("profile.account_restore"), result.message || t("profile.account_restore_done"));
            await refresh();
          }}
          onSignOut={async () => {
            await signOut();
            Alert.alert(t("profile.account_sign_out"), t("profile.account_signed_out"));
            router.replace("/welcome");
          }}
          onUpgradeAccount={() => router.push("/welcome")}
        />
        <StatsGrid stats={stats} />
        <WeeklySnapshotCard
          streak={streakCount}
          workouts={snapshot.workouts}
          minutes={snapshot.minutes}
          meals={snapshot.meals}
        />
        {!premium ? (
          <UpgradeCard onPress={() => router.push("/premium")} />
        ) : null}
        {premium ? (
          <PremiumFeatureCard
            title={t("premium.status_active")}
            body={t("profile.premium_body")}
            note={premiumOffer.valueComparison}
            ctaLabel={t("profile.view_details")}
            onPress={() => router.push("/premium")}
          />
        ) : null}
        {groups.map((group) => (
          <SettingSection key={group.title} group={group} />
        ))}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            session?.user ? t("profile.account_sign_out") : t("profile.account_add")
          }
          style={[
            styles.accountFooterButton,
            {
              borderColor: session?.user ? `${colors.error}20` : `${colors.primary}24`,
              backgroundColor: session?.user ? `${colors.error}08` : `${colors.primary}0F`,
            },
          ]}
          activeOpacity={0.7}
          onPress={async () => {
            if (session?.user) {
              await signOut();
            }
            router.replace("/welcome");
          }}
        >
          <Ionicons
            name={session?.user ? "log-out-outline" : "person-add-outline"}
            size={20}
            color={session?.user ? colors.error : colors.primary}
          />
          <Text
            style={[
              typography.labelMd,
              { color: session?.user ? colors.error : colors.primary },
            ]}
          >
            {session?.user ? t("profile.account_sign_out") : t("profile.account_add")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function AccountSyncCard({
  signedIn,
  guestAccess,
  email,
  syncing,
  syncError,
  lastSyncAt,
  onSync,
  onRestore,
  onSignOut,
  onUpgradeAccount,
}: {
  signedIn: boolean;
  guestAccess: boolean;
  email: string | null;
  syncing: boolean;
  syncError?: string;
  lastSyncAt?: string;
  onSync: () => void;
  onRestore: () => void;
  onSignOut: () => void;
  onUpgradeAccount: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <GlassCard variant="panel" style={styles.accountCard}>
      <View style={styles.accountHeader}>
        <View style={[styles.accountBadge, { backgroundColor: colors.secondaryContainer }]}>
          <Ionicons name="cloud-upload-outline" size={18} color={colors.secondary} />
        </View>
        <View style={styles.accountCopy}>
          <Text style={[styles.accountTitle, { color: colors.onSurface }]}>
            {signedIn ? t("profile.account_signed_in") : t("profile.account_guest_title")}
          </Text>
          <Text style={[styles.accountBody, { color: colors.onSurfaceVariant }]}>
            {signedIn
              ? email ?? t("profile.account_signed_in_body")
              : guestAccess
                ? t("profile.account_guest_body")
                : t("profile.account_sync_sub")}
          </Text>
        </View>
      </View>

      <Text style={[styles.accountMeta, { color: syncError ? colors.error : colors.onSurfaceVariant }]}>
        {syncing
          ? t("profile.account_syncing")
          : syncError
            ? `${t("profile.account_sync_error")}: ${syncError}`
            : `${t("profile.account_last_sync")}: ${lastSyncAt ?? t("profile.account_never_synced")}`}
      </Text>

      <View style={styles.accountActions}>
        {signedIn ? (
          <>
            <Button
              label={t("profile.account_sync_now")}
              onPress={onSync}
              loading={syncing}
              icon="sync"
            />
            <Button
              label={t("profile.account_restore")}
              onPress={onRestore}
              variant="secondary"
              icon="refresh"
            />
            <Button
              label={t("profile.account_sign_out")}
              onPress={onSignOut}
              variant="tertiary"
              icon="log-out-outline"
            />
          </>
        ) : (
          <Button
            label={t("profile.account_add")}
            onPress={onUpgradeAccount}
            icon="cloud-upload-outline"
          />
        )}
      </View>
    </GlassCard>
  );
}

function ProfileHeader({
  name,
  premium,
  freeLabel,
}: {
  name?: string;
  premium: boolean;
  freeLabel: string;
}) {
  return (
    <GlassCard style={styles.profileHero}>
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarBorder}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={36} color={colors.onSurface} />
            </View>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={15} color={colors.onSuccess} />
          </View>
        </View>
        <View style={styles.headerInfo}>
          <Text
            style={[
              typography.headlineLgMobile,
              styles.headerName,
              { color: colors.onSurface },
            ]}
          >
            {formatPersonName(name) || "Sporcu"}
          </Text>
          <View style={styles.headerBadges}>
            {premium ? (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color={colors.secondary} />
                <Text style={[typography.labelMd, { color: colors.secondary }]}>
                  Premium
                </Text>
              </View>
            ) : (
              <View style={styles.freeBadge}>
                <Text
                  style={[
                    typography.labelMd,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {freeLabel}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </GlassCard>
  );
}

function WeeklySnapshotCard({
  streak,
  workouts,
  minutes,
  meals,
}: WeeklySnapshot & { streak: number }) {
  const { t } = useAppLocalization();

  return (
    <GlassCard variant="panel" style={styles.snapshotCard}>
      <Text style={styles.snapshotTitle}>{t("profile.week_title")}</Text>
      <View style={styles.snapshotGrid}>
        <MiniStat
          label={t("profile.week_streak")}
          value={t({ tr: `${streak} gün`, en: `${streak} days` })}
          accent={colors.tertiary}
        />
        <MiniStat
          label={t("profile.week_workouts")}
          value={t({ tr: `${workouts} seans`, en: `${workouts} sessions` })}
          accent={colors.success}
        />
        <MiniStat
          label={t("profile.week_time")}
          value={t({ tr: `${minutes} dk`, en: `${minutes} min` })}
          accent={colors.primary}
        />
        <MiniStat
          label={t("profile.week_meals")}
          value={`${meals}`}
          accent={colors.primaryContainer}
        />
      </View>
    </GlassCard>
  );
}

function MiniStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={styles.snapshotItem}>
      <Text style={[styles.snapshotItemLabel, { color: accent }]}>{label}</Text>
      <Text style={styles.snapshotItemValue}>{value}</Text>
    </View>
  );
}

function UpgradeCard({ onPress }: { onPress: () => void }) {
  const premiumOffer = getPremiumMarketSnapshot();
  const { t } = useAppLocalization();

  return (
    <GlassCard style={styles.upgradeCard}>
      <View style={styles.upgradeContent}>
        <Ionicons name="rocket" size={28} color={colors.secondary} />
        <View style={styles.upgradeCopy}>
          <Text
            numberOfLines={1}
            style={[typography.cardTitle, { color: colors.onSurface }]}
          >
            {t("profile.upgrade_title")}
          </Text>
          <Text
            numberOfLines={2}
            style={[
              typography.bodyXs,
              { color: colors.onSurfaceVariant, marginTop: 2 },
            ]}
          >
            {premiumOffer.annual.badge} · {premiumOffer.annual.sublabel}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.upgradeBtn}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text
          numberOfLines={1}
          style={[typography.labelMd, { color: colors.onPrimary }]}
        >
          {t("profile.upgrade_view")}
        </Text>
      </TouchableOpacity>
    </GlassCard>
  );
}

function StatsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <View style={styles.statsGrid}>
      {stats.map((stat) => (
        <GlassCard variant="panel" key={stat.label} style={styles.statCard}>
          <Text style={[typography.numericLg, { color: stat.color }]}>
            {stat.value}
          </Text>
          <Text
            style={[typography.labelXs, { color: colors.onSurfaceVariant }]}
          >
            {stat.label.toUpperCase()}
          </Text>
        </GlassCard>
      ))}
    </View>
  );
}

function SettingSection({ group }: { group: SettingGroup }) {
  return (
    <View style={styles.section}>
      <Text
        style={[
          typography.sectionTitle,
          {
            color: colors.onSurface,
            marginBottom: spacing.md,
            paddingHorizontal: spacing.xs,
          },
        ]}
      >
        {group.title}
      </Text>
      <GlassCard variant="panel" style={styles.sectionCard}>
        {group.items.map((item, index) => (
          <SettingRow
            key={item.title}
            item={item}
            isLast={index === group.items.length - 1}
          />
        ))}
      </GlassCard>
    </View>
  );
}

function SettingRow({ item, isLast }: { item: SettingItem; isLast: boolean }) {
  const { colors: themeColors } = useAppTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${item.sub}`}
      style={[styles.settingRow, !isLast && styles.settingBorder]}
      activeOpacity={0.7}
      onPress={item.onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.settingIconBox, { backgroundColor: item.tint }]}>
          <Ionicons name={item.icon} size={20} color={item.color} />
        </View>
        <View style={styles.settingCopy}>
          <Text style={[typography.labelMd, { color: themeColors.onSurface }]}>
            {item.title}
          </Text>
          <Text
            style={[typography.bodyXs, { color: themeColors.onSurfaceVariant }]}
          >
            {item.sub}
          </Text>
        </View>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={`${themeColors.onSurfaceVariant}66`}
      />
    </TouchableOpacity>
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
    gap: spacing.sectionGap,
  },
  profileHero: { padding: spacing.cardPadding },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.mdPlus,
    paddingHorizontal: 2,
  },
  avatarWrapper: { position: "relative" },
  avatarBorder: {
    padding: 4,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 1,
    right: 1,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: { flex: 1, alignItems: "flex-start", gap: spacing.xs },
  headerName: { ...typography.headlineLgMobile },
  headerBadges: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.secondary}1A`,
    borderWidth: 1,
    borderColor: `${colors.secondary}33`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  freeBadge: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  statCard: {
    flexBasis: "47%",
    flexGrow: 1,
    padding: spacing.smPlus,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs - 2,
    minHeight: 84,
  },
  snapshotCard: { padding: spacing.lg, gap: spacing.md },
  accountCard: { padding: spacing.lg, gap: spacing.md },
  accountHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  accountBadge: {
    width: 42,
    height: 42,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  accountCopy: { flex: 1, gap: spacing.xs },
  accountTitle: { ...typography.cardTitle },
  accountBody: { ...typography.bodySm, lineHeight: 20 },
  accountMeta: { ...typography.bodyXs, lineHeight: 18 },
  accountActions: { gap: spacing.sm },
  snapshotTitle: { ...typography.sectionTitle, color: colors.onSurface },
  snapshotGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  snapshotItem: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 72,
    padding: spacing.smPlus,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainer,
    justifyContent: "space-between",
  },
  snapshotItemLabel: { ...typography.bodyXs },
  snapshotItemValue: { ...typography.cardTitle, color: colors.onSurface },
  upgradeCard: {
    padding: spacing.cardPadding,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.smPlus,
  },
  upgradeContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  upgradeCopy: { flex: 1, minWidth: 0 },
  upgradeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.xl,
    minWidth: 84,
    flexShrink: 0,
    alignItems: "center",
  },
  section: { gap: 2 },
  sectionCard: { overflow: "hidden" },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.cardPadding,
  },
  settingBorder: {
    borderBottomColor: `${colors.outlineVariant}66`,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  settingIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  settingCopy: { flex: 1, gap: 2 },
  accountFooterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    alignSelf: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.smPlus,
    borderRadius: radius["2xl"],
    marginTop: -4,
    borderWidth: 1,
    borderColor: `${colors.error}20`,
    backgroundColor: `${colors.error}08`,
  },
}));
