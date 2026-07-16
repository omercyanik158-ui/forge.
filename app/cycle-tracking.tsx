import { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppLocalization } from "@/providers/localization-context";
import {
  summarizeCycleTracking,
  loadCycleTracking,
  saveCycleTracking,
  type CyclePhase,
} from "@/services/cycleTracking";
import { dateKey } from "@/services/dateUtils";
import { successFeedback } from "@/services/interactionFeedback";
import { formatDate } from "@/services/localization";
import { loadProfile } from "@/services/profileStore";
import {
  createDynamicStyles,
  layout,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { CycleTracking, UserProfile } from "@/types";

const DEFAULT_TRACKING: CycleTracking = {
  lastPeriodStartDate: null,
  cycleLengthDays: 28,
  periodLengthDays: 5,
  updatedAt: new Date().toISOString(),
};

function phaseKey(phase: CyclePhase): string {
  if (phase === "period") return "cycle.phase_period";
  if (phase === "follicular") return "cycle.phase_follicular";
  if (phase === "fertile") return "cycle.phase_fertile";
  if (phase === "ovulation") return "cycle.phase_ovulation";
  return "cycle.phase_luteal";
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export default function CycleTrackingScreen() {
  const { colors, mode } = useAppTheme();
  const { t, resolved } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tracking, setTracking] = useState<CycleTracking>(DEFAULT_TRACKING);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [draftDate, setDraftDate] = useState(new Date());

  const refresh = useCallback(async () => {
    const [loadedProfile, loadedTracking] = await Promise.all([
      loadProfile(),
      loadCycleTracking(),
    ]);
    setProfile(loadedProfile);
    setTracking(loadedTracking);
    setDraftDate(
      loadedTracking.lastPeriodStartDate
        ? new Date(`${loadedTracking.lastPeriodStartDate}T12:00:00`)
        : new Date(),
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const updateTracking = useCallback((partial: Partial<CycleTracking>) => {
    setTracking((current) => ({
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const saveChanges = useCallback(async () => {
    try {
      const saved = await saveCycleTracking(tracking);
      setTracking(saved);
      successFeedback();
      Alert.alert(t("cycle.saved_title"), t("cycle.saved_body"));
    } catch {
      Alert.alert(t("ai_hub.alert_failed_title"), t("ai_hub.alert_unknown"));
    }
  }, [t, tracking]);

  const summary = summarizeCycleTracking(tracking);
  const femaleProfile = profile?.gender === "female";
  const lastPeriodLabel = tracking.lastPeriodStartDate
    ? formatDate(`${tracking.lastPeriodStartDate}T12:00:00`, {
        day: "numeric",
        month: "long",
      })
    : t("cycle.empty_title");

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t("cycle.screen_title")} />

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
        {!femaleProfile ? (
          <GlassCard
            variant="panel"
            style={[
              styles.blockedCard,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View
              style={[
                styles.blockedIcon,
                { backgroundColor: `${colors.secondary}14` },
              ]}
            >
              <Ionicons
                name="moon-outline"
                size={22}
                color={colors.secondary}
              />
            </View>
            <Text style={[styles.blockedTitle, { color: colors.onSurface }]}>
              {t("cycle.blocked_title")}
            </Text>
            <Text
              style={[styles.blockedBody, { color: colors.onSurfaceVariant }]}
            >
              {t("cycle.blocked_body")}
            </Text>
          </GlassCard>
        ) : (
          <>
            <GlassCard
              style={[
                styles.heroCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.heroGlow,
                  { backgroundColor: `${colors.secondary}18` },
                ]}
              />
              <View style={styles.heroContent}>
                <View
                  style={[
                    styles.heroBadge,
                    { backgroundColor: `${colors.secondary}14` },
                  ]}
                >
                  <Ionicons
                    name="moon-outline"
                    size={14}
                    color={colors.secondary}
                  />
                  <Text
                    style={[styles.heroBadgeText, { color: colors.secondary }]}
                  >
                    {t("cycle.screen_title")}
                  </Text>
                </View>
                <Text style={[styles.heroTitle, { color: colors.onSurface }]}>
                  {t("cycle.hero_title")}
                </Text>
                <Text
                  style={[styles.heroBody, { color: colors.onSurfaceVariant }]}
                >
                  {t("cycle.hero_body")}
                </Text>
              </View>
            </GlassCard>

            {summary ? (
              <GlassCard
                variant="panel"
                style={[
                  styles.summaryCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                <View style={styles.summaryHeader}>
                  <View>
                    <Text
                      style={[styles.summaryTitle, { color: colors.onSurface }]}
                    >
                      {t("cycle.summary_title")}
                    </Text>
                    <Text
                      style={[styles.summarySub, { color: colors.secondary }]}
                    >
                      {t(phaseKey(summary.phase))}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.phaseBadge,
                      { backgroundColor: `${colors.secondary}14` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.phaseBadgeText,
                        { color: colors.secondary },
                      ]}
                    >
                      {t(phaseKey(summary.phase))}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryGrid}>
                  <SummaryTile
                    label={t("cycle.current_day")}
                    value={`${summary.cycleDay}`}
                    meta={t("cycle.day_suffix")}
                    accent={colors.secondary}
                  />
                  <SummaryTile
                    label={t("cycle.next_period")}
                    value={formatDate(
                      `${summary.nextPeriodStartDate}T12:00:00`,
                      { day: "numeric", month: "short" },
                    )}
                    meta={`${summary.daysUntilNextPeriod} ${t("cycle.day_suffix")} ${t("cycle.days_left")}`}
                    accent={colors.tertiary}
                  />
                  <SummaryTile
                    label={t("cycle.fertile_window")}
                    value={`${formatDate(`${summary.fertileWindowStartDate}T12:00:00`, { day: "numeric", month: "short" })} - ${formatDate(`${summary.fertileWindowEndDate}T12:00:00`, { day: "numeric", month: "short" })}`}
                    accent={colors.primary}
                  />
                  <SummaryTile
                    label={t("cycle.ovulation")}
                    value={formatDate(`${summary.ovulationDate}T12:00:00`, {
                      day: "numeric",
                      month: "short",
                    })}
                    accent={colors.success}
                  />
                </View>
              </GlassCard>
            ) : (
              <GlassCard
                variant="panel"
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={colors.secondary}
                />
                <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
                  {t("cycle.empty_title")}
                </Text>
                <Text
                  style={[styles.emptyBody, { color: colors.onSurfaceVariant }]}
                >
                  {t("cycle.empty_body")}
                </Text>
              </GlassCard>
            )}

            <GlassCard
              variant="panel"
              style={[
                styles.formCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <Text style={[styles.formTitle, { color: colors.onSurface }]}>
                {t("cycle.form_title")}
              </Text>

              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => setPickerVisible((current) => !current)}
                activeOpacity={0.82}
                style={[
                  styles.dateRow,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                <View
                  style={[
                    styles.dateIcon,
                    { backgroundColor: `${colors.secondary}14` },
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={colors.secondary}
                  />
                </View>
                <View style={styles.dateCopy}>
                  <Text style={[styles.dateLabel, { color: colors.onSurface }]}>
                    {t("cycle.last_period")}
                  </Text>
                  <Text
                    style={[
                      styles.dateValue,
                      { color: colors.onSurface },
                    ]}
                  >
                    {lastPeriodLabel}
                  </Text>
                </View>
                <Ionicons
                  name={pickerVisible ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={colors.onSurfaceVariant}
                />
              </TouchableOpacity>

              {pickerVisible ? (
                <View
                  style={[
                    styles.pickerCard,
                    {
                      backgroundColor: colors.surfaceContainerLow,
                      borderColor: colors.outlineVariant,
                    },
                  ]}
                >
                  <DateTimePicker
                    value={draftDate}
                    mode="date"
                    maximumDate={new Date()}
                    locale={resolved.localeTag}
                    display={
                      process.env.EXPO_OS === "ios" ? "inline" : "default"
                    }
                    themeVariant={mode === "dark" ? "dark" : "light"}
                    accentColor={colors.secondary}
                    textColor={colors.onSurface}
                    design={
                      process.env.EXPO_OS === "android" ? "material" : undefined
                    }
                    onChange={(event, nextDate) => {
                      if (event.type === "dismissed" || !nextDate) {
                        if (process.env.EXPO_OS !== "ios")
                          setPickerVisible(false);
                        return;
                      }
                      setDraftDate(nextDate);
                      updateTracking({
                        lastPeriodStartDate: dateKey(nextDate),
                      });
                      if (process.env.EXPO_OS !== "ios")
                        setPickerVisible(false);
                    }}
                  />
                  {process.env.EXPO_OS === "ios" ? (
                    <View style={styles.pickerActions}>
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => {
                          const today = new Date();
                          setDraftDate(today);
                          updateTracking({
                            lastPeriodStartDate: dateKey(today),
                          });
                        }}
                        activeOpacity={0.8}
                        style={[
                          styles.pickerButton,
                          {
                            backgroundColor: colors.surfaceContainerLowest,
                            borderColor: colors.outlineVariant,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickerButtonText,
                            { color: colors.onSurface },
                          ]}
                        >
                          {t("common.today")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => setPickerVisible(false)}
                        activeOpacity={0.8}
                        style={[
                          styles.pickerButton,
                          {
                            backgroundColor: colors.secondary,
                            borderColor: colors.secondary,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickerButtonText,
                            { color: colors.onSecondary },
                          ]}
                        >
                          {t("common.close")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <AdjustRow
                label={t("cycle.cycle_length")}
                value={tracking.cycleLengthDays}
                minimum={21}
                maximum={40}
                onChange={(value) => updateTracking({ cycleLengthDays: value })}
              />
              <AdjustRow
                label={t("cycle.period_length")}
                value={tracking.periodLengthDays}
                minimum={2}
                maximum={10}
                onChange={(value) =>
                  updateTracking({ periodLengthDays: value })
                }
              />

              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => void saveChanges()}
                activeOpacity={0.88}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
              >
                <Text
                  style={[styles.saveButtonText, { color: colors.onPrimary }]}
                >
                  {t("common.save")}
                </Text>
              </TouchableOpacity>
            </GlassCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SummaryTile({
  label,
  value,
  accent,
  meta,
}: {
  label: string;
  value: string;
  accent: string;
  meta?: string;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.summaryTile,
        { backgroundColor: colors.surfaceContainerLow },
      ]}
    >
      <Text style={[styles.summaryTileLabel, { color: accent }]}>{label}</Text>
      <Text style={[styles.summaryTileValue, { color: colors.onSurface }]}>
        {value}
      </Text>
      {meta ? (
        <Text
          style={[styles.summaryTileMeta, { color: colors.onSurface }]}
        >
          {meta}
        </Text>
      ) : null}
    </View>
  );
}

function AdjustRow({
  label,
  value,
  minimum,
  maximum,
  onChange,
}: {
  label: string;
  value: number;
  minimum: number;
  maximum: number;
  onChange: (value: number) => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <View
      style={[
        styles.adjustRow,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <Text style={[styles.adjustLabel, { color: colors.onSurface }]}>
        {label}
      </Text>
      <View style={styles.adjustControls}>
        <AdjustButton
          icon="remove"
          onPress={() => onChange(clamp(value - 1, minimum, maximum))}
        />
        <Text style={[styles.adjustValue, { color: colors.onSurface }]}>
          {value} {t("cycle.day_suffix")}
        </Text>
        <AdjustButton
          icon="add"
          onPress={() => onChange(clamp(value + 1, minimum, maximum))}
        />
      </View>
    </View>
  );
}

function AdjustButton({
  icon,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.adjustButton,
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <Ionicons name={icon} size={16} color={colors.onSurface} />
    </TouchableOpacity>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.gutter,
  },
  blockedCard: { padding: 24, alignItems: "center", gap: 10 },
  blockedIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  blockedTitle: { ...typography.headlineMd, textAlign: "center" },
  blockedBody: {
    ...typography.bodyMd,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 320,
  },
  heroCard: { padding: 20, overflow: "hidden" },
  heroGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -94,
    right: -52,
  },
  heroContent: { zIndex: 1, gap: 10 },
  heroBadge: {
    alignSelf: "flex-start",
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroBadgeText: { ...typography.labelCaps },
  heroTitle: { ...typography.headlineLgMobile },
  heroBody: { ...typography.bodyMd, lineHeight: 20 },
  summaryCard: { padding: 18, gap: 14 },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  summaryTitle: { ...typography.headlineMd },
  summarySub: { ...typography.bodySm, marginTop: 3 },
  phaseBadge: {
    minHeight: 30,
    borderRadius: 999,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  phaseBadgeText: { ...typography.labelMd, fontSize: 12 },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryTile: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 90,
    borderRadius: 14,
    padding: 12,
    gap: 5,
  },
  summaryTileLabel: { ...typography.bodySm },
  summaryTileValue: { ...typography.headlineMd, fontSize: 18, lineHeight: 24 },
  summaryTileMeta: { ...typography.bodySm, fontSize: 11, lineHeight: 15 },
  emptyCard: { padding: 24, alignItems: "center", gap: 8 },
  emptyTitle: { ...typography.headlineMd, textAlign: "center" },
  emptyBody: {
    ...typography.bodySm,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 320,
  },
  formCard: { padding: 18, gap: 14 },
  formTitle: { ...typography.headlineMd },
  dateRow: {
    minHeight: 68,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  dateCopy: { flex: 1, gap: 2 },
  dateLabel: { ...typography.labelMd },
  dateValue: { ...typography.bodySm },
  pickerCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  pickerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
  },
  pickerButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerButtonText: { ...typography.labelMd, fontSize: 12 },
  adjustRow: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  adjustLabel: { ...typography.labelMd, flex: 1 },
  adjustControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  adjustButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  adjustValue: { ...typography.labelMd, minWidth: 74, textAlign: "center" },
  saveButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: { ...typography.labelMd },
}));
