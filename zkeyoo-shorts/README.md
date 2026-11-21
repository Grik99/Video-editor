# Zkeyoo Shorts: impostazioni salvate

Shorts da 6 secondi in stile "post + fake tweet" per il canale **Zkeyoo** (@zkeyooreal). Con l'utente si parla in italiano; i testi dei video sono in inglese US.

## Pipeline definitiva (decisa dall'utente)
1. **"Dammi N idee"**: cerca sul web, sui social e tra i competitor i migliori candidati del momento (vedi Ricerca qui sotto). Prima di proporli controlla `Zkeyoo_Shorts_tracker.xlsx` / `history_user.json` / `posts/`: argomenti simili vanno bene, uguali no.
   Per ogni idea manda:
   - numero, genere e argomento in italiano;
   - il testo sopra in inglese (bozza);
   - l'immagine: un foglio con le anteprime numerate, inviato come file;
   - il link della foto e il link della fonte.
2. **L'utente controlla e approva** (es. "ok 1, 3, 5"). Non fare video senza approvazione.
3. **Video degli approvati** secondo i criteri qui sotto, poi invio degli MP4 e dei metadati.
4. **Excel di tracciamento** `Zkeyoo_Shorts_tracker.xlsx`: argomento esatto, foto, titolo, sfondo e il resto, una riga per video, compresi i 9 video fatti prima dall'utente (`history_user.json`). Si rigenera da solo a ogni `make_short.py`; dopo ogni giro mandalo aggiornato all'utente.
5. **Controllo dei fatti, sempre**: ogni cifra, data, nome e citazione in testi, titoli e descrizioni deve essere confermato da almeno una fonte affidabile (meglio due). Se una cosa non è verificabile, toglila o riformulala; non arrotondare in modo scorretto ("quasi 10 anni", non "10 anni").
6. **Emoji nei commenti: non sempre.** Al massimo circa la metà dei commenti ne ha una, e mai la stessa di fila.

