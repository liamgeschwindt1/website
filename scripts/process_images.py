"""Crop bottom-right Gemini watermark from photos and write web-optimized JPGs.

Reads PNGs from /workspaces/website/images and /workspaces/website/touchpulse/public/images,
crops 9% off the bottom (where the Gemini "Made with..." badge sits), max-width 1920,
saves as JPG (q=82) to /workspaces/website/touchpulse/public/images/photos/.

Logos (touchpulse-logo, wordmark) are left untouched.
"""
import os
from pathlib import Path
from PIL import Image

ROOT = Path("/workspaces/website")
SRC_DIRS = [ROOT / "images", ROOT / "touchpulse/public/images"]
DEST = ROOT / "touchpulse/public/images/photos"
DEST.mkdir(parents=True, exist_ok=True)

# Files to skip (logos / brand assets — keep originals)
SKIP_NAMES = {
    "touchpulse-logo.png", "wordmark.png",
    "Copy of wordmark white v2.0 (3).png",
}

CROP_BOTTOM_FRAC = 0.09   # crop 9% off the bottom (kills Gemini badge)
MAX_WIDTH = 1920
JPG_QUALITY = 82

def slugify(name: str) -> str:
    stem = Path(name).stem.lower()
    out = []
    for ch in stem:
        if ch.isalnum():
            out.append(ch)
        elif ch in (" ", "_", "-", "."):
            out.append("-")
    s = "".join(out)
    while "--" in s:
        s = s.replace("--", "-")
    return s.strip("-") + ".jpg"

processed = []
for src_dir in SRC_DIRS:
    if not src_dir.exists():
        continue
    for path in sorted(src_dir.iterdir()):
        if not path.is_file() or path.suffix.lower() != ".png":
            continue
        if path.name in SKIP_NAMES:
            continue
        try:
            img = Image.open(path).convert("RGB")
        except Exception as e:
            print(f"SKIP {path.name}: {e}")
            continue
        w, h = img.size
        # crop bottom strip
        new_h = int(h * (1 - CROP_BOTTOM_FRAC))
        img = img.crop((0, 0, w, new_h))
        # resize down if too wide
        if img.width > MAX_WIDTH:
            ratio = MAX_WIDTH / img.width
            img = img.resize((MAX_WIDTH, int(img.height * ratio)), Image.LANCZOS)
        out_name = slugify(path.name)
        out_path = DEST / out_name
        img.save(out_path, "JPEG", quality=JPG_QUALITY, optimize=True, progressive=True)
        processed.append((path.name, out_name, out_path.stat().st_size))

print(f"Processed {len(processed)} images:")
for orig, out, size in processed:
    print(f"  {orig:50s} -> {out:40s} ({size//1024} KB)")
