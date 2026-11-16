"""Extract the profile photo embedded in the curated CV PDF.

Usage: python -I scripts/extract-photo.py <cv.pdf> <out.png>
Only the first image of page 1 is extracted (the CV portrait).
"""
import sys

import pypdf


def main() -> None:
    src, out = sys.argv[1], sys.argv[2]
    page = pypdf.PdfReader(src).pages[0]
    images = list(page.images)
    if not images:
        raise SystemExit("no image found on page 1")
    images[0].image.save(out)
    print(f"saved {out} {images[0].image.size}")


if __name__ == "__main__":
    main()
