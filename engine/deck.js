/* ═══ 수업 슬라이드 공용 엔진 ═══
   2026-11-05 수업 파일 여섯 개에 똑같이 들어 있던 엔진(도구 줄·노트·도움말 마크업 + 엔진 스크립트)을 떼어 냄(engine-split).
   이 파일을 고치면 모든 수업에 적용됨. 수업 파일은 무대(#viewport > #stage > section.slide) 바로 뒤에
   <script src="../engine/deck.js"> 태그(닫는 태그까지)를 두고, 그다음 <script>에서 Deck.scene(…)을 등록한 뒤 Deck.start()를 부른다. */
/* 도구 줄(HUD)·발표자 노트·도움말·화면 끄기 마크업 — 예전에는 수업 파일마다 무대 뒤에 있었음 */
document.body.insertAdjacentHTML('beforeend',"<div id=\"hud\">\n  <button id=\"b-prev\" aria-label=\"이전 장 (Shift+←)\"><svg viewBox=\"0 0 20 20\"><path d=\"M12.5 4 6.5 10l6 6\"/></svg></button>\n  <div class=\"count\" id=\"count\">1 / 1</div>\n  <button id=\"b-next\" aria-label=\"다음 장 (남은 단계 건너뜀, Shift+→)\"><svg viewBox=\"0 0 20 20\"><path d=\"M7.5 4l6 6-6 6\"/></svg></button>\n  <button id=\"b-pause\" aria-label=\"애니메이션 일시정지 (P)\"><svg class=\"i-pause\" viewBox=\"0 0 20 20\"><path d=\"M7 4.5v11M13 4.5v11\"/></svg><svg class=\"i-play\" viewBox=\"0 0 20 20\"><path d=\"M7 4.5l9 5.5-9 5.5z\"/></svg></button>\n  <button id=\"b-mark\" aria-label=\"책갈피 (M)\"><svg viewBox=\"0 0 20 20\"><path d=\"M5.5 3h9v14l-4.5-3.5L5.5 17z\"/></svg></button>\n  <button id=\"b-notes\" aria-label=\"발표자 노트 (N)\"><svg viewBox=\"0 0 20 20\"><path d=\"M4 5h12M4 10h12M4 15h7\"/></svg></button>\n  <button id=\"b-laser\" aria-label=\"레이저 포인터 (L)\"><svg viewBox=\"0 0 20 20\"><circle cx=\"10\" cy=\"10\" r=\"2.6\"/><path d=\"M10 2.5v3M10 14.5v3M2.5 10h3M14.5 10h3\"/></svg></button>\n  <button id=\"b-ov\" aria-label=\"목차 (O)\"><svg viewBox=\"0 0 20 20\"><rect x=\"3\" y=\"3\" width=\"5.5\" height=\"5.5\" rx=\"1\"/><rect x=\"11.5\" y=\"3\" width=\"5.5\" height=\"5.5\" rx=\"1\"/><rect x=\"3\" y=\"11.5\" width=\"5.5\" height=\"5.5\" rx=\"1\"/><rect x=\"11.5\" y=\"11.5\" width=\"5.5\" height=\"5.5\" rx=\"1\"/></svg></button>\n  <button id=\"b-pv\" aria-label=\"발표자 보기 · 프로젝터 창 연결 (V)\"><svg viewBox=\"0 0 20 20\"><rect x=\"2.5\" y=\"3.5\" width=\"15\" height=\"10\" rx=\"1.5\"/><path d=\"M7 17h6M10 13.5V17\"/></svg></button>\n  <button id=\"b-fs\" aria-label=\"전체 화면 (F)\"><svg viewBox=\"0 0 20 20\"><path d=\"M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4\"/></svg></button>\n</div>\n<div id=\"notes\"><button id=\"notes-x\" aria-label=\"노트 닫기 (N 또는 Esc)\">✕</button><div class=\"nh\"><b id=\"notes-t\"></b>발표자 노트</div><p id=\"notes-p\"></p></div>\n<div class=\"overlay\" id=\"help\"><div class=\"box\"><h3>단축키</h3><table>\n  <tr><td><kbd>→</kbd> <kbd>Space</kbd></td><td>다음 (클릭도 가능)</td></tr>\n  <tr><td><kbd>←</kbd></td><td>이전</td></tr>\n  <tr><td><kbd>Shift</kbd>+<kbd>→</kbd> · 휠 아래로 · 아래 ▶ 버튼</td><td>다음 장 (남은 단계 건너뜀)</td></tr>\n  <tr><td><kbd>Shift</kbd>+<kbd>←</kbd> · 휠 위로 · 아래 ◀ 버튼</td><td>이전 장</td></tr>\n  <tr><td><kbd>N</kbd></td><td>발표자 노트 (발표자 보기에서는 아래 칸의 단계 ↔ 노트 전환)</td></tr>\n  <tr><td><kbd>O</kbd></td><td>목차 (누르면 그 장으로)</td></tr>\n  <tr><td><kbd>B</kbd> <kbd>W</kbd></td><td>검은 화면 / 흰 화면</td></tr>\n  <tr><td><kbd>F</kbd></td><td>전체 화면</td></tr>\n  <tr><td><kbd>V</kbd></td><td>발표자 보기 — 이 창에서 조작 (단계·노트·이전/다음 장 미리보기). 위 ‘프로젝터 창 열기’로 연 창을 프로젝터 화면으로 옮겨 크게 (아이패드는 길게 눌러 ‘새 창에서 열기’)</td></tr>\n  <tr><td><kbd>M</kbd></td><td>책갈피 목록 (반마다 저장 · 눌러서 이동)</td></tr>\n  <tr><td><kbd>P</kbd></td><td>애니메이션 일시정지 · 이어서 재생 (멈춘 상태에서 → 도 재생)</td></tr>\n  <tr><td><kbd>L</kbd></td><td>레이저 포인터 켜기·끄기 (누른 채 움직이면 선, 떼면 사라짐)</td></tr>\n  <tr><td>두 손가락 벌리기<br>트랙패드 핀치 · Ctrl+휠</td><td>부분 확대 (확대 중 끌어서 옮기기 · 두 번 톡이나 Esc로 원래대로)</td></tr>\n  <tr><td><kbd>Esc</kbd></td><td>덮개 닫기</td></tr></table></div></div>\n<div id=\"blank\"></div>\n\n");
/* ═══════════════════════════════════════════════════════════════
   엔진: 1920×1080 무대 · 장면(enter + 클릭 단계 go) · 선언형 등장 · 복원 후 순간 재생
   ═══════════════════════════════════════════════════════════════ */
