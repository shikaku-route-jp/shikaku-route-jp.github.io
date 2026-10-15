/* Preserve AdMax's official tag. Do not retry ad requests or infer the browser. */
(() => {
  "use strict";
  const primary = document.getElementById("primaryAd");
  const fallback = document.getElementById("affiliateFallback");
  if (!primary || !fallback) return;

  // AdMax creates its placeholder before requesting an ad; a placeholder alone
  // is not evidence of a delivered creative. Cross-origin iframe contents cannot
  // be checked, so this observes insertion, not successful loading inside frames.
  const hasCreative = () => Boolean(primary.querySelector("iframe, img, object, embed"));
  let waited = false;
  const update = () => { fallback.hidden = !waited || hasCreative(); };
  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(update).observe(primary, { childList: true, subtree: true });
  }
  setTimeout(() => { waited = true; update(); }, 8000);
  update();
})();
