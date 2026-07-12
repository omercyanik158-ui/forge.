import type { Program, WarmupItem } from '@/types';
import { hasExercise } from './exerciseCatalog';
import { normalizedText } from './textUtils';

export type ProgramExercisePrescription = {
  exerciseId: string;
  sets: number;
  reps: number;
  repLabel: string;
  restSeconds: number;
  rir: number;
  alternatives: string[];
};

export type ProgramDay = {
  id: string;
  title: string;
  subtitle: string;
  durationMin: number;
  difficulty: string;
  warmup?: WarmupItem[];
  exercises: ProgramExercisePrescription[];
  exerciseIds: string[];
  notes: string;
};

export type ProgramWeek = {
  id: string;
  title: string;
  guidance: string;
  days: ProgramDay[];
};

export type ProgramPlan = Program & {
  weeks: ProgramWeek[];
};

export const PROGRAM_STYLE_OPTIONS = ['Tümü', 'Full Body', 'Upper/Lower', 'Powerlifting', 'Powerbuilding', 'Split', 'Pilates', 'Yoga', 'Home Fitness'] as const;
export const PROGRAM_DIFFICULTY_OPTIONS = ['Tümü', 'Başlangıç', 'Orta', 'Zor'] as const;
export const PROGRAM_DAY_OPTIONS = ['Tümü', 3, 4, 5] as const;

export type ProgramStyleFilter = (typeof PROGRAM_STYLE_OPTIONS)[number];
export type ProgramDifficultyFilter = (typeof PROGRAM_DIFFICULTY_OPTIONS)[number];
export type ProgramDayFilter = (typeof PROGRAM_DAY_OPTIONS)[number];

export type ProgramDiscoveryFilters = {
  query?: string;
  style?: ProgramStyleFilter;
  difficulty?: ProgramDifficultyFilter;
  daysPerWeek?: ProgramDayFilter;
};

type DayTemplate = Omit<ProgramDay, 'id' | 'exerciseIds'>;

type ProgramSeed = {
  id: string;
  title: string;
  color: string;
  tier: 'free' | 'premium';
  weekCount: number;
  focus: string;
  summary: string;
  difficultyLevel: Program['difficultyLevel'];
  daysPerWeek: Program['daysPerWeek'];
  trainingStyle: Program['trainingStyle'];
  goal: Program['goal'];
  equipment: string;
  searchTerms: string[];
  days: DayTemplate[];
};

const IDS = {
  bench: 'Barbell_Bench_Press_-_Medium_Grip',
  dumbbellBench: 'Dumbbell_Bench_Press',
  inclineDumbbell: 'Incline_Dumbbell_Press',
  closeGripBench: 'Close-Grip_Barbell_Bench_Press',
  squat: 'Barbell_Squat',
  frontSquat: 'Front_Barbell_Squat',
  deadlift: 'Barbell_Deadlift',
  romanianDeadlift: 'Romanian_Deadlift',
  legPress: 'Leg_Press',
  lunges: 'Dumbbell_Lunges',
  legExtension: 'Leg_Extensions',
  legCurl: 'Lying_Leg_Curls',
  hipThrust: 'Barbell_Hip_Thrust',
  calfRaise: 'Standing_Calf_Raises',
  airBike: 'Air_Bike',
  armCircles: 'Arm_Circles',
  barbellRow: 'Bent_Over_Barbell_Row',
  backFlyBands: 'Back_Flyes_-_With_Bands',
  bandGoodMorning: 'Band_Good_Morning',
  bandHipAdductions: 'Band_Hip_Adductions',
  bandPullApart: 'Band_Pull_Apart',
  bodyweightSquat: 'Bodyweight_Squat',
  bodyweightWalkingLunge: 'Bodyweight_Walking_Lunge',
  bridge: 'Butt_Lift_Bridge',
  cableRow: 'Seated_Cable_Rows',
  latPulldown: 'Wide-Grip_Lat_Pulldown',
  closePulldown: 'Close-Grip_Front_Lat_Pulldown',
  pullup: 'Pullups',
  barbellPress: 'Barbell_Shoulder_Press',
  dumbbellPress: 'Dumbbell_Shoulder_Press',
  lateralRaise: 'Side_Lateral_Raise',
  facePull: 'Face_Pull',
  curl: 'Dumbbell_Bicep_Curl',
  pushdown: 'Triceps_Pushdown',
  mountainClimbers: 'Mountain_Climbers',
  ninetyHamstring: '90_90_Hamstring',
  pelvicTiltBridge: 'Pelvic_Tilt_Into_Bridge',
  plank: 'Plank',
  pushups: 'Pushups',
  sideBridge: 'Side_Bridge',
  singleLegGluteBridge: 'Single_Leg_Glute_Bridge',
  crunch: 'Crunches',
  cableCrunch: 'Cable_Crunch',
  alternateHeelTouchers: 'Alternate_Heel_Touchers',
  deadBug: 'Dead_Bug',
  windmills: 'Windmills',
  worldsGreatestStretch: 'Worlds_Greatest_Stretch',
} as const;

function prescription(
  exerciseId: string,
  sets: number,
  reps: number,
  repLabel: string,
  restSeconds: number,
  rir: number,
  alternatives: string[] = [],
): ProgramExercisePrescription {
  return { exerciseId, sets, reps, repLabel, restSeconds, rir, alternatives };
}

const p = prescription;

function day(title: string, subtitle: string, durationMin: number, difficulty: string, notes: string, exercises: ProgramExercisePrescription[]): DayTemplate {
  return { title, subtitle, durationMin, difficulty, notes, exercises };
}

