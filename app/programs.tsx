import { useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppLocalization } from "@/providers/localization-context";
import {
  ALL_PROGRAMS,
  filterProgramPlans,
  getProgramDayCount,
  PROGRAM_DAY_OPTIONS,
  PROGRAM_DIFFICULTY_OPTIONS,
  PROGRAM_STYLE_OPTIONS,
  type ProgramDayFilter,
  type ProgramDifficultyFilter,
  type ProgramPlan,
  type ProgramStyleFilter,
} from "@/services/programCatalog";
import { getPremiumMarketSnapshot } from "@/services/market";
import { localizeProgramPlans } from "@/services/program-localization";
import { loadProfile } from "@/services/profileStore";
import { canAccessPremiumPrograms } from "@/services/subscription";
import {
  colors,
  createDynamicStyles,
  layout,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { UserProfile } from "@/types";

const ALL_OPTION = "Tümü";

export default function ProgramsScreen() {
  const insets = useSafeAreaInsets();
  useAppTheme();
  const { resolved, t } = useAppLocalization();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState<ProgramStyleFilter>(ALL_OPTION);
  const [difficulty, setDifficulty] =
    useState<ProgramDifficultyFilter>(ALL_OPTION);
  const [daysPerWeek, setDaysPerWeek] = useState<ProgramDayFilter>(ALL_OPTION);
  const premiumOffer = getPremiumMarketSnapshot(resolved);

  useFocusEffect(
    useCallback(() => {
      void loadProfile().then(setProfile);
    }, []),
  );

  const filtered = useMemo(() => {
    const structurallyFiltered = filterProgramPlans(ALL_PROGRAMS, {
      query: resolved.language === "tr" ? query : "",
      style,
      difficulty,
      daysPerWeek,
    });
    const localized = prioritizeProgramsForGender(
      localizeProgramPlans(structurallyFiltered, resolved.language),
      profile?.gender,
    );
    const normalizedQuery = query.trim().toLocaleLowerCase(resolved.localeTag);
    if (!normalizedQuery || resolved.language === "tr") return localized;
    return localized.filter((program) =>
      [
        program.title,
        program.summary,
        program.focus,
        program.goal,
        program.trainingStyle,
        program.equipment,
      ]
        .join(" ")
        .toLocaleLowerCase(resolved.localeTag)
        .includes(normalizedQuery),
    );
  }, [
    daysPerWeek,
    difficulty,
    profile?.gender,
    query,
    resolved.language,
    resolved.localeTag,
    style,
  ]);

  const freePrograms = filtered.filter((program) => program.tier === "free");
  const premiumPrograms = filtered.filter(
    (program) => program.tier === "premium",
  );
  const hasActiveFilters =
    !!query.trim() ||
    style !== ALL_OPTION ||
    difficulty !== ALL_OPTION ||
    daysPerWeek !== ALL_OPTION;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t({ tr: "Program Kütüphanesi", en: "Program Library" })}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.screenHeaderOffset,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
        alwaysBounceVertical
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.headerTitle}>
            {t({
              tr: "Hedefine göre program bul",
              en: "Find a program for your goal",
            })}
          </Text>
          <Text style={styles.headerBody}>
            {t({
              tr: "Full body, split, powerlifting veya 4 gün gibi aramalarla sana uyan akışı hızlıca süz.",
              en: "Quickly filter the right flow for you with searches like full body, split, powerlifting, or 4 days.",
            })}
          </Text>
        </View>

        <GlassCard variant="panel" style={styles.discoveryCard}>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color={colors.outline} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t({
                tr: "Program, stil veya gün ara",
                en: "Search program, style, or day count",
              })}
              placeholderTextColor={colors.outline}
              style={styles.searchInput}
            />
            {query ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t({
                  tr: "Aramayı temizle",
                  en: "Clear search",
                })}
                onPress={() => setQuery("")}
                activeOpacity={0.75}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.outline}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          <FilterStrip
            title={t({ tr: "Antrenman tipi", en: "Training style" })}
            options={PROGRAM_STYLE_OPTIONS}
            value={style}
            onChange={(next) => setStyle(next as ProgramStyleFilter)}
          />
          <FilterStrip
            title={t({ tr: "Haftalık gün", en: "Days per week" })}
            options={PROGRAM_DAY_OPTIONS}
            value={daysPerWeek}
            onChange={(next) => setDaysPerWeek(next as ProgramDayFilter)}
            formatLabel={(option) =>
              option === ALL_OPTION
                ? String(option)
                : `${option} ${t({ tr: "gün", en: "days" })}`
            }
          />
          <FilterStrip
            title={t({ tr: "Seviye", en: "Level" })}
            options={PROGRAM_DIFFICULTY_OPTIONS}
            value={difficulty}
            onChange={(next) => setDifficulty(next as ProgramDifficultyFilter)}
          />

          <View style={styles.discoveryFooter}>
            <Text style={styles.discoveryFooterText}>
              {filtered.length}{" "}
              {t({ tr: "program bulundu", en: "programs found" })}
            </Text>
            {hasActiveFilters ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t({
                  tr: "Tüm filtreleri sıfırla",
                  en: "Reset all filters",
                })}
                onPress={() => {
                  setQuery("");
                  setStyle(ALL_OPTION);
                  setDifficulty(ALL_OPTION);
                  setDaysPerWeek(ALL_OPTION);
                }}
                activeOpacity={0.8}
                style={styles.resetButton}
              >
                <Text style={styles.resetButtonText}>
                  {t({ tr: "Sıfırla", en: "Reset" })}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </GlassCard>

        {premiumPrograms.length > 0 ? (
          <ProgramSection
            title={t({ tr: "Premium Programlar", en: "Premium Programs" })}
            subtitle={
              hasActiveFilters
                ? t({
                    tr: `${premiumPrograms.length} premium sonuç · ${premiumOffer.annual.priceLabel} ile açılır`,
                    en: `${premiumPrograms.length} premium results · unlocks with ${premiumOffer.annual.priceLabel}`,
                  })
                : `${t("programs.premium_default_sub")} · ${premiumOffer.annual.priceLabel}`
            }
            programs={premiumPrograms}
            locked={!canAccessPremiumPrograms(profile)}
          />
        ) : null}

        {freePrograms.length > 0 ? (
          <ProgramSection
            title={t({ tr: "Ücretsiz Programlar", en: "Free Programs" })}
            subtitle={
              hasActiveFilters
                ? t({
                    tr: `${freePrograms.length} ücretsiz sonuç`,
                    en: `${freePrograms.length} free results`,
                  })
                : t("programs.free_default_sub")
            }
            programs={freePrograms}
          />
        ) : null}

        {filtered.length === 0 ? (
          <GlassCard variant="panel" style={styles.emptyState}>
            <Ionicons name="search-outline" size={24} color={colors.outline} />
            <Text style={styles.emptyTitle}>
              {t({ tr: "Sonuç bulunamadı", en: "No results found" })}
            </Text>
            <Text style={styles.emptyBody}>
              {t({
                tr: "Aramayı sadeleştir veya filtreleri temizleyip yeniden dene.",
                en: "Simplify your search or clear filters and try again.",
              })}
            </Text>
          </GlassCard>
        ) : null}
      </ScrollView>
    </View>
  );
}

