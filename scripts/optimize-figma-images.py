"""Generate checked-in delivery variants; originals remain untouched.

Optional authoring dependency: Pillow with WebP support. Not required at build time.
Run from any directory: python3 scripts/optimize-figma-images.py
"""
from hashlib import sha256
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parent.parent / 'public' / 'figma'
out = root / 'responsive'
out.mkdir(exist_ok=True)
manifest = {'widths': [320, 640, 960, 1254], 'quality': 90, 'assets': []}
for name in ['8f387', '83794', '9add2', 'b7cfc']:
    source = root / f'{name}.png'
    image = Image.open(source).convert('RGB')
    variants = []
    for width in manifest['widths']:
        target = out / f'{name}-{width}.webp'
        resized = image if width == image.width else image.resize(
            (width, round(image.height * width / image.width)), Image.Resampling.LANCZOS)
        resized.save(target, 'WEBP', quality=90, method=6)
        assert Image.open(target).size == resized.size
        variants.append({'file': target.name, 'width': width, 'bytes': target.stat().st_size,
                         'lossless': False})
    manifest['assets'].append({'source': source.name, 'sourceBytes': source.stat().st_size,
                              'sourceSha256': sha256(source.read_bytes()).hexdigest(),
                              'variants': variants})
(out / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest, indent=2))
