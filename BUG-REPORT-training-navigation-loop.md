# Bug Report — Training Section Back-Button Navigation Loop

| Field | Value |
| --- | --- |
| **Report ID** | BUG-NAV-001 |
| **Title** | Back-button navigation loop when exiting a workout program in the Training flow |
| **Component** | Navigation / Training (Fitness) |
| **Severity** | Major (UX-breaking, 100% reproducible) |
| **Priority** | High |
| **Type** | Functional — Navigation |
| **Status** | Open / Untriaged |
| **Reproducibility** | Always (consistent across all programs) |
| **Reported** | 2026-07-10 |

---

## 1. Summary

After a user opens a workout program (e.g. *"Full Body A"*) from a category list (AI, Free, Premium) within the **Training** tab, the hardware/on-screen **back button does not navigate cleanly to the previous screen.** The first press correctly returns the user to the program list, but the **second press re-enters the same program** instead of continuing up the navigation stack. The user is forced to press back twice to actually exit the program, and the intermediate state behaves like a navigation loop.

---

## 2. Environment

| Item | Value |
| --- | --- |
| App | `yenispor` v1.0.0 |
| Framework | Expo SDK `~54.0.35`, React Native `0.81.5`, React `19.1.0` |
| Router | `expo-router` `~6.0.24` (file-based), `react-native-screens` `~4.16.0` |
| Affected entry | `main: expo-router/entry` |
| Platforms | iOS / Android (and web build) |
| Entry points | `(tabs)/fitness` → `programs` → `program-detail` (and `ai-program-detail`) |

---

## 3. Steps to Reproduce

1. Launch the app and open the **Training** (Antrenman) tab → `app/(tabs)/fitness.tsx`.
2. Open the program catalog via **"All Programs"** → `router.push('/programs')`.
3. Tap a program card (e.g. *"Full Body A"*) → `router.push({ pathname: '/program-detail', params: { id } })`.
4. On `program-detail`, press the **back button** (chevron, top-left) **once**.
5. Observe: the app returns to `programs` (Program Library). ✔
6. Press the **back button a second time**.
7. Observe: the app **re-enters the same program** instead of going back to the Training tab. ✘

> The loop also reproduces when the program is opened **directly** from the *Discover* rail on the Fitness screen (`fitness.tsx:132`) and when an **AI program** is opened (`ai-program-detail.tsx:116`).

---

## 4. Expected vs. Actual Behavior

| | Behavior |
| --- | --- |
| **Expected** | Each back press pops exactly one entry from the navigation stack: `program-detail` → `programs` → `(tabs)/fitness`. A single back press from `program-detail` should land on `programs` and **stay there** until the user navigates again. |
| **Actual** | Back #1 → `programs` (correct). Back #2 → **re-enters `program-detail`** (incorrect). Two back presses are required to truly exit, and the second press looks like it "loops" back into the screen the user just left. |

---

## 5. Scope & Impact

- **Scope:** Consistent across **all** library programs (Free/Premium) and **AI** program instances. Not data-specific.
- **User impact:** Confusing, non-deterministic-feeling navigation; users believe the back button is broken. Breaks the "back should always escape" contract.
- **Functional risk:** Low (no data loss), but the UX regression is severe because it affects the primary training entry path.
- **Analytics/routing risk:** Extra stack entries can skew screen-view analytics and deep-link/back-stack behavior.

---

## 6. Technical Analysis

### 6.1 Navigation architecture

- Root layout: a `Stack` with `headerShown: false` (`app/_layout.tsx:177-184`). Only `premium` is declared as a modal.
- `(tabs)` group contains the `fitness` tab (`app/(tabs)/_layout.tsx:84-96`).
- The Training flow pushes screens with `router.push`:
  - Fitness → Programs: `app/(tabs)/fitness.tsx:117` (`router.push('/programs')`)
  - Programs → Program detail: `app/programs.tsx:360-367` (`router.push({ pathname: '/program-detail', params: { id } })`)
  - Program detail → Session: `app/program-detail.tsx:197-202`

### 6.2 Back navigation implementation (primary suspect)

All back buttons route through a single helper:

```ts
// src/services/navigation.ts
const DEFAULT_BACK_FALLBACK: Href = "/(tabs)/fitness";

export function safeGoBack(router: Router, fallback: Href = DEFAULT_BACK_FALLBACK) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
```

Call sites in the affected flow:

- `app/program-detail.tsx:116` — `onPress={() => safeGoBack(router)}`
- `app/ai-program-detail.tsx:116` — `onPress={() => safeGoBack(router)}`
- `app/programs.tsx` via `src/components/ScreenHeader.tsx:46` — `onPress={() => safeGoBack(router)}`

### 6.3 Probable root cause(s)

> Exact mechanism should be confirmed at runtime (see §8), but the following are the strongest candidates given the code:

1. **Duplicate `program-detail` entry in the navigation stack.** The symptom (back #2 re-enters the same screen) is the textbook signature of `program-detail` being pushed **more than once** onto the React Navigation stack. `router.back()` then pops one copy per press, and the intermediate frame is the same program — perceived as a loop. Contributing factors:
   - `router.push` is invoked with no guard against double-activation (no debounce/disabled state during the push transition) at `programs.tsx:360` and `fitness.tsx:118/132`.
   - In **development**, React 19 StrictMode double-invocation can mount the focus effect twice.

2. **`useFocusEffect` performing non-render side effects on focus.** On `program-detail`, the focus effect calls `refresh()`, which in turn calls `addUserProgram(program.id)` (`app/program-detail.tsx:54-67`, `76-80`). While this writes to a store rather than navigating, any store update that re-triggers a parent re-render during the back transition can interact badly with `expo-router`'s history reconciliation and re-mount the route.

3. **`safeGoBack` relies on a clean history stack.** The helper trusts `router.canGoBack()` / `router.back()`. The root layout uses both `router.replace` (onboarding: `app/_layout.tsx:130`) and `router.push` (notification redirect: `app/_layout.tsx:140`). If a user's session began via onboarding or a notification tap, the back-stack may contain `replace`d entries, causing `back()` to land on an unexpected route — which can manifest as the loop.

---

## 7. Suspected Files / Code Locations

| File | Line(s) | Relevance |
| --- | --- | --- |
| `src/services/navigation.ts` | 5-15 | `safeGoBack` — back navigation contract |
| `app/program-detail.tsx` | 54-80, 116 | focus effect + back handler (library programs) |
| `app/ai-program-detail.tsx` | 116 | back handler (AI programs) |
| `app/programs.tsx` | 360-367 | `router.push` into program detail |
| `app/(tabs)/fitness.tsx` | 117-119, 132 | direct push into program detail / programs |
| `src/components/ScreenHeader.tsx` | 46 | shared back button (used by `programs`) |
| `app/_layout.tsx` | 130, 140 | `replace`/`push` that may corrupt back-stack |

---

## 8. Recommended Debugging Steps

1. **Inspect the live stack.** Add a temporary log in `safeGoBack`:
   ```ts
   const state = router.getState() as any;
   console.log('[safeGoBack] canGoBack=', router.canGoBack(), 'stack=', JSON.stringify(state.routes?.map((r: any) => r.name) ?? []));
   ```
   Reproduce and capture the stack at each back press — look for **duplicate `/program-detail`** entries.
2. **Verify entry count.** Reproduce slowly (single deliberate tap) vs. a normal tap to rule out double-fire / animation overlap.
3. **Isolate StrictMode.** Confirm whether the duplication still occurs in a **release/production** build (StrictMode is dev-only).
4. **Disable the `addUserProgram` side effect** temporarily inside the focus effect and re-test, to rule out contribution #2.
5. **Trace session origin.** Reproduce from (a) a cold start straight into Training, (b) after completing onboarding, and (c) via a notification deep link, to test contribution #3.

---

## 9. Suggested Fix Options (for evaluation)

- **Option A — Ensure a single stack entry.** Replace the raw `router.push` calls into `/program-detail` with `router.navigate(...)` (which dedupes to the existing instance when appropriate) **or** add an in-flight navigation guard (disable the source `TouchableOpacity` until the transition completes). Fix at `programs.tsx:360` and `fitness.tsx:118/132`.
- **Option B — Make `safeGoBack` deterministic.** Instead of trusting `router.back()`, navigate by route name (e.g., `router.replace('/(tabs)/fitness')` or pop to a named ancestor) so behavior is independent of history dirtiness. Update `src/services/navigation.ts`.
- **Option C — Move side effects out of `useFocusEffect`.** Run `addUserProgram` in a `useEffect` keyed on `program.id` rather than on focus (`program-detail.tsx:76-80`), removing any chance of focus-driven re-mount interactions.
- **Option D (defense-in-depth) —** Combine A + C; reserve B for the fallback branch only.

Whichever option is chosen, add a regression test asserting that the back stack from `program-detail` contains exactly one entry for that route and that a single back press lands on the expected parent.

---

## 10. Acceptance Criteria

- [ ] From `program-detail`, a **single** back press lands on `programs` and **stays** there.
- [ ] From `programs`, a single back press lands on `(tabs)/fitness`.
- [ ] Behavior is identical for AI programs (`ai-program-detail`) and for direct entry from the Fitness Discover rail.
- [ ] No duplicate `/program-detail` entries remain in the navigation stack after the fix.
- [ ] Works after a cold start, after onboarding, and after a notification deep link.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run test` pass.

---

## 11. Attachments / References

- Source files cited inline with `file:line` references.
- No logs/screenshots attached; capture console output per §8 during triage.
