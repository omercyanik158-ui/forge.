import {
  createDynamicStyles,
  colors,
  radius,
  spacing,
  typography,
} from "@/theme";
import { Text, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import {
  REGION_FULL_VOLUME,
  regionStatusColor,
  regionStatusLabel,
} from "@/components/analysisMeta";
import type {
  AnalysisRegion,
  RegionResult,
  TrainingAnalysis,
} from "@/services/trainingAnalysis";
import { useAppLocalization } from "@/providers/localization-context";

type AnalysisRegionListProps = {
  analysis: TrainingAnalysis;
};

export function AnalysisRegionList({ analysis }: AnalysisRegionListProps) {
  const { t } = useAppLocalization();
  return (
    <GlassCard variant="panel" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {t({ tr: "Haftalık bölge dengesi", en: "Weekly muscle balance" })}
        </Text>
        <Text style={styles.subtitle}>
          {t({
            tr: "Hedef kaslar tam set, destek kaslar yarım set sayılır.",
            en: "Target muscles count as a full set; supporting muscles count as half a set.",
          })}
        </Text>
      </View>

      {analysis.sufficiency === "sufficient" ? (
        <RegionRows analysis={analysis} />
      ) : (
        <Text style={styles.emptyText}>
          {sufficiencyMessage(analysis.sufficiency, t)}
        </Text>
      )}
    </GlassCard>
  );
}

function sufficiencyMessage(
  sufficiency: "empty" | "limited",
  t: (message: { tr: string; en: string }) => string,
): string {
  return sufficiency === "empty"
    ? t({
        tr: "Bu hafta antrenman kaydın yok. Egzersiz veya program tamamladıkça bölgesel denge burada oluşur.",
        en: "You have no workout entries this week. Your muscle balance will appear as you complete exercises or programs.",
      })
    : t({
        tr: "Bölgesel analiz için bu hafta birkaç antrenman daha ekle. Yeterli kayıt olunca kas grubu dengesi netleşir.",
        en: "Add a few more workouts this week. Muscle-group balance will become clearer once there is enough data.",
      });
}

function RegionRows({ analysis }: AnalysisRegionListProps) {
  const maxSets = Math.max(
    REGION_FULL_VOLUME,
    ...analysis.regionResults.map((result) => result.sets),
    1,
  );

  return (
    <View style={styles.rows}>
      {analysis.regionResults.map((result) => (
        <RegionRow
          key={result.region}
          result={result}
          maxSets={maxSets}
          phrase={analysis.regionPhrase(result.region)}
        />
      ))}
    </View>
  );
}

function RegionRow({
  result,
  maxSets,
  phrase,
}: {
  result: RegionResult;
  maxSets: number;
  phrase: string;
}) {
  const { t } = useAppLocalization();
  const pct = Math.max(4, Math.min((result.sets / maxSets) * 100, 100));
  const statusColor = regionStatusColor(result.status);

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.regionName}>{result.region}</Text>
        <View
          style={[styles.statusBadge, { backgroundColor: `${statusColor}22` }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {regionStatusLabel(result.status)}
          </Text>
        </View>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pct}%`, backgroundColor: statusColor },
          ]}
        />
      </View>
      <View style={styles.rowBottom}>
        <Text style={styles.phrase}>{phrase}</Text>
        <Text style={styles.sets}>
          {formatSets(result.sets)} {t({ tr: "set", en: "sets" })}
        </Text>
      </View>
    </View>
  );
}

function formatSets(sets: number): string {
  return Number.isInteger(sets) ? `${sets}` : sets.toFixed(1);
}

export type { AnalysisRegion, RegionResult };

const styles = createDynamicStyles(() => ({
  card: { padding: spacing.cardPadding, gap: spacing.smPlus },
  header: { gap: spacing.xs / 2 },
  title: { ...typography.sectionTitle, color: colors.onSurface },
  subtitle: { ...typography.bodySm, color: colors.outline },
  rows: { gap: spacing.smPlus },
  row: { gap: spacing.xs },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  regionName: { ...typography.labelMd, color: colors.onSurface },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusText: { ...typography.labelXs },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.full },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  phrase: { ...typography.bodySm, color: colors.onSurfaceVariant, flex: 1 },
  sets: { ...typography.numericMd, color: colors.onSurfaceVariant },
  emptyText: { ...typography.bodySm, color: colors.onSurfaceVariant },
}));