(function(){
'use strict';
const SW=1920,SH=1080;
const Q=new URLSearchParams(location.search);
const STILL=Q.get('still')==='1', STUDENT=Q.get('s')==='1';
const rootEl=document.documentElement;
if(STILL)rootEl.classList.add('still');
if(STUDENT)rootEl.classList.add('student');
if(Q.get('ans')==='0')rootEl.classList.add('noans');
if(Q.get('print')==='1')rootEl.classList.add('print');
const ROLE=Q.get('screen')==='1'?'screen':(Q.get('thumb')==='1'?'thumb':'main'),THUMB=ROLE==='thumb';   // screen = 프로젝터 창, thumb = 발표자 보기의 미리보기
if(ROLE!=='main')rootEl.classList.add(ROLE);
let REMOTE=false,QUIET=0,PV=false;   // REMOTE: 다른 창의 명령을 따라 하는 중(다시 보내지 않음) · QUIET: 보내지 않는 내부 동작 · PV: 발표자 보기
const LINK={on:false,id:Math.random().toString(36).slice(2,10),n:0,last:{},peers:{},ch:null,ls:true,at:0,was:false,key:'deck-link:'+location.pathname};

const EASE={out:'cubic-bezier(.2,.8,.2,1)',inOut:'cubic-bezier(.65,0,.35,1)',in:'cubic-bezier(.55,0,.75,.1)',spring:'cubic-bezier(.34,1.56,.64,1)',linear:'linear'};
const JE={linear:t=>t,out:t=>1-Math.pow(1-t,3),inOut:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,in:t=>t*t*t,quad:t=>t*t};
const FX={
  rise:{k:[{opacity:0,transform:'translateY(28px)'},{opacity:1,transform:'translateY(0px)'}],dur:800},
  fade:{k:[{opacity:0},{opacity:1}],dur:600},
  scale:{k:[{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'scale(1)'}],dur:800},
  pop:{k:[{opacity:0,transform:'scale(.5)'},{opacity:1,transform:'scale(1)'}],dur:700,ease:'spring'},
  left:{k:[{opacity:0,transform:'translateX(-64px)'},{opacity:1,transform:'translateX(0px)'}],dur:800},
  up:{k:[{opacity:0,transform:'translateY(72px)'},{opacity:1,transform:'translateY(0px)'}],dur:900},
  draw:{k:[{opacity:1,strokeDashoffset:1},{opacity:1,strokeDashoffset:0}],dur:1100,ease:'inOut'},
  wipe:{k:[{opacity:1,clipPath:'inset(0 100% 0 0)'},{opacity:1,clipPath:'inset(0 0% 0 0)'}],dur:900,ease:'inOut'}
};
const GEOM='path,line,polyline,polygon,circle,ellipse,rect';
const STUB={finished:Promise.resolve(),cancel(){},finish(){}};
const NS='http://www.w3.org/2000/svg';
const U={el(tag,attrs={},parent){const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e;}};

/* 일시정지(P, HUD 버튼): 루프·tween·wait는 PAUSED를 보고 시간을 멈추고, WAAPI 애니메이션은 pause/play.
   다음(→·클릭)을 누르면 이어서 재생하고, 장·단계가 바뀌면 자동으로 풀린다 */
let PAUSED=false,pausedAnims=[];
function setPause(v){
  if(v===PAUSED)return;PAUSED=v;
  if(v){
    pausedAnims=document.getAnimations().filter(a=>{
      if(a.playState!=='running')return false;
      const t=a.effect&&a.effect.target;return !(t&&t.closest&&t.closest('#hud,#notes,#kwbar,#ovl'));
    });
    pausedAnims.forEach(a=>{try{a.pause();}catch(e){}});
  }else{pausedAnims.forEach(a=>{try{a.play();}catch(e){}});pausedAnims=[];}
  rootEl.classList.toggle('paused',v);
  const b=document.getElementById('b-pause');if(b){b.classList.toggle('on',v);b.setAttribute('aria-label',v?'이어서 재생 (P)':'애니메이션 일시정지 (P)');}
  lkTx({t:'pause',v});pvSync();
}

/* 장면 도구 상자: 장면을 떠나면 dispose 로 타이머·루프·애니메이션이 한꺼번에 정리된다 */
class Ctx{
  constructor(root){this.root=root;this.instant=false;this.alive=true;this._anims=[];this._loops=[];this._timers=[];this._waits=[];this._tweens=[];}
  $(s){return this.root.querySelector(s);}
  $$(s){return Array.from(this.root.querySelectorAll(s));}
  _els(x){if(typeof x==='string')return this.$$(x);if(!x)return [];if(x instanceof Element)return [x];return Array.from(x);}
  a(el,kf,o={}){
    if(typeof el==='string')el=this.$(el);
    if(!el||!this.alive)return STUB;
    const inst=this.instant&&o.iter!==Infinity;
    const an=el.animate(kf,{duration:inst?0:(o.dur??700),delay:inst?0:(o.delay??0),easing:EASE[o.ease]||o.ease||EASE.out,fill:o.fill||'both',iterations:o.iter??1,direction:o.dir||'normal'});
    if(inst){try{an.finish();}catch(e){}}
    this._anims.push(an);return an;
  }
  reveal(el,fx='rise',o={}){
    let last=STUB;
    this._els(el).forEach((e,i)=>{
      const P=FX[fx]||FX.rise;
      const d=Object.assign({dur:P.dur,ease:P.ease||'out'},o);
      if(o.stagger)d.delay=(o.delay||0)+i*o.stagger;
      if(fx==='draw'){
        const geo=(e.matches&&e.matches(GEOM))?[e]:Array.from(e.querySelectorAll(GEOM));
        geo.forEach(g=>{g.setAttribute('pathLength','1');g.style.strokeDasharray='1 1';last=this.a(g,P.k,d);});
      }else last=this.a(e,P.k,d);
    });
    return last;
  }
  wait(ms){
    if(this.instant||!this.alive)return Promise.resolve();
    return this.tween(ms,()=>{},{noInit:true,ease:'linear'});   // 일시정지 중에는 기다리는 시간도 멈춘다
  }
  tween(dur,fn,o={}){
    const ease=typeof o.ease==='function'?o.ease:(JE[o.ease]||JE.out);
    if(this.instant||!this.alive){if(this.alive)fn(1,1);return Promise.resolve();}
    return new Promise(res=>{
      let start=null,done=false,id=0;const tw={};
      const rm=()=>{const i=this._tweens.indexOf(tw);if(i>=0)this._tweens.splice(i,1);};
      tw.finish=()=>{if(done)return;done=true;cancelAnimationFrame(id);rm();try{fn(1,1);}catch(e){console.error(e);}res();};
      tw.kill=()=>{if(done)return;done=true;cancelAnimationFrame(id);rm();res();};
      this._tweens.push(tw);
      if(!o.noInit){try{fn(0,0);}catch(e){console.error(e);}}
      const delay=o.delay||0;let last=null;
      const tick=now=>{
        if(done)return;
        if(PAUSED){if(start!==null&&last!==null)start+=now-last;last=now;id=requestAnimationFrame(tick);return;}   // 멈춘 시간만큼 뒤로 민다
        last=now;
        if(start===null)start=now+delay;
        const t=(now-start)/dur;
        if(t<0){id=requestAnimationFrame(tick);return;}
        if(t>=1){tw.finish();return;}
        try{fn(ease(t),t);}catch(e){console.error(e);tw.kill();return;}
        id=requestAnimationFrame(tick);
      };
      id=requestAnimationFrame(tick);
    });
  }
  count(el,from,to,o={}){
    if(typeof el==='string')el=this.$(el);
    if(!el)return Promise.resolve();
    const fmt=o.fmt||(v=>String(Math.round(v)));
    return this.tween(o.dur??1000,p=>{el.textContent=fmt(from+(to-from)*p);},{ease:o.ease||'out',delay:o.delay});
  }
  loop(fn){
    const L={on:true,t:0,last:null,id:0};
    const tick=now=>{
      if(!L.on||!this.alive)return;
      if(PAUSED){L.last=now;L.id=requestAnimationFrame(tick);return;}
      const dt=L.last===null?0:Math.min(.05,(now-L.last)/1000);L.last=now;L.t+=dt;
      try{fn(L.t,dt);}catch(e){console.error(e);L.on=false;return;}
      L.id=requestAnimationFrame(tick);
    };
    L.stop=()=>{L.on=false;cancelAnimationFrame(L.id);};
    L.id=requestAnimationFrame(tick);this._loops.push(L);return L;
  }
  isBusy(){
    if(this._waits.length||this._tweens.length)return true;
    return this._anims.some(a=>{try{if(a.playState!=='running')return false;return a.effect.getComputedTiming().iterations!==Infinity;}catch(e){return false;}});
  }
  hurry(){
    this.instant=true;
    this._anims.forEach(a=>{try{if(a.effect.getComputedTiming().iterations!==Infinity&&a.playState==='running')a.finish();}catch(e){}});
    this._tweens.slice().forEach(t=>t.finish());
    this._waits.splice(0).forEach(w=>{clearTimeout(w.t);w.res();});
  }
  dispose(){
    this.alive=false;
    this._loops.forEach(l=>l.stop());
    this._timers.forEach(id=>clearTimeout(id));
    this._tweens.slice().forEach(t=>t.kill());
    this._waits.splice(0).forEach(w=>{clearTimeout(w.t);w.res();});
  }
}

const scenes={};
const Deck={scene(id,def){scenes[id]=def;},list:[],i:-1,k:0,ctx:null,token:0,U,STILL};
window.Deck=Deck;

let stage,viewport,hud,progI,dotsEl,countEl,notesEl,notesT,notesP,ovl,helpEl,blankEl,kwbar,hudTimer;

function stepsOf(sec){
  if(sec.__steps!=null)return sec.__steps;
  let m=+((scenes[sec.id]||{}).steps||0);
  const tmp=document.createElement('div');tmp.innerHTML=sec.__pristine;
  tmp.querySelectorAll('[data-step]').forEach(e=>{m=Math.max(m,+e.getAttribute('data-step')||0);});
  return (sec.__steps=m);
}
const safe=async(fn,c)=>{try{await fn();}catch(e){if(c&&c.alive)console.error('[scene '+c.root.id+']',e);}};

function runDecl(c,k){
  if(k===0){
    c.$$('[data-in]').forEach(el=>{
      const v=el.getAttribute('data-in');
      const delay=+(el.dataset.delay||(v&&!isNaN(+v)?v:0));
      c.reveal(el,el.dataset.fx||'rise',{delay,dur:el.dataset.dur?+el.dataset.dur:undefined});
    });
  }else{
    c.$$('[data-step="'+k+'"]').forEach(el=>{
      c.reveal(el,el.dataset.fx||'rise',{delay:+(el.dataset.delay||0),dur:el.dataset.dur?+el.dataset.dur:undefined});
    });
  }
}

async function show(i,k=0,o={}){
  const n=Deck.list.length;if(!n)return;
  QUIET++;try{if(ZM)zoomClose(true);if(i!==Deck.i)zvReset();if(PAUSED)setPause(false);}finally{QUIET--;}   // 다른 창도 show에서 같은 일을 하므로 따로 보내지 않음
  i=Math.max(0,Math.min(n-1,i));
  const to=Deck.list[i],from=Deck.i>=0?Deck.list[Deck.i]:null;
  k=Math.max(0,Math.min(stepsOf(to),k));
  lkTx({t:'show',i,k,o:{instant:!!o.instant,noFade:!!o.noFade}});
  const instant=!!o.instant||STILL, fade=!instant&&!o.noFade;   // noFade: 목차에서 확대해 들어갈 때(장면 등장은 그대로)
  if(Deck.ctx){Deck.ctx.hurry();Deck.ctx.dispose();}
  const token=++Deck.token;
  if(from&&from!==to){
    from.classList.remove('is-on');
    if(!fade)from.classList.remove('is-out');
    else{
      from.classList.add('is-out');
      const an=from.animate([{opacity:1},{opacity:0}],{duration:450,easing:'ease'});
      from.__fade=an;an.onfinish=()=>{from.classList.remove('is-out');};
    }
  }
  if(to.__fade){try{to.__fade.cancel();}catch(e){}to.__fade=null;}
  to.innerHTML=to.__pristine;
  to.classList.remove('is-out');to.classList.add('is-on');
  if(from!==to&&fade)to.__fade=to.animate([{opacity:0},{opacity:1}],{duration:450,easing:'ease'});
  const c=new Ctx(to);Deck.ctx=c;Deck.i=i;Deck.k=k;
  document.body.classList.toggle('on-light',/light|parchment/.test(to.dataset.tile));
  updateChrome();
  const def=scenes[to.id]||{};
  c.instant=instant||k>0;
  await safe(async()=>{runDecl(c,0);if(def.enter)await def.enter(c);},c);
  for(let j=1;j<=k;j++){
    if(token!==Deck.token)return;
    await safe(async()=>{runDecl(c,j);if(def.go)await def.go(c,j);},c);
  }
  if(token!==Deck.token)return;
  c.instant=instant;
  if(THUMB)setTimeout(()=>{if(token===Deck.token)setPause(true);},250);   // 미리보기는 다 그린 뒤 멈춤(움직이는 장면도 힘을 쓰지 않게)
}
function stepTo(k){
  const c=Deck.ctx,sec=Deck.list[Deck.i],def=scenes[sec.id]||{};
  QUIET++;try{if(PAUSED)setPause(false);}finally{QUIET--;}
  lkTx({t:'step',i:Deck.i,k});
  c.instant=false;Deck.k=k;updateChrome();
  safe(async()=>{runDecl(c,k);if(def.go)await def.go(c,k);},c);
}
function next(){
  if(OV)return;
  if(PAUSED){setPause(false);return;}   // 멈춘 상태에서 다음(→·클릭) = 이어서 재생
  const c=Deck.ctx;
  if(c&&c.isBusy()){c.hurry();lkTx({t:'hurry'});return;}
  const sec=Deck.list[Deck.i];
  if(Deck.k<stepsOf(sec))stepTo(Deck.k+1);
  else if(Deck.i<Deck.list.length-1)show(Deck.i+1,0);
}
function prev(){
  if(OV)return;
  if(Deck.k>0)show(Deck.i,Deck.k-1,{instant:true});
  else if(Deck.i>0){const p=Deck.list[Deck.i-1];show(Deck.i-1,stepsOf(p),{instant:true});}
}
/* 장 단위 넘기기(2026-10-29 교사 요청): 아래 메뉴 ◀ ▶ 버튼과 휠은 단계를 건너뛰고 장을 넘긴다(화면 누르기·방향키는 단계씩).
   다음 장은 처음부터, 이전 장은 다 나온 상태로(← 키로 앞 장에 갈 때와 같음) */
function nextPage(){if(OV)return;if(Deck.i<Deck.list.length-1)show(Deck.i+1,0);}
function prevPage(){if(OV)return;if(Deck.i>0){const p=Deck.list[Deck.i-1];show(Deck.i-1,stepsOf(p),{instant:true});}else if(Deck.k>0)show(0,0,{instant:true});}
/* 휠: 아래로 굴리면 다음 장, 위로 굴리면 이전 장. 트랙패드처럼 휠 신호가 길게 이어져도 한 번만 넘기고, 휠이 0.25초 멈춘 뒤에 다시 받는다.
   노트·책갈피 창처럼 스스로 스크롤되는 곳 위, 도움말·화면 끄기 중에는 넘기지 않음. 옆으로 미는 휠은 무시 */
const WH={sum:0,lock:false,t:0};
function whScrolls(el,dy){for(let n=el;n&&n.nodeType===1&&n!==document.body;n=n.parentElement){const s=getComputedStyle(n).overflowY;if((s==='auto'||s==='scroll')&&n.scrollHeight>n.clientHeight+1&&(dy>0?n.scrollTop+n.clientHeight<n.scrollHeight-1:n.scrollTop>0))return true;}return false;}
function whNav(e){
  if(Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  if((e.target.closest&&e.target.closest('#markbox,#resume,#help,#notes'))||helpEl.classList.contains('show')||blankEl.className||whScrolls(e.target,e.deltaY))return;
  e.preventDefault();
  clearTimeout(WH.t);WH.t=setTimeout(()=>{WH.lock=false;WH.sum=0;},250);
  if(WH.lock)return;
  WH.sum+=e.deltaY*(e.deltaMode?40:1);
  if(Math.abs(WH.sum)<30)return;
  WH.lock=true;if(WH.sum>0)nextPage();else prevPage();
}

/* 크롬(컨트롤) */
function updateChrome(){
  if(LZ.cv)lzClear();   // 장·단계가 바뀌면 레이저로 그린 선을 지운다
  const n=Deck.list.length,i=Deck.i,sec=Deck.list[i];
  countEl.textContent=(i+1)+' / '+n;
  progI.style.width=((i+1)/n*100)+'%';
  const st=stepsOf(sec);
  dotsEl.innerHTML='<span class="pg">'+(i+1)+'<small> / '+n+'</small></span>';   // 쪽 번호(늘 보임) + 이 장의 단계 점
  for(let j=0;j<st;j++){const d=document.createElement('i');if(j<Deck.k)d.className='on';dotsEl.appendChild(d);}
  notesT.textContent=(i+1)+'. '+(sec.dataset.title||'');
  notesP.textContent=sec.dataset.notes||'(이 장면에는 노트가 없어요)';
  syncKw();
  try{history.replaceState(null,'','#'+(i+1));}catch(e){}
  const mb=document.getElementById('b-mark');if(mb)mb.classList.toggle('on',readMarks().some(p=>p.i===i));   // 이 장에 책갈피가 있으면 노란 버튼
  pvSync();
}
/* 책갈피(여러 개): 반마다 이름을 붙여 지금 장·단계를 저장해 두고, 목록에서 눌러 이동한다(직접 누를 때만 저장).
   이 브라우저(localStorage)에만 저장되므로 기기·브라우저가 다르면 따로 저장된다. 다음에 열 때 이어 보기를 제안 */
const MARK_KEY='deck-marks:'+location.pathname,MARK_OLD='deck-mark:'+location.pathname;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function readMarks(){   // 최근에 저장한 것이 위로
  let a=[];
  try{a=JSON.parse(localStorage.getItem(MARK_KEY)||'[]');if(!Array.isArray(a))a=[];}catch(e){a=[];}
  try{const o=JSON.parse(localStorage.getItem(MARK_OLD)||'null');   // 예전 형식(책갈피 하나·메모)이 남아 있으면 목록으로 옮긴다
    if(o&&o.i>=0){a.push({name:o.memo||'책갈피',i:o.i,k:o.k||0,t:o.t||Date.now()});localStorage.setItem(MARK_KEY,JSON.stringify(a));localStorage.removeItem(MARK_OLD);}}catch(e){}
  return a.filter(p=>p&&p.i>=0&&p.i<Deck.list.length).sort((x,y)=>(y.t||0)-(x.t||0));
}
function writeMarks(a){try{a.length?localStorage.setItem(MARK_KEY,JSON.stringify(a)):localStorage.removeItem(MARK_KEY);}catch(e){}updateChrome();}
const fmtWhen=t=>{const d=new Date(t);return (d.getMonth()+1)+'월 '+d.getDate()+'일 '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');};
const slideName=i=>(i+1)+'번 ‘'+(Deck.list[i].dataset.title||'')+'’';
const posName=p=>slideName(p.i)+(p.k?' · '+p.k+'단계':'');
function popup(id,html){  // 화면 위쪽 작은 창; 바깥을 누르거나 Esc로 닫힌다
  document.getElementById('resume')?.remove();document.getElementById('markbox')?.remove();
  const box=document.createElement('div');box.id=id;box.innerHTML=html;document.body.appendChild(box);
  const outside=e=>{if(!box.contains(e.target))close();};
  const key=e=>{if(e.key==='Escape'||!box.contains(e.target))close();};
  function close(){box.remove();removeEventListener('pointerdown',outside,true);removeEventListener('keydown',key,true);}
  addEventListener('pointerdown',outside,true);addEventListener('keydown',key,true);
  return {box,close};
}
function openMark(){
  const {box,close}=popup('markbox','<div class="t"><b>책갈피</b><span>이 브라우저에만 저장됩니다</span></div>'+
    '<div class="add"><input maxlength="40" placeholder="이름 (예: 1-3반)"><button class="go">지금 위치 저장</button></div>'+
    '<div class="now">지금 위치: '+esc(posName({i:Deck.i,k:Deck.k}))+' · 같은 이름으로 저장하면 그 책갈피를 바꿉니다</div><ul></ul>'+
    '<div class="foot"><button class="no">닫기</button></div>');
  const inp=box.querySelector('input'),ul=box.querySelector('ul');
  const render=()=>{
    const a=readMarks();
    ul.innerHTML=a.length?a.map((p,n)=>'<li data-n="'+n+'"><button class="jump'+(p.i===Deck.i&&(p.k||0)===Deck.k?' here':'')+'"><b>'+esc(p.name||'책갈피')+'</b><span>'+esc(posName(p))+'</span><small>'+fmtWhen(p.t)+'에 저장</small></button>'+
      '<button class="upd" title="이 책갈피를 지금 위치로 바꾸기">여기로</button><button class="x" title="지우기">✕</button></li>').join('')
      :'<li class="empty">저장된 책갈피가 없습니다.<br>반 이름을 쓰고 ‘지금 위치 저장’을 누르세요.</li>';
    ul.querySelectorAll('li[data-n]').forEach(li=>{
      const n=+li.dataset.n,p=a[n],save=()=>{writeMarks(a);render();};
      li.querySelector('.jump').onclick=()=>{close();show(p.i,p.k||0,{instant:true});};
      li.querySelector('.upd').onclick=()=>{p.i=Deck.i;p.k=Deck.k;p.t=Date.now();save();};
      const x=li.querySelector('.x');x.onclick=()=>{if(!x.classList.contains('sure')){x.classList.add('sure');x.textContent='지우기';return;}a.splice(n,1);save();};   // 두 번 눌러야 지운다
    });
  };
  const add=()=>{
    const a=readMarks(),name=inp.value.trim()||('책갈피 '+(a.length+1)),p={name,i:Deck.i,k:Deck.k,t:Date.now()},same=a.find(q=>q.name===name);
    if(same)Object.assign(same,p);else a.push(p);
    writeMarks(a);inp.value='';render();
  };
  box.querySelector('.go').onclick=add;
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add();}});
  box.querySelector('.no').onclick=close;
  render();setTimeout(()=>inp.focus(),0);
}
function offerResume(a){
  const p=a[0];
  const {box,close}=popup('resume','<span>책갈피 '+a.length+'개 · 최근: <b>'+esc(p.name||'책갈피')+'</b> '+esc(posName(p))+'<small>'+fmtWhen(p.t)+'에 저장</small></span>'+
    '<button class="go">이어서 보기</button><button class="ls">목록</button><button class="no">닫기</button>');
  box.querySelector('.go').onclick=()=>{close();show(p.i,p.k||0,{instant:true});};
  box.querySelector('.ls').onclick=()=>{close();openMark();};
  box.querySelector('.no').onclick=close;
}
function buildKw(){
  const K=window.KW;if(!K)return;
  kwbar=document.createElement('div');kwbar.id='kwbar';stage.appendChild(kwbar);
  K.items.forEach((name,idx)=>{
    const b=document.createElement('button');b.className='kw';
    const bb=document.createElement('b');bb.textContent=idx+1;
    const sp=document.createElement('span');sp.textContent=name;
    b.appendChild(bb);b.appendChild(sp);
    b.onclick=e=>{e.stopPropagation();const first=K.at.indexOf(idx);if(first>=0)show(first,0);};
    kwbar.appendChild(b);
  });
}
function syncKw(){
  const K=window.KW;if(!K||!kwbar)return;
  const cur=K.at[Deck.i]!=null?K.at[Deck.i]:-1;
  kwbar.classList.toggle('show',cur>=0);
  Array.from(kwbar.children).forEach((b,idx)=>{b.classList.toggle('cur',idx===cur);b.classList.toggle('done',idx<cur);});
}
function closeOverlays(){helpEl.classList.remove('show');}

/* 그림 크게 보기(2026-10-26 교사 요청): 장 안의 .pic 그림을 누르면 그 자리에서 무대 가운데로 커지며 떠오름(Push-in).
   다시 누르거나 아무 키나 누르면 제자리로 돌아가며 닫힘. 여는 동안 장·단계는 넘어가지 않음. 정지 화면·인쇄에서는 쓰지 않음 */
let ZM=null;
const zoomEl=document.createElement('div');zoomEl.id='zoom';   // 무대에는 처음 열 때 붙임(stage는 Deck.start에서 정해짐)
function zoomRect(el){const sr=stage.getBoundingClientRect(),sc=sr.width/SW,r=el.getBoundingClientRect();return {x:(r.left-sr.left)/sc,y:(r.top-sr.top)/sc,w:r.width/sc,h:r.height/sc};}
function zoomOpen(fig){
  const img=fig.querySelector('img');if(!img||ZM)return;
  const a=zoomRect(fig),nw=img.naturalWidth||a.w,nh=img.naturalHeight||a.h,k=Math.min(1760/nw,960/nh);
  const b={w:nw*k,h:nh*k};b.x=(SW-b.w)/2;b.y=(SH-b.h)/2;
  const z=document.createElement('img');z.src=img.currentSrc||img.src;z.alt=img.alt||'';
  Object.assign(z.style,{left:b.x+'px',top:b.y+'px',width:b.w+'px',height:b.h+'px'});
  if(zoomEl.parentNode!==stage)stage.appendChild(zoomEl);
  zoomEl.innerHTML='';zoomEl.appendChild(z);zoomEl.classList.add('on');
  const from='translate('+(a.x-b.x)+'px,'+(a.y-b.y)+'px) scale('+(a.w/b.w)+','+(a.h/b.h)+')';
  ZM={fig,from,z};
  requestAnimationFrame(()=>zoomEl.classList.add('show'));
  z.animate([{transform:from},{transform:'none'}],{duration:420,easing:EASE.out});
  lkTx({t:'pic',i:Deck.i,n:Array.from(Deck.list[Deck.i].querySelectorAll('.pic')).indexOf(fig)});
}
function zoomClose(now){
  if(!ZM)return;const {from,z}=ZM;ZM=null;lkTx({t:'picx',now:!!now});
  const done=()=>{zoomEl.classList.remove('on','show');zoomEl.innerHTML='';};
  if(now){done();return;}
  zoomEl.classList.remove('show');
  z.animate([{transform:'none'},{transform:from}],{duration:300,easing:EASE.inOut,fill:'forwards'}).onfinish=done;
}

/* 목차(O): 실제 슬라이드를 줄여 격자로 펼친다. 장 수에 맞춰 썸네일이 가장 커지는 열 수를 고른다 */
let OV=0,ovSel=0,ovCols=1;   // OV: 0 닫힘 · 1 열림 · 2 닫히는 중
function ovLayout(n){
  const T=130,B=30,gx=36,gy=26,cap=68,W=1720,H=SH-T-B;
  let best=null;
  for(let cols=1;cols<=n;cols++){
    const rows=Math.ceil(n/cols),s=Math.min((W-(cols-1)*gx)/cols/SW,((H-(rows-1)*gy)/rows-cap)/SH);
    if(!best||s>best.s)best={cols,s};
  }
  const s=best.s,tw=SW*s,th=SH*s,x0=(SW-(best.cols*tw+(best.cols-1)*gx))/2;
  ovCols=best.cols;
  return {s,tw,th,x0,at:i=>({x:x0+(i%best.cols)*(tw+gx),y:T+Math.floor(i/best.cols)*(th+cap+gy)})};
}
function ovMark(i){ovSel=i;Deck.list.forEach((s,j)=>s.classList.toggle('sel',j===i));}
function openToc(){
  if(OV)return;
  zvReset(false);OV=1;closeOverlays();if(LZ.on)lzSet(false);
  const L=ovLayout(Deck.list.length),K=window.KW;
  stage.style.setProperty('--ovw',(3/L.s).toFixed(1)+'px');
  stage.style.setProperty('--ovr',(12/L.s).toFixed(1)+'px');
  ovl.innerHTML='';
  const h=document.createElement('div');h.className='ovh';h.style.left=L.x0+'px';
  h.innerHTML='목차<span>슬라이드를 누르면 그 장으로 갑니다 · 방향키로 고르고 Enter · O 또는 Esc 돌아가기</span>';
  ovl.appendChild(h);
  stage.classList.add('ov');
  Deck.list.forEach((s,i)=>{
    const p=L.at(i);
    s.style.transform='translate('+p.x+'px,'+p.y+'px) scale('+L.s+')';
    if(i!==Deck.i&&!STILL)s.animate([{opacity:0},{opacity:1}],{duration:450,delay:150,easing:'ease',fill:'backwards'});
    const kw=K&&K.at&&K.at[i]>=0?K.items[K.at[i]]:'';
    const c=document.createElement('div');c.className='oc'+(i===Deck.i?' cur':'');
    c.style.cssText='left:'+p.x+'px;top:'+(p.y+L.th+8)+'px;width:'+L.tw+'px';
    const b=document.createElement('b');b.textContent=(i+1)+(kw?' · '+kw:'');
    const t=document.createElement('span');t.textContent=s.dataset.title||'';
    c.appendChild(b);c.appendChild(t);ovl.appendChild(c);
  });
  ovMark(Deck.i);
}
function closeToc(i){
  if(OV!==1)return;
  OV=2;if(i==null||i<0)i=Deck.i;
  const pick=Deck.list[i];
  pick.classList.add('pick');stage.classList.add('ov-out');
  pick.style.transform='';                                // 고른 장이 제자리로 커진다
  if(i!==Deck.i)show(i,0,{noFade:true});                  // 다른 장이면 처음부터(등장 효과는 확대되는 동안 재생)
  setTimeout(()=>{
    stage.classList.remove('ov','ov-out');
    Deck.list.forEach(s=>{s.style.transform='';s.classList.remove('pick','sel');});
    ovl.innerHTML='';OV=0;
  },STILL?0:560);
}
function tocKey(e){
  const k=e.key,n=Deck.list.length;
  if(k==='Escape'||k==='o'||k==='O'){closeToc();return;}
  if(k==='Enter'||k===' '){e.preventDefault();closeToc(ovSel);return;}
  const d={ArrowRight:1,ArrowLeft:-1,ArrowDown:ovCols,ArrowUp:-ovCols}[k];
  if(d){e.preventDefault();ovMark(Math.max(0,Math.min(n-1,ovSel+d)));}
}
function setBlank(c){if(blankEl.className===c)return;blankEl.className=c;lkTx({t:'blank',c});pvSync();}
function toggleBlank(kind){setBlank(blankEl.className===kind?'':kind);}
const vpR=()=>viewport.getBoundingClientRect();   // 무대가 들어가는 칸(평소 = 창 전체, 발표자 보기 = 지금 장 칸)
function fit(){
  const r=vpR();if(!r.width||!r.height)return;   // 크기가 0인 칸(뒤쪽 탭, 아직 크기를 못 받은 창)은 건너뜀: 배율 0으로 나눈 값이 프로젝터 창으로 가면 그 창이 멈춤
  FS=Math.min(r.width/SW,r.height/SH);
  QUIET++;try{zvClamp();stApply(false);}finally{QUIET--;}
  if(LZ.cv&&LZ.on)lzSize();
}
/* 부분 확대(2026-10-26 교사 요청): 아이패드는 두 손가락 벌리기·오므리기, 맥은 트랙패드 핀치(사파리 gesture, 크롬 등 ctrl+휠),
   마우스는 Ctrl+휠로 손가락(포인터) 자리를 중심으로 1~4배 확대. 확대 중에는 한 손가락 끌기·두 손가락 스크롤로 옮기고,
   눌러도 장이 넘어가지 않음. 두 번 톡·두 번 클릭·Esc·위쪽 [원래대로]로 되돌리고, 장을 옮기거나 목차를 열면 저절로 원래대로.
   브라우저 자체 확대는 막음: 엔진이 창 크기에 맞춰 무대를 다시 줄이기 때문에 브라우저 확대는 바로 되돌려졌음 */
let FS=1,zbadge=null;
const ZV={z:1,x:0,y:0},ZMAX=4,PZ={p:null,d0:1,z0:1,pan:null,mv:0,used:false,tap:0,tx:0,ty:0,g:null,eat:0};
function stApply(anim){
  if(!stage)return;
  stage.style.transition=anim?'transform .35s cubic-bezier(.2,.8,.2,1)':'';
  stage.style.transform='translate(-50%,-50%) translate('+ZV.x.toFixed(1)+'px,'+ZV.y.toFixed(1)+'px) scale('+(FS*ZV.z)+')';
  const on=ZV.z>1.01;rootEl.classList.toggle('zoomed',on);
  if(zbadge){zbadge.classList.toggle('show',on);zbadge.querySelector('b').textContent=Math.round(ZV.z*100)+'%';}
  if(LZ.on)lzPaint();   // 레이저 선은 무대 좌표라 확대가 바뀌면 다시 그림
  zvTx(anim);
}
let zvLast='1,0,0';
function zvTx(a){const z=+ZV.z.toFixed(3),x=+(ZV.x/FS).toFixed(1),y=+(ZV.y/FS).toFixed(1),k=z+','+x+','+y;if(k===zvLast)return;zvLast=k;lkTx({t:'zv',z,x,y,a:!!a});}   // 확대·이동은 무대 단위로 보냄(창 크기가 달라도 같은 곳)
function zvClamp(){const mx=SW*FS*(ZV.z-1)/2,my=SH*FS*(ZV.z-1)/2;ZV.x=Math.max(-mx,Math.min(mx,ZV.x));ZV.y=Math.max(-my,Math.min(my,ZV.y));}
function zvPoint(sx,sy){const r=vpR(),S=FS*ZV.z;return {x:(sx-r.left-r.width/2-ZV.x)/S,y:(sy-r.top-r.height/2-ZV.y)/S};}   // 화면 점 아래의 무대 점(무대 가운데 기준)
function zvSet(z,p,sx,sy){   // 무대 점 p가 화면 (sx,sy)에 오도록 z배 확대
  ZV.z=Math.max(1,Math.min(ZMAX,z));
  if(ZV.z<1.001){ZV.z=1;ZV.x=0;ZV.y=0;}
  else{const r=vpR(),S=FS*ZV.z;ZV.x=sx-r.left-r.width/2-p.x*S;ZV.y=sy-r.top-r.height/2-p.y*S;zvClamp();}
  stApply(false);
}
function zvReset(anim=true){if(ZV.z===1&&!ZV.x&&!ZV.y)return;ZV.z=1;ZV.x=0;ZV.y=0;stApply(anim);}
const zvOK=()=>!STILL&&!OV&&!ZM&&!rootEl.classList.contains('print');
const inVp=e=>!PV||!!(e.target&&e.target.closest&&e.target.closest('#viewport,#laser'));   // 발표자 보기에서는 지금 장 칸(과 그 위 레이저 캔버스) 안의 손동작만
function zoomInit(){
  Deck.zoom=ZV;   // 확인용(콘솔에서 Deck.zoom)
  zbadge=document.createElement('div');zbadge.id='zbadge';
  zbadge.innerHTML='<span>확대 <b>100%</b></span><button type="button">원래대로</button>';
  document.body.appendChild(zbadge);
  zbadge.addEventListener('click',e=>{e.stopPropagation();zvReset();});
  ['touchstart','touchend','pointerdown'].forEach(ev=>zbadge.addEventListener(ev,e=>e.stopPropagation(),{passive:true}));
  // 아이패드: 두 손가락 = 확대, 확대 중 한 손가락 = 옮기기
  addEventListener('touchstart',e=>{
    if(!zvOK()||LZ.on||!inVp(e))return;
    const t=e.touches;
    if(t.length===2){const a=t[0],b=t[1];PZ.used=true;PZ.d0=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)||1;PZ.z0=ZV.z;
      PZ.p=zvPoint((a.clientX+b.clientX)/2,(a.clientY+b.clientY)/2);PZ.pan=null;e.preventDefault();}
    else if(t.length===1&&ZV.z>1.01){PZ.pan={x:t[0].clientX,y:t[0].clientY,ox:ZV.x,oy:ZV.y};PZ.mv=0;}
  },{passive:false});
  addEventListener('touchmove',e=>{
    if(!zvOK()||LZ.on)return;
    const t=e.touches;
    if(t.length===2&&PZ.p){const a=t[0],b=t[1];zvSet(PZ.z0*Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/PZ.d0,PZ.p,(a.clientX+b.clientX)/2,(a.clientY+b.clientY)/2);e.preventDefault();}
    else if(t.length===1&&PZ.pan){const dx=t[0].clientX-PZ.pan.x,dy=t[0].clientY-PZ.pan.y;PZ.mv=Math.max(PZ.mv,Math.hypot(dx,dy));
      ZV.x=PZ.pan.ox+dx;ZV.y=PZ.pan.oy+dy;zvClamp();stApply(false);e.preventDefault();}
  },{passive:false});
  addEventListener('touchend',e=>{
    if(e.touches.length===1&&PZ.p){PZ.p=null;if(ZV.z>1.01){const t=e.touches[0];PZ.pan={x:t.clientX,y:t.clientY,ox:ZV.x,oy:ZV.y};PZ.mv=99;}return;}   // 두 손가락 중 하나를 떼면 남은 손가락으로 옮기기
    if(e.touches.length)return;
    if(PZ.pan&&!PZ.used&&PZ.mv<10){   // 확대 중 톡 두 번 = 원래대로
      const c=e.changedTouches[0],now=performance.now();
      if(now-PZ.tap<350&&Math.hypot(c.clientX-PZ.tx,c.clientY-PZ.ty)<40){PZ.tap=0;PZ.eat=now;zvReset();}else{PZ.tap=now;PZ.tx=c.clientX;PZ.ty=c.clientY;}   // 두 번째 톡이면 원래대로, 뒤따르는 클릭은 버림(장이 넘어가지 않게)
    }
    PZ.pan=null;PZ.p=null;setTimeout(()=>{PZ.used=false;},0);   // 이 손동작이 끝날 때까지는 밀기(장 넘기기)로 보지 않음
  },{passive:true});
  // 맥 사파리 트랙패드 핀치(아이패드는 위 터치로 처리)
  const touchDev=navigator.maxTouchPoints>0;
  addEventListener('gesturestart',e=>{e.preventDefault();if(touchDev||!zvOK())return;PZ.g={z0:ZV.z,p:zvPoint(e.clientX,e.clientY)};},{passive:false});
  addEventListener('gesturechange',e=>{e.preventDefault();if(touchDev||!PZ.g||!zvOK())return;zvSet(PZ.g.z0*e.scale,PZ.g.p,e.clientX,e.clientY);},{passive:false});
  addEventListener('gestureend',e=>{e.preventDefault();PZ.g=null;},{passive:false});
  // 크롬·엣지·파이어폭스: 트랙패드 핀치와 Ctrl+휠 = 확대, 확대 중 두 손가락 스크롤·휠 = 옮기기, 그 밖의 휠 = 장 넘기기(whNav)
  addEventListener('wheel',e=>{
    if(!zvOK()||!inVp(e))return;
    if(e.ctrlKey){e.preventDefault();if(PZ.g)return;const d=Math.max(-50,Math.min(50,e.deltaY*(e.deltaMode?20:1)));zvSet(ZV.z*Math.exp(-d*0.01),zvPoint(e.clientX,e.clientY),e.clientX,e.clientY);}
    else if(ZV.z>1.01){e.preventDefault();ZV.x-=e.deltaX;ZV.y-=e.deltaY;zvClamp();stApply(false);}
    else whNav(e);
  },{passive:false});
  addEventListener('dblclick',e=>{if(ZV.z>1.01&&!e.target.closest('#hud,#zbadge,.ia-panel,#pv'))zvReset();});
}
function pokeHud(){
  hud.classList.add('show');clearTimeout(hudTimer);
  hudTimer=setTimeout(()=>hud.classList.remove('show'),2500);
}
function setNotes(v){
  notesEl.classList.toggle('show',v);
  document.body.classList.toggle('notes-open',notesEl.classList.contains('show')&&!rootEl.classList.contains('student'));
}

