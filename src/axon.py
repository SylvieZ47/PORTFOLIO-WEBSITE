#!/usr/bin/env python
"""Generate abstract axonometric massing icons (black & white, hard cast shadow).
Each project = a few simple volumes eyeballed from its renders. Output:
  assets/axon/<slug>.png        sprite strip of FRAMES sun positions (morning -> evening)
Usage:  python src/axon.py            (needs numpy, scipy, Pillow)"""
import math, os, json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.spatial import ConvexHull

FRAMES = 9
SS = 3                       # supersampling
OBJ_W = 300                  # output width of the building itself (px)
CAM = np.array([1.0, -1.25, 1.05]); CAM /= np.linalg.norm(CAM)
UP = np.array([0, 0, 1.0])
RIGHT = np.cross(UP, CAM); RIGHT /= np.linalg.norm(RIGHT)
SUP = np.cross(CAM, RIGHT)

def proj(p): return np.array([p @ RIGHT, -(p @ SUP)])

# ── primitives: list of (face_vertices Nx3, group) ──
class Model:
    def __init__(self): self.faces = []; self.g = 0
    def face(self, pts, group=None):
        self.faces.append((np.array(pts, float), self.g if group is None else group)); return self
    def newg(self): self.g += 1; return self.g
    def prism(self, poly, z0, z1, smooth=False):
        """poly: CCW footprint [(x,y)...]"""
        poly = [tuple(p) for p in poly]
        if signed_area(poly) < 0: poly = poly[::-1]
        top = self.newg()
        self.face([(x, y, z1) for x, y in poly], top)
        self.face([(x, y, z0) for x, y in poly[::-1]], top)
        side = self.newg() if smooth else None
        for i in range(len(poly)):
            (ax, ay), (bx, by) = poly[i], poly[(i + 1) % len(poly)]
            self.face([(ax, ay, z0), (bx, by, z0), (bx, by, z1), (ax, ay, z1)], side if smooth else self.newg())
        return self
    def box(self, x0, y0, x1, y1, z0, z1): return self.prism([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], z0, z1)
    def cyl(self, cx, cy, r, z0, z1, n=48, r1=None, a0=0, a1=2 * math.pi):
        r1 = r if r1 is None else r1
        top = self.newg(); side = self.newg()
        ring = lambda rr, z: [(cx + rr * math.cos(a0 + (a1 - a0) * i / n), cy + rr * math.sin(a0 + (a1 - a0) * i / n), z) for i in range(n)]
        b, t = ring(r, z0), ring(r1, z1)
        self.face(t, top); self.face(b[::-1], top)
        for i in range(n):
            j = (i + 1) % n
            self.face([b[i], b[j], t[j], t[i]], side)
        return self
    def ring(self, cx, cy, ri, ro, z0, z1, a0=0, a1=2 * math.pi, n=60):
        """annulus wall from angle a0 to a1"""
        top = self.newg(); outer = self.newg(); inner = self.newg()
        A = [a0 + (a1 - a0) * i / n for i in range(n + 1)]
        P = lambda r, a, z: (cx + r * math.cos(a), cy + r * math.sin(a), z)
        for i in range(n):
            a, b = A[i], A[i + 1]
            self.face([P(ri, a, z1), P(ro, a, z1), P(ro, b, z1), P(ri, b, z1)][::-1], top)
            self.face([P(ro, a, z0), P(ro, b, z0), P(ro, b, z1), P(ro, a, z1)], outer)
            self.face([P(ri, b, z0), P(ri, a, z0), P(ri, a, z1), P(ri, b, z1)], inner)
        if a1 - a0 < 2 * math.pi - 1e-6:
            e = self.newg()
            self.face([P(ri, a0, z0), P(ro, a0, z0), P(ro, a0, z1), P(ri, a0, z1)][::-1], e)
            e = self.newg()
            self.face([P(ri, a1, z0), P(ro, a1, z0), P(ro, a1, z1), P(ri, a1, z1)], e)
        return self
    def hull(self, pts):
        pts = np.array(pts, float); h = ConvexHull(pts); planes = {}
        for s, eq in zip(h.simplices, h.equations):
            tri = pts[s]
            n = np.cross(tri[1] - tri[0], tri[2] - tri[0])
            if n @ eq[:3] < 0: tri = tri[::-1]
            key = tuple(np.round(eq, 3))
            if key not in planes: planes[key] = self.newg()
            self.face(tri, planes[key])
        return self
    def vaults(self, x0, x1, y0, y1, z, n, rise, segs=16):
        """n barrel vaults side by side along x, each running in y"""
        w = (x1 - x0) / n
        for k in range(n):
            a = x0 + k * w
            prof = [(a + w / 2 - w / 2 * math.cos(math.pi * i / segs), z + rise * math.sin(math.pi * i / segs)) for i in range(segs + 1)]
            g = self.newg(); end = self.newg()
            for i in range(segs):
                (u0, v0), (u1, v1) = prof[i], prof[i + 1]
                self.face([(u0, y0, v0), (u0, y1, v0), (u1, y1, v1), (u1, y0, v1)][::-1], g)
            self.face([(u, y0, v) for u, v in prof][::-1], end)
            self.face([(u, y1, v) for u, v in prof], end)
        return self

