#!/usr/bin/env python3
"""Crea l'elenco dei comuni italiani per l'app (autocompletamento) e l'elenco delle province
per la raccolta delle notizie locali, partendo dal file ufficiale ISTAT.

Uso:  python tools/genera_comuni.py [file_istat.csv]
Senza argomenti scarica il file da istat.it.
Scrive app/comuni.json  ->  [["Nome comune", "SIGLA"], ...]
       config/province.json -> {"SIGLA": {"nome": ..., "regione": ..., "capoluoghi": [...]}}
"""
import csv
import io
import json
import sys
import urllib.request
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
URL = "https://www.istat.it/storage/codici-unita-amministrative/Elenco-comuni-italiani.csv"


def leggi() -> list[list[str]]:
    if len(sys.argv) > 1:
        raw = Path(sys.argv[1]).read_bytes()
    else:
        with urllib.request.urlopen(urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as r:
            raw = r.read()
    try:
        testo = raw.decode("utf-8-sig")
    except UnicodeDecodeError:
        testo = raw.decode("cp1252")
    return list(csv.reader(io.StringIO(testo), delimiter=";"))


def main():
    righe = leggi()[1:]
    comuni, province = [], {}
    for r in righe:
        if len(r) < 15 or not r[6]:
            continue
        nome, regione, sovra, capoluogo, sigla = r[6].strip(), r[10].strip(), r[11].strip(), r[13].strip(), r[14].strip()
        comuni.append([nome, sigla])
        p = province.setdefault(sigla, {"nome": sovra, "regione": regione, "capoluoghi": []})
        if capoluogo == "1":
            p["capoluoghi"].append(nome)
    comuni.sort(key=lambda c: c[0].lower())
    (RADICE / "app" / "comuni.json").write_text(json.dumps(comuni, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    (RADICE / "config" / "province.json").write_text(json.dumps(dict(sorted(province.items())), ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(comuni)} comuni, {len(province)} province")


if __name__ == "__main__":
    main()