## Rotazione sfondi
**Avviso ultimo sfondo (richiesta dell'utente):** quando si usa l'ultimo sfondo (il 30) oppure il prossimo sfondo della rotazione fa ripartire dall'01, avvisa l'utente nel messaggio di consegna, prima di continuare. Gli sfondi disponibili sono 28 (01, 02, 05–30).

Gli sfondi si contano in ordine di file (01, 02, 05, 06, …; 03 e 04 non esistono). I 9 video dell'utente hanno usato 01–11. Il prossimo è sempre in `state.json` e nel foglio Riepilogo dell'Excel.

## Ricerca e criteri dei video
1. **Ricerca.** Cerca i post migliori del momento sul web, sui social (X, Reddit, Instagram, TikTok) e sui canali YouTube simili.
   - Usa vidIQ con `vidiq_outliers` (contentType short, publishedWithin thisWeek) sui competitor elencati sotto e `vidiq_channel_videos` sul singolo canale.
   - Puoi riprendere i post dei competitor che funzionano, ma riscrivi sempre il testo sopra e il commento. La foto va presa dalla fonte originale, mai dal video del competitor.
   - Controlla `posts/` per non ripetere un argomento.
2. **Mix di generi.** Ogni gruppo di video deve variare, non solo notizie: divertente/meme, virale, drama/dibattito (es. "unpopular opinion", chi ha ragione?), fatti tristi o commoventi, fatti storici "lo sapevi?", trend del momento, attualità calda, post interattivi ("quale scegli?", "solo chi è degli anni '90…", illusioni).
   - Mai due generi uguali di fila.
   - Solo storie vere e verificate. Niente bufale e niente dettagli inventati.
3. **Foto e layout.** Varia il formato della foto, non sempre una sola 16:9. Layout disponibili (`layout` nel file del post):
   - `single`: una foto, orizzontale, quadrata o verticale (si adatta)
   - `lr`: 2 foto affiancate (sinistra/destra)
   - `tb`: 2 foto una sopra l'altra
   - `row3`: 3 foto in fila
   - `t1b2`: 1 grande sopra e 2 sotto
   - `l1r2`: 1 grande a sinistra e 2 a destra
   - `2x2`: 4 foto
   - `l2r3`: 5 foto, 2 a sinistra e 3 a destra (stile "solo chi è degli anni '90")

   `focus` (es. `"50% 30%"`) decide quale parte della foto resta visibile. Evita stock, watermark di altre testate e foto di minori dove possibile. Le foto ufficiali o libere (NASA, enti pubblici) sono le migliori.
4. **Testi** (inglese US):
   - `top`: il commento sopra (la notizia o il post) in 1-4 righe. Se il post originale ha già un testo, usa quello.
   - `comment`: la battuta sotto, nel fake tweet di Zkeyoo, in 1-2 righe nel tono di Hiroo (ironica, empatica o "unpopular opinion"). Emoji solo a volte (vedi la regola sopra).
5. **Metadati da vidIQ** (formato da consegnare):
   - **Titolo**: `vidiq_generate_titles` (type short). Scegli il migliore che sia anche vero. **Nel titolo vanno 3 hashtag virali alla fine** (es. `... #hachiko #dog #truestory`), titolo completo entro 100 caratteri.
   - **Descrizione**: 1-2 frasi, poi sempre la frase fissa "All stories are independently researched, fact-checked, and transformed through original scripting, editing, and commentary for educational and entertainment purposes.", poi gli hashtag, l'ultimo sempre `#zkeyoo`.
   - **Tag**: 5 dalla `vidiq_keyword_research`.
   - **Suono**: uno tra quelli salvati dall'utente: Every Breath You Take (The Police), Sultans Of Swing (Dire Straits), Creep (Radiohead), Monster (Skillet), Beat Automotivo Tan Tan Tan Viral (WZ Beat), Chess (Type Beat) (Slowed) (joyful), Oh Klahoma (Jack Stauber), it's like i'm not even here (mthu), Angel Of My Dreams (JADE), All I Want for Christmas Is You (Mariah Carey), Coming Up Roses (Harry Styles).
   - **Orari di pubblicazione** (ora italiana, 6 al giorno): 14:00, 17:00, 20:00, 23:00, 02:00, 05:00. Corrispondono a New York 08:00, 11:00, 14:00, 17:00, 20:00, 23:00 e a Los Angeles 05:00, 08:00, 11:00, 14:00, 17:00, 20:00. Gli slot si assegnano in ordine; 02:00 e 05:00 sono già il giorno dopo. Nei campi `day` e `slot` del post vanno il giorno di pubblicazione e l'orario italiano.
6. **Render**: `python3 make_short.py posts/<file>.json`. Poi controlla il fotogramma `work/<file>_still.jpg` e invia gli MP4.

## Regole aggiunte dall'utente
- **Commento più ricco:** oltre alla battuta, aggiungi un dettaglio o un contesto vero che nel post non c'è (verificato con le fonti). Restano 1-3 righe.
- **Domanda nel commento ogni tanto** (circa 1 video su 3), per stimolare i commenti: "Who's right?", "What would you do?".
- **Foto:** libere da diritti quando possibile (NASA, enti pubblici, Wikimedia), ma la priorità è la qualità virale. Se la foto migliore non è libera, si usa lo stesso.
- **Rubriche:** ogni post ha una rubrica (`"rubric"` nel file del post; elenco e colori in `rubrics.json`). Compare come etichetta colorata in alto nella card, senza schermate extra: il video resta da 6 s e il primo fotogramma è già il post. Alterna le rubriche tra un video e l'altro.
- **6 video al giorno** per ora.

## Competitor (YouTube)
- Hiroo @OnlyHiro `UCEGlyjtuJE09nQ6revb8BqA`
- GrandmaRunner `UClDyj3P95ScToj9P1CDbwGQ`
- Zkyy `UC9G4ZtkHNfPSzPq9pH8X6Ag`
- Strivex `UCmRtONmniYCHs7kl3FXn-RQ`
- Warm Choices `UCQsVJJpIyks8YzH18pqNe5Q`
- Vyle Clips `UCzZ-yV4rcblqN9Cll8JaHLw`
- Nora's Point `UCw-sCnfW83B_Ird4cmyHhww`
- Sukitino `UCZ5J_SBWtebueszSc4lu6PA`
- GOOD STUFF `UCHAUy_QLZmhHJiIhkR8mh2w`
- Past Breathes `UChT33QoM_8TV7E2eYAY-wAw`
- Elowen1278 `UC6HAG2ThRK6a8V9WVt7ybDQ`
- Zoom Lens `UCD-leb3afSq0ugWFy3G3qqw`

- StaticSway `UCps2m5y_MSlRsJiUsYRvLbA`
- little crumbs `UCO4R_DbLcUxLDdarwuE9Jpg`
- Candy-J5V `UCeJUxtNxq-VHT2LALohc_nw`

vidIQ è collegato al canale **Zkeyoo** (`UCDrAa6j3kpvjK6GFwkaw8Xg`, @zkeyooreal). I competitor ufficiali in vidIQ sono Hiroo, GrandmaRunner, StaticSway, little crumbs e Candy-J5V (`vidiq_list_competitors`).

## File
- `posts/*.json`: un file per Short, con testi, foto, layout, sfondo, metadati e fonti. Serve anche come storico.
- `backgrounds/`: i 28 sfondi animati (720×1280, 6 s). `zones.json` indica per ogni sfondo la fascia libera per la card.
- `state.json`: il prossimo sfondo della rotazione. Ogni Short nuovo prende il successivo e dopo il 30 si riparte dall'01. Se ri-renderizzi un post, tiene il suo sfondo.
- `brand/logo.png`: il logo tondo HD, ricavato da `brand/logo_source.jpg`.
- `render_card.cjs`: genera la card bianca trasparente con Playwright e il font Inter. Usa virgolette tipografiche e non lascia parole o emoji da sole sull'ultima riga.
- `make_short.py`: crea il video (sfondo + card) in 1080×1920, 30 fps, 6 s, H.264 senza audio. L'utente aggiunge la musica nell'app YouTube.
- `work/` e `out/` non vanno su git: contengono le immagini scaricate e gli MP4.

## Regole di layout
- La card occupa il 76% della larghezza ed è centrata nella fascia libera dello sfondo. Se è troppo alta si riduce la foto, poi il testo.
- La card resta tra y=110 e y=930 (su 1280), così non finisce sotto il titolo, il canale e i pulsanti dell'interfaccia di Shorts.

## Descrizione del canale (approvata)
just sharing relatable stories, funny threads, wild facts and internet brainrot. i find the good stuff so you don't have to.
every post is hand-picked, fact-checked and captioned by me, with my own take on it. new shorts every day.
