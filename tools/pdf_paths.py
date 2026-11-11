# PDF 속 그래프를 '그림에서 어림'하지 않고 벡터 선에서 직접 읽기: 영역 안의 선(곡선의 점)과 글자(축 눈금) 위치를 뽑는다.
# 사용법: python tools/pdf_paths.py <pdf> <쪽(1부터)> x0 y0 x1 y1 [최소 점 수=8] [json 출력 경로] [all]
#   좌표는 PDF pt(쪽 그림을 배율 z로 뽑았으면 그림 px ÷ z). 마지막에 all을 주면 점이 적은 선(눈금 선·축·표시 점)도 한 줄씩 출력.
# 값으로 바꾸는 법: 축 눈금 '선'의 위치(짧은 가로·세로 선)로 맞춘다 — 눈금 '글자'는 축 끝에서 밀려 있어 부정확.
#   예) 눈금 선 y=275.2가 0, 21.2pt마다 0.2 → 값 = (275.2 − y) / 106.  곡선의 점은 x로 정렬해 쓴다(오른쪽에서 왼쪽으로 그려진 선도 있음).
# 2026-11-11 통합과학2 II.1.3 새 판의 G83·G167·32장 곡선을 이렇게 만들었음.
import io, json, sys
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))   # python -I 로 돌려도 옆의 _mu.py를 찾게
from _mu import pymupdf
path, pg = sys.argv[1], int(sys.argv[2]) - 1
clip = pymupdf.Rect(*[float(v) for v in sys.argv[3:7]])
minpts = int(sys.argv[7]) if len(sys.argv) > 7 else 8
out = sys.argv[8] if len(sys.argv) > 8 and sys.argv[8] != "all" else None
show_all = "all" in sys.argv[8:]
p = pymupdf.open(path)[pg]
res = []
for d in p.get_drawings():
    r = d["rect"]
    if not clip.intersects(r):
        continue
    pts = []
    for it in d["items"]:
        if it[0] == "l":
            if not pts:
                pts.append((it[1].x, it[1].y))
            pts.append((it[2].x, it[2].y))
        elif it[0] == "c":   # 베지어: 조절점 넷(곡선을 그대로 옮기려면 넷 다 필요)
            if not pts:
                pts.append((it[1].x, it[1].y))
            pts.append((it[4].x, it[4].y))
    col, fill = d.get("color"), d.get("fill")
    info = dict(n=len(pts), color=[round(c, 2) for c in col] if col else None, fill=[round(c, 2) for c in fill] if fill else None,
                w=d.get("width"), rect=[round(v, 1) for v in (r.x0, r.y0, r.x1, r.y1)], kinds="".join(sorted(set(i[0] for i in d["items"]))))
    if len(pts) >= minpts:
        info["pts"] = [[round(a, 2), round(b, 2)] for a, b in pts]
        info["bezier"] = [[[round(q.x, 2), round(q.y, 2)] for q in it[1:5]] for it in d["items"] if it[0] == "c"]
        print(json.dumps({k: v for k, v in info.items() if k not in ("pts", "bezier")}), "점:", len(info["pts"]))
        res.append(info)
    elif show_all:
        print(json.dumps(info))
for b in p.get_text("dict", clip=clip)["blocks"]:
    for l in b.get("lines", []):
        for s in l["spans"]:
            t = s["text"].strip()
            if t:
                print("TXT", json.dumps(t, ensure_ascii=False), [round(v, 1) for v in s["bbox"]], round(s["size"], 1))
if out:
    json.dump(res, io.open(out, "w", encoding="utf-8"))
    print("저장:", out)
