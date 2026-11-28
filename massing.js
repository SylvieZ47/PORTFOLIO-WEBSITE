// 首页体块图标的数据。单位随意（约 1 = 一层楼高），x 轴朝右下、y 轴朝左下、z 朝上。
// parts：形体。box {at, size}；prism {poly, z, axis}；cyl {c, r, z}；arc {c, r:[内,外], a:[起,止]度, z}；round {rect, r, z}
//   g: 分组号（动作按组算）；accent: 强调色 + 斜线（被操作的那块）；hid:false 不画它自己被挡住的虚线；terrain: 地形（算交线）
// moves：每组的动作，k 从 0 到 1。t 平移；s 缩放（绕 o）；rz 绕竖轴转（度，绕 o）；span 这一组在 0–1 里的起止，用来错开
// The Ark（泰森多边形那个）不在这里，首页继续用它原来的手绘图标。
(function (root) {
  const box = (at, size, o) => Object.assign({ shape: 'box', at, size }, o || {});
  const W = { hid: false };
  const M = {};

  // Seedlings：三棵古树是圆心，环形的园舍绕着它们。动作：树心从地面升起（Encircle）
  M['seedlings'] = {
    op: { en: 'Encircle', zh: '环抱' },
    parts: [
      { shape: 'arc', c: [0, 0], r: [2.0, 2.8], a: [35, 320], z: [0, 0.7], hid: false },
      { shape: 'arc', c: [4.7, 2.3], r: [0.95, 1.5], a: [-150, 170], z: [0, 0.7], hid: false },
      { shape: 'arc', c: [1.3, 4.9], r: [0.55, 1.0], a: [20, 330], z: [0, 0.7], hid: false },
      { shape: 'cyl', c: [0, 0], r: 0.55, z: [0, 0.15], accent: true, g: 1 },
      { shape: 'cyl', c: [4.7, 2.3], r: 0.42, z: [0, 0.15], accent: true, g: 2 },
      { shape: 'cyl', c: [1.3, 4.9], r: 0.3, z: [0, 0.15], accent: true, g: 3 },
    ],
    moves: {
      1: { s: [1, 1, 15], span: [0, 0.8] },
      2: { s: [1, 1, 11], span: [0.1, 0.9] },
      3: { s: [1, 1, 9], span: [0.2, 1] },
    },
  };

  // River Lantern：岸边码头 + 漂浮的卫生单元。动作：一个单元离岸漂出去（Detach）
  M['river-lantern'] = {
    op: { en: 'Detach', zh: '离岸' },
    parts: [
      box([-1, -2.2, 0], [9, 2.2, 0.6], W),
      box([0.5, 0.15, 0], [2.4, 2.2, 0.15], W),
      { shape: 'cyl', c: [1.2, 1.0], r: 0.55, z: [0.15, 1.3], hid: false },
      box([1.9, 0.5, 0.15], [0.8, 1.3, 0.9], W),
      box([4.2, 0.15, 0], [2.6, 2.6, 0.15], { accent: true, g: 1 }),
      box([4.45, 0.4, 0.15], [1.25, 1.25, 1.0], { accent: true, g: 1 }),
      { shape: 'cyl', c: [6.1, 2.0], r: 0.5, z: [0.15, 1.15], accent: true, g: 1 },
    ],
    moves: { 1: { t: [0.6, 2.4, 0], rz: 14, o: [5.5, 1.45, 0] } },
  };

  // 798 Collage Community：一期是均质的格子，住户各自改造。动作：三格被住户"换掉"，往外推出（Insert）
  {
    const parts = [], A = { '1,0': 1, '3,1': 2, '5,1': 3 };
    for (let z = 0; z < 2; z++) for (let x = 0; x < 6; x++) {
      const g = A[x + ',' + z];
      parts.push(box([x, 0, z], [1, 1, 1], g ? { accent: true, g } : W));
    }
    M['798-artist-district'] = {
      op: { en: 'Insert', zh: '置换' },
      parts,
      moves: {
        1: { t: [0, 0.9, 0], span: [0, 0.7] },
        2: { t: [0, 0, 0.9], span: [0.15, 0.85] },
        3: { t: [0.9, 0, 0], span: [0.3, 1] },
      },
    };
  }

  // Downstairs Bazaar：旧场站的裙房 + 上面的商业塔楼。动作：从中间剖开，市集层长出来（Incision）
  {
    const parts = [box([0, 0, 0], [7, 4, 0.9], W)];
    for (const x of [0.5, 2.05, 3.6, 5.15]) for (const y of [0.55, 2.2])
      parts.push(box([x, y, 0.9], [1.25, 1.25, 0.3], { accent: true, g: 1, hid: false }));
    parts.push(box([1.3, 1.1, 1.2], [4.4, 2.0, 2.6], { hid: false, g: 2 }));
    M['downstairs-bazaar'] = {
      op: { en: 'Incision', zh: '切入' },
      parts,
      moves: { 1: { s: [1, 1, 3], o: [0, 0, 0.9] }, 2: { t: [0, 0, 0.6] } },
    };
  }

  // Ashton House：老房子拆到只剩临街一面墙，重建成两层 + 屋顶平台 + ADU。动作：新加的二层和楼梯间提起来（Stack）
  M['ashton-house-remodel'] = {
    op: { en: 'Stack', zh: '叠加' },
    parts: [
      box([0, 0, 0], [4.4, 3.4, 1.0], W),
      box([-1.6, 0.7, 0], [1.6, 2.3, 0.8], W),
      box([0.1, 3.4, 0.92], [2.6, 0.55, 0.08], W),
      box([-4.2, -3.0, 0], [2.4, 2.0, 0.9], W),
      box([0.3, 0.25, 1.0], [3.2, 2.6, 1.0], { accent: true, g: 1 }),
      { shape: 'prism', axis: 'y', poly: [[2.0, 1.2], [2.0, 2.1], [2.85, 2.1], [3.3, 1.2]], z: [0.45, 1.35], accent: true, g: 1 },
    ],
    moves: { 1: { t: [0, 0, 0.9] } },
  };

  // PKU：两栋楼隔着马路，一条连廊连起来。动作：两楼拉开，连廊跟着伸长，始终连着（Bridge）
  M['pku-marxism-school-building'] = {
    op: { en: 'Bridge', zh: '连接' },
    parts: [
      box([0, 0, 0], [3.6, 2.8, 1.6], { hid: false, g: 1 }),
      { shape: 'prism', poly: [[5.4, 0], [11, 0], [11, 6], [9.6, 6], [9.6, 1.4], [6.8, 1.4], [6.8, 6], [5.4, 6]], z: [0, 1.6], hid: false },
      { shape: 'cyl', c: [8.2, 4.0], r: 1.0, z: [0, 1.1], hid: false },
      box([3.6, 0.8, 0.95], [1.8, 0.9, 0.5], { accent: true, g: 2 }),
    ],
    moves: { 1: { t: [-1.2, 0, 0] }, 2: { s: [3.0 / 1.8, 1, 1], o: [5.4, 0, 0] } },
  };

  // Westfall：陡坡上一级级落下的房子，借"地下室"的定义把面积几乎翻倍。
  // 静止时埋在山里的地下室只露出虚线；动作：把它从山体里抽出来（Excavate）
  M['westfall-hillside-house'] = {
    op: { en: 'Excavate', zh: '掘出' },
    parts: [
      { shape: 'prism', axis: 'x', poly: [[0, 0], [9.2, 0], [1.2, 6.0], [0, 6.0]], z: [0, 4.6], terrain: true, hid: false },
      box([0.8, 7.0, 0], [3, 2.6, 1.1], W),
      box([0.8, 5.8, 1.1], [3, 2.6, 1.1], W),
      box([0.8, 4.4, 2.2], [3, 2.6, 1.1], W),
      box([1.2, 3.4, 3.3], [2.2, 2.2, 0.9], W),
      box([0.8, 4.4, 0], [3, 2.6, 1.1], { accent: true, g: 1 }),
      box([0.8, 3.4, 1.1], [3, 2.4, 1.1], { accent: true, g: 1 }),
    ],
    moves: { 1: { t: [5.2, 0, 0] } },
  };

  // Beck：三层的长条保障住房，街角一块木头包的圆角体量。动作：街角这块"嫁接"上去的材料拔出来（Graft）
  {
    const parts = [
      box([0, 0, 0], [7, 2.2, 2.4], W),
      box([-1.2, 0.2, 0], [1.2, 1.6, 3.3], W),
    ];
    for (const x of [1.4, 3.0, 4.6]) for (const z of [0.85, 1.65]) parts.push(box([x, 2.2, z], [1.0, 0.35, 0.45], W));
    parts.push({ shape: 'round', rect: [7, -0.2, 8.4, 2.6], r: 1.0, z: [0, 2.7], accent: true, g: 1 });
    M['beck-corner-apartment'] = {
      op: { en: 'Graft', zh: '嫁接' },
      parts,
      moves: { 1: { t: [0.9, 0.9, 0.3] } },
    };
  }

  root.MASSING = M;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);

// 首页体块图标：轴测（等轴测，无透视）线框，白面细线，被挡住的边画虚线，被操作的那块用强调色 + 斜线填充。
// 平时静止；鼠标移上去，被操作的那块按 data/massing.js 里写的动作动一下，移开再回来。
// 同一份代码两处用：build.py 用 node 跑它，把静止状态直接写进 HTML；浏览器里用它逐帧重画动画。
(function (root) {
  'use strict';
  const C30 = Math.cos(Math.PI / 6);
  const V = [1, 1, 1];                       // 指向观者的方向（投影后为一点）
  const EPS = 1e-6;
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const proj = (p) => [(p[0] - p[1]) * C30, (p[0] + p[1]) * 0.5 - p[2]];

  // ── 形体 → 局部多面体：faces [{pts, smooth}], edges [{a, b, f: [i, j] | null}] ──
  function area2(poly) { let s = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; }
  const AXES = { z: (a, b, c) => [a, b, c], x: (a, b, c) => [c, a, b], y: (a, b, c) => [b, c, a] };
  // 拉伸体：poly 是截面（逆时针自动纠正），沿 axis 从 w0 拉到 w1；smooth[i] 为真表示该点处是曲面，不画棱线（轮廓线除外）
  function prism(poly, w0, w1, axis, smooth) {
    let P = poly.slice(), S = smooth ? smooth.slice() : P.map(() => false);
    if (area2(P) < 0) { P.reverse(); S.reverse(); }
    const m = AXES[axis || 'z'], n = P.length;
    const bot = P.map(([a, b]) => m(a, b, w0)), top = P.map(([a, b]) => m(a, b, w1));
    const faces = [{ pts: top.slice() }, { pts: bot.slice().reverse() }];
    const sides = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      sides.push(faces.length);
      faces.push({ pts: [bot[i], bot[j], top[j], top[i]], smooth: S[i] || S[j] });
    }
    const edges = [];
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      edges.push({ a: top[i], b: top[j] }, { a: bot[i], b: bot[j] });
      // 竖向棱：尖角总画；曲面上的点只在轮廓处画（f 记下左右两个面，逐帧判断）
      edges.push({ a: bot[i], b: top[i], f: S[i] ? [sides[(i - 1 + n) % n], sides[i]] : null });
    }
    return { faces, edges };
  }
  function arcPts(cx, cy, r, a0, a1, n) {
    const out = [];
    for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return out;
  }
  function shape(s) {
    const z = s.z || [0, 1];
    switch (s.shape) {
      case 'box': {
        const [x, y, zz] = s.at, [w, d, h] = s.size;
        return prism([[x, y], [x + w, y], [x + w, y + d], [x, y + d]], zz, zz + h);
      }
      case 'prism': return prism(s.poly, z[0], z[1], s.axis, s.smooth);
      case 'cyl': {
        const n = s.n || 32, p = arcPts(s.c[0], s.c[1], s.r, 0, 360, n).slice(0, n);
        return prism(p, z[0], z[1], 'z', p.map(() => true));
      }
      case 'arc': {                           // 弧形墙：圆心 c，内外半径 r，角度 a（度）
        const n = s.n || Math.max(10, Math.round((s.a[1] - s.a[0]) / 9)), o = arcPts(s.c[0], s.c[1], s.r[1], s.a[0], s.a[1], n), i = arcPts(s.c[0], s.c[1], s.r[0], s.a[0], s.a[1], n).reverse();
        const sm = o.map((_, k) => k > 0 && k < n).concat(i.map((_, k) => k > 0 && k < n));
        return prism(o.concat(i), z[0], z[1], 'z', sm);
      }
      case 'round': {                         // 一角倒圆的矩形：rect [x0,y0,x1,y1]，倒圆半径 r，角 corner 'xy' 指 (x1,y1)
        const [x0, y0, x1, y1] = s.rect, r = s.r, n = s.n || 16;
        const arc = arcPts(x1 - r, y1 - r, r, 0, 90, n);
        const poly = [[x0, y0], [x1, y0]].concat(arc, [[x0, y1]]);
        const sm = poly.map((_, k) => k > 1 && k < 2 + n);
        return prism(poly, z[0], z[1], 'z', sm);
      }
    }
    throw new Error('unknown shape ' + s.shape);
  }

  // ── 动作：每组一个变换，k 从 0（静止）到 1（动作完成）──
  function xform(mv, k) {
    if (!mv || k === 0) return (p) => p;
    const t = mv.t ? mul(mv.t, k) : [0, 0, 0];
    const o = mv.o || [0, 0, 0];
    const sc = mv.s ? mv.s.map((v) => 1 + (v - 1) * k) : [1, 1, 1];
    const ang = (mv.rz || 0) * k * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang);
    return (p) => {
      let q = [(p[0] - o[0]) * sc[0], (p[1] - o[1]) * sc[1], (p[2] - o[2]) * sc[2]];
      q = [q[0] * ca - q[1] * sa, q[0] * sa + q[1] * ca, q[2]];
      return add(add(q, o), t);
    };
  }
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

  // 把一个场景在动作进度 k 下变成世界坐标的面和边
  function build(scene, k) {
    if (!scene._local) scene._local = scene.parts.map(shape);
    const faces = [], edges = [];
    scene.parts.forEach((part, pi) => {
      const g = part.g || 0, mv = scene.moves && scene.moves[g];
      // 每组可以有自己的起止时间（0–1 之间），让几块错开动
      let kk = k;
      if (mv && mv.span) kk = Math.max(0, Math.min(1, (k - mv.span[0]) / (mv.span[1] - mv.span[0])));
      const T = xform(mv, ease(kk)), loc = scene._local[pi], base = faces.length;
      loc.faces.forEach((f) => {
        const pts = f.pts.map(T);
        const n = newell(pts);
        faces.push({ pts, n, d: dot(n, pts[0]), accent: !!part.accent, part: pi, terrain: !!part.terrain, smooth: f.smooth });
      });
      loc.edges.forEach((e) => {
        let ok = true;
        if (e.f) {                              // 曲面上的竖线：只有两侧面一正一背时才是轮廓
          const s1 = dot(faces[base + e.f[0]].n, V), s2 = dot(faces[base + e.f[1]].n, V);
          ok = (s1 > 0) !== (s2 > 0);
        }
        if (ok) edges.push({ a: T(e.a), b: T(e.b), part: pi, hid: part.hid !== false });
      });
    });
    // 地形与别的体块相交处的交线
    faces.forEach((A, i) => {
      if (!A.terrain) return;
      faces.forEach((B, j) => {
        if (B.terrain || B.part === A.part) return;
        const s = faceFace(A, B);
        if (s) edges.push({ a: s[0], b: s[1], part: B.part, hid: scene.parts[B.part].hid !== false });
      });
    });
    return { faces, edges };
  }
  function newell(pts) {
    let n = [0, 0, 0];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length];
      n[0] += (p[1] - q[1]) * (p[2] + q[2]); n[1] += (p[2] - q[2]) * (p[0] + q[0]); n[2] += (p[0] - q[0]) * (p[1] + q[1]);
    }
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    return [n[0] / l, n[1] / l, n[2] / l];
  }
  // 两个凸面的交线段（没有则 null）
  function planeCut(F, n, d) {
    const out = [], P = F.pts;
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length], sp = dot(n, p) - d, sq = dot(n, q) - d;
      if (Math.abs(sp) < 1e-9) out.push(p);
      if ((sp > 1e-9 && sq < -1e-9) || (sp < -1e-9 && sq > 1e-9)) out.push(add(p, mul(sub(q, p), sp / (sp - sq))));
    }
    return out.length >= 2 ? [out[0], out[out.length - 1]] : null;
  }
  function clipToFace(seg, F) {
    let [a, b] = seg, t0 = 0, t1 = 1;
    const P = F.pts, dir = sub(b, a);
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length], m = cross(F.n, sub(q, p));
      const fa = dot(m, sub(a, p)), fd = dot(m, dir);
      if (Math.abs(fd) < 1e-12) { if (fa < -1e-9) return null; continue; }
      const t = -fa / fd;
      if (fd > 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
      if (t0 > t1 - 1e-9) return null;
    }
    return [add(a, mul(dir, t0)), add(a, mul(dir, t1))];
  }
  function faceFace(A, B) {
    const s = planeCut(B, A.n, A.d);
    return s && clipToFace(s, A);
  }

  // ── 2D 小工具 ──
  function inPoly(pt, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i], b = poly[j];
      if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  function segX(p, q, a, b) {                 // 线段 pq 与 ab 的交点参数（pq 上），无则 -1
    const r = [q[0] - p[0], q[1] - p[1]], s = [b[0] - a[0], b[1] - a[1]];
    const den = r[0] * s[1] - r[1] * s[0];
    if (Math.abs(den) < 1e-12) return -1;
    const t = ((a[0] - p[0]) * s[1] - (a[1] - p[1]) * s[0]) / den, u = ((a[0] - p[0]) * r[1] - (a[1] - p[1]) * r[0]) / den;
    return t > 1e-9 && t < 1 - 1e-9 && u >= -1e-9 && u <= 1 + 1e-9 ? t : -1;
  }
  // 屏幕点 q 处，面 F 所在平面沿视线的"靠前量"（越大越靠近观者）
  function nearness(F, q) {
    const nv = dot(F.n, V);
    if (Math.abs(nv) < 1e-9) return -Infinity;
    const Q0 = [q[1] + q[0] / (2 * C30), q[1] - q[0] / (2 * C30), 0];
    return (F.d - dot(F.n, Q0)) / nv;
  }

  // ── 消隐：每条边按挡住它的正面切成可见段和隐藏段 ──
  function hlr(faces, edges) {
    const occ = faces.filter((f) => dot(f.n, V) > 1e-6);
    occ.forEach((f) => {
      f.p2 = f.pts.map(proj);
      f.dmax = Math.max(...f.pts.map((p) => dot(p, V)));
      f.bb = f.p2.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity]);
    });
    const vis = [], hid = [];
    edges.forEach((e) => {
      const p = proj(e.a), q = proj(e.b);
      if (Math.hypot(q[0] - p[0], q[1] - p[1]) < 1e-6) return;
      const bb = [Math.min(p[0], q[0]), Math.min(p[1], q[1]), Math.max(p[0], q[0]), Math.max(p[1], q[1])];
      const cover = [], dmin = Math.min(dot(e.a, V), dot(e.b, V)) + 1e-6;
      occ.forEach((f) => {
        if (f.dmax <= dmin) return;             // 整个面都在这条边后面，挡不住
        if (f.bb[0] > bb[2] || f.bb[2] < bb[0] || f.bb[1] > bb[3] || f.bb[3] < bb[1]) return;
        const ts = [0, 1];
        for (let i = 0; i < f.p2.length; i++) { const t = segX(p, q, f.p2[i], f.p2[(i + 1) % f.p2.length]); if (t > 0) ts.push(t); }
        ts.sort((x, y) => x - y);
        for (let i = 0; i < ts.length - 1; i++) {
          if (ts[i + 1] - ts[i] < 1e-7) continue;
          const tm = (ts[i] + ts[i + 1]) / 2, m = [p[0] + (q[0] - p[0]) * tm, p[1] + (q[1] - p[1]) * tm];
          if (!inPoly(m, f.p2)) continue;
          const E = add(e.a, mul(sub(e.b, e.a), tm));
          const s = (f.d - dot(f.n, E)) / dot(f.n, V);
          if (s > 1e-5) cover.push([ts[i], ts[i + 1]]);
        }
      });
      cover.sort((x, y) => x[0] - y[0]);
      let t = 0;
      const merged = [];
      cover.forEach(([a, b]) => { if (merged.length && a <= merged[merged.length - 1][1] + 1e-7) merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], b); else merged.push([a, b]); });
      const at = (u) => [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
      merged.forEach(([a, b]) => {
        if (a - t > 1e-4) vis.push([at(t), at(a)]);
        if (e.hid) hid.push([at(a), at(b)]);
        t = b;
      });
      if (1 - t > 1e-4) vis.push([at(t), at(1)]);
    });
    return { vis, hid, occ };
  }

  // ── 面的前后顺序（只为填色；线已经精确消隐）。强调色的面若跨过别的面的平面，先切开 ──
  function splitByPlane(F, n, d) {
    const A = [], B = [], P = F.pts;
    for (let i = 0; i < P.length; i++) {
      const p = P[i], q = P[(i + 1) % P.length], sp = dot(n, p) - d, sq = dot(n, q) - d;
      if (sp >= 0) A.push(p); if (sp <= 0) B.push(p);
      if ((sp > 0 && sq < 0) || (sp < 0 && sq > 0)) { const x = add(p, mul(sub(q, p), sp / (sp - sq))); A.push(x); B.push(x); }
    }
    return [A, B].filter((x) => x.length >= 3).map((pts) => Object.assign({}, F, { pts, p2: pts.map(proj) }));
  }
  function order(occ) {
    let list = occ.slice();
    const acc = list.filter((f) => f.accent);
    acc.forEach((A) => {
      let pieces = [A];
      list.forEach((B) => {
        if (B.accent || B.part === A.part) return;
        if (B.bb[0] >= A.bb[2] || B.bb[2] <= A.bb[0] || B.bb[1] >= A.bb[3] || B.bb[3] <= A.bb[1]) return;
        pieces = pieces.flatMap((P) => {
          const sd = P.pts.map((p) => dot(B.n, p) - B.d);
          if (Math.max(...sd) > 1e-4 && Math.min(...sd) < -1e-4) return splitByPlane(P, B.n, B.d);
          return [P];
        });
      });
      if (pieces.length > 1) list = list.filter((f) => f !== A).concat(pieces);
    });
    list.forEach((f) => {
      f.c2 = f.p2.reduce((s, p) => [s[0] + p[0] / f.p2.length, s[1] + p[1] / f.p2.length], [0, 0]);
      f.bb = f.p2.reduce((b, p) => [Math.min(b[0], p[0]), Math.min(b[1], p[1]), Math.max(b[2], p[0]), Math.max(b[3], p[1])], [Infinity, Infinity, -Infinity, -Infinity]);
      f.depth = f.pts.reduce((s, p) => s + dot(p, V), 0) / f.pts.length;
    });
    list.sort((a, b) => a.depth - b.depth);
    const n = list.length, after = list.map(() => []), indeg = new Array(n).fill(0);
    const common = (A, B) => {
      const cand = [];
      const shrink = (F) => F.p2.map((p) => [p[0] + (F.c2[0] - p[0]) * 0.02, p[1] + (F.c2[1] - p[1]) * 0.02]);
      shrink(A).forEach((p) => cand.push(p)); shrink(B).forEach((p) => cand.push(p));
      cand.push(A.c2, B.c2);
      const hit = cand.find((c) => inPoly(c, A.p2) && inPoly(c, B.p2));
      if (hit) return hit;
      cand.length = 0;
      for (let i = 0; i < A.p2.length; i++) for (let j = 0; j < B.p2.length; j++) {
        const p = A.p2[i], q = A.p2[(i + 1) % A.p2.length], t = segX(p, q, B.p2[j], B.p2[(j + 1) % B.p2.length]);
        if (t > 0) {
          const x = [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
          const h = 1e-3 * (A.bb[2] - A.bb[0] + A.bb[3] - A.bb[1]);
          cand.push([x[0] + h, x[1]], [x[0] - h, x[1]], [x[0], x[1] + h], [x[0], x[1] - h]);
        }
      }
      return cand.find((c) => inPoly(c, A.p2) && inPoly(c, B.p2));
    };
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const A = list[i], B = list[j];
      if (!A.accent && !B.accent) continue;     // 白压白看不出来，只有强调色的面需要排对
      if (A.bb[0] >= B.bb[2] || A.bb[2] <= B.bb[0] || A.bb[1] >= B.bb[3] || A.bb[3] <= B.bb[1]) continue;
      const c = common(A, B);
      if (!c) continue;
      const da = nearness(A, c), db = nearness(B, c);
      if (Math.abs(da - db) < 1e-6) continue;
      if (da > db) { after[j].push(i); indeg[i]++; } else { after[i].push(j); indeg[j]++; }
    }
    const out = [], done = new Array(n).fill(false);
    while (out.length < n) {
      let pick = -1;
      for (let i = 0; i < n; i++) if (!done[i] && indeg[i] === 0) { pick = i; break; }
      if (pick < 0) for (let i = 0; i < n; i++) if (!done[i]) { pick = i; break; }   // 成环：按深度硬选
      done[pick] = true; out.push(list[pick]);
      after[pick].forEach((j) => indeg[j]--);
    }
    return out;
  }

  // ── 出图 ──
  // 每个场景按静止状态的外框统一缩放：外框面积 = 100²，这样各个图标的线宽、斜线密度看起来一致
  function frame(scene) {
    if (scene._frame) return scene._frame;
    const { faces } = build(scene, 0);
    const pts = faces.flatMap((f) => f.pts.map(proj));
    let x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0]));
    let y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
    const k = 100 / Math.sqrt((x1 - x0) * (y1 - y0)), pad = 2;
    scene._frame = { k, ox: x0, oy: y0, w: (x1 - x0) * k + 2 * pad, h: (y1 - y0) * k + 2 * pad, pad };
    return scene._frame;
  }
  function draw(scene, k) {
    const F = frame(scene), f2 = (v) => (Math.round(v * 100) / 100).toString();
    const X = (p) => f2((p[0] - F.ox) * F.k + F.pad) + ' ' + f2((p[1] - F.oy) * F.k + F.pad);
    const { faces, edges } = build(scene, k);
    const { vis, hid, occ } = hlr(faces, edges);
    const fills = order(occ).map((f) => {
      const d = 'M' + f.p2.map(X).join('L') + 'Z';
      return f.accent ? `<path class="ma" d="${d}"/>` : `<path class="mf" d="${d}"/>`;
    }).join('');
    const path = (segs) => segs.map(([a, b]) => 'M' + X(a) + 'L' + X(b)).join('');
    return `<g>${fills}</g><path class="mh" d="${path(hid)}"/><path class="mv" d="${path(vis)}"/>`;
  }
  function svg(scene, attrs) {
    const F = frame(scene);
    return `<svg class="d m" viewBox="0 0 ${F.w.toFixed(2)} ${F.h.toFixed(2)}" ${attrs || ''}>${draw(scene, 0)}</svg>`;
  }
  // 所有图标共用的斜线图案（放在页面里一次）
  const DEFS = '<svg class="m-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>' +
    '<pattern id="m-hatch" patternUnits="userSpaceOnUse" width="2.4" height="2.4" patternTransform="rotate(45)">' +
    '<rect width="2.4" height="2.4" class="mt"/><line x1="0" y1="0" x2="0" y2="2.4" class="ml"/></pattern></defs></svg>';

  const api = { draw, svg, frame, DEFS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.Massing = api;

  // ── 浏览器：悬停动画 ──
  if (typeof document === 'undefined') return;
  const run = () => {
    const scenes = root.MASSING || {};
    const DUR = 900;
    document.querySelectorAll('svg.m[data-m]').forEach((el) => {
      const scene = scenes[el.dataset.m];
      if (!scene) return;
      const mark = el.closest('a') || el;
      let k = 0, target = 0, last = 0, raf = 0;
      const dur = scene.dur || DUR;
      const tick = (now) => {
        const dt = last ? now - last : 16; last = now;
        k = target > k ? Math.min(target, k + dt / dur) : Math.max(target, k - dt / dur);
        el.innerHTML = draw(scene, k);
        if (k !== target) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; }
      };
      const go = (t) => { target = t; if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
      if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
        mark.addEventListener('mouseenter', () => go(1));
        mark.addEventListener('mouseleave', () => go(0));
      } else if ('IntersectionObserver' in root) {
        // 手机没有悬停：滚到屏幕中间时动一下，再回去
        const io = new IntersectionObserver((es) => es.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(el); go(1); setTimeout(() => go(0), dur + 700);
        }), { rootMargin: '-35% 0px -35% 0px' });
        io.observe(el);
      }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})(typeof window !== 'undefined' ? window : globalThis);
