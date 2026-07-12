import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, spacing, radius, typography, shadowStyle, animations } from '@/theme';

type IonIconNames = React.ComponentProps<typeof Ionicons>['name'];

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'disabled';
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
  loading?: boolean;
  icon?: IonIconNames;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  icon,
}: ButtonProps) {
  const { colors } = useAppTheme();

  const getContainerStyle = (): ViewStyle => {
    const baseHeight = size === 'large' ? 44 : size === 'medium' ? 40 : 36;
    const baseBg = {
      primary: colors.primary,
      secondary: colors.surfaceContainerLow,
      tertiary: 'transparent',
      disabled: colors.surfaceContainer,
    }[variant];
    const baseBorder = {
      primary: 0,
      secondary: 1,
      tertiary: 0,
      disabled: 0,
    }[variant];
    const baseBorderColor = {
      primary: undefined,
      secondary: colors.outlineVariant,
      tertiary: undefined,
      disabled: undefined,
    }[variant];
    const baseShadow = {
      primary: shadowStyle('md'),
      secondary: {},
      tertiary: {},
      disabled: {},
    }[variant];

    return {
      height: baseHeight,
      backgroundColor: baseBg,
      borderWidth: baseBorder,
      borderColor: baseBorderColor,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.lg,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      gap: spacing.xs,
      opacity: disabled ? animations.opacity.disabled : animations.opacity.rest,
      ...baseShadow,
    };
  };

  const getTextStyle = (): TextStyle => ({
    color: {
      primary: colors.white,
      secondary: colors.onSurface,
      tertiary: colors.primary,
      disabled: colors.onSurfaceVariant,
    }[variant],
    ...typography.buttonLg,
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={getContainerStyle()}
    >
      {loading ? (
        <ActivityIndicator color={getTextStyle().color} size="small" />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={getTextStyle().color}
            />
          )}
          <Text style={getTextStyle()}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
