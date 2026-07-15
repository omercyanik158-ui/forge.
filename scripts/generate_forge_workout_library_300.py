#!/usr/bin/env python3
import csv
import json
import re
from pathlib import Path

ROOT = Path.cwd()
PACK = ROOT / "data" / "forge_workout_library_300"
GENERATED = ROOT / "src" / "workout-programming" / "generated"
DATA_DIR = ROOT / "src" / "workout-programming" / "data"
DOCS = ROOT / "docs"
APP_CATALOG = ROOT / "src" / "data" / "trainingCatalog.generated.ts"

SUPPORTED_PRESCRIPTIONS = {"reps", "duration", "breaths", "rounds"}
EXPECTED_FILES = [
    "forge_program_templates_300.csv",
    "forge_template_exercises_300.csv",
    "forge_exercise_catalog_300.csv",
    "forge_progression_rules_300.csv",
    "forge_adaptation_rules.csv",
    "forge_exercise_substitutions.csv",
    "forge_research_sources.csv",
    "library_summary.csv",
    "manifest.json",
    "INTEGRATION_NOTES.md",
]

ALIAS_MAP = {
    "ab_wheel": "csv-ab-wheel",
    "assisted_pull_up": "csv-pull-up-assisted",
    "back_squat": "csv-squat-barbell",
    "barbell_curl": "csv-bicep-curl-barbell",
    "bench_press": "csv-bench-press-barbell",
    "bulgarian_split_squat": "csv-bulgarian-split-squat-dumbbell",
    "cable_curl": "csv-bicep-curl-cable",
    "cable_fly": "csv-chest-fly-cable",
    "cable_lateral_raise": "csv-lateral-raise-cable",
    "chest_supported_row": "csv-chest-supported-row-dumbbell",
    "close_grip_bench": "csv-bench-press-close-grip",
    "conventional_deadlift": "csv-deadlift-barbell",
    "dumbbell_bench_press": "csv-bench-press-dumbbell",
    "dumbbell_rdl": "csv-romanian-deadlift-dumbbell",
    "dumbbell_shoulder_press": "csv-shoulder-press-dumbbell",
    "front_squat": "csv-front-squat-barbell",
    "hip_thrust": "csv-hip-thrust-barbell",
    "incline_barbell_press": "csv-incline-bench-press-barbell",
    "incline_dumbbell_curl": "csv-incline-curl-dumbbell",
    "incline_dumbbell_press": "csv-incline-bench-press-dumbbell",
    "lateral_raise": "csv-lateral-raise-dumbbell",
    "low_to_high_cable_fly": "csv-incline-chest-fly",
    "machine_chest_press": "csv-chest-press-machine",
    "machine_shoulder_press": "csv-shoulder-press-machine",
    "neutral_grip_pulldown": "csv-neutral-grip-pulldowns",
    "one_arm_dumbbell_row": "csv-single-arm-row-dumbbell",
    "overhead_press": "csv-overhead-press-barbell",
    "overhead_triceps_extension": "csv-overhead-tricep-extension-cable",
    "paused_bench_press": "csv-bench-press-paused",
    "pull_up": "csv-pull-up-bodyweight",
    "reverse_lunge": "csv-reverse-lunge-dumbbell",
    "romanian_deadlift": "csv-romanian-deadlift-barbell",
    "seated_cable_row": "csv-seated-row-cable",
    "split_squat": "csv-lunge-bodyweight",
    "straight_arm_pulldown": "csv-standing-pullover-cable",
    "triceps_pushdown": "csv-tricep-pushdown-cable",
    "weighted_dip": "csv-dip-weighted",
}


def read_csv(name):
    with (PACK / name).open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def ts(value):
    return json.dumps(value, ensure_ascii=False, indent=2)


def norm(value):
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def split_list(value):
    return [item.strip() for item in (value or "").split(",") if item.strip()]


def parse_int(value, default=None):
    if value is None or value == "":
        return default
    return int(value)


def parse_float(value, default=None):
    if value is None or value == "":
        return default
    return float(value)


