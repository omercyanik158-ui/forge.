# Release, Performance, and Cleanup Report

## Current Status

FORGE is technically healthy on the Expo SDK 57 stack. The local validation suite passes:

- `npm run check:quality`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npx expo-doctor`

The remaining release work is mostly operational validation: store setup, sandbox purchases, rewarded ads in native builds, production environment values, and real-device QA.

## Release Blockers

- Complete iOS sandbox purchase and restore testing.
- Complete Android internal-test purchase and restore testing.
- Validate rewarded ads in a native development or preview build.
- Confirm RevenueCat products, offerings, entitlement names, and restore behavior.
- Confirm production environment values for AI, RevenueCat, AdMob, PostHog, Upstash, support URL, and privacy URL.
- Run real-device QA for onboarding, AI analysis, free quota, premium quota, rewarded credits, offline behavior, and app restart flows.

## Performance Opportunities

- Split large screens into smaller components and screen-specific hooks. Highest-impact candidates are `app/ai-program-builder.tsx`, `app/program-session.tsx`, `src/screens/AIHubScreen.tsx`, `app/(tabs)/nutrition.tsx`, and `app/create-workout.tsx`.
- Reduce eager startup work in `app/_layout.tsx`. Keep only theme, profile, localization, and navigation gate work on the critical path; move analytics, purchase sync, and notifications to deferred startup where possible.
- Revisit large static imports. `src/data/exercises.ts` and `src/services/messages.ts` are large and may benefit from splitting or lazy access patterns.
- Prefer virtualized lists for long, repeated content. `AIHubScreen` already uses `FlashList`; similar patterns can be applied where long `ScrollView` screens grow.
- Measure before deep refactors. Track cold start, first input latency on onboarding, AIHub opening time, program session interactions, and JS thread stutter on a real Android device.

## Cleanup Completed

Removed local Expo Go artifacts that were not tracked by Git and were already covered by ignore rules:

- `Expo-Go-57.0.2.apk`
- `Expo-Go-57.0.2.tar.app`
- `Expo-Go-54.0.7.tar.app`

This reclaimed roughly 660 MB from the workspace without changing app source code.

Also cleaned duplicate `.gitignore` entries for Expo Go artifact and production env patterns.

## Performance Cleanup Completed

- Deferred non-critical startup services until after initial interactions. Analytics identity, reporting user context, notification scheduling, and purchase sync no longer sit on the first bootstrap path.
- Made the exercise lookup and search indexes lazy. The app no longer builds the full searchable exercise index at module import time.
- Tightened AI quota memoization dependencies so quota decisions do not recompute just because a wrapper params object was recreated.
- Kept all UI and navigation behavior unchanged while reducing work on startup and exercise-heavy screens.

## Cleanup Candidates

- Move old audit and planning markdown files from the repo root into `docs/archive/` if the team wants a quieter root directory.
- Keep `posthog-react-native`, `react-native-google-mobile-ads`, `expo-system-ui`, and `react-native-worklets` even if generic dependency tools flag them. They are used through dynamic imports, config plugins, or native compatibility paths.
- Do not remove Expo-managed native packages just because they lack direct TypeScript imports. Validate removals with `expo-doctor`, tests, and native smoke runs.

## Recommended Next Work

- Create a release checklist run based on `docs/MONETIZATION_DEVICE_QA.md`.
- Build a development or preview native build and test AdMob, RevenueCat, notifications, camera, image picker, and AI quota flows.
- Start performance work with the boot path and `AIHubScreen`, because they combine user-visible latency with native/dynamic integrations.
