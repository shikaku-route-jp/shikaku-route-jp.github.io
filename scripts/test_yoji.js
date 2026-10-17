"use strict";
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { WORDS, sanitizeRecords, needsReview, applyAnswer, makeQueue, makeQuestion } = require("../assets/yoji-study.js");

function randomFrom(seed) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

test("all 200 words have unique IDs, four kanji, and complete learning cards", () => {
  assert.equal(WORDS.length, 200);
  assert.equal(new Set(WORDS.map(word => word.id)).size, 200);
  assert.equal(new Set(WORDS.map(word => word.word)).size, 200);
  for (const word of WORDS) {
    assert.equal([...word.word].length, 4, word.word);
    assert.match(word.reading, /^[ぁ-ゖー]+$/u, word.word);
    for (const field of ["meaning", "hint", "example"]) assert.ok(word[field].length > 5, word.word);
  }
  assert.equal(WORDS.filter(word => word.range === "basic").length, 100);
  assert.equal(WORDS.filter(word => word.range === "step").length, 100);
});

test("existing progress still refers to the same words and ranges", () => {
  const legacyWords = ["一期一会", "一石二鳥", "一喜一憂", "十人十色", "以心伝心", "自業自得", "試行錯誤", "温故知新", "臨機応変", "切磋琢磨", "暗中模索", "五里霧中", "四面楚歌", "危機一髪", "絶体絶命", "因果応報", "起死回生", "右往左往", "一心不乱", "無我夢中", "一長一短", "本末転倒", "優柔不断", "有言実行", "大器晩成", "猪突猛進", "馬耳東風", "呉越同舟", "臥薪嘗胆", "疑心暗鬼", "電光石火", "羊頭狗肉", "針小棒大", "前代未聞", "付和雷同", "異口同音", "七転八起", "七転八倒", "厚顔無恥", "傍若無人", "天衣無縫", "明鏡止水", "晴耕雨読", "不撓不屈", "泰然自若", "森羅万象", "画竜点睛", "換骨奪胎", "竜頭蛇尾", "捲土重来"];
  const oldProgress = {};
  legacyWords.forEach((word, i) => {
    const id = "yoji-" + String(i + 1).padStart(2, "0");
    const current = WORDS.find(item => item.id === id);
    assert.equal(current.word, word);
    assert.equal(current.range, i < 25 ? "basic" : "step");
    oldProgress[id] = { learned: true, skills: { reading: { review: true, streak: 1 } } };
  });
  const restored = sanitizeRecords(JSON.parse(JSON.stringify(oldProgress)));
  assert.equal(Object.keys(restored).length, 50);
  assert.ok(Object.values(restored).every(record => record.learned && needsReview(record, "reading")));
});

test("accepted spelling variants never appear as wrong fill-in answers", () => {
  for (const [word, variant] of [["波瀾万丈", "波乱万丈"], ["岡目八目", "傍目八目"], ["和洋折衷", "和洋折中"]]) {
    const entry = WORDS.find(item => item.word === word);
    for (let seed = 0; seed < 1500; seed++) {
      const question = makeQuestion(entry, "writing", randomFrom(seed));
      for (const option of question.options.filter((_, i) => i !== question.answer)) {
        assert.notEqual(question.display.replace("□", option), variant);
      }
    }
  }
});

test("page counts and both practice ranges match the actual dataset", () => {
  const { readFileSync } = require("node:fs");
  const { join } = require("node:path");
  const page = readFileSync(join(__dirname, "../yoji.html"), "utf8");
  const home = readFileSync(join(__dirname, "../index.html"), "utf8");
  assert.ok(page.includes("<strong>" + WORDS.length + "語</strong>"));
  assert.ok(home.includes('href="yoji.html">四字熟語練習帳</a>'));
  assert.equal(home.includes('id="learning"'), false, "supplementary practice stays out of the main diagnosis flow");
  assert.ok(page.includes("基本の" + WORDS.filter(word => word.range === "basic").length + "語"));
  assert.ok(page.includes("挑戦する" + WORDS.filter(word => word.range === "step").length + "語"));
  assert.equal(page.includes("50語"), false);
});

test("random practice respects range and size without repeated words", () => {
  const seenStarts = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    const queue = makeQueue("basic", 10, {}, false, "learn", randomFrom(seed));
    assert.equal(queue.length, 10);
    assert.equal(new Set(queue.map(word => word.id)).size, 10);
    assert.ok(queue.every(word => word.range === "basic"));
    seenStarts.add(queue[0].id);
  }
  assert.ok(seenStarts.size > 3, "different random seeds produce different sessions");
  assert.equal(makeQueue("all", 3).length, 3);
  assert.equal(makeQueue("step", "5").length, 5);
});

