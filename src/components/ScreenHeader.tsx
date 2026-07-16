import type { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppLocalization } from "@/providers/localization-context";
import { safeGoBack } from "@/services/navigation";
import { repairText } from "@/services/textUtils";
import {
  createDynamicStyles,
  layout,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";

export function ScreenHeader({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top,
          backgroundColor: colors.overlay,
          borderBottomColor: colors.overlayBorder,
        },
      ]}
    >
      <View style={styles.inner}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t({ tr: "Geri dön", en: "Go back" })}
          onPress={() => safeGoBack(router)}
          activeOpacity={0.7}
          style={[
            styles.sideButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant,
            },
          ]}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: colors.onSurface }]}
        >
          {repairText(title)}
        </Text>
        {right ? (
          <View
            style={[
              styles.sideButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.outlineVariant,
              },
            ]}
          >
            {right}
          </View>
        ) : (
          <View style={styles.sideButtonPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    borderBottomWidth: 1,
  },
  inner: {
    width: "100%",
    maxWidth: layout.maxHeaderWidth,
    alignSelf: "center",
    minHeight: 68,
    paddingHorizontal: spacing.containerMargin,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sideButton: {
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle("sm"),
  },
  sideButtonPlaceholder: { width: 44, height: 44 },
  title: { ...typography.screenTitle, flex: 1, textAlign: "center" },
}));
