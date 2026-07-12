import { createDynamicStyles, radius, shadowStyle, useAppTheme } from "@/theme";
import { Platform, StyleSheet, View, type ViewProps } from "react-native";
import { BlurView } from "expo-blur";

type GlassCardProps = ViewProps & {
  variant?: "glass" | "panel";
};

export function GlassCard({
  style,
  variant = "glass",
  children,
  ...props
}: GlassCardProps) {
  const { colors, mode } = useAppTheme();
  const blurIntensity = mode === "dark" ? 14 : 16;
  const blurTint =
    mode === "dark" ? "systemThinMaterialDark" : "systemThinMaterialLight";

  const isIOSBlur = Platform.OS === "ios";
  const androidBg =
    mode === "dark" ? "rgba(22, 28, 36, 0.94)" : "rgba(248, 249, 251, 0.96)";
  const glassBackground = isIOSBlur
    ? mode === "dark"
      ? "rgba(16, 22, 29, 0.72)"
      : colors.overlay
    : androidBg;
  const glassBorder = colors.overlayBorder;

  if (variant === "panel") {
    return (
      <View
        style={[
          styles.panel,
          {
            backgroundColor: colors.surface,
            borderColor: colors.outlineVariant,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.glassWrapper,
        {
          backgroundColor: glassBackground,
          borderColor: glassBorder,
        },
        style,
      ]}
      {...props}
    >
      {isIOSBlur ? (
        <BlurView
          intensity={blurIntensity}
          tint={blurTint}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: androidBg }]} />
      )}
      <View style={styles.glassContent}>{children}</View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  glassWrapper: {
    overflow: "hidden",
    borderRadius: radius["3xl"],
    borderWidth: 1,
    ...shadowStyle("md"),
  },
  glassContent: {
    position: "relative",
    zIndex: 1,
    width: "100%",
  },
  panel: {
    borderRadius: radius["3xl"],
    borderWidth: 1,
    ...shadowStyle("sm"),
  },
}));
