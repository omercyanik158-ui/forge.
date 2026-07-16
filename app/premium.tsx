import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassCard } from "@/components/GlassCard";
import { PremiumOfferSummary } from "@/components/PremiumOfferSummary";
import { clientConfig } from "@/config/clientConfig";
import { getPremiumMarketSnapshot } from "@/services/market";
import { safeGoBack } from "@/services/navigation";
import { loadProfile } from "@/services/profileStore";
import {
  isPremium,
  listPremiumFeatures,
  setSubscriptionTier,
} from "@/services/subscription";
import {
  loadPremiumPackages,
  purchasePremium,
  restorePremiumPurchases,
  type PremiumPackageOption,
} from "@/services/purchaseService";
import { useAppLocalization } from "@/providers/localization-context";
import {
  ANALYTICS_EVENTS,
  trackEvent,
  trackScreen,
} from "@/services/analyticsService";
import {
  createDynamicStyles,
  layout,
  radius,
  shadowStyle,
  spacing,
  typography,
  useAppTheme,
} from "@/theme";
import type { UserProfile } from "@/types";

const TERMS_URL = clientConfig.legal.termsUrl;
const PRIVACY_URL = clientConfig.legal.privacyUrl;

async function openLegalUrl(url: string): Promise<void> {
  const supported = await Linking.canOpenURL(url);
  if (supported) await Linking.openURL(url);
}

