#!/usr/bin/env python3
"""
Render Welmnt ad creatives to PNG at Meta's sizes.

    python3 creatives/build.py

Why Chrome and not an image model: Arabic is cursive and context-shaped — letters
change form depending on their neighbours. Image models routinely produce Arabic
that looks like Arabic to a non-reader and is nonsense to a reader. Chrome uses a
real shaping engine and the real brand font, so the text is correct by construction.
It is also reproducible: edit copy.json, re-run, done — no regeneration lottery.

Output: creatives/out/{concept}-{size}.png
"""
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).parent
ASSETS = (HERE / ".." / "public" / "assets").resolve()
OUT = HERE / "out"
FONTS = ""
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

ACCENTS = {"ember": "#E3631B", "plum": "#8265A7", "amber": "#E8A100"}
# Order matches the @font-face blocks Google Fonts returns for 400;600;700.
FONT_WEIGHTS = [400, 600, 700]


def font_css() -> str:
    """Inline the font as data URIs so the screenshot can never race the network."""
    import base64
    out = []
    files = sorted((HERE / "fonts").glob("readex-*.ttf"))
    if not files:
        sys.exit("creatives/fonts is empty — see the README in this folder.")
    for f, wt in zip(files, FONT_WEIGHTS):
        b64 = base64.b64encode(f.read_bytes()).decode()
        out.append(
            "@font-face{font-family:'Readex Pro';font-style:normal;font-weight:%d;"
            "src:url(data:font/ttf;base64,%s) format('truetype');}" % (wt, b64)
        )
    return "<style>" + "".join(out) + "</style>"


def scale(w: int, h: int) -> dict:
    """Type and spacing scale off the short edge, so a story isn't a stretched square."""
    s = w / 1080
    tall = h / w >= 1.5          # 9:16 gets more breathing room top and bottom
    return {
        "__SZ_PAD__": round(72 * s),
        "__SZ_SUN__": round(84 * s),
        "__SZ_EYE__": round(30 * s),
        "__SZ_H1__": round((92 if not tall else 100) * s),
        "__SZ_SUB__": round(38 * s),
        "__SZ_SUBW__": round(820 * s),
        "__SZ_FOOT__": round(32 * s),
        "__SZ_GAP__": round(26 * s),
        "__SZ_GAP2__": round(18 * s),
        "__SZ_RULE__": max(1, round(2 * s)),
        "__SZ_CTAX__": round(38 * s),
        "__SZ_CTAY__": round(18 * s),
        "__SZ_DOT__": round(12 * s),
        "__SZ_DOTG__": round(7 * s),
        "__SZ_ART__": round(420 * s),
        "__SZ_HEADTOP__": round((150 if not tall else 280) * s),
    }


def check_art(concept: dict) -> None:
    """
    Reject an asset too small to be artwork.

    Classroom.svg is a 50x50 ICON. Dropped into the art slot it rendered as a
    thumbnail in the middle of a 1080px ad and the build reported success — the
    kind of failure nobody catches until it is live and spending.
    """
    f = ASSETS / concept["art"]
    if not f.exists():
        sys.exit(f"{concept['id']}: missing asset {concept['art']}")
    if f.suffix == ".svg":
        head = f.read_text(errors="ignore")[:400]
        m = re.search(r'viewBox="[\d.]+ [\d.]+ ([\d.]+) ([\d.]+)"', head)
        if m and min(float(m.group(1)), float(m.group(2))) < 200:
            sys.exit(f"{concept['id']}: {concept['art']} is {m.group(1)}x{m.group(2)} "
                     f"— that is an icon, not artwork.")


def render(concept: dict, size: dict, tpl: str) -> Path:
    w, h = size["w"], size["h"]
    html = tpl.replace("__FONTS__", FONTS)
    for k, v in scale(w, h).items():
        html = html.replace(k, str(v))
    html = (html
            .replace("__W__", str(w)).replace("__H__", str(h))
            .replace("__ACCENT__", ACCENTS[concept["accent"]])
            .replace("__ASSETS__", ASSETS.as_uri())
            .replace("__ART__", concept["art"])
            .replace("__ROUND__", "round" if concept.get("art_round") else "")
            .replace("__DOTS__", "<i></i>" * 5)
            .replace("__EYEBROW__", concept["eyebrow"])
            .replace("__HEADLINE__", concept["headline"])
            .replace("__SUB__", concept["sub"])
            .replace("__FOOT__", concept["foot"]))

    tmp = OUT / f"_{concept['id']}-{size['id']}.html"
    tmp.write_text(html, encoding="utf-8")
    png = OUT / f"{concept['id']}-{size['id']}.png"

    subprocess.run([
        CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        f"--window-size={w},{h}", "--force-device-scale-factor=1",
        f"--screenshot={png.resolve()}", tmp.resolve().as_uri(),
    ], check=True, capture_output=True)
    tmp.unlink()
    return png


def main() -> int:
    if not Path(CHROME).exists():
        sys.exit("Google Chrome not found — it does the rendering.")
    global FONTS
    FONTS = font_css()
    cfg = json.loads((HERE / "copy.json").read_text(encoding="utf-8"))
    tpl = (HERE / "template.html").read_text(encoding="utf-8")
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)

    made = []
    for c in cfg["concepts"]:
        check_art(c)
        for s in cfg["sizes"]:
            p = render(c, s, tpl)
            made.append(p)
            print(f"  {p.name:34} {p.stat().st_size // 1024:>5} KB")
    print(f"\n{len(made)} creatives → {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
