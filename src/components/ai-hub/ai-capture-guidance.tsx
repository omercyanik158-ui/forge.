import Ionicons from '@expo/vector-icons/Ionicons';
import { Text, View } from 'react-native';
import { GlassCard } from '@/components/GlassCard';
import { createDynamicStyles, typography, useAppTheme } from '@/theme';

type GuidanceTip = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

type Props = {
  title: string;
  tips: GuidanceTip[];
  accent: 'primary' | 'secondary' | 'tertiary';
};

export function AICaptureGuidance({ title, tips, accent }: Props) {
  const { colors } = useAppTheme();
  const accentColor = colors[accent];
  const accentBackground =
    accent === 'primary'
      ? colors.primaryContainer
      : accent === 'secondary'
        ? colors.secondaryContainer
        : colors.tertiaryContainer;

  return (
    <GlassCard variant="panel" style={[styles.card, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: accentBackground }]}>
          <Ionicons name="scan-outline" size={18} color={accentColor} />
        </View>
        <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
      </View>

      <View style={styles.tipList}>
        {tips.map((tip) => (
          <View key={tip.label} style={[styles.tip, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={[styles.tipIcon, { backgroundColor: `${accentColor}14` }]}>
              <Ionicons name={tip.icon} size={16} color={accentColor} />
            </View>
            <Text style={[styles.tipLabel, { color: colors.onSurfaceVariant }]}>{tip.label}</Text>
          </View>
        ))}
      </View>
    </GlassCard>
  );
}

const styles = createDynamicStyles(() => ({
  card: { padding: 14, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconWrap: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.labelMd, flex: 1 },
  tipList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tip: {
    flexBasis: '31%',
    flexGrow: 1,
    minHeight: 94,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tipIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tipLabel: { ...typography.bodySm, textAlign: 'center', lineHeight: 17 },
}));
