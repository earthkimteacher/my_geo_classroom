// 헤드리스 크롬 검사 도구(수업 슬라이드용) — 한 번에 하나만 뜨도록 잠금(lock)을 쓰고, 끝나면 프로세스째 닫는다.
// 보통은 check.js를 쓴다(이 파일을 불러 씀). 직접 쓸 때: node tools/probe.js jobs.json
//   jobs.json = [{"url":"http://localhost:8080/과목폴더/수업.html?still=1&k=99#3","out":"C:/.../a.png","wait":1200,"eval":"식","check":true,"walk":false,"scale":0.5}, ...]  (한 번에 16개까지)
//   url   : 주소(#N = N번째 장, &k=단계, ?still=1 = 정지 화면). 같은 문서라도 새로 불러오도록 r= 값을 자동으로 붙인다.
//   out   : 스크린숏 png 경로(없으면 찍지 않음). scale 0.5 = 960×540(눈으로 볼 때 권장), 1 = 1920×1080.
//   wait  : 불러온 뒤 기다릴 시간(ms, 기본 1200) · eval: 페이지 안에서 실행할 식(결과를 출력, 그 뒤 wait2 ms 기다림 — 막대 값 넣기 등)
//   check : true면 지금 장의 '24px 미만 글자'(small)·'무대 밖 글자'(out)·장 바로 아래 개체의 위치(boxes, 무대 px)를 출력
//   walk  : true면 → 키로 끝까지, ← 키로 처음까지 넘기며 콘솔 오류를 모으고 section 속성·글자 노드·id 중복을 검사
// 크롬 위치가 다르면 환경 변수 CHROME에 실행 파일 경로를 준다. 남은 메모리가 0.5GB 아래면 띄우지 않는다.
const { spawn, execSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const WIN = process.platform === 'win32';
const CHROME = process.env.CHROME || (WIN ? 'C:/Program Files/Google/Chrome/Application/chrome.exe' : process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : 'google-chrome');
const LOCK = path.join(os.tmpdir(), 'geo-chrome.lock');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHECK = `(()=>{const st=document.getElementById('stage'),sr=st.getBoundingClientRect(),sc=sr.width/1920,sec=Deck.list[Deck.i];
const small=[],out=[];
sec.querySelectorAll('*').forEach(e=>{let has=false;for(const n of e.childNodes){if(n.nodeType===3&&n.textContent.trim()){has=true;break;}}if(!has)return;
 if(e.closest('style,script,defs,title'))return;const cs=getComputedStyle(e);if(cs.visibility==='hidden'||cs.display==='none')return;
 let op=1;for(let n=e;n&&n!==sec;n=n.parentElement){const s=getComputedStyle(n);if(s.display==='none'||s.visibility==='hidden'){op=0;break;}op*=parseFloat(s.opacity);}if(op<.05)return;
 const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return;
 let fs=parseFloat(cs.fontSize);if(e instanceof SVGElement){const m=e.getScreenCTM();if(m)fs=fs*Math.hypot(m.a,m.b)/sc;}
 const t=e.textContent.trim().replace(/\\s+/g,' ').slice(0,24);
 if(fs<23.5)small.push([t,+fs.toFixed(1)]);
 const x0=(r.left-sr.left)/sc,y0=(r.top-sr.top)/sc,x1=(r.right-sr.left)/sc,y1=(r.bottom-sr.top)/sc;
 if(x0<-2||y0<-2||x1>1922||y1>1082)out.push([t,Math.round(x0),Math.round(y0),Math.round(x1),Math.round(y1)]);});
const boxes=[...sec.children].filter(e=>!e.matches('style,.full-svg,.scene')).map(e=>{const r=e.getBoundingClientRect();return [(e.id||e.className||e.tagName).toString().slice(0,28),...[r.left-sr.left,r.top-sr.top,r.right-sr.left,r.bottom-sr.top].map(v=>Math.round(v/sc))].join(' ');});
return {slide:sec.id,i:Deck.i,k:Deck.k,steps:sec.__steps,n:Deck.list.length,small,out,boxes};})()`;
const WALK = `(async()=>{const sl=ms=>new Promise(r=>setTimeout(r,ms));const key=k=>document.dispatchEvent(new KeyboardEvent('keydown',{key:k,code:k,bubbles:true}));
const n=Deck.list.length,last=()=>Deck.i===n-1&&Deck.k===(Deck.list[n-1].__steps||0);let f=0,b=0;
while(!last()&&f<2500){key('ArrowRight');await sl(60);f++;}
const atEnd=[Deck.i,Deck.k];
while(!(Deck.i===0&&Deck.k===0)&&b<2500){key('ArrowLeft');await sl(40);b++;}
const bad=[];Deck.list.forEach(s=>{const at=[...s.attributes].map(a=>a.name).filter(a=>!['class','id','data-tile','data-title','data-notes','style'].includes(a));if(at.length)bad.push(s.id+' 속성:'+at.join(','));
 if([...s.childNodes].some(c=>c.nodeType===3&&c.textContent.trim()))bad.push(s.id+' 글자 노드(노트의 큰따옴표?)');if(!s.dataset.title)bad.push(s.id+' 제목 없음');});
const ids={},dup=[];document.querySelectorAll('[id]').forEach(e=>{if(ids[e.id])dup.push(e.id);ids[e.id]=1;});
return {n,forwardKeys:f,backKeys:b,atEnd,backAt:[Deck.i,Deck.k],bad,dup:[...new Set(dup)].slice(0,30),kwLen:window.KW?window.KW.at.length:null,steps:Deck.list.map(s=>s.id+':'+(s.__steps||0)).join(' ')};})()`;

async function lock() {
  const t0 = Date.now();
  for (;;) {
    try { fs.mkdirSync(LOCK); return; } catch (e) {
      try { if (Date.now() - fs.statSync(LOCK).mtimeMs > 300000) { fs.rmSync(LOCK, { recursive: true, force: true }); continue; } } catch (_) {}
      if (Date.now() - t0 > 900000) throw new Error('다른 검사가 끝나지 않아 기다리다 멈춤(lock timeout)');
      await sleep(600 + Math.random() * 800);
    }
  }
}
async function run(jobs, log = r => console.log(JSON.stringify(r))) {
  jobs = jobs.slice(0, 16); const results = [];
  await lock();
  let proc = null, prof = null;
  function cleanup() {
    try { if (proc && proc.pid) { if (WIN) execSync('taskkill /PID ' + proc.pid + ' /T /F', { stdio: 'ignore' }); else proc.kill('SIGKILL'); } } catch (e) {}
    try { if (prof) fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {}
    try { fs.rmSync(LOCK, { recursive: true, force: true }); } catch (e) {}
  }
  const killer = setTimeout(() => { log({ fatal: '5분을 넘겨 강제로 닫음' }); cleanup(); process.exit(2); }, 300000);
  try {
    for (let n = 0; os.freemem() < 800 * 1048576 && n < 40; n++) await sleep(3000);   // 남은 메모리가 0.8GB 아래면 기다림(최대 2분)
    if (os.freemem() < 500 * 1048576) throw new Error('남은 메모리가 0.5GB 아래라 크롬을 띄우지 않음: ' + Math.round(os.freemem() / 1048576) + 'MB');
    const port = 9300 + (process.pid % 600);
    prof = fs.mkdtempSync(path.join(os.tmpdir(), 'cdp-geo-'));
    proc = spawn(CHROME, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + prof, '--window-size=1920,1080', '--hide-scrollbars',
      '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--mute-audio', '--force-device-scale-factor=1', '--disable-background-timer-throttling', 'about:blank'], { stdio: 'ignore' });
    let target = null;
    for (let n = 0; n < 60 && !target; n++) { await sleep(250); try { const l = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json(); target = l.find(t => t.type === 'page'); } catch (e) {} }
    if (!target) throw new Error('크롬이 뜨지 않음(경로: ' + CHROME + ')');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error('ws')); });
    let id = 0; const pend = {}, evs = []; let errors = [];
    ws.onmessage = m => { const d = JSON.parse(m.data);
      if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; }
      else if (d.method === 'Runtime.exceptionThrown') errors.push((d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description || d.params.exceptionDetails.text || '').slice(0, 300));
      else if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errors.push(d.params.args.map(a => a.value || a.description || '').join(' ').slice(0, 300));
      else if (d.method) evs.push(d.method); };
    const send = (method, params = {}) => new Promise(res => { const i = ++id; pend[i] = res; ws.send(JSON.stringify({ id: i, method, params })); });
    const ev = async (expression, aw) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: !!aw });
      return r.result && r.result.result ? (r.result.exceptionDetails ? 'EXC ' + (r.result.exceptionDetails.exception && r.result.exceptionDetails.exception.description || r.result.exceptionDetails.text) : r.result.result.value) : null; };
    await send('Page.enable'); await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
    for (let i = 0; i < jobs.length; i++) {
      const j = jobs[i]; errors = []; evs.length = 0;
      let url = j.url; const h = url.indexOf('#'), base = h < 0 ? url : url.slice(0, h), hash = h < 0 ? '' : url.slice(h);
      url = base + (base.includes('?') ? '&' : '?') + 'r=' + Date.now() + i + hash;
      await send('Page.navigate', { url });
      for (let n = 0; n < 80 && !evs.includes('Page.loadEventFired'); n++) await sleep(150);
      await sleep(j.wait == null ? 1200 : j.wait);
      const res = { i, url: j.url, out: j.out || null };
      if (j.eval) { res.eval = await ev(j.eval, true); await sleep(j.wait2 == null ? 300 : j.wait2); }
      if (j.walk) res.walk = await ev(WALK, true);
      if (j.check) res.check = await ev(CHECK, false);
      if (j.out) { const r = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1920, height: 1080, scale: j.scale || 1 } });
        fs.mkdirSync(path.dirname(j.out), { recursive: true }); fs.writeFileSync(j.out, Buffer.from(r.result.data, 'base64')); }
      res.errors = errors.slice(); results.push(res); log(res);
    }
    try { await Promise.race([send('Browser.close'), sleep(1500)]); } catch (e) {}
  } catch (e) { const r = { fatal: String(e && e.message || e) }; results.push(r); log(r); process.exitCode = 1; }
  finally { clearTimeout(killer); await sleep(300); cleanup(); }
  return results;
}
module.exports = { run };
if (require.main === module) run(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')));
