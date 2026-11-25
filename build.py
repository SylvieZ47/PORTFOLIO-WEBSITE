#!/usr/bin/env python
"""生成网站。用法：  python build.py
读 data/projects.js 和 assets/ 里的图片，把整站直接写在这个文件夹里（英文在根目录，中文在 zh/，图片在 img/）。
推到 GitHub 的 main 之后，线上的网站就是这些文件。
加项目 = 在 data/projects.js 加一条；加图 = 把文件放进 assets/projects/<folder>/，然后重新运行。
需要：Python + Pillow，Node（只用来读 projects.js）。"""
import html, json, os, re, shutil, subprocess, sys
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
OUT = '.'
HERO_PROJECT = 'the-ark'          # 首页第一屏用哪个项目的封面（放了 assets/home.mp4 就改用视频）
HERO_VIDEO = 'assets/home.mp4'
IMG_EXT = ('.jpg', '.jpeg', '.png', '.webp')

# ── 读数据 ──────────────────────────────────────────────
js = "global.window={};require('./data/projects.js');process.stdout.write(JSON.stringify(window))"
D = json.loads(subprocess.run(['node', '-e', js], capture_output=True, check=True).stdout.decode('utf-8'))
PROJECTS, TAX, CV = D['PROJECTS'], D['PROJECT_TAXONOMY'], D['CV_DATA']

STR = {
    'work': ('Work', '作品'), 'about': ('About', '关于'), 'cv': ('CV', '简历'),
    'index': ('Index', '索引'), 'n_projects': ('{} projects', '{} 个项目'),
    'expand': (' — click to expand', ' — 点击展开'), 'collapse': (' — click to collapse', ' — 点击收起'),
    'program': ('Program', '类型'), 'location': ('Location', '地点'), 'year': ('Year', '年份'),
    'area': ('Area', '面积'), 'role': ('Role', '角色'), 'track': ('Track', '类别'), 'note': ('Note', '备注'),
    'all_work': ('All work', '全部作品'), 'all_projects': ('All projects', '全部项目'), 'next': ('Next', '下一个'),
    'soon': ('Drawings and images in preparation. Coming soon.', '图纸与图片整理中，敬请期待。'),
    'soon_short': ('coming soon', '整理中'),
    'education': ('Education', '教育'), 'experience': ('Experience', '经历'), 'skills': ('Skills', '技能'),
    'awards': ('Awards', '获奖'), 'pdf': ('Download PDF', '下载 PDF'), 'email': ('Email', '邮箱'),
}
def S(key, lang): return STR[key][0 if lang == 'en' else 1]
def T(v, lang):
    if v is None: return ''
    if isinstance(v, str): return v
    return v.get(lang) or v.get('en') or ''
def E(s): return html.escape(str(s), quote=True)

# ── 图片：缩到网页尺寸，写进 docs/img/，记下比例 ─────────────
_cache = {}
def trim(im, pad=0.03):
    im = im.convert('RGBA')
    box = im.getchannel('A').point(lambda v: 255 if v > 20 else 0).getbbox()
    if not box: return im
    p = round(pad * max(box[2] - box[0], box[3] - box[1]))
    return im.crop((max(0, box[0] - p), max(0, box[1] - p), min(im.width, box[2] + p), min(im.height, box[3] + p)))

def asset(src):
    """src 是 assets/ 下的路径。返回 {full, small, w, h, fw, sw, ar}；文件不存在返回 None。"""
    if not src or not src.startswith('assets/') or not os.path.isfile(src): return None
    if src in _cache: return _cache[src]
    rel = os.path.splitext(src[len('assets/'):])[0].replace('projects/', '')
    with Image.open(src) as im:
        if re.match(r'icon(_\d+)?\.', os.path.basename(src)):   # 手绘图标：裁掉透明边，只留画面＋一圈等宽留白，首页才能按画面统一大小
            im = trim(im)
        w, h = im.size
        res = {'ar': w / h, 'w': w, 'h': h}
        for key, box in (('full', (2600, 2200)), ('small', (1100, 1000))):
            dst = f'{OUT}/img/{rel}{"" if key == "full" else "-s"}.jpg'
            scale = min(1, box[0] / w, box[1] / h)
            tw = max(1, round(w * scale))
            res[key], res[key[0] + 'w'] = dst[len(OUT) + 1:], tw
            if os.path.isfile(dst) and os.path.getmtime(dst) >= os.path.getmtime(src): continue
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            out = im.convert('RGBA')
            bg = Image.new('RGBA', out.size, (255, 255, 255, 255)); bg.alpha_composite(out)
            out = bg.convert('RGB').resize((tw, max(1, round(h * scale))), Image.LANCZOS)
            out.save(dst, quality=84, optimize=True)
            print('  img', dst)
    _cache[src] = res
    return res

