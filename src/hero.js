// 首页第一屏：随滚动生成的 Voronoi 结构（The Ark 的生成逻辑）
// 用法：const h = createHero(canvas, { mobile }); h.setProgress(0..1); h.setPointer(-1..1, -1..1);
//
// 思路：整个结构是一块比屏幕大得多的三维 Voronoi"板"，在 z = 0 处被剖开。
//   · 正对着看，剖面就是一张铺满屏幕的二维泰森多边形图（数学上就是同一批点的二维 Voronoi）。
//   · 然后剖切面往前推、镜头转开：剖面一点点缩小，露出单元鼓出来的前半部分，二维图"长"成三维。
//   · 画法是"勾边"：单元填白，轮廓线粗、折线细，像 Rhino 的技术显示模式，不用圆管。
//   · 单元之间留等宽的缝（缝就是肋），棱做了倒角。
//
// 阶段：0–.06 空白 / .06–.2 点 / .2–.4 画线 / .4–.5 线变成剖面 / .5–.7 转开变三维 / .7–.88 飞进一个单元 / .88–1 单元内部
import * as THREE from './vendor/three.module.min.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
const ease = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;
function rng(seed) {                       // 固定种子：每次加载长得一样
  return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}

// ── 凸多面体裁切：Voronoi 单元 = 一个大盒子被各条中垂面依次切过之后剩下的部分 ──
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
    let cut = false;
    for (let i = 0; i < P.length; i++) {
      const a = P[i], b = P[(i + 1) % P.length], da = n.dot(a) - d, db = n.dot(b) - d;
      if (da <= EPS) { res.push(a); if (da >= -EPS) cap.push(a); } else cut = true;
      if ((da < -EPS && db > EPS) || (da > EPS && db < -EPS)) { const p = a.clone().lerp(b, da / (da - db)); res.push(p); cap.push(p); }
    }
    if (!cut) out.push(f); else if (res.length >= 3) out.push({ pts: res, id: f.id, n: f.n });
  }
  const uniq = [];
  for (const p of cap) if (!uniq.some((q) => q.distanceToSquared(p) < 1e-10)) uniq.push(p);
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
const key = (p) => `${Math.round(p.x * 2e3)},${Math.round(p.y * 2e3)},${Math.round(p.z * 2e3)}`;
function edgesOf(faces) {                   // 每条棱 + 夹着它的两个面的法线
  const m = new Map();
  for (const f of faces) for (let k = 0; k < f.pts.length; k++) {
    const a = f.pts[k], b = f.pts[(k + 1) % f.pts.length], ka = key(a), kb = key(b); if (ka === kb) continue;
    const ek = ka < kb ? ka + '|' + kb : kb + '|' + ka;
    const e = m.get(ek); if (e) e.n2 = f.n; else m.set(ek, { a, b, n1: f.n, n2: f.n });
  }
  return [...m.values()];
}

