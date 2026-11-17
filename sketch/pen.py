"""手绘线条小工具：用代码画"针管笔草图"。
线是一笔画成的（不来回描），略有抖动、起止略微出头；面用排线填。
同一批笔画同时输出 SVG（矢量、透明底）和 PNG 预览。"""
import math, random
from PIL import Image, ImageDraw

INK = '#262a33'
C30, S30 = math.cos(math.radians(30)), 0.5


class Sheet:
    def __init__(self, w, h, seed=1, unit=17, origin=(0, 0)):
        self.w, self.h, self.u, self.o = w, h, unit, origin
        self.items = []                      # ('fill', pts, color) | ('line', pts, color, width)
        self.r = random.Random(seed)

    # ── 轴测投影：x 向右下，y 向右上，z 向上 ──
    def iso(self, x, y, z=0):
        return (self.o[0] + (x + y) * C30 * self.u, self.o[1] + (x - y) * S30 * self.u - z * self.u)

    # ── 一笔：两点之间略带起伏的线 ──
    def stroke(self, p, q, color=INK, width=1.7, amp=0.8, over=1.4):
        r = self.r
        dx, dy = q[0] - p[0], q[1] - p[1]
        L = math.hypot(dx, dy)
        if L < 0.5: return
        ux, uy = dx / L, dy / L
        a, b = r.uniform(0, over), r.uniform(0, over)             # 起止各出头一点
        p = (p[0] - ux * a + r.uniform(-.4, .4), p[1] - uy * a + r.uniform(-.4, .4))
        q = (q[0] + ux * b + r.uniform(-.4, .4), q[1] + uy * b + r.uniform(-.4, .4))
        L += a + b
        n = max(2, int(L / 5))
        f1, f2, ph1, ph2 = L / 110, L / 38, r.uniform(0, 1), r.uniform(0, 1)
        k = amp * min(1, L / 40) * r.uniform(.6, 1.2)
        pts = []
        for i in range(n + 1):
            t = i / n
            off = k * (0.65 * math.sin(2 * math.pi * (t * f1 + ph1)) + 0.35 * math.sin(2 * math.pi * (t * f2 + ph2)))
            pts.append((p[0] + (q[0] - p[0]) * t - uy * off, p[1] + (q[1] - p[1]) * t + ux * off))
        self.items.append(('line', pts, color, width))

    def path(self, pts, closed=False, **kw):
        for i in range(len(pts) - 1 + (1 if closed else 0)):
            self.stroke(pts[i], pts[(i + 1) % len(pts)], **kw)

    def dashed(self, p, q, dash=7, gap=5, **kw):
        L = math.hypot(q[0] - p[0], q[1] - p[1]); t = 0
        while t < L:
            d = dash * self.r.uniform(.8, 1.2); e = min(L, t + d)
            self.stroke((p[0] + (q[0] - p[0]) * t / L, p[1] + (q[1] - p[1]) * t / L),
                        (p[0] + (q[0] - p[0]) * e / L, p[1] + (q[1] - p[1]) * e / L), over=0.3, amp=0.3, **kw)
            t = e + gap * self.r.uniform(.8, 1.2)

    def fill(self, pts, color='#ffffff'):
        self.items.append(('fill', list(pts), color))

    # ── 排线：一组平行的短笔画填满一个凸多边形 ──
    def hatch(self, poly, angle=35, gap=5.5, color=INK, width=1.1, inset=1.5):
        r, a = self.r, math.radians(angle)
        ca, sa = math.cos(a), math.sin(a)
        rot = [(x * ca + y * sa, -x * sa + y * ca) for x, y in poly]
        y0, y1 = min(p[1] for p in rot), max(p[1] for p in rot)
        y = y0 + gap * r.uniform(.4, .9)
        while y < y1:
            xs = []
            for i in range(len(rot)):
                (xa, ya), (xb, yb) = rot[i], rot[(i + 1) % len(rot)]
                if (ya - y) * (yb - y) < 0: xs.append(xa + (xb - xa) * (y - ya) / (yb - ya))
            if len(xs) >= 2:
                xa, xb = min(xs) + inset * r.uniform(.3, 1.6), max(xs) - inset * r.uniform(.3, 1.6)
                if xb - xa > 2:
                    self.stroke((xa * ca - y * sa, xa * sa + y * ca), (xb * ca - y * sa, xb * sa + y * ca), color=color, width=width, amp=0.45, over=0.2)
            y += gap * r.uniform(.82, 1.2)

    # ── 轴测盒子：顶面 + 两个看得见的侧面（先铺白，挡住后面的东西）──
    def box(self, x, y, w, d, h, z=0, top=None, left=None, right=None, **kw):
        P = self.iso
        T = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]
        Lf = [P(x, y, z), P(x + w, y, z), P(x + w, y, z + h), P(x, y, z + h)]               # 朝左下的面（y 小的一侧）
        Rf = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]   # 朝右下的面（x 大的一侧）
        for f in (T, Lf, Rf): self.fill(f)
        for f, fn in ((T, top), (Lf, left), (Rf, right)):
            if fn: fn(f)
        self.path(T, closed=True, **kw)
        self.path([Lf[3], Lf[0], Lf[1], Rf[1], Rf[2]], **kw)
        self.stroke(Lf[1], Lf[2], **kw)
        return T, Lf, Rf

    def person(self, x, y, z=0, s=1.0, color=INK):
        r = self.r; px, py = self.iso(x, y, z); h = 9.5 * s
        lean = r.uniform(-1.2, 1.2)
        hx, hy = px + lean, py - h - 2.6 * s
        ring = [(hx + 2.3 * s * math.cos(t), hy + 2.3 * s * math.sin(t)) for t in [i * math.pi / 5 + r.uniform(-.1, .1) for i in range(11)]]
        self.items.append(('line', ring, color, 1.3))
        self.stroke((px + lean * .7, py - h), (px, py - h * .42), color=color, width=1.4, amp=.3, over=.2)
        self.stroke((px, py - h * .42), (px - 1.9 * s, py), color=color, width=1.3, amp=.2, over=.2)
        self.stroke((px, py - h * .42), (px + 1.9 * s, py), color=color, width=1.3, amp=.2, over=.2)

    # ── 输出 ──
    def svg(self, path):
        out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" fill="none" stroke-linecap="round" stroke-linejoin="round">']
        for it in self.items:
            d = ' '.join(f'{x:.1f},{y:.1f}' for x, y in it[1])
            if it[0] == 'fill': out.append(f'<polygon points="{d}" fill="{it[2]}" stroke="none"/>')
            else: out.append(f'<polyline points="{d}" stroke="{it[2]}" stroke-width="{it[3]}"/>')
        out.append('</svg>')
        open(path, 'w', encoding='utf-8').write('\n'.join(out))

    def png(self, path, scale=2, bg=(255, 255, 255, 255)):
        k = scale * 3                                            # 先画大再缩小，线才圆润
        im = Image.new('RGBA', (self.w * k, self.h * k), bg); dr = ImageDraw.Draw(im)
        for it in self.items:
            pts = [(x * k, y * k) for x, y in it[1]]
            if it[0] == 'fill': dr.polygon(pts, fill=it[2])
            else:
                wd = max(1, round(it[3] * k)); dr.line(pts, fill=it[2], width=wd, joint='curve')
                for (x, y) in (pts[0], pts[-1]): dr.ellipse((x - wd / 2, y - wd / 2, x + wd / 2, y + wd / 2), fill=it[2])
        im.resize((self.w * scale, self.h * scale), Image.LANCZOS).save(path)
