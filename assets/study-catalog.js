(function (root) {
  "use strict";
  // Publish a course here only after its page and reviewed question bank exist.
  const courses = [
    { id: "itpassport", qualification: "ITパスポート", name: "ITパスポート", href: "study/itpassport.html", count: 100 },
    { id: "world-heritage3", qualification: "世界遺産検定3級", name: "世界遺産検定3級", href: "study/world-heritage3.html", count: 100 },
    { id: "eiken-pre2", qualification: "実用英語技能検定準2級", name: "高校基礎の英単語・熟語", href: "study/english-basics.html", count: 100 },
    { id: "bookkeeping3", qualification: "日商簿記3級", name: "日商簿記3級", href: "study/bookkeeping3.html", count: 100 },
    { id: "fp3", qualification: "FP3級", name: "FP3級", href: "study/fp3.html", count: 30 },
    { id: "takken", qualification: "宅地建物取引士", name: "宅地建物取引士", href: "study/takken.html", count: 50 }
  ];
  if (typeof module === "object" && module.exports) module.exports = courses;
  else root.QualificationStudyCatalog = courses;
})(typeof window !== "undefined" ? window : globalThis);
