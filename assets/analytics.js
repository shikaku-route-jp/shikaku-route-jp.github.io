(() => {
  "use strict";
  const id = window.SITE_ANALYTICS_CONFIG?.measurementId || "";
  const enabled = /^G-[A-Z0-9]+$/.test(id) && !["1", "yes"].includes(navigator.doNotTrack) && navigator.globalPrivacyControl !== true;
  const allowed = new Set(["diagnosis_start", "diagnosis_step", "diagnosis_complete", "diagnosis_restart", "candidate_compare", "materials_open", "affiliate_click", "result_share", "practice_open"]);
  let started = false;
  function track(name, params = {}) {
    if (!allowed.has(name)) return;
    if (name === "diagnosis_start") { if (started) return; started = true; }
    if (name === "diagnosis_restart") started = false;
    // Only funnel steps and link categories; no answers or qualification names.
    const safe = {};
    for (const key of ["step", "count", "destination", "channel"]) {
      if (["string", "number"].includes(typeof params[key])) safe[key] = params[key];
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({event: name, ...safe});
    if (enabled) window.gtag("event", name, safe);
  }
  if (enabled) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", id, {send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false});
    window.gtag("event", "page_view", {page_location: location.origin + location.pathname, page_referrer: "", page_title: document.title});
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
  }
  document.addEventListener("click", event => {
    const link = event.target.closest?.("a[href]");
    if (!link) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && /\/materials\//.test(url.pathname)) track("materials_open", {destination: "materials"});
    if (url.origin === location.origin && /\/yoji\.html$/.test(url.pathname)) track("practice_open", {destination: "yoji"});
    if (["af.moshimo.com", "px.a8.net"].includes(url.hostname)) track("affiliate_click", {destination: url.hostname === "af.moshimo.com" ? "rakuten" : "freee_wiz"});
  });
  window.SiteAnalytics = {track, enabled};
})();
