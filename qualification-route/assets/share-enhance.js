(() => {
  "use strict";

  const shareUrl = () => location.href.split("#")[0];
  const result = () => window.__lastResult;

  function openXShare() {
    const r = result();
    if (!r?.main) return;
    const type = document.getElementById("typeName")?.textContent?.trim() || "資格タイプ";
    const text = `資格ルート診断をやってみた！\n「${r.main.name}」タイプ・適合度${r.pct}%\n${type}\n\nあなたは何％？`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl())}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function install() {
    const button = document.getElementById("shareX");
    if (!button) return;

    button.textContent = "Xで結果をシェア";
    button.title = "診断結果をXに投稿する";

    // Existing app.js has its own handler. Capture phase lets this improved
    // version replace it without changing the diagnosis logic.
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openXShare();
    }, true);

    const hero = document.querySelector(".result-hero");
    if (hero && !document.getElementById("sharePrompt")) {
      const prompt = document.createElement("div");
      prompt.id = "sharePrompt";
      prompt.className = "share-prompt";
      prompt.innerHTML = '<strong>診断結果が出ました。</strong><span>「自分はこれだった」とXでシェアして、友達の結果と比べてみよう。</span><button type="button" class="btn btn-primary">Xで結果をシェア →</button>';
      prompt.querySelector("button").addEventListener("click", openXShare);
      hero.appendChild(prompt);
    }
  }

  // app.js is loaded with defer immediately before this file, so DOM is ready
  // and the diagnosis result button exists even though the result is hidden.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})();
