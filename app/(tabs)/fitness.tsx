import { createDynamicStyles, radius, shadowStyle, spacing, typography, useAppTheme } from '@/theme';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter, useScrollToTop } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProgramCard } from '@/components/ProgramCard';
import { TopBar } from '@/components/TopBar';
import { useAppLocalization } from '@/providers/localization-context';
import {
  deleteAIProgramInstance,
  loadAIProgramInstances,
} from '@/services/aiProgramInstanceStore';
import { loadActiveAIProgram, setActiveAIProgramId } from '@/services/activeAIProgramStore';
import {
  deleteCustomWorkout,
  loadCustomWorkouts,
  updateCustomWorkoutTitle,
  type CustomWorkout,
} from '@/services/customWorkoutStore';
import { computeCycleIntensity, type CycleIntensity } from '@/services/personalCoach';
import { summarizeCycleTracking, loadCycleTracking, type CyclePhase } from '@/services/cycleTracking';
import { ALL_PROGRAMS, FREE_PROGRAMS } from '@/services/programCatalog';
import { localizeProgramPlans } from '@/services/program-localization';
import { subscribeFavoritesRailChange } from '@/services/favoritesRailEvents';
import { loadFavoriteProgramIds } from '@/services/programFavoriteStore';
import { loadAllProgramProgress } from '@/services/programProgressStore';
import { loadProfile } from '@/services/profileStore';
import {
  loadBodyProgress,
  type BodyProgressSnapshot,
} from '@/services/bodyProgress';
import { getExerciseById } from '@/services/exerciseCatalog';
import { formatWeightValue, weightUnitLabel } from '@/services/localization';
import { normalizeProgramText, repairText } from '@/services/textUtils';
import type { AIProgramPlan } from '@/types/aiProgramPlan';
import type { CoachAdjustment } from '@/types/coachAdjustment';
import type { ProgramProgressMap } from '@/services/programProgressStore';
import type { UserProfile } from '@/types';

type ProgramManagementItem =
  | { kind: 'ai'; plan: AIProgramPlan }
  | { kind: 'custom'; workout: CustomWorkout };

type ProgramManagementMode = 'actions' | 'delete' | 'rename';

