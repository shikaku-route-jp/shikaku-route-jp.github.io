const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const core = require("../assets/study.js");
const course = require("../assets/study/itpassport.js");
const catalog = require("../assets/study-catalog.js");
const root = path.resolve(__dirname, "..");
const today = "2026-10-20";

test("every published course has a matching bank, page, source and valid questions", () => {
  assert.equal(new Set(catalog.map(c => c.id)).size, catalog.length);
  const home = fs.readFileSync(path.join(root, "study/index.html"), "utf8");
  for (const entry of catalog) {
    const bank = require(path.join(root, "assets/study", entry.id + ".js"));
    assert.equal(bank.id, entry.id);
    assert.equal(bank.name, entry.name);
    assert.equal(bank.questions.length, entry.count);
    assert.equal(new Set(bank.questions.map(q => (q.example || "") + q.question)).size, entry.count);
    assert.equal(new Set(bank.questions.map(q => q.id)).size, entry.count);
    assert.ok(fs.existsSync(path.join(root, entry.href)));
    assert.ok(home.includes(path.basename(entry.href)));
    assert.match(bank.source, /^https:\/\//);
    const page = fs.readFileSync(path.join(root, entry.href), "utf8");
    assert.ok(page.includes(`data-study-course="${entry.id}"`));
    assert.ok(page.includes(`${entry.count}問`));
    for (const q of bank.questions) {
      assert.match(q.id, /^[a-z][a-z0-9-]+$/);
      assert.ok(bank.areas[q.area]);
      assert.equal(q.choices.length, 4);
      assert.equal(new Set(q.choices).size, 4);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4);
      for (const key of ["topic", "question", "explanation", "takeaway"]) assert.ok(q[key]?.trim(), q.id + ":" + key);
      if (q.source) assert.equal(new URL(q.source).protocol, "https:");
    }
  }
});

test("all questions can be completed and saved in each course", () => {
  for (const entry of catalog) {
    const bank = require(path.join(root, "assets/study", entry.id + ".js"));
    const state = core.emptyProgress();
    assert.equal(core.startSession(state, bank, "random", { size: entry.count }), true);
    for (let i = 0; i < entry.count; i++) {
      const q = bank.questions.find(q => q.id === state.active.ids[state.active.position]);
      assert.equal(core.answerSession(state, bank, q.answer, today), true);
      assert.equal(core.advanceSession(state), i < entry.count - 1);
    }
    assert.equal(state.active.results.filter(r => r.correct).length, entry.count);
    const saved = core.normalizeProgress(JSON.parse(JSON.stringify(state)), bank, today);
    assert.equal(core.stats(saved, bank, today).seen, entry.count);
    assert.equal(core.stats(saved, bank, today).review, 0);
  }
});

test("records and unfinished sessions from the original banks survive expansion", () => {
  const legacy = { itpassport: ["swot", 0], "world-heritage3": ["heritage-purpose", 1], "eiken-pre2": ["improve", 1] };
  for (const entry of catalog.filter(item => Object.hasOwn(legacy, item.id))) {
    const bank = require(path.join(root, "assets/study", entry.id + ".js"));
    const [id, choice] = legacy[entry.id];
    const old = { version: 1, records: { [id]: { attempts: 1, correct: 0, review: true, streak: 0 } }, daily: { [today]: [id] },
      active: { mode: "review", bankVersion: 1, ids: [id], position: 0, results: [] } };
    const restored = core.normalizeProgress(old, bank, today);
    assert.equal(restored.records[id].review, true);
    assert.deepEqual(restored.active.ids, [id]);
    assert.equal(core.answerSession(restored, bank, choice, today), true);
    assert.equal(restored.active.results[0].correct, true);
    assert.equal(restored.records[id].attempts, 2);
  }
});

