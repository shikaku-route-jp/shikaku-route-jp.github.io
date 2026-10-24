(function (root) {
  "use strict";
  const DAY_LIMIT = 7;
  const MODES = new Set(["daily", "random", "review"]);
  const object = value => value && typeof value === "object" && !Array.isArray(value);
  const integer = value => Number.isInteger(value) && value >= 0;
  function dayKey(date = new Date()) {
    return new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(date);
  }
  function shuffled(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function seeded(text) {
    let seed = 2166136261;
    for (const char of text) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
    return () => { seed = Math.imul(1664525, seed) + 1013904223 | 0; return (seed >>> 0) / 4294967296; };
  }
  function emptyProgress() { return { version: 1, records: {}, daily: {}, active: null }; }
  function normalizeProgress(raw, course, today = dayKey()) {
    const value = object(raw) && raw.version === 1 ? raw : {};
    const state = emptyProgress();
    const questions = new Map(course.questions.map(q => [q.id, q]));
    for (const q of course.questions) {
      const record = object(value.records) ? value.records[q.id] : null;
      if (!object(record) || !integer(record.attempts) || !integer(record.correct) || record.correct > record.attempts) continue;
      state.records[q.id] = { attempts: Math.min(record.attempts, 1000000), correct: Math.min(record.correct, 1000000), review: record.review === true, streak: integer(record.streak) ? Math.min(record.streak, 2) : 0 };
    }
    if (object(value.daily)) {
      for (const day of Object.keys(value.daily).filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day) && day <= today).sort().slice(-DAY_LIMIT)) {
        if (Array.isArray(value.daily[day])) state.daily[day] = [...new Set(value.daily[day].filter(id => questions.has(id)))];
      }
    }
    const active = value.active;
    if (object(active) && active.bankVersion === course.version && MODES.has(active.mode)
      && Array.isArray(active.ids) && active.ids.length > 0 && active.ids.length <= course.questions.length
      && active.ids.every(id => questions.has(id)) && new Set(active.ids).size === active.ids.length
      && integer(active.position) && active.position < active.ids.length && Array.isArray(active.results)
      && [active.position, active.position + 1].includes(active.results.length)
      && active.results.every((result, i) => object(result) && result.id === active.ids[i]
        && integer(result.choice) && result.choice < questions.get(result.id).choices.length)) {
      state.active = { mode: active.mode, bankVersion: course.version, ids: [...active.ids], position: active.position,
        results: active.results.map(result => ({ id: result.id, choice: result.choice, correct: result.choice === questions.get(result.id).answer })) };
    }
    return state;
  }
  function dailyQuestions(course, today = dayKey()) {
    const random = seeded(course.id + ":" + today);
    const groups = shuffled(Object.keys(course.areas), random)
      .map(area => shuffled(course.questions.filter(q => q.area === area), random));
    const result = [];
    while (result.length < Math.min(5, course.questions.length)) {
      let found = false;
      for (const group of groups) {
        if (group.length && result.length < 5) { result.push(group.pop()); found = true; }
      }
      if (!found) break;
    }
    return result;
  }
  function pickQuestions(course, progress, mode, { area = "all", size = 5, today = dayKey(), random = Math.random } = {}) {
    if (!MODES.has(mode)) return [];
    if (mode === "daily") return dailyQuestions(course, today);
    const pool = course.questions.filter(q => (mode === "review" ? progress.records[q.id]?.review : area === "all" || q.area === area));
    const count = integer(size) && size > 0 ? Math.min(size, pool.length) : Math.min(5, pool.length);
    return shuffled(pool, random).slice(0, count);
  }
  function startSession(progress, course, mode, options) {
    const questions = pickQuestions(course, progress, mode, options);
    if (!questions.length) return false;
    progress.active = { mode, bankVersion: course.version, ids: questions.map(q => q.id), position: 0, results: [] };
    return true;
  }
  function answerSession(progress, course, choice, today = dayKey()) {
    const session = progress.active;
    if (!session || session.results[session.position]) return false;
    const question = course.questions.find(q => q.id === session.ids[session.position]);
    if (!question || !integer(choice) || choice >= question.choices.length) return false;
    const correct = choice === question.answer;
    const record = progress.records[question.id] || { attempts: 0, correct: 0, review: false, streak: 0 };
    record.attempts += 1;
    if (correct) { record.correct += 1; record.streak = Math.min(2, record.streak + 1); if (record.streak === 2) record.review = false; }
    else { record.review = true; record.streak = 0; }
    progress.records[question.id] = record;
    progress.daily[today] = [...new Set([...(progress.daily[today] || []), question.id])];
    for (const day of Object.keys(progress.daily).sort().slice(0, -DAY_LIMIT)) delete progress.daily[day];
    session.results.push({ id: question.id, choice, correct });
    return true;
  }
  function advanceSession(progress) {
    if (!progress.active || !progress.active.results[progress.active.position]) return false;
    if (progress.active.position + 1 === progress.active.ids.length) return false;
    progress.active.position += 1;
    return true;
  }
  function stats(progress, course, today = dayKey()) {
    const answered = new Set(progress.daily[today] || []);
    return { seen: course.questions.filter(q => progress.records[q.id]?.attempts > 0).length,
      review: course.questions.filter(q => progress.records[q.id]?.review).length,
      daily: dailyQuestions(course, today).filter(q => answered.has(q.id)).length };
  }
  const api = { dayKey, emptyProgress, normalizeProgress, dailyQuestions, pickQuestions, startSession, answerSession, advanceSession, stats };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QualificationStudyCore = api;
  if (typeof document === "undefined") return;
  const mount = document.querySelector("[data-study-course]");
  if (!mount) return;
  const course = root.QualificationStudyBanks?.[mount.dataset.studyCourse];
  if (!course) return;
  const storageKey = "qualification-study:v1:" + course.id;
  const get = id => document.getElementById(id);
  const byId = new Map(course.questions.map(q => [q.id, q]));
  const labels = { daily: "今日の5問", random: "分野別・ランダム", review: "間違い復習" };
  let progress = emptyProgress();
  let storageWorks = true;
  try { progress = normalizeProgress(JSON.parse(root.localStorage.getItem(storageKey)), course); }
  catch { storageWorks = false; }
  function node(tag, text, className) {
    const item = document.createElement(tag);
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
  }
  function sourceLink(question) {
    if (!question.source || !question.source.startsWith("https://")) return null;
    const paragraph = node("p", undefined, "study-small");
    const link = node("a", "このテーマの確認元 →");
    link.href = question.source;
    paragraph.append(link);
    return paragraph;
  }
  // Lesson IDs belong to the current page, never to saved progress.
  const lessons = new Map();
  document.querySelectorAll("[data-lesson-questions]").forEach(detail => {
    for (const id of detail.dataset.lessonQuestions.split(/\s+/)) lessons.set(id, detail);
  });
  function lessonLink(question) {
    const detail = lessons.get(question.id);
    if (!detail) return null;
    const paragraph = node("p");
    const link = node("a", "このテーマを詳しく学ぶ →");
    link.href = "#" + detail.id;
    link.addEventListener("click", event => {
      event.preventDefault();
      detail.open = true;
      let back = detail.querySelector(".study-lesson-return");
      if (!back) {
        back = node("button", "読んでいた解説に戻る →", "btn study-lesson-return");
        back.type = "button";
        detail.append(back);
      }
      back.onclick = () => {
        const target = link.isConnected ? link : get("studySetupTitle");
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: "center", behavior: "auto" });
      };
      detail.querySelector("summary").focus({ preventScroll: true });
      detail.scrollIntoView({ block: "start", behavior: "auto" });
    });
    paragraph.append(link);
    return paragraph;
  }
  function storageMessage() {
    get("studyStorageNote").textContent = storageWorks
      ? "記録はこのブラウザに保存します。別の端末との共有はありません。"
      : "記録を保存できません。この画面を開いている間は学習できますが、再読み込みすると今回の記録が失われる場合があります。";
  }
  function save() {
    try { root.localStorage.setItem(storageKey, JSON.stringify(progress)); storageWorks = true; }
    catch { storageWorks = false; }
    storageMessage();
  }
  function dashboard() {
    const count = stats(progress, course);
    get("studySeen").textContent = count.seen;
    get("studyReviewCount").textContent = count.review;
    get("studyDailyCount").textContent = count.daily;
    get("studyDailyStart").textContent = count.daily === Math.min(5, course.questions.length) ? "今日の5問をもう一度 →" : "今日の5問を始める →";
    for (const id of ["studyReviewStart", "studyResultReview"]) {
      get(id).disabled = count.review === 0;
      get(id).textContent = count.review ? `間違い復習（${count.review}問から最大5問）` : "復習する問題はまだありません";
    }
    get("studyResume").hidden = !progress.active;
    if (progress.active) get("studyResume").textContent = `中断した学習の続きへ（${progress.active.position + 1} / ${progress.active.ids.length}問目）`;
    storageMessage();
  }
  function show(panel, heading) {
    for (const id of ["studySetup", "studyQuiz", "studyResult"]) get(id).hidden = id !== panel;
    dashboard();
    const title = get(heading);
    title.focus({ preventScroll: true });
    get(panel).scrollIntoView({ block: "start", behavior: "auto" });
  }
  function feedback(question, result) {
    const panel = get("studyFeedback");
    panel.hidden = !result;
    if (!result) { panel.replaceChildren(); return; }
    panel.className = "study-feedback " + (result.correct ? "is-correct" : "is-wrong");
    panel.replaceChildren(node("h3", result.correct ? "正解です" : "この問題は復習に残しました"),
      node("p", "正解：" + question.choices[question.answer], "study-answer"),
      node("p", question.explanation), node("p", "覚えるポイント：" + question.takeaway, "study-takeaway"));
    const source = sourceLink(question);
    if (source) panel.append(source);
    const lesson = lessonLink(question);
    if (lesson) panel.append(lesson);
  }
  function renderQuestion(focus = true) {
    const session = progress.active;
    if (!session) return;
    const question = byId.get(session.ids[session.position]);
    const result = session.results[session.position];
    get("studyModeLabel").textContent = labels[session.mode];
    get("studyQuestionCount").textContent = `${session.position + 1} / ${session.ids.length}問`;
    get("studyProgress").max = session.ids.length;
    get("studyProgress").value = session.position + (result ? 1 : 0);
    get("studyTopic").textContent = course.areas[question.area] + (result ? " / " + question.topic : "");
    const example = get("studyExample");
    example.hidden = !question.example;
    example.textContent = question.example || "";
    get("studyQuestion").textContent = question.question;
    const choices = get("studyChoices");
    choices.replaceChildren();
    question.choices.forEach((text, index) => {
      const button = node("button", undefined, "study-choice");
      button.type = "button";
      button.setAttribute("aria-pressed", String(result?.choice === index));
      button.append(node("span", String.fromCharCode(65 + index), "study-choice-letter"), node("span", text, "study-choice-text"));
      if (result) {
        button.disabled = true;
        if (index === question.answer) { button.classList.add("is-correct"); button.append(node("span", "正解", "study-choice-mark")); }
        else if (index === result.choice) { button.classList.add("is-wrong"); button.append(node("span", "選んだ回答", "study-choice-mark")); }
      }
      button.addEventListener("click", () => {
        if (!answerSession(progress, course, index)) return;
        save(); renderQuestion(false); dashboard();
        get("studyFeedback").focus({ preventScroll: true });
        get("studyFeedback").scrollIntoView({ block: "nearest", behavior: "auto" });
      });
      choices.append(button);
    });
    feedback(question, result);
    get("studyNext").hidden = !result;
    get("studyNext").textContent = session.position + 1 === session.ids.length ? "今回のまとめを見る →" : "次の問題 →";
    if (focus) show("studyQuiz", "studyQuestion");
  }
  function begin(mode) {
    const today = dayKey();
    if (mode === "daily" && progress.active?.mode === "daily"
      && progress.active.ids.join() === dailyQuestions(course, today).map(q => q.id).join()) { renderQuestion(); return; }
    if (startSession(progress, course, mode, { area: get("studyArea").value, size: Number(get("studySize").value), today })) {
      save(); renderQuestion();
    }
  }
  function complete() {
    const session = progress.active;
    const correct = session.results.filter(result => result.correct).length;
    get("studyResultTitle").textContent = `${session.ids.length}問、おつかれさまでした。`;
    get("studyResultScore").textContent = `今回は ${correct} / ${session.ids.length}問 正解`;
    const list = get("studyResultList");
    list.replaceChildren();
    for (const result of session.results) {
      const q = byId.get(result.id);
      const detail = node("details");
      detail.append(node("summary", (result.correct ? "○ 正解：" : "復習：") + q.topic),
        node("p", (q.example ? q.example + " " : "") + q.question), node("p", "選んだ回答：" + q.choices[result.choice]),
        node("p", "正解：" + q.choices[q.answer]), node("p", q.explanation));
      const lesson = lessonLink(q);
      if (lesson) detail.append(lesson);
      list.append(detail);
    }
    progress.active = null;
    save(); show("studyResult", "studyResultTitle");
  }
  get("studyLessonsMenu")?.addEventListener("click", event => {
    event.preventDefault();
    show("studySetup", "studySetupTitle");
  });
  get("studyDailyStart").addEventListener("click", () => begin("daily"));
  get("studyRandomStart").addEventListener("click", () => begin("random"));
  for (const id of ["studyReviewStart", "studyResultReview"]) get(id).addEventListener("click", () => {
    if (startSession(progress, course, "review", { size: 5 })) { save(); renderQuestion(); }
  });
  get("studyResume").addEventListener("click", () => renderQuestion());
  get("studyNext").addEventListener("click", () => {
    if (!progress.active?.results[progress.active.position]) return;
    if (advanceSession(progress)) { save(); renderQuestion(); } else complete();
  });
  get("studyQuit").addEventListener("click", () => show("studySetup", "studySetupTitle"));
  get("studyBackToSetup").addEventListener("click", () => show("studySetup", "studySetupTitle"));
  get("studyAgain").addEventListener("click", () => begin("random"));
  get("studyReset").addEventListener("click", () => {
    progress = emptyProgress(); save(); show("studySetup", "studySetupTitle");
    get("studyResetStatus").textContent = storageWorks ? `${course.name}の学習記録を消しました。` : "画面内の記録をリセットしました。保存済み記録の削除は確認できません。";
  });
  const reference = get("studyReferenceList");
  const cards = reference.dataset.studyReference === "cards";
  let referenceReady = false;
  function renderReference() {
    if (referenceReady) return;
    referenceReady = true;
    const fragment = document.createDocumentFragment();
    for (const q of course.questions) {
      const detail = node("details");
      const summary = node("summary");
      if (cards && q.example) {
        const sentence = node("span", q.example, "study-card-example");
        sentence.lang = "en";
        summary.append(sentence);
      }
      summary.append(node("span", cards ? q.question : course.areas[q.area] + " / " + q.topic));
      detail.append(summary);
      if (cards) detail.append(node("p", "答え：" + q.choices[q.answer], "study-answer"));
      detail.append(node("p", q.explanation), node("p", q.takeaway, "study-takeaway"));
      const source = sourceLink(q);
      if (source) detail.append(source);
      const lesson = lessonLink(q);
      if (lesson) detail.append(lesson);
      fragment.append(detail);
    }
    reference.append(fragment);
  }
  const referencePanel = reference.closest("details");
  referencePanel.addEventListener("toggle", () => { if (referencePanel.open) renderReference(); });
  get("studyCardsLink")?.addEventListener("click", () => { renderReference(); referencePanel.open = true; });
  if (referencePanel.open) renderReference();
  get("studyBootNote").hidden = true;
  for (const id of ["studyDailyStart", "studyRandomStart", "studyReset"]) get(id).disabled = false;
  dashboard();
})(typeof window !== "undefined" ? window : globalThis);
