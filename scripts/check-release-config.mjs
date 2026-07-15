import fs from 'node:fs';
import path from 'node:path';

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

function result(level, code, message) {
  return { level, code, message };
}

const root = process.cwd();
const appJsonPath = path.join(root, 'app.json');
const easJsonPath = path.join(root, 'eas.json');
const app = fs.existsSync(appJsonPath) ? readJson(appJsonPath).expo : null;
const eas = fs.existsSync(easJsonPath) ? readJson(easJsonPath) : null;
const issues = [];
const profile = process.env.EAS_BUILD_PROFILE ?? process.env.FORGE_RELEASE_PROFILE ?? 'development';
const production = profile === 'production';

if (!app) {
  issues.push(result('blocker', 'APP_JSON_MISSING', 'app.json is missing.'));
} else {
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
  if (production && process.env.EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE !== 'true') {
    issues.push(result('blocker', 'WORKOUT_ENGINE_FLAG_DISABLED', 'Production rollout requires EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE=true.'));
  }
  if (production && process.env.EXPO_PUBLIC_PROGRESSION_WRITES !== 'true') {
    issues.push(result('blocker', 'PROGRESSION_WRITES_DISABLED', 'Production rollout requires EXPO_PUBLIC_PROGRESSION_WRITES=true.'));
  }
}

if (!eas) {
  issues.push(result('warning', 'EAS_JSON_MISSING', 'eas.json is missing.'));
} else if (!eas.build?.production) {
  issues.push(result('blocker', 'EAS_PRODUCTION_PROFILE_MISSING', 'EAS production build profile is missing.'));
}

const blockers = issues.filter((issue) => issue.level === 'blocker');
const warnings = issues.filter((issue) => issue.level === 'warning');
const status = blockers.length > 0 ? 'blocker' : warnings.length > 0 ? 'warning' : 'pass';
console.log(JSON.stringify({ status, profile, blockers, warnings }, null, 2));
if (blockers.length > 0) process.exit(1);
