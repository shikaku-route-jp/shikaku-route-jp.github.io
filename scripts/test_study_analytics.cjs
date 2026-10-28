const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const test = require('node:test');
const root = path.resolve(__dirname, '..');
test('FP3 practice records one start and completion without personal answers', () => {
 const dom = new JSDOM(fs.readFileSync(path.join(root,'study/fp3.html'),'utf8'), {url:'https://example.com/study/fp3.html',runScripts:'outside-only'});
 const w=dom.window, d=w.document, events=[];
 w.HTMLElement.prototype.scrollIntoView=function(){};
 w.SiteAnalytics={track:(name,params)=>events.push([name,{...params}])};
 w.eval(fs.readFileSync(path.join(root,'assets/study/fp3.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'assets/study.js'),'utf8'));
 d.getElementById('studyDailyStart').click();
 for(let i=0;i<5;i++){d.querySelector('.study-choice').click();d.getElementById('studyNext').click()}
 assert.deepEqual(events,[['study_start',{channel:'daily',count:5}],['study_complete',{channel:'daily',count:5}]]);
 assert.equal(d.getElementById('studyResult').hidden,false);
 dom.window.close();
});
