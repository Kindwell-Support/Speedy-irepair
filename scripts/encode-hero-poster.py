#!/usr/bin/env python3
"""Encode public/hero/phone-poster.png -> .webp + .avif (Pillow >= 11 has AVIF). Run after render-hero-poster.mjs."""
from pathlib import Path
from PIL import Image

src = Path(__file__).resolve().parent.parent / "public/hero/phone-poster.png"
im = Image.open(src).convert("RGBA")
im.save(src.with_suffix(".webp"), "WEBP", quality=80, method=6)
try:
    im.save(src.with_suffix(".avif"), "AVIF", quality=55, speed=4)
except Exception as e:  # pragma: no cover
    print("AVIF encode unavailable:", e)
# PNG fallback (browsers without AVIF/WebP only): 256-colour palette keeps it ~20 KB.
im.quantize(256, method=Image.Quantize.FASTOCTREE).save(src, optimize=True)
for f in sorted(src.parent.glob("phone-poster.*")):
    print(f.name, f.stat().st_size // 1024, "KB")
