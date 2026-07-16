import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppLocalization } from "@/providers/localization-context";
import { formatDate } from "@/services/localization";
import {
  loadStrengthProgress,
  type ExerciseStrengthProgress,
  type StrengthProgressSnapshot,
  type StrengthRecord,
} from "@/services/strengthProgress";
import { repairText } from "@/services/textUtils";
import {
  colors,
  createDynamicStyles,
  layout,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";

export default function StrengthProgressScreen() {
  const { colors: themeColors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resolved, t } = useAppLocalization();
  const [snapshot, setSnapshot] = useState<StrengthProgressSnapshot | null>(
    null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const shareRef = useRef<View | null>(null);

  const refresh = useCallback(async () => {
    const loaded = await loadStrengthProgress();
    setSnapshot(loaded);
    setSelectedId((current) =>
      current && loaded.exercises.some((item) => item.exerciseId === current)
        ? current
        : (loaded.exercises[0]?.exerciseId ?? null),
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const selected = useMemo(
    () =>
      snapshot?.exercises.find((item) => item.exerciseId === selectedId) ??
      snapshot?.exercises[0] ??
      null,
    [selectedId, snapshot],
  );

  const shareSelected = useCallback(async () => {
    if (!shareRef.current || !selected) return;
    setSharing(true);
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert(
          t({ tr: "Paylaşım kullanılamıyor", en: "Sharing is unavailable" }),
          t({
            tr: "Bu cihazda paylaşım paneli açılamadı.",
            en: "The share sheet is not available on this device.",
          }),
        );
        return;
      }
      const uri = await captureRef(shareRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: t({
          tr: "Güç gelişimini paylaş",
          en: "Share your strength progress",
        }),
      });
    } catch {
      Alert.alert(
        t({ tr: "Paylaşım tamamlanamadı", en: "Could not share" }),
        t({
          tr: "Kart hazırlanırken bir sorun oluştu. Lütfen tekrar dene.",
          en: "There was a problem while preparing the card. Please try again.",
        }),
      );
    } finally {
      setSharing(false);
    }
  }, [selected, t]);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <ScreenHeader
        title={t({ tr: "Güç gelişimi", en: "Strength progress" })}
        right={
          selected ? (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={t({
                tr: "Gelişim kartını paylaş",
                en: "Share progress card",
              })}
              onPress={() => void shareSelected()}
              activeOpacity={0.8}
              style={styles.shareButton}
            >
              {sharing ? (
                <ActivityIndicator color={themeColors.primary} size="small" />
              ) : (
                <Ionicons
                  name="share-outline"
                  size={22}
                  color={themeColors.primary}
                />
              )}
            </TouchableOpacity>
          ) : null
        }
      />

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
        {!snapshot ? (
          <View style={styles.loading}>
            <ActivityIndicator color={themeColors.primary} />
          </View>
        ) : snapshot.exercises.length === 0 ? (
          <GlassCard variant="panel" style={styles.emptyCard}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: `${themeColors.primary}14` },
              ]}
            >
              <Ionicons
                name="barbell-outline"
                size={30}
                color={themeColors.primary}
              />
            </View>
            <Text style={[styles.emptyTitle, { color: themeColors.onSurface }]}>
              {t({
                tr: "İlk ağırlık kaydını bekliyoruz",
                en: "Waiting for your first strength entry",
              })}
            </Text>
            <Text
              style={[
                styles.emptyBody,
                { color: themeColors.onSurfaceVariant },
              ]}
            >
              {t({
                tr: "Program veya kendi antrenmanında kilogram ve tekrar girip seti onayladığında gelişimin burada hareket bazında görünür.",
                en: "Once you log weight and reps in a workout, your progress will appear here exercise by exercise.",
              })}
            </Text>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => router.replace("/(tabs)/fitness")}
              activeOpacity={0.84}
              style={[
                styles.emptyButton,
                { backgroundColor: themeColors.primary },
              ]}
            >
              <Text
                style={[
                  styles.emptyButtonText,
                  { color: themeColors.onPrimary },
                ]}
              >
                {t({ tr: "Antrenmana git", en: "Go to training" })}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={17}
                color={themeColors.onPrimary}
              />
            </TouchableOpacity>
          </GlassCard>
        ) : (
          <>
            <View style={styles.intro}>
              <View
                style={[
                  styles.eyebrow,
                  { backgroundColor: `${themeColors.primary}14` },
                ]}
              >
                <Ionicons
                  name="trending-up"
                  size={13}
                  color={themeColors.primary}
                />
                <Text
                  style={[styles.eyebrowText, { color: themeColors.primary }]}
                >
                  {t({
                    tr: "AĞIRLIK VE TEKRAR GEÇMİŞİ",
                    en: "WEIGHT AND REP HISTORY",
                  })}
                </Text>
              </View>
              <Text
                style={[styles.introTitle, { color: themeColors.onSurface }]}
              >
                {t({
                  tr: "Gücündeki değişimi",
                  en: "See the change in your strength",
                })}{" "}
                <Text style={{ color: themeColors.primary }}>
                  {t({ tr: "net gör", en: "clearly" })}
                </Text>
              </Text>
              <Text
                style={[
                  styles.introBody,
                  { color: themeColors.onSurfaceVariant },
                ]}
              >
                {t({
                  tr: "Çalışma setlerin hareket bazında karşılaştırılır; ısınma setleri hesaplamaya katılmaz.",
                  en: "Working sets are compared per exercise, while warm-up sets stay out of the calculation.",
                })}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <SummaryStat
                label={t({ tr: "Takip edilen", en: "Tracked" })}
                value={`${snapshot.exercises.length} ${t({ tr: "hareket", en: "exercises" })}`}
                icon="barbell-outline"
                accent={themeColors.primary}
              />
              <SummaryStat
                label={t({ tr: "Çalışma seti", en: "Working sets" })}
                value={`${snapshot.totalWorkingSets} ${t({ tr: "set", en: "sets" })}`}
                icon="layers-outline"
                accent={themeColors.tertiary}
              />
            </View>

            <View style={styles.selectorBlock}>
              <Text
                style={[
                  styles.selectorLabel,
                  { color: themeColors.onSurfaceVariant },
                ]}
              >
                {t({ tr: "HAREKET SEÇ", en: "SELECT EXERCISE" })}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorRow}
              >
                {snapshot.exercises.map((item) => {
                  const active = item.exerciseId === selected?.exerciseId;
                  return (
                    <TouchableOpacity
                      key={item.exerciseId}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setSelectedId(item.exerciseId)}
                      activeOpacity={0.8}
                      style={[
                        styles.exerciseChip,
                        {
                          backgroundColor: active
                            ? themeColors.primary
                            : themeColors.surfaceContainerLow,
                          borderColor: active
                            ? themeColors.primary
                            : themeColors.outlineVariant,
                        },
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.exerciseChipText,
                          {
                            color: active
                              ? themeColors.onPrimary
                              : themeColors.onSurface,
                          },
                        ]}
                      >
                        {repairText(item.exerciseName)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {selected ? (
              <ExerciseProgressContent
                progress={selected}
                localeTag={resolved.localeTag}
                onOpenWorkout={(id) =>
                  router.push({
                    pathname: "/workout-log-detail",
                    params: { id },
                  })
                }
                shareRef={shareRef}
              />
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ExerciseProgressContent({
  progress,
  localeTag,
  onOpenWorkout,
  shareRef,
}: {
  progress: ExerciseStrengthProgress;
  localeTag: string;
  onOpenWorkout: (id: string) => void;
  shareRef: React.RefObject<View | null>;
}) {
  const { colors: themeColors } = useAppTheme();
  const { t, resolved } = useAppLocalization();
  const comparisonSameReps =
    progress.comparisonRecord.reps === progress.latestRecord.reps;
  const bodyweight = progress.latestRecord.kg === 0;
  const positive = bodyweight
    ? progress.repChange >= 0
    : progress.estimatedStrengthChangeKg >= 0;
  const trendRecords = progress.records.slice(-8);

  return (
    <>
      <View ref={shareRef} collapsable={false} style={styles.shareCardWrap}>
        <GlassCard
          style={[
            styles.heroCard,
            {
              backgroundColor: themeColors.surfaceContainerLow,
              borderColor: themeColors.outlineVariant,
            },
          ]}
        >
          <View
            pointerEvents="none"
            style={[
              styles.heroGlow,
              { backgroundColor: `${themeColors.primary}1C` },
            ]}
          />
          <View style={styles.heroContent}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseHeaderCopy}>
                <Text
                  style={[
                    styles.exerciseName,
                    { color: themeColors.onSurface },
                  ]}
                >
                  {repairText(progress.exerciseName)}
                </Text>
                <Text
                  style={[
                    styles.exerciseGroup,
                    { color: themeColors.onSurfaceVariant },
                  ]}
                >
                  {repairText(progress.muscleGroup)} · {progress.records.length}{" "}
                  {t({ tr: "antrenman kaydı", en: "workout entries" })}
                </Text>
              </View>
              <View
                style={[
                  styles.changeBadge,
                  {
                    backgroundColor: positive
                      ? `${themeColors.success}18`
                      : `${themeColors.error}14`,
                  },
                ]}
              >
                <Ionicons
                  name={positive ? "trending-up" : "trending-down"}
                  size={16}
                  color={positive ? themeColors.success : themeColors.error}
                />
                <Text
                  style={[
                    styles.changeBadgeText,
                    {
                      color: positive ? themeColors.success : themeColors.error,
                    },
                  ]}
                >
                  {signed(progress.estimatedStrengthChangePct, localeTag)}%
                </Text>
              </View>
            </View>

            <View style={styles.comparisonRow}>
              <SetSnapshot
                label={
                  comparisonSameReps
                    ? t({ tr: "İLK AYNI TEKRAR", en: "FIRST SAME REPS" })
                    : t({ tr: "İLK KAYIT", en: "FIRST ENTRY" })
                }
                record={progress.comparisonRecord}
                localeTag={localeTag}
                muted
              />
              <View
                style={[
                  styles.comparisonArrow,
                  { backgroundColor: `${themeColors.primary}14` },
                ]}
              >
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={themeColors.primary}
                />
              </View>
              <SetSnapshot
                label={t({ tr: "GÜNCEL", en: "CURRENT" })}
                record={progress.latestRecord}
                localeTag={localeTag}
              />
            </View>

            <View
              style={[
                styles.gainBanner,
                {
                  backgroundColor: `${themeColors.primary}10`,
                  borderColor: `${themeColors.primary}28`,
                },
              ]}
            >
              <Ionicons
                name="sparkles-outline"
                size={18}
                color={themeColors.primary}
              />
              <Text style={[styles.gainText, { color: themeColors.onSurface }]}>
                {bodyweight
                  ? t({ tr: "Tekrar gelişimi", en: "Rep progress" })
                  : t({
                      tr: "Aynı tekrar karşılaştırması",
                      en: "Same-rep comparison",
                    })}
                :{" "}
                <Text style={{ color: themeColors.primary }}>
                  {bodyweight
                    ? `${signed(progress.repChange, localeTag)} ${t({ tr: "tekrar", en: "reps" })}`
                    : `${signed(progress.weightChangeKg, localeTag)} kg`}
                </Text>
              </Text>
            </View>
            <Text style={[styles.shareStamp, { color: themeColors.outline }]}>
              {formatDate(
                new Date(),
                { day: "numeric", month: "long", year: "numeric" },
                resolved,
              )}
            </Text>
          </View>
        </GlassCard>
      </View>

      <View style={styles.summaryRow}>
        <SummaryStat
          label={
            bodyweight
              ? t({ tr: "Güncel tekrar", en: "Current reps" })
              : t({ tr: "Tahmini güç", en: "Estimated strength" })
          }
          value={
            bodyweight
              ? `${progress.latestRecord.reps} ${t({ tr: "tekrar", en: "reps" })}`
              : `${formatKg(progress.latestRecord.estimatedOneRepMaxKg, localeTag)} kg`
          }
          icon="flash-outline"
          accent={themeColors.primary}
        />
        <SummaryStat
          label={t({ tr: "Kişisel rekor", en: "Personal record" })}
          value={
            bodyweight
              ? `${progress.personalRecord.reps} ${t({ tr: "tekrar", en: "reps" })}`
              : `${formatKg(progress.personalRecord.kg, localeTag)} × ${progress.personalRecord.reps}`
          }
          icon="trophy-outline"
          accent={themeColors.tertiary}
        />
      </View>

      <TrendCard records={trendRecords} localeTag={localeTag} />

      <GlassCard variant="panel" style={styles.historyCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text
              style={[styles.sectionTitle, { color: themeColors.onSurface }]}
            >
              {t({ tr: "Kayıt geçmişi", en: "History" })}
            </Text>
            <Text
              style={[
                styles.sectionBody,
                { color: themeColors.onSurfaceVariant },
              ]}
            >
              {t({
                tr: "Her antrenmandaki en güçlü çalışma seti",
                en: "The strongest working set from each workout",
              })}
            </Text>
          </View>
          <Ionicons name="time-outline" size={20} color={themeColors.primary} />
        </View>
        <View style={styles.recordList}>
          {[...progress.records]
            .reverse()
            .slice(0, 12)
            .map((record, index) => (
              <TouchableOpacity
                key={record.id}
                accessibilityRole="button"
                onPress={() => onOpenWorkout(record.workoutId)}
                activeOpacity={0.78}
                style={[
                  styles.recordRow,
                  { borderBottomColor: themeColors.outlineVariant },
                ]}
              >
                <View
                  style={[
                    styles.recordOrder,
                    {
                      backgroundColor:
                        index === 0
                          ? themeColors.primary
                          : themeColors.surfaceContainerHighest,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.recordOrderText,
                      {
                        color:
                          index === 0
                            ? themeColors.onPrimary
                            : themeColors.onSurfaceVariant,
                      },
                    ]}
                  >
                    {index === 0 ? "✓" : progress.records.length - index}
                  </Text>
                </View>
                <View style={styles.recordCopy}>
                  <Text
                    style={[
                      styles.recordValue,
                      { color: themeColors.onSurface },
                    ]}
                  >
                    {record.kg === 0
                      ? t({ tr: "Vücut ağırlığı", en: "Bodyweight" })
                      : `${formatKg(record.kg, localeTag)} kg`}{" "}
                    × {record.reps} {t({ tr: "tekrar", en: "reps" })}
                  </Text>
                  <Text
                    style={[
                      styles.recordDate,
                      { color: themeColors.onSurfaceVariant },
                    ]}
                  >
                    {formatDate(
                      record.completedAt,
                      { day: "numeric", month: "long", year: "numeric" },
                      resolved,
                    )}
                    {record.kg > 0
                      ? ` · ${t({ tr: "tahmini", en: "estimated" })} ${formatKg(record.estimatedOneRepMaxKg, localeTag)} kg`
                      : ""}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={17}
                  color={themeColors.outline}
                />
              </TouchableOpacity>
            ))}
        </View>
      </GlassCard>
    </>
  );
}

function SetSnapshot({
  label,
  record,
  localeTag,
  muted,
}: {
  label: string;
  record: StrengthRecord;
  localeTag: string;
  muted?: boolean;
}) {
  const { colors: themeColors } = useAppTheme();
  const { t, resolved } = useAppLocalization();
  return (
    <View style={styles.setSnapshot}>
      <Text
        style={[
          styles.snapshotLabel,
          { color: muted ? themeColors.outline : themeColors.primary },
        ]}
      >
        {label}
      </Text>
      <Text style={[styles.snapshotValue, { color: themeColors.onSurface }]}>
        {record.kg === 0
          ? t({ tr: "Vücut ağırlığı", en: "Bodyweight" })
          : `${formatKg(record.kg, localeTag)} kg`}
      </Text>
      <Text
        style={[styles.snapshotReps, { color: themeColors.onSurface }]}
      >
        {record.reps} {t({ tr: "tekrar", en: "reps" })}
      </Text>
      <Text style={[styles.snapshotDate, { color: themeColors.outline }]}>
        {formatDate(
          record.completedAt,
          { day: "numeric", month: "short" },
          resolved,
        )}
      </Text>
    </View>
  );
}

function TrendCard({
  records,
  localeTag,
}: {
  records: StrengthRecord[];
  localeTag: string;
}) {
  const { colors: themeColors } = useAppTheme();
  const { t, resolved } = useAppLocalization();
  const bodyweight = records.every((record) => record.kg === 0);
  const metric = (record: StrengthRecord) =>
    bodyweight ? record.reps : record.estimatedOneRepMaxKg;
  const max = Math.max(...records.map(metric), 1);
  const min = Math.min(...records.map(metric), 0);
  const range = Math.max(max - min, max * 0.15, 1);

  return (
    <GlassCard variant="panel" style={styles.trendCard}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>
            {t({ tr: "Güç eğrisi", en: "Strength curve" })}
          </Text>
          <Text
            style={[
              styles.sectionBody,
              { color: themeColors.onSurfaceVariant },
            ]}
          >
            {bodyweight
              ? t({ tr: "Tekrar sayısı gelişimi", en: "Rep progression" })
              : t({
                  tr: "Tahmini 1 tekrar maksimumu",
                  en: "Estimated one-rep max",
                })}
          </Text>
        </View>
        <Ionicons
          name="analytics-outline"
          size={20}
          color={themeColors.primary}
        />
      </View>
      <View style={styles.chart}>
        {records.map((record) => {
          const value = metric(record);
          const height = 28 + ((value - min) / range) * 72;
          return (
            <View key={record.id} style={styles.chartItem}>
              <Text
                style={[
                  styles.chartValue,
                  { color: themeColors.onSurfaceVariant },
                ]}
              >
                {bodyweight ? value : formatKg(value, localeTag)}
              </Text>
              <View
                style={[
                  styles.chartBar,
                  { height, backgroundColor: themeColors.primary },
                ]}
              />
              <Text style={[styles.chartDate, { color: themeColors.outline }]}>
                {formatDate(
                  record.completedAt,
                  { day: "numeric", month: "numeric" },
                  resolved,
                )}
              </Text>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
}

function SummaryStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
}) {
  const { colors: themeColors } = useAppTheme();
  return (
    <GlassCard variant="panel" style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: `${accent}14` }]}>
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Text
        style={[styles.summaryLabel, { color: themeColors.onSurfaceVariant }]}
      >
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: themeColors.onSurface }]}>
        {value}
      </Text>
    </GlassCard>
  );
}

function formatKg(value: number, localeTag: string): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toLocaleString(localeTag, { maximumFractionDigits: 1 });
}

function signed(value: number, localeTag: string): string {
  const formatted = Number.isInteger(value)
    ? String(value)
    : Math.abs(value).toLocaleString(localeTag, { maximumFractionDigits: 1 });
  if (value === 0) return "0";
  return `${value > 0 ? "+" : "-"}${formatted.replace("-", "")}`;
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1, backgroundColor: colors.background },
  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.gutter,
  },
  loading: { minHeight: 320, alignItems: "center", justifyContent: "center" },
  shareButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  intro: { gap: 7 },
  eyebrow: {
    alignSelf: "flex-start",
    minHeight: 28,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  eyebrowText: { ...typography.labelCaps },
  introTitle: { ...typography.headlineLgMobile, fontSize: 28, lineHeight: 35 },
  introBody: { ...typography.bodySm, lineHeight: 19 },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryCard: { flex: 1, minHeight: 112, padding: 14, gap: 6 },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: { ...typography.bodySm },
  summaryValue: {
    ...typography.headlineMd,
    fontSize: 18,
    fontVariant: ["tabular-nums"],
  },
  selectorBlock: { gap: 9 },
  selectorLabel: { ...typography.labelCaps },
  selectorRow: { gap: 8, paddingRight: spacing.containerMargin },
  exerciseChip: {
    minHeight: 44,
    maxWidth: 210,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseChipText: { ...typography.labelMd },
  shareCardWrap: { gap: 0 },
  heroCard: { padding: 20, overflow: "hidden" },
  heroGlow: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    top: -100,
    right: -55,
  },
  heroContent: { zIndex: 1, gap: 18 },
  exerciseHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  exerciseHeaderCopy: { flex: 1, gap: 3 },
  exerciseName: { ...typography.headlineMd, fontSize: 21, lineHeight: 27 },
  exerciseGroup: { ...typography.bodySm },
  changeBadge: {
    minHeight: 34,
    borderRadius: 999,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  changeBadgeText: { ...typography.labelMd, fontVariant: ["tabular-nums"] },
  comparisonRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  setSnapshot: { flex: 1, gap: 3 },
  snapshotLabel: { ...typography.labelCaps, fontSize: 9 },
  snapshotValue: {
    ...typography.headlineLgMobile,
    fontSize: 25,
    lineHeight: 31,
    fontVariant: ["tabular-nums"],
  },
  snapshotReps: { ...typography.labelMd },
  snapshotDate: { ...typography.bodySm },
  comparisonArrow: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gainBanner: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  gainText: { ...typography.bodySm, flex: 1 },
  shareStamp: { ...typography.bodySm, textAlign: "right" },
  trendCard: { padding: 18, gap: 18 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: { ...typography.headlineMd, fontSize: 19 },
  sectionBody: { ...typography.bodySm, marginTop: 3 },
  chart: { height: 160, flexDirection: "row", alignItems: "flex-end", gap: 7 },
  chartItem: { flex: 1, alignItems: "center", gap: 5 },
  chartValue: {
    ...typography.bodySm,
    fontSize: 9,
    fontVariant: ["tabular-nums"],
  },
  chartBar: {
    width: "72%",
    minWidth: 12,
    maxWidth: 28,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  chartDate: { ...typography.bodySm, fontSize: 9 },
  historyCard: { padding: 18, gap: 14 },
  recordList: { gap: 0 },
  recordRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderBottomWidth: 1,
  },
  recordOrder: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  recordOrderText: { ...typography.labelMd, fontSize: 11 },
  recordCopy: { flex: 1, gap: 3 },
  recordValue: { ...typography.labelMd, fontVariant: ["tabular-nums"] },
  recordDate: { ...typography.bodySm, fontSize: 11 },
  emptyCard: {
    minHeight: 350,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { ...typography.headlineMd, fontSize: 20, textAlign: "center" },
  emptyBody: { ...typography.bodyMd, textAlign: "center", lineHeight: 21 },
  emptyButton: {
    minHeight: 50,
    marginTop: 6,
    borderRadius: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  emptyButtonText: { ...typography.labelMd },
}));
