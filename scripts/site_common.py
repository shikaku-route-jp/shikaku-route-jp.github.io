"""Shared, dependency-free page inventory for generation and validation."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, urljoin
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://shikaku-route-jp.github.io'
LEGACY = {'qualification-route', 'qualification-route-affiliate-updated'}
ADSENSE_ACCOUNT = 'ca-pub-5008692598953577'
ADSENSE_SCRIPT = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client='+ADSENSE_ACCOUNT+'" crossorigin="anonymous"></script>'
ADSENSE_EXCLUDED = {'404.html', 'about.html', 'advertising.html', 'contact.html', 'privacy.html'}

def adsense_page_enabled(path, page):
    """Load ads on content pages, not on utility or unfinished pages."""
    return (path.relative_to(ROOT).as_posix() not in ADSENSE_EXCLUDED
            and 'noindex' not in page.meta.get('robots', '').lower())

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.meta = {}; self.canonicals = []; self.links = []; self.jsonld = []
        self.icons = []; self.title = ''; self._title = False; self._json = None
        self.anchor_links = []; self.h1_count = 0
        self.refresh_target = None
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'a' and a.get('href'): self.anchor_links.append(a['href'])
        if tag == 'h1': self.h1_count += 1
        if tag == 'meta': self.meta[a.get('property', a.get('name', '')).lower()] = a.get('content', '')
        if tag == 'meta' and a.get('http-equiv', '').lower() == 'refresh':
            match = re.search(r';\s*url\s*=\s*(.+)$', a.get('content', ''), re.I)
            if match: self.refresh_target = match[1].strip().strip('"\'')
        if tag == 'link':
            if a.get('rel') == 'canonical': self.canonicals.append(a.get('href', ''))
            if 'icon' in a.get('rel', ''): self.icons.append(a.get('href', ''))
        for key in ('href', 'src'):
            if a.get(key): self.links.append(a[key])
        if tag == 'title': self._title = True
        if tag == 'script' and a.get('type') == 'application/ld+json': self._json = ''
    def handle_data(self, data):
        if self._title: self.title += data
        if self._json is not None: self._json += data
    def handle_endtag(self, tag):
        if tag == 'title': self._title = False
        if tag == 'script' and self._json is not None:
            self.jsonld.append(self._json); self._json = None

def content_pages(include_noindex=False):
    for path in sorted(ROOT.rglob('*.html')):
        parts = path.relative_to(ROOT).parts
        if any(p.startswith('.') or p.startswith('_') for p in parts): continue
        if parts[0] in LEGACY or path.name.startswith('google'): continue
        page = Page(path.read_text(encoding='utf-8'))
        if not include_noindex and 'noindex' in page.meta.get('robots', ''): continue
        yield path, page

def page_url(path):
    relative = path.relative_to(ROOT).as_posix()
    if relative == 'index.html': relative = ''
    elif relative.endswith('/index.html'): relative = relative[:-10]
    return BASE + '/' + relative

def canonical_url(path, page):
    """A noindex migration page consolidates signals at its actual destination."""
    if page.refresh_target and 'noindex' in page.meta.get('robots', '').lower():
        return urljoin(page_url(path), page.refresh_target)
    return page_url(path)
