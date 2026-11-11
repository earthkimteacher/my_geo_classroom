# PDF에서 그림을 깔끔하게 잘라 내기(교사용 메모 지우기 포함).
# 사용법: python tools/pdf_crop.py <pdf> <쪽> x0 y0 x1 y1 <배율> <출력 png> [t:x0,y0,x1,y1 …] [g:x0,y0,x1,y1 …]
#   좌표는 PDF pt. 배율 4 권장(수업용 그림), 2는 미리 보기용.
#   t:사각형 = 그 안의 글자만 지움(그림·선은 그대로 — 교사용 빨간 메모, 그림 번호 줄),  g:사각형 = 글자와 선 그림을 지움(QR 옆 상자, 말풍선 테두리 등)
# 자른 뒤 그림을 Read로 열어 잘린 곳·남은 메모가 없는지 확인한다. 수업 그림은 과목폴더/img/단원번호/p쪽_이름.png 로 저장.
import sys
import os as _os, sys as _sys
_sys.path.insert(0, _os.path.dirname(_os.path.abspath(__file__)))   # python -I 로 돌려도 옆의 _mu.py를 찾게
from _mu import pymupdf
path, pg = sys.argv[1], int(sys.argv[2]) - 1
clip = pymupdf.Rect(*[float(v) for v in sys.argv[3:7]])
zoom = float(sys.argv[7]); out = sys.argv[8]
p = pymupdf.open(path)[pg]
for kind in ("t", "g"):
    rs = [a[2:] for a in sys.argv[9:] if a.startswith(kind + ":")]
    if not rs:
        continue
    for a in rs:
        p.add_redact_annot(pymupdf.Rect(*[float(v) for v in a.split(",")]), fill=False)
    p.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE,
                       graphics=pymupdf.PDF_REDACT_LINE_ART_NONE if kind == "t" else pymupdf.PDF_REDACT_LINE_ART_REMOVE_IF_TOUCHED)
pix = p.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=clip)
pix.save(out)
print(out, pix.width, "x", pix.height)