/* 레이저 포인터(L): 켜면 빨간 점이 마우스를 따라가고, 누른 채 움직이면 선이 그려졌다가 떼면 서서히 사라진다.
   켜져 있어도 방향키로 넘길 수 있고, 장·단계가 바뀌면 그려 둔 선은 지운다. Esc로 끈다. */
const LZ={on:false,cv:null,g:null,pt:null,pts:[],down:null,seq:0,raf:0,r:null,q:[],qr:0},LZ_FADE=1100,LZ_ALPHA=.7;   // 선의 기본 투명도
/* 점은 무대 좌표(무대 가운데 기준)로 저장한다 → 부분 확대·발표자 보기·프로젝터 창에서도 슬라이드의 같은 자리에 그려짐 */
function lzPaint(){if(!LZ.raf)LZ.raf=requestAnimationFrame(lzDraw);}
function lzClear(){if(LZ.pts.length){LZ.pts=[];lzPaint();}}
function lzSize(){
  const r=LZ.r=vpR(),d=Math.min(devicePixelRatio||1,2);
  Object.assign(LZ.cv.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});   // 캔버스 = 무대 칸
  LZ.cv.width=Math.round(r.width*d);LZ.cv.height=Math.round(r.height*d);
  LZ.g.setTransform(d,0,0,d,0,0);lzPaint();
}
function lzSet(v){
  if(LZ.on!==v)lkTx({t:'lzon',v});
  LZ.on=v;LZ.pts=[];LZ.pt=null;LZ.down=null;
  LZ.cv.classList.toggle('on',v);document.getElementById('b-laser').classList.toggle('on',v);
  if(v)lzSize();else lzPaint();
  pvSync();
}
function lzDraw(now){
  const g=LZ.g,r=LZ.r||vpR();LZ.raf=0;g.clearRect(0,0,r.width,r.height);
  if(!LZ.on)return;
  LZ.pts=LZ.pts.filter(p=>p.t==null||now-p.t<LZ_FADE);
  const S=FS*ZV.z,cx=r.width/2+ZV.x,cy=r.height/2+ZV.y,X=p=>cx+p.x*S,Y=p=>cy+p.y*S;
  g.lineCap=g.lineJoin='round';
  // 획마다 하나의 경로로 그린다(반투명 선분이 겹치는 이음매가 진해지지 않게)
  for(let i=0;i<LZ.pts.length;){
    const s=LZ.pts[i].s,t=LZ.pts[i].t;let j=i;
    g.beginPath();g.moveTo(X(LZ.pts[i]),Y(LZ.pts[i]));
    while(j+1<LZ.pts.length&&LZ.pts[j+1].s===s){j++;g.lineTo(X(LZ.pts[j]),Y(LZ.pts[j]));}
    if(j>i){
      g.globalAlpha=LZ_ALPHA*(t==null?1:Math.max(0,1-(now-t)/LZ_FADE));
      g.lineWidth=6;g.strokeStyle='rgba(255,45,85,.22)';g.stroke();
      g.lineWidth=2.5;g.strokeStyle='#ff2d55';g.stroke();
    }
    i=j+1;
  }
  g.globalAlpha=1;
  if(LZ.pt){
    const x=X(LZ.pt),y=Y(LZ.pt),gl=g.createRadialGradient(x,y,2,x,y,22);
    gl.addColorStop(0,'rgba(255,45,85,.75)');gl.addColorStop(1,'rgba(255,45,85,0)');
    g.fillStyle=gl;g.beginPath();g.arc(x,y,22,0,Math.PI*2);g.fill();
    g.fillStyle='#ff2d55';g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.arc(x,y,6.5,0,Math.PI*2);g.fill();g.stroke();
  }
  if(LZ.pts.some(p=>p.t!=null))lzPaint();   // 사라지는 중인 선이 있으면 계속 그린다
}
function lzAt(p,draw){   // p: 무대 좌표
  LZ.pt=p;
  if(draw){const l=LZ.pts[LZ.pts.length-1];if(!l||l.s!==LZ.seq||Math.hypot(l.x-p.x,l.y-p.y)*FS*ZV.z>=2)LZ.pts.push({x:p.x,y:p.y,t:null,s:LZ.seq});}
  lzPaint();
}
function lzUp(touch){const t=performance.now();LZ.pts.forEach(p=>{if(p.t==null)p.t=t;});LZ.down=null;if(touch)LZ.pt=null;lzPaint();}
function lzTx(a,p){   // 레이저 움직임은 한 프레임씩 모아 다른 창에 보냄
  if(REMOTE||!LINK.on)return;
  LZ.q.push(p?[a,Math.round(p.x),Math.round(p.y)]:[a]);
  if(!LZ.qr)LZ.qr=requestAnimationFrame(()=>{LZ.qr=0;const q=LZ.q;LZ.q=[];lkTx({t:'lz',q});});
}
function lzRx(q){
  q.forEach(([a,x,y])=>{const p={x,y};
    if(a==='d'){LZ.seq++;LZ.down='r';lzAt(p,true);}
    else if(a==='m')lzAt(p,LZ.down!=null);
    else if(a==='u'||a==='U')lzUp(a==='U');
    else if(a==='l'){LZ.pt=null;lzPaint();}
  });
}
function lzMount(){
  const cv=LZ.cv=document.createElement('canvas');cv.id='laser';document.body.appendChild(cv);
  LZ.g=cv.getContext('2d');
  const pt=e=>zvPoint(e.clientX,e.clientY);
  cv.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();LZ.down=e.pointerId;LZ.seq++;cv.setPointerCapture(e.pointerId);const p=pt(e);lzAt(p,true);lzTx('d',p);});
  cv.addEventListener('pointermove',e=>{const p=pt(e);lzAt(p,LZ.down!=null);lzTx('m',p);});
  const up=e=>{
    if(e.pointerId!==LZ.down)return;
    const p=pt(e),touch=e.pointerType!=='mouse';lzAt(p,true);lzTx('m',p);lzUp(touch);lzTx(touch?'U':'u');
  };
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('pointerleave',()=>{if(LZ.down==null){LZ.pt=null;lzPaint();lzTx('l');}});
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  addEventListener('resize',()=>{if(LZ.on)lzSize();});
}

