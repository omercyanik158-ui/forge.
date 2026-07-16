import Ionicons from "@expo/vector-icons/Ionicons";
import { TouchableOpacity, View, Text } from "react-native";
import { GlassCard } from "@/components/GlassCard";
import {
  createDynamicStyles,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";

export function PremiumFeatureCard({
  title,
  body,
  ctaLabel,
  note,
  onPress,
}: {
  title: string;
  body: string;
  ctaLabel: string;
  note?: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <GlassCard
      variant="panel"
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceContainerLow,
          borderColor: colors.outlineVariant,
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[styles.glow, { backgroundColor: `${colors.secondary}18` }]}
      />
      <View
        style={[
          styles.badge,
          {
            backgroundColor: `${colors.secondary}12`,
            borderColor: `${colors.secondary}22`,
          },
        ]}
      >
        <Ionicons name="diamond-outline" size={12} color={colors.secondary} />
        <Text style={[styles.badgeText, { color: colors.secondary }]}>
          PREMIUM
        </Text>
      </View>
      <View style={styles.content}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: `${colors.secondary}14` },
          ]}
        >
          <Ionicons name="star-outline" size={18} color={colors.secondary} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {title}
          </Text>
          <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>
            {body}
          </Text>
          {note ? (
            <Text style={[styles.note, { color: colors.secondary }]}>
              {note}
            </Text>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
        activeOpacity={0.85}
        onPress={onPress}
        style={[styles.button, { backgroundColor: colors.secondary }]}
      >
        <Text style={[styles.buttonText, { color: colors.onSecondary }]}>
          {ctaLabel}
        </Text>
        <Ionicons name="arrow-forward" size={15} color={colors.onSecondary} />
      </TouchableOpacity>
    </GlassCard>
  );
}

const styles = createDynamicStyles(() => ({
  card: {
    padding: spacing.cardPadding,
    gap: spacing.smPlus,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    width: 124,
    height: 124,
    borderRadius: 62,
    right: -42,
    top: -42,
    opacity: 0.75,
  },
  badge: {
    alignSelf: "flex-start",
    minHeight: 26,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs + 2,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs - 2,
    zIndex: 1,
  },
  badgeText: { ...typography.labelCaps },
  content: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    zIndex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, gap: spacing.xs - 4 },
  title: { ...typography.cardTitle },
  body: { ...typography.bodySm },
  note: { ...typography.bodyXs },
  button: {
    minHeight: 46,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs - 2,
    ...shadowStyle("sm"),
  },
  buttonText: { ...typography.buttonLg },
}));
