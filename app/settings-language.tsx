import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppLocalization } from "@/providers/localization-context";
import { getPremiumMarketSnapshot } from "@/services/market";
import {
  colors,
  createDynamicStyles,
  layout,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type {
  AppLanguagePreference,
  MeasurementPreference,
} from "@/services/appPreferencesStore";

const LANGUAGE_OPTIONS: AppLanguagePreference[] = ["auto", "tr", "en"];
const UNIT_OPTIONS: MeasurementPreference[] = ["auto", "metric", "imperial"];

export default function LanguageSettingsScreen() {
  useAppTheme();
  const insets = useSafeAreaInsets();
  const {
    preferences,
    resolved,
    setLanguagePreference,
    setMeasurementPreference,
    t,
  } = useAppLocalization();
  const market = getPremiumMarketSnapshot(resolved);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t({ tr: "Bölge ve dil", en: "Region & language" })}
      />
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
        <GlassCard variant="panel" style={styles.card}>
          <Text style={styles.sectionTitle}>
            {t({ tr: "Uygulama dili", en: "App language" })}
          </Text>
          <Text style={styles.sectionBody}>
            {t({
              tr: "Türkiye cihazlarında Türkçe, diğer bölgelerde İngilizce varsayılan olarak seçilir. İstersen aşağıdan sabitleyebilirsin.",
              en: "Devices in Turkey default to Turkish, and other regions default to English. You can override it below.",
            })}
          </Text>
          <View style={styles.optionGrid}>
            {LANGUAGE_OPTIONS.map((option) => (
              <PreferenceChip
                key={option}
                active={preferences.language === option}
                label={languageLabel(option, t)}
                onPress={() => setLanguagePreference(option)}
              />
            ))}
          </View>
        </GlassCard>

        <GlassCard variant="panel" style={styles.card}>
          <Text style={styles.sectionTitle}>
            {t({ tr: "Ölçüm birimleri", en: "Measurement units" })}
          </Text>
          <Text style={styles.sectionBody}>
            {t({
              tr: "Boy, kilo ve vücut ölçülerini metrik veya imperial olarak girebilirsin. Uygulama bunları arka planda tek bir standartta saklar.",
              en: "You can enter height, weight, and body measurements in metric or imperial units. The app still stores them internally in one standard.",
            })}
          </Text>
          <View style={styles.optionGrid}>
            {UNIT_OPTIONS.map((option) => (
              <PreferenceChip
                key={option}
                active={preferences.units === option}
                label={unitLabel(option, t)}
                onPress={() => setMeasurementPreference(option)}
              />
            ))}
          </View>
        </GlassCard>

        <GlassCard variant="panel" style={styles.infoCard}>
          <InfoRow
            label={t({ tr: "Algılanan bölge", en: "Detected region" })}
            value={resolved.regionCode ?? "-"}
          />
          <InfoRow
            label={t({ tr: "Çözülen dil", en: "Resolved language" })}
            value={resolved.language === "tr" ? "Türkçe" : "English"}
          />
          <InfoRow
            label={t({ tr: "Saat biçimi", en: "Time format" })}
            value={resolved.uses24hourClock ? "24h" : "12h"}
          />
          <InfoRow
            label={t({ tr: "Ölçü sistemi", en: "Measurement system" })}
            value={
              resolved.measurementSystem === "metric" ? "Metric" : "Imperial"
            }
          />
          <InfoRow
            label={t({ tr: "Premium aylık", en: "Premium monthly" })}
            value={market.monthly.priceLabel}
          />
          <InfoRow
            label={t({ tr: "Premium yıllık", en: "Premium annual" })}
            value={market.annual.priceLabel}
          />
          <View style={styles.callout}>
            <Ionicons
              name="information-circle-outline"
              size={18}
              color={colors.secondary}
            />
            <Text style={styles.calloutText}>{market.footnote}</Text>
          </View>
        </GlassCard>
      </ScrollView>
    </View>
  );
}

function PreferenceChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function languageLabel(
  option: AppLanguagePreference,
  t: (messages: { tr: string; en: string }) => string,
): string {
  if (option === "auto") return t({ tr: "Otomatik", en: "Automatic" });
  if (option === "tr") return "Türkçe";
  return "English";
}

function unitLabel(
  option: MeasurementPreference,
  t: (messages: { tr: string; en: string }) => string,
): string {
  if (option === "auto") return t({ tr: "Otomatik", en: "Automatic" });
  if (option === "metric")
    return t({ tr: "Metrik (cm / kg)", en: "Metric (cm / kg)" });
  return t({ tr: "Imperial (in / lb)", en: "Imperial (in / lb)" });
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
  card: { padding: 18, gap: 14 },
  sectionTitle: { ...typography.headlineMd, color: colors.onSurface },
  sectionBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    lineHeight: 19,
  },
  optionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    minHeight: 44,
    borderRadius: 999,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}12`,
  },
  chipText: { ...typography.labelMd, color: colors.onSurface },
  chipTextActive: { color: colors.primary },
  infoCard: { padding: 18, gap: 12 },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  infoLabel: { ...typography.bodySm, color: colors.onSurfaceVariant },
  infoValue: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontVariant: ["tabular-nums"],
  },
  callout: {
    marginTop: 4,
    borderRadius: 14,
    padding: 12,
    backgroundColor: colors.surfaceContainerLowest,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  calloutText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
}));
