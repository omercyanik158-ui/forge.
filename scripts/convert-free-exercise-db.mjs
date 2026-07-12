import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.resolve('C:/tmp/free-exercise-db/dist/exercises.json');
const outputDir = path.join(projectRoot, 'src', 'data');
const outputPath = path.join(outputDir, 'exercises.ts');
const translationCachePath = path.join(projectRoot, 'scripts', 'exercise-instruction-translations.json');
const nameTranslationCachePath = path.join(projectRoot, 'scripts', 'exercise-name-translations.json');
const imageBaseUrl = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const TRANSLATION_SEPARATOR = '\n|||\n';
const MAX_BATCH_CHARS = 3200;

const muscleGroupMap = {
  chest: 'Göğüs',
  lats: 'Sırt',
  'middle back': 'Sırt',
  'lower back': 'Sırt',
  traps: 'Sırt',
  shoulders: 'Omuz',
  quadriceps: 'Bacak',
  hamstrings: 'Bacak',
  calves: 'Bacak',
  glutes: 'Bacak',
  abductors: 'Bacak',
  adductors: 'Bacak',
  biceps: 'Kol',
  triceps: 'Kol',
  forearms: 'Kol',
  abdominals: 'Karın',
  neck: 'Omuz',
};

const muscleNameMap = {
  abdominals: 'Karın',
  abductors: 'Kalça Dış',
  adductors: 'İç Bacak',
  biceps: 'Biceps',
  calves: 'Calf',
  chest: 'Göğüs',
  forearms: 'Ön Kol',
  glutes: 'Kalça',
  hamstrings: 'Hamstring',
  lats: 'Lat',
  'lower back': 'Alt Sırt',
  'middle back': 'Orta Sırt',
  neck: 'Boyun',
  quadriceps: 'Quadriceps',
  shoulders: 'Omuz',
  traps: 'Trapez',
  triceps: 'Triceps',
};

const equipmentMap = {
  bands: 'Band',
  barbell: 'Barbell',
  'body only': 'Vücut Ağırlığı',
  cable: 'Cable',
  dumbbell: 'Dumbbell',
  'e-z curl bar': 'EZ Curl Bar',
  'exercise ball': 'Exercise Ball',
  'foam roll': 'Foam Roller',
  kettlebells: 'Kettlebell',
  machine: 'Machine',
  'medicine ball': 'Medicine Ball',
  other: 'Diğer',
};

const difficultyMap = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  expert: 'İleri',
};

const nameOverrides = {
  Pushups: 'Push-Up',
  Pullups: 'Pull-Up',
  Chinups: 'Chin-Up',
  'Dumbbell Flyes': 'Dumbbell Fly',
  'Incline Dumbbell Flyes': 'Incline Dumbbell Fly',
  'Decline Dumbbell Flyes': 'Decline Dumbbell Fly',
  'Cable Crossover': 'Cable Crossover',
  'Barbell Bench Press - Medium Grip': 'Barbell Bench Press - Medium Grip',
};

const protectedTerms = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Pull-Up',
  'Push-Up',
  'Lat Pulldown',
  'Shoulder Press',
  'Biceps Curl',
  'Hammer Curl',
  'Preacher Curl',
  'Zottman Curl',
  'Concentration Curl',
  'Triceps Extension',
  'Leg Press',
  'Leg Curl',
  'Leg Extension',
  'Lunge',
  'Row',
  'Chest Press',
  'Incline Press',
  'Incline Bench Press',
  'Decline Bench Press',
  'Fly',
  'Curl',
  'Press',
  'Plank',
  'Crunch',
  'Sit-Up',
  'Dip',
  'Raise',
  'Extension',
  'Pulldown',
  'Cable Crossover',
  'Face Pull',
  'Romanian Deadlift',
  'Good Morning',
];

const nameCleanupRules = [
  [/\bPushups\b/g, 'Push-Up'],
  [/\bPullups\b/g, 'Pull-Up'],
  [/\bChinups\b/g, 'Chin-Up'],
  [/\bSitups\b/g, 'Sit-Up'],
  [/\bFlyes\b/g, 'Fly'],
  [/\bKettlebells\b/g, 'Kettlebell'],
  [/\bDumbbells\b/g, 'Dumbbell'],
  [/\bBehind The Neck\b/g, 'Behind the Neck'],
  [/\bOne Arm\b/g, 'One-Arm'],
  [/\bTwo Arm\b/g, 'Two-Arm'],
];

function mapMuscleGroup(primaryMuscles) {
  for (const muscle of primaryMuscles ?? []) {
    const mapped = muscleGroupMap[muscle];
    if (mapped) {
      return mapped;
    }
  }

  return 'Sırt';
}

function normalizeName(name) {
  if (nameOverrides[name]) {
    return nameOverrides[name];
  }

  if (protectedTerms.some((term) => name.includes(term))) {
    return name;
  }

  return nameCleanupRules.reduce((current, [pattern, replacement]) => current.replace(pattern, replacement), name);
}

function localizedMuscles(muscles) {
  return (muscles ?? []).map((muscle) => muscleNameMap[muscle] ?? muscle);
}

function localizedEquipment(equipment) {
  if (!equipment) {
    return 'Vücut Ağırlığı';
  }

  return equipmentMap[equipment] ?? equipment;
}

