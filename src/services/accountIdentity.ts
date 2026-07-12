import { getInstallIdentity } from './installIdentity';
import { supabase } from './supabase';

export function toRevenueCatAppUserId(userId: string): string {
  return `forge-user-${userId}`;
}

export async function getCurrentAuthenticatedUserId(): Promise<string | null> {
  if (!supabase) return null;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getCurrentAppUserId(): Promise<string> {
  const authenticatedUserId = await getCurrentAuthenticatedUserId();
  if (authenticatedUserId) {
    return toRevenueCatAppUserId(authenticatedUserId);
  }
  return getInstallIdentity();
}

export async function getCurrentDeviceId(): Promise<string> {
  return getInstallIdentity();
}
