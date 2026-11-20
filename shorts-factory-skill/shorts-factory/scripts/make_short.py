#!/usr/bin/env python3
"""Build one 6 s Short (1080x1920, 30 fps, no audio) from a post spec.

Usage (from anywhere): python3 <project>/tools/make_short.py <project>/posts/<slug>.json [--bg <background_stem>]
The first render assigns the next background in rotation (sorted file order, state.json) and writes it into
the spec; re-renders keep it. Prints a WARNING when the last background is used. Rebuilds the Excel tracker.
"""
import glob, json, os, subprocess, sys

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS)
W, H, FPS, DUR = 1080, 1920, 30, 6.0
SAFE_TOP, SAFE_BOTTOM = 110, 930  # 720x1280 coords: keep clear of the Shorts UI


def bgs():
    return sorted(glob.glob(os.path.join(ROOT, "backgrounds", "*.mp4")), key=lambda f: os.path.basename(f).lower())


def main():
    spec_path = os.path.abspath(sys.argv[1])
    spec = json.load(open(spec_path))
    cfg = json.load(open(os.path.join(ROOT, "config.json")))
    state_path = os.path.join(ROOT, "state.json")
    state = json.load(open(state_path))
    files = bgs()
    stems = [os.path.splitext(os.path.basename(f))[0] for f in files]
    if "--bg" in sys.argv:
        spec["bg"] = sys.argv[sys.argv.index("--bg") + 1]
    if not spec.get("bg"):
        i = state["next_index"] % len(stems)
        spec["bg"] = stems[i]
        state["next_index"] = (i + 1) % len(stems)
        json.dump(state, open(state_path, "w"), indent=2)
        json.dump(spec, open(spec_path, "w"), indent=2, ensure_ascii=False)
        if i == len(stems) - 1:
            print("WARNING: this is the LAST background — the next video restarts the rotation from the first one. Tell the user.")
    bg = files[stems.index(spec["bg"])]
    zones = json.load(open(os.path.join(ROOT, "backgrounds", "zones.json")))
    z0, z1 = zones.get(spec["bg"], [SAFE_TOP, SAFE_BOTTOM])
    z0, z1 = max(z0, SAFE_TOP), min(z1, SAFE_BOTTOM)
    k = H / 1280
    slug = os.path.splitext(os.path.basename(spec_path))[0]
    os.makedirs(os.path.join(ROOT, "out"), exist_ok=True); os.makedirs(os.path.join(ROOT, "work"), exist_ok=True)
    overlay = os.path.join(ROOT, "work", slug + "_overlay.png")
    rub = json.load(open(os.path.join(ROOT, "rubrics.json")))
    brand = dict(cfg["brand"]); brand["logo"] = os.path.join(ROOT, brand["logo"])
    rspec = {"top": spec.get("top", ""), "comment": spec["comment"],
             "images": [os.path.join(ROOT, p) for p in spec["images"]], "focus": spec.get("focus", []),
             "layout": spec.get("layout"), "zone": [round(z0 * k), round(z1 * k)], "out": overlay, "brand": brand,
             "rubric": rub.get(spec["rubric"]) if spec.get("rubric") else None}
    rpath = os.path.join(ROOT, "work", slug + "_render.json")
    json.dump(rspec, open(rpath, "w"), ensure_ascii=False)
    info = subprocess.run(["node", os.path.join(TOOLS, "render_card.cjs"), rpath], check=True,
                          capture_output=True, text=True).stdout.strip()
    print("card:", info)
    out = os.path.join(ROOT, "out", slug + ".mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-stream_loop", "-1", "-i", bg, "-loop", "1", "-i", overlay,
                    "-filter_complex", f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,crop={W}:{H},fps={FPS}[b];"
                    "[b][1:v]overlay=0:0:format=auto,format=yuv420p[v]",
                    "-map", "[v]", "-t", str(DUR), "-c:v", "libx264", "-preset", "slow", "-crf", "16",
                    "-profile:v", "high", "-movflags", "+faststart", "-an", out], check=True)
    still = os.path.join(ROOT, "work", slug + "_still.jpg")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "3", "-i", out, "-frames:v", "1", "-q:v", "3", still], check=True)
    print("video:", out, "| background:", spec["bg"], "| still:", still)
    r = subprocess.run([sys.executable, os.path.join(TOOLS, "update_tracker.py")], capture_output=True, text=True)
    print(r.stdout.strip().splitlines()[-1] if r.returncode == 0 else "tracker update FAILED: " + r.stderr[-400:])


if __name__ == "__main__":
    main()
