// Direction C v3 — Dark Atlas
// - Rail collapses to portrait icon, expand on hover
// - Hero: scroll-driven video (drop in assets/hero.mp4)
// - Home = Hero + large cinema cards (scroll continues into them)
// - Index = separate compact RED-style grid (see index-and-exploration.jsx)
// - Smart back navigation (remembers origin)
// - Year font unified to mono everywhere
// - Area auto-converts: sqft (EN, with commas) ↔ ㎡ (ZH)
// - Coordinates per project, decimal
// - Self-portrait used in rail, back-to-top, contact, favicon
// - About → Index swap in rail order
// - Awards → Exploration in rail; CV keeps Skills + Awards & Honors

const C_lang = (() => {
  const Ctx = React.createContext(['en', () => {}]);
  return { Provider: Ctx.Provider, use: () => React.useContext(Ctx) };
})();
const ctx = (obj, lang) => typeof obj === 'string' ? obj : obj?.[lang] ?? obj?.en ?? '';

// ── Formatting helpers ─────────────────────────────────────
function fmtNum(n) {return n == null ? '' : n.toLocaleString('en-US');}
function fmtArea(sqft, lang) {
  if (sqft == null) return null;
  if (lang === 'en') return fmtNum(sqft) + ' sq ft';
  // 1 sq ft = 0.092903 m²
  const sqm = Math.round(sqft * 0.092903);
  return fmtNum(sqm) + ' ㎡';
}
function fmtCoords(c) {
  if (!c) return '';
  const lat = c.lat.toFixed(2);
  const lng = c.lng.toFixed(2);
  const latH = c.lat >= 0 ? 'N' : 'S';
  const lngH = c.lng >= 0 ? 'E' : 'W';
  return Math.abs(lat) + '°' + latH + ' ' + Math.abs(lng) + '°' + lngH;
}
function projectYear(p) {return p.year_range || String(p.year);}

const TRACK_CODE = { professional: 'PRO', academic: 'ACA', research: 'RES' };

// ── Navigation history (for smart "back") ─────────────────
const NavCtx = React.createContext({ from: null, setFrom: () => {} });

// ── Tweak defaults ─────────────────────────────────────────
const TWEAKS_DEFAULTS = window.TWEAKS_DEFAULTS || {
  accent: '#c98552', palette: 'warm', serif: 'cormorant',
  heroFont: 'verdana', heroSize: 90, heroItalic: false, heroDarken: 40,
  heroVideoOpacity: 100,
  rail: 'hover',
  aboutPortraitSize: 180, aboutPortraitX: 0, aboutPortraitY: 0
};

const PALETTES = {
  warm: { bg: '#0e0d0b', bg2: '#16140f', ink: '#efe9dc', mute: 'rgba(239,233,220,0.5)', faint: 'rgba(239,233,220,0.25)', rule: 'rgba(239,233,220,0.12)' },
  neutral: { bg: '#111111', bg2: '#1a1a1a', ink: '#ededed', mute: 'rgba(237,237,237,0.5)', faint: 'rgba(237,237,237,0.25)', rule: 'rgba(237,237,237,0.12)' },
  cool: { bg: '#0c1014', bg2: '#141a20', ink: '#e6ecf0', mute: 'rgba(230,236,240,0.5)', faint: 'rgba(230,236,240,0.25)', rule: 'rgba(230,236,240,0.12)' },
  ink: { bg: '#181612', bg2: '#221f1a', ink: '#f3ede0', mute: 'rgba(243,237,224,0.55)', faint: 'rgba(243,237,224,0.28)', rule: 'rgba(243,237,224,0.14)' }
};
const SERIFS = {
  times: `"Times New Roman", "Songti SC", "Noto Serif SC", serif`,
  cormorant: `"Cormorant Garamond", "Times New Roman", "Songti SC", serif`,
  newsreader: `"Newsreader", "Times New Roman", "Songti SC", serif`,
  fraunces: `"Fraunces", "Times New Roman", "Songti SC", serif`
};
const HERO_FONTS = {
  verdana: `"Verdana", "Helvetica Neue", "PingFang SC", sans-serif`,
  cormorant: `"Cormorant Garamond", "Songti SC", serif`,
  newsreader: `"Newsreader", "Songti SC", serif`,
  fraunces: `"Fraunces", "Songti SC", serif`,
  helvetica: `"Helvetica Neue", "Helvetica", "PingFang SC", sans-serif`
};

