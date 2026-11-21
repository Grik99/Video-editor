---
name: shorts-factory
description: Run a faceless "post + fake tweet" YouTube Shorts channel end to end. Use when the user wants to set up a new channel (name, logo, tagline, animated backgrounds), asks for video ideas ("dammi N idee"), approves ideas ("ok 1, 3"), wants Shorts rendered, titles/descriptions/tags, or the tracking Excel. Covers onboarding, web/social research, competitor mining with vidIQ, fact-checking, background zones and rotation, 6-second 1080x1920 rendering and the tracker spreadsheet.
---

# Shorts Factory

Format: 6-second vertical Shorts (1080×1920, 30 fps, no audio — the user adds music in the YouTube app).
An animated background video + a white "fake tweet" card: rubric badge · text on top (the post/news) · photo(s)
· round logo + channel name + tagline/@handle · the channel's comment.
Talk to the user in **their language** (Italian by default for this user), short and direct. On-screen text and metadata
are in the **video language** from `config.json` (default US English).

## 0. First run in a new chat: onboarding (ask, one message, then wait)
If there is no project folder with a `config.json` yet, ask for:
1. **Channel name** (shown bold in the card).
2. **Tagline / @handle** (grey line under the name, e.g. `@brandreal`).
3. **Logo** (square image; it will be cut into a circle).
4. **Backgrounds**: a zip or folder of vertical .mp4 loops (any size; they are scaled/cropped to 9:16 and looped to 6 s).
   Ask which background to start from if some were already used, and for the list of past videos (screenshots are fine).
