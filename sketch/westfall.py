"""Westfall Hillside House 的小图标：一张剖面。
房子不是摆在坡上，而是一级一级嵌进坡里：每一层往后退、往上抬，下面一层的屋顶就是上面一层的露台。
被切到的墙和楼板画粗线；土是一片红色的碎笔画——这个项目里，地形是主角。
运行：python sketch/westfall.py   输出在 sketch/out/"""
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))
from pen import Sheet, INK

RED, PINK = '#d9573f', '#eba999'

def draw(seed=31):
    s = Sheet(640, 450, seed=seed)
    r = s.r
    CUT = dict(width=3.4, amp=.7, over=1.2)                    # 被剖到的：粗线

    # 三层盒子：(左, 右, 楼面, 顶)。每层比下面一层往右退、往上抬
    B = [(150, 338, 352, 292), (214, 430, 290, 230), (300, 484, 228, 168)]
    WALL, YARD = 520, 228                                      # 最上面的挡土墙；它和房子之间的小院

    # 地面线（剖到的地表）：从左下的路，沿着房子底下一级级上去，到挡土墙，再顺着坡往上
    ground = [(18, 392), (96, 384), (128, 368), (150, 368), (150, 352), (338, 352), (338, 290), (430, 290), (430, 228),
              (WALL, 228), (WALL, 118), (560, 104), (628, 62)]
    def gy(x):                                                 # 某个 x 处地面的高度
        for (ax, ay), (bx, by) in zip(ground, ground[1:]):
            if ax <= x <= bx and bx > ax: return ay + (by - ay) * (x - ax) / (bx - ax)
        return 392
    # 土：地面线以下撒一片红色的短笔画
    n = 0
    while n < 430:
        x, y = r.uniform(14, 630), r.uniform(70, 436)
        if y < gy(x) + 9: continue
        a = r.uniform(0, math.pi); L = r.uniform(5, 9)
        s.stroke((x - math.cos(a) * L / 2, y - math.sin(a) * L / 2), (x + math.cos(a) * L / 2, y + math.sin(a) * L / 2),
                 color=RED if r.random() < .55 else PINK, width=1.15, amp=.2, over=.2)
        n += 1

    # 房子里面先铺白，把土盖住
    for x0, x1, fl, top in B: s.fill([(x0, fl), (x1, fl), (x1, top), (x0, top)])
    s.fill([(430, 228), (WALL, 228), (WALL, 118), (484, 118), (484, 168), (430, 168)])

    # 露台上的细东西：栏杆、挑出去的屋檐
    def rail(x0, x1, y, posts=4):
        s.stroke((x0, y - 17), (x1, y - 17), width=1.3, amp=.3, over=1)
        for k in range(posts + 1): xx = x0 + (x1 - x0) * k / posts; s.stroke((xx, y - 17), (xx, y), width=1.0, amp=.2, over=.3)
    rail(152, 212, 292, 4); rail(216, 298, 230, 5); rail(304, 480, 168, 9)
    s.stroke((262, 168), (300, 168), width=1.8, amp=.3, over=1)                 # 顶层往外挑的檐口
    s.stroke((264, 168), (264, 230), width=1.1, amp=.3, over=.3)                 # 一根细柱

    # 一个人：头、身子、两条腿
    def figure(x, y, h=26):
        hr = h * .1
        s.items.append(('line', [(x + hr * math.cos(t), y - h * .9 + hr * math.sin(t)) for t in [i * math.pi / 5 for i in range(11)]], INK, 1.2))
        s.path([(x - 3, y - h * .46), (x - 2.6, y - h * .8), (x + 2.6, y - h * .8), (x + 3, y - h * .46)], closed=True, width=1.2, amp=.2, over=.2)
        s.stroke((x - 1.6, y - h * .46), (x - 2.4, y), width=1.2, amp=.2, over=.2); s.stroke((x + 1.6, y - h * .46), (x + 2.4, y), width=1.2, amp=.2, over=.2)
    for x, y in ((250, 352), (366, 290), (190, 292), (398, 168), (462, 228)): figure(x, y)

    # 树：一圈随手的轮廓
    def tree(x, y, h, w):
        s.stroke((x, y), (x, y - h * .45), width=1.4, amp=.6, over=.3)
        cx, cy = x, y - h * .68; ph = r.uniform(0, 6)
        k = lambda t: 1 + .09 * math.sin(9 * t + ph) + .07 * math.sin(4 * t + ph * 2) + .04 * math.sin(15 * t)
        s.items.append(('line', [(cx + w * k(t) * math.cos(t), cy + h * .36 * k(t) * math.sin(t)) for t in [2 * math.pi * i / 70 + .4 for i in range(69)]], INK, 1.3))
    tree(330, 168, 54, 9); tree(350, 168, 62, 9); tree(92, 384, 86, 30); tree(566, 102, 60, 24); tree(604, 78, 46, 18)

    # 被剖到的结构：粗线
    for x0, x1, fl, top in B: s.path([(x0, fl), (x1, fl), (x1, top), (x0, top)], closed=True, **CUT)
    for x, fl, top in ((268, 352, 292), (350, 290, 230), (410, 228, 168)): s.stroke((x, fl), (x, top), width=2.6, amp=.5, over=.5)   # 每层一道内墙
    s.path(ground[:5], **CUT)                                                    # 路和入口的小台阶
    s.path([(484, 228), (WALL, 228), (WALL, 118)], **CUT)                        # 小院和挡土墙
    s.path(ground[10:], width=2.2, amp=1.0, over=1)                              # 墙后面继续往上的坡
    return s

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), 'out'); os.makedirs(out, exist_ok=True)
    sh = draw()
    sh.svg(os.path.join(out, 'westfall.svg')); sh.png(os.path.join(out, 'westfall.png'))
    print('ok')
