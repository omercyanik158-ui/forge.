import { startTransition, useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Text, TextInput, View } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import {
  extractGramsFromPortion,
  scaleFoodAnalysisResult,
} from "@/services/aiHubFoodScaling";
import {
  createDynamicStyles,
  radius,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { FoodAnalysisResult } from "@/types/aiHub";

type NumericField = "kalori" | "protein" | "karbonhidrat" | "yag";

type Props = {
  result: FoodAnalysisResult;
  labels: {
    title: string;
    portion: string;
    grams: string;
    scaleHint: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    confidence: string;
    confidenceNote: string;
  };
  onChange: (result: FoodAnalysisResult) => void;
};

function normalizeEditableNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  return Number.isInteger(value)
    ? String(value)
    : String(Math.round(value * 10) / 10);
}

export function FoodResultCard({ result, labels, onChange }: Props) {
  const { colors } = useAppTheme();
  const [gramsInput, setGramsInput] = useState("");

  useEffect(() => {
    const detectedGrams = extractGramsFromPortion(result.porsiyon);
    startTransition(() => {
      setGramsInput(
        detectedGrams != null ? normalizeEditableNumber(detectedGrams) : "",
      );
    });
  }, [result.porsiyon]);

  const updateNumber = (field: NumericField, value: string) => {
    const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
    onChange({ ...result, [field]: Number(normalized) || 0 });
  };

  const updateGrams = (value: string) => {
    const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
    setGramsInput(normalized);
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    const previousGrams =
      extractGramsFromPortion(result.porsiyon) ??
      (gramsInput ? Number(gramsInput) : null);
    onChange(scaleFoodAnalysisResult(result, parsed, previousGrams));
  };

  return (
    <GlassCard variant="panel" style={styles.card}>
      <View style={styles.heading}>
        <View
          style={[styles.icon, { backgroundColor: colors.tertiaryContainer }]}
        >
          <Ionicons
            name="restaurant-outline"
            size={20}
            color={colors.tertiary}
          />
        </View>
        <View style={styles.headingCopy}>
          <Text style={[styles.eyebrow, { color: colors.tertiary }]}>
            {labels.title}
          </Text>
          <TextInput
            accessibilityLabel={labels.title}
            value={result.yemekAdi}
            onChangeText={(yemekAdi) => onChange({ ...result, yemekAdi })}
            style={[
              styles.nameInput,
              {
                color: colors.onSurface,
                borderBottomColor: colors.outlineVariant,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.portionGrid}>
        <View style={styles.portionField}>
          <Text
            style={[styles.portionLabel, { color: colors.onSurfaceVariant }]}
          >
            {labels.portion}
          </Text>
          <TextInput
            value={result.porsiyon}
            onChangeText={(porsiyon) => onChange({ ...result, porsiyon })}
            style={[
              styles.portionInput,
              {
                color: colors.onSurface,
                backgroundColor: colors.surfaceContainerLow,
              },
            ]}
          />
        </View>
        <View style={styles.gramField}>
          <Text
            style={[styles.portionLabel, { color: colors.onSurfaceVariant }]}
          >
            {labels.grams}
          </Text>
          <View
            style={[
              styles.gramInputWrap,
              { backgroundColor: colors.surfaceContainerLow },
            ]}
          >
            <TextInput
              keyboardType="decimal-pad"
              value={gramsInput}
              onChangeText={updateGrams}
              placeholder="100"
              placeholderTextColor={colors.outline}
              style={[styles.gramInput, { color: colors.onSurface }]}
            />
            <Text style={[styles.gramUnit, { color: colors.onSurfaceVariant }]}>
              g
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.scaleHint, { color: colors.onSurfaceVariant }]}>
        {labels.scaleHint}
      </Text>

      <View style={styles.grid}>
        {(
          [
            ["kalori", labels.calories, "kcal", colors.tertiary],
            ["protein", labels.protein, "g", colors.secondary],
            ["karbonhidrat", labels.carbs, "g", colors.primary],
            ["yag", labels.fat, "g", colors.success],
          ] as const
        ).map(([field, label, unit, color]) => (
          <View
            key={field}
            style={[
              styles.metric,
              { backgroundColor: colors.surfaceContainerLow },
            ]}
          >
            <Text style={[styles.metricLabel, { color }]}>{label}</Text>
            <View style={styles.metricValueRow}>
              <TextInput
                accessibilityLabel={label}
                keyboardType="decimal-pad"
                value={String(result[field])}
                onChangeText={(value) => updateNumber(field, value)}
                style={[styles.metricInput, { color: colors.onSurface }]}
              />
              <Text style={[styles.unit, { color: colors.onSurfaceVariant }]}>
                {unit}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.note, { color: colors.onSurfaceVariant }]}>
        {result.aciklama}
      </Text>
      <View style={styles.confidenceRow}>
        <Text style={[styles.confidence, { color: colors.onSurfaceVariant }]}>
          {labels.confidence}
        </Text>
        <Text style={[styles.confidenceValue, { color: colors.secondary }]}>
          {Math.round(result.guvenPuani)}%
        </Text>
      </View>
      <Text style={[styles.scaleHint, { color: colors.onSurfaceVariant }]}>
        {labels.confidenceNote}
      </Text>
    </GlassCard>
  );
}

const styles = createDynamicStyles(() => ({
  card: { padding: spacing.cardPadding - 1, gap: spacing.smPlus },
  heading: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  headingCopy: { flex: 1, gap: 2 },
  eyebrow: { ...typography.labelCaps },
  nameInput: {
    ...typography.cardTitle,
    paddingVertical: 2,
    borderBottomWidth: 1,
  },
  portionGrid: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs + 2,
  },
  portionField: { flex: 1, gap: 6 },
  gramField: { width: 124, gap: 6 },
  portionLabel: { ...typography.bodyXs },
  portionInput: {
    ...typography.labelMd,
    minHeight: 40,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
  },
  gramInputWrap: {
    minHeight: 40,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gramInput: { ...typography.labelMd, flex: 1, paddingVertical: 0 },
  gramUnit: { ...typography.bodyXs },
  scaleHint: { ...typography.bodyXs },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  metric: {
    width: "48%",
    flexGrow: 1,
    borderRadius: radius.lg,
    padding: spacing.sm - 1,
    gap: 2,
  },
  metricLabel: { ...typography.labelXs, textTransform: "uppercase" },
  metricValueRow: { flexDirection: "row", alignItems: "baseline", gap: 3 },
  metricInput: {
    ...typography.sectionTitle,
    padding: 0,
    minWidth: 48,
    fontVariant: ["tabular-nums"],
  },
  unit: { ...typography.bodyXs },
  note: { ...typography.bodySm },
  confidenceRow: { flexDirection: "row", justifyContent: "space-between" },
  confidence: { ...typography.bodyXs },
  confidenceValue: { ...typography.numericMd },
}));
