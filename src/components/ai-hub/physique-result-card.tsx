import { Ionicons } from "@expo/vector-icons";
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
  };
};

export function PhysiqueResultCard({ result, labels }: Props) {
  const { colors } = useAppTheme();

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
        {result.generalDurum}
      </Text>

      {result.eksikBolgeler.length ? (
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
  comment: { padding: spacing.sm, borderRadius: radius.lg, gap: 4 },
  commentTitle: { ...typography.labelCaps },
  commentText: { ...typography.bodySm },
  pose: { ...typography.bodySm },
  confidence: { ...typography.numericMd, textAlign: "right" },
}));
