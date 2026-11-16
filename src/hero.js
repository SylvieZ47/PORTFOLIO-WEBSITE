// 首页第一屏：随滚动生成的 Voronoi 结构（The Ark 的生成逻辑）
// 用法：const h = createHero(canvas, { mobile }); h.setProgress(0..1); h.setPointer(-1..1, -1..1);
// 阶段：0–.08 空白 / .08–.25 点 / .25–.45 线 / .45–.65 变成三维 / .65–.85 飞进一个单元 / .85–1 单元内部
import * as THREE from './vendor/three.module.min.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed) {                       // 固定种子：每次加载长得一样
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// ── 凸多面体裁切：Voronoi 单元 = 包围盒被各条中垂面依次切过之后剩下的部分 ──
const EPS = 1e-7;
function orderInPlane(pts, n) {
  const c = V(0, 0, 0); pts.forEach((p) => c.add(p)); c.multiplyScalar(1 / pts.length);
  const u = Math.abs(n.x) < 0.9 ? V(1, 0, 0) : V(0, 1, 0);
  u.sub(n.clone().multiplyScalar(u.dot(n))).normalize();
  const v = n.clone().cross(u);
  return pts.map((p) => { const q = p.clone().sub(c); return { p, a: Math.atan2(q.dot(v), q.dot(u)) }; })
    .sort((a, b) => a.a - b.a).map((o) => o.p);
}
function clip(faces, n, d, id) {            // 保留 n·x <= d 的一侧
  const out = [], cap = [];
  for (const f of faces) {
    const P = f.pts, res = [];
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], da = n.dot(a) - d, db = n.dot(b) - d;
      if (da <= EPS) { res.push(a); if (da >= -EPS) cap.push(a); }
      if ((da < -EPS && db > EPS) || (da > EPS && db < -EPS)) { const p = a.clone().lerp(b, da / (da - db)); res.push(p); cap.push(p); }
    }
    if (res.length >= 3) out.push({ pts: res, id: f.id, n: f.n });
  }
  const uniq = [];
  for (const p of cap) if (!uniq.some((q) => q.distanceToSquared(p) < 1e-12)) uniq.push(p);
  if (uniq.length >= 3) out.push({ pts: orderInPlane(uniq, n), id, n: n.clone() });
  return out;
}
function box(lo, hi) {
  const c = [V(lo.x, lo.y, lo.z), V(hi.x, lo.y, lo.z), V(hi.x, hi.y, lo.z), V(lo.x, hi.y, lo.z),
             V(lo.x, lo.y, hi.z), V(hi.x, lo.y, hi.z), V(hi.x, hi.y, hi.z), V(lo.x, hi.y, hi.z)];
  const q = (a, b, cc, d, n) => ({ pts: [c[a], c[b], c[cc], c[d]], id: -1, n });
  return [q(0, 1, 2, 3, V(0, 0, -1)), q(4, 5, 6, 7, V(0, 0, 1)), q(0, 1, 5, 4, V(0, -1, 0)),
          q(3, 2, 6, 7, V(0, 1, 0)), q(0, 3, 7, 4, V(-1, 0, 0)), q(1, 2, 6, 5, V(1, 0, 0))];
}
function cellOf(s, others, start) {         // others: [{p, id}]
  let faces = start;
  for (const o of others) {
    const n = o.p.clone().sub(s).normalize();
    faces = clip(faces, n, n.dot(s.clone().add(o.p).multiplyScalar(0.5)), o.id);
  }
  return faces;
}
const key = (p) => `${Math.round(p.x * 1e4)},${Math.round(p.y * 1e4)},${Math.round(p.z * 1e4)}`;
const centroid = (pts) => { const c = V(0, 0, 0); pts.forEach((p) => c.add(p)); return c.multiplyScalar(1 / pts.length); };

