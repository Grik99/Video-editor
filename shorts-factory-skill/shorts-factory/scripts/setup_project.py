#!/usr/bin/env python3
"""Create a Shorts project for a new channel.

python3 setup_project.py --project ./mychannel-shorts --name "Brand" --handle "@brand" --logo logo.png \
    --backgrounds ./backgrounds_folder_or_zip [--desc-line "..."]

Creates: config.json, state.json, brand/logo.png (round), backgrounds/ (+ zones.json, auto-detected),
posts/, thumbs/, work/, out/, tools/ (copy of the scripts) and history.json (past videos, empty).
"""
import argparse, glob, json, os, shutil, subprocess, sys, zipfile
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SKILL = os.path.dirname(HERE)


def round_logo(src, dst, size=512):
    im = Image.open(src).convert("RGB")
    s = min(im.size)
    im = im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width - s) // 2 + s, (im.height - s) // 2 + s))
    im = im.resize((size, size), Image.LANCZOS)
    m = Image.new("L", (size * 4, size * 4), 0)
    ImageDraw.Draw(m).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
    out = im.convert("RGBA"); out.putalpha(m.resize((size, size), Image.LANCZOS)); out.save(dst)


def main():
    a = argparse.ArgumentParser()
    a.add_argument("--project", required=True); a.add_argument("--name", required=True)
    a.add_argument("--handle", required=True, help="line under the name in the fake tweet (@handle or tagline)")
    a.add_argument("--logo", required=True); a.add_argument("--backgrounds", required=True)
    a.add_argument("--desc-line", default="All stories are independently researched, fact-checked, and transformed "
                   "through original scripting, editing, and commentary for educational and entertainment purposes.")
    o = a.parse_args()
    p = os.path.abspath(o.project)
    for d in ["brand", "backgrounds", "posts", "thumbs", "work/img", "out", "tools"]:
        os.makedirs(os.path.join(p, d), exist_ok=True)
    round_logo(o.logo, os.path.join(p, "brand", "logo.png"))
    src = o.backgrounds
    if src.lower().endswith(".zip"):
        tmp = os.path.join(p, "work", "bg_unzip"); zipfile.ZipFile(src).extractall(tmp); src = tmp
    vids = sorted(glob.glob(os.path.join(src, "**", "*.mp4"), recursive=True), key=lambda f: os.path.basename(f).lower())
    if not vids:
        sys.exit("no .mp4 backgrounds found")
    for f in vids:
        shutil.copy(f, os.path.join(p, "backgrounds", os.path.basename(f)))
    for f in glob.glob(os.path.join(HERE, "*")):
        if f.endswith((".py", ".cjs")):
            shutil.copy(f, os.path.join(p, "tools"))
    shutil.copy(os.path.join(SKILL, "assets", "rubrics.json"), os.path.join(p, "rubrics.json"))
    cfg = {"brand": {"name": o.name, "handle": o.handle, "logo": "brand/logo.png"},
           "description_fixed_line": o.desc_line, "publish_slots": [], "sounds": [], "competitors": [],
           "video_language": "en-US"}
    if not os.path.exists(os.path.join(p, "config.json")):
        json.dump(cfg, open(os.path.join(p, "config.json"), "w"), indent=2, ensure_ascii=False)
    if not os.path.exists(os.path.join(p, "state.json")):
        json.dump({"next_index": 0}, open(os.path.join(p, "state.json"), "w"), indent=2)
    if not os.path.exists(os.path.join(p, "history.json")):
        json.dump([], open(os.path.join(p, "history.json"), "w"))
    open(os.path.join(p, ".gitignore"), "w").write("work/\nout/\n__pycache__/\n")
    subprocess.run([sys.executable, os.path.join(p, "tools", "detect_zones.py"), p], check=True)
    print("project ready:", p, "| backgrounds:", len(vids), "| review work/zones_check.jpg")


if __name__ == "__main__":
    main()
