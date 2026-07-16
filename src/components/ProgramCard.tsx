import { Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createDynamicStyles, radius, spacing, typography, useAppTheme, shadowStyle } from "@/theme";

export type ProgramCardType = "ai" | "custom" | "library";
export type ProgramCardBadgeTone = "ai" | "premium";

export interface ProgramCardProps {
  type: ProgramCardType;
  title: string;
  subtitle: string;
  insight?: string;
  icon?: string;
  color: string;
  onPress: () => void;
  selected?: boolean;
  badgeLabel?: string;
  badgeTone?: ProgramCardBadgeTone;
  secondaryActionIcon?: keyof typeof Ionicons.glyphMap;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function ProgramCard({
  type,
  title,
  subtitle,
  insight,
  icon,
  color,
  onPress,
  selected = false,
  badgeLabel,
  badgeTone,
  secondaryActionIcon,
  secondaryActionLabel,
  onSecondaryAction,
}: ProgramCardProps) {
  const { colors } = useAppTheme();
  const styles = createDynamicStyles(() => dynamicStyles);

  const iconName = icon || (type === "ai" ? "sparkles-outline" : type === "custom" ? "barbell-outline" : "arrow-down-outline");
  const badgeBackground = badgeTone === "ai" ? colors.primary : badgeTone === "premium" ? colors.secondary : "rgba(255,255,255,0.88)";
  const badgeTextColor = badgeTone === "ai" ? colors.onPrimary : badgeTone === "premium" ? colors.onSecondary : colors.onSurface;

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: selected ? colors.primary : colors.outlineVariant,
          borderWidth: selected ? 2 : 1,
        },
        selected && shadowStyle("lg"),
      ]}
    >
      {/* Visual Header */}
      <View style={[styles.visual, { backgroundColor: color }]}>
        <Ionicons name={iconName as any} size={28} color={colors.whiteAlpha60} />
      </View>

      {/* Badge */}
      {badgeLabel ? (
        <View style={[styles.badge, { backgroundColor: badgeBackground }]}>
          <Text style={[styles.badgeText, { color: badgeTextColor }]}>
            {badgeLabel}
          </Text>
        </View>
      ) : null}

      {/* Selection Indicator */}
      {selected && (
        <View style={[styles.selectionIndicator, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={16} color={colors.white} />
        </View>
      )}

      {onSecondaryAction && secondaryActionIcon ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={secondaryActionLabel}
          activeOpacity={0.78}
          onPress={(event) => {
            event.stopPropagation();
            onSecondaryAction();
          }}
          style={[styles.secondaryAction, { backgroundColor: colors.surface }]}
        >
          <Ionicons name={secondaryActionIcon} size={16} color={colors.primary} />
        </TouchableOpacity>
      ) : null}

      {/* Content */}
      <View style={styles.content}>
        <Text numberOfLines={2} style={[styles.title, { color: colors.onSurface }]}>
          {title}
        </Text>
        <Text numberOfLines={1} style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
          {subtitle}
        </Text>
        {insight ? (
          <View style={[styles.insightPill, { backgroundColor: `${colors.primary}12` }]}>
            <Ionicons name="sparkles-outline" size={12} color={colors.primary} />
            <Text numberOfLines={1} style={[styles.insightText, { color: colors.primary }]}>
              {insight}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const dynamicStyles = {
  card: {
    width: 228,
    borderRadius: radius["3xl"],
    overflow: "hidden" as const,
  },
  visual: {
    height: 108,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  badge: {
    position: "absolute" as const,
    top: spacing.sm,
    right: spacing.sm,
    minHeight: 24,
    paddingHorizontal: spacing.xs + 2,
    borderRadius: radius.full,
    justifyContent: "center" as const,
  },
  badgeText: {
    ...typography.labelXs,
  },
  selectionIndicator: {
    position: "absolute" as const,
    top: spacing.md,
    left: spacing.md,
    width: 28,
    height: 28,
    borderRadius: radius.lg,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  secondaryAction: {
    position: "absolute" as const,
    top: spacing.sm,
    left: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  content: {
    padding: spacing.md,
    gap: 4,
  },
  title: {
    ...typography.cardTitle,
  },
  subtitle: {
    ...typography.bodySm,
  },
  insightPill: {
    minHeight: 26,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs + 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  insightText: {
    ...typography.labelXs,
    flex: 1,
  },
} as const;
