import { TextInput, View, Text, ViewStyle } from "react-native";
import {
  radius,
  spacing,
  typography,
  useAppTheme,
  shadowStyle,
} from "@/theme";

export interface TextareaProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  focused?: boolean;
}

const styles = {
  container: { 
    gap: spacing.xs, 
    flexDirection: "column" as const,
  } as ViewStyle,
  textarea: {
    minHeight: 80,
    maxHeight: 200,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    ...typography.bodyMd,
  },
  error: {
    ...typography.labelXs,
  },
};

export function Textarea({
  value,
  onChangeText,
  placeholder,
  disabled = false,
  error,
  focused = false,
}: TextareaProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={!disabled}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        style={[
          styles.textarea,
          {
            borderColor: error ? colors.error : focused ? colors.primary : colors.outlineVariant,
            color: colors.onSurface,
          },
          !disabled && focused && shadowStyle("md"),
          disabled && { opacity: 0.5 },
        ]}
        placeholderTextColor={colors.onSurfaceVariant}
      />
      {error && (
        <Text style={[styles.error, { color: colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}
