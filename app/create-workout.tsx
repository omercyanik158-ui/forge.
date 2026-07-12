import {
  colors,
  createDynamicStyles,
  layout,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import {
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useMemo, useState } from "react";
import { ExerciseFilterChips } from "@/components/ExerciseFilterChips";
import { ExerciseImageModal } from "@/components/ExerciseImageModal";
import { useAppLocalization } from "@/providers/localization-context";
import {
  getExerciseById,
  getSearchableExercises,
} from "@/services/exerciseCatalog";
import { processEngagement } from "@/services/achievementStore";
import { safeGoBack } from "@/services/navigation";
import {
  loadFavoriteExerciseIds,
  toggleFavoriteExercise,
} from "@/services/exerciseFavorites";
import {
  getCustomWorkoutById,
  saveCustomWorkout,
  updateCustomWorkout,
} from "@/services/customWorkoutStore";
import { loadMeals } from "@/services/mealStore";
import { loadProfile } from "@/services/profileStore";
import { normalizedText, repairText } from "@/services/textUtils";
import {
  selectionFeedback,
  successFeedback,
} from "@/services/interactionFeedback";
import type { ExerciseFilter, ExerciseLibraryItem } from "@/types";

const FILTER_ALL: ExerciseFilter = "Tümü";
const FILTER_FAVORITES: ExerciseFilter = "Favoriler";
const EXERCISE_BATCH_SIZE = 48;

type SelectedExerciseDraft = {
  exerciseId: string;
  sets: string;
  reps: string;
  weightKg: string;
};

type CreateStep = "select" | "configure";
type Translate = (key: string) => string;

export default function CreateWorkoutScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const [workoutName, setWorkoutName] = useState("");
  const [query, setQuery] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(EXERCISE_BATCH_SIZE);
  const [selectedFilter, setSelectedFilter] =
    useState<ExerciseFilter>(FILTER_ALL);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<
    SelectedExerciseDraft[]
  >([]);
  const [step, setStep] = useState<CreateStep>("select");
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [loadedWorkoutId, setLoadedWorkoutId] = useState<string | null>(null);
  const [missingWorkout, setMissingWorkout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedExerciseImage, setSelectedExerciseImage] = useState<{
    title: string;
    imageUrls: string[];
  } | null>(null);

  const editingWorkoutId = typeof id === "string" ? id : null;
  const editing = editingWorkoutId != null;
  const selectedIdSet = useMemo(
    () => new Set(selectedExercises.map((item) => item.exerciseId)),
    [selectedExercises],
  );
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function refresh() {
        setLoading(true);
        const favorites = await loadFavoriteExerciseIds();
        if (!active) return;

        setFavoriteIds(favorites);
        setSelectedFilter(FILTER_ALL);
        setMissingWorkout(false);

        if (editingWorkoutId && loadedWorkoutId !== editingWorkoutId) {
          const workout = await getCustomWorkoutById(editingWorkoutId);
          if (!active) return;

          if (!workout) {
            setMissingWorkout(true);
            setLoading(false);
            return;
          }

          setWorkoutName(workout.title);
          setSelectedExercises(
            workout.exercises.map((entry) => ({
              exerciseId: entry.exerciseId,
              sets: String(entry.sets),
              reps: String(entry.reps),
              weightKg: entry.weightKg == null ? "" : String(entry.weightKg),
            })),
          );
          setLoadedWorkoutId(editingWorkoutId);
        }

        if (active) setLoading(false);
      }

      refresh();
      return () => {
        active = false;
      };
    }, [editingWorkoutId, loadedWorkoutId]),
  );

  const visibleExercises = useMemo(() => {
    const normalizedQuery = normalizedText(query);
    const selectedGroup = normalizedText(selectedFilter);

    return getSearchableExercises().filter(
      ({ exercise, name, group, equipment, targets }) => {
        const matchesFavorites =
          selectedFilter !== FILTER_FAVORITES || favoriteIdSet.has(exercise.id);
        const matchesGroup =
          selectedFilter === FILTER_ALL ||
          selectedFilter === FILTER_FAVORITES ||
          group === selectedGroup;
        const matchesQuery =
          normalizedQuery.length === 0 ||
          name.includes(normalizedQuery) ||
          group.includes(normalizedQuery) ||
          equipment.includes(normalizedQuery) ||
          targets.includes(normalizedQuery);

        return matchesFavorites && matchesGroup && matchesQuery;
      },
    )
      .sort((left, right) => {
        const leftSelected = selectedIdSet.has(left.exercise.id);
        const rightSelected = selectedIdSet.has(right.exercise.id);
        if (leftSelected !== rightSelected) return leftSelected ? -1 : 1;

        const leftFavorite = favoriteIdSet.has(left.exercise.id);
        const rightFavorite = favoriteIdSet.has(right.exercise.id);
        if (leftFavorite !== rightFavorite) return leftFavorite ? -1 : 1;

        return repairText(left.exercise.displayName).localeCompare(
          repairText(right.exercise.displayName),
          "tr-TR",
        );
      })
      .map(({ exercise }) => exercise);
  }, [favoriteIdSet, query, selectedFilter, selectedIdSet]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setVisibleLimit(EXERCISE_BATCH_SIZE);
  };

  const handleFilterChange = (value: ExerciseFilter) => {
    setSelectedFilter(value);
    setVisibleLimit(EXERCISE_BATCH_SIZE);
  };

  const displayedExercises = useMemo(
    () => visibleExercises.slice(0, visibleLimit),
    [visibleExercises, visibleLimit],
  );
  const draftByExerciseId = useMemo(
    () => new Map(selectedExercises.map((item) => [item.exerciseId, item])),
    [selectedExercises],
  );
  const selectedExerciseItems = useMemo(
    () =>
      selectedExercises.flatMap((draft) => {
        const exercise = getExerciseById(draft.exerciseId);
        return exercise ? [exercise] : [];
      }),
    [selectedExercises],
  );
  const saveDisabled =
    saving || loading || missingWorkout || selectedExercises.length === 0;

  const toggleExerciseSelection = (exercise: ExerciseLibraryItem) => {
    setSelectedExercises((current) => {
      const selected = current.some((item) => item.exerciseId === exercise.id);
      if (selected)
        return current.filter((item) => item.exerciseId !== exercise.id);
      return [
        ...current,
        {
          exerciseId: exercise.id,
          sets: String(exercise.defaultSets || 3),
          reps: String(exercise.defaultReps || 10),
          weightKg: "",
        },
      ];
    });
    selectionFeedback();
  };

  const handleToggleFavorite = async (exerciseId: string) => {
    setFavoriteIds(await toggleFavoriteExercise(exerciseId));
  };

  const updateSelectedExercise = (
    exerciseId: string,
    field: "sets" | "reps" | "weightKg",
    value: string,
  ) => {
    const numericValue =
      field === "weightKg"
        ? value.replace(/[^0-9.,]/g, "").replace(",", ".")
        : value.replace(/[^0-9]/g, "");
    setSelectedExercises((current) =>
      current.map((item) =>
        item.exerciseId === exerciseId
          ? { ...item, [field]: numericValue }
          : item,
      ),
    );
  };

  const validateSelection = () => {
    if (selectedExercises.length === 0) {
      Alert.alert(
        t("migrated.create_workout_001"),
        t("migrated.create_workout_002"),
      );
      return false;
    }

    const invalidEntry = selectedExercises.find(
      (item) => Number(item.sets) <= 0 || Number(item.reps) <= 0,
    );
    if (invalidEntry) {
      const exercise = getExerciseById(invalidEntry.exerciseId);
      Alert.alert(
        t("migrated.create_workout_003"),
        t("migrated.create_workout_046").replace(
          "{name}",
          exercise
            ? repairText(exercise.displayName)
            : t("migrated.create_workout_001"),
        ),
      );
      return false;
    }

    return true;
  };

  const handleTopAction = () => {
    if (saveDisabled) return;
    if (step === "select") {
      setStep("configure");
      return;
    }
    if (!validateSelection()) return;
    if (editing) {
      void handleSave();
      return;
    }
    setNameModalVisible(true);
  };

  const handleBack = () => {
    if (step === "configure") {
      setStep("select");
      return;
    }
    safeGoBack(router);
  };

  const handleSave = async () => {
    const cleanTitle = workoutName.trim();
    if (!cleanTitle || saving) return;

    setSaving(true);
    try {
      const payload = {
        title: cleanTitle,
        exercises: selectedExercises.map((item) => ({
          exerciseId: item.exerciseId,
          sets: Number(item.sets),
          reps: Number(item.reps),
          ...(item.weightKg.trim() ? { weightKg: Number(item.weightKg) } : {}),
        })),
      };

      if (editingWorkoutId) {
        await updateCustomWorkout(editingWorkoutId, payload);
      } else {
        await saveCustomWorkout(payload);
      }

      const currentProfile = await loadProfile();
      if (currentProfile)
        await processEngagement(currentProfile, await loadMeals());

      successFeedback();
      setNameModalVisible(false);
      router.replace("/(tabs)/fitness");
    } catch {
      Alert.alert(
        t("migrated.create_workout_004"),
        t("migrated.create_workout_047"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top,
            backgroundColor: colors.overlay,
            borderBottomColor: colors.outlineVariant,
          },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            step === "configure"
              ? t("migrated.create_workout_005")
              : t("migrated.create_workout_006")
          }
          onPress={handleBack}
          activeOpacity={0.75}
          style={styles.iconButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.onSurface }]}>
          {step === "select"
            ? t("migrated.create_workout_001")
            : t("migrated.create_workout_007")}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            step === "select"
              ? t("migrated.create_workout_008")
              : editing
                ? t("migrated.create_workout_009")
                : t("migrated.create_workout_010")
          }
          accessibilityState={{ disabled: saveDisabled }}
          onPress={handleTopAction}
          activeOpacity={saveDisabled ? 1 : 0.8}
          disabled={saveDisabled}
          style={[
            styles.saveButton,
            {
              backgroundColor: saveDisabled
                ? colors.surfaceContainer
                : colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.saveText,
              {
                color: saveDisabled
                  ? colors.onSurfaceVariant
                  : colors.onPrimary,
              },
            ]}
          >
            {saving
              ? t("migrated.create_workout_011")
              : step === "select"
                ? t("migrated.create_workout_012")
                : t("migrated.create_workout_013")}
          </Text>
        </TouchableOpacity>
      </View>

      {missingWorkout ? (
        <View
          style={[styles.missingWrap, { backgroundColor: colors.background }]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={32}
            color={colors.outline}
          />
          <Text style={[styles.missingTitle, { color: colors.onSurface }]}>
            {t("migrated.create_workout_014")}
          </Text>
          <Text
            style={[styles.missingBody, { color: colors.onSurfaceVariant }]}
          >
            {t("migrated.create_workout_048")}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.replace("/create-workout")}
            style={[styles.missingButton, { backgroundColor: colors.primary }]}
          >
            <Text
              style={[styles.missingButtonText, { color: colors.onPrimary }]}
            >
              {t("migrated.create_workout_015")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={step === "select" ? displayedExercises : selectedExerciseItems}
          keyExtractor={(item) => item.id}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={process.env.EXPO_OS !== "web"}
          onEndReachedThreshold={0.35}
          onEndReached={() => {
            if (step === "select" && visibleLimit < visibleExercises.length) {
              setVisibleLimit((current) =>
                Math.min(
                  current + EXERCISE_BATCH_SIZE,
                  visibleExercises.length,
                ),
              );
            }
          }}
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 88, paddingBottom: insets.bottom + 32 },
          ]}
          ListHeaderComponent={
            <View style={styles.formBlock}>
              <StepIndicator step={step} t={t} />
              <View style={styles.titleBlock}>
                <Text style={[styles.title, { color: colors.onSurface }]}>
                  {step === "select"
                    ? editing
                      ? t("migrated.create_workout_016")
                      : t("migrated.create_workout_017")
                    : t("migrated.create_workout_018")}
                </Text>
                <Text
                  style={[styles.subtitle, { color: colors.onSurfaceVariant }]}
                >
                  {step === "select"
                    ? t("migrated.create_workout_049")
                    : t("migrated.create_workout_050")}
                </Text>
              </View>

              {step === "select" ? (
                <SearchBar
                  query={query}
                  onChangeQuery={handleQueryChange}
                  t={t}
                />
              ) : null}
              {step === "select" ? (
                <ExerciseFilterChips
                  selected={selectedFilter}
                  onSelect={handleFilterChange}
                />
              ) : null}

              <View style={styles.resultsRow}>
                <Text
                  style={[
                    styles.selectedText,
                    { color: colors.onSurfaceVariant },
                  ]}
                >
                  {step === "select"
                    ? loading
                      ? t("migrated.create_workout_019")
                      : t("migrated.create_workout_dynamic_001").replace(
                          "{count}",
                          `${visibleExercises.length}`,
                        )
                    : t("migrated.create_workout_020")}
                </Text>
                <Text
                  style={[
                    styles.selectedCount,
                    {
                      color: colors.primary,
                      backgroundColor: `${colors.primary}12`,
                    },
                  ]}
                >
                  {t("migrated.create_workout_dynamic_002").replace(
                    "{count}",
                    `${selectedExercises.length}`,
                  )}
                </Text>
              </View>
            </View>
          }
          renderItem={({ item, index }) =>
            step === "select" ? (
              <ExerciseDraftRow
                exercise={item}
                selected={selectedIdSet.has(item.id)}
                favorite={favoriteIdSet.has(item.id)}
                onToggleSelection={() => toggleExerciseSelection(item)}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
                onPreviewImage={() =>
                  setSelectedExerciseImage({
                    title: item.displayName,
                    imageUrls: item.imageUrls,
                  })
                }
                t={t}
              />
            ) : (
              <WorkoutExerciseConfigRow
                exercise={item}
                index={index}
                draft={draftByExerciseId.get(item.id)!}
                onChange={(field, value) =>
                  updateSelectedExercise(item.id, field, value)
                }
                onRemove={() =>
                  setSelectedExercises((current) =>
                    current.filter((entry) => entry.exerciseId !== item.id),
                  )
                }
                onPreviewImage={() =>
                  setSelectedExerciseImage({
                    title: item.displayName,
                    imageUrls: item.imageUrls,
                  })
                }
                t={t}
              />
            )
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            step === "select" ? (
              <EmptyState query={query} selectedFilter={selectedFilter} t={t} />
            ) : (
              <ConfigureEmptyState onBack={() => setStep("select")} t={t} />
            )
          }
          ListFooterComponent={
            step === "select" &&
            displayedExercises.length < visibleExercises.length ? (
              <Text
                style={[
                  styles.loadingMoreText,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {t("migrated.create_workout_021")}
              </Text>
            ) : null
          }
        />
      )}

      <NameWorkoutModal
        visible={nameModalVisible}
        title={workoutName}
        selectedCount={selectedExercises.length}
        saving={saving}
        onChangeTitle={setWorkoutName}
        onCancel={() => !saving && setNameModalVisible(false)}
        onSave={handleSave}
        t={t}
      />
      <ExerciseImageModal
        visible={selectedExerciseImage != null}
        title={selectedExerciseImage?.title ?? ""}
        imageUrls={selectedExerciseImage?.imageUrls ?? []}
        onClose={() => setSelectedExerciseImage(null)}
      />
    </View>
  );
}

