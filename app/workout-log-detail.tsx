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
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { WorkoutSetSummary } from "@/components/WorkoutSetSummary";
import { getExerciseById } from "@/services/exerciseCatalog";
import { safeGoBack } from "@/services/navigation";
import { formatSourceLabel, repairText } from "@/services/textUtils";
import {
  deleteWorkoutLog,
  loadWorkoutLogById,
  updateWorkoutLog,
} from "@/services/workoutStore";
import type { WorkoutLog, WorkoutSetLogEntry } from "@/types";
import { useAppLocalization } from "@/providers/localization-context";
import { formatDate as formatLocalizedDate } from "@/services/localization";

type EditableSet = {
  order: number;
  kind: "warmup" | "working";
  exerciseId?: string;
  kg: string;
  reps: string;
  completedAt: string;
};

export default function WorkoutLogDetailScreen() {
  useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useAppLocalization();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [log, setLog] = useState<WorkoutLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editableSets, setEditableSets] = useState<EditableSet[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<
    string | undefined
  >();

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const loaded = await loadWorkoutLogById(id);
    setLog(loaded);
    setSelectedExerciseId(loaded?.exerciseId ?? loaded?.exerciseIds?.[0]);
    setEditableSets(
      (loaded?.setEntries ?? []).map((entry) => ({
        order: entry.order,
        kind: entry.kind,
        exerciseId: entry.exerciseId,
        kg: String(entry.kg),
        reps: String(entry.reps),
        completedAt: entry.completedAt,
      })),
    );
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const totalVolume = useMemo(
    () =>
      editableSets.reduce((sum, entry) => {
        const kg = Number(entry.kg.replace(",", "."));
        const reps = Number(entry.reps.replace(",", "."));
        return Number.isFinite(kg) && Number.isFinite(reps)
          ? sum + kg * reps
          : sum;
      }, 0),
    [editableSets],
  );

  const handleChangeSet = useCallback(
    (index: number, field: "kg" | "reps", value: string) => {
      setEditableSets((current) =>
        current.map((entry, entryIndex) =>
          entryIndex === index ? { ...entry, [field]: value } : entry,
        ),
      );
    },
    [],
  );

  const handleAddSetRow = useCallback(
    (kind: "warmup" | "working") => {
      setEditableSets((current) => [
        ...current,
        {
          order: current.length + 1,
          kind,
          exerciseId:
            selectedExerciseId ?? log?.exerciseId ?? log?.exerciseIds?.[0],
          kg: "",
          reps: "",
          completedAt: new Date().toISOString(),
        },
      ]);
    },
    [log?.exerciseId, log?.exerciseIds, selectedExerciseId],
  );

  const handleRemoveSetRow = useCallback((index: number) => {
    setEditableSets((current) =>
      current
        .filter((_, entryIndex) => entryIndex !== index)
        .map((entry, entryIndex) => ({
          ...entry,
          order: entryIndex + 1,
        })),
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (!log) return;
    if (editableSets.length === 0) {
      Alert.alert(
        t("migrated.workout_log_detail_001"),
        t("migrated.workout_log_detail_002"),
      );
      return;
    }

    const normalizedSets: WorkoutSetLogEntry[] = [];

    for (const [index, entry] of editableSets.entries()) {
      const kg = Number(entry.kg.replace(",", "."));
      const reps = Number(entry.reps.replace(",", "."));

      if (
        !Number.isFinite(kg) ||
        kg < 0 ||
        !Number.isFinite(reps) ||
        reps <= 0
      ) {
        Alert.alert(
          t("migrated.workout_log_detail_003"),
          t("migrated.workout_log_detail_004"),
        );
        return;
      }

      normalizedSets.push({
        order: index + 1,
        kind: entry.kind,
        exerciseId: entry.exerciseId,
        kg,
        reps: Math.round(reps),
        completedAt: entry.completedAt,
      });
    }

    const updatedLog: WorkoutLog = { ...log, setEntries: normalizedSets };
    setSaving(true);
    try {
      await updateWorkoutLog(updatedLog);
      setLog(updatedLog);
      setEditing(false);
    } catch {
      Alert.alert(
        t("migrated.workout_log_detail_005"),
        t("migrated.workout_log_detail_006"),
      );
    } finally {
      setSaving(false);
    }
  }, [editableSets, log, t]);

  const handleDelete = useCallback(() => {
    if (!log) return;
    Alert.alert(
      t("migrated.workout_log_detail_007"),
      t("migrated.workout_log_detail_008"),
      [
        { text: t("migrated.workout_log_detail_009"), style: "cancel" },
        {
          text: t("migrated.workout_log_detail_010"),
          style: "destructive",
          onPress: async () => {
            await deleteWorkoutLog(log.id);
            safeGoBack(router);
          },
        },
      ],
    );
  }, [log, router, t]);

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <View style={styles.topBarInner}>
          <TouchableOpacity
            onPress={() => safeGoBack(router)}
            activeOpacity={0.7}
            style={styles.topBarIconButton}
          >
            <Ionicons name="chevron-back" size={26} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>
            {t("migrated.workout_log_detail_011")}
          </Text>
          <TouchableOpacity
            onPress={() => setEditing((current) => !current)}
            activeOpacity={0.8}
            disabled={!log}
            style={styles.topBarActionButton}
          >
            <Text style={styles.editAction}>
              {editing
                ? t("migrated.workout_log_detail_009")
                : t("migrated.workout_log_detail_012")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + spacing.screenHeaderOffset,
              paddingBottom: insets.bottom + spacing.md,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator color={colors.secondary} />
            </View>
          ) : log ? (
            <>
              <GlassCard variant="panel" style={styles.heroCard}>
                <Text style={styles.title}>{repairText(log.title)}</Text>
                <View style={styles.badgeRow}>
                  <MetaPill
                    icon="calendar-outline"
                    label={formatDate(log.completedAt)}
                  />
                  <MetaPill
                    icon="albums-outline"
                    label={formatSourceLabel(log.source)}
                  />
                </View>
                <View style={styles.badgeRow}>
                  <MetaPill
                    icon="time-outline"
                    label={`${log.durationMin} ${t("migrated.workout_log_detail_013")}`}
                  />
                  <MetaPill icon="flame-outline" label={`~${log.kcal} kcal`} />
                  {editableSets.length > 0 ? (
                    <MetaPill
                      icon="barbell-outline"
                      label={`${editableSets.length} set`}
                    />
                  ) : null}
                </View>
                {log.programId ? (
                  <Text style={styles.subtle}>
                    {t("migrated.workout_log_detail_014")}
                  </Text>
                ) : null}
                {!!log.muscleGroups?.length ? (
                  <Text style={styles.subtle}>
                    {log.muscleGroups.map(repairText).join(", ")}
                  </Text>
                ) : null}
              </GlassCard>

              <GlassCard variant="panel" style={styles.card}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {t("migrated.workout_log_detail_015")}
                  </Text>
                  <Text style={styles.sectionMeta}>
                    {Math.round(totalVolume)} kg{" "}
                    {t("migrated.workout_log_detail_016")}
                  </Text>
                </View>

                {editing ? (
                  <>
                    {(log.exerciseIds?.length ?? 0) > 1 ? (
                      <View style={styles.exercisePicker}>
                        <Text style={styles.inputLabel}>
                          {t("migrated.workout_log_detail_017")}
                        </Text>
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          contentContainerStyle={styles.exercisePickerContent}
                        >
                          {log.exerciseIds?.map((exerciseId) => {
                            const exercise = getExerciseById(exerciseId);
                            const active = selectedExerciseId === exerciseId;
                            return (
                              <TouchableOpacity
                                accessibilityRole="button"
                                accessibilityState={{ selected: active }}
                                accessibilityLabel={`${repairText(exercise?.displayName ?? exerciseId)} ${t("migrated.workout_log_detail_018")}`}
                                key={exerciseId}
                                onPress={() =>
                                  setSelectedExerciseId(exerciseId)
                                }
                                style={[
                                  styles.exerciseChip,
                                  active && styles.exerciseChipActive,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.exerciseChipText,
                                    active && styles.exerciseChipTextActive,
                                  ]}
                                >
                                  {repairText(
                                    exercise?.displayName ?? exerciseId,
                                  )}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>
                    ) : null}
                    <View style={styles.editList}>
                      {editableSets.map((entry, index) => (
                        <View
                          key={`${entry.order}-${index}`}
                          style={styles.editCard}
                        >
                          <View style={styles.editTopRow}>
                            <Text style={styles.editLabel}>
                              SET {entry.order} ·{" "}
                              {entry.kind === "warmup"
                                ? t("migrated.workout_log_detail_019")
                                : t("migrated.workout_log_detail_020")}{" "}
                              ·{" "}
                              {repairText(
                                getExerciseById(entry.exerciseId)
                                  ?.displayName ??
                                  t("migrated.workout_log_detail_021"),
                              )}
                            </Text>
                            <TouchableOpacity
                              onPress={() => handleRemoveSetRow(index)}
                              hitSlop={8}
                            >
                              <Ionicons
                                name="close-circle-outline"
                                size={20}
                                color={colors.error}
                              />
                            </TouchableOpacity>
                          </View>
                          <View style={styles.editInputs}>
                            <View style={styles.inputBlock}>
                              <Text style={styles.inputLabel}>KG</Text>
                              <TextInput
                                value={entry.kg}
                                onChangeText={(value) =>
                                  handleChangeSet(index, "kg", value)
                                }
                                keyboardType="numeric"
                                style={styles.input}
                                placeholder="60"
                                placeholderTextColor={colors.outline}
                              />
                            </View>
                            <View style={styles.inputBlock}>
                              <Text style={styles.inputLabel}>
                                {t("migrated.workout_log_detail_022")}
                              </Text>
                              <TextInput
                                value={entry.reps}
                                onChangeText={(value) =>
                                  handleChangeSet(index, "reps", value)
                                }
                                keyboardType="numeric"
                                style={styles.input}
                                placeholder="10"
                                placeholderTextColor={colors.outline}
                              />
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.addRow}>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddSetRow("warmup")}
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name="add"
                          size={16}
                          color={colors.onSurface}
                        />
                        <Text style={styles.addButtonText}>
                          {t("migrated.workout_log_detail_023")}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddSetRow("working")}
                        activeOpacity={0.85}
                      >
                        <Ionicons
                          name="add"
                          size={16}
                          color={colors.onSurface}
                        />
                        <Text style={styles.addButtonText}>
                          {t("migrated.workout_log_detail_024")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : log.setEntries?.length ? (
                  <WorkoutSetSummary sets={log.setEntries} />
                ) : (
                  <Text style={styles.emptyText}>
                    {t("migrated.workout_log_detail_025")}
                  </Text>
                )}
              </GlassCard>

              <View style={styles.actions}>
                {editing ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSave}
                    activeOpacity={0.85}
                    disabled={saving}
                  >
                    {saving ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.onPrimary}
                      />
                    ) : (
                      <Ionicons
                        name="save-outline"
                        size={18}
                        color={colors.onPrimary}
                      />
                    )}
                    <Text style={styles.primaryButtonText}>
                      {saving
                        ? t("migrated.workout_log_detail_026")
                        : t("migrated.workout_log_detail_027")}
                    </Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={handleDelete}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.error}
                  />
                  <Text style={styles.deleteButtonText}>
                    {t("migrated.workout_log_detail_007")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.centerState}>
              <Text style={styles.emptyText}>
                {t("migrated.workout_log_detail_028")}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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

function formatDate(isoDate: string): string {
  return formatLocalizedDate(isoDate, {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
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
    minHeight: 68,
    paddingHorizontal: spacing.containerMargin,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarIconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle("sm"),
  },
  topBarTitle: { ...typography.screenTitle, color: colors.onSurface },
  topBarActionButton: {
    minWidth: 60,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "flex-end",
  },
  editAction: {
    ...typography.buttonLg,
    color: colors.secondary,
    textAlign: "right",
  },
  centerState: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: { padding: spacing.cardPadding, gap: spacing.sm },
  title: { ...typography.screenTitle, color: colors.onSurface },
  subtle: { ...typography.bodySm, color: colors.onSurface },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
  },
  metaPillText: { ...typography.bodySm, color: colors.onSurface },
  card: { padding: spacing.cardPadding, gap: spacing.smPlus },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sectionTitle: { ...typography.sectionTitle, color: colors.onSurface },
  sectionMeta: { ...typography.bodySm, color: colors.secondary },
  editList: { gap: 10 },
  exercisePicker: { gap: 8 },
  exercisePickerContent: { gap: 8 },
  exerciseChip: {
    minHeight: 40,
    maxWidth: 220,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  exerciseChipText: { ...typography.bodySm, color: colors.onSurfaceVariant },
  exerciseChipTextActive: { color: colors.onSurface },
  editCard: {
    padding: spacing.smPlus,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    gap: 10,
  },
  editTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  editLabel: { ...typography.labelMd, color: colors.onSurfaceVariant },
  editInputs: { flexDirection: "row", gap: 12 },
  inputBlock: { flex: 1, gap: 6 },
  inputLabel: {
    ...typography.labelMd,
    color: colors.secondary,
    textAlign: "center",
  },
  input: {
    minHeight: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerHighest,
    color: colors.onSurface,
    textAlign: "center",
    ...typography.numericLg,
  },
  addRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  addButton: {
    flexGrow: 1,
    minHeight: 46,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerHighest,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
  },
  addButtonText: { ...typography.labelMd, color: colors.onSurface },
  emptyText: {
    ...typography.bodySm,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  actions: { gap: 12 },
  primaryButton: {
    minHeight: 52,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: spacing.md,
  },
  primaryButtonText: { ...typography.buttonLg, color: colors.onPrimary },
  deleteButton: {
    minHeight: 52,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: `${colors.error}33`,
    backgroundColor: `${colors.error}12`,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: spacing.md,
  },
  deleteButtonText: { ...typography.buttonLg, color: colors.error },
}));
