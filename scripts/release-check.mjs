import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

function readEnvFile(file) {
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, 'utf8')
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

const releaseEnv = {
  ...readEnvFile('.env'),
  ...readEnvFile('.env.local'),
  ...readEnvFile('.env.production'),
  ...readEnvFile('.env.production.local'),
  ...process.env,
};

const releaseValues = {
  EXPO_PUBLIC_RC_IOS_API_KEY: releaseEnv.EXPO_PUBLIC_RC_IOS_API_KEY,
  EXPO_PUBLIC_RC_ANDROID_API_KEY: releaseEnv.EXPO_PUBLIC_RC_ANDROID_API_KEY,
  EXPO_PUBLIC_AI_API_URL: releaseEnv.EXPO_PUBLIC_AI_API_URL,
  EXPO_PUBLIC_PRIVACY_URL: releaseEnv.EXPO_PUBLIC_PRIVACY_URL,
  EXPO_PUBLIC_TERMS_URL: releaseEnv.EXPO_PUBLIC_TERMS_URL,
  EXPO_PUBLIC_SUPPORT_EMAIL: releaseEnv.EXPO_PUBLIC_SUPPORT_EMAIL,
  GEMINI_API_KEY: releaseEnv.GEMINI_API_KEY,
  REVENUECAT_SECRET_API_KEY: releaseEnv.REVENUECAT_SECRET_API_KEY,
  UPSTASH_REDIS_REST_URL: releaseEnv.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: releaseEnv.UPSTASH_REDIS_REST_TOKEN,
};
const missing = Object.entries(releaseValues).filter(([, value]) => !value?.trim()).map(([key]) => key);
const invalid = [];
const failures = [];

function collectFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? collectFiles(target) : [target];
  });
}

if (releaseEnv.EXPO_PUBLIC_PURCHASES_ENABLED !== 'true') {
  invalid.push('EXPO_PUBLIC_PURCHASES_ENABLED=true olmali');
}

for (const [key, value] of Object.entries({
  EXPO_PUBLIC_AI_API_URL: releaseEnv.EXPO_PUBLIC_AI_API_URL,
  EXPO_PUBLIC_PRIVACY_URL: releaseEnv.EXPO_PUBLIC_PRIVACY_URL,
  EXPO_PUBLIC_TERMS_URL: releaseEnv.EXPO_PUBLIC_TERMS_URL,
})) {
  if (value && !/^https:\/\//i.test(value)) invalid.push(`${key} HTTPS adresi olmali`);
}

const supportEmail = releaseEnv.EXPO_PUBLIC_SUPPORT_EMAIL;
if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
  invalid.push('EXPO_PUBLIC_SUPPORT_EMAIL gecerli bir e-posta olmali');
}

const adMobEnabled = releaseEnv.EXPO_PUBLIC_ADMOB_ENABLED === 'true';
const adMobTestMode = releaseEnv.EXPO_PUBLIC_ADMOB_TEST_MODE === 'true';
if (adMobEnabled && adMobTestMode) {
  invalid.push('EXPO_PUBLIC_ADMOB_TEST_MODE production release icin false olmali');
}

if (adMobEnabled) {
  const requiredAdMobValues = {
    EXPO_PUBLIC_ADMOB_IOS_APP_ID: releaseEnv.EXPO_PUBLIC_ADMOB_IOS_APP_ID,
    EXPO_PUBLIC_ADMOB_ANDROID_APP_ID: releaseEnv.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID,
    EXPO_PUBLIC_ADMOB_IOS_REWARDED_MEAL_AD_UNIT_ID: releaseEnv.EXPO_PUBLIC_ADMOB_IOS_REWARDED_MEAL_AD_UNIT_ID,
    EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_MEAL_AD_UNIT_ID: releaseEnv.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_MEAL_AD_UNIT_ID,
    EXPO_PUBLIC_ADMOB_IOS_REWARDED_PHYSIQUE_AD_UNIT_ID: releaseEnv.EXPO_PUBLIC_ADMOB_IOS_REWARDED_PHYSIQUE_AD_UNIT_ID,
    EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_PHYSIQUE_AD_UNIT_ID: releaseEnv.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_PHYSIQUE_AD_UNIT_ID,
  };

  for (const [key, value] of Object.entries(requiredAdMobValues)) {
    if (!value?.trim()) missing.push(key);
  }
}

const forbiddenPatterns = [
  { pattern: /\bTODO\b|\bFIXME\b/g, message: 'TODO/FIXME kaldi' },
  { pattern: /Coming soon|Yakında|Support address is being prepared|Destek adresi hazırlanıyor|Email will be added before release|Yayın öncesi e-posta eklenecek/g, message: 'placeholder release metni kaldi' },
  { pattern: /https?:\/\/(?:localhost|127\.0\.0\.1)/g, message: "lokal gelistirme URL'si kaldi" },
];

const releaseDocumentChecks = [
  {
    file: 'docs/APP_STORE_METADATA.md',
    patterns: [
      { pattern: /To be filled after support email\/domain is ready\./g, message: 'Support URL placeholder kaldi' },
      { pattern: /To be filled with the published privacy policy page before submission\./g, message: 'Privacy policy URL placeholder kaldi' },
      { pattern: /github\.com\/.+\/blob\/.+/g, message: 'GitHub blob URL yerine dogrudan yayin URLsi veya raw dokuman kullanilmali' },
    ],
  },
];

for (const file of ['app', 'src'].flatMap((root) => (existsSync(root) ? collectFiles(root) : []))) {
  if (!/\.(ts|tsx)$/.test(file)) continue;
  const content = readFileSync(file, 'utf8');
  for (const { pattern, message } of forbiddenPatterns) {
    if (pattern.test(content)) failures.push(`${file}: ${message}`);
  }
}

for (const { file, patterns } of releaseDocumentChecks) {
  if (!existsSync(file)) continue;
  const content = readFileSync(file, 'utf8');
  for (const { pattern, message } of patterns) {
    if (pattern.test(content)) failures.push(`${file}: ${message}`);
  }
}

if (missing.length || invalid.length || failures.length) {
  console.error('Yayin yapilandirmasi tamamlanmadi.');
  if (missing.length) console.error(`Eksik degerler: ${missing.join(', ')}`);
  for (const issue of invalid) console.error(`- ${issue}`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Yayin icin gerekli magaza, AI, yasal belge ve destek ayarlari hazir.');
