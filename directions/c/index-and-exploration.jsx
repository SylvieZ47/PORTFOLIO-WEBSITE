// Direction C — Index grid (compact RED-style) + Exploration page

// ── Compact Index Grid ─────────────────────────────────────
function CIndexGrid({ setRoute }) {
  const [lang] = window.C_lang.use();
  const [filters, setFilters] = React.useState({ track: 'all', type: 'all' });
  const projects = window.PROJECTS;
  const filtered = projects.filter((p) =>
  (filters.track === 'all' || p.track === filters.track) && (
  filters.type === 'all' || p.type === filters.type));
  const tax = window.PROJECT_TAXONOMY;

  return (
    <section className="c-grid-page" data-screen-label="C · Index">
      <div className="c-grid-head">
        <div className="c-grid-head-l">
          <div className="c-tag">— {lang === 'en' ? 'Catalogue' : '目录'}</div>
          <h1 className="c-grid-title">{lang === 'en' ? 'Index' : '索引'}</h1>
          <div className="c-grid-sub">
            {lang === 'en' ?
            <>All works at a glance · <button className="c-link" onClick={() => setRoute({ page: 'home' })}>Cinematic view ↗</button></> :
            <>作品浏览模式 · <button className="c-link" onClick={() => setRoute({ page: 'home' })}>沉浸模式 ↗</button></>}
          </div>
        </div>
        <div className="c-grid-count">
          <span className="c-grid-count-num">{String(filtered.length).padStart(2, '0')}</span>
          <span className="c-grid-count-of"> / {String(projects.length).padStart(2, '0')}</span>
          <span className="c-grid-count-label">{lang === 'en' ? 'works' : '件作品'}</span>
        </div>
      </div>

      {/* Sticky filter bar — always visible chips */}
      <div className="c-grid-filters">
        {Object.entries(tax).map(([key, group]) =>
        <div key={key} className="c-grid-filter-group">
            <span className="c-grid-filter-label">{window.ctx(group.label, lang)}</span>
            <div className="c-grid-filter-chips">
              {group.options.map((opt) =>
            <button
              key={opt.id}
              className={`c-chip ${filters[key] === opt.id ? 'is-on' : ''} c-chip-${key}-${opt.id}`}
              onClick={() => setFilters((f) => ({ ...f, [key]: opt.id }))}>
              {window.ctx(opt.label, lang)}</button>
            )}
            </div>
          </div>
        )}
      </div>

      {/* Masonry — varied aspect ratios respected */}
      <div className="c-masonry">
        {filtered.map((p, i) => <CMiniCard key={p.id} project={p} idx={i} setRoute={setRoute} />)}
      </div>

      {filtered.length === 0 &&
      <div className="c-empty">
          {lang === 'en' ? 'No works match these filters.' : '没有符合条件的作品。'}
        </div>
      }
    </section>);

}

function CMiniCard({ project: p, idx, setRoute }) {
  const [lang] = window.C_lang.use();
  const aspect = p.images[0].aspect || '4/5';
  const Yr = window.Yr;
  const realCover = window.realSrc(p.indexCover) || window.realSrc(p.cover);
  // Real photos respect their natural dimensions; only placeholders use the declared aspect.
  const wrapStyle = realCover ? undefined : { aspectRatio: aspect };
  return (
    <article
      className="c-mini"
      style={{ animationDelay: idx % 12 * 0.03 + 's' }}
      onClick={() => setRoute({ page: 'project', slug: p.slug, from: 'index' })}>
      
      <div className={`c-mini-img-wrap ${realCover ? 'is-natural' : ''}`} style={wrapStyle}>
        <img src={window.indexCoverSrc(p, 800, 1000)} alt="" loading="lazy" />
        <div className="c-mini-track-tag">
          <window.TrackChip track={p.track} lang={lang} />
        </div>
        <div className="c-mini-hover">
          <p className="c-mini-summary">{window.ctx(p.summary, lang)}</p>
          <div className="c-mini-hover-foot">
            <window.RoleChip role={p.role} lang={lang} />
            <span className="c-mini-cta">→</span>
          </div>
        </div>
      </div>
      <div className="c-mini-meta">
        <div className="c-mini-line1">
          <h3 className="c-mini-title">{window.ctx(p.title, lang)}</h3>
          <Yr>{window.projectYear(p)}</Yr>
        </div>
        <div className="c-mini-line2">
          <span>{window.ctx(p.location, lang)}</span>
          <span className="c-mini-coord">{window.fmtCoords(p.coords)}</span>
        </div>
        {p.area_sqft &&
        <div className="c-mini-line3">
            {window.fmtArea(p.area_sqft, lang)}
          </div>
        }
      </div>
    </article>);

}

