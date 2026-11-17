"""Seedlings（幼儿园）的小图标：以一棵树为圆心的一圈圈同心圆，朝着我们的那四分之一切开。
从外到内：一层的房子 → 一圈儿童爬架 → 下沉的小广场（一圈台阶）→ 正中间的树。
切开的两个面上能看到剖面：房子是空心的盒子，地面往中间一级级落下去。
运行：python sketch/seedlings.py   输出在 sketch/out/"""
import os, sys, math
sys.path.insert(0, os.path.dirname(__file__))
from pen import Sheet, INK

RED, PINK = '#d9573f', '#eba999'

# 半径和高度（单位随意，只管比例）
R_FLOOR, STEPS = 2.2, [(2.2, -0.9, -0.6), (2.65, -0.6, -0.3), (3.1, -0.3, 0.0)]     # 下沉广场的地面；三级台阶 (半径, 下, 上)
R_FRAME, H_FRAME = 4.5, 1.9                                                          # 爬架
R_IN, R_OUT, H_B = 5.7, 7.7, 1.75                                                    # 房子：内圈、外圈、高

def draw(seed=21):
    s = Sheet(640, 520, seed=seed, unit=22, origin=(320, 318))
    r, P = s.r, s.iso
    D = math.radians

    def arc(rad, z, t0, t1, color=INK, width=1.6, j=0.45):
        """地面上以树为圆心的一段圆弧（轴测里是椭圆的一段），略带抖动"""
        n = max(4, int(abs(t1 - t0) / 4)); ph = r.uniform(0, 6)
        pts = []
        for i in range(n + 1):
            t = D(t0 + (t1 - t0) * i / n); k = rad * (1 + 0.006 * math.sin(3 * t + ph))
            x, y = P(k * math.cos(t), k * math.sin(t), z)
            pts.append((x + r.uniform(-j, j), y + r.uniform(-j, j)))
        s.items.append(('line', pts, color, width)); return pts
    def ring_pts(rad, z, t0, t1, n=40):
        return [P(rad * math.cos(D(t0 + (t1 - t0) * i / n)), rad * math.sin(D(t0 + (t1 - t0) * i / n)), z) for i in range(n + 1)]
    def post(rad, t, z0, z1, **kw):
        s.stroke(P(rad * math.cos(D(t)), rad * math.sin(D(t)), z0), P(rad * math.cos(D(t)), rad * math.sin(D(t)), z1), **kw)

    # 留下来的是 0°–270°；270°–360°（朝着我们的那一块）切掉了。
    # 远的一半是 45°–225°，近的两段是 0°–45° 和 225°–270°。先画远的，再画近的。
    FAR, NEAR = (45, 225), ((0, 45), (225, 270))

    # 1 房子，远的一半：看得见内墙和屋顶
    s.fill(ring_pts(R_IN, 0, *FAR) + ring_pts(R_IN, H_B, *FAR)[::-1])
    s.fill(ring_pts(R_IN, H_B, 0, 270) + ring_pts(R_OUT, H_B, 0, 270)[::-1])
    arc(R_IN, 0, *FAR); arc(R_IN, H_B, 0, 270, width=1.8); arc(R_OUT, H_B, 0, 270, width=1.8)
    for t in range(54, 225, 13): post(R_IN, t, 0, H_B, width=1.1, amp=.3, over=.3)       # 内墙上的窗棂

    # 2 地面：台阶 + 下沉广场
    for rad, z0, z1 in STEPS:
        arc(rad, z1, 0, 270, width=1.4); arc(rad, z0, *FAR, width=1.2)
    for q in range(3):                                                                    # 广场地面：浅红排线（分三个扇形画）
        s.hatch([P(0, 0, -0.9)] + ring_pts(R_FLOOR - .1, -0.9, q * 90, q * 90 + 90, n=8), angle=-12, gap=6.5, color=PINK, width=1.0, inset=2)

    # 3 爬架，远的一半
    def frame(t0, t1):
        for z in (0.65, 1.3, H_FRAME): arc(R_FRAME, z, t0, t1, width=1.2)
        for t in range(int(t0) + 4, int(t1), 11): post(R_FRAME, t, 0, H_FRAME, width=1.3, amp=.3, over=.6)
    frame(*FAR)

    # 4 树：两笔树干、几根枝，树冠是一圈红色的随手线
    base, top = P(0, 0, -0.9), P(0, 0, 3.3)
    for o in (-3, 3): s.stroke((base[0] + o, base[1]), (top[0] + o * .5, top[1]), width=2.0, amp=1.0, over=.5)
    for dx, dz in ((-1.5, 1.5), (1.6, 1.4), (-0.5, 2.1), (0.7, 2.2)):
        s.stroke(top, (top[0] + dx * 30, top[1] - dz * 30), width=1.7, amp=.9, over=.3)
    arc(0.55, -0.9, 0, 360, width=1.3)                                                    # 树根的一圈
    cx, cy = P(0, 0, 5.9); ph = [r.uniform(0, 6) for _ in range(3)]
    crown = []
    for i in range(101):
        t = 2 * math.pi * i / 90 + 0.5; k = 96 * (1 + 0.13 * math.sin(5 * t + ph[0]) + 0.08 * math.sin(9 * t + ph[1]) + 0.05 * math.sin(2 * t + ph[2]))
        crown.append((cx + k * 1.12 * math.cos(t), cy + k * 0.9 * math.sin(t)))
    s.items.append(('line', crown, RED, 2.0))
    for ox, oy, n in ((-46, 6, 14), (8, -22, 12), (22, 30, 10)):                            # 树冠里几笔小波浪
        s.items.append(('line', [(cx + ox + i * 3.4, cy + oy + 5 * math.sin(i * .75 + ox)) for i in range(n)], RED, 1.6))
    # 几个孩子
    s.person(-0.9, 1.3, -0.9, s=.85); s.person(-1.5, -0.3, -0.9, s=.85); s.person(-2.9, 2.7, 0, s=.85); s.person(-1.2, 3.6, 0, s=.85)

    # 5 爬架，近的两段
    for a, b in NEAR: frame(a, b)

    # 6 房子，近的两段：看得见外墙
    for a, b in NEAR:
        s.fill(ring_pts(R_OUT, 0, a, b, n=12) + ring_pts(R_OUT, H_B, a, b, n=12)[::-1])
        arc(R_OUT, 0, a, b, width=1.8); arc(R_OUT, H_B, a, b, width=1.8)
        for t in range(a + 8, b, 12): post(R_OUT, t, 0.45, H_B - 0.35, width=1.1, amp=.3, over=.2)

    # 7 两个剖切面：0° 那面沿着 +x，270° 那面沿着 -y
    for t in (0, 270):
        c, sn = math.cos(D(t)), math.sin(D(t))
        Q = lambda rad, z: P(rad * c, rad * sn, z)
        # 房子的剖面：一个空心的盒子，墙和屋顶用墨线排线涂实
        outer = [Q(R_IN, 0), Q(R_OUT, 0), Q(R_OUT, H_B), Q(R_IN, H_B)]
        s.fill(outer)
        w = 0.2
        for a, b, z0, z1 in ((R_IN, R_OUT, H_B - w, H_B), (R_IN, R_IN + w, 0, H_B), (R_OUT - w, R_OUT, 0, H_B)):
            s.hatch([Q(a, z0), Q(b, z0), Q(b, z1), Q(a, z1)], angle=40, gap=2.4, width=1.2, inset=.2)
        s.path(outer, closed=True, width=1.9, amp=.4, over=1)
        s.path([Q(R_IN + w, 0), Q(R_IN + w, H_B - w), Q(R_OUT - w, H_B - w), Q(R_OUT - w, 0)], width=1.3, amp=.3, over=.3)
        # 地面的剖面线：从房子脚下一路到树下，中间一级级落下去
        prof = [Q(R_OUT + 0.9, 0), Q(STEPS[2][0], 0)]
        for rad, z0, z1 in reversed(STEPS): prof += [Q(rad, z1), Q(rad, z0), Q(rad - 0.45, z0)] if rad != STEPS[0][0] else [Q(rad, z1), Q(rad, z0)]
        prof.append(Q(0, -0.9))
        s.path(prof, width=2.3, amp=.4, over=.6)
        for i in range(len(prof) - 1):                                                    # 地面线下面的短斜线：表示土
            (ax, ay), (bx, by) = prof[i], prof[i + 1]; L = math.hypot(bx - ax, by - ay)
            for k in range(1, int(L / 9)):
                px, py = ax + (bx - ax) * k * 9 / L, ay + (by - ay) * k * 9 / L
                s.stroke((px, py + 1.5), (px - 4.5, py + 8), width=1.0, amp=.1, over=.3)
        post(R_FRAME, t, 0, H_FRAME, width=1.6, amp=.3, over=.6)                              # 爬架在剖面上的那一根
    return s

if __name__ == '__main__':
    out = os.path.join(os.path.dirname(__file__), 'out'); os.makedirs(out, exist_ok=True)
    sh = draw()
    sh.svg(os.path.join(out, 'seedlings.svg')); sh.png(os.path.join(out, 'seedlings.png'))
    print('ok')
