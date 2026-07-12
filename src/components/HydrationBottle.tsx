import { Text, View } from 'react-native';
import { useAppTheme } from '@/theme';

export function HydrationBottle({ progress, size = 92 }: { progress: number; size?: number }) {
  const { colors } = useAppTheme();
  const percentage = Math.max(0, Math.min(Math.round(progress), 100));
  const bodyHeight = Math.round(size * 1.02);

  return (
    <View accessibilityLabel={`Damacana yüzde ${percentage} dolu`} style={{ width: size, alignItems: 'center' }}>
      <View style={{ width: size * 0.28, height: size * 0.09, borderRadius: 4, backgroundColor: colors.secondary }} />
      <View style={{ width: size * 0.38, height: size * 0.16, borderTopLeftRadius: 8, borderTopRightRadius: 8, borderWidth: 3, borderBottomWidth: 0, borderColor: colors.outline, backgroundColor: colors.surfaceContainerLowest }} />
      <View
        style={{
          width: size,
          height: bodyHeight,
          borderRadius: size * 0.24,
          borderTopLeftRadius: size * 0.17,
          borderTopRightRadius: size * 0.17,
          borderWidth: 3,
          borderColor: colors.outline,
          backgroundColor: colors.surfaceContainerLowest,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: `${percentage}%`,
            backgroundColor: colors.secondary,
            opacity: 0.86,
          }}
        >
          {percentage > 4 ? <View style={{ height: 5, marginTop: -2, borderRadius: 999, backgroundColor: colors.whiteAlpha20 }} /> : null}
        </View>
        <View style={{ position: 'absolute', top: size * 0.12, right: size * 0.12, width: size * 0.26, height: size * 0.3, borderRadius: 999, borderWidth: 4, borderColor: colors.outlineVariant, opacity: 0.8 }} />
        <View style={{ minWidth: size * 0.48, minHeight: size * 0.28, borderRadius: size * 0.12, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 }}>
          <Text style={{ color: colors.onSurface, fontFamily: 'Montserrat_700Bold', fontSize: Math.max(12, size * 0.16), fontVariant: ['tabular-nums'] }}>%{percentage}</Text>
        </View>
      </View>
    </View>
  );
}
