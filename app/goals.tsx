import {
  createDynamicStyles,
  layout,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { GlassCard } from "@/components/GlassCard";
import { MacroBar } from "@/components/MacroBar";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppLocalization } from "@/providers/localization-context";
import { goalProgress } from "@/services/calculations";
import { refreshAchievements } from "@/services/achievementStore";
import { loadMeals } from "@/services/mealStore";
import { safeGoBack } from "@/services/navigation";
import { loadProfile, saveProfile } from "@/services/profileStore";
import {
  selectionFeedback,
  successFeedback,
} from "@/services/interactionFeedback";
import type { ActivityLevel, GoalType, UserProfile } from "@/types";

const GOAL_OPTIONS: {
  value: GoalType;
  label: { tr: string; en: string };
  desc: { tr: string; en: string };
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    value: "gain",
    label: { tr: "Kas artışı", en: "Muscle gain" },
    desc: {
      tr: "Güç ve kas kütlesini artır",
      en: "Increase strength and muscle mass",
    },
    icon: "trending-up",
    color: "#45627f",
  },
  {
    value: "loss",
    label: { tr: "Yağ kaybı", en: "Fat loss" },
    desc: {
      tr: "Yağ oranını kontrollü azalt",
      en: "Reduce body fat in a controlled way",
    },
    icon: "trending-down",
    color: "#0f6a64",
  },
  {
    value: "maintain",
    label: { tr: "Koruma", en: "Maintain" },
    desc: {
      tr: "Kilonu ve performansını koru",
      en: "Maintain your weight and performance",
    },
    icon: "shield-checkmark-outline",
    color: "#b85637",
  },
];

const ACTIVITY_OPTIONS: {
  value: ActivityLevel;
  label: { tr: string; en: string };
  sub: { tr: string; en: string };
}[] = [
  {
    value: "sedentary",
    label: { tr: "Düşük", en: "Low" },
    sub: { tr: "Spor yapmıyorum", en: "I do not exercise" },
  },
  {
    value: "light",
    label: { tr: "Hafif", en: "Light" },
    sub: { tr: "Haftada 1-3 gün", en: "1-3 days per week" },
  },
  {
    value: "moderate",
    label: { tr: "Düzenli", en: "Regular" },
    sub: { tr: "Haftada 3-5 gün", en: "3-5 days per week" },
  },
  {
    value: "active",
    label: { tr: "Yüksek", en: "High" },
    sub: { tr: "Haftada 6-7 gün", en: "6-7 days per week" },
  },
  {
    value: "very_active",
    label: { tr: "Çok yüksek", en: "Very high" },
    sub: { tr: "Günde 2 antrenman", en: "2 sessions per day" },
  },
];

