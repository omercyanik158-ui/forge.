import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { HydrationBottle } from "@/components/HydrationBottle";
import { MacroBar } from "@/components/MacroBar";
import { loadProfile } from "@/services/profileStore";
import {
  addWater,
  applyWeightBasedWaterGoal,
  calculateDailyWaterGoalMl,
  loadWaterForWeight,
  loadWaterHistory,
  resetWater,
  setWaterGoal,
} from "@/services/waterStore";
import {
  formatDate,
  formatLiquidValue,
  formatMessage,
  formatWeightValue,
  liquidUnitLabel,
  weightUnitLabel,
} from "@/services/localization";
import {
  colors,
  createDynamicStyles,
  layout,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { WaterLog } from "@/types";

const GOAL_OPTIONS = [2000, 2500, 3000, 3500, 4000];

export default function WaterTrackingScreen() {
  const { colors: themeColors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ date?: string }>();
  const selectedDate = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? "")
    ? params.date!
    : undefined;
  const endDate = useMemo(
    () => (selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date()),
    [selectedDate],
  );
  const [today, setToday] = useState<WaterLog | null>(null);
  const [history, setHistory] = useState<WaterLog[]>([]);
  const [weightKg, setWeightKg] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const profile = await loadProfile();
    const current = await loadWaterForWeight(profile?.weightKg, selectedDate);
    const recent = await loadWaterHistory(7, endDate);
    setWeightKg(profile?.weightKg);
    setToday(current);
    setHistory(recent);
    setLoading(false);
  }, [endDate, selectedDate]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const averageMl = useMemo(() => {
    if (history.length === 0) return 0;
    return Math.round(
      history.reduce((sum, entry) => sum + entry.ml, 0) / history.length,
    );
  }, [history]);

  const completedDays = history.filter(
    (entry) => entry.ml >= entry.goalMl,
  ).length;
  const progress =
    today && today.goalMl > 0
      ? Math.min((today.ml / today.goalMl) * 100, 100)
      : 0;

  const changeWater = async (amountMl: number) => {
    const next = await addWater(amountMl, selectedDate);
    setToday(next);
    setHistory(await loadWaterHistory(7, endDate));
  };

  const changeGoal = async (goalMl: number) => {
    const next = await setWaterGoal(goalMl, selectedDate);
    setToday(next);
    setHistory(await loadWaterHistory(7, endDate));
  };

  const useRecommendedGoal = async () => {
    const next = await applyWeightBasedWaterGoal(weightKg, selectedDate);
    setToday(next);
    setHistory(await loadWaterHistory(7, endDate));
  };

  const confirmResetWater = () => {
    if (!today || today.ml === 0) return;
    const liquidUnit = liquidUnitLabel();
    Alert.alert(
      formatMessage({ tr: "Su kaydını sıfırla", en: "Reset water log" }),
      `${selectedDate ? formatSelectedDate(selectedDate) : formatMessage({ tr: "Bugün", en: "Today" })} için kaydedilen ${formatLiquidValue(today.ml)} ${liquidUnit} ${formatMessage({ tr: "sıfırlanacak. Günlük hedefin korunur.", en: "will be reset. Your daily goal stays the same." })}`,
      [
        {
          text: formatMessage({ tr: "Vazgeç", en: "Cancel" }),
          style: "cancel",
        },
        {
          text: formatMessage({ tr: "Sıfırla", en: "Reset" }),
          style: "destructive",
          onPress: async () => {
            const next = await resetWater(selectedDate);
            setToday(next);
            setHistory(await loadWaterHistory(7, endDate));
          },
        },
      ],
    );
  };

  const recommendedGoalMl = calculateDailyWaterGoalMl(weightKg);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScreenHeader title="Su takibi" />

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + spacing.screenHeaderOffset,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading || !today ? (
          <View style={styles.loading}>
            <ActivityIndicator color={themeColors.tertiary} />
          </View>
        ) : (
          <>
            <GlassCard
              style={[
                styles.heroCard,
                {
                  backgroundColor: themeColors.surfaceContainerLow,
                  borderColor: themeColors.outlineVariant,
                },
              ]}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.heroGlow,
                  { backgroundColor: `${themeColors.tertiary}20` },
                ]}
              />
              <View style={styles.heroContent}>
                <View style={styles.heroHeader}>
                  <View style={styles.heroCopy}>
                    <Text
                      style={[
                        styles.heroLabel,
                        { color: themeColors.tertiary },
                      ]}
                    >
                      {selectedDate
                        ? formatSelectedDate(selectedDate).toUpperCase()
                        : formatMessage({ tr: "BUGÜN", en: "TODAY" })}
                    </Text>
                    <Text
                      style={[
                        styles.heroValue,
                        { color: themeColors.onSurface },
                      ]}
                    >
                      {formatLiquidValue(today.ml)} {liquidUnitLabel()}
                    </Text>
                    <Text
                      style={[
                        styles.heroSub,
                        { color: themeColors.onSurface },
                      ]}
                    >
                      {formatMessage({ tr: "Hedef", en: "Goal" })}{" "}
                      {formatLiquidValue(today.goalMl)} {liquidUnitLabel()}
                    </Text>
                    <Text
                      style={[
                        styles.heroPercent,
                        { color: themeColors.secondary },
                      ]}
                    >
                      %{Math.round(progress)}{" "}
                      {formatMessage({ tr: "tamamlandı", en: "complete" })}
                    </Text>
                  </View>
                  <HydrationBottle progress={progress} size={94} />
                </View>
                <MacroBar
                  progress={progress}
                  color={themeColors.secondary}
                  glowColor={`${themeColors.secondary}4D`}
                  height={10}
                />
                <View style={styles.actionRow}>
                  <WaterAction
                    label={formatMessage({ tr: "Geri al", en: "Undo" })}
                    icon="remove"
                    disabled={today.ml === 0}
                    onPress={() => changeWater(-250)}
                  />
                  <WaterAction
                    label="+250 ml"
                    icon="add"
                    primary
                    onPress={() => changeWater(250)}
                  />
                </View>
                {today.ml > 0 ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={formatMessage({
                      tr: "Su kaydını sıfırla",
                      en: "Reset water log",
                    })}
                    onPress={confirmResetWater}
                    activeOpacity={0.76}
                    style={[
                      styles.resetButton,
                      {
                        borderColor: `${themeColors.error}38`,
                        backgroundColor: `${themeColors.error}08`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={16}
                      color={themeColors.error}
                    />
                    <Text
                      style={[
                        styles.resetButtonText,
                        { color: themeColors.error },
                      ]}
                    >
                      {selectedDate
                        ? formatMessage({
                            tr: "Seçili günün suyunu sıfırla",
                            en: "Reset selected day",
                          })
                        : formatMessage({
                            tr: "Bugünün suyunu sıfırla",
                            en: "Reset today",
                          })}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </GlassCard>

            <GlassCard variant="panel" style={styles.card}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: themeColors.onSurface },
                    ]}
                  >
                    {formatMessage({ tr: "Günlük hedef", en: "Daily goal" })}
                  </Text>
                  <Text
                    style={[
                      styles.sectionBody,
                      { color: themeColors.onSurfaceVariant },
                    ]}
                  >
                    {weightKg
                      ? `${formatWeightValue(weightKg)} ${weightUnitLabel()} × 33 ml = ${formatLiquidValue(recommendedGoalMl)} ${liquidUnitLabel()} ${formatMessage({ tr: "önerilen", en: "recommended" })}`
                      : formatMessage({
                          tr: "Profil kilona göre otomatik hesaplanır.",
                          en: "Calculated automatically from your profile weight.",
                        })}
                  </Text>
                </View>
                <Ionicons
                  name="flag-outline"
                  size={20}
                  color={themeColors.primary}
                />
              </View>
              <View style={styles.goalOptions}>
                {GOAL_OPTIONS.map((goal) => {
                  const selected = goal === today.goalMl;
                  return (
                    <TouchableOpacity
                      key={goal}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => changeGoal(goal)}
                      activeOpacity={0.8}
                      style={[
                        styles.goalChip,
                        {
                          backgroundColor: selected
                            ? themeColors.primary
                            : themeColors.surfaceContainerLow,
                          borderColor: selected
                            ? themeColors.primary
                            : themeColors.outlineVariant,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.goalText,
                          {
                            color: selected
                              ? themeColors.onPrimary
                              : themeColors.onSurface,
                          },
                        ]}
                      >
                        {formatLiquidValue(goal)} {liquidUnitLabel()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {today.goalMl !== recommendedGoalMl ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={useRecommendedGoal}
                  activeOpacity={0.8}
                  style={[
                    styles.recommendedButton,
                    {
                      backgroundColor: `${themeColors.secondary}14`,
                      borderColor: `${themeColors.secondary}40`,
                    },
                  ]}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={17}
                    color={themeColors.secondary}
                  />
                  <Text
                    style={[
                      styles.recommendedButtonText,
                      { color: themeColors.secondary },
                    ]}
                  >
                    {formatMessage({
                      tr: "Kilo bazlı",
                      en: "Use weight-based",
                    })}{" "}
                    {formatLiquidValue(recommendedGoalMl)} {liquidUnitLabel()}{" "}
                    {formatMessage({ tr: "hedefe dön", en: "goal" })}
                  </Text>
                </TouchableOpacity>
              ) : null}
              <Text style={[styles.goalNote, { color: themeColors.outline }]}>
                {formatMessage({
                  tr: "Bu değer temel bir tahmindir; yoğun egzersiz, sıcak hava ve kişisel sağlık koşulları ihtiyacı değiştirebilir.",
                  en: "This is a baseline estimate. Hard training, hot weather, and personal health factors can change your needs.",
                })}
              </Text>
            </GlassCard>

            <GlassCard variant="panel" style={styles.card}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: themeColors.onSurface },
                    ]}
                  >
                    {formatMessage({ tr: "Son 7 gün", en: "Last 7 days" })}
                  </Text>
                  <Text
                    style={[
                      styles.sectionBody,
                      { color: themeColors.onSurfaceVariant },
                    ]}
                  >
                    {formatMessage({ tr: "Ortalama", en: "Average" })}{" "}
                    {formatLiquidValue(averageMl)} {liquidUnitLabel()} ·{" "}
                    {completedDays}/7{" "}
                    {formatMessage({ tr: "hedef günü", en: "goal days" })}
                  </Text>
                </View>
                <Ionicons
                  name="stats-chart-outline"
                  size={20}
                  color={themeColors.tertiary}
                />
              </View>
              <View style={styles.historyList}>
                {history.map((entry) => {
                  const pct =
                    entry.goalMl > 0
                      ? Math.min((entry.ml / entry.goalMl) * 100, 100)
                      : 0;
                  return (
                    <View key={entry.date} style={styles.historyRow}>
                      <Text
                        style={[
                          styles.historyDate,
                          { color: themeColors.onSurface },
                        ]}
                      >
                        {formatDay(entry.date)}
                      </Text>
                      <View style={styles.historyTrack}>
                        <MacroBar
                          progress={pct}
                          color={themeColors.tertiary}
                          height={7}
                        />
                      </View>
                      <Text
                        style={[
                          styles.historyValue,
                          {
                            color:
                              entry.ml >= entry.goalMl
                                ? themeColors.success
                                : themeColors.onSurface,
                          },
                        ]}
                      >
                        {formatLiquidValue(entry.ml)} {liquidUnitLabel()}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function WaterAction({
  label,
  icon,
  primary,
  disabled,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  primary?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const { colors: themeColors } = useAppTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.78}
      style={[
        styles.actionButton,
        {
          opacity: disabled ? 0.4 : 1,
          backgroundColor: primary
            ? themeColors.tertiary
            : themeColors.surfaceContainerLowest,
          borderColor: primary
            ? themeColors.tertiary
            : themeColors.outlineVariant,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={primary ? themeColors.onTertiary : themeColors.onSurfaceVariant}
      />
      <Text
        style={[
          styles.actionText,
          { color: primary ? themeColors.onTertiary : themeColors.onSurface },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function formatDay(value: string): string {
  return formatDate(`${value}T12:00:00`, { weekday: "short", day: "numeric" });
}

function formatSelectedDate(value: string): string {
  return formatDate(`${value}T12:00:00`, { day: "numeric", month: "long" });
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    borderBottomWidth: 1,
  },
  topBarInner: {
    height: 68,
    paddingHorizontal: spacing.containerMargin,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle("sm"),
  },
  topBarTitle: { ...typography.screenTitle },
  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.gutter,
  },
  loading: { minHeight: 320, alignItems: "center", justifyContent: "center" },
  heroCard: { padding: spacing.lg, overflow: "hidden" },
  heroGlow: {
    position: "absolute",
    width: 168,
    height: 168,
    borderRadius: 84,
    top: -84,
    right: -40,
  },
  heroContent: { zIndex: 1, gap: spacing.lg },
  heroHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  heroCopy: { flex: 1, gap: 1 },
  heroLabel: { ...typography.labelCaps },
  heroValue: { ...typography.displayLgMobile, fontVariant: ["tabular-nums"] },
  heroSub: { ...typography.bodySm },
  heroPercent: {
    ...typography.labelMd,
    marginTop: 6,
    fontVariant: ["tabular-nums"],
  },
  actionRow: { flexDirection: "row", gap: 8 },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 7,
  },
  actionText: { ...typography.buttonSm },
  resetButton: {
    minHeight: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  resetButtonText: { ...typography.buttonSm },
  card: { padding: spacing.cardPadding, gap: spacing.md },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: { ...typography.cardTitle },
  sectionBody: { ...typography.bodySm, marginTop: 3 },
  goalOptions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goalChip: {
    minHeight: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  goalText: { ...typography.labelMd, fontVariant: ["tabular-nums"] },
  recommendedButton: {
    minHeight: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  recommendedButtonText: { ...typography.labelMd, textAlign: "center" },
  goalNote: { ...typography.bodyXs },
  historyList: { gap: 14 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  historyDate: { ...typography.bodySm, width: 56, textTransform: "capitalize" },
  historyTrack: { flex: 1 },
  historyValue: {
    ...typography.labelMd,
    width: 50,
    textAlign: "right",
    fontVariant: ["tabular-nums"],
  },
}));