async function loadTranslationCache() {
  try {
    const raw = await readFile(translationCachePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function saveTranslationCache(cache) {
  await writeFile(translationCachePath, JSON.stringify(cache, null, 2), 'utf8');
}

async function loadNameTranslationCache() {
  try {
    const raw = await readFile(nameTranslationCachePath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function saveNameTranslationCache(cache) {
  await writeFile(nameTranslationCachePath, JSON.stringify(cache, null, 2), 'utf8');
}

function chunkTextsByLength(texts) {
  const chunks = [];
  let current = [];
  let currentLength = 0;

  for (const text of texts) {
    const nextLength = currentLength === 0 ? text.length : currentLength + TRANSLATION_SEPARATOR.length + text.length;
    if (nextLength > MAX_BATCH_CHARS && current.length > 0) {
      chunks.push(current);
      current = [text];
      currentLength = text.length;
    } else {
      current.push(text);
      currentLength = nextLength;
    }
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

async function fetchTranslation(text) {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.searchParams.set('client', 'gtx');
  url.searchParams.set('sl', 'en');
  url.searchParams.set('tl', 'tr');
  url.searchParams.set('dt', 't');
  url.searchParams.set('q', text);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translation request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return Array.isArray(payload?.[0]) ? payload[0].map((part) => part?.[0] ?? '').join('') : text;
}

async function translateBatch(batch, cache) {
  const source = batch.join(TRANSLATION_SEPARATOR);
  const translated = await fetchTranslation(source);
  const parts = translated.split(TRANSLATION_SEPARATOR);

  if (parts.length !== batch.length) {
    for (const item of batch) {
      const single = await fetchTranslation(item);
      cache[item] = single.trim() || item;
    }
    return;
  }

  batch.forEach((item, index) => {
    cache[item] = (parts[index] ?? '').trim() || item;
  });
}

async function translateAllInstructions(exercises, cache) {
  const uniqueInstructions = Array.from(
    new Set(
      exercises.flatMap((exercise) => (exercise.instructions ?? []).filter((instruction) => instruction && !cache[instruction])),
    ),
  );
  const chunks = chunkTextsByLength(uniqueInstructions);
  const concurrency = 4;

  for (let index = 0; index < chunks.length; index += concurrency) {
    const group = chunks.slice(index, index + concurrency);
    await Promise.all(group.map((chunk) => translateBatch(chunk, cache)));
    console.log(`Translated ${Math.min(index + concurrency, chunks.length)} / ${chunks.length} instruction batches`);
  }
}

function shouldKeepNameEnglish(name) {
  return protectedTerms.some((term) => name.includes(term));
}

async function translateAllNames(exercises, cache) {
  const uniqueNames = Array.from(
    new Set(
      exercises
        .map((exercise) => exercise.name)
        .filter((name) => name && !cache[name] && !shouldKeepNameEnglish(name)),
    ),
  );
  const chunks = chunkTextsByLength(uniqueNames);
  const concurrency = 4;

  for (let index = 0; index < chunks.length; index += concurrency) {
    const group = chunks.slice(index, index + concurrency);
    await Promise.all(group.map((chunk) => translateBatch(chunk, cache)));
    console.log(`Translated ${Math.min(index + concurrency, chunks.length)} / ${chunks.length} name batches`);
  }
}

function normalizeExercise(exercise, cache) {
  const displayName = shouldKeepNameEnglish(exercise.name)
    ? normalizeName(exercise.name)
    : cache[exercise.name]?.trim() || normalizeName(exercise.name);
  const targetMuscles = localizedMuscles(exercise.primaryMuscles);
  const secondaryMuscles = localizedMuscles(exercise.secondaryMuscles);
  const equipment = localizedEquipment(exercise.equipment);

  return {
    id: exercise.id,
    name: exercise.name,
    displayName,
    muscleGroup: mapMuscleGroup(exercise.primaryMuscles),
    targetMuscles,
    secondaryMuscles,
    equipment,
    difficulty: difficultyMap[exercise.level] ?? 'Orta',
    imageUrls: (exercise.images ?? []).map((imagePath) => encodeURI(`${imageBaseUrl}${imagePath}`)),
    defaultSets: 3,
    defaultReps: 10,
  };
}

async function main() {
  const raw = await readFile(sourcePath, 'utf8');
  const sourceExercises = JSON.parse(raw);
  const translationCache = await loadTranslationCache();
  const nameTranslationCache = await loadNameTranslationCache();
  await translateAllNames(sourceExercises, nameTranslationCache);
  await translateAllInstructions(sourceExercises, translationCache);
  const exercises = [];

  for (const exercise of sourceExercises) {
    exercises.push(normalizeExercise(exercise, translationCache));
  }

  const fileContents = `import type { ExerciseLibraryItem } from '@/types';

// Generated from yuhonas/free-exercise-db (Unlicense / public domain).
// Data is stored locally; image URLs point to the upstream repository and may change if the source repo changes.
// Exercise names use a hybrid TR/EN convention: classic gym movement names stay recognizable, labels are localized.
export const EXERCISES: ExerciseLibraryItem[] = ${JSON.stringify(exercises, null, 2)};
`;

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, fileContents, 'utf8');
  await saveNameTranslationCache(nameTranslationCache);
  await saveTranslationCache(translationCache);
  console.log(`Wrote ${exercises.length} exercises to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
