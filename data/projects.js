// 项目数据 / Project data
// 添加新项目：在数组末尾加一条记录即可。
//
// 字段说明：
//   id            唯一英文标识
//   slug          URL片段
//   title         {en, zh}
//   year          数字 (主)
//   year_range    可选字符串 '2023–2024'
//   location      {en, zh}
//   coords        { lat, lng }  十进制
//   type          'public' | 'residential' | 'installation' | 'research'
//   track         'professional' | 'academic' | 'research'
//   area_sqft     数字（真值始终用 sq ft，中文页面自动换算成 ㎡），可为 null
//   role          {en, zh}
//   summary       {en, zh}
//   images        [{src, tone, label, aspect?}]  封面是第一张
//                 aspect 可选，省略则用默认裁切；用于自适应布局时按比例排版
//   drawings      [{kind, label}]
//   awards        [{en, zh}]  可选

window.PROJECTS = [
  {
    id: 'p01',
    slug: 'westfall-hillside-house',
    title: { en: 'Westfall Hillside House', zh: '韦斯特福尔山坡住宅' },
    year: 2025,
    location: { en: 'Encino, CA', zh: '加州 恩西诺' },
    coords: { lat: 34.1595, lng: -118.5012 },
    type: 'residential',
    track: 'professional',
    area_sqft: 3200,
    role: { en: 'Lead Designer', zh: '主创设计师' },
    summary: {
      en: 'A hillside house carved into the southern slope of the San Fernando Valley. A single deep section steps down with the land, holding three terraces and a long pool that registers the canyon wind.',
      zh: '一座切入圣费尔南多谷南坡的山地住宅。一个深邃的剖面随地形跌落，容纳三层平台与一条记录峡谷风向的长泳池。'
    },
    images: [
      { src: 'placeholder', tone: 'sand', label: '01 · Approach from the canyon road', aspect: '16/10' },
      { src: 'placeholder', tone: 'sand-dark', label: '02 · The terraced courtyard', aspect: '4/5' },
      { src: 'placeholder', tone: 'sand-light', label: '03 · Long pool · dusk', aspect: '16/10' }
    ],
    drawings: [
      { kind: 'plan', label: 'Ground plan 1:200' },
      { kind: 'section', label: 'Section A–A 1:100' }
    ]
  },
  {
    id: 'p02',
    slug: 'reading-room-for-one',
    title: { en: 'A Reading Room for One', zh: '一人阅览室' },
    year: 2024,
    location: { en: 'Los Angeles, CA', zh: '洛杉矶' },
    coords: { lat: 34.0224, lng: -118.2851 },
    type: 'installation',
    track: 'academic',
    area_sqft: 97,
    role: { en: 'Lead Designer', zh: '独立作者' },
    summary: {
      en: 'A nine-square-meter timber pavilion sized precisely to hold one reader, one book, and the western light at four o\'clock.',
      zh: '一个九平方米的木构亭，精确容纳一位读者、一本书，以及下午四点的西向光线。'
    },
    images: [
      { src: 'placeholder', tone: 'wood', label: '01 · Pavilion at 4pm', aspect: '4/5' },
      { src: 'placeholder', tone: 'wood-dark', label: '02 · Interior', aspect: '1/1' }
    ],
    drawings: [
      { kind: 'plan', label: 'Plan 1:50' },
      { kind: 'axon', label: 'Exploded axonometric' }
    ]
  },
  {
    id: 'p03',
    slug: 'civic-archive',
    title: { en: 'Civic Archive', zh: '市民档案馆' },
    year: 2024,
    year_range: '2023–2024',
    location: { en: 'Long Beach, CA', zh: '加州 长滩' },
    coords: { lat: 33.7701, lng: -118.1937 },
    type: 'public',
    track: 'academic',
    area_sqft: 51700,
    role: { en: 'Lead Designer (Thesis)', zh: '主创（毕业设计）' },
    summary: {
      en: 'A municipal archive that treats public memory as a slow, walkable landscape. Visitors descend through stacks the way one descends a hillside.',
      zh: '将公共记忆当作可漫步的缓坡来组织的市档案馆。访客像沿着山坡下行一样穿过层叠的书库。'
    },
    images: [
      { src: 'placeholder', tone: 'stone', label: '01 · Reading hall', aspect: '16/10' },
      { src: 'placeholder', tone: 'stone-dark', label: '02 · Stacks', aspect: '4/5' },
      { src: 'placeholder', tone: 'stone-light', label: '03 · Civic stair', aspect: '4/5' },
      { src: 'placeholder', tone: 'stone', label: '04 · Roof terrace', aspect: '21/9' }
    ],
    drawings: [
      { kind: 'plan', label: 'Level 0 plan 1:500' },
      { kind: 'plan', label: 'Level -1 plan 1:500' },
      { kind: 'section', label: 'Long section 1:300' }
    ],
    awards: [
      { en: 'USC Thesis Honors, 2024', zh: 'USC 毕业设计荣誉奖, 2024' }
    ]
  },
  {
    id: 'p04',
    slug: 'three-courtyards',
    title: { en: 'Three Courtyards', zh: '三进院' },
    year: 2023,
    location: { en: 'Pasadena, CA', zh: '加州 帕萨迪纳' },
    coords: { lat: 34.1478, lng: -118.1445 },
    type: 'residential',
    track: 'professional',
    area_sqft: 3014,
    role: { en: 'Team Member', zh: '团队成员' },
    summary: {
      en: 'A renovation of a 1920s bungalow into three rooms organized around three different qualities of light: morning, noon, and dusk.',
      zh: '把一栋1920年代的小屋改造为三间围绕不同光质组织的房间——晨光、午光、暮光。'
    },
    images: [
      { src: 'placeholder', tone: 'plaster', label: '01 · Morning court', aspect: '1/1' },
      { src: 'placeholder', tone: 'plaster-dark', label: '02 · Dusk court', aspect: '4/5' }
    ],
    drawings: [
      { kind: 'plan', label: 'Plan 1:100' }
    ]
  },
  {
    id: 'p05',
    slug: 'thin-air-chapel',
    title: { en: 'Thin Air Chapel', zh: '稀薄空气教堂' },
    year: 2023,
    location: { en: 'Joshua Tree, CA', zh: '加州 约书亚树' },
    coords: { lat: 33.8734, lng: -116.3100 },
    type: 'public',
    track: 'academic',
    area_sqft: 1507,
    role: { en: 'Lead Designer', zh: '主创设计师' },
    summary: {
      en: 'A non-denominational chapel that offers no walls, only thresholds — a sequence of seven arches calibrated to the desert horizon.',
      zh: '一座没有墙、只有门槛的非宗派教堂——七道拱门按沙漠地平线的角度被校准。'
    },
    images: [
      { src: 'placeholder', tone: 'desert', label: '01 · Seven arches', aspect: '21/9' },
      { src: 'placeholder', tone: 'desert-dark', label: '02 · At dusk', aspect: '16/10' },
      { src: 'placeholder', tone: 'desert-light', label: '03 · Plan view', aspect: '1/1' }
    ],
    drawings: [
      { kind: 'plan', label: 'Plan 1:200' },
      { kind: 'section', label: 'Seven sections 1:100' }
    ]
  },
  {
    id: 'p06',
    slug: 'on-the-domesticity-of-corridors',
    title: { en: 'On the Domesticity of Corridors', zh: '论走廊的家居性' },
    year: 2023,
    location: { en: 'Los Angeles, CA', zh: '洛杉矶' },
    coords: { lat: 34.0522, lng: -118.2437 },
    type: 'research',
    track: 'research',
    area_sqft: null,
    role: { en: 'Author', zh: '作者' },
    summary: {
      en: 'A typological essay that re-reads the corridor — that supposedly servant space — as the most lived-in room of the modern American home.',
      zh: '一篇类型学论文，将走廊——那个被认为只是辅助空间——重新阅读为美国现代住宅中被使用得最频繁的房间。'
    },
    images: [
      { src: 'placeholder', tone: 'paper', label: '01 · Catalogue spread', aspect: '4/5' },
      { src: 'placeholder', tone: 'paper-dark', label: '02 · Plan diagrams', aspect: '4/5' }
    ],
    drawings: []
  },
  {
    id: 'p07',
    slug: 'bookstore-on-spring',
    title: { en: 'Bookstore on Spring', zh: 'Spring 街书店' },
    year: 2022,
    location: { en: 'Los Angeles, CA', zh: '洛杉矶 市中心' },
    coords: { lat: 34.0500, lng: -118.2469 },
    type: 'public',
    track: 'professional',
    area_sqft: 4521,
    role: { en: 'Team Member', zh: '团队成员' },
    summary: {
      en: 'A neighborhood bookstore inserted into a 1910 brick warehouse. The shelves carry the load; the building reads as one long table.',
      zh: '一座插入1910年砖仓库中的社区书店。书架承重，整栋建筑被读作一张长桌。'
    },
    images: [
      { src: 'placeholder', tone: 'brick', label: '01 · Long table', aspect: '21/9' },
      { src: 'placeholder', tone: 'brick-dark', label: '02 · Reading nook', aspect: '1/1' }
    ],
    drawings: [
      { kind: 'plan', label: 'Plan 1:150' },
      { kind: 'section', label: 'Section 1:100' }
    ]
  },
  {
    id: 'p08',
    slug: 'shadow-house',
    title: { en: 'Shadow House', zh: '影屋' },
    year: 2022,
    location: { en: 'Ojai, CA', zh: '加州 奥海' },
    coords: { lat: 34.4480, lng: -119.2429 },
    type: 'residential',
    track: 'academic',
    area_sqft: 1938,
    role: { en: 'Lead Designer', zh: '主创设计师' },
    summary: {
      en: 'A studio-house designed entirely by the shadows it casts on its own courtyard at four moments of the year — solstices and equinoxes.',
      zh: '一座完全由它在自己院子上投下的阴影设计而成的画室住宅——四个时刻：两个至日与两个分日。'
    },
    images: [
      { src: 'placeholder', tone: 'shadow', label: '01 · Equinox shadow', aspect: '4/5' },
      { src: 'placeholder', tone: 'shadow-dark', label: '02 · Solstice', aspect: '16/10' }
    ],
    drawings: [
      { kind: 'plan', label: 'Plan 1:100' },
      { kind: 'axon', label: 'Shadow studies' }
    ]
  },
  {
    id: 'p09',
    slug: 'four-rooms-in-yangshuo',
    title: { en: 'Four Rooms in Yangshuo', zh: '阳朔四间房' },
    year: 2022,
    location: { en: 'Yangshuo, China', zh: '广西 阳朔' },
    coords: { lat: 24.7785, lng: 110.4969 },
    type: 'residential',
    track: 'academic',
    area_sqft: 3875,
    role: { en: 'Lead Designer', zh: '主创设计师' },
    summary: {
      en: 'A small inn on a karst hillside. Four rooms — kitchen, bath, sleep, sit — distributed across the slope and connected only by outdoor stairs.',
      zh: '建在喀斯特山坡上的一座小客栈。四间房——厨、浴、卧、坐——散布于山坡之上，仅由室外楼梯相连。'
    },
    images: [
      { src: 'placeholder', tone: 'mist', label: '01 · From the river', aspect: '21/9' },
      { src: 'placeholder', tone: 'mist-dark', label: '02 · Kitchen room', aspect: '4/5' },
      { src: 'placeholder', tone: 'mist-light', label: '03 · Sit room at dusk', aspect: '16/10' }
    ],
    drawings: [
      { kind: 'plan', label: 'Site plan 1:500' },
      { kind: 'section', label: 'Hillside section 1:200' }
    ]
  },
  {
    id: 'p10',
    slug: 'a-table-and-its-room',
    title: { en: 'A Table and Its Room', zh: '一张桌子和它的房间' },
    year: 2021,
    location: { en: 'Los Angeles, CA', zh: '洛杉矶' },
    coords: { lat: 34.0224, lng: -118.2851 },
    type: 'installation',
    track: 'academic',
    area_sqft: 258,
    role: { en: 'Lead Designer', zh: '独立作者' },
    summary: {
      en: 'A first-year studio exercise: design a room around a single table. The table dictates the column grid, the ceiling height, and the door.',
      zh: '建筑学一年级练习：围绕一张桌子设计一个房间。桌子决定了柱网、净高和门的位置。'
    },
    images: [
      { src: 'placeholder', tone: 'study', label: '01 · The table', aspect: '1/1' },
      { src: 'placeholder', tone: 'study-dark', label: '02 · The room', aspect: '4/5' }
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
      { id: 'professional', label: { en: 'WIP / Professional', zh: '落地项目' } },
      { id: 'academic', label: { en: 'Academic', zh: '学院作品' } },
      { id: 'research', label: { en: 'Research', zh: '学术探索' } }
    ]
  },
  type: {
    label: { en: 'Type', zh: '类型' },
    options: [
      { id: 'all', label: { en: 'All', zh: '全部' } },
      { id: 'public', label: { en: 'Public', zh: '公建' } },
      { id: 'residential', label: { en: 'Residential', zh: '住宅' } },
      { id: 'installation', label: { en: 'Installation', zh: '装置/小品' } },
      { id: 'research', label: { en: 'Research', zh: '研究' } }
    ]
  }
};

