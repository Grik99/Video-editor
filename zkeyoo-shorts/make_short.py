#!/usr/bin/env python3
"""Build one 6 s Zkeyoo Short (1080x1920, 30 fps, no audio) from a post spec.

Usage: python3 make_short.py posts/<slug>.json [--bg N]

The spec gets a background from the rotation (state.json -> next_bg) the first
time it is rendered; the number is written back into the spec so re-renders
keep the same background and do not advance the rotation.
"""
import json, subprocess, sys, glob, os, re

ROOT = os.path.dirname(os.path.abspath(__file__))
W, H, FPS, DUR = 1080, 1920, 30, 6.0
SAFE_TOP, SAFE_BOTTOM = 110, 930  # in 720x1280 coordinates
BRAND = {"name": "Zkeyoo", "handle": "@zkeyooreal", "logo": os.path.join(ROOT, "brand/logo.png")}


def bg_files():
    return sorted(glob.glob(os.path.join(ROOT, "backgrounds/zkeyoo_*.mp4")))


def bg_by_number(n):
    for f in bg_files():
        if int(re.search(r"zkeyoo_(\d+)_", os.path.basename(f)).group(1)) == n:
            return f
    raise SystemExit(f"background {n} not found")


def next_in_rotation(n):
    nums = [int(re.search(r"zkeyoo_(\d+)_", os.path.basename(f)).group(1)) for f in bg_files()]
    later = [x for x in nums if x > n]
    return later[0] if later else nums[0]


def main():
    spec_path = sys.argv[1]
    spec = json.load(open(spec_path))
    state_path = os.path.join(ROOT, "state.json")
    state = json.load(open(state_path))
    if "--bg" in sys.argv:
        spec["bg"] = int(sys.argv[sys.argv.index("--bg") + 1])
    if not spec.get("bg"):
        spec["bg"] = state["next_bg"]
        state["next_bg"] = next_in_rotation(spec["bg"])
        json.dump(state, open(state_path, "w"), indent=2)
        json.dump(spec, open(spec_path, "w"), indent=2, ensure_ascii=False)
    bg = bg_by_number(spec["bg"])
    zones = json.load(open(os.path.join(ROOT, "backgrounds/zones.json")))
    z0, z1 = zones[os.path.basename(bg)[:-4]]
    # keep the card clear of the Shorts UI: top icons and the title/channel/sound block at the bottom
    z0, z1 = max(z0, SAFE_TOP), min(z1, SAFE_BOTTOM)
    k = H / 1280
    slug = os.path.splitext(os.path.basename(spec_path))[0]
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True)
    os.makedirs(os.path.join(ROOT, "work"), exist_ok=True)
    overlay = os.path.join(ROOT, "work", slug + "_overlay.png")
    rspec = {
        "top": spec.get("top", ""), "comment": spec["comment"],
        "images": [os.path.join(ROOT, p) for p in spec["images"]],
        "focus": spec.get("focus", []), "layout": spec.get("layout"), "zone": [round(z0 * k), round(z1 * k)],
        "out": overlay, "brand": BRAND,
        "rubric": json.load(open(os.path.join(ROOT, "rubrics.json"))).get(spec["rubric"]) if spec.get("rubric") else None,
    }
    rpath = os.path.join(ROOT, "work", slug + "_render.json")
    json.dump(rspec, open(rpath, "w"), ensure_ascii=False)
    info = subprocess.run(["node", os.path.join(ROOT, "render_card.cjs"), rpath], check=True,
                          capture_output=True, text=True).stdout.strip()
    print("card:", info)
    out = os.path.join(ROOT, "out", slug + ".mp4")
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", bg, "-loop", "1", "-i", overlay,
        "-filter_complex", f"[0:v]scale={W}:{H}:flags=lanczos,fps={FPS}[b];[b][1:v]overlay=0:0:format=auto,format=yuv420p[v]",
        "-map", "[v]", "-t", str(DUR), "-c:v", "libx264", "-preset", "slow", "-crf", "16",
        "-profile:v", "high", "-movflags", "+faststart", "-an", out], check=True)
    still = os.path.join(ROOT, "work", slug + "_still.jpg")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "3", "-i", out, "-frames:v", "1", "-q:v", "3", still], check=True)
    print("video:", out, "| background:", os.path.basename(bg))
    # keep the Excel tracker in sync with every video made
    r = subprocess.run([sys.executable, os.path.join(ROOT, "update_tracker.py")], capture_output=True, text=True)
    print(r.stdout.strip().splitlines()[-1] if r.returncode == 0 else "tracker update FAILED: " + r.stderr[-400:])


if __name__ == "__main__":
    main()