function inferWarmup(title: string): WarmupItem[] {
  const lowered = normalizedText(title);
  if (lowered.includes("upper") || lowered.includes("ust") || lowered.includes("push") || lowered.includes("chest") || lowered.includes("omuz")) {
    return [
      { title: "Omuz aktivasyonu", exerciseId: IDS.bandPullApart, repsLabel: "15 tekrar", note: "Kurek kemiklerini sabitle." },
      { title: "Kol daireleri", exerciseId: IDS.armCircles, repsLabel: "20 tekrar" },
      { title: "Postur hazirligi", exerciseId: IDS.backFlyBands, repsLabel: "12 tekrar" },
    ];
  }
  if (lowered.includes("lower") || lowered.includes("alt") || lowered.includes("leg") || lowered.includes("squat") || lowered.includes("bacak")) {
    return [
      { title: "Kalca koprusu", exerciseId: IDS.bridge, repsLabel: "12 tekrar" },
      { title: "90/90 hamstring", exerciseId: IDS.ninetyHamstring, repsLabel: "Her taraf 8" },
      { title: "Vucut agirligi squat", exerciseId: IDS.bodyweightSquat, repsLabel: "12 tekrar" },
    ];
  }
  return [
    { title: "Dunya'nin en iyi esnemesi", exerciseId: IDS.worldsGreatestStretch, repsLabel: "Her taraf 6" },
    { title: "Dead bug", exerciseId: IDS.deadBug, repsLabel: "Her taraf 10" },
    { title: "Kol daireleri", exerciseId: IDS.armCircles, repsLabel: "20 tekrar" },
  ];
}

function weekGuidance(weekIndex: number, weekCount: number): string {
  const week = weekIndex + 1;
  if (week === 1) return 'Tekniği sabitle; tüm çalışma setlerinde en az 3 tekrar yedek bırak.';
  if (week === weekCount && weekCount >= 6) return 'Hacmi biraz azalt; temiz tekrarlarla toparlanarak döngüyü tamamla.';
  if (week <= Math.ceil(weekCount / 2)) return 'Tekrar aralığının üst sınırını yakaladığında küçük bir yük artışı yap.';
  return 'Ana hareketlerde form bozulmadan ilerle; yardımcı hareketlerde 1-2 tekrar yedek bırak.';
}

function createWeeks(programId: string, weekCount: number, templates: DayTemplate[]): ProgramWeek[] {
  return Array.from({ length: weekCount }, (_, weekIndex) => {
    const deload = weekIndex + 1 === weekCount && weekCount >= 6;
    const progressionStage = Math.min(Math.floor(weekIndex / 2), 2);
    return {
      id: `${programId}-w${weekIndex + 1}`,
      title: `${weekIndex + 1}. Hafta`,
      guidance: weekGuidance(weekIndex, weekCount),
      days: templates.map((template, dayIndex) => {
        const exercises = template.exercises.map((exercise) => ({
          ...exercise,
          sets: deload ? Math.max(2, exercise.sets - 1) : exercise.sets,
          rir: deload ? Math.max(3, exercise.rir) : Math.max(1, exercise.rir - progressionStage),
        }));
        return {
          ...template,
          id: `${programId}-w${weekIndex + 1}-d${dayIndex + 1}`,
          warmup: template.warmup ?? inferWarmup(template.title),
          exercises,
          exerciseIds: exercises.map((exercise) => exercise.exerciseId),
        };
      }),
    };
  });
}

function createProgram(seed: ProgramSeed): ProgramPlan {
  return {
    id: seed.id,
    title: seed.title,
    color: seed.color,
    tier: seed.tier,
    duration: `${seed.weekCount} Hafta`,
    sub: `${seed.weekCount} hafta · ${seed.daysPerWeek} gün · ${seed.difficultyLevel}`,
    focus: seed.focus,
    summary: seed.summary,
    difficultyLevel: seed.difficultyLevel,
    daysPerWeek: seed.daysPerWeek,
    trainingStyle: seed.trainingStyle,
    goal: seed.goal,
    equipment: seed.equipment,
    searchTerms: seed.searchTerms,
    weeks: createWeeks(seed.id, seed.weekCount, seed.days),
  };
}

const startFullBodyDays = [
  day('Full Body A', 'Squat, yatay itiş ve sırt temeli', 48, 'Başlangıç', 'Ağırlığı değil hareket kalitesini öne al.', [
    p(IDS.squat, 3, 8, '8 tekrar', 120, 3, [IDS.legPress]),
    p(IDS.dumbbellBench, 3, 10, '8-10 tekrar', 90, 3, [IDS.bench]),
    p(IDS.latPulldown, 3, 10, '8-12 tekrar', 90, 2, [IDS.closePulldown]),
    p(IDS.romanianDeadlift, 2, 10, '8-10 tekrar', 120, 3, [IDS.hipThrust]),
    p(IDS.lateralRaise, 2, 12, '12-15 tekrar', 60, 2),
    p(IDS.plank, 3, 30, '30 sn', 45, 3),
  ]),
  day('Full Body B', 'Bacak, dikey itiş ve yatay çekiş', 46, 'Başlangıç', 'Her tekrarın başlangıç ve bitiş pozisyonunu aynı tut.', [
    p(IDS.legPress, 3, 10, '10-12 tekrar', 90, 3, [IDS.squat]),
    p(IDS.dumbbellPress, 3, 8, '8-10 tekrar', 90, 3, [IDS.barbellPress]),
    p(IDS.cableRow, 3, 10, '8-12 tekrar', 90, 2, [IDS.barbellRow]),
    p(IDS.hipThrust, 3, 10, '8-12 tekrar', 90, 2, [IDS.romanianDeadlift]),
    p(IDS.curl, 2, 12, '10-12 tekrar', 60, 2),
    p(IDS.crunch, 3, 12, '12-15 tekrar', 45, 2),
  ]),
  day('Full Body C', 'Tek taraflı bacak ve dengeli üst vücut', 49, 'Başlangıç', 'Haftayı zorlayarak değil, temiz tekrar biriktirerek kapat.', [
    p(IDS.lunges, 3, 10, 'Her bacak 10', 90, 3, [IDS.legPress]),
    p(IDS.bench, 3, 8, '6-8 tekrar', 120, 3, [IDS.dumbbellBench]),
    p(IDS.pullup, 3, 6, '6-10 tekrar', 90, 2, [IDS.latPulldown]),
    p(IDS.legCurl, 3, 12, '10-12 tekrar', 75, 2, [IDS.romanianDeadlift]),
    p(IDS.pushdown, 2, 12, '10-12 tekrar', 60, 2, [IDS.closeGripBench]),
    p(IDS.plank, 3, 40, '40 sn', 45, 3),
  ]),
];

