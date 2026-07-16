import {
  createDynamicStyles,
  colors,
  radius,
  spacing,
  typography,
} from "@/theme";
import { Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAppLocalization } from "@/providers/localization-context";
import { formatWeightValue, weightUnitLabel } from "@/services/localization";
import type { WorkoutSetLogEntry } from "@/types";

export function WorkoutSetSummary({
  sets,
  showKind = true,
}: {
  sets: WorkoutSetLogEntry[];
  showKind?: boolean;
}) {
  const { t } = useAppLocalization();

  return (
    <View style={styles.list}>
      {sets.map((entry) => (
        <View key={`${entry.order}-${entry.completedAt}`} style={styles.card}>
          <View style={styles.status}>
            <Ionicons
              name={entry.kind === "warmup" ? "flame-outline" : "checkmark"}
              size={15}
              color={colors.onSecondary}
            />
          </View>
          <View style={styles.body}>
            <Text style={styles.label}>
              SET {entry.order}
              {showKind
                ? ` · ${entry.kind === "warmup" ? t({ tr: "Isınma", en: "Warm-up" }) : t({ tr: "Çalışma", en: "Working" })}`
                : ""}
            </Text>
            <Text style={styles.value}>
              {formatWeightValue(entry.kg)} {weightUnitLabel()}{" "}
              <Text style={styles.reps}>x {entry.reps}</Text>
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  list: { gap: spacing.xs + 2 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.smPlus,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  status: {
    width: 34,
    height: 34,
    borderRadius: radius.lg,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { gap: 4, flex: 1 },
  label: { ...typography.bodyXs, color: colors.outline },
  value: { ...typography.numericLg, color: colors.onSurface },
  reps: { ...typography.numericMd, color: colors.onSurfaceVariant },
}));