def img_tag(a, r, span=12, cls='', lazy=True):
    sizes = f'(max-width: 800px) 100vw, {span * 8.34:.0f}vw'
    c = f' class="{cls}"' if cls else ''
    return (f'<img{c} src="{r}{a["small"]}" srcset="{r}{a["small"]} {a["sw"]}w, {r}{a["full"]} {a["fw"]}w" '
            f'sizes="{sizes}" width="{a["w"]}" height="{a["h"]}" alt=""{" loading=\"lazy\"" if lazy else ""}>')

# ── 每个项目：把数据里列的图和文件夹里发现的图合起来 ─────────
def nice_label(fname):
    s = re.sub(r'^(dwg|img)_(\d+_)?', '', os.path.splitext(fname)[0])
    s = re.sub(r'[-_]+', ' ', s).strip()
    for a, b in ((r'\bf(\d)\b', r'Floor \1'), (r'\belev\b', 'elevation'), (r'\btyp\b', 'type'), (r'\bnorht\b', 'north'),
                 (r'\bexploed\b', 'exploded axon')):
        s = re.sub(a, b, s)
    return s[:1].upper() + s[1:]

def clean_cap(label, lang):
    s = re.sub(r'^\s*\d+\s*[·.]\s*', '', T(label, lang))
    s = re.sub(r'\s*\d+\s*[:：]\s*\d+\s*$', '', s)
    return '' if re.fullmatch(r'(?i)render(ing)?|photo', s) else s

for p in PROJECTS:
    folder = f'assets/projects/{p.get("folder") or p["slug"]}'
    files = sorted(f for f in os.listdir(folder) if f.lower().endswith(IMG_EXT)) if os.path.isdir(folder) else []
    find = lambda pat: next((f'{folder}/{f}' for f in files if re.search(pat, f)), None)
    p['_cover'] = asset(p.get('cover')) or asset(find(r'^img_00_cover|_cover\.'))
    cover_src = p.get('cover') if asset(p.get('cover')) else find(r'^img_00_cover|_cover\.')
    p['_index'] = asset(p.get('indexCover')) or asset(find(r'index-cover'))
    p['_icon'] = asset(find(r'^icon(_\d+)?\.'))
    listed = {x.get('src') for x in p.get('images', []) + p.get('drawings', [])} | {p.get('cover'), p.get('indexCover')}
    imgs, dwgs = [], []
    for x in p.get('images', []):
        a = asset(x.get('src'))
        if a and x['src'] != cover_src: imgs.append({'a': a, 'cap': x.get('label'), 'kind': 'img'})
    for x in p.get('drawings', []):
        a = asset(x.get('src'))
        if a: dwgs.append({'a': a, 'cap': x.get('label'), 'kind': 'dwg'})
    for f in files:                                      # 文件夹里有、数据里没列的
        src = f'{folder}/{f}'
        if src in listed or src == cover_src or 'index-cover' in f or re.match(r'icon(_\d+)?\.', f): continue
        if f.startswith('dwg_'): dwgs.append({'a': asset(src), 'cap': nice_label(f), 'kind': 'dwg'})
        elif f.startswith('img_'): imgs.append({'a': asset(src), 'cap': nice_label(f), 'kind': 'img'})
    p['_imgs'], p['_dwgs'] = imgs, dwgs
    if not p['_cover'] and imgs: p['_cover'] = imgs.pop(0)['a']
    p['_any'] = bool(p['_cover'] or imgs or dwgs)

def year_of(p): return p.get('year_range') or str(p['year'])
def type_label(p, lang): return T(next((o['label'] for o in TAX['type']['options'] if o['id'] == p['type']), ''), lang)
def track_label(p, lang): return T(next((o['label'] for o in TAX['track']['options'] if o['id'] == p['track']), ''), lang)
def area(p, lang):
    a = p.get('area_sqft')
    if not a: return ''
    return f'{a:,} sq ft' if lang == 'en' else f'{round(a * 0.092903):,} ㎡'
