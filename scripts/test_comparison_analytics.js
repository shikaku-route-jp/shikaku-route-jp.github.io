const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
function compareEnvironment() {
  const nodes = Object.fromEntries(["candidateComparison", "compareCandidate1", "compareCandidate2", "compareCandidate3", "comparisonTable", "comparisonStatus"].map(id => [id, {innerHTML: "", textContent: "", value: ""}]));
  const ctx = vm.createContext({window: {}, document: {getElementById: id => nodes[id]}});
  for (const name of ["qualification-sources.js", "qualification-pages.js", "qualification-details.js", "comparison.js"]) vm.runInContext(read("assets/" + name), ctx);
  const data = JSON.parse(require("node:child_process").execFileSync("node", [path.join(root, "scripts/export_qualifications.js")], {encoding: "utf8"}));
  return {nodes, api: ctx.window.QualificationComparison, window: ctx.window, items: data.qualifications};
}
test("all candidates compare with official links and no invented fees", () => {
  const {api, items} = compareEnvironment();
  for (const item of items) {
    const table = api.build([item]);
    assert.match(table, /公式の条件・料金/);
    assert.match(table, /scope="col"/);
    if (!["FP3級", "G検定", "危険物取扱者 乙種第4類", "宅地建物取引士", "ITパスポート", "基本情報技術者"].includes(item.name)) assert.match(table, /未掲載/);
  }
  assert.match(api.build(items.filter(item => item.name === "G検定")), /13,200/);
  assert.match(api.build(items.filter(item => item.name === "FP3級")), /2026-10-17/);
});
test("comparison supports two candidates, rejects duplicates and resets on a new result", () => {
  const {api, items, nodes} = compareEnvironment();
  api.render(items);
  nodes.compareCandidate3.value = "";
  nodes.compareCandidate3.onchange();
  assert.match(nodes.comparisonTable.innerHTML, /候補の比較（2資格）/);
  nodes.compareCandidate2.value = items[0].name;
  nodes.compareCandidate2.onchange();
  assert.equal(nodes.compareCandidate2.value, items[1].name);
  assert.match(nodes.comparisonStatus.textContent, /同じ資格/);
  api.render(items.slice().reverse());
  assert.equal(nodes.compareCandidate1.value, items.at(-1).name);
  assert.match(nodes.comparisonTable.innerHTML, /候補の比較（3資格）/);
});
test("comparison escapes labels and points only to existing guide files", () => {
  const {api, items, window} = compareEnvironment();
  assert.doesNotMatch(api.build([{...items[0], name: '<img src=x onerror=alert(1)>'}]), /<img/);
  for (const page of Object.values(window.QUALIFICATION_PAGES)) assert.ok(fs.existsSync(path.join(root, page)), page);
  assert.equal(Object.keys(window.QUALIFICATION_PAGES).length, 22);
});
function analyticsEnvironment(id = "", preferences = {}) {
  const scripts = [], listeners = {};
  const window = {SITE_ANALYTICS_CONFIG: {measurementId: id}};
  const ctx = vm.createContext({window, navigator: preferences, location: {origin: "https://shikaku-route-jp.github.io", pathname: "/", href: "https://shikaku-route-jp.github.io/?private=secret"}, URL, document: {title: "資格診断サイト", head: {appendChild: value => scripts.push(value)}, createElement: () => ({}), addEventListener: (name, fn) => listeners[name] = fn}});
  vm.runInContext(read("assets/analytics.js"), ctx);
  return {window, scripts, listeners, api: window.SiteAnalytics};
}
test("missing or invalid measurement ID never loads external analytics", () => {
  for (const id of ["", "ca-pub-123", "https://example.com", "G-"]) {
    const {api, scripts} = analyticsEnvironment(id);
    api.track("diagnosis_start");
    assert.equal(api.enabled, false);
    assert.equal(scripts.length, 0);
  }
});
test("configured analytics respects privacy signals and never sends answers or query strings", () => {
  for (const preference of [{doNotTrack: "1"}, {globalPrivacyControl: true}]) assert.equal(analyticsEnvironment("G-TEST123", preference).scripts.length, 0);
  const {api, scripts, window} = analyticsEnvironment("G-TEST123");
  assert.equal(api.enabled, true);
  assert.equal(scripts.length, 1);
  api.track("diagnosis_complete", {qualification: "非公開の結果", answers: "秘密", destination: "materials"});
  assert.doesNotMatch(JSON.stringify(window.dataLayer), /非公開|秘密|private|secret/);
  assert.match(JSON.stringify(window.dataLayer), /diagnosis_complete/);
  const before = window.dataLayer.length;
  api.track("unknown_event", {destination: "x"});
  assert.equal(window.dataLayer.length, before);
});
test("start counts once per run, restart allows a new run, and material/ad links are classified", () => {
  const {api, window, listeners} = analyticsEnvironment();
  api.track("diagnosis_start");api.track("diagnosis_start");
  assert.equal(window.dataLayer.filter(item => item.event === "diagnosis_start").length, 1);
  api.track("diagnosis_restart");api.track("diagnosis_start");
  assert.equal(window.dataLayer.filter(item => item.event === "diagnosis_start").length, 2);
  for (const href of ["https://shikaku-route-jp.github.io/materials/#fp3", "https://af.moshimo.com/af/c/click?a_id=1"]) listeners.click({target: {closest: () => ({href})}});
  assert.ok(window.dataLayer.some(item => item.event === "materials_open"));
  assert.ok(window.dataLayer.some(item => item.event === "affiliate_click" && item.destination === "rakuten"));
});
test("diagnosis initializes before parser-time AdMax and the supplied tag is unchanged", () => {
  const html = read("index.html");
  const app = html.indexOf('<script src="assets/app.js');
  const ad = html.indexOf('<script src="https://adm.shinobi.jp/o/e9902be8e72218e27d6e6d8d6955455b"></script>');
  assert.ok(app > 0 && ad > app);
  assert.doesNotMatch(html.slice(app, html.indexOf('</script>', app)), /defer|async/);
});
