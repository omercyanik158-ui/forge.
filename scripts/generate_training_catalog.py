#!/usr/bin/env python3
from __future__ import annotations

import ast
import csv
import json
import re
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SUMMARY_CSV = Path("/Users/omercyanik/Downloads/archive/program_summary.csv")
DETAILED_CSV = Path("/Users/omercyanik/Downloads/archive/programs_detailed_boostcamp_kaggle.csv")
OUTPUT_TS = PROJECT_ROOT / "src" / "data" / "trainingCatalog.generated.ts"
REPORT_MD = PROJECT_ROOT / "docs" / "training-csv-import-report.md"
MAX_PROGRAMS = 36

COLORS = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#16a34a", "#be123c", "#475569", "#0891b2"]
SUMMARY_REQUIRED = {"title", "description", "level", "goal", "equipment", "program_length", "time_per_workout"}
DETAILED_REQUIRED = {"title", "week", "day", "exercise_name", "sets", "reps"}


def normalize(value: str) -> str:
    text = value.lower().replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def slug(value: str) -> str:
    return normalize(value).replace(" ", "-")[:80] or "item"


def parse_number(value: Any, fallback: float) -> float:
    match = re.search(r"\d+(\.\d+)?", str(value or "").replace(",", "."))
    if not match:
        return fallback
    try:
        return float(match.group(0))
    except ValueError:
        return fallback


def parse_listish(value: str) -> list[str]:
    try:
        parsed = ast.literal_eval(value)
        if isinstance(parsed, list):
            return [str(item).strip() for item in parsed if str(item).strip()]
    except (SyntaxError, ValueError):
        pass
    return [item.strip(" '\"") for item in value.split(",") if item.strip(" '\"")]


def parse_reps(value: str) -> tuple[int, str]:
    raw = str(value or "").strip()
    if not raw or raw == "-" or raw.lower() == "nan":
        return 10, "8-12 tekrar"
    numbers = [int(item) for item in re.findall(r"\d+", raw) if int(item) <= 100]
    if not numbers:
        return 10, raw
    reps = round(sum(numbers) / len(numbers))
    return max(1, min(30, reps)), raw


def parse_sets(value: str) -> int:
    return max(1, min(8, round(parse_number(value, 3))))


def infer_muscles(name: str) -> dict[str, Any]:
    text = normalize(name)
    if re.search(r"bench|chest|pec|fly|push up|dip", text):
        return {"muscleGroup": "Göğüs", "targetMuscles": ["Göğüs"], "secondaryMuscles": ["Triceps", "Ön Omuz"]}
    if re.search(r"row|pulldown|pull up|chin up|lat|shrug|back|rear delt|face pull", text):
        return {"muscleGroup": "Sırt", "targetMuscles": ["Sırt"], "secondaryMuscles": ["Biceps", "Arka Omuz"]}
    if re.search(r"shoulder|overhead|military|lateral raise|front raise|upright row|delt", text):
        return {"muscleGroup": "Omuz", "targetMuscles": ["Omuz"], "secondaryMuscles": ["Triceps"]}
    if re.search(r"squat|leg press|lunge|leg extension|leg curl|deadlift|rdl|romanian|hip thrust|glute|calf|hamstring|quad", text):
        return {"muscleGroup": "Bacak", "targetMuscles": ["Bacak"], "secondaryMuscles": ["Kalça"]}
    if re.search(r"curl|triceps|biceps|skull|pushdown|extension", text):
        return {"muscleGroup": "Kol", "targetMuscles": ["Kol"], "secondaryMuscles": []}
    if re.search(r"abs|crunch|plank|sit up|leg raise|core|russian|hanging knee", text):
        return {"muscleGroup": "Karın", "targetMuscles": ["Karın"], "secondaryMuscles": []}
    return {"muscleGroup": "Sırt", "targetMuscles": ["Sırt"], "secondaryMuscles": []}


def infer_equipment(name: str, program_equipment: str) -> str:
    text = normalize(f"{name} {program_equipment}")
    if "barbell" in text:
        return "Barbell"
    if "dumbbell" in text or " db " in f" {text} ":
        return "Dumbbell"
    if "cable" in text:
        return "Cable"
    if "machine" in text or "smith" in text:
        return "Machine"
    if "kettlebell" in text:
        return "Kettlebell"
    if "band" in text:
        return "Band"
    if "home" in text or "bodyweight" in text or "body weight" in text or "push up" in text or "pull up" in text:
        return "Vücut Ağırlığı"
    return "Dumbbell"


