import type { FoodResult } from '@/types';

export type FoodApiErrorCode = 'FOOD_SEARCH_FAILED' | 'FOOD_BARCODE_FAILED';

export class FoodApiError extends Error {
  constructor(
    readonly code: FoodApiErrorCode,
    readonly status: number,
  ) {
    super(code);
    this.name = 'FoodApiError';
  }
}

type OFFProduct = {
  product_name?: string;
  brands?: string;
  image_front_small_url?: string;
  image_front_url?: string;
  nutriments?: {
    'energy-kcal_100g'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
};

function mapProduct(product: OFFProduct): FoodResult | null {
  if (!product.product_name || !product.nutriments?.['energy-kcal_100g']) return null;
  return {
    name: product.product_name,
    brand: product.brands,
    imageUrl: product.image_front_small_url || product.image_front_url || undefined,
    kcalPer100g: toNumber(product.nutriments['energy-kcal_100g']),
    proteinPer100g: toNumber(product.nutriments.proteins_100g),
    carbsPer100g: toNumber(product.nutriments.carbohydrates_100g),
    fatPer100g: toNumber(product.nutriments.fat_100g),
  };
}

function toNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

async function fetchWithTimeout(url: string, timeoutMs = 7000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

export async function searchFood(query: string): Promise<FoodResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    trimmed,
  )}&search_simple=1&action=process&json=1&page_size=50`;

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        throw new FoodApiError('FOOD_SEARCH_FAILED', res.status);
      }

      const data = (await res.json()) as { products?: OFFProduct[] };
      const products = Array.isArray(data.products) ? data.products : [];

      return products.map(mapProduct).filter((product): product is FoodResult => product !== null);
    } catch (e) {
      lastError = e;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  throw lastError;
}

export async function getFoodByBarcode(barcode: string): Promise<FoodResult | null> {
  const normalized = barcode.replace(/\D/g, '');
  if (!normalized) return null;
  const response = await fetchWithTimeout(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(normalized)}.json`, 8000);
  if (!response.ok) throw new FoodApiError('FOOD_BARCODE_FAILED', response.status);
  const data = await response.json() as { status?: number; product?: OFFProduct };
  return data.status === 1 && data.product ? mapProduct(data.product) : null;
}
