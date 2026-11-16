"""Builds Turkish-only "latin-ext" font subsets.

The full Fontsource latin-ext files cover hundreds of glyphs (85 kB for Inter); Turkish needs only five of them on
top of the latin subset: Ğ ğ İ Ş ş (ı, ç, ö, ü are already in latin). Variable axes are kept.

Usage:  python -I scripts/subset-fonts.py
Output: src/assets/fonts/<family>-tr-wght.woff2 (referenced from src/styles/fonts.css)
Requires fontTools + brotli (pip install fonttools brotli).
"""
from pathlib import Path

from fontTools import subset

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src' / 'assets' / 'fonts'
TURKISH = [0x011E, 0x011F, 0x0130, 0x015E, 0x015F]
FAMILIES = {
    'space-grotesk': 'space-grotesk-latin-ext-wght-normal.woff2',
    'inter': 'inter-latin-ext-wght-normal.woff2',
    'jetbrains-mono': 'jetbrains-mono-latin-ext-wght-normal.woff2',
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for family, filename in FAMILIES.items():
        src = ROOT / 'node_modules' / '@fontsource-variable' / family / 'files' / filename
        dst = OUT / f'{family}-tr-wght.woff2'
        options = subset.Options()
        options.flavor = 'woff2'
        options.layout_features = ['*']
        options.notdef_outline = True
        font = subset.load_font(str(src), options)
        subsetter = subset.Subsetter(options)
        subsetter.populate(unicodes=TURKISH)
        subsetter.subset(font)
        subset.save_font(font, str(dst), options)
        print(f'{dst.name}: {src.stat().st_size} -> {dst.stat().st_size} bytes')


if __name__ == '__main__':
    main()
