import { createDynamicStyles, radius, useAppTheme } from "@/theme";
import { View } from "react-native";

type MacroBarProps = {
  progress: number;
  color: string;
  glowColor?: string;
  height?: number;
};

export function MacroBar({
  progress,
  color,
  glowColor,
  height = 8,
}: MacroBarProps) {
  const { colors } = useAppTheme();
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <View
      style={[
        styles.track,
        { height, backgroundColor: colors.surfaceContainerHighest },
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: color,
            ...(glowColor && clamped > 0
              ? { borderColor: glowColor, borderWidth: 1 }
              : {}),
          },
        ]}
      />
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  track: {
    width: "100%",
    borderRadius: radius.full,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
}));