const upperLowerDays = [
  day('Upper A', 'Bench ve row öncelikli üst vücut', 58, 'Orta', 'Ana hareketlerde uzun dinlen, yardımcı hareketlerde ritmi koru.', [
    p(IDS.bench, 3, 7, '6-8 tekrar', 150, 2, [IDS.dumbbellBench]), p(IDS.barbellRow, 3, 9, '8-10 tekrar', 120, 2, [IDS.cableRow]),
    p(IDS.dumbbellPress, 3, 9, '8-10 tekrar', 90, 2, [IDS.barbellPress]), p(IDS.latPulldown, 3, 10, '8-12 tekrar', 90, 2, [IDS.pullup]),
    p(IDS.pushdown, 2, 12, '10-15 tekrar', 60, 1), p(IDS.curl, 2, 12, '10-15 tekrar', 60, 1),
  ]),
  day('Lower A', 'Squat ve arka bacak dengesi', 59, 'Orta', 'Squat sonrasında kalça ve arka bacağı kontrollü tamamla.', [
    p(IDS.squat, 3, 7, '6-8 tekrar', 180, 2, [IDS.legPress]), p(IDS.romanianDeadlift, 3, 8, '8-10 tekrar', 150, 2, [IDS.hipThrust]),
    p(IDS.legPress, 3, 10, '10-12 tekrar', 90, 2, [IDS.lunges]), p(IDS.legCurl, 2, 12, '10-15 tekrar', 75, 1),
    p(IDS.calfRaise, 3, 12, '10-15 tekrar', 60, 2), p(IDS.plank, 3, 40, '40 sn', 45, 3),
  ]),
  day('Upper B', 'Üst göğüs, sırt ve omuz hacmi', 57, 'Orta', 'Kas bağlantısını koruyarak tekrar aralığının üstüne ilerle.', [
    p(IDS.inclineDumbbell, 3, 10, '8-12 tekrar', 90, 2, [IDS.dumbbellBench]), p(IDS.cableRow, 3, 10, '8-12 tekrar', 90, 2, [IDS.barbellRow]),
    p(IDS.dumbbellPress, 3, 10, '8-12 tekrar', 90, 2, [IDS.barbellPress]), p(IDS.pullup, 3, 8, '6-10 tekrar', 90, 2, [IDS.latPulldown]),
    p(IDS.lateralRaise, 3, 14, '12-15 tekrar', 60, 1), p(IDS.closeGripBench, 2, 10, '8-12 tekrar', 90, 2, [IDS.pushdown]),
  ]),
  day('Lower B', 'Deadlift, ön bacak ve kalça', 60, 'Orta', 'Deadlift setlerini teknik olarak temiz tut; gereksiz tükenişe gitme.', [
    p(IDS.deadlift, 2, 5, '5 tekrar', 180, 3, [IDS.romanianDeadlift]), p(IDS.frontSquat, 3, 8, '6-10 tekrar', 150, 2, [IDS.squat]),
    p(IDS.hipThrust, 3, 10, '8-12 tekrar', 90, 2, [IDS.romanianDeadlift]), p(IDS.legExtension, 2, 12, '10-15 tekrar', 60, 1),
    p(IDS.legCurl, 2, 12, '10-15 tekrar', 60, 1), p(IDS.cableCrunch, 3, 12, '10-15 tekrar', 45, 2),
  ]),
];

const strengthFoundationDays = [
  day('Squat + Bench', 'İki ana lift ve sırt desteği', 58, 'Orta', 'Tüm ana setlerde aynı hazırlık rutinini kullan.', [
    p(IDS.squat, 3, 5, '5 tekrar', 180, 3, [IDS.legPress]), p(IDS.bench, 3, 5, '5 tekrar', 180, 3, [IDS.dumbbellBench]),
    p(IDS.barbellRow, 3, 8, '8 tekrar', 120, 2, [IDS.cableRow]), p(IDS.plank, 3, 40, '40 sn', 45, 3),
  ]),
  day('Deadlift + Press', 'Çekiş gücü ve dikey itiş', 55, 'Orta', 'Deadliftte hızdan önce başlangıç pozisyonunu koru.', [
    p(IDS.deadlift, 2, 5, '5 tekrar', 210, 3, [IDS.romanianDeadlift]), p(IDS.barbellPress, 3, 5, '5 tekrar', 150, 3, [IDS.dumbbellPress]),
    p(IDS.latPulldown, 3, 8, '8-10 tekrar', 90, 2, [IDS.pullup]), p(IDS.lunges, 2, 10, 'Her bacak 10', 90, 2, [IDS.legPress]),
  ]),
  day('Bench + Squat', 'Bench önceliği ve teknik squat', 58, 'Orta', 'Tamamlanan tüm setlerde küçük yük artışlarını tercih et.', [
    p(IDS.bench, 3, 5, '5 tekrar', 180, 2, [IDS.dumbbellBench]), p(IDS.squat, 3, 5, '5 tekrar', 180, 3, [IDS.frontSquat]),
    p(IDS.cableRow, 3, 8, '8-10 tekrar', 90, 2, [IDS.barbellRow]), p(IDS.romanianDeadlift, 2, 8, '8 tekrar', 120, 3, [IDS.hipThrust]),
    p(IDS.pushdown, 2, 12, '10-12 tekrar', 60, 2, [IDS.closeGripBench]),
  ]),
];

