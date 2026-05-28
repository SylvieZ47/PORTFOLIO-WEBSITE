// 项目数据 / Project data
// 添加新项目：在数组末尾加一条记录即可。
//
// 字段说明：
//   id            唯一英文标识 (p01, p02, ...)
//   slug          URL片段
//   title         {en, zh}
//   year          数字 (主)
//   year_range    可选字符串 '2023–2025'
//   location      {en, zh}
//   coords        { lat, lng }  十进制（可省略）
//   type          'residential' | 'institutional' | 'commercial' | 'urban' | 'speculative'
//   track         'professional' | 'academic' | 'research'
//   area_sqft     数字（真值始终用 sq ft，中文页面自动换算成 ㎡），可为 null
//   role          {en, zh}
//   summary       {en, zh}  一两句话，用于卡片预览与项目页顶
//   description   {en, zh}  长描述，可选，用于项目页正文段落
//   cover         可选 URL — 用于 cinematic scroll 大封面与 project 页顶部
//   indexCover    可选 URL — 用于 Index 总览页；若缺省则回退到 cover
//   images        [{src, tone, label, aspect?}]  项目页序列展示的正文图片；按数组顺序排列
//                 建议包含封面本身（img_00），让所有照片都出现在项目页
//                 aspect 可选，省略则用默认裁切
//   drawings      [{src, kind, label, size?}]  kind: 'plan' | 'section' | 'elevation' | 'perspective-section' | 'axon' | 'diagram'
//                 默认尺寸：plan / perspective-section 为大图（独占一行，与渲染同尺寸）；
//                 其余为小图（两栏并列）。可用 size 字段手动覆盖：
//                   size: 'large'  → 独占一行
//                   size: 'small'  → 两栏并列中的一个
//   awards        [{en, zh}]  可选（也用于显示"已建成"等状态）