// ── Exploration page (paintings, parametric, photo, model, writing, video) ─
function CExploration() {
  const [lang] = window.C_lang.use();
  const [filter, setFilter] = React.useState('all');
  const items = window.EXPLORATIONS;
  const filtered = filter === 'all' ? items : items.filter((x) => x.kind === filter);
  const tax = window.EXPLORATION_TAXONOMY;

  return (
    <section className="c-grid-page c-exploration" data-screen-label="C · Exploration">
      <div className="c-grid-head">
        <div className="c-grid-head-l">
          <div className="c-tag">— {lang === 'en' ? 'Side practice' : '副业'}</div>
          <h1 className="c-grid-title">{lang === 'en' ? 'Exploration' : '探索'}</h1>
          <div className="c-grid-sub">
            {lang === 'en' ?
            'Paintings, parametric studies, photographs, models, writing and short films.' :
            '绘画、参数化研究、摄影、模型、文章与短片。'}
          </div>
        </div>
        <div className="c-grid-count">
          <span className="c-grid-count-num">{String(filtered.length).padStart(2, '0')}</span>
          <span className="c-grid-count-of"> / {String(items.length).padStart(2, '0')}</span>
          <span className="c-grid-count-label">{lang === 'en' ? 'pieces' : '件'}</span>
        </div>
      </div>

      <div className="c-grid-filters">
        <div className="c-grid-filter-group">
          <span className="c-grid-filter-label">{lang === 'en' ? 'Medium' : '媒介'}</span>
          <div className="c-grid-filter-chips">
            {tax.options.map((opt) =>
            <button
              key={opt.id}
              className={`c-chip ${filter === opt.id ? 'is-on' : ''} c-chip-exp-${opt.id}`}
              onClick={() => setFilter(opt.id)}>
              {window.ctx(opt.label, lang)}</button>
            )}
          </div>
        </div>
      </div>

      <div className="c-masonry c-masonry-exp">
        {filtered.map((it, i) => <CExpCard key={it.id} item={it} idx={i} />)}
      </div>
    </section>);

}

function CExpCard({ item: it, idx }) {
  const [lang] = window.C_lang.use();
  const aspect = it.aspect || '4/5';
  const kindLabel = window.ctx(
    window.EXPLORATION_TAXONOMY.options.find((o) => o.id === it.kind)?.label || '', lang
  );
  const Yr = window.Yr;
  const Tag = it.link ? 'a' : 'div';
  const tagProps = it.link ? { href: it.link, target: '_blank', rel: 'noopener' } : {};
  return (
    <Tag
      {...tagProps}
      className={`c-mini c-exp-card c-exp-kind-${it.kind}`}
      style={{ animationDelay: idx % 12 * 0.03 + 's' }}>
      
      <div className="c-mini-img-wrap" style={{ aspectRatio: aspect }}>
        <img src={window.placeholderImage(it.tone, 800, 1000, '')} alt="" loading="lazy" />
        <div className="c-mini-track-tag">
          <span className={`c-track c-track-exp c-exp-kind-${it.kind}`}>
            <span className="c-track-label">{kindLabel}</span>
          </span>
        </div>
        {it.link && <div className="c-exp-link-badge">↗</div>}
      </div>
      <div className="c-mini-meta">
        <div className="c-mini-line1">
          <h3 className="c-mini-title">{window.ctx(it.title, lang)}</h3>
          <Yr>{it.year}</Yr>
        </div>
        <div className="c-mini-line2">
          <span>{window.ctx(it.medium, lang)}</span>
        </div>
      </div>
    </Tag>);

}

Object.assign(window, { CIndexGrid, CExploration });