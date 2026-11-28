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

### MAIN STYLE (user's decision, Nov 28, examples from the Vexumi channel)
- **Top text = hook** that creates curiosity without giving the answer ("These police sketches were drawn BEFORE anyone knew what the suspects looked like").
- **Comment = payoff / twist** with precise true details (names, numbers, dates), 2-3 lines, emoji sometimes.
- **Real photos**, often two side by side (`lr`): the person + the proof (before/after, historic + now, celeb + scene).
- Topics mostly: did-you-know facts (nature, language, science), history with letters/old photos, touching stories (animals, soldiers, kind gestures), faith in humanity, celebrity twists or viral candid photos. Funny ones too, but in this hook→payoff style.
- Mine Bored Panda fact/story lists (`weird-creepy-facts-factsweird`, `interesting-facts-pictures`, `strange-history-facts-moments`, `real-interesting-stories`), verify with 2 outlets, take the real photos from articles (never the text-overlay infographics).
- Challenges/puzzles are an extra only: max 2 of 6, better 0-1.

### 1. Research (best viral material of the moment, mixed genres)
- Competitors (vidIQ is connected to Zkeyoo `UCDrAa6j3kpvjK6GFwkaw8Xg`): `vidiq_list_competitors`, then
  `vidiq_outliers` (contentType short, publishedWithin thisWeek, channelIds = competitors + similar channels listed in README).
  Copying a competitor's *idea* is allowed: rewrite all text and get the photo from the original source, never from their video.
- Web/social: `WebSearch` (extended for "this week" viral, wholesome, drama/AITA, weird news, memes, trending debates).
- **Vexumi method (finds more interesting posts, always use it):**
  - Bored Panda is the main mine: `python3 -I zkeyoo-shorts/bp_scan.py` lists today's articles/lists; `python3 -I zkeyoo-shorts/bp_scan.py <list url> 20`
    extracts the single posts by score (text, image url, original source, often Reddit). Good lists: text messages, wholesome, facts, "People who…", animals, parents, husbands/wives, overheard.
  - Not only this week's news: also **evergreen** true viral stories (history, old kind gestures, curiosities) — often stronger than today's news.
  - Verify with **Bing News RSS** (`https://www.bing.com/news/search?q=...&format=rss`, curl with a browser UA; gives real article URLs) or Google News RSS, then WebSearch on the details.
  - Skip stock images (unsplash/pexels/getty) and AI-looking photos; get the real photo from the original article (og:image). Wikimedia: `Special:FilePath/<file>` instead of the API.
  - Never reuse a topic already used on the user's other channel Vexumi (`zkeyoo-shorts/other_channels.json`).
- Mix genres every batch, never two of the same in a row: funny/viral, weird news, trend/meme, debate/interactive,
  sad/touching, history, did-you-know, celebrity, hot current events, "faith in humanity".
- Before proposing, check `history_user.json`, `posts/` and the tracker: similar topics OK, **identical topic NO**.
- **Only true stories.** Skip hoaxes (e.g. "11-year-old hacked a Swiss bank").

