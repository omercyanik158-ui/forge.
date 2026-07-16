import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppLocalization } from "@/providers/localization-context";
import {
  countEnabledReminders,
  getNotificationPermissionState,
  requestNotificationPermission,
  setReminderEnabled,
  setReminderTime,
  syncReminderSchedules,
  type NotificationPermissionState,
  type NotificationPreferences,
  type ReminderKey,
} from "@/services/notificationStore";
import { formatTime as formatLocalizedTime } from "@/services/localization";
import {
  createDynamicStyles,
  layout,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";

type ReminderConfig = {
  key: ReminderKey;
  icon: keyof typeof Ionicons.glyphMap;
  accent: "primary" | "secondary" | "tertiary";
  title: { tr: string; en: string };
  sub: { tr: string; en: string };
};

const REMINDER_CONFIG: ReminderConfig[] = [
  {
    key: "meal",
    icon: "restaurant-outline",
    accent: "primary",
    title: { tr: "Öğün hatırlatmaları", en: "Meal reminders" },
    sub: {
      tr: "Günlük beslenme kaydını ritimde tutar.",
      en: "Keeps your nutrition logging on rhythm.",
    },
  },
  {
    key: "water",
    icon: "water-outline",
    accent: "secondary",
    title: { tr: "Su takibi", en: "Water reminders" },
    sub: {
      tr: "Gün içine hafif su molaları yayar.",
      en: "Spreads light hydration breaks through the day.",
    },
  },
  {
    key: "workout",
    icon: "barbell-outline",
    accent: "tertiary",
    title: { tr: "Antrenman planı", en: "Workout reminders" },
    sub: {
      tr: "Seansını kaçırmaman için zamanında dürter.",
      en: "Nudges you before you miss your session.",
    },
  },
];

export default function NotificationSettingsScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { t } = useAppLocalization();
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [permissionState, setPermissionState] =
    useState<NotificationPermissionState>("undetermined");

  const refresh = useCallback(async () => {
    const [syncedPreferences, nextPermission] = await Promise.all([
      syncReminderSchedules(),
      getNotificationPermissionState(),
    ]);
    setPreferences(syncedPreferences);
    setPermissionState(nextPermission);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const enabledCount = useMemo(
    () => (preferences ? countEnabledReminders(preferences) : 0),
    [preferences],
  );

  const granted = permissionState === "granted";
  const denied = permissionState === "denied";

  const handlePermissionPress = useCallback(async () => {
    if (denied) {
      await Linking.openSettings();
      return;
    }

    const nextGranted = await requestNotificationPermission();
    await refresh();
    Alert.alert(
      nextGranted
        ? t({ tr: "Bildirimler hazır", en: "Notifications are ready" })
        : t({ tr: "İzin gerekli", en: "Permission required" }),
      nextGranted
        ? t({
            tr: "Hatırlatmaları artık güvenle açabilirsin.",
            en: "You can now turn reminders on safely.",
          })
        : t({
            tr: "Hatırlatmaların çalışması için sistem izni gerekiyor.",
            en: "System permission is required for reminders to work.",
          }),
    );
  }, [denied, refresh, t]);

  const toggleReminder = useCallback(
    async (key: ReminderKey, value: boolean) => {
      const next = await setReminderEnabled(key, value);
      setPreferences(next);
      setPermissionState(await getNotificationPermissionState());
    },
    [],
  );

  const updateReminderTime = useCallback(
    async (key: ReminderKey, date: Date | undefined) => {
      if (!date) return;
      const next = await setReminderTime(
        key,
        date.getHours(),
        date.getMinutes(),
      );
      setPreferences(next);
    },
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t({ tr: "Bildirimler", en: "Notifications" })} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.screenHeaderOffset,
            paddingBottom: spacing.md,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.heroIconWrap,
                { backgroundColor: `${colors.primary}14` },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.primary}
              />
            </View>
            <View style={styles.heroCopy}>
              <Text style={[styles.heroEyebrow, { color: colors.primary }]}>
                {t({ tr: "HATIRLATMA MERKEZİ", en: "REMINDER CENTER" })}
              </Text>
              <Text style={[styles.heroTitle, { color: colors.onSurface }]}>
                {t({ tr: "Bildirim ritmini", en: "Shape your" })}{" "}
                <Text style={{ color: colors.primary }}>
                  {t({ tr: "sen kur", en: "notification rhythm" })}
                </Text>
              </Text>
            </View>
          </View>

          <Text style={[styles.heroBody, { color: colors.onSurfaceVariant }]}>
            {t({
              tr: "Öğün, su ve antrenman hatırlatmalarını ayrı ayrı aç. Her biri cihazında yerel olarak planlanır ve dokununca ilgili ekrana gider.",
              en: "Turn meal, water, and workout reminders on separately. Each one is scheduled locally on your device and opens the matching screen.",
            })}
          </Text>

          <View style={styles.statRow}>
            <StatusPill
              icon="flash-outline"
              label={t({
                tr: `${enabledCount} aktif akış`,
                en: `${enabledCount} active flows`,
              })}
              accent={colors.success}
            />

            <TouchableOpacity
              activeOpacity={denied ? 0.82 : 1}
              disabled={!denied}
              onPress={() => void handlePermissionPress()}
              style={{ alignSelf: "flex-start" }}
            >
              <StatusPill
                icon={
                  granted
                    ? "shield-checkmark-outline"
                    : denied
                      ? "settings-outline"
                      : "help-circle-outline"
                }
                label={permissionLabel(permissionState, t)}
                accent={permissionColor(permissionState, colors)}
              />
            </TouchableOpacity>
          </View>
        </GlassCard>

        {preferences
          ? REMINDER_CONFIG.map((config) => {
              const reminder = preferences[config.key];
              const accent = reminderAccent(config.accent, colors);
              const accentSoft = `${accent}15`;
              const enabled = reminder.enabled;
              const pickerValue = createPickerDate(
                reminder.hour,
                reminder.minute,
              );

              return (
                <GlassCard
                  key={config.key}
                  variant="panel"
                  style={[
                    styles.reminderCard,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <View style={styles.reminderHeader}>
                    <View style={styles.reminderCopyRow}>
                      <View
                        style={[
                          styles.reminderIconWrap,
                          { backgroundColor: accentSoft },
                        ]}
                      >
                        <Ionicons name={config.icon} size={20} color={accent} />
                      </View>
                      <View style={styles.reminderCopy}>
                        <Text
                          style={[
                            styles.reminderTitle,
                            { color: colors.onSurface },
                          ]}
                        >
                          {t(config.title)}
                        </Text>
                        <Text
                          style={[
                            styles.reminderSub,
                            { color: colors.onSurfaceVariant },
                          ]}
                        >
                          {t(config.sub)}
                        </Text>
                      </View>
                    </View>

                    <Switch
                      accessibilityLabel={`${t(config.title)} ${enabled ? t({ tr: "açık", en: "on" }) : t({ tr: "kapalı", en: "off" })}`}
                      value={enabled}
                      onValueChange={(value) =>
                        void toggleReminder(config.key, value)
                      }
                      trackColor={{
                        false: colors.surfaceContainerHigh,
                        true: `${accent}88`,
                      }}
                      thumbColor={enabled ? accent : colors.surfaceBright}
                      ios_backgroundColor={colors.surfaceContainerHigh}
                    />
                  </View>

                  <View
                    style={[
                      styles.timePanel,
                      {
                        backgroundColor: colors.surfaceContainerLowest,
                        borderColor: colors.outlineVariant,
                      },
                    ]}
                  >
                    <View style={styles.timePanelHeader}>
                      <Text
                        style={[
                          styles.timeLabel,
                          { color: colors.onSurfaceVariant },
                        ]}
                      >
                        {t({ tr: "Seçili saat", en: "Selected time" })}
                      </Text>
                      <Text
                        style={[
                          styles.permissionStateText,
                          { color: enabled ? accent : colors.onSurfaceVariant },
                        ]}
                      >
                        {enabled
                          ? t({ tr: "Açık", en: "On" })
                          : t({ tr: "Kapalı", en: "Off" })}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.timeValue,
                        { color: enabled ? accent : colors.onSurface },
                      ]}
                    >
                      {formatTime(reminder.hour, reminder.minute)}
                    </Text>
                    <Text
                      style={[
                        styles.timeHint,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {enabled
                        ? t({
                            tr: "Saat değiştiğinde plan otomatik güncellenir.",
                            en: "Changing the time updates the schedule automatically.",
                          })
                        : t({
                            tr: "Saati şimdi ayarlayabilirsin. Açtığında bu saat alarm gibi çalışır.",
                            en: "You can set the time now. When enabled, it will work like an alarm.",
                          })}
                    </Text>

                    <View
                      style={[
                        styles.pickerShell,
                        {
                          borderColor: colors.outlineVariant,
                          backgroundColor: colors.surface,
                        },
                      ]}
                    >
                      <DateTimePicker
                        value={pickerValue}
                        mode="time"
                        display={Platform.OS === "ios" ? "spinner" : "spinner"}
                        is24Hour
                        onChange={(event: DateTimePickerEvent, date?: Date) => {
                          if (event.type === "dismissed") return;
                          void updateReminderTime(config.key, date);
                        }}
                        accentColor={accent}
                        textColor={colors.onSurface}
                        themeVariant={
                          colors.background === "#000000" ? "dark" : "light"
                        }
                        style={styles.picker}
                      />
                    </View>
                  </View>
                </GlassCard>
              );
            })
          : null}
      </ScrollView>
    </View>
  );
}

function createPickerDate(hour: number, minute: number): Date {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function StatusPill({
  icon,
  label,
  accent,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accent: string;
}) {
  return (
    <View
      style={[
        styles.statusPill,
        { borderColor: `${accent}38`, backgroundColor: `${accent}10` },
      ]}
    >
      <Ionicons name={icon} size={14} color={accent} />
      <Text style={[styles.statusPillText, { color: accent }]}>{label}</Text>
    </View>
  );
}

function permissionLabel(
  state: NotificationPermissionState,
  t: (messages: { tr: string; en: string }) => string,
): string {
  if (state === "granted")
    return t({ tr: "İzin açık", en: "Permission enabled" });
  if (state === "denied")
    return t({ tr: "İzin kapalı", en: "Permission denied" });
  return t({ tr: "İzin bekliyor", en: "Permission pending" });
}

function permissionColor(
  state: NotificationPermissionState,
  colors: ReturnType<typeof useAppTheme>["colors"],
): string {
  if (state === "granted") return colors.success;
  if (state === "denied") return colors.tertiary;
  return colors.secondary;
}

function reminderAccent(
  accent: ReminderConfig["accent"],
  colors: ReturnType<typeof useAppTheme>["colors"],
): string {
  if (accent === "secondary") return colors.secondary;
  if (accent === "tertiary") return colors.tertiary;
  return colors.primary;
}

function formatTime(hour: number, minute: number): string {
  return formatLocalizedTime(hour, minute);
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.gutter,
  },
  heroCard: { padding: 20, gap: 16 },
  heroTopRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: { flex: 1, minWidth: 0, gap: 4 },
  heroEyebrow: { ...typography.labelXs, lineHeight: 16, letterSpacing: 0.6 },
  heroTitle: { ...typography.headlineLgMobile, lineHeight: 30 },
  heroBody: { ...typography.bodyMd, lineHeight: 21 },
  statRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusPillText: { ...typography.labelXs, lineHeight: 16 },
  reminderCard: { padding: 18, gap: 16 },
  reminderHeader: { flexDirection: "row", alignItems: "center", gap: 16 },
  reminderCopyRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  reminderIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  reminderCopy: { flex: 1, minWidth: 0 },
  reminderTitle: { ...typography.labelMd, fontSize: 16, lineHeight: 22 },
  reminderSub: { ...typography.bodySm, lineHeight: 19, marginTop: 3 },
  timePanel: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  timePanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  timeLabel: { ...typography.labelXs, lineHeight: 16 },
  permissionStateText: { ...typography.labelXs, lineHeight: 16 },
  timeValue: {
    ...typography.statsNumber,
    fontSize: 32,
    lineHeight: 36,
    fontVariant: ["tabular-nums"],
  },
  timeHint: { ...typography.bodySm, lineHeight: 18 },
  pickerShell: {
    marginTop: 6,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  picker: {
    width: "100%",
    height: 180,
  },
}));
