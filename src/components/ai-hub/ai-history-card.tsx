import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import { formatDate } from '@/services/localization';
import { createDynamicStyles, typography, useAppTheme } from '@/theme';
import type { AIHubLog } from '@/types/aiHub';

type Props = {
  log: AIHubLog;
  localeLabel: (messages: { tr: string; en: string }) => string;
  comparison?: string;
  onDelete: (log: AIHubLog) => void;
};

export function AIHistoryCard({ log, localeLabel, comparison, onDelete }: Props) {
  const { colors } = useAppTheme();
  const title = log.type === 'food' ? log.result.yemekAdi : localeLabel({ tr: 'Fizik analizi', en: 'Physique analysis' });
  const detail = log.type === 'food'
    ? `${Math.round(log.result.kalori)} kcal · ${Math.round(log.result.protein)} g ${localeLabel({ tr: 'protein', en: 'protein' })}`
    : `${log.result.tahminiYagOrani}% · ${log.result.eksikBolgeler.slice(0, 2).join(', ') || localeLabel({ tr: 'Genel değerlendirme', en: 'General review' })}`;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
      {log.primaryImageUri ? (
        <Image source={{ uri: log.primaryImageUri }} style={styles.image} contentFit="cover" transition={140} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: colors.surfaceContainerLow }]}>
          <Ionicons name={log.type === 'food' ? 'restaurant-outline' : 'body-outline'} size={25} color={colors.secondary} />
        </View>
      )}
      <View style={styles.copy}>
        <Text numberOfLines={1} style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
        <Text style={[styles.detail, { color: colors.onSurfaceVariant }]}>{detail}</Text>
        <Text style={[styles.date, { color: colors.outline }]}>
          {formatDate(log.createdAt, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </Text>
        {comparison ? <Text style={[styles.comparison, { color: colors.secondary }]}>{comparison}</Text> : null}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={localeLabel({ tr: 'Kaydı sil', en: 'Delete entry' })}
        hitSlop={8}
        onPress={() => onDelete(log)}
        style={({ pressed }) => [styles.deleteButton, { backgroundColor: colors.surfaceContainerLow }, pressed && styles.pressed]}
      >
        <Ionicons name="trash-outline" size={17} color={colors.error} />
      </Pressable>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  card: { minHeight: 108, borderRadius: 16, borderWidth: 1, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  image: { width: 84, height: 88, borderRadius: 12 },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 2 },
  title: { ...typography.labelMd },
  detail: { ...typography.bodySm },
  date: { ...typography.labelXs },
  comparison: { ...typography.bodySm, lineHeight: 17, paddingTop: 3 },
  deleteButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
}));
