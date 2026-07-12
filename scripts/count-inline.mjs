import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SKIP = new Set(['node_modules', '.git', 'assets']);
let total = 0;
const files = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      walk(p);
    } else if (/\.(ts|tsx)$/.test(name)) {
      const c = readFileSync(p, 'utf8');
      const m = c.match(/\{\s*tr:\s*['"][^'"]*['"]\s*,\s*en:\s*['"][^'"]*['"]\s*\}/g);
      if (m) {
        total += m.length;
        files.push({ p: p.replace(/\\/g, '/'), n: m.length });
      }
    }
  }
}

walk('app');
files.sort((a, b) => b.n - a.n);
console.log('Total inline:', total, 'Files:', files.length);
for (const f of files) console.log(`  ${String(f.n).padStart(3)}  ${f.p}`);
