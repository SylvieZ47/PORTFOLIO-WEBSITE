// 占位图生成器：根据 tone 名生成 SVG 数据 URL
// 用法：placeholderImage('sand', 1600, 1000, '01 · Approach')
window.PLACEHOLDER_TONES = {
  'sand':        ['#d8c9b0', '#a89071'],
  'sand-dark':   ['#7a6649', '#3d3324'],
  'sand-light':  ['#ebe0cc', '#c9b896'],
  'wood':        ['#a07a4f', '#5e4326'],
  'wood-dark':   ['#3d2a18', '#1c130a'],
  'stone':       ['#aaa9a3', '#6b6a64'],
  'stone-dark':  ['#3a3936', '#1a1a18'],
  'stone-light': ['#d6d4cd', '#a3a19a'],
  'plaster':     ['#e8e2d4', '#b8a98e'],
  'plaster-dark':['#857560', '#3e3528'],
  'desert':      ['#c9a279', '#7a4f2a'],
  'desert-dark': ['#5a361b', '#1f1209'],
  'desert-light':['#ead4b3', '#b88f60'],
  'paper':       ['#efece2', '#bcb6a3'],
  'paper-dark':  ['#7d7665', '#2e2a22'],
  'brick':       ['#9a5942', '#4a2418'],
  'brick-dark':  ['#321611', '#0e0604'],
  'shadow':      ['#9d978b', '#2c2a26'],
  'shadow-dark': ['#26241f', '#0a0907'],
  'mist':        ['#b6b6ae', '#6e6e66'],
  'mist-dark':   ['#3d3d36', '#171714'],
  'mist-light':  ['#dbdbd2', '#a3a399'],
  'study':       ['#c9bca0', '#7a6a4c'],
  'study-dark':  ['#3a2f1f', '#13100a']
};

window.placeholderImage = function (tone, w, h, label) {
  const c = window.PLACEHOLDER_TONES[tone] || ['#cfcabb', '#6c6657'];
  w = w || 1600;
  h = h || 1000;
  label = label || '';
  const seed = (tone || 'x').split('').reduce((a, ch) => a + ch.charCodeAt(0), 0);
  // 几何线条：从 seed 派生，不同 tone 不同构图
  const phase = (seed % 7) / 7;
  const horizonY = h * (0.42 + 0.18 * phase);
  const colW = w * (0.28 + 0.12 * ((seed % 5) / 5));
  const colX = w * (0.12 + 0.55 * ((seed % 3) / 3));
  const colH = h * (0.62 + 0.18 * ((seed % 4) / 4));

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${c[0]}"/>
        <stop offset="1" stop-color="${c[1]}"/>
      </linearGradient>
      <filter id="n">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}"/>
        <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0"/>
        <feComposite in2="SourceGraphic" operator="in"/>
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect x="0" y="${horizonY}" width="${w}" height="1.5" fill="${c[1]}" opacity="0.5"/>
    <rect x="${colX}" y="${horizonY - colH * 0.85}" width="${colW}" height="${colH}" fill="${c[1]}" opacity="0.45"/>
    <rect x="${colX + colW * 1.4}" y="${horizonY - colH * 0.55}" width="${colW * 0.55}" height="${colH * 0.65}" fill="${c[0]}" opacity="0.45"/>
    <rect width="${w}" height="${h}" filter="url(#n)"/>
    <text x="${w - 28}" y="${h - 22}" font-family="ui-monospace, monospace" font-size="18" fill="${c[1]}" opacity="0.55" text-anchor="end" letter-spacing="0.08em">${label}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
};
