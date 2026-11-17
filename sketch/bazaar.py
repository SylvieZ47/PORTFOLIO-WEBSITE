"""Downstairs Bazaar 的小图标：一个中庭"岛"。
它不是实心的盒子，而是一个空的框架：一圈圈回廊围着中间的空，红色的景观楼梯绕着它往上爬，
人在楼梯和回廊上隔着中庭互相看见；两边的长楼只是背景。
运行：python sketch/bazaar.py   输出在 sketch/out/"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from pen import Sheet, INK

RED = '#d9573f'

def draw(seed=4):
    s = Sheet(580, 450, seed=seed, unit=21, origin=(178, 262))
    P = s.iso
    lerp = lambda a, b, t: (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)

    # 背后的长楼（办公/居住）：轮廓 + 几道窗，两头不画完
    def windows(face):
        a, b = face[0], face[1]
        for i in range(1, 12):
            if i in (5, 6): continue
            q = lerp(a, b, i / 12)
            for z in (18, 52): s.stroke((q[0], q[1] - z), (q[0], q[1] - z - 16), width=1.0, amp=.2, over=.3)
    s.box(-3.5, 7.6, 13, 1.7, 4.0, left=windows, width=1.5)

    # 前面的长楼：只在地上留虚线轮廓
    fp = [P(-3.5, -4.4), P(9.5, -4.4), P(9.5, -2.7), P(-3.5, -2.7)]
    for i in range(4): s.dashed(fp[i], fp[(i + 1) % 4], width=1.1)

    # 中庭的地面：红色疏排线
    g = [P(0, 0), P(6, 0), P(6, 6), P(0, 6)]
    s.hatch(g, angle=-8, gap=8, color='#eba999', width=1.0)
    s.path(g, closed=True, width=1.4)

    # 被吸引过来的人流：两条红色虚线，从两头指向中庭
    def arrow(pts):
        for a, b in zip(pts, pts[1:]): s.dashed(a, b, dash=5, gap=5, color=RED, width=1.3)
        (ax, ay), (bx, by) = pts[-2], pts[-1]; L = ((bx - ax) ** 2 + (by - ay) ** 2) ** .5; ux, uy = (bx - ax) / L, (by - ay) / L
        for sgn in (1, -1): s.stroke((bx, by), (bx - ux * 8 - uy * 4.5 * sgn, by - uy * 8 + ux * 4.5 * sgn), color=RED, width=1.3, amp=.1, over=.1)
    arrow([P(-4.2, 2.4), P(-2.4, 3.4), P(-0.5, 3.0)])
    arrow([P(10.6, 4.2), P(8.6, 2.6), P(6.6, 3.0)])

    back = lambda z0, z1: s.stroke(P(0, 6, z0), P(0, 6, z1), width=1.6, amp=.3)     # 最里面那根柱子
    def ring(z):                                                                     # 一圈回廊：四条板，从远到近
        for x, y, w, d in ((0, 5, 6, 1), (0, 1, 1, 4), (5, 1, 1, 4), (0, 0, 6, 1)):
            s.box(x, y, w, d, 0.16, z=z, width=1.5)
    def stair(a0, a1, b1, b0, n=8):                                                  # 一跑楼梯：红色踏步线
        s.fill([a0, a1, b1, b0])
        for i in range(n + 1): s.stroke(lerp(a0, a1, i / n), lerp(b0, b1, i / n), color=RED, width=1.5, amp=.15, over=.1)
        s.stroke(a0, a1, width=1.5, amp=.3); s.stroke(b0, b1, width=1.5, amp=.3)

    back(0, 2)
    for x, y in ((1.5, 2.2), (4.5, 3.4)): s.person(x, y, 0)
    # 第一跑：在中庭里面，从地面爬到二层的回廊
    stair(P(2.6, 0.9, 0), P(2.6, 5.0, 2.16), P(3.6, 5.0, 2.16), P(3.6, 0.9, 0))
    s.person(3.1, 2.2, 0.7); s.person(3.1, 3.8, 1.5)
    ring(2)
    for x, y in ((0.5, 3.2), (3.0, 5.5), (5.5, 2.2)): s.person(x, y, 2.16)
    back(2.16, 4)
    # 第二跑：贴着右侧，从二层爬到三层
    stair(P(6, 0.4, 2.16), P(6, 4.8, 4.16), P(7, 4.8, 4.16), P(7, 0.4, 2.16))
    s.person(6.5, 1.9, 2.85); s.person(6.5, 3.5, 3.6)
    ring(4)
    for x, y in ((2.2, 5.5), (0.5, 1.6), (4.4, 0.5)): s.person(x, y, 4.16)
    # 三根看得见的柱子，从地面到顶
    for x, y in ((0, 0), (6, 0), (6, 6)): s.stroke(P(x, y, 0), P(x, y, 4.16), width=1.7, amp=.35)
    # 地面上正在走过来的人
    for x, y in ((-2.6, 2.4), (-1.3, 3.9), (8.2, 3.4), (9.4, 4.6)): s.person(x, y, 0)
    return s

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), 'out'); os.makedirs(out, exist_ok=True)
    sh = draw()
    sh.svg(os.path.join(out, 'bazaar.svg')); sh.png(os.path.join(out, 'bazaar.png'))
    print('ok')
