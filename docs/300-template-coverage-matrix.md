# FORGE 300 Template Coverage Matrix

Date: 2026-07-15

## Modality Coverage

| Modality | Templates |
| --- | ---: |
| Strength | 45 |
| Hypertrophy | 90 |
| Powerbuilding | 40 |
| General fitness | 45 |
| Home | 30 |
| Yoga | 25 |
| Pilates | 25 |

## User Goal Mapping

| Builder Goal | Runtime Goal | Runtime Modality |
| --- | --- | --- |
| `strength` | `strength` | `strength` |
| `build_muscle` | `hypertrophy` | `hypertrophy` |
| `recomposition` | `powerbuilding` | `powerbuilding` |
| `lose_fat` | `general_fitness` | `general_fitness` |
| `general_fitness` | `general_fitness` | `general_fitness` |
| `athletic_performance` | `general_fitness` | `general_fitness` |
| `return_to_training` | `general_fitness` | `general_fitness` |
| `home_workout` | `general_fitness` | `home` |
| `yoga` | `general_fitness` | `yoga` |
| `pilates` | `general_fitness` | `pilates` |

## Equipment Notes

- Full gym requests may use common gym accessories such as rack, bench, pull-up bar, trap bar, treadmill, stationary bike, bands, and ab wheel.
- Home requests do not infer bar, rings, bands, bench, or pull-up equipment unless the user selected it.
- `pullup_bar` is normalized as compatible with curated `bar_or_rings` requirements.
- Strength main-lift templates requiring barbell are not selected when the request lacks barbell equipment.

## Runtime Gating

- Default runtime remains the stable 26-template library.
- The 300-template library is used only when `EXPO_PUBLIC_WORKOUT_LIBRARY_VERSION=300`.
- Missing or invalid values fall back to stable.

