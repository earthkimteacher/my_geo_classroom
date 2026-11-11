# 전후 비교 그림 · 한눈에 보기 모음 그림 만들기(교사에게 확인·결정을 여쭐 때 — CLAUDE.md '전후 비교 스크린샷으로').
# ① 비교 그림: python tools/compare.py spec.json
#    spec.json = [{"title":"1번 — 몇 장: 무엇", "out":"C:/…/비교1_이름.png",
#                  "rows":[[["지금.png","지금: 설명"],["바꾼.png","바꾼 화면: 설명"]], [["참고.png","참고: 교과서 그림"]]]}, …]
#    한 줄에 두 장이면 나란히, 한 장이면 가운데. 항목에 셋째 값 [x0,y0,x1,y1](원본 px)을 주면 그 부분만 2배로 잘라 넣음.
#    이름표가 '지금'으로 시작하면 빨간 띠, '바꾼'으로 시작하면 파란 띠, 그 밖은 회색 띠.
# ② 한눈에 보기: python tools/compare.py sheet <스크린숏 폴더> <장 수> <열 수> <출력 png>
#    폴더의 s01.png, s02.png …(check.js shots --scale 0.25로 찍은 것)를 번호와 함께 격자로 모음.
# 그림은 저장소 밖에 저장한다(커밋하지 않음).
import io, json, os, sys
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))   # python -I 로 돌려도 옆의 _mu.py를 찾게
from _mu import pymupdf, FONT
kw = dict(fontfile=FONT, fontname="kr") if FONT else {}
if sys.argv[1] == "sheet":
    d, n, cols, out = sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), sys.argv[5]
    W, H, G, T = 480, 270, 14, 30
    rows = (n + cols - 1) // cols
    page = pymupdf.open().new_page(width=cols * (W + G) + G, height=rows * (H + G + T) + G)
    page.draw_rect(page.rect, color=None, fill=(0.07, 0.07, 0.08))
    for i in range(n):
        f = os.path.join(d, f"s{i+1:02d}.png"); x = G + (i % cols) * (W + G); y = G + (i // cols) * (H + G + T)
        page.insert_text((x + 2, y + 22), str(i + 1), fontsize=20, color=(1, 1, 1))
        if os.path.exists(f):
            page.insert_image(pymupdf.Rect(x, y + T, x + W, y + T + H), filename=f)
    pix = page.get_pixmap(); pix.save(out); print(out, pix.width, "x", pix.height); sys.exit()
PW, G, TH, LH = 1280, 24, 92, 60
for sp in json.load(io.open(sys.argv[1], encoding="utf-8")):
    rows = []
    for r in sp["rows"]:
        items = []
        for it in r:
            path, lab = it[0], it[1]
            pm = pymupdf.Pixmap(path)
            if len(it) > 2:
                tp = pymupdf.open().new_page(width=pm.width, height=pm.height); tp.insert_image(tp.rect, filename=path)
                pm = tp.get_pixmap(clip=pymupdf.Rect(*it[2]), matrix=pymupdf.Matrix(2, 2)); path = path[:-4] + "_crop.png"; pm.save(path)
            w = PW if len(r) > 1 else min(2 * PW + G, pm.width)
            items.append((path, lab, w, int(w * pm.height / pm.width)))
        rows.append(items)
    W = 2 * PW + 3 * G; H = TH + sum(LH + max(i[3] for i in r) + G for r in rows) + G
    page = pymupdf.open().new_page(width=W, height=H)
    page.draw_rect(page.rect, color=None, fill=(0.96, 0.96, 0.97))
    page.insert_text((G, 62), sp["title"], fontsize=40, color=(0.11, 0.11, 0.12), **kw)
    y = TH
    for r in rows:
        x = (W - sum(i[2] for i in r) - G * (len(r) - 1)) / 2
        for path, lab, w, h in r:
            col = (0, 0.4, 0.8) if lab.startswith("바꾼") else (0.77, 0.22, 0.1) if lab.startswith("지금") else (0.25, 0.25, 0.27)
            page.draw_rect(pymupdf.Rect(x, y + 8, x + w, y + LH - 6), color=None, fill=col, radius=0.25)
            page.insert_text((x + 18, y + 44), lab, fontsize=28, color=(1, 1, 1), **kw)
            page.insert_image(pymupdf.Rect(x, y + LH, x + w, y + LH + h), filename=path)
            page.draw_rect(pymupdf.Rect(x, y + LH, x + w, y + LH + h), color=(0.6, 0.6, 0.62), width=1.5)
            x += w + G
        y += LH + max(i[3] for i in r) + G
    pix = page.get_pixmap(); pix.save(sp["out"]); print(sp["out"], pix.width, "x", pix.height)
