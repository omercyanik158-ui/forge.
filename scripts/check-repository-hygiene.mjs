import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const maxBytes = 5 * 1024 * 1024;
const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf-8' })
  .split('\n')
  .filter(Boolean);
const issues = [];

for (const file of tracked) {
  const abs = path.join(root, file);
  if (!fs.existsSync(abs)) continue;
  const stat = fs.statSync(abs);
  if (stat.size > maxBytes) {
    issues.push({ code: 'LARGE_TRACKED_FILE', file, sizeBytes: stat.size });
  }
  if (file.endsWith('.DS_Store') || file.endsWith('.save') || file.endsWith('.bak')) {
    issues.push({ code: 'TEMP_TRACKED_FILE', file, sizeBytes: stat.size });
  }
  if (/programs_detailed_boostcamp_kaggle\.csv$/.test(file)) {
    issues.push({ code: 'RAW_DATASET_TRACKED', file, sizeBytes: stat.size });
  }
}

console.log(JSON.stringify({ status: issues.length ? 'blocker' : 'pass', issues }, null, 2));
if (issues.length) process.exit(1);
