#!/usr/bin/env python3
"""Crea i codici di sblocco di TG di Famiglia Completo, per tipo.

Uso:  python tools/genera_codici.py 3M 10     10 codici da 3 mesi (contributo di 5 €)
      python tools/genera_codici.py 1M 5      5 codici mensili (1,99 €/mese)
      python tools/genera_codici.py --revoca TGF-3M-ABCD-EFGH

- stampa i codici IN CHIARO e li salva in codici-sblocco-PRIVATI.txt (ignorato da git: tienilo fuori dal
  repository e consegna un codice a ogni persona dopo il pagamento su Ko-fi);
- aggiunge le impronte SHA-256 a codici-sblocco.json (questo va pubblicato: fai commit e push).
Il codice contiene il tipo: 3M = 3 mesi dal giorno di attivazione; 1M = 1 mese + 5 giorni di tolleranza
(a ogni rinnovo mensile si manda un codice nuovo). Ogni codice si può usare una volta per telefono.
"""
import hashlib
import json
import secrets
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
FILE = RADICE / "codici-sblocco.json"
PRIVATI = RADICE / "codici-sblocco-PRIVATI.txt"
ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # niente 0/O e 1/I per evitare confusioni
TIPI = ("3M", "1M")


def normalizza(codice: str) -> str:
    return codice.strip().upper().replace(" ", "")


def impronta(codice: str) -> str:
    return hashlib.sha256(normalizza(codice).encode()).hexdigest()


def nuovo(tipo: str) -> str:
    c = "".join(secrets.choice(ALFABETO) for _ in range(8))
    return f"TGF-{tipo}-{c[:4]}-{c[4:]}"


def main():
    dati = json.loads(FILE.read_text(encoding="utf-8")) if FILE.exists() else {"hash": []}
    if len(sys.argv) > 2 and sys.argv[1] == "--revoca":
        h = impronta(sys.argv[2])
        dati["hash"] = [x for x in dati["hash"] if x != h]
        FILE.write_text(json.dumps(dati, ensure_ascii=False, indent=1), encoding="utf-8")
        print("Revocato (se esisteva).")
        return
    if len(sys.argv) < 2 or sys.argv[1].upper() not in TIPI:
        sys.exit("Uso: python tools/genera_codici.py 3M|1M [quanti]   oppure   --revoca CODICE")
    tipo = sys.argv[1].upper()
    quanti = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    codici = [nuovo(tipo) for _ in range(quanti)]
    dati["hash"] = sorted(set(dati["hash"]) | {impronta(c) for c in codici})
    FILE.write_text(json.dumps(dati, ensure_ascii=False, indent=1), encoding="utf-8")
    with PRIVATI.open("a", encoding="utf-8") as f:
        f.write("\n".join(codici) + "\n")
    print("\n".join(codici))
    print(f"\n{quanti} codici {tipo} creati. Impronte in {FILE.name} (da pubblicare); codici in chiaro in {PRIVATI.name} (NON committarlo).")


if __name__ == "__main__":
    main()