window.PROJECTS = [
  {
    id: 'p01',
    slug: 'beck-corner-apartment',
    title: { en: 'Beck Corner Apartment', zh: '贝克街保障住房' },
    year: 2025,
    year_range: '2023–2025',
    location: { en: 'North Hollywood, CA', zh: '加州 北好莱坞' },
    coords: { lat: 34.1722, lng: -118.3787 },
    type: 'residential',
    track: 'professional',
    area_sqft: 11500,
    role: { en: 'Lead Designer', zh: '主创设计师' },
    summary: {
      en: 'A 100% affordable housing project on a tight R3[Q] lot in North Hollywood — 20 units delivered through L.A.\'s CHIP program, given character by the leap of materials and the transitions of color.',
      zh: '借助洛杉矶 CHIP 项目，在一块基础密度仅为 6 的紧凑地块上做出 100% 可负担住房——20 套居住单元，靠材料与色彩之间的过渡获得"性格"，而非滑向千篇一律的命运。'
    },
    description: {
      en: 'Through Los Angeles\' CHIP (Citywide Housing Incentive Program), we delivered a 100% affordable housing project on an R3[Q] lot with a base density of just 6 — ultimately landing 20 units: 1 market-rate, 3 moderate-income, and 16 low-income.\n\nThe real challenge wasn\'t policy. It was budget. How do you give a building character under such tight cost constraints? We retreated to the most elemental things — the leap between materials, the transition between colors. The result is a building that reads as considered, not merely compliant — refusing the fate of sameness, the anonymous oblivion that affordable housing so often slides into.',
      zh: '借助洛杉矶的 CHIP (Citywide Housing Incentive Program) 项目，我们在一块基础密度仅为 6 的 R3[Q] 地块上做出了一个 100% 可负担住房项目，最终落地 20 个居住单元：1 套市场价、3 套中等收入、16 套低收入。\n\n真正的挑战不在政策，而在预算。如何在极紧的成本里做出建筑的"性格"？于是我们退回到最基本的——材料之间的跳跃，色与色之间的过渡。最终的建筑看起来是"有想法的"，而不只是"合规的"。从而避免可负担住房滑向千篇一律的命运和泯没的匿名感。'
    },
    cover: 'assets/projects/beck-corner-apartment/img_00_cover.png',
    images: [
      { src: 'assets/projects/beck-corner-apartment/img_01_corridor.png', tone: 'brick', label: '01 · Corridor', aspect: '4/5' },
      { src: 'assets/projects/beck-corner-apartment/img_02_rendering.png', tone: 'plaster', label: '02 · Rendering', aspect: '16/10' }
    ],
    drawings: [
      { src: 'assets/projects/beck-corner-apartment/dwg_05_unit-typ-1.jpg', kind: 'plan', label: { en: 'Unit typology 1', zh: '户型 一' } },
      { src: 'assets/projects/beck-corner-apartment/dwg_06_unit-typ-2.jpg', kind: 'plan', label: { en: 'Unit typology 2', zh: '户型 二' } },
      { src: 'assets/projects/beck-corner-apartment/dwg_07_unit-typ-3.jpg', kind: 'plan', label: { en: 'Unit typology 3', zh: '户型 三' } }
    ]
  },
  {
    id: 'p02',
    slug: 'westfall-hillside-house',
    title: { en: 'Westfall Hillside House', zh: '西崖山地别墅' },
    year: 2025,
    location: { en: 'Encino, CA', zh: '加州 恩西诺' },
    coords: { lat: 34.1595, lng: -118.5012 },
    type: 'residential',
    track: 'professional',
    area_sqft: 3200,
    role: { en: 'Lead Designer', zh: '主创设计师' },
    summary: {
      en: 'A house carved into the steep southern slope of the San Fernando Valley. Through SB9 and a careful reading of "basement," the buildable area nearly doubled — the terrain became the author.',
      zh: '一座切入圣费尔南多谷南坡的山地住宅。利用 SB9 与"地下室"的定义，可用面积近乎翻倍——地形不只是制约，更成了作者。'
    },
    description: {
      en: 'This is a site on the steep hillsides of Encino, California. The lot fronts two streets, but the grade between them drops more than 100 feet — a piece of land more cliff than ground. The existing residence sits atop the only flat portion; SB9 split the parcel, leaving us with the steepest part.\n\nThe design went through several iterations. The real adversary was buildable area: code permitted only 1,900 square feet of new construction. The slope, seemingly the constraint, became the greatest ally. By working the definition of "basement" and pairing it with a detached ADU, the usable area was quietly pushed to 3,400 square feet — nearly doubled, and fully within code. The terrain wasn\'t just an ally; it was the author. The house steps down the hillside, each level growing its own volume, its own view, its own relationship to the mountain.',
      zh: '这是一块在加州恩西诺陡峭山区的场地。场地前后临街，但上下两条街之间落差超过 100 英尺——一块峭壁般的地。从坡顶的道路进入，现存的豪宅坐落在仅有的平坦场地上。用 SB9 政策将场地一分为二，留给我们的是最陡峭的部分。\n\n项目反复迭代了三四次。最大的对手是可增加面积的局限：法规只允许 1,900 平方英尺的新增面积。而看似是制约的陡坡，却成了最大的帮手——我们巧用"地下室"的定义，外加一个附属式 ADU，把可用面积悄悄推到了 3,400 平方英尺，几乎翻倍，且完全合规。地形不仅是帮手，更是作者。房子顺着山坡一级一级落下去，每一层都长出自己的体块、自己的视野、自己跟山的关系。'
    },
    cover: 'assets/projects/westfall-hillside-house/img_00_cover.png',
    images: [
      { src: 'assets/projects/westfall-hillside-house/img_01_rendering.png', tone: 'sand-dark', label: '01 · Rendering', aspect: '16/10' },
      { src: 'assets/projects/westfall-hillside-house/img_02_interior.png', tone: 'sand-light', label: '02 · Interior', aspect: '4/5' }
    ],
    drawings: [
      { src: 'assets/projects/westfall-hillside-house/dwg_01_f1.png', kind: 'plan', label: { en: 'Floor 1 plan', zh: '一层平面' } },
      { src: 'assets/projects/westfall-hillside-house/dwg_02_f2.png', kind: 'plan', label: { en: 'Floor 2 plan', zh: '二层平面' } },
      { src: 'assets/projects/westfall-hillside-house/dwg_03_f3.png', kind: 'plan', label: { en: 'Floor 3 plan', zh: '三层平面' } },
      { src: 'assets/projects/westfall-hillside-house/dwg_04_f4.png', kind: 'plan', label: { en: 'Floor 4 plan', zh: '四层平面' } }
    ]
  },
  {
    id: 'p03',
    slug: 'seedlings',
    title: { en: 'Seedlings', zh: '新绿幼儿园' },
    year: 2018,
    location: { en: 'Miyun, Beijing', zh: '北京 密云' },
    coords: { lat: 40.3768, lng: 116.8430 },
    type: 'institutional',
    track: 'academic',
    area_sqft: 17000,
    role: { en: 'Independent', zh: '独立项目' },
    summary: {
      en: 'A kindergarten in a Beijing village under reforestation. Three protected ancient trees become the centers; the building dissolves into the treeline — less an institution, more a grove.',
      zh: '北京密云一处退耕还林政策下村落中的幼儿园。三棵被保护的古树成为圆心，建筑悄悄溶进林线——不像机构，更像树林中生发出的场所。'
    },
    description: {
      en: 'This is a kindergarten in Zhuangtou Village, Miyun, Beijing. It sits within a village under the "Grain-for-Green" reforestation policy — 80% of the surrounding farmland will return to forest within twenty-five years. One day, the building will be swallowed by the woods.\n\nThat future is taken as the starting point. By observing how children in the nearby villages lived with trees — climbing them, sitting around them, hiding behind them, running circles, swinging from their branches — the tree, quite naturally, became the organizing unit of the site.\n\nThree protected ancient trees stood on the land. Naturally, they become the centers. Circles spread out from beneath them, shaping the building, and leaving in-between grey spaces that became the courtyards. Rather than drawing a hard edge, the kindergarten is allowed to dissolve into the treeline — reading less like an institution, more like a place that grew out of the grove. The children inhabit it the way they would a forest.',
      zh: '这是北京密云庄头村的一所幼儿园。它坐落在一片退耕还林政策下的村落里，周围 80% 的农田将在二十五年内重新变回树林。终有一天，建筑会被林子吞没。\n\n我把这个"未来"当成了起点。观察附近村子里的孩子怎么跟树相处：爬树、围坐、躲藏、绕着跑、打秋千——于是树，自然而然成了这片场地的组织单元。\n\n场地上有三棵被保护的古树，我让它们做圆心。圆从树下扩散开来，决定了建筑的形状，也暗示出灰空间作为院子。我不强调幼儿园的边界，反而让其悄悄溶进了林线里，这样它就不像一所"机构"，更像林中自然生发出来的场所。这样，孩子们就能以最自然的方式呆在里面，就像待在一片树林里。'
    },
    images: [
      { src: 'placeholder', tone: 'wood', label: '01 · Among the trees', aspect: '16/10' },
      { src: 'placeholder', tone: 'wood-dark', label: '02 · Circle court', aspect: '1/1' },
      { src: 'placeholder', tone: 'sand-light', label: '03 · Treeline edge', aspect: '4/5' }
    ],
    drawings: [
      { kind: 'plan', label: 'Site plan 1:500' },
      { kind: 'plan', label: 'Ground floor plan 1:200' }
    ]
  },
  {
    id: 'p04',
    slug: 'downstairs-bazaar',
    title: { en: 'Downstairs Bazaar', zh: '楼下生活集' },
    year: 2020,
    location: { en: 'Sanlitun, Beijing', zh: '北京 三里屯' },
    coords: { lat: 39.9389, lng: 116.4566 },
    type: 'commercial',
    track: 'academic',
    area_sqft: 215000,
    role: { en: 'Independent', zh: '独立项目' },
    summary: {
      en: 'A former bus depot at the most opulent stretch of Sanlitun, reworked into a piece of daily life pressed back against the tide of consumption — a bazaar embedded into a commercial tower, circulation as its medium.',
      zh: '将三里屯最奢华地段的一处旧公交厂房，重新构建成消费主义挤兑下的日常生活。市集逻辑被嵌进商业建筑，交通核成为媒介，重新打开"下楼即达"的可能。'
    },
    description: {
      en: 'Sanlitun — Beijing\'s byword for consumerism, a district polished over and over by gentrification. Luxury storefronts and high-rise offices rise into the clouds, while the everyday life that once belonged here is, bit by bit, devoured. This project sits in the most opulent stretch of Sanlitun, taking that location as its foothold — reworking a former bus depot into a piece of daily life pressed back against the tide of consumption.\n\nThe "bazaar" is the most compressed and exemplary form of everyday life: a web woven from ordinary transactions, answering the plainest needs of those who live nearby. It also restores an older mode of encounter — the acquaintance society, where each transaction is also the building of a relationship. The vendor and the buyer haggling over a price may come from entirely different walks of life, yet the bazaar brings them onto the same ground.\n\nThe bazaar\'s logic is embedded into a conventional commercial building, each holding its own role: the commercial program preserves the value of the site, providing small office / home office spaces, while its circulation core is opened up to carry the bazaar\'s logic of mingling into the tower itself; the bazaar, in turn, becomes the buffer between the commercial mass and the surrounding residential fabric — offering, on both sides, a daily life that is reachable simply by going downstairs. From this overlay emerges another possibility: a space that is urban without being exclusive, commercial without being alienating.\n\nWhat gentrification erases is the smoke and warmth of ordinary life. This project makes room for it — and lets it begin again.',
      zh: '三里屯，北京消费主义的代名词，一片被中产化反复打磨过的街区。奢侈品店与写字楼层叠入云，原本属于这里的日常生活，被一点点地吞噬掉。此项目正是位于三里屯最奢华的地段，以此为立足点，将旧公交厂房重新构建成消费主义挤兑下的日常生活。\n\n"市集"是日常生活最好的压缩和范本：一张由日常买卖织成的网，回应周围居民最朴素的需要。它亦带来了古老的相遇方式，是一种"熟人社会"的交往模式——交易的同时也是关系的构建。讨价还价的商贩和买家，可能完全不同的两种人物画像，但市集将他们带到一起。\n\n我将市集逻辑嵌进一个传统商业建筑里，两者各司其职：商业建筑保证地块价值，提供 small office / home office 空间，同时在办公楼中提供"交通核"，将市集的融合概念引入其中；而市集则作为商业建筑与周边现存居民区的缓冲区，向两侧同时提供"下楼即可达"的便利生活。这种融合提出了一个不一样的可能：一种属于城市、但不排斥任何人的空间；一种商业的、但不让人感到疏离的空间。\n\n中产化抹掉的人间烟火，我们在此为它提供空间，让其有再次生发的可能性。'
    },
    images: [
      { src: 'placeholder', tone: 'brick', label: '01 · Vendor row', aspect: '21/9' },
      { src: 'placeholder', tone: 'shadow', label: '02 · Tower core', aspect: '4/5' },
      { src: 'placeholder', tone: 'brick-dark', label: '03 · Section through bazaar', aspect: '16/10' },
      { src: 'placeholder', tone: 'paper', label: '04 · From the street', aspect: '4/5' }
    ],
    drawings: [
      { kind: 'plan', label: 'Site plan 1:1000' },
      { kind: 'plan', label: 'Bazaar floor plan 1:500' },
      { kind: 'section', label: 'Long section 1:500' }
    ],
    awards: [
      { en: 'Thesis of Distinction', zh: '校级优秀毕业设计' }
    ]
  },
  {
    id: 'p05',
    slug: 'the-ark',
    title: { en: 'The Ark', zh: '方舟' },
    year: 2019,
    location: { en: 'Earth, Future', zh: '地球 · 未来' },
    type: 'speculative',
    track: 'academic',
    area_sqft: null,
    role: { en: 'Independent', zh: '独立项目' },
    summary: {
      en: 'A speculative biosphere for a future of geological cooling — a bionic skeleton, Tyson-polygonal cells, five compressed ecosystems sustained within a single growing form.',
      zh: '一具仿生骨架、泰森多边形单元、多种生态系统并存的方舟——为地质时间尺度上的剧烈气候变化所设想的可栖居系统。'
    },
    description: {
      en: 'The Ark is a speculative structure designed for that future — imagined as a habitable system for life under extreme climatic conditions.\n\nAcross 4 billion years, Earth\'s climate has followed recognizable patterns. Current models project a dramatic temperature drop on a geological timescale, producing conditions incompatible with most existing ecosystems.\n\nThe Ark proposes a life-support system built around a bionic skeleton with a filtration membrane, organized into Tyson polygonal cells — each a self-contained ecosystem with a stable internal environment, capable of exchanging material with adjacent units. Five ecosystem types are compressed and mapped into the structure — forest, ocean, wetland, grassland, and urban — forming a miniaturized model of the planet\'s entire biosphere, sustained within a single growing form.\n\nThe project treats architecture not as shelter from the environment, but as a vessel for it.',
      zh: '四十亿年里，地球的气候自有其节律。当前的模型指向一次地质时间尺度上的剧烈降温——一种与现有生态系统几乎不兼容的未来。\n\n方舟的构想，是一具仿生骨架，外覆过滤膜，内部被划分为泰森多边形的单元。每一个单元，自成一个生态系统，拥有稳定的内部环境，又能与相邻的单元交换物质。森林、海洋、湿地、草原、城市——五种生态被压缩、映射进这副骨架之中，构成一个被收拢在单一生长形体里的、缩微的生物圈。\n\n建筑在此不再是遮蔽环境的容器，而是承载环境本身的容器。'
    },
    images: [
      { src: 'placeholder', tone: 'mist', label: '01 · Bionic skeleton', aspect: '4/5' },
      { src: 'placeholder', tone: 'mist-light', label: '02 · Forest cell', aspect: '1/1' },
      { src: 'placeholder', tone: 'stone-light', label: '03 · Ocean cell', aspect: '1/1' },
      { src: 'placeholder', tone: 'mist-dark', label: '04 · Cross-section', aspect: '21/9' }
    ],
    drawings: [
      { kind: 'axon', label: 'Tyson cell axon' },
      { kind: 'section', label: 'Membrane section' }
    ]
  },
  {
    id: 'p06',
    slug: 'ashton-house-remodel',
    title: { en: 'Ashton House Remodel', zh: '阿什顿街住宅翻新' },
    year: 2025,
    location: { en: 'Los Angeles, CA', zh: '加州 洛杉矶' },
    coords: { lat: 34.0522, lng: -118.2437 },
    type: 'residential',
    track: 'professional',
    area_sqft: 3250,
    role: { en: 'Lead Designer', zh: '主创设计师' },
    summary: {
      en: 'A deep renovation of a single-story L.A. residence, taken down to one street-facing wall. New structure, two stories, an occupiable roof terrace, and an ADU form a loose field of domestic life.',
      zh: '一栋洛杉矶单层住宅的深度改造——拆解至几乎只剩一面临街墙。新结构、双层、屋顶露台与独立 ADU 共同构成一个松散而完整的生活场域。'
    },
    description: {
      en: 'A deep renovation of a single-story residence in Los Angeles. The existing house was taken down to little more than one street-facing wall, allowing a new structure, spatial order, and mode of living to grow from within its trace. The house is expanded to two stories, with the roof opened up as an occupiable terrace; the former backyard storage structure is converted into a detached ADU for guests and informal gatherings. Together with the existing pool, the new ADU, main house, and central platform form a loose yet coherent field of domestic life. It is both a guest room and an illuminated edge for social occasions.\n\nThe architectural language is shaped by the interplay of shed roofs. Their shifting slopes break the massing into legible volumes, giving the house a measured tension in form while maintaining a continuous material expression. At the top, the roof terrace becomes an open interface, bringing Los Angeles light, views, and everyday life back into the architecture.\n\nThe retained street wall is the only remnant of the original house. It no longer carries a complete historical narrative; rather, it stands as a quiet point of departure, marking this project not as a simple new construction, but as a near-total reconstruction that preserves the thinnest layer of time.',
      zh: '这是一栋洛杉矶单层住宅的深度改造。原有建筑被拆解至几乎只剩一面临街墙，新的结构、空间与生活方式由此重新生长：住宅由一层扩展为两层，屋顶被释放为可抵达的露台；后院原有储物房则转化为独立 ADU，承担宾客居住与小型聚会的功能。后院保留原有泳池，新 ADU 与主屋、平台、泳池共同构成一个松散而完整的生活场域。它既是客居的房间，也是聚会时被点亮的边界。\n\n建筑形体由单坡屋顶的交错为设计语言。不同屋面形态将体块拆解为数个清晰的片段，建筑在形体上有起伏，在质感上不分裂。屋顶露台作为最高处的开放界面，将洛杉矶的天光、视线与日常生活重新纳入建筑之中。\n\n那面被保留下来的临街墙，是这栋房子唯一的旧物。它不再承担完整的历史叙事，只像一个沉默的起点，提示这次改造并非简单的新建，而是在一次近乎彻底的重构中，留下时间最薄的一层痕迹。'
    },
    cover: 'assets/projects/ashton-house-remodel/img_00_cover.png',
    indexCover: 'assets/projects/ashton-house-remodel/img_01_index-cover.png',
    images: [
      { src: 'assets/projects/ashton-house-remodel/img_02_interior.png', tone: 'wood', label: '02 · Interior', aspect: '16/10' }
    ],
    drawings: [
      { kind: 'plan', label: { en: 'Ground floor plan', zh: '一层平面' } },
      { kind: 'section', label: { en: 'Cross section', zh: '剖面' } },
      { kind: 'axon', label: { en: 'Shed-roof axon', zh: '坡屋顶轴测' } }
    ],
    awards: [
      { en: 'Built', zh: '已建成' }
    ]
  },
  {
    id: 'p07',
    slug: '798-artist-district',
    title: { en: 'The Collage Community', zh: '798 艺术家生活集' },
    year: 2018,
    location: { en: '798 Art District, Beijing', zh: '北京 798 艺术区' },
    coords: { lat: 39.9842, lng: 116.4956 },
    type: 'commercial',
    track: 'academic',
    area_sqft: null,
    role: { en: 'Independent', zh: '独立项目' },
    summary: {
      en: 'A housing community for artists near Beijing\'s 798 district. After base construction, the leading hand is handed back to residents — three transformation methods produce a community of mismatched, vivid character.',
      zh: '798 周边一处为艺术家而做的居所。建筑一期落成后，主导权交还给业主——三种改造方式（涂装、绿植、翻新）共同生成一个绚烂错落的艺术社区。'
    },
    description: {
      en: 'The site sits around Beijing\'s 798 Art District, surrounded by three art parks, an art university, and residential blocks home to many art workers. The design begins from this condition — a desire to make a comfortable home that holds the distinct personality of different artists.\n\nBecause artists tend to transform their belongings, the project hands the leading role back to the resident after the first phase of construction. Three modes of transformation are offered: painting reconstruction, green-plant transformation, and architectural renovation. Under the resident\'s direction, the second phase of design is completed — out of which emerges a vivid, mismatched, brilliant artistic community.',
      zh: '本案地块位于北京 798 艺术区周边。地块周围分布着三座艺术园区和一所艺术大学，周边居民区内还居住着大量艺术工作者。本设计正是基于周边环境的这一特点，旨在打造一个既舒适又能够展现不同艺术家独特风格的居所。\n\n鉴于艺术家喜欢改造个人物品的倾向，在建筑一期工程竣工后，主导权将移交给业主。我们将为用户提供三种改造方案：涂装改造、绿植改造以及建筑翻新。在用户的指导下，将完成二期改造设计，从而形成一个风格各异、绚丽多彩的艺术社区。'
    },
    images: [
      { src: 'placeholder', tone: 'brick', label: '01 · Phase one envelope', aspect: '16/10' },
      { src: 'placeholder', tone: 'paper', label: '02 · Paint reconstruction', aspect: '4/5' },
      { src: 'placeholder', tone: 'wood', label: '03 · Green transformation', aspect: '4/5' }
    ],
    drawings: [
      { kind: 'plan', label: 'Site plan 1:1000' },
      { kind: 'axon', label: 'Three transformation modes' }
    ]
  },
  {
    id: 'p08',
    slug: 'pku-marxism-school-building',
    title: { en: 'Marxism School Building, PKU', zh: '北京大学马克思主义学院教学楼' },
    year: 2019,
    location: { en: 'Haidian, Beijing', zh: '北京 海淀' },
    coords: { lat: 39.9899, lng: 116.3055 },
    type: 'institutional',
    track: 'professional',
    area_sqft: 85300,
    role: { en: 'Design Assistant', zh: '设计助理' },
    summary: {
      en: 'A teaching building at Peking University, abstracting the brick language of the historic Red Building. A 24-hour academic environment of cascading terraces, reading platforms, and lecture halls.',
      zh: '北京大学马克思主义学院的教学楼，抽象并重新诠释红楼的砖砌立面。室内外层叠的露台、阅读平台与讲堂，组成一个全天候、鼓励自发交流的学术场所。'
    },
    description: {
      en: 'Commissioned by Peking University, this teaching building draws on the formal language of the historic Peking University Red Building — abstracting and reinterpreting its brick facade to evoke continuity with the campus\'s architectural heritage. The program centers on an open, 24-hour academic environment: a cascading sequence of indoor and outdoor terraces, reading platforms, lecture halls, and informal gathering spaces that encourage spontaneous exchange between students and researchers.',
      zh: '这座教学楼由北京大学委托建造，其设计汲取了历史悠久的北京大学红楼的建筑语言——通过抽象化并重新诠释其砖砌立面，以此呼应校园建筑遗产的延续性。该建筑的核心是一个开放的、全天候的学术环境：室内外露台、阅读平台、演讲厅以及非正式聚会空间层层交错，营造出鼓励学生与研究人员之间自发交流的氛围。'
    },
    images: [
      { src: 'placeholder', tone: 'brick', label: '01 · Brick facade', aspect: '16/10' },
      { src: 'placeholder', tone: 'brick-dark', label: '02 · Terraced reading platform', aspect: '4/5' }
    ],
    drawings: [
      { kind: 'plan', label: 'Typical floor plan 1:300' },
      { kind: 'section', label: 'Section 1:200' }
    ]
  },
  {
    id: 'p09',
    slug: 'river-lantern',
    title: { en: 'River Lantern', zh: '河灯' },
    year: 2020,
    location: { en: 'Southern China', zh: '中国南方' },
    type: 'urban',
    track: 'research',
    area_sqft: null,
    role: { en: 'Independent', zh: '独立项目' },
    summary: {
      en: 'A universal sanitation strategy for riverside villages — modular floating units for drinking, washing, toilet, and rite — drawing energy from the current itself. The river remains source, basin, and ground of ritual.',
      zh: '为世界沿河村庄提供的普适卫生方案——漂浮的模块化单元承担饮水、洗浴、厕索、祭祀，借河流自身动能完成净化。河既是水源，也是仪式之岸。'
    },
    description: {
      en: 'The project proposes a universal sanitation strategy for riverside villages in the world\'s unserved regions. Centered on the river, a sequence of facilities — drinking water, bathing, public toilets, funeral spaces — unfolds along the waterline. The river is at once the source of drink, the place of washing, the ground of ritual, and the shore of farewell.\n\nA village in southern China serves as the case. A modular water-cycle system threads along the bank, composed to the density of each stretch. River water is drawn in, filtered, and returned for drinking and washing; spent water is filtered once more before rejoining the flow. The units float directly on the water — sparing the cost of long pipelines, while the current itself lends momentum to filtration.\n\nWhat unfolds along the river is not only daily life but ritual. Scattering ashes, floating lanterns, offerings at the water\'s edge — bonds between village and river kept across generations. The system leaves the ritual shore untouched.\n\nThe form takes its cue from the river lantern. Facilities drift on the water — weightless, translucent, swaying with the current — like the lanterns villagers release in prayer. The most ordinary acts are lifted into something close to ritual.',
      zh: '项目旨在给世界未脱贫的沿河村庄提供普适的卫生解法。以河流为中心，从饮用水、沐浴、公共厕所到丧葬等一系列的卫生设施，全部沿河水展开。河既是饮水之源，也是盥洗之处，是祭祀的场，亦是送别的岸。\n\n设计以中国南方一处沿河村落为例。一套模块化的水循环系统贴河布置，可依不同地段的人口密度与场所条件灵活组合。河水被引入设施，净化后作为饮用与盥洗之用；使用后的废水，则在重新汇入河流之前再经过滤。这些设施直接漂浮在河里，节约管道铺设成本的同时，河流本身的动能也可作为过滤的动力。\n\n沿河而生的，不只是日常，还有风俗。撒灰、放河灯、临水祭祀——这些是村庄与河之间延续了几代人的关系。模块化系统贴河展开，恰好为这些仪式留出原有的水岸。\n\n建筑形态取意于河灯。基础设施漂浮于水面之上，轻盈、半透、随波微动，如村人临水祈福时放下的一盏河灯。日常的盥洗与如厕，被赋予了一种近乎仪式的轻盈。'
    },
    images: [
      { src: 'placeholder', tone: 'mist', label: '01 · Lanterns on water', aspect: '21/9' },
      { src: 'placeholder', tone: 'mist-light', label: '02 · Module section', aspect: '4/5' },
      { src: 'placeholder', tone: 'paper', label: '03 · Ritual shore', aspect: '16/10' }
    ],
    drawings: [
      { kind: 'plan', label: 'Module plan 1:50' },
      { kind: 'section', label: 'Water-cycle section 1:50' }
    ]
  },
  {
    id: 'p10',
    slug: 'laminated-coliseum',
    title: { en: 'Laminated Coliseum', zh: '场所折叠' },
    year: 2023,
    location: { en: 'Los Angeles, CA', zh: '加州 洛杉矶' },
    coords: { lat: 34.0141, lng: -118.2879 },
    type: 'speculative',
    track: 'academic',
    area_sqft: null,
    role: { en: 'Independent', zh: '独立项目' },
    summary: {
      en: 'A thesis on contested scales: at the L.A. Memorial Coliseum, the scale of events overrides the scale of space. Architectural conflict is preserved, not resolved — as a generative force.',
      zh: '一篇关于尺度冲突的设计。以洛杉矶纪念体育馆为场地，事件的尺度取代空间的秩序——冲突被刻意保留，转为新的生成力。'
    },
    description: {
      en: 'This thesis examines the possibilities that emerge from contested scales within architectural space. Scale is framed at two registers: the scale of events and the scale of space. Within a single space, multiple events of differing scales unfold simultaneously, their territories overlapping. From the merging of these scales, new possibilities arise.\n\nTaking the LA Memorial Coliseum as its point of departure, the project is structured not by spatial order but by the scale of events themselves. Existing functions are reconfigured to amplify the collisions that occur when multiple events run in parallel. Spaces are interwoven while their contested scales are preserved — producing a design that treats architectural conflict not as a problem to be resolved, but as a generative force.',
      zh: '本设计探讨建筑空间中"尺度冲突"所开启的可能性。尺度在此被分为两个层级：事件的尺度，与空间的尺度。在同一个空间里，不同尺度的事件往往同时发生，彼此叠压、互相侵占。当这些尺度被有意地交融，新的可能性便从中生长出来。\n\n项目以洛杉矶纪念体育馆（LA Memorial Coliseum）为出发点——一个不再被空间秩序定义、而被事件尺度定义的场所。在重组其现有功能的基础上，设计刻意放大了多重事件并行时所产生的尺度碰撞。空间被相互编织，它们之间的尺度冲突被保留下来，由此生成一种新的设计语言——一种以建筑冲突为转化契机的可能性。'
    },
    images: [
      { src: 'placeholder', tone: 'stone', label: '01 · Event field', aspect: '21/9' },
      { src: 'placeholder', tone: 'stone-dark', label: '02 · Contested section', aspect: '4/5' },
      { src: 'placeholder', tone: 'sand-dark', label: '03 · Aerial view', aspect: '16/10' }
    ],
    drawings: [
      { kind: 'plan', label: 'Event-scale plan' },
      { kind: 'section', label: 'Contested section 1:500' }
    ]
  },
  {
    id: 'p11',
    slug: 'roski-teaching-building',
    title: { en: 'Roski School of Art, USC', zh: '南加大艺术学院教学楼' },
    year: 2021,
    location: { en: 'Los Angeles, CA', zh: '加州 洛杉矶' },
    coords: { lat: 34.0224, lng: -118.2851 },
    type: 'institutional',
    track: 'academic',
    area_sqft: 24157,
    role: { en: 'Independent', zh: '独立项目' },
    summary: {
      en: 'A new USC Roski campus at the corner of USC Village. Petal-arranged classrooms enclose a suspended exhibition corridor — opening both ways: the school glimpses the city, the city glimpses the work.',
      zh: '在 USC Village 街角，为 Roski 艺术学院提供的新校区。花瓣式围合的教室与工作室，环绕一条悬浮的双向展览走廊——学院望见城市，城市也望见学院。'
    },
    description: {
      en: 'The project sets a new campus for the USC Roski School of Art at a corner of USC Village. Roski is bound by two ruptures: undergraduates and graduates housed half a mile apart — close enough in distance, far enough to splinter one school into two unacquainted populations; and a less visible wall between school and community — art unfolds within, while the city remains unaware. Both point to the same absence: a center where everyone might meet.\n\nFor a school of art, the most natural form of such meeting is the exhibition. Exhibition, then, spills beyond the gallery and permeates the building itself. Circulation becomes display; walls, corridors, and corners turn into surfaces for showing.\n\nClassrooms, studios, lecture hall, and library enclose like petals; at the center floats a suspended exhibition corridor, opening both ways — the community glimpses the work being made within, while the school glimpses the city in which it dwells. Beneath, a grey space is left open; together with the rooftop plaza above the half-sunken lecture hall, it is offered to the street.',
      zh: '项目旨在 USC Village 的街角，给 USC Roski 艺术学院提供新校区。Roski 困于两重断裂：本科与研究生分居两地，半英里的距离足以让一所学院裂成两群陌生人；学院与社区之间，则隔着一道更隐形的墙——艺术在内部发生，城市无从知晓。两重断裂，指向同一个缺口：一个让所有人相遇的中心。\n\n对艺术学院而言，这种相遇最自然的形式，是展览。于是展览溢出画廊，蔓延至整栋建筑。动线即展厅，外墙、走廊、转角皆为陈列的表面。\n\n教室、工作室、讲堂、图书馆等不同功能区如花瓣围合，中心则是一条悬浮于半空的展览走廊——双向开放：社区从街上望见内里的创作，学院从内部望见所栖居的城市。走廊之下让出灰空间，与半地下讲堂的屋顶广场一道，献给街区。'
    },
    images: [
      { src: 'placeholder', tone: 'plaster', label: '01 · Suspended corridor', aspect: '21/9' },
      { src: 'placeholder', tone: 'plaster-dark', label: '02 · Petal classrooms', aspect: '1/1' },
      { src: 'placeholder', tone: 'paper', label: '03 · Street ground', aspect: '16/10' }
    ],
    drawings: [
      { kind: 'plan', label: 'Ground plan 1:300' },
      { kind: 'section', label: 'Long section 1:300' },
      { kind: 'axon', label: 'Petal-and-corridor axon' }
    ]
  },
  {
    id: 'p12',
    slug: 'korea-commercial-i',
    title: { en: 'Korea Commercial Project I', zh: '韩国商业项目 一' },
    year: 2022,
    location: { en: 'Korea', zh: '韩国' },
    type: 'commercial',
    track: 'professional',
    area_sqft: null,
    role: { en: 'Design Assistant', zh: '设计助理' },
    summary: {
      en: 'A commercial project completed during a 2022 design assistantship in Korea. Details pending.',
      zh: '2022 年在韩国一处商业项目中担任设计助理。详情待补。'
    },
    images: [
      { src: 'placeholder', tone: 'stone-light', label: '01 · Concept', aspect: '16/10' },
      { src: 'placeholder', tone: 'mist', label: '02 · Section', aspect: '4/5' }
    ],
    drawings: [
      { kind: 'plan', label: 'Plan (placeholder)' }
    ]
  },
  {
    id: 'p13',
    slug: 'korea-commercial-ii',
    title: { en: 'Korea Commercial Project II', zh: '韩国商业项目 二' },
    year: 2022,
    location: { en: 'Korea', zh: '韩国' },
    type: 'commercial',
    track: 'professional',
    area_sqft: null,
    role: { en: 'Design Assistant', zh: '设计助理' },
    summary: {
      en: 'A commercial project completed during a 2022 design assistantship in Korea. Details pending.',
      zh: '2022 年在韩国一处商业项目中担任设计助理。详情待补。'
    },
    images: [
      { src: 'placeholder', tone: 'mist-light', label: '01 · Concept', aspect: '16/10' },
      { src: 'placeholder', tone: 'stone', label: '02 · Section', aspect: '4/5' }
    ],
    drawings: [
      { kind: 'plan', label: 'Plan (placeholder)' }
    ]
  },
  {
    id: 'p14',
    slug: 'korea-commercial-iii',
    title: { en: 'Korea Commercial Project III', zh: '韩国商业项目 三' },
    year: 2022,
    location: { en: 'Korea', zh: '韩国' },
    type: 'commercial',
    track: 'professional',
    area_sqft: null,
    role: { en: 'Design Assistant', zh: '设计助理' },
    summary: {
      en: 'A commercial project completed during a 2022 design assistantship in Korea. Details pending.',
      zh: '2022 年在韩国一处商业项目中担任设计助理。详情待补。'
    },
    images: [
      { src: 'placeholder', tone: 'stone', label: '01 · Concept', aspect: '16/10' },
      { src: 'placeholder', tone: 'mist-dark', label: '02 · Section', aspect: '4/5' }
    ],
    drawings: [
      { kind: 'plan', label: 'Plan (placeholder)' }
    ]
  },
  {
    id: 'p15',
    slug: 'korea-commercial-iv',
    title: { en: 'Korea Commercial Project IV', zh: '韩国商业项目 四' },
    year: 2022,
    location: { en: 'Korea', zh: '韩国' },
    type: 'commercial',
    track: 'professional',
    area_sqft: null,
    role: { en: 'Design Assistant', zh: '设计助理' },
    summary: {
      en: 'A commercial project completed during a 2022 design assistantship in Korea. Details pending.',
      zh: '2022 年在韩国一处商业项目中担任设计助理。详情待补。'
    },
    images: [
      { src: 'placeholder', tone: 'mist', label: '01 · Concept', aspect: '16/10' },
      { src: 'placeholder', tone: 'stone-light', label: '02 · Section', aspect: '4/5' }
    ],
    drawings: [
      { kind: 'plan', label: 'Plan (placeholder)' }
    ]
  },
  {
    id: 'p16',
    slug: 'san-vicente-adu',
    title: { en: 'San Vicente ADU', zh: '圣维森特街 ADU' },
    year: 2024,
    location: { en: 'Los Angeles, CA', zh: '加州 洛杉矶' },
    coords: { lat: 34.0900, lng: -118.3850 },
    type: 'residential',
    track: 'professional',
    area_sqft: 1200,
    role: { en: 'Lead Designer', zh: '主创设计师' },
    summary: {
      en: 'A 1,200 sq ft ADU added to a residential lot on San Vicente. A small house with its own discipline — held against the main house, opening to its own slice of garden.',
      zh: '一座 1,200 平方英尺的 ADU，紧贴主屋而立。一座有自身秩序的小屋，开向自己的一片庭院。'
    },    
    description: {
      en: 'At the heart of the Carthay Neighborhoods Historic District in Los Angeles, a 1920s garage has crouched in the rear yard for nearly a century. Local code permits no more than half of the existing structure to be demolished in a single intervention; the old box-like massing thus persists as an irreducible fact — at once a constraint and a point of departure. \n\nRather than being concealed, it is brought into focus. The original garage volume is retained on the ground floor; a second story emerges above as a similar volume — laid sideways, offset, gently pressing down — the two masses interlocking in a posture of mutual insertion. No attempt is made to blur the line between old and new, nor to deliberately distinguish them. White stucco and wood-toned openings set the rhythm, echoing the existing language of the main house at the front.',
      zh: '场地位于洛杉矶卡萨（Carthay）历史保护区的中心，一座1920年代的车库蹲守后院近百年。法规约定，单次改建拆除不得超过现有结构的一半，旧屋的方盒子形体因此成为无法消融的存在。它既是限制，也是设计的起点。\n\n我们没有试图掩饰它，反而将其推向焦点。原车库的体量被保留在一层；新增的二层以另一相似体量出现，横放、错位、轻轻叠压其上，两个体块以穿插的姿态相互咬合。新旧之间不做模糊处理，亦不刻意区分。白色灰泥木色门窗点出节奏，呼应前院主屋的现有语汇。历史在这里不是被复刻的符号，而是被尊重的形体。'
    },    
    images: [
      { src: 'placeholder', tone: 'plaster', label: '01 · Approach', aspect: '16/10' },
      { src: 'placeholder', tone: 'wood', label: '02 · Garden side', aspect: '4/5' }
    ],
    drawings: [
      { kind: 'plan', label: 'Plan 1:50' },
      { kind: 'section', label: 'Section 1:50' }
    ]
  }
];

