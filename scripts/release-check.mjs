import {
  detectReleasePlatform,
  detectReleaseProfile,
  loadReleaseEnv,
  summarizeValidation,
  validateAppManifest,
  validateMobileReleaseConfig,
  validateServerDeploymentConfig,
} from './lib/release-config.mjs';

const root = process.cwd();
const env = loadReleaseEnv(root);
const profile = detectReleaseProfile(env);
const platform = detectReleasePlatform(env);
const manifestIssues = validateAppManifest(root, { production: profile === 'production' });
const mobile = validateMobileReleaseConfig(env, { profile, platform });
const server = validateServerDeploymentConfig(env, { profile });
const blockers = [
  ...manifestIssues.filter((issue) => issue.level === 'blocker'),
  ...mobile.blockers,
  ...server.blockers,
];
const warnings = [
  ...manifestIssues.filter((issue) => issue.level === 'warning'),
  ...mobile.warnings,
  ...server.warnings,
];
const summary = summarizeValidation({ profile, platform, blockers, warnings });

console.log(JSON.stringify(summary, null, 2));
if (summary.status === 'blocker') process.exit(1);
