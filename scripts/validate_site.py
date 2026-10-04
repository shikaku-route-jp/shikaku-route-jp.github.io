#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

class LinkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ("href", "src"):
            value = attrs.get(key)
            if value:
                self.links.append(value)

def local_target(source: Path, raw: str):
    raw = raw.strip()
    if not raw or raw.startswith(("#", "mailto:", "tel:", "javascript:", "data:")):
        return None
    parts = urlsplit(raw)
    if parts.scheme or parts.netloc:
        return None
    path = unquote(parts.path)
    if not path:
        return None
    if path.startswith("/"):
        target = ROOT / path.lstrip("/")
    else:
        target = source.parent / path
    if path.endswith("/") or target.is_dir():
        target = target / "index.html"
    return target.resolve()

# 1) Internal link / asset integrity
for html in ROOT.rglob("*.html"):
    parser = LinkParser()
    parser.feed(html.read_text(encoding="utf-8"))
    for raw in parser.links:
        target = local_target(html, raw)
        if target is None:
            continue
        try:
            target.relative_to(ROOT.resolve())
        except ValueError:
            errors.append(f"{html.relative_to(ROOT)}: outside-root link {raw}")
            continue
        if not target.exists():
            errors.append(f"{html.relative_to(ROOT)}: missing local target {raw}")

# 2) Qualification data integrity
app = (ROOT / "assets/app.js").read_text(encoding="utf-8")
names = re.findall(r'q\("([^"]+)"', app)
if len(names) != len(set(names)):
    dupes = sorted({x for x in names if names.count(x) > 1})
    errors.append(f"duplicate qualifications: {dupes}")
home = (ROOT / "index.html").read_text(encoding="utf-8")
m = re.search(r'<strong>(\d+)</strong><span>対応資格</span>', home)
if not m:
    errors.append("homepage qualification count not found")
else:
    shown = int(m.group(1))
    if shown != len(names):
        errors.append(f"qualification count mismatch: homepage={shown}, data={len(names)}")
if f"{len(names)}資格" not in home:
    errors.append(f"homepage metadata/copy does not include {len(names)}資格")

question_block = re.search(r'const QUESTIONS=\[(.*?)\];\s*const state=', app, re.S)
question_count = len(re.findall(r'\{key:"', question_block.group(1))) if question_block else 0
if question_count != 10:
    errors.append(f"question count changed: {question_count} (expected 10)")

# 3) Article index / sitemap integrity
article_index = (ROOT / "articles/index.html").read_text(encoding="utf-8")
card_files = re.findall(r'class="article-card" href="([^"]+\.html)"', article_index)
article_files = sorted(p.name for p in (ROOT / "articles").glob("*.html") if p.name != "index.html")
if sorted(card_files) != article_files:
    missing_cards = sorted(set(article_files) - set(card_files))
    broken_cards = sorted(set(card_files) - set(article_files))
    if missing_cards:
        errors.append(f"articles missing from index: {missing_cards}")
    if broken_cards:
        errors.append(f"index cards without files: {broken_cards}")

sitemap = (ROOT / "sitemap.xml").read_text(encoding="utf-8")
for file in article_files:
    url = f"https://shikaku-route-jp.github.io/articles/{file}"
    if url not in sitemap:
        errors.append(f"article missing from sitemap: {file}")

# 4) Stale qualification-count copy
for html in ROOT.rglob("*.html"):
    text = html.read_text(encoding="utf-8")
    for stale in ("64資格", "72資格", "ROUTE 064", "ROUTE 072"):
        if stale in text:
            errors.append(f"{html.relative_to(ROOT)}: stale copy {stale}")

if errors:
    print("SITE VALIDATION FAILED")
    for error in errors:
        print("-", error)
    sys.exit(1)

print(f"OK: {len(names)} qualifications, {question_count} questions, {len(article_files)} articles, internal links valid.")
