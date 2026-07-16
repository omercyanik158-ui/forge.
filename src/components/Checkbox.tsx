import { TouchableOpacity, View, Text, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  radius,
  spacing,
  typography,
  useAppTheme,
  shadowStyle,
} from "@/theme";

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const styles = {
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.sm,
  } as ViewStyle,
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  } as ViewStyle,
  label: {
    ...typography.bodyMd,
  },
};

export function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={styles.container}
    >
      <View
        style={[
          styles.checkbox,
          {
            backgroundColor: checked ? colors.primary : colors.surface,
            borderColor: checked ? colors.primary : colors.outlineVariant,
          },
          checked && shadowStyle("sm"),
          disabled && { opacity: 0.5 },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={16} color={colors.white} />}
      </View>
      {label && (
        <Text
          style={[
            styles.label,
            { color: disabled ? colors.onSurfaceVariant : colors.onSurface },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
