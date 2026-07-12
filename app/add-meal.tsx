import {
  createDynamicStyles,
  useAppTheme,
  colors,
  layout,
  radius,
  shadowStyle,
  spacing,
  typography,
} from "@/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { GlassCard } from "@/components/GlassCard";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { useAppLocalization } from "@/providers/localization-context";
import { processEngagement } from "@/services/achievementStore";
import { safeGoBack } from "@/services/navigation";
import {
  dateKey,
  formatDateLabel,
  timestampForDateKey,
} from "@/services/dateUtils";
import { getFoodByBarcode, searchFood } from "@/services/foodApi";
import { searchFoodImage } from "@/services/imageApi";
import { successFeedback } from "@/services/interactionFeedback";
import { getPremiumMarketSnapshot } from "@/services/market";
import { loadMeals, saveMeal } from "@/services/mealStore";
import { loadProfile } from "@/services/profileStore";
import { canAccessFoodSearch } from "@/services/subscription";
import type { FoodResult, Meal, MealType, UserProfile } from "@/types";

type Mode = "search" | "manual";

const MEAL_TYPE_OPTIONS: {
  value: MealType;
  label: { tr: string; en: string };
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "breakfast",
    label: { tr: "Kahvaltı", en: "Breakfast" },
    icon: "sunny",
  },
  { value: "lunch", label: { tr: "Öğle", en: "Lunch" }, icon: "restaurant" },
  { value: "dinner", label: { tr: "Akşam", en: "Dinner" }, icon: "moon" },
  { value: "snack", label: { tr: "Ara öğün", en: "Snack" }, icon: "cafe" },
];

