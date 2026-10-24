// Optional DOM integration tests: npm install --prefix /tmp/study-test jsdom
// NODE_PATH=/tmp/study-test/node_modules node --test scripts/test_study_lesson_dom.cjs
const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const test=require('node:test');
const root=path.resolve(__dirname,'..');
const bank=require('../assets/study/itpassport.js');
const key='qualification-study:v1:itpassport';
function setup(course='itpassport',saved=null){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'study',course+'.html'),'utf8'),{url:'https://example.com/study/'+course+'.html',runScripts:'outside-only'});
 const w=dom.window;
 w.HTMLElement.prototype.scrollIntoView=function(){};
 if(saved)w.localStorage.setItem(key,saved);
 w.eval(fs.readFileSync(path.join(root,'assets/study',course==='english-basics'?'eiken-pre2.js':course+'.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'assets/study.js'),'utf8'));
 return dom;
}
const initial=setup();
const mappings=[...initial.window.document.querySelectorAll('[data-lesson-questions]')].map(d=>({id:d.id,ids:d.dataset.lessonQuestions.split(/\s+/)}));
initial.window.close();
assert.equal(mappings.length,5);
for(const lesson of mappings)test(lesson.id+' opens and returns without altering saved answers',()=>{
 for(const id of lesson.ids)assert.ok(bank.questions.some(q=>q.id===id));
 const id=lesson.ids[0],q=bank.questions.find(q=>q.id===id);
 const saved=JSON.stringify({version:1,records:{},daily:{},active:{mode:'random',bankVersion:bank.version,ids:[id],position:0,results:[]}});
 const dom=setup('itpassport',saved),w=dom.window,d=w.document;
 d.getElementById('studyResume').click();
 assert.equal(d.querySelector('#studyFeedback a'),null);
 d.querySelectorAll('.study-choice')[(q.answer+1)%4].click();
 const before=w.localStorage.getItem(key);
 const link=d.querySelector('#studyFeedback a[href^="#lesson-"]');assert.ok(link);
 link.click();
 assert.equal(d.getElementById(lesson.id).open,true);
 d.querySelector('#'+lesson.id+' .study-lesson-return').click();
 assert.equal(d.activeElement,link);
 assert.equal(w.localStorage.getItem(key),before);
 const restored=setup('itpassport',before),rd=restored.window.document;
 rd.getElementById('studyResume').click();
 assert.equal(rd.querySelectorAll('.study-choice:disabled').length,4);
 assert.equal(restored.window.localStorage.getItem(key),before);
 restored.window.close();
 d.getElementById('studyNext').click();
 const resultLink=d.querySelector('#studyResultList a[href^="#lesson-"]');assert.ok(resultLink);resultLink.click();
 d.querySelector('#'+lesson.id+' .study-lesson-return').click();assert.equal(d.activeElement,resultLink);
 assert.equal(JSON.parse(w.localStorage.getItem(key)).records[id].attempts,1);
 d.getElementById('studyLessonsMenu').click();assert.equal(d.getElementById('studySetup').hidden,false);
 dom.window.close();
});
for(const course of ['world-heritage3','bookkeeping3','english-basics'])test(course+' still answers normally without lessons',()=>{
 const dom=setup(course),d=dom.window.document;
 d.getElementById('studyDailyStart').click();d.querySelector('.study-choice').click();
 assert.equal(d.getElementById('studyFeedback').hidden,false);
 dom.window.close();
});
