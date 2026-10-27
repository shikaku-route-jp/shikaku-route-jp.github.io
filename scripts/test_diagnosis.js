const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function element(){const attrs={},classes=new Set();return {children:[],listeners:{},style:{},textContent:'',hidden:false,disabled:false,contains(target){return target===this||this.children.includes(target)},
 get innerHTML(){return this._html||''},set innerHTML(value){this._html=value;this.children=[]},
 classList:{add(x){classes.add(x)},remove(x){classes.delete(x)},contains(x){return classes.has(x)},toggle(){}},
 setAttribute(k,v){attrs[k]=v},getAttribute(k){return attrs[k]},addEventListener(k,v){this.listeners[k]=v},appendChild(child){this.children.push(child)},replaceChildren(){this.children=[]},
 focus(options){this.focusOptions=options;this.focused=true},scrollIntoView(options){this.scrolled=options},closest(){return {classList:{toggle(){}}}}};}
function boot(reduced=false){
 const nodes=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(([,id])=>[id,element()]));const shell=element(),actions=element(),bounds={answer:null},frames=[],tasks=[];
 const document={elementFromPoint(){return bounds.target},getElementById(id){assert.ok(nodes.has(id),'missing '+id);return nodes.get(id)},createElement(){const node=element();node.getBoundingClientRect=()=>bounds.answer;return node},querySelector(selector){return selector==='.quiz-actions'?actions:shell},querySelectorAll(){return []}};
 const window={requestAnimationFrame(fn){frames.push(fn)},innerHeight:800,scrollY:200,scrollTo(options){this.lastScroll=options},matchMedia(){return {matches:reduced}},print(){},open(){}};
 const ctx=vm.createContext({window,document,location:{href:'https://shikaku-route-jp.github.io/'},navigator:{},setTimeout(fn){tasks.push(fn)}});
 for(const name of ['exam-dates.js','qualification-sources.js','qualification-pages.js','study-catalog.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets',name),'utf8'),ctx);
 return {window,nodes,shell,actions,bounds,flushFrame(){frames.splice(0).forEach(fn=>fn())},flushTasks(){tasks.splice(0).forEach(fn=>fn())},api:window.QualificationDiagnosis};
}
const answers={interests:['finance'],goal:['job'],strength:['numbers'],work:['desk'],study:[2],period:[8],difficulty:[2],language:[0],digital:[1],priority:['interest']};
test('initial HTML includes all qualifications and guide links before JavaScript runs',()=>{
 const {api}=boot();
 const initial=html.match(/<div class="qualification-grid" id="qualificationGrid">([\s\S]*?)<\/div><!-- static-directory:end -->/)[1];
 assert.equal((initial.match(/class="qualification-card"/g)||[]).length,100);
 assert.equal((initial.match(/class="qualification-detail"/g)||[]).length,22);
 assert.equal(initial,api.directoryMarkup(api.qualifications));
 assert.doesNotMatch(api.directoryMarkup([{...api.qualifications[0],name:'<img src=x onerror=alert(1)>'}]),/<img/);
});
test('static directory still enhances into a limited, expandable and searchable list',()=>{
 const {nodes}=boot();
 const count=()=> (nodes.get('qualificationGrid').innerHTML.match(/class="qualification-card"/g)||[]).length;
 assert.equal(count(),16);assert.equal(nodes.get('directoryMore').hidden,false);
 nodes.get('directoryMore').listeners.click();assert.equal(count(),100);
 nodes.get('directoryMore').listeners.click();assert.equal(count(),16);
 nodes.get('qualificationSearch').listeners.input({target:{value:'FP'}});assert.equal(count(),3);
 nodes.get('qualificationSearch').listeners.input({target:{value:'存在しない資格名'}});assert.equal(count(),0);
 assert.match(nodes.get('qualificationGrid').innerHTML,/その条件では見つかりませんでした/);
});
test('all 100 qualifications have explicit national flags; chamber exams and training are separate',()=>{
 const {api}=boot();assert.equal(api.qualifications.length,100);assert.ok(api.qualifications.every(q=>typeof q.national==='boolean'));
 for(const name of ['日商簿記1級','日商簿記2級','日商簿記3級','日商PC検定1級','介護職員初任者研修','介護福祉士実務者研修','ケアマネジャー','登録販売者'])assert.equal(api.qualifications.find(q=>q.name===name).national,false,name);
 for(const name of ['宅地建物取引士','FP3級','介護福祉士','基本情報技術者'])assert.equal(api.qualifications.find(q=>q.name===name).national,true,name);
});
test('national preference applies the declared adjustment to every qualification',()=>{
 const {api}=boot();const neutral=new Map(api.rankingsFor({...answers,priority:['unspecified']}).map(x=>[x.name,x.score]));
 for(const q of api.rankingsFor({...answers,priority:['national']}))assert.ok(Math.abs((q.score-neutral.get(q.name))-(q.national?8:-4))<1e-9,q.name);
});
test('ties use shared ranks and include every candidate tied at the fifth place',()=>{
 const {api}=boot();const scores=[100,100,80,70,60,60,59];const grouped=api.rankingGroups(scores.map((score,i)=>({name:String(i),score})));
 assert.deepEqual(Array.from(grouped,x=>x.rank),[1,1,3,4,5,5]);assert.equal(grouped.length,6);assert.equal(grouped[0].tied,true);
 assert.match(api.resultText({topTies:[{name:'A'},{name:'B'}]}),/A ／ B（同率1位）/);
});
test('tied results explain each first-place qualification and link to a related entry course',()=>{
 const {nodes,window}=boot();
 // IT, job, PC operation, desk work, 30–60 minutes, 3–4 months,
 // standard difficulty, basic language, digital use, job relevance.
 const choices=[2,0,4,0,1,1,1,1,1,1];
 for(const choice of choices){nodes.get('answerGrid').children[choice].listeners.click();nodes.get('nextBtn').listeners.click();}
 assert.deepEqual(Array.from(window.__lastResult.topTies,q=>q.name),['LinuCレベル1','Python 3 エンジニア認定データ分析試験']);
 assert.equal(nodes.get('topTieSummary').hidden,false);
 assert.match(nodes.get('topTieSummary').innerHTML,/Linuxサーバーの基本操作/);
 assert.match(nodes.get('topTieSummary').innerHTML,/Pythonを使ったデータ分析/);
 assert.match(nodes.get('topTieSummary').innerHTML,/href="#candidateComparison"/);
 assert.match(nodes.get('metricScope').textContent,/LinuCレベル1/);
 assert.match(nodes.get('routeNarrative').innerHTML,/href="study\/itpassport\.html#studySetup"/);
 assert.match(nodes.get('routeNarrative').innerHTML,/公式教材や試験範囲全体を網羅するものではありません/);
});
test('a later non-tied result clears earlier tie cards',()=>{
 const {nodes,window}=boot();
 for(const choice of [2,0,4,0,1,1,1,1,1,1]){nodes.get('answerGrid').children[choice].listeners.click();nodes.get('nextBtn').listeners.click();}
 assert.equal(nodes.get('topTieSummary').hidden,false);
 nodes.get('restartBtn').listeners.click();
 for(let i=0;i<10;i++){nodes.get('answerGrid').children[0].listeners.click();nodes.get('nextBtn').listeners.click();}
 assert.equal(window.__lastResult.topTies.length,1);
 assert.equal(nodes.get('topTieSummary').hidden,true);
 assert.equal(nodes.get('topTieSummary').innerHTML,'');
 assert.equal(nodes.get('metricScope').hidden,true);
});
test('matching reasons describe the answer conditions without an aptitude percentage',()=>{
 const {api}=boot();const q=api.qualifications.find(q=>q.name==='日商簿記3級');
 assert.deepEqual(Array.from(api.matchesFor(q,answers)),['興味の分野','取得の目的','得意に近い作業','希望の働き方','希望の学習期間']);
 assert.doesNotMatch(html,/id="matchPercent"|適合度\s*<span/);
});
test('question progress, selection, previous and restart stay in sync',()=>{
 const {nodes,shell}=boot();assert.equal(nodes.get('quizProgress').getAttribute('aria-valuenow'),'1');
 nodes.get('answerGrid').children[0].listeners.click();assert.equal(nodes.get('answerGrid').children[0].getAttribute('aria-pressed'),'true');
 nodes.get('nextBtn').listeners.click();assert.equal(nodes.get('qCount').textContent,'Q2 / 10');assert.equal(nodes.get('quizProgress').getAttribute('aria-valuenow'),'2');
 assert.equal(nodes.get('qTitle').focused,undefined);assert.equal(shell.scrolled,undefined);
 nodes.get('backBtn').listeners.click();assert.equal(nodes.get('qCount').textContent,'Q1 / 10');assert.equal(nodes.get('nextBtn').disabled,false);
 nodes.get('restartBtn').listeners.click();assert.equal(nodes.get('quizProgress').getAttribute('aria-valuenow'),'1');assert.equal(nodes.get('nextBtn').disabled,true);
});
test('completing ten questions focuses the result and respects reduced motion',()=>{
 for(const reduced of [false,true]){
  const {nodes,window}=boot(reduced);
  for(let i=0;i<10;i++){nodes.get('answerGrid').children[0].listeners.click();nodes.get('nextBtn').listeners.click();}
  assert.equal(nodes.get('quizProgress').getAttribute('aria-valuenow'),'10');assert.equal(nodes.get('result').classList.contains('show'),true);
  assert.equal(nodes.get('mainQualification').focused,true);assert.equal(nodes.get('mainQualification').focusOptions.preventScroll,true);
  assert.equal(nodes.get('result').scrolled.behavior,reduced?'auto':'smooth');assert.equal(window.__lastResult.pct,undefined);
  assert.ok(nodes.get('ranking').innerHTML.includes('一致した条件'));
 }
});
test('official links cover every qualification and broad qualification groups are labelled',()=>{
 const {api,window}=boot();for(const q of api.qualifications)assert.match(window.QUALIFICATION_SOURCES[q.name].url,/^https:\/\//);
 assert.match(api.renderExamInfo({name:'医療事務'}),/実施団体の例/);
 assert.match(api.renderExamInfo({name:'税理士'}),/公式情報/);
});
test('valid answers always yield finite ordered scores without mutating caller answers',()=>{
 const {api}=boot();let seed=12345;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32};
 for(let n=0;n<500;n++){
  const a=Object.fromEntries(api.questions.map(q=>[q.key,[q.options[Math.floor(random()*q.options.length)][0]]]));const saved=JSON.stringify(a);const ranked=api.rankingsFor(a);
  assert.equal(ranked.length,100);assert.equal(new Set(ranked.map(q=>q.name)).size,100);assert.equal(JSON.stringify(a),saved);
  assert.ok(ranked.every((q,i)=>Number.isFinite(q.score)&&(i===0||q.score<=ranked[i-1].score)));
 }
});