def parse_bool(value):
    return str(value).strip().lower() == "true"


def omit_none(value):
    return {key: item for key, item in value.items() if item is not None}


def app_exercises():
    text = APP_CATALOG.read_text()
    return {
        norm(match.group(2)): {"id": match.group(1), "name": match.group(2)}
        for match in re.finditer(r'"id": "([^"]+)",\n    "name": "([^"]+)"', text)
    }


def display_muscle(muscle):
    labels = {
        "chest": "Göğüs",
        "upper_chest": "Göğüs",
        "lats": "Sırt",
        "upper_back": "Sırt",
        "back": "Sırt",
        "front_delts": "Omuz",
        "side_delts": "Omuz",
        "rear_delts": "Omuz",
        "shoulders": "Omuz",
        "quads": "Bacak",
        "hamstrings": "Bacak",
        "glutes": "Bacak",
        "calves": "Bacak",
        "biceps": "Kol",
        "triceps": "Kol",
        "forearms": "Kol",
        "core": "Karın",
        "cardio": "Bacak",
    }
    return labels.get(muscle, "Karın")


def app_muscle_group(muscles):
    groups = [display_muscle(muscle) for muscle in muscles]
    return groups[0] if groups else "Mobilite"


def validate_manifest(manifest, templates, exercises, catalog, progression_rules, errors):
    for name in EXPECTED_FILES:
        if not (PACK / name).exists():
            errors.append(f"Missing package file: {name}")
    if manifest.get("template_count") != len(templates):
        errors.append(f"Template count mismatch: {len(templates)} != {manifest.get('template_count')}")
    if manifest.get("template_exercise_rows") != len(exercises):
        errors.append(f"Template exercise row count mismatch: {len(exercises)} != {manifest.get('template_exercise_rows')}")
    if manifest.get("exercise_catalog_count") != len(catalog):
        errors.append(f"Exercise catalog count mismatch: {len(catalog)} != {manifest.get('exercise_catalog_count')}")
    if manifest.get("progression_rule_count") != len(progression_rules):
        errors.append(f"Progression rule count mismatch: {len(progression_rules)} != {manifest.get('progression_rule_count')}")


def build_mapping(exercise_catalog, used_ids):
    app_by_name = app_exercises()
    mapping = {}
    reviewed = []
    mapping_notes = []
    for row in exercise_catalog:
        canonical_id = row["exercise_id"]
        exact = app_by_name.get(norm(row["exercise_name"]))
        if exact:
            mapping[canonical_id] = exact["id"]
            mapping_notes.append({"canonical": canonical_id, "app": exact["id"], "type": "exact_name"})
            continue
        if canonical_id in ALIAS_MAP:
            mapping[canonical_id] = ALIAS_MAP[canonical_id]
            mapping_notes.append({"canonical": canonical_id, "app": ALIAS_MAP[canonical_id], "type": "reviewed_alias"})
            continue
        if canonical_id in used_ids:
            app_id = f"forge-{canonical_id.replace('_', '-')}"
            muscles = split_list(row["primary_muscles"])
            mapping[canonical_id] = app_id
            reviewed.append({
                "id": app_id,
                "name": row["exercise_name"],
                "displayName": row["exercise_name"],
                "muscleGroup": app_muscle_group(muscles),
                "targetMuscles": sorted(set(display_muscle(muscle) for muscle in muscles)) or ["Mobilite"],
                "secondaryMuscles": [],
                "equipment": row["equipment"] or "bodyweight",
                "difficulty": "Orta",
                "imageUrls": [],
                "defaultSets": 3,
                "defaultReps": 10,
            })
            mapping_notes.append({"canonical": canonical_id, "app": app_id, "type": "generated_reviewed_entry"})
    return mapping, reviewed, mapping_notes


