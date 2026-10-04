(() => {
  "use strict";

  // 試験日データは診断ロジックと分離して管理します。
  // 日付・申込期間・公式URLは必ず公式情報を確認して更新してください。
  window.EXAM_SCHEDULES = {
    "宅地建物取引士": {
      type: "fixed",
      next: "2026-10-18",
      label: "2026年10月18日（日）",
      application: "2026年度の申込受付は終了",
      note: "13:00〜15:00。登録講習修了者は13:10〜15:00。",
      url: "https://www.retio.or.jp/exam/schedule/",
      verified: "2026-10-05"
    },
    "行政書士": {
      type: "fixed",
      next: "2026-11-08",
      label: "2026年11月8日（日）",
      application: "2026年度の申込受付は終了",
      note: "13:00〜16:00。",
      url: "https://www.gyosei-shiken.or.jp/doc/guide/guide.html",
      verified: "2026-10-05"
    },
    "日商簿記1級": {
      type: "fixed",
      next: "2026-11-15",
      label: "2026年11月15日（日）",
      application: "申込期間は受験地の商工会議所で確認",
      note: "第174回統一試験。",
      url: "https://www.kentei.ne.jp/calendar_2026",
      verified: "2026-10-05"
    },
    "日商簿記2級": {
      type: "cbt",
      label: "ネット試験：会場ごとに随時",
      application: "インターネット申込は原則、受験日の3日前まで",
      note: "2026年11月9日〜18日はネット試験休止。統一試験は11月15日。",
      url: "https://www.kentei.ne.jp/33013",
      verified: "2026-10-05"
    },
    "日商簿記3級": {
      type: "cbt",
      label: "ネット試験：会場ごとに随時",
      application: "インターネット申込は原則、受験日の3日前まで",
      note: "2026年11月9日〜18日はネット試験休止。統一試験は11月15日。",
      url: "https://www.kentei.ne.jp/33013",
      verified: "2026-10-05"
    },
    "FP2級": {
      type: "cbt",
      label: "CBT：2026年10月1日〜10月31日",
      application: "空いているテストセンターの日時から選択",
      note: "11月も1日〜30日に実施。休止期間を除きCBTで受検できます。",
      url: "https://www.jafp.or.jp/exam/schedule/index.shtml",
      verified: "2026-10-05"
    },
    "FP3級": {
      type: "cbt",
      label: "CBT：2026年10月1日〜10月31日",
      application: "空いているテストセンターの日時から選択",
      note: "11月も1日〜30日に実施。休止期間を除きCBTで受検できます。",
      url: "https://www.jafp.or.jp/exam/schedule/index.shtml",
      verified: "2026-10-05"
    },
    "ITパスポート": {
      type: "cbt",
      label: "CBT：年間を通じて随時",
      application: "会場・日時を選んで申込み",
      note: "2026年はCBTで実施。2027年1月以降に休止予定の案内があります。",
      url: "https://www.ipa.go.jp/shiken/2026/cbt-202605-jisshi.html",
      verified: "2026-10-05"
    },
    "情報セキュリティマネジメント": {
      type: "cbt",
      label: "CBT：年間を通じて随時",
      application: "会場・日時を選んで申込み",
      note: "2026年12月28日以降に休止予定。",
      url: "https://www.ipa.go.jp/shiken/2026/r08_fe-sg_exam.html",
      verified: "2026-10-05"
    },
    "基本情報技術者": {
      type: "cbt",
      label: "CBT：年間を通じて随時",
      application: "会場・日時を選んで申込み",
      note: "2026年12月28日以降に休止予定。",
      url: "https://www.ipa.go.jp/shiken/2026/r08_fe-sg_exam.html",
      verified: "2026-10-05"
    },
    "MOS Excel Associate": {
      type: "cbt",
      label: "随時試験：会場ごと（ほぼ毎日）",
      application: "会場へ直接申込み",
      note: "全国一斉試験は2026年11月8日、12月13日にも実施予定。",
      url: "https://mos.odyssey-com.co.jp/exam/",
      verified: "2026-10-05"
    },
    "MOS Excel Expert": {
      type: "cbt",
      label: "随時試験：会場ごと（ほぼ毎日）",
      application: "会場へ直接申込み",
      note: "全国一斉試験は2026年11月8日、12月13日にも実施予定。",
      url: "https://mos.odyssey-com.co.jp/exam/",
      verified: "2026-10-05"
    },
    "MOS Word 365": {
      type: "cbt",
      label: "随時試験：会場ごと（ほぼ毎日）",
      application: "会場へ直接申込み",
      note: "全国一斉試験は2026年11月8日、12月13日にも実施予定。",
      url: "https://mos.odyssey-com.co.jp/exam/",
      verified: "2026-10-05"
    },
    "MOS PowerPoint 365": {
      type: "cbt",
      label: "随時試験：会場ごと（ほぼ毎日）",
      application: "会場へ直接申込み",
      note: "全国一斉試験は2026年11月8日、12月13日にも実施予定。",
      url: "https://mos.odyssey-com.co.jp/exam/",
      verified: "2026-10-05"
    }
  };
})();