test('selecting answers keeps the same buttons and does not move pointer focus',()=>{
 const {nodes}=boot();const first=nodes.get('answerGrid').children[0];
 first.listeners.click();assert.equal(nodes.get('answerGrid').children[0],first);assert.equal(first.focused,undefined);
 assert.equal(first.getAttribute('aria-pressed'),'true');first.listeners.click();assert.equal(first.getAttribute('aria-pressed'),'false');
 assert.equal(nodes.get('nextBtn').disabled,true);
});
test('visible question switches do not scroll; off-screen questions move instantly',()=>{
 const {nodes,window,shell}=boot();const title=nodes.get('qTitle');
 title.getBoundingClientRect=()=>({top:110,bottom:170});shell.getBoundingClientRect=()=>({top:-220});
 nodes.get('answerGrid').children[0].listeners.click();nodes.get('nextBtn').listeners.click({detail:1});
 assert.equal(window.lastScroll,undefined);assert.equal(title.focused,undefined);
 title.getBoundingClientRect=()=>({top:-160,bottom:-100});
 nodes.get('answerGrid').children[0].listeners.click();nodes.get('nextBtn').listeners.click({detail:1});
 assert.equal(window.lastScroll.behavior,'instant');assert.equal(window.lastScroll.top,0);
});
test('keyboard navigation still announces the new question without animated scrolling',()=>{
 const {nodes,window}=boot();nodes.get('qTitle').getBoundingClientRect=()=>({top:110,bottom:170});
 nodes.get('answerGrid').children[0].listeners.click();nodes.get('nextBtn').listeners.click({detail:0});
 assert.equal(nodes.get('qTitle').focused,true);assert.equal(window.lastScroll,undefined);
});

