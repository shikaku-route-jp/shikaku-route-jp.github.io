(function (root) {
  "use strict";
  // Original everyday-English examples. This is a partial vocabulary starter,
  // not an official grade-specific vocabulary list or a complete exam course.
  const rows = [
    ["improve", "verbs", "improve", "I practice every day to improve my English. この文の improve の意味は？", ["忘れる", "向上させる", "隠す", "壊す"], 1, "improveは「改善する・向上させる」。例文は「英語を上達させるために毎日練習する」という意味です。", "improve my English＝英語力を向上させる。"],
    ["avoid", "verbs", "avoid", "We left early to avoid heavy traffic. この文の avoid の意味は？", ["避ける", "招く", "調べる", "描く"], 0, "avoidは「避ける」。例文は「ひどい渋滞を避けるため、私たちは早く出発した」という意味です。", "avoid＋名詞／動詞の-ing形＝～を避ける。"],
    ["provide", "verbs", "provide", "The hotel provides breakfast. この文の provides の意味は？", ["注文する", "断る", "提供する", "片付ける"], 2, "provideは「提供する」。例文は「そのホテルは朝食を提供している」という意味です。", "provide breakfast＝朝食を提供する。"],
    ["decide", "verbs", "decide", "We decided to visit the museum. この文の decided の意味は？", ["忘れた", "禁止した", "疑った", "決めた"], 3, "decideは「決める」。decide to＋動詞の原形で「～することを決める」と表します。例文は「私たちは博物館を訪ねることに決めた」です。", "decide to do＝～することを決める。"],
    ["borrow", "verbs", "borrow", "May I borrow your pen? この文の borrow の意味は？", ["返す", "借りる", "貸す", "売る"], 1, "borrowは「借りる」。例文は「あなたのペンを借りてもいいですか」です。人に貸すときはlendを使います。", "borrow＝借りる。lend＝貸す。"],
    ["lend", "verbs", "lend", "Could you lend me an umbrella? この文の lend の意味は？", ["貸す", "選ぶ", "壊す", "借りる"], 0, "lendは「貸す」。例文は「私に傘を貸してもらえますか」です。lend＋人＋物の形で覚えると使いやすくなります。", "lend me an umbrella＝私に傘を貸す。"],
    ["promise", "verbs", "promise", "I promise to call you tonight. この文の promise の意味は？", ["断念する", "要求する", "約束する", "失敗する"], 2, "promiseは「約束する」。例文は「今夜あなたに電話すると約束する」です。promise to doで「～すると約束する」と表します。", "promise to do＝～すると約束する。"],
    ["allow", "verbs", "allow", "The teacher allowed us to use a dictionary. この文の allowed の意味は？", ["忘れた", "調べた", "止めた", "許可した"], 3, "allowは「許す・許可する」。例文は「先生は私たちに辞書を使うことを許可した」です。allow＋人＋to doの形で覚えましょう。", "allow someone to do＝人が～するのを許可する。"],
    ["suggest", "verbs", "suggest", "She suggested taking a short break. この文の suggested の意味は？", ["提案した", "忘れた", "拒否した", "命令した"], 0, "suggestは「提案する」。例文は「彼女は少し休憩することを提案した」です。動作を続ける場合はsuggest＋動詞の-ing形という形を使えます。", "suggest doing＝～することを提案する。"],
    ["notice", "verbs", "notice", "I noticed a mistake in the report. この文の noticed の意味は？", ["隠した", "気付いた", "予想した", "訂正した"], 1, "noticeは「気付く」。例文は「私は報告書の間違いに気付いた」です。気付いたことと、その後に訂正することは別の動作です。", "notice a mistake＝間違いに気付く。"],
    ["available", "descriptions", "available", "Is this room available tonight? この文の available の意味は？", ["危険な", "騒がしい", "利用できる", "遠くにある"], 2, "availableは「利用できる・手に入る」。例文では「この部屋は今夜利用できますか」と、空きがあるかを尋ねています。", "available＝利用できる・手に入る。"],
    ["necessary", "descriptions", "necessary", "A ticket is necessary to enter. この文の necessary の意味は？", ["高価な", "有名な", "不要な", "必要な"], 3, "necessaryは「必要な」。例文は「入場にはチケットが必要だ」という意味です。", "necessary＝必要な。"],
    ["convenient", "descriptions", "convenient", "This bus service is convenient for students. この文の convenient の意味は？", ["便利な", "退屈な", "複雑な", "珍しい"], 0, "convenientは「便利な・都合がよい」。例文は「このバスの運行サービスは学生にとって便利だ」です。", "convenient＝便利な・都合がよい。"],
    ["expensive", "descriptions", "expensive", "That restaurant is too expensive for me. この文の expensive の意味は？", ["静かな", "値段が高い", "人気がない", "遠い"], 1, "expensiveは「値段が高い」。例文は「そのレストランは私には高すぎる」です。物の高さや背の高さではなく、価格について使います。", "expensive＝価格が高い。"],
    ["satisfied", "descriptions", "satisfied", "They were satisfied with the result. この文の satisfied の意味は？", ["驚いている", "心配している", "満足している", "怒っている"], 2, "satisfiedは「満足している」。例文は「彼らは結果に満足していた」です。be satisfied withで、何に満足しているかを続けます。", "be satisfied with＝～に満足している。"],
    ["worried", "descriptions", "worried", "He is worried about the exam. この文の worried の意味は？", ["誇りに思っている", "退屈している", "満足している", "心配している"], 3, "worriedは「心配している」。例文は「彼は試験を心配している」です。be worried aboutで、心配する対象を表します。", "be worried about＝～を心配している。"],
    ["similar", "descriptions", "similar", "My bag is similar to yours. この文の similar の意味は？", ["似ている", "より重い", "反対の", "無関係な"], 0, "similarは「似ている」。例文は「私のかばんはあなたのものに似ている」です。比較する対象にはtoを使います。", "be similar to＝～に似ている。"],
    ["possible", "descriptions", "possible", "Is it possible to change the date? この文の possible の意味は？", ["危険な", "可能な", "不必要な", "失礼な"], 1, "possibleは「可能な」。例文は「日付を変更することは可能ですか」です。反対の意味を表す語はimpossibleです。", "possible＝可能な。impossible＝不可能な。"],
    ["local", "descriptions", "local", "We bought vegetables at a local market. この文の local の意味は？", ["海外の", "閉鎖された", "地元の", "高級な"], 2, "localは「地元の・その地域の」。例文は「私たちは地元の市場で野菜を買った」です。", "local market＝地元の市場。"],
    ["probably", "descriptions", "probably", "It will probably rain tomorrow. この文の probably の意味は？", ["絶対に～ない", "以前は", "めったに～ない", "たぶん"], 3, "probablyは「たぶん・おそらく」。例文は「明日はたぶん雨が降るだろう」です。確実だと言い切る表現ではありません。", "probably＝たぶん・おそらく。"],
    ["look-forward-to", "phrases", "look forward to", "I look forward to seeing you. この文の look forward to の意味は？", ["～を楽しみに待つ", "～を見下ろす", "～を見失う", "～を調べる"], 0, "look forward toは「～を楽しみに待つ」。例文は「あなたに会うのを楽しみにしています」です。このtoの後に動詞を続けるなら-ing形にします。", "look forward to＋名詞／動詞の-ing形。"],
    ["take-part-in", "phrases", "take part in", "Many students took part in the event. この文の took part in の意味は？", ["～を延期した", "～に参加した", "～を片付けた", "～を見送った"], 1, "take part inは「～に参加する」。例文は「多くの学生がその催しに参加した」です。過去形ではtakeがtookになります。", "take part in＝～に参加する。"],
    ["interested-in", "phrases", "be interested in", "She is interested in science. この文の is interested in の意味は？", ["～を恐れている", "～に反対している", "～に興味がある", "～に遅れている"], 2, "be interested inは「～に興味がある」。例文は「彼女は科学に興味がある」です。inの後に興味の対象を続けます。", "be interested in＝～に興味がある。"],
    ["proud-of", "phrases", "be proud of", "I am proud of my team. この文の am proud of の意味は？", ["～を探している", "～を待っている", "～に慣れている", "～を誇りに思う"], 3, "be proud ofは「～を誇りに思う」。例文は「私は自分のチームを誇りに思っている」です。", "be proud of＝～を誇りに思う。"],
    ["afraid-of", "phrases", "be afraid of", "The child is afraid of dogs. この文の is afraid of の意味は？", ["～を怖がっている", "～に満足している", "～の世話をしている", "～を誇りに思っている"], 0, "be afraid ofは「～を恐れている・怖がっている」。例文は「その子は犬を怖がっている」です。", "be afraid of＝～を怖がっている。"],
    ["because-of", "phrases", "because of", "The game was canceled because of the rain. この文の because of の意味は？", ["～にもかかわらず", "～が理由で", "～の代わりに", "～と比べて"], 1, "because ofは「～が理由で・～のために」。例文は「雨のために試合が中止された」です。because ofの後には名詞などを続けます。", "because of＋名詞。because＋主語と動詞を含む節。"],
    ["instead-of", "phrases", "instead of", "I drank water instead of juice. この文の instead of の意味は？", ["～と一緒に", "～のために", "～の代わりに", "～について"], 2, "instead ofは「～の代わりに」。例文は「私はジュースの代わりに水を飲んだ」です。選ばなかった方がofの後に来ます。", "instead of A＝Aの代わりに。"],
    ["at-least", "phrases", "at least", "Please bring at least two pencils. この文の at least の意味は？", ["多くても", "ちょうど", "ほとんど", "少なくとも"], 3, "at leastは「少なくとも」。例文は「鉛筆を少なくとも2本持ってきてください」です。2本以上を表し、2本だけに限定しません。", "at least two＝少なくとも2つ、つまり2つ以上。"],
    ["as-soon-as", "phrases", "as soon as", "I will call you as soon as I arrive. この文の as soon as の意味は？", ["～するとすぐに", "～する前に", "～しない限り", "～している間ずっと"], 0, "as soon asは「～するとすぐに」。例文は「到着したらすぐに電話します」です。未来のことでも、この例の時を表す節ではarriveと現在形を使います。", "as soon as I arrive＝到着したらすぐに。"],
    ["in-order-to", "phrases", "in order to", "She saved money in order to buy a bicycle. この文の in order to の意味は？", ["～する代わりに", "～するために", "～したにもかかわらず", "～した後で"], 1, "in order toは「～するために」と目的を表します。例文は「彼女は自転車を買うためにお金をためた」です。toの後には動詞の原形を続けます。", "in order to＋動詞の原形＝～するために。"]
  ];
  const course = {
    id: "eiken-pre2", name: "英検準2級の英単語・熟語", version: 1,
    reviewed: "2026-10-20", syllabus: "日常生活の語彙・熟語の基礎30テーマ",
    source: "https://www.eiken.or.jp/eiken/exam/grade_p2/solutions.html",
    areas: { verbs: "動詞", descriptions: "形容詞・副詞", phrases: "熟語・表現" },
    questions: rows.map(([id, area, topic, question, choices, answer, explanation, takeaway]) => ({ id, area, topic, question, choices, answer, explanation, takeaway }))
  };
  if (typeof module === "object" && module.exports) module.exports = course;
  else { root.QualificationStudyBanks = root.QualificationStudyBanks || {}; root.QualificationStudyBanks[course.id] = course; }
})(typeof window !== "undefined" ? window : globalThis);
