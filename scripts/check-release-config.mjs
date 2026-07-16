import {
  detectReleasePlatform,
  detectReleaseProfile,
  loadReleaseEnv,
  summarizeValidation,
  validateAppManifest,
  validateMobileReleaseConfig,
} from './lib/release-config.mjs';

const root = process.cwd();
const env = loadReleaseEnv(root);
const profile = detectReleaseProfile(env);
const platform = detectReleasePlatform(env);
const manifestIssues = validateAppManifest(root, { production: profile === 'production' });
const mobile = validateMobileReleaseConfig(env, { profile, platform });
const summary = summarizeValidation({
  profile,
  platform,
  blockers: [...manifestIssues.filter((issue) => issue.level === 'blocker'), ...mobile.blockers],
  warnings: [...manifestIssues.filter((issue) => issue.level === 'warning'), ...mobile.warnings],
});

console.log(JSON.stringify(summary, null, 2));
if (summary.status === 'blocker') process.exit(1);