const atlasDays = [
  day('Atlas A', 'Squat ve dengeli üst vücut', 60, 'Orta', 'Büyük hareketlerde 2 tekrar yedek bırak.', [
    p(IDS.squat, 3, 6, '6 tekrar', 180, 2), p(IDS.dumbbellBench, 3, 9, '8-10 tekrar', 120, 2), p(IDS.latPulldown, 3, 10, '8-12 tekrar', 90, 2),
    p(IDS.romanianDeadlift, 3, 8, '8-10 tekrar', 120, 2), p(IDS.lateralRaise, 2, 14, '12-15 tekrar', 60, 1), p(IDS.plank, 3, 45, '45 sn', 45, 3),
  ]),
  day('Atlas B', 'Deadlift ve omuz odağı', 58, 'Orta', 'Deadlifti kontrollü hacimle sınırla.', [
    p(IDS.deadlift, 2, 5, '5 tekrar', 210, 3), p(IDS.dumbbellPress, 3, 8, '8-10 tekrar', 120, 2), p(IDS.cableRow, 3, 10, '8-12 tekrar', 90, 2),
    p(IDS.lunges, 3, 10, 'Her bacak 10', 90, 2), p(IDS.pushdown, 2, 12, '10-15 tekrar', 60, 1), p(IDS.curl, 2, 12, '10-15 tekrar', 60, 1),
  ]),
  day('Atlas C', 'Bench ve ön bacak hacmi', 60, 'Orta', 'Bench ve row tekrarlarını aynı kaliteyle tamamla.', [
    p(IDS.bench, 3, 6, '6-8 tekrar', 150, 2), p(IDS.frontSquat, 3, 8, '8 tekrar', 150, 2), p(IDS.barbellRow, 3, 8, '8-10 tekrar', 120, 2),
    p(IDS.legCurl, 3, 12, '10-15 tekrar', 75, 1), p(IDS.facePull, 3, 14, '12-15 tekrar', 60, 1), p(IDS.cableCrunch, 3, 12, '12-15 tekrar', 45, 2),
  ]),
  day('Atlas D', 'Kalça, üst göğüs ve çekiş', 56, 'Orta', 'Haftayı tükeniş yerine ritim ve form ile tamamla.', [
    p(IDS.hipThrust, 3, 10, '8-12 tekrar', 120, 2), p(IDS.inclineDumbbell, 3, 10, '8-12 tekrar', 90, 2), p(IDS.pullup, 3, 8, '6-10 tekrar', 90, 2, [IDS.latPulldown]),
    p(IDS.legPress, 3, 12, '10-15 tekrar', 90, 2), p(IDS.lateralRaise, 3, 14, '12-15 tekrar', 60, 1), p(IDS.curl, 2, 12, '10-15 tekrar', 60, 1),
  ]),
];

const vectorDays = upperLowerDays.map((template) => ({
  ...template,
  title: `Vector ${template.title}`,
  exercises: template.exercises.map((exercise, index) => ({ ...exercise, sets: index < 4 ? Math.max(exercise.sets, 3) : exercise.sets, rir: Math.min(exercise.rir, 2) })),
}));

const barbellBaseDays = [
  day('Squat Güç', 'Ana squat ve bench desteği', 66, 'Orta', 'Squatta 2-3 tekrar yedek bırak ve küçük artışlarla ilerle.', [
    p(IDS.squat, 3, 4, '4-5 tekrar', 210, 3), p(IDS.bench, 3, 6, '6 tekrar', 150, 3), p(IDS.romanianDeadlift, 3, 8, '8 tekrar', 150, 2), p(IDS.plank, 3, 45, '45 sn', 45, 3),
  ]),
  day('Bench Güç', 'Bench önceliği ve üst sırt', 62, 'Orta', 'Bench hazırlığını her sette aynı tut.', [
    p(IDS.bench, 3, 4, '4-5 tekrar', 210, 2), p(IDS.barbellRow, 4, 8, '8 tekrar', 120, 2), p(IDS.closeGripBench, 3, 8, '8 tekrar', 120, 2), p(IDS.facePull, 3, 15, '12-15 tekrar', 60, 1),
  ]),
  day('Deadlift Güç', 'Deadlift ve bacak desteği', 64, 'Orta', 'Ana çekiş setleri arasında tam toparlan.', [
    p(IDS.deadlift, 3, 4, '3-5 tekrar', 240, 3), p(IDS.frontSquat, 3, 6, '6 tekrar', 150, 3), p(IDS.legCurl, 3, 10, '10-12 tekrar', 75, 2), p(IDS.cableCrunch, 3, 12, '12 tekrar', 45, 2),
  ]),
  day('Bench Hacim', 'İkinci bench ve çekiş hacmi', 58, 'Orta', 'Hacim gününde bar hızını ve tekrar kalitesini koru.', [
    p(IDS.bench, 3, 8, '8 tekrar', 150, 3), p(IDS.latPulldown, 4, 10, '8-12 tekrar', 90, 2), p(IDS.dumbbellPress, 3, 10, '8-10 tekrar', 90, 2), p(IDS.curl, 3, 12, '10-12 tekrar', 60, 1), p(IDS.pushdown, 3, 12, '10-12 tekrar', 60, 1),
  ]),
];

const apexDays = [
  day('Upper Strength', 'Ağır bench ve row', 66, 'Zor', 'Ana liftlerde tükenişe gitmeden güç üret.', [p(IDS.bench, 3, 4, '4-6 tekrar', 210, 2), p(IDS.barbellRow, 4, 6, '6-8 tekrar', 150, 2), p(IDS.barbellPress, 3, 6, '6 tekrar', 150, 2), p(IDS.pullup, 3, 8, '6-10 tekrar', 120, 2), p(IDS.pushdown, 3, 12, '10-12 tekrar', 60, 1)]),
  day('Lower Strength', 'Squat ve posterior chain', 68, 'Zor', 'Squat ve deadlift hacmini kontrollü dağıt.', [p(IDS.squat, 3, 4, '4-6 tekrar', 210, 2), p(IDS.deadlift, 2, 4, '4 tekrar', 240, 3), p(IDS.legPress, 3, 10, '10 tekrar', 90, 2), p(IDS.legCurl, 3, 10, '10-12 tekrar', 75, 1), p(IDS.plank, 3, 45, '45 sn', 45, 3)]),
  day('Pull Volume', 'Sırt, arka omuz ve biceps', 60, 'Zor', 'Çekişlerde omuzu değil sırtı hareket ettir.', [p(IDS.latPulldown, 4, 10, '8-12 tekrar', 90, 2), p(IDS.cableRow, 4, 10, '8-12 tekrar', 90, 2), p(IDS.barbellRow, 3, 8, '8-10 tekrar', 120, 2), p(IDS.facePull, 3, 15, '12-15 tekrar', 60, 1), p(IDS.curl, 4, 12, '10-15 tekrar', 60, 1)]),
  day('Push Volume', 'Göğüs, omuz ve triceps', 60, 'Zor', 'İtiş hacminde omuz konumunu koru.', [p(IDS.inclineDumbbell, 4, 10, '8-12 tekrar', 90, 2), p(IDS.dumbbellBench, 3, 10, '8-12 tekrar', 90, 2), p(IDS.dumbbellPress, 3, 10, '8-12 tekrar', 90, 2), p(IDS.lateralRaise, 4, 15, '12-20 tekrar', 60, 1), p(IDS.pushdown, 4, 12, '10-15 tekrar', 60, 1)]),
  day('Leg Volume', 'Quad, kalça ve arka bacak', 62, 'Zor', 'Bacak hacminde tekrar kontrolünü kaybetme.', [p(IDS.frontSquat, 3, 8, '8-10 tekrar', 150, 2), p(IDS.romanianDeadlift, 3, 8, '8-10 tekrar', 150, 2), p(IDS.legPress, 4, 12, '10-15 tekrar', 90, 1), p(IDS.legExtension, 3, 15, '12-15 tekrar', 60, 1), p(IDS.legCurl, 3, 15, '12-15 tekrar', 60, 1), p(IDS.calfRaise, 4, 15, '12-20 tekrar', 60, 1)]),
];

