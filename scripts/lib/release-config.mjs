import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function readEnvFile(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 1).trim().replace(/^(['"])(.*)\1$/, '$2');
        return [key, value];
      }),
  );
}

export function loadReleaseEnv(root, extraEnv = process.env) {
  return {
    ...readEnvFile(path.join(root, '.env')),
    ...readEnvFile(path.join(root, '.env.local')),
    ...readEnvFile(path.join(root, '.env.production')),
    ...readEnvFile(path.join(root, '.env.production.local')),
    ...extraEnv,
  };
}

function normalizeString(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseBoolean(value) {
  const normalized = normalizeString(value)?.toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return null;
}

function parseAppEnv(value) {
  const normalized = normalizeString(value)?.toLowerCase();
  if (['development', 'preview', 'production', 'test'].includes(normalized ?? '')) {
    return normalized;
  }
  return null;
}

function normalizeUrl(value) {
  const raw = normalizeString(value);
  return raw ? raw.replace(/\/$/, '') : null;
}

function isLocalhost(host) {
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
}

function isPrivateIpv4(host) {
  return /^10\./.test(host)
    || /^192\.168\./.test(host)
    || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
}

function isValidUrl(value, { allowHttpLocalhost }) {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return true;
    if (!allowHttpLocalhost || url.protocol !== 'http:') return false;
    return isLocalhost(url.hostname) || isPrivateIpv4(url.hostname);
  } catch {
    return false;
  }
}

function isSafeProductionUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !isLocalhost(url.hostname) && !isPrivateIpv4(url.hostname);
  } catch {
    return false;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function result(level, code, message) {
  return { level, code, message };
}

export function detectReleaseProfile(env) {
  return env.EAS_BUILD_PROFILE ?? env.FORGE_RELEASE_PROFILE ?? 'development';
}

export function detectReleasePlatform(env) {
  const value = (env.EAS_BUILD_PLATFORM ?? env.FORGE_RELEASE_PLATFORM ?? 'all').toLowerCase();
  if (value === 'ios' || value === 'android' || value === 'all') return value;
  return 'all';
}

export function validateAppManifest(root, { production }) {
  const issues = [];
  const appJsonPath = path.join(root, 'app.json');
  const easJsonPath = path.join(root, 'eas.json');
  const app = fs.existsSync(appJsonPath) ? readJson(appJsonPath).expo : null;
  const eas = fs.existsSync(easJsonPath) ? readJson(easJsonPath) : null;

  if (!app) {
    issues.push(result('blocker', 'APP_JSON_MISSING', 'app.json is missing.'));
    return issues;
  }

  if (!app.name) issues.push(result('blocker', 'APP_NAME_MISSING', 'Expo app name is missing.'));
  if (!app.slug) issues.push(result('blocker', 'APP_SLUG_MISSING', 'Expo slug is missing.'));
  if (!app.version) issues.push(result('blocker', 'APP_VERSION_MISSING', 'App version is missing.'));
  if (!app.ios?.bundleIdentifier) issues.push(result('blocker', 'IOS_BUNDLE_ID_MISSING', 'iOS bundle identifier is missing.'));
  if (!app.ios?.buildNumber) issues.push(result('blocker', 'IOS_BUILD_NUMBER_MISSING', 'iOS build number is missing.'));
  if (!app.android?.package) issues.push(result('blocker', 'ANDROID_PACKAGE_MISSING', 'Android package is missing.'));
  if (!Number.isInteger(app.android?.versionCode)) issues.push(result('blocker', 'ANDROID_VERSION_CODE_MISSING', 'Android versionCode is missing.'));
  if (!app.plugins?.some((plugin) => Array.isArray(plugin) ? plugin[0] === 'expo-image-picker' : plugin === 'expo-image-picker')) {
    issues.push(result('warning', 'IMAGE_PICKER_PLUGIN_MISSING', 'Image picker plugin not found.'));
  }

  if (!eas) {
    issues.push(result('warning', 'EAS_JSON_MISSING', 'eas.json is missing.'));
  } else if (production && !eas.build?.production) {
    issues.push(result('blocker', 'EAS_PRODUCTION_PROFILE_MISSING', 'EAS production build profile is missing.'));
  }

  return issues;
}

export function validateMobileReleaseConfig(env, options = {}) {
  const profile = options.profile ?? detectReleaseProfile(env);
  const platform = options.platform ?? detectReleasePlatform(env);
  const production = profile === 'production';
  const preview = profile === 'preview';
  const development = profile === 'development';
  const appEnv = parseAppEnv(env.EXPO_PUBLIC_APP_ENV);
  const allowLocalhost = appEnv === 'development' || appEnv === 'test' || development;
  const issues = [];

  const publicValues = {
    appEnv,
    templateProgramEngine: parseBoolean(env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE),
    progressionWrites: parseBoolean(env.EXPO_PUBLIC_PROGRESSION_WRITES),
    purchasesEnabled: parseBoolean(env.EXPO_PUBLIC_PURCHASES_ENABLED),
    privacyUrl: normalizeUrl(env.EXPO_PUBLIC_PRIVACY_URL),
    termsUrl: normalizeUrl(env.EXPO_PUBLIC_TERMS_URL),
    supportEmail: normalizeString(env.EXPO_PUBLIC_SUPPORT_EMAIL),
    aiApiUrl: normalizeUrl(env.EXPO_PUBLIC_AI_API_URL),
    iosRevenueCatKey: normalizeString(env.EXPO_PUBLIC_RC_IOS_API_KEY),
    androidRevenueCatKey: normalizeString(env.EXPO_PUBLIC_RC_ANDROID_API_KEY),
  };

  if (!publicValues.appEnv) {
    issues.push(result(production ? 'blocker' : 'warning', 'APP_ENV_MISSING', 'EXPO_PUBLIC_APP_ENV must be set to development, preview, production, or test.'));
  }

  if (preview && publicValues.appEnv && publicValues.appEnv !== 'preview') {
    issues.push(result('blocker', 'APP_ENV_PROFILE_MISMATCH', 'Preview profile requires EXPO_PUBLIC_APP_ENV=preview.'));
  }
  if (production && publicValues.appEnv && publicValues.appEnv !== 'production') {
    issues.push(result('blocker', 'APP_ENV_PROFILE_MISMATCH', 'Production profile requires EXPO_PUBLIC_APP_ENV=production.'));
  }

  if (production && publicValues.templateProgramEngine !== true) {
    issues.push(result('blocker', 'WORKOUT_ENGINE_FLAG_DISABLED', 'Production rollout requires EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE=true.'));
  }
  if (production && publicValues.progressionWrites !== true) {
    issues.push(result('blocker', 'PROGRESSION_WRITES_DISABLED', 'Production rollout requires EXPO_PUBLIC_PROGRESSION_WRITES=true.'));
  }

  for (const [key, value] of [
    ['EXPO_PUBLIC_PRIVACY_URL', publicValues.privacyUrl],
    ['EXPO_PUBLIC_TERMS_URL', publicValues.termsUrl],
    ['EXPO_PUBLIC_AI_API_URL', publicValues.aiApiUrl],
  ]) {
    if (production && !value) {
      issues.push(result('blocker', `${key}_MISSING`, `${key} is required for production mobile releases.`));
      continue;
    }
    if (value && !isValidUrl(value, { allowHttpLocalhost: allowLocalhost })) {
      issues.push(result('blocker', `${key}_INVALID`, `${key} must be HTTPS, except localhost/private HTTP is allowed only in development or test.`));
    }
  }

  if (production && publicValues.aiApiUrl && !isSafeProductionUrl(publicValues.aiApiUrl)) {
    issues.push(result('blocker', 'AI_API_URL_UNSAFE', 'Production AI API URL must be HTTPS and must not target localhost or a private network.'));
  }

  if (production && !publicValues.supportEmail) {
    issues.push(result('blocker', 'SUPPORT_EMAIL_MISSING', 'EXPO_PUBLIC_SUPPORT_EMAIL is required for production mobile releases.'));
  } else if (publicValues.supportEmail && !isValidEmail(publicValues.supportEmail)) {
    issues.push(result('blocker', 'SUPPORT_EMAIL_INVALID', 'EXPO_PUBLIC_SUPPORT_EMAIL must be a valid email address.'));
  }

  if (production && publicValues.purchasesEnabled !== true) {
    issues.push(result('blocker', 'PURCHASES_DISABLED', 'Production mobile releases require EXPO_PUBLIC_PURCHASES_ENABLED=true.'));
  }

  const purchasesNeedKeys = production || (preview && publicValues.purchasesEnabled === true);
  if (purchasesNeedKeys) {
    if ((platform === 'ios' || platform === 'all') && !publicValues.iosRevenueCatKey) {
      issues.push(result('blocker', 'RC_IOS_KEY_MISSING', 'EXPO_PUBLIC_RC_IOS_API_KEY is required for this release target.'));
    }
    if ((platform === 'android' || platform === 'all') && !publicValues.androidRevenueCatKey) {
      issues.push(result('blocker', 'RC_ANDROID_KEY_MISSING', 'EXPO_PUBLIC_RC_ANDROID_API_KEY is required for this release target.'));
    }
  }

  return {
    profile,
    platform,
    blockers: issues.filter((issue) => issue.level === 'blocker'),
    warnings: issues.filter((issue) => issue.level === 'warning'),
  };
}

export function validateServerDeploymentConfig(env, options = {}) {
  const profile = options.profile ?? detectReleaseProfile(env);
  const issues = [];

  for (const [key, value] of [
    ['GEMINI_API_KEY', normalizeString(env.GEMINI_API_KEY)],
    ['REVENUECAT_SECRET_API_KEY', normalizeString(env.REVENUECAT_SECRET_API_KEY)],
    ['UPSTASH_REDIS_REST_URL', normalizeString(env.UPSTASH_REDIS_REST_URL)],
    ['UPSTASH_REDIS_REST_TOKEN', normalizeString(env.UPSTASH_REDIS_REST_TOKEN)],
  ]) {
    if (!value) {
      issues.push(result('blocker', `${key}_MISSING`, `${key} is required for server deployments.`));
    }
  }

  return {
    profile,
    blockers: issues,
    warnings: [],
  };
}

export function summarizeValidation(validation) {
  const status = validation.blockers.length > 0 ? 'blocker' : validation.warnings.length > 0 ? 'warning' : 'pass';
  return { status, ...validation };
}

export function runInlineBundleSmoke(root) {
  const fixtureEnv = {
    ...process.env,
    EXPO_PUBLIC_APP_ENV: 'preview',
    EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
    EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
    EXPO_PUBLIC_PHYSIQUE_ADAPTATION_WRITES: 'false',
    EXPO_PUBLIC_PURCHASES_ENABLED: 'false',
    EXPO_PUBLIC_AI_API_URL: 'https://inline-smoke.forgev1.example.com',
    EXPO_PUBLIC_PRIVACY_URL: 'https://inline-smoke.forgev1.example.com/privacy',
    EXPO_PUBLIC_TERMS_URL: 'https://inline-smoke.forgev1.example.com/terms',
    EXPO_PUBLIC_SUPPORT_EMAIL: 'inline-smoke@forge.test',
    GEMINI_API_KEY: 'SERVER_SECRET_SENTINEL_GEMINI',
    REVENUECAT_SECRET_API_KEY: 'SERVER_SECRET_SENTINEL_REVENUECAT',
    UPSTASH_REDIS_REST_URL: 'SERVER_SECRET_SENTINEL_UPSTASH_URL',
    UPSTASH_REDIS_REST_TOKEN: 'SERVER_SECRET_SENTINEL_UPSTASH_TOKEN',
  };

  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'forge-inline-smoke-'));
  const command = spawnSync('npx', ['expo', 'export', '--platform', 'ios', '--output-dir', outputDir, '--no-bytecode'], {
    cwd: root,
    env: fixtureEnv,
    encoding: 'utf8',
  });

  if (command.status !== 0) {
    try {
      fs.rmSync(outputDir, { recursive: true, force: true });
    } catch {}
    return {
      status: 'blocker',
      outputDir,
      error: command.stderr || command.stdout || 'Expo export failed.',
      checks: [],
    };
  }

  const bundlePath = findFirstBundle(outputDir);
  const bundle = bundlePath ? fs.readFileSync(bundlePath) : Buffer.from('');
  const checks = [
    { name: 'app_env_marker', pass: bundle.includes(Buffer.from('forge-app-env:preview')) },
    { name: 'template_flag_marker', pass: bundle.includes(Buffer.from('forge-template-engine:on')) },
    { name: 'ai_url_marker', pass: bundle.includes(Buffer.from('https://inline-smoke.forgev1.example.com')) },
    { name: 'dynamic_process_env_lookup', pass: !bundle.includes(Buffer.from('process.env[')) },
    { name: 'server_secret_sentinel_absent', pass: !bundle.includes(Buffer.from('SERVER_SECRET_SENTINEL_')) },
  ];
  const requiredChecks = checks.filter((check) => check.name !== 'app_env_marker');

  try {
    fs.rmSync(outputDir, { recursive: true, force: true });
  } catch {}

  return {
    status: requiredChecks.every((check) => check.pass) ? 'pass' : 'blocker',
    outputDir,
    bundlePath,
    checks,
  };
}

function findFirstBundle(root) {
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const target = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(target);
        continue;
      }
      if (target.endsWith('.hbc') || target.endsWith('.js')) {
        return target;
      }
    }
  }
  return null;
}
