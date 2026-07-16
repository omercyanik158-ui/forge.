import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  Pressable,
  Text,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import {
  createDynamicStyles,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";

type Props = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  secondary?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
};

export function AIActionButton({
  label,
  icon = "sparkles",
  loading,
  disabled,
  secondary,
  style,
  onPress,
}: Props) {
  const { colors } = useAppTheme();
  const background = secondary ? colors.surfaceContainerHigh : colors.primary;
  const foreground = secondary ? colors.onSurface : colors.onPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor: secondary
            ? colors.outlineVariant
            : `${colors.primary}55`,
        },
        style,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={foreground} />
      ) : (
        <Ionicons name={icon} size={19} color={foreground} />
      )}
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = createDynamicStyles(() => ({
  button: {
    minHeight: 52,
    borderRadius: radius["2xl"],
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.mdPlus,
    ...shadowStyle("sm"),
  },
  label: { ...typography.buttonLg },
  pressed: { opacity: 0.94, transform: [{ scale: 0.988 }] },
  disabled: { opacity: 0.48 },
}));