function applyTweaks(t) {
  const root = document.documentElement;
  const p = PALETTES[t.palette] || PALETTES.warm;
  Object.entries(p).forEach(([k, v]) => root.style.setProperty(`--c-${k}`, v));
  root.style.setProperty('--c-accent', t.accent);
  root.style.setProperty('--c-serif', SERIFS[t.serif] || SERIFS.times);
  root.style.setProperty('--c-hero-font', HERO_FONTS[t.heroFont] || HERO_FONTS.verdana);
  root.style.setProperty('--c-hero-size', `clamp(48px, ${t.heroSize / 10}vw, ${t.heroSize * 1.8}px)`);
  root.style.setProperty('--c-hero-darken', String(1 - t.heroDarken / 100));
  root.style.setProperty('--c-hero-video-opacity', String((t.heroVideoOpacity ?? 100) / 100));
  root.style.setProperty('--c-about-portrait-size', `${t.aboutPortraitSize ?? 180}px`);
  root.style.setProperty('--c-about-portrait-x', `${t.aboutPortraitX ?? 0}px`);
  root.style.setProperty('--c-about-portrait-y', `${t.aboutPortraitY ?? 0}px`);
}

// ── SVG icon set (unified 14×14, same baseline) ──────────────────
const RAIL_ICONS = {
  home: <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 7l6-5 6 5v6.5a.5.5 0 0 1-.5.5H2.5a.5.5 0 0 1-.5-.5V7z" /><path d="M6.5 14V9.5h3V14" /></svg>,
  about: <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="5.5" r="2.6" /><path d="M2.5 14c.6-2.6 2.9-4.5 5.5-4.5s4.9 1.9 5.5 4.5" /></svg>,
  index: <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><rect x="2" y="2" width="3.5" height="3.5" /><rect x="6.25" y="2" width="3.5" height="3.5" /><rect x="10.5" y="2" width="3.5" height="3.5" /><rect x="2" y="6.25" width="3.5" height="3.5" /><rect x="6.25" y="6.25" width="3.5" height="3.5" /><rect x="10.5" y="6.25" width="3.5" height="3.5" /><rect x="2" y="10.5" width="3.5" height="3.5" /><rect x="6.25" y="10.5" width="3.5" height="3.5" /><rect x="10.5" y="10.5" width="3.5" height="3.5" /></svg>,
  cv: <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3.5 1.5h6L13 5v9a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-12a.5.5 0 0 1 .5-.5z" /><path d="M9 1.5V5h4" /><path d="M5.5 8.5h5M5.5 11h5M5.5 13h3" /></svg>,
  exploration: <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M8 1l1.2 4.8L14 7l-4.8 1.2L8 13l-1.2-4.8L2 7l4.8-1.2L8 1z" /></svg>,
  contact: <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="2.2" /><path d="M10.2 8v1.6c0 1 .7 1.7 1.5 1.6" /></svg>
};

// ── Portrait icon (used in rail, back-to-top, contact) ────
function PortraitIcon({ size = 28, className = '' }) {
  return (
    <img
      src="assets/portrait-white.png"
      alt=""
      className={`c-portrait ${className}`}
      style={{ width: size, height: size }} />);


}

// ── Side rail ─────────────────────────────────────────────
function CRail({ route, setRoute, railMode }) {
  const [lang, setLang] = C_lang.use();
  const [expanded, setExpanded] = React.useState(false);
  const railRef = React.useRef(null);
  const items = [
  { id: 'home', en: 'Home', zh: '主页' },
  { id: 'about', en: 'About', zh: '简介' },
  { id: 'index', en: 'Index', zh: '索引' },
  { id: 'cv', en: 'CV', zh: 'CV' },
  { id: 'exploration', en: 'Exploration', zh: '探索' },
  { id: 'contact', en: 'Contact', zh: '联系' }];


  // Native listeners + 250ms delay — quick mouseover or direct icon clicks pass through.
  // Use real DOM events (not React synthetic) so programmatic mouseenter works too.
  React.useEffect(() => {
    if (railMode !== 'hover') {setExpanded(false);return;}
    const el = railRef.current;
    if (!el) return;
    let timer = null;
    const enter = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setExpanded(true), 250);
    };
    const leave = () => {
      clearTimeout(timer);
      setExpanded(false);
    };
    el.addEventListener('mouseenter', enter);
    el.addEventListener('mouseleave', leave);
    return () => {
      clearTimeout(timer);
      el.removeEventListener('mouseenter', enter);
      el.removeEventListener('mouseleave', leave);
    };
  }, [railMode]);

  return (
    <aside
      ref={railRef}
      className={`c-rail c-rail-${railMode} ${expanded ? 'is-expanded' : ''}`}
      style={railMode === 'hover' ? { width: expanded ? 'var(--c-rail-w)' : 'var(--c-rail-w-mini)' } : undefined}>
      
      <button className="c-rail-mark" onClick={() => setRoute({ page: 'home' })}>
        <span className="c-rail-mark-mini"><PortraitIcon size={32} /></span>
        <span className="c-rail-mark-name">Sylvie Zhang</span>
        <span className="c-rail-mark-role">{lang === 'en' ? 'Architectural Designer' : '建筑设计师'}</span>
        <span className="c-rail-mark-loc">34.05°N 118.24°W</span>
      </button>

      <nav className="c-rail-nav">
        {items.map((it) => {
          const active = route.page === it.id ||
          it.id === 'index' && route.page === 'project' && route.from === 'index';
          return (
            <button
              key={it.id}
              className={`c-rail-link ${active ? 'is-active' : ''}`}
              onClick={() => setRoute({ page: it.id })}>
              
              <span className="c-rail-link-tick"></span>
              <span className="c-rail-link-icon">{RAIL_ICONS[it.id]}</span>
              <span className="c-rail-link-text">{ctx(it, lang)}</span>
            </button>);

        })}
      </nav>

      <div className="c-rail-foot">
        <button className="c-rail-lang" onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}>
          <span className={lang === 'en' ? 'is-on' : ''}>EN</span>
          <span className="c-rail-lang-sep"> · </span>
          <span className={lang === 'zh' ? 'is-on' : ''}>中</span>
        </button>
        <div className="c-rail-stamp">© MMXXVI</div>
      </div>
    </aside>);

}

