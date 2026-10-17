#!/usr/bin/env python3
"""Synchronize shared cards, article dates/schema and sitemap from Git history.
Run before publication: python scripts/generate_metadata.py --write
CI uses a full-history checkout. No build-time external requests are made.
"""
import argparse
from datetime import datetime, timezone, timedelta
import html
import json
from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET
from site_common import ROOT, BASE, Page, content_pages, page_url

JST = timezone(timedelta(hours=9))
IMAGE = BASE + '/assets/ogp.png'
BOT_MESSAGE = '^chore: sync site metadata'

def git_day(path, first=False):
    command = ['git', 'log', '--format=%cI', '--invert-grep', '--grep='+BOT_MESSAGE]
    if first: command += ['--diff-filter=A', '--reverse']
    else: command += ['-1']
    command += ['--', str(path.relative_to(ROOT))]
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True, check=True)
    lines = result.stdout.splitlines()
    if not lines:
        if first: return datetime.now(JST).date().isoformat()
        raise RuntimeError(f'No Git history for {path.name}')
    return datetime.fromisoformat(lines[0]).astimezone(JST).date().isoformat()

def modified_day(path):
    dirty = subprocess.run(['git', 'status', '--porcelain', '--', str(path.relative_to(ROOT))], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return datetime.now(JST).date().isoformat() if dirty.strip() else git_day(path)

def replace_meta(text, key, value, prop=False):
    text = re.sub(r'\s*<meta\s+(?:name|property)=["\']'+re.escape(key)+r'["\'][^>]*>', '', text, flags=re.I)
    attr = 'property' if prop else 'name'
    return text.replace('</head>', f'  <meta {attr}="{key}" content="{html.escape(value, quote=True)}">\n</head>')

def render(path, page, published):
    text = path.read_text(encoding='utf-8'); url = page_url(path)
    # Rebuild one bounded block so a second generation is byte-for-byte identical.
    text = re.sub(r'\s*<!-- shared-site-metadata:start -->.*?<!-- shared-site-metadata:end -->', '', text, flags=re.S)
    text = re.sub(r'\s*<meta\s+(?:name|property)=["\'](?:og:[^"\']+|twitter:[^"\']+)["\'][^>]*>', '', text, flags=re.I)
    text = re.sub(r'\s*<link\s+rel=["\'](?:icon|shortcut icon|apple-touch-icon)["\'][^>]*>', '', text, flags=re.I)
    is_article = path.parent.name == 'articles' and path.name != 'index.html'
    day = modified_day(path)
    text = re.sub(r'(更新(?:日)?[：:]|最終更新[：:])\s*\d{4}年\d{1,2}月\d{1,2}日', lambda m:m[1]+f'{int(day[:4])}年{int(day[5:7])}月{int(day[8:])}日', text)
    def schema(match):
        data = json.loads(match[1])
        if is_article and data.get('@type') == 'BreadcrumbList': return ''
        if data.get('@type') == 'Article':
            data['datePublished'] = data.get('datePublished') or published.get(path.relative_to(ROOT).as_posix()) or git_day(path,True)
            data['dateModified'] = day
            data['author'] = {'@type':'Person','name':'shikaku-route-jp','url':BASE+'/about.html#operator'}
            data['image'] = {'@type':'ImageObject','url':IMAGE,'width':1200,'height':630}
        return '<script type="application/ld+json">'+json.dumps(data,ensure_ascii=False,separators=(',',':'))+'</script>'
    text = re.sub(r'\s*<script type="application/ld\+json">(.*?)</script>',schema,text,flags=re.S)
    if not page.canonicals:
        text = text.replace('</head>',f'<link rel="canonical" href="{url}"></head>')
    if is_article and 'article-byline' not in text:
        text = text.replace('<div class="article-meta">','<p class="article-byline">執筆・編集：<a href="../about.html#operator">shikaku-route-jp</a></p><div class="article-meta">')
    # Prefer the visible title/description over prior generated metadata.
    current=Page(text)
    metas = {'og:type':'article' if is_article else 'website', 'og:locale':'ja_JP', 'og:site_name':'資格ルート案内室', 'og:title':current.title, 'og:description':current.meta.get('description','資格選びと学習の参考情報。'), 'og:url':url, 'og:image':IMAGE, 'og:image:width':'1200', 'og:image:height':'630', 'og:image:type':'image/png', 'og:image:alt':'資格ルート診断 — 100資格から10問で候補を整理', 'twitter:card':'summary_large_image', 'twitter:image':IMAGE, 'twitter:image:alt':'資格ルート診断 — 100資格から10問で候補を整理'}
    lines=['<!-- shared-site-metadata:start -->','<link rel="icon" href="/favicon.ico" sizes="any">','<link rel="icon" href="/favicon.svg" type="image/svg+xml">','<link rel="apple-touch-icon" href="/apple-touch-icon.png">']
    for key,value in metas.items():
        attr='property' if key.startswith('og:') else 'name'
        lines.append(f'<meta {attr}="{key}" content="{html.escape(value,quote=True)}">')
    if is_article:
        crumbs={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'診断トップ','item':BASE+'/'},{'@type':'ListItem','position':2,'name':'資格選びの記事','item':BASE+'/articles/'},{'@type':'ListItem','position':3,'name':current.title.split('｜')[0],'item':url}]}
        lines.append('<script type="application/ld+json">'+json.dumps(crumbs,ensure_ascii=False,separators=(',',':'))+'</script>')
    lines.append('<!-- shared-site-metadata:end -->')
    block='\n'.join('  '+line for line in lines)
    text=re.sub(r'\s*</head>',lambda m:'\n'+block+'\n</head>',text,count=1)
    return text,day

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');args=parser.parse_args()
    seed=ROOT/'data/article-published.json';published=json.loads(seed.read_text()) if seed.exists() else {}
    changed=[]; entries=[]
    for path,page in content_pages(include_noindex=True):
        text,day=render(path,page,published)
        if text!=path.read_text():
            changed.append(str(path.relative_to(ROOT)))
            if args.write:path.write_text(text,encoding='utf-8')
        if 'noindex' not in page.meta.get('robots',''): entries.append((page_url(path),day))
    ET.register_namespace('', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    ns='{http://www.sitemaps.org/schemas/sitemap/0.9}'; tree=ET.Element(ns+'urlset')
    for url,day in entries:
        node=ET.SubElement(tree,ns+'url');ET.SubElement(node,ns+'loc').text=url;ET.SubElement(node,ns+'lastmod').text=day
    ET.indent(tree,space='  ');sitemap=ET.tostring(tree,encoding='unicode',xml_declaration=False)+'\n'
    target=ROOT/'sitemap.xml'
    if sitemap!=target.read_text():
        changed.append('sitemap.xml')
        if args.write:target.write_text(sitemap)
    print(f'{"Updated" if args.write else "Checked"} {len(entries)} indexable pages; {len(changed)} generated differences.')
    if changed and not args.write:raise SystemExit('Run python scripts/generate_metadata.py --write')

if __name__=='__main__':main()
