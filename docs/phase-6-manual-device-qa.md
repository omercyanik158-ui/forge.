# Phase 6 Manual Device QA Checklist

## Devices And Viewports

- iPhone simulator: builder, review, activation modal, session, progress.
- Android emulator: builder, review, activation modal, session, progress.
- Small phone viewport: no clipped primary CTAs.
- Large phone viewport: cards remain centered and readable.
- Light mode: contrast and surfaces readable.
- Dark mode: contrast and surfaces readable.

## Fresh Install

- Fitness shows one clear create-program CTA when no active program exists.
- Program builder starts without requiring physique analysis.
- Save-only does not mark a program active.
- Activating a program makes it appear on Fitness.

## Existing Active Program

- Creating a new program does not silently replace active program.
- Activation modal shows current and new program context.
- Save-only preserves current active program.
- Replace action changes active program.

## Physique Adaptation

- Analysis focus areas are optional.
- Low-confidence areas are not automatically applied.
- Maximum two focus areas are applied.
- Adaptation copy avoids defect/medical language.

## Workout Session

- Progression preview appears for AI program exercises.
- Completed workout saves log before progression processing.
- Completion summary shows meaningful next-target changes.
- Duplicate save/complete does not progress twice.
- App restart after completion keeps persisted decisions.

## Progress

- Workout Progress shows persisted decisions.
- Empty state appears when no progression decisions exist.
- Charts are not shown as fabricated trends when data is insufficient.

## Navigation

- Back from review keeps preferences.
- Back from activation modal does not activate.
- `/ai-program-builder` does not route into the old local generator.

## Keyboard And Safe Area

- Numeric set inputs remain visible with keyboard open.
- Bottom action buttons are not hidden behind tab/home indicators.
- Primary touch targets remain reachable.