// ── Custom cursor ─────────────────────────────────────────
function CCursor() {
  const ref = React.useRef(null);
  React.useEffect(() => {
    let x = 0,y = 0,tx = 0,ty = 0;
    const onMove = (e) => {tx = e.clientX;ty = e.clientY;};
    window.addEventListener('mousemove', onMove);
    let raf;
    const tick = () => {
      x += (tx - x) * 0.28;y += (ty - y) * 0.28;
      if (ref.current) ref.current.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {window.removeEventListener('mousemove', onMove);cancelAnimationFrame(raf);};
  }, []);
  return <div ref={ref} className="c-cursor" aria-hidden="true"></div>;
}

// ── Track / Role chips ────────────────────────────────────
function TrackChip({ track, lang }) {
  const label = ctx(window.PROJECT_TAXONOMY.track.options.find((o) => o.id === track)?.label || '', lang);
  return (
    <span className={`c-track c-track-${track}`}>
      <span className="c-track-code">{TRACK_CODE[track] || ''}</span>
      <span className="c-track-label">{label}</span>
    </span>);

}
function RoleChip({ role, lang }) {
  const text = ctx(role, lang);
  const en = (role?.en || '').toLowerCase();
  const isLead = en.includes('lead') || en.includes('author') || en.includes('independent') ||
  (role?.zh || '').includes('主创') || (role?.zh || '').includes('独立');
  return (
    <span className={`c-role ${isLead ? 'c-role-lead' : 'c-role-team'}`}>
      <span className="c-role-dot"></span>
      <span className="c-role-text">{text}</span>
    </span>);

}

// ── Coordinates chip ──────────────────────────────────────
function CoordChip({ coords, className = '' }) {
  if (!coords) return null;
  return <span className={`c-coord ${className}`}>{fmtCoords(coords)}</span>;
}

// ── Year display (mono) ───────────────────────────────────
function Yr({ children }) {return <span className="c-yr">{children}</span>;}

// ── Home stage: scrollytelling — sticky video bg + hero + about ──────────
//   Video plays via scroll across whole stage; opacity fades into About;
//   video finishes when About finishes scrolling.
function CHomeStage({ onScrollToCinema }) {
  const [lang] = C_lang.use();
  const videoRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const aboutRef = React.useRef(null);
  const [time, setTime] = React.useState('');
  const cv = window.CV_DATA;

  React.useEffect(() => {
    const t = () => {
      const d = new Date();
      const opts = { timeZone: 'America/Los_Angeles', hour: '2-digit', minute: '2-digit', hour12: false };
      setTime(new Intl.DateTimeFormat('en-US', opts).format(d) + ' LA');
    };
    t();
    const id = setInterval(t, 30000);
    return () => clearInterval(id);
  }, []);

  // Scroll-driven: video time AND opacity fade
  React.useEffect(() => {
    const video = videoRef.current;
    const stage = stageRef.current;
    if (!video || !stage) return;
    let rafPending = false;
    const tick = () => {
      rafPending = false;
      if (!video.duration) return;
      const rect = stage.getBoundingClientRect();
      const range = stage.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, Math.min(range, -rect.top));
      const p = range > 0 ? scrolled / range : 0;
      // Video time: linear over full stage so it finishes when stage ends
      const target = p * video.duration;
      if (Math.abs(video.currentTime - target) > 0.04) {
        try {video.currentTime = target;} catch (e) {}
      }
      // Fade: hold at 1 during hero (0–0.25), fade 1→0.18 during about (0.25–0.85), hold (0.85–1)
      let fade;
      if (p < 0.25) fade = 1;else
      if (p > 0.85) fade = 0.18;else
      fade = 1 - (p - 0.25) / 0.6 * 0.82;
      video.style.setProperty('--c-hero-fade', fade.toFixed(3));
    };
    const onScroll = () => {if (!rafPending) {rafPending = true;requestAnimationFrame(tick);}};
    const onMeta = () => tick();
    video.addEventListener('loadedmetadata', onMeta);
    if (video.readyState >= 1) onMeta();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', tick);
    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', tick);
    };
  }, []);

  const scrollToAbout = () => aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <section ref={stageRef} className="c-home-stage" data-screen-label="C · Home Stage">
      <div className="c-home-sticky">
        <video
          ref={videoRef}
          className="c-home-video"
          src="assets/hero.mp4"
          muted
          playsInline
          preload="auto" />
        
        <div className="c-home-veil"></div>
      </div>

      <div className="c-home-narrative">
        {/* Screen 1 — Hero (1 viewport) */}
        <div className="c-hero-screen" data-screen-label="C · Hero">
          <div className="c-hero-top">
            <div className="c-tag">{lang === 'en' ? 'Selected works · 2015—2026' : '作品选 · 2015—2026'}</div>
            <div className="c-tag c-hero-top-r">{time} · 34.05°N 118.24°W</div>
          </div>

          <h1 className="c-hero-name">
            <span className="c-hero-name-l1">Sylvie</span>
            <span className="c-hero-name-l2">Zhang</span>
          </h1>

          <div className="c-hero-bottom">
            <div className="c-hero-lede">
              {lang === 'en' ?
              'An architectural designer based in Los Angeles. Rooms, courtyards & thresholds — built and unbuilt.' :
              '洛杉矶建筑设计师。关于房间、庭院与门槛——已建成与未建成的。'}
            </div>
            <button className="c-hero-enter" onClick={scrollToAbout}>
              <span>{lang === 'en' ? 'About me' : '认识我'}</span>
              <span className="c-hero-enter-arrow">↓</span>
            </button>
          </div>

          <div className="c-hero-scrollhint" aria-hidden="true">
            <span className="c-hero-scrollhint-line"></span>
            <span className="c-hero-scrollhint-text">{lang === 'en' ? 'scroll to play' : '滚动播放'}</span>
          </div>
        </div>

        {/* Screen 2 — About (woven across the rest of the scroll) */}
        <div ref={aboutRef} className="c-home-about" data-screen-label="C · Home / About">
          <div className="c-home-about-inner">
            <div className="c-home-about-tag">— {lang === 'en' ? 'About' : '关于'}</div>
            <h2 className="c-home-about-headline">
              {lang === 'en' ?
              <>An architectural designer based in <em>Los Angeles</em>.</> :
              <>一名常驻<em>洛杉矶</em>的建筑设计师。</>}
            </h2>
            <p className="c-home-about-bio">{ctx(cv.bio, lang)}</p>

            <dl className="c-home-about-meta">
              <div><dt>{lang === 'en' ? 'Based' : '常驻'}</dt><dd>Los Angeles, CA</dd></div>
              <div><dt>{lang === 'en' ? 'Coordinates' : '坐标'}</dt><dd className="c-mono-cell">34.05°N 118.24°W</dd></div>
              <div><dt>{lang === 'en' ? 'Practice' : '实践'}</dt><dd>{lang === 'en' ? 'Independent' : '独立实践'}</dd></div>
              <div><dt>{lang === 'en' ? 'Focus' : '关注'}</dt><dd>{lang === 'en' ? 'Domestic life & dwelling' : '日常生活与居住'}</dd></div>
            </dl>

            <button className="c-home-about-cta" onClick={onScrollToCinema}>
              <span>{lang === 'en' ? 'See the works' : '查看作品'}</span>
              <span className="c-hero-enter-arrow">↓</span>
            </button>
          </div>
        </div>
      </div>
    </section>);

}