function SearchBar({
  query,
  onChangeQuery,
  t,
}: {
  query: string;
  onChangeQuery: (value: string) => void;
  t: Translate;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.searchBar,
        {
          borderColor: colors.outlineVariant,
          backgroundColor: colors.surfaceContainerLowest,
        },
      ]}
    >
      <Ionicons name="search-outline" size={18} color={colors.outline} />
      <TextInput
        value={query}
        onChangeText={onChangeQuery}
        placeholder={t("migrated.create_workout_022")}
        placeholderTextColor={colors.outline}
        style={[styles.searchInput, { color: colors.onSurface }]}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {query.length > 0 ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("migrated.create_workout_023")}
          activeOpacity={0.8}
          onPress={() => onChangeQuery("")}
          style={styles.clearSearchButton}
        >
          <Ionicons name="close-circle" size={18} color={colors.outline} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function StepIndicator({ step, t }: { step: CreateStep; t: Translate }) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.stepIndicator,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.stepItem}>
        <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
          <Text style={[styles.stepNumberText, { color: colors.onPrimary }]}>
            1
          </Text>
        </View>
        <Text
          style={[
            styles.stepText,
            {
              color:
                step === "select" ? colors.onSurface : colors.onSurfaceVariant,
            },
          ]}
        >
          {t("migrated.create_workout_024")}
        </Text>
      </View>
      <View
        style={[
          styles.stepLine,
          {
            backgroundColor:
              step === "configure" ? colors.primary : colors.outlineVariant,
          },
        ]}
      />
      <View style={styles.stepItem}>
        <View
          style={[
            styles.stepNumber,
            {
              backgroundColor:
                step === "configure"
                  ? colors.primary
                  : colors.surfaceContainerHighest,
            },
          ]}
        >
          <Text
            style={[
              styles.stepNumberText,
              {
                color:
                  step === "configure"
                    ? colors.onPrimary
                    : colors.onSurfaceVariant,
              },
            ]}
          >
            2
          </Text>
        </View>
        <Text
          style={[
            styles.stepText,
            {
              color:
                step === "configure"
                  ? colors.onSurface
                  : colors.onSurfaceVariant,
            },
          ]}
        >
          {t("migrated.create_workout_025")}
        </Text>
      </View>
    </View>
  );
}

