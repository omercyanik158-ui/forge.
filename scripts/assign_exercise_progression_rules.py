#!/usr/bin/env python3
import csv
from collections import Counter
from pathlib import Path

ROOT = Path.cwd()
PACK = ROOT / "data" / "forge_workout_csv_pack"
TEMPLATES = PACK / "forge_program_templates.csv"
EXERCISES = PACK / "forge_template_exercises.csv"
RULES = PACK / "forge_progression_rules.csv"
REPORT = ROOT / "docs" / "phase-5-exercise-progression-assignment-review.md"

EXTRA_RULES = [
    {
        "progression_rule_id": "rep_range_accessory",
        "name_tr": "Aksesuar tekrar aralığı",
        "applies_to": "strength,hypertrophy,powerbuilding,general_fitness",
        "load_or_rep_logic": "Önce hedef tekrar aralığında kaliteyi tamamla; üst banda ulaşınca küçük yük artışı veya aynı yükte tekrar kalitesi korunur.",
        "failure_logic": "Alt banda düşerse aynı hedef tekrar edilir; tekrarlı düşüşte yük veya set sayısı küçük azaltılır.",
        "deload_logic": "Ana lift veya toplam performans düşüşüyle birlikte görülürse aksesuar hacmi geçici azaltılır.",
        "accessory_logic": "Aksesuar ve izolasyonlar için ana kaldırıştan daha konservatif ilerleme.",
    },
    {
        "progression_rule_id": "fixed_load_technique",
        "name_tr": "Sabit yük teknik",
        "applies_to": "strength,general_fitness,home",
        "load_or_rep_logic": "Yük artırımı otomatik yapılmaz; teknik, pozisyon ve tempo kalitesi korunur.",
        "failure_logic": "Form veya tekrar hedefi bozulursa aynı hedef tekrar edilir.",
        "deload_logic": "Gerekirse set sayısı geçici azaltılır; egzersiz seçimi değişmez.",
        "accessory_logic": "Core, mobilite ve teknik destek hareketlerinde güvenli sabit hedef.",
    },
    {
        "progression_rule_id": "time_based_conditioning",
        "name_tr": "Süre tabanlı kondisyon",
        "applies_to": "general_fitness,home",
        "load_or_rep_logic": "Tamamlanan süre hedefin üst bandına geldiğinde süre küçük artırılır; kilogram hedefi kullanılmaz.",
        "failure_logic": "Süre tamamlanamazsa aynı süre hedefi tekrar edilir.",
        "deload_logic": "Yorgunluk sinyali varsa süre veya interval sayısı geçici azaltılır.",
        "accessory_logic": "Kondisyon hareketlerinde yük değil süre takibi önceliklidir.",
    },
    {
        "progression_rule_id": "distance_based_conditioning",
        "name_tr": "Mesafe tabanlı kondisyon",
        "applies_to": "general_fitness,home",
        "load_or_rep_logic": "Tamamlanan mesafe hedefin üst bandına geldiğinde mesafe küçük artırılır; kilogram hedefi kullanılmaz.",
        "failure_logic": "Mesafe tamamlanamazsa aynı hedef tekrar edilir.",
        "deload_logic": "Yorgunluk sinyali varsa mesafe veya tur sayısı geçici azaltılır.",
        "accessory_logic": "Carry ve yürüyüş benzeri hareketlerde mesafe/süre takibi önceliklidir.",
    },
]

RULE_APPLIES_TO_OVERRIDES = {
    "double_progression": "hypertrophy,general_fitness,powerbuilding",
    "bodyweight_rep_leverage": "strength,hypertrophy,powerbuilding,general_fitness,home",
    "fixed_load_technique": "strength,hypertrophy,powerbuilding,general_fitness,home",
}