window.PROJECT_TAXONOMY = {
  track: {
    label: { en: 'Track', zh: '类别' },
    options: [
      { id: 'all', label: { en: 'All', zh: '全部' } },
      { id: 'professional', label: { en: 'Professional', zh: '实践项目' } },
      { id: 'academic', label: { en: 'Academic', zh: '学院作品' } },
      { id: 'research', label: { en: 'Research', zh: '学术探索' } }
    ]
  },
  type: {
    label: { en: 'Type', zh: '类型' },
    options: [
      { id: 'all', label: { en: 'All', zh: '全部' } },
      { id: 'residential', label: { en: 'Residential', zh: '住宅' } },
      { id: 'institutional', label: { en: 'Institutional', zh: '教育与机构' } },
      { id: 'commercial', label: { en: 'Commercial', zh: '商业' } },
      { id: 'urban', label: { en: 'Urban', zh: '城市设计' } },
      { id: 'speculative', label: { en: 'Speculative', zh: '概念探索' } }
    ]
  }
};

// CV
window.CV_DATA = {
  name: 'Sylvie Zhang',
  bio: {
    en: 'Sylvie Zhang is an architectural designer based in Los Angeles. A graduate of the USC School of Architecture, her work attends to everyday domestic life and the spatial experience of dwelling.',
    zh: '涉川 (Sylvie)，洛杉矶建筑设计师，南加州大学建筑学院研究生毕业，关注人的日常生活和居住空间体验。'
  },
  education: [
    { year: '2021–2023', school: { en: 'University of Southern California', zh: '南加州大学' }, degree: { en: 'M.Arch', zh: '建筑学硕士' } },
    { year: '2015–2020', school: { en: 'Beijing University of Civil Engineering and Architecture', zh: '北京建筑大学' }, degree: { en: 'B.Arch', zh: '建筑学学士' } }
  ],
  experience: [
    { year: '2023.10–', firm: { en: 'Dotz Inc.', zh: 'Dotz Inc.' }, role: { en: 'Design Job Captain', zh: '设计负责人' } },
    { year: '2022.', firm: { en: 'CallisonRTKL', zh: 'CallisonRTKL' }, role: { en: 'Intern', zh: '实习生' } },
    { year: '2020.', firm: { en: 'Beijing Institute of Architectural Design', zh: '北京建筑设计研究院' }, role: { en: 'Intern', zh: '实习生' } }
  ],
  // Skills — 你来填具体内容
  skills: [
    { group: { en: 'Design', zh: '设计' }, items: ['Rhino', 'Grasshopper', 'Revit', 'AutoCAD', 'SketchUp', 'Archicad'] },
    { group: { en: 'Visualization', zh: '可视化' }, items: ['V-Ray', 'Enscape', 'Lumion'] },
    { group: { en: 'Graphic', zh: '图形' }, items: ['Photoshop', 'Illustrator', 'InDesign'] },
    { group: { en: 'Languages', zh: '语言' }, items: ['English', '中文'] },
    { group: { en: 'Others', zh: '其他' }, items: ['Parametric design', 'Office Suite', '3D printing', 'Laser cutting', 'CNC'] }
    
    
  ],
  awards: [
    { year: 2024, en: 'USC Thesis Honors', zh: 'USC 毕业设计荣誉奖' },
    { year: 2023, en: 'Studio Award, USC', zh: 'USC 设计课优胜奖' },
    { year: 2022, en: 'Travel Fellowship', zh: '旅行学者基金' }
  ],
  contact: {
    email: 'szhang52@alumni.usc.edu',
    linkedin: 'linkedin.com/in/sylvie-zhang'
  }
};

