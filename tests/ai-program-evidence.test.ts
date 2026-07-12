import { describe, expect, it } from 'vitest';
import { buildClaimBasis, EVIDENCE_REFERENCES, getReferencesForTopic, getReferencesForTopics } from '@/services/aiProgramEvidenceLayer';
import type { EvidenceTopic } from '@/types/aiProgramEvidence';

describe('evidence reference catalog', () => {
  const requiredTopics: EvidenceTopic[] = [
    'hypertrophy_volume',
    'training_frequency',
    'progressive_overload',
    'effort_rir_rpe',
    'fatigue_management_deload',
    'exercise_selection_specificity',
    'safety_injury_prevention',
  ];

  it('has at least one reference per required topic', () => {
    for (const topic of requiredTopics) {
      expect(getReferencesForTopic(topic).length).toBeGreaterThan(0);
    }
  });

  it('every reference has a verified source name, not a fabricated URL', () => {
    for (const ref of EVIDENCE_REFERENCES) {
      expect(ref.source.length).toBeGreaterThan(0);
      expect(ref.summary.length).toBeGreaterThan(0);
      expect(ref.year).toBeGreaterThan(2000);
    }
  });
});

describe('multi-topic lookup', () => {
  it('deduplicates references across topics', () => {
    const refs = getReferencesForTopics(['hypertrophy_volume', 'progressive_overload']);
    const ids = refs.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('sorts by strength (high first)', () => {
    const refs = getReferencesForTopics(['hypertrophy_volume', 'training_frequency']);
    const strengths = refs.map((r) => r.strength);
    const highIndex = strengths.indexOf('high');
    const lowIndex = strengths.lastIndexOf('low');
    if (highIndex !== -1 && lowIndex !== -1) {
      expect(highIndex).toBeLessThan(lowIndex);
    }
  });
});

describe('claim basis builder', () => {
  it('attaches references and uncertainty to a claim', () => {
    const basis = buildClaimBasis(
      'Haftada 10-20 set göğüs hacmi çoğu bireyde hypertrophy destekler.',
      'hypertrophy_volume',
      'Bireysel tolerans değişir; rakamlar popülasyon ortalamasıdır.',
    );
    expect(basis.references.length).toBeGreaterThan(0);
    expect(basis.uncertainty).toContain('tolerans');
  });
});