5. Video language, publishing times, the user's saved sounds, competitor channels, a fixed line for every description
   (default: "All stories are independently researched, fact-checked, and transformed through original scripting,
   editing, and commentary for educational and entertainment purposes.").

Then set up (needs python3 + Pillow + numpy + openpyxl, node + playwright with Chromium, ffmpeg, an Inter font):
```bash
python3 <skill>/scripts/setup_project.py --project ./<brand>-shorts --name "<Name>" --handle "<@handle>" \
        --logo <logo file> --backgrounds <zip or folder>
```
- It writes `config.json`, `state.json`, round `brand/logo.png`, copies scripts to `tools/`, and **auto-detects** the free
  band of every background (`backgrounds/zones.json`) with a preview `work/zones_check.jpg` (red box = where the card goes).
- **Always look at `work/zones_check.jpg` and fix `zones.json` by hand** where the box covers the character
  (values are `[top, bottom]` in 720×1280 coordinates; the card is also clamped to 110–930 so the Shorts UI never covers it).
  Characters at the top → zone below them; character at the bottom → zone above it; art everywhere → [110, 930].
- Fill `config.json` (slots, sounds, competitors) and put the user's past videos in `history.json`
  (format in `templates/history_example.json`) so they appear in the tracker and are never duplicated.
- Set `state.json` `next_index` (0-based position in the sorted background list) if some backgrounds were already used.
- Send the user a test still before producing.

## 1. "Dammi N idee" → research, then propose (no rendering yet)
Find the best viral material **of the moment**, mixing genres in every batch, never two of the same in a row:
funny/viral · weird news · trend/meme · debate/interactive ("who's right?", "which one?", illusions) · sad/touching ·
history · did-you-know · celebrity · hot current events · faith in humanity.
- **Competitors**: with vidIQ, `vidiq_user_channels` → `vidiq_list_competitors` → `vidiq_outliers`
  (contentType short, publishedWithin thisWeek, channelIds = competitors; `vidiq_similar_channels` finds more).
  Their top posts show what works now: copying the *idea* is OK, but **rewrite every word** and fetch the photo from the
  original source, never from their video. Look at their thumbnails with `https://i.ytimg.com/vi/<id>/oardefault.jpg`.
- **Web/social**: WebSearch (extended) for "this week" viral stories, wholesome roundups (BuzzFeed, Cheezburger, TAG24
  "Viral Video of the Day", Bored Panda), AITA/drama coverage (Daily Dot), weird news, Know Your Meme trends, news.
  Reddit blocks cloud servers and Wikimedia APIs rate-limit: reach that content through news coverage instead.
- **Only true stories**; verify before proposing. No hoaxes.
- **Duplicates**: check the tracker/`history.json`/`posts/`. Similar topics OK, identical topic NO.

Idea message (one block per idea): `N — RUBRIC — genre — topic` · draft top text · proposed layout · photo link · source link(s).
Also build ONE contact sheet with all candidate photos numbered (Pillow) and send it as a file.

### Style to look for (user's direction, from StaticSway and similar)
More posts like: **relatable** (texts, tweets, funny threads), **interactive** (riddles, "how many triangles", "how many holes in the T-shirt", A/B/C choices, illusions), **funny signs**, **animals/family**, **pranks**; plus **more serious viral**, **trends** and **hot news**. Mix them in every batch.
- Riddles are drawn by code (original artwork) and the answer is verified by brute-force calculation, never by eye. Put the answer in the description.
- Text-only tweets: no photo (`"images": []`), credit the author in the description ("Tweet by @handle").
- Hot news needs ≥2 outlets; news aggregators/briefings can be wrong (a "Denmark expels Russian diplomat" briefing item was false).

## 2. After approval: make each video
1. Download photos into `work/img/` (curl with a browser User-Agent; use the article `og:image`; WordPress images via
   `i0.wp.com/<host>/<path>`; NASA `images-api.nasa.gov` is public domain; KYM `i.kym-cdn.com/photos/images/original/...`).
   Crop so the subject is big; avoid other outlets' watermarks and stock photos. Free images when possible, but
   **viral quality first**.
2. Write `posts/YYYY-MM-DD_NN_slug.json` (see `templates/post_example.json`; leave out `bg`).
3. `python3 tools/make_short.py posts/<file>.json` → `out/<slug>.mp4` + `work/<slug>_still.jpg`; the Excel tracker is rebuilt
   automatically. **Look at the still** before sending. If it prints the LAST-background warning, tell the user.

### Text rules
- `top`: the post/news in 1–4 lines (use the original post text if it has one).
- `comment`: richer than a joke — add one **true** extra detail/context. 1–3 lines. A question about 1 video in 3.
  **Emoji only sometimes** (≤ half the comments, never the same one twice in a row).
- **Fact-check everything**: numbers, dates, names, quotes against ≥1 reliable source (better 2). Round honestly
  ("almost 10 years"). Make sure the joke matches the facts.
- The renderer adds curly quotes and keeps the last words of each paragraph together (no orphan word/emoji).

### Rubrics and layouts
- `rubric` key from `rubrics.json` (coloured badge at the top of the card; rotate them; rename/add freely):
  wait-what, faith, heartbreaking, unpopular, you-decide, history, did-you-know, celeb, trending, lol.
- `layout`: single · lr (left/right) · tb (top/bottom) · row3 · t1b2 · l1r2 · 2x2 · l2r3 (5 photos). Vary them.
  `focus` per image = CSS object-position (e.g. "50% 30%") to keep the subject in frame.

### Metadata (vidIQ when connected)
- Title: `vidiq_generate_titles` (type short) → pick a high score that is **factually accurate**, **end the title with 3 viral hashtags** (full title ≤ 100 characters),
  no first person for reposted stories. If you fix it, check it with `vidiq_score_title`.
- Description: 1–2 sentences + the fixed line from `config.json` + hashtags, last one `#<brand>`.
- Tags: **always optimized with vidIQ**. For each video run `vidiq_keyword_research` (mode research; several seeds: topic, proper name, category; `matching_terms`/`rising` if needed). Pick 5 tags with high volume and low-to-medium competition (high `overall`) that truly describe the video; drop zero-volume, off-topic or too generic ones. Mix 1–2 broad + 3 specific. In the delivery each tag has a trailing comma and its own copyable code block.
Without vidIQ, write them by hand following the same rules.

### Delivery
Per video: `N — HH:MM — topic (background, rubric, layout)` then Title / Description / Tags / Sound.
Send the MP4s and the updated `<Brand>_Shorts_tracker.xlsx` as files.

## Backgrounds
One new background per video in sorted file order (`state.json`); re-renders keep theirs; after the last one the rotation
restarts — **warn the user when the last background is used**.

## Tracker
`<Brand>_Shorts_tracker.xlsx` (sheets Video + Riepilogo) is generated from `history.json` + `posts/*.json` + `thumbs/`
by `tools/update_tracker.py`. Never edit it by hand: change the JSON and rerun. Yellow cells = missing data.

## Monetization notes (tell the user honestly if asked)
YouTube's reused-content and inauthentic (mass-produced) content policies are the main risk for repost formats.
Mitigations: real added commentary/context, own design and mascot backgrounds, rubrics, fact-checking, a channel
description stating the curation work, varied genres and layouts. No guarantee.

- Metadata is always delivered **in the chat** (not as files), each item in its own copyable code block: title, description, one block per tag (trailing comma), sound. Files (MP4, Excel) are attached separately.