function prioritizeProgramsForGender<T extends { trainingStyle: string }>(
  programs: T[],
  gender?: UserProfile["gender"],
): T[] {
  if (gender !== "female") return programs;
  return [...programs].sort(
    (a, b) =>
      Number(["Pilates", "Yoga"].includes(b.trainingStyle)) -
      Number(["Pilates", "Yoga"].includes(a.trainingStyle)),
  );
}

function FilterStrip({
  title,
  options,
  value,
  onChange,
  formatLabel,
}: {
  title: string;
  options: readonly (string | number)[];
  value: string | number;
  onChange: (option: string | number) => void;
  formatLabel?: (option: string | number) => string;
}) {
  return (
    <View style={styles.filterBlock}>
      <Text style={styles.filterTitle}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {options.map((option) => {
          const active = option === value;
          const label = formatLabel ? formatLabel(option) : String(option);

          return (
            <TouchableOpacity
              key={String(option)}
              activeOpacity={0.82}
              onPress={() => onChange(option)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function ProgramSection({
  title,
  subtitle,
  programs,
  locked,
}: {
  title: string;
  subtitle: string;
  programs: ProgramPlan[];
  locked?: boolean;
}) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
      {programs.map((program) => (
        <TouchableOpacity
          key={program.id}
          activeOpacity={0.85}
          onPress={() =>
            locked
              ? router.push("/premium")
              : router.push({
                  pathname: "/program-detail",
                  params: { id: program.id },
                })
          }
        >
          <GlassCard variant="panel" style={styles.programCard}>
            <View
              style={[styles.programVisual, { backgroundColor: program.color }]}
            >
              <Ionicons name="barbell" size={30} color={colors.whiteAlpha60} />
            </View>
            <View style={styles.programInfo}>
              <View style={styles.programTop}>
                <View style={styles.programCopy}>
                  <Text style={styles.programTitle}>{program.title}</Text>
                  <Text style={styles.programSub}>{program.sub}</Text>
                  <Text style={styles.programBody}>{program.summary}</Text>
                </View>
                <View style={[styles.badge, locked && styles.badgeLocked]}>
                  <Text
                    style={[
                      styles.badgeText,
                      { color: locked ? colors.onSurface : colors.onSecondary },
                    ]}
                  >
                    {locked
                      ? t({ tr: "Kilitli", en: "Locked" })
                      : program.tier === "premium"
                        ? "Premium"
                        : t({ tr: "Ücretsiz", en: "Free" })}
                  </Text>
                </View>
              </View>
              <View style={styles.programMetaRow}>
                <MetaPill icon="flag-outline" label={program.goal} />
                <MetaPill icon="calendar-outline" label={program.duration} />
                <MetaPill
                  icon="repeat-outline"
                  label={`${program.daysPerWeek} ${t({ tr: "gün / hafta", en: "days / week" })}`}
                />
                <MetaPill icon="flash-outline" label={program.trainingStyle} />
                <MetaPill
                  icon="layers-outline"
                  label={program.difficultyLevel}
                />
                <MetaPill
                  icon="albums-outline"
                  label={`${getProgramDayCount(program)} ${t({ tr: "gün akışı", en: "day flow" })}`}
                />
              </View>
            </View>
          </GlassCard>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function MetaPill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.metaPill}>
      <Ionicons name={icon} size={14} color={colors.onSurface} />
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
  headerBlock: { gap: 8 },
  headerTitle: { ...typography.headlineLgMobile, color: colors.onSurface },
  headerBody: { ...typography.bodyMd, color: colors.onSurfaceVariant },
  discoveryCard: { padding: 16, gap: 14 },
  searchRow: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, color: colors.onSurface, paddingVertical: 0 },
  filterBlock: { gap: 8 },
  filterTitle: { ...typography.labelMd, color: colors.onSurface },
  filterRow: { gap: 10, paddingRight: 12 },
  filterChip: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: { ...typography.labelMd, color: colors.onSurface },
  filterChipTextActive: { color: colors.onPrimary },
  discoveryFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  discoveryFooterText: { ...typography.bodySm, color: colors.onSurfaceVariant },
  resetButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: { ...typography.labelMd, color: colors.onSurface },
  section: { gap: 14 },
  sectionHeader: { gap: 4 },
  sectionTitle: { ...typography.headlineMd, color: colors.onSurface },
  sectionSubtitle: { ...typography.bodySm, color: colors.outline },
  programCard: { overflow: "hidden" },
  programVisual: {
    height: 108,
    alignItems: "center",
    justifyContent: "center",
  },
  programInfo: { padding: 16, gap: 12 },
  programTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  programCopy: { flex: 1, gap: 4 },
  programTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
    fontSize: 20,
    lineHeight: 26,
  },
  programSub: { ...typography.bodySm, color: colors.secondary },
  programBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    lineHeight: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.secondary,
  },
  badgeLocked: { backgroundColor: colors.surfaceContainerHighest },
  badgeText: { ...typography.labelMd, color: colors.onSecondary },
  programMetaRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceContainerHighest,
  },
  metaPillText: { ...typography.bodySm, color: colors.onSurface },
  emptyState: { padding: 24, gap: 10, alignItems: "center" },
  emptyTitle: { ...typography.headlineMd, color: colors.onSurface },
  emptyBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
}));