### Style to look for (user's direction, from StaticSway and similar)
More posts like: **relatable** (texts, tweets, funny threads), **interactive** (riddles, "how many triangles", "how many holes in the T-shirt", A/B/C choices, illusions), **funny signs**, **animals/family**, **pranks**; plus **more serious viral**, **trends** and **hot news**. Mix them in every batch.
- **What grabs attention most (competitor analysis):** interactive challenges (count the 9s, how many cubes, who dies if E pushes, which room, cow-trading dilemma). Put **at most 2** original challenges in a daily batch of 6 (user's rule: good format, but not too many per day) (rubric `brain-test` or `you-decide`), drawn with `zkeyoo-shorts/render_html.cjs` (HTML→PNG), answer verified by code, and set `"fit": "contain"` so the puzzle image is never cropped.
- Riddles are drawn by code (original artwork) and the answer is verified by brute-force calculation, never by eye. Put the answer in the description.
- **Never a video/post without at least one image.** Text-only tweets must be paired with a relevant photo (original, archive or free); credit the tweet author in the description ("Tweet by @handle"). No fitting photo → drop the post.
- Hot news needs ≥2 outlets; news aggregators/briefings can be wrong (a "Denmark expels Russian diplomat" briefing item was false).

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

- **Post visibility beats background, with common sense (user's rule):** the card stays big, readable and horizontally centred. To avoid covering too much of the background it may be shrunk only slightly, or moved very slightly up or down. Never sideways, never shrunk a lot, never left small in a narrow band. Covering a bit of the characters is fine.
### Layouts (`layout`)
single · lr · tb · row3 · t1b2 · l1r2 · 2x2 · l2r3. **The card must always be big and centred** (user's rule, see above): only a slight shrink or a very slight vertical shift is allowed. Chat screenshots: the punchline must stay visible (recompose the image if the crop hides it). Vary layouts; not every post is one 16:9 photo. `focus` = object-position.
Free photos (NASA, gov, Wikimedia) when possible, but **viral quality comes first**: use the best photo anyway.

### Metadata (vidIQ)
- Title: `vidiq_generate_titles` (type short). Pick a high score that is **factually accurate**; **end the title with 3 viral hashtags** (full title ≤ 100 characters);
  avoid first person ("we pranked…") for reposted stories. If you fix a title for accuracy, verify it with `vidiq_score_title`.
- Description (fixed structure, blank line before the fixed sentence): 1–2 sentences, newline, hashtags ending with `#zkeyoo`, blank line, then the fixed line `All stories are independently researched, fact-checked, and transformed through original scripting, editing, and commentary for educational and entertainment purposes.` Stored in the post JSON as `core\nhashtags\n\nFIX`.
  `All stories are independently researched, fact-checked, and transformed through original scripting, editing, and commentary for educational and entertainment purposes.`
- Tags: **always optimized with vidIQ**. For each video run `vidiq_keyword_research` (mode research; several seeds: topic, proper name, category; `matching_terms`/`rising` if needed). Pick 5 tags with high volume and low-to-medium competition (high `overall`) that truly describe the video; drop zero-volume, off-topic or too generic ones. Mix 1–2 broad + 3 specific. In the delivery each tag has a trailing comma and its own copyable code block.
- Sound: one of the user's saved sounds (list in README).
- Schedule: 6 per day, Italian time **14:00, 17:00, 20:00, 23:00, 02:00, 05:00** (02/05 = next calendar day).

### Delivery format (per video, in chat)
`N — ore HH:MM — argomento (sfondo NN, rubrica, layout)` then Titolo / Descrizione / Tag / Suono. Send MP4s + tracker with SendUserFile.

## Backgrounds
- Set 1: 28 animated backgrounds in `backgrounds/` (files 01, 02, 05–30; 03/04 don't exist). The user's own 9 videos used 01–11 (`history_user.json`).
- Set 2: 110 backgrounds in `backgrounds/set2/` (`zkeyoo_001`–`zkeyoo_110`), ids `"2-001"`…`"2-110"` in posts (Excel `S2-NNN`). Used right after set 1 ends (after 30).
  001–100 = normal rotation in file order; **101–110 (`sad_…`) only for sad posts** (rubric `heartbreaking`), own rotation `next_sad`.
  `make_short.py` handles all of this; set-2 zones were auto-detected, so always check the still.
- One new background per video; next one is in `state.json`. Re-rendering a post keeps its background.
- **Warn the user** when set 1 ends (30) and when the last normal background (`2-100`) is used, before the rotation restarts.
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

- Metadata is always delivered **in the chat** (not as files), each item in its own copyable code block: title, description, one block per tag (trailing comma), sound. Files (MP4, Excel) are attached separately.
