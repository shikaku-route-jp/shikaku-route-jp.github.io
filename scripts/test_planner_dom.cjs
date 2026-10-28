const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const test = require('node:test');
const root=path.resolve(__dirname,'..');
function setup(){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'plan.html'),'utf8'),{url:'https://example.com/plan.html',runScripts:'outside-only'});
 dom.window.eval(fs.readFileSync(path.join(root,'assets/planner.js'),'utf8'));return dom;
}
test('planner calculates, saves, hides stale output and clears only its inputs',()=>{
 const dom=setup(),w=dom.window,d=w.document,f=d.getElementById('planForm');
 const date=new Date(Date.now()+14*86400000).toISOString().slice(0,10);
 f.elements.examDate.value=date;f.elements.targetHours.value='10';
 f.dispatchEvent(new w.Event('submit',{cancelable:true}));
 assert.equal(d.getElementById('planResult').hidden,false);
 assert.match(d.getElementById('planNumbers').textContent,/目標までの残り/);
 assert.equal(JSON.parse(w.localStorage.getItem('qualification-plan:v1')).targetHours,'10');
 f.elements.targetHours.value='20';f.elements.targetHours.dispatchEvent(new w.Event('input',{bubbles:true}));
 assert.equal(d.getElementById('planResult').hidden,true);
 w.localStorage.setItem('unrelated','keep');d.getElementById('clearPlan').click();
 assert.equal(w.localStorage.getItem('qualification-plan:v1'),null);assert.equal(w.localStorage.getItem('unrelated'),'keep');dom.window.close();
});
test('cost comparison reports missing categories and uses text, not HTML, for names',()=>{
 const dom=setup(),w=dom.window,d=w.document,f=d.getElementById('costForm');
 f.elements.name1.value='<img src=x>';f.elements.exam1.value='10000';f.elements.exam2.value='6000';
 f.dispatchEvent(new w.Event('submit',{cancelable:true}));
 assert.equal(d.getElementById('costResult').hidden,false);
 assert.match(d.getElementById('costSummary').textContent,/4,000円/);
 assert.equal(d.getElementById('costNumbers').querySelector('img'),null);
 f.elements.books1.value='2000';f.dispatchEvent(new w.Event('submit',{cancelable:true}));
 assert.match(d.getElementById('costSummary').textContent,/入力項目が揃っていない/);
 d.getElementById('clearCost').click();assert.equal(w.localStorage.getItem('qualification-cost:v1'),null);dom.window.close();
});
