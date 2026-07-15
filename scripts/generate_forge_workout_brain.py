#!/usr/bin/env python3
import csv
import json
import re
from pathlib import Path

ROOT = Path.cwd()
PACK = ROOT / "data" / "forge_workout_csv_pack"
GENERATED = ROOT / "src" / "workout-programming" / "generated"
DATA_DIR = ROOT / "src" / "workout-programming" / "data"
DOCS = ROOT / "docs"
APP_CATALOG = ROOT / "src" / "data" / "trainingCatalog.generated.ts"

ROLE_ORDER = {
    "mobility": 0,
    "main_lift": 1,
    "secondary_compound": 2,
    "accessory_compound": 3,
    "isolation": 4,
    "core": 5,
    "conditioning": 6,
}

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
    "dumbbell_shoulder_press": "csv-shoulder-press-plate-loaded",
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

REVIEWED_ENTRY_IDS = {
    "band_pulldown",
    "band_row",
    "bike_intervals",
    "bodyweight_squat",
    "dead_bug",
    "farmer_carry",
    "incline_walk",
    "pallof_press",
    "pike_push_up",
    "single_leg_glute_bridge",
    "step_up",
}


def read_csv(name):
    path = PACK / name
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def ts(value):
    return json.dumps(value, ensure_ascii=False, indent=2)


def norm(value):
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def app_exercises():
    text = APP_CATALOG.read_text()
    items = {}
    for match in re.finditer(r'"id": "([^"]+)",\n    "name": "([^"]+)"', text):
        items[norm(match.group(2))] = {"id": match.group(1), "name": match.group(2)}
    return items


def split_list(value):
    return [item.strip() for item in value.split(",") if item.strip()]


def app_muscle_group(muscles):
    joined = ",".join(muscles)
    if any(item in joined for item in ["chest"]):
        return "Göğüs"
    if any(item in joined for item in ["lat", "back", "trap"]):
        return "Sırt"
    if any(item in joined for item in ["delt", "shoulder"]):
        return "Omuz"
    if any(item in joined for item in ["quad", "hamstring", "glute", "calf"]):
        return "Bacak"
    if any(item in joined for item in ["bicep", "tricep", "forearm", "grip"]):
        return "Kol"
    return "Karın"


def display_muscle(muscle):
    labels = {
        "chest": "Göğüs",
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
        "grip": "Kol",
        "core": "Karın",
        "cardio": "Bacak",
    }
    return labels.get(muscle, "Karın")


def parse_bool(value):
    return value.strip().lower() == "true"


