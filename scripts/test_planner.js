const test = require('node:test');
const assert = require('node:assert/strict');
const planner = require('../assets/planner.js');
const base = {examDate:'2026-11-04', targetHours:'10', doneHours:'0', weekdayMinutes:'30', weekendMinutes:'60'};
test('plan counts each weekday and weekend until the day before the exam in Japan', () => {
 const p = planner.makePlan(base, '2026-10-28');
 assert.equal(p.days,7); assert.equal(p.weekdays,5); assert.equal(p.weekends,2);
 assert.equal(p.capacity,270); assert.equal(p.remaining,600); assert.equal(p.weeklyNeeded,600);
 assert.equal(p.dailyNeeded,86); assert.equal(p.extraPerDay,48); assert.equal(p.todaySuggested,67);
});
test('plan handles leap day, no available time, completed goals and invalid dates', () => {
 const p = planner.makePlan({...base,examDate:'2028-03-01'},'2028-02-28');
 assert.equal(p.days,2); assert.equal(p.weekdays,2);
 const none = planner.makePlan({...base,weekdayMinutes:'0',weekendMinutes:'0'},'2026-10-28');
 assert.equal(none.capacity,0); assert.equal(none.dailyNeeded,null);
 assert.equal(planner.makePlan({...base,doneHours:'12'},'2026-10-28').remaining,0);
 for(const date of ['2026-10-28','2026-10-27','2026-02-29','2027-13-01','bad'])
   assert.ok(planner.makePlan({...base,examDate:date},'2026-10-28').error,date);
 assert.ok(planner.makePlan({...base,examDate:'2040-01-01'},'2026-10-28').error);
 for(const [key,val] of [['targetHours','0'],['targetHours','-5'],['targetHours','5001'],['weekdayMinutes','1441'],['weekendMinutes','1.5'],['doneHours','']])
   assert.ok(planner.makePlan({...base,[key]:val},'2026-10-28').error,key);
});
test('cost comparison distinguishes zero from missing and refuses unmatched categories', () => {
 const rows=[{name:'FP',exam:'8000',books:'2000',course:'0',travel:'',other:''},{name:'簿記',exam:'3000',books:'3000',course:'0',travel:'',other:''}];
 const r=planner.compareCosts(rows);
 assert.deepEqual(r.results.map(x=>x.total),[10000,6000]); assert.equal(r.difference,4000); assert.equal(r.comparable,true);
 assert.deepEqual(r.results[0].missing,['travel','other']);
 assert.equal(planner.compareCosts([rows[0],{...rows[1],travel:'0'}]).comparable,false);
 assert.equal(planner.compareCosts([{},{}]).comparable,false);
 for(const val of ['-1','0.1','10000001','Infinity']) assert.ok(planner.compareCosts([{exam:val},{}]).error,val);
});

 test('suggested stages cover all calendar days without including the exam date', () => {
 const stages = planner.makeStages('2026-10-28', 7);
 assert.equal(stages.length,3); assert.deepEqual(stages.map(x=>[x.from,x.to]), [['2026-10-28','2026-10-31'],['2026-11-01','2026-11-02'],['2026-11-03','2026-11-03']]);
 assert.deepEqual(planner.makeStages('2026-10-28',2),[]);
});
