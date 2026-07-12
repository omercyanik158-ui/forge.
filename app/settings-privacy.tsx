import {
  createDynamicStyles,
  useAppTheme,
  colors,
  layout,
  spacing,
  typography,
} from "@/theme";
import {
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { loadDataHealth, type DataHealthItem } from "@/services/dataHealth";
import { useAppLocalization } from "@/providers/localization-context";
import { formatDate as formatLocalizedDate } from "@/services/localization";

const SUPPORT_EMAIL = process.env.EXPO_PUBLIC_SUPPORT_EMAIL;
const HAS_SUPPORT_EMAIL =
  typeof SUPPORT_EMAIL === "string" && SUPPORT_EMAIL.trim().length > 0;

export default function PrivacySettingsScreen() {
  useAppTheme();
  const { t } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<DataHealthItem[]>([]);
  const [healthyCount, setHealthyCount] = useState(0);
  const [recoveredCount, setRecoveredCount] = useState(0);

  const refresh = useCallback(async () => {
    const snapshot = await loadDataHealth();
    setItems(snapshot.items);
    setHealthyCount(snapshot.healthyCount);
    setRecoveredCount(snapshot.recoveredCount);
  }, []);

  const contactSupport = useCallback(async () => {
    if (!SUPPORT_EMAIL) return;
    await Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("FORGE Support")}`,
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title={t("privacy.title")} />
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
          <Ionicons name="shield-checkmark" size={32} color={colors.success} />
          <Text style={styles.heroTitle}>{t("privacy.hero_title")}</Text>
          <Text style={styles.heroBody}>{t("privacy.hero_body")}</Text>

          <View style={styles.summaryRow}>
            <SummaryCard
              title={t("privacy.healthy_areas")}
              value={`${healthyCount}/${items.length}`}
              accent={colors.success}
            />
            <SummaryCard
              title={t("privacy.auto_recovery")}
              value={`${recoveredCount}`}
              accent={colors.tertiary}
            />
          </View>
        </GlassCard>

        <GlassCard variant="panel" style={styles.listCard}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{t("privacy.data_health")}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t("privacy.rescan_label")}
              style={styles.refreshChip}
              onPress={refresh}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh" size={14} color={colors.onSurface} />
              <Text style={styles.refreshChipText}>{t("privacy.scan")}</Text>
            </TouchableOpacity>
          </View>

          {items.map((item) => (
            <View key={item.key} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: item.isEmpty
                        ? colors.outline
                        : item.isHealthy
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                />
                <View style={styles.itemCopy}>
                  <Text style={styles.itemTitle}>{item.label}</Text>
                  <Text style={styles.itemSub}>
                    {item.isEmpty
                      ? t("privacy.no_data")
                      : item.hasPrimary
                        ? t("privacy.primary_available")
                        : t("privacy.primary_missing")}
                    {item.isEmpty ? "" : " · "}
                    {item.isEmpty
                      ? ""
                      : item.hasBackup
                        ? t("privacy.backup_ready")
                        : t("privacy.backup_missing")}
                  </Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                <Text
                  style={[
                    styles.itemBadge,
                    {
                      color: item.isEmpty
                        ? colors.outline
                        : item.isHealthy
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {item.isEmpty
                    ? t("privacy.empty")
                    : item.isHealthy
                      ? t("privacy.healthy")
                      : t("privacy.check")}
                </Text>
                {item.lastSavedAt ? (
                  <Text style={styles.itemMeta}>
                    {formatDate(item.lastSavedAt)}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </GlassCard>

        {HAS_SUPPORT_EMAIL ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("privacy.contact_support")}
            activeOpacity={0.82}
            onPress={() => void contactSupport()}
            style={styles.supportCard}
          >
            <View style={styles.supportIcon}>
              <Ionicons
                name="mail-outline"
                size={21}
                color={colors.secondary}
              />
            </View>
            <View style={styles.supportCopy}>
              <Text style={styles.supportTitle}>{t("privacy.support")}</Text>
              <Text style={styles.supportSub} numberOfLines={1}>
                {SUPPORT_EMAIL}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={colors.outline} />
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

function SummaryCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryTitle, { color: accent }]}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function formatDate(value: string): string {
  return formatLocalizedDate(value, {
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
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarTitle: { ...typography.headlineLgMobile, color: colors.onSurface },
  heroCard: { padding: 24, gap: 12 },
  heroTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontSize: 18,
  },
  heroBody: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  summaryRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  summaryCard: {
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 86,
    borderRadius: 14,
    padding: 14,
    backgroundColor: colors.surfaceContainerHighest,
    justifyContent: "space-between",
  },
  summaryTitle: { ...typography.bodySm },
  summaryValue: { ...typography.headlineMd, color: colors.onSurface },
  listCard: { padding: 18, gap: 14 },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listTitle: { ...typography.headlineMd, color: colors.onSurface },
  refreshChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerHighest,
  },
  refreshChipText: { ...typography.labelMd, color: colors.onSurface },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 999 },
  itemCopy: { flex: 1, gap: 3 },
  itemTitle: { ...typography.labelMd, color: colors.onSurface },
  itemSub: { ...typography.bodySm, color: colors.onSurfaceVariant },
  itemRight: { alignItems: "flex-end", gap: 3 },
  itemBadge: { ...typography.labelMd },
  itemMeta: { ...typography.bodySm, color: colors.outline },
  topBarIconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  supportCard: {
    minHeight: 76,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainer,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  supportIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondaryContainer,
  },
  supportCopy: { flex: 1, gap: 3 },
  supportTitle: { ...typography.labelMd, color: colors.onSurface },
  supportSub: { ...typography.bodySm, color: colors.onSurfaceVariant },
}));
