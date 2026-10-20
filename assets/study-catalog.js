(function (root) {
  "use strict";
  // Publish a course here only after its page and reviewed question bank exist.
  const courses = [
    { id: "itpassport", qualification: "ITパスポート", name: "ITパスポート", href: "study/itpassport.html", count: 100 },
    { id: "world-heritage3", qualification: "世界遺産検定3級", name: "世界遺産検定3級", href: "study/world-heritage3.html", count: 100 },
    { id: "eiken-pre2", qualification: "実用英語技能検定準2級", name: "英検準2級の英単語・熟語", href: "study/eiken-pre2.html", count: 100 },
    { id: "bookkeeping3", qualification: "日商簿記3級", name: "日商簿記3級", href: "study/bookkeeping3.html", count: 100 }
  ];
  if (typeof module === "object" && module.exports) module.exports = courses;
  else root.QualificationStudyCatalog = courses;
})(typeof window !== "undefined" ? window : globalThis);
