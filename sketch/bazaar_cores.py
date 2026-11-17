"""Downstairs Bazaar 的小图标（中庭核心版）：照"中庭单元"分析图。
每个中庭是一个高高的、只有柱子的空框架，平面是切了角的方形；
地面是红的，红色的通道从中间穿过去，小箭头从两头往里指。
运行：python sketch/bazaar_cores.py   输出在 sketch/out/"""
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))
from pen import Sheet, INK

RED, PINK = '#d9573f', '#eba999'

def draw(seed=9):
    s = Sheet(560, 410, seed=seed, unit=20, origin=(132, 214))
    P = s.iso
    lerp = lambda a, b, t: tuple(a[i] + (b[i] - a[i]) * t for i in range(len(a)))

    def arrow(x, y, dx, dy, L=1.25):
        """地面上的小黑箭头：(x, y) 是箭头尖，(dx, dy) 是地面上的方向"""
        tip, tail = P(x, y), P(x - dx * L, y - dy * L)
        ux, uy = tip[0] - tail[0], tip[1] - tail[1]; n = math.hypot(ux, uy); ux, uy = ux / n, uy / n
        Q = lambda a, b: (tip[0] - ux * a - uy * b, tip[1] - uy * a + ux * b)
        head = [Q(9, 5), Q(0, 0), Q(9, -5)]
        s.hatch(head, angle=math.degrees(math.atan2(ux, -uy)), gap=1.4, color=INK, width=1.2, inset=0.1)
        s.path(head, closed=True, width=1.4, amp=.2, over=.5)
        s.stroke(tail, Q(8, 0), width=2.2, amp=.3, over=.2)

    def strip(a, b, w):
        """一条红色通道：a→b 是中线（地面坐标），w 是宽度。边是红虚线，里面是浅红排线"""
        dx, dy = b[0] - a[0], b[1] - a[1]; n = math.hypot(dx, dy); nx, ny = -dy / n * w / 2, dx / n * w / 2
        q = [P(a[0] + nx, a[1] + ny), P(b[0] + nx, b[1] + ny), P(b[0] - nx, b[1] - ny), P(a[0] - nx, a[1] - ny)]
        s.hatch(q, angle=-12, gap=6.5, color=PINK, width=1.0, inset=2)
        s.dashed(q[0], q[1], dash=6, gap=4.5, color=RED, width=1.2); s.dashed(q[3], q[2], dash=6, gap=4.5, color=RED, width=1.2)

    def core(x0, y0, w, d, h, cut, c=1.1, mids=()):
        """一个中庭：切角的平面 + 一圈柱子 + 顶上一圈梁，四面都是空的"""
        f = []
        f += [(0, c), (c, 0)] if 'a' in cut else [(0, 0)]
        f += [(w - c, 0), (w, c)] if 'b' in cut else [(w, 0)]
        f += [(w, d - c), (w - c, d)] if 'c' in cut else [(w, d)]
        f += [(c, d), (0, d - c)] if 'd' in cut else [(0, d)]
        f = [(x0 + a, y0 + b) for a, b in f]
        g = [P(a, b) for a, b in f]
        s.hatch(g, angle=-12, gap=5.2, color=RED, width=1.1, inset=2.5)             # 地面：红
        s.path(g, closed=True, width=1.3, amp=.4)
        cols = list(f)
        for i in mids: cols.append(lerp(f[i], f[(i + 1) % len(f)], 0.5))
        for a, b in sorted(cols, key=lambda p: p[1] - p[0], reverse=True):            # 柱子：两根并排的细线，从远到近
            p0, p1 = P(a, b, 0), P(a, b, h)
            for o in (-1.5, 1.5): s.stroke((p0[0] + o, p0[1]), (p1[0] + o, p1[1]), width=1.5, amp=.5, over=1.2)
        for z in (h, h - 0.22):                                                       # 顶上一圈
            s.path([P(a, b, z) for a, b in f], closed=True, width=1.5, amp=.4)
        return f

    yc = 1.9                                                # 通道沿着 x 方向，从三个中庭中间穿过去
    strip((-2.6, yc), (15.4, yc), 1.3)
    strip((1.6, -2.2), (1.6, 0.2), 1.1); strip((6.9, 3.6), (6.9, 6.0), 1.1); strip((12.0, -2.2), (12.0, 0.2), 1.1)
    core(10.2, 0.1, 3.5, 3.6, 5.2, 'b', mids=(0, 3))
    core(5.2, 0.2, 3.3, 3.5, 3.9, 'ac', c=1.0, mids=(1, 4))
    core(0.0, 0.0, 3.4, 3.8, 5.8, 'd', c=1.3, mids=(0, 1))
    arrow(-1.0, yc, 1, 0); arrow(13.9, yc, -1, 0)
    arrow(1.6, -0.6, 0, 1); arrow(6.9, 4.4, 0, -1); arrow(12.0, -0.6, 0, 1)
    return s

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), 'out'); os.makedirs(out, exist_ok=True)
    sh = draw()
    sh.svg(os.path.join(out, 'bazaar-cores.svg')); sh.png(os.path.join(out, 'bazaar-cores.png'))
    print('ok')
