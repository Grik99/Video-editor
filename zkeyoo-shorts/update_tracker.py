#!/usr/bin/env python3
"""Rebuild Zkeyoo_Shorts_tracker.xlsx from history_user.json (videos the user made before)
and posts/*.json (videos made here). Run automatically by make_short.py after every render."""
import glob, json, os, re, subprocess, sys
from openpyxl import Workbook
from openpyxl.comments import Comment
from openpyxl.drawing.image import Image as XLImage
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side
from openpyxl.utils import get_column_letter
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "Zkeyoo_Shorts_tracker.xlsx")
THUMBS = os.path.join(ROOT, "thumbs")
F = "Arial"
GENRES = ["Divertente / virale", "Notizia strana", "Trend / meme", "Dibattito / interattivo", "Triste / commovente",
          "Storia / curiosità", "Celebrità / curiosità", "Attualità", "Attualità / drama", "Attualità / scienza"]


def bg_names():
    """{id: name}; set 1 ids are ints 1..30, set 2 ids are "2-001".."2-110" (backgrounds/set2/)."""
    out = {}
    for f in sorted(glob.glob(os.path.join(ROOT, "backgrounds/zkeyoo_*.mp4"))):
        m = re.match(r"zkeyoo_(\d+)_(.+)\.mp4", os.path.basename(f))
        out[int(m.group(1))] = m.group(2)
    for f in sorted(glob.glob(os.path.join(ROOT, "backgrounds/set2/zkeyoo_*.mp4"))):
        m = re.match(r"zkeyoo_(\d+)_(.+)\.mp4", os.path.basename(f))
        out["2-" + m.group(1)] = m.group(2)
    return out


def bg_label(n, names):
    if not n:
        return "?"
    if isinstance(n, str):
        return f"S2-{n[2:]} · {names.get(n, '?')}"
    return f"{n:02d} · {names.get(n, '?')}"


def make_thumb(slug, images):
    """Small preview of the post's photo(s), kept in thumbs/ so the tracker can be rebuilt later."""
    dst = os.path.join(THUMBS, slug + ".jpg")
    srcs = [os.path.join(ROOT, p) for p in images if os.path.exists(os.path.join(ROOT, p))]
    if not srcs:
        return dst if os.path.exists(dst) else None
    ims = [Image.open(p).convert("RGB") for p in srcs]
    h = 200
    ims = [im.resize((max(1, round(im.width * h / im.height)), h), Image.LANCZOS) for im in ims]
    sheet = Image.new("RGB", (sum(i.width for i in ims) + 6 * (len(ims) - 1), h), "white")
    x = 0
    for im in ims:
        sheet.paste(im, (x, 0)); x += im.width + 6
    sheet.thumbnail((300, 240), Image.LANCZOS)
    os.makedirs(THUMBS, exist_ok=True)
    sheet.save(dst, quality=88)
    return dst


def rows():
    names = bg_names()
    out = []
    for e in json.load(open(os.path.join(ROOT, "history_user.json"))):
        out.append({**e, "who": "Utente", "date": e.get("date", "?"), "bg_label": bg_label(e.get("bg"), names),
                    "thumb": os.path.join(THUMBS, e["slug"] + ".jpg"), "file": "(video dell'utente)"})
    for p in sorted(glob.glob(os.path.join(ROOT, "posts/*.json"))):
        slug = os.path.splitext(os.path.basename(p))[0]
        e = json.load(open(p))
        date = slug[:10] if re.match(r"\d{4}-\d{2}-\d{2}", slug) else "?"
        out.append({**e, "slug": slug, "who": "Claude", "date": date, "bg_label": bg_label(e.get("bg"), names),
                    "thumb": make_thumb(slug, e.get("images", [])), "file": f"out/{slug}.mp4"})
    return out


