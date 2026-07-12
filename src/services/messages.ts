export type LocalizedMessage = { tr: string; en: string };

export const messages = {
  "common.cancel": { tr: "Vazgeç", en: "Cancel" },
  "common.delete": { tr: "Sil", en: "Delete" },
  "common.reset": { tr: "Sıfırla", en: "Reset" },
  "common.saving": { tr: "Kaydediliyor", en: "Saving" },
  "common.save": { tr: "Kaydet", en: "Save" },
  "common.continue": { tr: "Devam et", en: "Continue" },
  "common.close": { tr: "Kapat", en: "Close" },
  "common.today": { tr: "Bugün", en: "Today" },

  "ai_hub.eyebrow": { tr: "AI HUB", en: "AI HUB" },
  "ai_hub.title": {
    tr: "Fotoğraftan daha akıllı takip",
    en: "Smarter tracking from a photo",
  },
  "ai_hub.subtitle": {
    tr: "Vücudunu tek yerde yorumla, öğünlerini premium ile daha hızlı kaydet.",
    en: "Review your physique in one place and log meals faster with premium.",
  },
  "ai_hub.tab_food": { tr: "Beslenme", en: "Nutrition" },
  "ai_hub.tab_physique": { tr: "Fizik analizi", en: "Physique" },

  "ai_program.feature_title": {
    tr: "AI antrenman programı",
    en: "AI training program",
  },
  "ai_program.feature_subtitle": {
    tr: "Hedefin, ekipmanın, toparlanman ve varsa fizik analizine göre bilim temelli plan profilini oluştur.",
    en: "Build an evidence-based training profile matched to your goal, equipment, recovery, and optional physique insights.",
  },
  "ai_program.feature_start": { tr: "Program Oluştur", en: "Create program" },
  "ai_program.feature_view": {
    tr: "Programı Aç",
    en: "Open your program",
  },
  "ai_program.feature_from_physique": {
    tr: "Bu analizle program kur",
    en: "Build from this analysis",
  },
  "ai_program.group_goal": { tr: "Hedef ve zaman", en: "Goal & time" },
  "ai_program.group_environment": {
    tr: "Ortam ve ekipman",
    en: "Environment & equipment",
  },
  "ai_program.group_profile": {
    tr: "Profil ve sınırlar",
    en: "Profile & limits",
  },
  "ai_program.group_preferences": {
    tr: "Tercihler ve toparlanma",
    en: "Preferences & recovery",
  },
  "ai_program.screen_title": { tr: "Program kurucu", en: "Program builder" },
  "ai_program.step_progress": {
    tr: "Adım {current}/{total}",
    en: "Step {current}/{total}",
  },
  "ai_program.intro_title": {
    tr: "Antrenman programını kur",
    en: "Build your training program",
  },
  "ai_program.intro_body": {
    tr: "Kısa birkaç seçim yap. FORGE hedefin, takvimin, ekipmanın ve toparlanmana göre bilim temelli program context’ini hazırlasın.",
    en: "Answer a few quick prompts and FORGE will prepare an evidence-based program context around your goal, schedule, equipment, and recovery.",
  },
  "ai_program.intro_start": { tr: "Başla", en: "Start" },
  "ai_program.intro_use_physique": {
    tr: "Son fizik analizimi kullan",
    en: "Use my latest physique analysis",
  },
  "ai_program.intro_physique_ready": {
    tr: "Son fizik analizin yumuşak bir kişiselleştirme sinyali olarak eklenebilir. Bu veri tanı değildir.",
    en: "Your latest physique analysis can be used as a soft personalization signal. It is not a diagnosis.",
  },
  "ai_program.goal_title": {
    tr: "Ana hedefin ne?",
    en: "What is your main goal?",
  },
  "ai_program.goal_body": {
    tr: "Tek bir ana hedef seç. İkincil hedefler sonraki fazlarda desteklenecek.",
    en: "Choose one primary goal. Secondary goals can be layered later.",
  },
  "ai_program.goal_build_muscle": { tr: "Kas artışı", en: "Build muscle" },
  "ai_program.goal_lose_fat": { tr: "Yağ kaybı", en: "Lose fat" },
  "ai_program.goal_recomposition": { tr: "Rekompozisyon", en: "Recomposition" },
  "ai_program.goal_strength": { tr: "Güç", en: "Strength" },
  "ai_program.goal_athletic_performance": {
    tr: "Atletik performans",
    en: "Athletic performance",
  },
  "ai_program.goal_general_fitness": {
    tr: "Genel form",
    en: "General fitness",
  },
  "ai_program.goal_return_to_training": {
    tr: "Antrenmana dönüş",
    en: "Return to training",
  },
  "ai_program.days_title": {
    tr: "Haftada kaç gün ayırabilirsin?",
    en: "How many days per week can you train?",
  },
  "ai_program.days_body": {
    tr: "Gerçekte sürdürebileceğin sayıyı seç. Amaç ideal değil uygulanabilir plan.",
    en: "Choose what you can realistically sustain. We optimize for adherence, not fantasy.",
  },
  "ai_program.days_value": { tr: "{days} gün", en: "{days} days" },
  "ai_program.duration_title": {
    tr: "Seans süresi ne kadar olabilir?",
    en: "How long can each session be?",
  },
  "ai_program.duration_body": {
    tr: "Bu bilgi gelecekteki hacim, hareket sayısı ve split seçimini sınırlar.",
    en: "This will later shape weekly volume, exercise count, and split selection.",
  },
  "ai_program.duration_value": {
    tr: "{minutes} dakika",
    en: "{minutes} minutes",
  },
  "ai_program.location_title": {
    tr: "Nerede çalışacaksın?",
    en: "Where will you train?",
  },
  "ai_program.location_body": {
    tr: "Konuma göre ekipman seçimi daralır ve hareket havuzu güvenli şekilde filtrelenir.",
    en: "Your location narrows available equipment and safely constrains future exercise selection.",
  },
  "ai_program.location_gym": { tr: "Salon", en: "Gym" },
  "ai_program.location_home": { tr: "Ev", en: "Home" },
  "ai_program.location_both": { tr: "İkisi de", en: "Both" },
  "ai_program.equipment_title": {
    tr: "Ekipmanları seç",
    en: "Choose your equipment",
  },
  "ai_program.equipment_body": {
    tr: "Gerçekte erişebildiğin ekipmanları işaretle. Bu seçim gelecekteki egzersiz havuzunu sınırlar.",
    en: "Select the equipment you really have access to. This will constrain future exercise choices.",
  },
  "ai_program.equipment_gym": { tr: "Salon ekipmanları", en: "Gym equipment" },
  "ai_program.equipment_home": { tr: "Ev ekipmanları", en: "Home equipment" },
  "ai_program.equipment_machines": { tr: "Makineler", en: "Machines" },
  "ai_program.equipment_cables": { tr: "Kablolar", en: "Cables" },
  "ai_program.equipment_dumbbells": { tr: "Dambıllar", en: "Dumbbells" },
  "ai_program.equipment_adjustable_dumbbells": {
    tr: "Ayarlanabilir dambıl",
    en: "Adjustable dumbbells",
  },
  "ai_program.equipment_barbells": { tr: "Barbell", en: "Barbells" },
  "ai_program.equipment_smith_machine": {
    tr: "Smith machine",
    en: "Smith machine",
  },
  "ai_program.equipment_pullup_station": {
    tr: "Barfiks istasyonu",
    en: "Pull-up station",
  },
  "ai_program.equipment_pullup_bar": { tr: "Barfiks barı", en: "Pull-up bar" },
  "ai_program.equipment_leg_press": { tr: "Leg press", en: "Leg press" },
  "ai_program.equipment_cardio_machines": {
    tr: "Kardiyo makineleri",
    en: "Cardio machines",
  },
  "ai_program.equipment_bodyweight_only": {
    tr: "Sadece vücut ağırlığı",
    en: "Bodyweight only",
  },
  "ai_program.equipment_bands": { tr: "Direnç bandı", en: "Bands" },
  "ai_program.equipment_bench": { tr: "Bench", en: "Bench" },
  "ai_program.equipment_kettlebell": { tr: "Kettlebell", en: "Kettlebell" },
  "ai_program.experience_title": {
    tr: "Deneyim seviyen hangisine daha yakın?",
    en: "Which experience level fits you best?",
  },
  "ai_program.experience_body": {
    tr: "Buradaki amaç ego değil, toparlanabilir başlangıç noktasını bulmak.",
    en: "This is not about ego. It helps set a recoverable starting point.",
  },
  "ai_program.experience_beginner": { tr: "Başlangıç", en: "Beginner" },
  "ai_program.experience_returning": {
    tr: "Ara sonrası dönüş",
    en: "Returning after a break",
  },
  "ai_program.experience_intermediate": {
    tr: "Orta seviye",
    en: "Intermediate",
  },
  "ai_program.experience_advanced": { tr: "İleri seviye", en: "Advanced" },
  "ai_program.experience_help_beginner": {
    tr: "6 aydan az düzenli antrenman veya temel hareketlerde düşük güven.",
    en: "Less than 6 months of consistent training or low confidence with basic movements.",
  },
  "ai_program.experience_help_returning": {
    tr: "Daha önce çalıştın ama ritim veya kondisyon tekrar kuruluyor.",
    en: "You have trained before, but your rhythm or capacity is being rebuilt.",
  },
  "ai_program.experience_help_intermediate": {
    tr: "6 ay+ düzenli çalışma ve temel hareketlerde rahatlık.",
    en: "6+ months of consistent training and confidence with the basics.",
  },
  "ai_program.experience_help_advanced": {
    tr: "Yıllardır yapılandırılmış antrenman ve takip deneyimi.",
    en: "Several years of structured training and progression tracking.",
  },
  "ai_program.priority_title": {
    tr: "Özellikle geliştirmek istediğin bölgeler var mı?",
    en: "Any body parts you especially want to improve?",
  },
  "ai_program.priority_body": {
    tr: "En fazla 3 bölge seç. Böylece gelecekteki program “her şey öncelik” tuzağına düşmez.",
    en: "Choose up to 3 areas so future programming does not drift into “everything is a priority.”",
  },
  "ai_program.priority_helper": {
    tr: "{count}/3 öncelik seçildi",
    en: "{count}/3 priorities selected",
  },
  "ai_program.priority_chest": { tr: "Göğüs", en: "Chest" },
  "ai_program.priority_shoulders": { tr: "Omuz", en: "Shoulders" },
  "ai_program.priority_lats": {
    tr: "Lat / sırt genişliği",
    en: "Back width / lats",
  },
  "ai_program.priority_upper_back": { tr: "Üst sırt", en: "Upper back" },
  "ai_program.priority_arms": { tr: "Kollar", en: "Arms" },
  "ai_program.priority_glutes": { tr: "Kalça", en: "Glutes" },
  "ai_program.priority_quads": { tr: "Quadriceps", en: "Quads" },
  "ai_program.priority_hamstrings": { tr: "Hamstring", en: "Hamstrings" },
  "ai_program.priority_calves": { tr: "Kalf", en: "Calves" },
  "ai_program.priority_core": { tr: "Core", en: "Core" },
  "ai_program.priority_full_body_balance": {
    tr: "Tüm vücut denge",
    en: "Full body balance",
  },
  "ai_program.limitations_title": {
    tr: "Ağrı, sakatlık veya hareket kısıtı var mı?",
    en: "Any pain, injury, or movement limitation?",
  },
  "ai_program.limitations_body": {
    tr: "Bu alan tanı koymaz. Ama gelecekteki egzersiz seçimini daha güvenli tutmak için konservatif işaretler üretir.",
    en: "This does not diagnose anything. It helps future exercise selection stay conservative.",
  },
  "ai_program.limitations_none": { tr: "Yok", en: "No" },
  "ai_program.limitations_shoulder": { tr: "Omuz", en: "Shoulder" },
  "ai_program.limitations_elbow": { tr: "Dirsek", en: "Elbow" },
  "ai_program.limitations_wrist": { tr: "Bilek", en: "Wrist" },
  "ai_program.limitations_lower_back": { tr: "Bel", en: "Lower back" },
  "ai_program.limitations_hip": { tr: "Kalça / hip", en: "Hip" },
  "ai_program.limitations_knee": { tr: "Diz", en: "Knee" },
  "ai_program.limitations_ankle": { tr: "Ayak bileği", en: "Ankle" },
  "ai_program.limitations_other": { tr: "Diğer", en: "Other" },
  "ai_program.limitations_note_placeholder": {
    tr: "İstersen kısa not düşebilirsin",
    en: "Optional short note",
  },
  "ai_program.exercise_title": {
    tr: "Tutmak veya kaçınmak istediğin hareketler var mı?",
    en: "Any exercises you want to keep or avoid?",
  },
  "ai_program.exercise_body": {
    tr: "Bu adım opsiyonel. Gelecekteki plan tercihlerini şekillendirmek için kısa not bırakabilirsin.",
    en: "This step is optional. Leave a short note to shape future exercise preferences.",
  },
  "ai_program.exercise_keep": {
    tr: "Sevdiğim hareketler",
    en: "Exercises I like",
  },
  "ai_program.exercise_avoid": {
    tr: "Kaçınmak istediğim hareketler",
    en: "Exercises I want to avoid",
  },
  "ai_program.exercise_keep_placeholder": {
    tr: "Örn. squat, bench press, pull-up",
    en: "e.g. squat, bench press, pull-up",
  },
  "ai_program.exercise_avoid_placeholder": {
    tr: "Örn. dips, ağır deadlift",
    en: "e.g. dips, heavy deadlift",
  },
  "ai_program.exercise_picker_search": {
    tr: "Hareket ara",
    en: "Search exercises",
  },
  "ai_program.exercise_picker_preferred_title": {
    tr: "Sevdiğin hareketleri seç",
    en: "Choose exercises you like",
  },
  "ai_program.exercise_picker_avoided_title": {
    tr: "Kaçınmak istediğin hareketleri seç",
    en: "Choose exercises to avoid",
  },
  "ai_program.exercise_picker_empty": {
    tr: "Bu aramada eşleşen hareket bulunamadı.",
    en: "No exercises matched this search.",
  },
  "ai_program.exercise_picker_selected_empty": {
    tr: "Henüz hareket seçmedin.",
    en: "No exercises selected yet.",
  },
  "ai_program.exercise_picker_open_preferred": {
    tr: "Hareket seç",
    en: "Choose exercises",
  },
  "ai_program.exercise_picker_open_avoided": {
    tr: "Kaçınılacak hareket seç",
    en: "Choose exercises to avoid",
  },
  "ai_program.exercise_picker_done": { tr: "Seçimi bitir", en: "Done" },
  "ai_program.exercise_picker_remove": { tr: "Kaldır", en: "Remove" },
  "ai_program.skip_optional": { tr: "Bu adımı geç", en: "Skip this step" },
  "ai_program.recovery_title": {
    tr: "Toparlanman son dönemde nasıl?",
    en: "How is your recovery lately?",
  },
  "ai_program.recovery_body": {
    tr: "Bu seçim ileride hacim, failure maruziyeti ve agresif progresyon düzeyini etkileyecek.",
    en: "This will later influence volume, failure exposure, and progression aggressiveness.",
  },
  "ai_program.recovery_state": {
    tr: "Genel toparlanma",
    en: "Overall recovery",
  },
  "ai_program.recovery_great": { tr: "Çok iyi", en: "Great" },
  "ai_program.recovery_okay": { tr: "İdare eder", en: "Okay" },
  "ai_program.recovery_poor": { tr: "Zayıf", en: "Poor" },
  "ai_program.sleep_title": { tr: "Uyku", en: "Sleep" },
  "ai_program.sleep_under_6h": { tr: "6 saatin altı", en: "Under 6h" },
  "ai_program.sleep_6_7h": { tr: "6-7 saat", en: "6-7h" },
  "ai_program.sleep_7_8h": { tr: "7-8 saat", en: "7-8h" },
  "ai_program.sleep_8h_plus": { tr: "8 saat+", en: "8h+" },
  "ai_program.stress_title": { tr: "Stres", en: "Stress" },
  "ai_program.stress_low": { tr: "Düşük", en: "Low" },
  "ai_program.stress_medium": { tr: "Orta", en: "Medium" },
  "ai_program.stress_high": { tr: "Yüksek", en: "High" },
  "ai_program.summary_title": { tr: "Özet", en: "Summary" },
  "ai_program.summary_body": {
    tr: "Program oluşturulmadan önce gelecekte kullanılacak context’i son kez gözden geçir.",
    en: "Review the future program context one last time before generation starts.",
  },
  "ai_program.summary_goal": { tr: "Hedef", en: "Goal" },
  "ai_program.summary_days": { tr: "Gün", en: "Days" },
  "ai_program.summary_duration": { tr: "Seans", en: "Session" },
  "ai_program.summary_location": { tr: "Konum", en: "Location" },
  "ai_program.summary_experience": { tr: "Deneyim", en: "Experience" },
  "ai_program.summary_priority": { tr: "Öncelik", en: "Priority" },
  "ai_program.summary_recovery": { tr: "Toparlanma", en: "Recovery" },
  "ai_program.summary_physique": {
    tr: "Fizik analizi",
    en: "Physique analysis",
  },
  "ai_program.summary_physique_used": {
    tr: "Son analiz kullanılacak",
    en: "Using latest analysis",
  },
  "ai_program.summary_physique_not_used": {
    tr: "Kullanılmıyor",
    en: "Not used",
  },
  "ai_program.summary_generate": {
    tr: "Program context’ini oluştur",
    en: "Generate my program context",
  },
  "ai_program.processing_title": {
    tr: "Program hazırlanıyor",
    en: "Creating your program",
  },
  "ai_program.processing_body": {
    tr: "FORGE profilini, tercihlerini ve bilim temelli kuralları birleştiriyor.",
    en: "FORGE is combining your profile, preferences, and evidence-based training rules.",
  },
  "ai_program.processing_eta": {
    tr: "Bu işlem genelde bir dakikadan kısa sürer.",
    en: "This usually takes less than a minute.",
  },
  "ai_program.processing_physique_note": {
    tr: "Fizik analizi yalnızca tahmini bir kişiselleştirme sinyali olarak kullanılır, tanı değildir.",
    en: "Physique analysis is used only as an estimate, not a diagnosis.",
  },
  "ai_program.processing_step_profile": {
    tr: "Profilin okunuyor",
    en: "Reading your profile",
  },
  "ai_program.processing_step_preferences": {
    tr: "Tercihlerin gözden geçiriliyor",
    en: "Reviewing your preferences",
  },
  "ai_program.processing_step_recovery": {
    tr: "Toparlanma kısıtları kontrol ediliyor",
    en: "Checking recovery constraints",
  },
  "ai_program.processing_step_evidence": {
    tr: "Bilim temelli ilkeler eşleştiriliyor",
    en: "Matching evidence-based training principles",
  },
  "ai_program.processing_step_split": {
    tr: "En uygun split seçiliyor",
    en: "Selecting the best split",
  },
  "ai_program.processing_step_volume": {
    tr: "Haftalık hacim dengeleniyor",
    en: "Balancing weekly volume",
  },
  "ai_program.processing_step_fatigue": {
    tr: "Yorgunluk yönetiliyor",
    en: "Managing fatigue",
  },
  "ai_program.processing_step_exercises": {
    tr: "Egzersiz havuzu sınırlandırılıyor",
    en: "Choosing exercises",
  },
  "ai_program.processing_step_progression": {
    tr: "Progresyon mantığı hazırlanıyor",
    en: "Building progression",
  },
  "ai_program.processing_step_quality": {
    tr: "Son kalite kontrolü yapılıyor",
    en: "Running final quality check",
  },
  "ai_program.ready_title": {
    tr: "Forge Signature planın hazır",
    en: "Your FORGE Signature plan is ready",
  },
  "ai_program.ready_body": {
    tr: "Programın hazır. Kısa özete göz at, sonra kaydedip kullanmaya başla.",
    en: "Your program is ready. Review the summary, then save it and start using it.",
  },
  "ai_program.ready_return": { tr: "AI Hub’a dön", en: "Return to AI Hub" },
  "ai_program.ready_review": { tr: "Cevapları düzenle", en: "Edit answers" },
  "ai_program.restart_action": {
    tr: "Antrenmanı sıfırla",
    en: "Reset workout",
  },
  "ai_program.incomplete_title": {
    tr: "Önce bu adımı tamamla",
    en: "Complete this step first",
  },
  "ai_program.incomplete_body": {
    tr: "Güvenli bir context oluşturmak için bu bilgi gerekli.",
    en: "This information is needed to prepare a safe context.",
  },
  "ai_program.complete_critical": {
    tr: "Kritik bilgiler tamamlanmadan context oluşturulamaz.",
    en: "Critical fields must be completed before context generation.",
  },
  "ai_program.none": { tr: "Yok", en: "None" },
  "ai_program.validation_beginner_high_frequency": {
    tr: "Başlangıç seviyesi için haftada 6 gün agresif olabilir. Daha kontrollü bir sıklık daha güvenlidir.",
    en: "Six days per week may be aggressive for a beginner. A more controlled frequency is safer.",
  },
  "ai_program.validation_poor_recovery_high_frequency": {
    tr: "Toparlanma zayıfken yüksek sıklık gelecekteki hacim ve failure maruziyetini sınırlamalı.",
    en: "Poor recovery should constrain future volume and failure exposure at high frequency.",
  },
  "ai_program.validation_pain_requires_conservative_flag": {
    tr: "Ağrı veya kısıt bildirildi. Gelecek egzersiz seçimi daha konservatif ilerlemeli.",
    en: "A pain or limitation was reported. Future exercise selection should stay conservative.",
  },
  "ai_program.meta_days_week": { tr: "gün/hafta", en: "days/week" },
  "ai_program.meta_weeks": { tr: "hafta", en: "weeks" },
  "ai_program.meta_exercises": { tr: "hareket", en: "exercises" },
  "ai_program.meta_sets": { tr: "set", en: "sets" },
  "ai_program.meta_min": { tr: "dk", en: "min" },
  "ai_program.validation_warning": {
    tr: "Programda güvenlik uyarısı var; antrenman öncesi kontrol et.",
    en: "The program has a safety warning; review before training.",
  },
  "ai_program.save_plan": { tr: "Programı kaydet", en: "Save program" },
  "ai_program.save_open_plan": {
    tr: "Programı kaydet ve aç",
    en: "Save and open program",
  },
  "ai_program.open_plan": { tr: "Programa git", en: "Open program" },
  "ai_program.plan_saved": { tr: "Kaydedildi", en: "Saved" },
  "ai_program.reset_plan": { tr: "Antrenmanı sıfırla", en: "Reset workout" },
  "ai_program.reset_confirm_title": {
    tr: "Bu plan sıfırlansın mı?",
    en: "Reset this plan?",
  },
  "ai_program.reset_confirm_body": {
    tr: "Mevcut cevapların ve oluşturulan plan temizlenecek. Builder başlangıcına döneceksin.",
    en: "Your current answers and generated plan will be cleared. You will return to the builder start.",
  },
  "ai_program.reset_confirm_action": { tr: "Sıfırla", en: "Reset" },
  "ai_program.exit_sheet_title": {
    tr: "Program kurucudan çık?",
    en: "Leave program builder?",
  },
  "ai_program.exit_sheet_unsaved_body": {
    tr: "Cevapların kaydedilmedi. Çıkarsan en baştan başlaman gerekir.",
    en: "Your answers aren't saved. Exiting means starting over.",
  },
  "ai_program.exit_sheet_ready_body": {
    tr: "Programın hazır ama henüz kaydedilmedi.",
    en: "Your program is ready but not saved yet.",
  },
  "ai_program.exit_save_action": { tr: "Kaydet ve aç", en: "Save and open" },
  "ai_program.exit_discard_action": {
    tr: "Kaydetmeden çık",
    en: "Exit without saving",
  },
  "ai_program.exit_continue_action": {
    tr: "Kalmaya devam et",
    en: "Keep building",
  },
  "ai_program.detail_screen_title": {
    tr: "AI programın",
    en: "Your AI program",
  },
  "ai_program.detail_badge": { tr: "AI PROGRAM", en: "AI PROGRAM" },
  "ai_program.detail_reason_title": {
    tr: "Bu plan neden seçildi?",
    en: "Why this plan?",
  },
  "ai_program.detail_open_builder": {
    tr: "Yeni AI plan kur",
    en: "Build a new AI plan",
  },
  "ai_program.detail_empty_title": {
    tr: "AI program bulunamadı",
    en: "AI program not found",
  },
  "ai_program.detail_empty_body": {
    tr: "Bu plan artık kayıtlı olmayabilir. Yeni bir plan oluşturabilirsin.",
    en: "This plan may no longer be saved. You can build a new one.",
  },
  "ai_program.detail_days_done": { tr: "gün tamamlandı", en: "days done" },
  "ai_program.detail_reason_show": {
    tr: "Nedenini gör",
    en: "Show reasoning",
  },
  "ai_program.detail_reason_hide": {
    tr: "Gizle",
    en: "Hide",
  },
  "ai_program.detail_week_label": { tr: "Hafta {count}", en: "Week {count}" },
  "ai_program.detail_day_locked_a11y": {
    tr: "Bu gün henüz kilitli",
    en: "This day is still locked",
  },
  "ai_program.detail_day_today_a11y": {
    tr: "Sıradaki antrenman",
    en: "Up next workout",
  },
  "ai_program.detail_day_completed_a11y": {
    tr: "Tamamlandı",
    en: "Completed",
  },
  "fitness.ai_program_primary_cta": {
    tr: "AI plan oluştur",
    en: "Build AI plan",
  },
  "fitness.ai_program_new_a11y": {
    tr: "Yeni AI programı oluştur",
    en: "Create a new AI program",
  },
  "my_workouts.ai_badge": { tr: "AI SIGNATURE", en: "AI SIGNATURE" },
  "my_workouts.ai_start": { tr: "Programı başlat", en: "Start program" },
  "my_workouts.ai_delete_title": {
    tr: "AI program silinsin mi?",
    en: "Delete this AI program?",
  },
  "my_workouts.ai_delete_body": {
    tr: "Bu AI program kayıtlı antrenmanlarından kaldırılacak.",
    en: "This AI program will be removed from your saved workouts.",
  },
  "my_workouts.ai_last_opened": {
    tr: "Son seans {date}",
    en: "Last session {date}",
  },
  "my_workouts.ai_saved_on": { tr: "Kaydedildi {date}", en: "Saved {date}" },
  "my_workouts.ai_week_label": { tr: "{count} hafta", en: "{count} weeks" },
  "my_workouts.ai_day_label": { tr: "{count} gün", en: "{count} days" },

  "my_plans.screen_title": { tr: "Planlarım", en: "My Plans" },
  "my_plans.continue_title": {
    tr: "Kaldığın yerden devam et",
    en: "Pick up where you left off",
  },
  "my_plans.continue_ai_title": {
    tr: "Planına devam et",
    en: "Continue your plan",
  },
  "my_plans.continue_start": { tr: "Devam et", en: "Continue" },
  "my_plans.continue_ai_start": { tr: "Sıradaki antrenmanı başlat", en: "Start next workout" },
  "my_plans.continue_days_done": { tr: "{done}/{total} gün tamamlandı", en: "{done}/{total} days done" },
  "my_plans.continue_no_sessions": {
    tr: "Henüz bir gün tamamlamadın, ilk antrenmanı başlat.",
    en: "You haven't completed a day yet, start your first session.",
  },
  "my_plans.shortcut_title": { tr: "Planlarım", en: "My Plans" },
  "my_plans.manage": { tr: "Yönet", en: "Manage" },
  "my_plans.shortcut_view_all": { tr: "Tümünü gör", en: "View all" },
  "my_plans.shortcut_count": { tr: "{count} kayıtlı plan", en: "{count} saved plans" },
  "my_plans.shortcut_count_one": { tr: "1 kayıtlı plan", en: "1 saved plan" },
  "my_plans.shortcut_empty_title": { tr: "Henüz planın yok", en: "No plans yet" },
  "my_plans.shortcut_empty_body": {
    tr: "İlk antrenman planını oluştur veya AI ile hazırlat.",
    en: "Create your first workout or let AI build one for you.",
  },
  "my_plans.empty_cta_ai": { tr: "AI program oluştur", en: "Create AI program" },
  "my_plans.empty_cta_custom": { tr: "Antrenman oluştur", en: "Create workout" },
  "my_plans.stat_days": { tr: "gün", en: "days" },
  "my_plans.stat_weeks": { tr: "hafta", en: "weeks" },
  "my_plans.stat_first_week": { tr: "ilk hafta", en: "first week" },


  "ai_hub.status_premium_title": { tr: "Premium aktif", en: "Premium active" },
  "ai_hub.status_premium_body": {
    tr: "Sınırsız fizik analizi, yemek fotoğrafı analizi ve metinsel karşılaştırmalar açık.",
    en: "Unlimited physique analysis, food photo analysis, and text-based comparisons are unlocked.",
  },
  "ai_hub.status_free_title": {
    tr: "1 ücretsiz fizik analizi hakkın hazır",
    en: "Your 1 free physique analysis is ready",
  },
  "ai_hub.status_free_body": {
    tr: "AI Hub vitrininde ilk koç raporunu ücretsiz dene. Yemek analizi ve tüm karşılaştırmalar premium ile açılır.",
    en: "Try your first coach report free in AI Hub. Meal analysis and all comparisons unlock with premium.",
  },
  "ai_hub.status_used_title": {
    tr: "Ücretsiz hakkın kullanıldı",
    en: "Your free try has been used",
  },
  "ai_hub.status_used_body": {
    tr: "Yeni fizik raporları, yemek fotoğrafı analizi ve gelişim karşılaştırmaları için premiuma geç.",
    en: "Upgrade to premium for new physique reports, meal photo analysis, and progress comparisons.",
  },

  "ai_hub.food_section_title": {
    tr: "Öğününü analiz et",
    en: "Analyze your meal",
  },
  "ai_hub.food_section_body": {
    tr: "Net ışıkta, tabağın tamamını gösteren tek bir fotoğraf kullan.",
    en: "Use one well-lit photo showing the entire plate.",
  },
  "ai_hub.food_card_label": { tr: "Yemek fotoğrafı", en: "Meal photo" },
  "ai_hub.food_card_hint": {
    tr: "Çekmek veya galeriden seçmek için dokun",
    en: "Tap to take or choose a photo",
  },
  "ai_hub.food_analyze_action": { tr: "Yemeği analiz et", en: "Analyze meal" },
  "ai_hub.food_result_title": {
    tr: "Düzenlenebilir sonuç",
    en: "Editable result",
  },
  "ai_hub.food_result_portion": { tr: "Porsiyon", en: "Portion" },
  "ai_hub.food_result_calories": { tr: "Kalori", en: "Calories" },
  "ai_hub.food_result_protein": { tr: "Protein", en: "Protein" },
  "ai_hub.food_result_carbs": { tr: "Karbonhidrat", en: "Carbs" },
  "ai_hub.food_result_fat": { tr: "Yağ", en: "Fat" },
  "ai_hub.food_result_confidence": {
    tr: "Görsel güveni",
    en: "Visual confidence",
  },
  "ai_hub.confidence_note": {
    tr: "Bu oran, modelin fotoğrafa ne kadar güvendiğini gösterir; sağlık veya doğruluk garantisi vermez.",
    en: "This score reflects how confident the model felt about the photo. It is not a health or accuracy guarantee.",
  },
  "ai_hub.food_result_grams": { tr: "Toplam gramaj", en: "Total grams" },
  "ai_hub.food_result_scale_hint": {
    tr: "Gramajı değiştirdiğinde kalori ve makrolar yeni porsiyona göre ölçeklenir.",
    en: "When you change the grams, calories and macros scale to the new portion.",
  },
  "ai_hub.food_save_action": { tr: "Günlüğe kaydet", en: "Save to diary" },
  "ai_hub.capture_food_title": {
    tr: "Fotoğrafı böyle çek",
    en: "Capture it like this",
  },
  "ai_hub.capture_food_tip_frame": {
    tr: "Tabağın tamamı kadrajda olsun",
    en: "Keep the whole plate in frame",
  },
  "ai_hub.capture_food_tip_light": {
    tr: "Doğal veya net bir ışık kullan",
    en: "Use natural or clear light",
  },
  "ai_hub.capture_food_tip_angle": {
    tr: "Östten veya hafif çaprazdan çek",
    en: "Shoot from above or a slight angle",
  },

  "ai_hub.food_premium_title": {
    tr: "Yemek analizi premium ile açılır",
    en: "Meal analysis unlocks with premium",
  },
  "ai_hub.food_premium_body": {
    tr: "Fotoğraftan kalori ve makro tahmini al, sonucu düzenle ve öğün günlüğüne tek akışta kaydet.",
    en: "Get calories and macro estimates from a photo, edit the result, and save it straight to your meal diary.",
  },
  "ai_hub.food_premium_note": {
    tr: "Fizik analizi vitrinde açık kalır. Yemek analizi daha sık kullanıldığı için premiumda konumlanır.",
    en: "Physique analysis stays visible for everyone. Meal analysis lives in premium because it is used more often.",
  },
  "ai_hub.unlock_premium": { tr: "Premiumu aç", en: "Unlock premium" },

  "ai_hub.physique_section_title": {
    tr: "İki pozla koç raporu",
    en: "Coach report from two poses",
  },
  "ai_hub.physique_section_body": {
    tr: "Benzer ışık, mesafe ve nötr duruş karşılaştırma kalitesini artırır.",
    en: "Similar lighting, distance, and a neutral stance improve comparison quality.",
  },
  "ai_hub.front_label": { tr: "Önden", en: "Front" },
  "ai_hub.back_label": { tr: "Arkadan", en: "Back" },
  "ai_hub.pose_hint": { tr: "Nötr duruş", en: "Neutral pose" },
  "ai_hub.capture_physique_title": {
    tr: "Analiz için kadraj ipucu",
    en: "Frame tips for analysis",
  },
  "ai_hub.capture_physique_tip_frame": {
    tr: "Baştan dize kadar net görün",
    en: "Show your body clearly from head to knees",
  },
  "ai_hub.capture_physique_tip_pose": {
    tr: "Omuzlar dengede, kollar rahat olsun",
    en: "Keep shoulders level and arms relaxed",
  },
  "ai_hub.capture_physique_tip_background": {
    tr: "Sade arka plan ve benzer ışık seç",
    en: "Use a plain background and similar lighting",
  },
  "ai_hub.consent": {
    tr: "18 yaşından büyüğüm, fotoğraflar bana ait ve yaklaşık görsel analiz için onay veriyorum.",
    en: "I am 18 or older, own these photos, and consent to an approximate visual analysis.",
  },
  "ai_hub.physique_locked_title": {
    tr: "Yeni analiz için premium gerekli",
    en: "Premium is required for another analysis",
  },
  "ai_hub.physique_locked_body": {
    tr: "Ücretsiz fizik analizi hakkını kullandın. Sınırsız yeni raporlar ve geçmiş karşılaştırmaları premium ile açılır.",
    en: "You used your free physique analysis. Unlimited new reports and history comparisons unlock with premium.",
  },
  "ai_hub.go_premium": { tr: "Premiuma geç", en: "Go premium" },
  "ai_hub.analyze_physique_premium": {
    tr: "Fiziği analiz et",
    en: "Analyze physique",
  },
  "ai_hub.analyze_physique_free": {
    tr: "Ücretsiz analizi başlat",
    en: "Start free analysis",
  },

  "ai_hub.physique_report_label": { tr: "Koç raporu", en: "Coach report" },
  "ai_hub.physique_estimate": { tr: "tahmin", en: "estimate" },
  "ai_hub.physique_focus": { tr: "Odak bölgeleri", en: "Focus areas" },
  "ai_hub.physique_exercises": {
    tr: "Odak hareketleri",
    en: "Focus exercises",
  },
  "ai_hub.physique_muscle": {
    tr: "Kas kütlesi yorumu",
    en: "Muscle mass note",
  },
  "ai_hub.physique_pose": { tr: "Poz kalitesi", en: "Pose quality" },
  "ai_hub.physique_save_action": {
    tr: "Gelişim günlüğüne kaydet",
    en: "Save to progress journal",
  },
  "ai_hub.physique_comparison_title": {
    tr: "Karşılaştırmalı geçmiş premiumda",
    en: "Comparison history is in premium",
  },
  "ai_hub.physique_comparison_body": {
    tr: "Kaydettiğin raporları birbiriyle kıyaslamak, değişimi metinle görmek ve yeni analiz almak için premiuma geç.",
    en: "Upgrade to compare saved reports, view text-based change summaries, and run new analyses.",
  },
  "ai_hub.unlock_comparisons": {
    tr: "Karşılaştırmaları aç",
    en: "Unlock comparisons",
  },
  "ai_hub.disclaimer": {
    tr: "Bu rapor tıbbi değerlendirme değildir. Yağ oranı ve kas dengesi, fotoğraf koşullarından etkilenen yaklaşık yorumlardır.",
    en: "This report is not a medical assessment. Body-fat and muscular-balance notes are visual estimates affected by photo conditions.",
  },

  "ai_hub.history_title": { tr: "Analiz geçmişi", en: "Analysis history" },
  "ai_hub.history_body": {
    tr: "Kayıtlar bu cihazda saklanır.",
    en: "Entries are stored on this device.",
  },
  "ai_hub.history_ready_title": {
    tr: "Kaydettiğin analizler hazır",
    en: "Your saved analyses are ready",
  },
  "ai_hub.history_ready_body": {
    tr: "Geçmiş raporlarını ve değişim özetlerini görmek için premium ekranını aç.",
    en: "Open premium to view your past reports and change summaries.",
  },
  "ai_hub.open_history": { tr: "Geçmişi aç", en: "Open history" },
  "ai_hub.empty_title": { tr: "Henüz kayıt yok", en: "No entries yet" },
  "ai_hub.empty_body": {
    tr: "İlk analizini kaydettiğinde geçmişin ve metinsel değişim özeti burada görünecek.",
    en: "Your history and text-based change summary will appear here after you save the first analysis.",
  },

  "ai_hub.meal_breakfast": { tr: "Kahvaltı", en: "Breakfast" },
  "ai_hub.meal_lunch": { tr: "Öğle", en: "Lunch" },
  "ai_hub.meal_dinner": { tr: "Akşam", en: "Dinner" },
  "ai_hub.meal_snack": { tr: "Ara öğün", en: "Snack" },
  "ai_hub.choose_meal": { tr: "Öğünü seç", en: "Choose meal" },

  "ai_hub.alert_add_photo_title": { tr: "Fotoğraf ekle", en: "Add photo" },
  "ai_hub.alert_add_photo_body": { tr: "Kaynağı seç", en: "Choose a source" },
  "ai_hub.source_camera": { tr: "Kamera", en: "Camera" },
  "ai_hub.source_library": { tr: "Galeriden seç", en: "Choose from library" },

  "ai_hub.alert_failed_title": {
    tr: "İşlem tamamlanamadı",
    en: "Could not complete",
  },
  "ai_hub.alert_unknown": {
    tr: "Beklenmeyen bir sorun oluştu. Lütfen tekrar dene.",
    en: "Something unexpected happened. Please try again.",
  },
  "ai_hub.err_camera": {
    tr: "Kamera izni verilmedi. İzni cihaz ayarlarından açabilirsin.",
    en: "Camera access was denied. You can enable it in device settings.",
  },
  "ai_hub.err_not_configured": {
    tr: "AI servisi henüz yapılandırılmadı.",
    en: "The AI service is not configured yet.",
  },
  "ai_hub.err_timeout": {
    tr: "Analiz beklenenden uzun sürdü. Bağlantını kontrol edip tekrar dene.",
    en: "Analysis took too long. Check your connection and try again.",
  },
  "ai_hub.err_network": {
    tr: "İnternet bağlantısı kurulamadı. Fotoğrafların cihazında kalmaya devam ediyor.",
    en: "Could not connect to the internet. Your photos remain on your device.",
  },
  "ai_hub.err_invalid_image": {
    tr: "Görsel okunamadı ya da boyutu uygun değil. Biraz daha net ve kırpılmış bir kare dene.",
    en: "The image could not be read or its size was not suitable. Try a clearer and more tightly cropped frame.",
  },
  "ai_hub.err_rate_limited": {
    tr: "Kısa sürede çok fazla analiz denendi. Biraz bekleyip tekrar dene.",
    en: "Too many analyses were attempted in a short time. Wait a bit and try again.",
  },
  "ai_hub.err_provider": {
    tr: "Analiz servisi şu anda geçici olarak yoğun görünüyor. Birkaç dakika sonra tekrar dene.",
    en: "The analysis service is temporarily busy right now. Try again in a few minutes.",
  },
  "ai_hub.err_adult_only": {
    tr: "Fizik analizi yalnızca 18 yaş ve üzeri kullanıcılar için açık.",
    en: "Physique analysis is only available for users who are 18 or older.",
  },
  "ai_hub.err_distinct_physique_images": {
    tr: "Ön ve arka poz için farklı iki fotoğraf eklemelisin.",
    en: "Please add two different photos for the front and back poses.",
  },
  "ai_hub.err_blocked_sensitive": {
    tr: "Sağlayıcı bu poza hassas filtre uyguladı. Fitness amaçlı olsa da bazen üst beden fotoğrafları yanlış algılanabiliyor. Biraz daha geniş kadrajlı, gövdenin tam göründüğü bir kare dene.",
    en: "The provider applied a sensitive-content filter to this pose. Even for fitness check-ins, upper-body photos can be misclassified. Try a slightly wider frame with your torso fully visible.",
  },
  "ai_hub.err_blocked_default": {
    tr: "Bu görsel güvenli biçimde analiz edilemedi. Fitness amaçlı üst beden fotoğrafları bazen yanlış engellenebiliyor. Farklı bir kare dene.",
    en: "This image could not be analyzed safely. Fitness upper-body photos can occasionally be blocked by mistake. Try a different frame.",
  },

  "ai_hub.saved_food_title": { tr: "Günlüğe eklendi", en: "Added to diary" },
  "ai_hub.saved_food_body": {
    tr: "Analiz ve öğün kaydı cihazına kaydedildi.",
    en: "The analysis and meal entry were saved on your device.",
  },
  "ai_hub.saved_physique_title": {
    tr: "Gelişim günlüğüne kaydedildi",
    en: "Saved to progress journal",
  },
  "ai_hub.saved_physique_body": {
    tr: "Rapor ve fotoğraflar yalnızca bu cihazda saklanıyor.",
    en: "The report and photos are stored only on your device.",
  },
  "ai_hub.delete_title": { tr: "Kaydı sil?", en: "Delete entry?" },
  "ai_hub.delete_body": {
    tr: "Bu işlem raporu ve cihazdaki ilgili fotoğrafları kalıcı olarak siler.",
    en: "This permanently deletes the report and its photos from this device.",
  },

  "premium.eyebrow": { tr: "FORGE PREMIUM", en: "FORGE PREMIUM" },
  "premium.header_title": {
    tr: "Daha güçlü bir takip deneyimi",
    en: "A stronger tracking experience",
  },
  "premium.close": { tr: "Premium ekranını kapat", en: "Close premium screen" },
  "premium.section_title": {
    tr: "Premium ile açılanlar",
    en: "What premium unlocks",
  },
  "premium.status_active": { tr: "Premium aktif", en: "Premium active" },
  "premium.status_cancelled": {
    tr: "İşlem iptal edildi",
    en: "Purchase cancelled",
  },
  "premium.status_label": { tr: "Premium durumu", en: "Premium status" },
  "premium.preview_enable": {
    tr: "Premium önizlemesini aç",
    en: "Enable premium preview",
  },
  "premium.check_options": {
    tr: "Premium seçeneklerini kontrol et",
    en: "Check premium options",
  },
  "premium.restore": {
    tr: "Satın almaları geri yükle",
    en: "Restore purchases",
  },
  "premium.restore_success": {
    tr: "Satın alma geri yüklendi",
    en: "Purchases restored",
  },
  "premium.restore_status": { tr: "Satın alma durumu", en: "Purchase status" },

  "profile.reset_title": { tr: "Profili sıfırla", en: "Reset profile" },
  "profile.reset_confirm_title": {
    tr: "Bu cihazdaki veriler silinsin mi?",
    en: "Clear data on this device?",
  },
  "profile.reset_confirm_body": {
    tr: "Planlar, günlük kayıtlar ve tercihler bu cihazdan kaldırılır. Premium satın almaların silinmez; aynı mağaza hesabıyla geri yükleyebilirsin.",
    en: "Plans, logs, and preferences will be removed from this device. Premium purchases are not deleted and can be restored with the same store account.",
  },
  "profile.reset_action": { tr: "Bu cihazı sıfırla", en: "Reset this device" },
  "profile.reset_body": {
    tr: "Bu cihazdaki kayıtlı planlar, favoriler, tema ve tüm günlük veriler temizlenecek.",
    en: "Saved plans, favorites, theme, and all daily data on this device will be cleared.",
  },
  "profile.reset_failed_title": {
    tr: "Veriler tamamen temizlenemedi",
    en: "Data could not be fully cleared",
  },
  "profile.reset_failed_body": {
    tr: "Bazı kayıtlar cihazda kaldı. Uygulamayı yeniden açıp tekrar deneyebilirsin.",
    en: "Some records stayed on the device. Reopen the app and try again.",
  },
  "profile.reset_all_label": {
    tr: "Profili ve cihazdaki tüm verileri sıfırla",
    en: "Reset profile and all device data",
  },

  "profile.stat_weight": { tr: "Kilo", en: "Weight" },
  "profile.stat_none": { tr: "Yok", en: "None" },
  "profile.stat_bodyfat": { tr: "Yağ oranı", en: "Body fat" },
  "profile.stat_height": { tr: "Boy", en: "Height" },
  "profile.stat_muscle_gain": { tr: "Kas artışı", en: "Muscle gain" },
  "profile.stat_fat_loss": { tr: "Yağ kaybı", en: "Fat loss" },
  "profile.stat_maintain": { tr: "Koruma", en: "Maintain" },
  "profile.stat_goal_progress": { tr: "Hedef ilerleme", en: "Goal progress" },
  "profile.stat_active_goal": { tr: "Aktif hedef", en: "Active goal" },

  "profile.goal_muscle_gain": { tr: "Kas kütlesi artışı", en: "Muscle gain" },
  "profile.goal_fat_loss": { tr: "Yağ kaybı", en: "Fat loss" },
  "profile.goal_maintain": { tr: "Kiloyu koruma", en: "Weight maintenance" },
  "profile.set_goal": { tr: "Hedef belirle", en: "Set a goal" },

  "profile.group_personal": { tr: "Kişisel bilgiler", en: "Personal info" },
  "profile.account_details": { tr: "Hesap detayları", en: "Account details" },
  "profile.account_sub": { tr: "Ad, cinsiyet, yaş", en: "Name, gender, age" },
  "profile.body_measurements": {
    tr: "Vücut ölçüleri",
    en: "Body measurements",
  },
  "profile.body_sub": {
    tr: "Aktivite, kilo, boy, yağ oranı",
    en: "Activity, weight, height, body fat",
  },
  "profile.cycle_tracking": { tr: "Döngü takibi", en: "Cycle tracking" },
  "profile.cycle_tracking_sub": {
    tr: "Son dönem, tahmini tarih ve gün sayısı",
    en: "Last period, estimated dates, and day counts",
  },

  "profile.group_goals": { tr: "Hedeflerim", en: "My goals" },
  "profile.active_goals": { tr: "Aktif hedefler", en: "Active goals" },
  "profile.achievements": { tr: "Rozetler", en: "Achievements" },

  "profile.group_settings": { tr: "Ayarlar", en: "Settings" },
  "profile.appearance": { tr: "Görünüm", en: "Appearance" },
  "profile.appearance_sub": {
    tr: "Açık veya koyu tema seç",
    en: "Choose light or dark theme",
  },
  "profile.notifications": { tr: "Bildirimler", en: "Notifications" },
  "profile.notifications_sub": {
    tr: "Antrenman ve beslenme hatırlatmaları",
    en: "Workout and nutrition reminders",
  },
  "profile.privacy_security": {
    tr: "Gizlilik ve güvenlik",
    en: "Privacy & security",
  },
  "profile.privacy_sub": {
    tr: "Veri sağlığı ve yerel koruma durumu",
    en: "Data health and local protection status",
  },
  "profile.region_pricing": {
    tr: "Bölge ve fiyatlandırma",
    en: "Region & pricing",
  },

  "profile.free_plan": { tr: "Ücretsiz plan", en: "Free plan" },
  "profile.premium_body": {
    tr: "Premium programlar, gelişmiş besin arama ve daha akıcı takip deneyimi bu profilde açık.",
    en: "Premium programs, advanced food search, and a smoother tracking experience are active on this profile.",
  },
  "profile.view_details": { tr: "Ayrıntıları gör", en: "View details" },
  "profile.account_sync": {
    tr: "Hesap ve senkronizasyon",
    en: "Account and sync",
  },
  "profile.account_sync_sub": {
    tr: "Giriş durumu, cihazlar arası senkron ve üyelik",
    en: "Sign-in status, cross-device sync, and membership",
  },
  "profile.account_guest_title": { tr: "Misafir modunda", en: "Guest mode" },
  "profile.account_guest_body": {
    tr: "Google veya Apple ile giriş yaparak verilerini cihazlar arasında taşı.",
    en: "Sign in with Google or Apple to carry your data across devices.",
  },
  "profile.account_add": {
    tr: "Hesap ekle",
    en: "Add account",
  },
  "profile.account_signed_in": { tr: "Hesap bağlı", en: "Account connected" },
  "profile.account_signed_in_body": {
    tr: "Bu profil hesabınla eşitleniyor ve üyelik durumun korunuyor.",
    en: "This profile syncs with your account and keeps your membership intact.",
  },
  "profile.account_sync_now": { tr: "Şimdi senkronize et", en: "Sync now" },
  "profile.account_restore": {
    tr: "Satın almaları geri yükle",
    en: "Restore purchases",
  },
  "profile.account_sign_out": { tr: "Hesaptan çık", en: "Sign out" },
  "profile.account_last_sync": { tr: "Son senkron", en: "Last sync" },
  "profile.account_never_synced": {
    tr: "Henüz senkron yapılmadı",
    en: "Not synced yet",
  },
  "profile.account_syncing": { tr: "Senkron sürüyor", en: "Syncing" },
  "profile.account_sync_error": { tr: "Senkron uyarısı", en: "Sync warning" },
  "profile.account_restore_done": {
    tr: "Satın almalar kontrol edildi.",
    en: "Purchases were checked.",
  },
  "profile.account_signed_out": {
    tr: "Hesaptan çıkıldı.",
    en: "Signed out.",
  },

  "auth.hero_badge": { tr: "FORGE hesabı", en: "FORGE account" },
  "auth.title": {
    tr: "İlerlemeni tüm cihazlarında yanında tut.",
    en: "Keep your progress with you on every device.",
  },
  "auth.subtitle": {
    tr: "Google veya Apple ile giriş yap, üyeliğini ve tüm kayıtlarını güvenle eşitle.",
    en: "Sign in with Google or Apple to safely sync your membership and all records.",
  },
  "auth.card_title": {
    tr: "Devam etmek için giriş yap",
    en: "Sign in to continue",
  },
  "auth.card_body": {
    tr: "Misafir olarak da devam edebilirsin. Daha sonra hesap eklediğinde yerel verilerin buluta taşınır.",
    en: "You can continue as a guest too. When you add an account later, your local data moves to the cloud.",
  },
  "auth.google_cta": { tr: "Google ile devam et", en: "Continue with Google" },
  "auth.apple_cta": { tr: "Apple ile devam et", en: "Continue with Apple" },
  "auth.guest_cta": {
    tr: "Şimdilik misafir devam et",
    en: "Continue as guest for now",
  },
  "auth.error_title": {
    tr: "Giriş tamamlanamadı",
    en: "Sign-in could not be completed",
  },
  "auth.error_body": {
    tr: "Bağlantını kontrol edip tekrar deneyebilirsin.",
    en: "Check your connection and try again.",
  },

  "profile.week_title": { tr: "Bu hafta", en: "This week" },
  "profile.week_streak": { tr: "Seri", en: "Streak" },
  "profile.week_workouts": { tr: "Antrenman", en: "Workouts" },
  "profile.week_time": { tr: "Süre", en: "Time" },
  "profile.week_meals": { tr: "Öğün", en: "Meals" },

  "profile.upgrade_title": {
    tr: "Premium üyeliğe geç",
    en: "Upgrade to Premium",
  },
  "profile.upgrade_view": { tr: "İncele", en: "View" },
  "programs.free_default_sub": {
    tr: "Hemen başlayabileceğin açık akışlar",
    en: "Ready-to-start open tracks",
  },
  "programs.premium_default_sub": {
    tr: "Daha uzun ve derin planlar premium ile açılır",
    en: "Longer, deeper plans unlock with Premium",
  },
  "cycle.screen_title": { tr: "Döngü takibi", en: "Cycle tracking" },
  "cycle.blocked_title": {
    tr: "Bu alan yalnızca kadın profillerinde görünür",
    en: "This area is visible only for female profiles",
  },
  "cycle.blocked_body": {
    tr: "Cinsiyet tercihi kadın olarak kaydedildiğinde döngü takibi burada açılır.",
    en: "Cycle tracking unlocks here when the saved sex is female.",
  },
  "cycle.hero_title": {
    tr: "Ritmini daha görünür tut",
    en: "Keep your rhythm more visible",
  },
  "cycle.hero_body": {
    tr: "Son dönem tarihini ve ortalama günlerini girerek bir sonraki döngü tahminini takip edebilirsin.",
    en: "Enter your last period date and average day counts to follow your next cycle estimate.",
  },
  "cycle.summary_title": { tr: "Döngü özeti", en: "Cycle summary" },
  "cycle.current_day": { tr: "Döngü günü", en: "Cycle day" },
  "cycle.next_period": { tr: "Sonraki dönem", en: "Next period" },
  "cycle.fertile_window": { tr: "Verimli pencere", en: "Fertile window" },
  "cycle.ovulation": { tr: "Tahmini ovülasyon", en: "Estimated ovulation" },
  "cycle.last_period": { tr: "Son dönem başlangıcı", en: "Last period start" },
  "cycle.cycle_length": { tr: "Döngü uzunluğu", en: "Cycle length" },
  "cycle.period_length": { tr: "Dönem süresi", en: "Period length" },
  "cycle.day_suffix": { tr: "gün", en: "days" },
  "cycle.days_left": { tr: "kaldı", en: "left" },
  "cycle.form_title": { tr: "Takip ayarları", en: "Tracking settings" },
  "cycle.empty_title": {
    tr: "Tarih ekleyince tahminler görünür",
    en: "Estimates appear after you add a date",
  },
  "cycle.empty_body": {
    tr: "Son dönem tarihini kaydet; sonraki başlangıç ve verimli pencere otomatik hesaplanır.",
    en: "Save your last period date and the next start plus fertile window will be calculated automatically.",
  },
  "cycle.phase_period": { tr: "Dönem", en: "Period" },
  "cycle.phase_follicular": { tr: "Toparlanma", en: "Follicular" },
  "cycle.phase_fertile": { tr: "Verimli pencere", en: "Fertile window" },
  "cycle.phase_ovulation": { tr: "Ovülasyon", en: "Ovulation" },
  "cycle.phase_luteal": { tr: "Luteal faz", en: "Luteal phase" },
  "cycle.saved_title": { tr: "Döngü kaydedildi", en: "Cycle saved" },
  "cycle.saved_body": {
    tr: "Tahminler yeni bilgilere göre güncellendi.",
    en: "Estimates were updated with your new details.",
  },
  "coach.screen_title": { tr: "Kişisel Koç", en: "Personal Coach" },
  "coach.hero_body": {
    tr: "Antrenman, beslenme ve su kayıtlarından bugünün en doğru adımını çıkarır.",
    en: "Turns your training, nutrition, and hydration logs into the best next step for today.",
  },
  "coach.score": { tr: "Haftalık skor", en: "Weekly score" },
  "coach.weekly_title": { tr: "Haftanın özeti", en: "Weekly summary" },
  "coach.sessions": { tr: "Seans", en: "Sessions" },
  "coach.minutes": { tr: "Dakika", en: "Minutes" },
  "coach.volume": { tr: "Hacim (kg)", en: "Volume (kg)" },
  "coach.workout_habit": { tr: "Antrenman düzeni", en: "Training consistency" },
  "coach.nutrition_habit": { tr: "Beslenme kaydı", en: "Nutrition logging" },
  "coach.water_habit": { tr: "Su hedefi", en: "Hydration target" },
  "coach.action_train": {
    tr: "Bugün hareket günü",
    en: "Today is a training day",
  },
  "coach.action_recover": {
    tr: "Toparlanmayı öne al",
    en: "Prioritize recovery",
  },
  "coach.action_log_meal": {
    tr: "İlk öğününü kaydet",
    en: "Log your first meal",
  },
  "coach.action_drink_water": {
    tr: "Önce bir bardak su",
    en: "Start with a glass of water",
  },
  "coach.load_title": {
    tr: "Sonraki ağırlık önerisi",
    en: "Next load suggestion",
  },
  "coach.load_body": {
    tr: "Son temiz setine göre küçük ve güvenli bir artış. Form bozulursa önceki ağırlıkta kal.",
    en: "A small, safe increase based on your latest clean set. Keep the previous load if form breaks down.",
  },
  "coach.cycle_title": {
    tr: "Döngüye göre tempo",
    en: "Cycle-aware intensity",
  },
  "coach.cycle_body": {
    tr: "Bu öneri tıbbi değerlendirme değildir; enerjin ve belirtilerin her zaman önceliklidir.",
    en: "This is not medical advice; your energy and symptoms always take priority.",
  },
  "coach.cycle_reflects_title": {
    tr: "Döngü ve antrenmanın",
    en: "Cycle & your training",
  },
  "coach.cycle_reflects_body": {
    tr: "Bu öneri oturum açtığında set, şiddet ve dinlenmene otomatik yansıyor.",
    en: "This applies automatically to your sets, intensity, and rest when you start a session.",
  },
  "coach.intensity_lighter": {
    tr: "Hacmi %10-20 azalt, rahat tempoda kal",
    en: "Reduce volume 10-20% and keep the pace comfortable",
  },
  "coach.intensity_normal": {
    tr: "Planlanan tempoyu koru",
    en: "Keep the planned intensity",
  },
  "coach.intensity_strong": {
    tr: "Enerjin uygunsa ilerlemeyi deneyebilirsin",
    en: "If your energy is good, you can try progressing",
  },
  "cycle.session_notice_label": {
    tr: "Döngüne göre ayarlandı",
    en: "Adjusted for your cycle",
  },
  "cycle.session_notice_lighter": {
    tr: "Bu seans için set sayısı ve şiddet hafifletildi. Enerjin düşükse daha da kısabilirsin.",
    en: "Sets and intensity were eased for this session. Scale back further if your energy is low.",
  },
  "cycle.session_notice_strong": {
    tr: "Bu seans ilerlemeye uygun: şiddet bir kademe artırıldı. Form bozulursa geri çek.",
    en: "This session favors progression: intensity was nudged up. Pull back if your form breaks down.",
  },
  "coach.recipe_title": {
    tr: "Kalan hedefe uygun öğün",
    en: "Meal for your remaining target",
  },
  "coach.recipe_protein_bowl": {
    tr: "Tavuklu protein kasesi",
    en: "Chicken protein bowl",
  },
  "coach.recipe_protein_bowl_detail": {
    tr: "Tavuk, pirinç, yoğurt ve bol yeşillik",
    en: "Chicken, rice, yogurt, and plenty of greens",
  },
  "coach.recipe_balanced_wrap": {
    tr: "Dengeli hindi dürüm",
    en: "Balanced turkey wrap",
  },
  "coach.recipe_balanced_wrap_detail": {
    tr: "Tam tahıllı lavaş, hindi, ayran ve salata",
    en: "Whole-grain wrap, turkey, ayran, and salad",
  },
  "coach.recipe_yogurt": { tr: "Yoğurtlu yulaf kasesi", en: "Yogurt oat bowl" },
  "coach.recipe_yogurt_detail": {
    tr: "Süzme yoğurt, yulaf, meyve ve tarçın",
    en: "Greek yogurt, oats, fruit, and cinnamon",
  },
  "coach.photo_progress": {
    tr: "İlerleme fotoğrafı ve karşılaştırma",
    en: "Progress photo and comparison",
  },
  "coach.preferences_title": { tr: "Koç tercihleri", en: "Coach preferences" },
  "coach.preferences_intro": {
    tr: "Burada sadece temel tercihleri seç. Ana ekrandaki öncelikleri koç kullanımına göre otomatik ayarlar.",
    en: "Only choose your core preferences here. The coach automatically prioritizes home content based on your usage.",
  },
  "coach.equipment": { tr: "Ekipman durumu", en: "Equipment access" },
  "coach.equipment_gym": { tr: "Spor salonu", en: "Gym" },
  "coach.equipment_home": { tr: "Evde ekipmanlı", en: "Equipped home" },
  "coach.equipment_bodyweight": { tr: "Aletsiz", en: "Bodyweight" },
  "coach.limitations": { tr: "Hassas bölgeler", en: "Sensitive areas" },
  "coach.limitations_none": { tr: "Sorun yok", en: "No issues" },
  "coach.limitation_knee": { tr: "Diz", en: "Knee" },
  "coach.limitation_back": { tr: "Bel", en: "Lower back" },
  "coach.limitation_shoulder": { tr: "Omuz", en: "Shoulder" },
  "coach.adaptive_reminders": {
    tr: "Akıllı hatırlatmalar",
    en: "Adaptive reminders",
  },
  "coach.adaptive_reminders_friendly": {
    tr: "Koç beni doğru zamanda hatırlatsın",
    en: "Let the coach remind me at the right time",
  },
  "coach.adaptive_reminders_body": {
    tr: "Hatırlatma saatlerini kayıt alışkanlığına göre kişiselleştirir.",
    en: "Personalizes reminder times around your logging habits.",
  },
  "coach.home_cards": { tr: "Ana sayfada göster", en: "Show on home" },
  "coach.auto_mode": { tr: "Otomatik mod", en: "Auto mode" },
  "coach.home_cards_auto_title": {
    tr: "Ana ekran öncelikleri otomatik seçiliyor",
    en: "Home priorities are selected automatically",
  },
  "coach.home_cards_auto_body": {
    tr: "Koç, kayıtlarına ve erişebildiğin özelliklere göre bugün en faydalı kartları öne çıkarır.",
    en: "The coach brings forward the most useful cards today based on your logs and available features.",
  },
  "coach.card_energy": { tr: "Günlük enerji", en: "Daily energy" },
  "coach.card_weekly": { tr: "Haftalık ilerleyiş", en: "Weekly progress" },
  "coach.card_coach": { tr: "Kişisel koç", en: "Personal coach" },
  "coach.card_analysis": { tr: "Antrenman analizi", en: "Training analysis" },
  "coach.open": { tr: "Koçu aç", en: "Open coach" },
  "coach.home_title": {
    tr: "Bugünün koç önerisi",
    en: "Today's coach recommendation",
  },
  "coach.home_body": {
    tr: "Haftalık skorunu, sonraki ağırlığı ve sana uygun öğünü tek yerde gör.",
    en: "See your weekly score, next load, and matching meal in one place.",
  },
  "coach.swap_exercise": { tr: "Hareketi değiştir", en: "Swap exercise" },
  "coach.no_alternative": {
    tr: "Bu hareket için uygun alternatif bulunamadı.",
    en: "No suitable alternative was found for this exercise.",
  },
  "fitness.women_title": {
    tr: "Döngü takibi ve önerilen akışlar",
    en: "Cycle tracking and recommended flows",
  },
  "fitness.women_body": {
    tr: "Döngü takibini aç; Pilates ve yoga programlarını hemen aşağıda gör.",
    en: "Open cycle tracking; Pilates and yoga programs appear directly below.",
  },
  "fitness.cycle_phase_intro_lighter": {
    tr: "Bugün {faz} fazındasın · Seansların otomatik hafifletiliyor",
    en: "You’re in the {faz} phase today · Sessions are automatically eased",
  },
  "fitness.cycle_phase_intro_normal": {
    tr: "Bugün {faz} fazındasın · Planlanan tempoda",
    en: "You’re in the {faz} phase today · At the planned intensity",
  },
  "fitness.cycle_phase_intro_strong": {
    tr: "Bugün {faz} fazındasın · İlerlemeye açıksın",
    en: "You’re in the {faz} phase today · Open to progression",
  },
  "ai_hub.retain_media": {
    tr: "Fotoğrafı analiz geçmişinde bu cihazda sakla",
    en: "Keep the photo in analysis history on this device",
  },

  "ai_hub.physique_privacy_notice": {
    tr: "Fotoğraflar yalnızca analiz için kullanılır. Saklama tercihini sen belirlersin ve kayıtlar bu cihazda tutulur.",
    en: "Photos are used only for analysis. You choose whether to keep them, and saved records stay on this device.",
  },
  "ai_hub.physique_age_gate_notice": {
    tr: "Bu alan yalnızca 18 yaş ve üzeri profillerde çalışır. Yaşın eksikse profilden güncelleyebilirsin.",
    en: "This flow only works for profiles aged 18 or older. If your age is missing, you can update it in the profile.",
  },
  "ai_hub.processing_notice": {
    tr: "Analiz işleniyor. Fotoğrafların sonuç dönene kadar korunur; bağlantı kesilirse tekrar deneyebilirsin.",
    en: "Your analysis is being processed. Your photos stay protected until a result returns, and you can retry if the connection drops.",
  },
  "session.custom_plan_subtitle": {
    tr: "Kişisel antrenman planın",
    en: "Your custom workout plan",
  },
  "session.custom_difficulty": { tr: "Kişisel", en: "Custom" },
  "session.partial_suffix": { tr: "Kısmi seans", en: "Partial session" },
  "session.save_failed_title": { tr: "Kayıt başarısız", en: "Save failed" },
  "session.save_failed_body": {
    tr: "Antrenman kaydedilemedi. Bilgilerin ekranda duruyor; tekrar deneyebilirsin.",
    en: "The workout could not be saved. Your entries are still on screen, so you can try again.",
  },
  "session.completed_title": {
    tr: "Antrenman tamamlandı",
    en: "Workout completed",
  },
  "session.completed_body": {
    tr: "set başarıyla kaydedildi.",
    en: "sets were saved successfully.",
  },
  "session.achievement_suffix": {
    tr: " Ayrıca {n} yeni rozet açtın.",
    en: " You also unlocked {n} new achievements.",
  },
  "session.great": { tr: "Harika", en: "Great" },
  "session.restart_title": {
    tr: "Seansı yeniden başlat",
    en: "Restart session",
  },
  "session.restart_body": {
    tr: "Tamamlanan setler sıfırlanacak ve planın başlangıç değerlerine dönülecek.",
    en: "Completed sets will be reset and the plan will return to its starting values.",
  },
  "session.restart_action": { tr: "Yeniden başlat", en: "Restart" },
  "session.partial_saved_title": {
    tr: "Seans kaydedildi",
    en: "Session saved",
  },
  "session.partial_saved_body": {
    tr: "{n} tamamlanmış set antrenman geçmişine eklendi. Program günü tamamlandı olarak işaretlenmedi.",
    en: "{n} completed sets were added to workout history. The program day was not marked complete.",
  },
  "session.ok": { tr: "Tamam", en: "OK" },
  "session.end_title": { tr: "Seansı sonlandır", en: "End session" },
  "session.end_has_sets_body": {
    tr: "{n} tamamlanmış setin var. Bunları geçmişe kaydedebilir veya taslağı silebilirsin.",
    en: "You have {n} completed sets. You can save them to history or discard the session.",
  },
  "session.end_no_sets_body": {
    tr: "Henüz tamamlanmış set yok. Seans kaydedilmeden silinecek.",
    en: "There are no completed sets yet. The session will be discarded.",
  },
  "session.exit_action": { tr: "Çık", en: "Exit" },
  "session.save_and_exit_action": {
    tr: "Kaydet ve çık",
    en: "Save and exit",
  },
  "session.exit_workout": { tr: "Antrenmandan çık", en: "Exit workout" },
  "session.exit_sheet_title": { tr: "Antrenmandan ayrıl?", en: "Leave workout?" },
  "session.exit_sheet_body": {
    tr: "{n} tamamlanmış set var. İstersen seansı saklayabilir veya geçmişe kaydedebilirsin.",
    en: "{n} completed sets are ready. You can keep the session or save them to history.",
  },
  "session.keep_draft_action": { tr: "Seansı sakla", en: "Keep session" },
  "session.discard_exit_action": { tr: "Kaydetmeden çık", en: "Exit without saving" },
  "session.continue_workout_action": { tr: "Antrenmana devam et", en: "Continue workout" },
  "session.leave_workout_action": { tr: "Antrenmandan ayrıl", en: "Leave workout" },
  "session.workout": { tr: "Antrenman", en: "Workout" },
  "session.set_word": { tr: "set", en: "sets" },
  "session.open_failed_title": {
    tr: "Antrenman açılamadı",
    en: "Workout could not be opened",
  },
  "session.open_failed_body": {
    tr: "Plan silinmiş veya içindeki hareketler bulunamıyor olabilir.",
    en: "The plan may have been deleted or its exercises may no longer exist.",
  },
  "session.custom_plan_label": { tr: "KİŞİSEL PLAN", en: "CUSTOM PLAN" },
  "session.exercises_word": { tr: "hareket", en: "exercises" },
  "session.min_word": { tr: "dk", en: "min" },
  "session.resume_title": {
    tr: "Yarım kalan seans açıldı",
    en: "Unfinished session reopened",
  },
  "session.resume_body": {
    tr: "set tamamlandı. Setlerin kayıtlı, istediğinde tamamlayabilirsin.",
    en: "sets completed. Your sets are saved, and you can finish the session anytime.",
  },
  "session.draft_ready": {
    tr: "Bu seans cihazında korunur. Çıkarsan daha sonra kaldığın yerden dönebilirsin.",
    en: "This session is kept on your device, so you can come back to it later.",
  },
  "session.draft_saving": {
    tr: "Seans kaydediliyor...",
    en: "Saving your session...",
  },
  "session.draft_saved": {
    tr: "Seansın bu cihazda güvenle saklandı.",
    en: "Your session is safely stored on this device.",
  },
  "session.set_table_reps": { tr: "TEKRAR", en: "REPS" },
  "session.set_table_done": { tr: "ONAY", en: "DONE" },
  "session.set_edit_label": {
    tr: "seti yeniden düzenle",
    en: "edit set again",
  },
  "session.set_confirm_label": { tr: "seti onayla", en: "confirm set" },
  "session.input_error": {
    tr: "Seti onaylamak için ağırlık ve tekrar değerlerini gir.",
    en: "Enter weight and reps to confirm the set.",
  },
  "session.previous": { tr: "Önceki", en: "Previous" },
  "session.next": { tr: "Sonraki", en: "Next" },
  "session.flow_title": { tr: "Antrenman akışı", en: "Workout flow" },
  "session.finish_workout": { tr: "Antrenmanı tamamla", en: "Finish workout" },
  "session.sets_left": { tr: "set kaldı", en: "sets left" },

  "session.finish_card_title": { tr: "Antrenmanı tamamla", en: "Complete workout" },
  "session.finish_card_all_done": { tr: "Tüm setler tamamlandı", en: "All sets completed" },
  "session.finish_card_button": { tr: "Tamamlandı", en: "Completed" },

  "fitness.create_workout_a11y": {
    tr: "Yeni antrenman oluştur",
    en: "Create a new workout",
  },
  "fitness.exercises": { tr: "Hareket", en: "Exercises" },
  "fitness.create_workout": { tr: "Oluştur", en: "Create" },
  "fitness.programs": { tr: "Programlar", en: "Programs" },
  "fitness.open_all_a11y": {
    tr: "Tüm programları aç",
    en: "Open all programs",
  },
  "fitness.all_programs": { tr: "Tüm programlar", en: "All programs" },
  "fitness.all_tab": { tr: "Tümü", en: "All" },
  "fitness.own_tab": { tr: "Özel", en: "Custom" },
  "fitness.ai_tab": { tr: "AI", en: "AI" },
  "fitness.no_filter_results": {
    tr: "Bu filtrede plan bulunamadı",
    en: "No plans in this filter",
  },
  "migrated.not_found_001": {
    tr: "Bu ekran bulunamadı",
    en: "This screen was not found",
  },
  "migrated.not_found_002": {
    tr: "Bağlantı değişmiş olabilir. Ana sayfaya dönüp akışa kaldığın yerden devam edebilirsin.",
    en: "The link may have changed. Return home and continue where you left off.",
  },
  "migrated.not_found_003": { tr: "Ana sayfaya dön", en: "Return home" },
  "migrated.barcode_scanner_001": { tr: "Barkod tara", en: "Scan barcode" },
  "migrated.barcode_scanner_002": {
    tr: "Barkodu çerçevenin içine yerleştir",
    en: "Place the barcode inside the frame",
  },
  "migrated.barcode_scanner_003": {
    tr: "Kod okununca ürün otomatik olarak öğün ekranına taşınır.",
    en: "Once the code is read, the product opens in the meal screen automatically.",
  },
  "migrated.barcode_scanner_004": { tr: "Vazgeç", en: "Cancel" },
  "migrated.barcode_scanner_005": { tr: "Tekrar tara", en: "Scan again" },
  "migrated.barcode_scanner_006": {
    tr: "Kamera izni gerekiyor",
    en: "Camera permission is required",
  },
  "migrated.barcode_scanner_007": {
    tr: "Paketli ürünlerin barkodunu okuyabilmemiz için kamera erişimini açman gerekiyor.",
    en: "Enable camera access so we can read packaged food barcodes.",
  },
  "migrated.barcode_scanner_008": {
    tr: "Kamera iznini aç",
    en: "Enable camera access",
  },
  "migrated.achievements_001": { tr: "Rozetler", en: "Achievements" },
  "migrated.achievements_002": {
    tr: "İLERLEME KOLEKSİYONU",
    en: "PROGRESS COLLECTION",
  },
  "migrated.achievements_003": { tr: "rozet", en: "badges" },
  "migrated.achievements_004": { tr: "gün", en: "days" },
  "migrated.achievements_005": { tr: "Aktif seri", en: "Active streak" },
  "migrated.achievements_006": { tr: "Kazanılan", en: "Unlocked" },
  "migrated.achievements_007": { tr: "Kalan", en: "Remaining" },
  "migrated.achievements_008": { tr: "SIRADAKİ ROZET", en: "NEXT BADGE" },
  "migrated.achievements_009": { tr: "Açıldı", en: "Unlocked" },
  "migrated.program_detail_001": { tr: "Geri dön", en: "Go back" },
  "migrated.program_detail_002": { tr: "Program", en: "Program" },
  "migrated.program_detail_003": { tr: "UCRETSIZ", en: "FREE" },
  "migrated.program_detail_004": {
    tr: "Programı incele, Premium ile başlat",
    en: "Preview the program, unlock with Premium",
  },
  "migrated.program_detail_005": {
    tr: "Premium seceneklerini gor",
    en: "See Premium options",
  },
  "migrated.program_detail_006": {
    tr: "Program bulunamadi",
    en: "Program not found",
  },
  "migrated.program_detail_007": {
    tr: "Program kartindan tekrar acmayi dene.",
    en: "Try opening it again from the program card.",
  },
  "migrated.program_detail_008": { tr: "Tamamlandı", en: "Completed" },
  "migrated.program_detail_009": {
    tr: "Premium ile başlat",
    en: "Start with Premium",
  },
  "migrated.program_detail_010": { tr: "Tekrar başlat", en: "Restart" },
  "migrated.program_detail_011": {
    tr: "Antrenmanı başlat",
    en: "Start workout",
  },
  "migrated.program_detail_dynamic_003": {
    tr: "{count} gün / hafta",
    en: "{count} days / week",
  },
  "migrated.program_detail_dynamic_004": {
    tr: "Programı inceleyebilirsin; tüm haftalar, detaylı akış ve başlatma premium ile açılır.",
    en: "You can preview the program; all weeks, the detailed flow, and full start access unlock with premium.",
  },
  "migrated.program_detail_dynamic_005": {
    tr: "{count} hafta daha hazır",
    en: "{count} more weeks ready",
  },
  "migrated.program_detail_dynamic_006": {
    tr: "Kilidi açtığında kalan tüm haftalar ve ilerleme akışı burada görünür.",
    en: "Unlock to see all remaining weeks and the full progress flow here.",
  },
  "migrated.program_detail_dynamic_007": {
    tr: "{count} dk",
    en: "{count} min",
  },
  "migrated.program_detail_dynamic_008": {
    tr: "{count} hareket",
    en: "{count} exercises",
  },
  "migrated.program_detail_dynamic_009": {
    tr: "{count} set",
    en: "{count} sets",
  },
  "migrated.program_detail_dynamic_010": {
    tr: "{count} dk dinlenme",
    en: "{count} min rest",
  },
  "migrated.program_detail_dynamic_011": {
    tr: "{count} sn dinlenme",
    en: "{count} sec rest",
  },
  "migrated.program_detail_dynamic_012": {
    tr: "{sets} set · {reps} · {rest}",
    en: "{sets} sets · {reps} · {rest}",
  },
  "migrated.program_detail_dynamic_013": {
    tr: "Alternatif: {name}",
    en: "Alternative: {name}",
  },
  "migrated.program_detail_dynamic_014": {
    tr: "+{count} hareket daha",
    en: "+{count} more exercises",
  },
  "migrated.workout_log_detail_001": { tr: "Set gerekli", en: "Set required" },
  "migrated.workout_log_detail_002": {
    tr: "Kaydetmeden önce en az bir set ekle.",
    en: "Add at least one set before saving.",
  },
  "migrated.workout_log_detail_003": {
    tr: "Geçersiz değer",
    en: "Invalid value",
  },
  "migrated.workout_log_detail_004": {
    tr: "Kg sıfır veya daha büyük, tekrar ise sıfırdan büyük olmalı.",
    en: "Weight must be zero or greater and reps must be greater than zero.",
  },
  "migrated.workout_log_detail_005": {
    tr: "Kayıt güncellenemedi",
    en: "Entry could not be updated",
  },
  "migrated.workout_log_detail_006": {
    tr: "Değişiklikler cihazına yazılamadı. Tekrar deneyebilirsin.",
    en: "Changes could not be saved to your device. Please try again.",
  },
  "migrated.workout_log_detail_007": { tr: "Kaydı sil", en: "Delete entry" },
  "migrated.workout_log_detail_008": {
    tr: "Bu antrenman kaydını silmek istediğine emin misin?",
    en: "Are you sure you want to delete this workout entry?",
  },
  "migrated.workout_log_detail_009": { tr: "Vazgeç", en: "Cancel" },
  "migrated.workout_log_detail_010": { tr: "Sil", en: "Delete" },
  "migrated.workout_log_detail_011": {
    tr: "Kayıt detayı",
    en: "Entry details",
  },
  "migrated.workout_log_detail_012": { tr: "Düzenle", en: "Edit" },
  "migrated.workout_log_detail_013": { tr: "dk", en: "min" },
  "migrated.workout_log_detail_014": {
    tr: "Program akışından gelen kayıt",
    en: "Entry from a program session",
  },
  "migrated.workout_log_detail_015": { tr: "Set detayları", en: "Set details" },
  "migrated.workout_log_detail_016": { tr: "toplam hacim", en: "total volume" },
  "migrated.workout_log_detail_017": {
    tr: "YENİ SETİN HAREKETİ",
    en: "EXERCISE FOR NEW SET",
  },
  "migrated.workout_log_detail_018": {
    tr: "hareketini seç",
    en: "select exercise",
  },
  "migrated.workout_log_detail_019": { tr: "Isınma", en: "Warm-up" },
  "migrated.workout_log_detail_020": { tr: "Çalışma", en: "Working" },
  "migrated.workout_log_detail_021": { tr: "Hareket", en: "Exercise" },
  "migrated.workout_log_detail_022": { tr: "TEKRAR", en: "REPS" },
  "migrated.workout_log_detail_023": {
    tr: "Isınma seti ekle",
    en: "Add warm-up set",
  },
  "migrated.workout_log_detail_024": {
    tr: "Çalışma seti ekle",
    en: "Add working set",
  },
  "migrated.workout_log_detail_025": {
    tr: "Bu kayıtta henüz set detayı yok. İstersen düzenleyip şimdi ekleyebilirsin.",
    en: "This entry has no set details yet. Edit it to add them now.",
  },
  "migrated.workout_log_detail_026": { tr: "Kaydediliyor...", en: "Saving..." },
  "migrated.workout_log_detail_027": {
    tr: "Değişiklikleri kaydet",
    en: "Save changes",
  },
  "migrated.workout_log_detail_028": {
    tr: "Kayıt bulunamadı.",
    en: "Entry not found.",
  },
  "migrated.calorie_insights_001": {
    tr: "Kalori Özeti",
    en: "Calorie Summary",
  },
  "migrated.calorie_insights_002": {
    tr: "Beslenme görünümü",
    en: "Nutrition overview",
  },
  "migrated.calorie_insights_003": {
    tr: "Günlük hedefini korurken haftalık ve aylık ritmini de tek yerden izle.",
    en: "Track your weekly and monthly rhythm while staying close to your daily goal.",
  },
  "migrated.calorie_insights_004": { tr: "Bu hafta", en: "This week" },
  "migrated.calorie_insights_005": { tr: "Kalori trendi", en: "Calorie trend" },
  "migrated.calorie_insights_006": { tr: "öğün", en: "meals" },
  "migrated.calorie_insights_007": {
    tr: "Günlük ortalama",
    en: "Daily average",
  },
  "migrated.calorie_insights_008": { tr: "gün aktif", en: "active days" },
  "migrated.calorie_insights_009": { tr: "Karb.", en: "Carbs" },
  "migrated.calorie_insights_010": { tr: "Yağ", en: "Fat" },
  "migrated.calorie_insights_011": {
    tr: "Hedefe yakın bir tempoda gidiyorsun.",
    en: "You are pacing close to your goal.",
  },
  "migrated.calorie_insights_012": {
    tr: "Hedefin biraz altındasın.",
    en: "You are slightly below your goal.",
  },
  "migrated.calorie_insights_013": {
    tr: "Hedefin biraz üzerindesin.",
    en: "You are slightly above your goal.",
  },
  "migrated.my_workouts_001": { tr: "Antrenmanı sil", en: "Delete workout" },
  "migrated.my_workouts_002": { tr: "Vazgeç", en: "Cancel" },
  "migrated.my_workouts_003": { tr: "Sil", en: "Delete" },
  "migrated.my_workouts_004": {
    tr: "Plan silinemedi",
    en: "Plan could not be deleted",
  },
  "migrated.my_workouts_005": {
    tr: "Ad değiştirilemedi",
    en: "Name could not be changed",
  },
  "migrated.my_workouts_006": { tr: "Geri dön", en: "Go back" },
  "migrated.my_workouts_007": { tr: "Antrenmanım", en: "My Workouts" },
  "migrated.my_workouts_008": {
    tr: "Yeni antrenman oluştur",
    en: "Create new workout",
  },
  "migrated.my_workouts_009": {
    tr: "KİŞİSEL PLAN MERKEZİ",
    en: "CUSTOM PLAN HUB",
  },
  "migrated.my_workouts_010": {
    tr: "Planların hazır.",
    en: "Your plans are ready.",
  },
  "migrated.my_workouts_011": {
    tr: "Sıra antrenmanda.",
    en: "Now it is time to train.",
  },
  "migrated.my_workouts_012": { tr: "Plan", en: "Plans" },
  "migrated.my_workouts_013": { tr: "Bu hafta", en: "This week" },
  "migrated.my_workouts_014": { tr: "Toplam seans", en: "Total sessions" },
  "migrated.my_workouts_015": { tr: "Kayıtlı planlar", en: "Saved plans" },
  "migrated.my_workouts_016": {
    tr: "Başlat, düzenle veya planının adını değiştir.",
    en: "Start, edit, or rename your plan.",
  },
  "migrated.my_workouts_017": {
    tr: "İlk planını oluştur",
    en: "Create your first plan",
  },
  "migrated.my_workouts_018": { tr: "Antrenman oluştur", en: "Create workout" },
  "migrated.my_workouts_019": {
    tr: "Antrenman adını değiştir",
    en: "Rename workout",
  },
  "migrated.my_workouts_020": { tr: "Hareket", en: "Exercises" },
  "migrated.my_workouts_021": { tr: "Set", en: "Sets" },
  "migrated.my_workouts_022": { tr: "Dakika", en: "Minutes" },
  "migrated.my_workouts_023": { tr: "Düzenle", en: "Edit" },
  "migrated.my_workouts_024": { tr: "Başlat", en: "Start" },
  "migrated.my_workouts_025": { tr: "Antrenman adı", en: "Workout name" },
  "migrated.my_workouts_026": { tr: "Kaydediliyor", en: "Saving" },
  "migrated.my_workouts_027": { tr: "Kaydet", en: "Save" },
  "migrated.my_workouts_028": {
    tr: "{title} planı Antrenmanım listesinden kaldırılacak. Geçmiş antrenman kayıtların korunur.",
    en: "{title} will be removed from My Workouts. Your workout history will remain protected.",
  },
  "migrated.my_workouts_029": {
    tr: "Antrenman cihazdan kaldırılamadı. Tekrar deneyebilirsin.",
    en: "The workout could not be removed from the device. Please try again.",
  },
  "migrated.my_workouts_030": {
    tr: "Yeni ad cihaza kaydedilemedi. Tekrar deneyebilirsin.",
    en: "The new name could not be saved to the device. Please try again.",
  },
  "migrated.my_workouts_031": {
    tr: "Hareketlerini düzenle, bir dokunuşla seansı başlat ve tamamlanan setlerini kaydet.",
    en: "Edit your exercises, start a session with one tap, and save your completed sets.",
  },
  "migrated.my_workouts_032": {
    tr: "Egzersizlerini seç, set ve tekrarlarını kendin belirle. Kaydettiğinde burada başlatmaya hazır olacak.",
    en: "Choose your exercises and set your own sets and reps. Once saved, the plan will be ready to start here.",
  },
  "migrated.my_workouts_dynamic_001": {
    tr: "Son seans {date}",
    en: "Last session {date}",
  },
  "migrated.my_workouts_dynamic_002": {
    tr: "Güncellendi {date}",
    en: "Updated {date}",
  },
  "migrated.my_workouts_dynamic_003": {
    tr: "+{count} hareket daha",
    en: "+{count} more exercises",
  },
  "migrated.create_workout_001": { tr: "Hareket seç", en: "Select exercises" },
  "migrated.create_workout_002": {
    tr: "Antrenmanına en az bir egzersiz ekle.",
    en: "Add at least one exercise to your workout.",
  },
  "migrated.create_workout_003": {
    tr: "Set ve tekrar ekle",
    en: "Add sets and reps",
  },
  "migrated.create_workout_004": {
    tr: "Antrenman kaydedilemedi",
    en: "Workout could not be saved",
  },
  "migrated.create_workout_005": {
    tr: "Hareket seçimine dön",
    en: "Return to exercise selection",
  },
  "migrated.create_workout_006": { tr: "Geri dön", en: "Go back" },
  "migrated.create_workout_007": { tr: "Setleri ayarla", en: "Configure sets" },
  "migrated.create_workout_008": {
    tr: "Set ve tekrar ayarlarına ilerle",
    en: "Continue to set and rep settings",
  },
  "migrated.create_workout_009": {
    tr: "Antrenmanı kaydet",
    en: "Save workout",
  },
  "migrated.create_workout_010": {
    tr: "Antrenmanı kaydet ve adlandır",
    en: "Save and name workout",
  },
  "migrated.create_workout_011": { tr: "Kaydediliyor", en: "Saving" },
  "migrated.create_workout_012": { tr: "İlerle", en: "Continue" },
  "migrated.create_workout_013": { tr: "Kaydet", en: "Save" },
  "migrated.create_workout_014": {
    tr: "Antrenman bulunamadı",
    en: "Workout not found",
  },
  "migrated.create_workout_015": {
    tr: "Yeni plan oluştur",
    en: "Create new plan",
  },
  "migrated.create_workout_016": {
    tr: "Hareketleri düzenle",
    en: "Edit exercises",
  },
  "migrated.create_workout_017": {
    tr: "Egzersiz kütüphanesi",
    en: "Exercise library",
  },
  "migrated.create_workout_018": {
    tr: "Antrenman detayları",
    en: "Workout details",
  },
  "migrated.create_workout_019": { tr: "Yükleniyor...", en: "Loading..." },
  "migrated.create_workout_020": {
    tr: "Set · tekrar · kg",
    en: "Sets · reps · kg",
  },
  "migrated.create_workout_021": {
    tr: "Daha fazla egzersiz için kaydır",
    en: "Scroll for more exercises",
  },
  "migrated.create_workout_022": {
    tr: "Egzersiz ara...",
    en: "Search exercises...",
  },
  "migrated.create_workout_023": { tr: "Aramayı temizle", en: "Clear search" },
  "migrated.create_workout_024": { tr: "Hareket seç", en: "Select" },
  "migrated.create_workout_025": { tr: "Detayları ayarla", en: "Configure" },
  "migrated.create_workout_026": {
    tr: "antrenmandan çıkar",
    en: "remove from workout",
  },
  "migrated.create_workout_027": {
    tr: "antrenmana ekle",
    en: "add to workout",
  },
  "migrated.create_workout_028": {
    tr: "Favoriden çıkar",
    en: "Remove from favorites",
  },
  "migrated.create_workout_029": {
    tr: "Favoriye ekle",
    en: "Add to favorites",
  },
  "migrated.create_workout_030": {
    tr: "Antrenmandan çıkar",
    en: "Remove from workout",
  },
  "migrated.create_workout_031": {
    tr: "Antrenmana ekle",
    en: "Add to workout",
  },
  "migrated.create_workout_032": {
    tr: "hareketini çıkar",
    en: "remove exercise",
  },
  "migrated.create_workout_033": { tr: "Set", en: "Sets" },
  "migrated.create_workout_034": { tr: "Tekrar", en: "Reps" },
  "migrated.create_workout_035": { tr: "Kilo", en: "Weight" },
  "migrated.create_workout_036": {
    tr: "Antrenmanına isim ver",
    en: "Name your workout",
  },
  "migrated.create_workout_037": {
    tr: "Örn. Göğüs günü",
    en: "e.g. Chest day",
  },
  "migrated.create_workout_038": { tr: "Vazgeç", en: "Cancel" },
  "migrated.create_workout_039": {
    tr: "Henüz favoriye eklediğin bir egzersiz yok.",
    en: "You have not added any favorite exercises yet.",
  },
  "migrated.create_workout_040": {
    tr: "Aramanı sadeleştir veya farklı bir kas grubu dene.",
    en: "Try a simpler search or a different muscle group.",
  },
  "migrated.create_workout_041": {
    tr: "Bu filtrede gösterilecek egzersiz bulunamadı.",
    en: "No exercises were found for this filter.",
  },
  "migrated.create_workout_042": {
    tr: "Sonuç bulunamadı",
    en: "No results found",
  },
  "migrated.create_workout_043": {
    tr: "Ayarlanacak hareket kalmadı",
    en: "No exercises left to configure",
  },
  "migrated.create_workout_044": {
    tr: "Hareket seçimine dönüp planına en az bir egzersiz ekle.",
    en: "Return to exercise selection and add at least one exercise.",
  },
  "migrated.create_workout_045": {
    tr: "Hareket seçimine dön",
    en: "Back to exercise selection",
  },
  "migrated.create_workout_046": {
    tr: "{name} için set ve tekrar bilgisi gir.",
    en: "Enter set and rep details for {name}.",
  },
  "migrated.create_workout_047": {
    tr: "Plan cihaza yazılamadı. Seçimlerin ekranda duruyor; tekrar deneyebilirsin.",
    en: "The plan could not be saved to the device. Your selections are still here, so you can try again.",
  },
  "migrated.create_workout_048": {
    tr: "Düzenlemek istediğin kayıt silinmiş olabilir. İstersen yeni bir plan oluşturalım.",
    en: "The plan you wanted to edit may have been removed. You can create a new one instead.",
  },
  "migrated.create_workout_049": {
    tr: "Hareketleri + ile planına ekle. Kalp simgesi yalnızca favorilerini düzenler.",
    en: "Add exercises to your plan with +. The heart only manages favorites.",
  },
  "migrated.create_workout_050": {
    tr: "Seçtiğin hareketlerin set, tekrar ve başlangıç kilosunu burada düzenle.",
    en: "Adjust the sets, reps, and starting weight for your selected exercises here.",
  },
  "migrated.create_workout_dynamic_001": {
    tr: "{count} hareket",
    en: "{count} exercises",
  },
  "migrated.create_workout_dynamic_002": {
    tr: "{count} seçildi",
    en: "{count} selected",
  },
  "migrated.nutrition_001": {
    tr: "Öğün silinemedi",
    en: "Meal could not be deleted",
  },
  "migrated.nutrition_002": {
    tr: "Kayıt cihazdan kaldırılamadı. Tekrar deneyebilirsin.",
    en: "The entry could not be removed from the device. Please try again.",
  },
  "migrated.nutrition_003": {
    tr: "Su kaydedilemedi",
    en: "Water could not be saved",
  },
  "migrated.nutrition_004": {
    tr: "Su miktarı cihazına yazılamadı. Tekrar deneyebilirsin.",
    en: "The water amount could not be saved to your device. Please try again.",
  },
  "migrated.nutrition_005": {
    tr: "Su sıfırlanamadı",
    en: "Water could not be reset",
  },
  "migrated.nutrition_006": {
    tr: "Su kaydı cihazdan kaldırılamadı. Tekrar deneyebilirsin.",
    en: "The water entry could not be cleared. Please try again.",
  },
  "migrated.nutrition_007": { tr: "Öğün", en: "Meal" },
  "migrated.nutrition_008": { tr: "ler", en: "s" },
  "migrated.nutrition_009": {
    tr: "Günlük kayıtların ve besin dağılımın tek panelde.",
    en: "Your daily entries and nutrition distribution in one panel.",
  },
  "migrated.nutrition_010": {
    tr: "Seçili güne öğün ekle",
    en: "Add a meal to the selected day",
  },
  "migrated.nutrition_011": { tr: "Ekle", en: "Add" },
  "migrated.nutrition_012": { tr: "öğün", en: "meals" },
  "migrated.nutrition_013": { tr: "toplam", en: "total" },
  "migrated.nutrition_014": {
    tr: "Henüz öğün eklenmedi",
    en: "No meals added yet",
  },
  "migrated.nutrition_015": {
    tr: "İlk kaydını ekleyerek günlük beslenme özetini başlat.",
    en: "Add your first entry to start your daily nutrition summary.",
  },
  "migrated.nutrition_016": {
    tr: "Seçili güne ilk öğününü ekle",
    en: "Add your first meal to the selected day",
  },
  "migrated.nutrition_017": {
    tr: "İlk öğününü ekle",
    en: "Add your first meal",
  },
  "migrated.nutrition_018": { tr: "Beslenme Takibi", en: "Nutrition Tracking" },
  "migrated.nutrition_019": {
    tr: "Seçili günün kalori ve öğün ritmini tek yerden izle.",
    en: "Follow the selected day’s calories and meal rhythm in one place.",
  },
  "migrated.nutrition_020": { tr: "Tarih seç", en: "Select date" },
  "migrated.nutrition_021": { tr: "Kaydet", en: "Save" },
  "migrated.nutrition_022": { tr: "Kapat", en: "Close" },
  "migrated.nutrition_023": { tr: "Bugün", en: "Today" },
  "migrated.nutrition_024": { tr: "Kalori ", en: "Calorie " },
  "migrated.nutrition_025": { tr: "Özeti", en: "Summary" },
  "migrated.nutrition_026": {
    tr: "Günlük tüketimin ve makro dağılımın.",
    en: "Your daily intake and macro distribution.",
  },
  "migrated.nutrition_027": {
    tr: "Kalori özeti detayını aç",
    en: "Open calorie summary details",
  },
  "migrated.nutrition_028": { tr: "Detay", en: "Details" },
  "migrated.nutrition_029": { tr: "Protein", en: "Protein" },
  "migrated.nutrition_030": { tr: "Karbonhidrat", en: "Carbs" },
  "migrated.nutrition_031": { tr: "Yağ", en: "Fat" },
  "migrated.nutrition_032": { tr: "Su ", en: "Water " },
  "migrated.nutrition_033": { tr: "takibi", en: "tracking" },
  "migrated.nutrition_034": {
    tr: "Bugünkü sıvı hedefin",
    en: "Your fluid goal for today",
  },
  "migrated.nutrition_035": {
    tr: "Su takibi detayını aç",
    en: "Open water tracking details",
  },
  "migrated.nutrition_036": {
    tr: "Profil kilona göre otomatik hesaplanır",
    en: "Calculated automatically from your profile weight",
  },
  "migrated.nutrition_037": {
    tr: "250 mililitre geri al",
    en: "Remove 250 milliliters",
  },
  "migrated.nutrition_038": {
    tr: "250 mililitre su ekle",
    en: "Add 250 milliliters of water",
  },
  "migrated.nutrition_039": { tr: "Suyu sıfırla", en: "Reset water" },
  "migrated.nutrition_040": { tr: "Beslenme ", en: "Nutrition " },
  "migrated.nutrition_041": { tr: "İpucu", en: "Tip" },
  "migrated.nutrition_042": {
    tr: "Akşam öğününde lif ve protein dengesini korumak, gece açlığını ve düzensiz atıştırmayı azaltabilir.",
    en: "Keeping fiber and protein balanced at dinner can reduce late-night hunger and unplanned snacking.",
  },
  "migrated.nutrition_dynamic_001": { tr: "Diğer", en: "Other" },
  "migrated.nutrition_dynamic_002": {
    tr: "Bu hafta {count} öğün kaydedildi",
    en: "{count} meals were logged this week",
  },
  "migrated.nutrition_dynamic_003": {
    tr: "{weight} {unit} × 33 ml ile hesaplandı",
    en: "Calculated from {weight} {unit} × 33 ml",
  },
  "migrated.add_meal_001": { tr: "1 porsiyon", en: "1 serving" },
  "migrated.add_meal_002": {
    tr: "Bu barkod için besin bulunamadı. Bilgileri elle girebilirsin.",
    en: "No food was found for this barcode. You can enter it manually.",
  },
  "migrated.add_meal_003": {
    tr: "Barkod sorgulanamadı. Bağlantını kontrol edip tekrar deneyebilirsin.",
    en: "The barcode could not be looked up. Check your connection and try again.",
  },
  "migrated.add_meal_004": {
    tr: "Gelişmiş besin arama premium ile açılıyor. Şimdilik manuel giriş açık.",
    en: "Advanced food search is part of premium. Manual entry is still available.",
  },
  "migrated.add_meal_005": {
    tr: "Sonuç bulunamadı. Elle girmeyi deneyebilirsin.",
    en: "No results found. You can try manual entry.",
  },
  "migrated.add_meal_006": {
    tr: "Arama sırasında bir hata oldu. Elle giriş yapabilirsin.",
    en: "There was an error during search. You can use manual entry.",
  },
  "migrated.add_meal_007": {
    tr: "Öğün kaydedilemedi",
    en: "Meal could not be saved",
  },
  "migrated.add_meal_008": {
    tr: "Kayıt cihazına yazılamadı. Verilerini kaybetmemek için tekrar deneyebilirsin.",
    en: "The entry could not be written to your device. Please try again.",
  },
  "migrated.add_meal_009": { tr: "Geri dön", en: "Go back" },
  "migrated.add_meal_010": { tr: "Öğün Ekle", en: "Add Meal" },
  "migrated.add_meal_011": { tr: "Öğün", en: "Meal" },
  "migrated.add_meal_012": { tr: "Besin arama modu", en: "Food search mode" },
  "migrated.add_meal_013": {
    tr: "Premium besin arama modu, kilitli",
    en: "Premium food search mode, locked",
  },
  "migrated.add_meal_014": { tr: "Ara", en: "Search" },
  "migrated.add_meal_015": {
    tr: "Elle besin giriş modu",
    en: "Manual entry mode",
  },
  "migrated.add_meal_016": { tr: "Elle Gir", en: "Manual" },
  "migrated.add_meal_017": { tr: "Besin Arama", en: "Food Search" },
  "migrated.add_meal_018": {
    tr: "Aradığın besini bul, porsiyonu düzenle ve öğün günlüğüne kaydet.",
    en: "Find the food you want, adjust the portion, and save it to your meal diary.",
  },
  "migrated.add_meal_019": { tr: "Barkod tara", en: "Scan barcode" },
  "migrated.add_meal_020": { tr: "Barkodla ekle", en: "Add by barcode" },
  "migrated.add_meal_021": {
    tr: "Besin ara (örn. tavuk)",
    en: "Search food (e.g. chicken)",
  },
  "migrated.add_meal_022": { tr: "Besin ara", en: "Search food" },
  "migrated.add_meal_023": {
    tr: "Gelişmiş besin arama Premium ile açılır",
    en: "Advanced food search unlocks with Premium",
  },
  "migrated.add_meal_024": {
    tr: "Öcretsiz planda manuel giriş açık kalır. Yeni besin arama premium üyelikle açılır.",
    en: "Manual entry stays available on the free plan. New food search unlocks with premium.",
  },
  "migrated.add_meal_025": {
    tr: "Premium detayını gör",
    en: "See premium details",
  },
  "migrated.add_meal_026": { tr: "Porsiyon (gram)", en: "Portion (grams)" },
  "migrated.add_meal_027": { tr: "Kalori", en: "Calories" },
  "migrated.add_meal_028": { tr: "Protein", en: "Protein" },
  "migrated.add_meal_029": { tr: "Karb", en: "Carbs" },
  "migrated.add_meal_030": { tr: "Yağ", en: "Fat" },
  "migrated.add_meal_031": { tr: "Kaydet", en: "Save" },
  "migrated.add_meal_032": { tr: "Besin Adı", en: "Food Name" },
  "migrated.add_meal_033": { tr: "Örn. Yulaf Ezmesi", en: "e.g. Oatmeal" },
  "migrated.add_meal_034": { tr: "Porsiyon", en: "Portion" },
  "migrated.add_meal_035": {
    tr: "Örn. 1 kase veya 150 g",
    en: "e.g. 1 bowl or 150 g",
  },
  "migrated.add_meal_036": { tr: "Karb (g)", en: "Carbs (g)" },
  "migrated.add_meal_037": { tr: "Yağ (g)", en: "Fat (g)" },
  "migrated.add_meal_038": { tr: "Öğün Tipi", en: "Meal Type" },
  "migrated.add_meal_039": {
    tr: "Öğün tipi seçimini kapat",
    en: "Close meal type selection",
  },
  "migrated.add_meal_040": {
    tr: "Bu öğünü hangi bölüme eklemek istiyorsun?",
    en: "Which section would you like to add this meal to?",
  },
  "migrated.add_meal_041": {
    tr: "Favori öğün şablonu olarak kaydet",
    en: "Save as favorite meal template",
  },
  "migrated.add_meal_042": {
    tr: "Favori şablon olarak kaydet",
    en: "Save as favorite template",
  },
  "migrated.add_meal_043": {
    tr: "Sonraki sefer tek dokunuşla tekrar ekleyebilirsin.",
    en: "Next time you can add it again with one tap.",
  },
  "migrated.add_meal_044": { tr: "öğünü olarak kaydet", en: "meal" },
  "migrated.onboarding_001": { tr: "Hareketsiz", en: "Sedentary" },
  "migrated.onboarding_002": {
    tr: "Masa başı, egzersiz yok",
    en: "Desk job, no training",
  },
  "migrated.onboarding_003": { tr: "Az Aktif", en: "Lightly active" },
  "migrated.onboarding_004": { tr: "Haftada 1-3 gün", en: "1-3 days per week" },
  "migrated.onboarding_005": { tr: "Aktif", en: "Active" },
  "migrated.onboarding_006": { tr: "Haftada 3-5 gün", en: "3-5 days per week" },
  "migrated.onboarding_007": { tr: "Çok Aktif", en: "Very active" },
  "migrated.onboarding_008": { tr: "Haftada 6-7 gün", en: "6-7 days per week" },
  "migrated.onboarding_009": { tr: "Elit", en: "Elite" },
  "migrated.onboarding_010": {
    tr: "Günde 2 antrenman",
    en: "2 sessions per day",
  },
  "migrated.onboarding_011": {
    tr: "Sana göre başlayalım",
    en: "Let’s make this yours",
  },
  "migrated.onboarding_012": { tr: "Cinsiyetin", en: "Your sex" },
  "migrated.onboarding_013": { tr: "Yaşın", en: "Your age" },
  "migrated.onboarding_014": { tr: "Boyun", en: "Your height" },
  "migrated.onboarding_015": { tr: "Kilon", en: "Your weight" },
  "migrated.onboarding_016": {
    tr: "Aktivite Seviyen",
    en: "Your activity level",
  },
  "migrated.onboarding_017": {
    tr: "Vücut Ölçülerin",
    en: "Your body measurements",
  },
  "migrated.onboarding_018": { tr: "Hedefin", en: "Your goal" },
  "migrated.onboarding_019": {
    tr: "Ana ekranı ve takibini biraz daha kişisel hale getirelim.",
    en: "We’ll personalize your home screen and tracking.",
  },
  "migrated.onboarding_020": {
    tr: "Yağ oranı ve hedef hesapları için bunu kullanacağız.",
    en: "We use this for body fat and goal calculations.",
  },
  "migrated.onboarding_021": {
    tr: "Hedeflerini daha dengeli hesaplayabilmek için gerekli.",
    en: "This helps us estimate your targets more accurately.",
  },
  "migrated.onboarding_022": {
    tr: "Kalori ve ölçü hesaplarında kullanılacak.",
    en: "Used for calorie and body calculations.",
  },
  "migrated.onboarding_023": {
    tr: "İlerlemeni doğru görebilmek için başlangıç noktan.",
    en: "This is your starting point for progress tracking.",
  },
  "migrated.onboarding_024": {
    tr: "Günlük kalori hedefini buna göre ayarlayacağız.",
    en: "We’ll adapt your daily calorie target around this.",
  },
  "migrated.onboarding_025": {
    tr: "İstersen yaklaşık yağ oranını hesaplayabiliriz. Bu adımı boş bırakıp geçebilirsin.",
    en: "We can estimate your body fat if you want. You can also skip this step.",
  },
  "migrated.onboarding_026": {
    tr: "Uygulamanın sana hangi yönde eşlik edeceğini netleştirelim.",
    en: "Let’s define what direction the app should support you in.",
  },
  "migrated.onboarding_027": {
    tr: "Profil kaydedilemedi",
    en: "Profile could not be saved",
  },
  "migrated.onboarding_028": {
    tr: "Bilgilerin cihazına yazılamadı. Lütfen tekrar dene.",
    en: "Your details could not be written to this device. Please try again.",
  },
  "migrated.onboarding_029": { tr: "Hesap Detayları", en: "Account details" },
  "migrated.onboarding_030": { tr: "Vücut Ölçüleri", en: "Body metrics" },
  "migrated.onboarding_031": { tr: "Profili Düzenle", en: "Edit profile" },
  "migrated.onboarding_032": { tr: "Hoş Geldin", en: "Welcome" },
  "migrated.onboarding_033": { tr: "Adın", en: "Your name" },
  "migrated.onboarding_034": { tr: "Erkek", en: "Male" },
  "migrated.onboarding_035": { tr: "Kadın", en: "Female" },
  "migrated.onboarding_036": { tr: "Örn. 28", en: "e.g. 28" },
  "migrated.onboarding_037": { tr: "yaş", en: "yrs" },
  "migrated.onboarding_038": { tr: "Örn. 180", en: "e.g. 180" },
  "migrated.onboarding_039": { tr: "Örn. 74.5", en: "e.g. 74.5" },
  "migrated.onboarding_040": { tr: "Örn. 38", en: "e.g. 38" },
  "migrated.onboarding_041": { tr: "Boyun Çevresi", en: "Neck circumference" },
  "migrated.onboarding_042": { tr: "Örn. 84", en: "e.g. 84" },
  "migrated.onboarding_043": { tr: "Bel Çevresi", en: "Waist circumference" },
  "migrated.onboarding_044": { tr: "Örn. 96", en: "e.g. 96" },
  "migrated.onboarding_045": { tr: "Kalça Çevresi", en: "Hip circumference" },
  "migrated.onboarding_046": {
    tr: "Yağ oranı yaklaşık olarak Navy formülü ile hesaplanır.",
    en: "Body fat is estimated with the Navy formula.",
  },
  "migrated.onboarding_047": { tr: "Kas Artışı", en: "Build muscle" },
  "migrated.onboarding_048": { tr: "Yağ Kaybı", en: "Lose fat" },
  "migrated.onboarding_049": { tr: "Koruma", en: "Maintain" },
  "migrated.onboarding_050": { tr: "Örn. 80", en: "e.g. 80" },
  "migrated.onboarding_051": { tr: "Hedef Kilon", en: "Target weight" },
  "migrated.onboarding_052": {
    tr: "Hedef Kilon (İsteğe bağlı)",
    en: "Target weight (optional)",
  },
  "migrated.onboarding_053": {
    tr: "Hedef kilo mevcut kilondan düşük olmalı.",
    en: "Your target weight must be lower than your current weight.",
  },
  "migrated.onboarding_054": {
    tr: "Kas gelişiminde güç artışı ve antrenman düzeni, tartı kilosundan daha anlamlıdır.",
    en: "For muscle gain, strength progress and training consistency matter more than scale weight alone.",
  },
  "migrated.onboarding_055": { tr: "Kaydet", en: "Save" },
  "migrated.onboarding_056": { tr: "Bitir", en: "Finish" },
  "migrated.onboarding_057": { tr: "Devam", en: "Continue" },
  "migrated.onboarding_058": { tr: "Geri", en: "Back" },
  "migrated.onboarding_059": { tr: "Metrik", en: "Metric" },
  "migrated.onboarding_060": { tr: "Imperial", en: "Imperial" },
  "migrated.fitness_001": {
    tr: "Sana uygun ücretsiz programlar",
    en: "Free programs for you",
  },
  "migrated.fitness_002": { tr: "Premium programlar", en: "Premium programs" },
  "migrated.fitness_003": {
    tr: "Premium programlar kilitli",
    en: "Premium programs are locked",
  },
  "migrated.fitness_004": {
    tr: "Premium detaylarını gör",
    en: "View premium details",
  },
  "migrated.fitness_005": { tr: "gün", en: "days" },
  "migrated.fitness_006": { tr: "premium kilitli", en: "premium locked" },
  "migrated.fitness_007": { tr: "açık", en: "open" },
  "migrated.fitness_008": { tr: "Premium", en: "Premium" },
  "migrated.fitness_009": { tr: "Açık", en: "Open" },
  "program_detail.add_favorite_a11y": {
    tr: "Favorilere ekle",
    en: "Add to favorites",
  },
  "program_detail.remove_favorite_a11y": {
    tr: "Favorilerden çıkar",
    en: "Remove from favorites",
  },
  "fitness.favorites_title": { tr: "Programların", en: "Your Programs" },
  "fitness.favorites_premium_badge": { tr: "Premium", en: "Premium" },
  "fitness.explore_programs": { tr: "Programları keşfet", en: "Explore programs" },
  "migrated.fitness_010": { tr: "günlük akış", en: "day flow" },
  "rewarded_ads.limit_title": {
    tr: "Bugünün ücretsiz analiz hakkını kullandın.",
    en: "You have used your free analysis for today.",
  },
  "rewarded_ads.limit_body": {
    tr: "Premium ile daha yüksek limitler, daha derin AI içgörüleri ve reklamsız deneyim açılır.",
    en: "Upgrade to Premium for higher limits, deeper AI insights, and an ad-free experience.",
  },
  "rewarded_ads.daily_cap_body": {
    tr: "Bugünkü bonus analiz ödüllerini kullandın. Devam etmek için Premiuma geç.",
    en: "You have used the bonus analysis rewards for today. Upgrade to Premium to continue.",
  },
  "rewarded_ads.unavailable_body": {
    tr: "Reklamlar şu an kullanılamıyor. Daha sonra tekrar dene ya da Premiuma geç.",
    en: "Ads are not available right now. Please try again later or upgrade to Premium.",
  },
  "rewarded_ads.upgrade_cta": { tr: "Premiuma ge?", en: "Upgrade to Premium" },
  "rewarded_ads.watch_cta": {
    tr: "Reklam izle ve +1 analiz al",
    en: "Watch ad for +1 analysis",
  },
  "rewarded_ads.success": {
    tr: "Bonus analiz açıldı.",
    en: "Bonus analysis unlocked.",
  },
  "rewarded_ads.failed": {
    tr: "Reklam tamamlanmad?. Kredi eklenmedi.",
    en: "Ad was not completed. No credit was added.",
  },
  "rewarded_ads.unavailable_feedback": {
    tr: "Reklam şimdi hazır değil. Biraz sonra tekrar deneyebilirsin.",
    en: "Ads are not available right now. Please try again later.",
  },
  "rewarded_ads.mock_badge": {
    tr: "Geliştirme mock ödülü",
    en: "Development mock reward",
  },
  "premium.reliability_title": {
    tr: "Satın alma güveni",
    en: "Purchase confidence",
  },
  "premium.reliability_active_title": {
    tr: "Premium bu cihazda aktif görünüyor",
    en: "Premium appears active on this device",
  },
  "premium.reliability_active_body": {
    tr: "Abonelik doğrulandığında kilitli akışlar açık kalır.",
    en: "Locked flows stay open when the subscription is verified.",
  },
  "premium.reliability_safe_title": {
    tr: "Premium durumu yanlışlıkla kaybolmaz",
    en: "Your premium state will not disappear by accident",
  },
  "premium.reliability_safe_body": {
    tr: "?ptal veya hata durumunda mevcut premium durumun korunur.",
    en: "If something is cancelled or fails, your current premium state is preserved.",
  },
  "premium.reliability_restore_title": {
    tr: "Yeniden kurulumdan sonra geri yükleyebilirsin",
    en: "You can restore after reinstall",
  },
  "premium.reliability_restore_body": {
    tr: "Aynı App Store veya Google Play hesabıyla satın almaları geri yüklemen yeterli.",
    en: "Restoring purchases with the same App Store or Google Play account is enough.",
  },
  "premium.reliability_network_title": {
    tr: "Bağlantı kopsa da mevcut durum korunur",
    en: "Your current state stays safe even if the connection drops",
  },
  "premium.reliability_network_body": {
    tr: "Bağlantı hatalarında uygulama premium durumunu değiştirmez, sadece tekrar denemeni ister.",
    en: "On connection failures, the app does not change your premium state. It simply asks you to try again.",
  },
  "premium.reliability_checking": {
    tr: "Premium durumu kontrol ediliyor...",
    en: "Checking premium status...",
  },
  "premium.reliability_footnote": {
    tr: "Bu ekran her açıldığında mağaza bilgisi yeniden kontrol edilir.",
    en: "Store information is checked again whenever this screen opens.",
  },
  "premium.store_opening": { tr: "Mağaza açılıyor...", en: "Opening store..." },
  "premium.restore_loading": {
    tr: "Satın almalar kontrol ediliyor...",
    en: "Checking purchases...",
  },
  "premium.privacy_link_label": {
    tr: "Gizlilik politikas?",
    en: "Privacy policy",
  },
  "premium.privacy_link_text": {
    tr: "Gizlilik Politikas?",
    en: "Privacy Policy",
  },
  "premium.terms_link_label": { tr: "Kullanım şartları", en: "Terms of use" },
  "premium.terms_link_text": { tr: "Kullanım şartları", en: "Terms of Use" },
  "privacy.title": { tr: "Gizlilik ve güvenlik", en: "Privacy & security" },
  "privacy.hero_title": {
    tr: "Veriler bu cihazda korunuyor",
    en: "Your data is protected on this device",
  },
  "privacy.hero_body": {
    tr: "Profil, öğün, su, antrenman ve bildirim tercihleri yerel olarak saklanıyor. Her ana veri alanında güncel kayıtla birlikte bir önceki sağlam sürüm korunuyor.",
    en: "Profile, meal, water, workout, and notification preferences are stored locally. Each core data area keeps the current record and the previous healthy version.",
  },
  "privacy.healthy_areas": { tr: "Sağlam alan", en: "Healthy areas" },
  "privacy.auto_recovery": { tr: "Otomatik kurtarma", en: "Auto recovery" },
  "privacy.data_health": { tr: "Veri sağlığı", en: "Data health" },
  "privacy.rescan_label": {
    tr: "Veri sağlığıni yeniden tara",
    en: "Scan data health again",
  },
  "privacy.scan": { tr: "Tara", en: "Scan" },
  "privacy.no_data": { tr: "Henüz veri yok", en: "No data yet" },
  "privacy.primary_available": {
    tr: "Ana kayıt var",
    en: "Primary record available",
  },
  "privacy.primary_missing": {
    tr: "Ana kayit yok",
    en: "Primary record missing",
  },
  "privacy.backup_ready": {
    tr: "Onceki surum hazir",
    en: "Previous version ready",
  },
  "privacy.backup_missing": {
    tr: "Onceki surum yok",
    en: "No previous version",
  },
  "privacy.empty": { tr: "Bos", en: "Empty" },
  "privacy.healthy": { tr: "Sağlam", en: "Healthy" },
  "privacy.check": { tr: "Dikkat", en: "Check" },
  "privacy.contact_support": {
    tr: "Destek ile iletişime geç",
    en: "Contact support",
  },
  "privacy.support": { tr: "Destek", en: "Support" },
  "ai_program.detail_continue_cta": {
    tr: "Antrenmanı başlat",
    en: "Start workout",
  },
  "ai_program.detail_recommended_day": {
    tr: "Önerilen gün",
    en: "Recommended day",
  },
  "ai_program.detail_day_available_a11y": {
    tr: "Bu gün açık",
    en: "This day is available",
  },
  "ai_program.detail_day_recommended_a11y": {
    tr: "Önerilen sıradaki antrenman",
    en: "Recommended next workout",
  },
  "my_workouts.ai_regenerate": { tr: "Yeniden programla", en: "Regenerate" },
  "my_workouts.ai_regenerate_confirm": {
    tr: "Yeni program oluştur",
    en: "Create new program",
  },
  "my_workouts.ai_regenerate_body": {
    tr: "Mevcut plan korunur. Aynı profil ve tercihlerinle yeni bir AI program ayrı kayıt olarak hazırlanır.",
    en: "Your current plan stays saved. A new AI program will be created separately using your current profile and preferences.",
  },
  "my_plans.stat_progress": { tr: "ilerleme", en: "progress" },
  "my_plans.next_day_label": { tr: "Sıradaki gün", en: "Next day" },
  "my_plans.last_activity_label": { tr: "Son aktivite", en: "Last activity" },
  "my_plans.completed_all_days": {
    tr: "Tüm günler tamamlandı",
    en: "All days completed",
  },
} as const;

export type MessageKey = keyof typeof messages;

export function getLocalizedMessage(key: string): LocalizedMessage | undefined {
  return (messages as Record<string, LocalizedMessage>)[key];
}
