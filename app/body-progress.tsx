import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Line, Path, Stop } from "react-native-svg";
import { GlassCard } from "@/components/GlassCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useAppLocalization } from "@/providers/localization-context";
import {
  loadBodyProgress,
  type BodyProgressSnapshot,
} from "@/services/bodyProgress";
import { formatDate, formatWeightValue, weightUnitLabel } from "@/services/localization";
import {
  createDynamicStyles,
  layout,
  radius,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";

type ProgressMode = "physique" | "strength" | "analysis" | "coach";

type TrendPoint = {
  id: string;
  value: number;
  label: string;
};

export default function BodyProgressScreen() {
  const { colors: themeColors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { resolved, t } = useAppLocalization();
  const [snapshot, setSnapshot] = useState<BodyProgressSnapshot | null>(null);
  const [activeMode, setActiveMode] = useState<ProgressMode>("physique");

  const refresh = useCallback(async () => {
    setSnapshot(await loadBodyProgress());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const latest = snapshot?.latestPhysiqueScore ?? null;
  const scoreDelta = snapshot?.scoreDelta ?? null;
  const scoreSeries = useMemo(() => snapshot?.physiqueScores.slice(-8) ?? [], [snapshot?.physiqueScores]);
  const topStrength = useMemo(() => snapshot?.topStrengthProgress ?? [], [snapshot?.topStrengthProgress]);
  const primaryStrength = topStrength[0] ?? null;
  const coachAdjustments = useMemo(() => snapshot?.coachAdjustments.slice(0, 4) ?? [], [snapshot?.coachAdjustments]);
  const hasStrengthLogs = (snapshot?.strength.totalWorkingSets ?? 0) > 0;
  const unit = weightUnitLabel(resolved);

  const physiqueTrend = useMemo<TrendPoint[]>(() => (
    scoreSeries.map((item) => ({
      id: item.id,
      value: item.score,
      label: formatDate(item.createdAt, { day: "numeric", month: "short" }, resolved),
    }))
  ), [resolved, scoreSeries]);

  const strengthTrend = useMemo<TrendPoint[]>(() => (
    primaryStrength?.records.slice(-8).map((item) => ({
      id: item.id,
      value: item.estimatedOneRepMaxKg,
      label: formatDate(item.completedAt, { day: "numeric", month: "short" }, resolved),
    })) ?? []
  ), [primaryStrength, resolved]);

  const bodyFatTrend = useMemo<TrendPoint[]>(() => (
    scoreSeries.map((item) => ({
      id: item.id,
      value: item.bodyFatEstimate,
      label: formatDate(item.createdAt, { day: "numeric", month: "short" }, resolved),
    }))
  ), [resolved, scoreSeries]);

  const overview = useMemo(() => {
    if (activeMode === "strength") {
      return {
        icon: "barbell-outline" as const,
        title: t({ tr: "Güç gelişimi", en: "Strength progress" }),
        value: primaryStrength ? formatWeightValue(primaryStrength.latestRecord.estimatedOneRepMaxKg) : "0",
        unit,
        label: primaryStrength
          ? primaryStrength.exerciseName
          : t({ tr: "İlk ağırlık logu bekleniyor", en: "Waiting for first strength log" }),
        delta: primaryStrength
          ? `${primaryStrength.estimatedStrengthChangePct >= 0 ? "+" : ""}${primaryStrength.estimatedStrengthChangePct}%`
          : t({ tr: "Başla", en: "Start" }),
        deltaPositive: !primaryStrength || primaryStrength.estimatedStrengthChangePct >= 0,
        points: strengthTrend,
        rangeLabel: t({ tr: "Son kayıtlar", en: "Recent logs" }),
      };
    }

    if (activeMode === "analysis") {
      return {
        icon: "camera-outline" as const,
        title: t({ tr: "Analiz geçmişi", en: "Analysis history" }),
        value: latest ? `%${latest.bodyFatEstimate}` : "0",
        unit: t({ tr: "yağ tahmini", en: "fat estimate" }),
        label: latest
          ? t({ tr: `${snapshot?.physiqueScores.length ?? 0} analiz kaydı`, en: `${snapshot?.physiqueScores.length ?? 0} analysis records` })
          : t({ tr: "İlk vücut analizi bekleniyor", en: "Waiting for first physique analysis" }),
        delta: scoreDelta == null ? t({ tr: "Baz", en: "Base" }) : `${scoreDelta >= 0 ? "+" : ""}${scoreDelta.toFixed(1)} score`,
        deltaPositive: scoreDelta == null || scoreDelta >= 0,
        points: bodyFatTrend,
        rangeLabel: t({ tr: "Yağ oranı trendi", en: "Body-fat trend" }),
      };
    }

    if (activeMode === "coach") {
      return {
        icon: "pulse-outline" as const,
        title: t({ tr: "Koç kararları", en: "Coach decisions" }),
        value: `${coachAdjustments.length}`,
        unit: t({ tr: "son karar", en: "recent decisions" }),
        label: coachAdjustments[0]?.title ?? t({ tr: "İlk check-in bekleniyor", en: "Waiting for first check-in" }),
        delta: coachAdjustments.length > 0 ? t({ tr: "Aktif", en: "Active" }) : t({ tr: "Bekliyor", en: "Waiting" }),
        deltaPositive: true,
        points: coachAdjustments.map((item, index) => ({
          id: item.id,
          value: coachAdjustments.length - index,
          label: formatDate(item.createdAt, { day: "numeric", month: "short" }, resolved),
        })),
        rangeLabel: t({ tr: "Son koç ayarları", en: "Recent coach adjustments" }),
      };
    }

    return {
      icon: "body-outline" as const,
      title: t({ tr: "Physique score", en: "Physique score" }),
      value: latest ? latest.score.toFixed(1) : "0",
      unit: "/100",
      label: latest
        ? t({ tr: "Kişisel gelişim metriği", en: "Personal progress metric" })
        : t({ tr: "İlk analiz bekleniyor", en: "Waiting for first analysis" }),
      delta: scoreDelta == null ? t({ tr: "Başlangıç", en: "Baseline" }) : `${scoreDelta >= 0 ? "+" : ""}${scoreDelta.toFixed(1)}`,
      deltaPositive: scoreDelta == null || scoreDelta >= 0,
      points: physiqueTrend,
      rangeLabel: t({ tr: "Son analizler", en: "Recent analyses" }),
    };
  }, [
    activeMode,
    bodyFatTrend,
    coachAdjustments,
    latest,
    physiqueTrend,
    primaryStrength,
    resolved,
    scoreDelta,
    snapshot?.physiqueScores.length,
    strengthTrend,
    t,
    unit,
  ]);

  const progressInsight = useMemo(() => {
    if (latest && scoreDelta != null) {
      return scoreDelta >= 0
        ? t({
            tr: `Önceki analize göre ${scoreDelta.toFixed(1)} puan yukarıdasın. Program odağını koruyup ağırlık loglarını izlemeye devam et.`,
            en: `You are ${scoreDelta.toFixed(1)} points above the previous analysis. Keep the program focus and keep logging your lifts.`,
          })
        : t({
            tr: `Skor ${Math.abs(scoreDelta).toFixed(1)} puan yumuşamış görünüyor. Poz kalitesi, toparlanma ve odak kaslar birlikte takip edilmeli.`,
            en: `The score is down ${Math.abs(scoreDelta).toFixed(1)} points. Track pose quality, recovery, and focus muscles together.`,
          });
    }
    if (primaryStrength) {
      return t({
        tr: `${primaryStrength.exerciseName} hareketinde tahmini güç değişimin ${primaryStrength.estimatedStrengthChangePct >= 0 ? "+" : ""}${primaryStrength.estimatedStrengthChangePct}%. İlk analizle birlikte fizik trendin de burada görünür olacak.`,
        en: `${primaryStrength.exerciseName} shows an estimated strength change of ${primaryStrength.estimatedStrengthChangePct >= 0 ? "+" : ""}${primaryStrength.estimatedStrengthChangePct}%. Add a physique analysis to see the full trend here.`,
      });
    }
    return t({
      tr: "İlk vücut analizi veya ağırlık logundan sonra burası canlı bir ilerleme panosuna dönüşür.",
      en: "After your first physique analysis or workout log, this becomes a live progress board.",
    });
  }, [latest, primaryStrength, scoreDelta, t]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScreenHeader
        title={t({ tr: "İlerleme", en: "Progress" })}
        right={<Ionicons name="information-circle-outline" size={22} color={themeColors.primary} />}
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
        ) : (
          <>
            <ProgressModeSelector activeMode={activeMode} onSelect={setActiveMode} />

            <ProgressOverviewCard
              icon={overview.icon}
              title={overview.title}
              value={overview.value}
              unit={overview.unit}
              label={overview.label}
              delta={overview.delta}
              deltaPositive={overview.deltaPositive}
              points={overview.points}
              rangeLabel={overview.rangeLabel}
            />

            <GlassCard variant="panel" style={[styles.insightCard, { backgroundColor: `${themeColors.primary}12`, borderColor: `${themeColors.primary}20` }]}>
              <View style={[styles.insightIcon, { backgroundColor: `${themeColors.primary}16` }]}>
                <Ionicons name="sparkles-outline" size={17} color={themeColors.primary} />
              </View>
              <View style={styles.flex}>
                <Text style={[styles.insightTitle, { color: themeColors.onSurface }]}>
                  {t({ tr: "Bir bakışta ilerlemen", en: "Your progress at a glance" })}
                </Text>
                <Text style={[styles.cardBody, { color: themeColors.onSurfaceVariant }]}>
                  {progressInsight}
                </Text>
              </View>
            </GlassCard>

            {!latest && !hasStrengthLogs ? (
              <EmptyProgressStarter
                hasStrengthLogs={hasStrengthLogs}
                onAnalyze={() => router.push({ pathname: "/ai", params: { mode: "physique" } })}
                onTrain={() => router.push("/(tabs)/fitness")}
              />
            ) : null}

            {latest ? (
              <GlassCard variant="panel" style={styles.card}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={[styles.cardTitle, { color: themeColors.onSurface }]}>
                      {t({ tr: "Son analiz özeti", en: "Latest analysis summary" })}
                    </Text>
                    <Text style={[styles.cardBody, { color: themeColors.onSurfaceVariant }]}>
                      {formatDate(latest.createdAt, { day: "numeric", month: "long", year: "numeric" }, resolved)}
                    </Text>
                  </View>
                  <Text style={[styles.bodyFat, { color: themeColors.primary }]}>
                    %{latest.bodyFatEstimate}
                  </Text>
                </View>
                <FocusList title={t({ tr: "Takip edilen odaklar", en: "Tracked focus areas" })} items={latest.focusAreas} />
                <FocusList title={t({ tr: "Çözülen odaklar", en: "Resolved focus areas" })} items={latest.resolvedFocusAreas} empty={t({ tr: "Henüz karşılaştırma yok", en: "No comparison yet" })} />
              </GlassCard>
            ) : null}

            <GlassCard variant="panel" style={styles.card}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.cardTitle, { color: themeColors.onSurface }]}>
                    {t({ tr: "Koç Kararları", en: "Coach decisions" })}
                  </Text>
                  <Text style={[styles.cardBody, { color: themeColors.onSurfaceVariant }]}>
                    {t({
                      tr: "Verini gördük, küçük ayarları burada takip ediyoruz.",
                      en: "We read your data and track small coaching adjustments here.",
                    })}
                  </Text>
                </View>
                <Ionicons name="pulse-outline" size={20} color={themeColors.primary} />
              </View>

              {coachAdjustments.length > 0 ? (
                <View style={styles.coachList}>
                  {coachAdjustments.map((item) => (
                    <View key={item.id} style={[styles.coachRow, { borderColor: themeColors.outlineVariant }]}>
                      <View style={[styles.coachIcon, { backgroundColor: `${themeColors.primary}14` }]}>
                        <Ionicons name="fitness-outline" size={17} color={themeColors.primary} />
                      </View>
                      <View style={styles.flex}>
                        <Text style={[styles.strengthName, { color: themeColors.onSurface }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.cardBody, { color: themeColors.onSurfaceVariant }]}>
                          {item.summary}
                        </Text>
                        <Text style={[styles.coachMeta, { color: themeColors.outline }]}>
                          {formatDate(item.createdAt, { day: "numeric", month: "long" }, resolved)} · {item.nextSessionFocus}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <EmptyAction
                  title={t({ tr: "İlk koç kararını bekliyoruz", en: "Waiting for the first coach decision" })}
                  body={t({
                    tr: "Bir AI program seansını tamamlayıp kısa check-in doldurduğunda FORGE burada küçük ayarları açıklayacak.",
                    en: "After you finish an AI program session and fill the quick check-in, FORGE explains the small adjustments here.",
                  })}
                  label={t({ tr: "Antrenmana git", en: "Go to training" })}
                  onPress={() => router.push("/(tabs)/fitness")}
                />
              )}
            </GlassCard>

            <GlassCard variant="panel" style={styles.card}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.cardTitle, { color: themeColors.onSurface }]}>
                    {t({ tr: "Güç gelişimi", en: "Strength progress" })}
                  </Text>
                  <Text style={[styles.cardBody, { color: themeColors.onSurfaceVariant }]}>
                    {t({ tr: "Antrenman loglarından hareket bazlı hesaplanır.", en: "Calculated per exercise from workout logs." })}
                  </Text>
                </View>
                <TouchableOpacity accessibilityRole="button" onPress={() => router.push("/strength-progress")} style={styles.linkPill}>
                  <Text style={[styles.linkPillText, { color: themeColors.primary }]}>
                    {t({ tr: "Detay", en: "Detail" })}
                  </Text>
                  <Ionicons name="chevron-forward" size={15} color={themeColors.primary} />
                </TouchableOpacity>
              </View>

              {topStrength.length > 0 ? (
                <View style={styles.strengthList}>
                  {topStrength.map((item) => (
                    <TouchableOpacity
                      key={item.exerciseId}
                      accessibilityRole="button"
                      activeOpacity={0.78}
                      onPress={() => router.push("/strength-progress")}
                      style={[styles.strengthRow, { borderColor: themeColors.outlineVariant }]}
                    >
                      <View style={styles.flex}>
                        <Text style={[styles.strengthName, { color: themeColors.onSurface }]}>
                          {item.exerciseName}
                        </Text>
                        <Text style={[styles.cardBody, { color: themeColors.onSurfaceVariant }]}>
                          {formatWeightValue(item.latestRecord.kg)} {unit} x {item.latestRecord.reps}
                        </Text>
                      </View>
                      <View style={[styles.deltaBadge, { backgroundColor: `${themeColors.success}16` }]}>
                        <Text style={[styles.deltaText, { color: themeColors.success }]}>
                          {item.estimatedStrengthChangePct >= 0 ? "+" : ""}{item.estimatedStrengthChangePct}%
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <EmptyAction
                  title={t({ tr: "İlk ağırlık kaydını bekliyoruz", en: "Waiting for strength logs" })}
                  body={t({
                    tr: "Program veya kendi antrenmanında çalışma setlerini kaydettiğinde ağırlık artışın burada görünür.",
                    en: "When you log working sets, your load progression appears here.",
                  })}
                  label={t({ tr: "Antrenmana git", en: "Go to training" })}
                  onPress={() => router.push("/(tabs)/fitness")}
                />
              )}
            </GlassCard>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ProgressModeSelector({
  activeMode,
  onSelect,
}: {
  activeMode: ProgressMode;
  onSelect: (mode: ProgressMode) => void;
}) {
  const { colors: themeColors } = useAppTheme();
  const { t } = useAppLocalization();
  const options: { id: ProgressMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: "physique", label: t({ tr: "Fizik", en: "Physique" }), icon: "body-outline" },
    { id: "strength", label: t({ tr: "Güç", en: "Strength" }), icon: "barbell-outline" },
    { id: "analysis", label: t({ tr: "Analiz", en: "Analysis" }), icon: "camera-outline" },
    { id: "coach", label: t({ tr: "Koç", en: "Coach" }), icon: "pulse-outline" },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.modeRow}
    >
      {options.map((option) => {
        const active = option.id === activeMode;
        return (
          <TouchableOpacity
            key={option.id}
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => onSelect(option.id)}
            style={[
              styles.modeChip,
              {
                backgroundColor: active ? themeColors.surface : themeColors.surfaceContainerLow,
                borderColor: active ? themeColors.primary : themeColors.outlineVariant,
              },
            ]}
          >
            <Ionicons
              name={option.icon}
              size={15}
              color={active ? themeColors.primary : themeColors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.modeChipText,
                { color: active ? themeColors.primary : themeColors.onSurfaceVariant },
              ]}
            >
              {option.label}
            </Text>
            {active ? <Ionicons name="chevron-down" size={13} color={themeColors.primary} /> : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

function ProgressOverviewCard({
  icon,
  title,
  value,
  unit,
  label,
  delta,
  deltaPositive,
  points,
  rangeLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  unit: string;
  label: string;
  delta: string;
  deltaPositive: boolean;
  points: TrendPoint[];
  rangeLabel: string;
}) {
  const { colors: themeColors } = useAppTheme();
  const deltaColor = deltaPositive ? themeColors.success : themeColors.tertiary;

  return (
    <GlassCard variant="panel" style={styles.overviewCard}>
      <View style={styles.overviewTop}>
        <View style={styles.metricHeading}>
          <View style={[styles.smallIcon, { backgroundColor: `${themeColors.primary}14` }]}>
            <Ionicons name={icon} size={16} color={themeColors.primary} />
          </View>
          <Text style={[styles.metricLabel, { color: themeColors.onSurfaceVariant }]}>
            {title}
          </Text>
        </View>
        <View style={[styles.deltaBadge, { backgroundColor: `${deltaColor}14` }]}>
          <Ionicons name={deltaPositive ? "trending-up" : "trending-down"} size={14} color={deltaColor} />
          <Text style={[styles.deltaText, { color: deltaColor }]}>
            {delta}
          </Text>
        </View>
      </View>

      <View style={styles.metricValueRow}>
        <Text style={[styles.overviewValue, { color: themeColors.onSurface }]}>
          {value}
        </Text>
        <Text style={[styles.overviewUnit, { color: themeColors.onSurfaceVariant }]}>
          {unit}
        </Text>
      </View>
      <Text style={[styles.metricSubLabel, { color: themeColors.onSurfaceVariant }]}>
        {label}
      </Text>

      <TrendAreaChart points={points} />

      <View style={[styles.rangeChip, { backgroundColor: themeColors.surfaceContainerLow }]}>
        <Ionicons name="remove-outline" size={15} color={themeColors.primary} />
        <Text style={[styles.rangeChipText, { color: themeColors.onSurfaceVariant }]}>
          {rangeLabel}
        </Text>
      </View>
    </GlassCard>
  );
}

function TrendAreaChart({ points }: { points: TrendPoint[] }) {
  const { colors: themeColors } = useAppTheme();
  const chartWidth = 320;
  const chartHeight = 154;
  const padX = 18;
  const padTop = 16;
  const padBottom = 28;
  const fallback: TrendPoint[] = [
    { id: "empty-1", value: 40, label: "" },
    { id: "empty-2", value: 48, label: "" },
    { id: "empty-3", value: 45, label: "" },
    { id: "empty-4", value: 56, label: "" },
    { id: "empty-5", value: 62, label: "" },
  ];
  const chartPoints = points.length >= 2 ? points : fallback;
  const values = chartPoints.map((item) => item.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const step = (chartWidth - padX * 2) / Math.max(chartPoints.length - 1, 1);
  const coords = chartPoints.map((point, index) => ({
    x: padX + index * step,
    y: padTop + (1 - (point.value - min) / range) * (chartHeight - padTop - padBottom),
    point,
  }));
  const linePath = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${coords.at(-1)?.x.toFixed(1) ?? padX} ${chartHeight - padBottom} L ${padX} ${chartHeight - padBottom} Z`;
  const last = coords.at(-1);

  return (
    <View style={styles.svgChartWrap}>
      <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        <Defs>
          <LinearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={themeColors.primary} stopOpacity="0.28" />
            <Stop offset="1" stopColor={themeColors.primary} stopOpacity="0.04" />
          </LinearGradient>
        </Defs>
        {[0, 1, 2].map((line) => {
          const y = padTop + line * ((chartHeight - padTop - padBottom) / 2);
          return (
            <Line
              key={line}
              x1={padX}
              x2={chartWidth - padX}
              y1={y}
              y2={y}
              stroke={themeColors.outlineVariant}
              strokeWidth={1}
              strokeDasharray="4 8"
            />
          );
        })}
        <Path d={areaPath} fill="url(#progressFill)" />
        <Path d={linePath} fill="none" stroke={themeColors.primary} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        {coords.map((coord, index) => (
          <Circle
            key={coord.point.id}
            cx={coord.x}
            cy={coord.y}
            r={index === coords.length - 1 ? 5 : 3.8}
            fill={themeColors.surface}
            stroke={themeColors.primary}
            strokeWidth={2.4}
          />
        ))}
        {last ? (
          <Circle cx={last.x} cy={last.y} r={9} fill={themeColors.primary} opacity={0.14} />
        ) : null}
      </Svg>
      <View style={styles.chartLabels}>
        <Text style={[styles.chartDate, { color: themeColors.outline }]}>
          {points[0]?.label || "Başla"}
        </Text>
        <Text style={[styles.chartDate, { color: themeColors.outline }]}>
          {points.at(-1)?.label || "Bugün"}
        </Text>
      </View>
    </View>
  );
}

function FocusList({ title, items, empty }: { title: string; items: string[]; empty?: string }) {
  const { colors: themeColors } = useAppTheme();
  return (
    <View style={styles.focusBlock}>
      <Text style={[styles.focusTitle, { color: themeColors.onSurfaceVariant }]}>
        {title}
      </Text>
      {items.length > 0 ? (
        <View style={styles.badges}>
          {items.map((item) => (
            <View key={item} style={[styles.badge, { backgroundColor: `${themeColors.secondary}18` }]}>
              <Text style={[styles.badgeText, { color: themeColors.secondary }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.cardBody, { color: themeColors.onSurfaceVariant }]}>
          {empty}
        </Text>
      )}
    </View>
  );
}

function EmptyProgressStarter({
  hasStrengthLogs,
  onAnalyze,
  onTrain,
}: {
  hasStrengthLogs: boolean;
  onAnalyze: () => void;
  onTrain: () => void;
}) {
  const { colors: themeColors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <View style={styles.emptyStarter}>
      <Text style={[styles.heroBody, { color: themeColors.onSurfaceVariant }]}>
        {hasStrengthLogs
          ? t({
              tr: "Ağırlık kayıtların burada görünmeye başladı. Physique score için vücut analizi opsiyonel.",
              en: "Your strength logs are already appearing here. Physique analysis is optional for the physique score.",
            })
          : t({
              tr: "İlk analiz veya ilk antrenman logundan sonra bu ekran canlı bir gelişim panosuna dönüşür.",
              en: "After your first analysis or workout log, this screen turns into a live progress board.",
            })}
      </Text>
      <View style={styles.placeholderGrid}>
        <PlaceholderMetric
          icon="body-outline"
          label={t({ tr: "Physique Score", en: "Physique Score" })}
          value={t({ tr: "Başlangıç bekliyor", en: "Waiting for baseline" })}
        />
        <PlaceholderMetric
          icon="analytics-outline"
          label={t({ tr: "Analiz Trendi", en: "Analysis Trend" })}
          value={t({ tr: "İlk analizden sonra", en: "After first analysis" })}
        />
        <PlaceholderMetric
          icon="barbell-outline"
          label={t({ tr: "Güç Trendi", en: "Strength Trend" })}
          value={
            hasStrengthLogs
              ? t({ tr: "Aşağıda başladı", en: "Started below" })
              : t({ tr: "İlk logdan sonra", en: "After first log" })
          }
        />
      </View>
      <View style={styles.emptyStarterActions}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onAnalyze}
          style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
        >
          <Text style={[styles.primaryButtonText, { color: themeColors.onPrimary }]}>
            {t({ tr: "Vücut analizi yap", en: "Analyze physique" })}
          </Text>
          <Ionicons name="chevron-forward" size={17} color={themeColors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onTrain}
          style={[styles.secondaryButton, { borderColor: themeColors.outlineVariant }]}
        >
          <Text style={[styles.secondaryButtonText, { color: themeColors.onSurface }]}>
            {t({ tr: "Antrenmana git", en: "Go to training" })}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PlaceholderMetric({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors: themeColors } = useAppTheme();
  return (
    <View style={[styles.placeholderMetric, { borderColor: themeColors.outlineVariant }]}>
      <View style={[styles.placeholderIcon, { backgroundColor: `${themeColors.primary}14` }]}>
        <Ionicons name={icon} size={17} color={themeColors.primary} />
      </View>
      <Text style={[styles.placeholderLabel, { color: themeColors.onSurfaceVariant }]}>
        {label}
      </Text>
      <Text style={[styles.placeholderValue, { color: themeColors.onSurface }]}>
        {value}
      </Text>
    </View>
  );
}

function EmptyAction({
  title,
  body,
  label,
  onPress,
}: {
  title: string;
  body: string;
  label: string;
  onPress: () => void;
}) {
  const { colors: themeColors } = useAppTheme();
  return (
    <View style={[styles.emptyBox, { backgroundColor: themeColors.surfaceContainerLow }]}>
      <Text style={[styles.emptyTitle, { color: themeColors.onSurface }]}>
        {title}
      </Text>
      <Text style={[styles.cardBody, { color: themeColors.onSurfaceVariant }]}>
        {body}
      </Text>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.84}
        onPress={onPress}
        style={[styles.primaryButton, { backgroundColor: themeColors.primary }]}
      >
        <Text style={[styles.primaryButtonText, { color: themeColors.onPrimary }]}>
          {label}
        </Text>
        <Ionicons name="chevron-forward" size={17} color={themeColors.onPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.md,
  },
  loading: { minHeight: 280, alignItems: "center", justifyContent: "center" },
  modeRow: {
    gap: spacing.xs,
    paddingRight: spacing.containerMargin,
  },
  modeChip: {
    minHeight: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modeChipText: { ...typography.buttonSm },
  overviewCard: {
    padding: spacing.cardPadding,
    gap: spacing.sm,
    borderRadius: radius["3xl"],
  },
  overviewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  metricHeading: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  smallIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  metricLabel: { ...typography.labelCaps },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  overviewValue: {
    ...typography.displayLgMobile,
    fontSize: 38,
    lineHeight: 42,
    fontVariant: ["tabular-nums"],
  },
  overviewUnit: { ...typography.labelMd, paddingBottom: 6 },
  metricSubLabel: { ...typography.bodySm },
  svgChartWrap: {
    marginTop: spacing.sm,
    width: "100%",
    minHeight: 184,
  },
  chartLabels: {
    marginTop: -18,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangeChip: {
    alignSelf: "center",
    minHeight: 34,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rangeChipText: { ...typography.buttonSm },
  insightCard: {
    padding: spacing.md,
    borderRadius: radius["2xl"],
    flexDirection: "row",
    gap: spacing.sm,
  },
  insightIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  insightTitle: { ...typography.labelMd, marginBottom: 2 },
  hero: { padding: spacing.cardPadding, gap: spacing.md, overflow: "hidden" },
  heroGlow: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -68,
    top: -72,
  },
  heroHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: { flex: 1 },
  eyebrow: { ...typography.labelCaps },
  heroTitle: { ...typography.screenTitle },
  heroBody: { ...typography.bodyMd },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  scoreValue: { ...typography.statsNumber, fontVariant: ["tabular-nums"] },
  scoreLabel: { ...typography.bodySm },
  deltaBadge: {
    minHeight: 34,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  deltaText: { ...typography.buttonSm, fontVariant: ["tabular-nums"] },
  disclaimer: { ...typography.bodyXs },
  card: { padding: spacing.cardPadding, gap: spacing.md },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  cardTitle: { ...typography.cardTitle },
  cardBody: { ...typography.bodySm },
  bodyFat: { ...typography.numericLg },
  chart: { height: 164, flexDirection: "row", alignItems: "flex-end", gap: 8 },
  chartItem: { flex: 1, alignItems: "center", gap: 6 },
  chartValue: { ...typography.labelXs, fontVariant: ["tabular-nums"] },
  chartBar: { width: "100%", maxWidth: 28, borderRadius: radius.full },
  chartDate: { ...typography.bodyXs, fontSize: 10 },
  focusBlock: { gap: spacing.xs },
  focusTitle: { ...typography.labelCaps },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  badge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 7 },
  badgeText: { ...typography.buttonSm },
  iconButton: { width: 38, height: 38, borderRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  linkPill: {
    minHeight: 34,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  linkPillText: { ...typography.buttonSm },
  coachList: { gap: spacing.xs },
  coachRow: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.sm, flexDirection: "row", gap: spacing.sm },
  coachIcon: { width: 34, height: 34, borderRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  coachMeta: { ...typography.bodyXs, marginTop: 4 },
  strengthList: { gap: spacing.xs },
  strengthRow: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.sm, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  strengthName: { ...typography.labelMd },
  emptyStarter: { gap: spacing.md },
  placeholderGrid: { gap: spacing.xs },
  placeholderMetric: { borderWidth: 1, borderRadius: radius.lg, padding: spacing.sm, gap: 5 },
  placeholderIcon: { width: 34, height: 34, borderRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  placeholderLabel: { ...typography.labelXs },
  placeholderValue: { ...typography.labelMd },
  emptyStarterActions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  emptyBox: { borderRadius: radius.xl, padding: spacing.md, gap: spacing.sm },
  emptyTitle: { ...typography.cardTitle },
  primaryButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  primaryButtonText: { ...typography.buttonLg },
  secondaryButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  secondaryButtonText: { ...typography.buttonLg },
}));
