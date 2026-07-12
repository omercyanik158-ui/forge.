import { describe, expect, it } from 'vitest';
import { buildCoachNarrative, COACH_NARRATIVE_CONSTITUTION_PROMPT } from '@/services/aiProgramCoachNarrative';
import type { AIProgramExplanation } from '@/types/aiProgramPlan';

function mockExplanation(): AIProgramExplanation {
  return {
    headline: 'Upper/Lower · 4 gün · build muscle odaklı 5 haftalık blok',
    whyThisPlan: ['4 gün seçtin ve FORGE 4 günü öneriyor.', 'Hedefin hypertrophy.'],
    structureRationale: ['Upper/Lower split yorgunluk yönetimi iyi.'],
    volumeRationale: ['Haftalık 40 set tavanı.', 'Göğüs: haftada 12 set.'],
    selectionRationale: ['Hareketler compound önce dizildi.'],
    progressionRationale: ['RIR kademeli düşer, deload haftasında hacim azalır.'],
    safetyNotes: ['Ağrı bildirilmedi, standart seçim uygulandı.'],
    uncertaintyNotes: ['Hacim bantları popülasyon ortalamasıdır.'],
    assumptions: ['Toparlanma yeterli varsayıldı.'],
  };
}

describe('coach narrative builder', () => {
  it('produces a non-empty narrative from an explanation', () => {
    const narrative = buildCoachNarrative({
      explanation: mockExplanation(),
      splitLabel: 'Upper/Lower',
      daysPerWeek: 4,
      weekCount: 5,
    });
    expect(narrative.intro.length).toBeGreaterThan(0);
    expect(narrative.structureSummary).toContain('Upper/Lower');
    expect(narrative.structureSummary).toContain('4 günde');
    expect(narrative.progressionNote.length).toBeGreaterThan(0);
  });

  it('is template-first (not llm polished) by default', () => {
    const narrative = buildCoachNarrative({
      explanation: mockExplanation(),
      splitLabel: 'Upper/Lower',
      daysPerWeek: 4,
      weekCount: 5,
    });
    expect(narrative.llmPolished).toBe(false);
  });

  it('always carries an honesty note even with empty uncertainty', () => {
    const explanation = mockExplanation();
    explanation.uncertaintyNotes = [];
    explanation.assumptions = [];
    const narrative = buildCoachNarrative({
      explanation,
      splitLabel: 'Upper/Lower',
      daysPerWeek: 4,
      weekCount: 5,
    });
    expect(narrative.honestyNote.length).toBeGreaterThan(0);
  });
});

describe('constitution prompt guard', () => {
  it('forbids fabrication outside the explanation', () => {
    expect(COACH_NARRATIVE_CONSTITUTION_PROMPT).toContain('UYDURMA');
    expect(COACH_NARRATIVE_CONSTITUTION_PROMPT).toContain('Constitution');
  });
});