def paras(p, lang):
    txt = T(p.get('description'), lang) or T(p.get('summary'), lang)
    return [x.strip() for x in re.split(r'\n\s*\n|\n', txt) if x.strip()]

# ── 页面外壳 ────────────────────────────────────────────
def shell(lang, page, title, body, desc=''):
    r = '' if lang == 'en' else '../'
    other = (f'zh/{page}', 'CN') if lang == 'en' else (f'../{page}', 'EN')
    nav = ''.join(f'<a href="{k}.html" class="{"on" if page == k + ".html" else "u"}">{S(k, lang)}</a>' for k in ('work', 'about', 'cv'))
    full = f'{title} — Sylvie Zhang' if title else 'Sylvie Zhang — Architectural Designer'
    return f'''<!doctype html>
<html lang="{'en' if lang == 'en' else 'zh-Hans'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{E(full)}</title>
<meta name="description" content="{E(desc or T(CV['intro'], lang))}">
<link rel="icon" type="image/png" href="{r}img/sig-s.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{r}style.css">
</head>
<body>

<header class="grid top">
  <a class="name" href="index.html"><img class="sig" src="{r}img/sig-s.png" alt="">Sylvie Zhang</a>
  <nav>{nav}<a class="lang" href="{other[0]}">{other[1]}</a></nav>
</header>

{body}
<script src="{r}site.js"></script>
</body>
</html>
'''

def foot(lang, left=None):
    """每页最下面的一排三个元素：左下角、正文起始线、右下角。"""
    left = 'Sylvie (Siqi) Zhang' if left is None else left
    mail = E(CV["contact"]["email"])
    return f'<footer class="grid foot caps">\n  <span>{left}</span>\n  <a class="u" href="mailto:{mail}">{mail}</a>\n  <span>2026</span>\n</footer>\n'

# ── 首页 ────────────────────────────────────────────────
def home(lang):
    r = '' if lang == 'en' else '../'
    hp = next(p for p in PROJECTS if p['slug'] == HERO_PROJECT)
    cap = f'<span><a href="{hp["slug"]}.html">{E(T(hp["title"], lang))}</a> <span class="mute">{year_of(hp)}</span></span>'
    intro = f'<p>{E(T(CV["intro"], lang))}</p>'
    if os.path.isfile(HERO_VIDEO):
        os.makedirs(f'{OUT}/img', exist_ok=True); shutil.copyfile(HERO_VIDEO, f'{OUT}/img/home.mp4')
        media = f'<video src="{r}img/home.mp4" poster="{r}{hp["_cover"]["full"]}" muted playsinline preload="auto"></video>'
        hero = f'<div class="hero-scroll">\n<section class="hero">\n  <div class="frame">{media}</div>\n  <div class="grid cap">{cap}{intro}</div>\n</section>\n</div>'
    else:
        hero = f'<section class="hero">\n  <div class="frame">{img_tag(hp["_cover"], r, lazy=False)}</div>\n  <div class="grid cap">{cap}{intro}</div>\n</section>'
    marks = []
    for p in PROJECTS:
        if not p['_any']: continue
        d = p['_icon'] or (p['_dwgs'][0]['a'] if p['_dwgs'] else p['_cover'])
        rv = p['_index'] or p['_cover'] or d
        title = E(T(p['title'], lang))
        marks.append(f'  <a class="mark" style="--s:{d["ar"] ** 0.5:.3f}" href="{p["slug"]}.html" data-img="{r}{rv["full"]}" '
                     f'data-ar="{rv["ar"]:.4f}" data-title="{title}" data-year="{year_of(p)}">'
                     f'<img class="d" src="{r}{d["small"]}" width="{d["w"]}" height="{d["h"]}" alt="{title}" loading="lazy">'
                     f'<span class="mob">{title}</span></a>')
    c = CV['contact']
    rows = ''.join(f'<div class="r"><h2 class="caps">{E(T(x["label"], lang))}</h2><p>{E(T(x["text"], lang))}</p></div>' for x in CV['closing'])
    links = (f'<a class="u" href="mailto:{E(c["email"])}">{E(c["email"])}</a><br>'
             f'<a class="u" href="https://{E(c["linkedin"])}">LinkedIn</a><br>'
             f'<a class="u" href="work.html">{S("all_projects", lang)}</a>')
    rows += f'<div class="r"><h2 class="caps">{"Contact" if lang == "en" else "联系"}</h2><p>{links}</p></div>'
    rows += f'<div class="r pic"><img class="seal" src="{r}img/sig-c.png" alt="Sylvie (Siqi) Zhang"></div>'
    body = f"""{hero}

<section class="field">
{chr(10).join(marks)}
  <div class="reveal" aria-hidden="true"><img alt=""><div><span class="t"></span><span class="y mute"></span></div></div>
</section>

<section class="grid closing">
{rows}
</section>

{foot(lang, '')}"""
    return shell(lang, 'index.html', '', body)

