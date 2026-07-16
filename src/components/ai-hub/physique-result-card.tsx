import Ionicons from "@expo/vector-icons/Ionicons";
import { Text, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import {
  createDynamicStyles,
  radius,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { PhysiqueAnalysisResult } from "@/types/aiHub";

type Props = {
  result: PhysiqueAnalysisResult;
  labels: {
    report: string;
    estimate: string;
    focus: string;
    exercises: string;
    muscle: string;
    pose: string;
    confidence: string;
    confidenceNote: string;
    strengths?: string;
    improvements?: string;
    priorities?: string;
    vTaper?: string;
    posture?: string;
    fatDistribution?: string;
  };
};

export function PhysiqueResultCard({ result, labels }: Props) {
  const { colors } = useAppTheme();
  const priorityRoadmap = result.priorityRoadmap ?? [];
  const strengths = result.strengths ?? [];
  const improvements = result.improvementAreas ?? [];
  const posture = result.posture ?? [];
  const fatDistribution = result.fatDistribution ?? [];

  return (
    <GlassCard variant="panel" style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.icon,
              { backgroundColor: colors.secondaryContainer },
            ]}
          >
            <Ionicons name="body-outline" size={22} color={colors.secondary} />
          </View>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {labels.report}
          </Text>
        </View>
        <View
          style={[styles.score, { backgroundColor: colors.primaryContainer }]}
        >
          <Text style={[styles.scoreNumber, { color: colors.onPrimary }]}>
            {result.tahminiYagOrani}%
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.onPrimary }]}>
            {labels.estimate}
          </Text>
        </View>
      </View>

      <Text selectable style={[styles.summary, { color: colors.onSurface }]}>
        {result.coachSummary ?? result.generalDurum}
      </Text>

      {strengths.length || improvements.length ? (
        <View style={styles.dualGrid}>
          {strengths.length ? (
            <View style={[styles.miniPanel, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.commentTitle, { color: colors.secondary }]}>
                {labels.strengths ?? "Güçlü yönler"}
              </Text>
              {strengths.slice(0, 3).map((item) => (
                <Text key={item} style={[styles.bulletText, { color: colors.onSurface }]}>
                  ✓ {item}
                </Text>
              ))}
            </View>
          ) : null}
          {improvements.length ? (
            <View style={[styles.miniPanel, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.commentTitle, { color: colors.secondary }]}>
                {labels.improvements ?? "Geliştirilecek alanlar"}
              </Text>
              {improvements.slice(0, 3).map((item) => (
                <Text key={item} style={[styles.bulletText, { color: colors.onSurface }]}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {result.vTaper ? (
        <View style={[styles.comment, { backgroundColor: colors.surfaceContainerLow }]}>
          <Text style={[styles.commentTitle, { color: colors.secondary }]}>
            {labels.vTaper ?? "V-Taper görünümü"}
          </Text>
          <Text selectable style={[styles.commentText, { color: colors.onSurface }]}>
            {result.vTaper.comment}
          </Text>
          <Text style={[styles.pose, { color: colors.onSurfaceVariant }]}>
            Etki: {formatImpact(result.vTaper.impactLevel)}
          </Text>
        </View>
      ) : null}

      {priorityRoadmap.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
            {labels.priorities ?? "Öncelik sıralaması"}
          </Text>
          {priorityRoadmap.map((item) => (
            <View
              key={`${item.rank}-${item.targetArea}`}
              style={[styles.priorityRow, { borderBottomColor: colors.outlineVariant }]}
            >
              <View style={[styles.exerciseIndex, { backgroundColor: colors.surfaceContainerHigh }]}>
                <Text style={[styles.exerciseIndexText, { color: colors.secondary }]}>
                  {item.rank}
                </Text>
              </View>
              <View style={styles.exerciseCopy}>
                <Text style={[styles.exerciseName, { color: colors.onSurface }]}>
                  {item.targetArea} · {formatImpact(item.aestheticImpact)}
                </Text>
                <Text style={[styles.exerciseWhy, { color: colors.onSurfaceVariant }]}>
                  {item.reason}
                </Text>
                <Text style={[styles.exerciseWhy, { color: colors.secondary }]}>
                  {item.exerciseEmphasis.slice(0, 3).join(", ")}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : result.eksikBolgeler.length ? (
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}
          >
            {labels.focus}
          </Text>
          <View style={styles.badges}>
            {result.eksikBolgeler.map((region) => (
              <View
                key={region}
                style={[
                  styles.badge,
                  { backgroundColor: colors.tertiaryContainer },
                ]}
              >
                <Text style={[styles.badgeText, { color: colors.tertiary }]}>
                  {region}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.onSurfaceVariant }]}>
          {labels.exercises}
        </Text>
        {result.odaklanmasiGerekenHareketler.map((exercise, index) => (
          <View
            key={`${exercise.hareketAdi}-${index}`}
            style={[
              styles.exercise,
              { borderBottomColor: colors.outlineVariant },
            ]}
          >
            <View
              style={[
                styles.exerciseIndex,
                { backgroundColor: colors.surfaceContainerHigh },
              ]}
            >
              <Text
                style={[styles.exerciseIndexText, { color: colors.secondary }]}
              >
                {index + 1}
              </Text>
            </View>
            <View style={styles.exerciseCopy}>
              <Text style={[styles.exerciseName, { color: colors.onSurface }]}>
                {exercise.hareketAdi}
              </Text>
              <Text
                style={[styles.exerciseWhy, { color: colors.onSurfaceVariant }]}
              >
                {exercise.neden}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {posture.length || fatDistribution.length ? (
        <View style={styles.dualGrid}>
          {posture.length ? (
            <View style={[styles.miniPanel, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.commentTitle, { color: colors.secondary }]}>
                {labels.posture ?? "Postür notu"}
              </Text>
              {posture.slice(0, 2).map((item) => (
                <Text key={item.title} style={[styles.bulletText, { color: colors.onSurface }]}>
                  {item.title}: {item.description}
                </Text>
              ))}
            </View>
          ) : null}
          {fatDistribution.length ? (
            <View style={[styles.miniPanel, { backgroundColor: colors.surfaceContainerLow }]}>
              <Text style={[styles.commentTitle, { color: colors.secondary }]}>
                {labels.fatDistribution ?? "Yağ dağılımı"}
              </Text>
              {fatDistribution.slice(0, 2).map((item) => (
                <Text key={item.title} style={[styles.bulletText, { color: colors.onSurface }]}>
                  {item.title}: {item.description}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <View
        style={[
          styles.comment,
          { backgroundColor: colors.surfaceContainerLow },
        ]}
      >
        <Text style={[styles.commentTitle, { color: colors.secondary }]}>
          {labels.muscle}
        </Text>
        <Text
          selectable
          style={[styles.commentText, { color: colors.onSurface }]}
        >
          {result.kasKutlesiYorumu}
        </Text>
      </View>
      <Text
        selectable
        style={[styles.pose, { color: colors.onSurfaceVariant }]}
      >
        {labels.pose}: {result.pozKalitesiYorumu}
      </Text>
      <Text style={[styles.confidence, { color: colors.secondary }]}>
        {labels.confidence}: {Math.round(result.guvenPuani)}%
      </Text>
      <Text style={[styles.pose, { color: colors.onSurfaceVariant }]}>
        {labels.confidenceNote}
      </Text>
    </GlassCard>
  );
}

function formatImpact(value: string): string {
  if (value === "very_high") return "Çok yüksek";
  if (value === "high") return "Yüksek";
  if (value === "medium") return "Orta";
  return "Düşük";
}

const styles = createDynamicStyles(() => ({
  card: { padding: spacing.cardPadding - 1, gap: spacing.md },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    flex: 1,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...typography.cardTitle },
  score: {
    minWidth: 76,
    borderRadius: radius.xl,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
  },
  scoreNumber: { ...typography.sectionTitle, fontVariant: ["tabular-nums"] },
  scoreLabel: { ...typography.labelXs },
  summary: { ...typography.bodyMd },
  section: { gap: spacing.xs + 1 },
  sectionTitle: { ...typography.labelCaps, textTransform: "uppercase" },
  dualGrid: { gap: spacing.sm },
  miniPanel: { padding: spacing.sm, borderRadius: radius.lg, gap: 5 },
  bulletText: { ...typography.bodyXs },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs - 1 },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm - 1,
    paddingVertical: 7,
  },
  badgeText: { ...typography.buttonSm },
  exercise: {
    flexDirection: "row",
    gap: spacing.xs + 2,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  exerciseIndex: {
    width: 30,
    height: 30,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  exerciseIndexText: { ...typography.buttonSm },
  exerciseCopy: { flex: 1, gap: 2 },
  exerciseName: { ...typography.labelMd },
  exerciseWhy: { ...typography.bodyXs },
  priorityRow: {
    flexDirection: "row",
    gap: spacing.xs + 2,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  comment: { padding: spacing.sm, borderRadius: radius.lg, gap: 4 },
  commentTitle: { ...typography.labelCaps },
  commentText: { ...typography.bodySm },
  pose: { ...typography.bodySm },
  confidence: { ...typography.numericMd, textAlign: "right" },
}));
