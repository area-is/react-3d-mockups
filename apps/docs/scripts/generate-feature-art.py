#!/usr/bin/env python3
"""
Generate the home page's four feature illustrations with OpenAI's GPT Image 2.6.

Each claim in the home page's features section (`FEATURES` in
app/(site)/page.tsx) sits beside a picture of it. These are pen drawings in
white ink on nothing, so they stand on the page's dark ground the way the
small line marks above each heading do, but with the detail of an
engraving. This script asks `gpt-image-2.6-sunburst` for each at
`quality: low` with `background: transparent` (the repo's rule for generated
images; see CONTRIBUTING.md), trims the empty margin, and writes
`public/features/pen-<name>.webp`.

    OPENAI_API_KEY=... python3 scripts/generate-feature-art.py              # only missing files
    OPENAI_API_KEY=... python3 scripts/generate-feature-art.py rendering    # just these (regenerates)
    OPENAI_API_KEY=... python3 scripts/generate-feature-art.py --all        # everything again

Raw PNGs are kept in `out/feature-art-raw/` (git-ignored), and `--finish`
re-trims them without asking for new ones.

Needs Python 3 with Pillow and requests.
"""

import base64
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import requests
from PIL import Image, ImageChops

MODEL = 'gpt-image-2.6-sunburst'
QUALITY = 'low'
ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'out' / 'feature-art-raw'
OUT = ROOT / 'public' / 'features'

# Asking for "transparent" is not enough on its own: the model reaches for
# paper, a vignette or a dark plate behind white lines unless each is ruled
# out by name. And it has to be told the strokes are white, or it draws black
# ink and the page's dark ground swallows it.
STYLE = (
    'Detailed pen-and-ink illustration drawn only in pure white ink lines: fine '
    'contour lines, careful cross-hatching and stippling for shading, like a '
    'technical engraving. Every stroke is solid white. Fully transparent '
    'background: no paper, no paper texture, no fill, no backdrop, no frame, no '
    'border, no floor, no shadow, no glow, no colour, no grey wash. No text, no '
    'logos, no lettering.'
)

SQUARE, PORTRAIT, LANDSCAPE = '1024x1024', '1024x1536', '1536x1024'

# The figure column is under 520px wide, so 1000px covers a 2x screen. The
# hatching is what costs bytes: saved straight at the model's full size the
# four came to 1.6 MB, eight times the renders they replaced.
MAX_SIDE = 1000
WEBP_QUALITY = 78
# WebP keeps alpha lossless unless told otherwise, and with the drawing folded
# into the alpha (see `finish`) that is where all the detail is.
WEBP_ALPHA_QUALITY = 60

ART = {
    'rendering': (
        SQUARE,
        'A modern smartphone seen from the back at a three-quarter angle, its large '
        'square camera plateau with three lenses and a flash in the top corner, lit by '
        'a studio softbox on a stand to one side: light rays falling across the phone, '
        'highlights along its rounded aluminium edges, and soft hatched shading where '
        'the light falls away.',
    ),
    'live-screen': (
        LANDSCAPE,
        'An open modern laptop at a three-quarter angle, its screen showing a website: '
        'a navigation bar, a large video player with a play button and a progress bar, '
        'a headline and columns of text and thumbnail cards. A mouse cursor rests on '
        'the play button. The keyboard and trackpad drawn in detail.',
    ),
    'procedural': (
        LANDSCAPE,
        'A modern city bus in side profile with the front to the right, a large blank '
        'advertising panel along its side between the wheels, windows with seats '
        'visible inside, doors, wheel arches and a lit destination sign. Faint '
        'construction lines, measurement ticks and a wireframe grid show through the '
        'body, as if the bus were being built from geometry.',
    ),
    'composable': (
        LANDSCAPE,
        'An open laptop and a smartphone composed together in one scene at slightly '
        'different angles, the phone standing in front of the laptop to one side, each '
        'showing its own app screen with simple interface panels. Thin dotted guide '
        'lines connect the two devices, like a layout diagram.',
    ),
}


def headers():
    key = os.environ.get('OPENAI_API_KEY')
    if not key:
        sys.exit('OPENAI_API_KEY is not set')
    return {'Authorization': f'Bearer {key}'}


def request(name, size, prompt):
    fields = {
        'model': MODEL,
        'prompt': f'{prompt} {STYLE}',
        'size': size,
        'quality': QUALITY,
        'background': 'transparent',
        'output_format': 'png',
    }
    for attempt in range(4):
        try:
            res = requests.post('https://api.openai.com/v1/images/generations', headers=headers(), json=fields, timeout=300)
            res.raise_for_status()
            return base64.b64decode(res.json()['data'][0]['b64_json'])
        except requests.RequestException as error:
            body = getattr(error.response, 'text', '')[:300] if getattr(error, 'response', None) is not None else ''
            print(f'  {name}: attempt {attempt + 1} failed: {error} {body}', flush=True)
            time.sleep(2 ** (attempt + 1))
    raise RuntimeError(f'{name}: gave up')


def finish(name):
    """Trim to the drawing, drop alpha noise, and write the webp the page loads."""
    image = Image.open(RAW / f'{name}.png').convert('RGBA')
    alpha = image.getchannel('A').point(lambda a: 0 if a < 8 else a)
    image.putalpha(alpha)
    box = alpha.point(lambda a: 255 if a > 24 else 0).getbbox()
    if box:
        pad = round(max(image.size) * 0.01)
        image = image.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(image.width, box[2] + pad), min(image.height, box[3] + pad)))
    image.thumbnail((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
    # White ink only: fold each pixel's brightness into its alpha and make the
    # colour pure white. On the page's near-black ground that looks the same,
    # and with a flat colour channel the alpha is the only thing to compress.
    alpha = ImageChops.multiply(image.convert('L'), image.getchannel('A'))
    white = Image.new('L', image.size, 255)
    image = Image.merge('RGBA', (white, white, white, alpha))
    OUT.mkdir(parents=True, exist_ok=True)
    image.save(OUT / f'pen-{name}.webp', 'WEBP', quality=WEBP_QUALITY, alpha_quality=WEBP_ALPHA_QUALITY, method=6)
    return image.size


def make(name):
    size, prompt = ART[name]
    started = time.time()
    RAW.mkdir(parents=True, exist_ok=True)
    (RAW / f'{name}.png').write_bytes(request(name, size, prompt))
    width, height = finish(name)
    print(f'{name}: {width}x{height} in {time.time() - started:.0f}s', flush=True)


def main(argv):
    if '--finish' in argv:
        for name in ART:
            if (RAW / f'{name}.png').exists():
                print(name, finish(name))
        return
    wanted = list(ART) if '--all' in argv else [a for a in argv if not a.startswith('--')]
    if not wanted:
        wanted = [name for name in ART if not (OUT / f'pen-{name}.webp').exists()]
    unknown = [name for name in wanted if name not in ART]
    if unknown:
        sys.exit(f'unknown art: {", ".join(unknown)}')
    # Synchronous requests (2.6 has no Batch API), four at once.
    with ThreadPoolExecutor(max_workers=4) as pool:
        list(pool.map(make, wanted))


if __name__ == '__main__':
    main(sys.argv[1:])
