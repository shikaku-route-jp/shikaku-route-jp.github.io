(() => {
  "use strict";

  // Only publish a product guide when its exact qualification and supplied ad code match.
  const PRODUCT_GUIDES = { "FP3級": "materials/#fp3" };

  const ARTICLES = {
    "日商簿記3級": ["bookkeeping3-self-study-months.html", "簿記3級の独学の進め方を読む"],
    "宅地建物取引士": ["takken-suitable.html", "宅建の仕事内容と向いている人を読む"],
    "FP3級": ["fp3-self-study.html", "FP3級の独学の進め方を読む"],
    "ITパスポート": ["itpassport-vs-fe.html", "ITパスポートと基本情報の違いを読む"],
    "基本情報技術者": ["itpassport-vs-fe.html", "ITパスポートと基本情報の違いを読む"]
  };
  const CATEGORY_TIPS = {
    law: "法改正に対応した教材か、対象の試験年度と出版社の訂正・追補情報を確認しましょう。",
    finance: "級や科目、試験方式が一致しているか確認しましょう。制度改正を扱う資格は対象年度にも注意してください。",
    it: "試験のバージョンや出題範囲を確認しましょう。実技や操作を学ぶ教材は、手元のソフト・環境との対応も大切です。",
    global: "級・目標スコアと試験形式をそろえて比較しましょう。音声教材が必要な場合は、再生方法と利用期限も確認してください。",
    health: "受験資格や実務経験の条件を先に確認しましょう。法令・制度を扱う教材は対象年度も確かめてください。",
    creative: "級や試験方式、使用するソフトのバージョンを確認しましょう。実技がある試験は、練習用データや作例も比べてください。",
    technical: "筆記と実技で必要な準備が異なる試験があります。対象科目を確認し、工具・材料なども含めて費用を比べましょう。"
  };

  function build(main, goal) {
    return {
      title: `${main.name}の教材を選ぶ`,
      keyword: `${main.name} テキスト 問題集`,
      summary: main.level >= 4
        ? "学習量の多い資格が候補に出ています。公式の出題範囲と問題例を見て、自分で進められる部分と解説の助けがほしい部分を分けてみましょう。"
        : "まず公式の出題範囲と問題例を確認。解説の分かりやすさと、予定に合う学び方を比べてみましょう。",
      tip: CATEGORY_TIPS[main.category] || "試験名・級・科目・対象年度をそろえて教材を比較しましょう。",
      article: ARTICLES[main.name] || null,
      // This A8 program leads to accounting-software consultation, not exam tuition.
      showBusinessSupport: ["independence", "side"].includes(goal)
        && ["finance", "law"].includes(main.category)
    };
  }

  let fp3CardMounted = false;
  function renderProduct(main) {
    const offer = document.getElementById("fp3ProductOffer");
    const isFp3 = main.name === "FP3級";
    offer.hidden = !isFp3;
    document.getElementById("materialDisclosure").hidden = !isFp3;
    if (!isFp3 || fp3CardMounted) return;
    const template = document.getElementById("fp3AffiliateTemplate");
    if (!template?.content) return;
    const fragment = template.content.cloneNode(true);
    // Keep the supplied advertising script unchanged. A fresh script element is
    // needed to activate the otherwise inert template when this result is shown.
    fragment.querySelectorAll("script").forEach(original => {
      const script = document.createElement("script");
      for (const attribute of original.attributes) script.setAttribute(attribute.name, attribute.value);
      script.textContent = original.textContent;
      original.replaceWith(script);
    });
    document.getElementById("fp3ProductCard").appendChild(fragment);
    fp3CardMounted = true;
  }

  function render(main, goal) {
    const title = document.getElementById("learningTitle");
    if (!title) return;
    const guide = build(main, goal);
    renderProduct(main);
    title.textContent = guide.title;
    const practice = document.getElementById("studyPracticeOffer");
    const course = (window.QualificationStudyCatalog || []).find(item => item.qualification === main.name);
    if (practice) {
      practice.hidden = !course;
      const link = document.getElementById("studyPracticeLink");
      link.href = course ? course.href : "study/";
      link.textContent = course ? `${course.name}の基礎を無料で5問練習する →` : "無料の資格学習を見る →";
    }
    document.getElementById("learningSummary").textContent = guide.summary;
    const materialHref = PRODUCT_GUIDES[main.name];
    document.getElementById("materialsGuideOffer").hidden = !materialHref;
    const materialsLink = document.getElementById("materialsGuideLink");
    materialsLink.href = materialHref || "materials/";
    materialsLink.textContent = `${main.name}の教材紹介を詳しく見る →`;
    const status = document.getElementById("learningMaterialStatus");
    status.hidden = Boolean(materialHref);
    status.textContent = materialHref ? "" : `${main.name}の個別教材紹介は現在掲載していません。公式の出題範囲や問題例を確認してから、教材を選びましょう。`;
    const officialUrl = window.QUALIFICATION_SOURCES?.[main.name]?.url;
    document.getElementById("learningOfficialOffer").hidden = !officialUrl;
    const officialLink = document.getElementById("learningOfficialLink");
    officialLink.href = officialUrl || "#";
    officialLink.textContent = `${main.name}の公式情報・出題範囲を確認する →`;
    document.getElementById("learningTip").textContent = guide.tip;
    document.getElementById("materialKeyword").value = guide.keyword;
    document.getElementById("materialDirectSearch").href = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(guide.keyword)}/`;
    document.getElementById("materialCopyStatus").textContent = "";

    const articles = document.getElementById("learningArticles");
    articles.replaceChildren();
    articles.hidden = !guide.article;
    if (guide.article) {
      const link = document.createElement("a");
      link.href = `articles/${guide.article[0]}`;
      link.textContent = `${guide.article[1]} →`;
      articles.appendChild(link);
    }
    const businessSupport = document.getElementById("businessSupport");
    businessSupport.open = false;
    businessSupport.hidden = !guide.showBusinessSupport;
  }

  const copyButton = document.getElementById("copyMaterialKeyword");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const input = document.getElementById("materialKeyword");
      const status = document.getElementById("materialCopyStatus");
      const keyword = input.value;
      try {
        await navigator.clipboard.writeText(keyword);
        status.textContent = "コピーしました。楽天市場の検索欄に貼り付けて使えます。";
      } catch {
        input.focus();
        input.select();
        status.textContent = "検索語を選択しました。長押しやコピー操作でコピーしてください。";
      }
    });
  }

  window.QualificationLearningGuide = { build, render };
})();
