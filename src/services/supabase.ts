import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return typeof supabaseUrl === 'string'
    && supabaseUrl.length > 0
    && typeof supabaseAnonKey === 'string'
    && supabaseAnonKey.length > 0;
}

export function supabaseConfigurationError(): Error {
  const missing = [
    supabaseUrl ? null : 'EXPO_PUBLIC_SUPABASE_URL',
    supabaseAnonKey ? null : 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  ].filter((item): item is string => item !== null);

  return new Error(
    missing.length > 0
      ? `Supabase config is missing: ${missing.join(', ')}. Restart Expo after updating .env.local.`
      : 'Supabase is not configured. Restart Expo so the latest env values are bundled.',
  );
}

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
