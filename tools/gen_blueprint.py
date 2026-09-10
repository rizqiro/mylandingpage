#!/usr/bin/env python3
"""Static engineering-blueprint hero image (SVG), in the site palette.

Sized and weighted for the ~450px-wide hero slot: fewer blocks, larger
type, heavier linework, so it reads as a real drawing instead of grey
mush. Gear numbers are internally consistent (m=10, Z=14, alpha=20):
  pitch d = m*Z = 140,  tip da = d+2m = 160,  root df = d-2.5m = 115
"""
import math

W, H = 640, 800
OUT = "/home/user/mylandingpage/blueprint.svg"

LINE   = "rgba(226,236,255,0.94)"
THIN   = "rgba(226,236,255,0.62)"
HIDDEN = "rgba(226,236,255,0.38)"
CENTER = "rgba(56,189,248,0.55)"
DIM    = "rgba(56,189,248,0.92)"
TEXT   = "rgba(226,236,255,0.90)"
LABEL  = "rgba(226,236,255,0.55)"
PINK   = "rgba(232,121,249,0.85)"
MONO   = ("&apos;JetBrains Mono&apos;,&apos;DejaVu Sans Mono&apos;,ui-monospace,"
          "SFMono-Regular,Menlo,monospace")

o = []
def add(s): o.append(s)
def pol(cx, cy, r, a): return (cx + r*math.cos(a), cy + r*math.sin(a))
def arc(cx, cy, r, a0, a1, seg=10):
    return [pol(cx, cy, r, a0 + (a1-a0)*i/seg) for i in range(seg+1)]
def path_of(pts, close=True):
    return "M " + " L ".join("%.2f,%.2f" % p for p in pts) + (" Z" if close else "")

def gear_path(cx, cy, Z, rt, rr, root_f=0.26, flank_f=0.26, tip_f=0.22):
    th = 2*math.pi/Z
    pts = []
    for i in range(Z):
        a = i*th - math.pi/2 - th*(root_f/2)
        pts += arc(cx, cy, rr, a, a + th*root_f, 3)
        a += th*root_f
        a_t = a + th*flank_f
        pts.append(pol(cx, cy, rt, a_t))
        pts += arc(cx, cy, rt, a_t, a_t + th*tip_f, 3)
        a_t += th*tip_f
        pts.append(pol(cx, cy, rr, a_t + th*flank_f))
    return path_of(pts)

def bore_keyway(cx, cy, r, kw, kd):
    dy = -math.sqrt(r*r - kw*kw)
    a_r, a_l = math.atan2(dy, kw), math.atan2(dy, -kw)
    if a_l < a_r: a_l += 2*math.pi
    d = path_of(arc(cx, cy, r, a_r, a_l, 64), close=False)
    return d + " L %.2f,%.2f L %.2f,%.2f Z" % (cx-kw, cy+dy-kd, cx+kw, cy+dy-kd)

def txt(x, y, s, size=14.5, fill=TEXT, anchor="start", weight="400", ls="0.4"):
    return ('<text x="%.1f" y="%.1f" font-family="%s" font-size="%s" fill="%s" '
            'text-anchor="%s" font-weight="%s" letter-spacing="%s">%s</text>'
            % (x, y, MONO, size, fill, anchor, weight, ls, s))

def dim_h(x0, x1, y, label, ext=None, size=14, off=9):
    s = ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.3" '
         'marker-start="url(#arrS)" marker-end="url(#arrE)"/>' % (x0, y, x1, y, DIM))
    if ext is not None:
        for x in (x0, x1):
            s += ('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" '
                  'stroke-width="0.9" opacity="0.55"/>' % (x, ext, x, y+8, DIM))
    return s + txt((x0+x1)/2, y-off, label, size, DIM, "middle")