def infer_difficulty(levels: list[str]) -> str:
    text = normalize(" ".join(levels))
    if "advanced" in text:
        return "Zor"
    if "intermediate" in text:
        return "Orta"
    return "Başlangıç"


def infer_goal(goals: list[str]) -> str:
    text = normalize(" ".join(goals))
    if "powerlifting" in text or "strength" in text:
        return "Güç"
    if "powerbuilding" in text:
        return "Güç + Kas"
    if "bodybuilding" in text or "muscle" in text or "sculpting" in text:
        return "Kas Gelişimi"
    return "Genel Form"


def infer_training_style(title: str, goals: list[str], days_per_week: int, equipment: str) -> str:
    text = normalize(f"{title} {' '.join(goals)} {equipment}")
    if "powerlifting" in text:
        return "Powerlifting"
    if "powerbuilding" in text:
        return "Powerbuilding"
    if "upper lower" in text:
        return "Upper/Lower"
    if "full body" in text or days_per_week == 3:
        return "Full Body"
    if "home" in text:
        return "Home Fitness"
    return "Split"


def load_summaries() -> tuple[list[dict[str, str]], list[str]]:
    failures: list[str] = []
    with SUMMARY_CSV.open(newline="", encoding="utf-8", errors="replace") as file:
        reader = csv.DictReader(file)
        missing = SUMMARY_REQUIRED - set(reader.fieldnames or [])
        failures.extend(f"program_summary.csv: missing column {column}" for column in sorted(missing))
        return list(reader), failures


def collect_title_stats() -> tuple[dict[str, dict[str, Any]], list[str]]:
    stats: dict[str, dict[str, Any]] = defaultdict(lambda: {"rows": 0, "days": defaultdict(set)})
    failures: list[str] = []
    with DETAILED_CSV.open(newline="", encoding="utf-8", errors="replace") as file:
        reader = csv.DictReader(file)
        missing = DETAILED_REQUIRED - set(reader.fieldnames or [])
        failures.extend(f"programs_detailed_boostcamp_kaggle.csv: missing column {column}" for column in sorted(missing))
        for row in reader:
            title = row.get("title", "")
            exercise = (row.get("exercise_name") or "").strip()
            week = round(parse_number(row.get("week"), 0))
            day = round(parse_number(row.get("day"), 0))
            if not title or not exercise or week <= 0 or day <= 0 or parse_number(row.get("sets"), 0) <= 0:
                continue
            stats[title]["rows"] += 1
            stats[title]["days"][week].add(day)
    return stats, failures


def score_summary(summary: dict[str, str], stats: dict[str, Any]) -> float:
    goals = parse_listish(summary.get("goal", ""))
    levels = parse_listish(summary.get("level", ""))
    first_week_days = len(stats["days"].get(1, set()))
    score = 0.0
    if 3 <= first_week_days <= 5:
        score += 30
    if stats["rows"] >= first_week_days * 4:
        score += 20
    if "full gym" in normalize(summary.get("equipment", "")):
        score += 10
    if any(re.search(r"bodybuilding|powerbuilding|powerlifting|muscle|athletics", goal, re.I) for goal in goals):
        score += 20
    if any(re.search(r"beginner|novice|intermediate", level, re.I) for level in levels):
        score += 12
    score += min(12, parse_number(summary.get("time_per_workout"), 60) / 10)
    return score


def collect_selected_rows(selected_titles: set[str]) -> dict[str, list[dict[str, Any]]]:
    rows_by_title: dict[str, list[dict[str, Any]]] = defaultdict(list)
    with DETAILED_CSV.open(newline="", encoding="utf-8", errors="replace") as file:
        reader = csv.DictReader(file)
        for row in reader:
            title = row.get("title", "")
            if title not in selected_titles:
                continue
            exercise = (row.get("exercise_name") or "").strip()
            week = round(parse_number(row.get("week"), 0))
            day = round(parse_number(row.get("day"), 0))
            if not title or not exercise or week <= 0 or day <= 0 or parse_number(row.get("sets"), 0) <= 0:
                continue
            row["week"] = week
            row["day"] = day
            row["exercise_name"] = exercise
            rows_by_title[title].append(row)
    return rows_by_title