def validate_and_transform():
    templates = read_csv("forge_program_templates.csv")
    exercises = read_csv("forge_template_exercises.csv")
    progression_rules = read_csv("forge_progression_rules.csv")
    adaptation_rules = read_csv("forge_adaptation_rules.csv")
    substitutions = read_csv("forge_exercise_substitutions.csv")
    exercise_catalog = read_csv("forge_exercise_catalog.csv")
    research_sources = read_csv("forge_research_sources.csv")
    manifest = json.loads((PACK / "manifest.json").read_text())
    errors = []

    if len(templates) != manifest["template_count"]:
        errors.append("Template count does not match manifest.")
    if len(exercises) != manifest["exercise_row_count"]:
        errors.append("Exercise row count does not match manifest.")
    if len(progression_rules) != manifest["progression_rule_count"]:
        errors.append("Progression rule count does not match manifest.")

    template_ids = [row["template_id"] for row in templates]
    duplicate_template_ids = sorted({item for item in template_ids if template_ids.count(item) > 1})
    if duplicate_template_ids:
        errors.append(f"Duplicate template IDs: {duplicate_template_ids}")

    progression_ids = {row["progression_rule_id"] for row in progression_rules}
    catalog_ids = {row["exercise_id"] for row in exercise_catalog}
    for template in templates:
        if int(template["version"]) < 1:
            errors.append(f"Invalid version: {template['template_id']}")
        if template["status"] != "active":
            errors.append(f"Non-active template in canonical package: {template['template_id']}")
        if template["progression_rule_id"] not in progression_ids:
            errors.append(f"Missing progression rule for {template['template_id']}")

    by_template = {}
    for row in exercises:
        by_template.setdefault(row["template_id"], []).append(row)
        if row["exercise_id"] not in catalog_ids:
            errors.append(f"Exercise not in canonical catalog: {row['template_id']} -> {row['exercise_id']}")
        if not row.get("progression_rule_id"):
            errors.append(f"Missing exercise progression rule: {row['template_id']} -> {row['exercise_id']}")
        elif row["progression_rule_id"] not in progression_ids:
            errors.append(f"Unknown exercise progression rule: {row['template_id']} -> {row['exercise_id']} -> {row['progression_rule_id']}")
        sets = int(row["sets"])
        reps_min = int(row["reps_min"])
        reps_max = int(row["reps_max"])
        rir = float(row["target_rir"])
        rest = int(row["rest_seconds"])
        if sets <= 0 or reps_min <= 0 or reps_max < reps_min or rest <= 0:
            errors.append(f"Invalid prescription: {row}")
        if rir < 0 or rir > 5:
            errors.append(f"Invalid RIR: {row}")

    for template in templates:
        rows = by_template.get(template["template_id"], [])
        actual_days = sorted({int(row["day_index"]) for row in rows})
        expected_days = list(range(1, int(template["days_per_week"]) + 1))
        if actual_days != expected_days:
            errors.append(f"Day count/index mismatch: {template['template_id']} {actual_days} != {expected_days}")
        for day in actual_days:
            day_rows = [row for row in rows if int(row["day_index"]) == day]
            orders = [int(row["exercise_order"]) for row in day_rows]
            if sorted(orders) != list(range(1, len(day_rows) + 1)):
                errors.append(f"Exercise order mismatch: {template['template_id']} day {day}")
            seen = set()
            first_isolation_order = None
            for row in sorted(day_rows, key=lambda item: int(item["exercise_order"])):
                if row["exercise_id"] in seen:
                    errors.append(f"Duplicate exercise in day: {template['template_id']} day {day} {row['exercise_id']}")
                seen.add(row["exercise_id"])
                if row["role"] == "isolation" and first_isolation_order is None:
                    first_isolation_order = int(row["exercise_order"])
                if row["role"] == "main_lift" and first_isolation_order is not None:
                    errors.append(f"Main lift appears after isolation: {template['template_id']} day {day}")

    for sub in substitutions:
        if sub["source_exercise_id"] not in catalog_ids:
            errors.append(f"Substitution source missing: {sub['source_exercise_id']}")
        if sub["alternative_exercise_id"] not in catalog_ids:
            errors.append(f"Substitution alternative missing: {sub['alternative_exercise_id']}")

    app_by_name = app_exercises()
    mapping = {}
    reviewed = []
    gaps = []
    mapping_notes = []
    for row in exercise_catalog:
        canonical_id = row["exercise_id"]
        exact = app_by_name.get(norm(row["exercise_name"]))
        if exact:
            mapping[canonical_id] = exact["id"]
            mapping_notes.append({"canonical": canonical_id, "app": exact["id"], "type": "exact_name"})
        elif canonical_id in ALIAS_MAP:
            mapping[canonical_id] = ALIAS_MAP[canonical_id]
            mapping_notes.append({"canonical": canonical_id, "app": ALIAS_MAP[canonical_id], "type": "reviewed_alias"})
        elif canonical_id in REVIEWED_ENTRY_IDS:
            app_id = f"forge-{canonical_id.replace('_', '-')}"
            mapping[canonical_id] = app_id
            muscles = split_list(row["primary_muscles"])
            reviewed.append({
                "id": app_id,
                "name": row["exercise_name"],
                "displayName": row["exercise_name"],
                "muscleGroup": app_muscle_group(muscles),
                "targetMuscles": [display_muscle(muscle) for muscle in muscles] or ["Karın"],
                "secondaryMuscles": [],
                "equipment": row["equipment"],
                "difficulty": "Orta",
                "imageUrls": [],
                "defaultSets": 3,
                "defaultReps": 10,
            })
            mapping_notes.append({"canonical": canonical_id, "app": app_id, "type": "reviewed_entry"})
        else:
            gaps.append(row)

    used_ids = {row["exercise_id"] for row in exercises}
    missing_used = [row for row in gaps if row["exercise_id"] in used_ids]
    if missing_used:
        errors.append("Used canonical exercises without app mapping: " + ", ".join(row["exercise_id"] for row in missing_used))

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
                    {
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
                        "targetRir": float(row["target_rir"]),
                        "restSeconds": int(row["rest_seconds"]),
                        "progressionRuleId": row["progression_rule_id"],
                        "required": parse_bool(row["required"]),
                        "notes": row["notes"],
                    }
                    for row in day_rows
                ],
            })
        return {
            "templateId": template["template_id"],
            "version": int(template["version"]),
            "status": template["status"],
            "nameTr": template["name_tr"],
            "goal": template["goal"],
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

    generated_templates = [template_object(template) for template in templates if template["status"] == "active"]
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
        {
            "canonicalExerciseId": row["exercise_id"],
            "exerciseName": row["exercise_name"],
            "movementPattern": row["movement_pattern"],
            "primaryMuscles": split_list(row["primary_muscles"]),
            "equipment": split_list(row["equipment"]),
            "defaultRole": row["default_role"],
            "appExerciseId": mapping.get(row["exercise_id"]),
        }
        for row in exercise_catalog
    ]

    if errors:
        raise SystemExit("\n".join(errors[:50]))

    GENERATED.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DOCS.mkdir(exist_ok=True)

    (GENERATED / "templates.generated.ts").write_text(
        "import type { ForgeGeneratedTemplate } from '../types/csvWorkoutBrain';\n\n"
        f"export const FORGE_PROGRAM_TEMPLATES = {ts(generated_templates)} as const satisfies readonly ForgeGeneratedTemplate[];\n"
    )
    (GENERATED / "progressionRules.generated.ts").write_text(
        "import type { ForgeProgressionRule } from '../types/csvWorkoutBrain';\n\n"
        f"export const FORGE_PROGRESSION_RULES = {ts(generated_progressions)} as const satisfies readonly ForgeProgressionRule[];\n"
    )
    (GENERATED / "adaptationRules.generated.ts").write_text(
        "import type { ForgeAdaptationRule } from '../types/csvWorkoutBrain';\n\n"
        f"export const FORGE_ADAPTATION_RULES = {ts(generated_adaptations)} as const satisfies readonly ForgeAdaptationRule[];\n"
    )
    (GENERATED / "substitutions.generated.ts").write_text(
        "import type { ForgeExerciseSubstitution } from '../types/csvWorkoutBrain';\n\n"
        f"export const FORGE_EXERCISE_SUBSTITUTIONS = {ts(generated_substitutions)} as const satisfies readonly ForgeExerciseSubstitution[];\n"
    )
    (GENERATED / "exerciseCatalog.generated.ts").write_text(
        "import type { ForgeCanonicalExercise } from '../types/csvWorkoutBrain';\n\n"
        f"export const FORGE_CANONICAL_EXERCISES = {ts(generated_catalog)} as const satisfies readonly ForgeCanonicalExercise[];\n"
    )
    (DATA_DIR / "exerciseIdMap.ts").write_text(
        "import type { ExerciseLibraryItem } from '@/types';\n\n"
        f"export const FORGE_EXERCISE_ID_MAP = {ts(mapping)} as const;\n\n"
        f"export const FORGE_REVIEWED_EXERCISES = {ts(reviewed)} as const satisfies readonly ExerciseLibraryItem[];\n\n"
        f"export const FORGE_EXERCISE_MAPPING_NOTES = {ts(mapping_notes)} as const;\n\n"
        f"export const FORGE_EXERCISE_MAPPING_GAPS = {ts(gaps)} as const;\n"
    )
    (DOCS / "forge-csv-exercise-mapping-report.md").write_text(
        "# FORGE CSV Exercise Mapping Report\n\n"
        f"- Canonical exercises: {len(exercise_catalog)}\n"
        f"- Exact name mappings: {sum(1 for n in mapping_notes if n['type']=='exact_name')}\n"
        f"- Reviewed alias mappings: {sum(1 for n in mapping_notes if n['type']=='reviewed_alias')}\n"
        f"- Reviewed app entries added: {len(reviewed)}\n"
        f"- Blocking gaps: {len(missing_used)}\n\n"
        "Runtime fuzzy matching is not used. All mappings are generated at build time.\n"
    )
    summary = {
        "templates": len(generated_templates),
        "exerciseRows": len(exercises),
        "progressionRules": len(generated_progressions),
        "adaptationRules": len(generated_adaptations),
        "substitutions": len(generated_substitutions),
        "canonicalExercises": len(exercise_catalog),
        "reviewedExercisesAdded": len(reviewed),
        "mappingGaps": len(missing_used),
        "researchSources": len(research_sources),
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    validate_and_transform()
