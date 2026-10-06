"""The scrollwork of the front door, read off the owner's reference photo (6 Oct 2026). Plain Python, no Blender, so the same numbers can be
drawn over the photo to check them (tools/store/door_overlay.py) and swept into iron bars (iron_door.py).

Units are "crop pixels": the left leaf's glazed panel cropped from the photo at (235, 410)-(470, 1140) and enlarged four times (940 x 2920),
x to the right, y downwards. Only the left half of the panel is written out; the right half is its mirror about the centre bar (x = PXC).
Each stroke is one forged bar: the points it passes through, then whether it thins to a scroll tip at its start and at its end.
"""

PXC = 478.0                          # the centre bar
BAND_Y = (440, 560)                  # the ladder band under the head
GRID_Y = (2475, 2600, 2715)          # the riveted grid at the foot
PICKET_X = (215, 345, 610, 740)      # uprights shared by the band and the grid (the centre bar is the fifth)

STROKES = [
    # ---- head (above the ladder band)
    # the sweep from the top rail that turns back into an oval loop
    ([(355, 100), (440, 140), (462, 205), (452, 290), (410, 350), (350, 372), (300, 350), (262, 305), (262, 262), (290, 234), (325, 238), (345, 268)], False, True),
    # the big circle on the hinge side, curling in at its top
    ([(310, 378), (265, 410), (215, 422), (150, 400), (108, 345), (112, 290), (150, 262), (195, 258), (222, 285), (220, 318), (195, 330)], False, True),
    # the upper curl that links the two
    ([(305, 190), (270, 160), (225, 152), (180, 168), (160, 205), (170, 250), (205, 272), (240, 262), (250, 232), (232, 208), (215, 212)], False, True),

    # ---- lyre (between the ladder band and the waist)
    # outer diagonal: down from the band into the second scroll on the hinge side
    ([(268, 572), (222, 630), (200, 690), (215, 745), (240, 800), (246, 850), (232, 900), (195, 932), (150, 935), (115, 905), (108, 870), (125, 845), (160, 840), (185, 865)], False, True),
    # inner diagonal: down from the band into the U-loop and its curl beside the centre bar
    ([(412, 572), (350, 620), (300, 690), (278, 760), (288, 820), (320, 870), (370, 895), (420, 888), (448, 860), (440, 815), (410, 790), (380, 792), (368, 812), (380, 826)], False, True),
    # the long S: first scroll on the hinge side, over the top, down beside the centre bar, back across and up into the third scroll
    ([(185, 775), (160, 805), (125, 790), (108, 755), (125, 722), (160, 708), (210, 706), (290, 716), (350, 740), (410, 775), (455, 828), (466, 925), (450, 1025),
      (410, 1090), (350, 1138), (285, 1155), (215, 1148), (160, 1120), (120, 1085), (108, 1040), (135, 985), (180, 955), (228, 952), (256, 975), (255, 1010), (228, 1030), (205, 1012)], True, True),
    # the fourth scroll, over the top of the lens, then the long straight bar down to the waist and its curl
    ([(205, 1222), (198, 1200), (222, 1188), (240, 1215), (225, 1250), (180, 1270), (135, 1255), (108, 1210), (118, 1160), (160, 1105), (240, 1075), (310, 1095), (350, 1140),
      (380, 1200), (386, 1300), (366, 1400), (300, 1560), (240, 1650), (205, 1710), (190, 1750), (205, 1790), (240, 1800), (262, 1775), (258, 1740), (235, 1728)], True, True),

    # ---- heart (below the waist)
    # the small scroll beside the centre bar, over the arch and round the big circle on the hinge side
    ([(410, 1530), (390, 1550), (400, 1580), (435, 1586), (460, 1556), (465, 1510), (430, 1472), (370, 1470), (320, 1500), (280, 1550), (250, 1600), (190, 1602), (135, 1636),
      (110, 1700), (122, 1760), (162, 1794), (210, 1800)], True, False),
    # the right side of the arch, down to the centre bar
    ([(250, 1600), (320, 1615), (390, 1670), (440, 1740), (465, 1805), (470, 1900)], False, False),
    # the big C below it, curling in
    ([(150, 1790), (112, 1870), (120, 1965), (170, 2016), (240, 2036), (300, 2010), (330, 1960), (326, 1915), (290, 1890), (250, 1895), (230, 1920), (242, 1942), (266, 1944)], False, True),
    # the pair of scrolls beside the centre bar, joined by one long C
    ([(402, 2090), (366, 2096), (362, 2126), (400, 2146), (450, 2120), (466, 2070), (440, 2016), (390, 2000), (330, 2010), (280, 2040), (246, 2100), (240, 2165), (260, 2226),
      (300, 2280), (340, 2320), (390, 2332), (440, 2300), (460, 2250), (440, 2206), (400, 2196), (370, 2216), (372, 2246), (400, 2256)], True, True),
    # the tail from the hinge side that crosses it and ends in the bottom scroll
    ([(105, 2150), (190, 2150), (240, 2170), (290, 2215), (330, 2270), (340, 2320), (325, 2380), (280, 2425), (220, 2445), (160, 2430), (120, 2390), (110, 2345), (140, 2305),
      (190, 2300), (215, 2325), (205, 2360), (175, 2360)], False, True),
]


def catmull(pts, per=5):
    """A smooth line through the control points."""
    if len(pts) < 3:
        return list(pts)
    p = [pts[0]] + list(pts) + [pts[-1]]
    out = []
    for i in range(1, len(p) - 2):
        a, b, c, d = p[i - 1], p[i], p[i + 1], p[i + 2]
        for k in range(per):
            t = k / per
            out.append(tuple(0.5 * ((2 * b[j]) + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t * t
                                    + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t ** 3) for j in (0, 1)))
    out.append(pts[-1])
    return out


def lines(tip=0.62, reach=0.22):
    """Every bar as [(x, y, thickness 0..1)], both halves of the panel. A forged scroll thins towards its tip: `tip` is how thin, `reach` how far back."""
    out = []
    for pts, thin_start, thin_end in STROKES:
        line = catmull(pts)
        n = len(line) - 1
        bar = []
        for i, (x, y) in enumerate(line):
            t = i / n
            k = 1.0
            if thin_start and t < reach:
                k = min(k, tip + (1 - tip) * (t / reach))
            if thin_end and t > 1 - reach:
                k = min(k, tip + (1 - tip) * ((1 - t) / reach))
            bar.append((x, y, k))
        out.append(bar)
        out.append([(2 * PXC - x, y, k) for x, y, k in bar])
    return out
