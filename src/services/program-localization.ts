import type { ProgramPlan } from './programCatalog';
import type { AppLanguage } from './localization';

type DayCopy = { title: string; subtitle: string; notes: string };
type ProgramCopy = { title: string; focus: string; summary: string; goal: string; equipment: string; days: DayCopy[] };

const ENGLISH_COPY: Record<string, ProgramCopy> = {
  'forge-start-full-body': {
    title: 'Foundation Full Body', focus: 'Foundation & Consistency', goal: 'General Fitness', equipment: 'Standard gym',
    summary: 'A simple three-day full-body plan that builds a safe foundation with familiar movements.',
    days: [
      { title: 'Full Body A', subtitle: 'Squat, horizontal push, and back foundation', notes: 'Prioritize movement quality over load.' },
      { title: 'Full Body B', subtitle: 'Legs, vertical push, and horizontal pull', notes: 'Keep the start and finish position consistent on every rep.' },
      { title: 'Full Body C', subtitle: 'Unilateral legs and balanced upper body', notes: 'Finish the week with clean repetitions instead of forced fatigue.' },
    ],
  },
  'denge-upper-lower': {
    title: 'Balanced Upper/Lower', focus: 'Muscle Growth', goal: 'Muscle Growth', equipment: 'Full gym',
    summary: 'A balanced upper/lower system that trains every major muscle group twice per week.',
    days: [
      { title: 'Upper A', subtitle: 'Bench and row focused upper body', notes: 'Rest longer on compound lifts and keep accessories controlled.' },
      { title: 'Lower A', subtitle: 'Squat and posterior-chain balance', notes: 'Finish glutes and hamstrings under control after squats.' },
      { title: 'Upper B', subtitle: 'Upper chest, back, and shoulder volume', notes: 'Progress toward the top of the rep range with clean reps.' },
      { title: 'Lower B', subtitle: 'Deadlift, quads, and glutes', notes: 'Keep deadlift technique clean and avoid unnecessary failure.' },
    ],
  },
  'demir-temeli': {
    title: 'Iron Foundation', focus: 'Base Strength', goal: 'Strength', equipment: 'Barbell and rack',
    summary: 'A clear three-day strength plan built around the squat, bench press, and deadlift.',
    days: [
      { title: 'Squat + Bench', subtitle: 'Two main lifts with back support', notes: 'Use the same setup routine for every main set.' },
      { title: 'Deadlift + Press', subtitle: 'Pulling strength and vertical push', notes: 'Protect your starting position before chasing speed.' },
      { title: 'Bench + Squat', subtitle: 'Bench priority and technical squat', notes: 'Prefer small load increases across completed sets.' },
    ],
  },
  'atlas-full-body-pro': {
    title: 'Atlas Full Body Pro', focus: 'Muscle & Performance', goal: 'Strength + Muscle', equipment: 'Full gym',
    summary: 'A four-day full-body system that develops strength, muscle, and work capacity together.',
    days: [
      { title: 'Atlas A', subtitle: 'Squat and balanced upper body', notes: 'Keep two reps in reserve on the main movements.' },
      { title: 'Atlas B', subtitle: 'Deadlift and shoulder focus', notes: 'Keep deadlift volume controlled.' },
      { title: 'Atlas C', subtitle: 'Bench and quad volume', notes: 'Match the quality of every bench and row repetition.' },
      { title: 'Atlas D', subtitle: 'Glutes, upper chest, and pulling', notes: 'Finish the week with rhythm and form instead of failure.' },
    ],
  },
  'vector-upper-lower-hypertrophy': {
    title: 'Vector Hypertrophy', focus: 'Hypertrophy', goal: 'Muscle Growth', equipment: 'Full gym',
    summary: 'An upper/lower program with planned weekly volume while preserving the main compound lifts.',
    days: [
      { title: 'Vector Upper A', subtitle: 'Bench and row focused upper body', notes: 'Rest longer on compound lifts and keep accessories controlled.' },
      { title: 'Vector Lower A', subtitle: 'Squat and posterior-chain balance', notes: 'Finish glutes and hamstrings under control after squats.' },
      { title: 'Vector Upper B', subtitle: 'Upper chest, back, and shoulder volume', notes: 'Progress toward the top of the rep range with clean reps.' },
      { title: 'Vector Lower B', subtitle: 'Deadlift, quads, and glutes', notes: 'Keep deadlift technique clean and avoid unnecessary failure.' },
    ],
  },
  'barbell-base-8': {
    title: 'Barbell Base 8', focus: 'Powerlifting', goal: 'Strength', equipment: 'Barbell, bench, and rack',
    summary: 'Builds squat, bench, and deadlift performance through technique, volume, and controlled intensity.',
    days: [
      { title: 'Squat Strength', subtitle: 'Main squat with bench support', notes: 'Keep two to three reps in reserve and progress in small jumps.' },
      { title: 'Bench Strength', subtitle: 'Bench priority and upper back', notes: 'Repeat the same bench setup on every set.' },
      { title: 'Deadlift Strength', subtitle: 'Deadlift with leg support', notes: 'Recover fully between main pulling sets.' },
      { title: 'Bench Volume', subtitle: 'Second bench day and pulling volume', notes: 'Protect bar speed and rep quality.' },
    ],
  },
  'apex-powerbuilding-system': {
    title: 'Apex Powerbuilding', focus: 'Strength + Size', goal: 'Strength + Muscle', equipment: 'Full gym',
    summary: 'A five-day system combining heavy compound lifts with dedicated muscle-building days.',
    days: [
      { title: 'Upper Strength', subtitle: 'Heavy bench and row', notes: 'Produce strength without taking the main lifts to failure.' },
      { title: 'Lower Strength', subtitle: 'Squat and posterior chain', notes: 'Distribute squat and deadlift volume conservatively.' },
      { title: 'Pull Volume', subtitle: 'Back, rear delts, and biceps', notes: 'Move through the back rather than shrugging through pulls.' },
      { title: 'Push Volume', subtitle: 'Chest, shoulders, and triceps', notes: 'Maintain shoulder position through the push volume.' },
      { title: 'Leg Volume', subtitle: 'Quads, glutes, and hamstrings', notes: 'Do not lose rep control as fatigue rises.' },
    ],
  },
  'titan-split-mastery': {
    title: 'Titan Split', focus: 'Advanced Hypertrophy', goal: 'Muscle Growth', equipment: 'Full gym',
    summary: 'A structured five-day split using familiar pressing, pulling, and leg movements.',
    days: [
      { title: 'Chest + Triceps', subtitle: 'Chest volume with familiar presses', notes: 'Chase load on the first presses and controlled volume afterward.' },
      { title: 'Back + Biceps', subtitle: 'Back width and thickness', notes: 'Balance vertical and horizontal pulling.' },
      { title: 'Legs', subtitle: 'Quads, hamstrings, and glutes', notes: 'Rest fully on compounds and keep isolation work rhythmic.' },
      { title: 'Shoulders + Upper Back', subtitle: 'Shoulder size and posture', notes: 'Control lateral and rear-delt work after pressing.' },
      { title: 'Arms + Core', subtitle: 'Biceps, triceps, and trunk', notes: 'Use a full range of motion instead of cheating repetitions.' },
    ],
  },
  'kadin-pilates-akisi': {
    title: 'Pilates Flow', focus: 'Core & Posture', goal: 'General Fitness', equipment: 'Mat and mini band',
    summary: 'A three-day Pilates plan built around glutes, core control, and posture with a mat and mini band.',
    days: [
      { title: 'Core Flow', subtitle: 'Deep core and glute control', notes: 'Match your breath to the tempo and protect your lower-back position.' },
      { title: 'Lower-Body Pilates', subtitle: 'Glutes, legs, and posture', notes: 'Keep the movements small and controlled instead of rushing.' },
      { title: 'Posture & Mobility', subtitle: 'Shoulder opening and trunk balance', notes: 'Lengthen through the neck and keep the rib cage stacked.' },
    ],
  },
  'kadin-yoga-flow': {
    title: 'Yoga Flow', focus: 'Mobility & Balance', goal: 'General Fitness', equipment: 'Mat only',
    summary: 'A gentle but consistent yoga-inspired flow centered on breathing, balance, and core control.',
    days: [
      { title: 'Morning Flow', subtitle: 'Mobility and breathing', notes: 'Let your breathing pace every transition and relax the shoulders.' },
      { title: 'Balance Flow', subtitle: 'Lower body and center line', notes: 'Keep the hips level and shorten the range if you lose balance.' },
      { title: 'Strength Flow', subtitle: 'Fluid tempo and core', notes: 'Aim for smooth repetitions instead of speed.' },
    ],
  },
  'evde-guc-ve-form': {
    title: 'Home Strength + Shape', focus: 'At-Home Strength', goal: 'Strength + Muscle', equipment: 'Resistance band and mat',
    summary: 'A four-day at-home structure that builds strength and consistency with bands and bodyweight work.',
    days: [
      { title: 'Home Upper Body', subtitle: 'Band pull and push balance', notes: 'Control the band tension without letting the shoulders shrug.' },
      { title: 'Home Lower Body', subtitle: 'Glute and leg focus', notes: 'Stay balanced between sides and keep knee tracking clean.' },
      { title: 'Home Conditioning', subtitle: 'Full-body rhythm day', notes: 'Keep moving steadily while respecting short rest periods.' },
      { title: 'Home Core & Posture', subtitle: 'Center line and mobility finish', notes: 'Close the week with a recovered, controlled pace.' },
    ],
  },
  'evde-form-baslangici': {
    title: 'Home Fitness Starter', focus: 'No-Equipment Start', goal: 'General Fitness', equipment: 'No equipment',
    summary: 'A simple entry plan that builds conditioning, core work, and whole-body consistency without equipment.',
    days: [
      { title: 'Home Starter A', subtitle: 'Push, squat, and core', notes: 'Your best progress tool here is clean tempo and repeat quality.' },
      { title: 'Home Starter B', subtitle: 'Lunge, conditioning, and balance', notes: 'If your form slips as your heart rate climbs, pause for a breath.' },
      { title: 'Home Starter C', subtitle: 'Full-body finish', notes: 'Finish the week by keeping your reps crisp and your joints loose.' },
    ],
  },
  'evde-tum-vucut-ritim': {
    title: 'Home Whole-Body Rhythm', focus: 'Rhythm & Conditioning', goal: 'General Fitness', equipment: 'No equipment',
    summary: 'A moderate at-home plan that improves conditioning and whole-body endurance with short-rest flows.',
    days: [
      { title: 'Home Whole-Body A', subtitle: 'Squat, push, and core rhythm', notes: 'Keep the tempo steady and avoid rushing reps.' },
      { title: 'Home Whole-Body B', subtitle: 'Lunge, glute, and posture', notes: 'Complete unilateral reps with balance and control.' },
      { title: 'Home Whole-Body C', subtitle: 'Core and flowing conditioning', notes: 'Regulate your breathing and protect your rhythm.' },
      { title: 'Home Whole-Body D', subtitle: 'Finish and balance', notes: 'End the week feeling controlled and recovered.' },
    ],
  },
  'evde-mini-band-alt-ust': {
    title: 'Home Mini-Band Upper/Lower', focus: 'Upper/Lower Home Strength', goal: 'Strength + Muscle', equipment: 'Mini band + light dumbbells',
    summary: 'A home upper/lower split built around mini bands and light dumbbells for strength and shape.',
    days: [
      { title: 'Home Upper A', subtitle: 'Push, pull, and shoulder balance', notes: 'Control the shoulder blades through every rep.' },
      { title: 'Home Lower A', subtitle: 'Glutes and leg activation', notes: 'Finish each rep by actively squeezing the glutes.' },
      { title: 'Home Upper B', subtitle: 'Posture and center line', notes: 'Keep the neck long and the ribs stacked.' },
      { title: 'Home Lower B', subtitle: 'Hamstrings and rhythm', notes: 'Move from the hips instead of the lower back.' },
    ],
  },
};

