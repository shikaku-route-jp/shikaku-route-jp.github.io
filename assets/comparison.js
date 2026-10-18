(() => {
  "use strict";
  const escape = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
  const levels = ["", "入門", "やさしめ", "標準", "難関", "最難関"];
  function details(item) {
    const extra = (window.QUALIFICATION_DETAILS || {})[item.name] || {};
    const source = (window.QUALIFICATION_SOURCES || {})[item.name] || {};
    return {
      ...item,
      eligibility: extra.eligibility || "受験資格・受講条件と、合格後の登録条件を公式で確認",
      fee: extra.fee || "受験料・手数料は未掲載。公式案内で確認",
      source: extra.source_url || source.url,
      verified: extra.source_verified,
      guide: (window.QUALIFICATION_PAGES || {})[item.name],
      use: extra.fit || item.desc
    };
  }
  function build(items) {
    const list = items.map(details);
    const row = (label, render) => `<tr><th scope="row">${label}</th>${list.map(item => `<td>${render(item)}</td>`).join("")}</tr>`;
    return `<table class="candidate-table"><caption>候補の比較（${list.length}資格）</caption><thead><tr><td></td>${list.map(item => `<th scope="col">${escape(item.name)}</th>`).join("")}</tr></thead><tbody>` +
      row("学習期間の目安", item => `約${item.months}か月`) +
      row("難易度の目安", item => escape(levels[item.level])) +
      row("受験・受講条件", item => escape(item.eligibility)) +
      row("受験料・受講料", item => escape(item.fee) + (item.verified ? `<small>掲載情報の確認日：${escape(item.verified)}</small>` : "")) +
      row("使う場面・学び方", item => escape(item.use)) +
      row("詳しく確認", item => `${item.guide ? `<a href="${escape(item.guide)}">受験・学習ガイド →</a><br>` : ""}${item.source ? `<a href="${escape(item.source)}" target="_blank" rel="noopener noreferrer">公式の条件・料金 →</a>` : "公式の実施団体を確認"}`) +
      "</tbody></table>";
  }
  function render(ranked) {
    const panel = document.getElementById("candidateComparison");
    if (!panel) return;
    const selects = [1, 2, 3].map(n => document.getElementById(`compareCandidate${n}`));
    let selected = ranked.slice(0, 3).map(item => item.name);
    const paint = () => {
      const names = selected.filter(Boolean);
      document.getElementById("comparisonTable").innerHTML = build(names.map(name => ranked.find(item => item.name === name)));
    };
    selects.forEach((select, index) => {
      select.innerHTML = (index === 2 ? '<option value="">比較しない（2資格で見る）</option>' : "") + ranked.map(item => `<option value="${escape(item.name)}">${escape(item.name)}</option>`).join("");
      select.value = selected[index];
      select.onchange = () => {
        const status = document.getElementById("comparisonStatus");
        if (select.value && selected.some((name, i) => i !== index && name === select.value)) {
          status.textContent = "同じ資格が選ばれています。別の候補を選んでください。";
          select.value = selected[index];
          return;
        }
        selected[index] = select.value;
        status.textContent = "比較する候補を更新しました。";
        paint();
        window.SiteAnalytics?.track("candidate_compare", {count: selected.filter(Boolean).length});
      };
    });
    document.getElementById("comparisonStatus").textContent = "";
    paint();
  }
  window.QualificationComparison = { build, details, render };
})();
