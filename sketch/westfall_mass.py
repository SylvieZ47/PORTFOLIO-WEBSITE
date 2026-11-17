"""Westfall Hillside House 的小图标（体块版）：几个盒子一层压一层，顺着坡往上、往后退。
每个盒子的后半截埋在坡里，露出来的屋顶就是上一层的露台；红色的等高线是山坡。
不画窗，只讲体块怎么叠。
运行：python sketch/westfall_mass.py   输出在 sketch/out/"""
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))
from pen import Sheet, INK

RED, PINK = '#d9573f', '#eba999'
K, V0 = 0.55, -5.0                                         # 坡度；最下面那个盒子前角所在的等高线

def draw(seed=44):
    s = Sheet(640, 500, seed=seed, unit=25, origin=(262, 352))
    r, P = s.r, s.iso
    ground = lambda x, y: K * ((y - x) - V0)                # 坡面高度：只跟 (y - x) 有关，所以等高线在图上是横的

    def contour(v, u0, u1, color=RED):                      # 一条等高线
        ph = r.uniform(0, 6); n = int((u1 - u0) * 4); pts = []
        for i in range(n + 1):
            u = u0 + (u1 - u0) * i / n; vv = v + 0.2 * math.sin(u * .7 + ph) + 0.08 * math.sin(u * 1.9 + ph * 2)
            x, y = u - vv / 2, u + vv / 2
            px, py = P(x, y, ground(x, y)); pts.append((px + r.uniform(-.4, .4), py + r.uniform(-.4, .4)))
        s.items.append(('line', pts, color, 1.25))
    def tree(u, v, h=2.0, w=18):                            # 坡上的树
        x, y = u - v / 2, u + v / 2; z = ground(x, y)
        s.stroke(P(x, y, z), P(x, y, z + h * .5), width=1.4, amp=.5, over=.3)
        cx, cy = P(x, y, z + h * .8); ph = r.uniform(0, 6)
        k = lambda t: 1 + .09 * math.sin(9 * t + ph) + .07 * math.sin(4 * t + ph * 2) + .04 * math.sin(15 * t)
        pts = [(cx + w * k(t) * math.cos(t), cy + w * 1.15 * k(t) * math.sin(t)) for t in [2 * math.pi * i / 60 + .4 for i in range(59)]]
        s.fill(pts); s.items.append(('line', pts, INK, 1.3))

    # 1 山坡：几条等高线，长短不一，两头自然收住；先画，房子会把中间挡掉
    for i, (v, u0, u1) in enumerate([(-7.6, -2.5, 8.5), (-6.0, -4.5, 9.5), (-4.2, -5.0, 7.5), (-2.4, -5.6, 9.8), (-0.6, -4.6, 8.8),
                                     (1.4, -5.4, 9.4), (3.2, -4.0, 8.0), (5.0, -5.0, 9.0), (6.8, -3.0, 7.4), (8.4, -1.5, 6.0)]):
        contour(v, u0, u1)
    tree(-3.6, 3.4); tree(7.4, 4.4, 2.2, 20); tree(4.4, 9.2, 1.7, 15)

    # 2 体块：从下往上一个压一个，每个都往坡上退一点、左右错一点
    right = lambda f: s.hatch(f, angle=72, gap=5.4, width=1.0, inset=2.5)                  # 右侧面排线，给一点体积感
    boxes = [(3.0, -1.7, 3.2, 2.8, 1.0, -1.0),            # 最下面：车库，嵌在坡脚
             (0.0, 0.0, 5.2, 4.0, 1.45, 0.0),
             (-1.3, 1.4, 4.4, 4.0, 1.45, 1.45),
             (-1.9, 3.0, 5.4, 3.4, 1.45, 2.9)]
    for x, y, w, d, h, z in boxes: s.box(x, y, w, d, h, z=z, right=right, width=1.9)
    # 最上面一片挑出去的薄屋檐 + 两根细柱
    s.box(-2.3, 2.3, 6.2, 4.3, 0.13, z=4.9, width=1.7)
    for x, y in ((3.7, 2.5), (-2.1, 2.5)): s.stroke(P(x, y, 4.35), P(x, y, 4.9), width=1.2, amp=.2, over=.2)
    # 露台上的人
    s.person(4.4, 0.7, 1.45, s=.9); s.person(2.4, 2.1, 2.9, s=.9); s.person(4.9, -0.9, 0, s=.9)

    # 3 前面的树
    tree(6.4, -6.4, 2.1, 19); tree(-3.2, -3.6, 1.7, 15)
    return s

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), 'out'); os.makedirs(out, exist_ok=True)
    sh = draw()
    sh.svg(os.path.join(out, 'westfall-mass.svg')); sh.png(os.path.join(out, 'westfall-mass.png'))
    print('ok')
