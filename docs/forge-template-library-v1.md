# FORGE Template Library v1

Generated: 2026-07-15T00:00:00.000Z

## Scope

This is the first production-ready internal FORGE workout template library. It is original to FORGE, derived from Phase 1 rules, and intentionally avoids branded or copied program structures. It does not implement user selection, scoring, physique adaptation or runtime instantiation.

## Catalog

| Template | Goal | Level | Days | Split | Progression | Intended user |
| --- | --- | --- | --- | --- | --- | --- |
| Temel Güç 3 Gün | strength | beginner | 3 | full_body | linear | New lifter needing repeatable main-lift practice |
| Dengeli Güç Başlangıç 4 Gün | strength | beginner | 4 | upper_lower | linear | Beginner with four gym days and enough recovery |
| Güç Becerisi 3 Gün | strength | intermediate | 3 | full_body | top_set_backoff | Intermediate user needing full-body strength exposure |
| Güç Upper/Lower 4 Gün | strength | intermediate | 4 | upper_lower | top_set_backoff | Intermediate user who can separate upper/lower stress |
| Ana Lift Split 4 Gün | strength | intermediate | 4 | custom | top_set_backoff | User who wants squat/bench/deadlift/press day roles |
| Güç Odaklı 5 Gün | strength | intermediate | 5 | custom | top_set_backoff | Higher-frequency intermediate strength user |
| İleri Güç 4 Gün | strength | advanced | 4 | upper_lower | top_set_backoff | Advanced user needing restrained weekly stress |
| İleri Ana Lift 5 Gün | strength | advanced | 5 | custom | top_set_backoff | Advanced user with strong recovery and technique |
| Kas Gelişimi Başlangıç 3 Gün | hypertrophy | beginner | 3 | full_body | double_progression | Beginner hypertrophy user needing simple coverage |
| Kas Gelişimi Upper/Lower Başlangıç | hypertrophy | beginner | 4 | upper_lower | double_progression | Beginner with four days and moderate volume tolerance |
| Dengeli Hipertrofi 3 Gün | hypertrophy | intermediate | 3 | full_body | double_progression | Intermediate user with limited weekly availability |
| Kas Gelişimi Upper/Lower | hypertrophy | intermediate | 4 | upper_lower | double_progression | Standard balanced hypertrophy user |
| Yoğun Hipertrofi 5 Gün | hypertrophy | intermediate | 5 | custom | double_progression | User wanting more weekly muscle contacts |
| Bölgesel Hipertrofi 5 Gün | hypertrophy | intermediate | 5 | body_part | double_progression | User who wants stronger body-part emphasis |
| PPL Hipertrofi 6 Gün | hypertrophy | intermediate | 6 | push_pull_legs | double_progression | High-frequency hypertrophy user |
| İleri Upper/Lower Hipertrofi | hypertrophy | advanced | 4 | upper_lower | double_progression | Advanced user who prefers fewer but denser sessions |
| İleri Hipertrofi 5 Gün | hypertrophy | advanced | 5 | custom | double_progression | Advanced hypertrophy user with good recovery |
| İleri PPL Hipertrofi 6 Gün | hypertrophy | advanced | 6 | push_pull_legs | double_progression | Advanced high-frequency hypertrophy user |
| Güç ve Kas 4 Gün | powerbuilding | intermediate | 4 | powerbuilding | custom | User balancing main lift progress and hypertrophy |
| Güç ve Kas 5 Gün | powerbuilding | intermediate | 5 | powerbuilding | custom | User needing more accessory distribution |
| İleri Güç ve Kas 4 Gün | powerbuilding | advanced | 4 | powerbuilding | custom | Advanced user needing compact powerbuilding exposure |
| İleri Güç ve Kas 5 Gün | powerbuilding | advanced | 5 | powerbuilding | custom | Advanced user with strong recovery |
| Genel Fitness Gym 3 Gün | general_fitness | beginner | 3 | full_body | rep_goal | Beginner gym user needing low complexity |
| Dumbbell Başlangıç 3 Gün | general_fitness | beginner | 3 | full_body | rep_goal | Beginner with dumbbells and bench |
| Evde Başlangıç 3 Gün | general_fitness | beginner | 3 | full_body | rep_goal | Home user with bodyweight, bands and pull-up option |
| Genel Fitness Gym 4 Gün | general_fitness | beginner | 4 | full_body | rep_goal | Beginner gym user wanting four shorter exposures |
| Genel Fitness Dengeli 3 Gün | general_fitness | intermediate | 3 | full_body | rep_goal | Intermediate general fitness user |
| Genel Fitness Dengeli 4 Gün | general_fitness | intermediate | 4 | full_body | rep_goal | Intermediate user wanting four balanced gym days |

## Counts

| Dimension | Counts |
| --- | --- |
| Goal | strength 8, hypertrophy 10, powerbuilding 4, general_fitness 6 |
| Level | beginner 8, intermediate 13, advanced 7 |
| Days/week | 3-day 8, 4-day 11, 5-day 7, 6-day 2 |

## Adaptation Limitations

- Main lift changes are disabled by default.
- Main lift order must be preserved.
- Accessory volume can change only inside configured weekly limits.
- Physique focus is limited to two focus muscles by default.
- Session time adaptation is capped at 15 percent unless a future engine explicitly overrides it.
- Yoga and Pilates templates are excluded because Phase 1 marked them as requiring separate domain sources.
