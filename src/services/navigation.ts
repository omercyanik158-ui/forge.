import type { Href, Router } from "expo-router";

const DEFAULT_BACK_FALLBACK: Href = "/(tabs)/fitness";

export function safeGoBack(
  router: Router,
  fallback: Href = DEFAULT_BACK_FALLBACK,
) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}