export default function PremiumScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors: themeColors } = useAppTheme();
  const { t, resolved } = useAppLocalization();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [packages, setPackages] = useState<PremiumPackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const offer = getPremiumMarketSnapshot(resolved);
  const premium = isPremium(profile);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [nextProfile, nextPackages] = await Promise.all([
        loadProfile(),
        loadPremiumPackages(),
      ]);
      setProfile(nextProfile);
      setPackages(nextPackages);
      setSelectedPackage(
        (current) =>
          current ??
          nextPackages.find((item) => item.plan === "annual")?.identifier ??
          nextPackages[0]?.identifier,
      );
      void trackEvent(
        isPremium(nextProfile)
          ? ANALYTICS_EVENTS.premiumEntitlementActive
          : ANALYTICS_EVENTS.premiumEntitlementMissing,
        {
          source: "premium_screen_refresh",
        },
      );
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void trackScreen("premium_screen", {
        source: "premium",
        premiumActive: premium,
      });
      void trackEvent(ANALYTICS_EVENTS.paywallViewed, {
        source: "premium_screen",
        premiumActive: premium,
      });
      void trackEvent(ANALYTICS_EVENTS.premiumPaywallViewed, {
        source: "premium_screen",
        premiumActive: premium,
      });
    }, [premium, refresh]),
  );

  const togglePreview = async () => {
    const nextTier = premium ? "free" : "premium";
    await setSubscriptionTier(nextTier);
    setProfile((current) =>
      current ? { ...current, subscription: nextTier } : current,
    );
  };

  const handlePurchase = async () => {
    if (purchaseLoading || restoreLoading) return;
    setPurchaseLoading(true);
    try {
      void trackEvent(ANALYTICS_EVENTS.paywallCtaTapped, {
        selectedPackage: selectedPackage ?? "none",
        premiumActive: premium,
      });
      void trackEvent(ANALYTICS_EVENTS.premiumPurchaseStarted, {
        selectedPackage: selectedPackage ?? "none",
        premiumActive: premium,
      });
      const result = await purchasePremium(selectedPackage);
      void trackEvent(
        result.status === "success"
          ? ANALYTICS_EVENTS.purchaseCompleted
          : result.status === "cancelled"
            ? ANALYTICS_EVENTS.purchaseCancelled
            : ANALYTICS_EVENTS.purchaseFailed,
        {
          selectedPackage: selectedPackage ?? "none",
          status: result.status,
        },
      );
      void trackEvent(
        result.status === "success"
          ? ANALYTICS_EVENTS.premiumPurchaseCompleted
          : result.status === "cancelled"
            ? ANALYTICS_EVENTS.premiumPurchaseCancelled
            : ANALYTICS_EVENTS.premiumPurchaseFailed,
        {
          selectedPackage: selectedPackage ?? "none",
          status: result.status,
        },
      );
      Alert.alert(
        result.status === "success"
          ? t("premium.status_active")
          : result.status === "cancelled"
            ? t("premium.status_cancelled")
            : t("premium.status_label"),
        result.message,
      );
      await refresh();
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleRestore = async () => {
    if (restoreLoading || purchaseLoading) return;
    setRestoreLoading(true);
    try {
      void trackEvent(ANALYTICS_EVENTS.premiumRestoreStarted, {
        source: "premium_screen",
      });
      const result = await restorePremiumPurchases();
      if (result.status === "success") {
        void trackEvent(ANALYTICS_EVENTS.purchaseRestored, {
          source: "premium_screen",
        });
        void trackEvent(ANALYTICS_EVENTS.premiumRestoreCompleted, {
          source: "premium_screen",
        });
      } else {
        void trackEvent(ANALYTICS_EVENTS.premiumRestoreFailed, {
          source: "premium_screen",
          status: result.status,
        });
      }
      Alert.alert(
        result.status === "success"
          ? t("premium.restore_success")
          : t("premium.restore_status"),
        result.message,
      );
      await refresh();
    } finally {
      setRestoreLoading(false);
    }
  };

  const busy = purchaseLoading || restoreLoading;

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 8,
            backgroundColor: themeColors.overlay,
            borderBottomColor: themeColors.outlineVariant,
          },
        ]}
      >
        <View style={styles.headerCopy}>
          <Text
            style={[styles.headerEyebrow, { color: themeColors.secondary }]}
          >
            {t("premium.eyebrow")}
          </Text>
          <Text style={[styles.headerTitle, { color: themeColors.onSurface }]}>
            {t("premium.header_title")}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("premium.close")}
          onPress={() => safeGoBack(router)}
          activeOpacity={0.75}
          style={[
            styles.closeButton,
            { backgroundColor: themeColors.surfaceContainer },
          ]}
        >
          <Ionicons name="close" size={21} color={themeColors.onSurface} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 124, paddingBottom: insets.bottom + 126 },
        ]}
      >
        <GlassCard style={styles.heroCard}>
          <View
            style={[
              styles.heroIcon,
              { backgroundColor: `${themeColors.secondary}24` },
            ]}
          >
            <Ionicons name="sparkles" size={24} color={themeColors.secondary} />
          </View>
          <Text style={[styles.heroTitle, { color: themeColors.onSurface }]}>
            {offer.heroTitle}
          </Text>
          <Text
            style={[styles.heroBody, { color: themeColors.onSurfaceVariant }]}
          >
            {offer.heroBody}
          </Text>
        </GlassCard>

        <PremiumOfferSummary
          packages={packages}
          selectedIdentifier={selectedPackage}
          onSelect={setSelectedPackage}
        />

        <GlassCard variant="panel" style={styles.featureCard}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>
            {t("premium.section_title")}
          </Text>
          <View style={styles.featureList}>
            {listPremiumFeatures().map((feature) => (
              <View key={feature.key} style={styles.featureRow}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: `${themeColors.success}1F` },
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={themeColors.success}
                  />
                </View>
                <View style={styles.featureCopy}>
                  <Text
                    style={[
                      styles.featureTitle,
                      { color: themeColors.onSurface },
                    ]}
                  >
                    {feature.title}
                  </Text>
                  <Text
                    style={[
                      styles.featureBody,
                      { color: themeColors.onSurfaceVariant },
                    ]}
                  >
                    {feature.summary}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </GlassCard>

        <GlassCard variant="panel" style={styles.reliabilityCard}>
          <Text style={[styles.sectionTitle, { color: themeColors.onSurface }]}>
            {t("premium.reliability_title")}
          </Text>
          <View style={styles.featureList}>
            <ReliabilityRow
              icon="checkmark-circle-outline"
              title={
                premium
                  ? t("premium.reliability_active_title")
                  : t("premium.reliability_safe_title")
              }
              body={
                premium
                  ? t("premium.reliability_active_body")
                  : t("premium.reliability_safe_body")
              }
            />
            <ReliabilityRow
              icon="refresh-outline"
              title={t("premium.reliability_restore_title")}
              body={t("premium.reliability_restore_body")}
            />
            <ReliabilityRow
              icon="cloud-offline-outline"
              title={t("premium.reliability_network_title")}
              body={t("premium.reliability_network_body")}
            />
          </View>
          <Text
            style={[
              styles.statusFootnote,
              { color: themeColors.onSurfaceVariant },
            ]}
          >
            {refreshing
              ? t("premium.reliability_checking")
              : t("premium.reliability_footnote")}
          </Text>
        </GlassCard>

        <View
          style={[
            styles.reassurance,
            { backgroundColor: themeColors.secondaryContainer },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={themeColors.secondary}
          />
          <Text
            style={[styles.reassuranceText, { color: themeColors.onSurface }]}
          >
            {offer.reassurance}
          </Text>
        </View>
        <Text style={[styles.footnote, { color: themeColors.outline }]}>
          {offer.footnote}
        </Text>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 12,
            backgroundColor: themeColors.overlay,
            borderTopColor: themeColors.outlineVariant,
          },
        ]}
      >
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          disabled={busy}
          onPress={__DEV__ ? togglePreview : handlePurchase}
          style={[
            styles.primaryButton,
            {
              backgroundColor: premium
                ? themeColors.success
                : themeColors.primary,
              opacity: busy ? 0.64 : 1,
            },
          ]}
        >
          {purchaseLoading ? (
            <ActivityIndicator
              size="small"
              color={premium ? themeColors.onSuccess : themeColors.onPrimary}
            />
          ) : (
            <Ionicons
              name={premium ? "checkmark-circle" : "star"}
              size={19}
              color={premium ? themeColors.onSuccess : themeColors.onPrimary}
            />
          )}
          <Text
            style={[
              styles.primaryButtonText,
              {
                color: premium ? themeColors.onSuccess : themeColors.onPrimary,
              },
            ]}
          >
            {premium
              ? t("premium.status_active")
              : __DEV__
                ? t("premium.preview_enable")
                : purchaseLoading
                  ? t("premium.store_opening")
                  : t("premium.check_options")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={t("premium.restore")}
          disabled={busy}
          onPress={handleRestore}
          activeOpacity={0.75}
        >
          <Text
            style={[
              styles.footerHint,
              { color: themeColors.secondary, opacity: busy ? 0.7 : 1 },
            ]}
          >
            {restoreLoading
              ? t("premium.restore_loading")
              : t("premium.restore")}
          </Text>
        </TouchableOpacity>
        <Text
          style={[styles.footerHint, { color: themeColors.onSurfaceVariant }]}
        >
          {offer.valueComparison}
        </Text>
        <View style={styles.legalRow}>
          {PRIVACY_URL ? (
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel={t("premium.privacy_link_label")}
              onPress={() => void openLegalUrl(PRIVACY_URL)}
            >
              <Text
                style={[styles.legalLink, { color: themeColors.secondary }]}
              >
                {t("premium.privacy_link_text")}
              </Text>
            </TouchableOpacity>
          ) : null}
          {TERMS_URL ? (
            <TouchableOpacity
              accessibilityRole="link"
              accessibilityLabel={t("premium.terms_link_label")}
              onPress={() => void openLegalUrl(TERMS_URL)}
            >
              <Text
                style={[styles.legalLink, { color: themeColors.secondary }]}
              >
                {t("premium.terms_link_text")}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function ReliabilityRow({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  const { colors: themeColors } = useAppTheme();

  return (
    <View style={styles.featureRow}>
      <View
        style={[
          styles.featureIcon,
          { backgroundColor: `${themeColors.secondary}1A` },
        ]}
      >
        <Ionicons name={icon} size={16} color={themeColors.secondary} />
      </View>
      <View style={styles.featureCopy}>
        <Text style={[styles.featureTitle, { color: themeColors.onSurface }]}>
          {title}
        </Text>
        <Text
          style={[styles.featureBody, { color: themeColors.onSurfaceVariant }]}
        >
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = createDynamicStyles(() => ({
  container: { flex: 1 },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    minHeight: 100,
    paddingHorizontal: spacing.containerMargin,
    paddingBottom: spacing.smPlus,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.smPlus,
  },
  headerCopy: { flex: 1, gap: 3, maxWidth: layout.maxContentWidth - 80 },
  headerEyebrow: { ...typography.labelCaps },
  headerTitle: { ...typography.screenTitle },
  closeButton: {
    width: 46,
    height: 46,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    ...shadowStyle("sm"),
  },
  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center",
    paddingHorizontal: spacing.containerMargin,
    gap: spacing.sectionGap,
  },
  heroCard: { padding: spacing.xl, gap: spacing.sm },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius["2xl"],
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { ...typography.displayLgMobile },
  heroBody: { ...typography.bodyLg },
  featureCard: { padding: spacing.lg, gap: spacing.mdPlus },
  reliabilityCard: { padding: spacing.lg, gap: spacing.mdPlus },
  sectionTitle: { ...typography.sectionTitle },
  featureList: { gap: spacing.md },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  featureIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  featureCopy: { flex: 1, gap: 4 },
  featureTitle: { ...typography.labelMd },
  featureBody: { ...typography.bodySm },
  statusFootnote: { ...typography.bodySm },
  reassurance: {
    minHeight: 56,
    borderRadius: radius["2xl"],
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
  },
  reassuranceText: { ...typography.labelMd, flex: 1 },
  footnote: {
    ...typography.bodyXs,
    textAlign: "center",
    paddingHorizontal: spacing.sm,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: spacing.containerMargin,
    paddingTop: spacing.smPlus,
    gap: spacing.xs,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius["2xl"],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    ...shadowStyle("md"),
  },
  primaryButtonText: { ...typography.buttonLg },
  footerHint: { ...typography.bodyXs, textAlign: "center" },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.mdPlus,
    paddingTop: 4,
  },
  legalLink: { ...typography.bodyXs, textDecorationLine: "underline" },
}));