const DIFFICULTY_EN: Record<string, string> = { Başlangıç: 'Beginner', Orta: 'Intermediate', Zor: 'Advanced' };

function repLabelEn(value: string): string {
  return value.replace(/^Her bacak\s*/i, 'Each leg ').replace(/tekrar/gi, 'reps').replace(/\bsn\b/gi, 'sec');
}

export function localizeProgramPlan(program: ProgramPlan, language: AppLanguage): ProgramPlan {
  if (language === 'tr') return program;
  const copy = ENGLISH_COPY[program.id];
  if (!copy) return program;
  return {
    ...program,
    title: copy.title,
    duration: `${program.weeks.length} Weeks`,
    sub: `${program.weeks.length} weeks · ${program.daysPerWeek} days · ${DIFFICULTY_EN[program.difficultyLevel] ?? program.difficultyLevel}`,
    focus: copy.focus,
    summary: copy.summary,
    difficultyLevel: (DIFFICULTY_EN[program.difficultyLevel] ?? program.difficultyLevel) as ProgramPlan['difficultyLevel'],
    goal: copy.goal as ProgramPlan['goal'],
    equipment: copy.equipment,
    weeks: program.weeks.map((week, weekIndex) => ({
      ...week,
      title: `Week ${weekIndex + 1}`,
      guidance: weekIndex + 1 === program.weeks.length && program.weeks.length >= 6
        ? 'Deload week: reduce volume, protect technique, and leave more reps in reserve.'
        : 'Progress with clean repetitions and small load increases while preserving form.',
      days: week.days.map((day, dayIndex) => {
        const dayCopy = copy.days[dayIndex];
        return {
          ...day,
          title: dayCopy?.title ?? day.title,
          subtitle: dayCopy?.subtitle ?? day.subtitle,
          difficulty: DIFFICULTY_EN[day.difficulty] ?? day.difficulty,
          notes: dayCopy?.notes ?? day.notes,
          exercises: day.exercises.map((exercise) => ({ ...exercise, repLabel: repLabelEn(exercise.repLabel) })),
        };
      }),
    })),
  };
}

export function localizeProgramPlans(programs: ProgramPlan[], language: AppLanguage): ProgramPlan[] {
  return programs.map((program) => localizeProgramPlan(program, language));
}
