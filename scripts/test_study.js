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
    }
  }
});

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
    const picked = core.pickQuestions(course, state, "random", { area, size: 30 });
    assert.equal(picked.length, 10);
    assert.ok(picked.every(q => q.area === area));
    assert.equal(new Set(picked.map(q => q.id)).size, 10);
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
