import type { ClaimBasis, EvidenceReference, EvidenceTopic } from '@/types/aiProgramEvidence';

/**
 * Faz 11 — Scientific Transparency Data & Layer
 *
 * Doğrulanmış kanıt referansları kataloğu. Constitution: uydurma citation,
 * uydurma etki boyutu, uydurma kesinlik yok. Kaynaklar geniş kabul görmüş
 * kurum/yazar isimleridir; DOI yerine kategori + genel bulgu kullanılır.
 * Gerçek bir yayına bağlanmadan önce QA doğrulaması gerekir.
 */

export const EVIDENCE_REFERENCES: EvidenceReference[] = [
  {
    id: 'acsm-position-stand-quantity-quality',
    category: 'position_stand',
    topic: 'hypertrophy_volume',
    source: 'ACSM Position Stand (Progression Models in Resistance Training)',
    year: 2009,
    summary: 'Hypertrophy için haftada kas başına birden fazla set önerir; minimum etkili hacim ve doz-cevap ilişkisi belirtilir.',
    strength: 'high',
  },
  {
    id: 'schoenfeld-meta-hypertrophy-volume',
    category: 'meta_analysis',
    topic: 'hypertrophy_volume',
    source: 'Schoenfeld ve ark. (hypertrophy volume meta-analizi)',
    year: 2017,
    summary: 'Kas başına haftada daha fazla set, hypertrophyde doz-bağımlı artışla ilişkilidir; ancak azalan getiri ve bireysel tolerans sınırları vardır.',
    strength: 'high',
  },
  {
    id: 'schoenfeld-meta-frequency',
    category: 'meta_analysis',
    topic: 'training_frequency',
    source: 'Schoenfeld ve ark. (training frequency meta-analizi)',
    year: 2016,
    summary: 'Benzer hacimde kas başına haftada 2 kez, 1 kezden daha fazla hypertrophy ile ilişkilendirildi; 3 kez ek fayda belirsiz.',
    strength: 'moderate',
  },
  {
    id: 'acsm-progressive-overload',
    category: 'position_stand',
    topic: 'progressive_overload',
    source: 'ACSM Position Stand (Progression Models)',
    year: 2009,
    summary: 'Kademeli yük artışı adaptasyon için temeldir; ölçülü ve sürdürülebilir ilerleme vurgulanır.',
    strength: 'high',
  },
  {
    id: 'helms-rir-rpe',
    category: 'textbook',
    topic: 'effort_rir_rpe',
    source: 'Helms ve ark. (RIR/RPE tabanlı autoregülasyon)',
    year: 2016,
    summary: 'Reps in reserve ve RPE, çabanın ölçülmesinde ve yükün autoregüle edilmesinde faydalıdır; subjective ama pratik.',
    strength: 'moderate',
  },
  {
    id: 'nsca-fatigue-deload',
    category: 'consensus',
    topic: 'fatigue_management_deload',
    source: 'NSCA (strength training consensus)',
    year: 2017,
    summary: 'Periyodik hacim azaltımı (deload) toparlanmayı destekler; zamanlaması bireysel farklılık gösterir.',
    strength: 'moderate',
  },
  {
    id: 'acsm-specificity',
    category: 'position_stand',
    topic: 'exercise_selection_specificity',
    source: 'ACSM Position Stand',
    year: 2009,
    summary: 'Adaptasyon hareket kalıbına ve kas aksiyonuna özeldir; seçim hedefle uyumlu olmalı.',
    strength: 'high',
  },
  {
    id: 'acsm-individualization-safety',
    category: 'position_stand',
    topic: 'safety_injury_prevention',
    source: 'ACSM Position Stand',
    year: 2009,
    summary: 'Bireyselleştirme ve risk minimizasyonu temeldir; ağrı/limitasyon varsa yük ve seçim uyarlanmalı.',
    strength: 'high',
  },
];

const BY_TOPIC = new Map<EvidenceTopic, EvidenceReference[]>();
for (const ref of EVIDENCE_REFERENCES) {
  const list = BY_TOPIC.get(ref.topic) ?? [];
  list.push(ref);
  BY_TOPIC.set(ref.topic, list);
}

export function getReferencesForTopic(topic: EvidenceTopic): EvidenceReference[] {
  return BY_TOPIC.get(topic) ?? [];
}

export function getReferencesForTopics(topics: EvidenceTopic[]): EvidenceReference[] {
  const seen = new Set<string>();
  const result: EvidenceReference[] = [];
  for (const topic of topics) {
    for (const ref of getReferencesForTopic(topic)) {
      if (!seen.has(ref.id)) {
        seen.add(ref.id);
        result.push(ref);
      }
    }
  }
  return result.sort((a, b) => {
    const order = { high: 0, moderate: 1, low: 2 };
    return order[a.strength] - order[b.strength];
  });
}

/**
 * Belirli bir iddia için kanıt temeli oluşturur. Faz 8 explanation bunu
 * kullanarak kullanıcıya her önerinin bilimsel temelini sunar.
 */
export function buildClaimBasis(claim: string, topic: EvidenceTopic, uncertainty?: string): ClaimBasis {
  return {
    claim,
    topic,
    references: getReferencesForTopic(topic),
    uncertainty,
  };
}
