"""
Simple image generator for final post using Pillow.
Creates `Outputs/final_post.png` with prediction, arrow, and short explanation.
"""
from __future__ import annotations

from pathlib import Path
import textwrap

OUT = Path("Outputs")
OUT.mkdir(parents=True, exist_ok=True)


def create_final_post_image(final_post: dict, filename: str | None = None) -> str:
    try:
        from PIL import Image, ImageDraw, ImageFont
    except Exception:
        # Pillow not installed; skip image generation
        return ""
    if filename is None:
        filename = "final_post.png"

    path = OUT / filename

    w, h = 1200, 630
    bg = (18, 18, 18)
    im = Image.new("RGB", (w, h), color=bg)
    draw = ImageDraw.Draw(im)

    # fonts (use default if unavailable)
    try:
        title_font = ImageFont.truetype("arial.ttf", 48)
        small_font = ImageFont.truetype("arial.ttf", 22)
    except Exception:
        title_font = ImageFont.load_default()
        small_font = ImageFont.load_default()

    # Title
    title = f"BTC → {final_post.get('prediction', '')}"
    draw.text((40, 30), title, font=title_font, fill=(255, 255, 255))

    # Price
    price = f"Price: {final_post.get('price', 0)}"
    draw.text((40, 100), price, font=small_font, fill=(200, 200, 200))

    # Explanation box
    explanation = final_post.get('explanation', '')
    wrapped = textwrap.fill(explanation, width=60)
    draw.text((40, 160), wrapped, font=small_font, fill=(230, 230, 230))

    # Reasons bullets
    reasons = final_post.get('reasons', [])[:5]
    y = 300
    for r in reasons:
        draw.text((60, y), u"• " + r, font=small_font, fill=(180, 180, 180))
        y += 34

    # Arrow indicator
    pred = final_post.get('prediction', '').upper()
    arrow_color = (0, 200, 0) if 'LONG' in pred else (200, 0, 0)
    # simple triangle
    if 'LONG' in pred:
        draw.polygon([(1000, 200), (1120, 340), (880, 340)], fill=arrow_color)
    else:
        draw.polygon([(1000, 420), (1120, 280), (880, 280)], fill=arrow_color)

    im.save(path)
    return str(path)
