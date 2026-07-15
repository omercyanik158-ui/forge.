import type { ForgeProgressionRule } from '../types/csvWorkoutBrain';

export const FORGE_PROGRESSION_RULES_300 = [
  {
    "progressionRuleId": "linear_beginner",
    "nameTr": "Başlangıç lineer ilerleme",
    "appliesTo": [
      "strength",
      "general_fitness"
    ],
    "loadOrRepLogic": "Tüm setler hedef tekrarlarla ve hedef RIR aralığında tamamlanırsa sonraki seansta üst vücut hareketlerine %1-2.5, alt vücut hareketlerine %2.5-5 yük ekle.",
    "failureLogic": "Bir seans kaçırılırsa aynı yükü tekrar et. Aynı yük iki ardışık maruziyette tamamlanamazsa %7.5-10 azalt ve yeniden ilerle.",
    "deloadLogic": "Takvim bazlı zorunlu deload yok. Performans düşüşü, yüksek yorgunluk ve iki ardışık başarısızlık birlikte görülürse 1 hafif hafta.",
    "accessoryLogic": "Önce tekrar aralığının üst sınırına ulaş, sonra küçük yük artışı yap."
  },
  {
    "progressionRuleId": "double_progression",
    "nameTr": "Çift ilerleme",
    "appliesTo": [
      "hypertrophy",
      "general_fitness"
    ],
    "loadOrRepLogic": "Aynı yükle tüm setlerde tekrar aralığının üst sınırına ve hedef RIR'a ulaşıldığında %2-5 yük artır.",
    "failureLogic": "Alt tekrar sınırı korunamıyorsa yükü %5-10 azalt veya bir set eksilt.",
    "deloadLogic": "4-8 haftalık performans trendine göre; sabit takvim yerine yorgunluk ve performans sinyalleri kullan.",
    "accessoryLogic": "İzolasyonlarda önce tekrar ekle; küçük plaka artışları mümkün değilse tempo ve kontrollü formu koru."
  },
  {
    "progressionRuleId": "top_set_backoff",
    "nameTr": "Üst set + back-off",
    "appliesTo": [
      "strength",
      "powerbuilding"
    ],
    "loadOrRepLogic": "Ana kaldırışta hedef RPE/RIR ile bir üst set; ardından yükü %7-12 azaltarak back-off setleri. Üst set hedefin altında kalırsa sonraki hafta küçük artış.",
    "failureLogic": "Hedef RPE aşılırsa back-off yükünü azalt ve sonraki maruziyette aynı üst set yükünü tekrar et.",
    "deloadLogic": "3-6 haftalık yüklenme sonrası trend düşüşü varsa hacmi %30-50, yoğunluğu %5-10 azalt.",
    "accessoryLogic": "Aksesuarlar çift ilerleme kullanır."
  },
  {
    "progressionRuleId": "undulating_strength",
    "nameTr": "Dalgalı güç ilerlemesi",
    "appliesTo": [
      "strength"
    ],
    "loadOrRepLogic": "Hafta içinde ağır, orta ve teknik günler. Ağır gün yükü performansa göre küçük artar; teknik günlerde hız ve form korunur.",
    "failureLogic": "Ağır gün iki hafta üst üste hedefin üzerinde RPE üretirse yük %5 azaltılır.",
    "deloadLogic": "4-6 haftada bir yalnızca ihtiyaç varsa hacim azaltılır.",
    "accessoryLogic": "Aksesuarlar ana lift performansını destekler, tükenişe götürülmez."
  },
  {
    "progressionRuleId": "powerbuilding_hybrid",
    "nameTr": "Powerbuilding hibrit ilerleme",
    "appliesTo": [
      "powerbuilding"
    ],
    "loadOrRepLogic": "Ana liftler top-set/back-off veya lineer; hipertrofi aksesuarları çift ilerleme.",
    "failureLogic": "Ana lift başarısızlığı aksesuar hacmini otomatik artırmaz. Önce teknik, uyku ve yorgunluk kontrol edilir.",
    "deloadLogic": "Ana lift ve aksesuar performansı birlikte düşerse 1 hafif hafta.",
    "accessoryLogic": "Aksesuarlar 1-3 RIR aralığında; haftalık toplam hacim guardrail içinde tutulur."
  },
  {
    "progressionRuleId": "bodyweight_rep_leverage",
    "nameTr": "Vücut ağırlığı tekrar/kaldıraç ilerlemesi",
    "appliesTo": [
      "general_fitness",
      "home"
    ],
    "loadOrRepLogic": "Önce tekrar artır; üst sınıra ulaşıldığında daha zor kaldıraç, tempo, duraklama veya harici yük ekle.",
    "failureLogic": "Form bozuluyorsa daha kolay varyasyona dön.",
    "deloadLogic": "Gerekirse toplam setleri bir hafta %30 azalt.",
    "accessoryLogic": "Hareket kalitesi ve tam eklem açıklığı önceliklidir."
  },
  {
    "progressionRuleId": "rep_goal",
    "nameTr": "Tekrar / süre hedefi",
    "appliesTo": [
      "general_fitness",
      "yoga",
      "pilates",
      "home"
    ],
    "loadOrRepLogic": "Hareket kalitesi korunarak tekrar, süre veya nefes sayısı aralık içinde kademeli artırılır.",
    "failureLogic": "Alt hedef tamamlanamazsa aynı hedef tekrarlanır; ağrı veya kontrol kaybında ilerleme yapılmaz.",
    "deloadLogic": "Yorgunluk birikiminde toplam tur, süre veya set sayısı geçici olarak azaltılır.",
    "accessoryLogic": "Yük yerine tekrar, süre, nefes veya hareket kontrolü ilerletilir."
  }
] as const satisfies readonly ForgeProgressionRule[];
