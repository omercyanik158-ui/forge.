import {
  LOWER_BODY_PRIORITY_MUSCLES,
  UPPER_BODY_PRIORITY_MUSCLES,
  type AIProgramDecisionProfile,
  type AIProgramSplitCandidate,
  type AIProgramSplitKey,
} from '@/types/aiProgramDecision';

type SplitDefinition = {
  key: AIProgramSplitKey;
  label: string;
  minDays: number;
  maxDays: number;
};

const SPLIT_DEFINITIONS: SplitDefinition[] = [
  { key: 'full_body', label: 'Tam Vücut', minDays: 2, maxDays: 4 },
  { key: 'upper_lower', label: 'Üst Gövde / Alt Gövde', minDays: 3, maxDays: 5 },
  { key: 'push_pull_legs', label: 'İtiş / Çekiş / Bacak', minDays: 3, maxDays: 6 },
  { key: 'torso_limbs', label: 'Üst Gövde / Alt Gövde Denge', minDays: 4, maxDays: 5 },
  { key: 'anterior_posterior', label: 'Ön Zincir / Arka Zincir', minDays: 4, maxDays: 5 },
  { key: 'body_part_emphasis', label: 'Bölgesel Öncelik Spliti', minDays: 5, maxDays: 6 },
  { key: 'hybrid', label: 'Hibrit Split', minDays: 2, maxDays: 6 },
  { key: 'minimalist_home', label: 'Minimal Ev Spliti', minDays: 2, maxDays: 4 },
];

function buildWeeklyStructure(
  split: AIProgramSplitKey,
  days: number,
  priorities: AIProgramDecisionProfile['priorityMuscles'],
): string[] {
  const upperPriority = priorities.some((item) => UPPER_BODY_PRIORITY_MUSCLES.includes(item));
  const lowerPriority = priorities.some((item) => LOWER_BODY_PRIORITY_MUSCLES.includes(item));

  switch (split) {
    case 'full_body':
      return Array.from({ length: days }, (_, index) => {
        if (upperPriority && index === 0) return `${index + 1}. gün: üst gövde öncelikli tam vücut`;
        if (lowerPriority && index === 0) return `${index + 1}. gün: alt gövde öncelikli tam vücut`;
        return `${index + 1}. gün: tam vücut ${String.fromCharCode(65 + index)}`;
      });
    case 'upper_lower':
      return days === 3
        ? ['1. gün: üst gövde', '2. gün: alt gövde', '3. gün: tam vücut köprüsü']
        : ['1. gün: üst gövde A', '2. gün: alt gövde A', '3. gün: üst gövde B', '4. gün: alt gövde B', '5. gün: üst veya alt gövde öncelik köprüsü'].slice(0, days);
    case 'push_pull_legs':
      return days <= 3
        ? ['1. gün: itiş', '2. gün: çekiş', '3. gün: bacak']
        : ['1. gün: itiş', '2. gün: çekiş', '3. gün: bacak', '4. gün: üst gövde destek', '5. gün: alt gövde destek', '6. gün: öncelik odak'].slice(0, days);
    case 'torso_limbs':
      return ['1. gün: üst gövde A', '2. gün: alt gövde A', '3. gün: üst gövde B', '4. gün: alt gövde B', '5. gün: üst veya alt gövde öncelik köprüsü'].slice(0, days);
    case 'anterior_posterior':
      return ['1. gün: ön zincir', '2. gün: arka zincir', '3. gün: ön zincir B', '4. gün: arka zincir B', '5. gün: denge seansı'].slice(0, days);
    case 'body_part_emphasis':
      return ['1. gün: öncelikli üst', '2. gün: alt gövde', '3. gün: çekiş', '4. gün: itiş', '5. gün: alt gövde veya kalça/arka bacak', '6. gün: kol veya omuz detayı'].slice(0, days);
    case 'hybrid':
      if (days === 2) return ['1. gün: tam vücut', '2. gün: öncelik vurgulu tam vücut'];
      if (days === 3) return ['1. gün: tam vücut', '2. gün: üst gövde vurgusu', '3. gün: alt gövde vurgusu'];
      if (days === 4) return ['1. gün: üst gövde A', '2. gün: alt gövde A', '3. gün: üst gövde B', '4. gün: alt gövde veya tam vücut köprüsü'];
      return ['1. gün: üst gövde', '2. gün: alt gövde', '3. gün: itiş veya üst gövde', '4. gün: çekiş veya alt gövde', '5. gün: öncelik köprüsü', '6. gün: opsiyonel toparlanma seansı'].slice(0, days);
    case 'minimalist_home':
      return Array.from({ length: days }, (_, index) => `${index + 1}. gün: minimalist ev tam vücut akışı ${String.fromCharCode(65 + index)}`);
  }
}

function scoreByDays(split: AIProgramSplitKey, days: number): number {
  if (days === 2) {
    if (split === 'full_body' || split === 'hybrid' || split === 'minimalist_home') return 4;
    if (split === 'upper_lower') return 1;
    return -4;
  }
  if (days === 3) {
    if (split === 'full_body' || split === 'hybrid') return 4;
    if (split === 'upper_lower' || split === 'minimalist_home') return 2;
    if (split === 'push_pull_legs') return 0;
    return -3;
  }
  if (days === 4) {
    if (split === 'upper_lower') return 5;
    if (split === 'torso_limbs' || split === 'anterior_posterior' || split === 'hybrid') return 4;
    if (split === 'full_body') return 1;
    return -1;
  }
  if (days === 5) {
    if (split === 'upper_lower') return 5;
    if (split === 'hybrid' || split === 'push_pull_legs') return 4;
    if (split === 'body_part_emphasis' || split === 'torso_limbs') return 2;
    return -2;
  }
  if (split === 'push_pull_legs' || split === 'body_part_emphasis' || split === 'hybrid') return 4;
  if (split === 'upper_lower') return 2;
  return -2;
}

