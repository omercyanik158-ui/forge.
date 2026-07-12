import type { CoachNarrative, CoachNarrativeInput } from '@/types/aiProgramCoach';

/**
 * Faz 13 — Coach Narrative Builder
 *
 * Faz 8 explanation artifact'inden doğal dil koç anlatımı üretir.
 * Template-first: LLM bağımlılığı yok, her zaman çalışır. Constitution:
 * explanation dışında hiçbir şey uydurulmaz; belirsizlik açıkça ifade edilir.
 */

function joinFirst(items: string[], count: number): string {
  return items.slice(0, count).join(' ');
}

export function buildCoachNarrative(input: CoachNarrativeInput): CoachNarrative {
  const { explanation, splitLabel, daysPerWeek, weekCount } = input;

  const intro = `${explanation.headline}. ${joinFirst(explanation.whyThisPlan, 2).trim()}`;

  const structureParts: string[] = [];
  if (explanation.structureRationale.length > 0) structureParts.push(joinFirst(explanation.structureRationale, 1));
  if (explanation.volumeRationale.length > 0) structureParts.push(joinFirst(explanation.volumeRationale, 2));
  const structureSummary = `${splitLabel} yapısını ${daysPerWeek} günde, ${weekCount} haftalık bir blok olarak kurduk. ${structureParts.join(' ')}`.trim();

  const progressionNote = joinFirst(explanation.progressionRationale, 2);
  const firstSafety = explanation.safetyNotes.slice(0, 1).join(' ');
  const progressionCombined = [progressionNote, firstSafety].filter(Boolean).join(' ');

  const honestyParts: string[] = [];
  if (explanation.uncertaintyNotes.length > 0) honestyParts.push(joinFirst(explanation.uncertaintyNotes, 1));
  if (explanation.assumptions.length > 0) honestyParts.push(joinFirst(explanation.assumptions, 1));
  const honestyNote = honestyParts.length > 0
    ? honestyParts.join(' ')
    : 'Bu plan kanıt ortalamasına dayanır; bireysel toleransını izlemek senin sorumluluğunda.';

  return {
    intro,
    structureSummary,
    progressionNote: progressionCombined,
    honestyNote,
    llmPolished: false,
  };
}

/**
 * Constitution-bound prompt şablonu. LLM (Gemini) opsiyonel olarak template
 * çıktıyı cılar; ama prompt kesinlikle explanation dışında içerik üretmeyi
 * yasaklar. Faz 13'ün LLM entegrasyonu bu prompt üzerinden yapılır.
 */
export const COACH_NARRATIVE_CONSTITUTION_PROMPT = `Sen FORGE AI koçlusun. Aşağıda yapılandırılmış bir antrenman programı açıklaması var.
GÖREV: Bu açıklamayı sade, destekleyici, sakin bir dille yeniden ifade et.
KURALLAR (Constitution):
- Yeni hareket, set, tekrar, yük, kanıt veya rakam UYDURMA.
- Yalnızca verilen açıklamadaki bilgileri kullan.
- Belirsizlik notlarını gizleme; dürüst kal.
- Tanı koyma; tıbbi tavsiye verme.
- Bro-science veya abartılı vaat kullanma.
Çıktı kısa ve doğal olsun.`;