test('question navigation accounts for the visible phone viewport and action bar',()=>{
 const {nodes,window,shell,actions,bounds}=boot();
 window.visualViewport={height:520};
 nodes.get('quizHeader').offsetHeight=96;
 nodes.get('qTitle').getBoundingClientRect=()=>({top:120,bottom:180});
 shell.getBoundingClientRect=()=>({top:-150});
 actions.offsetHeight=88;
 bounds.answer={top:200,bottom:470};
 nodes.get('answerGrid').children[0].listeners.click();nodes.get('nextBtn').listeners.click({detail:1});
 assert.equal(window.lastScroll.behavior,'instant');assert.equal(window.lastScroll.top,38);
 delete window.lastScroll;
 bounds.answer={top:200,bottom:300};
 nodes.get('answerGrid').children[0].listeners.click();nodes.get('nextBtn').listeners.click({detail:1});
 assert.equal(window.lastScroll,undefined);
 nodes.get('quizHeader').offsetHeight=140;
 nodes.get('backBtn').listeners.click({detail:1});
 assert.equal(window.lastScroll.behavior,'instant');
});

test('study-time advice preserves all four selected time ranges',()=>{
 for(let study=0;study<4;study++){
  const {nodes}=boot();
  for(let i=0;i<10;i++){
   nodes.get('answerGrid').children[i===4?study:0].listeners.click();
   nodes.get('nextBtn').listeners.click();
  }
  assert.ok(nodes.get('adviceList').innerHTML.includes(['30分未満','30分〜1時間','1〜2時間','2時間以上'][study]));
 }
});

