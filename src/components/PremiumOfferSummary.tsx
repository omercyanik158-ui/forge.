import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { getPremiumMarketSnapshot } from "@/services/market";
import {
  createDynamicStyles,
  radius,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import { useAppLocalization } from "@/providers/localization-context";
import type { PremiumPackageOption } from "@/services/purchaseService";

export function PremiumOfferSummary({
  compact = false,
  packages = [],
  selectedIdentifier,
  onSelect,
}: {
  compact?: boolean;
  packages?: PremiumPackageOption[];
  selectedIdentifier?: string;
  onSelect?: (identifier: string) => void;
}) {
  const { colors } = useAppTheme();
  const { resolved } = useAppLocalization();
  const offer = getPremiumMarketSnapshot(resolved);
  const monthlyPackage = packages.find((item) => item.plan === "monthly");
  const annualPackage = packages.find((item) => item.plan === "annual");

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      <View style={styles.planRow}>
        <PlanCard
          title={offer.monthly.title}
          priceLabel={monthlyPackage?.priceLabel || offer.monthly.priceLabel}
          sublabel={offer.monthly.sublabel}
          compact={compact}
          selected={selectedIdentifier === monthlyPackage?.identifier}
          onPress={
            monthlyPackage && onSelect
              ? () => onSelect(monthlyPackage.identifier)
              : undefined
          }
        />
        <PlanCard
          title={offer.annual.title}
          priceLabel={annualPackage?.priceLabel || offer.annual.priceLabel}
          sublabel={offer.annual.sublabel}
          badge={offer.annual.badge}
          highlight
          compact={compact}
          selected={selectedIdentifier === annualPackage?.identifier}
          onPress={
            annualPackage && onSelect
              ? () => onSelect(annualPackage.identifier)
              : undefined
          }
        />
      </View>
      <View
        style={[
          styles.messageRow,
          { backgroundColor: colors.surfaceContainerHighest },
        ]}
      >
        <Ionicons name="sparkles-outline" size={15} color={colors.secondary} />
        <Text style={[styles.messageText, { color: colors.onSurfaceVariant }]}>
          {compact ? offer.valueComparison : offer.reassurance}
        </Text>
      </View>
    </View>
  );
}

function PlanCard({
  title,
  priceLabel,
  sublabel,
  badge,
  highlight = false,
  compact = false,
  selected = false,
  onPress,
}: {
  title: string;
  priceLabel: string;
  sublabel: string;
  badge?: string;
  highlight?: boolean;
  compact?: boolean;
  selected?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      accessibilityRole={onPress ? "radio" : undefined}
      accessibilityState={onPress ? { selected } : undefined}
      disabled={!onPress}
      activeOpacity={0.82}
      onPress={onPress}
      style={[
        styles.planCard,
        compact && styles.planCardCompact,
        {
          backgroundColor: highlight
            ? colors.secondaryContainer
            : colors.surfaceContainerLow,
          borderColor: selected
            ? colors.primary
            : highlight
              ? `${colors.secondary}4A`
              : colors.outlineVariant,
          borderWidth: selected ? 2 : 1,
        },
      ]}
    >
      {badge ? (
        <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.badgeText, { color: colors.onSecondary }]}>
            {badge}
          </Text>
        </View>
      ) : null}
      <Text style={[styles.planTitle, { color: colors.onSurface }]}>
        {title}
      </Text>
      <Text style={[styles.planPrice, { color: colors.onSurface }]}>
        {priceLabel}
      </Text>
      <Text style={[styles.planSublabel, { color: colors.onSurfaceVariant }]}>
        {sublabel}
      </Text>
      {selected ? (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={colors.primary}
          style={styles.selectionIcon}
        />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = createDynamicStyles(() => ({
  container: {
    gap: spacing.sm,
  },
  containerCompact: {
    gap: spacing.xs,
  },
  planRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  planCard: {
    flex: 1,
    minHeight: 122,
    borderRadius: radius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.smPlus,
    paddingVertical: spacing.sm,
    justifyContent: "space-between",
    gap: 6,
  },
  planCardCompact: {
    minHeight: 108,
    paddingVertical: spacing.sm,
  },
  badge: {
    alignSelf: "flex-start",
    minHeight: 22,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    justifyContent: "center",
  },
  badgeText: {
    ...typography.buttonSm,
  },
  planTitle: {
    ...typography.labelMd,
  },
  planPrice: {
    ...typography.numericLg,
  },
  planSublabel: {
    ...typography.bodySm,
    lineHeight: 17,
  },
  selectionIcon: {
    position: "absolute",
    right: spacing.sm,
    bottom: spacing.sm,
  },
  messageRow: {
    minHeight: 40,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  messageText: {
    ...typography.bodyXs,
    flex: 1,
  },
}));