def main():
    data = rows()
    wb = Workbook()
    ws = wb.active
    ws.title = "Video"
    cols = [("N°", 5), ("Fatto da", 10), ("Data", 11), ("Pubblicazione", 13), ("Genere", 17), ("Argomento", 42),
            ("Titolo", 34), ("Sfondo", 19), ("Foto", 30), ("Anteprima", 23), ("Link foto", 32), ("Layout", 9),
            ("Testo sopra", 52), ("Commento", 38), ("Descrizione", 46), ("Tag", 30), ("Suono", 26), ("Fonti", 36),
            ("File video", 30)]
    head_fill = PatternFill("solid", start_color="1F3A5F")
    miss_fill = PatternFill("solid", start_color="FFF2CC")
    thin = Side(style="thin", color="D9D9D9")
    border = Border(left=thin, right=thin, top=thin, bottom=thin)
    for i, (name, w) in enumerate(cols, 1):
        c = ws.cell(row=1, column=i, value=name)
        c.font = Font(name=F, size=10, bold=True, color="FFFFFF")
        c.fill = head_fill
        c.alignment = Alignment(vertical="center", horizontal="center", wrap_text=True)
        c.border = border
        ws.column_dimensions[get_column_letter(i)].width = w
    ws.row_dimensions[1].height = 24
    for r, e in enumerate(data, 2):
        pub = f"Giorno {e['day']} – {e['slot']}" if e.get("day") and e.get("slot") else (e.get("slot") or "?")
        vals = [r - 1, e["who"], e["date"], pub, e.get("genre_it", "?"), e.get("topic_it", "?"), e.get("title", "?"),
                e["bg_label"], e.get("photo_it", "?"), None, "\n".join(e.get("image_sources", [])) or "?",
                e.get("layout", "?"), e.get("top", "?"), e.get("comment", "?"), e.get("description", "?"),
                ", ".join(e.get("tags", [])) or "?", e.get("sound", "?"), "\n".join(e.get("sources", [])) or "?", e["file"]]
        for ci, v in enumerate(vals, 1):
            c = ws.cell(row=r, column=ci, value=v)
            c.font = Font(name=F, size=10)
            c.alignment = Alignment(vertical="top", wrap_text=True, horizontal="center" if ci in (1, 12) else "left")
            c.border = border
            if v == "?" or (isinstance(v, str) and v.startswith("?")):
                c.fill = miss_fill
        for ci in (11, 18):  # clickable first link
            c = ws.cell(row=r, column=ci)
            if isinstance(c.value, str) and c.value.startswith("http"):
                c.hyperlink = c.value.split("\n")[0]
                c.font = Font(name=F, size=10, color="0563C1", underline="single")
        ws.row_dimensions[r].height = 120
        if e.get("thumb") and os.path.exists(e["thumb"]):
            img = XLImage(e["thumb"])
            k = min(160 / img.width, 150 / img.height)
            img.width, img.height = int(img.width * k), int(img.height * k)
            ws.add_image(img, f"J{r}")
    ws.freeze_panes = "C2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(cols))}{len(data) + 1}"

    # summary sheet with live formulas
    s = wb.create_sheet("Riepilogo")
    s.column_dimensions["A"].width = 34
    s.column_dimensions["B"].width = 14
    s["A1"] = "Riepilogo Zkeyoo Shorts"
    s["A1"].font = Font(name=F, size=14, bold=True)
    last = len(data) + 1
    lines = [("Video totali", f"=COUNTA(Video!A2:A{last})"),
             ("Fatti da Claude", f'=COUNTIF(Video!B2:B{last},"Claude")'),
             ("Fatti dall'utente", f'=COUNTIF(Video!B2:B{last},"Utente")')]
    for i, (k, v) in enumerate(lines, 3):
        s.cell(row=i, column=1, value=k); s.cell(row=i, column=2, value=v)
    state = json.load(open(os.path.join(ROOT, "state.json")))
    s.cell(row=6, column=1, value="Prossimo sfondo da usare")
    nb = s.cell(row=6, column=2, value=bg_label(state["next_bg"], bg_names()))
    nb.comment = Comment("Valore preso da state.json: si aggiorna da solo a ogni video creato.", "Claude")
    s.cell(row=7, column=1, value="Prossimo sfondo triste (set 2)")
    s.cell(row=7, column=2, value=bg_label(state.get("next_sad", "2-101"), bg_names()))
    s.cell(row=8, column=1, value="Genere"); s.cell(row=8, column=2, value="N° video")
    r = 9
    for g in GENRES:
        s.cell(row=r, column=1, value=g)
        s.cell(row=r, column=2, value=f"=COUNTIF(Video!$E$2:$E${last},A{r})")
        r += 1
    r += 1
    s.cell(row=r, column=1, value="Sfondo"); s.cell(row=r, column=2, value="Volte usato")
    hdrs = [8, r]
    r += 1
    names = bg_names()
    for n in sorted(names, key=lambda k: (isinstance(k, str), str(k).zfill(6))):
        s.cell(row=r, column=1, value=bg_label(n, names))
        s.cell(row=r, column=2, value=f"=COUNTIF(Video!$H$2:$H${last},A{r})")
        r += 1
    r += 1
    legend = ["Come si usa",
              "• Foglio Video: una riga per ogni Short, i tuoi di prima e quelli fatti da Claude.",
              "• Celle gialle = dato mancante: dimmelo e lo aggiungo.",
              "• Regola: argomenti simili sì, uguali no. Sfondi sempre a rotazione, senza ripetizioni.",
              "• Il file si rigenera da solo a ogni nuovo video (non serve modificarlo a mano)."]
    for i, t in enumerate(legend):
        c = s.cell(row=r + i, column=1, value=t)
        c.font = Font(name=F, size=10, bold=(i == 0))
    for row in s.iter_rows(min_row=3, max_row=r - 2):
        for c in row:
            if c.value is not None:
                c.font = Font(name=F, size=10, bold=c.row in hdrs)
    wb.save(OUT)
    # store computed values for viewers that don't recalculate (LibreOffice via the xlsx skill, when available)
    rc = glob.glob("/root/.claude/skills/**/xlsx/scripts/recalc.py", recursive=True)
    if rc:
        res = subprocess.run([sys.executable, rc[0], OUT, "60"], capture_output=True, text=True)
        print("recalc:", res.stdout.strip()[:300])
    print("tracker:", OUT, "| rows:", len(data))


if __name__ == "__main__":
    main()
