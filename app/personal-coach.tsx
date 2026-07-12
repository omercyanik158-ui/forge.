import { useCallback, useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppLocalization } from "@/providers/localization-context";
import {
  loadCoachPreferences,
  saveCoachPreferences,
  selectAutomaticHomeCards,
} from "@/services/coachPreferences";
import {
  loadCycleTracking,
  summarizeCycleTracking,
} from "@/services/cycleTracking";
import { formatNumber } from "@/services/localization";
import {
  loadCoachSnapshot,
  type CoachSnapshot,
} from "@/services/personalCoach";
import { loadProfile } from "@/services/profileStore";
import { canAccessTrainingInsights } from "@/services/subscription";
import {
  createDynamicStyles,
  layout,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { CoachPreferences, UserProfile } from "@/types";

const LIMITATIONS: CoachPreferences["limitations"] = [
  "knee",
  "back",
  "shoulder",
];

export default function PersonalCoachScreen() {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [snapshot, setSnapshot] = useState<CoachSnapshot | null>(null);
  const [preferences, setPreferences] = useState<CoachPreferences | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const refresh = useCallback(async () => {
    const [loadedProfile, prefs, cycle] = await Promise.all([
      loadProfile(),
      loadCoachPreferences(),
      loadCycleTracking(),
    ]);
    setProfile(loadedProfile);
    setPreferences(prefs);
    if (loadedProfile) {
      setSnapshot(
        await loadCoachSnapshot(
          loadedProfile,
          prefs,
          loadedProfile.gender === "female"
            ? summarizeCycleTracking(cycle)
            : null,
        ),
      );
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const update = async (next: Partial<CoachPreferences>) => {
    const saved = await saveCoachPreferences(next);
    setPreferences(saved);
    await refresh();
  };
  const toggleLimitation = (key: CoachPreferences["limitations"][number]) => {
    if (!preferences) return;
    const next = preferences.limitations.includes(key)
      ? preferences.limitations.filter((item) => item !== key)
      : [...preferences.limitations, key];
    void update({ limitations: next });
  };

  const autoHomeCards = selectAutomaticHomeCards({
    hasMealsToday: snapshot ? snapshot.nextAction !== "log_meal" : false,
    weeklyMealCount: snapshot?.weekly.mealDays ?? 0,
    weeklyWorkoutCount: snapshot?.weekly.sessions ?? 0,
    streakCount: profile?.streak?.count ?? 0,
    hasAnalysis: (snapshot?.weekly.sessions ?? 0) > 0,
    canAccessAnalysis: canAccessTrainingInsights(profile),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t("coach.screen_title")} />
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
        {snapshot ? (
          <>
            <GlassCard style={styles.hero}>
              <View
                style={[
                  styles.score,
                  { backgroundColor: `${colors.primary}18` },
                ]}
              >
                <Text style={[styles.scoreValue, { color: colors.primary }]}>
                  {snapshot.score}
                </Text>
                <Text
                  style={[
                    styles.scoreLabel,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {t("coach.score")}
                </Text>
              </View>
              <View style={styles.flex}>
                <Text style={[styles.heroTitle, { color: colors.onSurface }]}>
                  {t(`coach.action_${snapshot.nextAction}`)}
                </Text>
                <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
                  {t("coach.hero_body")}
                </Text>
              </View>
            </GlassCard>

            <GlassCard variant="panel" style={styles.card}>
              <Text style={[styles.title, { color: colors.onSurface }]}>
                {t("coach.weekly_title")}
              </Text>
              <View style={styles.grid}>
                <Stat
                  label={t("coach.sessions")}
                  value={`${snapshot.weekly.sessions}`}
                />
                <Stat
                  label={t("coach.minutes")}
                  value={`${snapshot.weekly.minutes}`}
                />
                <Stat
                  label={t("coach.volume")}
                  value={formatNumber(Math.round(snapshot.weekly.volumeKg))}
                />
              </View>
              <Habit
                label={t("coach.workout_habit")}
                value={snapshot.habits.workout}
              />
              <Habit
                label={t("coach.nutrition_habit")}
                value={snapshot.habits.nutrition}
              />
              <Habit
                label={t("coach.water_habit")}
                value={snapshot.habits.water}
              />
            </GlassCard>

            {snapshot.strengthSuggestion ? (
              <GlassCard variant="panel" style={styles.card}>
                <Text style={[styles.title, { color: colors.onSurface }]}>
                  {t("coach.load_title")}
                </Text>
                <Text style={[styles.callout, { color: colors.primary }]}>
                  {snapshot.strengthSuggestion.exerciseName}:{" "}
                  {snapshot.strengthSuggestion.kg} kg x{" "}
                  {snapshot.strengthSuggestion.reps}
                </Text>
                <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
                  {t("coach.load_body")}
                </Text>
              </GlassCard>
            ) : null}

            {snapshot.cycle ? (
              <GlassCard variant="panel" style={styles.card}>
                <Text style={[styles.title, { color: colors.onSurface }]}>
                  {t("coach.cycle_reflects_title")}
                </Text>
                <Text style={[styles.callout, { color: colors.secondary }]}>
                  {t(`coach.intensity_${snapshot.cycleIntensity}`)}
                </Text>
                <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
                  {t("coach.cycle_reflects_body")}
                </Text>
              </GlassCard>
            ) : null}

            <GlassCard variant="panel" style={styles.card}>
              <Text style={[styles.title, { color: colors.onSurface }]}>
                {t("coach.recipe_title")}
              </Text>
              {snapshot.recipes.map((recipe) => (
                <View
                  key={recipe.id}
                  style={[
                    styles.recipe,
                    { backgroundColor: colors.surfaceContainerLow },
                  ]}
                >
                  <View style={styles.flex}>
                    <Text
                      style={[styles.recipeTitle, { color: colors.onSurface }]}
                    >
                      {t(recipe.titleKey)}
                    </Text>
                    <Text
                      style={[styles.body, { color: colors.onSurfaceVariant }]}
                    >
                      {t(recipe.detailKey)}
                    </Text>
                  </View>
                  <Text style={[styles.recipeMacro, { color: colors.primary }]}>
                    {recipe.kcal} kcal{`\n`}
                    {recipe.protein}g P
                  </Text>
                </View>
              ))}
            </GlassCard>

            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: "/ai", params: { mode: "physique" } })
              }
              style={[
                styles.photoButton,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.onSecondary}
              />
              <Text style={[styles.buttonText, { color: colors.onSecondary }]}>
                {t("coach.photo_progress")}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}

        {preferences ? (
          <GlassCard variant="panel" style={styles.card}>
            <Text style={[styles.title, { color: colors.onSurface }]}>
              {t("coach.preferences_title")}
            </Text>
            <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
              {t("coach.preferences_intro")}
            </Text>

            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
              {t("coach.equipment")}
            </Text>
            <View style={styles.chips}>
              {(["gym", "home", "bodyweight"] as const).map((item) => (
                <Chip
                  key={item}
                  label={t(`coach.equipment_${item}`)}
                  active={preferences.equipment === item}
                  onPress={() => void update({ equipment: item })}
                />
              ))}
            </View>

            <Text style={[styles.label, { color: colors.onSurfaceVariant }]}>
              {t("coach.limitations")}
            </Text>
            <View style={styles.chips}>
              <Chip
                label={t("coach.limitations_none")}
                active={preferences.limitations.length === 0}
                onPress={() => void update({ limitations: [] })}
              />
              {LIMITATIONS.map((item) => (
                <Chip
                  key={item}
                  label={t(`coach.limitation_${item}`)}
                  active={preferences.limitations.includes(item)}
                  onPress={() => toggleLimitation(item)}
                />
              ))}
            </View>

            <View
              style={[
                styles.switchCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.flex}>
                <Text style={[styles.recipeTitle, { color: colors.onSurface }]}>
                  {t("coach.adaptive_reminders_friendly")}
                </Text>
                <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
                  {t("coach.adaptive_reminders_body")}
                </Text>
              </View>
              <Switch
                value={preferences.adaptiveReminders}
                onValueChange={(value) =>
                  void update({ adaptiveReminders: value })
                }
                trackColor={{
                  false: colors.surfaceContainerHighest,
                  true: `${colors.primary}88`,
                }}
                thumbColor={
                  preferences.adaptiveReminders
                    ? colors.primary
                    : colors.onSurfaceVariant
                }
                ios_backgroundColor={colors.surfaceContainerHighest}
              />
            </View>

            <View
              style={[
                styles.autoCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View
                style={[
                  styles.autoBadge,
                  { backgroundColor: `${colors.secondary}14` },
                ]}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={15}
                  color={colors.secondary}
                />
                <Text
                  style={[styles.autoBadgeText, { color: colors.secondary }]}
                >
                  {t("coach.auto_mode")}
                </Text>
              </View>
              <Text style={[styles.recipeTitle, { color: colors.onSurface }]}>
                {t("coach.home_cards_auto_title")}
              </Text>
              <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
                {t("coach.home_cards_auto_body")}
              </Text>
              <View style={styles.autoChips}>
                {autoHomeCards.map((item) => (
                  <View
                    key={item}
                    style={[
                      styles.autoChip,
                      { backgroundColor: colors.surfaceContainerHighest },
                    ]}
                  >
                    <Text
                      style={[styles.autoChipText, { color: colors.onSurface }]}
                    >
                      {t(`coach.card_${item}`)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </GlassCard>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[styles.stat, { backgroundColor: colors.surfaceContainerLow }]}
    >
      <Text style={[styles.statValue, { color: colors.onSurface }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>
        {label}
      </Text>
    </View>
  );
}

function Habit({ label, value }: { label: string; value: number }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.habit}>
      <View style={styles.habitHead}>
        <Text style={[styles.body, { color: colors.onSurface }]}>{label}</Text>
        <Text style={[styles.body, { color: colors.primary }]}>{value}%</Text>
      </View>
      <View
        style={[styles.track, { backgroundColor: colors.surfaceContainerHigh }]}
      >
        <View
          style={[
            styles.fill,
            { width: `${value}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surfaceContainerLow,
          borderColor: active ? colors.primary : colors.outlineVariant,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? colors.onPrimary : colors.onSurface },
        ]}
      >
        {label}
      </Text>
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
    gap: 14,
  },
  hero: { padding: 18, flexDirection: "row", gap: 16, alignItems: "center" },
  score: {
    width: 82,
    height: 82,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: { ...typography.displayLgMobile, fontSize: 30 },
  scoreLabel: { ...typography.labelXs },
  flex: { flex: 1 },
  heroTitle: { ...typography.headlineMd },
  body: { ...typography.bodySm },
  card: { padding: 18, gap: 14 },
  title: { ...typography.headlineMd },
  callout: { ...typography.headlineMd, fontSize: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stat: { flexBasis: "47%", flexGrow: 1, borderRadius: 14, padding: 12 },
  statValue: { ...typography.headlineMd },
  statLabel: { ...typography.bodySm },
  habit: { gap: 6 },
  habitHead: { flexDirection: "row", justifyContent: "space-between" },
  track: { height: 8, borderRadius: 99, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 99 },
  recipe: { borderRadius: 14, padding: 14, flexDirection: "row", gap: 12 },
  recipeTitle: { ...typography.labelMd },
  recipeMacro: { ...typography.labelMd, textAlign: "right" },
  photoButton: {
    minHeight: 52,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: { ...typography.labelMd },
  label: { ...typography.labelCaps },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    borderWidth: 1,
    justifyContent: "center",
  },
  chipText: { ...typography.labelMd },
  switchCard: {
    minHeight: 82,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  autoCard: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 10 },
  autoBadge: {
    alignSelf: "flex-start",
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  autoBadgeText: { ...typography.labelCaps },
  autoChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  autoChip: {
    minHeight: 34,
    borderRadius: 17,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  autoChipText: { ...typography.labelMd, fontSize: 12, lineHeight: 16 },
}));