def load_image_lookup():
    if not OUTPUT_TS.exists():
        return lambda _name: []
    raw = OUTPUT_TS.read_text(encoding="utf-8", errors="replace")
    match = re.search(r"export const CSV_EXERCISES: ExerciseLibraryItem\[\] = (\[[\s\S]*?\]);\n\nexport const CSV_PROGRAMS", raw)
    if not match:
        return lambda _name: []
    try:
        exercises = json.loads(match.group(1))
    except json.JSONDecodeError:
        return lambda _name: []
    image_by_name = {
        normalize(exercise.get("name", "")): exercise.get("imageUrls", [])
        for exercise in exercises
        if exercise.get("imageUrls")
    }
    return lambda name: image_by_name.get(normalize(name), [])


def make_exercise(name: str, rows: list[dict[str, Any]], image_urls: list[str]) -> dict[str, Any]:
    first = rows[0]
    reps, _ = parse_reps(first.get("reps", ""))
    return {
        "id": f"csv-{slug(name)}",
        "name": name,
        "displayName": name,
        **infer_muscles(name),
        "equipment": infer_equipment(name, first.get("equipment", "")),
        "difficulty": infer_difficulty(parse_listish(first.get("level", ""))),
        "imageUrls": image_urls,
        "defaultSets": parse_sets(first.get("sets", "")),
        "defaultReps": reps,
    }


def make_program(summary: dict[str, str], rows: list[dict[str, Any]], index: int) -> dict[str, Any]:
    weeks: dict[int, dict[int, list[dict[str, Any]]]] = defaultdict(lambda: defaultdict(list))
    for row in rows:
        weeks[row["week"]][row["day"]].append(row)

    week_numbers = sorted(weeks)
    days_per_week = len(weeks[week_numbers[0]])
    levels = parse_listish(summary.get("level", ""))
    goals = parse_listish(summary.get("goal", ""))
    difficulty = infer_difficulty(levels)
    goal = infer_goal(goals)
    training_style = infer_training_style(summary.get("title", ""), goals, days_per_week, summary.get("equipment", ""))
    program_id = f"csv-{slug(summary.get('title', 'program'))}"

    return {
        "id": program_id,
        "title": summary.get("title", "CSV Program"),
        "sub": f"{len(week_numbers)} hafta · {days_per_week} gün · {difficulty}",
        "color": COLORS[index % len(COLORS)],
        "tier": "free" if index < 8 else "premium",
        "duration": f"{len(week_numbers)} Hafta",
        "focus": goal,
        "summary": next((line for line in summary.get("description", "").splitlines() if line.strip()), f"{training_style} odaklı katalog programı.")[:180],
        "difficultyLevel": difficulty,
        "daysPerWeek": days_per_week,
        "trainingStyle": training_style,
        "goal": goal,
        "equipment": summary.get("equipment", "Full Gym"),
        "searchTerms": sorted({summary.get("title", "").lower(), *(goal_item.lower() for goal_item in goals), *(level.lower() for level in levels), training_style.lower(), goal.lower()}),
        "weeks": [
            {
                "id": f"{program_id}-w{week_number}",
                "title": f"{week_number}. Hafta",
                "guidance": "İlk hafta hareket formunu ve uygun çalışma ağırlığını bul." if week_number == 1 else "Tekrar aralığını temiz tamamlıyorsan küçük ağırlık artışı yap.",
                "days": [
                    make_day(program_id, week_number, day_number, day_rows[:9], summary, goal, difficulty, training_style)
                    for day_number, day_rows in sorted(weeks[week_number].items())
                ],
            }
            for week_number in week_numbers
        ],
    }


def make_day(program_id: str, week_number: int, day_number: int, rows: list[dict[str, Any]], summary: dict[str, str], goal: str, difficulty: str, training_style: str) -> dict[str, Any]:
    exercises = []
    for row in rows:
        reps, label = parse_reps(row.get("reps", ""))
        exercises.append({
            "exerciseId": f"csv-{slug(row['exercise_name'])}",
            "sets": parse_sets(row.get("sets", "")),
            "reps": reps,
            "repLabel": label,
            "restSeconds": 150 if goal == "Güç" else 90,
            "rir": 3 if difficulty == "Başlangıç" else 2,
            "alternatives": [],
        })
    total_sets = sum(item["sets"] for item in exercises)
    return {
        "id": f"{program_id}-w{week_number}-d{day_number}",
        "title": f"Gün {day_number}",
        "subtitle": " + ".join(row["exercise_name"] for row in rows[:2]) or training_style,
        "durationMin": max(30, min(100, round(parse_number(summary.get("time_per_workout"), 60)))),
        "difficulty": difficulty,
        "exercises": exercises,
        "exerciseIds": [item["exerciseId"] for item in exercises],
        "notes": f"{summary.get('title', 'Program')} içinden normalize edildi. Toplam {total_sets} çalışma seti.",
    }


