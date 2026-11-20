---
name: zkeyoo-shorts
description: Produce 6-second "post + fake tweet" YouTube Shorts for the Zkeyoo channel (@zkeyooreal). Use whenever the user asks for Zkeyoo video ideas ("dammi N idee"), approves ideas ("ok 1, 3, 5"), asks to make/redo Shorts, or asks about the tracker Excel, backgrounds, titles/descriptions/tags or the channel. Covers research, idea proposals, fact-checking, rendering, vidIQ metadata, background rotation and the tracking spreadsheet.
---

# Zkeyoo Shorts

Speak **Italian** with the user, short and direct. All on-screen text, titles, descriptions and tags are **US English**.
Everything lives in `zkeyoo-shorts/` (the detailed rules are in `zkeyoo-shorts/README.md`; read it at the start).

## The pipeline (fixed by the user)
1. **"Dammi N idee"** → research → send N numbered ideas. Do NOT render anything yet.
2. **User approves** ("ok 1, 3, 5") → make only those videos.
3. **Deliver** MP4s + metadata for each, then the updated `Zkeyoo_Shorts_tracker.xlsx`.

### 1. Research (best viral material of the moment, mixed genres)
- Competitors (vidIQ is connected to Zkeyoo `UCDrAa6j3kpvjK6GFwkaw8Xg`): `vidiq_list_competitors`, then
  `vidiq_outliers` (contentType short, publishedWithin thisWeek, channelIds = competitors + similar channels listed in README).
  Copying a competitor's *idea* is allowed: rewrite all text and get the photo from the original source, never from their video.
- Web/social: `WebSearch` (extended for "this week" viral, wholesome, drama/AITA, weird news, memes, trending debates).
- Mix genres every batch, never two of the same in a row: funny/viral, weird news, trend/meme, debate/interactive,
  sad/touching, history, did-you-know, celebrity, hot current events, "faith in humanity".
- Before proposing, check `history_user.json`, `posts/` and the tracker: similar topics OK, **identical topic NO**.
- **Only true stories.** Skip hoaxes (e.g. "11-year-old hacked a Swiss bank").

### Idea message format (one per idea)
`N — rubrica — genere — argomento (IT)` · draft top text (EN) · photo link · source link(s) · proposed layout.
Also send ONE contact-sheet image with all candidate photos numbered (build it with PIL into `out/`, send with SendUserFile).

### 2. Making an approved video
1. Download photos to `zkeyoo-shorts/work/img/` (gitignored). Crop if needed (keep the subject big).
2. Write `zkeyoo-shorts/posts/YYYY-MM-DD_NN_slug.json`:
   `top, comment, images[], focus[], layout, rubric, genre_it, topic_it, photo_it, image_sources[], sources[], category,
    title, description, tags[], sound, day, slot`. Leave `bg` out: it is assigned from the rotation.
3. `python3 zkeyoo-shorts/make_short.py zkeyoo-shorts/posts/<file>.json` → `out/<slug>.mp4` (1080×1920, 30 fps, 6 s, no audio)
   + `work/<slug>_still.jpg`; it also regenerates the tracker automatically. Look at the still before sending.

### Text rules
- `top`: the post/news in 1–4 lines (use the original post text if it has one).
- `comment`: the Zkeyoo fake-tweet line, **richer than a joke**: add one true detail/context not in the post. 1–3 lines.
  Ask a question roughly 1 video in 3 ("Who's right?"). **Emoji only sometimes** (≤ half of comments, never the same twice in a row).
- **Fact-check everything** (numbers, dates, names, quotes) against ≥1 reliable source, ideally 2. Round honestly
  ("almost 10 years", not "10 years"). If unverifiable, rephrase or drop. Make sure jokes match the facts
  (e.g. don't say "that IS your home" if the scene isn't at her home).

### Rubrics (`rubrics.json`, coloured badge at the top of the card, no extra screens)
wait-what · faith · heartbreaking · unpopular · you-decide · history · did-you-know · celeb · trending · lol. Rotate them.

### Layouts (`layout`)
single · lr · tb · row3 · t1b2 · l1r2 · 2x2 · l2r3. Vary them; not every post is one 16:9 photo. `focus` = object-position.
Free photos (NASA, gov, Wikimedia) when possible, but **viral quality comes first**: use the best photo anyway.

### Metadata (vidIQ)
- Title: `vidiq_generate_titles` (type short). Pick a high score that is **factually accurate**; **never hashtags in the title**;
  avoid first person ("we pranked…") for reposted stories. If you fix a title for accuracy, verify it with `vidiq_score_title`.
- Description: 1–2 sentences + this fixed line, then hashtags ending with `#zkeyoo`:
  `All stories are independently researched, fact-checked, and transformed through original scripting, editing, and commentary for educational and entertainment purposes.`
- Tags: 5 from `vidiq_keyword_research` (mode research).
- Sound: one of the user's saved sounds (list in README).
- Schedule: 6 per day, Italian time **14:00, 17:00, 20:00, 23:00, 02:00, 05:00** (02/05 = next calendar day).

### Delivery format (per video, in chat)
`N — ore HH:MM — argomento (sfondo NN, rubrica, layout)` then Titolo / Descrizione / Tag / Suono. Send MP4s + tracker with SendUserFile.

## Backgrounds
- 28 animated backgrounds in `backgrounds/` (files 01, 02, 05–30; 03/04 don't exist). One new background per video, in file order;
  next one is in `state.json`. Re-rendering a post keeps its background.
- The user's own 9 earlier videos used 01–11 (see `history_user.json`).
- **Warn the user when the last background (30) is used**, before the rotation restarts from 01.
- `backgrounds/zones.json` = free vertical band per background; the card is also kept inside y 110–930 (of 1280) so the Shorts UI
  doesn't cover it.

## Tracker
`Zkeyoo_Shorts_tracker.xlsx` is generated by `update_tracker.py` from `history_user.json` + `posts/*.json` (+ `thumbs/`).
Never hand-edit it; change the JSON and rerun. Yellow cells = data missing from the user's old videos.

## Environment lessons (cloud container)
- Reddit returns 403 and Wikimedia/Wikipedia APIs return 429 from here: reach Reddit content via WebSearch/news coverage.
- Best image sources: article `og:image` (curl with a browser UA), WordPress images via `i0.wp.com/<host>/<path>`,
  `images-api.nasa.gov` (public domain), Know Your Meme images (`i.kym-cdn.com/photos/images/original/...`), tag24 viral-video stills.
- Avoid images with another outlet's watermark (crop to a clean panel or find another source); avoid stock photos.
- Fonts: Inter + Noto Color Emoji are installed; rendering uses Playwright Chromium (`render_card.cjs`).
- Commit and push changes on the session branch when done (`work/`, `out/`, `__pycache__/` are gitignored).

## Channel
Description (approved): see README "Descrizione del canale". Monetization caveat already explained to the user:
reused/inauthentic-content policies are the risk; the richer comment, rubrics, fact-checking and own design are the mitigations.
