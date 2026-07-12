import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const roots = ["app", "src"];
const sourceExtensions = new Set([".ts", ".tsx"]);
const mojibakePattern = /(?:Ã.|Ä.|Å.|Â[\s·]|â€)/u;
const ambiguousAsciiTurkishPattern =
  /\b(?:haftalik|Haftalik|sinirsiz|Sinirsiz)\b/u;
const asciiTurkishMojibakePattern =
  /\b(?:fotograf(?:i|ta|lar|larin)?|bolge(?:ler|leri|lerin)?|kutuphane(?:si)?|icgoru(?:leri)?|akis(?:lar|in)?|degisim|ozeti|degerlendirme|gorunur|cekis|itis|gorme|gordum|yukluyor)\b/iu;
const allowedMojibakeFile = path.normalize("src/services/textUtils.ts");
const failures = [];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? collectFiles(target) : [target];
    }),
  );
  return nested.flat();
}

for (const root of roots) {
  const files = await collectFiles(root);
  for (const file of files) {
    if (
      !sourceExtensions.has(path.extname(file)) ||
      path.normalize(file) === allowedMojibakeFile
    )
      continue;
    const content = await readFile(file, "utf8");
    if (mojibakePattern.test(content))
      failures.push(`${file}: bozuk karakter dizisi bulundu`);
    if (ambiguousAsciiTurkishPattern.test(content))
      failures.push(
        `${file}: Türkçe karakterleri ASCII'ye düşmüş kelime bulundu (muhtemel mojibake)`,
      );
    if (asciiTurkishMojibakePattern.test(content))
      failures.push(
        `${file}: Türkçe karakterleri ASCII'ye düşmüş kelime bulundu (muhtemel mojibake)`,
      );
  }
}

const appConfig = JSON.parse(await readFile("app.json", "utf8"));
const expo = appConfig.expo ?? {};
if (!expo.ios?.bundleIdentifier)
  failures.push("app.json: iOS bundleIdentifier eksik");
if (!expo.android?.package) failures.push("app.json: Android package eksik");
if (!expo.version) failures.push("app.json: sürüm numarası eksik");
if (!expo.scheme) failures.push("app.json: deep link scheme eksik");

const [programCatalog, exerciseCatalog] = await Promise.all([
  readFile("src/services/programCatalog.ts", "utf8"),
  readFile("src/data/exercises.ts", "utf8"),
]);
const idBlock =
  programCatalog.match(/const IDS = \{([\s\S]*?)\} as const;/)?.[1] ?? "";
const prescribedExerciseIds = [
  ...idBlock.matchAll(/^\s+\w+: '([^']+)',$/gm),
].map((match) => match[1]);
if (prescribedExerciseIds.length < 20)
  failures.push(
    "programCatalog.ts: reçeteli egzersiz kimlikleri doğrulanamadı",
  );
for (const exerciseId of prescribedExerciseIds) {
  if (!exerciseCatalog.includes(`"id": "${exerciseId}"`)) {
    failures.push(
      `programCatalog.ts: ${exerciseId} egzersiz veri kümesinde bulunamadı`,
    );
  }
}

const seededPrograms = [
  ...programCatalog.matchAll(/createProgram\(\{[^\n]+tier: '(free|premium)'/g),
].map((match) => match[1]);
const freeProgramCount = seededPrograms.filter(
  (tier) => tier === "free",
).length;
const premiumProgramCount = seededPrograms.filter(
  (tier) => tier === "premium",
).length;
if (freeProgramCount !== 7)
  failures.push(
    `programCatalog.ts: 7 yerine ${freeProgramCount} ücretsiz program bulundu`,
  );
if (premiumProgramCount !== 5)
  failures.push(
    `programCatalog.ts: 5 yerine ${premiumProgramCount} premium program bulundu`,
  );

try {
  const messagesSrc = await readFile("src/services/messages.ts", "utf8");
  const trMatches = messagesSrc.match(/\btr:\s*['"]/g) ?? [];
  const enMatches = messagesSrc.match(/\ben:\s*['"]/g) ?? [];
  if (trMatches.length !== enMatches.length) {
    failures.push(
      `messages.ts: ${trMatches.length} tr karşılığına ${enMatches.length} en değeri bulundu (dengesiz)`,
    );
  }
  if (trMatches.length === 0) failures.push("messages.ts: çeviri kataloğu boş");
  const emptyEntry = messagesSrc.match(/(?:tr|en):\s*(['"])\1/);
  if (emptyEntry) failures.push("messages.ts: boş çeviri değeri bulundu");
} catch {
  failures.push("messages.ts: çeviri kataloğu okunamadı");
}

if (failures.length > 0) {
  console.error(`Kalite kontrolü başarısız:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Metin ve yayın yapılandırması kontrolleri temiz.");
