# Onboarding: Spacing, Gender Visibility, Navy Formula + Dependency Fix

## Context
`app/onboarding.tsx` is a 7-step multi-step form. Each step renders a single `GlassCard` containing a `stepTitle`, step-specific content, and a "Devam/Bitir" button. The card uses `gap: 20` and `padding: 24`. The user reported cramped content, inconsistent heading spacing, and a gender-selection visibility bug where the icon/text become nearly invisible after selection.

Separately, Expo SDK 54 reported two package version mismatches that must be resolved before UI work.

## Scope
- `app/onboarding.tsx` (UI/style changes).
- `package.json` / `package-lock.json` (dependency downgrade via install command).
- `src/services/calculations.ts` is verified-correct (read-only).

## Prerequisite: Dependency Downgrade (run first)

Expo SDK 54 `--check` flagged two mismatches. `react-native-worklets@0.10.0` is **incompatible** with `react-native-reanimated@~4.1.1` (peer range `0.5 - 0.8`), confirmed in `package-lock.json:8359`. Must downgrade both.

Run in order (workspace root):
1. `npx expo install react-native-svg@15.12.1 react-native-worklets@0.5.1 --check`
2. If step 1 fails with EPERM (known on Windows), fallback:
   `npm install react-native-svg@15.12.1 react-native-worklets@0.5.1 --legacy-peer-deps`
3. Verify: `node -e "console.log(require('./node_modules/react-native-svg/package.json').version, require('./node_modules/react-native-worklets/package.json').version)"` → should print `15.12.1 0.5.1`
4. Restart Metro with cache clear: `npx expo start -c`

## Changes

### 1. Gender visibility fix — `ChoiceCard` (onboarding.tsx:366-379, 275-276)
Root cause: `choiceCardActive` background is `${colors.secondary}26` (≈15% opacity green over the dark surface), but the icon/text switch to `colors.onSecondary` (`#003824`, dark green). Dark-on-dark → nearly invisible.

Fix:
- `styles.choiceCardActive`: change `backgroundColor` from `${colors.secondary}26` → `colors.secondaryContainer` (`#00a572`, fully opaque).
- Keep `borderColor: colors.secondary` as-is.
- `ChoiceCard` icon/text color stays `active ? colors.onSecondary : colors.primary` / `colors.onSurface` — no change needed once background is opaque.

### 2. Standardize spacing (headings aligned, content higher)
Target: every step's `stepTitle` → content gap is equal, and overall content sits higher.

- `styles.card`: change `padding: 24` → `padding: 20` (content moves up).
- `styles.card`: keep `gap: 20` as the baseline for title→button spacing, but make title→content consistent by giving the **title a fixed bottom margin** and rendering content directly (the card-level gap still governs button spacing).
- Specifically, add `marginBottom: 28` to `styles.stepTitle` so the gap below every heading is identical (28px) regardless of step content. This addresses #5 (heading alignment) and #2/#4 (content higher via consistent, moderate gap).

### 3. Name step (step 0) extra lift — #1
The user specifically wants the "Adını Öğrenelim" title moved higher above the name input. With the shared `stepTitle` marginBottom of 28 (#2), give step 0's input an additional top margin:
- Add an inline `style={[styles.input, { marginTop: 12 }]}` to the step-0 `TextInput` (onboarding.tsx:162-171). Total title→input distance on name step = 28 + 12 = 40px; all other steps = 28px (heading-aligned baseline).

### 4. Navy formula — verification only (no code change)
Confirmed correct in `src/services/calculations.ts:15-33`:
- Male (L22): `495 / (1.0324 − 0.19077·log₁₀(waist − neck) + 0.15456·log₁₀(height)) − 450` ✓
- Female (L30): `495 / (1.29579 − 0.35004·log₁₀(waist + hip − neck) + 0.221·log₁₀(height)) − 450` ✓
- Units: cm (metric), log₁₀ via `Math.log10`. Clamp [2, 60]. Matches US Navy circumference method. No edits.

## Out of Scope
- `handleFinish` try/catch (already present in current code).
- Onboarding gate in `app/_layout.tsx`.
- Real-data wiring on tab screens.

## Validation
1. `npx tsc --noEmit` — must pass clean.
2. Dependency versions confirmed (svg 15.12.1, worklets 0.5.1) via the node one-liner above.
3. Metro restarted with `-c` (picks up new native module versions).
4. Manual (Expo Go): walk all 7 steps; confirm:
   - Gender card after tap: green opaque background, icon/text clearly dark & readable.
   - All step headings share the same vertical distance to their first input/control.
   - Name step title visibly higher above its input than other steps.
   - Content on Age(2)/Height(3)/Weight(4) steps appears higher than before (less cramped).