// ── Cinema item (large, image with overlay block) ─────────
function CCinemaItem({ project: p, idx, setRoute }) {
  const [lang] = C_lang.use();
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setVisible(true)),
    { threshold: 0.15 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <article
      ref={ref}
      className={`c-frame ${visible ? 'is-in' : ''}`}
      onClick={() => setRoute({ page: 'project', slug: p.slug, from: 'home' })}>
      
      <img className="c-frame-img"
      src={window.placeholderImage(p.images[0].tone, 2000, 1300, '')}
      alt="" loading="lazy" />

      <div className="c-frame-top">
        <TrackChip track={p.track} lang={lang} />
        <div className="c-frame-top-r">
          <CoordChip coords={p.coords} />
          <span className="c-frame-no">№ {String(idx + 1).padStart(2, '0')}</span>
        </div>
      </div>

      <div className="c-frame-bottom">
        <div className="c-frame-place">
          <span>{ctx(p.location, lang)}</span>
          <span className="c-frame-place-sep">·</span>
          <Yr>{projectYear(p)}</Yr>
          {p.area_sqft && <>
            <span className="c-frame-place-sep">·</span>
            <span>{fmtArea(p.area_sqft, lang)}</span>
          </>}
        </div>
        <h3 className="c-frame-title">{ctx(p.title, lang)}</h3>
        <p className="c-frame-summary">{ctx(p.summary, lang)}</p>
        <div className="c-frame-meta-row">
          <RoleChip role={p.role} lang={lang} />
          <span className="c-frame-cta">
            <span>{lang === 'en' ? 'Open project' : '查看项目'}</span>
            <span className="c-frame-cta-arrow">→</span>
          </span>
        </div>
      </div>
    </article>);

}

