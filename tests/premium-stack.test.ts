import { describe, expect, it } from 'vitest';
import { ANALYTICS_EVENTS } from '@/config/analyticsEvents';
import { PREMIUM_ENTITLEMENT_ID, PREMIUM_FEATURE_KEYS, premiumPackagePriority } from '@/config/premium';
import { buildPrompt, getPromptSchema } from '@/services/ai/promptRegistry';

describe('premium stack configuration', () => {
  it('exposes the default premium entitlement and package priority', () => {
    expect(PREMIUM_ENTITLEMENT_ID).toBeTruthy();
    expect(premiumPackagePriority()).toContain('$rc_annual');
    expect(premiumPackagePriority()).toContain('$rc_monthly');
  });

  it('keeps premium feature keys stable', () => {
    expect(PREMIUM_FEATURE_KEYS.foodAi).toBe('food_ai');
    expect(PREMIUM_FEATURE_KEYS.physiqueAi).toBe('physique_ai');
  });

  it('includes core analytics events', () => {
    expect(ANALYTICS_EVENTS.paywallViewed).toBe('paywall_viewed');
    expect(ANALYTICS_EVENTS.premiumPaywallViewed).toBe('premium_paywall_viewed');
    expect(ANALYTICS_EVENTS.aiQuotaBlocked).toBe('ai_quota_blocked');
    expect(ANALYTICS_EVENTS.physiqueAnalysisCompleted).toBe('physique_analysis_completed');
  });
});

describe('AI prompt registry', () => {
  it('builds strict JSON prompts', () => {
    expect(buildPrompt('food', 'tr')).toContain('saf JSON');
    expect(buildPrompt('physique', 'en')).toContain('same consenting adult');
  });

  it('exposes JSON schemas for supported AI flows', () => {
    const foodSchema = getPromptSchema('food') as { properties?: Record<string, unknown> };
    const physiqueSchema = getPromptSchema('physique') as { properties?: Record<string, unknown> };

    expect(foodSchema.properties?.kalori).toBeTruthy();
    expect(physiqueSchema.properties?.tahminiYagOrani).toBeTruthy();
  });
});
