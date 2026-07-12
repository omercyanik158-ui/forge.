import { createDynamicStyles, typography, useAppTheme } from "@/theme";
import Svg, { Circle } from "react-native-svg";
import { View, Text } from "react-native";

type ProgressRingProps = {
  size?: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  centerValue: string;
  centerLabel?: string;
};

export function ProgressRing({
  size = 224,
  strokeWidth = 12,
  progress,
  color,
  centerValue,
  centerLabel,
}: ProgressRingProps) {
  const { colors } = useAppTheme();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.ringSvg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceContainerHighest}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color ?? colors.primary}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.center}>
        <Text
          style={[
            typography.statsNumber,
            styles.value,
            { color: colors.onSurface },
          ]}
        >
          {centerValue}
        </Text>
        {centerLabel ? (
          <Text
            style={[
              typography.labelCaps,
              styles.label,
              { color: colors.onSurfaceVariant },
            ]}
          >
            {centerLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  wrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  ringSvg: {
    position: "absolute",
    top: 0,
    left: 0,
    transform: [{ rotate: "-90deg" }],
  },
  center: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    textAlign: "center",
  },
  label: {
    marginTop: 4,
    textAlign: "center",
  },
}));