// Exploration — 绘画 / 参数化 / 摄影 / 模型 / 文章 / 视频
// 添加新条目同上：在数组末尾加一条
//   kind  'painting' | 'parametric' | 'photo' | 'model' | 'writing' | 'video'
window.EXPLORATION_TAXONOMY = {
  options: [
    { id: 'all', label: { en: 'All', zh: '全部' } },
    { id: 'painting', label: { en: 'Painting', zh: '绘画' } },
    { id: 'parametric', label: { en: 'Parametric', zh: '参数化' } },
    { id: 'photo', label: { en: 'Photography', zh: '摄影' } },
    { id: 'model', label: { en: 'Model', zh: '模型' } },
    { id: 'writing', label: { en: 'Writing', zh: '文章' } },
    { id: 'video', label: { en: 'Video', zh: '视频' } }
  ]
};

window.EXPLORATIONS = [
  { id: 'e01', kind: 'painting',  year: 2025, title: { en: 'Untitled (Encino I)', zh: '无题（恩西诺一）' }, medium: { en: 'Watercolor on paper', zh: '纸本水彩' }, tone: 'plaster',     aspect: '4/5' },
  { id: 'e02', kind: 'painting',  year: 2024, title: { en: 'Kitchen Window',      zh: '厨房的窗' },         medium: { en: 'Gouache, 24×30 cm',   zh: '水粉 24×30 cm' }, tone: 'sand-light', aspect: '4/5' },
  { id: 'e03', kind: 'parametric',year: 2024, title: { en: 'Caustic Studies',     zh: '焦散研究' },         medium: { en: 'Grasshopper · Octopus', zh: 'Grasshopper · Octopus' }, tone: 'cool',     aspect: '1/1' },
  { id: 'e04', kind: 'parametric',year: 2023, title: { en: 'Branching No. 4',     zh: '分形 No.4' },        medium: { en: 'Grasshopper · Kangaroo', zh: 'Grasshopper · Kangaroo' }, tone: 'stone-light', aspect: '16/10' },
  { id: 'e05', kind: 'photo',     year: 2025, title: { en: 'Yucca Valley · 06:14', zh: '尤卡山谷 · 06:14' }, medium: { en: 'Fujifilm X-Pro3 · 35mm', zh: '富士 X-Pro3 · 35mm' }, tone: 'desert',     aspect: '3/2' },
  { id: 'e06', kind: 'photo',     year: 2024, title: { en: 'Untitled (Stairs)',   zh: '无题（楼梯）' },     medium: { en: 'Mamiya 7 · Portra 400',  zh: '玛米亚 7 · Portra 400' }, tone: 'shadow',     aspect: '4/5' },
  { id: 'e07', kind: 'photo',     year: 2024, title: { en: 'San Pedro Pier',      zh: '圣佩德罗码头' },     medium: { en: 'iPhone',                 zh: 'iPhone' }, tone: 'mist',       aspect: '3/2' },
  { id: 'e08', kind: 'model',     year: 2024, title: { en: 'Thesis · 1:200',      zh: '毕设模型 1:200' },   medium: { en: 'Basswood, MDF',          zh: '巴沙木、密度板' }, tone: 'wood',       aspect: '1/1' },
  { id: 'e09', kind: 'model',     year: 2023, title: { en: 'Chapel · 1:50 fragment', zh: '教堂 1:50 片段' }, medium: { en: 'Cast plaster',           zh: '石膏浇筑' }, tone: 'plaster',    aspect: '4/5' },
  { id: 'e10', kind: 'writing',   year: 2024, title: { en: 'On the Domesticity of Corridors', zh: '论走廊的家居性' }, medium: { en: 'Essay · 4,200 words',    zh: '论文 · 4,200 字' }, tone: 'paper',      aspect: '4/5', link: '#' },
  { id: 'e11', kind: 'writing',   year: 2023, title: { en: 'Notes on Shadows',    zh: '关于阴影的笔记' },   medium: { en: 'Notebook excerpt',       zh: '手稿摘录' }, tone: 'paper-dark', aspect: '4/5', link: '#' },
  { id: 'e12', kind: 'video',     year: 2025, title: { en: 'Hillside · Reel',     zh: '山坡 · 短片' },      medium: { en: 'iPhone · 00:48',         zh: 'iPhone · 00:48' }, tone: 'sand-dark', aspect: '16/10', link: '#' }
];
