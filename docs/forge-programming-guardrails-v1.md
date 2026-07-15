# FORGE Programming Guardrails v1

Generated: 2026-07-15T00:00:00.000Z

## Purpose

These are proposed configurable guardrails for future validators and adaptation engines. They are not production code in Phase 1.

## High-Confidence Product Rules

- Strength sessions must preserve a clear main-lift or primary-strength role before accessories.
- A template adaptation must not make the original template unrecognizable.
- Injury and limitation constraints override physique-focus adjustments and user style preference.
- Unknown or malformed exercise prescriptions must be rejected or routed to a safe fallback.
- Beginner plans should avoid excessive day counts, excessive axial fatigue and advanced intensity techniques.
- Dataset frequency is never treated as proof of program quality.
- Rest, RPE and RIR recommendations must be labeled evidence-informed when not present in CSV data.

## Context-Dependent Guidelines

- Hypertrophy volume should start conservatively and increase only when recovery and adherence support it.
- Frequency can distribute volume and skill practice, but it is not a universal rule independent of volume, recovery and schedule.
- Strength rep ranges usually bias lower reps for main lifts, while accessories can use moderate reps.
- Hypertrophy can use broad rep ranges when proximity to failure, execution and progression are appropriate.
- Deloads should be triggered by block design, fatigue accumulation, performance trend or user feedback rather than added automatically to every plan.

## Proposed Starting Ranges

| Goal |Experience |Direct sets/week |Sessions/muscle/week |Sets/session |Confidence |
| --- |--- |--- |--- |--- |--- |
| strength |beginner |4-10 by main pattern |2-3 skill exposures |1-4 hard main-lift sets |medium |
| strength |intermediate |6-14 by main pattern |2-4 exposures |2-6 work sets |medium |
| hypertrophy |beginner |6-10 per priority muscle |1-2 |2-6 direct sets/muscle |medium |
| hypertrophy |intermediate |8-16 per priority muscle |2-3 |3-8 direct sets/muscle |medium |
| powerbuilding |intermediate |strength work plus 6-12 accessory sets |2-3 |controlled accessory volume |medium |
| general_fitness |beginner |balanced movement exposure |2-3 full-body contacts |moderate |medium |

## Redundancy Detectors To Implement Later

- Excessive pressing redundancy: multiple similar horizontal presses in one session without a distinct role.
- Excessive rowing redundancy: repeated row variants with the same torso angle and grip pattern.
- Excessive vertical pulling: several pulldown/pull-up variants without need.
- Excessive knee-dominant work: squat, leg press, lunge and extension volume stacked beyond recovery.
- Excessive hinge fatigue: deadlift/RDL/good morning/hip hinge density without lower-back control.
- Excessive elbow-flexion or extension isolation in beginner or short-duration sessions.
- Missing antagonist work when a plan repeatedly emphasizes one side of a joint action.
- Excessive session length when exercise count and estimated rest cannot fit the requested duration.
- Too much failure training if RPE/RIR data later indicates repeated failure across compounds.

## Physique Focus Boundaries

- Upper chest focus: prefer incline substitution/reordering or small added exposure, not several new presses.
- Lats focus: prefer vertical pull and shoulder-extension-biased work; avoid row spam.
- Upper back/rear delt focus: prefer retraction, face-pull/rear-delt slots and balanced pressing.
- Side delt focus: use low-fatigue lateral raise exposure; do not count pressing as enough direct side-delt work.
- Arms focus: add limited isolation after compound work and respect elbow recovery.
- Quads/hamstrings/glutes focus: add or reorder one targeted pattern while controlling axial and knee/hip fatigue.
- Calves/core focus: small frequent exposure is safer than bloating one session.

## Refuse Or Fallback Conditions

- No template matches mandatory equipment and limitation constraints.
- Required main lift is contraindicated by a limitation and no safe substitute exists.
- Requested session duration cannot safely contain the selected template structure.
- CSV-derived record is structurally unreliable and no curated FORGE template exists yet.
