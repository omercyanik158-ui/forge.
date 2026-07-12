import { describe, expect, it } from 'vitest';
import { filterProgramPlans, getProgramById, getProgramDayCount, validateProgramCatalog, type ProgramPlan } from '@/services/programCatalog';

describe('program catalog', () => {
  function expectProgram(id: string): ProgramPlan {
    const program = getProgramById(id);
    expect(program).toBeDefined();
    return program!;
  }

  it('kadın ve evde programlarını erişilebilir tutar', () => {
    const womensPilates = expectProgram('kadin-pilates-akisi');
    const womensYoga = expectProgram('kadin-yoga-flow');
    const homeStrength = expectProgram('evde-guc-ve-form');
    const homeBodyweight = expectProgram('evde-form-baslangici');

    expect(womensPilates).toMatchObject({ trainingStyle: 'Pilates', tier: 'free', daysPerWeek: 3 });
    expect(womensYoga).toMatchObject({ trainingStyle: 'Yoga', tier: 'free', daysPerWeek: 3 });
    expect(homeStrength).toMatchObject({ trainingStyle: 'Home Fitness', equipment: 'Direnç bandı + mat' });
    expect(homeBodyweight).toMatchObject({ trainingStyle: 'Home Fitness', equipment: 'Ekipmansız' });
  });

  it('filtreler kadın ve evde akışları doğru döndürür', () => {
    const programs = [
      expectProgram('kadin-pilates-akisi'),
      expectProgram('kadin-yoga-flow'),
      expectProgram('evde-guc-ve-form'),
      expectProgram('evde-form-baslangici'),
    ];
    const pilatesOnly = filterProgramPlans(programs, { style: 'Pilates' });
    const homeOnly = filterProgramPlans(programs, { style: 'Home Fitness', difficulty: 'Başlangıç' });
    const womenQuery = filterProgramPlans(programs, { query: 'kadin yoga' });

    expect(pilatesOnly.map((program) => program.id)).toEqual(['kadin-pilates-akisi']);
    expect(homeOnly.map((program) => program.id)).toEqual(['evde-guc-ve-form', 'evde-form-baslangici']);
    expect(womenQuery.map((program) => program.id)).toEqual(['kadin-yoga-flow']);
  });

  it('gün sayısını ve katalog bütünlüğünü korur', () => {
    const womensPilates = expectProgram('kadin-pilates-akisi');
    expect(getProgramDayCount(womensPilates)).toBe(18);
    expect(validateProgramCatalog()).toEqual([]);
  });
});