export default function GoalsScreen() {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [targetWeight, setTargetWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const loadedProfile = await loadProfile();
    setProfile(loadedProfile);
    if (loadedProfile?.goalType) setGoalType(loadedProfile.goalType);
    if (loadedProfile?.targetWeightKg != null)
      setTargetWeight(String(loadedProfile.targetWeightKg));
    if (loadedProfile?.activityLevel)
      setActivityLevel(loadedProfile.activityLevel);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  async function handleSave() {
    if (!goalType) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      const existing = await loadProfile();
      if (!existing) return;
      const updated: UserProfile = {
        ...existing,
        goalType,
        activityLevel,
        targetWeightKg:
          goalType === "maintain"
            ? undefined
            : Number(targetWeight) || undefined,
        startWeightKg:
          goalType === "maintain"
            ? undefined
            : existing.goalType === goalType
              ? (existing.startWeightKg ?? existing.weightKg)
              : existing.weightKg,
      };
      await saveProfile(updated);
      successFeedback();
      await refreshAchievements(updated, await loadMeals());
      safeGoBack(router);
    } catch {
      Alert.alert(
        t({ tr: "Hedef kaydedilemedi", en: "Goal could not be saved" }),
        t({
          tr: "Değişiklikler cihazına yazılamadı. Tekrar deneyebilirsin.",
          en: "Changes could not be saved to your device. Please try again.",
        }),
      );
    } finally {
      setSaving(false);
    }
  }

  const currentWeight = profile?.weightKg ?? 0;
  const target = profile?.targetWeightKg;
  const hasGoal =
    profile?.goalType && profile.goalType !== "maintain" && target != null;
  const progressState = profile ? goalProgress(profile) : null;
  const progress = progressState?.pct ?? 0;
  const remaining = progressState?.remainingKg ?? 0;
  const selectedGoal = GOAL_OPTIONS.find((option) => option.value === goalType);
  const savedGoal = GOAL_OPTIONS.find(
    (option) => option.value === profile?.goalType,
  );
  const targetRequired = goalType === "loss";
  const targetNumber = Number(targetWeight);
  const targetError =
    goalType === "loss" && targetWeight && targetNumber >= currentWeight
      ? t({
          tr: "Yağ kaybı hedefi mevcut kilodan düşük olmalı.",
          en: "A fat loss target should be lower than your current weight.",
        })
      : goalType === "gain" && targetWeight && targetNumber <= currentWeight
        ? t({
            tr: "Kas artışı için hedef kilo mevcut kilodan yüksek olmalı.",
            en: "A muscle gain target should be above your current weight.",
          })
        : null;
  const saveDisabled =
    !goalType ||
    saving ||
    (targetRequired && !targetWeight) ||
    targetError != null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title={t({ tr: "Aktif hedefler", en: "Active goals" })} />

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
        {profile?.goalType ? (
          hasGoal ? (
            <GlassCard
              style={[
                styles.progressCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.progressHeader}>
                <Ionicons
                  name="flag"
                  size={28}
                  color={savedGoal?.color ?? colors.primary}
                />
                <Text
                  style={[
                    typography.headlineLgMobile,
                    { color: colors.onSurface },
                  ]}
                >
                  {savedGoal ? t(savedGoal.label) : ""}
                </Text>
              </View>
              <View style={styles.weightRow}>
                <View style={styles.weightCol}>
                  <Text
                    style={[
                      typography.labelMd,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {t({ tr: "MEVCUT", en: "CURRENT" })}
                  </Text>
                  <Text
                    style={[
                      typography.headlineMd,
                      { fontSize: 24, color: colors.onSurface },
                    ]}
                  >
                    {currentWeight}
                    <Text
                      style={[
                        typography.bodySm,
                        { color: colors.onSurface },
                      ]}
                    >
                      {" "}
                      kg
                    </Text>
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={colors.outline}
                />
                <View style={styles.weightCol}>
                  <Text
                    style={[
                      typography.labelMd,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {t({ tr: "HEDEF", en: "TARGET" })}
                  </Text>
                  <Text
                    style={[
                      typography.headlineMd,
                      {
                        fontSize: 24,
                        color: savedGoal?.color ?? colors.primary,
                      },
                    ]}
                  >
                    {target}
                    <Text
                      style={[
                        typography.bodySm,
                        { color: colors.onSurface },
                      ]}
                    >
                      {" "}
                      kg
                    </Text>
                  </Text>
                </View>
              </View>
              <View style={{ marginTop: 16 }}>
                <View style={styles.progressLabelRow}>
                  <Text
                    style={[
                      typography.labelMd,
                      { color: colors.onSurfaceVariant },
                    ]}
                  >
                    {t({ tr: "İlerleme", en: "Progress" })}
                  </Text>
                  <Text
                    style={[
                      typography.labelMd,
                      { color: savedGoal?.color ?? colors.primary },
                    ]}
                  >
                    {remaining > 0
                      ? t({
                          tr: `${remaining.toFixed(1)} kg kaldı`,
                          en: `${remaining.toFixed(1)} kg left`,
                        })
                      : t({ tr: "Hedefe ulaşıldı", en: "Target reached" })}
                  </Text>
                </View>
                <MacroBar
                  progress={progress}
                  color={savedGoal?.color ?? colors.primary}
                  glowColor={`${savedGoal?.color ?? colors.primary}55`}
                  height={10}
                />
              </View>
            </GlassCard>
          ) : (
            <GlassCard
              style={[
                styles.progressCard,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <View style={styles.progressHeader}>
                <View
                  style={[
                    styles.activeGoalIcon,
                    {
                      backgroundColor: `${savedGoal?.color ?? colors.primary}16`,
                    },
                  ]}
                >
                  <Ionicons
                    name={savedGoal?.icon ?? "flag-outline"}
                    size={23}
                    color={savedGoal?.color ?? colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.activeGoalEyebrow,
                      { color: savedGoal?.color ?? colors.primary },
                    ]}
                  >
                    {t({ tr: "AKTİF ODAK", en: "ACTIVE FOCUS" })}
                  </Text>
                  <Text
                    style={[typography.headlineMd, { color: colors.onSurface }]}
                  >
                    {savedGoal ? t(savedGoal.label) : ""}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.activeGoalBody,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {profile.goalType === "gain"
                  ? t({
                      tr: "Kas gelişimini yalnızca tartıyla değil, kaldırdığın ağırlıklar ve antrenman düzeninle birlikte takip et.",
                      en: "Track muscle progress not only with the scale, but also with the weights you lift and your training consistency.",
                    })
                  : t({
                      tr: "Mevcut kilonu yaklaşık ±1 kg aralığında tutarken güç ve enerji seviyeni korumaya odaklan.",
                      en: "Aim to keep your weight within about ±1 kg while maintaining strength and energy.",
                    })}
              </Text>
              <View
                style={[
                  styles.activeGoalMetric,
                  { backgroundColor: colors.surfaceContainerLowest },
                ]}
              >
                <Ionicons
                  name="barbell-outline"
                  size={18}
                  color={savedGoal?.color ?? colors.primary}
                />
                <Text
                  style={[
                    styles.activeGoalMetricText,
                    { color: colors.onSurface },
                  ]}
                >
                  {profile.activityLevel
                    ? t(
                        ACTIVITY_OPTIONS.find(
                          (option) => option.value === profile.activityLevel,
                        )?.sub ?? {
                          tr: "Aktivite bilgisi yok",
                          en: "No activity data",
                        },
                      )
                    : t({ tr: "Aktivite bilgisi yok", en: "No activity data" })}
                </Text>
              </View>
            </GlassCard>
          )
        ) : (
          <GlassCard
            style={[
              styles.progressCard,
              {
                backgroundColor: colors.surfaceContainerLow,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            <View style={styles.noGoalBox}>
              <Ionicons name="flag-outline" size={40} color={colors.outline} />
              <Text
                style={[
                  typography.headlineMd,
                  { color: colors.onSurface, marginTop: 12 },
                ]}
              >
                {t({
                  tr: "Henüz hedef belirlemedin",
                  en: "You have not set a goal yet",
                })}
              </Text>
              <Text
                style={[
                  typography.bodyMd,
                  {
                    color: colors.onSurfaceVariant,
                    marginTop: 4,
                    textAlign: "center",
                  },
                ]}
              >
                {t({
                  tr: "Aşağıdan bir hedef seç ve ilerlemeni daha görünür hale getir.",
                  en: "Choose a goal below and make your progress easier to follow.",
                })}
              </Text>
            </View>
          </GlassCard>
        )}

        <Text
          style={[
            typography.headlineMd,
            { color: colors.onSurface, paddingHorizontal: 4 },
          ]}
        >
          {t({ tr: "Hedefini güncelle", en: "Update your goal" })}
        </Text>

        <View style={styles.goalList}>
          {GOAL_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              accessibilityRole="button"
              accessibilityLabel={`${t(option.label)}, ${t(option.desc)}`}
              accessibilityState={{ selected: goalType === option.value }}
              style={[
                styles.goalItem,
                {
                  borderColor:
                    goalType === option.value
                      ? option.color
                      : `${colors.outlineVariant}80`,
                  backgroundColor:
                    goalType === option.value
                      ? `${option.color}12`
                      : colors.surfaceContainerLowest,
                },
              ]}
              onPress={() => {
                selectionFeedback();
                setGoalType(option.value);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.goalIcon,
                  {
                    backgroundColor:
                      goalType === option.value
                        ? option.color
                        : colors.surfaceContainerHigh,
                  },
                ]}
              >
                <Ionicons
                  name={option.icon}
                  size={23}
                  color={
                    goalType === option.value
                      ? colors.white
                      : colors.onSurfaceVariant
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    typography.headlineMd,
                    { fontSize: 16, color: colors.onSurface },
                  ]}
                >
                  {t(option.label)}
                </Text>
                <Text
                  style={[
                    typography.bodySm,
                    { color: colors.onSurfaceVariant, marginTop: 2 },
                  ]}
                >
                  {t(option.desc)}
                </Text>
              </View>
              {goalType === option.value && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color={option.color}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {goalType ? (
          <View
            style={[
              styles.goalGuidance,
              {
                backgroundColor: `${selectedGoal?.color ?? colors.primary}10`,
                borderColor: `${selectedGoal?.color ?? colors.primary}35`,
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={selectedGoal?.color ?? colors.primary}
            />
            <Text
              style={[
                styles.goalGuidanceText,
                { color: colors.onSurfaceVariant },
              ]}
            >
              {goalType === "loss"
                ? t({
                    tr: "Hedef kilon kalori ve ilerleme hesabında kullanılacak.",
                    en: "Your target weight will be used in calorie and progress calculations.",
                  })
                : goalType === "gain"
                  ? t({
                      tr: "Hedef kilo isteğe bağlıdır. Ana ölçütlerin güç artışı, antrenman düzeni ve vücut ölçüleri olmalı.",
                      en: "A target weight is optional. Your main markers should be strength, training consistency, and body measurements.",
                    })
                  : t({
                      tr: `Koruma araligin yaklasik ${(currentWeight - 1).toFixed(1)}-${(currentWeight + 1).toFixed(1)} kg. Performansini korumaya odaklan.`,
                      en: `Your maintenance range is about ${(currentWeight - 1).toFixed(1)}-${(currentWeight + 1).toFixed(1)} kg. Focus on keeping your performance steady.`,
                    })}
            </Text>
          </View>
        ) : null}

        {goalType && goalType !== "maintain" && (
          <View style={styles.targetRow}>
            <View style={styles.fieldLabelRow}>
              <Text style={[typography.labelMd, { color: colors.onSurface }]}>
                {t({ tr: "Hedef kilo", en: "Target weight" })}
              </Text>
              <Text
                style={[
                  styles.optionalLabel,
                  { color: selectedGoal?.color ?? colors.primary },
                ]}
              >
                {goalType === "loss"
                  ? t({ tr: "Gerekli", en: "Required" })
                  : t({ tr: "İsteğe bağlı", en: "Optional" })}
              </Text>
            </View>
            <View style={styles.targetInputRow}>
              <TextInput
                style={[
                  styles.targetInput,
                  {
                    backgroundColor: colors.surfaceContainerLow,
                    borderColor: colors.outlineVariant,
                    color: colors.onSurface,
                  },
                ]}
                placeholder={t({ tr: "Örn. 80", en: "e.g. 80" })}
                placeholderTextColor={colors.outline}
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
              <Text
                style={[typography.bodyMd, { color: colors.onSurfaceVariant }]}
              >
                kg
              </Text>
            </View>
            {targetError ? (
              <Text style={[styles.fieldError, { color: colors.error }]}>
                {targetError}
              </Text>
            ) : null}
          </View>
        )}

        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <View>
              <Text style={[styles.activityTitle, { color: colors.onSurface }]}>
                {t({ tr: "Antrenman sikligi", en: "Training frequency" })}
              </Text>
              <Text
                style={[
                  styles.activityBody,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {t({
                  tr: "Kalori hedefini ve plan yoğunluğunu etkiler.",
                  en: "This affects your calorie target and plan intensity.",
                })}
              </Text>
            </View>
            <Ionicons name="barbell-outline" size={20} color={colors.primary} />
          </View>
          <View style={styles.activityList}>
            {ACTIVITY_OPTIONS.map((option) => {
              const active = activityLevel === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(option.label)}, ${t(option.sub)}`}
                  accessibilityState={{ selected: active }}
                  activeOpacity={0.8}
                  onPress={() => {
                    selectionFeedback();
                    setActivityLevel(option.value);
                  }}
                  style={[
                    styles.activityItem,
                    {
                      borderColor: active
                        ? colors.primary
                        : colors.outlineVariant,
                      backgroundColor: active
                        ? `${colors.primary}12`
                        : colors.surfaceContainerLow,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.activityItemTitle,
                        { color: colors.onSurface },
                      ]}
                    >
                      {t(option.label)}
                    </Text>
                    <Text
                      style={[
                        styles.activityItemSub,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {t(option.sub)}
                    </Text>
                  </View>
                  <Ionicons
                    name={active ? "checkmark-circle" : "ellipse-outline"}
                    size={21}
                    color={active ? colors.primary : colors.outline}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={[styles.disclaimer, { color: colors.onSurfaceVariant }]}>
          {t({
            tr: "Kalori ve makro hedefleri tahmini başlangıç değerleridir; tıbbi veya diyetisyen önerisinin yerini tutmaz.",
            en: "Calorie and macro targets are estimated starting points and do not replace medical or dietitian advice.",
          })}
        </Text>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t({
            tr: "Hedef değişikliklerini kaydet",
            en: "Save goal changes",
          })}
          accessibilityState={{ disabled: saveDisabled }}
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary },
            saveDisabled && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={saveDisabled}
          activeOpacity={0.9}
        >
          <Text style={[typography.labelMd, { color: colors.onPrimary }]}>
            {saving
              ? t({ tr: "Kaydediliyor", en: "Saving" })
              : t({ tr: "Kaydet", en: "Save" })}
          </Text>
        </TouchableOpacity>
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
  disclaimer: { ...typography.bodySm, lineHeight: 18, textAlign: "center" },
  progressCard: { padding: 24, gap: 8 },
  progressHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  noGoalBox: { alignItems: "center", paddingVertical: 16 },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 20,
  },
  weightCol: { alignItems: "center", gap: 4 },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  goalList: { gap: 10 },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeGoalIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  activeGoalEyebrow: {
    ...typography.labelCaps,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0.7,
  },
  activeGoalBody: { ...typography.bodySm, lineHeight: 20, marginTop: 6 },
  activeGoalMetric: {
    minHeight: 44,
    borderRadius: 11,
    paddingHorizontal: 12,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  activeGoalMetricText: { ...typography.labelMd, fontSize: 12 },
  goalGuidance: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  goalGuidanceText: { ...typography.bodySm, flex: 1, lineHeight: 18 },
  targetRow: { gap: 8 },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  optionalLabel: { ...typography.labelXs },
  fieldError: { ...typography.bodySm, fontSize: 11, lineHeight: 15 },
  targetInputRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  targetInput: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
  },
  activitySection: { gap: 10 },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 2,
  },
  activityTitle: { ...typography.headlineMd, fontSize: 18, lineHeight: 24 },
  activityBody: { ...typography.bodySm, fontSize: 11, lineHeight: 15 },
  activityList: { gap: 8 },
  activityItem: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  activityItemTitle: { ...typography.labelMd, fontSize: 14, lineHeight: 18 },
  activityItemSub: {
    ...typography.bodySm,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 1,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.5 },
}));
