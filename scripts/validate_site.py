#!/usr/bin/env python3
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote, urljoin
import re
import sys
import json
import struct
import xml.etree.ElementTree as ET
from datetime import date, datetime
from site_common import BASE, Page, content_pages, page_url
from generate_metadata import JST, modified_day

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
    parts = urlsplit(urljoin(page_url(source), raw))
    origin = urlsplit(BASE)
    if (parts.scheme, parts.netloc) != (origin.scheme, origin.netloc):
        return None
    path = unquote(parts.path) or "/"
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
    url = page_url(ROOT / "articles" / file)
    if url not in sitemap:
        errors.append(f"article missing from sitemap: {file}")

# 4) Stale qualification-count copy
for html in ROOT.rglob("*.html"):
    text = html.read_text(encoding="utf-8")
    for stale in ("64資格", "72資格", "ROUTE 064", "ROUTE 072"):
        if stale in text:
            errors.append(f"{html.relative_to(ROOT)}: stale copy {stale}")

# 5) All indexable pages: sitemap coverage, self-canonical, cards and JSON-LD.
namespace = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
try:
    tree = ET.fromstring(sitemap)
    listed = [(node.findtext("s:loc", namespaces=namespace), node.findtext("s:lastmod", namespaces=namespace)) for node in tree.findall("s:url", namespace)]
except ET.ParseError as exc:
    errors.append(f"sitemap XML invalid: {exc}"); listed = []
urls = [url for url, _ in listed]
if len(urls) != len(set(urls)): errors.append("duplicate URLs in sitemap")
inventory = {page_url(path): (path, page) for path, page in content_pages()}
expected = set(inventory)
if set(urls) != expected:
    errors.append(f"sitemap inventory mismatch: missing={sorted(expected-set(urls))}, extra={sorted(set(urls)-expected)}")
days = dict(listed)
# Search entry pages must have useful, distinct metadata and remain reachable
# through ordinary HTML links, without requiring diagnosis answers or JS.
for field in ('title', 'description'):
    seen = {}
    for url, (path, page) in inventory.items():
        value = (page.title if field == 'title' else page.meta.get(field, '')).strip()
        if not value: errors.append(f'{path.relative_to(ROOT)}: missing {field}')
        elif value in seen: errors.append(f'{path.relative_to(ROOT)}: duplicate {field} with {seen[value]}')
        seen[value] = path.relative_to(ROOT)
for url, (path, page) in inventory.items():
    if page.h1_count != 1: errors.append(f'{path.relative_to(ROOT)}: expected one main heading, found {page.h1_count}')
visited = set(); pending = [BASE + '/']
while pending:
    url = pending.pop()
    if url in visited or url not in inventory: continue
    visited.add(url)
    for href in inventory[url][1].anchor_links:
        target = urlsplit(urljoin(url, href))
        target_url = target.scheme + '://' + target.netloc + target.path
        if target_url.endswith('/index.html'): target_url = target_url[:-10]
        if target_url in inventory and target_url not in visited: pending.append(target_url)
for url in sorted(expected - visited): errors.append(f'page not reachable from homepage through HTML links: {url}')
static_directory = re.search(r'<div class="qualification-grid" id="qualificationGrid">(.*?)</div><!-- static-directory:end -->', home, re.S)
if not static_directory or static_directory[1].count('class="qualification-card"') != len(names):
    errors.append('homepage must include all qualifications in its initial HTML')
for path, page in content_pages(include_noindex=True):
    rel = path.relative_to(ROOT); url = page_url(path)
    if page.canonicals != [url]: errors.append(f"{rel}: canonical must be exactly its own URL ({url})")
    if page.meta.get("og:url") != url: errors.append(f"{rel}: og:url does not match canonical")
    if page.meta.get("twitter:card") != "summary_large_image": errors.append(f"{rel}: large Twitter card missing")
    if not page.icons: errors.append(f"{rel}: favicon missing")
    image = page.meta.get("og:image", "")
    if not image.startswith(BASE+"/") or not (ROOT/image.removeprefix(BASE+"/")).is_file(): errors.append(f"{rel}: og:image must reference an existing site asset")
    if page.meta.get("twitter:image") != image: errors.append(f"{rel}: Twitter/OG image mismatch")
    if url in days:
        try:
            parsed = date.fromisoformat(days[url])
            if parsed > datetime.now(JST).date(): errors.append(f"{rel}: lastmod is in the future")
            if days[url] != modified_day(path): errors.append(f"{rel}: sitemap lastmod is stale relative to Git")
        except (ValueError,TypeError): errors.append(f"{rel}: invalid sitemap lastmod")
    article = path.parent.name == "articles" and path.name != "index.html"
    types = []
    for raw in page.jsonld:
        try:
            data = json.loads(raw)
        except json.JSONDecodeError as exc:
            errors.append(f"{rel}: broken JSON-LD: {exc}"); continue
        if not isinstance(data,dict): errors.append(f"{rel}: JSON-LD object expected"); continue
        for obj in data.get("@graph",[data]):
            kind=obj.get("@type");types.append(kind)
            if kind=="Article":
                for required in ("author","datePublished","dateModified","image","headline"):
                    if not obj.get(required): errors.append(f"{rel}: Article.{required} missing")
                if obj.get("dateModified")!=days.get(url): errors.append(f"{rel}: Article dateModified/sitemap mismatch")
                if obj.get("datePublished", "9999")>obj.get("dateModified", ""): errors.append(f"{rel}: published date follows modified date")
            if kind=="BreadcrumbList":
                crumbs=obj.get("itemListElement",[])
                if [x.get("position") for x in crumbs]!=list(range(1,len(crumbs)+1)):errors.append(f"{rel}: breadcrumb positions invalid")
                if not crumbs or crumbs[-1].get("item")!=url:errors.append(f"{rel}: breadcrumb does not end at this page")
    if article and not {"Article","BreadcrumbList"}.issubset(types):errors.append(f"{rel}: article or breadcrumb schema missing")

png=(ROOT/"assets/ogp.png").read_bytes()
if png[:8]!=b"\x89PNG\r\n\x1a\n" or struct.unpack(">II",png[16:24])!=(1200,630):errors.append("OG image must be a 1200x630 PNG")
ads=(ROOT/"ads.txt").read_text()
if "ca-pub-5008692598953577" in home:
    if "google.com, pub-5008692598953577, DIRECT, f08c47fec0942fa0" not in ads:errors.append("AdSense publisher missing from ads.txt")
    for policy in ("privacy.html","advertising.html"):
        if "Google AdSense" not in (ROOT/policy).read_text():errors.append(f"{policy}: AdSense disclosure missing")


if errors:
    print("SITE VALIDATION FAILED")
    for error in errors:
        print("-", error)
    sys.exit(1)

print(f"OK: {len(names)} qualifications, {question_count} questions, {len(article_files)} articles, {len(expected)} sitemap pages, metadata/schema and internal links valid.")