def signed_area(poly):
    return sum(poly[i][0] * poly[(i + 1) % len(poly)][1] - poly[(i + 1) % len(poly)][0] * poly[i][1] for i in range(len(poly))) / 2

def stadium(cx, cy, w, h, n=12):
    r = min(w, h) / 2; pts = []
    if w >= h:
        for c, a0 in ((cx + w / 2 - r, -math.pi / 2), (cx - w / 2 + r, math.pi / 2)):
            pts += [(c + r * math.cos(a0 + math.pi * i / n), cy + r * math.sin(a0 + math.pi * i / n)) for i in range(n + 1)]
    return pts

def rrect(cx, cy, w, h, r, n=6):
    pts = []
    for (sx, sy, a) in ((1, 1, 0), (-1, 1, 90), (-1, -1, 180), (1, -1, 270)):
        ox, oy = cx + sx * (w / 2 - r), cy + sy * (h / 2 - r)
        pts += [(ox + r * math.cos(math.radians(a + 90 * i / n)), oy + r * math.sin(math.radians(a + 90 * i / n))) for i in range(n + 1)]
    return pts

def hexagon(cx, cy, r, rot=0):
    return [(cx + r * math.cos(rot + math.pi / 3 * i), cy + r * math.sin(rot + math.pi / 3 * i)) for i in range(6)]

# ── projects (metres, eyeballed) ──
def M_798():
    m = Model()
    m.vaults(-18, 10, 8, 26, 0, 4, 3.2)
    m.box(-18, 8, 10, 26, 0, 0.01)
    m.cyl(0, 0, 6.2, 0, 24, r1=2.4)
    m.box(5, -7, 15, 3, 0, 13)
    return m
def M_seedlings():
    m = Model()
    m.ring(0, 0, 9, 14, 0, 4.2, math.radians(-40), math.radians(250))
    m.ring(19, 9, 3.2, 6, 0, 3.4, math.radians(60), math.radians(380))
    m.cyl(-15, 13, 3, 0, 3)
    m.cyl(16, -10, 2.4, 0, 2.6)
    return m
def M_bazaar():
    m = Model()
    m.box(-25, 9, 25, 17, 0, 18)
    m.box(-25, -17, -4, -9, 0, 12); m.box(2, -17, 25, -9, 0, 14)
    m.box(-25, -9, -17, 9, 0, 15)
    m.box(15, -9, 25, 1, 0, 26)
    m.box(-17, -6, 15, 9, 0, 4.5)
    m.box(-12, -3, 8, 6, 4.5, 6)
    return m
def M_westfall():
    m = Model()
    hill = [(-10, -14, 0), (10, -14, 0), (10, 14, 0), (-10, 14, 0), (10, 14, 16), (-10, 14, 16)]
    m.face([(-10, -14, 0), (-10, 14, 16), (-10, 14, 0)][::-1]); m.face([(10, -14, 0), (10, 14, 0), (10, 14, 16)][::-1])
    m.face([(-10, -14, 0), (10, -14, 0), (10, 14, 16), (-10, 14, 16)])
    for k, (y, z, w) in enumerate(((-12, 0, 13), (-8, 3.6, 12), (-4, 7.2, 11), (0, 10.8, 9))):
        m.box(-w / 2 - .5 * k, y, w / 2 - .5 * k, y + 7.5, z, z + 3.3)
        m.box(-w / 2 - .5 * k - .6, y - .8, w / 2 - .5 * k + .6, y + 7.5, z + 3.3, z + 3.6)
    return m
def M_ashton():
    m = Model()
    m.box(-7, -5, 7, 5, 0, 6.4)
    m.box(-10, -4, -7, 3, 0, 3.4)
    m.box(-2, -6.5, 8.5, 2, 6.4, 9.4)
    m.box(3, 0, 6, 3.5, 6.4, 11.2)
    m.box(-6.5, -6, -2, -5, 0, 2.8)
    return m
