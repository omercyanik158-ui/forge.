# Phase 7 Rollback Plan

## Fast Rollback

Set these environment values and publish a new build/update:

```bash
EXPO_PUBLIC_TEMPLATE_PROGRAM_ENGINE=false
EXPO_PUBLIC_PROGRESSION_WRITES=false
EXPO_PUBLIC_PHYSIQUE_ADAPTATION_WRITES=false
```

## Expected Behavior After Rollback

- No new template-based program creation is allowed through the feature-flagged path.
- Existing saved programs remain readable.
- Progression decision writes stop.
- Physique adaptation writes stop.

## Data Safety

Existing saved programs, workout logs, active program records, and progression snapshots are not deleted by rollback.
