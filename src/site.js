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
