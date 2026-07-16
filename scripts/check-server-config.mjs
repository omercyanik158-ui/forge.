import { detectReleaseProfile, loadReleaseEnv, summarizeValidation, validateServerDeploymentConfig } from './lib/release-config.mjs';

const root = process.cwd();
const env = loadReleaseEnv(root);
const profile = detectReleaseProfile(env);
const result = summarizeValidation(validateServerDeploymentConfig(env, { profile }));

console.log(JSON.stringify(result, null, 2));
if (result.status === 'blocker') process.exit(1);
