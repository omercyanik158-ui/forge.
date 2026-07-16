import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Keyboard, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { GlassCard } from '@/components/GlassCard';
import { useAppLocalization } from '@/providers/localization-context';
import { refreshAchievements } from '@/services/achievementStore';
import { navyBodyFat } from '@/services/calculations';
import { selectionFeedback, successFeedback } from '@/services/interactionFeedback';
import { loadMeals } from '@/services/mealStore';
import { safeGoBack } from '@/services/navigation';
import {
  cmToIn,
  fromDisplayHeight,
  fromDisplayLength,
  fromDisplayWeight,
  heightUnitLabel,
  inToCm,
  kgToLb,
  lbToKg,
  weightUnitLabel,
  type MeasurementSystem,
} from '@/services/localization';
import { loadProfile, saveProfile } from '@/services/profileStore';
import { formatPersonName } from '@/services/textUtils';
import { colors, createDynamicStyles, spacing, typography, useAppTheme } from '@/theme';
import type { ActivityLevel, Gender, GoalType, UserProfile } from '@/types';

type StepType = 'name' | 'gender' | 'age' | 'height' | 'weight' | 'activity' | 'measurements' | 'goal';

const ACCOUNT_STEPS: StepType[] = ['name', 'gender', 'age'];
const BODY_STEPS: StepType[] = ['activity', 'height', 'weight', 'measurements'];
const FULL_STEPS: StepType[] = ['name', 'gender', 'age', 'activity', 'height', 'weight', 'measurements', 'goal'];

