/**
 * Faz 11 — Scientific Transparency Layer
 *
 * Constitution evidence hierarchy'yi somutlaştırır. Her öneri için hangi
 * kanıt kategorisinin temel aldığını gösterir. Uydurma citation yok: sadece
 * geniş kabul görmüş, doğrulanmış kategoriler ve kaynak isimleri kullanılır
 * (DOI/URL yerine). Bu, kullanıcı ve QA için denetlenebilirlik sağlar.
 */

export type EvidenceCategory =
  | 'position_stand'
  | 'meta_analysis'
  | 'systematic_review'
  | 'rct'
  | 'consensus'
  | 'textbook';

export type EvidenceTopic =
  | 'hypertrophy_volume'
  | 'training_frequency'
  | 'progressive_overload'
  | 'effort_rir_rpe'
  | 'fatigue_management_deload'
  | 'exercise_selection_specificity'
  | 'recovery_individualization'
  | 'safety_injury_prevention';

export type EvidenceReference = {
  id: string;
  category: EvidenceCategory;
  topic: EvidenceTopic;
  /** Doğrulanmış kaynak ismi (kurum/yazar). URL değil. */
  source: string;
  year: number;
  /** Kaynağın genel bulgusunun kısa, dürüst özeti. */
  summary: string;
  /** Bu kanıt ne kadar güçlü (constitution hierarchy'e göre). */
  strength: 'high' | 'moderate' | 'low';
};

export type ClaimBasis = {
  claim: string;
  topic: EvidenceTopic;
  references: EvidenceReference[];
  /** Belirsizlik notu (constitution uncertainty policy). */
  uncertainty?: string;
};
