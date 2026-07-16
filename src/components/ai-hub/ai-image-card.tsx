import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, Text, View } from 'react-native';
import { createDynamicStyles, typography, useAppTheme } from '@/theme';

type Props = {
  label: string;
  hint: string;
  uri?: string;
  aspect?: 'square' | 'portrait';
  disabled?: boolean;
  onPress: () => void;
  onRemove?: () => void;
};

export function AIImageCard({ label, hint, uri, aspect = 'square', disabled, onPress, onRemove }: Props) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        aspect === 'portrait' ? styles.portrait : styles.square,
        { backgroundColor: colors.surfaceContainerLow, borderColor: uri ? colors.primary : colors.outlineVariant },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.image} contentFit="cover" transition={180} />
          <View style={[styles.scrim, { backgroundColor: colors.blackAlpha80 }]} />
          <View style={styles.readyCopy}>
            <Ionicons name="checkmark-circle" size={22} color={colors.success} />
            <Text style={[styles.readyLabel, { color: colors.white }]}>{label}</Text>
          </View>
          {onRemove ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${label} kaldır`}
              hitSlop={8}
              onPress={(event) => {
                event.stopPropagation();
                onRemove();
              }}
              style={[styles.remove, { backgroundColor: colors.overlay }]}
            >
              <Ionicons name="close" size={17} color={colors.onSurface} />
            </Pressable>
          ) : null}
        </>
      ) : (
        <View style={styles.empty}>
          <View style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}>
            <Ionicons name="camera-outline" size={23} color={colors.secondary} />
          </View>
          <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
          <Text style={[styles.hint, { color: colors.onSurfaceVariant }]}>{hint}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = createDynamicStyles(() => ({
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  square: { minHeight: 220 },
  portrait: { minHeight: 230, flex: 1 },
  image: { position: 'absolute', inset: 0 },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 54, opacity: 0.62 },
  readyCopy: { position: 'absolute', left: 12, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 7 },
  readyLabel: { ...typography.labelMd },
  remove: { position: 'absolute', right: 10, top: 10, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, minHeight: 210, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 8 },
  icon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  label: { ...typography.labelMd, textAlign: 'center' },
  hint: { ...typography.bodySm, textAlign: 'center', lineHeight: 18 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
}));