// ── 生成 ──
function build(o) {
  const R = rng(23), S = o.spacing, H = S * 0.92;                // H：层距。大于层内点的覆盖半径，z=0 的剖面才正好是二维 Voronoi
  const layers = [];
  for (let L = -1; L <= o.layers; L++) {                         // 最前和最后各有一层"影子层"：只用来把相邻的层封住，不画
    const pts = [];
    for (let x = -o.X; x <= o.X; x += S) for (let y = -o.Y; y <= o.Y; y += S * 0.9) {
      const j = S * 0.36;
      pts.push(V(x + (R() - 0.5) * 2 * j + (Math.round(y / S) % 2 ? S / 2 : 0), y + (R() - 0.5) * 2 * j, L === 0 ? 0 : -L * H + (R() - 0.5) * S * 0.2));
    }
    layers.push(pts);
  }
  const all = layers.flat();
  const lo = V(-o.X - S, -o.Y - S, -(o.layers + 0.6) * H), hi = V(o.X + S, o.Y + S, H * 1.6);
  const zcut = V(0, 0, 1);

  // 二维 Voronoi（第一阶段画的线）：同一个裁切函数，起始形状是 z=0 上的一个大矩形
  const flat = [{ pts: [V(lo.x, lo.y, 0), V(hi.x, lo.y, 0), V(hi.x, hi.y, 0), V(lo.x, hi.y, 0)], id: -1, n: zcut }];
  const seeds2d = layers[1], lines2d = new Map();
  for (const s of seeds2d) {
    let poly = flat;
    for (const q of seeds2d) { if (q === s) continue; const dd = q.distanceTo(s); if (dd > S * 3) continue;
      const n = q.clone().sub(s).multiplyScalar(1 / dd); poly = clip(poly, n, n.dot(s) + dd / 2, 0); }
    const P = poly[0].pts;
    for (let k = 0; k < P.length; k++) { const a = P[k], b = P[(k + 1) % P.length], ka = key(a), kb = key(b);
      if (ka !== kb) lines2d.set(ka < kb ? ka + '|' + kb : kb + '|' + ka, { a, b }); }
  }

  // 三维单元：中垂面各往里收半个缝宽（缝 = 肋），再倒角
  const cells = [];
  for (let L = 0; L < o.layers; L++) for (const s of layers[L + 1]) {
    if (Math.abs(s.x) > o.X - S * 0.2 || Math.abs(s.y) > o.Y - S * 0.2) continue;      // 最外一圈不封口，不要
    let faces = box(lo, hi);
    const near = all.filter((q) => q !== s && q.distanceToSquared(s) < S * S * 7.5);
    for (const q of near) { const dd = q.distanceTo(s), n = q.clone().sub(s).multiplyScalar(1 / dd);
      faces = clip(faces, n, n.dot(s) + dd / 2 - o.gap / 2, 1); }
    const raw = faces;
    if (o.chamfer) for (const e of edgesOf(raw)) {
      if (e.n1.dot(e.n2) > 0.94) continue;
      const n = e.n1.clone().add(e.n2).normalize(); faces = clip(faces, n, n.dot(e.a) - o.chamfer, 2);
    }
    cells.push({ seed: s, layer: L, faces, raw });
  }
  return { cells, seeds2d, lines2d: [...lines2d.values()], H, S };
}

// ── 勾边线：每条棱是一个朝向屏幕的细长四边形，在顶点着色器里按屏幕像素加宽 ──
// 一条棱两侧的面一个朝向镜头、一个背向镜头 → 它是轮廓线，画粗；两个都朝向镜头 → 折线，画细；两个都背向 → 不画。
const LINE_VS = `
uniform vec2 uRes; uniform vec3 uCam; uniform float uThick, uThin, uAll;
attribute vec3 aOther, aN1, aN2; attribute float aSide; varying float vSil, vZ;
void main() {
  vZ = position.z;
  vec3 v = uCam - (position + aOther) * .5;
  float s1 = dot(aN1, v), s2 = dot(aN2, v);
  float sil = max(step(s1 * s2, 0.), uAll), w = mix(uThin, uThick, sil);
  if (uAll < .5 && s1 < 0. && s2 < 0.) w = 0.;
  vec4 a = modelViewMatrix * vec4(position, 1.), b = modelViewMatrix * vec4(aOther, 1.);
  float nr = -.03;
  if (a.z > nr) { if (b.z > nr) { gl_Position = vec4(2., 2., 2., 1.); return; } a = b + (a - b) * ((nr - b.z) / (a.z - b.z)); }
  else if (b.z > nr) b = a + (b - a) * ((nr - a.z) / (b.z - a.z));
  a.xyz *= .9982; b.xyz *= .9982;                 // 线比面略靠近镜头一点，免得和面打架（按距离的比例，远近都适用）
  vec4 ca = projectionMatrix * a, cb = projectionMatrix * b;
  vec2 d = (cb.xy / cb.w - ca.xy / ca.w) * uRes; d = length(d) > 1e-5 ? normalize(d) : vec2(1., 0.);
  ca.xy += vec2(-d.y, d.x) * aSide * w / uRes * ca.w;
  gl_Position = ca; vSil = sil;
}`;
const LINE_FS = `
uniform float uA, uCut; uniform vec3 uInk, uSoft; varying float vSil, vZ;
void main() { if (vZ > uCut) discard; gl_FragColor = vec4(mix(uSoft, uInk, vSil), uA); }`;
function lineMesh(edges, uniforms, capacity = 0) {
  const n = Math.max(edges.length, capacity), pos = new Float32Array(n * 12), oth = new Float32Array(n * 12), n1 = new Float32Array(n * 12), n2 = new Float32Array(n * 12),
    side = new Float32Array(n * 4), idx = new Uint32Array(n * 6);
  const put = (arr, i, p) => { arr[i] = p.x; arr[i + 1] = p.y; arr[i + 2] = p.z; };
  for (let k = 0; k < n; k++) { side.set([1, -1, -1, 1], k * 4); idx.set([k * 4, k * 4 + 1, k * 4 + 2, k * 4 + 1, k * 4 + 3, k * 4 + 2], k * 6); }
  const g = new THREE.BufferGeometry();
  const fill = (list) => {                    // 可以反复调用，用来更新会变的线（剖面的轮廓）
    const m = Math.min(list.length, n);
    for (let k = 0; k < m; k++) { const e = list[k], o = k * 12;
      for (let j = 0; j < 4; j++) { put(pos, o + j * 3, j < 2 ? e.a : e.b); put(oth, o + j * 3, j < 2 ? e.b : e.a); put(n1, o + j * 3, e.n1); put(n2, o + j * 3, e.n2); } }
    g.setDrawRange(0, m * 6);
    for (const a of ['position', 'aOther', 'aN1', 'aN2']) if (g.attributes[a]) g.attributes[a].needsUpdate = true;
  };
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aOther', new THREE.BufferAttribute(oth, 3));
  g.setAttribute('aN1', new THREE.BufferAttribute(n1, 3)); g.setAttribute('aN2', new THREE.BufferAttribute(n2, 3));
  g.setAttribute('aSide', new THREE.BufferAttribute(side, 1)); g.setIndex(new THREE.BufferAttribute(idx, 1));
  fill(edges);
  const m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms, vertexShader: LINE_VS, fragmentShader: LINE_FS, transparent: true, side: THREE.DoubleSide }));
  m.frustumCulled = false; m.userData.fill = fill; return m;
}
function fillMesh(cells) {                  // 所有单元的面合成一个网格；明暗直接按面的朝向烘在颜色里（不打光，保持"图"的感觉）
  const pos = [], col = [], Ld = V(-0.35, 0.55, 0.76).normalize();
  for (const c of cells) for (const f of c.faces) {
    const s = 0.8 + 0.2 * Math.max(0, f.n.dot(Ld)) ** 0.8;
    for (let i = 1; i < f.pts.length - 1; i++) for (const p of [f.pts[0], f.pts[i], f.pts[i + 1]]) { pos.push(p.x, p.y, p.z); col.push(s, s, s * 1.006); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, transparent: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 2 }));
  m.frustumCulled = false; return m;
}

