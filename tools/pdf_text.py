# PDF(교과서·지도서·참고서·PPT)를 읽기: 쪽마다 글을 한 파일로, 쪽 그림을 png로 뽑는다.
# 사용법: python tools/pdf_text.py <pdf> <이름> <출력 폴더> [배율=1.7]
#   → <출력 폴더>/<이름>.txt(쪽마다 '######## 이름 pN ########' 아래 글), <이름>_pN.png(쪽 그림 — Read로 열어 그림·배치를 봄)
# 출력 폴더는 세션 임시 폴더로(저장소에 넣지 않음). 글이 깨져 나오는 쪽(글꼴 문제)은 쪽 그림으로 읽는다.
import io, os, sys
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))   # python -I 로 돌려도 옆의 _mu.py를 찾게
from _mu import pymupdf
path, name, out = sys.argv[1], sys.argv[2], sys.argv[3]
zoom = float(sys.argv[4]) if len(sys.argv) > 4 else 1.7
os.makedirs(out, exist_ok=True)
d = pymupdf.open(path)
with io.open(os.path.join(out, name + ".txt"), "w", encoding="utf-8") as f:
    for i, p in enumerate(d):
        f.write(f"\n\n######## {name} p{i+1} ########\n")
        blocks = [b for b in p.get_text("blocks") if b[6] == 0]
        blocks.sort(key=lambda b: (round(b[1] / 12), b[0]))
        for b in blocks:
            t = " ".join(b[4].split())
            if t:
                f.write(t + "\n")
        p.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom)).save(os.path.join(out, f"{name}_p{i+1}.png"))
print(name, len(d), "쪽 →", out)
