# 資格ルート案内室

公開サイト: https://shikaku-route-jp.github.io/

100資格・10問の診断と、2〜3資格の候補比較、資格選びの記事、22資格の受験・学習ガイド、教材案内、四字熟語練習帳を公開しています。

## 変更・公開前の確認

```sh
# 資格ガイドの編集データを変えた場合のみ、先に実行する
python scripts/generate_qualification_pages.py

# トップの100資格一覧、共有カード、記事の日付・構造化データ、サイトマップを同期（Node.jsが必要）
python scripts/generate_metadata.py --write
python scripts/validate_site.py
python scripts/check_exam_dates.py
node --test scripts/test_diagnosis.js scripts/test_yoji.js scripts/test_learning_guide.js
node --test scripts/test_comparison_analytics.js
```

Gitの履歴を省略せず取得してください。GitHub Actionsは全履歴を取得し、変更時と週1回、上記の検証とメタ情報の同期を行います。メタ情報のみの自動コミットは更新日の計算対象から除外し、生成処理が自身の日付を更新し続けることを防ぎます。自動更新のコミット後はPagesの再ビルドを要求します。ブランチ保護等で自動コミットが認められない場合は、Actionsのエラーを確認し、生成した差分を通常のレビュー経由で反映してください。

- 診断と100資格のデータ: `assets/app.js`
- 教材案内: `materials/index.html` と `assets/materials.css`。購入リンクは提供された広告コードを使用し、商品説明の確認先と確認日を併記します。
- 国家資格の判定: 各資格データの明示的な `national` フラグ。都道府県の法定制度・研修等の扱いは `methodology.html` に掲載。
- 公式の案内先: `assets/qualification-sources.js`。公式リンクの登録は、将来の試験日や料金の確認を意味しません。総称の資格には実施団体の例を明記します。
- 試験日: `assets/exam-dates.js`。更新時は公式情報のURLと実際の確認日を記録します。
- 個別ガイドの編集内容: `data/qualification-guides.json`
- 記事公開日: `data/article-published.json`（GitHub上の初出履歴を確認した日付を保持）
- OGP: `assets/ogp.png`（1200×630）。faviconはSVG・ICO、タッチアイコンはPNG。

試験日検査は、過去日と確認日の古さを検出する検査です。公式サイトの変更そのものを自動取得・確認するものではありません。公式データを未確認のまま確認日だけ進めないでください。
次回日程を掲載できない資格は `type: "pending"` とし、`next` を設定せず公式案内へ誘導します。終了した試験の日付を次回日程として残したり、翌年の日付を推測したりしないでください。

## 運営情報と外部設定

AdSenseは既存の確認タグを維持し、広告表記・Cookie説明・ads.txtを揃えています。審査承認や配信の成立をコードだけで確認することはできません。

連絡先メールやフォームは未設定です。運営者が公開する連絡先を選んだ後、contact.htmlとprivacy.htmlを同時に更新してください。独自ドメインのCNAME、外部アクセス解析、アフィリエイトの商品リンクは、所有・契約・接続先を確認してから設定します。広告リンクの任意のパラメータを推測して商品リンクへ書き換えません。

スマートフォンのレイアウト、実際の広告表示、Core Web Vitalsは実機とPageSpeed Insightsで確認してください。NodeのDOMテストは実際の描画や第三者広告の動作を再現しません。

## 利用状況の計測を接続する

`assets/analytics-config.js` の `measurementId` に、所有するGA4ウェブデータストリームの測定ID（`G-…`）を設定してください。現在は空欄のため、全訪問者の集計はまだ有効ではありません。IDはGoogle Analyticsの管理画面「データストリーム」から取得します。広告用の `ca-pub-…` とは別です。公開先と所有者を確認せずに他者のIDを転用しないでください。

接続後はGA4のリアルタイムまたはDebugViewで `diagnosis_start`、`diagnosis_step`（1〜10）、`diagnosis_complete`、`materials_open`、`affiliate_click` を確認します。質問への回答と資格名は送信しません。タグ未設定時もブラウザ内の `dataLayer` でイベントを確認できますが、他の訪問者の記録は集まりません。

AdMaxの配信タグは `document.write` を使用します。診断用スクリプトを先に実行し、既存タグをページ末尾でパーサー読み込みした後、`assets/ad-placement.js` が元の広告位置へ枠を移動します。広告タグをasync化したり、iframeでラップしたりしないでください。広告通信が遅い間も質問を操作できますが、実際の配信成立は実機で確認してください。

## 検索向けのHTMLと記事の更新

トップの資格一覧は、`assets/app.js` のカード描画を共有して `generate_metadata.py` が静的HTMLへ出力します。JavaScriptを使えない環境でも100資格と個別ガイドへのリンクを読め、JavaScript有効時は従来どおり16件表示・検索・分野別絞り込みへ切り替わります。資格データを変更した際も、公開前に上記の生成・検証を実行してください。

資格ガイドからの記事リンクは、生成時にリンク先の見出しを読み取ります。記事のタイトルを変更した場合は、資格ガイドを再生成してからメタ情報を同期します。学習期間は当サイトの比較用目安、料金・制度は公式情報として区別し、公式の確認日を編集日だけで書き換えないでください。
