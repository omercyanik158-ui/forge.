import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const FIXTURE_ENV = {
  EXPO_PUBLIC_APP_ENV: 'preview',
  EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE: 'true',
  EXPO_PUBLIC_PROGRESSION_WRITES: 'true',
  EXPO_PUBLIC_PURCHASES_ENABLED: 'false',
  EXPO_PUBLIC_AI_API_URL: 'https://preview.forge.example.com',
  EXPO_PUBLIC_PRIVACY_URL: 'https://preview.forge.example.com/privacy',
  EXPO_PUBLIC_TERMS_URL: 'https://preview.forge.example.com/terms',
  EXPO_PUBLIC_SUPPORT_EMAIL: 'support@forge.test',
};

const PLATFORM_BUDGETS = {
  ios: {
    maxBundleBytes: 6_400_000,
    maxAssetBytes: 3_700_000,
    maxExportBytes: 10_000_000,
    maxFontAssetBytes: 2_200_000,
  },
  android: {
    maxBundleBytes: 6_600_000,
    maxAssetBytes: 4_700_000,
    maxExportBytes: 11_200_000,
    maxFontAssetBytes: 3_200_000,
  },
};

function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(target, results);
      continue;
    }
    results.push(target);
  }
  return results;
}

function summarizeExport(dir) {
  const files = walk(dir);
  const metadataPath = path.join(dir, 'metadata.json');
  const metadata = fs.existsSync(metadataPath)
    ? JSON.parse(fs.readFileSync(metadataPath, 'utf8'))
    : null;
  let exportBytes = 0;
  let bundleBytes = 0;
  let assetBytes = 0;
  let fontAssetBytes = 0;

  const fontAssetPaths = new Set(
    Object.values(metadata?.fileMetadata ?? {})
      .flatMap((platformEntry) => platformEntry.assets ?? [])
      .filter((asset) => asset.ext === 'ttf' || asset.ext === 'otf')
      .map((asset) => asset.path),
  );

  for (const file of files) {
    const size = fs.statSync(file).size;
    exportBytes += size;
    if (/entry-.*\.(js|hbc)$/i.test(file)) {
      bundleBytes += size;
      continue;
    }
    if (/metadata\.json$/i.test(file)) {
      continue;
    }
    assetBytes += size;
    const relativePath = path.relative(dir, file).replace(/\\/g, '/');
    if (fontAssetPaths.has(relativePath)) {
      fontAssetBytes += size;
    }
  }

  return {
    exportBytes,
    bundleBytes,
    assetBytes,
    fontAssetBytes,
  };
}

function runPlatformExport(platform) {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), `forge-bundle-budget-${platform}-`));
  const command = spawnSync(
    'npx',
    ['expo', 'export', '--platform', platform, '--output-dir', outputDir, '--no-bytecode'],
    {
      cwd: process.cwd(),
      env: { ...process.env, ...FIXTURE_ENV },
      encoding: 'utf8',
    },
  );

  if (command.status !== 0) {
    return {
      status: 'blocker',
      platform,
      outputDir,
      error: command.stderr || command.stdout || 'Export failed.',
    };
  }

  const summary = summarizeExport(outputDir);
  const budget = PLATFORM_BUDGETS[platform];
  const checks = [
    { key: 'bundleBytes', actual: summary.bundleBytes, limit: budget.maxBundleBytes },
    { key: 'assetBytes', actual: summary.assetBytes, limit: budget.maxAssetBytes },
    { key: 'exportBytes', actual: summary.exportBytes, limit: budget.maxExportBytes },
    { key: 'fontAssetBytes', actual: summary.fontAssetBytes, limit: budget.maxFontAssetBytes },
  ];

  return {
    status: checks.every((check) => check.actual <= check.limit) ? 'pass' : 'blocker',
    platform,
    outputDir,
    summary,
    checks,
  };
}

const results = ['ios', 'android'].map(runPlatformExport);
const status = results.every((result) => result.status === 'pass') ? 'pass' : 'blocker';

console.log(JSON.stringify({ status, results }, null, 2));
if (status !== 'pass') process.exit(1);