def block(x, y, w, title, rows, row_h=32, title_h=34, label_w=104, size=14):
    total = title_h + row_h*len(rows)
    s = ['<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" stroke="%s" '
         'stroke-width="1.4"/>' % (x, y, w, total, THIN),
         '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.4"/>'
         % (x, y+title_h, x+w, y+title_h, THIN),
         txt(x+12, y+title_h-11, title, 14.5, TEXT, weight="600", ls="1.6")]
    for i, (k, v) in enumerate(rows):
        ry = y + title_h + row_h*i
        if i:
            s.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" '
                     'stroke-width="0.8" opacity="0.45"/>' % (x, ry, x+w, ry, THIN))
        s.append(txt(x+12, ry+row_h-11, k, size, LABEL, ls="0.8"))
        if v is not None:
            s.append('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" '
                     'stroke-width="0.8" opacity="0.45"/>' % (x+label_w, ry, x+label_w, ry+row_h, THIN))
            s.append(txt(x+label_w+12, ry+row_h-11, v, size, TEXT, ls="0.6"))
    return "".join(s)

# ------------------------------------------------------------------ defs
add('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d">' % (W, H, W, H))
add('<defs>'
    '<linearGradient id="sheet" x1="0" y1="0" x2="1" y2="1">'
    '<stop offset="0" stop-color="#0a1a31"/><stop offset="0.55" stop-color="#112a4c"/>'
    '<stop offset="1" stop-color="#0a1830"/></linearGradient>'
    '<radialGradient id="vign" cx="0.5" cy="0.42" r="0.82">'
    '<stop offset="0.48" stop-color="#000" stop-opacity="0"/>'
    '<stop offset="1" stop-color="#000" stop-opacity="0.40"/></radialGradient>'
    '<pattern id="grid" width="26" height="26" patternUnits="userSpaceOnUse">'
    '<path d="M26 0H0V26" fill="none" stroke="rgba(129,140,248,0.11)" stroke-width="0.9"/></pattern>'
    '<pattern id="gridBold" width="104" height="104" patternUnits="userSpaceOnUse">'
    '<path d="M104 0H0V104" fill="none" stroke="rgba(129,140,248,0.17)" stroke-width="1.1"/></pattern>'
    '<pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">'
    '<line x1="0" y1="0" x2="0" y2="10" stroke="rgba(226,236,255,0.34)" stroke-width="1.1"/></pattern>'
    '<marker id="arrE" markerWidth="12" markerHeight="9" refX="11" refY="4.5" orient="auto">'
    '<path d="M0,0.8 L12,4.5 L0,8.2 Z" fill="%s"/></marker>'
    '<marker id="arrS" markerWidth="12" markerHeight="9" refX="1" refY="4.5" orient="auto">'
    '<path d="M12,0.8 L0,4.5 L12,8.2 Z" fill="%s"/></marker>'
    '<marker id="arrDown" markerWidth="13" markerHeight="13" refX="6.5" refY="12" orient="0">'
    '<path d="M2,0 L11,0 L6.5,13 Z" fill="%s"/></marker>'
    '</defs>' % (DIM, DIM, LINE))

# ------------------------------------------------------------ background
add('<rect width="%d" height="%d" fill="url(#sheet)"/>' % (W, H))
add('<rect width="%d" height="%d" fill="url(#grid)"/>' % (W, H))
add('<rect width="%d" height="%d" fill="url(#gridBold)"/>' % (W, H))
add('<g fill="none" stroke="rgba(56,189,248,0.07)" stroke-width="1.5">'
    '<circle cx="546" cy="610" r="124"/><circle cx="546" cy="610" r="84"/>'
    '<circle cx="546" cy="610" r="44"/><circle cx="70" cy="120" r="96"/>'
    '<circle cx="70" cy="120" r="60"/></g>')

# ----------------------------------------------------------------- frame
add('<rect x="14" y="14" width="%d" height="%d" fill="none" stroke="%s" stroke-width="1" opacity="0.4"/>'
    % (W-28, H-28, THIN))
add('<rect x="32" y="32" width="%d" height="%d" fill="none" stroke="%s" stroke-width="2"/>' % (W-64, H-64, LINE))
for i, lab in enumerate("123"):
    x, xt = 32 + 576*(i+0.5)/3, 32 + 576*(i+1)/3
    if i < 2:
        add('<line x1="%.1f" y1="14" x2="%.1f" y2="32" stroke="%s" stroke-width="1" opacity="0.45"/>' % (xt, xt, THIN))
        add('<line x1="%.1f" y1="768" x2="%.1f" y2="786" stroke="%s" stroke-width="1" opacity="0.45"/>' % (xt, xt, THIN))
    add(txt(x, 27, lab, 11, LABEL, "middle", ls="1"))
    add(txt(x, 781, lab, 11, LABEL, "middle", ls="1"))
