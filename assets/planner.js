(function (root) {
  "use strict";
  const DAY = 86400000;
  const categories = ["exam", "books", "course", "travel", "other"];
  function parseDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const ms = Date.parse(value + "T00:00:00Z");
    return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value ? ms : null;
  }
  function nonnegative(value, max, whole = false) {
    if (value === "" || value == null || !/^\d+(?:\.\d+)?$/.test(String(value))) return null;
    const number = Number(value);
    return Number.isFinite(number) && number <= max && (!whole || Number.isInteger(number)) ? number : null;
  }
  function makePlan(input, today) {
    const start = parseDate(today), exam = parseDate(input.examDate);
    const target = nonnegative(input.targetHours, 5000), done = nonnegative(input.doneHours, 5000);
    const weekday = nonnegative(input.weekdayMinutes, 1440, true), weekend = nonnegative(input.weekendMinutes, 1440, true);
    if (start === null || exam === null || exam <= start) return { error: "試験予定日は、日本時間の明日以降を選んでください。" };
    const days = (exam - start) / DAY;
    if (days > 1827) return { error: "試験予定日は5年以内の日付を選んでください。" };
    if (target === null || target <= 0 || done === null || weekday === null || weekend === null)
      return { error: "目標時間・学習済み時間と、平日・休日の予定時間を確認してください。" };
    let weekdays = 0, weekends = 0;
    for (let ms = start; ms < exam; ms += DAY) {
      const day = new Date(ms).getUTCDay();
      if (day === 0 || day === 6) weekends++; else weekdays++;
    }
    const remaining = Math.max(0, Math.round((target - done) * 60));
    const capacity = weekdays * weekday + weekends * weekend;
    const availableDays = (weekday > 0 ? weekdays : 0) + (weekend > 0 ? weekends : 0);
    const startDay = new Date(start).getUTCDay();
    const todayBudget = startDay === 0 || startDay === 6 ? weekend : weekday;
    return { days, weekdays, weekends, remaining, capacity, availableDays,
      weeklyNeeded: Math.ceil(remaining * 7 / days),
      dailyNeeded: availableDays ? Math.ceil(remaining / availableDays) : null,
      extraPerDay: remaining > capacity && availableDays ? Math.ceil((remaining - capacity) / availableDays) : 0,
      todaySuggested: remaining && capacity && todayBudget ? Math.ceil(remaining * todayBudget / capacity) : 0 };
  }
  function compareCosts(rows) {
    if (!Array.isArray(rows) || rows.length !== 2) return { error: "2つの候補を入力してください。" };
    const results = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i], amounts = {}, missing = [];
      for (const category of categories) {
        const value = row[category];
        if (value === "" || value == null) { missing.push(category); continue; }
        const number = nonnegative(value, 10000000, true);
        if (number === null) return { error: "費用は0円以上の整数で、各項目1,000万円以内で入力してください。" };
        amounts[category] = number;
      }
      const name = String(row.name || "").trim().slice(0, 50) || `候補${i + 1}`;
      results.push({ name, total: Object.values(amounts).reduce((a, b) => a + b, 0), missing });
    }
    const comparable = results[0].missing.join(",") === results[1].missing.join(",") && results[0].missing.length < categories.length;
    return { results, comparable, difference: comparable ? Math.abs(results[0].total - results[1].total) : null };
  }
  function makeStages(today, days) {
    const start = parseDate(today);
    if (start === null || !Number.isInteger(days) || days < 3 || days > 1827) return [];
    const first = Math.min(Math.ceil(days * 0.5), days - 2);
    const last = Math.min(Math.max(1, Math.floor(days * 0.15)), days - first - 1);
    const lengths = [first, days - first - last, last];
    const labels = ["基礎を理解する", "問題演習を進める", "間違いと重要事項を総復習"];
    let offset = 0;
    return lengths.map((length, index) => {
      const from = new Date(start + offset * DAY).toISOString().slice(0, 10);
      const to = new Date(start + (offset + length - 1) * DAY).toISOString().slice(0, 10);
      offset += length;
      return { from, to, label: labels[index] };
    });
  }
  const api = { parseDate, makePlan, makeStages, compareCosts };
  if (typeof module === "object" && module.exports) module.exports = api;
  root.QualificationPlanner = api;
  if (typeof document === "undefined") return;
  const get = id => document.getElementById(id);
  const planForm = get("planForm"), costForm = get("costForm");
  if (!planForm || !costForm) return;
  const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
  const formatMinutes = n => {
    if (!n) return "0分";
    const h = Math.floor(n / 60), m = n % 60;
    return (h ? h.toLocaleString("ja-JP") + "時間" : "") + (m ? m + "分" : "");
  };
  const yen = n => n.toLocaleString("ja-JP") + "円";
  function read(form) { return Object.fromEntries(new FormData(form).entries()); }
  function save(key, values, message) {
    try { root.localStorage.setItem(key, JSON.stringify(values)); get(message).textContent = "このブラウザに入力内容を保存しました。"; }
    catch { get(message).textContent = "保存できませんでした。この画面では計算できますが、再読み込みすると入力が失われます。"; }
  }
  function restore(form, key) {
    try {
      const data = JSON.parse(root.localStorage.getItem(key) || "null");
      if (!data || typeof data !== "object" || Array.isArray(data)) return false;
      for (const element of form.elements) if (element.name && typeof data[element.name] === "string") element.value = data[element.name];
      return true;
    } catch { return false; }
  }
  const planKey = "qualification-plan:v1", costKey = "qualification-cost:v1";
  get("planFields").disabled = false;
  get("costFields").disabled = false;
  get("planDate").min = today();
  const planRestored = restore(planForm, planKey), costRestored = restore(costForm, costKey);
  if (planRestored) get("planStorage").textContent = "保存済みの入力を読み込みました。計算ボタンで最新の日数を確認できます。";
  if (costRestored) get("costStorage").textContent = "保存済みの入力を読み込みました。計算ボタンで結果を確認できます。";
  for (const [form, result, note] of [[planForm, "planResult", "planStorage"], [costForm, "costResult", "costStorage"]]) {
    form.addEventListener("input", () => {
      if (!get(result).hidden) {
        get(result).hidden = true;
        get(note).textContent = "入力を変更しました。もう一度計算すると保存されます。";
      }
    });
  }
  for (const [button, form, key, result, note] of [
    ["clearPlan", planForm, planKey, "planResult", "planStorage"],
    ["clearCost", costForm, costKey, "costResult", "costStorage"]
  ]) {
    get(button).addEventListener("click", () => {
      form.reset(); get(result).hidden = true;
      try { root.localStorage.removeItem(key); get(note).textContent = "この入力と保存済みデータを消しました。"; }
      catch { get(note).textContent = "画面の入力を消しました。保存済みデータを削除できたか確認できません。"; }
    });
  }
  function line(container, title, value) {
    const item = document.createElement("div"), dt = document.createElement("dt"), dd = document.createElement("dd");
    dt.textContent = title; dd.textContent = value; item.append(dt, dd); container.append(item);
  }
  planForm.addEventListener("submit", event => {
    event.preventDefault();
    const values = read(planForm), plan = makePlan(values, today());
    get("planError").textContent = plan.error || "";
    if (plan.error) { get("planResult").hidden = true; return; }
    save(planKey, values, "planStorage");
    const list = get("planNumbers"); list.replaceChildren();
    line(list, "試験前日まで", `${plan.days}日（平日${plan.weekdays}日・土日${plan.weekends}日）`);
    line(list, "目標までの残り", formatMinutes(plan.remaining));
    line(list, "予定どおり確保できる時間", formatMinutes(plan.capacity));
    line(list, "必要な平均ペース", `週 ${formatMinutes(plan.weeklyNeeded)}${plan.dailyNeeded === null ? "" : `・学習予定日あたり ${formatMinutes(plan.dailyNeeded)}`}`);
    const status = !plan.remaining ? "入力した目標時間に到達しています。総復習や公式の試験案内を確認しましょう。"
      : !plan.capacity ? "予定時間が0分です。平日か土日に学習時間を設定してください。"
      : plan.capacity < plan.remaining ? `現在の予定では${formatMinutes(plan.remaining - plan.capacity)}不足します。学習予定日あたり約${formatMinutes(plan.extraPerDay)}増やすか、目標・日程を見直してください。`
      : `現在の予定は目標まで${formatMinutes(plan.capacity - plan.remaining)}の余裕があります。`;
    get("planSummary").textContent = status;
    get("planToday").textContent = !plan.remaining ? "今日の一歩：間違えた問題や公式の出題範囲を確認しましょう。"
      : !plan.todaySuggested ? "今日の予定時間は0分です。次の学習日に、基礎の確認と問題演習を進めましょう。"
      : `今日の目安：約${formatMinutes(plan.todaySuggested)}。まず基礎を確認し、問題を解いて間違いを見直しましょう。`;
    const stages = get("planStages"); stages.replaceChildren();
    const periods = plan.remaining ? makeStages(today(), plan.days) : [];
    for (const period of periods) {
      const li = document.createElement("li");
      li.textContent = `${period.from}〜${period.to}：${period.label}`;
      stages.append(li);
    }
    get("planStagesBlock").hidden = !periods.length;
    get("planResult").hidden = false;
    get("planResultTitle").focus({ preventScroll: true });
  });
  costForm.addEventListener("submit", event => {
    event.preventDefault();
    const values = read(costForm);
    const rows = [1, 2].map(i => ({ name: values[`name${i}`], ...Object.fromEntries(categories.map(c => [c, values[`${c}${i}`]])) }));
    const result = compareCosts(rows);
    get("costError").textContent = result.error || "";
    if (result.error) { get("costResult").hidden = true; return; }
    save(costKey, values, "costStorage");
    const list = get("costNumbers"); list.replaceChildren();
    result.results.forEach(row => line(list, row.name, `${yen(row.total)}（未入力${row.missing.length}項目）`));
    get("costSummary").textContent = result.comparable
      ? result.difference === 0 ? "入力した同じ項目の合計は同額です。" : `入力した同じ項目の差は${yen(result.difference)}です。${result.results.some(row => row.missing.length) ? "未入力の費用は含まれていません。" : ""}`
      : "入力項目が揃っていないため、差額を表示できません。同じ項目を入力して比較してください。";
    get("costResult").hidden = false;
    get("costResultTitle").focus({ preventScroll: true });
  });
})(typeof window !== "undefined" ? window : globalThis);
