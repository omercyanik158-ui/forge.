import { createDynamicStyles, spacing, typography, useAppTheme } from '@/theme';
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useScrollToTop } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ProgramCard } from '@/components/ProgramCard';
import { TopBar } from '@/components/TopBar';
import { useAppLocalization } from '@/providers/localization-context';
import {
  deleteAIProgramInstance,
  loadAIProgramInstances,
} from '@/services/aiProgramInstanceStore';
import {
  deleteCustomWorkout,
  loadCustomWorkouts,
  updateCustomWorkoutTitle,
  type CustomWorkout,
} from '@/services/customWorkoutStore';
import { computeCycleIntensity, type CycleIntensity } from '@/services/personalCoach';
import { summarizeCycleTracking, loadCycleTracking, type CyclePhase } from '@/services/cycleTracking';
import { ALL_PROGRAMS, FREE_PROGRAMS, getProgramDayCount, PREMIUM_PROGRAMS } from '@/services/programCatalog';
import { localizeProgramPlans } from '@/services/program-localization';
import { subscribeFavoritesRailChange } from '@/services/favoritesRailEvents';
import { loadFavoriteProgramIds } from '@/services/programFavoriteStore';
import { loadAllProgramProgress } from '@/services/programProgressStore';
import { loadProfile } from '@/services/profileStore';
import { canAccessPremiumPrograms } from '@/services/subscription';
import { normalizeProgramText, repairText } from '@/services/textUtils';
import type { AIProgramPlan } from '@/types/aiProgramPlan';
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
  const [progressMap, setProgressMap] = useState<ProgramProgressMap>({});
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favoriteProgramIds, setFavoriteProgramIds] = useState<string[]>([]);
  const [cycleState, setCycleState] = useState<{ phase: CyclePhase | null; intensity: CycleIntensity }>({ phase: null, intensity: 'normal' });
  const [managementItem, setManagementItem] = useState<ProgramManagementItem | null>(null);
  const [managementMode, setManagementMode] = useState<ProgramManagementMode>('actions');
  const [renameTitle, setRenameTitle] = useState('');
  const [managementBusy, setManagementBusy] = useState(false);

  const refreshData = useCallback(async () => {
    const [loadedProfile, savedWorkouts, cycleTracking, aiProgramsData, favoriteIds, progress] = await Promise.all([
      loadProfile(),
      loadCustomWorkouts(),
      loadCycleTracking(),
      loadAIProgramInstances(),
      loadFavoriteProgramIds(),
      loadAllProgramProgress(),
    ]);
    setProfile(loadedProfile);
    setCustomWorkouts(savedWorkouts);
    setAIProgramInstances(aiProgramsData);
    setFavoriteProgramIds(favoriteIds);
    setProgressMap(progress);
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
  }, [managementBusy, managementItem, refreshData]);

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
      <TopBar />
      <ScrollView
        ref={scrollRef}
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.screenHeaderOffset, paddingBottom: spacing.tabContentBottom }]}
      >
        <CreateProgramHero
          onCreate={() => router.push('/create-workout')}
        />
        <FavoriteProgramsSection
          programs={favoriteLibraryPrograms}
          customWorkouts={customWorkouts}
          aiPrograms={aiPrograms}
          progressMap={progressMap}
          onBuildAI={() => router.push('/ai-program-builder')}
          onExplore={() => router.push('/programs')}
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
        <DiscoverSection
          gender={profile?.gender}
          premiumUnlocked={canAccessPremiumPrograms(profile)}
          onOpenAll={() => router.push('/programs')}
          onOpenProgram={(id) => router.push({ pathname: '/program-detail', params: { id } })}
        />
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
    </View>
  );
}

