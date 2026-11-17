#!/usr/bin/env python3
"""Rigenera il QR del sito (qr-tg-di-famiglia.png).  Uso: python tools/genera_qr.py [indirizzo]"""
import sys
from pathlib import Path

import qrcode

url = sys.argv[1] if len(sys.argv) > 1 else "https://tg-di-famiglia.pages.dev/"
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=4, box_size=20)
q.add_data(url)
q.make(fit=True)
out = Path(__file__).resolve().parent.parent / "qr-tg-di-famiglia.png"
q.make_image(fill_color="#0b2a55", back_color="white").save(out)
print("QR di", url, "->", out)
