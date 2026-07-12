# FINAL MONETIZATION QA

## 1. Executive Summary

FORGE monetization is now materially stronger than the previous snapshot:

- rewarded ads are scaffolded with mock + native-ready paths
- AdMob plugin wiring is prepared for EAS/native builds
- AI quota enforcement moved toward server authority before provider calls
- RevenueCat entitlement verification remains server-side for premium-sensitive AI flows
- local rewarded credit UX now syncs better with server state

The repository is **not production-ready yet in its current exact state** because release configuration is still incomplete and manual real-device monetization QA has not been completed. However, the codebase is now much closer to a **Ship With Conditions** state than before.

## 2. Monetization Readiness Score /100

**84 / 100**

## 3. Rewarded Ads Score

**85 / 100**

Strengths:

- mock mode works in development / Expo Go-safe path
- native AdMob package is installed
- separate meal / physique ad units are modeled
- reward is only granted after completed outcome
- daily rewarded ad cap remains modeled as `3`
- premium users are excluded from rewarded prompts by quota logic

## 4. Server Quota Score

**82 / 100**

Strengths:

- AI route now authorizes quota before calling Gemini
- request IDs are required server-side
- duplicate request protection is present
- rewarded credit consumption is handled on the server path
- premium entitlement is still checked server-side

## 5. RevenueCat Score

**81 / 100**

Strengths:

- canonical entitlement config already exists
- purchase / restore / failure / cancel paths are present
- premium state is persisted locally for UX
- server-side RevenueCat secret verification exists for quota-sensitive flows

## 6. Anti-Abuse Score

**80 / 100**

Strengths:

- request replay protection exists in AI quota path
- AI provider is blocked before expensive execution when quota fails
- no obvious RevenueCat secret or Gemini key exposure in client code
- AdMob production IDs are still env-driven, not hardcoded

## 7. App Store Monetization Readiness Score

**74 / 100**

Strengths:

- purchase and rewarded ad architecture are present
- native AdMob integration path is now build-aware
- release checks catch missing production monetization config

Current blockers:

- release env is incomplete
- no completed manual sandbox / internal-test verification is captured in-repo

## 8. Critical Issues

### C1. Release configuration is still incomplete

- Severity: Critical
- Location: [scripts/release-check.mjs](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/scripts/release-check.mjs), [docs/APP_STORE_METADATA.md](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/APP_STORE_METADATA.md)
- Problem: Release validation still fails.
- Root Cause: Production keys and legal/support metadata are not filled yet.
- Fix Applied: None to bypass it. The release gate remains intentionally strict.
- Expected Impact: Prevents broken monetization or incomplete store submission from shipping.

Current blocking items:

- `EXPO_PUBLIC_RC_IOS_API_KEY`
- `EXPO_PUBLIC_RC_ANDROID_API_KEY`
- `EXPO_PUBLIC_AI_API_URL`
- `EXPO_PUBLIC_SUPPORT_EMAIL`
- `GEMINI_API_KEY`
- `REVENUECAT_SECRET_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### C2. Production monetization has not been fully validated on real devices

- Severity: Critical
- Location: End-to-end manual QA
- Problem: The code is stronger, but rewarded ads + purchases + restore + quota transitions still need real-device proof.
- Root Cause: This audit was repository-driven, not store-sandbox-driven.
- Fix Applied: Added stronger code checks and a final manual checklist.
- Expected Impact: Prevents false confidence before TestFlight / Play internal testing.

## 9. High Priority Issues

### H1. Rewarded credits still depend on client-side mirrored state for UX

- Severity: High
- Location: [src/screens/AIHubScreen.tsx](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/screens/AIHubScreen.tsx), [src/services/rewardedCreditStore.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/rewardedCreditStore.ts)
- Problem: Server is now the real authority, but the client still mirrors rewarded credit state locally for flow continuity.
- Root Cause: UX needs local responsiveness and persistence, while the backend remains final authority.
- Fix Applied: Added server-side reward claim integration plus snapshot sync on refresh.
- Expected Impact: Greatly reduces server/client drift, but some drift edge cases remain possible until broader sync coverage is added.

### H2. Upstash outage still falls back to in-memory protection in some paths

- Severity: High
- Location: [src/server/rateLimit.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/server/rateLimit.ts), [src/server/aiMonetization.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/server/aiMonetization.ts)
- Problem: If Redis becomes unavailable, the system degrades to per-instance memory logic.
- Root Cause: Safety fallback was preserved to avoid hard crashes.
- Fix Applied: None in this audit because removing the fallback right now would be a riskier behavior change.
- Expected Impact: Protects uptime, but weakens strict multi-instance anti-abuse guarantees during Redis outages.

## 10. Medium Priority Issues

### M1. Premium analytics naming is still partly legacy-oriented

- Severity: Medium
- Location: [src/config/analyticsEvents.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/config/analyticsEvents.ts), [app/premium.tsx](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/premium.tsx)
- Problem: Existing purchase analytics are usable, but they do not fully match the more explicit `premium_*` naming requested in later specs.
- Root Cause: Earlier implementation used generic purchase/paywall event names.
- Fix Applied: No risky analytics rename was forced during this QA pass.
- Expected Impact: Analytics remain functional, but naming consistency is weaker than ideal.

### M2. Raw server-side error logs still exist

- Severity: Medium
- Location: [app/api/ai-analyze+api.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/api/ai-analyze+api.ts), [src/server/rateLimit.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/server/rateLimit.ts)
- Problem: Server routes still emit raw `console.error(...)` output.
- Root Cause: Operational logging has not yet been fully sanitized or routed through structured reporting.
- Fix Applied: Not changed during this audit to avoid obscuring production debugging right before monetization validation.
- Expected Impact: Low user-facing risk, moderate observability/privacy hygiene concern.

### M3. Device clock / timezone drift can still affect client-side mirrored messaging

- Severity: Medium
- Location: [src/services/rewardedCreditStore.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/rewardedCreditStore.ts), [src/services/aiHubAccess.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiHubAccess.ts)
- Problem: Server authority protects cost, but local UX counters still use device-local time windows.
- Root Cause: Local-first UI state is intentionally lightweight.
- Fix Applied: Server remains authoritative and snapshot sync was improved.
- Expected Impact: User messaging can be temporarily inconsistent around timezone or clock manipulation, but backend cost protection remains stronger.

## 11. Low Priority Issues

### L1. Rewarded credit state after app kill between ad completion and follow-up analysis still deserves manual QA

- Severity: Low
- Location: End-to-end flow
- Problem: The flow should now survive better because server reward granting is integrated, but this exact timing case still needs device validation.
- Root Cause: Static tests do not simulate full mobile lifecycle behavior.
- Fix Applied: Server-side credit grant path and client snapshot refresh were added.
- Expected Impact: Likely improved, but still needs manual confirmation.

## 12. Fixes Applied

### A1. AI request IDs are now generated client-side for server-side quota authority

- Severity: Preventive
- Location: [src/screens/AIHubScreen.tsx](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/screens/AIHubScreen.tsx)
- Problem: Server-side quota authorization now requires stable request IDs.
- Root Cause: Earlier client path did not yet send request identifiers.
- Fix Applied: Added per-analysis request ID generation for meal and physique flows.
- Expected Impact: Enables duplicate request protection and cleaner server authority.

### A2. Rewarded ad completion now claims credit on the server before local unlock

- Severity: High-value fix
- Location: [src/services/rewardedCreditApi.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/rewardedCreditApi.ts), [src/screens/AIHubScreen.tsx](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/screens/AIHubScreen.tsx)
- Problem: Local-only reward granting could drift from backend authority.
- Root Cause: Rewarded ad UX was initially ahead of server synchronization.
- Fix Applied: Added `ai-rewarded-credit` claim call before local credit mirroring.
- Expected Impact: Prevents “ad watched locally but not recognized by backend” mismatches in the main path.

### A3. Rewarded credit snapshot now rehydrates from server state

- Severity: Reliability fix
- Location: [src/services/rewardedCreditStore.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/rewardedCreditStore.ts), [src/services/rewardedCreditApi.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/rewardedCreditApi.ts), [src/screens/AIHubScreen.tsx](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/screens/AIHubScreen.tsx)
- Problem: Reinstall or local-state loss could desync rewarded credit UX.
- Root Cause: Client mirror was not being refreshed from backend state.
- Fix Applied: Added snapshot fetch + local sync during AI Hub refresh.
- Expected Impact: Stronger continuity after restart/reinstall scenarios.

### A4. Native AdMob config is now build-time env driven

- Severity: Production readiness fix
- Location: [app.config.js](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app.config.js)
- Problem: Native AdMob package alone is not enough; app IDs must be wired safely at build time.
- Root Cause: Static Expo config was not sufficient for env-sensitive AdMob setup.
- Fix Applied: Added dynamic Expo config that injects Google Mobile Ads plugin settings only when enabled/test mode is active.
- Expected Impact: Safer EAS/TestFlight/Play build preparation without hardcoding production IDs.

### A5. Client AI access model now reflects daily meal and weekly physique free windows

- Severity: Product correctness fix
- Location: [src/services/aiHubAccess.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiHubAccess.ts), [src/services/aiQuotaGate.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiQuotaGate.ts)
- Problem: Legacy local access tracking only modeled the older physique-only free trial state.
- Root Cause: Monetization rules evolved.
- Fix Applied: Migrated local access tracking to meal-per-day and physique-per-week windows with legacy migration support.
- Expected Impact: Better UX alignment with the current quota model.

### A6. Production-facing release config is now centralized in `.env.production`

- Severity: Release preparation fix
- Location: [.env.production](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/.env.production)
- Problem: Release-critical public values were scattered across local state and examples only.
- Root Cause: No tracked production template existed for legal URLs, purchase enablement, and monetization toggles.
- Fix Applied: Added a tracked production env template with purchases enabled and published legal URL targets.
- Expected Impact: Faster release handoff and fewer accidental config omissions.

### A7. App Store metadata placeholders were replaced with real HTTPS targets

- Severity: Store readiness fix
- Location: [docs/APP_STORE_METADATA.md](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/docs/APP_STORE_METADATA.md)
- Problem: Store support and privacy fields were still placeholders.
- Root Cause: Metadata draft had not been connected to publishable destinations.
- Fix Applied: Support URL now points to the repository issue tracker, and privacy policy points to the published repository document.
- Expected Impact: Removes a store submission blocker and keeps release validation focused on true missing secrets and infrastructure.

### A8. Server logging now uses sanitized structured output in release-sensitive routes

- Severity: Hardening fix
- Location: [src/server/serverLogger.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/server/serverLogger.ts), [app/api/ai-analyze+api.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/app/api/ai-analyze+api.ts), [src/server/rateLimit.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/server/rateLimit.ts)
- Problem: Raw server errors were printed directly in cost-sensitive monetization paths.
- Root Cause: Logging had not yet been normalized for release review.
- Fix Applied: Added a small server logger and switched critical paths to structured, sanitized logging.
- Expected Impact: Better production hygiene without weakening debugging.

## 13. Remaining External Setup

- Fill real RevenueCat iOS API key
- Fill real RevenueCat Android API key
- Fill real AI backend URL
- Fill real support email
- Fill real Gemini server key
- Fill real RevenueCat secret key
- Fill Upstash Redis URL
- Fill Upstash Redis token
- Create RevenueCat products / offering / packages
- Create App Store Connect subscription products
- Create Google Play subscription products
- Create AdMob app IDs and rewarded ad unit IDs
- Run sandbox purchase and restore tests on physical devices

## 14. Manual Test Checklist

### iOS dev build

- Fresh install
- Free meal quota works once per day
- Free physique quota works once per week
- Rewarded modal only appears when eligible
- Completed rewarded ad grants exactly one correct credit
- Restore purchases works
- Offline purchase / restore handling is safe
- Camera permission + AI flow work end-to-end

### Android dev build

- Fresh install
- Rewarded ad load/show/close behavior
- Background during ad and return
- Offline during ad and return
- Purchase flow + restore flow
- AI quota blocking before provider call

### TestFlight

- Sandbox purchase monthly
- Sandbox purchase annual
- Cancelled purchase path
- Restore after reinstall
- Premium user never sees rewarded ad prompt

### App Store sandbox purchase

- Entitlement becomes active
- Premium persists after restart
- Premium AI quota path is honored

### Google Play internal test

- Purchase
- Restore / re-open
- Premium persistence

### Real device camera

- Food analysis image selection
- Physique front/back capture
- Permission deny -> allow retry

### Real device notification

- Notification permission flow does not interfere with monetization flows

### Offline behavior

- Offline before AI request
- Offline after rewarded ad completion
- Offline during restore

### Dark mode

- Premium screen readability
- AI limit modal readability

### Large text

- Paywall CTA still visible
- Rewarded modal actions still tappable

## 15. Final Verdict

**Ship With Conditions**

Conditions:

- complete production env setup
- complete AdMob / RevenueCat dashboard setup
- replace store metadata placeholders
- pass real-device monetization QA on iOS and Android

Current repo status:

- code path is much closer to monetization-ready
- static verification is strong
- targeted tests are passing
- expo config is healthy
- release gate is still correctly blocking shipment until real production configuration exists
