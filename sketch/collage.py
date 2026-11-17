"""The Collage Community（798 艺术家社区）的小图标：立面上的一排阳台。
每个阳台的骨架一样（花架梁、柱子、栏杆、楼板），里面留给住户自己改：
一个装了可以翻转的画板，画家在上面画；一个是种植槽，长满了叶子；一个还空着，等人来。
运行：python sketch/collage.py   输出在 sketch/out/"""
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))
from pen import Sheet, INK

RED, PINK = '#d9573f', '#eba999'

def draw(seed=12):
    s = Sheet(620, 330, seed=seed)
    r = s.r
    X0, BW, TOP, FLOOR = 70, 160, 78, 252                    # 第一个阳台的左边、每个阳台的宽、梁底、楼面
    bays = [X0 + i * BW for i in range(4)]                    # 四根柱子的位置

    def curve(pts, color=INK, width=1.5, j=0.5):             # 一条顺滑的线，略带抖动
        s.items.append(('line', [(x + r.uniform(-j, j), y + r.uniform(-j, j)) for x, y in pts], color, width))

    def leaf(x, y, L, ang, w=0.19):                           # 一片大叶子：从 (x, y) 往 ang 方向长出去
        a = math.radians(ang); ux, uy = math.sin(a), -math.cos(a); nx, ny = uy, -ux
        side = lambda sg: [(x + ux * L * t + nx * sg * L * w * math.sin(math.pi * t) ** 0.8, y + uy * L * t + ny * sg * L * w * math.sin(math.pi * t) ** 0.8) for t in [i / 12 for i in range(13)]]
        A, B = side(1), side(-1)
        s.fill(A + B[::-1])
        s.hatch(A + B[::-1], angle=ang + 55, gap=5.4, color=RED, width=1.05, inset=1.5)
        curve(A, width=1.6); curve(B, width=1.6)
        s.stroke((x, y), (x + ux * L * .92, y + uy * L * .92), width=1.2, amp=.5, over=.2)

    def figure(x, h=74, arm=None, lean=0):                   # 一个人：头、身子、两条腿，可以抬一只手
        y = FLOOR; hip, sh = y - h * .46, y - h * .8
        hx, hy, hr = x + lean * 1.2, y - h * .9, h * .085
        s.fill([(x - 9, hip), (x + 9, hip), (x + 8 + lean, sh), (x - 8 + lean, sh)])
        curve([(hx + hr * math.cos(t), hy + hr * math.sin(t)) for t in [i * math.pi / 6 for i in range(13)]], width=1.4, j=.25)
        s.path([(x - 8.5, hip), (x - 7.5 + lean, sh), (x + 7.5 + lean, sh), (x + 8.5, hip)], closed=True, width=1.6, amp=.4, over=.5)
        s.stroke((x - 4.5, hip), (x - 6, y), width=1.6, amp=.4, over=.3); s.stroke((x + 4.5, hip), (x + 6, y), width=1.6, amp=.4, over=.3)
        if arm: s.stroke((x + (7.5 if arm[0] > x else -7.5) + lean, sh + 4), arm, width=1.6, amp=.5, over=.3)

    # ── 阳台里的内容（先画，后面被骨架压住）──
    # 1 画板：左边一块平的，右边一块翻开了一半
    a, b = bays[0], bays[1]
    p1 = [(a + 24, 100), (a + 70, 100), (a + 70, 236), (a + 24, 236)]
    p2 = [(a + 116, 106), (a + 144, 94), (a + 144, 244), (a + 116, 230)]
    for p in (p1, p2): s.fill(p)
    curve([(a + 31, 224), (a + 42, 198), (a + 36, 180), (a + 56, 170), (a + 46, 150), (a + 64, 134), (a + 58, 118)], color=RED, width=2.6, j=.8)
    curve([(a + 50, 228), (a + 64, 208), (a + 57, 194), (a + 65, 184)], color=RED, width=2.6, j=.8)
    for k in range(3):                                                                    # 一个星号
        t = k * math.pi / 3 + .3; s.stroke((a + 38 - 8 * math.cos(t), 122 - 8 * math.sin(t)), (a + 38 + 8 * math.cos(t), 122 + 8 * math.sin(t)), color=RED, width=2.0, amp=.2, over=.3)
    s.hatch([(a + 118, 176), (a + 142, 160), (a + 142, 240), (a + 118, 227)], angle=62, gap=3.6, color=RED, width=1.3, inset=1)
    curve([(a + 121, 158), (a + 130, 138), (a + 126, 124), (a + 140, 108)], color=RED, width=2.4, j=.6)
    for p in (p1, p2): s.path(p, closed=True, width=1.6, amp=.5, over=1.5)
    figure(a + 92, arm=(a + 117, 170), lean=1.5)
    s.stroke((a + 117, 170), (a + 122, 165), color=RED, width=2.8, amp=.1, over=.2)          # 手里的笔

    # 2 种植槽：一排大叶子从槽里长出来
    a = bays[1]
    for x, L, ang in ((a + 40, 112, -20), (a + 122, 100, 22), (a + 62, 138, -7), (a + 100, 128, 11), (a + 82, 96, 1), (a + 34, 66, -42), (a + 128, 60, 44)):
        leaf(x, 228, L, ang)
    box = [(a + 20, 226), (a + 140, 226), (a + 140, FLOOR), (a + 20, FLOOR)]
    s.fill(box); s.hatch(box, angle=90, gap=9, width=1.0, inset=3); s.path(box, closed=True, width=1.7, amp=.5, over=1.5)

    # 3 空的：还没人改，只有一个人靠着栏杆
    a = bays[2]
    for p, q in (((a + 34, 104), (a + 126, 104)), ((a + 126, 104), (a + 126, 236)), ((a + 126, 236), (a + 34, 236)), ((a + 34, 236), (a + 34, 104))):
        s.dashed(p, q, dash=6, gap=6, width=1.1)
    figure(a + 62, h=72, arm=(a + 44, 214), lean=-1)

    # ── 骨架：每个阳台都一样 ──
    L, Rr = bays[0], bays[-1]
    for x in bays:                                                                         # 柱子：两根并排的线
        for o in (-3.5, 3.5): s.stroke((x + o, TOP), (x + o, FLOOR), width=1.7, amp=.7, over=1.5)
    for y in (TOP, TOP - 9):                                                               # 梁
        s.stroke((L - 12, y), (Rr + 12, y), width=1.7, amp=.9, over=2)
    x = L - 4
    while x < Rr + 2:                                                                      # 花架的梁头：一排涂黑的小方块
        sq = [(x, TOP - 26), (x + 11, TOP - 26), (x + 11, TOP - 13), (x, TOP - 13)]
        s.hatch(sq, angle=50, gap=2.2, width=1.2, inset=.3); s.path(sq, closed=True, width=1.4, amp=.3, over=.8)
        x += 22.9
    slab = [(L - 14, FLOOR), (Rr + 14, FLOOR), (Rr + 14, FLOOR + 11), (L - 14, FLOOR + 11)]   # 楼板
    s.fill(slab); s.hatch(slab, angle=58, gap=5.5, width=1.0, inset=1); s.path(slab, closed=True, width=1.8, amp=.8, over=2)
    for a in bays[:-1]:                                                                    # 栏杆：每个阳台两边各一小段，中间敞开
        for x0, x1 in ((a + 4, a + 24), (a + BW - 24, a + BW - 4)):
            s.stroke((x0, FLOOR - 58), (x1, FLOOR - 58), width=1.7, amp=.3, over=1.5)
            for k in range(3): xx = x0 + 4 + k * 6.5; s.stroke((xx, FLOOR - 58), (xx, FLOOR), width=1.1, amp=.3, over=.5)
    # 两头用虚线带过：这排阳台还在往两边延续
    for y in (TOP, FLOOR):
        s.dashed((L - 48, y), (L - 18, y), width=1.1); s.dashed((Rr + 18, y), (Rr + 48, y), width=1.1)
    return s

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), 'out'); os.makedirs(out, exist_ok=True)
    sh = draw()
    sh.svg(os.path.join(out, 'collage.svg')); sh.png(os.path.join(out, 'collage.png'))
    print('ok')
