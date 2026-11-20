#!/usr/bin/env python3
"""TG di Famiglia (versione pubblica) - raccolta dati del mattino.

Legge i feed RSS nazionali, i podcast e la guida TV indicati in config/, le notizie locali
di tutte le province italiane e quelle delle squadre (Google News) e scrive data/. Non usa chiavi API:
l'intelligenza (scelta e riscrittura delle notizie, voce) gira poi sul telefono
con la chiave Gemini di ciascun utente.

Uso:  python scripts/raccogli.py [cartella_output]
"""
from __future__ import annotations

import calendar
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import feedparser

RADICE = Path(__file__).resolve().parent.parent
CONFIG = RADICE / "config"
UA = "Mozilla/5.0 (compatible; TGdiFamiglia/1.0; lettore RSS)"
UA_BROWSER = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"
ROMA = ZoneInfo("Europe/Rome")
ORA = datetime.now(timezone.utc)


def log(*a):
    print(*a, flush=True)


def leggi_config(nome: str) -> dict:
    return json.loads((CONFIG / nome).read_text(encoding="utf-8"))


def scarica(url: str, timeout: int = 20, ua: str = UA) -> bytes:
    ultimo = None
    for _ in range(2):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": ua, "Accept": "*/*", "Accept-Language": "it-IT,it;q=0.9"})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001 - qualsiasi errore: riprovo e poi salto
            ultimo = e
            time.sleep(1.5)
    raise ultimo  # type: ignore[misc]


def pulisci(testo: str | None, massimo: int) -> str:
    if not testo:
        return ""
    t = html.unescape(testo)
    t = re.sub(r"<[^>]+>", " ", t)
    t = html.unescape(t)
    t = re.sub(r"\s+", " ", t).strip()
    if len(t) > massimo:
        t = t[: massimo - 1].rsplit(" ", 1)[0] + "…"
    return t


MESI = {"gen": 1, "feb": 2, "mar": 3, "apr": 4, "mag": 5, "giu": 6, "lug": 7, "ago": 8, "set": 9, "ott": 10,
        "nov": 11, "dic": 12, "jan": 1, "may": 5, "jun": 6, "jul": 7, "aug": 8, "sep": 9, "oct": 10, "dec": 12}


def data_irregolare(testo: str):
    """Date che feedparser non capisce: 'lun, 16 nov 2026 13:03:00 GMT' (Sky TG24, Il Messaggero)
    oppure 'Mon, 16 Nov 2026 16:50:49 TIME_ZONE' (alcuni siti locali)."""
    m = re.search(r"(\d{1,2})\s+([a-zA-Z]{3})[a-z]*\.?\s+(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(.*)", testo or "")
    if not m or m.group(2).lower() not in MESI:
        return None
    g, mese, a, hh, mm, ss, coda = m.groups()
    d = datetime(int(a), MESI[mese.lower()], int(g), int(hh), int(mm), int(ss or 0))
    fuso = re.match(r"([+-])(\d{2}):?(\d{2})", coda.strip())
    if fuso:
        delta = timedelta(hours=int(fuso.group(2)), minutes=int(fuso.group(3))) * (1 if fuso.group(1) == "+" else -1)
        d = d.replace(tzinfo=timezone(delta))
    elif re.match(r"(GMT|UTC|Z)\b", coda.strip()):
        d = d.replace(tzinfo=timezone.utc)
    else:
        d = d.replace(tzinfo=ROMA)  # nessun fuso indicato: ora italiana
    return d.astimezone(timezone.utc).utctimetuple()


feedparser.registerDateHandler(data_irregolare)


def data_voce(e) -> datetime | None:
    for campo in ("published_parsed", "updated_parsed"):
        v = e.get(campo)
        if v:
            return datetime.fromtimestamp(calendar.timegm(v), tz=timezone.utc)
    return None


# ---------------------------------------------------------------- notizie
def raccogli_notizie() -> list[dict]:
    cfg = leggi_config("fonti.json")
    notizie, visti = [], set()
    for f in cfg["feed"]:
        limite = ORA - timedelta(hours=f.get("ore_massime", cfg.get("ore_massime", 30)))
        per_feed = f.get("max", cfg.get("max_per_feed", 25))
        try:
            feed = feedparser.parse(scarica(f["url"]))
        except Exception as e:  # noqa: BLE001
            log(f"  ! salto {f['fonte']} ({f['url']}): {e}")
            continue
        presi = 0
        for e in feed.entries:
            if presi >= per_feed:
                break
            titolo = pulisci(e.get("title"), 200)
            link = e.get("link", "")
            quando = data_voce(e)
            if not titolo or not link or quando is None or quando < limite or quando > ORA + timedelta(hours=3):
                continue
            chiave = f["categoria"] + re.sub(r"\W+", "", titolo.lower())[:80]
            if (f["categoria"], link) in visti or chiave in visti:
                continue
            visti.update({(f["categoria"], link), chiave})
            notizie.append({
                "titolo": titolo,
                "sommario": pulisci(e.get("summary") or e.get("description"), 320),
                "link": link,
                "fonte": f["fonte"],
                "data": quando.isoformat(timespec="minutes"),
                "categoria": f["categoria"],
            })
            presi += 1
        log(f"  {f['categoria']:<9} {f['fonte']:<24} {presi:>3} notizie  ({f['url']})")
    notizie.sort(key=lambda n: n["data"], reverse=True)
    for i, n in enumerate(notizie, 1):
        n["id"] = f"n{i}"
    return notizie


# ---------------------------------------------------------------- podcast
def normalizza(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def cerca_feed(p: dict) -> tuple[str | None, str | None]:
    """Trova il feed con la iTunes Search API. Accetta solo un risultato il cui
    titolo contiene il nome e il cui autore contiene 'autore' (la ricerca di
    iTunes è molto approssimativa e altrimenti restituisce podcast sbagliati)."""
    if p.get("feedUrl"):
        return p["feedUrl"], p.get("immagine")
    termine = p.get("cerca") or f"{p['nome']} {p.get('autore', '')}".strip()
    nome, autore = normalizza(p["nome"]), normalizza(p.get("autore", ""))
    for t in dict.fromkeys([termine, p["nome"]]):
        q = urllib.parse.urlencode({"term": t, "country": "it", "media": "podcast", "limit": 15})
        dati = json.loads(scarica(f"https://itunes.apple.com/search?{q}"))
        for r in dati.get("results", []):
            if (r.get("feedUrl") and nome in normalizza(r.get("collectionName", ""))
                    and autore in normalizza(r.get("artistName", ""))):
                return r["feedUrl"], r.get("artworkUrl600") or r.get("artworkUrl100")
    return None, None


def audio_di(e) -> str | None:
    for enc in e.get("enclosures", []) + [l for l in e.get("links", []) if l.get("rel") == "enclosure"]:
        url = enc.get("href") or enc.get("url")
        tipo = (enc.get("type") or "").lower()
        if url and (tipo.startswith("audio") or re.search(r"\.(mp3|m4a|aac|ogg)(\?|$)", url, re.I)):
            return url
    return None


def audio_https(url: str) -> str | None:
    """Il sito è HTTPS: un audio http:// verrebbe bloccato. Provo a passare a https."""
    if url.startswith("https://"):
        return url
    prova = "https://" + url.split("://", 1)[1]
    try:
        req = urllib.request.Request(prova, headers={"User-Agent": UA, "Range": "bytes=0-1"})
        with urllib.request.urlopen(req, timeout=15) as r:
            if r.status in (200, 206):
                return r.geturl()
    except Exception:  # noqa: BLE001
        pass
    return None


def raccogli_podcast() -> list[dict]:
    cfg = leggi_config("podcast.json")
    risultato = []
    for p in cfg["podcast"]:
        giorni = p.get("giorni_massimi", cfg.get("giorni_massimi", 3))
        limite = ORA - timedelta(days=giorni)
        try:
            feed_url, immagine = cerca_feed(p)
            if not feed_url:
                log(f"  ! {p['nome']}: non trovato su iTunes")
                continue
            feed = feedparser.parse(scarica(feed_url))
            if (feed.feed.get("itunes_block") or "").lower() == "yes":
                log(f"  ! {p['nome']}: feed bloccato")
                continue
            scelto = None
            for e in feed.entries:
                quando = data_voce(e)
                audio = audio_di(e)
                if quando and quando >= limite and audio:
                    if scelto is None or quando > scelto[0]:
                        scelto = (quando, e, audio)
            if not scelto:
                log(f"  - {p['nome']}: nessun episodio pubblico negli ultimi {giorni} giorni")
                continue
            quando, e, audio = scelto
            audio = audio_https(audio)
            if not audio:
                log(f"  - {p['nome']}: audio solo http, salto")
                continue
            risultato.append({
                "nome": pulisci(feed.feed.get("title"), 120) or p["nome"],
                "episodio": pulisci(e.get("title"), 200),
                "descrizione": pulisci(e.get("summary") or e.get("description"), 600),
                "audio": audio,
                "link": e.get("link") or feed.feed.get("link") or audio,
                "calcio": bool(p.get("calcio")),
                "gruppo": p.get("gruppo"),
                "data": quando.isoformat(timespec="minutes"),
                "immagine": immagine or (feed.feed.get("image") or {}).get("href"),
            })
            log(f"  + {p['nome']}: {risultato[-1]['episodio'][:70]}")
        except Exception as ex:  # noqa: BLE001
            log(f"  ! {p['nome']}: errore {ex}")
    for i, p in enumerate(risultato, 1):
        p["id"] = f"p{i}"
    return risultato



# ---------------------------------------------------------------- stasera in TV
SPORT_TV = re.compile(r"calcio|serie a|serie b|champions|europa league|conference|nations league|coppa italia|"
                      r"qualificazion|amichevole|tennis|atp|formula 1|motogp|basket|volley|rugby|ciclismo|sci ", re.I)


def raccogli_tv(cfg: dict) -> dict | None:
    """Prima serata e sport della sera, letti dalla pagina della guida TV."""
    try:
        pagina = ""
        for url in cfg["url"] if isinstance(cfg["url"], list) else [cfg["url"]]:
            try:
                pagina += scarica(url, ua=UA_BROWSER).decode("utf-8", "replace")
            except Exception as e:  # noqa: BLE001
                log(f"  ! tv {url}: {e}")
        t = re.sub(r"<script.*?</script>|<style.*?</style>", "", pagina, flags=re.S | re.I)
        righe = [r.strip() for r in html.unescape(re.sub(r"<[^>]+>", "\n", t)).split("\n")]
        righe = [r for r in righe if r]
        canali = cfg["canali"]
        serata, sport, visti = [], [], set()
        canale_corrente = None
        for i, r in enumerate(righe):
            if r in canali:
                canale_corrente = r
                # blocco "prima serata": nome canale, orario, [Prima TV], [numero], titolo, descrizione
                if i + 1 < len(righe) and re.fullmatch(r"\d{1,2}[:.]\d{2}", righe[i + 1]) and r not in visti:
                    j = i + 2
                    while j < len(righe) and (righe[j] == "Prima TV" or righe[j].isdigit()):
                        j += 1
                    if j < len(righe):
                        descr = righe[j + 1] if j + 1 < len(righe) and righe[j + 1] != "[continua]" else ""
                        visti.add(r)
                        serata.append({"canale": r, "ora": righe[i + 1].replace(".", ":"), "titolo": pulisci(righe[j], 120),
                                       "descrizione": pulisci(descr, 200), "prima_tv": "Prima TV" in righe[i + 2:j]})
                continue
            m = re.fullmatch(r"(\d{2}):(\d{2}) - (.+)", r)
            if m and canale_corrente and 17 <= int(m.group(1)) <= 23 and SPORT_TV.search(m.group(3)):
                voce = {"canale": canale_corrente, "ora": f"{m.group(1)}:{m.group(2)}", "titolo": pulisci(m.group(3), 140)}
                if voce not in sport:
                    sport.append(voce)
        log(f"  tv: {len(serata)} prime serate, {len(sport)} eventi sportivi")
        return {"serata": serata, "sport": sport} if serata else None
    except Exception as e:  # noqa: BLE001
        log(f"  ! tv: {e}")
        return None



# ---------------------------------------------------------------- scheda TECH & AI
def raccogli_tech() -> dict | None:
    """Video recenti dei canali YouTube (dai feed RSS pubblici, senza chiave) e i dati fissi della scheda."""
    try:
        cfg = leggi_config("tech.json")
    except Exception as e:  # noqa: BLE001
        log(f"  ! tech: {e}")
        return None
    limite = ORA - timedelta(days=cfg.get("youtube_giorni", 10))
    video = []
    for c in cfg.get("youtube", []):
        try:
            feed = feedparser.parse(scarica(f"https://www.youtube.com/feeds/videos.xml?channel_id={c['canale']}", ua=UA_BROWSER))
            presi = 0
            for e in feed.entries:
                quando = data_voce(e)
                vid = e.get("yt_videoid") or (e.get("id", "").split(":")[-1])
                if not vid or not quando or quando < limite or "/shorts/" in e.get("link", ""):
                    continue
                video.append({"id": vid, "titolo": pulisci(e.get("title"), 160), "canale": c["nome"],
                              "descrizione": pulisci(e.get("summary") or (e.get("media_description") or ""), 220),
                              "data": quando.isoformat(timespec="minutes"), "link": f"https://www.youtube.com/watch?v={vid}",
                              "immagine": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"})
                presi += 1
            log(f"  youtube {c['nome']:<18} {presi:>2} video recenti")
        except Exception as e:  # noqa: BLE001
            log(f"  ! youtube {c['nome']}: {e}")
    video.sort(key=lambda v: v["data"], reverse=True)
    for i, v in enumerate(video, 1):
        v["vid"] = f"y{i}"
    radio = []
    for r in cfg.get("radio", []):
        r = dict(r)
        if r.get("feed"):  # niente diretta: si ascolta l'ultima puntata
            try:
                feed = feedparser.parse(scarica(r["feed"], ua=UA_BROWSER))
                for e in feed.entries:
                    audio = audio_di(e)
                    if audio and audio.startswith("https://"):
                        r["episodio"] = {"titolo": pulisci(e.get("title"), 160), "audio": audio, "link": e.get("link") or audio,
                                         "data": (data_voce(e) or ORA).isoformat(timespec="minutes")}
                        break
            except Exception as e:  # noqa: BLE001
                log(f"  ! radio {r['nome']}: {e}")
        radio.append(r)
    return {"youtube": video, "radio": radio, "libri": cfg.get("libri", []), "concetti": cfg.get("concetti", {})}


# ---------------------------------------------------------------- scheda ALTRO
def ultimo_episodio(p: dict) -> dict | None:
    """Ultima puntata pubblica di un podcast (cercato su Apple Podcasts), senza limite di età."""
    try:
        feed_url, immagine = cerca_feed(p)
        if not feed_url:
            return None
        feed = feedparser.parse(scarica(feed_url))
        migliore = None
        for e in feed.entries:
            quando, audio = data_voce(e), audio_di(e)
            if audio and (migliore is None or (quando and quando > migliore[0])):
                migliore = (quando or datetime(1970, 1, 1, tzinfo=timezone.utc), e, audio)
        if not migliore:
            return None
        quando, e, audio = migliore
        audio = audio_https(audio)
        if not audio:
            return None
        return {"nome": pulisci(feed.feed.get("title"), 120) or p["nome"], "episodio": pulisci(e.get("title"), 200),
                "descrizione": pulisci(e.get("summary") or e.get("description"), 400), "audio": audio,
                "link": e.get("link") or feed.feed.get("link") or audio, "data": quando.isoformat(timespec="minutes"),
                "immagine": immagine or (feed.feed.get("image") or {}).get("href")}
    except Exception as ex:  # noqa: BLE001
        log(f"  ! podcast {p['nome']}: {ex}")
        return None


def video_canale(canale: str, quanti: int) -> list[dict]:
    feed = feedparser.parse(scarica(f"https://www.youtube.com/feeds/videos.xml?channel_id={canale}", ua=UA_BROWSER))
    out = []
    for e in feed.entries:
        vid = e.get("yt_videoid") or e.get("id", "").split(":")[-1]
        if vid and "/shorts/" not in e.get("link", ""):
            quando = data_voce(e)
            out.append({"id": vid, "titolo": pulisci(e.get("title"), 160), "data": quando.isoformat(timespec="minutes") if quando else "",
                        "link": f"https://www.youtube.com/watch?v={vid}", "immagine": f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"})
        if len(out) >= quanti:
            break
    return out


def cerca_video(testo: str) -> list[dict]:
    """Video italiani dell'ultimo mese trovati con la ricerca di YouTube (pagina pubblica, senza chiave)."""
    q = urllib.parse.urlencode({"search_query": testo, "sp": "EgIIBA=="})  # filtro: caricati questo mese
    pagina = scarica(f"https://www.youtube.com/results?{q}", ua=UA_BROWSER).decode("utf-8", "replace")
    i = pagina.index("var ytInitialData = ") + len("var ytInitialData = ")
    dati, _ = json.JSONDecoder().raw_decode(pagina[i:])
    trovati = []

    def visita(o):
        if isinstance(o, dict):
            v = o.get("videoRenderer")
            if v and v.get("videoId"):
                vista = re.sub(r"\D", "", (v.get("viewCountText") or {}).get("simpleText", "") or "0") or "0"
                trovati.append({"id": v["videoId"], "titolo": pulisci("".join(r.get("text", "") for r in v.get("title", {}).get("runs", [])), 160),
                                "canale": pulisci("".join(r.get("text", "") for r in v.get("ownerText", {}).get("runs", [])), 80),
                                "quando": (v.get("publishedTimeText") or {}).get("simpleText", ""), "visualizzazioni": int(vista),
                                "link": f"https://www.youtube.com/watch?v={v['videoId']}", "immagine": f"https://i.ytimg.com/vi/{v['videoId']}/hqdefault.jpg"})
            for x in o.values():
                visita(x)
        elif isinstance(o, list):
            for x in o:
                visita(x)
    visita(dati)
    visti, out = set(), []
    for v in trovati:
        if v["id"] not in visti:
            visti.add(v["id"])
            v["vid"] = f"l{len(out) + 1}"
            out.append(v)
    return out[:20]


def raccogli_altro() -> dict | None:
    try:
        cfg = leggi_config("altro.json")
    except Exception as e:  # noqa: BLE001
        log(f"  ! altro: {e}")
        return None
    out = {}
    for chiave, r in cfg.items():
        if chiave.startswith("_"):
            continue
        rubrica = {}
        siti = []
        for sito in r.get("siti", []):
            sito = dict(sito)
            if sito.get("feed"):
                try:
                    voci = []
                    for e in feedparser.parse(scarica(sito["feed"], ua=UA_BROWSER)).entries:
                        quando = data_voce(e)
                        voci.append({"titolo": pulisci(e.get("title"), 200), "link": e.get("link", ""),
                                     "data": quando.isoformat(timespec="minutes") if quando else ""})
                    voci.sort(key=lambda v: v["data"], reverse=True)  # alcuni feed non sono in ordine
                    via = tuple(sito.get("escludi") or ())
                    sito["titoli"] = [v for v in voci if v["titolo"] and v["link"] and not (via and v["titolo"].startswith(via))][:4]
                except Exception as e:  # noqa: BLE001
                    log(f"  ! altro {sito['nome']}: {e}")
            siti.append(sito)
        rubrica["siti"] = siti
        rubrica["podcast"] = [{**p, "ultimo": ultimo_episodio(p)} if not p.get("solo_link") else dict(p) for p in r.get("podcast", [])]
        canali = []
        for c in r.get("youtube", []):
            try:
                canali.append({**c, "video": video_canale(c["canale"], 2)})
            except Exception as e:  # noqa: BLE001
                log(f"  ! altro youtube {c['nome']}: {e}")
                canali.append({**c, "video": []})
        rubrica["youtube"] = canali
        if r.get("youtube_cerca"):
            try:
                rubrica["video_cercati"] = cerca_video(r["youtube_cerca"])
            except Exception as e:  # noqa: BLE001
                log(f"  ! altro ricerca video: {e}")
                rubrica["video_cercati"] = []
        out[chiave] = rubrica
        log(f"  altro {chiave}: {sum(len(s_.get('titoli', [])) for s_ in siti)} titoli, "
            f"{sum(1 for p in rubrica['podcast'] if p.get('ultimo'))}/{len(rubrica['podcast'])} podcast, "
            f"{sum(len(c['video']) for c in canali)} video dai canali, {len(rubrica.get('video_cercati', []))} video cercati")
    return out


# ---------------------------------------------------------------- archivio della settimana
def aggiorna_settimana(cfg: dict, notizie: list[dict], giorno: str, uscita: Path) -> None:
    """Rassegna della domenica: conserva i titoli degli ultimi giorni in data/settimana.json.
    Il repository non contiene dati, quindi si riparte dal file già pubblicato sul sito:
    lo si scarica, si aggiunge la giornata di oggi e si ripubblica."""
    archivio = {"giorni": {}}
    sito = pagina_del_sito()
    if sito:
        try:
            archivio = json.loads(scarica(sito.rstrip("/") + "/data/settimana.json", timeout=20))
        except Exception as e:  # noqa: BLE001 - prima esecuzione o sito non raggiungibile
            log(f"  - settimana: archivio precedente non disponibile ({e}), riparto da oggi")
    giorni = archivio.get("giorni", {})
    oggi = {}
    for cat, quante in cfg.get("per_giorno", {}).items():
        oggi[cat] = [{"t": n["titolo"], "s": n["sommario"][:140], "f": n["fonte"]}
                     for n in notizie if n["categoria"] == cat][:quante]
    giorni[giorno] = oggi
    tenuti = sorted(giorni)[-cfg.get("giorni", 7):]
    archivio = {"aggiornato": ORA.isoformat(timespec="seconds"), "giorni": {g: giorni[g] for g in tenuti}}
    (uscita / "settimana.json").write_text(json.dumps(archivio, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    log(f"  settimana: {len(tenuti)} giorni in archivio ({', '.join(tenuti)})")


# ---------------------------------------------------------------- Google News (notizie locali e squadre)
def google_news(query: str, ore: int, massimo: int) -> list[dict]:
    """Notizie di Google News per una ricerca, le più recenti per prime. Titoli e fonti, senza sommario."""
    q = urllib.parse.urlencode({"q": query, "hl": "it", "gl": "IT", "ceid": "IT:it"})
    feed = feedparser.parse(scarica(f"https://news.google.com/rss/search?{q}", ua=UA_BROWSER))
    limite = ORA - timedelta(hours=ore)
    out, visti = [], set()
    for e in feed.entries:
        quando = data_voce(e)
        fonte = pulisci((e.get("source") or {}).get("title"), 80)
        titolo = pulisci(e.get("title"), 220)
        if fonte and titolo.endswith(" - " + fonte):
            titolo = titolo[: -len(fonte) - 3].strip()
        chiave = re.sub(r"\W+", "", titolo.lower())[:70]
        if not titolo or not quando or quando < limite or quando > ORA + timedelta(hours=3) or chiave in visti:
            continue
        visti.add(chiave)
        out.append({"titolo": titolo, "fonte": fonte or "Google News", "link": e.get("link", ""), "data": quando.isoformat(timespec="minutes")})
    out.sort(key=lambda n: n["data"], reverse=True)
    return out[:massimo]


# nomi d'uso più comuni di quelli ufficiali ISTAT
ALIAS = {"Reggio nell'Emilia": "Reggio Emilia", "Reggio di Calabria": "Reggio Calabria", "Monza e della Brianza": "Brianza"}


def nomi_provincia(p: dict) -> list[str]:
    """Nomi con cui cercare una provincia: capoluoghi e nome della provincia (senza la versione in altra lingua)."""
    nomi = [ALIAS.get(n, n) for n in p["capoluoghi"]]
    if p["nome"] in ALIAS:
        nomi.append(ALIAS[p["nome"]])
    nome = p["nome"].split("/")[0].strip()
    if p["nome"] not in ALIAS:
        # "Pesaro e Urbino", "Forlì-Cesena", "Massa-Carrara": si cerca ogni parte
        nomi += [x.strip() for x in re.split(r" e |-", nome) if x.strip()]
    return list(dict.fromkeys(n for n in nomi if n))


def raccogli_province(uscita: Path, podcast_locali: dict) -> int:
    """Un file per provincia in data/province/<SIGLA>.json: notizie locali degli ultimi 2 giorni e podcast locali."""
    province = leggi_config("province.json")
    cartella = uscita / "province"
    cartella.mkdir(parents=True, exist_ok=True)
    totale = 0
    for sigla, p in province.items():
        nomi = nomi_provincia(p)
        query = " OR ".join(f'"{n}"' for n in nomi)
        notizie = []
        for tentativo in range(2):
            try:
                notizie = google_news(query, 60, 40)
                break
            except Exception as e:  # noqa: BLE001
                log(f"  ! provincia {sigla}: {e}")
                time.sleep(3)
        for i, n in enumerate(notizie, 1):
            n["id"] = f"{sigla.lower()}{i}"
            n["categoria"] = "locale"
            n["sommario"] = ""
        dati = {"sigla": sigla, "nome": p["nome"].split("/")[0].strip(), "regione": p["regione"], "nomi": nomi,
                "generato": ORA.isoformat(timespec="seconds"), "notizie": notizie, "podcast": podcast_locali.get(sigla, [])}
        (cartella / f"{sigla}.json").write_text(json.dumps(dati, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        totale += len(notizie)
        time.sleep(0.4)
    log(f"  province: {len(province)} file, {totale} notizie locali")
    return totale


def raccogli_squadre(uscita: Path) -> list[dict]:
    """Notizie degli ultimi 3 giorni per ogni squadra proposta: data/squadre/<id>.json."""
    cfg = leggi_config("squadre.json")
    cartella = uscita / "squadre"
    cartella.mkdir(parents=True, exist_ok=True)
    elenco = []
    for q in cfg["squadre"]:
        try:
            notizie = google_news(q["cerca"], 72, 25)
        except Exception as e:  # noqa: BLE001
            log(f"  ! squadra {q['nome']}: {e}")
            notizie = []
        for i, n in enumerate(notizie, 1):
            n["id"] = f"{q['id']}{i}"
            n["categoria"] = q["id"]
            n["sommario"] = ""
        (cartella / f"{q['id']}.json").write_text(json.dumps({"id": q["id"], "nome": q["nome"], "notizie": notizie}, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        elenco.append({"id": q["id"], "nome": q["nome"]})
        time.sleep(0.4)
    log(f"  squadre: {len(elenco)}")
    return elenco


# ---------------------------------------------------------------- podcast locali
def pagina_del_sito() -> str | None:
    """Indirizzo pubblico del sito (per riprendere l'elenco dei podcast locali già pubblicato)."""
    import os
    return os.environ.get("SITO_PUBBLICO", "https://tg-di-famiglia.pages.dev").rstrip("/")


def contiene_parola(testo: str, parola: str) -> bool:
    return re.search(r"(?<![a-z])" + re.escape(normalizza(parola)) + r"(?![a-z])", normalizza(testo)) is not None


def raccogli_podcast_locali(uscita: Path, per_giorno: int = 22) -> dict:
    """Podcast locali per provincia. La ricerca su Apple Podcasts ha un limite di richieste, quindi ogni giorno
    si cercano solo alcune province a rotazione e si riparte dall'elenco già pubblicato sul sito
    (data/podcast_feed.json); per i podcast già noti si controlla ogni giorno l'ultima puntata."""
    province = leggi_config("province.json")
    noti = {}
    sito = pagina_del_sito()
    if sito:
        try:
            noti = json.loads(scarica(sito + "/data/podcast_feed.json", timeout=20)).get("feed", {})
        except Exception as e:  # noqa: BLE001
            log(f"  - podcast locali: elenco precedente non disponibile ({e})")
    sigle = sorted(province)
    inizio = (ORA.timetuple().tm_yday * per_giorno) % len(sigle)
    da_cercare = [sigle[(inizio + i) % len(sigle)] for i in range(min(per_giorno, len(sigle)))]
    for sigla in da_cercare:
        trovati = []
        for nome in nomi_provincia(province[sigla])[:2]:
            try:
                q = urllib.parse.urlencode({"term": nome, "country": "it", "media": "podcast", "limit": 25})
                for r in json.loads(scarica(f"https://itunes.apple.com/search?{q}")).get("results", []):
                    if r.get("feedUrl") and contiene_parola(r.get("collectionName", ""), nome) and r["feedUrl"] not in [t["feed"] for t in trovati]:
                        trovati.append({"feed": r["feedUrl"], "immagine": r.get("artworkUrl600") or r.get("artworkUrl100")})
            except Exception as e:  # noqa: BLE001
                log(f"  ! podcast locali {sigla}: {e}")
            time.sleep(3.2)
        noti[sigla] = trovati[:6]
    out, attivi = {}, 0
    limite = ORA - timedelta(days=30)
    for sigla, feeds in noti.items():
        for f in feeds:
            try:
                feed = feedparser.parse(scarica(f["feed"], timeout=15))
                scelto = None
                for e in feed.entries:
                    quando, audio = data_voce(e), audio_di(e)
                    if quando and quando >= limite and audio and (scelto is None or quando > scelto[0]):
                        scelto = (quando, e, audio)
                if not scelto:
                    continue
                quando, e, audio = scelto
                audio = audio_https(audio)
                if not audio:
                    continue
                out.setdefault(sigla, []).append({
                    "nome": pulisci(feed.feed.get("title"), 120), "episodio": pulisci(e.get("title"), 200),
                    "descrizione": pulisci(e.get("summary") or e.get("description"), 600), "audio": audio,
                    "link": e.get("link") or feed.feed.get("link") or audio, "data": quando.isoformat(timespec="minutes"),
                    "immagine": f.get("immagine") or (feed.feed.get("image") or {}).get("href"), "locale": True})
                attivi += 1
            except Exception as ex:  # noqa: BLE001
                log(f"  ! feed locale {f['feed'][:60]}: {ex}")
        if sigla in out:
            out[sigla] = sorted(out[sigla], key=lambda p: p["data"], reverse=True)[:3]
    (uscita / "podcast_feed.json").write_text(json.dumps({"aggiornato": ORA.isoformat(timespec="seconds"), "feed": noti}, ensure_ascii=False), encoding="utf-8")
    log(f"  podcast locali: cercate oggi {len(da_cercare)} province, {sum(len(v) for v in noti.values())} feed noti, {attivi} con puntate recenti")
    return out


# ---------------------------------------------------------------- principale
def main():
    uscita = Path(sys.argv[1]) if len(sys.argv) > 1 else RADICE / "data"
    uscita.mkdir(parents=True, exist_ok=True)
    varie = leggi_config("varie.json")
    log("Notizie nazionali:")
    notizie = raccogli_notizie()
    log("Podcast:")
    podcast = raccogli_podcast()
    log("Tech, altro e settimana:")
    log("Squadre:")
    squadre = raccogli_squadre(uscita)
    log("Podcast locali:")
    locali = raccogli_podcast_locali(uscita)
    log("Province:")
    raccogli_province(uscita, locali)
    dati = {
        "versione": 1,
        "generato": ORA.isoformat(timespec="seconds"),
        "giorno": ORA.astimezone(ROMA).date().isoformat(),
        "notizie": notizie,
        "podcast": podcast,
        "squadre_disponibili": squadre,
        "radio_preferite": varie.get("radio_preferite", []),
        "tv": raccogli_tv(varie["tv"]) if varie.get("tv") else None,
        "tech": raccogli_tech(),
        "altro": raccogli_altro(),
    }
    (uscita / "grezzo.json").write_text(json.dumps(dati, ensure_ascii=False, indent=1), encoding="utf-8")
    aggiorna_settimana({"giorni": 7, "per_giorno": {"generale": 25, "sport": 12}}, notizie, dati["giorno"], uscita)
    conta = {}
    for n in notizie:
        conta[n["categoria"]] = conta.get(n["categoria"], 0) + 1
    log(f"\nScritto {uscita / 'grezzo.json'}: notizie {conta}, {len(podcast)} podcast")
    if conta.get("generale", 0) < 5:
        log("ERRORE: troppe poche notizie nazionali, controlla i feed")
        sys.exit(1)


if __name__ == "__main__":
    main()
