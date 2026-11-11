# pymupdf 불러오기(없으면 설치 방법 안내). 다른 도구가 `from _mu import pymupdf, FONT`로 씀.
import os, sys, warnings
warnings.simplefilter("ignore")
try:
    import pymupdf
except ImportError:
    d = os.environ.get("PYMUPDF_DIR")
    if d:
        sys.path.insert(0, d)
        import pymupdf
    else:
        sys.exit("pymupdf가 없습니다. 임시 폴더에 설치하세요:\n  python -m pip install --target <임시폴더> pymupdf\n그다음 환경 변수 PYMUPDF_DIR=<임시폴더>를 주고 다시 실행합니다.")
# 그림에 한글을 쓸 때의 글꼴
FONT = next((p for p in [r"C:\Windows\Fonts\malgunbd.ttf", "/System/Library/Fonts/Supplemental/AppleGothic.ttf", "/System/Library/Fonts/AppleSDGothicNeo.ttc"] if os.path.exists(p)), None)
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass
