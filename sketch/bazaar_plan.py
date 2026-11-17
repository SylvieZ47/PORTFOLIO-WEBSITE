"""Downstairs Bazaar 的小图标（平面版）：照手绘草图。
一栋楼的轮廓里，几个切了角的中庭是"空"（虚线）；它们一路排出去，
跨出楼的那个一半虚一半实，最外面那个成了独立的实线体块。箭头从四周往里汇聚。
运行：python sketch/bazaar_plan.py   输出在 sketch/out/"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from pen import Sheet, INK

RED = '#d9573f'

def core(x, y, w, h, cut=(), c=20):
    """切角的方形。cut 里写要切掉的角：'tl' 'tr' 'br' 'bl'"""
    p = []
    p += [(x, y + c), (x + c, y)] if 'tl' in cut else [(x, y)]
    p += [(x + w - c, y), (x + w, y + c)] if 'tr' in cut else [(x + w, y)]
    p += [(x + w, y + h - c), (x + w - c, y + h)] if 'br' in cut else [(x + w, y + h)]
    p += [(x + c, y + h), (x, y + h - c)] if 'bl' in cut else [(x, y + h)]
    return p

def draw(seed=6):
    s = Sheet(640, 360, seed=seed)

    def arrow(x, y, dx, dy, L=30, w=7, head=13):
        """粗箭头：轮廓 + 密排线涂黑。(x, y) 是箭头尖，(dx, dy) 是方向"""
        nx, ny = -dy, dx
        P = lambda a, b: (x - dx * a + nx * b, y - dy * a + ny * b)
        shaft = [P(L, w / 2), P(head, w / 2), P(head, -w / 2), P(L, -w / 2)]
        tip = [P(head, head * .62), P(0, 0), P(head, -head * .62)]
        import math
        ang = math.degrees(math.atan2(ny, nx))
        for poly in (shaft, tip): s.hatch(poly, angle=ang, gap=1.5, color=INK, width=1.3, inset=0.2)
        s.path(shaft[:1] + shaft[1:3] + shaft[3:], width=1.5, amp=.3, over=.6)
        s.path(tip, closed=True, width=1.5, amp=.3, over=.8)

    # 楼的轮廓
    B = (44, 66, 398, 292)
    s.path([(B[0], B[1]), (B[2], B[1]), (B[2], B[3]), (B[0], B[3])], closed=True, width=1.9, amp=1.1, over=3)

    # 中庭：红色排线；在楼里的是虚线（空），出了楼的是实线
    c1 = core(92, 138, 84, 84, ('tl',))
    c2 = core(226, 142, 76, 78, ('tr', 'bl'), c=17)
    c3 = core(352, 136, 92, 84, ('tl',))
    c4 = core(506, 134, 84, 86, ('tr',), c=24)
    for c in (c1, c2, c3, c4): s.hatch(c, angle=-10, gap=6.2, color=RED, width=1.15, inset=3)
    for c in (c1, c2):
        for i in range(len(c)): s.dashed(c[i], c[(i + 1) % len(c)], dash=7, gap=5, width=1.5)
    # 跨出楼的那个：楼里的一半虚线，楼外的一半实线
    x = B[2]
    for a, b in ((c3[4], c3[0]), (c3[0], c3[1]), (c3[1], (x, c3[1][1])), ((x, c3[4][1]), c3[4])): s.dashed(a, b, dash=7, gap=5, width=1.5)
    s.path([(x, c3[1][1]), c3[2], c3[3], (x, c3[3][1])], width=1.9, amp=.7, over=2)
    s.path(c4, closed=True, width=1.9, amp=.7, over=2)

    # 汇聚的箭头
    arrow(82, 180, 1, 0, L=54)                                       # 从左进楼
    arrow(264, 132, 0.35, 0.94); arrow(264, 230, 0, -1)        # 楼里，上下夹着第二个
    arrow(548, 122, 0.1, 0.995, L=36); arrow(548, 232, 0, -1, L=36)    # 楼外，上下
    arrow(600, 178, -1, 0)                                     # 从右
    return s

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), 'out'); os.makedirs(out, exist_ok=True)
    sh = draw()
    sh.svg(os.path.join(out, 'bazaar-plan.svg')); sh.png(os.path.join(out, 'bazaar-plan.png'))
    print('ok')
