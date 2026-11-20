# Zkeyoo Shorts

Shorts da 6 secondi in stile "post + fake tweet" per il canale Zkeyoo (@zkeyooreal).

## Come funziona una richiesta "fammi N shorts"
1. **Ricerca dei post**: notizie e post della settimana dal web e dai social (X, Reddit, Instagram, YouTube) e dai competitor (Hiroo @OnlyHiro, Grandm…, StaticSw…, little cru…, Candy-J5V). Il mix è tra post divertenti, virali, di attualità, caldi e di tendenza. Usa solo storie vere e verificate (niente bufale tipo "11enne hackera banca svizzera") e controlla `posts/` per evitare i doppioni.
2. **Foto**: prendi l'originale migliore. Preferisci foto ufficiali o libere (NASA, enti pubblici) ed evita stock e watermark di altre testate.
3. **Testi** (in inglese US):
   - `top`: il commento sopra, la notizia in 1-4 righe. Se il post ha già un testo, usa quello.
   - `comment`: la battuta sotto, nel fake tweet di Zkeyoo, 1-2 righe con un emoji.
4. **Metadati da vidIQ**: titolo (`vidiq_generate_titles`, type short), tag (`vidiq_keyword_research`) e descrizione con gli hashtag, che finisce con `#zkeyoo`. Il suono si sceglie tra quelli salvati dall'utente. Gli orari sono 17:00, 20:00 e 23:00.
5. **Render**: `python3 make_short.py posts/<file>.json`.

## File
- `posts/*.json`: un file per Short, con testi, foto, sfondo, metadati e fonti. Serve anche come storico.
- `backgrounds/`: i 28 sfondi animati (720×1280, 6 s). `zones.json` indica per ogni sfondo la fascia libera dove va la card.
- `state.json`: il prossimo sfondo della rotazione. Ogni Short nuovo prende quello successivo e dopo il 30 riparte dall'01.
- `brand/logo.png`: il logo tondo, ricavato da `brand/logo_source.jpg`.
- `render_card.cjs`: genera la card bianca trasparente con Playwright e il font Inter.
- `make_short.py`: crea il video (sfondo + card), in formato 1080×1920, 30 fps, 6 s, H.264 senza audio. L'utente aggiunge la musica nell'app YouTube.
- `work/` e `out/` non vanno su git: contengono le immagini scaricate e gli MP4.

## Regole di layout
- La card occupa il 76% della larghezza ed è centrata nella fascia libera dello sfondo. Se è troppo alta si riduce la foto, poi il testo.
- La card resta tra y=110 e y=930 (su 1280), così non finisce sotto i pulsanti, il titolo e il nome del canale dell'interfaccia di Shorts.
