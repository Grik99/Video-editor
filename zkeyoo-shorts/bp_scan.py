#!/usr/bin/env python3
"""Scan Bored Panda for post ideas (method borrowed from the Vexumi chat).

Usage:
  python3 -I bp_scan.py                      # homepage: list of current articles/lists (title + url)
  python3 -I bp_scan.py <boredpanda list url> [N]   # items of one list: score, text, image url, source
Bored Panda embeds its data as JSON in the HTML; items are in "submissions":[...].
Images: static.boredpanda.com/...__700.jpg. Skip items whose image is a stock photo (unsplash/pexels/getty)
or looks AI-made, and verify the story elsewhere (Bing News RSS) before using it.
"""
import html, re, subprocess, sys

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"


def get(url):
    return subprocess.run(["curl", "-sL", "--max-time", "30", "-A", UA, url], capture_output=True,
                          text=True, errors="ignore").stdout.replace('\\"', '"').replace('\\/', '/')


def clean(t):
    t = t.encode().decode("unicode_escape", errors="ignore") if "\\u" in t else t
    try:
        t = t.encode("latin-1").decode("utf-8")
    except Exception:
        pass
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t))).strip()


def home():
    s = get("https://www.boredpanda.com/")
    seen = {}
    for m in re.finditer(r'"title":"([^"]{20,200})","(?:google_title|slug)"[^}]*?"url":"(https://www\.boredpanda\.com/[^"]+)"', s):
        seen.setdefault(m.group(2), clean(m.group(1)))
    if not seen:  # fallback: titles only
        for m in re.finditer(r'"title":"([^"]{25,200})"', s):
            seen.setdefault(clean(m.group(1)), "")
    for u, t in seen.items():
        print(f"- {t}  {u}" if t else f"- {u}")
    links = sorted(set(re.findall(r'https://www\.boredpanda\.com/([a-z0-9-]{15,})/', s)))
    print("\nlinks:", " ".join(f"https://www.boredpanda.com/{l}/" for l in links))


def items(url, n=40):
    s = get(url)
    i = s.find('"submissions":[')
    if i < 0:
        sys.exit("no submissions found")
    s = s[i:]
    starts = [m.start() for m in re.finditer(r'\{"id":\d+,"title":"', s)]
    out = []
    for a, b in zip(starts, starts[1:] + [len(s)]):
        seg = s[a:b]
        title = re.search(r'"title":"([^"]*)"', seg).group(1)
        texts = [clean(t) for t in re.findall(r'"type":"paragraph","text":"(.*?)"\}', seg)]
        imgs = re.findall(r'"attachmentUrl":"([^"]+)"', seg)
        score = re.search(r'"score":(-?\d+)', seg)
        src = re.findall(r'"(?:source|sourceUrl|source_url)":"(http[^"]+)"', seg)
        out.append((int(score.group(1)) if score else 0, clean(title), " / ".join(texts)[:300], imgs[:2], src[:1]))
    for k, (sc, t, tx, im, sr) in enumerate(sorted(out, key=lambda x: -x[0])[:n], 1):
        stock = any(w in (im[0] if im else "") for w in ("unsplash", "pexels", "getty", "shutterstock"))
        print(f"{k}. [{sc}] {t}{'  (STOCK IMAGE)' if stock else ''}\n   {tx}\n   img: {' | '.join(im)}\n   src: {' '.join(sr)}")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        items(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 40)
    else:
        home()