// ── 生成整个簇 ──
const BLOB = [[V(0.05, -1.35, 0), 1.45], [V(0.35, 0.25, 0.15), 1.3], [V(-0.25, 1.55, -0.05), 1.05], [V(-0.75, -0.5, 0.3), 0.8]];
const sd = (p) => Math.min(...BLOB.map(([c, r]) => p.distanceTo(c) - r));   // 到团块表面的距离（内部为负）

function buildCluster(nSeeds) {
  const R = rng(11);
  const rnd = (a, b) => a + (b - a) * R();
  const seeds = [], ghosts = [];
  const minD = nSeeds > 40 ? 0.66 : 0.8;
  for (let i = 0; i < 20000 && seeds.length < nSeeds; i++) {
    const p = V(rnd(-2.2, 2.2), rnd(-3.0, 2.8), rnd(-1.8, 1.8));
    if (sd(p) < -0.12 && !seeds.some((q) => q.distanceTo(p) < minD)) seeds.push(p);
  }
  for (let i = 0; i < 30000 && ghosts.length < 260; i++) {     // 外圈的"影子点"：只用来把外层单元封住，不画出来
    const p = V(rnd(-3.6, 3.6), rnd(-4.4, 4.2), rnd(-3.2, 3.2));
    const d = sd(p);
    if (d > 0.3 && d < 1.5 && !ghosts.some((q) => q.distanceTo(p) < 0.7)) ghosts.push(p);
  }
  const all = seeds.concat(ghosts);
  const start = box(V(-6, -6, -6), V(6, 6, 6));
  const cells = seeds.map((s, i) => {
    const others = all.map((p, id) => ({ p, id })).filter((o) => o.id !== i)
      .sort((a, b) => a.p.distanceToSquared(s) - b.p.distanceToSquared(s)).slice(0, 60);
    const faces = cellOf(s, others, start);
    const vs = new Map(); faces.forEach((f) => f.pts.forEach((p) => vs.set(key(p), p)));
    return { seed: s, faces, c: centroid([...vs.values()]), verts: [...vs.values()] };
  });
  const verts = new Map(), edges = new Map(), faces = [];
  cells.forEach((cell, i) => {
    cell.edgeKeys = new Set();
    for (const f of cell.faces) {
      for (let k = 0; k < f.pts.length; k++) {
        const a = f.pts[k], b = f.pts[(k + 1) % f.pts.length], ka = key(a), kb = key(b);
        if (ka === kb) continue;
        verts.set(ka, a); verts.set(kb, b);
        const ek = ka < kb ? ka + '|' + kb : kb + '|' + ka;
        if (!edges.has(ek)) edges.set(ek, { a, b });           // 共用的棱只画一次
        cell.edgeKeys.add(ek);
      }
      if (!(f.id >= 0 && f.id < seeds.length && f.id < i)) faces.push(f);   // 共用的面只留一份
    }
  });
  return { seeds, cells, verts: [...verts.values()], edges, faces };
}