def M_beck():
    m = Model()
    m.box(-20, -6, 16, 6, 0, 10.5)
    m.box(-20, 6, -9, 22, 0, 10.5)
    m.box(16, -6, 23, 1, 0, 15)
    for x in range(-18, 14, 6): m.box(x, -7.2, x + 3.6, -6, 3.2, 3.5); m.box(x, -7.2, x + 3.6, -6, 6.6, 6.9)
    return m
def M_pku():
    m = Model()
    for (cx, cy, h) in ((-11, 8, 13), (0, 0, 16), (11, -8, 11)):
        m.prism(hexagon(cx, cy, 6, .3), 0, h)
    m.prism([(-15, 2), (13, -18), (16, -14), (-12, 6)], 0, 1.2)
    return m
def M_lantern():
    m = Model()
    m.box(-15, -6, 15, 6, -.3, .5)
    m.prism(rrect(-6.5, 0, 9, 7, 2.6), .5, 4.2, smooth=True)
    m.prism(rrect(6.5, .5, 8, 6, 2.4), .5, 3.8, smooth=True)
    for (x, y) in ((-19, -9), (19, -10), (-21, 8), (20, 9), (2, -12)):
        m.box(x - .6, y - .6, x + .6, y + .6, 0, 1.1)
    return m
def pod(m, cx, cy, z0, w, h, rot, rng):
    """one low-poly pod: a faceted, slightly irregular stone shape (The Ark's cells)"""
    pts = []
    for zf, rf, n, a0 in ((0, .62, 3, .4), (.4, 1, 5, 0), (.8, .62, 4, .3), (1, .15, 2, .9)):
        for i in range(n):
            a = rot + a0 + 2 * math.pi * i / n + rng.uniform(-.18, .18)
            r = w / 2 * rf * rng.uniform(.9, 1.08)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a), z0 + h * zf + rng.uniform(-.04, .04) * h))
    m.hull(pts)
def M_ark():
    m = Model(); rng = np.random.default_rng(11)
    pod(m, 0, 0, 0, 7.5, 10, 0, rng)           # 三颗叠起来的主塔，竖向的石块
    pod(m, 1, -.5, 9.6, 6, 7.6, .5, rng)
    pod(m, .3, .4, 16.8, 4, 5.2, 1.1, rng)
    pod(m, 11, 4.5, 0, 5, 6.4, .8, rng)        # 旁边两颗单独的
    pod(m, -9, 7, 0, 3.6, 4.6, .2, rng)
    return m

PROJECTS = {'798-artist-district': M_798, 'seedlings': M_seedlings, 'downstairs-bazaar': M_bazaar,
            'westfall-hillside-house': M_westfall, 'ashton-house-remodel': M_ashton, 'beck-corner-apartment': M_beck,
            'pku-marxism-school-building': M_pku, 'river-lantern': M_lantern, 'the-ark': M_ark}

# ── rendering ──
def sun(t):
    az = math.radians(-15 - 150 * t)          # east-southeast -> west-southwest
    el = math.radians(50 + 16 * math.sin(math.pi * t))   # 太阳高，影子短
    return np.array([math.cos(az) * math.cos(el), math.sin(az) * math.cos(el), math.sin(el)])

def normal(P):
    n = np.zeros(3)
    for i in range(len(P)):
        a, b = P[i], P[(i + 1) % len(P)]
        n += np.array([(a[1] - b[1]) * (a[2] + b[2]), (a[2] - b[2]) * (a[0] + b[0]), (a[0] - b[0]) * (a[1] + b[1])])
    l = np.linalg.norm(n); return n / l if l else n

def shadow_poly(P, L): return [proj(p - (max(p[2], 0) / L[2]) * L) for p in P]

def obj_bounds(m):
    pts = np.array([proj(p) for P, _ in m.faces for p in P]); return pts.min(0), pts.max(0)

def bounds(m):
    pts = []
    for t in np.linspace(0, 1, FRAMES):
        L = sun(t)
        for P, _ in m.faces:
            pts += [proj(p) for p in P] + shadow_poly(P, L)
    pts = np.array(pts); return pts.min(0), pts.max(0)

