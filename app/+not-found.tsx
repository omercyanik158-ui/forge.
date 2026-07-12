import { createDynamicStyles, useAppTheme , colors, spacing, typography } from '@/theme';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { GlassCard } from '@/components/GlassCard';
import { useAppLocalization } from '@/providers/localization-context';

export default function NotFoundScreen() {
  useAppTheme();
  const router = useRouter();
  const { t } = useAppLocalization();

  return (
    <View style={styles.container}>
      <GlassCard variant="panel" style={styles.card}>
        <Ionicons name="compass-outline" size={40} color={colors.secondary} />
        <Text style={styles.title}>{t('migrated.not_found_001')}</Text>
        <Text style={styles.body}>{t('migrated.not_found_002')}</Text>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={t('migrated.not_found_003')} style={styles.button} onPress={() => router.replace('/')} activeOpacity={0.85}>
          <Ionicons name="home" size={18} color={colors.onPrimary} />
          <Text style={styles.buttonText}>{t('migrated.not_found_003')}</Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.containerMargin,
    justifyContent: 'center',
  },
  card: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    ...typography.headlineLgMobile,
    color: colors.onSurface,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  button: {
    marginTop: 8,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    ...typography.labelMd,
    color: colors.onPrimary,
  },
}));
