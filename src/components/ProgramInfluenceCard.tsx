import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import {
  createDynamicStyles,
  radius,
  spacing,
  typography,
  useAppTheme,
} from '@/theme';
import type { ProgramInfluenceSummary } from '@/types/aiProgram';

export function ProgramInfluenceCard({
  influence,
  title = 'Programa etkisi',
}: {
  influence?: ProgramInfluenceSummary;
  title?: string;
}) {
  const { colors } = useAppTheme();
  if (!influence) return null;

  const rows = [
    {
      icon: 'locate-outline' as const,
      label: 'Odak kaslar',
      value: influence.focusLabels.length > 0 ? influence.focusLabels.join(', ') : 'Dengeli gelişim',
    },
    {
      icon: 'git-branch-outline' as const,
      label: 'Program stili',
      value: influence.splitImpact,
    },
    {
      icon: 'bar-chart-outline' as const,
      label: 'Hacim yaklaşımı',
      value: influence.volumeImpact,
    },
    {
      icon: 'barbell-outline' as const,
      label: 'Hareket vurgusu',
      value: influence.exerciseEmphasis.slice(0, 3).join(', ') || 'Temel hareket dengesi korunur',
    },
  ];

  return (
    <GlassCard variant="panel" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: `${colors.secondary}18` }]}>
          <Ionicons name="sparkles-outline" size={19} color={colors.secondary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {title}
          </Text>
          <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
            Sende bunu gördük, bu yüzden programında bu alanlar yumuşak biçimde öne alınır.
          </Text>
        </View>
      </View>

      <View style={styles.rows}>
        {rows.map((row) => (
          <View key={row.label} style={[styles.row, { borderColor: colors.outlineVariant }]}>
            <View style={[styles.rowIcon, { backgroundColor: colors.surfaceContainerLow }]}>
              <Ionicons name={row.icon} size={16} color={colors.primary} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowLabel, { color: colors.onSurfaceVariant }]}>
                {row.label}
              </Text>
              <Text style={[styles.rowValue, { color: colors.onSurface }]}>
                {row.value}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={[styles.note, { color: colors.onSurfaceVariant }]}>
        {influence.explanation}
      </Text>
    </GlassCard>
  );
}

const styles = createDynamicStyles(() => ({
  card: { padding: spacing.cardPadding, gap: spacing.md },
  header: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1, gap: 4 },
  title: { ...typography.cardTitle },
  body: { ...typography.bodySm },
  rows: { gap: spacing.xs },
  row: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  rowIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: { flex: 1, gap: 2 },
  rowLabel: { ...typography.labelXs, textTransform: 'uppercase' },
  rowValue: { ...typography.bodySm },
  note: { ...typography.bodyXs },
}));
