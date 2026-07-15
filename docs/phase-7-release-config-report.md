# Phase 7 Release Config Report

## Checker

Command:

```bash
npm run check:release-config
```

## Development Result

The current local development profile passes.

## Production Gates

The checker blocks production when:

- `EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE` is not exactly `true`.
- `EXPO_PUBLIC_PROGRESSION_WRITES` is not exactly `true`.
- Required app identity/version/build fields are missing.
- EAS production profile is missing.

## Physique Adaptation Writes

`EXPO_PUBLIC_PHYSIQUE_ADAPTATION_WRITES` is separate from the main template engine flag. This allows rollout of template selection and progression without forcing physique adaptation persistence.
