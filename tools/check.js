// 수업 슬라이드 검사(헤드리스 크롬, tools/probe.js를 씀). 미리보기 서버가 켜져 있어야 한다(tools/serve.js 또는 .claude/launch.json의 slides).
// 사용법(저장소 폴더에서):
//   node tools/check.js walk  <주소>                       처음부터 끝까지 → 키, 다시 처음까지 ← 키로 넘기며 오류·id 중복·section 속성 검사
//        통과 기준: atEnd = [마지막 장 번호−1, 그 장의 단계 수], backAt = [0,0], bad·dup·errors가 비어 있음, kwLen = 장 수(n). 마지막 줄에 '통과/문제'를 알려 줌
//   node tools/check.js shots <주소> <저장 폴더> [옵션]     장마다 스크린숏 + 24px 미만 글자·무대 밖 글자 검사
//        옵션: --slides all|3,5,8(기본 all)  --k 99(단계, 99 = 마지막. 'each'면 모든 단계)  --scale 0.5  --wait 2400  --q "still=1&print=1"(주소에 덧붙일 옵션)
//              --boxes(장 바로 아래 개체의 위치를 '이름 왼쪽 위 오른쪽 아래'(무대 px)로 함께 출력 — 격자 120~1800·250~990, 간격 40을 잴 때)
//        한눈에 보기 그림용: shots <주소> <폴더> --scale 0.25 (마지막 단계만 → s01.png …) 뒤 python tools/compare.py sheet <폴더> <장 수> 6 <png>
//   node tools/check.js one   <주소(#장, ?k= 포함)> <png> [--scale 1] [--eval "식"]     한 화면만(막대 값 넣기 등은 --eval)
//   주소 예: http://localhost:8080/통합과학2/II.1.3change.html
// 출력: 장마다 한 줄(문제가 있으면 PROBLEM으로 시작). 스크린숏 이름은 <저장 폴더>/s장번호[_k단계].png — Read로 직접 열어 겹침·잘림·대비를 본다.
const path = require('path');
const { run } = require('./probe.js');
const a = process.argv.slice(2), mode = a[0], url = a[1];
const opt = (n, d) => { const i = a.indexOf('--' + n); return i < 0 ? d : a[i + 1]; };
const BOXES = a.includes('--boxes');
const line = r => { if (r.fatal) return 'FATAL ' + r.fatal; const c = r.check || {}, bad = (r.errors || []).length || (c.small || []).length || (c.out || []).length;
  return (bad ? 'PROBLEM ' : '') + (c.slide || '') + ' #' + ((c.i ?? -1) + 1) + ' k=' + c.k + '/' + c.steps + (bad ? ' small=' + JSON.stringify(c.small) + ' out=' + JSON.stringify(c.out) + ' errors=' + JSON.stringify(r.errors) : ' ok') + (r.out ? '  → ' + path.basename(r.out) : '') + (BOXES && c.boxes ? '\n    ' + c.boxes.join('\n    ') : ''); };
(async () => {
  if (mode === 'walk') { const r = await run([{ url: url + '#1', wait: 1500, walk: true }], () => {}); console.log(JSON.stringify(r[0], null, 1));
    const w = r[0].walk, ok = w && typeof w === 'object' && w.atEnd[0] === w.n - 1 && w.backAt[0] === 0 && w.backAt[1] === 0 && !w.bad.length && !w.dup.length && !(r[0].errors || []).length && (w.kwLen == null || w.kwLen === w.n);
    console.log(ok ? '통과: ' + w.n + '장을 끝까지 넘기고 처음으로 돌아옴(오류·id 중복·속성 문제 없음)' : '문제 있음: 위 결과의 errors·bad·dup·atEnd·backAt·kwLen을 볼 것'); return; }
  if (mode === 'one') { const r = await run([{ url, out: a[2], wait: +opt('wait', 2000), scale: +opt('scale', 1), eval: opt('eval', null), wait2: 2000, check: true }], () => {}); console.log(line(r[0]), r[0].eval != null ? 'eval=' + JSON.stringify(r[0].eval) : ''); return; }
  if (mode === 'shots') {
    const out = path.resolve(a[2]), q = opt('q', ''), k = opt('k', '99'), scale = +opt('scale', 0.5), wait = +opt('wait', 2400);
    const first = await run([{ url: url + '?k=0#1', wait: 1200, eval: "Deck.list.map(s=>{const t=document.createElement('div');t.innerHTML=s.__pristine;let m=0;t.querySelectorAll('[data-step]').forEach(e=>m=Math.max(m,+e.getAttribute('data-step')||0));return Math.max(m,s.__steps||0)})" }], () => {});
    const stepsGuess = Array.isArray(first[0].eval) ? first[0].eval : [];   // 선언형 단계 수(장면 코드의 steps는 그 장을 열어야 알 수 있어 each에서는 열어서 다시 확인)
    const n = stepsGuess.length; if (!n) { console.log('장 수를 읽지 못함: ' + JSON.stringify(first[0])); return; }
    const sl = opt('slides', 'all'), nums = sl === 'all' ? Array.from({ length: n }, (_, i) => i + 1) : sl.split(',').map(Number);
    let jobs = [];
    const mk = (num, kk) => ({ url: url + '?k=' + kk + (q ? '&' + q : '') + '#' + num, out: path.join(out, 's' + String(num).padStart(2, '0') + (k === '99' ? '' : '_k' + kk) + '.png').replace(/\\/g, '/'), wait, check: true, scale });
    if (k === 'each') { // 장마다 실제 단계 수를 확인한 뒤 모든 단계
      for (let i = 0; i < nums.length; i += 12) { const r = await run(nums.slice(i, i + 12).map(num => ({ url: url + '?still=1&k=99#' + num, wait: 700, check: true })), () => {});
        r.forEach((x, j) => { const st = x.check ? x.check.steps || 0 : 0; for (let kk = 0; kk <= st; kk++) jobs.push(mk(nums[i + j], kk)); }); }
    } else jobs = nums.map(num => mk(num, k));
    let bad = 0;
    for (let i = 0; i < jobs.length; i += 12) { const r = await run(jobs.slice(i, i + 12), () => {}); r.forEach(x => { const l = line(x); if (/^(PROBLEM|FATAL)/.test(l)) bad++; console.log(l); }); }
    console.log(bad ? '문제 ' + bad + '곳' : '모두 통과(' + jobs.length + '컷) — 스크린숏을 열어 눈으로도 확인할 것');
    return;
  }
  console.log('사용법은 이 파일 맨 위 주석을 볼 것');
})();