// ── Cinema section ────────────────────────────────────────
const CCinema = React.forwardRef(function CCinema({ setRoute }, ref) {
  const [lang] = C_lang.use();
  const projects = window.PROJECTS;
  return (
    <section ref={ref} className="c-cinema-section" data-screen-label="C · Cinema">
      <div className="c-cinema-head">
        <div className="c-tag">— {lang === 'en' ? 'Selected works' : '精选作品'}</div>
        <h2 className="c-cinema-title">{lang === 'en' ? 'Works' : '作品'}</h2>
        <div className="c-cinema-sub">
          {lang === 'en' ?
          <>Cinematic scroll. For the catalogue, see <button className="c-link" onClick={() => setRoute({ page: 'index' })}>Index ↗</button></> :
          <>电影式浏览。需要快速浏览，进入 <button className="c-link" onClick={() => setRoute({ page: 'index' })}>索引 ↗</button></>}
        </div>
      </div>
      <div className="c-cinema">
        {projects.map((p, i) => <CCinemaItem key={p.id} project={p} idx={i} setRoute={setRoute} />)}
      </div>
    </section>);

});

// ── Home = sticky stage + cinema cards ─────────────────────
function CHome({ setRoute }) {
  const cinemaRef = React.useRef(null);
  const scrollToCinema = () => {
    cinemaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <div className="c-home" data-screen-label="C · Home">
      <CHomeStage onScrollToCinema={scrollToCinema} />
      <CCinema ref={cinemaRef} setRoute={setRoute} />
    </div>);

}

