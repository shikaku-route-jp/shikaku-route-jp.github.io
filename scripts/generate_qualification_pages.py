#!/usr/bin/env python3
"""Render the reviewed guides as static HTML; retain browser data as source of truth."""
import html,json,subprocess,re
from datetime import datetime,timezone,timedelta
from pathlib import Path
from site_common import ROOT,BASE

def e(x):return html.escape(str(x),quote=True)
def table(rows):return '<table class="compare"><tbody>'+''.join(f'<tr><th scope="row">{e(k)}</th><td>{v}</td></tr>' for k,v in rows)+'</tbody></table>'
def section(title,body):return '<section><h2>'+e(title)+'</h2>'+body+'</section>'

def main():
 data=json.loads(subprocess.check_output(['node',str(ROOT/'scripts/export_qualifications.js')],text=True))
 guides=json.loads((ROOT/'data/qualification-guides.json').read_text());quals={q['name']:q for q in data['qualifications']}; schedules=data['schedules']
 article_titles={g['article']:re.sub(r'<[^>]+>','',re.search(r'<h1[^>]*>(.*?)</h1>',(ROOT/'articles'/g['article']).read_text(),re.S)[1]) for g in guides.values()}
 pages={name:'qualifications/'+g['slug']+'.html' for name,g in guides.items()}
 practice={course['qualification']:course for course in data.get('studyCourses',[])}
 directory=ROOT/'qualifications';directory.mkdir(exist_ok=True)
 (ROOT/'assets/qualification-pages.js').write_text('window.QUALIFICATION_PAGES = '+json.dumps(pages,ensure_ascii=False,indent=2)+';\n')
 details={name:{key:g[key] for key in ('fit','eligibility','fee','source_url','source_verified') if key in g} for name,g in guides.items()}
 (ROOT/'assets/qualification-details.js').write_text('window.QUALIFICATION_DETAILS = '+json.dumps(details,ensure_ascii=False,indent=2)+';\n')
 labels={'law':'法律・不動産','finance':'会計・金融・経営','it':'IT・データ','creative':'事務・クリエイティブ','global':'語学・国際・観光','health':'医療・福祉・健康','technical':'技術・現場'}
 level=['','入門','やさしめ','標準','難関','最難関']
 footer='''<footer class="site-footer"><div class="wrap"><nav class="footer-links"><a href="../">資格診断トップ</a><a href="./">資格ガイド一覧</a><a href="../articles/">資格選びの記事</a><a href="../about.html">運営者情報</a><a href="../privacy.html">プライバシーポリシー</a><a href="../advertising.html">広告掲載ポリシー</a><a href="../contact.html">お問い合わせ</a></nav><small>掲載情報は資格選びの参考です。最新情報は各公式サイトでご確認ください。</small></div></footer>'''
 def document(title,desc,slug,body,crumbs):
  return f'''<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>{e(title)}｜資格診断サイト</title><meta name="description" content="{e(desc)}"><meta name="robots" content="index,follow"><link rel="canonical" href="{BASE}/qualifications/{slug}"><link rel="stylesheet" href="../articles/article.css"><script type="application/ld+json">{json.dumps({'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':i+1,'name':name,'item':url} for i,(name,url) in enumerate(crumbs)]},ensure_ascii=False)}</script></head><body><a class="skip-link" href="#main">本文へ移動</a><header class="site-header"><div class="wrap site-header-inner"><a class="brand" href="../"><span class="brand-mark">Q</span>資格診断サイト</a><nav class="header-nav"><a href="./">資格ガイド</a><a href="../#diagnosis">無料診断</a></nav></div></header><main id="main" class="article-main"><div class="wrap">{body}</div></main>{footer}</body></html>\n'''
 today=datetime.now(timezone(timedelta(hours=9))).date().isoformat()
 for name,g in guides.items():
  q=quals[name];schedule=schedules.get(name);title=f'{name}の受験・学習ガイド';url=BASE+'/'+pages[name]
  content='<p class="breadcrumb"><a href="../">診断トップ</a> ／ <a href="./">資格ガイド</a> ／ '+e(name)+'</p>'
  content+='<article class="article-paper"><header class="article-header"><p class="kicker">QUALIFICATION GUIDE</p><h1>'+e(title)+'</h1><p class="lead">'+e(q['desc'])+'</p><p class="article-byline">編集：<a href="../about.html#operator">shikaku-route-jp</a></p><p class="page-meta">更新日：2026年10月17日</p></header><div class="article-body">'
  content+=section('診断の目安と使いどころ',table([('分野',e(labels[q['category']])),('学習期間の目安',f'約{q["months"]}か月（当サイトの比較用目安）'),('難易度の目安',e(level[q['level']])),('診断上の分類','国家資格・国家検定' if q['national'] else '検定・民間資格等')])+'<p>'+e(g['fit'])+'</p><p>期間・難易度は公式が示す標準や合格保証ではありません。既に知っている範囲、毎週使える時間、実技・操作の経験で必要な準備は変わります。求人や実生活で使う場面を一つ決め、必要な級・科目と一致しているか確認してください。</p>')
  if schedule:
   past=schedule.get('type')=='fixed' and schedule.get('next','9999')<today
   date_label=('公表済みの日程（終了）：' if past else '')+schedule['label']
   content+=section('公式の日程・申込先',table([('実施日・方式',e(date_label)),('申込',e('次回日程は公式で確認' if past else schedule['application'])),('補足',e(schedule['note'])),('公式情報の確認日',e(schedule['verified']))])+f'<p><a href="{e(schedule["url"])}">実施団体の公式日程・受験案内を確認 →</a></p><p>上の確認日時点の案内です。変更や会場の満席、休止期間がある場合があります。受験料、別途手数料、受験資格、申込締切、本人確認書類は、申込先の最新要綱で再確認してください。</p>')
  else:
   source=g.get('source_url') or data['sources'][name]['url']
   content+=section('公式の日程・申込先',f'<p>このページには次回日程を掲載していません。受ける試験回・方式、または受講先を決めてから、申込期間・会場・修了条件を公式の案内で確認してください。</p><p><a href="{e(source)}">実施団体・制度の公式案内を確認 →</a></p>')
  if g.get('fee'):
   content+=section('料金と受験条件の確認',table([('受験料等',e(g['fee'])),('受験条件',e(g.get('eligibility','公式の要綱で確認'))),('確認日',e(g['source_verified']))])+f'<p><a href="{e(g["source_url"])}">料金・条件の確認元 →</a></p><p>教材・交通費、合格後の免状・登録等の費用は別です。申込時に最新の料金を再確認してください。</p>')
  content+=section('最初の2週間で確かめること','<p>'+e(g['plan'])+'</p><p>1週目は公式の範囲・問題例を確認し、2週目は同じ範囲をもう一度試します。知らない用語、考え方が分からない問題、時間がかかる操作を区別して記録してください。解説を読んでも進めにくい部分だけ、入門教材や体験講義などで補う方法を比較します。</p>')
  content+=section('始める前に注意したい条件','<p>'+e(g['caution'])+'</p><p>教材・受講料だけで予算を使い切らず、受験手数料、交通費、必要なソフトや道具、登録等にかかる費用も別に書き出します。学習期間中に法改正やバージョン変更がある分野は、出版社の訂正・追補と公式の告知も確認してください。</p>')
  route=[]
  for title2,key in [('基礎を確認する候補','entry'),('その先で比べる候補','next')]:
   other=q[key]
   if other:
    label=f'<a href="../{pages[other]}">{e(other)}</a>' if other in pages else e(other)
    route.append((title2,label))
  if route:content+=section('ほかの資格とどう比べるか',table(route)+'<p>上の資格は学習内容や目的を比べるための候補です。この順番で必ず取得する必要があるという意味ではありません。法令上の受験資格とは分け、目標の試験を直接受けられるかは公式要綱で確認してください。</p>')
  materials='<p><a class="button-link" href="../materials/#fp3">FP3級の教材案内を見る →</a></p>' if name=='FP3級' else '<p><a href="../articles/before-buying-materials.html">教材選びの確認点を読む →</a> ／ <a href="../materials/">教材案内（掲載中：FP3級・イベント検定） →</a></p>'
  if name in practice:
   materials=f'<p><a class="button-link" href="../{e(practice[name]["href"])}">{e(name)}の基礎を無料で5問練習する →</a></p>'+materials
  content+=section('関連する記事と次の行動',f'<p><a href="../articles/{g["article"]}">{e(article_titles[g["article"]])} →</a></p>'+materials+'<p>今の条件で候補を比べ直したい場合は、無料診断で興味・目的・学習時間を整理できます。結果に出た資格が複数あるときは、名前の印象だけで決めず、公式の問題例と仕事で使う場面を並べて比較しましょう。</p><div class="return-row"><a class="button-link" href="../#diagnosis">10問の資格診断をする →</a><a class="button-link secondary" href="./">資格ガイド一覧</a></div>')
  content+='</div></article>'
  (directory/(g['slug']+'.html')).write_text(document(title,f'{name}の公式日程・受験時の注意点・学習の進め方と、診断上の目安を整理します。',g['slug']+'.html',content,[('診断トップ',BASE+'/'),('資格ガイド',BASE+'/qualifications/'),(name,url)]))
 cards=''.join(f'<a class="article-card" href="{g["slug"]}.html"><span class="category">{e(labels[quals[n]["category"]])}</span><h2>{e(n)}</h2><p>{e(g["fit"][:90])}…</p><span class="more">受験・学習ガイド →</span></a>' for n,g in guides.items())
 body=f'<p class="breadcrumb"><a href="../">診断トップ</a> ／ 資格ガイド</p><h1>資格ごとの受験・学習ガイド</h1><p>{len(guides)}資格の公式情報の確認先と、学習を始める前の判断材料をまとめています。日程を掲載していない資格は公式案内から確認してください。</p><p><a href="../materials/">教材案内（FP3級・イベント検定） →</a></p><div class="article-grid">'+cards+'</div>'
 (directory/'index.html').write_text(document('資格ごとの受験・学習ガイド',f'{len(guides)}資格の受験条件・日程の確認先、仕事内容と学習の始め方。診断結果から資格を詳しく比較できます。','',body,[('診断トップ',BASE+'/'),('資格ガイド',BASE+'/qualifications/')]))
 print(f'Rendered {len(guides)} qualification guides and index.')

if __name__=='__main__':main()
