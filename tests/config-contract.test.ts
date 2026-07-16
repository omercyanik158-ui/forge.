import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { clientConfig, getClientConfigIssues } from '@/config/clientConfig';
import { getServerConfigIssues } from '@/server/serverConfig';

const root = path.resolve(__dirname, '..');

function runNodeScript(script: string, env: Record<string, string | undefined>) {
  return execFileSync('node', [script], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, ...env },
  });
}

function runNodeScriptExpectFailure(script: string, env: Record<string, string | undefined>) {
  try {
    return runNodeScript(script, env);
  } catch (error) {
    return String((error as { stdout?: string }).stdout || '');
  }
}

describe('client config boundaries', () => {
  it('keeps dynamic process.env access out of client-importable source files', () => {
    const files = [
      'app/ai-program-builder.tsx',
      'app/premium.tsx',
      'app/settings-privacy.tsx',
      'src/services/workoutEngineFeatureFlags.ts',
      'src/services/purchaseService.ts',
      'src/services/geminiService.ts',
      'src/services/rewardedCreditApi.ts',
      'src/services/imageApi.ts',
      'src/services/analyticsService.ts',
      'src/services/supabase.ts',
      'src/services/errorReporting.ts',
      'src/config/premium.ts',
      'src/config/rewardedAds.ts',
    ];

    for (const relativePath of files) {
      const source = readFileSync(path.join(root, relativePath), 'utf8');
      expect(source, relativePath).not.toContain('process.env[');
      expect(source, relativePath).not.toContain('process.env.EXPO_PUBLIC_');
    }
  });

  it('keeps server config imports out of app and client services', () => {
    const files = [
      'app/ai-program-builder.tsx',
      'app/premium.tsx',
      'app/settings-privacy.tsx',
      'src/services/purchaseService.ts',
      'src/services/geminiService.ts',
      'src/services/rewardedCreditApi.ts',
      'src/services/imageApi.ts',
      'src/services/analyticsService.ts',
      'src/services/supabase.ts',
      'src/services/errorReporting.ts',
    ];

    for (const relativePath of files) {
      const source = readFileSync(path.join(root, relativePath), 'utf8');
      expect(source, relativePath).not.toContain('serverConfig');
      expect(source, relativePath).not.toContain('@/server/');
    }
  });

  it('exposes explicit client config issues for unknown app environments', () => {
    expect(clientConfig.appEnv === 'unknown' || clientConfig.isKnownAppEnv).toBe(true);
    if (clientConfig.appEnv === 'unknown') {
      expect(getClientConfigIssues().some((issue) => issue.key === 'EXPO_PUBLIC_APP_ENV')).toBe(true);
    }
  });

  it('keeps server-only config issues separate from client config', () => {
    const issues = getServerConfigIssues();
    expect(Array.isArray(issues)).toBe(true);
    expect(issues.every((issue) => !issue.key.startsWith('EXPO_PUBLIC_'))).toBe(true);
  });
});