function pointer(button,type,extra={}){
 const event={pointerId:1,pointerType:'touch',isPrimary:true,button:0,clientX:100,clientY:100,...extra};
 button.listeners[type](event);
}
function tap(button,bounds){bounds.target=button;pointer(button,'pointerdown');pointer(button,'pointerup');}
function compatClick(button){let prevented=false;button.listeners.click({detail:1,pointerType:'touch',preventDefault(){prevented=true}});assert.equal(prevented,true);}
test('touch release selects immediately and its later click cannot toggle the answer off',()=>{
 const {nodes,bounds}=boot();const answer=nodes.get('answerGrid').children[0];
 pointer(answer,'pointerdown');assert.equal(answer.getAttribute('aria-pressed'),'false');
 bounds.target=answer;pointer(answer,'pointerup');assert.equal(answer.getAttribute('aria-pressed'),'true');
 compatClick(answer);assert.equal(answer.getAttribute('aria-pressed'),'true');
 tap(answer,bounds);assert.equal(answer.getAttribute('aria-pressed'),'false');
});
test('touch navigation advances once even when revisiting already answered questions',()=>{
 const {nodes,bounds}=boot(),next=nodes.get('nextBtn'),back=nodes.get('backBtn');
 for(let i=0;i<3;i++){tap(nodes.get('answerGrid').children[0],bounds);tap(next,bounds);compatClick(next);}
 assert.equal(nodes.get('qCount').textContent,'Q4 / 10');
 tap(back,bounds);compatClick(back);assert.equal(nodes.get('qCount').textContent,'Q3 / 10');
 tap(back,bounds);compatClick(back);assert.equal(nodes.get('qCount').textContent,'Q2 / 10');
 tap(next,bounds);compatClick(next);assert.equal(nodes.get('qCount').textContent,'Q3 / 10');
 assert.equal(nodes.get('qTitle').focused,undefined);
 next.listeners.click({detail:0});assert.equal(nodes.get('qCount').textContent,'Q4 / 10');
 assert.equal(nodes.get('qTitle').focused,true);
});
test('dragging, cancelled contacts, release outside and secondary contacts do not select',()=>{
 for(const mode of ['drag','cancel','outside','secondary','far-release','long-press']){
  const {nodes,bounds}=boot(),answer=nodes.get('answerGrid').children[0];bounds.target=answer;
  pointer(answer,'pointerdown');
  if(mode==='drag')pointer(answer,'pointermove',{clientY:125});
  if(mode==='cancel')pointer(answer,'pointercancel');
  if(mode==='long-press')answer.listeners.contextmenu();
  if(mode==='outside')bounds.target=element();
  if(mode==='secondary')pointer(answer,'pointerdown',{isPrimary:false,pointerId:2});
  pointer(answer,'pointerup',mode==='far-release'?{clientY:125}:{});
  compatClick(answer);assert.equal(answer.getAttribute('aria-pressed'),'false',mode);
 }
});
test('pen uses immediate release while mouse keeps native click behavior',()=>{
 const {nodes,bounds}=boot(),answer=nodes.get('answerGrid').children[0];bounds.target=answer;
 pointer(answer,'pointerdown',{pointerType:'pen'});pointer(answer,'pointerup',{pointerType:'pen'});
 assert.equal(answer.getAttribute('aria-pressed'),'true');compatClick(answer);
 pointer(answer,'pointerdown',{pointerType:'mouse'});pointer(answer,'pointerup',{pointerType:'mouse'});
 assert.equal(answer.getAttribute('aria-pressed'),'true');answer.listeners.click({detail:1});
 assert.equal(answer.getAttribute('aria-pressed'),'false');
});
test('touch can complete all ten questions and cannot advance an unanswered question',()=>{
 const {nodes,bounds}=boot(),next=nodes.get('nextBtn');tap(next,bounds);
 assert.equal(nodes.get('qCount').textContent,'Q1 / 10');
 for(let i=0;i<10;i++){tap(nodes.get('answerGrid').children[0],bounds);tap(next,bounds);compatClick(next);}
 assert.equal(nodes.get('result').classList.contains('show'),true);
});