# ── Work ───────────────────────────────────────────────
def work(lang):
    r = '' if lang == 'en' else '../'
    rows = []
    for p in sorted(PROJECTS, key=lambda p: -p['year']):
        role = T(p['role'], lang) + ''.join(', ' + T(a, lang) for a in p.get('awards', []))
        soon = '' if p['_any'] else f' <span class="mute">({S("soon_short", lang)})</span>'
        rows.append(f'      <tr><td>{year_of(p)}</td><td><a class="u" href="{p["slug"]}.html">{E(T(p["title"], lang))}</a>{soon}</td>'
                    f'<td>{E(", ".join(x for x in (type_label(p, lang), T(p.get("location"), lang)) if x))}</td><td>{E(role)}</td></tr>')
    figs = []
    for p in PROJECTS:
        a = p['_cover']
        if not a: continue
        sub = ', '.join(x for x in (type_label(p, lang), T(p.get('location'), lang)) if x)
        figs.append(f'  <figure class="work{" tall" if a["ar"] < 1 else ""}">\n    <a href="{p["slug"]}.html">{img_tag(a, r, 8)}</a>\n'
                    f'    <figcaption><span>{E(T(p["title"], lang))}</span><span class="mute">{E(sub)}</span>'
                    f'<span class="mute">{year_of(p)}</span></figcaption>\n  </figure>')
    body = f'''<section class="grid index">
  <details>
    <summary><span class="pm" aria-hidden="true"></span><b class="caps">{S('index', lang)}</b><span class="mute hint" data-closed="{S('expand', lang)}" data-open="{S('collapse', lang)}">{S('n_projects', lang).format(len(PROJECTS))}</span><span class="pm" aria-hidden="true"></span></summary>
    <table>
{chr(10).join(rows)}
    </table>
  </details>
</section>

<main class="grid works">
{chr(10).join(figs)}
</main>

{foot(lang)}'''
    return shell(lang, 'work.html', S('work', lang), body)

# ── 项目页：错落排版 ─────────────────────────────────────
def span_for(ar, cap): return max(3, min(cap, round(5.6 * ar)))

def stagger(seq, texts, lang, r):
    """seq: 图和图纸的序列；texts: {序号: 段落}。返回一串落在 12 栏上的元素。"""
    out, i, step, single_i, pair_i, text_i = [], 0, 0, 0, 0, 0
    def fig(it, start, span, cls=''):
        cap = clean_cap(it['cap'], lang) if it['kind'] == 'dwg' or it['cap'] else ''
        capm = f'<figcaption><span class="mute">{E(cap)}</span></figcaption>' if cap else ''
        return f'  <figure class="fig{cls}" style="grid-column: {start} / {start + span}">{img_tag(it["a"], r, span)}{capm}</figure>'
    def text(par, start, end): return f'  <div class="text" style="grid-column: {start} / {end}"><p>{E(par)}</p></div>'
    while i < len(seq):
        it, ar = seq[i], seq[i]['a']['ar']
        if i in texts:                                  # 图 + 讲它的那段话
            if ar > 2.4:
                out += [fig(it, 1, 12), text(texts[i], 6, 11)]
            elif text_i % 2 == 0:
                out += [fig(it, 1, span_for(ar, 5)), text(texts[i], 6, 11)]
            else:
                sp = span_for(ar, 7); out += [text(texts[i], 3, 6), fig(it, 13 - sp, sp)]
            text_i += 1; i += 1; continue
        nxt = seq[i + 1] if i + 1 < len(seq) and (i + 1) not in texts else None
        if ar > 2.4:                                    # 很长的立面、剖面：给满宽
            out.append(fig(it, 1, 12)); i += 1
        elif step % 2 == 1 and nxt and nxt['a']['ar'] <= 2.4:   # 一大一小并排
            small, large = sorted((it, nxt), key=lambda x: x['a']['ar'])
            if pair_i % 2 == 0:
                s, l = span_for(small['a']['ar'], 4), span_for(large['a']['ar'], 6)
                out += [fig(small, 2, s), fig(large, 13 - l, l)]
            else:
                l, s = span_for(large['a']['ar'], 7), span_for(small['a']['ar'], 4)
                out += [fig(large, 1, l), fig(small, 13 - s, s, ' a-start')]
            pair_i += 1; step += 1; i += 2
        else:                                           # 单张：左、右、中轮换
            sp = span_for(ar, 8)
            out.append(fig(it, (1, 13 - sp, 3)[single_i % 3], sp))
            single_i += 1; step += 1; i += 1
    return out