// ── Project Detail ────────────────────────────────────────
function CProject({ slug, from, setRoute }) {
  const [lang] = C_lang.use();
  const p = window.PROJECTS.find((x) => x.slug === slug);
  if (!p) return <div className="c-doc">—</div>;
  const idx = window.PROJECTS.findIndex((x) => x.id === p.id);
  const next = window.PROJECTS[(idx + 1) % window.PROJECTS.length];
  const backTo = from === 'index' ? 'index' : 'home';
  const backLabel = backTo === 'index' ?
  lang === 'en' ? 'Index' : '索引' :
  lang === 'en' ? 'Home' : '主页';

  React.useEffect(() => {window.scrollTo({ top: 0, behavior: 'instant' });}, [slug]);

  return (
    <article className="c-project" data-screen-label="C · Project">
      <button className="c-back" onClick={() => setRoute({ page: backTo })}>
        ← {backLabel}
      </button>

      <div className="c-cover">
        <img src={window.placeholderImage(p.images[0].tone, 2400, 1500, '')} alt="" />
        <div className="c-cover-overlay">
          <div className="c-cover-tags">
            <TrackChip track={p.track} lang={lang} />
            <RoleChip role={p.role} lang={lang} />
            <CoordChip coords={p.coords} className="c-coord-on-image" />
          </div>
          <h1 className="c-cover-title">{ctx(p.title, lang)}</h1>
          <div className="c-cover-sub">{ctx(p.location, lang)} · <Yr>{projectYear(p)}</Yr></div>
        </div>
      </div>

      <div className="c-intro">
        <dl className="c-intro-facts">
          <div><dt>{lang === 'en' ? 'Year' : '年份'}</dt><dd><Yr>{projectYear(p)}</Yr></dd></div>
          <div><dt>{lang === 'en' ? 'Location' : '地点'}</dt><dd>{ctx(p.location, lang)}</dd></div>
          <div><dt>{lang === 'en' ? 'Coordinates' : '坐标'}</dt><dd className="c-mono-cell">{fmtCoords(p.coords)}</dd></div>
          <div><dt>{lang === 'en' ? 'Type' : '类型'}</dt><dd>{ctx(window.PROJECT_TAXONOMY.type.options.find((o) => o.id === p.type)?.label || '', lang)}</dd></div>
          <div><dt>{lang === 'en' ? 'Track' : '类别'}</dt><dd>{ctx(window.PROJECT_TAXONOMY.track.options.find((o) => o.id === p.track)?.label || '', lang)}</dd></div>
          {p.area_sqft && <div><dt>{lang === 'en' ? 'Area' : '面积'}</dt><dd>{fmtArea(p.area_sqft, lang)}</dd></div>}
          <div className="c-intro-facts-role"><dt>{lang === 'en' ? 'My Role' : '我的角色'}</dt><dd>{ctx(p.role, lang)}</dd></div>
        </dl>
        <p className="c-intro-summary">{ctx(p.summary, lang)}</p>
      </div>

      <div className="c-plates">
        {p.images.map((img, i) =>
        <CPlate key={i} idx={i + 1} src={window.placeholderImage(img.tone, 2000, 1200, '')} caption={img.label} />
        )}
      </div>

      {p.drawings.length > 0 &&
      <div className="c-drawings-block">
          <div className="c-tag c-tag-line">— {lang === 'en' ? 'Drawings' : '图纸'}</div>
          <div className="c-drawings">
            {p.drawings.map((d, i) =>
          <figure key={i} className="c-drawing">
                <img src={window.placeholderImage('paper-dark', 1400, 1000, d.label)} alt="" loading="lazy" />
                <figcaption>{d.label}</figcaption>
              </figure>
          )}
          </div>
        </div>
      }

      {p.awards &&
      <div className="c-awards-block">
          <div className="c-tag c-tag-line">— {lang === 'en' ? 'Recognition' : '获奖'}</div>
          {p.awards.map((a, i) => <div key={i} className="c-award-row">{ctx(a, lang)}</div>)}
        </div>
      }

      <button
        className="c-next"
        onClick={() => setRoute({ page: 'project', slug: next.slug, from })}>
        
        <div className="c-next-l">
          <div className="c-tag">{lang === 'en' ? 'Next' : '下一件'} →</div>
          <div className="c-next-title">{ctx(next.title, lang)}</div>
          <div className="c-next-sub">{ctx(next.location, lang)} · <Yr>{next.year}</Yr></div>
        </div>
        <img className="c-next-img" src={window.placeholderImage(next.images[0].tone, 800, 600, '')} alt="" />
      </button>
    </article>);

}

function CPlate({ idx, src, caption }) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setVisible(true)),
    { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <figure ref={ref} className={`c-plate ${visible ? 'is-in' : ''}`}>
      <img src={src} alt="" loading="lazy" />
      <figcaption>
        <span className="c-plate-no">PL.{String(idx).padStart(2, '0')}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>);

}

// ── About / CV / Contact ──────────────────────────────────
function CAbout() {
  const [lang] = C_lang.use();
  const cv = window.CV_DATA;
  return (
    <section className="c-doc" data-screen-label="C · About">
      <div className="c-doc-head c-about-head">
        <div className="c-about-head-text">
          <div className="c-tag">— {lang === 'en' ? 'About' : '关于'}</div>
          <h1 className="c-doc-title" style={{ fontFamily: "Helvetica" }}>{lang === 'en' ? 'About' : '简介'}</h1>
        </div>
        <div className="c-about-head-portrait">
          <PortraitIcon size={180} className="c-about-portrait" />
        </div>
      </div>
      <div className="c-about-stack">
        <p className="c-doc-lede">{ctx(cv.bio, lang)}</p>
        <div className="c-about-meta">
          <div><span className="c-tag">{lang === 'en' ? 'Based' : '常驻'}</span><span>Los Angeles, CA</span></div>
          <div><span className="c-tag">{lang === 'en' ? 'Coordinates' : '坐标'}</span><span className="c-mono-cell">34.05°N 118.24°W</span></div>
          <div><span className="c-tag">{lang === 'en' ? 'Practice' : '实践'}</span><span>{lang === 'en' ? 'Independent' : '独立实践'}</span></div>
          <div><span className="c-tag">{lang === 'en' ? 'Focus' : '关注'}</span><span>{lang === 'en' ? 'Domestic life & dwelling' : '日常生活与居住'}</span></div>
        </div>
      </div>
    </section>);

}

