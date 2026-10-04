#!/usr/bin/env python3
from datetime import date, datetime
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
exam_js = (ROOT / "assets/exam-dates.js").read_text(encoding="utf-8")
app_js = (ROOT / "assets/app.js").read_text(encoding="utf-8")
qualification_names = set(re.findall(r'q\("([^"]+)"', app_js))
errors = []

blocks = list(re.finditer(r'^\s*"([^"]+)":\s*\{(.*?)^\s*\}(?:,)?$', exam_js, re.M | re.S))
if not blocks:
    errors.append("exam schedule entries not found")

today = date.today()
for match in blocks:
    name, body = match.group(1), match.group(2)
    if name not in qualification_names:
        errors.append(f"unknown qualification in exam schedule: {name}")

    url = re.search(r'url:\s*"([^"]+)"', body)
    if not url or not url.group(1).startswith("https://"):
        errors.append(f"{name}: official URL missing or not https")

    verified_m = re.search(r'verified:\s*"(\d{4}-\d{2}-\d{2})"', body)
    if not verified_m:
        errors.append(f"{name}: verified date missing")
    else:
        verified = datetime.strptime(verified_m.group(1), "%Y-%m-%d").date()
        if (today - verified).days > 120:
            errors.append(f"{name}: official information has not been rechecked for over 120 days ({verified})")

    type_m = re.search(r'type:\s*"([^"]+)"', body)
    next_m = re.search(r'next:\s*"(\d{4}-\d{2}-\d{2})"', body)
    if type_m and type_m.group(1) == "fixed":
        if not next_m:
            errors.append(f"{name}: fixed exam is missing next date")
        else:
            next_date = datetime.strptime(next_m.group(1), "%Y-%m-%d").date()
            if next_date < today:
                errors.append(f"{name}: fixed exam date has passed ({next_date}); update the next exam")

if errors:
    print("EXAM DATE CHECK FAILED")
    for error in errors:
        print("-", error)
    sys.exit(1)

print(f"OK: {len(blocks)} exam schedules checked on {today.isoformat()}.")
