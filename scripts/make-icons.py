"""tomato.png로 PWA 아이콘을 만든다. 실행: python3 scripts/make-icons.py <tomato.png 경로>"""
import sys
from pathlib import Path

from PIL import Image

src = Image.open(sys.argv[1]).convert("RGBA")
out = Path(__file__).resolve().parent.parent / "public"
out.mkdir(exist_ok=True)

def plain(size: int, name: str) -> None:
    src.resize((size, size), Image.LANCZOS).save(out / name)

def maskable(size: int, name: str) -> None:
    # 안전 영역(가운데 80%) 안에 들어오도록 70%로 줄여 흰 바탕 가운데에 둔다.
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    inner = int(size * 0.7)
    icon = src.resize((inner, inner), Image.LANCZOS)
    offset = (size - inner) // 2
    canvas.paste(icon, (offset, offset), icon)
    canvas.convert("RGB").save(out / name)

plain(192, "icon-192.png")
plain(512, "icon-512.png")
maskable(512, "icon-maskable-512.png")
maskable(180, "apple-touch-icon.png")
plain(32, "favicon-32.png")
print("done", sorted(p.name for p in out.glob("*.png")))