for i, lab in enumerate("ABC"):
    y, yt = 32 + 736*(i+0.5)/3, 32 + 736*(i+1)/3
    if i < 2:
        add('<line x1="14" y1="%.1f" x2="32" y2="%.1f" stroke="%s" stroke-width="1" opacity="0.45"/>' % (yt, yt, THIN))
        add('<line x1="608" y1="%.1f" x2="626" y2="%.1f" stroke="%s" stroke-width="1" opacity="0.45"/>' % (yt, yt, THIN))
    add(txt(23, y+4, lab, 11, LABEL, "middle", ls="1"))
    add(txt(617, y+4, lab, 11, LABEL, "middle", ls="1"))

# ----------------------------------------------------------- sheet header
add(txt(52, 66, "TECHNICAL DRAWING", 13.5, LABEL, weight="600", ls="3"))
add('<line x1="52" y1="76" x2="330" y2="76" stroke="%s" stroke-width="1.1" opacity="0.5"/>' % THIN)
add(txt(592, 66, "MEC-001", 13.5, DIM, "end", ls="1.6"))

# ------------------------------------------------------------- front view
CX, CY = 214.0, 282.0
PPM = 140.0/80.0
RT, RP, RR, RB = 80*PPM, 70*PPM, 57.5*PPM, 20*PPM
KW, KD = 11.0, 10.0
Z = 14
add('<g stroke="%s" stroke-width="1.1" stroke-dasharray="28 8 6 8">'
    '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>'
    '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/></g>'
    % (CENTER, CX-RT-26, CY, CX+RT+26, CY, CX, CY-RT-26, CX, CY+RT+26))
add('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="%s" stroke-width="1.1" stroke-dasharray="15 7 5 7"/>'
    % (CX, CY, RP, CENTER))
add('<circle cx="%.1f" cy="%.1f" r="%.1f" fill="none" stroke="%s" stroke-width="1"/>' % (CX, CY, RR, THIN))
add('<path d="%s" fill="none" stroke="%s" stroke-width="2.5" stroke-linejoin="round"/>'
    % (gear_path(CX, CY, Z, RT, RR), LINE))
add('<path d="%s" fill="none" stroke="%s" stroke-width="2.4" stroke-linejoin="round"/>'
    % (bore_keyway(CX, CY, RB, KW, KD), LINE))
for sgn in (-1, 1):
    x_out, x_in = CX + sgn*(RT+28), CX + sgn*(RT+10)
    add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="3"/>'
        % (x_out, CY, x_in, CY, LINE))
    add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="2.4" '
        'marker-end="url(#arrDown)"/>' % (x_out+sgn*2, CY, x_out+sgn*2, CY+22, LINE))
    add(txt(x_out+sgn*2, CY-12, "A", 16, LINE, "middle", weight="700"))
lx, ly = pol(CX, CY, RP, math.radians(145))
add('<path d="M %.1f,%.1f L %.1f,%.1f L %.1f,%.1f" fill="none" stroke="%s" stroke-width="1.1"/>'
    % (lx, ly, 58, 456, 112, 456, DIM))
add('<circle cx="%.1f" cy="%.1f" r="2.8" fill="%s"/>' % (lx, ly, DIM))
add(txt(58, 448, "PITCH &#8960;140", 14, DIM))

# ----------------------------------------------------------- section A-A
SY0 = 520.0
SY1 = SY0 + 60*PPM
CH = 9.0
x_tip_l, x_tip_r = CX-RT, CX+RT
x_root_l, x_root_r = CX-RR, CX+RR
x_bore_l, x_bore_r = CX-RB, CX+RB
add('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="url(#hatch)"/>'
    % (x_root_l, SY0, x_bore_l-x_root_l, SY1-SY0))
add('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="url(#hatch)"/>'
    % (x_bore_r, SY0, x_root_r-x_bore_r, SY1-SY0))
for sgn in (-1, 1):
    xt, xb = CX + sgn*RT, CX + sgn*RB
    add('<path d="%s" fill="none" stroke="%s" stroke-width="2.1" stroke-linejoin="round"/>'
        % (path_of([(xt, SY0+CH), (xt+sgn*CH, SY0), (xb, SY0), (xb, SY1),
                    (xt+sgn*CH, SY1), (xt, SY1-CH)]), LINE))