describe('release config matrix', () => {
  it('allows development profile with missing optional config', () => {
    const output = runNodeScript('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'development',
      EXPO_PUBLIC_APP_ENV: 'development',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'false',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'false',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'false',
      EXPO_PUBLIC_AI_API_URL: '',
    });
    expect(JSON.parse(output).status).not.toBe('blocker');
  });

  it('allows preview profile when purchases are disabled', () => {
    const output = runNodeScript('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'preview',
      EXPO_PUBLIC_APP_ENV: 'preview',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'false',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
    });
    expect(JSON.parse(output).status).toBe('pass');
  });

  it('blocks preview profile when purchases are enabled but platform key is missing', () => {
    const output = runNodeScriptExpectFailure('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'preview',
      FORGE_RELEASE_PLATFORM: 'ios',
      EXPO_PUBLIC_APP_ENV: 'preview',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'true',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
      EXPO_PUBLIC_RC_IOS_API_KEY: '',
    });
    expect(JSON.parse(output).blockers.some((issue: { code: string }) => issue.code === 'RC_IOS_KEY_MISSING')).toBe(true);
  });

  it('blocks production when app environment is missing', () => {
    const output = runNodeScriptExpectFailure('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'production',
      EXPO_PUBLIC_APP_ENV: '',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'true',
      EXPO_PUBLIC_PRIVACY_URL: 'https://forge.example.com/privacy',
      EXPO_PUBLIC_TERMS_URL: 'https://forge.example.com/terms',
      EXPO_PUBLIC_SUPPORT_EMAIL: 'support@forge.test',
      EXPO_PUBLIC_AI_API_URL: 'https://api.forge.test',
      EXPO_PUBLIC_RC_IOS_API_KEY: 'ios_public_key',
      EXPO_PUBLIC_RC_ANDROID_API_KEY: 'android_public_key',
    });
    expect(JSON.parse(output).blockers.some((issue: { code: string }) => issue.code === 'APP_ENV_MISSING')).toBe(true);
  });

  it('blocks production when core feature flags are off', () => {
    const output = runNodeScriptExpectFailure('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'production',
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'false',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'false',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'true',
      EXPO_PUBLIC_PRIVACY_URL: 'https://forge.example.com/privacy',
      EXPO_PUBLIC_TERMS_URL: 'https://forge.example.com/terms',
      EXPO_PUBLIC_SUPPORT_EMAIL: 'support@forge.test',
      EXPO_PUBLIC_AI_API_URL: 'https://api.forge.test',
      EXPO_PUBLIC_RC_IOS_API_KEY: 'ios_public_key',
      EXPO_PUBLIC_RC_ANDROID_API_KEY: 'android_public_key',
    });
    const blockers = JSON.parse(output).blockers.map((issue: { code: string }) => issue.code);
    expect(blockers).toEqual(expect.arrayContaining(['WORKOUT_ENGINE_FLAG_DISABLED', 'PROGRESSION_WRITES_DISABLED']));
  });

  it('blocks production when legal URLs are missing', () => {
    const output = runNodeScriptExpectFailure('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'production',
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'true',
      EXPO_PUBLIC_PRIVACY_URL: '',
      EXPO_PUBLIC_TERMS_URL: '',
      EXPO_PUBLIC_SUPPORT_EMAIL: 'support@forge.test',
      EXPO_PUBLIC_AI_API_URL: 'https://api.forge.test',
      EXPO_PUBLIC_RC_IOS_API_KEY: 'ios_public_key',
      EXPO_PUBLIC_RC_ANDROID_API_KEY: 'android_public_key',
    });
    const blockers = JSON.parse(output).blockers.map((issue: { code: string }) => issue.code);
    expect(blockers).toEqual(expect.arrayContaining(['EXPO_PUBLIC_PRIVACY_URL_MISSING', 'EXPO_PUBLIC_TERMS_URL_MISSING']));
  });

  it('blocks production when support email is invalid', () => {
    const output = runNodeScriptExpectFailure('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'production',
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'true',
      EXPO_PUBLIC_PRIVACY_URL: 'https://forge.example.com/privacy',
      EXPO_PUBLIC_TERMS_URL: 'https://forge.example.com/terms',
      EXPO_PUBLIC_SUPPORT_EMAIL: 'not-an-email',
      EXPO_PUBLIC_AI_API_URL: 'https://api.forge.test',
      EXPO_PUBLIC_RC_IOS_API_KEY: 'ios_public_key',
      EXPO_PUBLIC_RC_ANDROID_API_KEY: 'android_public_key',
    });
    expect(JSON.parse(output).blockers.some((issue: { code: string }) => issue.code === 'SUPPORT_EMAIL_INVALID')).toBe(true);
  });

  it('blocks production when AI URL uses HTTP localhost', () => {
    const output = runNodeScriptExpectFailure('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'production',
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'true',
      EXPO_PUBLIC_PRIVACY_URL: 'https://forge.example.com/privacy',
      EXPO_PUBLIC_TERMS_URL: 'https://forge.example.com/terms',
      EXPO_PUBLIC_SUPPORT_EMAIL: 'support@forge.test',
      EXPO_PUBLIC_AI_API_URL: 'http://localhost:3000',
      EXPO_PUBLIC_RC_IOS_API_KEY: 'ios_public_key',
      EXPO_PUBLIC_RC_ANDROID_API_KEY: 'android_public_key',
    });
    const blockers = JSON.parse(output).blockers.map((issue: { code: string }) => issue.code);
    expect(blockers).toEqual(expect.arrayContaining(['EXPO_PUBLIC_AI_API_URL_INVALID', 'AI_API_URL_UNSAFE']));
  });

  it('blocks production iOS when RevenueCat iOS key is missing', () => {
    const output = runNodeScriptExpectFailure('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'production',
      FORGE_RELEASE_PLATFORM: 'ios',
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'true',
      EXPO_PUBLIC_PRIVACY_URL: 'https://forge.example.com/privacy',
      EXPO_PUBLIC_TERMS_URL: 'https://forge.example.com/terms',
      EXPO_PUBLIC_SUPPORT_EMAIL: 'support@forge.test',
      EXPO_PUBLIC_AI_API_URL: 'https://api.forge.test',
      EXPO_PUBLIC_RC_IOS_API_KEY: '',
      EXPO_PUBLIC_RC_ANDROID_API_KEY: 'android_public_key',
    });
    expect(JSON.parse(output).blockers.some((issue: { code: string }) => issue.code === 'RC_IOS_KEY_MISSING')).toBe(true);
  });

  it('blocks production Android when RevenueCat Android key is missing', () => {
    const output = runNodeScriptExpectFailure('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'production',
      FORGE_RELEASE_PLATFORM: 'android',
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'true',
      EXPO_PUBLIC_PRIVACY_URL: 'https://forge.example.com/privacy',
      EXPO_PUBLIC_TERMS_URL: 'https://forge.example.com/terms',
      EXPO_PUBLIC_SUPPORT_EMAIL: 'support@forge.test',
      EXPO_PUBLIC_AI_API_URL: 'https://api.forge.test',
      EXPO_PUBLIC_RC_IOS_API_KEY: 'ios_public_key',
      EXPO_PUBLIC_RC_ANDROID_API_KEY: '',
    });
    expect(JSON.parse(output).blockers.some((issue: { code: string }) => issue.code === 'RC_ANDROID_KEY_MISSING')).toBe(true);
  });

  it('blocks server deployments when Gemini key is missing', () => {
    const output = runNodeScriptExpectFailure('scripts/check-server-config.mjs', {
      GEMINI_API_KEY: '',
      REVENUECAT_SECRET_API_KEY: 'secret_revcat',
      UPSTASH_REDIS_REST_URL: 'https://upstash.example.com',
      UPSTASH_REDIS_REST_TOKEN: 'upstash_token',
    });
    expect(JSON.parse(output).blockers.some((issue: { code: string }) => issue.code === 'GEMINI_API_KEY_MISSING')).toBe(true);
  });

  it('blocks server deployments when Upstash token is missing', () => {
    const output = runNodeScriptExpectFailure('scripts/check-server-config.mjs', {
      GEMINI_API_KEY: 'gemini_key',
      REVENUECAT_SECRET_API_KEY: 'secret_revcat',
      UPSTASH_REDIS_REST_URL: 'https://upstash.example.com',
      UPSTASH_REDIS_REST_TOKEN: '',
    });
    expect(JSON.parse(output).blockers.some((issue: { code: string }) => issue.code === 'UPSTASH_REDIS_REST_TOKEN_MISSING')).toBe(true);
  });

  it('accepts a structurally valid full fixture config', () => {
    const mobile = runNodeScript('scripts/check-release-config.mjs', {
      FORGE_RELEASE_PROFILE: 'production',
      FORGE_RELEASE_PLATFORM: 'all',
      EXPO_PUBLIC_APP_ENV: 'production',
      EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
      EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
      EXPO_PUBLIC_PURCHASES_ENABLED: 'true',
      EXPO_PUBLIC_PRIVACY_URL: 'https://forge.example.com/privacy',
      EXPO_PUBLIC_TERMS_URL: 'https://forge.example.com/terms',
      EXPO_PUBLIC_SUPPORT_EMAIL: 'support@forge.test',
      EXPO_PUBLIC_AI_API_URL: 'https://api.forge.test',
      EXPO_PUBLIC_RC_IOS_API_KEY: 'ios_public_key',
      EXPO_PUBLIC_RC_ANDROID_API_KEY: 'android_public_key',
    });
    const server = runNodeScript('scripts/check-server-config.mjs', {
      GEMINI_API_KEY: 'gemini_key',
      REVENUECAT_SECRET_API_KEY: 'secret_revcat',
      UPSTASH_REDIS_REST_URL: 'https://upstash.example.com',
      UPSTASH_REDIS_REST_TOKEN: 'upstash_token',
    });
    expect(JSON.parse(mobile).status).toBe('pass');
    expect(JSON.parse(server).status).toBe('pass');
  });
});
