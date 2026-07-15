# Phase 7 Rollout Plan

## Recommended Rollout

1. Keep `EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE=false` for the next internal build if manual QA is still pending.
2. Run manual iOS and Android smoke tests with the flag enabled.
3. Enable `EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE=true` for an internal QA channel.
4. Enable `EXPO_PUBLIC_PROGRESSION_WRITES=true` after workout completion and progression history are verified.
5. Enable `EXPO_PUBLIC_PHYSIQUE_ADAPTATION_WRITES=true` only after physique adaptation copy and persistence are accepted.
6. Monitor data health reports, workout completion, active program restoration, and cloud sync.

## Rollout Principle

Selection can ship before adaptation writes. Progression writes should only be enabled once workout-session persistence is verified on real devices.
