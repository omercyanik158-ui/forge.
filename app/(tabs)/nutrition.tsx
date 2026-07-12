import {
  createDynamicStyles,
  colors,
  layout,
  radius,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useScrollToTop } from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { TopBar } from "@/components/TopBar";
import { GlassCard } from "@/components/GlassCard";
import { HydrationBottle } from "@/components/HydrationBottle";
import { MacroBar } from "@/components/MacroBar";
import { useAppLocalization } from "@/providers/localization-context";
import {
  DEFAULT_DAILY_CALORIE_GOAL,
  calorieGoal,
  mealTotals,
} from "@/services/calculations";
import { dateKey, formatDateLabel } from "@/services/dateUtils";
import {
  formatDate,
  formatLiquidValue,
  formatNumber,
  formatWeightValue,
  liquidUnitLabel,
  weightUnitLabel,
} from "@/services/localization";
import { loadNutritionSummary } from "@/services/mealInsights";
import { deleteMeal, loadMealsForDate } from "@/services/mealStore";
import { loadProfile } from "@/services/profileStore";
import {
  addWater,
  loadWaterForWeight,
  resetWater,
} from "@/services/waterStore";
import type { Meal, MealType, UserProfile } from "@/types";

function getMealGroupOrder(
  t: (key: string) => string,
): { type: MealType; label: string }[] {
  return [
    { type: "breakfast", label: t("ai_hub.meal_breakfast") },
    { type: "lunch", label: t("ai_hub.meal_lunch") },
    { type: "dinner", label: t("ai_hub.meal_dinner") },
    { type: "snack", label: t("ai_hub.meal_snack") },
  ];
}

function groupMeals(
  meals: Meal[],
  t: (key: string) => string,
): { label: string; meals: Meal[]; totalKcal: number }[] {
  const groups: { label: string; meals: Meal[]; totalKcal: number }[] = [];
  const others: Meal[] = [];
  const order = getMealGroupOrder(t);

  for (const group of order) {
    const groupedMeals = meals.filter((meal) => meal.mealType === group.type);
    if (groupedMeals.length > 0) {
      groups.push({
        label: group.label,
        meals: groupedMeals,
        totalKcal: mealTotals(groupedMeals).kcal,
      });
    }
  }

  for (const meal of meals) {
    if (!order.some((group) => group.type === meal.mealType)) {
      others.push(meal);
    }
  }

  if (others.length > 0) {
    groups.push({
      label: t("migrated.nutrition_dynamic_001"),
      meals: others,
      totalKcal: mealTotals(others).kcal,
    });
  }

  return groups;
}

function mealGroupAccent(index: number) {
  return [colors.primary, colors.success, colors.tertiary, colors.secondary][
    index % 4
  ];
}

