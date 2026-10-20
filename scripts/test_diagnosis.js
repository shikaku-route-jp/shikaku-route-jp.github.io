const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
function element(){const attrs={},classes=new Set();return {children:[],listeners:{},style:{},textContent:'',hidden:false,disabled:false,
 get innerHTML(){return this._html||''},set innerHTML(value){this._html=value;this.children=[]},
 classList:{add(x){classes.add(x)},remove(x){classes.delete(x)},contains(x){return classes.has(x)},toggle(){}},
 setAttribute(k,v){attrs[k]=v},getAttribute(k){return attrs[k]},addEventListener(k,v){this.listeners[k]=v},appendChild(child){this.children.push(child)},replaceChildren(){this.children=[]},
 focus(options){this.focusOptions=options;this.focused=true},scrollIntoView(options){this.scrolled=options},closest(){return {classList:{toggle(){}}}}};}
function boot(reduced=false){
 const nodes=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(([,id])=>[id,element()]));const shell=element();
 const document={getElementById(id){assert.ok(nodes.has(id),'missing '+id);return nodes.get(id)},createElement(){return element()},querySelector(){return shell},querySelectorAll(){return []}};
 const window={innerHeight:800,scrollY:200,scrollTo(options){this.lastScroll=options},matchMedia(){return {matches:reduced}},print(){},open(){}};
 const ctx=vm.createContext({window,document,location:{href:'https://shikaku-route-jp.github.io/'},navigator:{},setTimeout(){}});
 for(const name of ['exam-dates.js','qualification-sources.js','qualification-pages.js','app.js'])vm.runInContext(fs.readFileSync(path.join(root,'assets',name),'utf8'),ctx);
 return {window,nodes,shell,api:window.QualificationDiagnosis};
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