// ── 主入口 ──
export function createHero(canvas, opts = {}) {
  const mobile = !!opts.mobile, t0 = performance.now();
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opts.still });
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(dpr); renderer.setClearColor(0xffffff, 0); renderer.localClippingEnabled = true;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, 1, 0.03, 120);

  const B = build(mobile ? { spacing: 1.5, X: 9, Y: 7.5, layers: 2, gap: 0.11, chamfer: 0 }
                         : { spacing: 1.3, X: 11.5, Y: 6.6, layers: 3, gap: 0.1, chamfer: 0.035 });
  const R = rng(5);

  // 选中的单元：最前一层里靠近画面中心偏右的那个。它不画实体，只留一圈框，镜头最后飞进它留下的空腔。
  const pick = V(0.9, 0.1, 0);
  const chosen = B.cells.filter((c) => c.layer === 0).sort((a, b) => a.seed.distanceTo(pick) - b.seed.distanceTo(pick))[0];
  const solid = B.cells.filter((c) => c !== chosen);

  // 1 点
  const far = Math.hypot(11, 6.5);
  const pg = new THREE.BufferGeometry().setFromPoints(B.seeds2d);
  pg.setAttribute('aDelay', new THREE.Float32BufferAttribute(B.seeds2d.map((p) => Math.min(1, Math.hypot(p.x, p.y) / far) * 0.75 + R() * 0.2), 1));
  const pointMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, uniforms: { uT: { value: 0 }, uA: { value: 1 }, uSize: { value: 6.5 * dpr } },
    vertexShader: 'attribute float aDelay; uniform float uT, uSize; varying float vA; void main(){ vA = smoothstep(0., .15, uT * 1.12 - aDelay); gl_PointSize = uSize; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform float uA; varying float vA; void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vec3(.1), vA * uA * smoothstep(.5, .36, d)); }',
  });
  scene.add(new THREE.Points(pg, pointMat));

  // 2 二维线：从画面中心向外一根根画出来
  const lp = [], lt = [], ld = [];
  for (const e of B.lines2d) {
    const [a, b] = Math.hypot(e.a.x, e.a.y) <= Math.hypot(e.b.x, e.b.y) ? [e.a, e.b] : [e.b, e.a];
    const d = Math.min(1, Math.hypot((a.x + b.x) / 2, (a.y + b.y) / 2) / far) * 0.82 + R() * 0.06;
    lp.push(a.x, a.y, a.z, b.x, b.y, b.z); lt.push(0, 1); ld.push(d, d);
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(lp, 3));
  lg.setAttribute('aT', new THREE.Float32BufferAttribute(lt, 1)); lg.setAttribute('aDelay', new THREE.Float32BufferAttribute(ld, 1));
  const flatMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, uniforms: { uT: { value: 0 }, uA: { value: 1 } },
    vertexShader: 'attribute float aT, aDelay; varying float vT, vD; void main(){ vT = aT; vD = aDelay; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }',
    fragmentShader: 'uniform float uT, uA; varying float vT, vD; void main(){ float g = clamp((uT - vD) / .12, 0., 1.); if (vT > g) discard; gl_FragColor = vec4(vec3(.12), uA); }',
  });
  scene.add(new THREE.LineSegments(lg, flatMat));

  // 3 三维：白色实体 + 勾边
  const cutPlane = new THREE.Plane(V(0, 0, -1), 0), zUp = V(0, 0, 1);       // 剖切面：只留 z <= cut 的部分
  const fill = fillMesh(solid); fill.material.clippingPlanes = [cutPlane]; scene.add(fill);
  const U = () => ({ uRes: { value: new THREE.Vector2(1, 1) }, uCam: { value: V(0, 0, 0) }, uA: { value: 0 }, uAll: { value: 0 }, uCut: { value: 0 },
    uThick: { value: 2.3 * dpr }, uThin: { value: 0.75 * dpr }, uInk: { value: new THREE.Color(0x141414) }, uSoft: { value: new THREE.Color(0xa9adb2) } });
  const ink = lineMesh(solid.flatMap((c) => edgesOf(c.faces)), U()); scene.add(ink);
  const frameU = U(); frameU.uAll.value = 1; frameU.uThick.value = 2.6 * dpr; frameU.uInk.value.set(0x141414);
  chosen.raw = clip(chosen.raw, zUp, 0, 3);
  const frame = lineMesh(edgesOf(chosen.raw), frameU); frameU.uCut.value = 9; scene.add(frame);

  // 剖面（会动）：最前一层的单元被剖切面切出来的那一圈。每帧重算，白面 + 粗轮廓线。
  const front = solid.filter((c) => c.layer === 0);
  const zFront = Math.max(...front.flatMap((c) => c.faces.flatMap((f) => f.pts.map((q) => q.z))));
  const capU = U(); capU.uAll.value = 1; capU.uCut.value = 9;
  const capInk = lineMesh([], capU, front.length * 26); scene.add(capInk);
  const capPos = new Float32Array(front.length * 26 * 9), capGeo = new THREE.BufferGeometry();
  capGeo.setAttribute('position', new THREE.BufferAttribute(capPos, 3));
  const capFill = new THREE.Mesh(capGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 2 }));
  capFill.frustumCulled = false; scene.add(capFill);
  let lastCut = null;
  function setCut(c) {
    if (c === lastCut) return; lastCut = c;
    cutPlane.constant = c; ink.material.uniforms.uCut.value = c;
    const edges = []; let k = 0;
    if (c < zFront) for (const cell of front) {
      const cap = clip(cell.faces, zUp, c, 9).find((f) => f.id === 9); if (!cap) continue;
      const P = cap.pts;
      for (let i = 0; i < P.length; i++) edges.push({ a: P[i], b: P[(i + 1) % P.length], n1: zUp, n2: zUp });
      for (let i = 1; i < P.length - 1 && k < capPos.length - 9; i++) for (const q of [P[0], P[i], P[i + 1]]) { capPos[k++] = q.x; capPos[k++] = q.y; capPos[k++] = q.z; }
    }
    capInk.userData.fill(edges); capGeo.setDrawRange(0, k / 3); capGeo.attributes.position.needsUpdate = true;
  }

  // 镜头
  const cc = V(0, 0, 0); let nV = 0; const seen = new Set();
  for (const f of chosen.raw) for (const p of f.pts) { const k = key(p); if (!seen.has(k)) { seen.add(k); cc.add(p); nV++; } }
  cc.multiplyScalar(1 / nV);
  const capC = V(cc.x, cc.y, 0), depth = Math.min(...chosen.raw.flatMap((f) => f.pts.map((p) => p.z)));
  const VIEW_H = 6.6;                                            // 正对着看时，z=0 处画面的高度（世界单位）
  let prog = 0, px = 0, py = 0, tx = 0, ty = 0, dirty = true, raf = 0;
  const pos = V(0, 0, 0), tgt = V(0, 0, 0), A = V(0, 0, 0), Bv = V(0, 0, 0);

  function apply() {
    const p = prog;
    pointMat.uniforms.uT.value = seg(p, 0.06, 0.2);
    pointMat.uniforms.uA.value = 1 - seg(p, 0.4, 0.5);
    flatMat.uniforms.uT.value = seg(p, 0.2, 0.4);
    flatMat.uniforms.uA.value = 1 - seg(p, 0.42, 0.5);
    const solidA = seg(p, 0.4, 0.5);
    fill.material.opacity = solidA; fill.material.transparent = solidA < 1; fill.visible = solidA > 0;
    ink.material.uniforms.uA.value = solidA; ink.visible = solidA > 0;
    frame.material.uniforms.uA.value = seg(p, 0.42, 0.5); frame.visible = p > 0.42;
    capFill.material.opacity = capInk.material.uniforms.uA.value = solidA; capFill.visible = capInk.visible = solidA > 0;
    setCut(lerp(0, zFront + 0.01, ease(seg(p, 0.5, 0.66))));

    // 转开：从近乎平行投影的正视图，转到带透视的斜视图
    const orbit = ease(seg(p, 0.5, 0.7)), fly = ease(seg(p, 0.7, 0.86)), inT = ease(seg(p, 0.84, 1));
    const par = 1 - 0.85 * fly;
    const yaw = lerp(0, 0.62, orbit) + px * 0.05 * par, pitch = lerp(0, 0.3, orbit) - py * 0.035 * par;
    camera.fov = lerp(lerp(9, 38, orbit), 60, ease(seg(p, 0.74, 0.88)));
    const aspectFit = Math.max(1, 1.15 / camera.aspect);         // 竖屏时退远一点
    const dist = VIEW_H * lerp(1, 0.92, orbit) * aspectFit / (2 * Math.tan(THREE.MathUtils.degToRad(lerp(9, 38, orbit)) / 2));
    tgt.set(0, 0, -B.H * 0.9 * orbit);
    A.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)).multiplyScalar(dist).add(tgt);
    // 飞进选中单元留下的空腔
    Bv.copy(capC).add(V(0.25, 0.1, 1.5));
    pos.copy(A).lerp(Bv, fly);
    pos.lerp(V(cc.x, cc.y, depth * 0.45), ease(seg(p, 0.8, 0.94)));
    tgt.lerp(V(cc.x, cc.y, depth), fly);
    tgt.add(V(lerp(0.5, -0.5, inT) * fly, 0.12 * inT, 0));
    camera.position.copy(pos); camera.lookAt(tgt); camera.updateProjectionMatrix();
    for (const m of [ink, frame, capInk]) m.material.uniforms.uCam.value.copy(camera.position);
  }
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    for (const m of [ink, frame, capInk]) m.material.uniforms.uRes.value.set(w * dpr, h * dpr);
    dirty = true;
  }
  function render() { apply(); renderer.render(scene, camera); dirty = false; }
  function tick() {
    px += (tx - px) * 0.06; py += (ty - py) * 0.06;
    if (Math.abs(tx - px) + Math.abs(ty - py) > 1e-4) dirty = true;
    if (dirty) render();
    raf = requestAnimationFrame(tick);
  }
  resize();
  return {
    setProgress(p) { prog = Math.min(1, Math.max(0, p)); dirty = true; },
    setPointer(x, y) { tx = x; ty = y; },
    resize, render,
    start() { if (!raf) tick(); },
    stop() { cancelAnimationFrame(raf); raf = 0; },
    info: { cells: B.cells.length, edges: ink.geometry.index.count / 6, tris: fill.geometry.attributes.position.count / 3, buildMs: Math.round(performance.now() - t0) },
  };
}
