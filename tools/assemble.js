// 조각을 수업 파일 하나로 합치기 — 여러 작업자가 장을 나눠 만들 때(CLAUDE.md '멀티에이전트로 나눠 만들 때') 쓴다.
// 사용법(저장소 폴더에서): node tools/assemble.js <조각 폴더> <출력 html> [--only s03,s04]
//   <조각 폴더>(세션 임시 폴더에 둠)의 구성:
//     head.html      <!DOCTYPE>부터 <div id="viewport"><div id="stage"> 까지(수업 전용 <style> 포함)
//     order.txt      줄마다 '장id 키워드번호(0부터, 숨김은 -1)'. '#kw 이름1|이름2|…' 줄 = 오른쪽 위 키워드 이름, '#name 수업 이름' 줄 = 스크립트 머리 주석
//     frag/sNN.html  장 하나(<section class="slide" …> … </section>, 그 장 전용 <style> 포함)
//     js/00-….js, js/01-….js   공용(자료·도구) — 이름순으로 먼저 들어감 /  js/sNN.js  그 장의 장면 코드 — order.txt 순서로
//   --only: 그 장들만 합침(작업자 시험용 — 출력 이름을 _w_A.html처럼 하고 끝나면 지움)
//   합친 스크립트는 <조각 폴더>/_check.js로도 저장 → node --check 로 문법 검사.
// 합친 뒤에는 출력 html 하나만 고친다(조각은 세션 임시 폴더라 다른 PC·다음 대화로 넘어가지 않음).
const fs = require('fs'), path = require('path');
const a = process.argv.slice(2), B = path.resolve(a[0]), OUT = path.resolve(a[1]);
const oi = a.indexOf('--only'), only = oi < 0 ? null : a[oi + 1].split(',');
const rd = f => fs.readFileSync(f, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
let kw = [], name = '수업';
let order = rd(path.join(B, 'order.txt')).split('\n').map(l => l.trim()).filter(l => {
  if (l.startsWith('#kw ')) kw = l.slice(4).split('|').map(s => s.trim()); else if (l.startsWith('#name ')) name = l.slice(6).trim();
  return l && !l.startsWith('#'); }).map(l => { const p = l.split(/\s+/); return { id: p[0], kw: +p[1] }; });
if (only) order = order.filter(o => only.includes(o.id));
const have = order.filter(o => fs.existsSync(path.join(B, 'frag', o.id + '.html'))), miss = order.filter(o => !have.includes(o)).map(o => o.id);
// '엔진을 못 찾으면 안내' 한 줄은 기존 수업에서 가져옴
const ref = path.resolve(__dirname, '..', '지구시스템과학', 'II.04surge.html');
const fb = fs.existsSync(ref) ? (rd(ref).split('\n').find(l => l.includes('window.Deck') && l.startsWith('<script>')) || '') : '';
const ids = new Set(order.map(o => o.id));
const shared = fs.readdirSync(path.join(B, 'js')).filter(f => f.endsWith('.js') && !/^s\d/.test(f) && !ids.has(f.slice(0, -3))).sort();
let html = rd(path.join(B, 'head.html'));
have.forEach(o => { html += '\n<!-- ═══ ' + o.id + ' ═══ -->\n' + rd(path.join(B, 'frag', o.id + '.html')).trim() + '\n'; });
html += '\n<div id="kwbar-host"></div>\n</div></div>\n\n<!-- 하단 컨트롤 -->\n<div id="progress"><i></i></div>\n<div id="stepdots"></div>\n<script src="../engine/deck.js"></script>\n' + fb + '\n<script>\n';
let js = '/* ═══ 장면: ' + name + ' ═══ */\nconst {U}=Deck;\nwindow.KW={items:' + JSON.stringify(kw).replace(/"/g, "'") + ',\n  at:[' + have.map(o => o.kw).join(',') + ']};\n';
shared.forEach(f => { js += rd(path.join(B, 'js', f)).trim() + '\n\n'; });
have.forEach(o => { const f = path.join(B, 'js', o.id + '.js'); if (fs.existsSync(f)) js += '\n/* ─── ' + o.id + ' ─── */\n' + rd(f).trim() + '\n'; });
js += '\nDeck.start();\n';
fs.writeFileSync(OUT, html + js + '</script>\n</body>\n</html>\n', 'utf8');
fs.writeFileSync(path.join(B, '_check.js'), js, 'utf8');
console.log('합침:', path.basename(OUT), Math.round((html.length + js.length) / 1024) + 'KB', '장:', have.map(o => o.id).join(' '), miss.length ? '| 아직 없는 장: ' + miss.join(' ') : '');