export default function FitnessScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  useScrollToTop(scrollRef);
  const router = useRouter();
  const { colors } = useAppTheme();
  const [customWorkouts, setCustomWorkouts] = useState<CustomWorkout[]>([]);
  const [aiPrograms, setAIProgramInstances] = useState<AIProgramPlan[]>([]);
  const [activeAIProgram, setActiveAIProgram] = useState<AIProgramPlan | null>(null);
  const [progressMap, setProgressMap] = useState<ProgramProgressMap>({});
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoriteProgramIds, setFavoriteProgramIds] = useState<string[]>([]);
  const [bodyProgress, setBodyProgress] = useState<BodyProgressSnapshot | null>(null);
  const [cycleState, setCycleState] = useState<{ phase: CyclePhase | null; intensity: CycleIntensity }>({ phase: null, intensity: 'normal' });
  const [managementItem, setManagementItem] = useState<ProgramManagementItem | null>(null);
  const [managementMode, setManagementMode] = useState<ProgramManagementMode>('actions');
  const [renameTitle, setRenameTitle] = useState('');
  const [managementBusy, setManagementBusy] = useState(false);
  const [createSheetVisible, setCreateSheetVisible] = useState(false);
  const [progressReferenceTimeMs, setProgressReferenceTimeMs] = useState(0);

  const refreshData = useCallback(async () => {
    const [loadedProfile, savedWorkouts, cycleTracking, aiProgramsData, activeProgramData, favoriteIds, progress, bodyProgressData] = await Promise.all([
      loadProfile(),
      loadCustomWorkouts(),
      loadCycleTracking(),
      loadAIProgramInstances(),
      loadActiveAIProgram(),
      loadFavoriteProgramIds(),
      loadAllProgramProgress(),
      loadBodyProgress(),
    ]);
    setProfile(loadedProfile);
    setCustomWorkouts(savedWorkouts);
    setAIProgramInstances(aiProgramsData);
    setActiveAIProgram(activeProgramData);
    setFavoriteProgramIds(favoriteIds);
    setProgressMap(progress);
    setBodyProgress(bodyProgressData);
    setProgressReferenceTimeMs(Date.now());
    if (loadedProfile?.gender === 'female') {
      const summary = summarizeCycleTracking(cycleTracking);
      setCycleState({ phase: summary?.phase ?? null, intensity: computeCycleIntensity(summary) });
    } else {
      setCycleState({ phase: null, intensity: 'normal' });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      });
      refreshData();
    }, [refreshData]),
  );

  useEffect(() => subscribeFavoritesRailChange(refreshData), [refreshData]);

  const favoriteLibraryPrograms = useMemo(
    () => ALL_PROGRAMS.filter((program) => favoriteProgramIds.includes(program.id)),
    [favoriteProgramIds],
  );
  const programRailPrograms = useMemo(
    () => favoriteLibraryPrograms.length > 0 ? favoriteLibraryPrograms : FREE_PROGRAMS.slice(0, 4),
    [favoriteLibraryPrograms],
  );
  const activeProgramProgress = activeAIProgram ? progressMap[`ai:${activeAIProgram.id}`] ?? [] : [];
  const activeProgramNextDayId = activeAIProgram ? getNextAIProgramDayId(activeAIProgram, activeProgramProgress) : "";
  const activeProgramNextTitle = activeAIProgram ? getNextAIProgramDayTitle(activeAIProgram, activeProgramProgress) : "";
  const activeProgramNextDay = activeAIProgram
    ? activeAIProgram.weeks
        .flatMap((week) => week.days)
        .find((day) => day.id === activeProgramNextDayId) ?? null
    : null;
  const activeProgramWeekLabel = activeAIProgram
    ? `${Math.min(activeProgramProgress.length + 1, activeAIProgram.daysPerWeek)} / ${activeAIProgram.daysPerWeek}`
    : "0 / 0";
  const activeProgramDayNumber = activeAIProgram
    ? Math.min(activeProgramProgress.length + 1, activeAIProgram.daysPerWeek || 1)
    : 1;

  const closeManagementSheet = useCallback(() => {
    if (managementBusy) return;
    setManagementItem(null);
    setManagementMode('actions');
    setRenameTitle('');
  }, [managementBusy]);

  const startAIProgram = useCallback((plan: AIProgramPlan) => {
    const nextDayId = getNextAIProgramDayId(plan, progressMap[`ai:${plan.id}`] ?? []);
    router.push({
      pathname: '/program-session',
      params: { aiProgramId: plan.id, aiDayId: nextDayId },
    });
  }, [progressMap, router]);

  const handleDeleteManagedItem = useCallback(async () => {
    if (!managementItem || managementBusy) return;
    setManagementBusy(true);
    try {
      if (managementItem.kind === 'ai') {
        await deleteAIProgramInstance(managementItem.plan.id);
        if (activeAIProgram?.id === managementItem.plan.id) {
          await setActiveAIProgramId(null);
        }
      } else {
        await deleteCustomWorkout(managementItem.workout.id);
      }
      await refreshData();
      setManagementItem(null);
      setManagementMode('actions');
      setRenameTitle('');
    } finally {
      setManagementBusy(false);
    }
  }, [activeAIProgram?.id, managementBusy, managementItem, refreshData]);

  const handleRenameManagedWorkout = useCallback(async () => {
    if (!managementItem || managementItem.kind !== 'custom' || managementBusy) return;
    const nextTitle = renameTitle.trim();
    if (!nextTitle) return;
    setManagementBusy(true);
    try {
      await updateCustomWorkoutTitle(managementItem.workout.id, nextTitle);
      await refreshData();
      setManagementItem(null);
      setManagementMode('actions');
      setRenameTitle('');
    } finally {
      setManagementBusy(false);
    }
  }, [managementBusy, managementItem, refreshData, renameTitle]);

  // En aktif plan: bir logu varsa en son kullanılan; yoksa en yeni oluşturulan.
  // Aktif AI planının ilerlemesi (tamamlanan / toplam gün).
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar
        showAvatar
        showAction
        actionIcon="settings-outline"
        onActionPress={() => router.push('/settings-privacy')}
      />
      <ScrollView
        ref={scrollRef}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.screenHeaderOffset, paddingBottom: spacing.tabContentBottom }]}
      >
        <TodayWorkoutHero
          activeProgram={activeAIProgram}
          nextTitle={activeProgramNextTitle}
          nextExerciseName={getExerciseById(activeProgramNextDay?.exercises[0]?.exerciseId)?.displayName}
          durationMin={activeProgramNextDay?.durationMin ?? 55}
          dayNumber={activeProgramDayNumber}
          weekLabel={activeProgramWeekLabel}
          onStart={() => {
            if (!activeAIProgram) {
              setCreateSheetVisible(true);
              return;
            }
            router.push({
              pathname: '/program-session',
              params: { aiProgramId: activeAIProgram.id, aiDayId: activeProgramNextDayId },
            });
          }}
          onOpenProgram={() => {
            if (!activeAIProgram) {
              setCreateSheetVisible(true);
              return;
            }
            router.push({ pathname: '/ai-program-detail', params: { id: activeAIProgram.id } });
          }}
          onOpen={() => setCreateSheetVisible(true)}
        />
        <ProgressSummaryGrid
          snapshot={bodyProgress}
          onOpen={() => router.push('/body-progress')}
          streakCount={profile?.streak?.count ?? 0}
          referenceTimeMs={progressReferenceTimeMs}
        />
        <FavoriteProgramsSection
          programs={programRailPrograms}
          customWorkouts={customWorkouts}
          aiPrograms={aiPrograms}
          coachAdjustments={bodyProgress?.coachAdjustments ?? []}
          progressMap={progressMap}
          onOpenAllPrograms={() => router.push('/programs')}
          onOpenProgram={(id) => router.push({ pathname: '/program-detail', params: { id } })}
          onStartCustomWorkout={(id) => router.push({ pathname: '/program-session', params: { customWorkoutId: id } })}
          onOpenAIProgram={(id) => router.push({ pathname: '/ai-program-detail', params: { id } })}
          onManageAIProgram={(plan) => {
            setManagementItem({ kind: 'ai', plan });
            setManagementMode('actions');
          }}
          onManageCustomWorkout={(workout) => {
            setManagementItem({ kind: 'custom', workout });
            setRenameTitle(workout.title);
            setManagementMode('actions');
          }}
        />
        {profile?.gender === 'female' ? (
          <WomenCycleCard
            cyclePhase={cycleState.phase}
            cycleIntensity={cycleState.intensity}
            onOpenCycle={() => router.push('/cycle-tracking')}
          />
        ) : null}
      </ScrollView>
      <ProgramManagementSheet
        item={managementItem}
        mode={managementMode}
        renameTitle={renameTitle}
        busy={managementBusy}
        onChangeRenameTitle={setRenameTitle}
        onClose={closeManagementSheet}
        onModeChange={setManagementMode}
        onStart={() => {
          if (!managementItem) return;
          const item = managementItem;
          closeManagementSheet();
          if (item.kind === 'ai') {
            startAIProgram(item.plan);
          } else {
            router.push({ pathname: '/program-session', params: { customWorkoutId: item.workout.id } });
          }
        }}
        onOpenDetail={() => {
          if (!managementItem || managementItem.kind !== 'ai') return;
          const planId = managementItem.plan.id;
          closeManagementSheet();
          router.push({ pathname: '/ai-program-detail', params: { id: planId } });
        }}
        onRegenerate={() => {
          if (!managementItem || managementItem.kind !== 'ai') return;
          const planId = managementItem.plan.id;
          closeManagementSheet();
          router.push({ pathname: '/ai-program-builder', params: { regenerateFromId: planId } });
        }}
        onEdit={() => {
          if (!managementItem || managementItem.kind !== 'custom') return;
          const workoutId = managementItem.workout.id;
          closeManagementSheet();
          router.push({ pathname: '/create-workout', params: { id: workoutId } });
        }}
        onDelete={handleDeleteManagedItem}
        onRename={handleRenameManagedWorkout}
      />
      <ProgramCreateSheet
        visible={createSheetVisible}
        onClose={() => setCreateSheetVisible(false)}
        onBuildAI={() => {
          setCreateSheetVisible(false);
          router.push({ pathname: '/ai-program-builder', params: { fresh: '1' } });
        }}
        onAnalyze={() => {
          setCreateSheetVisible(false);
          router.push({ pathname: '/ai', params: { mode: 'physique' } });
        }}
        onCreateManual={() => {
          setCreateSheetVisible(false);
          router.push('/create-workout');
        }}
        onExplore={() => {
          setCreateSheetVisible(false);
          router.push('/programs');
        }}
      />
    </View>
  );
}