const titanDays = [
  day('Göğüs + Triceps', 'Tanıdık press hareketleriyle göğüs hacmi', 60, 'Zor', 'İlk iki basışta yük, diğerlerinde kontrollü hacim hedefle.', [p(IDS.bench, 3, 6, '6-8 tekrar', 150, 2), p(IDS.inclineDumbbell, 4, 10, '8-12 tekrar', 90, 2), p(IDS.dumbbellBench, 3, 12, '10-12 tekrar', 90, 1), p(IDS.closeGripBench, 3, 10, '8-12 tekrar', 90, 2), p(IDS.pushdown, 3, 15, '12-15 tekrar', 60, 1)]),
  day('Sırt + Biceps', 'Genişlik ve kalınlık', 61, 'Zor', 'Dikey ve yatay çekişleri dengeli uygula.', [p(IDS.pullup, 4, 8, '6-10 tekrar', 120, 2), p(IDS.barbellRow, 4, 8, '8-10 tekrar', 120, 2), p(IDS.latPulldown, 3, 12, '10-12 tekrar', 90, 1), p(IDS.cableRow, 3, 12, '10-12 tekrar', 90, 1), p(IDS.facePull, 3, 15, '12-15 tekrar', 60, 1), p(IDS.curl, 4, 12, '10-15 tekrar', 60, 1)]),
  day('Bacak', 'Quad, hamstring ve kalça', 66, 'Zor', 'Ana hareketlerde tam dinlen, izolasyonlarda ritmi koru.', [p(IDS.squat, 4, 6, '6-8 tekrar', 180, 2), p(IDS.romanianDeadlift, 4, 8, '8-10 tekrar', 150, 2), p(IDS.legPress, 4, 12, '10-15 tekrar', 90, 1), p(IDS.legExtension, 3, 15, '12-15 tekrar', 60, 1), p(IDS.legCurl, 3, 15, '12-15 tekrar', 60, 1), p(IDS.calfRaise, 4, 15, '12-20 tekrar', 60, 1)]),
  day('Omuz + Üst Sırt', 'Omuz doluluğu ve postür', 55, 'Zor', 'Press sonrası yan ve arka omuz kontrolünü koru.', [p(IDS.barbellPress, 3, 6, '6-8 tekrar', 150, 2), p(IDS.dumbbellPress, 3, 10, '8-12 tekrar', 90, 2), p(IDS.lateralRaise, 4, 15, '12-20 tekrar', 60, 1), p(IDS.facePull, 4, 15, '12-20 tekrar', 60, 1), p(IDS.cableRow, 3, 12, '10-12 tekrar', 90, 2)]),
  day('Kol + Core', 'Biceps, triceps ve gövde', 49, 'Zor', 'Hileli tekrar yerine tam hareket aralığı kullan.', [p(IDS.closeGripBench, 3, 8, '8-10 tekrar', 120, 2), p(IDS.curl, 4, 10, '10-12 tekrar', 60, 1), p(IDS.pushdown, 4, 12, '10-15 tekrar', 60, 1), p(IDS.cableCrunch, 4, 12, '12-15 tekrar', 45, 1), p(IDS.plank, 3, 45, '45 sn', 45, 3)]),
];

const womensPilatesDays = [
  day('Core Flow', 'Derin karın ve kalça kontrolü', 36, 'Başlangıç', 'Nefes ile hareket temposunu eşleştir ve bel boşluğunu koru.', [
    p(IDS.pelvicTiltBridge, 3, 12, '12 tekrar', 45, 3, [IDS.bridge]),
    p(IDS.deadBug, 3, 10, 'Her taraf 10', 45, 3, [IDS.alternateHeelTouchers]),
    p(IDS.sideBridge, 3, 30, 'Her taraf 30 sn', 40, 3, [IDS.plank]),
    p(IDS.singleLegGluteBridge, 3, 10, 'Her bacak 10', 40, 2, [IDS.bridge]),
    p(IDS.ninetyHamstring, 2, 8, 'Her taraf 8', 30, 3, [IDS.worldsGreatestStretch]),
    p(IDS.armCircles, 2, 20, '20 tekrar', 25, 3),
  ]),
  day('Alt Vücut Pilates', 'Kalça, bacak ve duruş', 38, 'Başlangıç', 'Hareketleri küçük ama kontrollü tut; kaliteyi hızın önüne koy.', [
    p(IDS.bodyweightSquat, 3, 12, '12 tekrar', 45, 3),
    p(IDS.bodyweightWalkingLunge, 3, 10, 'Her bacak 10', 45, 3),
    p(IDS.bandHipAdductions, 3, 14, 'Her taraf 14', 30, 2, [IDS.singleLegGluteBridge]),
    p(IDS.bridge, 3, 15, '15 tekrar', 40, 2, [IDS.pelvicTiltBridge]),
    p(IDS.plank, 3, 35, '35 sn', 35, 3, [IDS.sideBridge]),
    p(IDS.alternateHeelTouchers, 3, 14, 'Her taraf 14', 30, 2, [IDS.deadBug]),
  ]),
  day('Postür & Mobilite', 'Omuz açısı ve gövde dengesi', 34, 'Başlangıç', 'Boynu uzat, kaburgaları kapat ve hareket boyunca akışını bozma.', [
    p(IDS.bandPullApart, 3, 14, '14 tekrar', 30, 2, [IDS.backFlyBands]),
    p(IDS.backFlyBands, 3, 12, '12 tekrar', 30, 2, [IDS.bandPullApart]),
    p(IDS.windmills, 3, 8, 'Her taraf 8', 30, 3),
    p(IDS.worldsGreatestStretch, 2, 6, 'Her taraf 6', 30, 3, [IDS.ninetyHamstring]),
    p(IDS.mountainClimbers, 3, 20, '20 tekrar', 30, 2, [IDS.airBike]),
    p(IDS.sideBridge, 2, 30, 'Her taraf 30 sn', 30, 3, [IDS.plank]),
  ]),
];

