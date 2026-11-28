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
    xh.classList.toggle('wide', e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO' || !!(e.target.closest && e.target.closest('svg.m')));
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

// ── 首页阵列的格角记号：每个格角一个小 +（项目名所在的角不放）。
//    鼠标附近的 + 转过来对着鼠标，离得越远转得越少；鼠标进了某个项目的格子，这格的角变成 ×。
//    手机没有鼠标：+ 随滚动转，滚到屏幕中间是 +，越往上下越接近 ×。
//    + 转 90° 和原来一样，所以角度都在"四倍角"上算（cos 4a, sin 4a），过 45° 不会跳。──
(() => {
  const field = document.querySelector('.field');
  if (!field) return;
  const NS = 'http://www.w3.org/2000/svg', ARM = 4.5;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'marks'); svg.setAttribute('aria-hidden', 'true');
  field.prepend(svg);
  const cells = [...field.querySelectorAll('.cell')];
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let marks = [], pw = 1, ph = 1, mouse = null, over = null, raf = 0, box = null;

  function layout() {
    const W = field.clientWidth, H = field.clientHeight, cs = getComputedStyle(field);
    const cols = parseInt(cs.getPropertyValue('--cols')) || 8, rows = parseInt(cs.getPropertyValue('--rows')) || 5;
    pw = W / cols; ph = H / rows;
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    const taken = new Set(cells.map((c) => Math.round(c.offsetLeft / pw) + ',' + Math.round(c.offsetTop / ph)));
    svg.textContent = ''; marks = [];
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
      if (taken.has(i + ',' + j)) continue;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M${-ARM} 0H${ARM}M0 ${-ARM}V${ARM}`);
      svg.appendChild(p);
      const m = { el: p, i, j, x: i * pw, y: j * ph, u: [1, 0] };
      marks.push(m); place(m);
    }
  }
  function place(m) {
    const a = Math.atan2(m.u[1], m.u[0]) / 4 * 180 / Math.PI;
    m.el.setAttribute('transform', `translate(${m.x.toFixed(1)} ${m.y.toFixed(1)}) rotate(${a.toFixed(2)})`);
  }
  function target(m, R) {
    if (over && (m.i === over[0] || m.i === over[0] + 1) && (m.j === over[1] || m.j === over[1] + 1)) return [-1, 0];   // ×
    if (fine) {
      if (!mouse) return [1, 0];
      const dx = mouse[0] - box.left - m.x, dy = mouse[1] - box.top - m.y, d = Math.hypot(dx, dy);
      if (d >= R) return [1, 0];
      const w = Math.pow(1 - d / R, 1.4), t = 4 * Math.atan2(dy, dx);
      return [w * Math.cos(t) + (1 - w), w * Math.sin(t)];
    }
    const p = (innerHeight / 2 - (box.top + m.y)) / innerHeight;
    const a = Math.max(-1, Math.min(1, p * 1.6)) * Math.PI;   // 四倍角里 ±π = ±45°
    return [Math.cos(a), Math.sin(a)];
  }
  function tick() {
    raf = 0;
    const R = 2.4 * pw;
    box = field.getBoundingClientRect();
    let moving = false;
    marks.forEach((m) => {
      const t = target(m, R), u = m.u;
      const nu = [u[0] + (t[0] - u[0]) * 0.16, u[1] + (t[1] - u[1]) * 0.16];
      if (Math.abs(nu[0] - u[0]) + Math.abs(nu[1] - u[1]) > 1e-3) moving = true;
      m.u = nu; place(m);
    });
    if (moving) raf = requestAnimationFrame(tick);
  }
  const kick = () => { if (!raf && !still) raf = requestAnimationFrame(tick); };
  layout();
  if ('ResizeObserver' in window) new ResizeObserver(() => { layout(); kick(); }).observe(field); else addEventListener('resize', () => { layout(); kick(); });
  if (fine) {
    addEventListener('mousemove', (e) => { mouse = [e.clientX, e.clientY]; kick(); }, { passive: true });
    addEventListener('scroll', kick, { passive: true });
    document.addEventListener('mouseleave', () => { mouse = null; kick(); });
    cells.forEach((c) => {
      c.addEventListener('mouseenter', () => { over = [Math.round(c.offsetLeft / pw), Math.round(c.offsetTop / ph)]; kick(); });
      c.addEventListener('mouseleave', () => { over = null; kick(); });
    });
  } else {
    addEventListener('scroll', kick, { passive: true });
    kick();
  }
})();
