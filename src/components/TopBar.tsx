import {
  createDynamicStyles,
  layout,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppLocalization } from "@/providers/localization-context";
import { repairText } from "@/services/textUtils";

type TopBarProps = {
  title?: string;
  showAvatar?: boolean;
  showAction?: boolean;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  actionAccessibilityLabel?: string;
  onActionPress?: () => void;
};

export function TopBar({
  title = "FORGE",
  showAvatar = false,
  showAction = false,
  actionIcon = "options-outline",
  actionAccessibilityLabel,
  onActionPress,
}: TopBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useAppTheme();
  const { t } = useAppLocalization();
  const handleActionPress = onActionPress ?? (() => router.push("/settings-notifications"));

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: colors.overlay,
          borderBottomColor: colors.overlayBorder,
        },
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.leftSlot}>
          {showAvatar ? (
            <View
              style={[
                styles.avatar,
                {
                  borderColor: colors.outlineVariant,
                  backgroundColor: colors.surfaceContainerLow,
                },
              ]}
            >
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
          ) : null}
        </View>
        <Text numberOfLines={1} style={[styles.title, { color: colors.onSurface }]}>
          {repairText(title)}
        </Text>
        {showAction ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={
              actionAccessibilityLabel ?? t({ tr: "Ayarlar", en: "Open settings" })
            }
            onPress={handleActionPress}
            activeOpacity={0.7}
            style={[
              styles.actionButton,
              {
                borderColor: colors.outlineVariant,
                backgroundColor: colors.surface,
              },
            ]}
          >
            <Ionicons name={actionIcon} size={21} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.rightSlot} />
        )}
      </View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: {
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
    minHeight: 64,
    paddingHorizontal: spacing.containerMargin,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  leftSlot: {
    position: "absolute",
    left: spacing.containerMargin,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle("sm"),
  },
  title: {
    ...typography.screenTitle,
    maxWidth: "62%",
    textAlign: "center",
  },
  actionButton: {
    position: "absolute",
    right: spacing.containerMargin,
    width: 44,
    height: 44,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    ...shadowStyle("sm"),
  },
  rightSlot: {
    position: "absolute",
    right: spacing.containerMargin,
    width: 44,
    height: 44,
  },
}));
