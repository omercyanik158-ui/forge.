import { TextInput, View, Text, ViewStyle } from 'react-native';
import { useAppTheme, spacing, radius, typography, shadowStyle } from '@/theme';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  focused?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  disabled = false,
  error,
  focused = false,
}: InputProps) {
  const { colors } = useAppTheme();
  
  return (
    <View style={{ gap: spacing.xs, flexDirection: 'column' as const } as ViewStyle}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        editable={!disabled}
        style={[
          {
            height: 44,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.xs + 2,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: error ? colors.error : focused ? colors.primary : colors.outlineVariant,
            color: colors.onSurface,
            ...typography.bodyMd,
          },
          !disabled && focused && shadowStyle('md'),
          disabled && { opacity: 0.5 },
        ]}
        placeholderTextColor={colors.onSurfaceVariant}
      />
      {error && (
        <Text style={[{ color: colors.error }, typography.labelXs]}>
          {error}
        </Text>
      )}
    </View>
  );
}