/* ═══ 프로젝터 창 연결(2026-10-27 교사 요청) ═══
   아이패드를 HDMI로 프로젝터에 이으면 아이패드 화면이 그대로 미러링되어(아이패드 화면 비율) 16:9 슬라이드가 작게 나온다.
   아이패드의 Safari·Chrome(둘 다 WebKit) 웹페이지는 외부 화면에만 따로 그릴 수 없으므로(Presentation API 없음),
   스테이지 매니저로 창 두 개를 쓴다: 프로젝터 창(?screen=1) = 슬라이드만, 이 창 = 발표자 보기.
   한 창에서 한 일(장·단계 넘기기, 장 안의 단추·막대·체크, 레이저, 그림 크게 보기, 부분 확대, 일시정지, 검은 화면)을
   다른 창이 그대로 따라 한다. 같은 브라우저의 같은 수업 창끼리 BroadcastChannel로 주고받고(서버 없음),
   그것이 안 되는 브라우저를 위해 localStorage 'storage' 이벤트를 예비 길로 함께 쓴다(BroadcastChannel로 받으면 예비 길은 끔). */
const ENG_CLS=['still','student','noans','print','paused','zoomed','pv','screen','thumb'];
function lkPost(m){
  if(!LINK.on)return;
  m.$f=LINK.id;m.$n=++LINK.n;m.$r=ROLE;   // 봉투(보낸 창·순번·역할)는 $ 이름으로 — 내용 칸과 겹치지 않게
  if(LINK.ch)try{LINK.ch.postMessage(m);}catch(e){}
  if(LINK.ls)try{localStorage.setItem(LINK.key,JSON.stringify(m));}catch(e){}
}
function lkTx(m){if(REMOTE||QUIET||!LINK.on)return;LINK.at=performance.now();lkPost(m);}
function lkLinked(){const want=ROLE==='screen'?'main':'screen',now=Date.now();return Object.keys(LINK.peers).some(id=>{const p=LINK.peers[id];return p.r===want&&now-p.t<6500;});}
function lkCheck(){const on=lkLinked();if(on===LINK.was)return;LINK.was=on;
  if(ROLE==='main'&&on&&!PV)pvSet(true);   // 프로젝터 창이 연결되면 이 창은 발표자 보기로
  if(ROLE==='screen')scrSync(on);
  pvSync();
}
function uiPath(el){const sec=el.closest('.slide');if(!sec)return null;const p=[];for(let n=el;n&&n!==sec;n=n.parentElement)p.unshift(Array.prototype.indexOf.call(n.parentElement.children,n));return {i:Deck.list.indexOf(sec),p};}
function uiEl(i,p){let n=Deck.list[i];for(const j of p){if(!n)return null;n=n.children[j];}return n||null;}
function uiTx(el,ev){   // 장 안의 단추·막대·체크(직접 해 보기 등)를 다른 창에서도 똑같이
  if(REMOTE||QUIET||!LINK.on||!el||!el.closest||!el.closest('#stage > .slide'))return;
  if(ev!=='click'&&!/^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName))return;
  const P=uiPath(el);if(!P||P.i!==Deck.i)return;
  const m={t:'ui',i:P.i,p:P.p,e:ev};
  if(ev!=='click')m.v=(el.type==='checkbox'||el.type==='radio')?el.checked:el.value;
  lkTx(m);
}
function uiRx(m){
  if(m.i!==Deck.i)return;const el=uiEl(m.i,m.p);if(!el)return;
  if(m.e==='click'){el.click();return;}
  if(typeof m.v==='boolean')el.checked=m.v;else if(m.v!=null)el.value=m.v;
  el.dispatchEvent(new Event(m.e,{bubbles:true}));
}
function lkState(to){   // 새로 연 프로젝터 창이 지금 상태를 한 번에 맞추도록
  const sec=Deck.list[Deck.i];
  const ui=Array.from(sec.querySelectorAll('input,select,textarea')).map(el=>{const ck=el.type==='checkbox'||el.type==='radio';return {p:uiPath(el).p,e:(ck||el.tagName==='SELECT')?'change':'input',v:ck?el.checked:el.value};});
  return {t:'state',to,i:Deck.i,k:Deck.k,ps:PAUSED,bk:blankEl.className,lz:LZ.on,zv:[ZV.z,ZV.x/FS,ZV.y/FS],
    pic:ZM?Array.from(sec.querySelectorAll('.pic')).indexOf(ZM.fig):-1,hc:Array.from(rootEl.classList).filter(c=>!ENG_CLS.includes(c)),ui};
}
async function lkApplyState(m){
  let pr;REMOTE=true;try{pr=show(m.i,m.k,{instant:true});}finally{REMOTE=false;}
  await pr;
  REMOTE=true;
  try{
    Array.from(rootEl.classList).forEach(c=>{if(!ENG_CLS.includes(c)&&!m.hc.includes(c))rootEl.classList.remove(c);});   // 수업 전용 상태(예: 조석 [실제 바다])
    m.hc.forEach(c=>rootEl.classList.add(c));
    (m.ui||[]).forEach(u=>uiRx({i:m.i,p:u.p,e:u.e,v:u.v}));
    setPause(!!m.ps);setBlank(m.bk||'');if(LZ.on!==!!m.lz)lzSet(!!m.lz);
    if(m.zv){ZV.z=m.zv[0];ZV.x=m.zv[1]*FS;ZV.y=m.zv[2]*FS;zvClamp();stApply(false);}
    if(m.pic>=0){const f=Deck.list[Deck.i].querySelectorAll('.pic')[m.pic];if(f)zoomOpen(f);}
  }finally{REMOTE=false;}
}
function lkDo(m){
  switch(m.t){
    case 'show':show(m.i,m.k,m.o||{});break;
    case 'step':if(m.i===Deck.i&&m.k===Deck.k+1)stepTo(m.k);else if(m.i!==Deck.i||m.k!==Deck.k)show(m.i,m.k,{instant:true});break;
    case 'hurry':if(Deck.ctx&&Deck.ctx.isBusy())Deck.ctx.hurry();break;
    case 'pause':setPause(!!m.v);break;
    case 'blank':setBlank(m.c||'');break;
    case 'lzon':if(LZ.on!==!!m.v)lzSet(!!m.v);break;
    case 'lz':lzRx(m.q||[]);break;
    case 'zv':ZV.z=m.z;ZV.x=m.x*FS;ZV.y=m.y*FS;zvClamp();stApply(m.a);break;
    case 'pic':if(m.i===Deck.i&&!ZM){const f=Deck.list[Deck.i].querySelectorAll('.pic')[m.n];if(f)zoomOpen(f);}break;
    case 'picx':zoomClose(m.now);break;
    case 'ui':uiRx(m);break;
  }
}
function lkRx(m,bc){
  if(!m||typeof m!=='object'||m.$f===LINK.id||!LINK.on)return;
  if(bc)LINK.ls=false;   // BroadcastChannel로 받았으면 예비 길(localStorage)은 그만 씀
  if(m.$n<=(LINK.last[m.$f]||0))return;LINK.last[m.$f]=m.$n;   // 두 길로 온 같은 메시지는 한 번만
  if(m.t==='bye')delete LINK.peers[m.$f];else LINK.peers[m.$f]={r:m.$r,t:Date.now()};
  if(m.t==='hello'){if(ROLE==='main'&&m.$r==='screen')lkPost(lkState(m.$f));}
  else if(m.t==='state'){if(m.to===LINK.id)lkApplyState(m);}
  else if(m.t==='beat'){   // 혹시 놓친 명령이 있으면 발표자 창의 장·단계로 맞춤
    if(ROLE==='screen'&&m.$r==='main'&&(m.i!==Deck.i||m.k!==Deck.k)&&performance.now()-LINK.at>2500&&!OV){REMOTE=true;try{show(m.i,m.k,{instant:true});}finally{REMOTE=false;}}
  }
  else if(m.t!=='bye'){LINK.at=performance.now();REMOTE=true;try{lkDo(m);}catch(e){console.error(e);}finally{REMOTE=false;}}
  lkCheck();
}
let scrEl=null,scrT=0;
function scrSync(on){
  if(!scrEl)return;
  scrEl.classList.toggle('on',on);
  scrEl.querySelector('span').textContent=on?'발표자 창과 연결됨 · 이 창은 발표자 창을 따라 움직입니다':'발표자 창을 찾는 중…';
  scrShow();
}
/* 프로젝터 창 알림(전체 화면 단추가 들어 있음): 연결되면 4초 뒤 숨고, 이 창 위에서 포인터를 움직이거나 누르면 다시 나옴.
   연결 전이거나 포인터가 전체 화면 단추가 있는 알림 위에 있으면 숨지 않음. 이미 전체 화면이면 단추는 숨김 */
