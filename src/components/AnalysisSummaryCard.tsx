import {
  createDynamicStyles,
  radius,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlassCard } from "@/components/GlassCard";
import { REGION_STATUS_META } from "@/components/analysisMeta";
import type {
  AnalysisRegion,
  TrainingAnalysis,
} from "@/services/trainingAnalysis";
import { useAppLocalization } from "@/providers/localization-context";

type AnalysisSummaryCardProps = {
  analysis: TrainingAnalysis;
  onOpenDetails?: () => void;
};

export function AnalysisSummaryCard({
  analysis,
  onOpenDetails,
}: AnalysisSummaryCardProps) {
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <GlassCard variant="panel" style={styles.card}>
      <View style={styles.header}>
        <View
          style={[
            styles.headerLeft,
            { backgroundColor: `${colors.primary}14` },
          ]}
        >
          <Ionicons name="pulse-outline" size={16} color={colors.primary} />
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            {t({ tr: "HAFTALIK ANALİZ", en: "WEEKLY ANALYSIS" })}
          </Text>
        </View>
        {onOpenDetails ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={t({
              tr: "Haftalık analiz detayını aç",
              en: "Open weekly analysis details",
            })}
            activeOpacity={0.8}
            onPress={onOpenDetails}
            style={styles.action}
          >
            <Text style={[styles.actionText, { color: colors.secondary }]}>
              {t({ tr: "Detay", en: "Details" })}
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.secondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={[styles.headline, { color: colors.onSurface }]}>
        {analysis.headline}
      </Text>
      <Text style={[styles.detail, { color: colors.onSurfaceVariant }]}>
        {analysis.headlineDetail}
      </Text>

      {analysis.sufficiency === "sufficient" ? (
        <View style={styles.chips}>
          {analysis.regionResults.map((result) => (
            <RegionChip
              key={result.region}
              region={result.region}
              phrase={analysis.regionPhrase(result.region)}
              status={result.status}
            />
          ))}
        </View>
      ) : null}
    </GlassCard>
  );
}

function RegionChip({
  region,
  phrase,
  status,
}: {
  region: AnalysisRegion;
  phrase: string;
  status: keyof typeof REGION_STATUS_META;
}) {
  const { colors } = useAppTheme();
  const meta = REGION_STATUS_META[status];

  return (
    <View
      style={[
        styles.chip,
        {
          borderColor: `${meta.color}55`,
          backgroundColor: colors.surfaceContainer,
        },
      ]}
    >
      <Text style={[styles.chipRegion, { color: colors.onSurface }]}>
        {region}
      </Text>
      <Text style={[styles.chipStatus, { color: meta.color }]}>{phrase}</Text>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  card: { padding: spacing.cardPadding, gap: spacing.sm },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  headerLeft: {
    minHeight: 30,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  eyebrow: { ...typography.labelCaps },
  action: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionText: { ...typography.buttonSm },
  headline: { ...typography.sectionTitle },
  detail: { ...typography.bodySm },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: 2,
  },
  chipRegion: { ...typography.buttonSm },
  chipStatus: { ...typography.bodyXs },
}));
