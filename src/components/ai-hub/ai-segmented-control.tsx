import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { selectionFeedback } from "@/services/interactionFeedback";
import {
  createDynamicStyles,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { AIHubMode } from "@/types/aiHub";

type Props = {
  value: AIHubMode;
  foodLabel: string;
  physiqueLabel: string;
  onChange: (value: AIHubMode) => void;
};

const ICONS: Record<
  AIHubMode,
  {
    active: keyof typeof Ionicons.glyphMap;
    inactive: keyof typeof Ionicons.glyphMap;
  }
> = {
  food: { active: "nutrition", inactive: "nutrition-outline" },
  physique: { active: "body", inactive: "body-outline" },
};

export function AISegmentedControl({
  value,
  foodLabel,
  physiqueLabel,
  onChange,
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.track,
        {
          backgroundColor: colors.surfaceContainerHigh,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      {(
        [
          ["food", foodLabel],
          ["physique", physiqueLabel],
        ] as const
      ).map(([key, label]) => {
        const active = value === key;
        const icon = active ? ICONS[key].active : ICONS[key].inactive;
        return (
          <Pressable
            key={key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              selectionFeedback();
              onChange(key);
            }}
            style={({ pressed }) => [
              styles.item,
              active && { backgroundColor: colors.primary },
              active && shadowStyle("sm"),
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name={icon}
              size={17}
              color={active ? colors.onPrimary : colors.onSurfaceVariant}
            />
            <Text
              style={[
                styles.label,
                { color: active ? colors.onPrimary : colors.onSurfaceVariant },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  track: {
    minHeight: 58,
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xs - 2,
    flexDirection: "row",
    gap: spacing.xs - 2,
  },
  item: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs - 2,
    // Transitions: active state will show shadow with md level
    // Uses shadowStyle("sm") on active for elevation effect
  },
  pressed: { opacity: 0.8 },
  label: { ...typography.buttonLg },
}));