function scoreByExperience(profile: AIProgramDecisionProfile, split: AIProgramSplitKey): number {
  if (profile.experience === 'beginner') {
    if (split === 'full_body' || split === 'upper_lower' || split === 'minimalist_home') return 3;
    if (split === 'hybrid') return 1;
    return -4;
  }
  if (profile.experience === 'returning') {
    if (split === 'full_body' || split === 'upper_lower' || split === 'hybrid') return 2;
    if (split === 'minimalist_home') return 1;
    return -2;
  }
  if (profile.experience === 'intermediate') {
    if (split === 'upper_lower') return 3;
    if (split === 'torso_limbs' || split === 'hybrid') return 2;
    if (split === 'push_pull_legs') return 1;
  }
  if (profile.experience === 'advanced') {
    if (split === 'push_pull_legs' || split === 'torso_limbs' || split === 'body_part_emphasis') return 2;
  }
  return 0;
}

function scoreByEquipment(profile: AIProgramDecisionProfile, split: AIProgramSplitKey): number {
  const bodyweightOnly = profile.equipment.includes('bodyweight_only');
  const homeOnly = profile.location === 'home';
  if (homeOnly && bodyweightOnly) {
    if (split === 'minimalist_home') return 4;
    if (split === 'full_body' || split === 'hybrid') return 2;
    if (split === 'body_part_emphasis') return -3;
  }
  if (profile.sessionDuration && profile.sessionDuration <= 45 && profile.trainingDays && profile.trainingDays >= 4) {
    if (split === 'upper_lower' || split === 'torso_limbs' || split === 'anterior_posterior') return 2;
    if (split === 'full_body') return -1;
  }
  return 0;
}

function buildRationale(profile: AIProgramDecisionProfile, split: AIProgramSplitKey, days: number): string[] {
  const rationale = [
    `${days} günlük tempo bu split yapısını sürdürülebilir ve uygulanabilir kılıyor.`,
  ];
  if (profile.priorityMuscles.length > 0) {
    rationale.push('Öncelikli bölgeler haftalık denge bozulmadan daha erken ve daha temiz yerleştirilebilir.');
  }
  if (profile.recoveryQuality === 'poor') {
    rationale.push('Toparlanma sınırlıyken bu yapı yorgunluğu daha kontrollü yönetmeyi kolaylaştırır.');
  }
  if (profile.sessionDuration && profile.sessionDuration <= 45) {
    rationale.push('Kısa seanslarda bir güne gereğinden fazla yük bindirmeden akış daha gerçekçi kalır.');
  }
  return rationale;
}

function buildTradeoffs(split: AIProgramSplitKey): string[] {
  switch (split) {
    case 'full_body':
      return ['Seanslar çok kısaysa ve öncelik hacmi artarsa günler kalabalıklaşabilir.'];
    case 'upper_lower':
      return ['Üç ayrı öncelik olduğunda hibrit yapılar kadar esnek olmayabilir.'];
    case 'push_pull_legs':
      return ['Haftalık gün azsa veya toparlanma zayıfsa daha akıllı sıkıştırma ister.'];
    case 'torso_limbs':
      return ['Yeni başlayanlar için klasik üst-alt yapıdan biraz daha karmaşık hissedilebilir.'];
    case 'anterior_posterior':
      return ['Egzersiz seçimi bel yükü ve zincir çakışmasını daha dikkatli yönetmelidir.'];
    case 'body_part_emphasis':
      return ['Takvim veya toparlanma bozulursa gereksiz uzmanlaşmaya kayabilir.'];
    case 'hybrid':
      return ['Dağınık bir şablona dönüşmemesi için net karar mantığı ister.'];
    case 'minimalist_home':
      return ['Ekipman çok sınırlıysa progresyon seçenekleri daralır.'];
  }
}

export function evaluateSplitCandidates(
  profile: AIProgramDecisionProfile,
  recommendedTrainingDays: number,
  splitBias: Partial<Record<AIProgramSplitKey, number>>,
): AIProgramSplitCandidate[] {
  const upperCount = profile.priorityMuscles.filter((item) => UPPER_BODY_PRIORITY_MUSCLES.includes(item)).length;
  const lowerCount = profile.priorityMuscles.filter((item) => LOWER_BODY_PRIORITY_MUSCLES.includes(item)).length;

  return SPLIT_DEFINITIONS
    .filter((split) => recommendedTrainingDays >= split.minDays && recommendedTrainingDays <= split.maxDays)
    .map((split) => {
      let score = scoreByDays(split.key, recommendedTrainingDays);
      score += scoreByExperience(profile, split.key);
      score += scoreByEquipment(profile, split.key);
      score += splitBias[split.key] ?? 0;

      if (upperCount >= 2 && split.key === 'torso_limbs') score += 3;
      if (lowerCount >= 2 && split.key === 'anterior_posterior') score += 2;
      if (profile.goal === 'strength' && split.key === 'upper_lower') score += 2;
      if (profile.goal === 'return_to_training' && split.key === 'full_body') score += 2;
      if (profile.location === 'home' && split.key === 'minimalist_home') score += 2;

      return {
        split: split.key,
        label: split.label,
        score,
        weeklyStructure: buildWeeklyStructure(split.key, recommendedTrainingDays, profile.priorityMuscles),
        rationale: buildRationale(profile, split.key, recommendedTrainingDays),
        tradeoffs: buildTradeoffs(split.key),
      };
    })
    .sort((left, right) => right.score - left.score);
}
