(function (root) {
  "use strict";
  // Publish a course here only after its page and reviewed question bank exist.
  const courses = [{ id: "itpassport", qualification: "ITパスポート", name: "ITパスポート", href: "study/itpassport.html", count: 30 }];
  if (typeof module === "object" && module.exports) module.exports = courses;
  else root.QualificationStudyCatalog = courses;
})(typeof window !== "undefined" ? window : globalThis);
