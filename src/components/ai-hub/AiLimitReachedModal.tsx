import Ionicons from '@expo/vector-icons/Ionicons';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { buildAiLimitModalModel } from '@/services/aiLimitModalModel';
import type { AIQuotaDecision } from '@/services/aiQuotaGate';
import { GlassCard } from '@/components/GlassCard';
import { createDynamicStyles, typography, useAppTheme, shadowStyle, spacing } from '@/theme';
import type { RewardedCreditType } from '@/config/rewardedAds';

export function AiLimitReachedModal({
  visible,
  creditType,
  decision,
  title,
  body,
  dailyCapBody,
  unavailableBody,
  primaryLabel,
  secondaryLabel,
  loading,
  feedback,
  onClose,
  onUpgrade,
  onWatchAd,
}: {
  visible: boolean;
  creditType: RewardedCreditType;
  decision: AIQuotaDecision;
  title: string;
  body: string;
  dailyCapBody: string;
  unavailableBody: string;
  primaryLabel: string;
  secondaryLabel: string;
  loading: boolean;
  feedback?: string;
  onClose: () => void;
  onUpgrade: () => void;
  onWatchAd: () => void;
}) {
  const { colors } = useAppTheme();
  const model = buildAiLimitModalModel(creditType, decision);
  const resolvedBody = model.blockedReason === 'daily_cap_reached'
    ? dailyCapBody
    : model.blockedReason === 'ads_unavailable'
      ? unavailableBody
      : body;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable>
          <GlassCard variant="panel" style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant, ...shadowStyle('floating') }]}>
            <View style={[styles.iconWrap, { backgroundColor: `${colors.secondary}16` }]}>
              <Ionicons name="sparkles-outline" size={24} color={colors.secondary} />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.title, { color: colors.onSurface }]}>{title}</Text>
              <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>{resolvedBody}</Text>
              {feedback ? <Text style={[styles.feedback, { color: colors.secondary }]}>{feedback}</Text> : null}
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={primaryLabel}
              activeOpacity={0.85}
              onPress={onUpgrade}
              style={[styles.primaryButton, { backgroundColor: colors.secondary }]}
            >
              <Text style={[styles.primaryButtonText, { color: colors.onSecondary }]}>{primaryLabel}</Text>
            </TouchableOpacity>

            {model.showRewardedCta ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={secondaryLabel}
                activeOpacity={0.85}
                disabled={loading}
                onPress={onWatchAd}
                style={[styles.secondaryButton, { borderColor: colors.outlineVariant, backgroundColor: colors.surfaceContainerLow, opacity: loading ? 0.6 : 1 }]}
              >
                <Ionicons name="play-circle-outline" size={18} color={colors.onSurface} />
                <Text style={[styles.secondaryButtonText, { color: colors.onSurface }]}>{secondaryLabel}</Text>
              </TouchableOpacity>
            ) : null}
          </GlassCard>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = createDynamicStyles(() => ({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 18, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: spacing.xl,
    gap: 16,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: 6,
  },
  title: {
    ...typography.headlineMd,
    fontSize: 22,
    lineHeight: 28,
  },
  body: {
    ...typography.bodySm,
    lineHeight: 20,
  },
  feedback: {
    ...typography.bodySm,
    lineHeight: 19,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    ...typography.labelMd,
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    ...typography.labelMd,
  },
}));
