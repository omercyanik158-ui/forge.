import {
  createDynamicStyles,
  layout,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import type { ThemeMode } from "@/theme/colors";
import { useAppLocalization } from "@/providers/localization-context";

type LocalizedCopy = { tr: string; en: string };

const OPTIONS: {
  mode: ThemeMode;
  title: LocalizedCopy;
  sub: LocalizedCopy;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    mode: "light",
    title: { tr: "Patina açık tema", en: "Patina light theme" },
    sub: {
      tr: "Kül ve kemik yüzeylerle sakin, tok bir gündüz görünümü.",
      en: "A calm, grounded daytime look with ash and bone surfaces.",
    },
    icon: "sunny-outline",
  },
  {
    mode: "dark",
    title: { tr: "Patina koyu tema", en: "Patina dark theme" },
    sub: {
      tr: "Mürekkep zemin, metal yüzeyler ve kontrollü kor vurguları.",
      en: "An ink base with metallic surfaces and controlled ember accents.",
    },
    icon: "moon-outline",
  },
];

export default function AppearanceSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, mode, setMode } = useAppTheme();
  const { t } = useAppLocalization();

  const handleSelect = useCallback(
    async (nextMode: ThemeMode) => {
      await setMode(nextMode);
    },
    [setMode],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t({ tr: "Görünüm", en: "Appearance" })} />

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
        <GlassCard variant="panel" style={styles.heroCard}>
          <Text style={[styles.heroTitle, { color: colors.onSurface }]}>
            {t({ tr: "Tema seçimi", en: "Choose a theme" })}
          </Text>
          <Text style={[styles.heroBody, { color: colors.onSurfaceVariant }]}>
            {t({
              tr: "İki görünüm de Forge Patina renk sistemini kullanır. Açık tema gün ışığına, koyu tema düşük ışığa göre dengelenmiştir.",
              en: "Both options use the Forge Patina color system. Light mode is tuned for daylight and dark mode for low-light use.",
            })}
          </Text>
        </GlassCard>

        {OPTIONS.map((option) => {
          const active = mode === option.mode;
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`${t(option.title)}, ${t(option.sub)}`}
              accessibilityState={{ selected: active }}
              key={option.mode}
              activeOpacity={0.85}
              onPress={() => handleSelect(option.mode)}
            >
              <GlassCard
                variant="panel"
                style={[
                  styles.optionCard,
                  active && { borderColor: colors.primary },
                ]}
              >
                <View
                  style={[
                    styles.optionIcon,
                    {
                      backgroundColor: active
                        ? colors.primary
                        : colors.surfaceContainerHigh,
                    },
                  ]}
                >
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={active ? colors.onPrimary : colors.primary}
                  />
                </View>
                <View style={styles.optionCopy}>
                  <Text
                    style={[styles.optionTitle, { color: colors.onSurface }]}
                  >
                    {t(option.title)}
                  </Text>
                  <Text
                    style={[
                      styles.optionSub,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {t(option.sub)}
                  </Text>
                </View>
                <Ionicons
                  name={active ? "checkmark-circle" : "ellipse-outline"}
                  size={22}
                  color={active ? colors.success : colors.outline}
                />
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
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
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    borderBottomWidth: 1,
  },
  topBarInner: {
    height: 64,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarTitle: { ...typography.headlineLgMobile },
  heroCard: { padding: 18, gap: 8 },
  heroTitle: { ...typography.headlineMd },
  heroBody: { ...typography.bodyMd },
  optionCard: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  optionCopy: { flex: 1, gap: 3 },
  optionTitle: { ...typography.labelMd },
  optionSub: { ...typography.bodySm },
  topBarIconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
}));
