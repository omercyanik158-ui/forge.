# Nutrition UX Fixes: Manual Spacing, Delete Button, Search Reliability, Food Photos, Profile TopBar

## ⚠ Fix-Up Required: expo-image Version
All source-code changes below are already implemented and typecheck-clean. However, `expo-image` was installed at `56.0.11` (wrong — pulled latest tag via `--legacy-peer-deps`) instead of the Expo SDK 54 compatible `~3.0.11`. **Run the corrected install command in the "Prerequisite: Install expo-image" section before restarting Metro.** This is the only remaining action.

## Context
Five issues reported by user on the nutrition module and profile tab:

1. **Elle giriş Kaydet butonu yukarıda** — `add-meal.tsx` manual card gap too tight between P/C/F row and Kaydet button.
2. **MealCard silme butonu çok altta** — `nutrition.tsx` MealCard has trash button at far right, vertically centered. User wants it top-right.
3. **Arama 2-3 denemede sonuç vermiyor** — `foodApi.ts` fetch has no timeout/retry; OFF API is slow/inconsistent.
4. **Yemek fotoğrafları** — no images currently. User provided Pexels API key. Use expo-image + Pexels search.
5. **Profil üstte boşluk** — `profile.tsx` has no TopBar (other tabs show FORGE TopBar), causing misaligned spacing.

## Scope
- `app/add-meal.tsx` — manual saveBtn spacing.
- `app/(tabs)/nutrition.tsx` — MealCard delete button reposition + food photo.
- `src/services/foodApi.ts` — timeout + retry.
- `src/services/imageApi.ts` (NEW) — Pexels image search.
- `src/types.ts` — `FoodResult.imageUrl` + `Meal.imageUrl` fields.
- `app/(tabs)/profile.tsx` — add TopBar, adjust paddingTop.
- `.env.local` (NEW) — Pexels API key.
- `package.json` — add `expo-image`.

## Prerequisite: Install expo-image (SDK-54-pinned)
**Important:** Bare `npm install expo-image --legacy-peer-deps` pulls `56.0.11`, which is incompatible with Expo SDK 54 (expects `~3.0.11`). The `--legacy-peer-deps` flag bypasses peer resolution, so npm grabs the newest tag built for a later SDK — causes native module crashes in Expo Go.

Correct command (pins to SDK-54-compatible version):
```
npm install expo-image@~3.0.11 --legacy-peer-deps
```
Verify the **actual** installed version (not just package.json):
```
node -e "console.log(require('./node_modules/expo-image/package.json').version)"
```
Must print `3.0.x`. If it still shows 56.x, clear npm cache and retry, or use `npx expo install expo-image` (SDK-aware installer that auto-resolves the compatible range).

After install, restart Metro with cache clear: `npx expo start -c`

## Prerequisite: Create .env.local
Create `.env.local` (gitignored via existing `.gitignore` line 34: `.env*.local`):
```
EXPO_PUBLIC_PEXELS_KEY=mDiTyOi4BaUgmtmL19tWtbdQAeeeKNp9bxwApOlCjunuNVnKPJbzGE3Q
```
Read in code via `process.env.EXPO_PUBLIC_PEXELS_KEY` (Expo SDK 54 auto-inlines `EXPO_PUBLIC_` vars at build time).

## Changes

### 1. Manual saveBtn spacing — `app/add-meal.tsx`
The `manualCard` uses `gap: 16`. The Kaydet button sits directly after the P/C/F row with only that gap. Add explicit spacing:
- In `styles.saveBtn` (shared by search + manual), no change needed (it already has functional spacing for search).
- Instead, wrap the manual saveBtn or add inline `marginTop: 16` specifically to the **manual** saveBtn TouchableOpacity (inline style, not the shared style) so it doesn't affect the search-card saveBtn.
- Result: P/C/F row → 16px gap (card) + 16px (marginTop) = 32px total before Kaydet button.

### 2. MealCard delete button — `app/(tabs)/nutrition.tsx`
MealCard currently: `[64x64 icon] [mealInfo flex:1] [trash button]` (row, vertically centered).
- Remove the trailing `<TouchableOpacity style={styles.mealDelete}>` from the row.
- Add a new absolute-positioned delete button as the first child inside GlassCard:
  ```
  <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.mealDeleteTop}>
    <Ionicons name="trash-outline" size={18} color={colors.outline} />
  </TouchableOpacity>
  ```