function ExerciseDraftRow({
  exercise,
  selected,
  favorite,
  onToggleSelection,
  onToggleFavorite,
  onPreviewImage,
  t,
}: {
  exercise: ExerciseLibraryItem;
  selected: boolean;
  favorite: boolean;
  onToggleSelection: () => void;
  onToggleFavorite: () => void;
  onPreviewImage: () => void;
  t: Translate;
}) {
  const { colors } = useAppTheme();
  const imageUrl = exercise.imageUrls[0];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${repairText(exercise.displayName)}, ${repairText(exercise.muscleGroup)}, ${selected ? t("migrated.create_workout_026") : t("migrated.create_workout_027")}`}
      accessibilityState={{ selected }}
      activeOpacity={0.82}
      onPress={onToggleSelection}
      style={[
        styles.exerciseRow,
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: selected ? colors.primary : colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.exerciseTop}>
        <View style={styles.exerciseMain}>
          <TouchableOpacity
            style={[
              styles.exerciseImageWrap,
              { backgroundColor: colors.surfaceContainerLow },
            ]}
            activeOpacity={0.8}
            onPress={(event) => {
              event.stopPropagation();
              onPreviewImage();
            }}
          >
            {imageUrl ? (
              <ExpoImage
                source={{ uri: imageUrl }}
                style={styles.exerciseImage}
                contentFit="cover"
                cachePolicy="disk"
                transition={160}
              />
            ) : (
              <Ionicons
                name="barbell-outline"
                size={22}
                color={colors.outline}
              />
            )}
          </TouchableOpacity>
          <View style={styles.exerciseCopy}>
            <Text
              numberOfLines={1}
              style={[styles.exerciseTitle, { color: colors.onSurface }]}
            >
              {repairText(exercise.displayName)}
            </Text>
            <View style={styles.exerciseMetaRow}>
              <Text
                style={[
                  styles.muscleChip,
                  {
                    color: colors.primary,
                    backgroundColor: `${colors.primary}12`,
                  },
                ]}
              >
                {repairText(exercise.muscleGroup).toLocaleUpperCase("tr-TR")}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.difficultyText,
                  { color: colors.onSurfaceVariant },
                ]}
              >
                {repairText(exercise.difficulty)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            favorite
              ? t("migrated.create_workout_028")
              : t("migrated.create_workout_029")
          }
          accessibilityState={{ selected: favorite }}
          activeOpacity={0.75}
          onPress={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          style={styles.rowIconButton}
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={19}
            color={favorite ? colors.primary : colors.outline}
          />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            selected
              ? t("migrated.create_workout_030")
              : t("migrated.create_workout_031")
          }
          accessibilityState={{ selected }}
          onPress={(event) => {
            event.stopPropagation();
            onToggleSelection();
          }}
          activeOpacity={0.76}
          style={[
            styles.selectionButton,
            {
              backgroundColor: selected ? `${colors.error}12` : colors.primary,
              borderColor: selected ? `${colors.error}55` : colors.primary,
            },
          ]}
        >
          <Ionicons
            name={selected ? "close" : "add"}
            size={21}
            color={selected ? colors.error : colors.onPrimary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function WorkoutExerciseConfigRow({
  exercise,
  draft,
  index,
  onChange,
  onRemove,
  onPreviewImage,
  t,
}: {
  exercise: ExerciseLibraryItem;
  draft: SelectedExerciseDraft;
  index: number;
  onChange: (field: "sets" | "reps" | "weightKg", value: string) => void;
  onRemove: () => void;
  onPreviewImage: () => void;
  t: Translate;
}) {
  const { colors } = useAppTheme();
  const imageUrl = exercise.imageUrls[0];

  return (
    <View
      style={[
        styles.configCard,
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View style={styles.configHeader}>
        <View
          style={[
            styles.configOrder,
            { backgroundColor: `${colors.primary}14` },
          ]}
        >
          <Text style={[styles.configOrderText, { color: colors.primary }]}>
            {index + 1}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.configImageWrap,
            { backgroundColor: colors.surfaceContainerLow },
          ]}
          activeOpacity={0.8}
          onPress={onPreviewImage}
        >
          {imageUrl ? (
            <ExpoImage
              source={{ uri: imageUrl }}
              style={styles.exerciseImage}
              contentFit="cover"
              cachePolicy="disk"
              transition={160}
            />
          ) : (
            <Ionicons name="barbell-outline" size={22} color={colors.outline} />
          )}
        </TouchableOpacity>
        <View style={styles.configCopy}>
          <Text
            numberOfLines={1}
            style={[styles.configTitle, { color: colors.onSurface }]}
          >
            {repairText(exercise.displayName)}
          </Text>
          <Text
            style={[styles.configMuscle, { color: colors.onSurface }]}
          >
            {repairText(exercise.muscleGroup)}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${repairText(exercise.displayName)} ${t("migrated.create_workout_032")}`}
          onPress={onRemove}
          activeOpacity={0.75}
          style={[
            styles.configRemove,
            { backgroundColor: `${colors.error}10` },
          ]}
        >
          <Ionicons name="close" size={19} color={colors.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.configFields}>
        <ConfigField
          label={t("migrated.create_workout_033")}
          value={draft.sets}
          keyboardType="number-pad"
          onChangeText={(value) => onChange("sets", value)}
        />
        <ConfigField
          label={t("migrated.create_workout_034")}
          value={draft.reps}
          keyboardType="number-pad"
          onChangeText={(value) => onChange("reps", value)}
        />
        <ConfigField
          label={t("migrated.create_workout_035")}
          suffix="kg"
          value={draft.weightKg}
          keyboardType="decimal-pad"
          onChangeText={(value) => onChange("weightKg", value)}
          optional
        />
      </View>
    </View>
  );
}