// ── 小工具：把很多根圆管 / 很多个球合成一个实例化网格 ──
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = V(1, 1, 1), _y = V(0, 1, 0), _d = V(0, 0, 0), _p = V(0, 0, 0);
function tubes(list, mat, sides = 8) {
  const mesh = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, sides, 1, true), mat, list.length);
  mesh.userData.setRadius = (r) => {
    list.forEach((e, i) => {
      _d.copy(e.b).sub(e.a); const len = _d.length();
      _q.setFromUnitVectors(_y, _d.multiplyScalar(1 / len));
      _m.compose(_p.copy(e.a).add(e.b).multiplyScalar(0.5), _q, _s.set(r, len, r)); mesh.setMatrixAt(i, _m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  mesh.frustumCulled = false;
  return mesh;
}
function balls(list, mat, detail = 1) {
  const mesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, detail), mat, list.length);
  mesh.userData.setRadius = (r, scales) => {
    list.forEach((p, i) => { const k = r * (scales ? scales[i] : 1); _m.compose(p, _q.identity(), _s.set(k, k, k)); mesh.setMatrixAt(i, _m); });
    mesh.instanceMatrix.needsUpdate = true;
  };
  mesh.frustumCulled = false;
  return mesh;
}
function fanGeometry(faces) {               // 多边形面 → 三角形
  const pos = [];
  for (const f of faces) for (let i = 1; i < f.pts.length - 1; i++) for (const p of [f.pts[0], f.pts[i], f.pts[i + 1]]) pos.push(p.x, p.y, p.z);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  return g;
}
function slab(poly, th) {                   // 薄板：顶面、底面、侧边
  const pos = [], dn = V(0, -th, 0), bot = poly.map((p) => p.clone().add(dn)), n = poly.length;
  const tri = (a, b, c) => pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  for (let i = 1; i < n - 1; i++) { tri(poly[0], poly[i], poly[i + 1]); tri(bot[0], bot[i + 1], bot[i]); }
  for (let i = 0; i < n; i++) { const j = (i + 1) % n; tri(poly[i], bot[i], bot[j]); tri(poly[i], bot[j], poly[j]); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
  return g;
}

// ── 主入口 ──
export function createHero(canvas, opts = {}) {
  const mobile = !!opts.mobile;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opts.still });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.setClearColor(0xffffff, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.02, 60);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x9a9da3, 2.3));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5); sun.position.set(-3, 6, 5); scene.add(sun);

  const C = buildCluster(mobile ? 26 : 48);
  const R = rng(5);
  const root = new THREE.Group(); scene.add(root);
  const edgeList = [...C.edges.values()];

  // 2 点：小黑点，原地淡入
  const order = C.seeds.map((p, i) => i).sort((a, b) => C.seeds[a].y - C.seeds[b].y);
  const pDelay = new Float32Array(C.seeds.length); order.forEach((id, k) => { pDelay[id] = k / order.length; });
  const pg = new THREE.BufferGeometry().setFromPoints(C.seeds); pg.setAttribute('aDelay', new THREE.BufferAttribute(pDelay, 1));
  const pointMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uA: { value: 1 }, uSize: { value: 7 * renderer.getPixelRatio() } },
    vertexShader: 'attribute float aDelay; uniform float uT, uSize; varying float vA; void main(){ vA = smoothstep(0., .18, uT * 1.18 - aDelay); gl_PointSize = uSize; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform float uA; varying float vA; void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vec3(.13), vA * uA * smoothstep(.5, .38, d)); }',
  });
  root.add(new THREE.Points(pg, pointMat));

  // 3 线：细灰线，从下往上一根根画出来
  const ys = edgeList.map((e) => (e.a.y + e.b.y) / 2), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const lp = [], lt = [], ld = [];
  edgeList.forEach((e, i) => {
    const [a, b] = e.a.y <= e.b.y ? [e.a, e.b] : [e.b, e.a], d = (ys[i] - y0) / (y1 - y0) * 0.8 + R() * 0.08;
    lp.push(a.x, a.y, a.z, b.x, b.y, b.z); lt.push(0, 1); ld.push(d, d);
  });
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
  lg.setAttribute('aT', new THREE.Float32BufferAttribute(lt, 1)); lg.setAttribute('aDelay', new THREE.Float32BufferAttribute(ld, 1));
  const lineMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uA: { value: 1 } },
    vertexShader: 'attribute float aT, aDelay; varying float vT, vD; void main(){ vT = aT; vD = aDelay; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform float uT, uA; varying float vT, vD; void main(){ float g = clamp((uT * 1.0 - vD) / .12, 0., 1.); if (vT > g) discard; gl_FragColor = vec4(vec3(.55), uA); }',
  });
  root.add(new THREE.LineSegments(lg, lineMat));

  // 4 三维：白色圆肋 + 节点 + 很淡的半透明面 +（可选）每个面里的细网格
  const ribMat = new THREE.MeshLambertMaterial({ color: 0xf6f6f4, transparent: true, opacity: 0 });
  const ribs = tubes(edgeList, ribMat), nodes = balls(C.verts, ribMat);
  root.add(ribs, nodes);
  const faceMat = new THREE.MeshBasicMaterial({ color: 0xaeb4bb, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  root.add(new THREE.Mesh(fanGeometry(C.faces), faceMat));
  const latMat = new THREE.LineBasicMaterial({ color: 0xb9bdc2, transparent: true, opacity: 0, depthWrite: false });
  if (!mobile) {
    const pts = [];
    for (const f of C.faces) { const c = centroid(f.pts), n = f.pts.length;
      for (let i = 0; i < n; i++) { const a = f.pts[i], b = f.pts[(i + 1) % n], m = a.clone().add(b).multiplyScalar(0.5);
        pts.push(c, a, c, m, m, a.clone().add(c).multiplyScalar(0.5), m, b.clone().add(c).multiplyScalar(0.5)); } }
    root.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), latMat));
  }

  // 5–6 选中的单元：靠前、朝向镜头的那一个
  const ROT = 0.85, rotM = new THREE.Matrix4().makeRotationY(ROT);
  const W = (p) => p.clone().applyMatrix4(rotM);
  let cell = null, best = -1e9;
  for (const c of C.cells) {
    const w = W(c.c), outer = c.faces.filter((f) => !(f.id >= 0 && f.id < C.seeds.length));
    if (!outer.length) continue;
    const size = Math.max(...c.verts.map((p) => p.distanceTo(c.c)));
    const s = w.z * 1.2 - Math.abs(w.x) * 0.6 - Math.abs(w.y + 0.1) * 0.5 + size * 2.5;
    if (s > best) { best = s; cell = c; }
  }
  let entry = null; best = -1e9;
  for (const f of cell.faces) {
    if (f.id >= 0 && f.id < C.seeds.length) continue;
    const s = f.n.clone().transformDirection(rotM).z + f.pts.length * 0.02;
    if (s > best) { best = s; entry = f; }
  }
  const entryC = centroid(entry.pts);
  const cy = cell.verts.map((p) => p.y), yLo = Math.min(...cy), yHi = Math.max(...cy);
  const nh = V(entry.n.x, 0, entry.n.z).normalize();            // 入口面的水平朝向
  const eye = cell.c.clone().lerp(entryC, 0.8); eye.y = lerp(yLo, yHi, 0.5);   // 镜头最后停在单元里靠近入口的地方
  const inner = new THREE.Group(); root.add(inner);
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x5b5e62, transparent: true, opacity: 0 });
  const frameEdges = [...cell.edgeKeys].map((k) => C.edges.get(k));
  const frame = tubes(frameEdges, frameMat, 16), frameNodes = balls(cell.verts, frameMat, 2);
  frame.userData.setRadius(0.0225); frameNodes.userData.setRadius(0.033);
  const glassMat = new THREE.MeshBasicMaterial({ color: 0x9aa1a9, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
  inner.add(frame, frameNodes, new THREE.Mesh(fanGeometry(cell.faces), glassMat));

  // 骨骼网：在单元内部再做一次小的 Voronoi，取它的棱
  const webMat = new THREE.MeshLambertMaterial({ color: 0xfafaf8, transparent: true, opacity: 0 });
  const inside = (p, m) => cell.faces.every((f) => f.n.dot(p) - f.n.dot(f.pts[0]) < -m);
  const sub = [];
  for (let i = 0; i < 4000 && sub.length < (mobile ? 6 : 8); i++) {
    const p = cell.c.clone().add(V(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(1.6));
    if (inside(p, 0.08) && !sub.some((q) => q.distanceTo(p) < 0.3)) sub.push(p);
  }
  const webE = new Map(), webV = new Map();
  sub.forEach((s, i) => {
    const faces = cellOf(s, sub.map((p, id) => ({ p, id: 's' + id })).filter((o, id) => id !== i), cell.faces);
    const owners = new Map();
    for (const f of faces) for (let k = 0; k < f.pts.length; k++) {
      const a = f.pts[k], b = f.pts[(k + 1) % f.pts.length], ka = key(a), kb = key(b); if (ka === kb) continue;
      const ek = ka < kb ? ka + '|' + kb : kb + '|' + ka;
      if (!owners.has(ek)) owners.set(ek, { a, b, ids: [] }); owners.get(ek).ids.push(f.id);
    }
    for (const [ek, o] of owners) if (o.ids.some((id) => typeof id === 'string') && o.a.clone().add(o.b).multiplyScalar(0.5).distanceTo(eye) > 0.3) { webE.set(ek, o); webV.set(key(o.a), o.a); webV.set(key(o.b), o.b); }
  });
  const web = tubes([...webE.values()], webMat, 16), webNodes = balls([...webV.values()], webMat, 2);
  web.userData.setRadius(0.0075); webNodes.userData.setRadius(0.0125);
  inner.add(web, webNodes);

  // 漂浮的绿色平台 + 小树
  const greenMat = new THREE.MeshBasicMaterial({ color: 0x8fbd76, transparent: true, opacity: 0 });
  const treeMat = new THREE.MeshLambertMaterial({ color: 0x5f9a52, transparent: true, opacity: 0, flatShading: true });
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6b6e72, transparent: true, opacity: 0 });
  const crowns = [], crownS = [], trunks = [];
  [0.2, 0.4, 0.6, 0.79].slice(0, mobile ? 3 : 4).forEach((t, k) => {
    const h = lerp(yLo, yHi, t), up = V(0, 1, 0);
    const cut = clip(cell.faces, up, h, 'cut').find((f) => f.id === 'cut'); if (!cut) return;
    const c = centroid(cut.pts);
    let poly = cut.pts.map((p) => c.clone().lerp(p, 0.8));
    // 每层把靠近入口的一段切掉，深浅不一：镜头前面留空，平台像搁板一样错落在对面
    const part = clip([{ pts: poly, id: 0, n: up }], nh, nh.dot(c) + [0.04, -0.12, 0.1, -0.04][k], 'x').find((f) => f.id === 0);
    if (part) poly = part.pts;
    inner.add(new THREE.Mesh(slab(poly, 0.01), greenMat));
    const pc = centroid(poly);
    for (let i = 0; i < 4; i++) {
      const a = poly[Math.floor(R() * poly.length)], p = pc.clone().lerp(a, 0.25 + R() * 0.55), s = 0.013 + R() * 0.009;
      trunks.push({ a: p.clone(), b: p.clone().add(V(0, s * 1.5, 0)) }); crowns.push(p.clone().add(V(0, s * 2.1, 0))); crownS.push(s);
    }
  });
  const crown = balls(crowns, treeMat, 0), trunk = tubes(trunks, trunkMat);
  crown.userData.setRadius(1, crownS); trunk.userData.setRadius(0.002);
  inner.add(crown, trunk);

  // 镜头路径（世界坐标；从 .65 起簇不再转动）
  const P0 = V(0, 0.15, 13.2), T0 = V(0, -0.1, 0);
  const nW = entry.n.clone().transformDirection(rotM), eW = W(entryC), cW = W(cell.c);
  const P1 = eW.clone().add(nW.clone().multiplyScalar(1.5)).add(V(0, 0.15, 0));
  const P2 = W(eye);
  const P3 = P2.clone().add(V(-nW.z, 0, nW.x).multiplyScalar(0.07)).add(V(0, 0.03, 0));
  const path = new THREE.CatmullRomCurve3([P0, P0.clone().lerp(P1, 0.55).add(V(0, 0.5, 0)), P1, P2]);
  const tgt = cell.c.clone().add(nh.clone().multiplyScalar(-0.25)); tgt.y = lerp(yLo, yHi, 0.4);
  const T1 = W(tgt);

  let prog = 0, px = 0, py = 0, tx = 0, ty = 0, ribR = -1, dirty = true;
  const _t = V(0, 0, 0);
  function apply() {
    const p = prog;
    // 点
    pointMat.uniforms.uT.value = seg(p, 0.08, 0.25);
    pointMat.uniforms.uA.value = 1 - seg(p, 0.46, 0.56);
    // 线
    lineMat.uniforms.uT.value = seg(p, 0.25, 0.45);
    lineMat.uniforms.uA.value = 1 - seg(p, 0.5, 0.58);
    // 肋、面、网格
    const t3 = ease(seg(p, 0.45, 0.62));
    ribMat.opacity = seg(p, 0.45, 0.5); ribMat.transparent = ribMat.opacity < 1; ribMat.depthWrite = ribMat.opacity > 0.5;
    ribs.visible = nodes.visible = ribMat.opacity > 0;
    const r = lerp(0.003, 0.021, t3);
    if (Math.abs(r - ribR) > 1e-5) { ribR = r; ribs.userData.setRadius(r); nodes.userData.setRadius(r * 1.5); }
    faceMat.opacity = 0.085 * t3;
    latMat.opacity = 0.5 * ease(seg(p, 0.52, 0.65)) * (1 - 0.6 * seg(p, 0.7, 0.85));
    // 选中单元的内部
    const ti = ease(seg(p, 0.62, 0.74));
    for (const m of [frameMat, webMat, greenMat, treeMat, trunkMat]) { m.opacity = ti; m.transparent = ti < 1; m.depthWrite = ti > 0.5; }
    glassMat.opacity = 0.16 * ti;
    inner.visible = ti > 0;
    // 簇的转动 + 鼠标视差（飞进去之后视差减弱）
    const fly = ease(seg(p, 0.65, 0.85)), par = 1 - 0.8 * fly;
    root.rotation.set(py * 0.07 * par, lerp(-0.15, ROT, ease(seg(p, 0.3, 0.65))) + px * 0.11 * par, 0);
    // 镜头
    const inT = ease(seg(p, 0.85, 1));
    path.getPoint(fly, camera.position);
    camera.position.lerp(P3, inT * fly);
    camera.fov = lerp(32, 62, ease(seg(p, 0.72, 0.86)));
    _t.copy(T0).lerp(T1, ease(seg(p, 0.66, 0.84)));
    _t.add(V(-nW.z, 0, nW.x).multiplyScalar(lerp(0.12, -0.12, inT) * fly)).add(V(0, -0.05 * inT, 0));
    camera.lookAt(_t);
    camera.updateProjectionMatrix();
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // 竖屏时把镜头拉远，保证整个簇都在画面里
    P0.z = 13.2 * Math.max(1, 0.62 / camera.aspect); path.points[0].copy(P0);
    dirty = true;
  }
  function render() { apply(); renderer.render(scene, camera); dirty = false; }
  function tick() {
    px += (tx - px) * 0.06; py += (ty - py) * 0.06;
    if (Math.abs(tx - px) + Math.abs(ty - py) > 1e-4) dirty = true;
    if (dirty) render();
    raf = requestAnimationFrame(tick);
  }
  let raf = 0;
  resize();
  return {
    setProgress(p) { prog = Math.min(1, Math.max(0, p)); dirty = true; },
    setPointer(x, y) { tx = x; ty = y; },
    resize, render,
    start() { if (!raf) tick(); },
    stop() { cancelAnimationFrame(raf); raf = 0; },
    info: { cellSize: Math.max(...cell.verts.map((p) => p.distanceTo(cell.c))), seeds: C.seeds.length, edges: edgeList.length, verts: C.verts.length, faces: C.faces.length, web: webE.size },
  };
}