const womensYogaDays = [
  day('Sabah Akışı', 'Mobilite ve nefes', 32, 'Başlangıç', 'Her geçişte nefesin ritmini koru ve omuzlarını kulaklardan uzak tut.', [
    p(IDS.armCircles, 2, 20, '20 tekrar', 25, 3),
    p(IDS.worldsGreatestStretch, 3, 6, 'Her taraf 6', 35, 3, [IDS.ninetyHamstring]),
    p(IDS.windmills, 3, 8, 'Her taraf 8', 35, 3),
    p(IDS.plank, 3, 30, '30 sn', 35, 3, [IDS.sideBridge]),
    p(IDS.bridge, 3, 12, '12 tekrar', 40, 3, [IDS.pelvicTiltBridge]),
    p(IDS.ninetyHamstring, 2, 8, 'Her taraf 8', 30, 3),
  ]),
  day('Denge Akışı', 'Alt vücut ve merkez', 36, 'Başlangıç', 'Kalça hizasını koru; zorlandığında hareket aralığını küçült.', [
    p(IDS.bodyweightSquat, 3, 12, '12 tekrar', 40, 3),
    p(IDS.bodyweightWalkingLunge, 3, 8, 'Her bacak 8', 45, 3),
    p(IDS.sideBridge, 3, 25, 'Her taraf 25 sn', 35, 3, [IDS.plank]),
    p(IDS.deadBug, 3, 10, 'Her taraf 10', 35, 3, [IDS.alternateHeelTouchers]),
    p(IDS.singleLegGluteBridge, 3, 10, 'Her bacak 10', 40, 3, [IDS.bridge]),
    p(IDS.ninetyHamstring, 2, 8, 'Her taraf 8', 30, 3),
  ]),
  day('Güç Akışı', 'Akışkan tempo ve core', 34, 'Orta', 'Hız yerine akıcı tekrarlar ve gövde kontrolünü hedefle.', [
    p(IDS.pushups, 3, 8, '6-8 tekrar', 45, 2),
    p(IDS.mountainClimbers, 3, 20, '20 tekrar', 30, 2, [IDS.airBike]),
    p(IDS.plank, 3, 40, '40 sn', 35, 3, [IDS.sideBridge]),
    p(IDS.alternateHeelTouchers, 3, 16, 'Her taraf 16', 30, 2, [IDS.deadBug]),
    p(IDS.windmills, 2, 10, 'Her taraf 10', 30, 3),
    p(IDS.worldsGreatestStretch, 2, 6, 'Her taraf 6', 30, 3),
  ]),
];

const homeStrengthDays = [
  day('Ev Üst Vücut', 'Band çekiş ve itiş dengesi', 42, 'Başlangıç', 'Band gerilimini omuzlarını yükseltmeden kontrol et.', [
    p(IDS.pushups, 3, 10, '8-10 tekrar', 60, 2),
    p(IDS.bandPullApart, 3, 15, '15 tekrar', 35, 2, [IDS.backFlyBands]),
    p(IDS.backFlyBands, 3, 12, '12 tekrar', 35, 2, [IDS.bandPullApart]),
    p(IDS.bandGoodMorning, 3, 12, '12 tekrar', 45, 2),
    p(IDS.deadBug, 3, 10, 'Her taraf 10', 35, 3),
    p(IDS.plank, 3, 35, '35 sn', 35, 3),
  ]),
  day('Ev Alt Vücut', 'Kalça ve bacak odağı', 44, 'Başlangıç', 'Tek taraflı tekrarlar arasında dengeyi koru ve diz takibini izle.', [
    p(IDS.bodyweightSquat, 4, 12, '12 tekrar', 45, 2),
    p(IDS.bodyweightWalkingLunge, 3, 10, 'Her bacak 10', 45, 2),
    p(IDS.bandHipAdductions, 3, 14, 'Her taraf 14', 30, 2),
    p(IDS.singleLegGluteBridge, 3, 10, 'Her bacak 10', 35, 2, [IDS.bridge]),
    p(IDS.bandGoodMorning, 3, 12, '12 tekrar', 45, 2),
    p(IDS.alternateHeelTouchers, 3, 16, 'Her taraf 16', 30, 2),
  ]),
  day('Ev Kondisyon', 'Tüm vücut ritim günü', 36, 'Orta', 'Sürekliliği koru; dinlenmeler kısa ama kontrollü olsun.', [
    p(IDS.airBike, 3, 20, '20 tekrar', 30, 2, [IDS.mountainClimbers]),
    p(IDS.mountainClimbers, 3, 24, '24 tekrar', 30, 2, [IDS.airBike]),
    p(IDS.pushups, 3, 8, '8 tekrar', 45, 2),
    p(IDS.bodyweightSquat, 3, 15, '15 tekrar', 40, 2),
    p(IDS.bandPullApart, 3, 15, '15 tekrar', 30, 2),
    p(IDS.plank, 3, 40, '40 sn', 35, 3),
  ]),
  day('Ev Core & Duruş', 'Merkez ve mobilite kapanışı', 35, 'Başlangıç', 'Son günü toparlanma hissiyle bitir; acele etme.', [
    p(IDS.pelvicTiltBridge, 3, 12, '12 tekrar', 35, 3, [IDS.bridge]),
    p(IDS.sideBridge, 3, 30, 'Her taraf 30 sn', 35, 3, [IDS.plank]),
    p(IDS.deadBug, 3, 10, 'Her taraf 10', 35, 3),
    p(IDS.windmills, 3, 8, 'Her taraf 8', 30, 3),
    p(IDS.worldsGreatestStretch, 2, 6, 'Her taraf 6', 30, 3),
    p(IDS.armCircles, 2, 20, '20 tekrar', 25, 3),
  ]),
];

