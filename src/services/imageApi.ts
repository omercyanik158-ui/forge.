export async function searchFoodImage(query: string): Promise<string | undefined> {
  const endpoint = process.env.EXPO_PUBLIC_IMAGE_SEARCH_API_URL;
  if (!endpoint) return undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}q=${encodeURIComponent(`${query} food`)}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { imageUrl?: unknown };
    return typeof data.imageUrl === 'string' ? data.imageUrl : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}