add('<g stroke="%s" stroke-width="1"><line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>'
    '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/></g>'
    % (THIN, x_root_l, SY0, x_root_l, SY1, x_root_r, SY0, x_root_r, SY1))
add('<g stroke="%s" stroke-width="1.2" stroke-dasharray="10 6">'
    '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/>'
    '<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f"/></g>'
    % (HIDDEN, CX-KW, SY0, CX-KW, SY1, CX+KW, SY0, CX+KW, SY1))
add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.1" stroke-dasharray="28 8 6 8"/>'
    % (CX, SY0-30, CX, SY1+30, CENTER))
add(dim_h(x_tip_l, x_tip_r, SY0-34, "&#8960;160", ext=SY0-6))
add(dim_h(x_bore_l, x_bore_r, SY1+34, "&#8960;40 H7", ext=SY1+6))
add(txt(x_tip_r, SY1+62, "TEETH NOT SECTIONED", 10.5, LABEL, "end", ls="0.8"))
add(txt(CX, SY1+82, "SECTION A&#8211;A", 16.5, TEXT, "middle", weight="700", ls="2.2"))
add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.4"/>'
    % (CX-76, SY1+91, CX+76, SY1+91, THIN))

# ---------------------------------------------------------- right column
RX, RW = 396.0, 196.0
add(block(RX, 100, RW, "GEAR DATA", [
    ("MODULE", "10"),
    ("TEETH Z", "14"),
    ("ANGLE &#945;", "20&#176;"),
    ("PITCH &#8960;", "140"),
    ("TIP &#8960;", "160"),
    ("FACE", "60"),
], label_w=104))
add(block(RX, 344, RW, "NOTES", [
    ("1", "DIMS IN mm"),
    ("2", "TOL. &#177;0.1"),
    ("3", "HARDEN 45 HRC"),
], label_w=32))
add(block(RX, 492, RW, "FINISH", [
    ("SURFACE", "Ra 3.2"),
    ("GEN. TOL.", "2768&#8211;m"),
], label_w=92))

# ---------------------------------------------------------- title block
TX, TY, TW, TH = 396.0, 606.0, 196.0, 140.0
add('<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="none" stroke="%s" stroke-width="1.8"/>'
    % (TX, TY, TW, TH, LINE))
for dy in (44, 92):
    add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.1"/>'
        % (TX, TY+dy, TX+TW, TY+dy, THIN))
add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.1"/>'
    % (TX+98, TY, TX+98, TY+44, THIN))
add('<line x1="%.1f" y1="%.1f" x2="%.1f" y2="%.1f" stroke="%s" stroke-width="1.1"/>'
    % (TX+106, TY+92, TX+106, TY+TH, THIN))
add('<g fill="none" stroke="%s" stroke-width="1.4">'
    '<circle cx="%.1f" cy="%.1f" r="12"/><circle cx="%.1f" cy="%.1f" r="6"/>'
    '<path d="M %.1f,%.1f L %.1f,%.1f L %.1f,%.1f L %.1f,%.1f Z"/></g>'
    % (TEXT, TX+30, TY+23, TX+30, TY+23,
       TX+56, TY+11, TX+84, TY+17, TX+84, TY+30, TX+56, TY+36))
add(txt(TX+108, TY+29, "SCALE 1:2", 13, TEXT, "start", ls="0.4"))
add(txt(TX+12, TY+74, "SPUR GEAR", 18, "#ffffff", "start", weight="700", ls="0.2"))
add(txt(TX+TW-12, TY+74, "m10 Z14", 13, DIM, "end", ls="0.4"))
add(txt(TX+12, TY+116, "MATERIAL", 11, LABEL, "start", ls="1"))
add(txt(TX+12, TY+134, "EN8 STEEL", 13.5, TEXT, "start"))
add(txt(TX+116, TY+116, "DRAWN", 11, LABEL, "start", ls="1"))
add(txt(TX+116, TY+134, "A. SAMAD", 13, TEXT, "start"))

add('<rect width="%d" height="%d" fill="url(#vign)"/>' % (W, H))
add('</svg>')
open(OUT, "w").write("\n".join(o))
print("wrote", OUT, len("\n".join(o)), "bytes")