- Style `mealDeleteTop`: `position: 'absolute', top: 12, right: 12, zIndex: 2, padding: 4`.
- Remove old `mealDelete` style; GlassCard needs `overflow: 'hidden'` (check GlassCard component — if not present, add to mealCard style).
- Trash icon size reduced 20→18 to fit corner cleanly.

### 3. Search timeout + retry — `src/services/foodApi.ts`
Add AbortController timeout (10s) and retry (2 attempts):
```
async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function searchFood(query: string): Promise<FoodResult[]> {
  // ... existing validation
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) throw new Error(`Arama başarısız: ${res.status}`);
      const data = await res.json();
      // ... existing parse + map, include imageUrl from OFF if present
      return results;
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
```
Also parse `image_front_small_url` from OFF product (add to OFFProduct type) and set `imageUrl` on FoodResult (may be undefined).

### 4. Food photos — Pexels + expo-image

#### 4a. Types — `src/types.ts`
- Add `imageUrl?: string` to `FoodResult` (from OFF, if present).
- Add `imageUrl?: string` to `Meal` (from Pexels search at save time, or from OFF).

#### 4b. New service — `src/services/imageApi.ts`
```
export async function searchFoodImage(query: string): Promise<string | undefined> {
  const key = process.env.EXPO_PUBLIC_PEXELS_KEY;
  if (!key) return undefined;
  const foodQuery = `${query} food`;
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(foodQuery)}&per_page=1`, {
      headers: { Authorization: key },
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    return data.photos?.[0]?.src?.medium;
  } catch {
    return undefined;
  }
}
```
- Timeout not critical here (graceful fallback to icon).
- `per_page=1` minimizes response size.

#### 4c. Wire image into save flows — `app/add-meal.tsx`
- In `handleSaveApi`: before opening meal-type modal, call `searchFoodImage(selected.name)` → set `meal.imageUrl`.
- In `handleSaveManual`: call `searchFoodImage(manualName.trim())` → set `meal.imageUrl`.
- If Pexels returns nothing, `imageUrl` is undefined (graceful).

#### 4d. Render in MealCard — `app/(tabs)/nutrition.tsx`
- Replace the 64x64 icon box: if `meal.imageUrl` exists, render `expo-image` `Image` (source={uri: meal.imageUrl}), else keep existing Ionicons fallback.
- Import: `import { Image as ExpoImage } from 'expo-image'`.
- Style: reuse `mealImage` box (64x64, borderRadius 12, overflow hidden).

### 5. Profile TopBar — `app/(tabs)/profile.tsx`
- Import `TopBar` from `@/components/TopBar`.
- Add `<TopBar title="FORGE" showAvatar={false} />` as first child of container View (before ScrollView), matching `nutrition.tsx` pattern.
- Change `paddingTop: insets.top + 80` → `insets.top + 96` (matches other tabs).
- TopBar is `position: absolute` so it overlays; ScrollView paddingTop gives clearance.

## Out of Scope
- Water card, TipCard (unchanged).
- Meal edit.
- Anasayfa real-data wiring.
- Pexels rate-limit handling beyond graceful fallback.

## Validation
1. `npm install expo-image --legacy-peer-deps` succeeds.
2. `npx tsc --noEmit` passes clean (check `process.env.EXPO_PUBLIC_PEXELS_KEY` typing — Expo inlines as string|undefined).
3. Restart Metro with `-c` (picks up new env var + expo-image native).
4. Manual test (Expo Go):
   - Elle gir: Kaydet butonu P/C/F satırından daha aşağıda, orantılı.
   - MealCard: trash ikonu sağ-üst köşede; sol-sağ eski buton konumu yok.
   - Arama: tek denemede sonuç gelsin (timeout/retry); yavaş ağda 2. deneme çalışır.
   - MealCard: yemek fotoğrafı görünür (Pexels'ten); network yoksa ikon fallback.
   - Profil: üstte FORGE TopBar görünür, diğer tablarla aynı hizada.
