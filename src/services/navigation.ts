import type { Href, useRouter } from "expo-router";

const DEFAULT_BACK_FALLBACK: Href = "/(tabs)/fitness";

export function safeGoBack(
  router: ReturnType<typeof useRouter>,
  fallback: Href = DEFAULT_BACK_FALLBACK,
) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallback);
}
