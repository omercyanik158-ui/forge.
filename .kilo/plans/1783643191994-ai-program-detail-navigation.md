# AI Program Detail Navigation Fix

## Problem

When tapping an AI program card in the Fitness tab (or "Baslat" in My Plans), the app navigates **directly** to `program-session` (the workout screen), bypassing the `ai-program-detail` screen. The user wants AI programs to follow the same flow as regular programs:

```
Card tap → Detail screen (percentage, weeks, days) → Tap a day → Workout session
```

The `ai-program-detail.tsx` screen **already exists** and already has the same structure as `program-detail.tsx` (ProgressRing percentage, week tabs, day cards). Only the **navigation** is wrong.

## Changes

### 1. `app/(tabs)/fitness.tsx`

**a) AI ProgramCard `onPress` (line 355)**

Change from conditional direct-session routing to always-open-detail:

```tsx
// BEFORE (line 355):
onPress={() => (nextDayId ? onStartAIProgram(plan, nextDayId) : onOpenAIProgram(plan.id))}

// AFTER:
onPress={() => onOpenAIProgram(plan.id)}
```

**b) Remove secondary action (eye icon) from AI ProgramCard (lines 352-354)**

Since `onPress` now opens detail, the eye-icon secondary action is redundant. Remove these three props:

```tsx
// REMOVE:
secondaryActionIcon="eye-outline"
secondaryActionLabel={t("my_workouts.ai_open")}
onSecondaryAction={() => onOpenAIProgram(plan.id)}
```

`ProgramCard.tsx` (line 79) conditionally renders the secondary button only when both props exist, so removal is safe.

**c) Remove now-unused `nextDayId` variable (line 341)**

```tsx
// REMOVE:
const nextDayId = getNextAIProgramDayId(plan, progress);
```

**d) Remove `onStartAIProgram` handler and prop**

- Remove handler in `FitnessScreen` (lines 120-125)
- Remove `onStartAIProgram` from `FavoriteProgramsSection` props type (line 274)
- Remove from destructuring (line 264)

**e) Remove unused `getNextAIProgramDayId` function (lines 411-418)**

No longer referenced anywhere in this file.

### 2. `app/my-plans.tsx`

**a) Change `onStart` handler (lines 263-270)**

```tsx
// BEFORE:
onStart={() => {
  const nextDayId = getNextAIProgramDayId(
    item.plan,
    progressMap[`ai:${item.plan.id}`] ?? [],
  );
  if (!nextDayId) return;
  router.push({ pathname: "/program-session", params: { aiProgramId: item.plan.id, aiDayId: nextDayId } });
}}

// AFTER:
onStart={() => router.push({ pathname: "/ai-program-detail", params: { id: item.plan.id } })}
```

**b) Remove redundant "Ac" (Open) button from `AIProgramCard` (lines 595-598)**

Since "Baslat" now goes to detail, "Ac" is redundant. The card keeps "Yeniden olustur" (regenerate) + "Baslat" (→ detail). Layout stays valid: `cardButtons` uses `flexDirection: "row"` with `flexWrap: "wrap"`, `editButton` has `flex: 1`, `startButton` has `flex: 1.4`.

```tsx
// REMOVE from cardButtons View:
<TouchableOpacity onPress={onOpen} ...>
  <Ionicons name="eye-outline" .../>
  <Text ...>{t("my_workouts.ai_open")}</Text>
</TouchableOpacity>
```

**c) Remove `onOpen` prop from `AIProgramCard` component (lines 490, 504)**

Remove from both the type and destructuring.

**d) Remove unused `getNextAIProgramDayId` function (lines 701-708)**

No longer referenced anywhere in this file.

### 3. `app/ai-program-detail.tsx` (consistency enhancement)

**Add "Siradaki antrenman" label to recommended day cards**

The `DayCard` component (lines 390-446) does not show a recommendation label for the next day, unlike `program-detail.tsx` which shows "Siradaki antrenman". The `dayRecommendation` style already exists (line 573) but is unused.

Add after the day meta text (after line 438):

```tsx
{recommended && !completed ? (
  <Text style={[styles.dayRecommendation, { color: colors.primary }]}>
    Siradaki antrenman
  </Text>
) : null}
```

This matches `program-detail.tsx` line 348-350.

## Validation

1. Run `npm run typecheck` — no new errors
2. Run `npm run lint` — no new errors
3. Manual flow tests:
   - **Fitness tab**: Tap AI program card → opens `ai-program-detail` (NOT `program-session`)
   - **My Plans**: Tap "Baslat" on AI card → opens `ai-program-detail`
   - **ai-program-detail**: Tap a day → opens `program-session` (unchanged)
   - **ai-program-detail**: Recommended day shows "Siradaki antrenman" label
   - **Regular programs**: Unaffected, still work as before

## Out of Scope

- No changes to `program-session.tsx` (shared by both program types)
- No changes to `ai-program-builder.tsx` (already navigates to `ai-program-detail`)
- No changes to custom workout flow (single-day, no detail screen needed)