function scrShow(){
  if(!scrEl)return;
  const fsb=scrEl.querySelector('button'),fs=!!(document.fullscreenElement||document.webkitFullscreenElement);fsb.style.display=fs?'none':'';
  scrEl.classList.remove('hide');clearTimeout(scrT);
  if(scrEl.classList.contains('on')&&(fs||!scrEl.matches(':hover')))scrT=setTimeout(()=>scrEl.classList.add('hide'),4000);
}
function lkInit(){
  if(THUMB||STILL||STUDENT||rootEl.classList.contains('print'))return;
  LINK.on=true;
  try{LINK.ch=new BroadcastChannel(LINK.key);LINK.ch.onmessage=e=>lkRx(e.data,true);}catch(e){LINK.ch=null;}
  addEventListener('storage',e=>{if(e.key!==LINK.key||!e.newValue)return;let m=null;try{m=JSON.parse(e.newValue);}catch(_){}lkRx(m,false);});
  document.addEventListener('input',e=>uiTx(e.target,'input'),true);
  document.addEventListener('change',e=>uiTx(e.target,'change'),true);
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b)uiTx(b,'click');},true);
  setInterval(()=>{lkPost({t:'beat',i:Deck.i,k:Deck.k});lkCheck();},2000);
  addEventListener('pagehide',()=>lkPost({t:'bye'}));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)lkPost({t:'hello'});});   // 숨어 있던 창이 다시 보이면 상태를 다시 맞춤
  if(ROLE==='screen'){
    scrEl=document.createElement('div');scrEl.id='scr';
    scrEl.innerHTML='<i></i><span></span><button type="button">전체 화면</button>';
    const fsb=scrEl.querySelector('button'),rq=rootEl.requestFullscreen||rootEl.webkitRequestFullscreen;
    if(!rq){fsb.disabled=true;fsb.textContent='이 브라우저는 전체 화면 안 됨';}   // 전체 화면 기능이 없는 브라우저: 단추를 빼지 않고 안 된다고 보여 줌
    else fsb.onclick=e=>{e.stopPropagation();try{rq.call(rootEl);}catch(_){}clearTimeout(scrT);scrEl.classList.add('hide');};
    ['click','pointerdown','touchstart','touchend'].forEach(ev=>scrEl.addEventListener(ev,e=>e.stopPropagation(),{passive:true}));
    scrEl.addEventListener('pointerleave',()=>{if(!scrEl.classList.contains('hide'))scrShow();});   // 숨으면서 생긴 '나감'에는 다시 띄우지 않음(깜빡임 방지)
    ['pointermove','pointerdown'].forEach(ev=>addEventListener(ev,scrShow,{passive:true}));   // 포인터를 움직이거나 누르면 알림이 다시 나옴
    document.body.appendChild(scrEl);scrSync(false);
  }
  lkPost({t:'hello'});
}