const homeBodyweightDays = [
  day('Evde Başlangıç A', 'İtiş, squat ve core', 34, 'Başlangıç', 'Vücut ağırlığında tempo kontrolü en büyük ilerleme aracın.', [
    p(IDS.bodyweightSquat, 3, 15, '15 tekrar', 40, 3),
    p(IDS.pushups, 3, 8, '6-8 tekrar', 45, 2),
    p(IDS.bridge, 3, 15, '15 tekrar', 35, 2),
    p(IDS.deadBug, 3, 10, 'Her taraf 10', 35, 3),
    p(IDS.plank, 3, 30, '30 sn', 30, 3),
    p(IDS.armCircles, 2, 20, '20 tekrar', 20, 3),
  ]),
  day('Evde Başlangıç B', 'Lunge, kondisyon ve denge', 36, 'Başlangıç', 'Nabzı yükseltirken formun bozuluyorsa birkaç nefes ara ver.', [
    p(IDS.bodyweightWalkingLunge, 3, 10, 'Her bacak 10', 45, 3),
    p(IDS.mountainClimbers, 3, 20, '20 tekrar', 30, 2, [IDS.airBike]),
    p(IDS.sideBridge, 3, 25, 'Her taraf 25 sn', 30, 3, [IDS.plank]),
    p(IDS.singleLegGluteBridge, 3, 10, 'Her bacak 10', 35, 2, [IDS.bridge]),
    p(IDS.alternateHeelTouchers, 3, 16, 'Her taraf 16', 30, 2),
    p(IDS.ninetyHamstring, 2, 8, 'Her taraf 8', 25, 3),
  ]),
  day('Evde Başlangıç C', 'Tüm vücut kapanışı', 35, 'Başlangıç', 'Haftayı bitirirken tekrar kalitesini koruyup eklemlerini rahatlat.', [
    p(IDS.airBike, 3, 20, '20 tekrar', 30, 2, [IDS.mountainClimbers]),
    p(IDS.bodyweightSquat, 3, 15, '15 tekrar', 40, 2),
    p(IDS.pushups, 3, 8, '6-8 tekrar', 45, 2),
    p(IDS.windmills, 3, 8, 'Her taraf 8', 25, 3),
    p(IDS.worldsGreatestStretch, 2, 6, 'Her taraf 6', 25, 3),
    p(IDS.pelvicTiltBridge, 3, 12, '12 tekrar', 30, 3, [IDS.bridge]),
  ]),
];

export const FREE_PROGRAMS: ProgramPlan[] = [
  createProgram({ id: 'forge-start-full-body', title: 'Başlangıç Tüm Vücut', color: '#3f83ee', tier: 'free', weekCount: 6, focus: 'Temel & Alışkanlık', summary: 'Tanıdık hareketlerle güvenli bir temel kuran, haftada üç günlük sade tüm vücut planı.', difficultyLevel: 'Başlangıç', daysPerWeek: 3, trainingStyle: 'Full Body', goal: 'Genel Form', equipment: 'Standart salon', searchTerms: ['başlangıç', 'full body', 'tam vücut', 'tüm vücut', '3 gün'], days: startFullBodyDays }),
  createProgram({ id: 'denge-upper-lower', title: 'Denge Upper/Lower', color: '#36b692', tier: 'free', weekCount: 6, focus: 'Kas Gelişimi', summary: 'Her ana kas grubunu haftada iki kez çalıştıran dengeli üst-alt vücut sistemi.', difficultyLevel: 'Orta', daysPerWeek: 4, trainingStyle: 'Upper/Lower', goal: 'Kas Gelişimi', equipment: 'Tam donanımlı salon', searchTerms: ['upper lower', 'hipertrofi', 'kas', '4 gün'], days: upperLowerDays }),
  createProgram({ id: 'demir-temeli', title: 'Demir Temeli', color: '#f08a3e', tier: 'free', weekCount: 8, focus: 'Temel Kuvvet', summary: 'Squat, bench press ve deadlift çevresinde kurulan anlaşılır üç günlük güç planı.', difficultyLevel: 'Orta', daysPerWeek: 3, trainingStyle: 'Powerlifting', goal: 'Güç', equipment: 'Barbell ve rack', searchTerms: ['güç', 'powerlifting', 'squat bench deadlift', '3 gün'], days: strengthFoundationDays }),
  createProgram({ id: 'kadin-pilates-akisi', title: 'Pilates Akışı', color: '#c36d7d', tier: 'free', weekCount: 6, focus: 'Core & Duruş', summary: 'Mat ve mini band eşliğinde kalça, merkez ve postür odağı taşıyan üç günlük pilates planı.', difficultyLevel: 'Başlangıç', daysPerWeek: 3, trainingStyle: 'Pilates', goal: 'Genel Form', equipment: 'Mat ve mini band', searchTerms: ['kadın', 'pilates', 'women', 'core', 'postür', 'evde'], days: womensPilatesDays }),
  createProgram({ id: 'kadin-yoga-flow', title: 'Yoga Flow', color: '#7d8cb9', tier: 'free', weekCount: 6, focus: 'Mobilite & Denge', summary: 'Nefes, denge ve merkez kontrolünü öne alan yumuşak ama düzenli bir yoga akışı.', difficultyLevel: 'Başlangıç', daysPerWeek: 3, trainingStyle: 'Yoga', goal: 'Genel Form', equipment: 'Sadece mat', searchTerms: ['kadın', 'yoga', 'women', 'mobilite', 'denge', 'evde'], days: womensYogaDays }),
  createProgram({ id: 'evde-guc-ve-form', title: 'Evde Güç + Form', color: '#4a8a70', tier: 'free', weekCount: 6, focus: 'Evde Kas & Ritim', summary: 'Direnç bandı ve vücut ağırlığıyla evde düzenli güçlenme sağlayan dört günlük akış.', difficultyLevel: 'Başlangıç', daysPerWeek: 4, trainingStyle: 'Home Fitness', goal: 'Güç + Kas', equipment: 'Direnç bandı + mat', searchTerms: ['evde', 'home', 'band', 'equipment', 'güç', '4 gün'], days: homeStrengthDays }),
  createProgram({ id: 'evde-form-baslangici', title: 'Evde Form Başlangıcı', color: '#d4863b', tier: 'free', weekCount: 6, focus: 'Aletsiz Başlangıç', summary: 'Hiç ekipman olmadan kondisyon, core ve tüm vücut alışkanlığı kuran sade başlangıç planı.', difficultyLevel: 'Başlangıç', daysPerWeek: 3, trainingStyle: 'Home Fitness', goal: 'Genel Form', equipment: 'Ekipmansız', searchTerms: ['evde', 'home', 'bodyweight', 'aletsiz', 'başlangıç', '3 gün', 'tüm vücut'], days: homeBodyweightDays }),
];