test("study ads load once per page, after core UI, outside answer panels", () => {
  const pages = ["study/index.html", ...catalog.map(c => c.href)];
  for (const name of pages) {
    const page = fs.readFileSync(path.join(root, name), "utf8");
    const tag = 'https://adm.shinobi.jp/o/e9902be8e72218e27d6e6d8d6955455b';
    assert.equal(page.split(tag).length - 1, 1);
    assert.equal(page.split('id="siteAdSlot"').length - 1, 1);
    assert.ok(page.includes('aria-label="スポンサーリンク"'));
    assert.ok(page.indexOf('id="siteAdSlot"') > page.indexOf('id="studyResult"') || name === "study/index.html");
    if (name !== "study/index.html") {
      const coreScript = page.match(/<script src="\.\.\/assets\/study\.js[^\"]*"><\/script>/);
      assert.ok(coreScript, "core must execute before the parser-time vendor tag");
      assert.ok(page.indexOf(coreScript[0]) < page.indexOf(tag));
    }
    assert.ok(page.indexOf('assets/ad-placement.js') > page.indexOf(tag));
  }
});

test("study pages stay within the owned-code size budget and load only their own bank", () => {
  for (const name of ["study/index.html", ...catalog.map(c => c.href)]) {
    const html = fs.readFileSync(path.join(root, name), "utf8");
    assert.ok(Buffer.byteLength(html) <= 32 * 1024, name + ": HTML exceeds 32 KiB");
    const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(m => m[1]).filter(s => !s.startsWith("https:") && !s.startsWith("//"));
    const styles = [...html.matchAll(/<link[^>]+href="([^"]+\.css(?:\?[^"]*)?)"/g)].map(m => m[1]);
    const size = files => files.reduce((sum, file) => sum + fs.statSync(path.resolve(file.startsWith("/") ? root : path.dirname(path.join(root, name)), file.replace(/^\//, "").split("?")[0])).size, 0);
    assert.ok(size(scripts) <= 128 * 1024, name + ": owned JS exceeds 128 KiB; split loading before expanding");
    assert.ok(size(styles) <= 64 * 1024, name + ": CSS exceeds 64 KiB");
    const banks = scripts.filter(s => /\/study\/[^/]+\.js/.test(s));
    const entry = catalog.find(c => c.href === name);
    assert.equal(banks.length, entry ? 1 : 0);
    if (entry) assert.ok(banks[0].includes("/study/" + entry.id + ".js"));
  }
});

for (const id of ["world-heritage3", "eiken-pre2", "bookkeeping3", "fp3"]) {
  test(id + " supports balanced daily practice, area practice, resume and review", () => {
    const bank = require(path.join(root, "assets/study", id + ".js"));
    const state = core.emptyProgress();
    const daily = core.dailyQuestions(bank, today);
    assert.deepEqual(daily, core.dailyQuestions(bank, today));
    assert.equal(daily.length, 5);
    assert.equal(new Set(daily.map(q => q.id)).size, 5);
    assert.equal(new Set(daily.map(q => q.area)).size, 3);
    for (const area of Object.keys(bank.areas)) {
      const picked = core.pickQuestions(bank, state, "random", { area, size: 100 });
      assert.equal(picked.length, bank.questions.filter(q => q.area === area).length);
      assert.ok(picked.every(q => q.area === area));
    }
    core.startSession(state, bank, "daily", { today });
    const first = daily[0];
    core.answerSession(state, bank, (first.answer + 1) % 4, today);
    const resumed = core.normalizeProgress(JSON.parse(JSON.stringify(state)), bank, today);
    assert.equal(resumed.records[first.id].review, true);
    assert.equal(core.answerSession(resumed, bank, first.answer, today), false);
    for (let round = 0; round < 2; round++) {
      core.startSession(resumed, bank, "review", { size: 5 });
      assert.deepEqual(resumed.active.ids, [first.id]);
      core.answerSession(resumed, bank, first.answer, today);
    }
    assert.equal(core.stats(resumed, bank, today).review, 0);
    const page = fs.readFileSync(path.join(root, catalog.find(entry => entry.id === id).href), "utf8");
    assert.ok(page.includes('data-study-reference="cards"'));
    assert.match(page, /カードを見るだけでは学習記録に加算されません/);
  });
}

test("daily set is stable, unique and covers the three areas", () => {
  const first = core.dailyQuestions(course, today);
  assert.equal(first.length, 5);
  assert.equal(new Set(first.map(q => q.id)).size, 5);
  assert.deepEqual(first, core.dailyQuestions(course, today));
  assert.equal(new Set(first.map(q => q.area)).size, 3);
  assert.notDeepEqual(first, core.dailyQuestions(course, "2026-10-21"));
  assert.equal(core.dayKey(new Date("2026-10-20T14:59:59Z")), "2026-10-20");
  assert.equal(core.dayKey(new Date("2026-10-20T15:00:00Z")), "2026-10-21");
});

test("selected area and actual pool limit session size without repeats", () => {
  const state = core.emptyProgress();
  for (const area of Object.keys(course.areas)) {
    const picked = core.pickQuestions(course, state, "random", { area, size: 100 });
    assert.equal(picked.length, course.questions.filter(q => q.area === area).length);
    assert.ok(picked.every(q => q.area === area));
    assert.equal(new Set(picked.map(q => q.id)).size, picked.length);
  }
  assert.deepEqual(core.pickQuestions(course, state, "random", { area: "missing" }), []);
  assert.deepEqual(core.pickQuestions(course, state, "unknown"), []);
  assert.deepEqual(core.pickQuestions(course, state, "review"), []);
  assert.equal(core.startSession(state, course, "review"), false);
});

test("a wrong answer enters review, two consecutive correct attempts remove it", () => {
  const state = core.emptyProgress();
  core.startSession(state, course, "daily", { today });
  const q = course.questions.find(q => q.id === state.active.ids[0]);
  core.answerSession(state, course, (q.answer + 1) % 4, today);
  assert.equal(core.stats(state, course, today).review, 1);
  assert.equal(state.records[q.id].streak, 0);
  for (let i = 1; i <= 2; i++) {
    assert.equal(core.startSession(state, course, "review", { size: 5 }), true);
    assert.deepEqual(state.active.ids, [q.id]);
    core.answerSession(state, course, q.answer, today);
    assert.equal(state.records[q.id].streak, i);
    assert.equal(state.records[q.id].review, i < 2);
  }
  assert.equal(core.stats(state, course, today).review, 0);
});

test("an intervening wrong answer resets the review streak", () => {
  const state = core.emptyProgress();
  core.startSession(state, course, "daily", { today });
  const q = course.questions.find(q => q.id === state.active.ids[0]);
  for (const answer of [(q.answer + 1) % 4, q.answer, (q.answer + 1) % 4, q.answer]) {
    state.active = { mode: "review", bankVersion: course.version, ids: [q.id], position: 0, results: [] };
    core.answerSession(state, course, answer, today);
  }
  assert.equal(state.records[q.id].review, true);
  assert.equal(state.records[q.id].streak, 1);
});

test("double clicks and resuming feedback never count the same answer twice", () => {
  const state = core.emptyProgress();
  core.startSession(state, course, "daily", { today });
  const q = course.questions.find(q => q.id === state.active.ids[0]);
  assert.equal(core.answerSession(state, course, q.answer, today), true);
  assert.equal(core.answerSession(state, course, q.answer, today), false);
  const resumed = core.normalizeProgress(JSON.parse(JSON.stringify(state)), course, today);
  assert.equal(core.answerSession(resumed, course, q.answer, today), false);
  assert.equal(resumed.records[q.id].attempts, 1);
  assert.equal(resumed.active.results.length, 1);
  assert.equal(core.advanceSession(resumed), true);
  assert.equal(resumed.active.position, 1);
  assert.equal(core.advanceSession(resumed), false);
});

test("finishing all questions preserves accurate progress and results", () => {
  const state = core.emptyProgress();
  core.startSession(state, course, "daily", { today });
  for (let i = 0; i < 5; i++) {
    const q = course.questions.find(q => q.id === state.active.ids[state.active.position]);
    core.answerSession(state, course, q.answer, today);
    assert.equal(core.advanceSession(state), i < 4);
  }
  assert.equal(state.active.results.filter(r => r.correct).length, 5);
  assert.deepEqual(core.stats(state, course, today), { seen: 5, review: 0, daily: 5 });
  core.startSession(state, course, "daily", { today });
  const q = course.questions.find(q => q.id === state.active.ids[0]);
  core.answerSession(state, course, q.answer, today);
  assert.equal(core.stats(state, course, today).daily, 5);
});

test("bad storage, old bank versions and impossible sessions recover safely", () => {
  for (const raw of [null, 42, [], "bad", { version: 99 }, { version: 1, active: { ids: ["missing"] } }]) {
    assert.deepEqual(core.normalizeProgress(raw, course, today), core.emptyProgress());
  }
  const state = core.emptyProgress();
  core.startSession(state, course, "daily", { today });
  state.active.bankVersion = 0;
  assert.equal(core.normalizeProgress(state, course, today).active, null);
  state.active.bankVersion = course.version;
  state.active.ids[1] = state.active.ids[0];
  assert.equal(core.normalizeProgress(state, course, today).active, null);
  state.records[course.questions[0].id] = { attempts: 1, correct: 3, review: true };
  assert.deepEqual(core.normalizeProgress(state, course, today).records, {});
});

test("daily records are unique and bounded while historical review remains", () => {
  const state = core.emptyProgress();
  for (let day = 1; day <= 15; day++) {
    core.startSession(state, course, "random", { size: 1 });
    core.answerSession(state, course, 0, `2026-10-${String(day).padStart(2, "0")}`);
  }
  assert.equal(Object.keys(state.daily).length, 7);
  assert.ok(Object.keys(state.records).length > 0);
  const normalized = core.normalizeProgress(state, course, today);
  assert.equal(Object.keys(normalized.daily).length, 7);
  const q = course.questions[0];
  state.daily[today] = [q.id, q.id, "missing"];
  state.daily["2099-01-01"] = [q.id];
  assert.deepEqual(core.normalizeProgress(state, course, today).daily[today], [q.id]);
  assert.equal(core.normalizeProgress(state, course, today).daily["2099-01-01"], undefined);
});

test("bookkeeping entries balance and representative calculations keep their expected results", () => {
  const bank = require("../assets/study/bookkeeping3.js");
  let entries = 0;
  const amount = text => [...text.matchAll(/([0-9][0-9,]*)円/g)].reduce((sum, match) => sum + Number(match[1].replaceAll(",", "")), 0);
  for (const q of bank.questions) {
    const answer = q.choices[q.answer];
    if (!answer.startsWith("借方：")) continue;
    const sides = answer.split(" ／ ");
    assert.equal(sides.length, 2, q.id);
    assert.ok(sides[1].startsWith("貸方："), q.id);
    assert.ok(amount(sides[0]) > 0, q.id);
    assert.equal(amount(sides[0]), amount(sides[1]), q.id + ": journal must balance");
    entries++;
  }
  assert.ok(entries >= 60);
  const expected = {
    "equity-equation": "700,000円",
    "net-profit": "300,000円",
    "cost-of-sales": "180,000円",
    "depreciation-amount": "24,000円",
    "equipment-book-value": "40,000円",
    "allowance-target": "2,000円",
    "total-assets": "140,000円",
    "gross-profit": "120,000円",
    "credit-card-sale": "借方：クレジット売掛金 9,700円・支払手数料 300円 ／ 貸方：売上 10,000円",
    "allowance-top-up": "借方：貸倒引当金繰入 1,500円 ／ 貸方：貸倒引当金 1,500円",
    "prepaid-insurance": "借方：前払保険料 3,000円 ／ 貸方：保険料 3,000円",
    "unearned-rent": "借方：受取家賃 9,000円 ／ 貸方：前受家賃 9,000円"
  };
  for (const [id, answer] of Object.entries(expected)) {
    const q = bank.questions.find(q => q.id === id);
    assert.ok(q, id);
    assert.equal(q.choices[q.answer], answer, id);
  }
  const guide = fs.readFileSync(path.join(root, "qualifications/bookkeeping3.html"), "utf8");
  assert.ok(guide.includes('href="../study/bookkeeping3.html"'));
});