function ConfigField({
  label,
  value,
  suffix,
  optional,
  keyboardType,
  onChangeText,
}: {
  label: string;
  value: string;
  suffix?: string;
  optional?: boolean;
  keyboardType: "number-pad" | "decimal-pad";
  onChangeText: (value: string) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.configField}>
      <Text style={[styles.configLabel, { color: colors.onSurfaceVariant }]}>
        {label.toLocaleUpperCase("tr-TR")}
      </Text>
      <View
        style={[
          styles.configInputWrap,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderColor: colors.outlineVariant,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={optional ? "—" : "0"}
          placeholderTextColor={colors.outline}
          selectTextOnFocus
          style={[styles.configInput, { color: colors.onSurface }]}
        />
        {suffix ? (
          <Text
            style={[styles.configSuffix, { color: colors.onSurface }]}
          >
            {suffix}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function NameWorkoutModal({
  visible,
  title,
  selectedCount,
  saving,
  onChangeTitle,
  onCancel,
  onSave,
  t,
}: {
  visible: boolean;
  title: string;
  selectedCount: number;
  saving: boolean;
  onChangeTitle: (value: string) => void;
  onCancel: () => void;
  onSave: () => void;
  t: Translate;
}) {
  const { colors } = useAppTheme();
  const disabled = title.trim().length === 0 || saving;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: colors.surfaceContainerLowest,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
            {t("migrated.create_workout_036")}
          </Text>
          <Text style={[styles.modalBody, { color: colors.onSurfaceVariant }]}>
            {t("migrated.create_workout_dynamic_003").replace(
              "{count}",
              `${selectedCount}`,
            )}
          </Text>
          <TextInput
            value={title}
            onChangeText={onChangeTitle}
            placeholder={t("migrated.create_workout_037")}
            placeholderTextColor={colors.outline}
            style={[
              styles.modalInput,
              {
                color: colors.onSurface,
                borderColor: colors.outlineVariant,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
            autoFocus
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              activeOpacity={saving ? 1 : 0.8}
              disabled={saving}
              onPress={onCancel}
              style={[
                styles.modalButton,
                { borderColor: colors.outlineVariant },
              ]}
            >
              <Text
                style={[styles.modalButtonText, { color: colors.onSurface }]}
              >
                {t("migrated.create_workout_038")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={disabled ? 1 : 0.8}
              disabled={disabled}
              onPress={onSave}
              style={[
                styles.modalButton,
                {
                  backgroundColor: disabled
                    ? colors.surfaceContainer
                    : colors.primary,
                  borderColor: disabled
                    ? colors.surfaceContainer
                    : colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalButtonText,
                  {
                    color: disabled
                      ? colors.onSurfaceVariant
                      : colors.onPrimary,
                  },
                ]}
              >
                {saving
                  ? t("migrated.create_workout_011")
                  : t("migrated.create_workout_013")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function EmptyState({
  query,
  selectedFilter,
  t,
}: {
  query: string;
  selectedFilter: ExerciseFilter;
  t: Translate;
}) {
  const { colors } = useAppTheme();
  const message =
    selectedFilter === FILTER_FAVORITES
      ? t("migrated.create_workout_039")
      : query.trim().length > 0
        ? t("migrated.create_workout_040")
        : t("migrated.create_workout_041");

  return (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={28} color={colors.outline} />
      <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
        {t("migrated.create_workout_042")}
      </Text>
      <Text style={[styles.emptyBody, { color: colors.onSurfaceVariant }]}>
        {message}
      </Text>
    </View>
  );
}

function ConfigureEmptyState({
  onBack,
  t,
}: {
  onBack: () => void;
  t: Translate;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.configureEmptyIcon,
          { backgroundColor: `${colors.primary}12` },
        ]}
      >
        <Ionicons name="add" size={25} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.onSurface }]}>
        {t("migrated.create_workout_043")}
      </Text>
      <Text style={[styles.emptyBody, { color: colors.onSurfaceVariant }]}>
        {t("migrated.create_workout_044")}
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        onPress={onBack}
        activeOpacity={0.82}
        style={[
          styles.configureEmptyButton,
          { backgroundColor: colors.primary },
        ]}
      >
        <Text
          style={[styles.configureEmptyButtonText, { color: colors.onPrimary }]}
        >
          {t("migrated.create_workout_045")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    minHeight: 72,
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle("sm"),
  },
  topTitle: { ...typography.buttonLg },
  saveButton: {
    minHeight: 44,
    paddingHorizontal: spacing.smPlus,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle("sm"),
  },
  saveText: { ...typography.buttonSm },
  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: 8,
  },
  formBlock: { gap: spacing.sm, marginBottom: spacing.xs + 2 },
  stepIndicator: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { ...typography.labelMd, fontSize: 11 },
  stepText: { ...typography.labelMd, fontSize: 11 },
  stepLine: { flex: 1, height: 2, borderRadius: 999 },
  titleBlock: { gap: 5 },
  title: { ...typography.headlineLgMobile },
  subtitle: { ...typography.bodySm },
  searchBar: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: { flex: 1, ...typography.bodyMd, paddingVertical: 0 },
  clearSearchButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -10,
  },
  resultsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  selectedText: { ...typography.bodySm },
  selectedCount: {
    ...typography.buttonSm,
    minHeight: 28,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    textAlignVertical: "center",
    overflow: "hidden",
  },
  exerciseRow: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  exerciseTop: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  exerciseMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  exerciseImageWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseImage: { width: "100%", height: "100%" },
  exerciseCopy: { flex: 1, minWidth: 0, gap: 5 },
  exerciseTitle: { ...typography.cardTitle, lineHeight: 22 },
  exerciseMetaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  muscleChip: {
    ...typography.labelXs,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  difficultyText: {
    ...typography.bodySm,
    flex: 1,
    fontSize: 11,
    lineHeight: 14,
  },
  rowIconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionButton: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  separator: { height: 8 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 42,
    gap: 10,
  },
  emptyTitle: { ...typography.headlineMd },
  emptyBody: { ...typography.bodyMd, textAlign: "center" },
  loadingMoreText: {
    ...typography.bodySm,
    textAlign: "center",
    paddingVertical: 20,
  },
  configCard: {
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.sm,
    gap: spacing.smPlus,
  },
  configHeader: { flexDirection: "row", alignItems: "center", gap: 9 },
  configOrder: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  configOrderText: { ...typography.labelMd, fontSize: 11 },
  configImageWrap: {
    width: 50,
    height: 50,
    borderRadius: 9,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  configCopy: { flex: 1, minWidth: 0, gap: 2 },
  configTitle: { ...typography.labelMd, fontSize: 15, lineHeight: 20 },
  configMuscle: { ...typography.bodySm, fontSize: 11 },
  configRemove: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  configFields: { flexDirection: "row", gap: 8 },
  configField: { flex: 1, minWidth: 0, gap: 5 },
  configLabel: { ...typography.labelXs, textAlign: "center" },
  configInputWrap: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  configInput: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    textAlign: "center",
    ...typography.labelMd,
    fontVariant: ["tabular-nums"],
  },
  configSuffix: { ...typography.bodySm, fontSize: 10 },
  configureEmptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  configureEmptyButton: {
    minHeight: 46,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  configureEmptyButtonText: { ...typography.labelMd },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.blackAlpha80,
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: radius["2xl"],
    padding: spacing.cardPadding,
    gap: spacing.sm,
  },
  modalTitle: { ...typography.sectionTitle },
  modalBody: { ...typography.bodySm },
  modalInput: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    ...typography.bodyMd,
  },
  modalActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end" },
  modalButton: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonText: { ...typography.labelMd },
  missingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 12,
  },
  missingTitle: { ...typography.headlineMd },
  missingBody: { ...typography.bodyMd, textAlign: "center" },
  missingButton: {
    minHeight: 44,
    borderRadius: 10,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  missingButtonText: { ...typography.labelMd },
}));
