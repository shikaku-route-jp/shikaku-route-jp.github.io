(function (root) {
  "use strict";
  // Publish a course here only after its page and reviewed question bank exist.
  const courses = [
    { id: "itpassport", qualification: "ITパスポート", name: "ITパスポート", href: "study/itpassport.html", count: 30 },
    { id: "world-heritage3", qualification: "世界遺産検定3級", name: "世界遺産検定3級", href: "study/world-heritage3.html", count: 30 },
    { id: "eiken-pre2", qualification: "実用英語技能検定準2級", name: "英検準2級の英単語・熟語", href: "study/eiken-pre2.html", count: 30 }
  ];
  if (typeof module === "object" && module.exports) module.exports = courses;
  else root.QualificationStudyCatalog = courses;
})(typeof window !== "undefined" ? window : globalThis);