def read_csv(path: Path):
    with path.open(encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def write_csv(path: Path, rows, fieldnames):
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def split_list(value: str):
    return [item.strip() for item in value.split(",") if item.strip()]


def classify_rule(template, exercise):
    goal = template["goal"]
    level = template["level"]
    role = exercise["role"]
    movement = exercise["movement_pattern"]
    equipment = split_list(exercise["equipment"])
    reps_min = int(exercise["reps_min"])
    reps_max = int(exercise["reps_max"])
    template_rule = template["progression_rule_id"]
    is_bodyweight = "bodyweight" in equipment or equipment == ["pullup_bar"]
    is_conditioning = role == "conditioning" or movement in {"conditioning", "loaded_carry"}
    is_core = role == "core" or movement.startswith("anti_")
    is_main = role == "main_lift" and exercise["required"].strip().lower() == "true"

    if is_conditioning:
        if movement == "loaded_carry" or "metre" in exercise["notes"]:
            return "distance_based_conditioning"
        return "time_based_conditioning"

    if is_core:
        if is_bodyweight and reps_max > reps_min:
            return "bodyweight_rep_leverage"
        return "fixed_load_technique"

    if is_bodyweight and role != "main_lift":
        return "bodyweight_rep_leverage"

    if goal == "strength":
        if is_main:
            if template_rule in {"top_set_backoff", "undulating_strength"}:
                return template_rule
            return "linear_beginner" if level == "beginner" else "undulating_strength"
        if role in {"secondary_compound", "accessory_compound"} and reps_max <= 6:
            return "linear_beginner"
        return "rep_range_accessory"

    if goal == "powerbuilding":
        if is_main:
            return "top_set_backoff"
        if role in {"isolation", "secondary_compound", "accessory_compound"}:
            return "double_progression"
        return "rep_range_accessory"

    if goal == "hypertrophy":
        if role in {"secondary_compound", "accessory_compound", "isolation"}:
            return "double_progression"
        return "rep_range_accessory"

    if goal == "general_fitness":
        if template_rule == "linear_beginner" and role in {"secondary_compound", "accessory_compound"} and reps_max <= 12:
            return "linear_beginner"
        if role == "isolation":
            return "rep_range_accessory"
        return "double_progression"

    return template_rule


def ensure_rules():
    rows = read_csv(RULES)
    existing = {row["progression_rule_id"] for row in rows}
    changed = False
    for row in rows:
        override = RULE_APPLIES_TO_OVERRIDES.get(row["progression_rule_id"])
        if override and row["applies_to"] != override:
            row["applies_to"] = override
            changed = True
    for rule in EXTRA_RULES:
        if rule["progression_rule_id"] not in existing:
            rows.append(rule)
            changed = True
    if changed:
        write_csv(RULES, rows, rows[0].keys())


def main():
    ensure_rules()
    templates = {row["template_id"]: row for row in read_csv(TEMPLATES)}
    rows = read_csv(EXERCISES)
    fieldnames = list(rows[0].keys())
    if "progression_rule_id" not in fieldnames:
        insert_at = fieldnames.index("required")
        fieldnames.insert(insert_at, "progression_rule_id")

    counters = Counter()
    assignment_rows = []
    for row in rows:
        assigned = classify_rule(templates[row["template_id"]], row)
        row["progression_rule_id"] = assigned
        counters[assigned] += 1
        assignment_rows.append(row)

    write_csv(EXERCISES, assignment_rows, fieldnames)

    REPORT.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Phase 5 Exercise Progression Assignment Review",
        "",
        f"Template exercise rows reviewed: {len(assignment_rows)}",
        "",
        "## Rule Counts",
        "",
    ]
    for rule_id, count in sorted(counters.items()):
        lines.append(f"- `{rule_id}`: {count}")
    lines.extend([
        "",
        "## Assignment Policy",
        "",
        "- Required strength main lifts use strength-oriented rules.",
        "- Strength accessories use reviewed accessory progression unless the prescription is low-rep strength work.",
        "- Hypertrophy compounds and isolations use double progression.",
        "- Powerbuilding main lifts use top-set/backoff; accessories use hypertrophy-oriented rules.",
        "- Bodyweight and core work avoid arbitrary kilogram progression.",
        "- Conditioning uses time or distance rules.",
    ])
    REPORT.write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