// CV
window.CV_DATA = {
  name: 'Sylvie Zhang',
  bio: {
    en: 'Sylvie Zhang is an architectural designer based in Los Angeles. A graduate of the USC School of Architecture, her work attends to everyday domestic life and the spatial experience of dwelling.',
    zh: 'Sylvie Zhang，洛杉矶建筑设计师，USC 建筑学院研究生毕业，关注人的日常生活和居住空间体验。'
  },
  education: [
    { year: '2022–2024', school: { en: 'University of Southern California', zh: '南加州大学' }, degree: { en: 'M.Arch', zh: '建筑学硕士' } },
    { year: '2017–2021', school: { en: 'Beijing University of Civil Engineering and Architecture', zh: '北京建筑大学' }, degree: { en: 'B.Arch', zh: '建筑学学士' } }
  ],
  experience: [
    { year: '2024–', firm: { en: 'Dotz Inc.', zh: 'Dotz Inc.' }, role: { en: 'Design Job Captain', zh: '设计组长' } },
    { year: '2023', firm: { en: 'Summer Practice', zh: '暑期实习' }, role: { en: 'Intern', zh: '实习生' } }
  ],
  // Skills — 你来填具体内容
  skills: [
    { group: { en: 'Design', zh: '设计' }, items: ['Rhino', 'Grasshopper', 'Revit', 'AutoCAD', 'SketchUp'] },
    { group: { en: 'Visualization', zh: '可视化' }, items: ['V-Ray', 'Enscape', 'Lumion', 'Twinmotion'] },
    { group: { en: 'Graphic', zh: '图形' }, items: ['Photoshop', 'Illustrator', 'InDesign', 'After Effects'] },
    { group: { en: 'Fabrication', zh: '建造' }, items: ['Laser cutting', 'CNC', '3D printing', 'Wood / metal shop'] },
    { group: { en: 'Languages', zh: '语言' }, items: ['English', '中文', '日本語 (N3)'] }
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
