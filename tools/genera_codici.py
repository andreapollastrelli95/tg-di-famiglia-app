#!/usr/bin/env python3
"""Crea codici Premium per gli abbonati Ko-fi.

Uso:  python tools/genera_codici.py 20
- stampa i codici IN CHIARO a schermo e li salva in codici-premium-PRIVATI.txt (file ignorato da git:
  conservalo fuori dal repository e consegna un codice a ogni nuovo abbonato);
- aggiunge le loro impronte SHA-256 a premium-codes.json (questo sì va pubblicato).
Per revocare un codice: togli la sua impronta da premium-codes.json (python tools/genera_codici.py --revoca CODICE).
"""
import hashlib
import json
import secrets
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
FILE = RADICE / "premium-codes.json"
PRIVATI = RADICE / "codici-premium-PRIVATI.txt"
ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # niente 0/O e 1/I per evitare confusioni


def impronta(codice: str) -> str:
    return hashlib.sha256(codice.strip().upper().replace(" ", "").encode()).hexdigest()


def nuovo() -> str:
    c = "".join(secrets.choice(ALFABETO) for _ in range(12))
    return f"TGF-{c[:4]}-{c[4:8]}-{c[8:]}"


def main():
    dati = json.loads(FILE.read_text(encoding="utf-8")) if FILE.exists() else {"hash": []}
    if len(sys.argv) > 2 and sys.argv[1] == "--revoca":
        h = impronta(sys.argv[2])
        dati["hash"] = [x for x in dati["hash"] if x != h]
        FILE.write_text(json.dumps(dati, ensure_ascii=False, indent=1), encoding="utf-8")
        print("Revocato (se esisteva).")
        return
    quanti = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    codici = [nuovo() for _ in range(quanti)]
    dati["hash"] = sorted(set(dati["hash"]) | {impronta(c) for c in codici})
    FILE.write_text(json.dumps(dati, ensure_ascii=False, indent=1), encoding="utf-8")
    with PRIVATI.open("a", encoding="utf-8") as f:
        f.write("\n".join(codici) + "\n")
    print("\n".join(codici))
    print(f"\n{quanti} codici creati. Impronte aggiunte a {FILE.name}; codici in chiaro in {PRIVATI.name} (NON committarlo).")


if __name__ == "__main__":
    main()