/* ═══ 발표자 보기(V, 2026-10-27 교사 요청 · 2026-11-03 배치 바꿈) ═══
   이 창(노트북·아이패드)에 위 도구 줄, 지금 장(그대로 누르고 조작), 다음·이전 장 미리보기, 넘기기 단추 넷, 아래 칸(단계 · 발표자 노트 탭)을 놓는다.
   지금 장은 무대 칸(#viewport)을 그 자리로 옮겨 그리고, 미리보기(다음·이전 장, 단계 칸)는 같은 수업을 ?thumb=1(정지 화면, 다 그린 뒤 멈춤)로 띄운 작은 창.
   가로 창: 지금 장 | 이전·다음 장(오른쪽 위 = 이전 장, 아래 = 다음 장) · 아래 칸 | 단추 넷(2×2). 세로 창: 지금 장 → 이전 장 | 다음 장 → 단계 단추 → 장 단추 → 아래 칸.
   단계 칸은 칸 높이를 꽉 채우되 지금·다음 두 칸은 다 보이게 하고, 넘치면 옆으로 밀어 보며 단계를 넘기면 지금 단계가 왼쪽에 오게 따라감.
   프로젝터 창이 연결되면 저절로 켜지고, V·도구 모음 단추로 켜고 끈다 */
let pvEl=null,pvT0=0,pvIv=0,pvLastI=-1,pvNT=false,pvSI=-1,pvFK='',pvSX=null,pvSY=null,pvFrame=null,pvRaf=0;   // pvSX·pvSY: 경계선으로 바꾼 비율(없으면 원본) · pvFrame: 끌 때 쓰는 배치 값
let pvFS=1,pvFB=22;const PVF='deck-pv-notefont';try{const v=+localStorage.getItem(PVF);if(v>=.7&&v<=2)pvFS=v;}catch(e){}   // 노트 글자 크기 배율(1 = 기본)·기본 크기 — 이 브라우저에 기억
const PVK='deck-pv-split';try{const o=JSON.parse(localStorage.getItem(PVK)||'null');if(o&&o.x>0&&o.y>0){pvSX=o.x;pvSY=o.y;}}catch(e){}   // 바꾼 비율은 이 브라우저에 기억(다른 수업·새로 고침에도)
//   // pvNT: 노트 탭이 열림 · pvSI: 단계 칸이 그리는 장 · pvFK: 단계 칸이 마지막으로 따라간 '장:단계'
const PVI={
  scr:'<svg viewBox="0 0 20 20"><rect x="2.5" y="3.5" width="15" height="10" rx="1.5"/><path d="M7 17h6M10 13.5V17"/></svg>',
  mk:'<svg viewBox="0 0 20 20"><path d="M5.5 3h9v14l-4.5-3.5L5.5 17z"/></svg>',
  ov:'<svg viewBox="0 0 20 20"><rect x="3" y="3" width="5.5" height="5.5" rx="1"/><rect x="11.5" y="3" width="5.5" height="5.5" rx="1"/><rect x="3" y="11.5" width="5.5" height="5.5" rx="1"/><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1"/></svg>',
  lz:'<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="2.6"/><path d="M10 2.5v3M10 14.5v3M2.5 10h3M14.5 10h3"/></svg>',
  ps:'<svg viewBox="0 0 20 20"><path d="M7 4.5v11M13 4.5v11"/></svg>',
  bk:'<svg viewBox="0 0 20 20"><rect x="3" y="4.5" width="14" height="11" rx="1.5"/><path d="M6 8l8 4M14 8l-8 4"/></svg>',
  x:'<svg viewBox="0 0 20 20"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9"/></svg>',
  pp:'<svg viewBox="0 0 20 20"><path d="M10 5l-5 5 5 5M16 5l-5 5 5 5"/></svg>',
  np:'<svg viewBox="0 0 20 20"><path d="M4 5l5 5-5 5M10 5l5 5-5 5"/></svg>',
  rs:'<svg viewBox="0 0 20 20"><path d="M4.5 10a5.5 5.5 0 1 0 1.6-3.9M4.5 3.8v3.3h3.3"/></svg>'
};
function pvBuild(){
  pvEl=document.createElement('div');pvEl.id='pv';
  const tool=(c,t,ic)=>'<button type="button" class="'+c+'" title="'+t+'">'+PVI[ic]+'<span>'+t+'</span></button>';
  const touch=navigator.maxTouchPoints>0;
  pvEl.innerHTML=
    '<div class="pv-top"><div class="pv-link"><i></i><span></span></div>'+
    '<a class="pv-open" target="_blank">'+PVI.scr+'<span>프로젝터 창 열기</span></a><span class="pv-sp"></span>'+
    '<div class="pv-time"><span>경과</span><button type="button" class="pv-el" title="누르면 0부터 다시">0:00</button><span class="pv-clock"></span></div>'+
    '<div class="pv-tools">'+tool('pv-ov','목차','ov')+tool('pv-mk','책갈피','mk')+tool('pv-lz','레이저','lz')+tool('pv-ps','멈춤','ps')+tool('pv-bk','화면 끄기','bk')+tool('pv-rs','비율 원래대로','rs')+tool('pv-x','닫기','x')+'</div></div>'+
    '<div class="pv-lab pv-lc"><span class="k">지금</span><b class="pv-pos"></b><em class="pv-t"></em><span class="pv-badge ps">멈춤</span><span class="pv-badge bk">프로젝터 화면 꺼짐</span><span class="pv-dots"></span></div>'+
    '<div class="pv-lab pv-ln"><span class="k">다음 장</span><em></em></div>'+
    '<div class="pv-fr pv-fn"><iframe title="다음 장 미리보기" tabindex="-1" aria-hidden="true"></iframe><div class="none">마지막 장입니다</div></div>'+
    '<div class="pv-lab pv-lp"><span class="k">이전 장</span><em></em></div>'+
    '<div class="pv-fr pv-fp"><iframe title="이전 장 미리보기" tabindex="-1" aria-hidden="true"></iframe><div class="none">첫 장입니다</div></div>'+
    '<button type="button" class="pv-b pv-pr"><span>◀ 이전</span><span class="ks"><kbd>←</kbd></span></button>'+
    '<button type="button" class="pv-b pv-nx"><span>다음 ▶</span><small></small><span class="ks"><kbd>→</kbd></span></button>'+
    '<button type="button" class="pv-b pg pv-pp"><span class="t">'+PVI.pp+'이전 장</span><span class="ks"><kbd>Shift ←</kbd><kbd>휠 ▲</kbd></span></button>'+
    '<button type="button" class="pv-b pg pv-np"><span class="t">다음 장'+PVI.np+'</span><span class="ks"><kbd>Shift →</kbd><kbd>휠 ▼</kbd></span></button>'+
    '<div class="pv-notes"><div class="pv-tabs"><button type="button" class="pv-tst"><span>단계</span><b></b></button><button type="button" class="pv-tnt"><span>발표자<br>노트</span><kbd>N</kbd></button></div>'+
    '<div class="pv-steps"><div class="pv-none">이 장은 단계가 없습니다</div></div><div class="pv-nt"></div>'+
    '<div class="pv-fs" title="발표자 노트 글자 크기"><span class="s">가</span><input type="range" min="0.7" max="2" step="0.05" aria-label="발표자 노트 글자 크기"><span class="l">가</span><b></b><button type="button">기본</button></div></div>'+
    '<div class="pv-split pv-sv" title="끌어서 왼쪽·오른쪽 비율 바꾸기"></div><div class="pv-split pv-sh" title="끌어서 위·아래 비율 바꾸기"></div>';
  document.body.appendChild(pvEl);
  const $=q=>pvEl.querySelector(q);
  $('.pv-open').addEventListener('click',e=>{   // 컴퓨터: 따로 떨어진 창으로 열기 · 아이패드: 길게 눌러 ‘새 창에서 열기’(그냥 누르면 새 탭)
    if(touch)return;
    e.preventDefault();window.open(e.currentTarget.href,'deck-screen','popup=yes,width=1280,height=720');
  });
  $('.pv-el').onclick=()=>{pvT0=Date.now();pvTick();};
  $('.pv-ov').onclick=()=>{OV?closeToc():openToc();};
  $('.pv-mk').onclick=()=>openMark();   // 책갈피(2026-10-29: 아이패드에는 M 키가 없어 발표자 보기에서도 버튼으로)
  $('.pv-lz').onclick=()=>lzSet(!LZ.on);
  $('.pv-ps').onclick=()=>setPause(!PAUSED);
  $('.pv-bk').onclick=()=>setBlank(blankEl.className?'':'black');
  $('.pv-x').onclick=()=>pvSet(false);
  $('.pv-pr').onclick=()=>prev();
  $('.pv-nx').onclick=()=>next();
  $('.pv-pp').onclick=()=>prevPage();
  $('.pv-np').onclick=()=>nextPage();
  $('.pv-tst').onclick=()=>pvTab(false);
  $('.pv-tnt').onclick=()=>pvTab(true);
  $('.pv-rs').onclick=()=>pvSplitReset();
  const fsr=$('.pv-fs input');fsr.value=pvFS;fsr.addEventListener('input',()=>pvFontSet(+fsr.value));fsr.addEventListener('change',()=>fsr.blur());   // 놓으면 초점을 빼서 방향키가 장을 넘기게
  $('.pv-fs button').onclick=()=>pvFontSet(1);
  $('.pv-steps').addEventListener('click',e=>{   // 단계 칸을 누르면 그 단계로(바로 다음 단계는 → 키처럼 움직이며 넘어감)
    const d=e.target.closest('.pv-st');if(!d||OV)return;const k=+d.dataset.k;
    if(k===Deck.k+1)next();else if(k!==Deck.k)show(Deck.i,k,{instant:true});
  });
  pvEl.addEventListener('click',e=>{const b=e.target.closest('button');if(b)b.blur();});   // 누른 단추에 초점이 남아 Space가 단추를 다시 누르지 않게
  [['.pv-fn',1],['.pv-fp',-1]].forEach(([q,d])=>{
    const box=$(q),fr=box.querySelector('iframe');
    fr.addEventListener('load',()=>{if(!fr.getAttribute('src'))return;box.__ready=true;box.__busy=false;box.classList.add('ready');
      const j=box.__want;box.__want=null;if(j!=null&&j!==box.__at)pvThumb(box,j);});
    box.onclick=()=>{const j=+box.dataset.j;if(!(j>=0))return;if(d>0)show(j,0);else show(j,stepsOf(Deck.list[j]),{instant:true});};   // 다음 장은 처음부터, 이전 장은 다 나온 상태로
  });
  pvSI=-1;pvFK='';pvTab(pvNT);pvSplitInit();
}
function pvSplitInit(){   // 경계선 끌기(2026-11-05 교사 요청): 마우스·손가락으로 끌면 비율이 바뀌고, 놓으면 이 브라우저에 기억
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  pvEl.querySelectorAll('.pv-split').forEach(h=>{
    const vx=h.classList.contains('pv-sv');
    h.addEventListener('pointerdown',e=>{
      if(!pvFrame)return;e.preventDefault();e.stopPropagation();try{h.setPointerCapture(e.pointerId);}catch(_){}
      h.classList.add('on');rootEl.classList.add(vx?'pv-dragx':'pv-dragy');
      if(pvSX==null||pvSY==null){pvSX=pvFrame.sx0;pvSY=pvFrame.sy0;}   // 처음 끌 때는 원본 비율에서 시작
      const mv=ev=>{const F=pvFrame;
        if(vx)pvSX=cl((ev.clientX-F.x0-F.G/2)/F.FW,.4,1-Math.max(220,F.FW*.15)/F.FW);   // 왼쪽 40% 이상, 오른쪽 220px·15% 이상
        else pvSY=cl((ev.clientY-F.TB-F.G/2)/F.AH,(F.L+150)/F.AH,(F.AH-140)/F.AH);   // 지금 장 150px 이상, 아래 칸 140px 이상
        if(!pvRaf)pvRaf=requestAnimationFrame(()=>{pvRaf=0;pvLayout();fit();});};
      const up=()=>{h.removeEventListener('pointermove',mv);h.removeEventListener('pointerup',up);h.removeEventListener('pointercancel',up);
        h.classList.remove('on');rootEl.classList.remove('pv-dragx','pv-dragy');try{localStorage.setItem(PVK,JSON.stringify({x:pvSX,y:pvSY}));}catch(_){}};
      h.addEventListener('pointermove',mv);h.addEventListener('pointerup',up);h.addEventListener('pointercancel',up);
    });
  });
}
function pvFontApply(){   // 노트 글자 크기 적용 + 슬라이더 표시(px, '기본' 단추)
  if(!pvEl)return;const px=Math.round(pvFB*pvFS),f=pvEl.querySelector('.pv-fs'),i=f.querySelector('input');
  pvEl.style.setProperty('--pvf',px+'px');f.classList.toggle('chg',Math.abs(pvFS-1)>.001);f.querySelector('b').textContent=px+'px';if(+i.value!==pvFS)i.value=pvFS;
}
function pvFontSet(v){pvFS=Math.max(.7,Math.min(2,v));try{if(Math.abs(pvFS-1)<.001)localStorage.removeItem(PVF);else localStorage.setItem(PVF,String(pvFS));}catch(e){}pvFontApply();}   // 노트 글자 크기 슬라이더(기본 = ×1)
function pvSplitReset(){pvSX=pvSY=null;try{localStorage.removeItem(PVK);}catch(e){}pvLayout();fit();}   // 비율 원래대로
function pvThumb(box,j){
  const ok=j>=0&&j<Deck.list.length;
  box.classList.toggle('empty',!ok);box.dataset.j=ok?j:-1;
  if(!ok)return;
  if(box.__busy){box.__want=j;return;}
  if(box.__at===j)return;
  const fr=box.querySelector('iframe'),w=box.__ready&&fr.contentWindow;
  if(w&&w.Deck&&w.Deck.go){box.__at=j;try{w.Deck.go(j,99,{instant:true});}catch(e){}}
  else{box.__busy=true;box.__at=j;fr.src=location.pathname+'?thumb=1&still=1&s=1&k=99#'+(j+1);}
}
function pvTick(){
  if(!pvEl)return;
  const s=Math.floor((Date.now()-pvT0)/1000),hh=Math.floor(s/3600),mm=Math.floor(s/60)%60,ss=s%60,d=new Date(),p2=v=>String(v).padStart(2,'0');
  pvEl.querySelector('.pv-el').textContent=(hh?hh+':'+p2(mm):mm)+':'+p2(ss);
  pvEl.querySelector('.pv-clock').textContent=p2(d.getHours())+':'+p2(d.getMinutes());
}
function pvTab(v){   // 아래 칸 탭: 단계 ↔ 발표자 노트(N). 고른 탭은 장을 넘겨도 그대로
  pvNT=!!v;if(!pvEl)return;
  pvEl.querySelector('.pv-notes').classList.toggle('tn',pvNT);
  pvEl.querySelector('.pv-tst').classList.toggle('on',!pvNT);pvEl.querySelector('.pv-tnt').classList.toggle('on',pvNT);
  if(!pvNT){pvStepsFit();pvFollow(false);}
}
function pvSlot(box){   // 단계 칸 하나(미리보기 창 하나). 장이 바뀌어도 지우지 않고 다시 씀
  const d=document.createElement('div');d.className='pv-st';
  d.innerHTML='<iframe title="단계 미리보기" tabindex="-1" aria-hidden="true"></iframe>';
  const fr=d.firstChild;
  fr.addEventListener('load',()=>{if(!fr.getAttribute('src'))return;d.__ready=true;d.__busy=false;d.classList.add('ready');
    const w=d.__want;d.__want=null;if(w)pvGo(d,w[0],w[1]);});
  box.appendChild(d);return d;
}
function pvGo(d,i,k){   // 단계 칸 d를 i장 k단계로(이미 열린 미리보기 창이면 Deck.go로 바꾸고, 아니면 주소로 연다)
  if(d.__busy){d.__want=[i,k];return;}
  if(d.__i===i&&d.__k===k)return;
  d.__i=i;d.__k=k;
  const fr=d.firstChild,w=d.__ready&&fr.contentWindow;
  if(w&&w.Deck&&w.Deck.go){try{w.Deck.go(i,k,{instant:true});}catch(e){}}
  else{d.__busy=true;fr.src=location.pathname+'?thumb=1&still=1&s=1&k='+k+'#'+(i+1);}
}
function pvSteps(){   // 장이 바뀌면 칸 수를 맞추고 각 칸을 그 장의 k단계로, 단계가 바뀌면 표시만 바꾼다
  const box=pvEl.querySelector('.pv-steps'),i=Deck.i,st=stepsOf(Deck.list[i]),n=st?st+1:0,slots=[...box.querySelectorAll('.pv-st')];
  if(i!==pvSI){
    pvSI=i;
    while(slots.length<n)slots.push(pvSlot(box));
    slots.forEach((d,k)=>{d.hidden=k>=n;if(k<n){d.dataset.k=k;pvGo(d,i,k);}});
    box.querySelector('.pv-none').hidden=n>0;
    pvStepsFit();
  }
  slots.forEach((d,k)=>{d.classList.toggle('done',k<Deck.k);d.classList.toggle('now',k===Deck.k);d.classList.toggle('nx',k===Deck.k+1);});
  const fk=i+':'+Deck.k;if(fk!==pvFK){const same=pvFK.split(':')[0]===String(i);pvFK=fk;pvFollow(same);}
}
function pvStepsFit(){   // 단계 칸 크기: 다 들어가면 가운데로, 아니면 높이를 꽉 채우되 지금·다음 두 칸은 다 보이게
  if(!pvEl||pvNT)return;
  const box=pvEl.querySelector('.pv-steps'),slots=[...box.querySelectorAll('.pv-st:not([hidden])')],n=slots.length;if(!n)return;
  const cs=getComputedStyle(box),r=box.getBoundingClientRect(),g=8,iw=r.width-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight);
  let ih=r.height-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
  const size=()=>Math.max(60,Math.floor(Math.max(Math.min((iw-(n-1)*g)/n,ih*16/9),Math.min(ih*16/9,(iw-g)/2)))-1);
  const set=w=>{box.classList.toggle('fit',w*n+g*(n-1)<=iw+1);slots.forEach(d=>{d.style.width=w+'px';d.style.height=(w*9/16).toFixed(1)+'px';});};
  set(size());
  const sb=box.offsetHeight-box.clientHeight;if(sb>0){ih-=sb;set(size());}   // 옆 스크롤 막대가 자리를 차지하는 브라우저
}
function pvFollow(sm){   // 지금 단계가 왼쪽에 오게 옆으로 민다(지금·다음 두 칸이 다 보일 자리가 남으면 앞 단계도 조금 보이게)
  if(!pvEl||pvNT)return;
  const box=pvEl.querySelector('.pv-steps'),c=box.querySelector('.pv-st.now');if(!c||box.classList.contains('fit'))return;
  const w=c.offsetWidth,peek=+c.dataset.k>0?Math.max(0,Math.min(w*.3,box.clientWidth-8-2*w-16)):0;
  box.scrollTo({left:Math.max(0,c.offsetLeft-4-peek),behavior:sm?'smooth':'auto'});
}
function pvSync(){
  if(!pvEl||Deck.i<0)return;
  const $=q=>pvEl.querySelector(q),n=Deck.list.length,i=Deck.i,sec=Deck.list[i],st=stepsOf(sec),T=j=>(j+1)+'. '+(Deck.list[j].dataset.title||''),on=lkLinked();
  pvEl.classList.toggle('linked',on);
  $('.pv-link').classList.toggle('on',on);$('.pv-link span').textContent=on?'프로젝터 연결됨':'프로젝터 창 없음';
  $('.pv-open').href=location.pathname+'?screen=1#'+(i+1);
  $('.pv-pos').textContent=(i+1)+' / '+n;$('.pv-t').textContent=sec.dataset.title||'';
  $('.pv-mk').classList.toggle('on',readMarks().some(p=>p.i===i));   // 이 장에 책갈피가 있으면 노랗게(아래 메뉴와 같음)
  let d='';for(let j=0;j<st;j++)d+='<i'+(j<Deck.k?' class="on"':'')+'></i>';
  $('.pv-dots').innerHTML=st?d+'<span>단계 '+Deck.k+' / '+st+'</span>':'';
  $('.pv-badge.ps').classList.toggle('show',PAUSED);$('.pv-badge.bk').classList.toggle('show',!!blankEl.className);
  $('.pv-ln em').textContent=i<n-1?T(i+1):'';$('.pv-lp em').textContent=i>0?T(i-1):'';
  pvThumb($('.pv-fn'),i+1);pvThumb($('.pv-fp'),i-1);
  if(i!==pvLastI){pvLastI=i;const t=sec.dataset.notes||'',nt=$('.pv-nt');nt.textContent=t||'이 장에는 노트가 없습니다.';nt.classList.toggle('empty',!t);nt.scrollTop=0;}
  const last=i===n-1&&Deck.k>=st,first=i===0&&Deck.k===0;
  $('.pv-pr').disabled=first;$('.pv-nx').disabled=last;$('.pv-pp').disabled=first;$('.pv-np').disabled=i===n-1;
  $('.pv-nx small').textContent=Deck.k<st?'단계 '+(Deck.k+1)+' / '+st:(last?'마지막 장':'다음 장으로');
  $('.pv-tst b').textContent=st?Deck.k+' / '+st:'';
  $('.pv-lz').classList.toggle('on',LZ.on);$('.pv-ps').classList.toggle('on',PAUSED);$('.pv-bk').classList.toggle('on',!!blankEl.className);
  pvSteps();
}
function pvLayout(){
  if(!PV||!pvEl)return;
  const W=innerWidth,H=innerHeight,P=Math.round(Math.min(16,Math.max(8,W*.008))),G=P,TB=56,L=32,f=v=>v.toFixed(1)+'px';
  const put=(q,x,y,w,h)=>{const e=pvEl.querySelector(q);e.style.left=f(x);e.style.top=f(y);e.style.width=f(w);e.style.height=f(h);};
  const row=v=>pvEl.querySelectorAll('.pv-b').forEach(e=>e.classList.toggle('row',v));
  let cur;
  if(W/H>=1.15){   // 가로 창: 지금 장 | 이전·다음 장(오른쪽 위아래) · 아래 칸 | 단추 넷(2×2). 경계선 두 개를 끌어 비율을 바꿈(2026-11-05)
    const U=W-2*P-G,PM=Math.max(190,H*.22);   // PM: 아래 칸 최소 높이
    let R=(U-(L+G)*16/9)/3,C=U-R;   // 원본 비율: 두 미리보기 높이 합 = 지금 장 높이
    const av=H-TB-L-G-PM-P;if(C*9/16>av){C=av*16/9;R=(C-(L+G)*16/9)/2;}
    const x0=(W-C-G-R)/2,FW=C+R,AH=H-P-TB-G;   // FW: 왼쪽+오른쪽 너비 · AH: 위 칸+아래 칸 높이
    let top=L+C*9/16;pvFrame={x0,FW,AH,TB,G,L,sx0:C/FW,sy0:top/AH};
    const custom=pvSX!=null&&pvSY!=null;if(custom){C=FW*pvSX;R=FW-C;top=AH*pvSY;}   // 경계선으로 바꾼 비율
    const ch=Math.min(top-L,C*9/16),cw=ch*16/9,rh=Math.min(R*9/16,(top-2*L-G)/2),rw=rh*16/9,xr=x0+C+G,xp=xr+(R-rw)/2,yb=TB+top+G,bh=H-P-yb,bw=(R-G)/2,b1=(bh-G)*.58,b2=bh-G-b1;
    cur={x:x0+(C-cw)/2,y:TB+L,w:cw,h:ch};   // 칸이 16:9보다 넓으면 지금 장은 가운데로
    put('.pv-top',x0,0,C+G+R,TB);put('.pv-lc',cur.x,TB,cw,L);   // 이름표는 그림에 맞춰
    put('.pv-lp',xp,TB,rw,L);put('.pv-fp',xp,TB+L,rw,rh);put('.pv-ln',xp,TB+L+rh+G,rw,L);put('.pv-fn',xp,TB+2*L+rh+G,rw,rh);   // 위 = 이전 장, 아래 = 다음 장(2026-11-03 교사 요청)
    put('.pv-pr',xr,yb,bw,b1);put('.pv-nx',xr+bw+G,yb,bw,b1);put('.pv-pp',xr,yb+b1+G,bw,b2);put('.pv-np',xr+bw+G,yb+b1+G,bw,b2);
    put('.pv-notes',x0,yb,C,bh);row(false);
    const hs=Math.max(G,14);put('.pv-sv',x0+C+G/2-hs/2,TB,hs,H-P-TB);put('.pv-sh',x0,TB+top+G/2-hs/2,FW+G,hs);   // 경계선 손잡이(잡기 쉽게 14px 이상)
    pvEl.classList.toggle('custom',custom);pvEl.classList.remove('pt');
  }else{   // 세로 창: 지금 장 → 이전 장 | 다음 장 → [◀ 이전][다음 ▶] → [이전 장][다음 장] → 아래 칸. 높이가 모자라면 미리보기부터, 그래도 모자라면 지금 장도 줄임
    const N1=60,N2=50,av=H-(TB+2*L+5*G+N1+N2+Math.max(160,H*.18)+P),tf=c=>(c-G)/2*9/16;
    let C=W-2*P,k=1;
    if(C*9/16+tf(C)>av){k=Math.max(.55,(av-C*9/16)/tf(C));if(C*9/16+k*tf(C)>av)C=(av+k*G/2*9/16)/(9/16*(1+k/2));}
    const ch=C*9/16,x0=(W-C)/2,hw=(C-G)/2,tw=k*hw,th=tw*9/16;
    let y=TB;put('.pv-top',P,0,W-2*P,TB);put('.pv-lc',x0,y,C,L);y+=L;cur={x:x0,y,w:C,h:ch};y+=ch+G;
    put('.pv-lp',x0,y,hw,L);put('.pv-ln',x0+hw+G,y,hw,L);y+=L;
    put('.pv-fp',x0,y,tw,th);put('.pv-fn',x0+hw+G,y,tw,th);y+=th+G;
    put('.pv-pr',x0,y,hw,N1);put('.pv-nx',x0+hw+G,y,hw,N1);y+=N1+G;
    put('.pv-pp',x0,y,hw,N2);put('.pv-np',x0+hw+G,y,hw,N2);y+=N2+G;
    put('.pv-notes',x0,y,C,H-P-y);row(true);
    pvEl.classList.add('pt');pvEl.classList.remove('custom');pvFrame=null;
  }
  Object.assign(viewport.style,{left:f(cur.x),top:f(cur.y),width:f(cur.w),height:f(cur.h),right:'auto',bottom:'auto'});
  if(zbadge){zbadge.style.left=f(cur.x+cur.w/2);zbadge.style.top=f(cur.y+10);}
  pvFB=Math.max(16,Math.min(22,W/60));pvFontApply();   // 노트 글자 크기 = 창 너비에 맞춘 기본 크기(16~22px) × 글자 크기 막대 배율. 경계선을 움직여도 바뀌지 않게 창 크기에만 맞춤(2026-11-05: 지금 장·노트 칸 너비에 맞췄을 때는 가로줄·세로줄을 움직이면 글자가 작아졌음)
  pvStepsFit();pvFollow(false);
}
function pvSet(v){
  if(v===PV)return;
  if(v&&(ROLE!=='main'||STUDENT||STILL))return;
  if(OV===1)closeToc();
  PV=v;rootEl.classList.toggle('pv',v);
  if(v){pvBuild();pvLastI=-1;pvT0=Date.now();pvIv=setInterval(pvTick,1000);pvTick();}
  else{clearInterval(pvIv);pvEl.remove();pvEl=null;viewport.style.cssText='';if(zbadge){zbadge.style.left='';zbadge.style.top='';}}
  pvLayout();fit();if(LZ.on)lzSize();pvSync();
  const b=document.getElementById('b-pv');if(b)b.classList.toggle('on',v);
}

