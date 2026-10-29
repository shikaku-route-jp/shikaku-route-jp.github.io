const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const guideSource = fs.readFileSync(path.join(root, "assets/learning-guide.js"), "utf8");
const appSource = fs.readFileSync(path.join(root, "assets/app.js"), "utf8");
const qualifications = [...appSource.matchAll(/q\("([^"]+)","([^"]+)",(\d),/g)]
  .map(([, name, category, level]) => ({ name, category, level: Number(level) }));

function makeElement() {
  const classes = new Set();
  return {
    children: [], listeners: {}, style: {}, textContent: "", value: "", hidden: false,
    classList: {
      add(value) { classes.add(value); },
      remove(value) { classes.delete(value); },
      contains(value) { return classes.has(value); },
      toggle() {}
    },
    set innerHTML(value) { this._html = value; this.children = []; },
    get innerHTML() { return this._html || ""; },
    addEventListener(type, handler) { this.listeners[type] = handler; },
    appendChild(child) { this.children.push(child); },
    replaceChildren() { this.children = []; },
    closest() { return { classList: { toggle() {} } }; },
    scrollIntoView() {},
    focus() { this.focused = true; },
    select() { this.selected = true; }
  };
}

function environment(writeText = async () => {}) {
  const elements = new Map([...html.matchAll(/\bid="([^"]+)"/g)]
    .map(([, id]) => [id, makeElement()]));
  const document = {
    getElementById(id) {
      assert.ok(elements.has(id), `missing result element: ${id}`);
      return elements.get(id);
    },
    createElement() { return makeElement(); },
    querySelector() { return makeElement(); },
    querySelectorAll() { return []; }
  };
  const window = { print() {}, open() {} };
  const context = vm.createContext({ window, document, navigator: { clipboard: { writeText } },
    location: { href: "https://shikaku-route-jp.github.io/" }, setTimeout() {} });
  vm.runInContext(fs.readFileSync(path.join(root, "assets/study-catalog.js"), "utf8"), context);
  vm.runInContext(fs.readFileSync(path.join(root, "assets/qualification-sources.js"), "utf8"), context);
  vm.runInContext(guideSource, context);
  return { context, window, elements, api: window.QualificationLearningGuide };
}

test("all 100 result qualifications receive guidance without changing their names", () => {
  const { api, elements } = environment();
  assert.equal(qualifications.length, 100);
  for (const main of qualifications) {
    api.render(main, "job");
    assert.equal(elements.get("learningTitle").textContent, `${main.name}の教材を選ぶ`);
    assert.equal(elements.get("materialKeyword").value, `${main.name} テキスト 問題集`);
    assert.ok(elements.get("learningTip").textContent.length > 15);
    assert.equal(elements.get("businessSupport").hidden, true);
  }
});

test("free practice appears only for a published matching course and clears on another result", () => {
  const { api, elements } = environment();
  api.render({ name: "ITパスポート", category: "it", level: 1 }, "job");
  assert.equal(elements.get("studyPracticeOffer").hidden, false);
  assert.equal(elements.get("studyPracticeLink").href, "study/itpassport.html#studySetup");
  api.render({ name: "FP3級", category: "finance", level: 1 }, "job");
  assert.equal(elements.get("studyPracticeOffer").hidden, false);
  assert.equal(elements.get("studyPracticeLink").href, "study/fp3.html#studySetup");
  api.render({ name: "宅地建物取引士", category: "law", level: 3 }, "job");
  assert.equal(elements.get("studyPracticeOffer").hidden, false);
  assert.equal(elements.get("studyPracticeLink").href, "study/takken.html#studySetup");
  api.render({ name: "宅建", category: "legal", level: 2 }, "job");
  assert.equal(elements.get("studyPracticeOffer").hidden, true);
});

test("accounting consultation is limited to relevant goals and categories, including repeat diagnoses", () => {
  const { api, elements } = environment();
  const accounting = { name: "日商簿記3級", category: "finance", level: 1 };
  const law = { name: "行政書士", category: "law", level: 4 };
  for (const goal of ["independence", "side"]) {
    api.render(accounting, goal);
    assert.equal(elements.get("businessSupport").hidden, false);
    api.render(law, goal);
    assert.equal(elements.get("businessSupport").hidden, false);
  }
  for (const goal of ["job", "career", "stability", "daily", undefined]) {
    api.render(accounting, goal);
    assert.equal(elements.get("businessSupport").hidden, true);
  }
  for (const category of ["it", "global", "health", "creative", "technical"]) {
    api.render({ name: "他分野の資格", category, level: 3 }, "independence");
    assert.equal(elements.get("businessSupport").hidden, true);
  }
});

test("related articles exist, and old articles and copy feedback are cleared on a new result", () => {
  const { api, elements } = environment();
  for (const name of ["宅地建物取引士", "FP3級", "ITパスポート", "基本情報技術者"]) {
    api.render(qualifications.find(q => q.name === name), "job");
    const article = elements.get("learningArticles");
    assert.equal(article.hidden, false);
    assert.equal(article.children.length, 1);
    assert.ok(fs.existsSync(path.join(root, article.children[0].href)));
  }
  elements.get("materialCopyStatus").textContent = "以前の検索語";
  api.render(qualifications.find(q => q.name === "税理士"), "job");
  assert.equal(elements.get("learningArticles").hidden, true);
  assert.equal(elements.get("learningArticles").children.length, 0);
  assert.equal(elements.get("materialCopyStatus").textContent, "");
});

test("search keyword can be copied, with manual selection when clipboard access is unavailable", async () => {
  let copied;
  const success = environment(async text => { copied = text; });
  success.api.render(qualifications.find(q => q.name === "FP3級"), "daily");
  await success.elements.get("copyMaterialKeyword").listeners.click();
  assert.equal(copied, "FP3級 テキスト 問題集");
  assert.match(success.elements.get("materialCopyStatus").textContent, /コピーしました/);

  const failure = environment(async () => { throw new Error("clipboard unavailable"); });
  await failure.elements.get("copyMaterialKeyword").listeners.click();
  assert.equal(failure.elements.get("materialKeyword").selected, true);
  assert.match(failure.elements.get("materialCopyStatus").textContent, /検索語を選択/);
});

test("ten questions still produce a result and the matching learning guidance", () => {
  const { context, window, elements } = environment();
  vm.runInContext(appSource, context);
  for (let i = 0; i < 10; i++) {
    assert.equal(elements.get("qCount").textContent, `Q${i + 1} / 10`);
    assert.equal(elements.get("nextBtn").disabled, true);
    elements.get("answerGrid").children[0].listeners.click();
    assert.equal(elements.get("nextBtn").disabled, false);
    elements.get("nextBtn").listeners.click();
  }
  assert.equal(window.__lastResult.ranked.length, 100);
  assert.equal(elements.get("result").classList.contains("show"), true);
  assert.equal(elements.get("learningTitle").textContent, `${window.__lastResult.main.name}の教材を選ぶ`);
  assert.equal(elements.get("businessSupport").hidden, true);
  elements.get("restartBtn").listeners.click();
  assert.equal(elements.get("result").classList.contains("show"), false);
  assert.equal(elements.get("qCount").textContent, "Q1 / 10");
});

test("advertiser destination and affiliate identity are preserved with accurate business labels", () => {
  assert.match(html, /id="businessSupport"[^>]+hidden/);
  assert.match(html, /freee会計の導入相談（株式会社Wiz）/);
  assert.doesNotMatch(html, /講座と料金を見る/);
  assert.match(html, /https:\/\/px\.a8\.net\/svt\/ejp\?a8mat=4B66KJ\+7QMVW2\+3SPO\+9FFFOX/);
  assert.match(html, /"a_id":5837301,"p_id":54,"pl_id":27059,"pc_id":54/);
  assert.match(html, /href="#rakuten-books"/);
});

test("FP3 product card loads once, only for the matching result", () => {
  const { api, elements } = environment();
  let mounts = 0;
  elements.get("fp3AffiliateTemplate").content = {
    cloneNode() {
      mounts++;
      return { querySelectorAll() { return []; } };
    }
  };
  const fp = qualifications.find(q => q.name === "FP3級");
  const other = qualifications.find(q => q.name === "ITパスポート");
  api.render(other, "job");
  assert.equal(mounts, 0);
  assert.equal(elements.get("fp3ProductOffer").hidden, true);
  api.render(fp, "daily");
  assert.equal(mounts, 1);
  assert.equal(elements.get("fp3ProductOffer").hidden, false);
  api.render(other, "job");
  assert.equal(elements.get("fp3ProductOffer").hidden, true);
  api.render(fp, "job");
  assert.equal(mounts, 1);
  assert.equal(elements.get("fp3ProductCard").children.length, 1);
});


test("all diagnosis results show only an exact product match and their own official source", () => {
  const { api, elements, window } = environment();
  const materialGuides = { "FP3級": "materials/#fp3", "ITパスポート": "materials/#itpassport" };
  for (const main of qualifications) {
    api.render(main, "job");
    const hasProduct = main.name === "FP3級";
    assert.equal(elements.get("fp3ProductOffer").hidden, !hasProduct, main.name);
    const hasGuide = Boolean(materialGuides[main.name]);
    assert.equal(elements.get("materialsGuideOffer").hidden, !hasGuide, main.name);
    assert.equal(elements.get("materialDisclosure").hidden, !hasProduct, main.name);
    assert.equal(elements.get("learningMaterialStatus").hidden, hasGuide, main.name);
    assert.equal(elements.get("learningOfficialOffer").hidden, false, main.name);
    assert.equal(elements.get("learningOfficialLink").href, window.QUALIFICATION_SOURCES[main.name].url);
    if (hasGuide) {
      assert.equal(elements.get("materialsGuideLink").href, materialGuides[main.name]);
      assert.equal(elements.get("learningMaterialStatus").textContent, "");
    } else {
      assert.ok(elements.get("learningMaterialStatus").textContent.includes(main.name));
    }
  }
  // Event materials stay available on their own shelf, outside unrelated diagnosis results.
  assert.doesNotMatch(html, /event-product-offer|楽天市場トップへ/);
  assert.match(fs.readFileSync(path.join(root, "materials/index.html"), "utf8"), /id="event"/);
});
