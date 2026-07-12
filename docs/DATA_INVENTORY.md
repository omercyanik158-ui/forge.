# Data Inventory

## Stored on device

- Profile: name, age, gender, height, weight, activity level, optional body measurements
- Goals: goal type, target weight, starting weight, calculated calorie and macro targets
- Nutrition: meals, portions, calories, macros, meal templates, favorite meals, water logs
- Training: custom plans, completed sessions, set and repetition values, weight values, program progress, achievements
- Preferences: theme, language, units, notification schedule, favorite exercises, unfinished workout draft
- Premium state: current local premium tier and restored entitlement result
- AI Hub: food analysis results, physique coaching reports, confidence values, comparison metadata, and the local paths of user-selected analysis photos

These records are stored locally with the app data. They can be removed with the in-app reset action.

## Sent to external services

- Food search terms are sent to Open Food Facts when food search is used
- Exercise images may be downloaded from the selected exercise dataset source
- If `EXPO_PUBLIC_IMAGE_SEARCH_API_URL` is configured, a food name is sent to that endpoint for optional image lookup
- If premium purchasing is enabled, RevenueCat and the store providers receive purchase and entitlement data needed to process subscriptions. The AI API also verifies the app's anonymous RevenueCat user identifier before granting the premium request quota.
- When the user explicitly starts an AI analysis, the compressed selected image is sent through the FORGE API route to Google Gemini for that analysis. Food analysis sends one image; physique analysis sends front and back images together. FORGE does not use this route to create a cloud photo archive.

## Not collected in the current build

- No email or password
- No precise location
- No contacts
- No advertising identifier
- No health platform sync
- No analytics or crash-reporting SDK
- No developer-hosted profile backup
- No developer-hosted AI analysis history or photo gallery

## App Store privacy notes

Final App Store Connect answers must reflect the production build. If analytics, crash reporting, account sync, or a new backend is added later, this inventory must be updated before release.