def main() -> None:
    summaries, failures = load_summaries()
    title_stats, stats_failures = collect_title_stats()
    failures.extend(stats_failures)
    candidates = []
    for summary in summaries:
        title = summary.get("title", "")
        stats = title_stats.get(title)
        if not stats:
            continue
        first_week_days = len(stats["days"].get(1, set()))
        if stats["rows"] < 12 or first_week_days < 3 or first_week_days > 5:
            continue
        candidates.append((score_summary(summary, stats), summary))
    candidates.sort(key=lambda item: (-item[0], item[1].get("title", "")))
    selected_summaries = [summary for _, summary in candidates[:MAX_PROGRAMS]]
    rows_by_title = collect_selected_rows({summary["title"] for summary in selected_summaries})

    image_lookup = load_image_lookup()
    rows_by_exercise: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for rows in rows_by_title.values():
        for row in rows:
            rows_by_exercise[row["exercise_name"]].append(row)

    exercises = [
        make_exercise(name, rows, image_lookup(name))
        for name, rows in sorted(rows_by_exercise.items(), key=lambda item: item[0])
    ]
    programs = [
        make_program(summary, rows_by_title[summary["title"]], index)
        for index, summary in enumerate(selected_summaries)
    ]

    exercise_ids = {exercise["id"] for exercise in exercises}
    for program in programs:
        for week in program["weeks"]:
            for day in week["days"]:
                for exercise in day["exercises"]:
                    if exercise["exerciseId"] not in exercise_ids:
                        failures.append(f"{program['id']}: missing exercise {exercise['exerciseId']}")

    image_matches = sum(1 for exercise in exercises if exercise["imageUrls"])
    generated_at = datetime.now(timezone.utc).isoformat()
    meta = {
        "source": "boostcamp_kaggle_csv",
        "generatedAt": generated_at,
        "summaryRows": len(summaries),
        "selectedPrograms": len(programs),
        "selectedExercises": len(exercises),
        "imageMatches": image_matches,
        "failures": failures,
    }
    ts = "\n".join([
        "import type { ExerciseLibraryItem } from '@/types';",
        "import type { ProgramPlan } from '@/services/programCatalog';",
        "",
        "// Generated by scripts/generate_training_catalog.py from user-provided CSV files.",
        "// Do not edit manually.",
        "",
        f"export const TRAINING_CATALOG_IMPORT_META = {json.dumps(meta, ensure_ascii=False, indent=2)} as const;",
        "",
        f"export const CSV_EXERCISES: ExerciseLibraryItem[] = {json.dumps(exercises, ensure_ascii=False, indent=2)};",
        "",
        f"export const CSV_PROGRAMS: ProgramPlan[] = {json.dumps(programs, ensure_ascii=False, indent=2)};",
        "",
    ])
    OUTPUT_TS.write_text(ts, encoding="utf-8")

    validation_lines = [f"- {failure}" for failure in failures] if failures else ["- No blocking validation failures."]
    program_lines = [
        f"- {program['title']} ({program['daysPerWeek']} gün, {program['duration']}, {program['trainingStyle']}, {program['tier']})"
        for program in programs
    ]
    report = [
        "# Training CSV Import Report",
        "",
        f"Generated at: {generated_at}",
        f"Summary rows: {len(summaries)}",
        f"Selected programs: {len(programs)}",
        f"Selected exercises: {len(exercises)}",
        f"Exercise image matches: {image_matches}",
        "",
        "## Validation",
        *validation_lines,
        "",
        "## Selected Programs",
        *program_lines,
        "",
    ]
    REPORT_MD.write_text("\n".join(report), encoding="utf-8")
    print(f"Generated {len(programs)} programs and {len(exercises)} exercises.")
    print(f"Image matches: {image_matches}")
    if failures:
        print(f"Validation failures: {len(failures)}")


if __name__ == "__main__":
    main()
