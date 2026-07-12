import type { AIProgramExplanation } from './aiProgramPlan';

/**
 * Faz 13 — LLM Coach Explanation Layer
 *
 * Faz 8'in yapılandırılmış explanation artifact'ini doğal dile çevirir.
 * Constitution: LLM yalnızca mevcut structured explanation'ı yeniden ifade
 * eder; yeni iddia, kanıt, hareket veya rakam UYDURMAZ. Template-first:
 * LLM yoksa bile template tabanlı anlaşılır özeti çalışır.
 */

export type CoachNarrative = {
  /** Kısa giriş paragrafı (headline + neden). */
  intro: string;
  /** Yapı ve hacim özeti (1-2 cümle). */
  structureSummary: string;
  /** İlerleme ve güvenlik notu. */
  progressionNote: string;
  /** Constitution uyumu: belirsizlik itirafı. */
  honestyNote: string;
  /** LLM cilası uygulandı mı. */
  llmPolished: boolean;
};

export type CoachNarrativeInput = {
  explanation: AIProgramExplanation;
  splitLabel: string;
  daysPerWeek: number;
  weekCount: number;
};
