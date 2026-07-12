import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { checkRateLimit, clearRateLimitState } from '@/server/rateLimit';

describe('rate limiter', () => {
  beforeEach(() => clearRateLimitState());
  afterEach(() => {
    vi.useRealTimers();
  });

  it('izin verir ve kalan hak sayar', async () => {
    const result = await checkRateLimit('ip-a', 3, 10_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('limit dolunca reddeder ve retry-after hesaplar', async () => {
    await checkRateLimit('ip-b', 2, 10_000);
    await checkRateLimit('ip-b', 2, 10_000);
    const blocked = await checkRateLimit('ip-b', 2, 10_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('farklı anahtarlar bağımsız sayılır', async () => {
    await checkRateLimit('ip-c', 1, 10_000);
    const other = await checkRateLimit('ip-d', 1, 10_000);
    expect(other.allowed).toBe(true);
  });

  it('pencere geçince tekrar açılır', async () => {
    vi.useFakeTimers();

    await checkRateLimit('ip-e', 1, 1000);
    const blocked = await checkRateLimit('ip-e', 1, 1000);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(1500);
    const reopened = await checkRateLimit('ip-e', 1, 1000);
    expect(reopened.allowed).toBe(true);
  });

  it('fallback bellekte ardışık istekleri azaltır', async () => {
    const first = await checkRateLimit('ip-f', 3, 60_000);
    const second = await checkRateLimit('ip-f', 3, 60_000);
    expect(first.remaining).toBe(2);
    expect(second.remaining).toBe(1);
  });
});
