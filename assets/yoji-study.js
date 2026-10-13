(function () {
  "use strict";

  // Meanings, memory hints and example sentences are original explanations.
  // The two ranges are learning steps, not official Kanken grade assignments.
  const WORDS = [
    ["一期一会", "いちごいちえ", "一度きりかもしれない出会いを大切にすること。", "同じ人と会えても、今日とまったく同じ時間は二度と来ない。", "旅行先の出会いを一期一会と思い、大切にした。", "relationship"],
    ["一石二鳥", "いっせきにちょう", "ひとつの行動で、ふたつのよい結果を得ること。", "石をひとつ投げて、鳥を二羽捕まえるイメージ。", "歩いて買い物に行けば、運動もできて一石二鳥だ。", "result"],
    ["一喜一憂", "いっきいちゆう", "状況の変化に、そのつど喜んだり心配したりすること。", "喜ぶ、憂える。そのふたつの気持ちが交互に来る。", "練習問題の点数に一喜一憂している。", "emotion"],
    ["十人十色", "じゅうにんといろ", "考え方や好みが、人によってそれぞれ違うこと。", "十人集まれば、十種類の色がある。", "好きな映画は十人十色だ。", "relationship"],
    ["以心伝心", "いしんでんしん", "言葉で説明しなくても、互いの気持ちが伝わること。", "心から心へ、言葉を使わず伝える。", "長く一緒にいる二人は、以心伝心で動ける。", "relationship"],
    ["自業自得", "じごうじとく", "自分がした行いの結果を、自分で受けること。", "自分の行いが、自分に返ってくる。", "準備を後回しにして慌てるのは自業自得だ。", "result"],
    ["試行錯誤", "しこうさくご", "試しては失敗や修正を繰り返し、よい方法を探すこと。", "試す、間違う、直す。この流れを繰り返す。", "覚えやすい勉強法を試行錯誤している。", "action"],
    ["温故知新", "おんこちしん", "昔のことを学び直し、そこから新しい知識や考えを得ること。", "古い知識を温め直すと、新しい発見につながる。", "昔の作品を読み返すと、温故知新の発見があった。", "learning"],
    ["臨機応変", "りんきおうへん", "その場の状況に合わせ、適切に対応を変えること。", "機会や変化に応じて、やり方を変える。", "予定が変わっても臨機応変に対応した。", "judgement"],
    ["切磋琢磨", "せっさたくま", "仲間と励まし合い、競い合って力を磨くこと。", "切る、削る、磨く。互いに磨き合う姿を想像する。", "友人と切磋琢磨しながら試験に備える。", "learning"],
    ["暗中模索", "あんちゅうもさく", "手がかりが少ない中で、方法や答えを探し求めること。", "暗い部屋で、出口を手探りしているイメージ。", "手本がなく、暗中模索で作業を進めた。", "uncertainty"],
    ["五里霧中", "ごりむちゅう", "状況がつかめず、どう進めばよいか判断できないこと。", "広い霧の中にいて、行き先が見えない。", "説明を聞いても全体像が見えず、五里霧中だった。", "uncertainty"],
    ["四面楚歌", "しめんそか", "周囲に味方がおらず、孤立してしまうこと。", "四方すべてから敵側の歌が聞こえ、味方がいないと感じる。", "提案に賛成する人が現れず、四面楚歌になった。", "danger"],
    ["危機一髪", "ききいっぱつ", "ほんのわずかな差で、大変な事態になりそうなこと。", "髪の毛一本ほどの差で危険が迫る。最後は「発」ではなく「髪」。", "危機一髪のところで、落ちそうな荷物をつかんだ。", "danger"],
    ["絶体絶命", "ぜったいぜつめい", "逃げ道や助かる方法がなく、追い詰められていること。", "「絶対」ではなく「絶体」。体も命も追い詰められた姿で覚える。", "逃げ道がふさがれ、主人公は絶体絶命になった。", "danger"],
    ["因果応報", "いんがおうほう", "よい行いにも悪い行いにも、それに応じた結果が返ること。", "行いが原因となり、それに応じた結果が返ってくる。", "因果応報という言葉を思い、日々の行動を振り返った。", "result"],
    ["起死回生", "きしかいせい", "だめになりかけた状態を、立ち直らせること。", "死にそうな状態から、生き返るほどの立て直し。", "最後の一打が、起死回生の逆転につながった。", "result"],
    ["右往左往", "うおうさおう", "どうしてよいか分からず、あちこち動き回ること。", "右へ行き、左へ行き、行き先が決まらない。", "初めての駅で、改札を探して右往左往した。", "uncertainty"],
    ["一心不乱", "いっしんふらん", "ほかのことに気を取られず、ひとつのことに集中すること。", "心はひとつ。ほかのことに乱されない。", "一心不乱に模型を組み立てた。", "focus"],
    ["無我夢中", "むがむちゅう", "自分のことも忘れるほど、何かに夢中になること。", "自分を意識する余裕もなく、目の前のことに没頭する。", "無我夢中で走り、気づけばゴールしていた。", "focus"],
    ["一長一短", "いっちょういったん", "よいところと、よくないところの両方があること。", "長所もあれば、短所もある。", "どちらの教材にも一長一短がある。", "judgement"],
    ["本末転倒", "ほんまつてんとう", "大事なことと、付け足しのことの順序が逆になること。", "本体と末端がひっくり返っている。", "ノートを飾るために勉強時間が減るのは本末転倒だ。", "judgement"],
    ["優柔不断", "ゆうじゅうふだん", "迷ってばかりで、なかなか決断できないこと。", "考えが揺れて、決断できない。最後は「不段」ではなく「不断」。", "優柔不断で、メニューを決めるのに時間がかかった。", "judgement"],
    ["有言実行", "ゆうげんじっこう", "口にしたことを、実際の行動に移すこと。", "言うだけで終わらず、実行する。", "毎日練習すると宣言し、有言実行で続けた。", "action"],
    ["大器晩成", "たいきばんせい", "大きな才能を持つ人が、遅い時期に力を発揮すること。", "大きな器は、完成までに時間がかかる。", "若いころに目立たなくても、大器晩成の人もいる。", "ability"],
    ["猪突猛進", "ちょとつもうしん", "周りをあまり考えず、目標に向かって激しく突き進むこと。", "イノシシがまっすぐ突進する姿。", "猪突猛進にならず、一度計画を見直そう。", "action"],
    ["馬耳東風", "ばじとうふう", "人の意見や忠告に耳を貸さず、聞き流すこと。", "馬の耳を風が通り過ぎるように、言葉を聞き流す。", "何度注意しても、本人には馬耳東風だった。", "relationship"],
    ["呉越同舟", "ごえつどうしゅう", "仲の悪い者同士が、同じ場所や目的のために一緒になること。", "争っていた呉と越の人が、同じ舟に乗る。", "競い合う二人が、呉越同舟で企画に取り組んだ。", "relationship"],
    ["臥薪嘗胆", "がしんしょうたん", "目的を果たすため、つらさに耐えて努力すること。", "薪の上で寝て、苦い胆をなめ、悔しさを忘れず耐える。", "臥薪嘗胆の日々を経て、再び勝負に挑んだ。", "effort"],
    ["疑心暗鬼", "ぎしんあんき", "疑いの気持ちから、何でもないことまで不安に思うこと。", "疑う心が強いと、暗い場所にいない鬼まで見える。", "返事が遅いだけなのに、疑心暗鬼になってしまった。", "emotion"],
    ["電光石火", "でんこうせっか", "動きや出来事が、非常に素早いこと。", "稲妻の光と、石を打った火花。どちらも一瞬。", "電光石火の動きで、ボールを奪った。", "speed"],
    ["羊頭狗肉", "ようとうくにく", "見せかけは立派でも、実際の中身がそれに見合わないこと。", "羊の頭を看板に出しながら、売るのは犬の肉。", "宣伝と中身が違いすぎて、羊頭狗肉と言われた。", "appearance"],
    ["針小棒大", "しんしょうぼうだい", "小さなことを、実際よりずっと大きく言うこと。", "針ほどの小さなものを、棒ほど大きいと説明する。", "出来事を針小棒大に伝えないよう注意した。", "appearance"],
    ["前代未聞", "ぜんだいみもん", "これまでに聞いたこともない、珍しい出来事であること。", "前の時代にも、聞いたことがない。", "前代未聞の記録に、会場が驚いた。", "novelty"],
    ["付和雷同", "ふわらいどう", "自分の考えを持たず、他人の意見にすぐ同調すること。", "周りの声につられて、そのまま同じ意見を言う。", "付和雷同せず、自分でも理由を確かめたい。", "judgement"],
    ["異口同音", "いくどうおん", "多くの人が、そろって同じことを言うこと。", "口はそれぞれ違っても、出る言葉は同じ。", "参加者は異口同音に、楽しかったと話した。", "relationship"],
    ["七転八起", "しちてんはっき", "何度失敗しても、そのたびに立ち上がること。", "七回転んでも、八回起き上がる。「起」は立ち上がる字。", "七転八起の気持ちで、もう一度挑戦した。", "effort"],
    ["七転八倒", "しちてんばっとう", "激しい苦しみで、転げ回るような状態になること。", "何度も転んで倒れる。「起」と違い、最後まで立ち上がらない。", "ひどい痛みに七転八倒した。", "suffering"],
    ["厚顔無恥", "こうがんむち", "ずうずうしく、恥ずかしい行いをしても気にしないこと。", "顔の皮が厚いように、恥を感じない。", "厚顔無恥な振る舞いに、周囲があきれた。", "attitude"],
    ["傍若無人", "ぼうじゃくぶじん", "周りの人を気にせず、勝手に振る舞うこと。", "そばに誰もいないかのように、好き勝手に動く。", "公共の場所で傍若無人に振る舞うのは困る。", "attitude"],
    ["天衣無縫", "てんいむほう", "作りものらしさがなく、自然で巧みなこと。", "天人の衣には縫い目がない。つぎはぎの跡が見えない姿。", "その文章には、天衣無縫の魅力がある。", "ability"],
    ["明鏡止水", "めいきょうしすい", "心が澄み、余計な迷いやわだかまりがないこと。", "くもりのない鏡と、波立たず静かな水。", "本番には明鏡止水の心で臨みたい。", "calm"],
    ["晴耕雨読", "せいこううどく", "晴れれば畑を耕し、雨の日は読書するような穏やかな暮らし。", "晴れた日は耕し、雨の日は読む。四字がそのまま予定表。", "退職後は晴耕雨読の生活を楽しんでいる。", "lifestyle"],
    ["不撓不屈", "ふとうふくつ", "困難があっても、心が折れずくじけないこと。", "たわまない、屈しない。負けない気持ちを二度重ねる。", "不撓不屈の精神で、練習を続けた。", "effort"],
    ["泰然自若", "たいぜんじじゃく", "何が起きても落ち着き、慌てずいつもどおりでいること。", "大きく構えて、普段の自分のままでいる。", "急な変更にも、先輩は泰然自若としていた。", "calm"],
    ["森羅万象", "しんらばんしょう", "この世に存在する、あらゆるものや現象。", "木々がずらりと並ぶように、すべてのものが広がっている。", "森羅万象を題材にした物語を読んだ。", "nature"],
    ["画竜点睛", "がりょうてんせい", "最後の大切な仕上げを加え、全体を完成させること。", "描いた竜の目に瞳を入れると、絵が完成する。「睛」は瞳の字。", "最後の一文が、作品の画竜点睛となった。", "completion"],
    ["換骨奪胎", "かんこつだったい", "元の作品の工夫を取り入れ、新しい作品として作り直すこと。", "骨組みや中身を組み替え、元とは違う作品にする。", "古い物語を換骨奪胎して、現代の劇に仕立てた。", "creation"],
    ["竜頭蛇尾", "りゅうとうだび", "始めは勢いがよいのに、終わりは振るわないこと。", "頭は立派な竜なのに、しっぽは小さな蛇。", "計画を竜頭蛇尾に終わらせないよう、最後まで続けたい。", "result"],
    ["捲土重来", "けんどちょうらい", "一度負けた者が、勢いを取り戻して再び挑むこと。", "土ぼこりを巻き上げるほどの勢いで、もう一度戻ってくる。", "敗戦を振り返り、捲土重来を期して練習した。", "effort"]
  ].map((entry, index) => Object.freeze({
    id: "yoji-" + String(index + 1).padStart(2, "0"),
    word: entry[0], reading: entry[1], meaning: entry[2], hint: entry[3], example: entry[4], group: entry[5],
    range: index < 25 ? "basic" : "step"
  }));

  const IDS = new Set(WORDS.map(word => word.id));
  const MODES = ["meaning", "reading", "writing"];
  const STORAGE_KEY = "qualification-route-yoji-v1";

  function shuffle(items, random = Math.random) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function sanitizeRecords(value) {
    const clean = {};
    if (!value || typeof value !== "object" || Array.isArray(value)) return clean;
    for (const word of WORDS) {
      const item = value[word.id];
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const skills = {};
      for (const mode of MODES) {
        const skill = item.skills && item.skills[mode];
        if (!skill || typeof skill !== "object") continue;
        skills[mode] = {
          review: skill.review === true,
          streak: Number.isInteger(skill.streak) ? Math.max(0, Math.min(2, skill.streak)) : 0
        };
      }
      clean[word.id] = { learned: item.learned === true, skills };
    }
    return clean;
  }

  function needsReview(record, mode) {
    if (!record || !record.skills) return false;
    if (MODES.includes(mode)) return record.skills[mode]?.review === true;
    return MODES.some(skill => record.skills[skill]?.review === true);
  }

  function applyAnswer(records, id, mode, correct) {
    if (!IDS.has(id) || !MODES.includes(mode)) return records;
    const previous = records[id] || { learned: false, skills: {} };
    const previousSkill = previous.skills[mode] || { review: false, streak: 0 };
    const streak = correct ? Math.min(2, previousSkill.streak + 1) : 0;
    const skill = { review: correct ? previousSkill.review && streak < 2 : true, streak };
    return { ...records, [id]: { ...previous, skills: { ...previous.skills, [mode]: skill } } };
  }

  function makeQueue(range, size, records = {}, review = false, mode = "learn", random = Math.random) {
    let candidates = WORDS.filter(word => range === "all" || word.range === range);
    if (review) candidates = candidates.filter(word => needsReview(records[word.id], mode));
    const limit = [3, 5, 10].includes(Number(size)) ? Number(size) : 5;
    return shuffle(candidates, random).slice(0, limit);
  }

  function makeQuestion(word, mode, random = Math.random) {
    let correct, options, display = word.word;
    if (mode === "writing") {
      const position = Math.min(3, Math.max(0, Math.floor(random() * 4)));
      const chars = [...word.word];
      correct = chars[position];
      chars[position] = "□";
      display = chars.join("");
      const wrong = [...new Set(WORDS.flatMap(item => [...item.word]))].filter(char => char !== correct);
      options = [correct, ...shuffle(wrong, random).slice(0, 3)];
    } else {
      const field = mode === "meaning" ? "meaning" : "reading";
      correct = word[field];
      // Exclude related meanings so synonymous explanations never compete.
      const candidates = WORDS.filter(item => item.id !== word.id && (mode !== "meaning" || item.group !== word.group));
      options = [correct, ...shuffle(candidates, random).slice(0, 3).map(item => item[field])];
    }
    options = shuffle(options, random);
    return { display, options, answer: options.indexOf(correct) };
  }

  const core = Object.freeze({ WORDS, STORAGE_KEY, shuffle, sanitizeRecords, needsReview, applyAnswer, makeQueue, makeQuestion });
  if (typeof module !== "undefined" && module.exports) module.exports = core;
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const $ = id => document.getElementById(id);
  const elements = {};
  ["setupPanel", "studyPanel", "summaryPanel", "wordRange", "sessionSize", "learnedCount", "reviewCount", "storageNote", "setupStatus", "sessionLabel", "questionCount", "sessionCorrect", "studyProgress", "questionTitle", "questionWord", "questionPrompt", "answerOptions", "learnActions", "revealCard", "unsureAnswer", "answerFeedback", "cardAnswer", "cardReading", "cardMeaning", "cardHint", "cardExample", "writingNote", "markLearned", "nextWord", "summaryTitle", "summaryScore", "summaryMessage", "summaryWords"].forEach(id => { elements[id] = $(id); });

  let records = {};
  let storageAvailable = true;
  let storedRecords = "{}";
  try { storedRecords = window.localStorage.getItem(STORAGE_KEY) || "{}"; }
  catch { storageAvailable = false; }
  try { records = sanitizeRecords(JSON.parse(storedRecords)); }
  catch { records = {}; }
  let session = null;
  let question = null;
  let resolved = false;

  function saveRecords() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); storageAvailable = true; }
    catch { storageAvailable = false; }
    updateStats();
  }

  function updateStats() {
    elements.learnedCount.textContent = WORDS.filter(word => records[word.id]?.learned).length;
    elements.reviewCount.textContent = WORDS.filter(word => needsReview(records[word.id])).length;
    elements.storageNote.textContent = storageAvailable
      ? "記録はこのブラウザに保存します。別の端末とは共有されません。"
      : "記録を保存できないため、今開いているページの中でのみ復習できます。";
  }

  function showPanel(name) {
    for (const panel of ["setupPanel", "studyPanel", "summaryPanel"]) elements[panel].hidden = panel !== name;
  }

  function startSession(review = false) {
    const mode = document.querySelector('input[name="studyMode"]:checked').value;
    const range = elements.wordRange.value;
    const queue = makeQueue(range, elements.sessionSize.value, records, review, mode);
    if (!queue.length) {
      elements.setupStatus.textContent = "この範囲・練習形式には、苦手の記録がまだありません。範囲や形式を変えるか、ランダム練習を試してみてください。";
      return;
    }
    elements.setupStatus.textContent = "";
    session = { mode, range, review, queue, index: 0, results: [] };
    showPanel("studyPanel");
    renderWord();
    document.getElementById("practice").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function currentWord() { return session.queue[session.index]; }

  function renderWord() {
    resolved = false;
    const word = currentWord();
    const mode = session.mode;
    question = mode === "learn" ? null : makeQuestion(word, mode);
    const modeNames = { learn: "覚える時間", meaning: "意味の練習", reading: "読みの練習", writing: "漢字の穴埋め" };
    elements.sessionLabel.textContent = (session.review ? "苦手を復習 / " : "") + modeNames[mode];
    elements.questionCount.textContent = (session.index + 1) + " / " + session.queue.length + "語";
    elements.sessionCorrect.textContent = mode === "learn" ? "" : session.results.filter(item => item.correct).length + "問正解";
    elements.studyProgress.style.width = ((session.index + 1) / session.queue.length * 100) + "%";
    elements.questionTitle.textContent = { learn: "この言葉を、ひとつ覚えよう。", meaning: "この四字熟語の意味は？", reading: "この四字熟語、どう読む？", writing: "□に入る漢字は？" }[mode];
    elements.questionWord.textContent = question ? question.display : word.word;
    elements.questionPrompt.textContent = mode === "learn" ? "まずは読みと意味を見るところから。" : mode === "writing" ? "読み：" + word.reading : "もっとも合う答えを選んでください。";
    elements.answerOptions.replaceChildren();
    elements.answerOptions.classList.toggle("is-writing", mode === "writing");
    elements.learnActions.hidden = mode !== "learn";
    elements.unsureAnswer.hidden = mode === "learn";
    elements.answerFeedback.hidden = true;
    elements.answerFeedback.classList.remove("is-wrong");
    elements.cardAnswer.hidden = true;
    elements.nextWord.hidden = true;
    elements.markLearned.checked = records[word.id]?.learned === true;
    elements.nextWord.textContent = session.index === session.queue.length - 1 ? "今日の練習メモを見る →" : "次の言葉 →";
    if (question) question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "yoji-answer-btn";
      const number = document.createElement("span");
      number.className = "yoji-option-number";
      number.textContent = index + 1;
      const label = document.createElement("span");
      label.textContent = option;
      button.append(number, label);
      button.addEventListener("click", () => answer(index));
      elements.answerOptions.appendChild(button);
    });
    elements.questionTitle.focus({ preventScroll: true });
  }

  function showCard() {
    const word = currentWord();
    elements.cardReading.textContent = word.word + " / " + word.reading;
    elements.cardMeaning.textContent = word.meaning;
    elements.cardHint.textContent = word.hint;
    elements.cardExample.textContent = word.example;
    elements.writingNote.textContent = "書く練習：答えを隠して、紙に「" + word.word + "」の4字を書いてみよう。";
    elements.cardAnswer.hidden = false;
    elements.learnActions.hidden = true;
    elements.nextWord.hidden = false;
  }

  function answer(index) {
    if (!session || resolved || !question) return;
    resolved = true;
    const word = currentWord();
    const correct = index === question.answer;
    records = applyAnswer(records, word.id, session.mode, correct);
    session.results.push({ word, correct });
    saveRecords();
    Array.from(elements.answerOptions.children).forEach((button, i) => {
      button.disabled = true;
      if (i === question.answer) button.classList.add("is-correct");
      if (!correct && i === index) button.classList.add("is-wrong");
    });
    elements.unsureAnswer.hidden = true;
    elements.answerFeedback.hidden = false;
    elements.answerFeedback.classList.toggle("is-wrong", !correct);
    elements.answerFeedback.textContent = correct ? "正解。この調子で、ひとつずつ。" : "答えは「" + question.options[question.answer] + "」。この言葉を苦手の復習に残しました。";
    elements.sessionCorrect.textContent = session.results.filter(item => item.correct).length + "問正解";
    showCard();
  }

  function revealCard() {
    if (!session || session.mode !== "learn" || resolved) return;
    resolved = true;
    session.results.push({ word: currentWord(), correct: null });
    showCard();
  }

  function nextWord() {
    if (!session || !resolved) return;
    session.index++;
    if (session.index < session.queue.length) renderWord();
    else showSummary();
  }

  function showSummary() {
    showPanel("summaryPanel");
    const correct = session.results.filter(item => item.correct).length;
    elements.summaryScore.textContent = session.mode === "learn" ? session.queue.length + "語に触れました" : correct + " / " + session.queue.length + "問正解";
    elements.summaryMessage.textContent = session.mode === "learn" ? "次は読みや意味の問題で、思い出せるか試してみよう。" : correct === session.queue.length ? "全部正解。明日も少し触れて、覚えた言葉を増やそう。" : "間違えた語は苦手に残っています。答えと意味を確認して、もう一度試してみよう。";
    elements.summaryWords.replaceChildren();
    session.results.forEach(item => {
      const row = document.createElement("div");
      row.className = "yoji-summary-word";
      const content = document.createElement("div");
      const title = document.createElement("b");
      title.textContent = item.word.word;
      const reading = document.createElement("small");
      reading.textContent = item.word.reading;
      content.append(title, reading);
      const status = document.createElement("span");
      status.className = "yoji-summary-state" + (item.correct === false ? " is-wrong" : "");
      status.textContent = item.correct === null ? (records[item.word.id]?.learned ? "覚えた" : "見て学んだ") : item.correct ? "正解" : "復習に残す";
      row.append(content, status);
      elements.summaryWords.appendChild(row);
    });
    elements.summaryTitle.focus({ preventScroll: true });
  }

  function showSetup() {
    showPanel("setupPanel");
    session = null;
    question = null;
    elements.setupStatus.textContent = "";
    document.getElementById("setupTitle").setAttribute("tabindex", "-1");
    document.getElementById("setupTitle").focus({ preventScroll: true });
  }

  $("startRandom").addEventListener("click", () => startSession(false));
  $("startReview").addEventListener("click", () => startSession(true));
  $("leaveSession").addEventListener("click", showSetup);
  $("summaryHome").addEventListener("click", showSetup);
  $("revealCard").addEventListener("click", revealCard);
  $("unsureAnswer").addEventListener("click", () => answer(-1));
  $("nextWord").addEventListener("click", nextWord);
  $("practiceAgain").addEventListener("click", () => startSession(false));
  elements.markLearned.addEventListener("change", () => {
    if (!session) return;
    const id = currentWord().id;
    records = { ...records, [id]: { ...(records[id] || { skills: {} }), learned: elements.markLearned.checked } };
    saveRecords();
  });
  $("resetRecords").addEventListener("click", () => {
    if (!window.confirm("覚えた印と苦手の記録をすべて消しますか？")) return;
    records = {};
    saveRecords();
    showSetup();
    elements.setupStatus.textContent = "学習記録を消しました。";
  });
  window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try {
      records = sanitizeRecords(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}"));
      updateStats();
      if (session && session.index < session.queue.length) elements.markLearned.checked = records[currentWord().id]?.learned === true;
    } catch { /* Keep the current page's usable in-memory record. */ }
  });
  const requestedMode = new URLSearchParams(window.location.search).get("mode");
  if (["learn", ...MODES].includes(requestedMode)) {
    document.querySelector('input[name="studyMode"][value="' + requestedMode + '"]').checked = true;
  }
  updateStats();
})();