function ProgressSummaryGrid({
  snapshot,
  onOpen,
  streakCount,
  referenceTimeMs,
}: {
  snapshot: BodyProgressSnapshot | null;
  onOpen: () => void;
  streakCount: number;
  referenceTimeMs: number;
}) {
  const { colors } = useAppTheme();
  const { resolved, t } = useAppLocalization();
  const latestScore = snapshot?.latestPhysiqueScore ?? null;
  const analysisLabel = latestScore
    ? daysAgoLabel(latestScore.createdAt, referenceTimeMs, t)
    : t({ tr: 'Bekliyor', en: 'Waiting' });
  const weeklyVolumeKg = snapshot?.topStrengthProgress
    .flatMap((item) => item.records.slice(-3))
    .reduce((sum, record) => sum + record.volumeKg, 0) ?? 0;
  const unit = weightUnitLabel(resolved);

  return (
    <View style={styles.progressBlock}>
      <Text style={[styles.sectionHeadingTitle, { color: colors.onSurface }]}>
        {t({ tr: 'Gelişim', en: 'Progress' })}
      </Text>
      <View style={styles.progressGrid}>
        <ProgressMetricCard
          icon="stats-chart"
          iconColor={colors.primary}
          label={t({ tr: 'Analiz', en: 'Analysis' })}
          value={analysisLabel}
          onPress={onOpen}
        />
        <ProgressMetricCard
          icon="flame"
          iconColor={colors.error}
          label={t({ tr: 'Seri', en: 'Streak' })}
          value={t({ tr: `${streakCount} Gün`, en: `${streakCount} Days` })}
          onPress={onOpen}
        />
        <ProgressMetricCard
          wide
          icon="trending-up"
          iconColor={colors.primary}
          label={t({ tr: 'Haftalık Hacim', en: 'Weekly Volume' })}
          value={weeklyVolumeKg > 0 ? `${formatWeightValue(weeklyVolumeKg)} ${unit}` : t({ tr: 'Başlıyor', en: 'Starting' })}
          onPress={onOpen}
        />
      </View>
    </View>
  );
}