test('question updates finish before analytics runs and funnel events keep their order',()=>{
 const {nodes,bounds,window,flushFrame,flushTasks}=boot(),events=[];
 window.SiteAnalytics={track(name,params){events.push({name,params,question:nodes.get('qCount').textContent})}};
 for(let i=0;i<10;i++){tap(nodes.get('answerGrid').children[0],bounds);tap(nodes.get('nextBtn'),bounds);}
 assert.equal(nodes.get('result').classList.contains('show'),true);
 assert.equal(events.length,0,'analytics must not run within tap handling');
 flushFrame();assert.equal(events.length,0,'the frame must have a chance to paint');flushTasks();
 assert.deepEqual(events.map(x=>x.name),['diagnosis_start',...Array(10).fill('diagnosis_step'),'diagnosis_complete']);
 assert.deepEqual(events.filter(x=>x.name==='diagnosis_step').map(x=>x.params.step),[1,2,3,4,5,6,7,8,9,10]);
 assert.ok(events.every(x=>x.question==='Q10 / 10'));
});
test('analytics still queues without requestAnimationFrame',()=>{
 const {nodes,window,flushTasks}=boot();delete window.requestAnimationFrame;
 nodes.get('answerGrid').children[0].listeners.click();nodes.get('nextBtn').listeners.click();
 assert.equal(window.dataLayer,undefined);flushTasks();
 assert.deepEqual(Array.from(window.dataLayer,x=>x.event),['diagnosis_start','diagnosis_step']);
});