function CCV() {
  const [lang] = C_lang.use();
  const cv = window.CV_DATA;
  return (
    <section className="c-doc" data-screen-label="C · CV">
      <div className="c-doc-head">
        <div className="c-tag">— Curriculum Vitae</div>
        <h1 className="c-doc-title">CV</h1>
        <button className="c-pdf" onClick={() => alert(lang === 'en' ? 'PDF placeholder' : 'PDF 占位')}>
          ↓ {lang === 'en' ? 'Download PDF' : '下载 PDF'}
        </button>
      </div>

      <CCVBlock title={lang === 'en' ? 'Education' : '教育'}
      rows={cv.education.map((e) => ({ year: e.year, line1: ctx(e.school, lang), line2: ctx(e.degree, lang) }))} />
      <CCVBlock title={lang === 'en' ? 'Experience' : '经历'}
      rows={cv.experience.map((e) => ({ year: e.year, line1: ctx(e.firm, lang), line2: ctx(e.role, lang) }))} />

      {/* Skills */}
      <div className="c-cv-block">
        <h2>{lang === 'en' ? 'Skills' : '技能'}</h2>
        <div className="c-skills">
          {cv.skills.map((s, i) =>
          <div key={i} className="c-skill-row">
              <div className="c-skill-group">{ctx(s.group, lang)}</div>
              <div className="c-skill-items">
                {s.items.map((it, j) => <span key={j} className="c-skill-pill">{it}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <CCVBlock title={lang === 'en' ? 'Awards & Honors' : '获奖'}
      rows={cv.awards.map((a) => ({ year: a.year, line1: lang === 'en' ? a.en : a.zh }))} />
    </section>);

}
function CCVBlock({ title, rows }) {
  return (
    <div className="c-cv-block">
      <h2>{title}</h2>
      <div className="c-cv-rows">
        {rows.map((r, i) =>
        <div key={i} className="c-cv-row">
            <div className="c-cv-year"><Yr>{r.year}</Yr></div>
            <div className="c-cv-body">
              <div className="c-cv-line1">{r.line1}</div>
              {r.line2 && <div className="c-cv-line2">{r.line2}</div>}
            </div>
          </div>
        )}
      </div>
    </div>);

}

function CContact() {
  const [lang] = C_lang.use();
  const cv = window.CV_DATA;
  return (
    <section className="c-doc c-contact" data-screen-label="C · Contact">
      <div className="c-doc-head">
        <div className="c-tag">— {lang === 'en' ? 'Get in touch' : '联系方式'}</div>
        <h1 className="c-doc-title">{lang === 'en' ? 'Contact' : '联系'}</h1>
      </div>
      <div className="c-contact-rows">
        <a className="c-contact-row" href={`mailto:${cv.contact.email}`}>
          <span className="c-contact-key">e.</span>
          <span className="c-contact-val">{cv.contact.email}</span>
          <PortraitIcon size={26} className="c-contact-portrait" />
        </a>
        <a className="c-contact-row" href={`https://${cv.contact.linkedin}`} target="_blank" rel="noopener">
          <span className="c-contact-key">in.</span>
          <span className="c-contact-val">{cv.contact.linkedin}</span>
        </a>
        <div className="c-contact-row c-contact-row-static">
          <span className="c-contact-key">@</span>
          <span className="c-contact-val">Los Angeles, California · <span className="c-mono-cell">34.05°N 118.24°W</span></span>
        </div>
      </div>
    </section>);

}

// ── Back-to-top button (portrait, appears on scroll) ──────
function CBackToTop() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      className={`c-totop ${show ? 'is-on' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      title="Back to top">
      
      <PortraitIcon size={42} />
      <span className="c-totop-arrow" style={{ color: "rgb(250, 255, 0)", backgroundColor: "rgb(230, 220, 201)" }}>
</span>
    </button>);
}

// ── Tweaks panel ──────────────────────────────────────────
function CTweaks({ tweaks, setTweak }) {
  return (
    <TweaksPanel title="Tweaks · Direction C">
      <TweakSection label="Palette / 色">
        <TweakColor label="Accent" value={tweaks.accent}
        options={['#c98552', '#d9cdb5', '#8b3a2a', '#6b8266', '#7a8db5', '#efe9dc']}
        onChange={(v) => setTweak('accent', v)} />
        <TweakRadio label="Background" value={tweaks.palette}
        options={[
        { value: 'warm', label: 'Warm' }, { value: 'neutral', label: 'Neutral' },
        { value: 'cool', label: 'Cool' }, { value: 'ink', label: 'Ink' }]
        } onChange={(v) => setTweak('palette', v)} />
      </TweakSection>

      <TweakSection label="Type / 字体">
        <TweakSelect label="Body serif" value={tweaks.serif}
        options={[
        { value: 'times', label: 'Times New Roman' },
        { value: 'cormorant', label: 'Cormorant Garamond' },
        { value: 'newsreader', label: 'Newsreader' },
        { value: 'fraunces', label: 'Fraunces' }]
        } onChange={(v) => setTweak('serif', v)} />
        <TweakSelect label="Hero font" value={tweaks.heroFont}
        options={[
        { value: 'verdana', label: 'Verdana' },
        { value: 'helvetica', label: 'Helvetica' },
        { value: 'cormorant', label: 'Cormorant Garamond' },
        { value: 'newsreader', label: 'Newsreader' },
        { value: 'fraunces', label: 'Fraunces' }]
        } onChange={(v) => setTweak('heroFont', v)} />
      </TweakSection>

      <TweakSection label="Hero">
        <TweakSlider label="Name size" value={tweaks.heroSize} min={40} max={180} step={2} onChange={(v) => setTweak('heroSize', v)} />
        <TweakToggle label="Italic 2nd line" value={tweaks.heroItalic} onChange={(v) => setTweak('heroItalic', v)} />
        <TweakSlider label="Image darken" value={tweaks.heroDarken} min={0} max={80} step={5} unit="%" onChange={(v) => setTweak('heroDarken', v)} />
      </TweakSection>

      <TweakSection label="Rail">
        <TweakRadio label="Side rail" value={tweaks.rail}
        options={[{ value: 'hover', label: 'Hover' }, { value: 'fixed', label: 'Always' }]}
        onChange={(v) => setTweak('rail', v)} />
      </TweakSection>

      <TweakSection label="About — Portrait">
        <TweakSlider label="Size" value={tweaks.aboutPortraitSize ?? 180} min={40} max={520} step={2} unit="px" onChange={(v) => setTweak('aboutPortraitSize', v)} />
        <TweakSlider label="Offset X" value={tweaks.aboutPortraitX ?? 0} min={-800} max={800} step={2} unit="px" onChange={(v) => setTweak('aboutPortraitX', v)} />
        <TweakSlider label="Offset Y" value={tweaks.aboutPortraitY ?? 0} min={-500} max={500} step={2} unit="px" onChange={(v) => setTweak('aboutPortraitY', v)} />
      </TweakSection>
    </TweaksPanel>);

}

// ── Root ──────────────────────────────────────────────────
function CSite() {
  const [lang, setLang] = React.useState('en');
  const [route, setRouteState] = React.useState({ page: 'home' });
  const [transitionKey, setTransitionKey] = React.useState(0);
  const [tweaks, setTweak] = useTweaks(TWEAKS_DEFAULTS);

  // Wrap setRoute to track the previous page (for smart back navigation)
  const setRoute = React.useCallback((next) => {
    setRouteState((prev) => {
      // If navigating to a project, attach `from` so the project can route back correctly.
      if (next.page === 'project' && !next.from) {
        next.from = prev.page === 'index' ? 'index' : 'home';
      }
      return next;
    });
  }, []);

  React.useEffect(() => {applyTweaks(tweaks);}, [tweaks]);

  React.useEffect(() => {
    setTransitionKey((k) => k + 1);
    if (route.page !== 'project') {
      window.scrollTo?.({ top: 0, behavior: 'instant' });
    }
  }, [route.page, route.slug]);

  React.useEffect(() => {
    document.body.classList.toggle('c-hero-italic', !!tweaks.heroItalic);
  }, [tweaks.heroItalic]);

  let body;
  if (route.page === 'home') body = <CHome setRoute={setRoute} />;else
  if (route.page === 'index') body = <CIndexGrid setRoute={setRoute} />;else
  if (route.page === 'project') body = <CProject slug={route.slug} from={route.from} setRoute={setRoute} />;else
  if (route.page === 'about') body = <CAbout />;else
  if (route.page === 'cv') body = <CCV />;else
  if (route.page === 'exploration') body = <CExploration />;else
  if (route.page === 'contact') body = <CContact />;

  return (
    <C_lang.Provider value={[lang, setLang]}>
      <div className={`c-site c-rail-mode-${tweaks.rail}`}>
        <CRail route={route} setRoute={setRoute} railMode={tweaks.rail} />
        <main key={transitionKey} className="c-main">{body}</main>
        <CCursor />
        <CBackToTop />
        <CTweaks tweaks={tweaks} setTweak={setTweak} />
      </div>
    </C_lang.Provider>);

}

// Export to window so the index-grid file can access shared helpers
Object.assign(window, { C_lang, ctx, fmtNum, fmtArea, fmtCoords, projectYear, TrackChip, RoleChip, CoordChip, Yr, CSite });