test("every generated question has four distinct options and a valid answer", () => {
  for (const word of WORDS) for (const mode of ["meaning", "reading", "writing"]) {
    for (let seed = 0; seed < 12; seed++) {
      const question = makeQuestion(word, mode, randomFrom(seed));
      assert.equal(question.options.length, 4, word.word + " " + mode);
      assert.equal(new Set(question.options).size, 4, word.word + " " + mode);
      assert.ok(question.answer >= 0 && question.answer < 4);
      if (mode === "writing") {
        assert.equal([...question.display].filter(char => char === "□").length, 1);
        assert.equal(question.display.replace("□", question.options[question.answer]), word.word);
      } else {
        assert.equal(question.display, word.word);
        assert.equal(question.options[question.answer], word[mode]);
        if (mode === "meaning") {
          for (const option of question.options.filter((_, i) => i !== question.answer)) {
            assert.notEqual(WORDS.find(other => other.meaning === option).group, word.group);
          }
        }
      }
    }
  }
});

test("a wrong answer enters review and needs two consecutive correct answers to leave", () => {
  const id = WORDS[0].id;
  let records = applyAnswer({}, id, "reading", false);
  assert.equal(needsReview(records[id], "reading"), true);
  records = applyAnswer(records, id, "reading", true);
  assert.equal(needsReview(records[id], "reading"), true);
  records = applyAnswer(records, id, "reading", false);
  records = applyAnswer(records, id, "reading", true);
  assert.equal(needsReview(records[id], "reading"), true);
  records = applyAnswer(records, id, "reading", true);
  assert.equal(needsReview(records[id], "reading"), false);
});

test("reading success does not erase a writing weakness", () => {
  const id = WORDS[0].id;
  let records = applyAnswer({}, id, "reading", false);
  records = applyAnswer(records, id, "writing", false);
  records = applyAnswer(records, id, "reading", true);
  records = applyAnswer(records, id, "reading", true);
  assert.equal(needsReview(records[id], "reading"), false);
  assert.equal(needsReview(records[id], "writing"), true);
  assert.equal(needsReview(records[id]), true);
  assert.equal(makeQueue("basic", 5, records, true, "reading").length, 0);
  assert.deepEqual(makeQueue("basic", 5, records, true, "writing").map(word => word.id), [id]);
  assert.deepEqual(makeQueue("basic", 5, records, true, "learn").map(word => word.id), [id]);
});

test("review applies the selected range and does not fill with unrelated words", () => {
  let records = applyAnswer({}, WORDS[0].id, "meaning", false);
  records = applyAnswer(records, WORDS[30].id, "meaning", false);
  assert.deepEqual(makeQueue("basic", 10, records, true, "meaning").map(word => word.id), [WORDS[0].id]);
  assert.deepEqual(makeQueue("step", 10, records, true, "meaning").map(word => word.id), [WORDS[30].id]);
  assert.equal(makeQueue("all", 10, records, true, "meaning").length, 2);
  assert.equal(makeQueue("all", 10, {}, true, "learn").length, 0);
});

test("progress survives a JSON storage round trip and keeps the learned mark", () => {
  const id = WORDS[0].id;
  const initial = { [id]: { learned: true, skills: {} } };
  const records = applyAnswer(initial, id, "reading", false);
  assert.equal(initial[id].skills.reading, undefined, "previous records are not modified");
  const restored = sanitizeRecords(JSON.parse(JSON.stringify(records)));
  assert.equal(restored[id].learned, true);
  assert.equal(needsReview(restored[id], "reading"), true);
});

test("malformed records and unknown word IDs cannot break progress", () => {
  for (const value of [null, undefined, "broken", 3, [], { unknown: { learned: true } }]) {
    assert.deepEqual(sanitizeRecords(value), {});
  }
  const id = WORDS[0].id;
  const records = sanitizeRecords({ [id]: { learned: "yes", skills: { reading: { review: true, streak: -20 } } } });
  assert.equal(records[id].learned, false);
  assert.equal(records[id].skills.reading.streak, 0);
  assert.equal(needsReview(records[id]), true);
  assert.deepEqual(applyAnswer({}, "missing", "reading", false), {});
  assert.deepEqual(applyAnswer({}, id, "learn", false), {});
});
