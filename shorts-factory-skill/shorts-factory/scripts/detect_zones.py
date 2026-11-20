#!/usr/bin/env python3
"""Find, for every background video, the free vertical band where the post card can sit.

Usage: python3 detect_zones.py <project_dir>
Writes <project>/backgrounds/zones.json ({file_stem: [top, bottom]} in 720x1280 coordinates)
and <project>/work/zones_check.jpg (contact sheet with the band drawn) to review by eye.
Heuristic: characters/props have dark outlines or move; flat/pattern backgrounds do not.
"""
import glob, json, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw

SAFE_TOP, SAFE_BOTTOM = 110, 930   # keep clear of the Shorts UI (720x1280 coords)
MIN_BAND = 520                      # below this, accept covering decorations and use the safe band


def frames(path, w=180, h=320):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps=2,scale={w}:{h}", "-f", "rawvideo",
                          "-pix_fmt", "rgb24", "-"], capture_output=True).stdout
    n = len(raw) // (w * h * 3)
    return np.frombuffer(raw[: n * w * h * 3], np.uint8).reshape(n, h, w, 3).astype(np.int16)


def busy_rows(fr):
    med = np.median(fr, axis=0)
    motion = (np.abs(fr - med).max(axis=3) > 45).mean(axis=0)            # how often a pixel changes
    lum = fr.mean(axis=3)
    dark = (lum < 45).mean(axis=0)                                        # dark outlines / shapes
    gy = np.abs(np.diff(lum, axis=1, prepend=lum[:, :1])).mean(axis=0)
    gx = np.abs(np.diff(lum, axis=2, prepend=lum[:, :, :1])).mean(axis=0)
    edges = ((gx + gy) > 60)
    score = (motion > 0.15) | (dark > 0.5) | edges
    row = score.mean(axis=1)                                              # fraction of busy pixels per row
    busy = row > 0.03
    k = 4                                                                 # dilate a little
    return np.convolve(busy.astype(int), np.ones(2 * k + 1, int), "same") > 0


def zone_for(path):
    fr = frames(path)
    busy = busy_rows(fr)
    h = busy.shape[0]
    to1280 = 1280 / h
    # solid blobs = runs of busy rows at least ~50 px tall (ignores sparse stars, rain, small sparkles)
    runs, y = [], 0
    while y < h:
        if busy[y]:
            s0 = y
            while y < h and busy[y]:
                y += 1
            if y - s0 >= 12:
                runs.append((s0, y))
        y += 1
    top_lim = max([e for s0, e in runs if s0 < 0.40 * h], default=0)
    bot_lim = min([s0 for s0, e in runs if e > 0.60 * h], default=h)
    top = max(SAFE_TOP, round(top_lim * to1280) + 8)
    bot = min(SAFE_BOTTOM, round(bot_lim * to1280) - 8)
    if bot - top < MIN_BAND:                     # art everywhere: the card simply covers the middle
        top, bot = SAFE_TOP, SAFE_BOTTOM
    return [top, bot], fr[len(fr) // 2].astype(np.uint8)


def main():
    proj = sys.argv[1]
    files = sorted(glob.glob(os.path.join(proj, "backgrounds", "*.mp4")))
    zones, tiles = {}, []
    for f in files:
        z, mid = zone_for(f)
        stem = os.path.splitext(os.path.basename(f))[0]
        zones[stem] = z
        im = Image.fromarray(mid).resize((180, 320))
        d = ImageDraw.Draw(im)
        d.rectangle([2, z[0] / 4, 177, z[1] / 4], outline=(255, 0, 0), width=3)
        d.rectangle([0, 0, 179, 14], fill=(0, 0, 0)); d.text((2, 1), stem[:28], fill=(255, 255, 0))
        tiles.append(im)
        print(stem, z)
    json.dump(zones, open(os.path.join(proj, "backgrounds", "zones.json"), "w"), indent=1)
    cols = 8
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * 184, max(1, rows) * 324), "white")
    for i, t in enumerate(tiles):
        sheet.paste(t, ((i % cols) * 184, (i // cols) * 324))
    os.makedirs(os.path.join(proj, "work"), exist_ok=True)
    sheet.save(os.path.join(proj, "work", "zones_check.jpg"), quality=85)


if __name__ == "__main__":
    main()
