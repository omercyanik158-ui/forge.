import { runInlineBundleSmoke } from './lib/release-config.mjs';

const result = runInlineBundleSmoke(process.cwd());
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'pass') process.exit(1);
