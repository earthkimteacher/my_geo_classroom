# python engine/build_single.py 수업파일.html [출력파일.html]
#  다른 선생님께 드릴 때(2026-11-05): 공용 엔진(engine/deck.css·deck.js)을 수업 파일 안에 다시 넣고,
#  그림(img/…)도 파일 안에 넣어(data URI) HTML 하나만으로 열리는 '단일 파일'을 만든다.
#  - 글꼴(Pretendard)·수식(KaTeX)은 지금처럼 인터넷(jsDelivr)에서 불러온다(인터넷이 없으면 기본 글꼴·수식 대체 글로 보임).
#  - 출력 파일은 저장소 밖(교사가 정한 폴더)에 두고 커밋하지 않는다. 출력 이름을 안 주면 지금 폴더에 '수업이름_단일파일.html'.
import sys,os,re,base64,mimetypes
if len(sys.argv)<2:sys.exit('쓰는 법: python engine/build_single.py 수업파일.html [출력파일.html]')
src=os.path.abspath(sys.argv[1]);d=os.path.dirname(src)
out=os.path.abspath(sys.argv[2]) if len(sys.argv)>2 else os.path.join(os.getcwd(),os.path.splitext(os.path.basename(src))[0]+'_단일파일.html')
s=open(src,encoding='utf-8').read()
# 1) 공용 엔진 CSS·스크립트를 제자리에 넣기(수업 파일이 가리키는 경로에서 읽음)
mc=re.search(r'<link rel="stylesheet" href="([^"]*engine/deck\.css)">',s);mj=re.search(r'<script src="([^"]*engine/deck\.js)"></script>',s)
if not(mc and mj):sys.exit('이 파일에서 engine/deck.css·deck.js를 불러오는 줄을 찾지 못했습니다(이미 단일 파일인지 확인).')
css=open(os.path.join(d,mc.group(1)),encoding='utf-8').read();js=open(os.path.join(d,mj.group(1)),encoding='utf-8').read()
if '</style' in css.lower():sys.exit('deck.css 안에 </style 글자가 있어 합칠 수 없습니다.')
js=js.replace('</script','<\\/script')   # 스크립트 안의 '</script' 글자가 태그를 끊지 않게
s=s.replace(mc.group(0),'<style>\n/* ── 공용 엔진 CSS(engine/deck.css)를 합친 것 ── */\n'+css+'\n</style>',1)
s=s.replace(mj.group(0),'<script>\n/* ── 공용 엔진(engine/deck.js)을 합친 것 ── */\n'+js+'\n</script>',1)
# 2) '엔진을 못 찾으면 안내' 스크립트는 필요 없으므로 뺌
s=re.sub(r'\r?\n?<script>/\* 엔진 파일을 못 찾으면.*?</script>','',s,count=1,flags=re.S)
# 3) 그림(img/…)을 파일 안에 넣기
n=[0]
def emb(m):
    p=os.path.join(d,m.group(2).replace('/',os.sep))
    if not os.path.isfile(p):print('  그림 없음(그대로 둠):',m.group(2));return m.group(0)
    mime=mimetypes.guess_type(p)[0] or 'application/octet-stream';n[0]+=1
    return m.group(1)+'data:'+mime+';base64,'+base64.b64encode(open(p,'rb').read()).decode()+m.group(3)
s=re.sub(r'''((?:src|href)=["'])(img/[^"']+)(["'])''',emb,s)
s=re.sub(r'''(url\(["']?)(img/[^"')]+)(["']?\))''',emb,s)
# 4) 머리 주석 한 줄 고치기
s=s.replace(' 수업 슬라이드 — 엔진은 공용 파일 ../engine/deck.css · ../engine/deck.js(2026-11-05 떼어 냄), 이 파일에는 이 수업의 장·스타일·장면만',
            ' 수업 슬라이드 — 단일 파일(공용 엔진 engine/deck.css·deck.js와 그림을 이 파일 안에 합침, engine/build_single.py)')
left=[x for x in re.findall(r'''(?:src|href)=["']([^"'#][^"']*)["']''',s) if not re.match(r'(https?:|data:|mailto:|javascript:)',x) and 'engine/deck.' not in x]   # 엔진 설명 주석 속 경로는 빼고 셈
open(out,'w',encoding='utf-8').write(s)
print('만듦:',out)
print('  크기 %.1f MB · 넣은 그림 %d개'%(os.path.getsize(out)/1048576,n[0])+(' · 아직 바깥 파일을 가리키는 곳: '+', '.join(sorted(set(left))[:8]) if left else ' · 바깥 파일을 가리키는 곳 없음(인터넷 글꼴·수식만)'))
