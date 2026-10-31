# Asset provenance

Original images and vectors exported by the official Figma MCP from user-supplied file T3mb62CfaKKBEad1KGr5Qy. Asset filenames preserve the supplied export names. Reference screenshots are kept separately in docs/figma/reference and are never used as UI assets. No generated replacement artwork is used. The four PNG originals are reused by the Figma across NFT cards and hero placements.

Responsive delivery variants are checked in under `responsive/`. They are resized
from these originals and encoded as WebP at quality 90; source PNGs are unchanged.
The manifest records source SHA-256, dimensions, byte counts and encoding mode.
Optional regeneration: `python3 scripts/optimize-figma-images.py` with Pillow/WebP.
Pillow is an authoring dependency only; deployment/build uses the committed files.