export default function OnboardingScreen() {
  useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { resolved, setMeasurementPreference, t } = useAppLocalization();

  const editMode: 'none' | 'account' | 'body' | 'all' =
    edit === 'account' ? 'account' : edit === 'body' ? 'body' : edit === '1' || edit === 'all' ? 'all' : 'none';
  const isEdit = editMode !== 'none';

  const visibleSteps: StepType[] = editMode === 'account' ? ACCOUNT_STEPS : editMode === 'body' ? BODY_STEPS : FULL_STEPS;

  const activityOptions: { value: ActivityLevel; label: string; sub: string }[] = useMemo(
    () => [
      {
        value: 'sedentary',
        label: t('migrated.onboarding_001'),
        sub: t('migrated.onboarding_002'),
      },
      {
        value: 'light',
        label: t('migrated.onboarding_003'),
        sub: t('migrated.onboarding_004'),
      },
      {
        value: 'moderate',
        label: t('migrated.onboarding_005'),
        sub: t('migrated.onboarding_006'),
      },
      {
        value: 'active',
        label: t('migrated.onboarding_007'),
        sub: t('migrated.onboarding_008'),
      },
      {
        value: 'very_active',
        label: t('migrated.onboarding_009'),
        sub: t('migrated.onboarding_010'),
      },
    ],
    [t],
  );

  const stepTitles: Record<StepType, string> = useMemo(
    () => ({
      name: t('migrated.onboarding_011'),
      gender: t('migrated.onboarding_012'),
      age: t('migrated.onboarding_013'),
      height: t('migrated.onboarding_014'),
      weight: t('migrated.onboarding_015'),
      activity: t('migrated.onboarding_016'),
      measurements: t('migrated.onboarding_017'),
      goal: t('migrated.onboarding_018'),
    }),
    [t],
  );

  const stepDescriptions: Record<StepType, string> = useMemo(
    () => ({
      name: t('migrated.onboarding_019'),
      gender: t('migrated.onboarding_020'),
      age: t('migrated.onboarding_021'),
      height: t('migrated.onboarding_022'),
      weight: t('migrated.onboarding_023'),
      activity: t('migrated.onboarding_024'),
      measurements: t('migrated.onboarding_025'),
      goal: t('migrated.onboarding_026'),
    }),
    [t],
  );

  const [stepIdx, setStepIdx] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [age, setAge] = useState('');
  const [weightInput, setWeightInput] = useState('');
  const [heightInput, setHeightInput] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [neckInput, setNeckInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [hipInput, setHipInput] = useState('');
  const [goalType, setGoalType] = useState<GoalType | null>(null);
  const [targetWeightInput, setTargetWeightInput] = useState('');
  const [saving, setSaving] = useState(false);
  const previousMeasurementSystem = useRef<MeasurementSystem>(resolved.measurementSystem);

  useEffect(() => {
    if (!isEdit) return;
    const initialSystem = previousMeasurementSystem.current;
    loadProfile().then((profile) => {
      if (!profile) return;
      setName(profile.name);
      setGender(profile.gender);
      setAge(String(profile.age));
      setWeightInput(toEditableNumber(initialSystem === 'imperial' ? kgToLb(profile.weightKg) : profile.weightKg, 1));
      setHeightInput(toEditableNumber(initialSystem === 'imperial' ? cmToIn(profile.heightCm) : profile.heightCm, 1));
      setActivityLevel(profile.activityLevel);
      setNeckInput(toEditableNumber(initialSystem === 'imperial' ? cmToIn(profile.neckCm) : profile.neckCm, 1));
      setWaistInput(toEditableNumber(initialSystem === 'imperial' ? cmToIn(profile.waistCm) : profile.waistCm, 1));
      if (profile.hipCm != null) setHipInput(toEditableNumber(initialSystem === 'imperial' ? cmToIn(profile.hipCm) : profile.hipCm, 1));
      if (profile.goalType) setGoalType(profile.goalType);
      if (profile.targetWeightKg != null) setTargetWeightInput(toEditableNumber(initialSystem === 'imperial' ? kgToLb(profile.targetWeightKg) : profile.targetWeightKg, 1));
    });
  }, [isEdit]);

  useEffect(() => {
    const previous = previousMeasurementSystem.current;
    if (previous === resolved.measurementSystem) return;

    setWeightInput((current) => convertDisplayedValue(current, previous, resolved.measurementSystem, 'weight'));
    setHeightInput((current) => convertDisplayedValue(current, previous, resolved.measurementSystem, 'length'));
    setNeckInput((current) => convertDisplayedValue(current, previous, resolved.measurementSystem, 'length'));
    setWaistInput((current) => convertDisplayedValue(current, previous, resolved.measurementSystem, 'length'));
    setHipInput((current) => convertDisplayedValue(current, previous, resolved.measurementSystem, 'length'));
    setTargetWeightInput((current) => convertDisplayedValue(current, previous, resolved.measurementSystem, 'weight'));
    previousMeasurementSystem.current = resolved.measurementSystem;
  }, [resolved.measurementSystem]);

  const currentStep = visibleSteps[stepIdx];
  const totalSteps = visibleSteps.length;

  function canProceed(): boolean {
    const heightValue = parseNumericInput(heightInput);
    const weightValue = parseNumericInput(weightInput);
    const neckValue = parseNumericInput(neckInput);
    const waistValue = parseNumericInput(waistInput);
    const hipValue = parseNumericInput(hipInput);
    const targetWeightValue = parseNumericInput(targetWeightInput);

    switch (currentStep) {
      case 'name':
        return name.trim().length > 0;
      case 'gender':
        return gender !== null;
      case 'age':
        return Number(age) >= 13 && Number(age) <= 100;
      case 'height': {
        const valueCm = heightValue == null ? 0 : fromDisplayHeight(heightValue, resolved);
        return valueCm >= 100 && valueCm <= 250;
      }
      case 'weight': {
        const valueKg = weightValue == null ? 0 : fromDisplayWeight(weightValue, resolved);
        return valueKg >= 30 && valueKg <= 350;
      }
      case 'activity':
        return activityLevel !== null;
      case 'measurements': {
        const hasAnyMeasurement = neckInput.trim().length > 0 || waistInput.trim().length > 0 || hipInput.trim().length > 0;
        if (!hasAnyMeasurement) return true;

        const neckCm = neckValue == null ? 0 : fromDisplayLength(neckValue, resolved);
        const waistCm = waistValue == null ? 0 : fromDisplayLength(waistValue, resolved);
        if (neckCm < 20 || neckCm > 80 || waistCm < 40 || waistCm > 250) return false;
        if (gender === 'female') {
          const hipCm = hipValue == null ? 0 : fromDisplayLength(hipValue, resolved);
          return hipCm >= 40 && hipCm <= 250 && waistCm + hipCm > neckCm;
        }
        return waistCm > neckCm;
      }
      case 'goal': {
        if (!goalType) return false;
        if (goalType === 'maintain' || goalType === 'gain') return true;
        const currentWeightKg = weightValue == null ? 0 : fromDisplayWeight(weightValue, resolved);
        const targetWeightKg = targetWeightValue == null ? 0 : fromDisplayWeight(targetWeightValue, resolved);
        return targetWeightKg > 0 && targetWeightKg < currentWeightKg;
      }
      default:
        return false;
    }
  }

  function handleNext() {
    Keyboard.dismiss();
    if (stepIdx < totalSteps - 1) {
      setStepIdx((current) => current + 1);
      return;
    }
    void handleFinish();
  }

  async function handleFinish() {
    setSaving(true);
    try {
      const existing = isEdit ? await loadProfile() : null;
      const resolvedGender = gender ?? existing?.gender ?? 'male';
      const resolvedActivity = activityLevel ?? existing?.activityLevel ?? 'sedentary';
      const resolvedHeightCm = parseNumericInput(heightInput) != null ? fromDisplayHeight(parseNumericInput(heightInput)!, resolved) : existing?.heightCm ?? 0;
      const resolvedWeightKg = parseNumericInput(weightInput) != null ? fromDisplayWeight(parseNumericInput(weightInput)!, resolved) : existing?.weightKg ?? 0;
      const resolvedNeckCm = parseNumericInput(neckInput) != null ? fromDisplayLength(parseNumericInput(neckInput)!, resolved) : existing?.neckCm ?? 0;
      const resolvedWaistCm = parseNumericInput(waistInput) != null ? fromDisplayLength(parseNumericInput(waistInput)!, resolved) : existing?.waistCm ?? 0;
      const resolvedHipCm =
        resolvedGender === 'female'
          ? parseNumericInput(hipInput) != null
            ? fromDisplayLength(parseNumericInput(hipInput)!, resolved)
            : existing?.hipCm
          : existing?.hipCm;

      const needsBodyFat = editMode === 'none' || editMode === 'body' || editMode === 'all';
      const bodyFatPct = needsBodyFat
        ? navyBodyFat({
            gender: resolvedGender,
            heightCm: resolvedHeightCm,
            neckCm: resolvedNeckCm,
            waistCm: resolvedWaistCm,
            hipCm: resolvedHipCm,
          }) ?? undefined
        : existing?.bodyFatPct;

      const needsGoal = editMode === 'none' || editMode === 'all';
      const resolvedGoalType = needsGoal ? goalType ?? undefined : existing?.goalType;
      const resolvedTargetWeightKg =
        needsGoal && goalType && goalType !== 'maintain' && parseNumericInput(targetWeightInput) != null
          ? fromDisplayWeight(parseNumericInput(targetWeightInput)!, resolved)
          : needsGoal
            ? undefined
            : existing?.targetWeightKg;

      const profile: UserProfile = {
        name: formatPersonName(name || existing?.name || ''),
        gender: resolvedGender,
        age: Number(age) || (existing?.age ?? 0),
        weightKg: resolvedWeightKg,
        heightCm: resolvedHeightCm,
        activityLevel: resolvedActivity,
        neckCm: resolvedNeckCm,
        waistCm: resolvedWaistCm,
        hipCm: resolvedHipCm,
        bodyFatPct,
        goalType: resolvedGoalType,
        targetWeightKg: resolvedTargetWeightKg,
        startWeightKg: resolvedGoalType === 'maintain' ? undefined : existing?.startWeightKg ?? resolvedWeightKg,
        subscription: existing?.subscription,
        streak: existing?.streak,
        achievements: existing?.achievements,
        createdAt: existing?.createdAt ?? new Date().toISOString(),
      };

      await saveProfile(profile);
      successFeedback();
      await refreshAchievements(profile, await loadMeals());
      if (isEdit) {
        safeGoBack(router, '/(tabs)/profile');
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      Alert.alert(
        t('migrated.onboarding_027'),
        t('migrated.onboarding_028'),
      );
    } finally {
      setSaving(false);
    }
  }

  const topBarTitle =
    editMode === 'account'
      ? t('migrated.onboarding_029')
      : editMode === 'body'
        ? t('migrated.onboarding_030')
        : isEdit
          ? t('migrated.onboarding_031')
          : t('migrated.onboarding_032');

  const unitLabel = currentStep === 'weight' || currentStep === 'goal' ? weightUnitLabel(resolved) : heightUnitLabel(resolved);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.topBarInner}>
          {isEdit ? (
            <TouchableOpacity onPress={() => safeGoBack(router, '/(tabs)/profile')} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={26} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 26 }} />
          )}
          <Text style={styles.topBarTitle}>{topBarTitle}</Text>
          <Text style={styles.stepCounter}>
            {stepIdx + 1}/{totalSteps}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((stepIdx + 1) / totalSteps) * 100}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 112, paddingBottom: 40 }]}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical
        showsVerticalScrollIndicator={false}
      >
        <GlassCard style={styles.card}>
          <Text style={styles.stepTitle}>{stepTitles[currentStep]}</Text>
          <Text style={styles.stepDescription}>{stepDescriptions[currentStep]}</Text>

          {showsUnitPicker(currentStep) ? (
            <UnitPreferenceToggle
              measurementSystem={resolved.measurementSystem}
              onSelect={async (next) => setMeasurementPreference(next)}
              t={t}
            />
          ) : null}

          {currentStep === 'name' ? (
            <TextInput
              style={[styles.input, { marginTop: 12 }]}
              autoCapitalize="words"
              placeholder={t('migrated.onboarding_033')}
              placeholderTextColor={colors.outline}
              value={name}
              onChangeText={setName}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          ) : null}

          {currentStep === 'gender' ? (
            <View style={styles.optionRow}>
              <ChoiceCard active={gender === 'male'} label={t('migrated.onboarding_034')} icon="male" onPress={() => setGender('male')} />
              <ChoiceCard active={gender === 'female'} label={t('migrated.onboarding_035')} icon="female" onPress={() => setGender('female')} />
            </View>
          ) : null}

          {currentStep === 'age' ? <NumberInput value={age} onChange={setAge} placeholder={t('migrated.onboarding_036')} hideUnit /> : null}
          {currentStep === 'height' ? <NumberInput value={heightInput} onChange={setHeightInput} placeholder={resolved.measurementSystem === 'imperial' ? 'e.g. 71' : t('migrated.onboarding_038')} hideUnit shifted /> : null}
          {currentStep === 'weight' ? <NumberInput value={weightInput} onChange={setWeightInput} placeholder={resolved.measurementSystem === 'imperial' ? 'e.g. 165' : t('migrated.onboarding_039')} unit={unitLabel} shifted /> : null}

          {currentStep === 'activity' ? (
            <View style={styles.activityList}>
              {activityOptions.map((option) => {
                const active = activityLevel === option.value;

                return (
                  <TouchableOpacity
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${option.label}, ${option.sub}`}
                    style={[styles.activityItem, active && styles.activityItemActive]}
                    onPress={() => {
                      selectionFeedback();
                      setActivityLevel(option.value);
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.activityItemTitle, active && styles.activityItemTitleActive]}>
                        {option.label}
                      </Text>
                      <Text style={[styles.activityItemSub, active && styles.activityItemSubActive]}>
                        {option.sub}
                      </Text>
                    </View>
                    <View style={[styles.activityCheck, active && styles.activityCheckActive]}>
                      <Ionicons
                        name={active ? 'checkmark' : 'ellipse-outline'}
                        size={active ? 16 : 21}
                        color={active ? colors.onPrimary : colors.outline}
                      />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}

          {currentStep === 'measurements' ? (
            <View style={styles.measurementInputList}>
              <NumberInput value={neckInput} onChange={setNeckInput} placeholder={resolved.measurementSystem === 'imperial' ? 'e.g. 15' : t('migrated.onboarding_040')} unit={heightUnitLabel(resolved)} label={t('migrated.onboarding_041')} />
              <NumberInput value={waistInput} onChange={setWaistInput} placeholder={resolved.measurementSystem === 'imperial' ? 'e.g. 33' : t('migrated.onboarding_042')} unit={heightUnitLabel(resolved)} label={t('migrated.onboarding_043')} />
              {gender === 'female' ? <NumberInput value={hipInput} onChange={setHipInput} placeholder={resolved.measurementSystem === 'imperial' ? 'e.g. 38' : t('migrated.onboarding_044')} unit={heightUnitLabel(resolved)} label={t('migrated.onboarding_045')} /> : null}
              <Text style={styles.hint}>{t('migrated.onboarding_046')}</Text>
            </View>
          ) : null}

          {currentStep === 'goal' ? (
            <View style={{ gap: 16 }}>
              <View style={styles.optionRow}>
                <ChoiceCard active={goalType === 'gain'} label={t('migrated.onboarding_047')} icon="trending-up" onPress={() => setGoalType('gain')} />
                <ChoiceCard active={goalType === 'loss'} label={t('migrated.onboarding_048')} icon="trending-down" onPress={() => setGoalType('loss')} />
              </View>
              <ChoiceCard active={goalType === 'maintain'} label={t('migrated.onboarding_049')} icon="ellipse-outline" onPress={() => setGoalType('maintain')} wide />
              {goalType && goalType !== 'maintain' ? (
                <View style={{ gap: 8 }}>
                  <NumberInput
                    value={targetWeightInput}
                    onChange={setTargetWeightInput}
                    placeholder={resolved.measurementSystem === 'imperial' ? 'e.g. 176' : t('migrated.onboarding_050')}
                    unit={weightUnitLabel(resolved)}
                    label={goalType === 'loss' ? t('migrated.onboarding_051') : t('migrated.onboarding_052')}
                  />
                  <Text style={styles.hint}>
                    {goalType === 'loss'
                      ? t('migrated.onboarding_053')
                      : t('migrated.onboarding_054')}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityState={{ disabled: !canProceed() || saving }}
            style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed() || saving}
            activeOpacity={0.9}
          >
            <Text style={[typography.labelMd, { color: colors.onPrimary }]}>
              {stepIdx === totalSteps - 1 ? (isEdit ? t('migrated.onboarding_055') : t('migrated.onboarding_056')) : t('migrated.onboarding_057')}
            </Text>
          </TouchableOpacity>

          {stepIdx > 0 ? (
            <TouchableOpacity style={styles.backLink} onPress={() => setStepIdx((current) => current - 1)} activeOpacity={0.7}>
              <Text style={[typography.labelMd, { color: colors.onSurfaceVariant }]}>{t('migrated.onboarding_058')}</Text>
            </TouchableOpacity>
          ) : null}
        </GlassCard>
      </ScrollView>
    </View>
  );
}

function showsUnitPicker(step: StepType): boolean {
  return step === 'height' || step === 'weight' || step === 'measurements';
}

function parseNumericInput(value: string): number | null {
  const cleaned = value.replace(',', '.').trim();
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function toEditableNumber(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return '';
  const rounded = Math.round(value * 10 ** fractionDigits) / 10 ** fractionDigits;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(fractionDigits).replace(/\.0+$/, '');
}

function convertDisplayedValue(
  value: string,
  fromSystem: MeasurementSystem,
  toSystem: MeasurementSystem,
  kind: 'weight' | 'length',
): string {
  if (fromSystem === toSystem) return value;
  const parsed = parseNumericInput(value);
  if (parsed == null) return value;
  const metricValue =
    fromSystem === 'imperial'
      ? kind === 'weight'
        ? lbToKg(parsed)
        : inToCm(parsed)
      : parsed;
  const nextDisplay = toSystem === 'imperial' ? (kind === 'weight' ? kgToLb(metricValue) : cmToIn(metricValue)) : metricValue;
  return toEditableNumber(nextDisplay, 1);
}

function UnitPreferenceToggle({
  measurementSystem,
  onSelect,
  t,
}: {
  measurementSystem: MeasurementSystem;
  onSelect: (next: MeasurementSystem) => void | Promise<void>;
  t: (messages: string | { tr: string; en: string }) => string;
}) {
  return (
    <View style={styles.unitRow}>
      <UnitChip active={measurementSystem === 'metric'} label={t('migrated.onboarding_059')} onPress={() => onSelect('metric')} />
      <UnitChip active={measurementSystem === 'imperial'} label={t('migrated.onboarding_060')} onPress={() => onSelect('imperial')} />
    </View>
  );
}

function UnitChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.unitChip, active && styles.unitChipActive]}
    >
      <Text style={[styles.unitChipText, active && styles.unitChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function ChoiceCard({
  active,
  label,
  icon,
  onPress,
  wide,
}: {
  active: boolean;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  wide?: boolean;
}) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      style={[
        styles.choiceCard,
        wide && styles.choiceCardWide,
        active && styles.choiceCardActive,
        active && { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
      ]}
      onPress={() => {
        selectionFeedback();
        onPress();
      }}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={36} color={active ? colors.primary : colors.onSurfaceVariant} />
      <Text style={[typography.headlineMd, { fontSize: 16, color: colors.onSurface }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
  unit,
  label,
  hideUnit,
  shifted,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  unit?: string;
  label?: string;
  hideUnit?: boolean;
  shifted?: boolean;
}) {
  return (
    <View style={[styles.numberInputGroup, shifted && styles.numberInputGroupShifted]}>
      {label ? <Text style={styles.numberInputLabel}>{label}</Text> : null}
      <View style={styles.numberRow}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.outline}
          value={value}
          onChangeText={(next) => onChange(next.replace(/[^0-9.,]/g, ''))}
          keyboardType="numeric"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
        {!hideUnit && unit ? (
          <View style={styles.unitBadge}>
            <Text style={styles.unitBadgeText}>{unit}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: spacing.containerMargin, gap: spacing.gutter },
  topBar: {
    position: 'absolute',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarTitle: { ...typography.headlineLgMobile, color: colors.onSurface },
  stepCounter: { ...typography.labelMd, color: colors.onSurfaceVariant },
  progressTrack: { height: 4, backgroundColor: colors.surfaceContainer },
  progressFill: { height: 4, backgroundColor: colors.secondary },
  card: { padding: 20, gap: 20 },
  stepTitle: { ...typography.headlineLgMobile, color: colors.onSurface, marginBottom: 4 },
  stepDescription: { ...typography.bodyMd, color: colors.onSurfaceVariant, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  numberInputGroup: { gap: 8 },
  numberInputGroupShifted: { marginTop: 8 },
  numberInputLabel: { ...typography.labelMd, color: colors.onSurfaceVariant },
  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  unitBadge: {
    minWidth: 52,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitBadgeText: { ...typography.labelMd, color: colors.onSurfaceVariant },
  measurementInputList: { gap: 16, marginTop: 8 },
  optionRow: { flexDirection: 'row', gap: 12 },
  choiceCard: {
    flex: 1,
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainer,
  },
  choiceCardWide: { flexBasis: '100%' },
  choiceCardActive: { borderColor: colors.secondary, backgroundColor: colors.secondaryContainer },
  activityList: { gap: 10 },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainer,
  },
  activityItemActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerHighest,
  },
  activityItemTitle: { ...typography.headlineMd, fontSize: 16, color: colors.onSurface },
  activityItemTitleActive: { color: colors.onSurface },
  activityItemSub: { ...typography.bodySm, color: colors.onSurfaceVariant, marginTop: 2 },
  activityItemSubActive: { color: colors.onSurface },
  activityCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCheckActive: { backgroundColor: colors.primary },
  hint: { ...typography.bodySm, color: colors.outline, fontSize: 12 },
  nextBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  nextBtnDisabled: { opacity: 0.5 },
  backLink: { alignSelf: 'center', padding: 8 },
  unitRow: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  unitChip: {
    minHeight: 40,
    borderRadius: 999,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitChipActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}12` },
  unitChipText: { ...typography.labelMd, color: colors.onSurface },
  unitChipTextActive: { color: colors.primary },
}));