export const PREMIUM_PROGRAMS: ProgramPlan[] = [
  createProgram({ id: 'atlas-full-body-pro', title: 'Atlas Full Body Pro', color: '#0f6a64', tier: 'premium', weekCount: 8, focus: 'Kas & Performans', summary: 'Dört güne yayılan tam vücut sistemiyle güç, kas hacmi ve çalışma kapasitesini birlikte geliştirir.', difficultyLevel: 'Orta', daysPerWeek: 4, trainingStyle: 'Full Body', goal: 'Güç + Kas', equipment: 'Tam donanımlı salon', searchTerms: ['full body pro', 'recomp', '4 gün', 'kas ve güç'], days: atlasDays }),
  createProgram({ id: 'vector-upper-lower-hypertrophy', title: 'Vector Hypertrophy', color: '#8450d8', tier: 'premium', weekCount: 8, focus: 'Hipertrofi', summary: 'Temel hareketleri korurken kas grubu başına planlı haftalık hacim sunan upper/lower programı.', difficultyLevel: 'Orta', daysPerWeek: 4, trainingStyle: 'Upper/Lower', goal: 'Kas Gelişimi', equipment: 'Tam donanımlı salon', searchTerms: ['vector', 'hipertrofi', 'upper lower', 'kas hacmi'], days: vectorDays }),
  createProgram({ id: 'barbell-base-8', title: 'Barbell Base 8', color: '#365f92', tier: 'premium', weekCount: 8, focus: 'Powerlifting', summary: 'Squat, bench ve deadlift performansını teknik, hacim ve kontrollü yoğunlukla ilerletir.', difficultyLevel: 'Orta', daysPerWeek: 4, trainingStyle: 'Powerlifting', goal: 'Güç', equipment: 'Barbell, bench ve rack', searchTerms: ['powerlifting', 'barbell', 'squat bench deadlift', 'güç'], days: barbellBaseDays }),
  createProgram({ id: 'apex-powerbuilding-system', title: 'Apex Powerbuilding', color: '#b55634', tier: 'premium', weekCount: 8, focus: 'Güç + Hacim', summary: 'Ağır ana liftlerle güç, ayrı hacim günleriyle kas gelişimi sağlayan beş günlük sistem.', difficultyLevel: 'Zor', daysPerWeek: 5, trainingStyle: 'Powerbuilding', goal: 'Güç + Kas', equipment: 'Tam donanımlı salon', searchTerms: ['powerbuilding', '5 gün', 'güç ve hacim', 'ileri'], days: apexDays }),
  createProgram({ id: 'titan-split-mastery', title: 'Titan Split', color: '#6c7b52', tier: 'premium', weekCount: 8, focus: 'İleri Hipertrofi', summary: 'Tanıdık press, çekiş ve bacak hareketleriyle yüksek ama düzenli hacim sunan beş günlük split.', difficultyLevel: 'Zor', daysPerWeek: 5, trainingStyle: 'Split', goal: 'Kas Gelişimi', equipment: 'Tam donanımlı salon', searchTerms: ['split', '5 gün', 'bodybuilding', 'kas geliştirme'], days: titanDays }),
];

export const ALL_PROGRAMS = [...FREE_PROGRAMS, ...PREMIUM_PROGRAMS];

function foldSearchText(value: string): string {
  return normalizedText(value).replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');
}

export function filterProgramPlans(programs: ProgramPlan[], filters: ProgramDiscoveryFilters): ProgramPlan[] {
  const query = foldSearchText(filters.query ?? '');
  const style = filters.style ?? 'Tümü';
  const difficulty = filters.difficulty ?? 'Tümü';
  const days = filters.daysPerWeek ?? 'Tümü';
  return programs.filter((program) => {
    if (style !== 'Tümü' && program.trainingStyle !== style) return false;
    if (difficulty !== 'Tümü' && program.difficultyLevel !== difficulty) return false;
    if (days !== 'Tümü' && program.daysPerWeek !== days) return false;
    if (!query) return true;
    return foldSearchText([program.title, program.summary, program.focus, program.goal, program.trainingStyle, program.equipment, ...program.searchTerms].join(' ')).includes(query);
  });
}

export function getProgramById(programId: string): ProgramPlan | undefined {
  return ALL_PROGRAMS.find((program) => program.id === programId);
}

export function getProgramDayCount(program: ProgramPlan): number {
  return program.weeks.reduce((sum, week) => sum + week.days.length, 0);
}

export function validateProgramCatalog(): string[] {
  const failures: string[] = [];
  for (const program of ALL_PROGRAMS) {
    for (const week of program.weeks) {
      for (const programDay of week.days) {
        for (const exercise of programDay.exercises) {
          if (!hasExercise(exercise.exerciseId)) failures.push(`${program.title}: ${exercise.exerciseId} bulunamadı`);
          if (exercise.sets < 1 || exercise.reps < 1) failures.push(`${program.title}: geçersiz set/tekrar`);
        }
      }
    }
  }
  return failures;
}
