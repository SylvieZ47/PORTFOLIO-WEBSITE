"""Master-style ink tracing of Siqi's own project images (exp branches only).

Detects straight edges in a project image and redraws them as steady ink lines:
one straight stroke per edge, a small overshoot at both ends, heavier weight for
long/high-contrast edges, plus restrained 45° hatching in the darkest areas.
Output: transparent PNG at the same size as the source (so it can sit exactly
over the photo as a tracing).
"""
import sys, math, json, os
import numpy as np, cv2
from PIL import Image, ImageDraw

INK = (22, 22, 22)

def trace(src, out, W=1000, min_len=.028, hatch=True, seed=3, curves=False):
    rng = np.random.default_rng(seed)
    im = Image.open(src).convert('RGB')
    w0, h0 = im.size
    s = W / w0
    im = im.resize((W, round(h0 * s)), Image.LANCZOS)
    a = np.asarray(im)
    g = cv2.cvtColor(a, cv2.COLOR_RGB2GRAY)
    g = cv2.bilateralFilter(g, 9, 40, 9)
    H = g.shape[0]
    lsd = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD)
    lines = lsd.detect(g)[0]
    lines = [] if lines is None else lines.reshape(-1, 4)
    # 每条线的对比度（法线方向两侧亮度差）
    gf = g.astype(np.float32)
    def contrast(x0, y0, x1, y1):
        n = np.array([y0 - y1, x1 - x0]); L = np.hypot(*n) or 1; n = n / L * 3
        ts = np.linspace(.15, .85, 7)
        xs = x0 + (x1 - x0) * ts; ys = y0 + (y1 - y0) * ts
        def smp(dx, dy):
            xx = np.clip((xs + dx).astype(int), 0, W - 1); yy = np.clip((ys + dy).astype(int), 0, H - 1)
            return gf[yy, xx]
        return float(np.abs(smp(*n) - smp(*-n)).mean())
    # 共线合并：同角度、同法向距离、端点间隙小的碎线并成一笔
    raw = []
    for x0, y0, x1, y1 in lines:
        L = math.hypot(x1 - x0, y1 - y0)
        if L < 8: continue
        th = math.atan2(y1 - y0, x1 - x0) % math.pi
        raw.append([th, x0, y0, x1, y1, L])
    def merge(items, gap):
        items.sort(key=lambda r: r[0])
        out = []
        used = [False] * len(items)
        for i, a in enumerate(items):
            if used[i]: continue
            th = a[0]; ux, uy = math.cos(th), math.sin(th); nx, ny = -uy, ux
            rho = a[1] * nx + a[2] * ny
            ts = [a[1] * ux + a[2] * uy, a[3] * ux + a[4] * uy]
            t0, t1 = min(ts), max(ts)
            grp = [a]; used[i] = True
            changed = True
            while changed:
                changed = False
                for j in range(len(items)):
                    if used[j]: continue
                    b = items[j]
                    dth = abs(b[0] - th); dth = min(dth, math.pi - dth)
                    if dth > math.radians(1.8): continue
                    r0 = b[1] * nx + b[2] * ny; r1 = b[3] * nx + b[4] * ny
                    if abs(r0 - rho) > 2 or abs(r1 - rho) > 2: continue
                    q = [b[1] * ux + b[2] * uy, b[3] * ux + b[4] * uy]
                    if min(q) > t1 + gap or max(q) < t0 - gap: continue
                    t0, t1 = min(t0, min(q)), max(t1, max(q)); used[j] = True; grp.append(b); changed = True
            out.append([th, rho * nx + t0 * ux, rho * ny + t0 * uy, rho * nx + t1 * ux, rho * ny + t1 * uy, t1 - t0])
        return out
    merged = merge(raw, .018 * W)
    segs = []
    for th, x0, y0, x1, y1, L in merged:
        if L < min_len * W: continue
        c = contrast(x0, y0, x1, y1)
        if c < 16: continue
        segs.append((x0, y0, x1, y1, L, c))
    # 同方向、紧挨着的一排短平行线（百叶、木纹、栏杆）只留一部分，避免满屏碎线
    segs.sort(key=lambda r: -r[4] * min(1, r[5] / 50))
    keep = []
    for sg in segs:
        x0, y0, x1, y1, L, c = sg
        th = math.atan2(y1 - y0, x1 - x0) % math.pi
        mx, my = (x0 + x1) / 2, (y0 + y1) / 2
        crowd = 0
        for k in keep:
            kt = math.atan2(k[3] - k[1], k[2] - k[0]) % math.pi
            dth = abs(kt - th); dth = min(dth, math.pi - dth)
            if dth < math.radians(4) and math.hypot((k[0] + k[2]) / 2 - mx, (k[1] + k[3]) / 2 - my) < max(L, k[4]) * .6 and k[4] > L * .6:
                crowd += 1
        if crowd < 3: keep.append(sg)
    # 孤立的短线（周围没有别的线）去掉
    def near(a, b, r):
        pa = [(a[0], a[1]), (a[2], a[3]), ((a[0] + a[2]) / 2, (a[1] + a[3]) / 2)]
        pb = [(b[0], b[1]), (b[2], b[3]), ((b[0] + b[2]) / 2, (b[1] + b[3]) / 2)]
        return any(math.hypot(p[0] - q[0], p[1] - q[1]) < r for p in pa for q in pb)
    segs = [a for a in keep if a[4] > .09 * W or sum(near(a, b, .035 * W) for b in keep if b is not a) >= 2]
    SS = 3
    cv = Image.new('L', (W * SS, H * SS), 0)
    d = ImageDraw.Draw(cv)
    Lmax = max([sg[4] for sg in segs] or [1])
    for x0, y0, x1, y1, L, c in segs:
        ux, uy = (x1 - x0) / L, (y1 - y0) / L
        o0 = 3 + rng.random() * 6; o1 = 3 + rng.random() * 6   # 交点出头
        X0, Y0 = x0 - ux * o0, y0 - uy * o0
        X1, Y1 = x1 + ux * o1, y1 + uy * o1
        wgt = 1.1 + 1.6 * min(1, (L / Lmax) ** .5 * min(1, c / 60))
        d.line([(X0 * SS, Y0 * SS), (X1 * SS, Y1 * SS)], fill=255, width=max(1, round(wgt * SS)))
    if curves:
        # 曲面项目：长的、顺的轮廓线，平滑后一笔画出
        gb2 = cv2.GaussianBlur(g, (0, 0), 2.2)
        ed = cv2.Canny(gb2, 40, 110)
        ed = cv2.dilate(ed, np.ones((2, 2), np.uint8))
        cs, _ = cv2.findContours(ed, cv2.RETR_LIST, cv2.CHAIN_APPROX_NONE)
        for c in cs:
            L = cv2.arcLength(c, False) / 2   # 膨胀后的轮廓是来回两条
            if L < .11 * W: continue
            pts = c[:, 0, :].astype(np.float32)
            # 只取一半（单程），再平滑
            pts = pts[: max(2, len(pts) // 2)]
            k = 9
            if len(pts) > 2 * k:
                ker = np.ones(k) / k
                pts = np.stack([np.convolve(pts[:, i], ker, mode='valid') for i in (0, 1)], 1)
            pts = cv2.approxPolyDP(np.ascontiguousarray(pts, dtype=np.float32).reshape(-1, 1, 2), 1.2, False)[:, 0, :]
            d.line([(float(x) * SS, float(y) * SS) for x, y in pts], fill=235, width=max(1, round(1.3 * SS)), joint='curve')
    if hatch:
        # 最暗的大块区域里，45° 平行排线（克制）
        # 只在大块、平整（低纹理）的暗面里排线：树和草不排
        gb = cv2.GaussianBlur(gf, (0, 0), 5)
        var = cv2.GaussianBlur((gf - gb) ** 2, (0, 0), 7)
        dark = (gb < np.percentile(g, 14)) & (var < np.percentile(var, 45))
        dark = cv2.morphologyEx(dark.astype(np.uint8), cv2.MORPH_OPEN, np.ones((21, 21), np.uint8))
        n, lab, st, _ = cv2.connectedComponentsWithStats(dark)
        dark = np.isin(lab, [i for i in range(1, n) if st[i, 4] > .006 * W * H and st[i, 0] > 2 and st[i, 1] > 2 and st[i, 0] + st[i, 2] < W - 2 and st[i, 1] + st[i, 3] < H - 2]).astype(np.uint8)
        hm = Image.new('L', (W * SS, H * SS), 0); hd = ImageDraw.Draw(hm)
        step = 7
        for k in range(-H, W, step):
            hd.line([(k * SS, H * SS), ((k + H) * SS, 0)], fill=255, width=round(1.1 * SS))
        mask = Image.fromarray(dark * 255).resize((W * SS, H * SS), Image.NEAREST)
        hatch_img = Image.fromarray((np.asarray(hm) * (np.asarray(mask) > 0) * .55).astype(np.uint8))
        cv = Image.fromarray(np.maximum(np.asarray(cv), np.asarray(hatch_img)))
    alpha = cv.resize((W, H), Image.LANCZOS)
    rgba = Image.new('RGBA', (W, H), INK + (0,)); rgba.putalpha(alpha)
    rgba.save(out, optimize=True)
    return len(segs)


PICK = {'pku-teaching-building': 'dwg_south-elev.jpg', 'river-lantern': 'img_05_photo.jpg'}
CURVED = {'seedlings', 'the-ark', 'river-lantern'}

def batch():
    """assets/projects/<folder>/ 的封面图 → assets/ink/<folder>.png，并记下用的是哪张图。"""
    import re
    os.makedirs('assets/ink', exist_ok=True)
    meta = {}
    for folder in sorted(os.listdir('assets/projects')):
        fs = sorted(os.listdir(f'assets/projects/{folder}'))
        pick = PICK.get(folder) or next((f for f in fs if re.match(r'img_00_cover', f)), None) or next((f for f in fs if f.startswith('img_')), None)
        if not pick: continue
        src = f'assets/projects/{folder}/{pick}'
        n = trace(src, f'assets/ink/{folder}.png', curves=folder in CURVED)
        meta[folder] = src
        print(folder, pick, n)
    json.dump(meta, open('assets/ink/meta.json', 'w'), indent=1)

if __name__ == '__main__':
    batch() if len(sys.argv) < 3 else print(trace(sys.argv[1], sys.argv[2]))
