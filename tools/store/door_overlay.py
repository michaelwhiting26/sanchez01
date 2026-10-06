"""Draws the door scrollwork (door_pattern.py) over the reference crop, to check the drawing against the photo. Needs Pillow; not part of the site build.

    python3 tools/store/door_overlay.py <crop 940x2920 png> <out png>
"""
import sys
from PIL import Image, ImageDraw
from door_pattern import lines, BAND_Y, GRID_Y, PICKET_X, PXC

crop, out = sys.argv[1], sys.argv[2]
photo = Image.open(crop).convert("RGB")
drawn = Image.new("RGB", photo.size, (238, 232, 220))
for im, colour in ((photo, (255, 40, 40)), (drawn, (20, 28, 25))):
    d = ImageDraw.Draw(im)
    w = 5 if im is photo else 22
    for bar in lines():
        for (x0, y0, k0), (x1, y1, _) in zip(bar, bar[1:]):
            d.line([(x0, y0), (x1, y1)], fill=colour, width=max(2, round(w * k0)))
    if im is drawn:
        for y in BAND_Y + GRID_Y:
            d.line([(70, y), (880, y)], fill=colour, width=22)
        for x in PICKET_X:
            d.line([(x, BAND_Y[0]), (x, BAND_Y[1])], fill=colour, width=22)
            d.line([(x, GRID_Y[0]), (x, 2845)], fill=colour, width=22)
        d.line([(PXC, 65), (PXC, 2845)], fill=colour, width=22)
        d.rectangle([70, 65, 880, 2845], outline=colour, width=28)
sheet = Image.new("RGB", (photo.width * 2 + 30, photo.height), "white")
sheet.paste(photo, (0, 0))
sheet.paste(drawn, (photo.width + 30, 0))
sheet.save(out)