function ProgressMetricCard({
  icon,
  iconColor,
  label,
  value,
  wide = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value: string;
  wide?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.84}
      onPress={onPress}
      style={[
        wide ? styles.progressMetricWide : styles.progressMetric,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text style={[styles.progressMetricLabel, { color: colors.onSurfaceVariant }]}>
        {label}
      </Text>
      <Text style={[styles.progressMetricValue, { color: colors.onSurface }]}>
        {value}
      </Text>
    </TouchableOpacity>
  );
}

function TodayWorkoutHero({
  activeProgram,
  nextTitle,
  nextExerciseName,
  durationMin,
  dayNumber,
  weekLabel,
  onStart,
  onOpenProgram,
  onOpen,
}: {
  activeProgram: AIProgramPlan | null;
  nextTitle: string;
  nextExerciseName?: string;
  durationMin: number;
  dayNumber: number;
  weekLabel: string;
  onStart: () => void;
  onOpenProgram: () => void;
  onOpen: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const title = activeProgram
    ? normalizeProgramText(activeProgram.title)
    : t({ tr: 'Sana uygun planı bul', en: 'Find your best-fit plan' });

  return (
    <View style={[styles.todayCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      <View style={styles.todayHeader}>
        <View style={styles.todayTitleWrap}>
          <Text style={[styles.todayEyebrow, { color: colors.onSurfaceVariant }]}>
            {activeProgram
              ? t({ tr: 'BUGÜNKÜ ANTRENMAN', en: "TODAY'S WORKOUT" })
              : t({ tr: 'BAŞLANGIÇ', en: 'START' })}
          </Text>
          <Text style={[styles.todayTitle, { color: colors.onSurface }]}>
            {title}
          </Text>
        </View>
        <View style={[styles.dayBadge, { backgroundColor: `${colors.primary}12` }]}>
          <Text style={[styles.dayBadgeLabel, { color: colors.primary }]}>
            {t({ tr: 'GÜN', en: 'DAY' })}
          </Text>
          <Text style={[styles.dayBadgeValue, { color: colors.primary }]}>
            {dayNumber}
          </Text>
        </View>
      </View>

      <View style={styles.todayPills}>
        <View style={[styles.todayPill, { backgroundColor: colors.surfaceContainerLow }]}>
          <Ionicons name="time-outline" size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.todayPillText, { color: colors.onSurfaceVariant }]}>
            {activeProgram ? `${durationMin} dk` : '5-10 dk'}
          </Text>
        </View>
        <View style={[styles.todayPill, { backgroundColor: colors.surfaceContainerLow }]}>
          <Ionicons name="calendar-outline" size={14} color={colors.onSurfaceVariant} />
          <Text style={[styles.todayPillText, { color: colors.onSurfaceVariant }]}>
            {activeProgram ? `${t({ tr: 'Hafta', en: 'Week' })} ${weekLabel}` : t({ tr: 'Plan kurulumu', en: 'Plan setup' })}
          </Text>
        </View>
      </View>

      <View style={[styles.nextExerciseCard, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}18` }]}>
        <View style={[styles.nextExerciseIcon, { backgroundColor: `${colors.primary}14` }]}>
          <Ionicons name="barbell-outline" size={19} color={colors.primary} />
        </View>
        <View style={styles.nextExerciseCopy}>
          <Text style={[styles.nextExerciseLabel, { color: colors.onSurfaceVariant }]}>
            {activeProgram ? t({ tr: 'SIRADAKİ', en: 'NEXT' }) : t({ tr: 'ÖNERİ', en: 'SUGGESTION' })}
          </Text>
          <Text style={[styles.nextExerciseTitle, { color: colors.onSurface }]}>
            {activeProgram
              ? normalizeProgramText(nextExerciseName ?? nextTitle)
              : t({ tr: 'Hedeflerine göre plan önerisi', en: 'Plan recommendation from your goals' })}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.86}
        onPress={onStart}
        style={[styles.startButton, { backgroundColor: colors.primary }]}
      >
        <Text style={[styles.startButtonText, { color: colors.onPrimary }]}>
          {activeProgram ? t({ tr: 'Antrenmanı Başlat', en: 'Start Workout' }) : t({ tr: 'Plan önerisi al', en: 'Get plan recommendation' })}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.86}
        onPress={activeProgram ? onOpenProgram : onOpen}
        style={[styles.outlineButton, { borderColor: `${colors.primary}66` }]}
      >
        <Text style={[styles.outlineButtonText, { color: colors.primary }]}>
          {activeProgram ? t({ tr: 'Programı Görüntüle', en: 'View Program' }) : t({ tr: 'Seçenekleri Gör', en: 'View Options' })}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function daysAgoLabel(
  isoDate: string,
  referenceTimeMs: number,
  t: ReturnType<typeof useAppLocalization>['t'],
): string {
  if (referenceTimeMs <= 0) return t({ tr: 'Son analiz', en: 'Latest analysis' });
  const createdAtMs = new Date(isoDate).getTime();
  if (!Number.isFinite(createdAtMs)) return t({ tr: 'Son analiz', en: 'Latest analysis' });
  const elapsedDays = Math.max(0, Math.floor((referenceTimeMs - createdAtMs) / 86_400_000));
  if (elapsedDays === 0) return t({ tr: 'Bugün', en: 'Today' });
  if (elapsedDays === 1) return t({ tr: 'Dün', en: 'Yesterday' });
  return t({ tr: `${elapsedDays} gün önce`, en: `${elapsedDays} days ago` });
}

function getNextAIProgramDayId(plan: AIProgramPlan, completedDayIds: string[]): string {
  for (const week of plan.weeks) {
    for (const day of week.days) {
      if (!completedDayIds.includes(day.id)) return day.id;
    }
  }
  return plan.weeks[0]?.days[0]?.id ?? "";
}

function getNextAIProgramDayTitle(plan: AIProgramPlan, completedDayIds: string[]): string {
  const nextDayId = getNextAIProgramDayId(plan, completedDayIds);
  const nextDay = plan.weeks
    .flatMap((week) => week.days)
    .find((day) => day.id === nextDayId);
  return nextDay ? normalizeProgramText(nextDay.title) : "Sıradaki antrenman";
}

function buildAIProgramInsight(
  plan: AIProgramPlan,
  completedDayIds: string[],
  coachAdjustment?: CoachAdjustment,
): string {
  if (coachAdjustment) return coachAdjustment.title;
  const nextTitle = getNextAIProgramDayTitle(plan, completedDayIds);
  if (completedDayIds.length === 0) return `İlk öneri: ${nextTitle}`;
  return `Sıradaki: ${nextTitle}`;
}

function FavoriteProgramsSection({
  programs,
  customWorkouts,
  aiPrograms,
  coachAdjustments,
  progressMap,
  onOpenProgram,
  onOpenAllPrograms,
  onStartCustomWorkout,
  onOpenAIProgram,
  onManageAIProgram,
  onManageCustomWorkout,
}: {
  programs: ReturnType<typeof localizeProgramPlans>;
  customWorkouts: CustomWorkout[];
  aiPrograms: AIProgramPlan[];
  coachAdjustments: CoachAdjustment[];
  progressMap: ProgramProgressMap;
  onOpenProgram: (id: string) => void;
  onOpenAllPrograms: () => void;
  onStartCustomWorkout: (id: string) => void;
  onOpenAIProgram: (id: string) => void;
  onManageAIProgram: (plan: AIProgramPlan) => void;
  onManageCustomWorkout: (workout: CustomWorkout) => void;
}) {
  const { colors } = useAppTheme();
  const { resolved, t } = useAppLocalization();
  const localized = useMemo(() => localizeProgramPlans(programs, resolved.language), [programs, resolved.language]);
  const sortedAIPrograms = useMemo(
    () => [...aiPrograms].sort((left, right) => right.generatedAt.localeCompare(left.generatedAt)),
    [aiPrograms],
  );

  return (
    <View style={styles.favoritesArea}>
      <View style={styles.programAreaHeader}>
        <Text style={[styles.favoritesTitle, { color: colors.onSurface }]}>
          {t({ tr: 'Programların', en: 'Your programs' })}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('fitness.open_all_a11y')}
          onPress={onOpenAllPrograms}
          activeOpacity={0.8}
          style={styles.inlineAction}
        >
          <Text style={[styles.inlineActionText, { color: colors.primary }]}>
            {t('fitness.all_programs')}
          </Text>
          <Ionicons name="chevron-forward" size={15} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {sortedAIPrograms.length === 0 && customWorkouts.length === 0 && localized.length === 0 ? (
        <View style={[styles.programsEmptyCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
          <View style={[styles.programsEmptyIcon, { backgroundColor: `${colors.primary}14` }]}>
            <Ionicons name="barbell-outline" size={22} color={colors.primary} />
          </View>
          <View style={styles.programsEmptyCopy}>
            <Text style={[styles.programsEmptyTitle, { color: colors.onSurface }]}>
              {t({ tr: 'Henüz programın yok', en: 'No programs yet' })}
            </Text>
            <Text style={[styles.programsEmptyBody, { color: colors.onSurfaceVariant }]}>
              {t({
                tr: 'Üstteki seçeneklerden hedeflerine göre plan önerisi alabilir, manuel antrenman ekleyebilir veya hazır programları keşfedebilirsin.',
                en: 'Use the options above to get a plan recommendation from your goals, add a manual workout, or explore ready-made programs.',
              })}
            </Text>
          </View>
        </View>
      ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.programRailContent}>
        {sortedAIPrograms.map((plan) => {
          const progress = progressMap[`ai:${plan.id}`] ?? [];
          const latestAdjustment = coachAdjustments.find((item) => item.planId === plan.id);
          return (
            <ProgramCard
              key={`ai-${plan.id}`}
              type="ai"
              title={normalizeProgramText(plan.title)}
              subtitle={`${plan.weekCount} hafta · ${plan.daysPerWeek} ${t('migrated.fitness_005')}`}
              insight={buildAIProgramInsight(plan, progress, latestAdjustment)}
              color={colors.primary}
              badgeLabel="AI"
              badgeTone="ai"
              secondaryActionIcon="ellipsis-horizontal"
              secondaryActionLabel="Program menüsü"
              onSecondaryAction={() => onManageAIProgram(plan)}
              onPress={() => onOpenAIProgram(plan.id)}
            />
          );
        })}
        {customWorkouts.map((workout) => (
          <ProgramCard
            key={`custom-${workout.id}`}
            type="custom"
            title={repairText(workout.title)}
            subtitle={`${workout.exercises.length} hareket · Özel antrenman`}
            color={colors.secondary}
            badgeLabel="Özel"
            secondaryActionIcon="ellipsis-horizontal"
            secondaryActionLabel="Antrenman menüsü"
            onSecondaryAction={() => onManageCustomWorkout(workout)}
            onPress={() => onStartCustomWorkout(workout.id)}
          />
        ))}
        {localized.map((program) => (
          <ProgramCard
            key={program.id}
            type="library"
            title={normalizeProgramText(program.title)}
            subtitle={repairText(program.sub)}
            color={program.color}
            badgeLabel={program.tier === 'premium' ? t('fitness.favorites_premium_badge') : undefined}
            badgeTone="premium"
            onPress={() => onOpenProgram(program.id)}
          />
        ))}
      </ScrollView>
      )}
    </View>
  );
}

function ProgramCreateSheet({
  visible,
  onClose,
  onBuildAI,
  onAnalyze,
  onCreateManual,
  onExplore,
}: {
  visible: boolean;
  onClose: () => void;
  onBuildAI: () => void;
  onAnalyze: () => void;
  onCreateManual: () => void;
  onExplore: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t({ tr: 'Program oluşturma seçeneklerini kapat', en: 'Close program creation options' })}
          activeOpacity={1}
          onPress={onClose}
          style={styles.sheetBackdrop}
        />
        <View
          style={[
            styles.sheetCard,
            {
              paddingBottom: Math.max(insets.bottom, 14),
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={[styles.sheetGrabber, { backgroundColor: colors.outlineVariant }]} />
          <Text style={[styles.sheetTitle, { color: colors.onSurface }]}>
            {t({ tr: 'Sana uygun planı bul', en: 'Find your best-fit plan' })}
          </Text>
          <Text style={[styles.sheetBody, { color: colors.onSurfaceVariant }]}>
            {t({
              tr: 'Fotoğraf şart değil. Hedeflerine göre başlayabilir, istersen vücut analiziyle daha kişisel hale getirebilirsin.',
              en: 'Photos are optional. Start from your goals, or personalize further with physique analysis.',
            })}
          </Text>

          <View style={styles.sheetActionList}>
            <ProgramCreateActionRow
              icon="sparkles-outline"
              title={t({ tr: 'Hedeflerime göre plan öner', en: 'Recommend a plan from my goals' })}
              body={t({
                tr: 'Fotoğraf şart değil. Hedefin, seviyen, ekipmanın ve gün sayına göre sana en uygun planı seçelim.',
                en: 'No photo required. We select the best-fit plan from your goal, level, equipment, and weekly days.',
              })}
              onPress={onBuildAI}
            />
            <ProgramCreateActionRow
              icon="body-outline"
              title={t({ tr: 'Vücut analiziyle daha kişisel hale getir', en: 'Personalize with physique analysis' })}
              body={t({
                tr: 'Önce analiz yorumunu gör; program odağını buna göre şekillendirelim.',
                en: 'Review the analysis first; then we shape the program focus from it.',
              })}
              onPress={onAnalyze}
            />
            <ProgramCreateActionRow
              icon="create-outline"
              title={t({ tr: 'Manuel antrenman oluştur', en: 'Create a manual workout' })}
              body={t({
                tr: 'Hareketleri, setleri ve günleri kendin seçerek özel antrenman oluştur.',
                en: 'Choose exercises, sets, and days yourself to create a custom workout.',
              })}
              onPress={onCreateManual}
            />
            <ProgramCreateActionRow
              icon="albums-outline"
              title={t({ tr: 'Hazır programlardan seç', en: 'Choose a ready-made program' })}
              body={t({
                tr: 'Kürasyonlu programları incele ve sana uygun olanı başlat.',
                en: 'Browse curated programs and start the one that fits you.',
              })}
              onPress={onExplore}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ProgramCreateActionRow({
  icon,
  title,
  body,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.createOptionRow, { backgroundColor: colors.surfaceContainerLowest }]}
    >
      <View style={[styles.sheetActionIcon, { backgroundColor: `${colors.primary}12` }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.createOptionCopy}>
        <Text style={[styles.createOptionTitle, { color: colors.onSurface }]}>
          {title}
        </Text>
        <Text style={[styles.createOptionBody, { color: colors.onSurfaceVariant }]}>
          {body}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}

function ProgramManagementSheet({
  item,
  mode,
  renameTitle,
  busy,
  onChangeRenameTitle,
  onClose,
  onModeChange,
  onStart,
  onOpenDetail,
  onRegenerate,
  onEdit,
  onDelete,
  onRename,
}: {
  item: ProgramManagementItem | null;
  mode: ProgramManagementMode;
  renameTitle: string;
  busy: boolean;
  onChangeRenameTitle: (value: string) => void;
  onClose: () => void;
  onModeChange: (mode: ProgramManagementMode) => void;
  onStart: () => void;
  onOpenDetail: () => void;
  onRegenerate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRename: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const isAI = item?.kind === 'ai';
  const title = item
    ? isAI
      ? normalizeProgramText(item.plan.title)
      : repairText(item.workout.title)
    : '';

  return (
    <Modal
      visible={item !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.sheetOverlay}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Menüyü kapat"
          activeOpacity={1}
          onPress={onClose}
          style={styles.sheetBackdrop}
        />
        <View
          style={[
            styles.sheetCard,
            {
              paddingBottom: Math.max(insets.bottom, 14),
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <View style={[styles.sheetGrabber, { backgroundColor: colors.outlineVariant }]} />
          <Text numberOfLines={1} style={[styles.sheetTitle, { color: colors.onSurface }]}>
            {mode === 'delete'
              ? t({ tr: 'Silme onayı', en: 'Delete confirmation' })
              : mode === 'rename'
                ? t({ tr: 'Yeniden adlandır', en: 'Rename' })
                : title}
          </Text>
          <Text style={[styles.sheetBody, { color: colors.onSurfaceVariant }]}>
            {mode === 'delete'
              ? t({
                  tr: 'Bu program listenden kaldırılır. Geçmiş antrenman kayıtların korunur.',
                  en: 'This removes the program from your list. Past workout logs stay saved.',
                })
              : mode === 'rename'
                ? t({ tr: 'Kartta görünecek yeni adı yaz.', en: 'Enter the name shown on this card.' })
                : isAI
                  ? t({ tr: 'AI programın için hızlı aksiyon seç.', en: 'Choose a quick action for this AI program.' })
                  : t({ tr: 'Özel antrenmanın için hızlı aksiyon seç.', en: 'Choose a quick action for this custom workout.' })}
          </Text>

          {mode === 'rename' ? (
            <>
              <TextInput
                value={renameTitle}
                onChangeText={onChangeRenameTitle}
                editable={!busy}
                placeholder={t({ tr: 'Antrenman adı', en: 'Workout name' })}
                placeholderTextColor={colors.onSurfaceVariant}
                style={[
                  styles.renameInput,
                  {
                    color: colors.onSurface,
                    borderColor: colors.outlineVariant,
                    backgroundColor: colors.surfaceContainerLowest,
                  },
                ]}
              />
              <View style={styles.sheetButtonRow}>
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.82}
                  disabled={busy}
                  onPress={() => onModeChange('actions')}
                  style={[styles.sheetSecondaryButton, { borderColor: colors.outlineVariant }]}
                >
                  <Text style={[styles.sheetSecondaryButtonText, { color: colors.onSurface }]}>
                    {t({ tr: 'Vazgeç', en: 'Cancel' })}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.82}
                  disabled={busy || !renameTitle.trim()}
                  onPress={onRename}
                  style={[
                    styles.sheetPrimaryButton,
                    { backgroundColor: colors.primary, opacity: busy || !renameTitle.trim() ? 0.45 : 1 },
                  ]}
                >
                  <Text style={[styles.sheetPrimaryButtonText, { color: colors.onPrimary }]}>
                    {busy ? t({ tr: 'Kaydediliyor', en: 'Saving' }) : t({ tr: 'Kaydet', en: 'Save' })}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : mode === 'delete' ? (
            <View style={styles.sheetButtonRow}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.82}
                disabled={busy}
                onPress={() => onModeChange('actions')}
                style={[styles.sheetSecondaryButton, { borderColor: colors.outlineVariant }]}
              >
                <Text style={[styles.sheetSecondaryButtonText, { color: colors.onSurface }]}>
                  {t({ tr: 'Vazgeç', en: 'Cancel' })}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.82}
                disabled={busy}
                onPress={onDelete}
                style={[styles.sheetPrimaryButton, { backgroundColor: colors.error }]}
              >
                <Text style={[styles.sheetPrimaryButtonText, { color: colors.onError }]}>
                  {busy ? t({ tr: 'Siliniyor', en: 'Deleting' }) : t({ tr: 'Sil', en: 'Delete' })}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.sheetActionList}>
              <SheetActionRow icon="play-outline" label={t({ tr: 'Başlat', en: 'Start' })} onPress={onStart} />
              {isAI ? (
                <>
                  <SheetActionRow icon="information-circle-outline" label={t({ tr: 'Detayı gör', en: 'View details' })} onPress={onOpenDetail} />
                  <SheetActionRow icon="refresh-outline" label={t({ tr: 'Yeniden programla', en: 'Regenerate' })} onPress={onRegenerate} />
                </>
              ) : (
                <>
                  <SheetActionRow icon="create-outline" label={t({ tr: 'Düzenle', en: 'Edit' })} onPress={onEdit} />
                  <SheetActionRow icon="text-outline" label={t({ tr: 'Yeniden adlandır', en: 'Rename' })} onPress={() => onModeChange('rename')} />
                </>
              )}
              <SheetActionRow destructive icon="trash-outline" label={t({ tr: 'Sil', en: 'Delete' })} onPress={() => onModeChange('delete')} />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function SheetActionRow({
  icon,
  label,
  destructive = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  destructive?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const color = destructive ? colors.error : colors.onSurface;
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.sheetActionRow, { backgroundColor: colors.surfaceContainerLowest }]}
    >
      <View style={[styles.sheetActionIcon, { backgroundColor: destructive ? `${colors.error}12` : `${colors.primary}12` }]}>
        <Ionicons name={icon} size={18} color={destructive ? colors.error : colors.primary} />
      </View>
      <Text style={[styles.sheetActionLabel, { color }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.onSurfaceVariant} />
    </TouchableOpacity>
  );
}

function WomenCycleCard({
  cyclePhase,
  cycleIntensity,
  onOpenCycle,
}: {
  cyclePhase?: CyclePhase | null;
  cycleIntensity?: CycleIntensity;
  onOpenCycle: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const bodyText = cyclePhase
    ? t(`fitness.cycle_phase_intro_${cycleIntensity ?? 'normal'}`).replace('{faz}', t(`cycle.phase_${cyclePhase}`))
    : t('fitness.women_body');

  return (
    <TouchableOpacity accessibilityRole="button" onPress={onOpenCycle} activeOpacity={0.84} style={[styles.womenCard, { backgroundColor: `${colors.secondary}12`, borderColor: `${colors.secondary}45` }]}>
      <View style={[styles.womenIcon, { backgroundColor: colors.secondary }]}>
        <Ionicons name="flower-outline" size={20} color={colors.onSecondary} />
      </View>
      <View style={styles.womenCopy}>
        <Text style={[styles.womenTitle, { color: colors.onSurface }]}>{t('fitness.women_title')}</Text>
        <Text style={[styles.womenBody, { color: colors.onSurfaceVariant }]}>{bodyText}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.secondary} />
    </TouchableOpacity>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.containerMargin, gap: 22 },

  todayCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    ...shadowStyle('md'),
  },
  todayHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  todayTitleWrap: { flex: 1, gap: 4 },
  todayEyebrow: { ...typography.labelCaps, fontSize: 10, letterSpacing: 1.1 },
  todayTitle: { ...typography.headlineLg, fontSize: 24, lineHeight: 30 },
  dayBadge: {
    minWidth: 54,
    minHeight: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  dayBadgeLabel: { ...typography.labelCaps, fontSize: 9, lineHeight: 11 },
  dayBadgeValue: { ...typography.labelMd, fontSize: 15, lineHeight: 18 },
  todayPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  todayPill: {
    minHeight: 32,
    borderRadius: 999,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todayPillText: { ...typography.labelMd, fontSize: 12, lineHeight: 16 },
  nextExerciseCard: {
    minHeight: 88,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextExerciseIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  nextExerciseCopy: { flex: 1, gap: 3 },
  nextExerciseLabel: { ...typography.labelCaps, fontSize: 10, letterSpacing: 1.2 },
  nextExerciseTitle: { ...typography.headlineMd, fontSize: 20, lineHeight: 25 },
  startButton: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowStyle('sm'),
  },
  startButtonText: { ...typography.buttonLg, fontSize: 17, lineHeight: 22 },
  outlineButton: {
    minHeight: 46,
    borderRadius: 16,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: { ...typography.labelMd },

  progressBlock: { gap: 12 },
  sectionHeadingTitle: { ...typography.sectionTitle, fontSize: 20, lineHeight: 26 },
  progressGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  progressMetric: {
    width: '48%',
    minHeight: 108,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    ...shadowStyle('sm'),
  },
  progressMetricWide: {
    width: '100%',
    minHeight: 92,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 14,
    ...shadowStyle('sm'),
  },
  progressMetricLabel: { ...typography.labelMd, fontSize: 12, lineHeight: 16, textAlign: 'center' },
  progressMetricValue: { ...typography.labelMd, textAlign: 'center' },

  createHero: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  createHeroGlowPrimary: { position: 'absolute', width: 160, height: 160, borderRadius: 80, top: -68, right: -44 },
  createHeroGlowSecondary: { position: 'absolute', width: 120, height: 120, borderRadius: 60, bottom: -58, left: -42 },
  createHeroHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  createHeroIcon: { width: 48, height: 48, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  createHeroCopy: { flex: 1, gap: 3 },
  createHeroTitle: { ...typography.headlineMd, fontSize: 20, lineHeight: 26 },
  createHeroBody: { ...typography.bodySm },
  createHeroActions: { flexDirection: 'row', gap: 10 },
  quickActionChip: { flex: 1, minHeight: 50, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 10 },
  quickActionIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickActionLabel: { ...typography.labelXs, textAlign: 'center' },

  bodyProgressCard: { padding: 14, gap: 12 },
  bodyProgressHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bodyProgressIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  bodyProgressCopy: { flex: 1, gap: 3 },
  bodyProgressTitle: { ...typography.cardTitle },
  bodyProgressBody: { ...typography.bodySm },
  bodyProgressMetrics: { flexDirection: 'row', gap: 10 },
  bodyProgressMetric: { flex: 1, borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 2 },
  bodyProgressMetricLabel: { ...typography.labelXs },
  bodyProgressMetricValue: { ...typography.labelMd },
  bodyProgressMetricHint: { ...typography.bodyXs },

  favoritesArea: { gap: 12 },
  favoritesTitle: { ...typography.sectionTitle, fontSize: 19, lineHeight: 25 },
  programsEmptyCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  programsEmptyIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  programsEmptyCopy: { gap: 3 },
  programsEmptyTitle: { ...typography.headlineMd, fontSize: 18, lineHeight: 24 },
  programsEmptyBody: { ...typography.bodySm },

  createOptionRow: { minHeight: 86, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  createOptionCopy: { flex: 1, gap: 3 },
  createOptionTitle: { ...typography.labelMd },
  createOptionBody: { ...typography.bodyXs, lineHeight: 17 },

  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(8, 12, 18, 0.42)' },
  sheetCard: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 18,
  },
  sheetGrabber: { width: 44, height: 5, borderRadius: 999, alignSelf: 'center', marginBottom: 4 },
  sheetTitle: { ...typography.headlineMd, fontSize: 20, lineHeight: 26, textAlign: 'center' },
  sheetBody: { ...typography.bodySm, textAlign: 'center' },
  sheetActionList: { gap: 8 },
  sheetActionRow: { minHeight: 54, borderRadius: 16, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetActionIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sheetActionLabel: { ...typography.labelMd, flex: 1 },
  renameInput: { minHeight: 52, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, ...typography.bodyMd },
  sheetButtonRow: { flexDirection: 'row', gap: 10 },
  sheetSecondaryButton: { flex: 1, minHeight: 48, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sheetSecondaryButtonText: { ...typography.labelMd },
  sheetPrimaryButton: { flex: 1, minHeight: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  sheetPrimaryButtonText: { ...typography.labelMd },

  womenCard: { minHeight: 78, borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  womenIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  womenCopy: { flex: 1, gap: 2 },
  womenTitle: { ...typography.labelMd },
  womenBody: { ...typography.bodySm },

  programArea: { gap: 14 },
  programAreaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  programAreaTitle: { ...typography.sectionTitle, fontSize: 19, lineHeight: 25 },
  inlineAction: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 2 },
  inlineActionText: { ...typography.labelMd, fontSize: 12, lineHeight: 16 },
  programRailContent: { gap: 14, paddingRight: 8 },
  programCard: { width: 240, borderRadius: 22, borderWidth: 1, overflow: 'hidden' },
  programVisual: { height: 112, alignItems: 'center', justifyContent: 'center' },
  programBadge: { position: 'absolute', top: 14, right: 14, minHeight: 24, paddingHorizontal: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.88)', justifyContent: 'center' },
  programBadgeText: { ...typography.labelXs },
  programCopy: { padding: 16, gap: 4 },
  programTitle: { ...typography.headlineMd, fontSize: 20, lineHeight: 25 },
  programMeta: { ...typography.labelMd, fontSize: 12, lineHeight: 16 },
  programSub: { ...typography.bodySm },
  programHint: { ...typography.bodySm, fontSize: 11, lineHeight: 15 },

  continueCard: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 12, overflow: 'hidden' },
  continueAccent: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 5 },
  continueBody: { gap: 8 },
  continueBadge: { alignSelf: 'flex-start', minHeight: 26, borderRadius: 999, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  continueBadgeText: { ...typography.labelCaps, fontSize: 10 },
  continueTitle: { ...typography.headlineMd, fontSize: 20, lineHeight: 26 },
  continueSubtitle: { ...typography.bodySm },
  continueTrack: { height: 7, borderRadius: 99, overflow: 'hidden', marginTop: 2 },
  continueFill: { height: '100%', borderRadius: 99 },
  continueButton: { minHeight: 50, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 2 },
  continueButtonText: { ...typography.labelMd },

  shortcutEmpty: { borderRadius: 18, borderWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  shortcutEmptyIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  shortcutEmptyCopy: { flex: 1, gap: 2 },
  shortcutRow: { borderRadius: 18, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  shortcutIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  shortcutCopy: { flex: 1, gap: 2 },
  shortcutTitle: { ...typography.labelMd },
  shortcutBody: { ...typography.bodySm },
  shortcutViewAll: { ...typography.labelMd, fontSize: 12 },
}));
