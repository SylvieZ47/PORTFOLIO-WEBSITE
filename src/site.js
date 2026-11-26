// ── 十字光标：平时是小十字，移到图片上拉成通长的线（像 CAD 的十字光标）──
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const xh = document.createElement('div');
  xh.className = 'xh';
  xh.setAttribute('aria-hidden', 'true');
  document.body.appendChild(xh);
  addEventListener('mousemove', (e) => {
    document.documentElement.classList.add('has-xh');
    xh.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    xh.classList.toggle('wide', e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO');
  });
  document.addEventListener('mouseleave', () => document.documentElement.classList.remove('has-xh'));
})();

// ── 首页散点悬停：渲染图按自己的比例展开，面积大致相等，以当前屏幕为画框；其余小图淡出 ──
(() => {
  const field = document.querySelector('.field');
  const reveal = field && field.querySelector('.reveal');
  if (!reveal || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const img = reveal.querySelector('img');
  const marks = [...field.querySelectorAll('.mark')];
  const AREA = 0.3;    // 展开图占一屏面积的比例
  const PAD = 32, CAP = 34;
  const TOP = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--top')) || 80;
  marks.forEach((m) => { new Image().src = m.dataset.img; });   // 预加载

  function open(m) {
    const ar = parseFloat(m.dataset.ar) || 1.5;
    const F = field.getBoundingClientRect(), M = m.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = innerHeight - TOP;
    let h = Math.sqrt(AREA * vw * vh / ar);
    h = Math.min(h, vh - PAD - CAP);
    let w = Math.min(h * ar, vw - PAD * 2); h = w / ar;
    const mx = M.left + M.width / 2, my = M.top + M.height / 2;
    const x = Math.max(PAD, Math.min(vw - PAD - w, mx - w / 2)) - F.left;
    const y = Math.max(TOP + PAD / 2, Math.min(innerHeight - PAD / 2 - h - CAP, my - h / 2)) - F.top;
    const cx = mx - F.left, cy = my - F.top;
    img.style.aspectRatio = ar;
    img.src = m.dataset.img;
    reveal.querySelector('.t').textContent = m.dataset.title;
    reveal.querySelector('.y').textContent = m.dataset.year;
    Object.assign(reveal.style, { left: x + 'px', top: y + 'px', width: w + 'px', transition: 'none',
      clipPath: `circle(0px at ${cx - x}px ${cy - y}px)`, opacity: 0 });
    reveal.getBoundingClientRect();
    reveal.style.transition = '';
    reveal.style.opacity = 1;
    reveal.style.clipPath = `circle(${Math.hypot(w, h + CAP)}px at ${cx - x}px ${cy - y}px)`;
    field.classList.add('has-hover'); m.classList.add('on');
  }
  function close(m) {
    reveal.style.opacity = 0;
    field.classList.remove('has-hover'); m.classList.remove('on');
  }
  // 不要太敏感：鼠标在图上停住 DWELL 毫秒才展开；滚动中、以及停止滚动后 QUIET 毫秒内都不展开
  const DWELL = 350, QUIET = 250;
  let timer = 0, quietUntil = 0, shown = null;
  const cancel = () => { clearTimeout(timer); timer = 0; };
  const arm = (m) => {
    if (shown === m || timer || performance.now() < quietUntil) return;
    timer = setTimeout(() => { timer = 0; shown = m; open(m); }, DWELL);
  };
  const calm = () => { quietUntil = performance.now() + QUIET; cancel(); };
  addEventListener('wheel', calm, { passive: true });
  addEventListener('scroll', calm, { passive: true });
  marks.forEach((m) => {
    m.addEventListener('mousemove', () => arm(m));   // 页面滚到鼠标底下不算，鼠标真动了才开始计时
    m.addEventListener('mouseleave', () => { cancel(); if (shown === m) { shown = null; close(m); } });
  });
})();

// ── 首页视频：随滚动推进，播完这一屏才放手（只有放了 assets/home.mp4 才会出现）──
(() => {
  const wrap = document.querySelector('.hero-scroll');
  const v = wrap && wrap.querySelector('video');
  if (!v || matchMedia('(max-width: 800px)').matches) return;
  v.pause();
  const tick = () => {
    if (!v.duration) return;
    const r = wrap.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
    const t = p * (v.duration - 0.05);
    if (Math.abs(v.currentTime - t) > 0.03) v.currentTime = t;
  };
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  v.addEventListener('loadedmetadata', tick);
  tick();
})();

// ── 实验：网点开场 ──
// 一张项目图按亮度画成网点，点距 9px，正好落在背景 18px 网格上（每隔一个点压在网格交点）。
// 往下滚：先是不压网格的点缩没，再是压网格的点缩没，最后只剩背景网格，接上下面的手绘图。
(() => {
  const sec = document.querySelector('.dots');
  if (!sec) return;
  const cv = sec.querySelector('canvas'), ctx = cv.getContext('2d');
  const cap = sec.querySelector('.dcap'), name = sec.querySelector('.dname'), intro = sec.querySelector('.dintro'), src = sec.querySelector('.dsrc');
  const list = JSON.parse(sec.dataset.src || '[]');
  if (!list.length) return;
  const pick = list[Math.floor(Math.random() * list.length)];
  src.textContent = `${pick.t}, ${pick.y}`; src.href = pick.href;
  const P = 9, DS = 3;                     // 点距；亮度表每 3px 取一个样
  let tone = null, tw = 0, th = 0, W = 0, H = 0, dpr = 1, raf = 0;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => { size(); draw(); };
  img.src = pick.img;
  function size() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    if (!img.naturalWidth) return;
    tw = Math.ceil(W / DS); th = Math.ceil(H / DS);
    const o = document.createElement('canvas'); o.width = tw; o.height = th;
    const c = o.getContext('2d');
    const s = Math.max(tw / img.naturalWidth, th / img.naturalHeight);       // cover
    const iw = img.naturalWidth * s, ih = img.naturalHeight * s;
    c.fillStyle = '#fff'; c.fillRect(0, 0, tw, th);
    c.drawImage(img, (tw - iw) / 2, (th - ih) * .45, iw, ih);
    const d = c.getImageData(0, 0, tw, th).data;
    tone = new Float32Array(tw * th);
    let lo = 1, hi = 0;
    for (let i = 0; i < tw * th; i++) { const L = (0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]) / 255; tone[i] = L; lo = Math.min(lo, L); hi = Math.max(hi, L); }
    for (let i = 0; i < tone.length; i++) tone[i] = Math.pow(Math.max(0, Math.min(1, 1 - (tone[i] - lo) / Math.max(.01, hi - lo) - .06)), 1.25);   // 拉满对比，越暗越大
  }
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function draw() {
    raf = 0;
    if (!tone) return;
    const r = sec.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - innerHeight)));
    document.documentElement.classList.toggle('dots-top', p < .92);
    cap.style.opacity = 1 - sm(.55, .9, p);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    // 名字和简介下面让开一块，字才读得清
    const cr = cv.getBoundingClientRect();
    const boxes = [name, intro].map((el) => { const b = el.getBoundingClientRect(); return [b.left - cr.left - 24, b.top - cr.top - 24, b.right - cr.left + 24, b.bottom - cr.top + 18]; });
    const kOff = 1 - sm(0, .5, p), kOn = 1 - sm(.3, 1, p);
    if (kOn <= 0) return;
    const pageTop = cr.top + scrollY;                       // 画布在页面上的位置，用来对齐背景网格
    const oy = ((-pageTop % P) + P) % P, ox = 0;
    const R = P * .58;
    ctx.fillStyle = '#141414';
    for (let y = oy; y < H + P; y += P) {
      const gy = Math.round((y + pageTop) / P) % 2 === 0;
      for (let x = ox; x < W + P; x += P) {
        const gx = Math.round(x / P) % 2 === 0;
        const k = gx && gy ? kOn : kOff;
        if (k <= 0) continue;
        const ti = Math.min(th - 1, Math.max(0, (y / DS) | 0)) * tw + Math.min(tw - 1, Math.max(0, (x / DS) | 0));
        let v = tone[ti];
        if (v < .04) continue;
        let m = 1;
        for (const b of boxes) {
          const dx = Math.max(b[0] - x, 0, x - b[2]), dy = Math.max(b[1] - y, 0, y - b[3]);
          m = Math.min(m, sm(0, 50, Math.hypot(dx, dy)));
        }
        const rad = R * Math.sqrt(v) * k * m;
        if (rad < .35) continue;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fill();
      }
    }
  }
  const req = () => { if (!raf) raf = requestAnimationFrame(draw); };
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', () => { size(); req(); });
})();