Deck.start=function(){
  stage=document.getElementById('stage');viewport=document.getElementById('viewport');
  hud=document.getElementById('hud');progI=document.querySelector('#progress i');dotsEl=document.getElementById('stepdots');
  countEl=document.getElementById('count');notesEl=document.getElementById('notes');notesT=document.getElementById('notes-t');notesP=document.getElementById('notes-p');
  helpEl=document.getElementById('help');blankEl=document.getElementById('blank');
  // ?print=1: 레이저 인쇄용 — 어두운 장도 흰 배경(light)으로 바꾼다
  if(rootEl.classList.contains('print'))stage.querySelectorAll(':scope > .slide').forEach(sec=>{
    if(/black|dark|graphite/.test(sec.dataset.tile)){sec.dataset.tile='light';sec.classList.add('was-dark');}
  });
  Deck.list=Array.from(stage.querySelectorAll(':scope > .slide'));
  Deck.list.forEach(sec=>{
    sec.querySelectorAll('[data-fx="draw"]').forEach(el=>{
      (el.matches(GEOM)?[el]:Array.from(el.querySelectorAll(GEOM))).forEach(g=>g.setAttribute('pathLength','1'));
    });
    sec.__pristine=sec.innerHTML;
  });
  buildKw();
  ovl=document.createElement('div');ovl.id='ovl';stage.appendChild(ovl);
  fit();addEventListener('resize',()=>{pvLayout();fit();});zoomInit();
  document.getElementById('b-prev').onclick=prevPage;   // 아래 메뉴 ◀ ▶ = 장 단위(단계 건너뜀)
  document.getElementById('b-next').onclick=nextPage;
  document.getElementById('b-mark').onclick=openMark;
  document.getElementById('b-pause').onclick=e=>{e.stopPropagation();setPause(!PAUSED);e.currentTarget.blur();};
  document.getElementById('b-notes').onclick=()=>setNotes(!notesEl.classList.contains('show'));
  document.getElementById('notes-x').onclick=()=>setNotes(false);
  lzMount();document.getElementById('b-laser').onclick=e=>{e.stopPropagation();lzSet(!LZ.on);e.currentTarget.blur();};
  document.getElementById('b-ov').onclick=e=>{e.stopPropagation();OV?closeToc():openToc();};
  document.getElementById('b-pv').onclick=e=>{e.stopPropagation();pvSet(!PV);e.currentTarget.blur();};
  document.getElementById('b-fs').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else rootEl.requestFullscreen&&rootEl.requestFullscreen();};
  helpEl.addEventListener('click',e=>{if(e.target===helpEl)closeOverlays();});
  viewport.addEventListener('click',e=>{
    if(REMOTE)return;   // 프로젝터 창에서 따라 누른 단추의 클릭이 올라온 것
    if(ZM){zoomClose();return;}
    if(ZV.z>1.01||performance.now()-PZ.eat<600)return;   // 부분 확대 중(또는 두 번 톡으로 막 되돌린 직후)에는 눌러도 넘어가지 않음
    if(OV){if(OV===1){const s=e.target.closest('.slide');closeToc(s?Deck.list.indexOf(s):-1);}return;}
    if(e.target.closest('#kwbar'))return;
    const zp=e.target.closest('.slide .pic');if(zp&&!STILL&&!LZ.on){zoomOpen(zp);return;}   // 그림을 누르면 크게 보기
    const r=vpR();((e.clientX-r.left)/r.width<.28)?prev():next();
  });
  addEventListener('mousemove',pokeHud);addEventListener('touchstart',pokeHud,{passive:true});
  let tx=null;
  addEventListener('touchstart',e=>{tx=(LZ.on||!inVp(e))?null:e.touches[0].clientX;},{passive:true});   // 레이저로 긋는 동안·발표자 보기의 지금 장 밖에서는 밀기(장 넘기기)로 보지 않는다
  addEventListener('touchend',e=>{if(tx===null||OV||LZ.on||ZM||PZ.used||ZV.z>1.01){tx=null;return;}const dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>60){dx<0?next():prev();}},{passive:true});
  addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey)return;
    if(ZM){e.preventDefault();zoomClose();return;}   // 크게 보기 중에는 아무 키나 닫기만
    if(e.target.closest&&e.target.closest('#markbox,#resume,.pv-fs'))return;
    if(OV){if(OV===1)tocKey(e);return;}
    const key=e.key;
    if(key==='Escape'){if(LZ.on){lzSet(false);return;}if(ZV.z>1.01){zvReset();return;}closeOverlays();setNotes(false);setBlank('');return;}
    if(blankEl.className){setBlank('');return;}
    if(helpEl.classList.contains('show'))return;
    if(e.shiftKey&&(key==='ArrowLeft'||key==='ArrowRight')){e.preventDefault();if(key==='ArrowLeft')prevPage();else nextPage();return;}   // Shift+←/→ = 장 넘기기(2026-11-03 교사 요청, 아래 메뉴 ◀ ▶·휠과 같음)
    switch(key){
      case 'ArrowRight':case 'ArrowDown':case ' ':case 'PageDown':case 'Enter':e.preventDefault();next();break;
      case 'ArrowLeft':case 'ArrowUp':case 'PageUp':case 'Backspace':e.preventDefault();prev();break;
      case 'Home':show(0,0);break;
      case 'End':show(Deck.list.length-1,0);break;
      case 'n':case 'N':if(PV)pvTab(!pvNT);else setNotes(!notesEl.classList.contains('show'));break;   // 발표자 보기에서는 아래 칸 탭(단계 ↔ 노트) 전환
      case 'v':case 'V':pvSet(!PV);break;
      case 'l':case 'L':if(!e.repeat)lzSet(!LZ.on);break;
      case 'p':case 'P':if(!e.repeat)setPause(!PAUSED);break;
      case 'o':case 'O':openToc();break;
      case 'b':case 'B':toggleBlank('black');break;
      case 'w':case 'W':toggleBlank('white');break;
      case 'f':case 'F':document.getElementById('b-fs').click();break;
      case 'm':case 'M':openMark();break;
      case '?':helpEl.classList.add('show');break;
    }
  });
  try{localStorage.removeItem('deck-pos:'+location.pathname);}catch(e){}   // 예전 자동 저장 값 정리
  Deck.go=(i,k,o)=>show(i,k||0,o||{});Deck.pause=setPause;Deck.laser=LZ;   // 발표자 보기의 미리보기 창이 부름 · 확인용
  const marks=readMarks(),h=parseInt(location.hash.slice(1))||1,kk=parseInt(Q.get('k'))||0;
  QUIET++;try{show(h-1,kk,{instant:kk>0||STILL});}finally{QUIET--;}   // 처음 여는 것은 다른 창에 보내지 않음
  if(ROLE==='main'&&!STILL&&!Q.has('k')&&h===1&&marks.length)offerResume(marks);
  lkInit();
  pokeHud();
};
})();
