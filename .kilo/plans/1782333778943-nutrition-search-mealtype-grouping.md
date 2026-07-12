# Nutrition: Search Expand, Spacing, Manual Layout, Meal Type, Dashboard Grouping

## Context
The nutrition module spans three files:
- `app/add-meal.tsx` (458 lines) — search + manual entry, single screen with mode tabs. Two save paths (`handleSaveApi`, `handleSaveManual`) call `saveMeal` then `router.back()`.
- `app/(tabs)/nutrition.tsx` (371 lines) — dashboard. Already shows daily total (`CaloriesSummary`) at top + flat meal list (`mealsList`) below.
- `src/services/foodApi.ts` — Open Food Facts, `page_size=20`, result card shows only name + `kcal/100g`.

`Meal` type (`src/types.ts:1-11`) has no `mealType` field. `saveMeal` (mealStore.ts) prepends and persists to AsyncStorage `@forge/meals`.

## Scope
- `src/types.ts` — add `MealType`, add `mealType` to `Meal`.
- `src/services/foodApi.ts` — increase page_size, enrich `FoodResult` (no type change; already has per-100g macros) — only the *display* of extra macros needs data that's already fetched.
- `app/add-meal.tsx` — search result card macros, spacing fixes, manual layout (single row for P/C/F), meal-type modal step.
- `app/(tabs)/nutrition.tsx` — group meals by `mealType` with section totals.

## Changes

### 1. Expand search results — `foodApi.ts:25`
- Change `page_size=20` → `page_size=50`.

### 2. Search result card — show macros — `add-meal.tsx:283-297` (`ResultRow`)
- Under the existing `kcalPer100g / 100g` sub-line, add a secondary line showing protein/carbs/fat per 100g:
  `{protein}P {carbs}K {fat}Y · /100g` (reuses already-fetched `proteinPer100g`/`carbsPer100g`/`fatPer100g`).

### 3. Spacing fix #1 — `add-meal.tsx` portionRow → macroGrid (selectedCard)
- Add `marginBottom: 12` to the `portionRow` View (inline or new style), increasing the gap between "Porsiyon (gram)" row and the macro grid. Card-level `gap: 20` still applies to other children.

### 4. Spacing fix #2 — `add-meal.tsx` macroGrid → Kaydet button
- Add `marginTop: 12` to the `macroGrid` View (or wrap in a View with bottom margin), increasing gap between macro boxes and the Kaydet button.

### 5. Manual entry — single row for Protein/Carbs/Fat — `add-meal.tsx:255-259`
- Currently: Protein+Carbs in `manualRow`, Fat alone below.
- Change: put Protein, Carbs, Fat all in one `manualRow` (3 columns). Each `ManualField` uses `flex: 1`. Besin Adı and Kalori stay on their own full-width rows above.
- New `manualRow` gap stays 12; each field `flex: 1`.

### 6. Meal type field — `src/types.ts`
- Add: `export type MealType = 'breakfast' | 'lunch' | 'dinner';`
- Add `mealType: MealType;` to `Meal`.

### 7. Meal type selection modal — `add-meal.tsx`
Both save flows (`handleSaveApi`, `handleSaveManual`) must capture a `mealType` before saving. Implement a modal step (not a route):
- New state: `mealTypeModal: boolean`, `pendingMeal: Meal | null`.
- Refactor `handleSaveApi` / `handleSaveManual`: build the `Meal` object (including `mealType`), but instead of saving immediately, set `pendingMeal` and open the modal (`setMealTypeModal(true)`).
- Modal UI: bottom sheet style GlassCard overlay with 3 options (Kahvaltı/Öğle/Akşam) as `ChoiceCard`-style buttons. On select → assign `pendingMeal.mealType`, call `saveMeal`, `router.back()`.
- Modal labels (TR) map to type values: Kahvaltı→`breakfast`, Öğle→`lunch`, Akşam→`dinner`.
- Close button (X) cancels (no save, stays on screen).

### 8. Nutrition dashboard — group by mealType — `nutrition.tsx`
Replace the flat `mealsList` with grouped sections:
- Define order: `breakfast` → `lunch` → `dinner`.
- For each group with ≥1 meal, render a section: header (TR label + group kcal total) + that group's `MealCard`s.
- Group totals computed inline via `mealTotals(groupMeals)` (kcal only in header).
- Meals with no/legacy `mealType` (existing saved data): fall into a "Diğer" (other) catch-all group at the end, so old data doesn't disappear.
- Section header style: reuse `typography.headlineMd` + small kcal, with top margin between sections.

### 9. Edit-mode backward compatibility (onboarding `useEffect`)
No change needed — onboarding doesn't touch meals. Existing meals in AsyncStorage lack `mealType`; the "Diğer" group handles this.

## Out of Scope
- Water tracking, TipCard (unchanged).
- Meal edit (only delete exists).
- Real calorie goal wiring on Anasayfa (separate task).

## Validation
1. `npx tsc --noEmit` — must pass clean (especially `Meal.mealType` required field across both save paths).
2. Manual test (Expo Go):
   - Search "tavuk" → ≥20 results, each card shows `XP XK XY · /100g`.
   - Select a result → portion row to macro grid gap visibly larger; macro grid to Kaydet gap visibly larger.
   - Tap Kaydet → meal type modal appears with 3 options → pick one → returns to nutrition.
   - Manual entry → P/C/F in one horizontal row → Kaydet → same meal type modal.
   - Nutrition dashboard → meals grouped under Kahvaltı/Öğle/Akşam with section kcal totals; pre-existing meals (no mealType) under "Diğer".
3. Backward compat: meals saved before this change still render (in "Diğer").