def project(p, lang):
    r = '' if lang == 'en' else '../'
    ps = paras(p, lang)
    facts = [(S('program', lang), type_label(p, lang)), (S('location', lang), T(p.get('location'), lang)),
             (S('year', lang), year_of(p)), (S('area', lang), area(p, lang)),
             (S('role', lang), T(p['role'], lang)), (S('track', lang), track_label(p, lang)),
             (S('note', lang), ', '.join(T(a, lang) for a in p.get('awards', [])))]
    fhtml = ''.join(f'<dt>{E(k)}</dt><dd>{E(v)}</dd>' for k, v in facts if v)
    body = f'<section class="grid head">\n  <h1>{E(T(p["title"], lang))}</h1>\n  <dl class="facts">{fhtml}</dl>\n</section>\n\n'
    lead = f'<section class="grid row">\n  <div class="text lead" style="grid-column: 6 / 11"><p>{E(ps[0])}</p></div>\n</section>\n\n' if ps else ''
    if not p['_any']:
        body += f'<section class="grid row">\n  <div class="soon">{S("soon", lang)}</div>\n</section>\n\n' + lead
        rest = ps[1:]
    else:
        c = p['_cover']
        sp = 12 if c['ar'] >= 1.25 else span_for(c['ar'], 8)
        body += f'<section class="grid row">\n  <figure class="fig" style="grid-column: 1 / {1 + sp}">{img_tag(c, r, sp, lazy=False)}</figure>\n</section>\n\n' + lead
        imgs, dwgs, seq = list(p['_imgs']), list(p['_dwgs']), []
        if imgs: seq.append(imgs.pop(0))
        if dwgs: seq.append(dwgs.pop(0))
        while imgs or dwgs:                              # 三张图配一张图纸
            seq += imgs[:3]; imgs = imgs[3:]
            if dwgs: seq.append(dwgs.pop(0))
        rest, texts, n = ps[1:], {}, len(seq)
        if n:
            stride = max(1, (n - 1) // max(1, len(rest)))
            for j in range(len(rest)):
                k = min(n - 1, (1 if n > 1 else 0) + j * stride)
                if k in texts: break
                texts[k] = rest[j]
            rest = rest[len(texts):]
            body += '<section class="grid stagger">\n' + '\n'.join(stagger(seq, texts, lang, r)) + '\n</section>\n\n'
        if len(seq) < 2:
            body += f'<section class="grid row">\n  <div class="text mute" style="grid-column: 6 / 11"><p>{S("soon", lang)}</p></div>\n</section>\n\n'
    if rest:
        body += '<section class="grid row">\n  <div class="text" style="grid-column: 6 / 11">' + ''.join(f'<p>{E(x)}</p>' for x in rest) + '</div>\n</section>\n\n'
    nx = PROJECTS[(PROJECTS.index(p) + 1) % len(PROJECTS)]
    body += (f'<nav class="grid pager caps">\n  <a class="u" href="work.html">← {S("all_work", lang)}</a>\n'
             f'  <a class="u" href="{nx["slug"]}.html">{S("next", lang)}: {E(T(nx["title"], lang))} →</a>\n</nav>\n\n' + foot(lang))
    return shell(lang, f'{p["slug"]}.html', T(p['title'], lang), body, T(p.get('summary'), lang))

# ── About / CV ─────────────────────────────────────────
def about(lang):
    r = '' if lang == 'en' else '../'
    bio = [x.strip() for x in T(CV['bio'], lang).split('\n') if x.strip()]
    more = ''.join(f'<p>{E(x)}</p>' for x in bio[1:])
    rows = ''.join(f'<div class="r"><span>{E(T(x["title"], lang))}</span><span>{E(T(x["text"], lang))}</span></div>' for x in CV['principles'])
    body = f"""<section class="grid big"><h1>{S('about', lang)}</h1></section>

<section class="grid row about">
  <div class="portrait"><img src="{r}img/sig-l.png" alt=""></div>
  <div class="bio"><p class="lead">{E(bio[0])}</p><div class="text">{more}</div></div>
</section>

<section class="grid list">
  <h2 class="caps">{'Approach' if lang == 'en' else '方法'}</h2>
  <div class="rows">{rows}</div>
</section>

{foot(lang)}"""
    return shell(lang, 'about.html', S('about', lang), body)

def cv(lang):
    r = '' if lang == 'en' else '../'
    def row(a, b, c='', d=''):
        sub = f'<br><span class="mute">{E(c)}</span>' if c else ''
        note = f'<span class="note">{E(d)}</span>' if d else ''
        return f'<div class="r"><span>{E(a)}</span><span>{E(b)}{sub}{note}</span></div>'
    def block(title, rows):
        return f'<section class="grid list">\n  <h2 class="caps">{title}</h2>\n  <div class="rows">{"".join(row(*x) for x in rows)}</div>\n</section>\n\n'
    body = f'<section class="grid big"><h1>{S("cv", lang)}</h1></section>\n\n'
    if os.path.isfile('assets/cv.pdf'):
        body += f'<section class="grid list plain">\n  <div class="rows"><a class="u" href="{r}cv.pdf">↓ {S("pdf", lang)}</a></div>\n</section>\n\n'
    body += block(S('education', lang), [(e['year'], T(e['school'], lang), T(e['degree'], lang), T(e.get('note'), lang)) for e in CV['education']])
    body += block(S('experience', lang), [(e['year'], T(e['firm'], lang), T(e['role'], lang), T(e.get('note'), lang)) for e in CV['experience']])
    body += block(S('skills', lang), [(T(s['group'], lang), ', '.join(s['items']), '') for s in CV['skills']])
    body += block(S('awards', lang), [(str(a['year']), a[lang] if lang in a else a['en'], '') for a in CV['awards']])
    return shell(lang, 'cv.html', S('cv', lang), body + foot(lang))

# ── 写文件 ──────────────────────────────────────────────
def write(path, s):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f: f.write(s)

os.makedirs(f'{OUT}/img', exist_ok=True)
for name, src, size in (('sig-s.png', 'assets/portrait-sketch.png', 256), ('sig-l.png', 'assets/portrait-black.png', 512)):
    with Image.open(src) as im:
        im.thumbnail((size, size)); im.save(f'{OUT}/img/{name}')
with Image.open('assets/portrait-black.png') as im:   # 首页结尾右栏的头像：裁掉透明边，好和文字上下对齐
    im = im.crop(im.split()[-1].getbbox()); im.thumbnail((600, 600)); im.save(f'{OUT}/img/sig-c.png')
shutil.copyfile('src/style.css', f'{OUT}/style.css')
shutil.copyfile('src/site.js', f'{OUT}/site.js')
if os.path.isfile('assets/cv.pdf'): shutil.copyfile('assets/cv.pdf', f'{OUT}/cv.pdf')
write(f'{OUT}/.nojekyll', '')
for lang, d in (('en', OUT), ('zh', f'{OUT}/zh')):
    write(f'{d}/index.html', home(lang)); write(f'{d}/work.html', work(lang))
    write(f'{d}/about.html', about(lang)); write(f'{d}/cv.html', cv(lang))
    for p in PROJECTS: write(f'{d}/{p["slug"]}.html', project(p, lang))

# ── 报告：每个项目现在有什么 ──────────────────────────────
print(f'\n{len(PROJECTS)} projects -> {OUT}/')
for p in PROJECTS:
    print(f'  {p["slug"]:32s} cover:{"y" if p["_cover"] else "-"}  index-cover:{"y" if p["_index"] else "-"}  icon:{"y" if p["_icon"] else "-"}'
          f'  images:{len(p["_imgs"]):2d}  drawings:{len(p["_dwgs"]):2d}  text:{"y" if p.get("description") else "-"}')
