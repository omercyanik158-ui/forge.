# Premium, AI and Analytics Integration Stack

This project is now prepared for three optional production integrations. The app can run without them, and the remaining setup is limited to dashboard keys and store-side configuration.

## 1. RevenueCat

- Client + purchase flow: `src/services/purchaseService.ts`
- Server verification: `src/server/revenueCatVerification.ts`
- Central config: `src/config/premium.ts`

Environment variables:

- `EXPO_PUBLIC_PURCHASES_ENABLED`
- `EXPO_PUBLIC_RC_IOS_API_KEY`
- `EXPO_PUBLIC_RC_ANDROID_API_KEY`
- `EXPO_PUBLIC_RC_ENTITLEMENT_ID`
- `EXPO_PUBLIC_RC_OFFERING_ID`
- `EXPO_PUBLIC_RC_MONTHLY_PACKAGE_ID`
- `EXPO_PUBLIC_RC_ANNUAL_PACKAGE_ID`
- `REVENUECAT_SECRET_API_KEY`

## 2. Analytics

- Service wrapper: `src/services/analyticsService.ts`
- Event catalog: `src/config/analyticsEvents.ts`

Current tracked flows:

- Paywall open and CTA taps
- Purchase outcomes
- AI Hub open
- AI mode switches
- Food analysis start, success, fail, save
- Physique analysis start, success, fail, save
- Meal logging from AI Hub

Environment variables:

- `EXPO_PUBLIC_ANALYTICS_ENABLED`
- `EXPO_PUBLIC_POSTHOG_KEY`
- `EXPO_PUBLIC_POSTHOG_HOST`

If `posthog-react-native` is not installed or the key is missing, analytics stays safely disabled.

## 3. AI prompt management

- Prompt registry: `src/services/ai/promptRegistry.ts`
- API client: `src/services/geminiService.ts`
- Server execution: `src/server/geminiServer.ts`

The prompt registry now centralizes:

- Food analysis prompt
- Physique analysis prompt
- JSON schema contracts

This keeps prompt edits separate from transport logic and makes future premium AI flows easier to add.