export default function AddMealScreen() {
  useAppTheme();
  const { resolved, t } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { date, barcode } = useLocalSearchParams<{
    date?: string;
    barcode?: string;
  }>();
  const targetDate =
    typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : dateKey();
  const createdAt = () => timestampForDateKey(targetDate);

  const [mode, setMode] = useState<Mode>("search");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FoodResult | null>(null);
  const [grams, setGrams] = useState("100");
  const [manualName, setManualName] = useState("");
  const [manualKcal, setManualKcal] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [manualPortion, setManualPortion] = useState(
    t("migrated.add_meal_001"),
  );
  const [saving, setSaving] = useState(false);
  const [mealTypeModal, setMealTypeModal] = useState(false);
  const [pendingMeal, setPendingMeal] = useState<Meal | null>(null);
  const [saveAsFavorite, setSaveAsFavorite] = useState(false);
  const processedBarcode = useRef<string | null>(null);
  const premiumOffer = getPremiumMarketSnapshot(resolved);

  const refreshContext = useCallback(async () => {
    setProfile(await loadProfile());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshContext();
    }, [refreshContext]),
  );

  useEffect(() => {
    if (!barcode || processedBarcode.current === barcode) return;
    processedBarcode.current = barcode;
    setMode("search");
    setLoading(true);
    setError(null);
    getFoodByBarcode(barcode)
      .then((product) => {
        if (product) setSelected(product);
        else setError(t("migrated.add_meal_002"));
      })
      .catch(() => setError(t("migrated.add_meal_003")))
      .finally(() => setLoading(false));
  }, [barcode, t]);

  async function handleSearch() {
    Keyboard.dismiss();
    if (!searchAllowed) {
      setError(t("migrated.add_meal_004"));
      return;
    }
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const found = await searchFood(query);
      setResults(found);
      if (found.length === 0) {
        setError(t("migrated.add_meal_005"));
      }
    } catch {
      setError(t("migrated.add_meal_006"));
    } finally {
      setLoading(false);
    }
  }

  function round(n: number): number {
    return Math.round(n * 10) / 10;
  }

  function computedMacros() {
    const g = Math.max(Number(grams) || 0, 0);
    if (!selected) return null;
    const factor = g / 100;
    return {
      kcal: round(selected.kcalPer100g * factor),
      protein: round(selected.proteinPer100g * factor),
      carbs: round(selected.carbsPer100g * factor),
      fat: round(selected.fatPer100g * factor),
    };
  }

  async function handleSaveApi() {
    const macros = computedMacros();
    if (!selected || !macros) return;
    setSaving(true);
    try {
      const imageUrl =
        selected.imageUrl || (await searchFoodImage(selected.name));
      const meal: Meal = {
        id: `${Date.now()}`,
        name: selected.name,
        kcal: macros.kcal,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        portion: `${grams}g`,
        createdAt: createdAt(),
        source: "api",
        mealType: "breakfast",
        imageUrl,
      };
      setPendingMeal(meal);
      setMealTypeModal(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveManual() {
    if (!manualName.trim() || !manualKcal.trim()) return;
    setSaving(true);
    try {
      const imageUrl = await searchFoodImage(manualName.trim());
      const meal: Meal = {
        id: `${Date.now()}`,
        name: manualName.trim(),
        kcal: Number(manualKcal) || 0,
        protein: Number(manualProtein) || 0,
        carbs: Number(manualCarbs) || 0,
        fat: Number(manualFat) || 0,
        portion: manualPortion.trim() || t("migrated.add_meal_001"),
        createdAt: createdAt(),
        source: "manual",
        mealType: "breakfast",
        imageUrl,
      };
      setPendingMeal(meal);
      setMealTypeModal(true);
    } finally {
      setSaving(false);
    }
  }

  async function confirmMealType(type: MealType) {
    if (!pendingMeal) return;
    setMealTypeModal(false);
    setSaving(true);
    try {
      const meal: Meal = { ...pendingMeal, mealType: type };
      await saveMeal(meal);
      successFeedback();
      const currentProfile = await loadProfile();
      if (currentProfile) {
        const meals = await loadMeals();
        await processEngagement(currentProfile, meals);
      }
      safeGoBack(router);
    } catch {
      Alert.alert(t("migrated.add_meal_007"), t("migrated.add_meal_008"));
    } finally {
      setSaving(false);
      setPendingMeal(null);
      setSaveAsFavorite(false);
    }
  }

  const macros = computedMacros();
  const searchAllowed = canAccessFoodSearch(profile);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.topBarInner}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("migrated.add_meal_009")}
            onPress={() => safeGoBack(router)}
            activeOpacity={0.7}
            style={styles.topBarIconButton}
          >
            <Ionicons name="chevron-back" size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>
            {targetDate === dateKey()
              ? t("migrated.add_meal_010")
              : `${formatDateLabel(targetDate)} · ${t("migrated.add_meal_011")}`}
          </Text>
          <View style={{ width: 26 }} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + spacing.screenHeaderOffset,
            paddingBottom: spacing.md,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.modeTabs}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: mode === "search" }}
            accessibilityLabel={
              searchAllowed
                ? t("migrated.add_meal_012")
                : t("migrated.add_meal_013")
            }
            style={[styles.modeTab, mode === "search" && styles.modeTabActive]}
            onPress={() => setMode("search")}
            activeOpacity={0.7}
          >
            <View style={styles.modeTabContent}>
              <Text
                style={[
                  typography.labelMd,
                  mode === "search" ? styles.modeTextActive : styles.modeText,
                ]}
              >
                {t("migrated.add_meal_014")}
              </Text>
              {!searchAllowed && (
                <Ionicons
                  name="lock-closed"
                  size={12}
                  color={mode === "search" ? colors.onPrimary : colors.outline}
                />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ selected: mode === "manual" }}
            accessibilityLabel={t("migrated.add_meal_015")}
            style={[styles.modeTab, mode === "manual" && styles.modeTabActive]}
            onPress={() => setMode("manual")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                typography.labelMd,
                mode === "manual" ? styles.modeTextActive : styles.modeText,
              ]}
            >
              {t("migrated.add_meal_016")}
            </Text>
          </TouchableOpacity>
        </View>

        {mode === "search" ? (
          <>
            <GlassCard style={styles.searchInfoCard}>
              <View style={styles.searchInfoHeader}>
                <Ionicons name="sparkles" size={18} color={colors.secondary} />
                <Text style={[typography.labelMd, { color: colors.secondary }]}>
                  {t("migrated.add_meal_017")}
                </Text>
              </View>
              <Text
                style={[typography.bodySm, { color: colors.onSurfaceVariant }]}
              >
                {t("migrated.add_meal_018")}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t("migrated.add_meal_019")}
                disabled={!searchAllowed}
                onPress={() =>
                  router.push({
                    pathname: "/barcode-scanner",
                    params: { date: targetDate },
                  })
                }
                activeOpacity={0.82}
                style={[
                  styles.barcodeButton,
                  !searchAllowed && styles.searchBtnDisabled,
                ]}
              >
                <Ionicons
                  name="barcode-outline"
                  size={20}
                  color={colors.primary}
                />
                <Text style={[typography.labelMd, { color: colors.primary }]}>
                  {t("migrated.add_meal_020")}
                </Text>
              </TouchableOpacity>
            </GlassCard>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.input}
                placeholder={t("migrated.add_meal_021")}
                placeholderTextColor={colors.outline}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                editable={searchAllowed}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t("migrated.add_meal_022")}
                accessibilityState={{ disabled: !searchAllowed }}
                disabled={!searchAllowed}
                style={[
                  styles.searchBtn,
                  !searchAllowed && styles.searchBtnDisabled,
                ]}
                onPress={handleSearch}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={20} color={colors.onPrimary} />
              </TouchableOpacity>
            </View>

            {!searchAllowed ? (
              <PremiumFeatureCard
                title={t("migrated.add_meal_023")}
                body={t("migrated.add_meal_024")}
                note={`${premiumOffer.monthly.priceLabel} · ${premiumOffer.monthly.sublabel}`}
                ctaLabel={t("migrated.add_meal_025")}
                onPress={() => router.push("/premium")}
              />
            ) : null}

            {loading && (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color={colors.secondary} />
              </View>
            )}

            {error && !loading && (
              <View style={styles.centerBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={32}
                  color={colors.outline}
                />
                <Text
                  style={[
                    typography.bodyMd,
                    {
                      color: colors.onSurfaceVariant,
                      marginTop: 8,
                      textAlign: "center",
                    },
                  ]}
                >
                  {error}
                </Text>
              </View>
            )}

            {results.length > 0 && !selected && (
              <View style={styles.list}>
                {results.map((result, index) => (
                  <ResultRow
                    key={`${result.name}-${index}`}
                    result={result}
                    onSelect={() => setSelected(result)}
                  />
                ))}
              </View>
            )}

            {selected && (
              <GlassCard style={styles.selectedCard}>
                <View style={styles.selectedHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedTitle}>{selected.name}</Text>
                    {selected.brand ? (
                      <Text style={styles.selectedBrand}>{selected.brand}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelected(null)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={colors.outline}
                    />
                  </TouchableOpacity>
                </View>

                <View style={[styles.portionRow, { marginBottom: 12 }]}>
                  <Text
                    style={[
                      typography.labelMd,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {t("migrated.add_meal_026")}
                  </Text>
                  <TextInput
                    style={styles.gramsInput}
                    value={grams}
                    onChangeText={setGrams}
                    keyboardType="numeric"
                  />
                </View>

                {macros && (
                  <View style={[styles.macroGrid, { marginTop: 12 }]}>
                    <MacroBox
                      label={t("migrated.add_meal_027")}
                      value={`${macros.kcal}`}
                      unit="kcal"
                      color={colors.secondary}
                    />
                    <MacroBox
                      label={t("migrated.add_meal_028")}
                      value={`${macros.protein}`}
                      unit="g"
                      color={colors.primary}
                    />
                    <MacroBox
                      label={t("migrated.add_meal_029")}
                      value={`${macros.carbs}`}
                      unit="g"
                      color={colors.tertiary}
                    />
                    <MacroBox
                      label={t("migrated.add_meal_030")}
                      value={`${macros.fat}`}
                      unit="g"
                      color={colors.primaryContainer}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                  onPress={handleSaveApi}
                  disabled={saving}
                  activeOpacity={0.9}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={colors.onPrimary} />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.onPrimary}
                      />
                      <Text
                        style={[
                          typography.labelMd,
                          { color: colors.onPrimary },
                        ]}
                      >
                        {t("migrated.add_meal_031")}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </GlassCard>
            )}
          </>
        ) : (
          <GlassCard style={styles.manualCard}>
            <ManualField
              label={t("migrated.add_meal_032")}
              value={manualName}
              onChange={setManualName}
              placeholder={t("migrated.add_meal_033")}
            />
            <ManualField
              label="Kalori (kcal)"
              value={manualKcal}
              onChange={setManualKcal}
              placeholder="0"
              numeric
            />
            <ManualField
              label={t("migrated.add_meal_034")}
              value={manualPortion}
              onChange={setManualPortion}
              placeholder={t("migrated.add_meal_035")}
            />
            <View style={styles.manualRow}>
              <ManualField
                label="Protein (g)"
                value={manualProtein}
                onChange={setManualProtein}
                placeholder="0"
                numeric
              />
              <ManualField
                label={t("migrated.add_meal_036")}
                value={manualCarbs}
                onChange={setManualCarbs}
                placeholder="0"
                numeric
              />
              <ManualField
                label={t("migrated.add_meal_037")}
                value={manualFat}
                onChange={setManualFat}
                placeholder="0"
                numeric
              />
            </View>

            <TouchableOpacity
              style={[
                styles.saveBtn,
                styles.manualSaveBtn,
                saving && styles.saveBtnDisabled,
              ]}
              onPress={handleSaveManual}
              disabled={saving || !manualName.trim() || !manualKcal.trim()}
              activeOpacity={0.9}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.onPrimary} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={colors.onPrimary}
                  />
                  <Text
                    style={[typography.labelMd, { color: colors.onPrimary }]}
                  >
                    {t("migrated.add_meal_031")}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </GlassCard>
        )}
      </ScrollView>

      <Modal
        visible={mealTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setMealTypeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMealTypeModal(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {t("migrated.add_meal_038")}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t("migrated.add_meal_039")}
                onPress={() => setMealTypeModal(false)}
                activeOpacity={0.7}
                style={styles.modalCloseButton}
              >
                <Ionicons
                  name="close-circle"
                  size={26}
                  color={colors.outline}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalBody}>{t("migrated.add_meal_040")}</Text>
            <TouchableOpacity
              accessibilityRole="checkbox"
              accessibilityState={{ checked: saveAsFavorite }}
              accessibilityLabel={t("migrated.add_meal_041")}
              onPress={() => setSaveAsFavorite((current) => !current)}
              activeOpacity={0.8}
              style={[
                styles.favoriteTemplateToggle,
                saveAsFavorite && styles.favoriteTemplateToggleActive,
              ]}
            >
              <View
                style={[
                  styles.favoriteTemplateIcon,
                  saveAsFavorite && styles.favoriteTemplateIconActive,
                ]}
              >
                <Ionicons
                  name={saveAsFavorite ? "star" : "star-outline"}
                  size={20}
                  color={saveAsFavorite ? colors.onTertiary : colors.tertiary}
                />
              </View>
              <View style={styles.favoriteTemplateCopy}>
                <Text style={styles.favoriteTemplateTitle}>
                  {t("migrated.add_meal_042")}
                </Text>
                <Text style={styles.favoriteTemplateBody}>
                  {t("migrated.add_meal_043")}
                </Text>
              </View>
              <Ionicons
                name={saveAsFavorite ? "checkmark-circle" : "ellipse-outline"}
                size={23}
                color={saveAsFavorite ? colors.success : colors.outline}
              />
            </TouchableOpacity>
            <View style={styles.mealTypeRow}>
              {MEAL_TYPE_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(option.label)} ${t("migrated.add_meal_044")}`}
                  style={styles.mealTypeCard}
                  onPress={() => confirmMealType(option.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={option.icon}
                    size={28}
                    color={colors.secondary}
                  />
                  <Text
                    style={[
                      typography.labelMd,
                      { color: colors.onSurface, marginTop: 8 },
                    ]}
                  >
                    {t(option.label)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function ResultRow({
  result,
  onSelect,
}: {
  result: FoodResult;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      style={styles.resultRow}
    >
      <View style={styles.resultCopy}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {result.name}
        </Text>
        <Text style={styles.resultKcal}>{result.kcalPer100g} kcal / 100g</Text>
        <Text style={styles.resultMeta}>
          {result.proteinPer100g}P {result.carbsPer100g}K {result.fatPer100g}Y ·
          /100g
        </Text>
      </View>
      <Ionicons name="add-circle" size={24} color={colors.secondary} />
    </TouchableOpacity>
  );
}

function MacroBox({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.macroBox}>
      <Text style={[typography.labelXs, { color }]}>{label.toUpperCase()}</Text>
      <Text style={styles.macroValueText}>
        {value}
        <Text style={styles.macroUnitText}> {unit}</Text>
      </Text>
    </View>
  );
}

function ManualField({
  label,
  value,
  onChange,
  placeholder,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  numeric?: boolean;
}) {
  return (
    <View style={[styles.manualField, { flex: 1 }]}>
      <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <TextInput
        style={styles.manualInput}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.outline}
        keyboardType={numeric ? "numeric" : "default"}
      />
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
    height: 68,
    paddingHorizontal: spacing.containerMargin,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarTitle: { ...typography.screenTitle, color: colors.onSurface },
  topBarIconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle("sm"),
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  modeTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modeTabContent: { flexDirection: "row", alignItems: "center", gap: 6 },
  modeText: { color: colors.onSurfaceVariant },
  modeTextActive: { color: colors.onPrimary },
  searchInfoCard: { padding: spacing.md, gap: spacing.xs },
  searchInfoHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  searchRow: { flexDirection: "row", gap: 12 },
  barcodeButton: {
    minHeight: 44,
    marginTop: spacing.xs + 2,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryContainer,
    backgroundColor: colors.surfaceContainerLowest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smPlus,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  searchBtn: {
    width: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle("sm"),
  },
  searchBtnDisabled: { opacity: 0.45 },
  centerBox: { alignItems: "center", paddingVertical: 32 },
  list: { gap: 12 },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.smPlus,
  },
  resultCopy: { flex: 1 },
  resultTitle: { ...typography.cardTitle, color: colors.onSurface },
  resultKcal: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  resultMeta: {
    ...typography.bodyXs,
    color: colors.outline,
    marginTop: 2,
  },
  selectedCard: { padding: spacing.lg, gap: spacing.lg },
  selectedHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  selectedTitle: { ...typography.cardTitle, color: colors.onSurface },
  selectedBrand: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  portionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gramsInput: {
    width: 80,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  macroGrid: { flexDirection: "row", gap: 8 },
  macroBox: { flex: 1, gap: 4 },
  macroValueText: { ...typography.cardTitle, color: colors.onSurface },
  macroUnitText: { ...typography.bodySm, color: colors.onSurfaceVariant },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    backgroundColor: colors.secondary,
    paddingVertical: spacing.smPlus,
    borderRadius: radius.lg,
    ...shadowStyle("sm"),
  },
  saveBtnDisabled: { opacity: 0.6 },
  manualCard: { padding: spacing.lg, gap: spacing.md },
  manualSaveBtn: { marginTop: 16 },
  manualField: { gap: 6 },
  manualRow: { flexDirection: "row", gap: 12 },
  manualInput: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.blackAlpha80,
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius["3xl"],
    borderTopRightRadius: radius["3xl"],
    padding: spacing.xl,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  modalTitle: { ...typography.sectionTitle, color: colors.onSurface },
  modalBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteTemplateToggle: {
    minHeight: 72,
    marginBottom: spacing.mdPlus,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  favoriteTemplateToggleActive: {
    borderColor: `${colors.tertiary}80`,
    backgroundColor: `${colors.tertiary}12`,
  },
  favoriteTemplateIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${colors.tertiary}12`,
  },
  favoriteTemplateIconActive: { backgroundColor: colors.tertiary },
  favoriteTemplateCopy: { flex: 1, gap: 2 },
  favoriteTemplateTitle: { ...typography.labelMd, color: colors.onSurface },
  favoriteTemplateBody: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    lineHeight: 17,
  },
  mealTypeRow: { flexDirection: "row", gap: 12 },
  mealTypeCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
  },
}));
