import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, TouchableOpacity, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import { formatMessage } from '@/services/localization';

type AppErrorBoundaryProps = {
  retry: () => void;
};

export function AppErrorBoundary({ retry }: AppErrorBoundaryProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.containerMargin,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 24,
          borderCurve: 'continuous',
          padding: 24,
          gap: 12,
          alignItems: 'center',
          backgroundColor: colors.surfaceContainer,
          borderWidth: 1,
          borderColor: colors.outlineVariant,
        }}
      >
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.surfaceContainerHighest,
          }}
        >
          <Ionicons name="refresh-circle" size={32} color={colors.primary} />
        </View>
        <Text selectable style={{ ...typography.headlineMd, color: colors.onSurface, textAlign: 'center' }}>
          {formatMessage({ tr: 'Küçük bir aksilik oldu', en: 'Something went wrong' })}
        </Text>
        <Text selectable style={{ ...typography.bodyMd, color: colors.onSurfaceVariant, textAlign: 'center' }}>
          {formatMessage({ tr: 'Ekran beklenmedik biçimde durdu. Yerel kayıtlarına dokunmadan ekranı yeniden deneyebilirsin.', en: 'The screen stopped unexpectedly. You can try again without affecting your local data.' })}
        </Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={formatMessage({ tr: 'Ekranı yeniden dene', en: 'Retry screen' })}
          activeOpacity={0.84}
          onPress={retry}
          style={{
            minHeight: 48,
            marginTop: 4,
            borderRadius: 14,
            borderCurve: 'continuous',
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: colors.primary,
          }}
        >
          <Ionicons name="reload" size={18} color={colors.onPrimary} />
          <Text style={{ ...typography.labelMd, color: colors.onPrimary }}>{formatMessage({ tr: 'Tekrar dene', en: 'Try again' })}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
