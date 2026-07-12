# REWARDED ADS SYSTEM

## 1. What was implemented

FORGE now has an integration-ready rewarded ads scaffold for free AI users.

The system adds:

- separate rewarded credits for `meal_analysis` and `physique_analysis`
- a shared daily rewarded ad cap of `3`
- a provider-agnostic rewarded ad service
- a shared AI quota gate
- a reusable AI limit modal
- analytics events for the rewarded ad funnel
- release-check support for AdMob env validation

Rewarded ads are only offered after a free user is blocked by AI quota rules.

Premium users never see rewarded ads.

## 2. Architecture overview

Core layers:

- `src/services/rewardedCreditStore.ts`
- `src/services/rewardedAdService.ts`
- `src/services/aiQuotaGate.ts`
- `src/components/ai-hub/AiLimitReachedModal.tsx`

Flow:

1. User starts AI analysis.
2. Shared quota gate decides whether the request is allowed.
3. If blocked, the limit modal opens.
4. Primary path is Premium.
5. Secondary path is rewarded ad, only if eligible.
6. Completed ad grants exactly `+1` credit for the requested credit type.
7. Successful analysis consumes the rewarded credit if one was used.

## 3. Files changed

- [.env.example](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/.env.example)
- [scripts/release-check.mjs](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/scripts/release-check.mjs)
- [src/config/analyticsEvents.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/config/analyticsEvents.ts)
- [src/config/rewardedAds.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/config/rewardedAds.ts)
- [src/components/ai-hub/AiLimitReachedModal.tsx](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/components/ai-hub/AiLimitReachedModal.tsx)
- [src/screens/AIHubScreen.tsx](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/screens/AIHubScreen.tsx)
- [src/services/aiLimitModalModel.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiLimitModalModel.ts)
- [src/services/aiQuotaGate.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/aiQuotaGate.ts)
- [src/services/dataHealth.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/dataHealth.ts)
- [src/services/messages.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/messages.ts)
- [src/services/rewardedAdService.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/rewardedAdService.ts)
- [src/services/rewardedCreditStore.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/rewardedCreditStore.ts)
- [src/services/storageRegistry.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/src/services/storageRegistry.ts)
- [tests/rewarded-ads.test.ts](/C:/Users/omercanyanik/Desktop/yenispor%20-%20Kopya/tests/rewarded-ads.test.ts)

## 4. How rewarded credits work

- Credits are stored locally.
- Credits are tracked per analysis type.
- `meal_analysis` and `physique_analysis` never unlock each other.
- A completed rewarded ad grants exactly `1` credit.
- Skipped, failed, unavailable, or unsupported ads grant `0`.
- Successful AI usage consumes one rewarded credit only if that analysis actually used rewarded credit access.

## 5. How daily cap works

- Daily cap is `3` rewarded credits total per day.
- The cap is shared across both credit types.
- Once the cap is reached, rewarded ad CTA is hidden.
- The counter resets automatically when the local device day changes.

## 6. How premium users are excluded

- Premium users always pass the quota gate immediately.
- Premium users never see the rewarded ad CTA.
- Premium users never earn rewarded credits.
- Premium users never consume rewarded credits.

## 7. How meal vs physique credits are separated

- Meal ad reward grants only `meal_analysis`
- Physique ad reward grants only `physique_analysis`
- Shared quota logic checks the matching credit bucket only

## 8. Expo Go mock behavior

Development fallback behavior exists so the app does not crash in Expo Go or plain JS development.

Rules:

- if `EXPO_PUBLIC_ADMOB_ENABLED=false`
- and runtime is development
- rewarded ads run in mock mode

Mock mode:

- does not need a native AdMob package
- does not need real ad IDs
- still exercises the quota and credit system

## 9. EAS development build requirements

Real AdMob testing is not available in Expo Go.

For native rewarded ads you need:

- EAS development build or production build
- AdMob native package available in the build
- iOS / Android app IDs
- rewarded ad unit IDs

## 10. Required environment variables

- `EXPO_PUBLIC_ADMOB_ENABLED=false`
- `EXPO_PUBLIC_ADMOB_TEST_MODE=true`
- `EXPO_PUBLIC_ADMOB_IOS_APP_ID=`
- `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID=`
- `EXPO_PUBLIC_ADMOB_IOS_REWARDED_MEAL_AD_UNIT_ID=`
- `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_MEAL_AD_UNIT_ID=`
- `EXPO_PUBLIC_ADMOB_IOS_REWARDED_PHYSIQUE_AD_UNIT_ID=`
- `EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_PHYSIQUE_AD_UNIT_ID=`

## 11. AdMob dashboard steps still required

- Create the iOS app in AdMob
- Create the Android app in AdMob
- Create rewarded ad unit for meal analysis on iOS
- Create rewarded ad unit for meal analysis on Android
- Create rewarded ad unit for physique analysis on iOS
- Create rewarded ad unit for physique analysis on Android
- Mark the app as containing ads in Play Console when appropriate

## 12. Where to insert real IDs

Insert real values into your production env files or CI secrets:

- `.env.production`
- `.env.production.local`
- EAS secret environment config

Do not hardcode real IDs into source files.

## 13. How to test with Google test ads

Current scaffold supports two safe test paths:

- development mock mode with `EXPO_PUBLIC_ADMOB_ENABLED=false`
- native test mode with `EXPO_PUBLIC_ADMOB_ENABLED=true` and `EXPO_PUBLIC_ADMOB_TEST_MODE=true`

When native test mode is used, the config layer points to Google official rewarded test unit IDs instead of production unit IDs.

## 14. How to switch to production ads

1. Set `EXPO_PUBLIC_ADMOB_ENABLED=true`
2. Set `EXPO_PUBLIC_ADMOB_TEST_MODE=false`
3. Add real AdMob app IDs
4. Add real rewarded meal ad unit IDs
5. Add real rewarded physique ad unit IDs
6. Build a native EAS build
7. Run `npm run check:release`

## 15. Known limitations

- Real native AdMob behavior depends on the native AdMob package being present in the build.
- Expo Go only supports mock mode.
- Rewarded credits are local-first; they are not synced across devices.
- Daily cap is enforced locally on-device.
- This scaffold intentionally does not add banners, interstitials, or app-open ads.

## 16. Final manual QA checklist

- Free user can run physique analysis while free quota remains
- Free user meal analysis opens premium/reward modal when blocked
- Free user physique analysis opens premium/reward modal after free quota ends
- Premium CTA is primary inside the modal
- Rewarded CTA only appears while eligible
- Completed ad grants exactly one correct credit type
- Skipped ad grants nothing
- Failed ad grants nothing
- Unavailable ad grants nothing
- Credit is consumed after successful analysis
- Daily cap stops the rewarded CTA after three grants
- Next-day reset restores rewarded availability
- Premium users never see rewarded ad UI
- Release check fails if AdMob is enabled without required IDs