function CreateProgramHero({
  onCreate,
}: {
  onCreate: () => void;
}) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <View
      style={[
        styles.createHero,
        {
          backgroundColor: colors.primary,
          borderColor: `${colors.primary}55`,
        },
      ]}
    >
      <View style={[styles.createHeroGlowPrimary, { backgroundColor: `${colors.secondary}55` }]} />
      <View style={[styles.createHeroGlowSecondary, { backgroundColor: `${colors.tertiary}45` }]} />
      <View style={styles.createHeroHeader}>
        <View style={[styles.createHeroIcon, { backgroundColor: colors.whiteAlpha20 }]}>
          <Ionicons name="barbell-outline" size={22} color={colors.onPrimary} />
        </View>
        <View style={styles.createHeroCopy}>
          <Text style={[styles.createHeroTitle, { color: colors.onPrimary }]}>
            {t({ tr: 'Antrenman alanın', en: 'Your training space' })}
          </Text>
          <Text style={[styles.createHeroBody, { color: colors.whiteAlpha60 }]}>
            {t({
              tr: 'AI programını AI Hub’dan oluştur, burada uygula ve yönet. İstersen kendi antrenmanını da ekleyebilirsin.',
              en: 'Create your AI program in AI Hub, then use and manage it here. You can also add your own workout.',
            })}
          </Text>
        </View>
      </View>
      <View style={styles.createHeroActions}>
        <QuickActionChip
          icon="add"
          label={t({ tr: 'Antrenman oluştur', en: 'Create workout' })}
          accessibilityLabel={t({ tr: 'Antrenman oluştur', en: 'Create workout' })}
          accent={colors.primary}
          onPress={onCreate}
        />
      </View>
    </View>
  );
}
function QuickActionChip({
  icon,
  label,
  accessibilityLabel,
  accent,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accessibilityLabel: string;
  accent: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.quickActionChip, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLowest }]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${accent}14` }]}>
        <Ionicons name={icon} size={16} color={accent} />
      </View>
      <Text numberOfLines={1} style={[styles.quickActionLabel, { color: colors.onSurface }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
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

function buildAIProgramInsight(plan: AIProgramPlan, completedDayIds: string[]): string {
  const nextTitle = getNextAIProgramDayTitle(plan, completedDayIds);
  if (completedDayIds.length === 0) return `İlk öneri: ${nextTitle}`;
  return `Sıradaki: ${nextTitle}`;
}

function FavoriteProgramsSection({
  programs,
  customWorkouts,
  aiPrograms,
  progressMap,
  onBuildAI,
  onExplore,
  onOpenProgram,
  onStartCustomWorkout,
  onOpenAIProgram,
  onManageAIProgram,
  onManageCustomWorkout,
}: {
  programs: ReturnType<typeof localizeProgramPlans>;
  customWorkouts: CustomWorkout[];
  aiPrograms: AIProgramPlan[];
  progressMap: ProgramProgressMap;
  onBuildAI: () => void;
  onExplore: () => void;
  onOpenProgram: (id: string) => void;
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
          {t({ tr: 'Favori Programlar', en: 'Favorite Programs' })}
        </Text>
      </View>
      {sortedAIPrograms.length === 0 && customWorkouts.length === 0 && localized.length === 0 ? (
        <View style={[styles.programsEmptyCard, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
          <View style={[styles.programsEmptyIcon, { backgroundColor: `${colors.secondary}14` }]}>
            <Ionicons name="sparkles-outline" size={22} color={colors.secondary} />
          </View>
          <View style={styles.programsEmptyCopy}>
            <Text style={[styles.programsEmptyTitle, { color: colors.onSurface }]}>
              {t('my_plans.shortcut_empty_title')}
            </Text>
            <Text style={[styles.programsEmptyBody, { color: colors.onSurfaceVariant }]}>
              {t('my_plans.shortcut_empty_body')}
            </Text>
          </View>
          <View style={styles.programsEmptyActions}>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.85}
              onPress={onBuildAI}
              style={[styles.programsEmptyPrimary, { backgroundColor: colors.secondary }]}
            >
              <Text style={[styles.programsEmptyPrimaryText, { color: colors.onSecondary }]}>
                {t('my_plans.empty_cta_ai')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.85}
              onPress={onExplore}
              style={[styles.programsEmptySecondary, { borderColor: colors.outlineVariant }]}
            >
              <Text style={[styles.programsEmptySecondaryText, { color: colors.onSurface }]}>
                {t('fitness.explore_programs')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.programRailContent}>
        {sortedAIPrograms.map((plan) => {
          const progress = progressMap[`ai:${plan.id}`] ?? [];
          return (
            <ProgramCard
              key={`ai-${plan.id}`}
              type="ai"
              title={normalizeProgramText(plan.title)}
              subtitle={`${plan.weekCount} hafta · ${plan.daysPerWeek} ${t('migrated.fitness_005')}`}
              insight={buildAIProgramInsight(plan, progress)}
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

function prioritizeProgramsForGender<T extends { trainingStyle: string }>(programs: T[], gender?: UserProfile['gender']): T[] {
  if (gender !== 'female') return programs;
  return [...programs].sort((a, b) => Number(['Pilates', 'Yoga'].includes(b.trainingStyle)) - Number(['Pilates', 'Yoga'].includes(a.trainingStyle)));
}

function DiscoverSection({
  gender,
  premiumUnlocked,
  onOpenAll,
  onOpenProgram,
}: {
  gender?: UserProfile['gender'];
  premiumUnlocked: boolean;
  onOpenAll: () => void;
  onOpenProgram: (id: string, locked: boolean) => void;
}) {
  const { colors } = useAppTheme();
  const { resolved, t } = useAppLocalization();
  const freePrograms = useMemo(() => prioritizeProgramsForGender(localizeProgramPlans(FREE_PROGRAMS, resolved.language), gender), [gender, resolved.language]);
  const premiumPrograms = useMemo(() => localizeProgramPlans(PREMIUM_PROGRAMS, resolved.language), [resolved.language]);

  const items = useMemo(() => {
    const combined = [
      ...freePrograms.map((program) => ({ program, locked: false })),
      ...premiumPrograms.map((program) => ({ program, locked: !premiumUnlocked })),
    ];
    return combined.slice(0, 4);
  }, [freePrograms, premiumPrograms, premiumUnlocked]);

  return (
    <View style={styles.programArea}>
      <View style={styles.programAreaHeader}>
        <Text style={[styles.programAreaTitle, { color: colors.onSurface }]}>
          {t('fitness.programs')}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t('fitness.open_all_a11y')}
          onPress={onOpenAll}
          activeOpacity={0.8}
          style={styles.inlineAction}
        >
          <Text style={[styles.inlineActionText, { color: colors.onSurface }]}>
            {t('fitness.all_programs')}
          </Text>
          <Ionicons name="chevron-forward" size={15} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.programRailContent}>
        {items.map(({ program, locked }) => (
          <TouchableOpacity
            key={program.id}
            accessibilityRole="button"
            accessibilityLabel={`${normalizeProgramText(program.title)}, ${repairText(program.trainingStyle)}, ${program.daysPerWeek} ${t('migrated.fitness_005')}${locked ? `, ${t('migrated.fitness_006')}` : `, ${t('migrated.fitness_007')}`}`}
            activeOpacity={0.86}
            onPress={() => onOpenProgram(program.id, locked)}
          >
            <View style={[styles.programCard, { backgroundColor: colors.surfaceContainerLowest, borderColor: colors.outlineVariant }]}>
              <View style={[styles.programVisual, { backgroundColor: program.color }]}>
                <Ionicons name="arrow-down-outline" size={28} color={colors.whiteAlpha60} />
              </View>
              <View style={styles.programBadge}>
                <Text style={[styles.programBadgeText, { color: colors.onSurface }]}>
                  {locked ? t('migrated.fitness_008') : t('migrated.fitness_009')}
                </Text>
              </View>
              <View style={styles.programCopy}>
                <Text numberOfLines={2} style={[styles.programTitle, { color: colors.onSurface }]}>
                  {normalizeProgramText(program.title)}
                </Text>
                <Text style={[styles.programMeta, { color: colors.onSurface }]}>
                  {repairText(program.duration)} · {program.daysPerWeek} {t('migrated.fitness_005')}
                </Text>
                <Text numberOfLines={1} style={[styles.programSub, { color: colors.onSurface }]}>
                  {repairText(program.trainingStyle)} · {repairText(program.difficultyLevel)}
                </Text>
                <Text numberOfLines={1} style={[styles.programHint, { color: colors.onSurface }]}>
                  {getProgramDayCount(program)} {t('migrated.fitness_010')} · {repairText(program.focus)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.containerMargin, gap: 18 },

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

  favoritesArea: { gap: 12 },
  favoritesTitle: { ...typography.sectionTitle, fontSize: 19, lineHeight: 25 },
  programsEmptyCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 12 },
  programsEmptyIcon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  programsEmptyCopy: { gap: 3 },
  programsEmptyTitle: { ...typography.headlineMd, fontSize: 18, lineHeight: 24 },
  programsEmptyBody: { ...typography.bodySm },
  programsEmptyActions: { flexDirection: 'row', gap: 10 },
  programsEmptyPrimary: { flex: 1, minHeight: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  programsEmptyPrimaryText: { ...typography.labelMd, textAlign: 'center' },
  programsEmptySecondary: { flex: 1, minHeight: 46, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  programsEmptySecondaryText: { ...typography.labelMd, textAlign: 'center' },

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
