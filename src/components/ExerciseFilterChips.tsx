import { createDynamicStyles, typography, useAppTheme } from '@/theme';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { repairText } from '@/services/textUtils';
import type { ExerciseFilter } from '@/types';

const FILTERS: ExerciseFilter[] = ['Tümü', 'Favoriler', 'Göğüs', 'Sırt', 'Omuz', 'Bacak', 'Kol', 'Karın'];

type ExerciseFilterChipsProps = {
  selected: ExerciseFilter;
  onSelect: (filter: ExerciseFilter) => void;
};

export function ExerciseFilterChips({ selected, onSelect }: ExerciseFilterChipsProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {FILTERS.map((filter) => {
          const active = filter === selected;

          return (
            <TouchableOpacity
              key={filter}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={repairText(filter)}
              activeOpacity={0.8}
              onPress={() => onSelect(filter)}
              style={[
                styles.chip,
                { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow },
                active && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text style={[styles.label, { color: active ? colors.onSecondary : colors.onSurfaceVariant }]}>
                {repairText(filter)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  wrapper: { marginHorizontal: -4 },
  content: { paddingHorizontal: 4, gap: 10 },
  chip: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.labelMd,
  },
}));