def main():
    templates = read_csv("forge_program_templates_300.csv")
    exercises = read_csv("forge_template_exercises_300.csv")
    exercise_catalog = read_csv("forge_exercise_catalog_300.csv")
    progression_rules = read_csv("forge_progression_rules_300.csv")
    adaptation_rules = read_csv("forge_adaptation_rules.csv")
    substitutions = read_csv("forge_exercise_substitutions.csv")
    research_sources = read_csv("forge_research_sources.csv")
    manifest = json.loads((PACK / "manifest.json").read_text())
    errors = []
    warnings = []
    validate_manifest(manifest, templates, exercises, exercise_catalog, progression_rules, errors)

    template_ids = [row["template_id"] for row in templates]
    duplicate_template_ids = sorted({item for item in template_ids if template_ids.count(item) > 1})
    if duplicate_template_ids:
        errors.append(f"Duplicate template IDs: {duplicate_template_ids[:20]}")

    catalog_ids = {row["exercise_id"] for row in exercise_catalog}
    progression_ids = {row["progression_rule_id"] for row in progression_rules}
    used_ids = {row["exercise_id"] for row in exercises}
    mapping, reviewed, mapping_notes = build_mapping(exercise_catalog, used_ids)

    for row in exercise_catalog:
      if row["exercise_id"] in used_ids and row["exercise_id"] not in mapping:
          errors.append(f"Used canonical exercise without app mapping: {row['exercise_id']}")

    by_template = {}
    for row in exercises:
        by_template.setdefault(row["template_id"], []).append(row)
        if row["template_id"] not in set(template_ids):
            errors.append(f"Exercise references unknown template: {row['template_id']}")
        if row["exercise_id"] not in catalog_ids:
            errors.append(f"Exercise not in catalog: {row['template_id']} -> {row['exercise_id']}")
        if not row["progression_rule_id"]:
            errors.append(f"Missing exercise progression rule: {row['template_id']} -> {row['exercise_id']}")
        if row["progression_rule_id"] and row["progression_rule_id"] not in progression_ids:
            errors.append(f"Unknown exercise progression rule: {row['template_id']} -> {row['exercise_id']} -> {row['progression_rule_id']}")
        if row["prescription_type"] not in SUPPORTED_PRESCRIPTIONS:
            errors.append(f"Unsupported prescription type: {row['template_id']} -> {row['exercise_id']} -> {row['prescription_type']}")
        if row["prescription_type"] == "duration" and not row["duration_seconds_max"]:
            errors.append(f"Duration prescription missing seconds: {row['template_id']} -> {row['exercise_id']}")
        if row["prescription_type"] == "breaths" and not row["breaths_max"]:
            errors.append(f"Breath prescription missing breaths: {row['template_id']} -> {row['exercise_id']}")
        if row["prescription_type"] == "rounds" and int(row["sets"]) < 1:
            errors.append(f"Rounds prescription missing sets/rounds: {row['template_id']} -> {row['exercise_id']}")

    for template in templates:
        if template["status"] != "active":
            errors.append(f"Non-active template in package: {template['template_id']}")
        if template["progression_rule_id"] not in progression_ids:
            errors.append(f"Unknown template progression rule: {template['template_id']}")
        if not template.get("modality"):
            errors.append(f"Missing modality: {template['template_id']}")
        if not template.get("library_tier"):
            errors.append(f"Missing library tier: {template['template_id']}")
        rows = by_template.get(template["template_id"], [])
        expected_days = list(range(1, int(template["days_per_week"]) + 1))
        actual_days = sorted({int(row["day_index"]) for row in rows})
        if actual_days != expected_days:
            errors.append(f"Day index mismatch: {template['template_id']} {actual_days} != {expected_days}")
        for day in actual_days:
            day_rows = [row for row in rows if int(row["day_index"]) == day]
            orders = sorted(int(row["exercise_order"]) for row in day_rows)
            if orders != list(range(1, len(day_rows) + 1)):
                errors.append(f"Exercise order mismatch: {template['template_id']} day {day}")

    for sub in substitutions:
        if sub["source_exercise_id"] not in catalog_ids:
            errors.append(f"Substitution source missing: {sub['source_exercise_id']}")
        if sub["alternative_exercise_id"] not in catalog_ids:
            errors.append(f"Substitution alternative missing: {sub['alternative_exercise_id']}")

    if errors:
        raise SystemExit("\n".join(errors[:80]))

    def template_object(template):
        rows = by_template[template["template_id"]]
        days = []
        for day_index in sorted({int(row["day_index"]) for row in rows}):
            day_rows = sorted([row for row in rows if int(row["day_index"]) == day_index], key=lambda item: int(item["exercise_order"]))
            days.append({
                "dayIndex": day_index,
                "name": day_rows[0]["day_name"],
                "focus": split_list(day_rows[0]["day_focus"]),
                "exercises": [
                    omit_none({
                        "canonicalExerciseId": row["exercise_id"],
                        "exerciseId": mapping[row["exercise_id"]],
                        "exerciseName": row["exercise_name"],
                        "order": int(row["exercise_order"]),
                        "movementPattern": row["movement_pattern"],
                        "primaryMuscles": split_list(row["primary_muscles"]),
                        "equipment": split_list(row["equipment"]),
                        "role": row["role"],
                        "sets": int(row["sets"]),
                        "repsMin": int(row["reps_min"]),
                        "repsMax": int(row["reps_max"]),
                        "targetRir": parse_float(row["target_rir"], 0),
                        "restSeconds": int(row["rest_seconds"]),
                        "progressionRuleId": row["progression_rule_id"],
                        "prescriptionType": row["prescription_type"],
                        "durationSecondsMin": parse_int(row["duration_seconds_min"]),
                        "durationSecondsMax": parse_int(row["duration_seconds_max"]),
                        "breathsMin": parse_int(row["breaths_min"]),
                        "breathsMax": parse_int(row["breaths_max"]),
                        "required": parse_bool(row["required"]),
                        "notes": row["notes"],
                    })
                    for row in day_rows
                ],
            })
        return {
            "templateId": template["template_id"],
            "version": int(template["version"]),
            "status": template["status"],
            "nameTr": template["name_tr"],
            "goal": template["goal"],
            "modality": template["modality"],
            "libraryTier": template["library_tier"],
            "level": template["level"],
            "split": template["split"],
            "daysPerWeek": int(template["days_per_week"]),
            "durationWeeks": int(template["duration_weeks"]),
            "sessionMinutes": {
                "min": int(template["session_minutes_min"]),
                "target": int(template["session_minutes_target"]),
                "max": int(template["session_minutes_max"]),
            },
            "equipmentProfile": template["equipment_profile"],
            "progressionRuleId": template["progression_rule_id"],
            "compatibleFocusMuscles": split_list(template["compatible_focus_muscles"]),
            "maxExtraSetsPerFocusMuscleWeek": int(template["max_extra_sets_per_focus_muscle_week"]),
            "maxFocusMuscles": int(template["max_focus_muscles"]),
            "descriptionTr": template["description_tr"],
            "sourceBasis": template["source_basis"],
            "workouts": days,
        }

    generated_templates = [template_object(template) for template in templates]
    generated_progressions = [
        {
            "progressionRuleId": row["progression_rule_id"],
            "nameTr": row["name_tr"],
            "appliesTo": split_list(row["applies_to"]),
            "loadOrRepLogic": row["load_or_rep_logic"],
            "failureLogic": row["failure_logic"],
            "deloadLogic": row["deload_logic"],
            "accessoryLogic": row["accessory_logic"],
        }
        for row in progression_rules
    ]
    generated_adaptations = [
        {
            "focusMuscle": row["focus_muscle"],
            "goal": row["goal"],
            "priority": row["priority"],
            "actionType": row["action_type"],
            "targetMovementPattern": row["target_movement_pattern"],
            "preferredExerciseIds": split_list(row["preferred_exercise_ids"]),
            "maxExtraDirectSetsWeek": int(row["max_extra_direct_sets_week"]),
            "maxFrequencyIncreasePerWeek": int(row["max_frequency_increase_per_week"]),
            "constraints": row["constraints"],
            "userFacingCopyTr": row["user_facing_copy_tr"],
        }
        for row in adaptation_rules
    ]
    generated_substitutions = [
        {
            "sourceExerciseId": row["source_exercise_id"],
            "alternativeExerciseId": row["alternative_exercise_id"],
            "sourceAppExerciseId": mapping[row["source_exercise_id"]],
            "alternativeAppExerciseId": mapping[row["alternative_exercise_id"]],
            "movementPattern": row["movement_pattern"],
            "alternativeEquipment": split_list(row["alternative_equipment"]),
            "reason": row["reason"],
            "constraint": row["constraint"],
            "preserveRole": parse_bool(row["preserve_role"]),
            "deterministicRank": int(row["deterministic_rank"]),
        }
        for row in substitutions
    ]
    generated_catalog = [
        omit_none({
            "canonicalExerciseId": row["exercise_id"],
            "exerciseName": row["exercise_name"],
            "movementPattern": row["movement_pattern"],
            "primaryMuscles": split_list(row["primary_muscles"]),
            "equipment": split_list(row["equipment"]),
            "defaultRole": row["default_role"],
            "appExerciseId": mapping.get(row["exercise_id"]),
        })
        for row in exercise_catalog
    ]

    GENERATED.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DOCS.mkdir(exist_ok=True)
    (GENERATED / "templates300.generated.ts").write_text(
        "import type { ForgeGeneratedTemplate } from '../types/csvWorkoutBrain';\n\n"
        f"export const FORGE_PROGRAM_TEMPLATES_300 = {ts(generated_templates)} as const satisfies readonly ForgeGeneratedTemplate[];\n"
    )
    (GENERATED / "progressionRules300.generated.ts").write_text(
        "import type { ForgeProgressionRule } from '../types/csvWorkoutBrain';\n\n"
        f"export const FORGE_PROGRESSION_RULES_300 = {ts(generated_progressions)} as const satisfies readonly ForgeProgressionRule[];\n"
    )
    (GENERATED / "adaptationRules300.generated.ts").write_text(
        "import type { ForgeAdaptationRule } from '../types/csvWorkoutBrain';\n\n"
        f"export const FORGE_ADAPTATION_RULES_300 = {ts(generated_adaptations)} as const satisfies readonly ForgeAdaptationRule[];\n"
    )
    (GENERATED / "substitutions300.generated.ts").write_text(
        "import type { ForgeExerciseSubstitution } from '../types/csvWorkoutBrain';\n\n"
        f"export const FORGE_EXERCISE_SUBSTITUTIONS_300 = {ts(generated_substitutions)} as const satisfies readonly ForgeExerciseSubstitution[];\n"
    )
    (GENERATED / "exerciseCatalog300.generated.ts").write_text(
        "import type { ForgeCanonicalExercise } from '../types/csvWorkoutBrain';\n\n"
        f"export const FORGE_CANONICAL_EXERCISES_300 = {ts(generated_catalog)} as const satisfies readonly ForgeCanonicalExercise[];\n"
    )
    (DATA_DIR / "exerciseIdMap300.ts").write_text(
        "import type { ExerciseLibraryItem } from '@/types';\n\n"
        f"export const FORGE_EXERCISE_ID_MAP_300 = {ts(mapping)} as const;\n\n"
        f"export const FORGE_REVIEWED_EXERCISES_300 = {ts(reviewed)} as const satisfies readonly ExerciseLibraryItem[];\n\n"
        f"export const FORGE_EXERCISE_MAPPING_NOTES_300 = {ts(mapping_notes)} as const;\n"
    )

    summary = {
        "templates": len(generated_templates),
        "exerciseRows": len(exercises),
        "catalogExercises": len(exercise_catalog),
        "progressionRules": len(generated_progressions),
        "adaptationRules": len(generated_adaptations),
        "substitutions": len(generated_substitutions),
        "reviewedExercisesAdded": len(reviewed),
        "researchSources": len(research_sources),
        "warnings": warnings,
    }
    print(json.dumps(summary, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
