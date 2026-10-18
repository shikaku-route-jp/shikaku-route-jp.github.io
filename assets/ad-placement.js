// The vendor uses document.write and must execute while the document is parsed.
// Core UI has already initialized, so a slow ad response cannot block diagnosis.
(() => {
  const slot = document.getElementById("siteAdSlot");
  const ad = document.getElementById("siteAdPayload");
  if (slot && ad) slot.replaceWith(ad);
})();