def render(m, L, lo, hi, OW):
    """OW: pixel width of the object itself (shadows extend the frame)"""
    olo, ohi = obj_bounds(m)
    pad = .04 * (ohi - olo).max()
    lo, hi = lo - pad, hi + pad
    s = OW * SS / (ohi[0] - olo[0])
    WW = int(round((hi[0] - lo[0]) * s)); H = int(round((hi[1] - lo[1]) * s))
    W = round(WW / SS)
    tr = lambda q: ((q[0] - lo[0]) * s, (q[1] - lo[1]) * s)
    shad = Image.new('L', (WW, H), 0); d = ImageDraw.Draw(shad)
    for P, _ in m.faces: d.polygon([tr(q) for q in shadow_poly(P, L)], fill=255)
    zb = np.full((H, WW), -1e9); col = np.zeros((H, WW)); gid = np.full((H, WW), -1)
    ys, xs = np.mgrid[0:H, 0:WW] + .5
    for fi, (P, g) in enumerate(m.faces):
        n = normal(P)
        if n @ CAM <= 1e-6: continue
        lam = max(0.0, n @ L)
        v = 78 + 177 * lam ** .75 if n[2] < .9 else 252
        Q = np.array([tr(proj(p)) for p in P]); Z = P @ CAM
        for k in range(1, len(P) - 1):
            tri = Q[[0, k, k + 1]]; tz = Z[[0, k, k + 1]]
            x0, y0 = np.floor(tri.min(0)).astype(int); x1, y1 = np.ceil(tri.max(0)).astype(int)
            x0, y0 = max(x0, 0), max(y0, 0); x1, y1 = min(x1, WW), min(y1, H)
            if x1 <= x0 or y1 <= y0: continue
            X, Y = xs[y0:y1, x0:x1], ys[y0:y1, x0:x1]
            (ax, ay), (bx, by), (cx, cy) = tri
            den = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy)
            if abs(den) < 1e-9: continue
            w0 = ((by - cy) * (X - cx) + (cx - bx) * (Y - cy)) / den
            w1 = ((cy - ay) * (X - cx) + (ax - cx) * (Y - cy)) / den
            w2 = 1 - w0 - w1
            inside = (w0 >= -1e-6) & (w1 >= -1e-6) & (w2 >= -1e-6)
            z = w0 * tz[0] + w1 * tz[1] + w2 * tz[2] + 1e-4
            zz = zb[y0:y1, x0:x1]; upd = inside & (z > zz)
            zz[upd] = z[upd]; col[y0:y1, x0:x1][upd] = v; gid[y0:y1, x0:x1][upd] = g
    solid = gid >= 0
    # edges: group change or depth jump
    e = np.zeros_like(solid)
    for dy, dx in ((0, 1), (1, 0)):
        a, b = gid, np.roll(np.roll(gid, -dy, 0), -dx, 1)
        za, zb2 = zb, np.roll(np.roll(zb, -dy, 0), -dx, 1)
        e |= (a != b) | ((np.abs(za - zb2) > 3 / s * 6) & solid)
    e = np.maximum(e, np.roll(e, 1, 0)) if SS >= 3 else e
    out = np.zeros((H, WW, 4), np.uint8)
    sa = np.array(shad.filter(ImageFilter.GaussianBlur(2.2 * SS)), float) / 255   # 影子：浅、软
    sh = sa > .02
    out[sh, 0:3] = 17; out[sh, 3] = (sa[sh] * 54).astype(np.uint8)
    out[solid, 0:3] = col[solid, None].astype(np.uint8); out[solid, 3] = 255
    out[e & solid] = (17, 17, 17, 255)
    im = Image.fromarray(out, 'RGBA').resize((W, round(H / SS)), Image.LANCZOS)
    im.info['obj'] = [(olo[0] - lo[0]) * s / SS, (olo[1] - lo[1]) * s / SS, (ohi[0] - olo[0]) * s / SS, (ohi[1] - olo[1]) * s / SS]
    return im

if __name__ == '__main__':
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.makedirs(f'{root}/assets/axon', exist_ok=True)
    meta = {}
    for slug, fn in PROJECTS.items():
        m = fn(); lo, hi = bounds(m)
        frames = [render(m, sun(t), lo, hi, OBJ_W) for t in np.linspace(0, 1, FRAMES)]
        w, h = frames[0].size
        strip = Image.new('RGBA', (w * FRAMES, h), (0, 0, 0, 0))
        for i, f in enumerate(frames): strip.paste(f, (i * w, 0))
        strip.save(f'{root}/assets/axon/{slug}.png', optimize=True)
        ox, oy, ow, oh = frames[0].info['obj']
        meta[slug] = {'w': w, 'h': h, 'frames': FRAMES, 'ox': round(ox, 1), 'oy': round(oy, 1), 'ow': round(ow, 1), 'oh': round(oh, 1)}
        print(slug, w, h)
    with open(f'{root}/assets/axon/meta.json', 'w') as f: json.dump(meta, f, indent=1)