function mealAccent(type: MealType) {
  if (type === "breakfast") return colors.primary;
  if (type === "lunch") return colors.success;
  if (type === "dinner") return colors.tertiary;
  if (type === "snack") return colors.secondary;
  return colors.secondary;
}

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const router = useRouter();
  const { colors: themeColors } = useAppTheme();
  const { t } = useAppLocalization();
  const [selectedDate, setSelectedDate] = useState(dateKey());
  const [pickerVisible, setPickerVisible] = useState(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [waterMl, setWaterMl] = useState(0);
  const [waterGoalMl, setWaterGoalMl] = useState(3500);
  const [weeklyMealCount, setWeeklyMealCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const selectedDateValue = useMemo(
    () => new Date(`${selectedDate}T12:00:00`),
    [selectedDate],
  );

  const refresh = useCallback(async () => {
    const loadedProfile = await loadProfile();
    const [loadedMeals, water, nutritionSummary] = await Promise.all([
      loadMealsForDate(selectedDate),
      loadWaterForWeight(loadedProfile?.weightKg, selectedDate),
      loadNutritionSummary(selectedDateValue),
    ]);

    setMeals(loadedMeals);
    setProfile(loadedProfile);
    setWaterMl(water.ml);
    setWaterGoalMl(water.goalMl);
    setWeeklyMealCount(nutritionSummary.weekly.mealCount);
    setLoading(false);
  }, [selectedDate, selectedDateValue]);

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
      refresh();
    }, [refresh]),
  );

  const handleSelectDate = useCallback((nextDate: Date) => {
    setSelectedDate(dateKey(nextDate));
  }, []);

  async function handleDelete(id: string) {
    try {
      await deleteMeal(id);
      await refresh();
    } catch {
      Alert.alert(t("migrated.nutrition_001"), t("migrated.nutrition_002"));
    }
  }

  async function handleAddWater(amountMl: number) {
    try {
      const water = await addWater(amountMl, selectedDate);
      setWaterMl(water.ml);
      setWaterGoalMl(water.goalMl);
    } catch {
      Alert.alert(t("migrated.nutrition_003"), t("migrated.nutrition_004"));
    }
  }

  async function handleResetWater() {
    try {
      const water = await resetWater(selectedDate);
      setWaterMl(water.ml);
      setWaterGoalMl(water.goalMl);
    } catch {
      Alert.alert(t("migrated.nutrition_005"), t("migrated.nutrition_006"));
    }
  }

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
        <HeaderSection
          key={selectedDate}
          selectedDate={selectedDate}
          selectedDateValue={selectedDateValue}
          pickerVisible={pickerVisible}
          onTogglePicker={() => setPickerVisible((current) => !current)}
          onClosePicker={() => setPickerVisible(false)}
          onSelectDate={handleSelectDate}
        />

        <SummaryGrid
          consumed={mealTotals(meals)}
          goal={profile ? calorieGoal(profile) : DEFAULT_DAILY_CALORIE_GOAL}
          weeklyMealCount={weeklyMealCount}
          waterMl={waterMl}
          waterGoalMl={waterGoalMl}
          weightKg={profile?.weightKg}
          onAddWater={handleAddWater}
          onResetWater={handleResetWater}
          onOpenInsights={() => router.push("/calorie-insights")}
          onOpenWater={() =>
            router.push({
              pathname: "/water-tracking",
              params: { date: selectedDate },
            })
          }
        />

        <GlassCard
          style={[
            styles.mealsPanel,
            {
              backgroundColor: themeColors.surfaceContainerLow,
              borderColor: themeColors.outlineVariant,
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.mealsPanelGlow,
              { backgroundColor: `${themeColors.primary}18` },
            ]}
          />
          <View style={styles.mealsPanelContent}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeadingRow}>
                <View
                  style={[
                    styles.sectionIcon,
                    { backgroundColor: `${themeColors.primary}14` },
                  ]}
                >
                  <Ionicons
                    name="restaurant-outline"
                    size={18}
                    color={themeColors.primary}
                  />
                </View>
                <View style={styles.sectionHeadingCopy}>
                  <Text
                    style={[
                      styles.mealsTitle,
                      { color: themeColors.onSurface },
                    ]}
                  >
                    {t("migrated.nutrition_007")}
                    <Text style={{ color: themeColors.primary }}>
                      {t("migrated.nutrition_008")}
                    </Text>
                  </Text>
                  <Text
                    style={[
                      styles.sectionBody,
                      { color: themeColors.onSurfaceVariant },
                    ]}
                  >
                    {t("migrated.nutrition_009")}
                  </Text>
                </View>
              </View>
              {meals.length > 0 ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t("migrated.nutrition_010")}
                  style={[
                    styles.addButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/add-meal",
                      params: { date: selectedDate },
                    })
                  }
                >
                  <Ionicons
                    name="add"
                    size={18}
                    color={themeColors.onPrimary}
                  />
                  <Text
                    style={[
                      typography.labelMd,
                      { color: themeColors.onPrimary },
                    ]}
                  >
                    {t("migrated.nutrition_011")}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {meals.length > 0 ? (
              <View style={styles.mealsOverview}>
                <View
                  style={[
                    styles.mealsOverviewPill,
                    { backgroundColor: `${themeColors.primary}10` },
                  ]}
                >
                  <Ionicons
                    name="layers-outline"
                    size={13}
                    color={themeColors.primary}
                  />
                  <Text
                    style={[
                      styles.mealsOverviewText,
                      { color: themeColors.primary },
                    ]}
                  >
                    {meals.length} {t("migrated.nutrition_012")}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.mealsOverviewKcal,
                    { color: themeColors.onSurface },
                  ]}
                >
                  {formatNumber(Math.round(mealTotals(meals).kcal))} kcal{" "}
                  {t("migrated.nutrition_013")}
                </Text>
              </View>
            ) : null}

            {loading ? (
              <View style={styles.mealsEmpty}>
                <ActivityIndicator size="large" color={themeColors.primary} />
              </View>
            ) : meals.length === 0 ? (
              <View style={styles.mealsEmpty}>
                <View
                  style={[
                    styles.emptyMealIcon,
                    { backgroundColor: `${themeColors.primary}12` },
                  ]}
                >
                  <Ionicons
                    name="restaurant-outline"
                    size={30}
                    color={themeColors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.emptyMealTitle,
                    { color: themeColors.onSurface },
                  ]}
                >
                  {t("migrated.nutrition_014")}
                </Text>
                <Text
                  style={[
                    styles.emptyMealBody,
                    { color: themeColors.onSurfaceVariant },
                  ]}
                >
                  {t("migrated.nutrition_015")}
                </Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={t("migrated.nutrition_016")}
                  activeOpacity={0.84}
                  onPress={() =>
                    router.push({
                      pathname: "/add-meal",
                      params: { date: selectedDate },
                    })
                  }
                  style={[
                    styles.emptyMealButton,
                    { backgroundColor: themeColors.primary },
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={17}
                    color={themeColors.onPrimary}
                  />
                  <Text
                    style={[
                      styles.emptyMealButtonText,
                      { color: themeColors.onPrimary },
                    ]}
                  >
                    {t("migrated.nutrition_017")}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.mealsList}>
                {groupMeals(meals, t).map((group, index) => (
                  <View
                    key={group.label}
                    style={[styles.mealGroup, index > 0 && styles.mealGroupGap]}
                  >
                    <View style={styles.mealGroupHeader}>
                      <View style={styles.mealGroupTitleRow}>
                        <View
                          style={[
                            styles.mealGroupDot,
                            { backgroundColor: mealGroupAccent(index) },
                          ]}
                        />
                        <Text
                          style={[
                            typography.cardTitle,
                            { color: themeColors.onSurface },
                          ]}
                        >
                          {group.label}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.groupCaloriePill,
                          { backgroundColor: `${mealGroupAccent(index)}16` },
                        ]}
                      >
                        <Text
                          style={[
                            typography.labelMd,
                            { color: mealGroupAccent(index) },
                          ]}
                        >
                          {formatNumber(Math.round(group.totalKcal))} kcal
                        </Text>
                      </View>
                    </View>
                    {group.meals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        onDelete={() => handleDelete(meal.id)}
                      />
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        </GlassCard>

        <TipCard />
      </ScrollView>
    </View>
  );
}

function HeaderSection({
  selectedDate,
  selectedDateValue,
  pickerVisible,
  onTogglePicker,
  onClosePicker,
  onSelectDate,
}: {
  selectedDate: string;
  selectedDateValue: Date;
  pickerVisible: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  onSelectDate: (date: Date) => void;
}) {
  const { colors: themeColors, mode } = useAppTheme();
  const { t, resolved } = useAppLocalization();
  const [draftDate, setDraftDate] = useState(selectedDateValue);
  const relativeLabel = formatDateLabel(selectedDate);
  const fullLabel = formatDate(selectedDateValue, {
    day: "numeric",
    month: "long",
    weekday: "short",
  });

  return (
    <View style={styles.headerBlock}>
      <View style={styles.headerCopy}>
        <Text
          style={[
            typography.headlineLgMobile,
            { color: themeColors.onSurface },
          ]}
        >
          {t("migrated.nutrition_018")}
        </Text>
        <Text
          style={[typography.labelMd, { color: themeColors.onSurfaceVariant }]}
        >
          {t("migrated.nutrition_019")}
        </Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${t("migrated.nutrition_020")}, ${relativeLabel}`}
        style={[
          styles.dateChip,
          {
            backgroundColor: themeColors.surfaceContainerLow,
            borderColor: themeColors.outlineVariant,
          },
        ]}
        onPress={onTogglePicker}
        activeOpacity={0.82}
      >
        <View
          style={[
            styles.dateChipIcon,
            { backgroundColor: `${themeColors.primary}12` },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={18}
            color={themeColors.primary}
          />
        </View>
        <View style={styles.dateChipCopy}>
          <Text
            style={[styles.dateChipLabel, { color: themeColors.onSurface }]}
          >
            {relativeLabel}
          </Text>
          <Text
            style={[
              styles.dateChipSub,
              { color: themeColors.onSurfaceVariant },
            ]}
          >
            {fullLabel}
          </Text>
        </View>
        <Ionicons
          name={pickerVisible ? "chevron-up" : "chevron-down"}
          size={18}
          color={themeColors.onSurfaceVariant}
        />
      </TouchableOpacity>

      {pickerVisible ? (
        <GlassCard
          variant="panel"
          style={[
            styles.datePickerPanel,
            {
              backgroundColor: themeColors.surfaceContainerLowest,
              borderColor: themeColors.outlineVariant,
            },
          ]}
        >
          <View
            style={[
              styles.datePickerSurface,
              {
                backgroundColor: themeColors.surfaceContainerLow,
                borderColor: `${themeColors.primary}18`,
              },
            ]}
          >
            <DateTimePicker
              value={draftDate}
              mode="date"
              maximumDate={new Date()}
              locale={resolved.localeTag}
              display={process.env.EXPO_OS === "ios" ? "inline" : "default"}
              themeVariant={mode === "dark" ? "dark" : "light"}
              accentColor={themeColors.primary}
              textColor={themeColors.onSurface}
              design={
                process.env.EXPO_OS === "android" ? "material" : undefined
              }
              title={
                process.env.EXPO_OS === "android"
                  ? t("migrated.nutrition_020")
                  : undefined
              }
              positiveButton={
                process.env.EXPO_OS === "android"
                  ? {
                      label: t("migrated.nutrition_021"),
                      textColor: themeColors.primary,
                    }
                  : undefined
              }
              negativeButton={
                process.env.EXPO_OS === "android"
                  ? {
                      label: t("migrated.nutrition_022"),
                      textColor: themeColors.onSurfaceVariant,
                    }
                  : undefined
              }
              onChange={(event, nextDate) => {
                if (process.env.EXPO_OS !== "ios") onClosePicker();
                if (event.type === "dismissed" || !nextDate) return;
                if (process.env.EXPO_OS === "ios") setDraftDate(nextDate);
                else onSelectDate(nextDate);
              }}
            />
          </View>
          {process.env.EXPO_OS === "ios" ? (
            <View style={styles.datePickerFooter}>
              <TouchableOpacity
                accessibilityRole="button"
                style={[
                  styles.datePickerButton,
                  {
                    backgroundColor: themeColors.surfaceContainerLow,
                    borderColor: themeColors.outlineVariant,
                  },
                ]}
                onPress={() => setDraftDate(new Date())}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.datePickerButtonText,
                    { color: themeColors.onSurface },
                  ]}
                >
                  {t("migrated.nutrition_023")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                style={[
                  styles.datePickerButton,
                  {
                    backgroundColor: themeColors.primary,
                    borderColor: themeColors.primary,
                  },
                ]}
                onPress={() => {
                  onSelectDate(draftDate);
                  onClosePicker();
                }}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.datePickerButtonText,
                    { color: themeColors.onPrimary },
                  ]}
                >
                  {t("migrated.nutrition_021")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </GlassCard>
      ) : null}
    </View>
  );
}

function SummaryGrid({
  consumed,
  goal,
  weeklyMealCount,
  waterMl,
  waterGoalMl,
  weightKg,
  onAddWater,
  onResetWater,
  onOpenInsights,
  onOpenWater,
}: {
  consumed: { kcal: number; protein: number; carbs: number; fat: number };
  goal: number;
  weeklyMealCount: number;
  waterMl: number;
  waterGoalMl: number;
  weightKg?: number;
  onAddWater: (amountMl: number) => void;
  onResetWater: () => void;
  onOpenInsights: () => void;
  onOpenWater: () => void;
}) {
  return (
    <View style={styles.summaryWrapper}>
      <CaloriesSummary
        consumed={consumed}
        goal={goal}
        weeklyMealCount={weeklyMealCount}
        onOpenInsights={onOpenInsights}
      />
      <WaterCard
        waterMl={waterMl}
        goalMl={waterGoalMl}
        weightKg={weightKg}
        onAddWater={onAddWater}
        onReset={onResetWater}
        onOpenDetails={onOpenWater}
      />
    </View>
  );
}

function CaloriesSummary({
  consumed,
  goal,
  weeklyMealCount,
  onOpenInsights,
}: {
  consumed: { kcal: number; protein: number; carbs: number; fat: number };
  goal: number;
  weeklyMealCount: number;
  onOpenInsights: () => void;
}) {
  const { colors: themeColors } = useAppTheme();
  const { t } = useAppLocalization();
  const progress = goal > 0 ? Math.min((consumed.kcal / goal) * 100, 100) : 0;

  return (
    <GlassCard
      style={[
        styles.caloriesCard,
        {
          backgroundColor: themeColors.surfaceContainerLow,
          borderColor: themeColors.outlineVariant,
        },
      ]}
    >
      <View
        style={[
          styles.caloriesGlow,
          { backgroundColor: `${themeColors.primary}18` },
        ]}
      />
      <View style={styles.cardContent}>
        <View style={styles.calorieSummaryHeader}>
          <View style={styles.calorieSummaryHeading}>
            <View
              style={[
                styles.calorieSummaryIcon,
                { backgroundColor: `${themeColors.primary}14` },
              ]}
            >
              <Ionicons
                name="pie-chart-outline"
                size={18}
                color={themeColors.primary}
              />
            </View>
            <View style={styles.calorieSummaryCopy}>
              <Text
                style={[
                  styles.calorieSummaryTitle,
                  { color: themeColors.onSurface },
                ]}
              >
                {t("migrated.nutrition_024")}
                <Text style={{ color: themeColors.primary }}>
                  {t("migrated.nutrition_025")}
                </Text>
              </Text>
              <Text
                style={[
                  styles.calorieSummaryBody,
                  { color: themeColors.onSurfaceVariant },
                ]}
              >
                {t("migrated.nutrition_026")}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("migrated.nutrition_027")}
            onPress={onOpenInsights}
            activeOpacity={0.8}
            style={[
              styles.calorieDetailButton,
              { backgroundColor: `${themeColors.primary}12` },
            ]}
          >
            <Text
              style={[styles.calorieDetailText, { color: themeColors.primary }]}
            >
              {t("migrated.nutrition_028")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={15}
              color={themeColors.primary}
            />
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.weeklyMealPill,
            { backgroundColor: `${themeColors.primary}10` },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={13}
            color={themeColors.primary}
          />
          <Text style={[styles.weeklyMealText, { color: themeColors.primary }]}>
            {t("migrated.nutrition_dynamic_002").replace(
              "{count}",
              `${weeklyMealCount}`,
            )}
          </Text>
        </View>

        <View style={styles.caloriesRow}>
          <Text
            style={[typography.displayLg, { color: themeColors.onSurface }]}
          >
            {formatNumber(Math.round(consumed.kcal))}
          </Text>
          <Text
            style={[typography.bodyLg, { color: themeColors.onSurface }]}
          >
            / {formatNumber(goal)} kcal
          </Text>
        </View>

        <View style={styles.caloriesBar}>
          <MacroBar
            progress={progress}
            color={themeColors.tertiary}
            glowColor={`${themeColors.tertiary}47`}
            height={8}
          />
        </View>

        <View style={styles.macroSummary}>
          <MacroStat
            label={t("migrated.nutrition_029")}
            value={`${Math.round(consumed.protein)}`}
            unit="g"
            accent={themeColors.success}
          />
          <MacroStat
            label={t("migrated.nutrition_030")}
            value={`${Math.round(consumed.carbs)}`}
            unit="g"
            accent={themeColors.secondary}
          />
          <MacroStat
            label={t("migrated.nutrition_031")}
            value={`${Math.round(consumed.fat)}`}
            unit="g"
            accent={themeColors.tertiary}
          />
        </View>
      </View>
    </GlassCard>
  );
}

function MacroStat({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent: string;
}) {
  const { colors: themeColors } = useAppTheme();

  return (
    <View>
      <Text style={[typography.labelXs, { color: accent }]}>
        {label.toLocaleUpperCase()}
      </Text>
      <Text style={[typography.headlineMd, { color: themeColors.onSurface }]}>
        {value}
        <Text
          style={[typography.bodySm, { color: themeColors.onSurface }]}
        >
          {" "}
          {unit}
        </Text>
      </Text>
    </View>
  );
}

function WaterCard({
  waterMl,
  goalMl,
  weightKg,
  onAddWater,
  onReset,
  onOpenDetails,
}: {
  waterMl: number;
  goalMl: number;
  weightKg?: number;
  onAddWater: (amountMl: number) => void;
  onReset: () => void;
  onOpenDetails: () => void;
}) {
  const { colors: themeColors } = useAppTheme();
  const { t } = useAppLocalization();
  const pct = goalMl > 0 ? Math.min((waterMl / goalMl) * 100, 100) : 0;

  return (
    <GlassCard
      style={[
        styles.waterCard,
        {
          backgroundColor: themeColors.surfaceContainerLow,
          borderColor: themeColors.outlineVariant,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.waterGlow,
          { backgroundColor: `${themeColors.tertiary}18` },
        ]}
      />
      <View style={styles.waterContent}>
        <View style={styles.waterHeader}>
          <View style={styles.waterHeading}>
            <View
              style={[
                styles.waterIcon,
                { backgroundColor: `${themeColors.tertiary}16` },
              ]}
            >
              <Ionicons name="water" size={20} color={themeColors.tertiary} />
            </View>
            <View>
              <Text
                style={[styles.waterTitle, { color: themeColors.onSurface }]}
              >
                {t("migrated.nutrition_032")}
                <Text style={{ color: themeColors.tertiary }}>
                  {t("migrated.nutrition_033")}
                </Text>
              </Text>
              <Text
                style={[
                  styles.waterSubtitle,
                  { color: themeColors.onSurfaceVariant },
                ]}
              >
                {t("migrated.nutrition_034")}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("migrated.nutrition_035")}
            onPress={onOpenDetails}
            activeOpacity={0.8}
            style={[
              styles.waterDetailButton,
              { backgroundColor: `${themeColors.tertiary}12` },
            ]}
          >
            <Text
              style={[styles.waterDetailText, { color: themeColors.tertiary }]}
            >
              {t("migrated.nutrition_028")}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={15}
              color={themeColors.tertiary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.waterMainRow}>
          <View style={styles.waterMetricColumn}>
            <View style={styles.waterValue}>
              <Text
                style={[
                  typography.headlineLgMobile,
                  { color: themeColors.onSurface },
                ]}
              >
                {formatLiquidValue(waterMl)}
              </Text>
              <Text
                style={[
                  typography.bodyMd,
                  { color: themeColors.onSurface },
                ]}
              >
                / {formatLiquidValue(goalMl)} {liquidUnitLabel()}
              </Text>
            </View>
            <MacroBar
              progress={pct}
              color={themeColors.secondary}
              glowColor={`${themeColors.secondary}47`}
              height={9}
            />
            <Text
              style={[
                styles.waterFormula,
                { color: themeColors.onSurfaceVariant },
              ]}
            >
              {weightKg
                ? t("migrated.nutrition_dynamic_003")
                    .replace("{weight}", formatWeightValue(weightKg))
                    .replace("{unit}", weightUnitLabel())
                : t("migrated.nutrition_036")}
            </Text>
          </View>
          <HydrationBottle progress={pct} size={78} />
        </View>

        <View style={styles.waterButtons}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("migrated.nutrition_037")}
            disabled={waterMl === 0}
            style={[
              styles.waterBtn,
              {
                opacity: waterMl === 0 ? 0.4 : 1,
                borderColor: themeColors.outlineVariant,
              },
            ]}
            onPress={() => onAddWater(-250)}
            activeOpacity={0.75}
          >
            <Ionicons name="remove" size={16} color={themeColors.onSurface} />
            <Text
              style={[typography.labelMd, { color: themeColors.onSurface }]}
            >
              250 ml
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("migrated.nutrition_038")}
            style={[
              styles.waterBtnPrimary,
              { backgroundColor: themeColors.tertiary },
            ]}
            onPress={() => onAddWater(250)}
            activeOpacity={0.75}
          >
            <Ionicons name="add" size={16} color={themeColors.onTertiary} />
            <Text
              style={[typography.labelMd, { color: themeColors.onTertiary }]}
            >
              250 ml
            </Text>
          </TouchableOpacity>
        </View>
        {waterMl > 0 ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t("migrated.nutrition_039")}
            onPress={onReset}
            activeOpacity={0.76}
            style={[
              styles.waterResetBtn,
              { borderColor: `${themeColors.outlineVariant}66` },
            ]}
          >
            <Ionicons
              name="refresh-outline"
              size={15}
              color={themeColors.onSurface}
            />
            <Text
              style={[typography.buttonSm, { color: themeColors.onSurface }]}
            >
              {t("migrated.nutrition_039")}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </GlassCard>
  );
}

function MealCard({ meal, onDelete }: { meal: Meal; onDelete: () => void }) {
  const { colors: themeColors } = useAppTheme();
  const time = formatDate(meal.createdAt, {
    hour: "2-digit",
    minute: "2-digit",
  });
  const accent = mealAccent(meal.mealType);

  return (
    <GlassCard
      style={[
        styles.mealCard,
        {
          borderLeftColor: accent,
          backgroundColor: themeColors.surfaceContainerLowest,
        },
      ]}
    >
      <View style={styles.mealPrimaryRow}>
        <View style={[styles.mealImage, { backgroundColor: `${accent}16` }]}>
          {meal.imageUrl ? (
            <ExpoImage
              source={{ uri: meal.imageUrl }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              cachePolicy="disk"
              transition={160}
            />
          ) : (
            <Ionicons
              name={meal.source === "api" ? "cloud" : "create"}
              size={24}
              color={accent}
            />
          )}
        </View>
        <View style={styles.mealInfo}>
          <View style={styles.mealNameCol}>
            <Text
              style={[typography.cardTitle, { color: themeColors.onSurface }]}
              numberOfLines={2}
            >
              {meal.name}
            </Text>
            <Text
              style={[
                typography.bodyXs,
                { color: themeColors.onSurfaceVariant },
              ]}
              numberOfLines={1}
            >
              {meal.portion}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={[
            styles.mealDelete,
            { backgroundColor: themeColors.surfaceContainerLow },
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={17}
            color={themeColors.outline}
          />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.mealDivider,
          { backgroundColor: themeColors.outlineVariant },
        ]}
      />
      <View style={styles.mealBottomRow}>
        <View style={styles.mealEnergy}>
          <Text style={[styles.mealKcal, { color: accent }]}>
            {formatNumber(meal.kcal)} kcal
          </Text>
          <Text
            style={[styles.mealTime, { color: themeColors.onSurfaceVariant }]}
          >
            {time}
          </Text>
        </View>
        <View style={styles.macroTags}>
          <MacroTag label={`P ${meal.protein}g`} color={themeColors.success} />
          <MacroTag label={`K ${meal.carbs}g`} color={themeColors.secondary} />
          <MacroTag label={`Y ${meal.fat}g`} color={themeColors.tertiary} />
        </View>
      </View>
    </GlassCard>
  );
}

function MacroTag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.macroTag, { backgroundColor: `${color}12` }]}>
      <Text style={[typography.labelXs, { color }]}>{label}</Text>
    </View>
  );
}

function TipCard() {
  const { colors: themeColors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <GlassCard
      style={[
        styles.tipCard,
        {
          backgroundColor: themeColors.surfaceContainerLow,
          borderColor: themeColors.outlineVariant,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.tipGlow,
          { backgroundColor: `${themeColors.tertiary}18` },
        ]}
      />
      <View style={styles.tipContent}>
        <View
          style={[
            styles.tipIcon,
            { backgroundColor: `${themeColors.tertiary}16` },
          ]}
        >
          <Ionicons
            name="bulb-outline"
            size={21}
            color={themeColors.tertiary}
          />
        </View>
        <View style={styles.tipCopy}>
          <Text style={[styles.tipTitle, { color: themeColors.onSurface }]}>
            {t("migrated.nutrition_040")}
            <Text style={{ color: themeColors.tertiary }}>
              {t("migrated.nutrition_041")}
            </Text>
          </Text>
          <Text
            style={[styles.tipBody, { color: themeColors.onSurfaceVariant }]}
          >
            {t("migrated.nutrition_042")}
          </Text>
        </View>
      </View>
    </GlassCard>
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
  headerBlock: { gap: spacing.smPlus },
  headerCopy: { gap: 4 },
  dateChip: {
    minHeight: 64,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    paddingHorizontal: spacing.smPlus,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  dateChipIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  dateChipCopy: { flex: 1, gap: 2 },
  dateChipLabel: { ...typography.cardTitle },
  dateChipSub: { ...typography.bodyXs },
  datePickerPanel: { padding: spacing.xs + 2, overflow: "hidden" },
  datePickerSurface: {
    borderRadius: radius["2xl"],
    borderWidth: 1,
    overflow: "hidden",
  },
  datePickerFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
    paddingBottom: 4,
  },
  datePickerButton: {
    minHeight: 44,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.smPlus,
    alignItems: "center",
    justifyContent: "center",
  },
  datePickerButtonText: { ...typography.buttonSm },
  summaryWrapper: { gap: spacing.gutter },
  caloriesCard: { padding: spacing.xl, overflow: "hidden" },
  caloriesGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 168,
    height: 168,
    borderRadius: radius.full,
    opacity: 0.75,
  },
  cardContent: { zIndex: 1 },
  calorieSummaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.xs + 2,
  },
  calorieSummaryHeading: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  calorieSummaryIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  calorieSummaryCopy: { flex: 1, minWidth: 0 },
  calorieSummaryTitle: { ...typography.cardTitle },
  calorieSummaryBody: { ...typography.bodyXs },
  calorieDetailButton: {
    minHeight: 42,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  calorieDetailText: { ...typography.buttonSm },
  weeklyMealPill: {
    alignSelf: "flex-start",
    minHeight: 26,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs + 2,
    marginTop: spacing.smPlus,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 2,
  },
  weeklyMealText: { ...typography.buttonSm },
  caloriesRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  caloriesBar: { marginTop: spacing.xl },
  macroSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopColor: `${colors.outlineVariant}33`,
    borderTopWidth: 1,
  },
  waterCard: { padding: spacing.lg, overflow: "hidden" },
  waterGlow: {
    position: "absolute",
    width: 144,
    height: 144,
    borderRadius: 72,
    top: -72,
    right: -36,
    opacity: 0.72,
  },
  waterContent: { zIndex: 1, gap: spacing.md },
  waterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs + 2,
  },
  waterHeading: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  waterIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  waterTitle: { ...typography.cardTitle },
  waterSubtitle: { ...typography.bodyXs },
  waterDetailButton: {
    minHeight: 42,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  waterDetailText: { ...typography.buttonSm },
  waterMainRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  waterMetricColumn: { flex: 1, minWidth: 0, gap: spacing.smPlus },
  waterValue: { flexDirection: "row", alignItems: "baseline", gap: spacing.xs },
  waterFormula: { ...typography.bodyXs },
  waterButtons: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  waterBtn: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  waterBtnPrimary: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  waterResetBtn: {
    minHeight: 38,
    marginTop: spacing.xs + 2,
    borderWidth: 1,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs - 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  sectionHeadingRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  sectionHeadingCopy: { flex: 1, minWidth: 0 },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  mealsTitle: { ...typography.cardTitle },
  sectionBody: { ...typography.bodySm, color: colors.outline, marginTop: 4 },
  addButton: {
    minHeight: 42,
    borderRadius: radius.full,
    paddingHorizontal: spacing.smPlus,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 1,
  },
  mealsPanel: { padding: spacing.cardPadding, overflow: "hidden" },
  mealsPanelGlow: {
    position: "absolute",
    width: 148,
    height: 148,
    borderRadius: 74,
    top: -74,
    right: -40,
    opacity: 0.7,
  },
  mealsPanelContent: { zIndex: 1, gap: spacing.md },
  mealsOverview: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs + 2,
  },
  mealsOverviewPill: {
    minHeight: 26,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs + 2,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 2,
  },
  mealsOverviewText: { ...typography.buttonSm },
  mealsOverviewKcal: { ...typography.numericMd },
  mealsList: { gap: spacing.mdPlus },
  mealGroup: { gap: spacing.sm },
  mealGroupGap: { marginTop: spacing.xs },
  mealGroupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  mealGroupTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  mealGroupDot: { width: 8, height: 8, borderRadius: 4 },
  groupCaloriePill: {
    minHeight: 26,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs + 2,
    alignItems: "center",
    justifyContent: "center",
  },
  mealsEmpty: {
    alignItems: "center",
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  emptyMealIcon: {
    width: 54,
    height: 54,
    borderRadius: radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyMealTitle: { ...typography.cardTitle },
  emptyMealBody: { ...typography.bodySm, textAlign: "center", maxWidth: 260 },
  emptyMealButton: {
    minHeight: 44,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.smPlus,
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 2,
  },
  emptyMealButtonText: { ...typography.buttonSm },
  mealCard: { gap: spacing.sm, padding: 15, borderLeftWidth: 4 },
  mealPrimaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  mealNameCol: { flex: 1, minWidth: 0, gap: 2 },
  mealDelete: { padding: 6, alignSelf: "flex-start" },
  mealImage: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mealInfo: { flex: 1, minWidth: 0 },
  mealDivider: { height: StyleSheet.hairlineWidth, opacity: 0.7 },
  mealBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs + 2,
  },
  mealEnergy: { gap: 1 },
  mealKcal: { ...typography.labelMd, fontVariant: ["tabular-nums"] },
  mealTime: { ...typography.labelXs },
  macroTags: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 5,
    flexWrap: "wrap",
  },
  macroTag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  tipCard: { padding: spacing.cardPadding, overflow: "hidden" },
  tipGlow: {
    position: "absolute",
    width: 118,
    height: 118,
    borderRadius: 59,
    right: -48,
    top: -52,
    opacity: 0.72,
  },
  tipContent: {
    zIndex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  tipCopy: { flex: 1, minWidth: 0, gap: spacing.xs - 3 },
  tipTitle: { ...typography.cardTitle },
  tipBody: { ...typography.bodySm },
}));
