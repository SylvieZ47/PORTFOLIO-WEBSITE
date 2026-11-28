// 首页体块图标的数据。单位随意（约 1 = 一层楼高），x 轴朝右下、y 轴朝左下、z 朝上。
// parts：形体。box {at, size}；prism {poly, z, axis}；cyl {c, r, z}；arc {c, r:[内,外], a:[起,止]度, z}；round {rect, r, z}
//   g: 分组号（动作按组算）；accent: 强调色 + 斜线（被操作的那块）；hid:false 不画它自己被挡住的虚线；terrain: 地形（算交线）
// moves：每组的动作，k 从 0 到 1。t 平移；s 缩放（绕 o）；rz 绕竖轴转（度，绕 o）；span 这一组在 0–1 里的起止，用来错开
// The Ark（泰森多边形那个）不在这里，首页继续用它原来的手绘图标。
(function (root) {
  const box = (at, size, o) => Object.assign({ shape: 'box', at, size }, o || {});
  const W = { hid: false };
  const M = {};

  // Seedlings：三棵古树是圆心，环形的园舍绕着它们。动作：树心从地面升起（Encircle）
  M['seedlings'] = {
    op: { en: 'Encircle', zh: '环抱' },
    parts: [
      { shape: 'arc', c: [0, 0], r: [2.0, 2.8], a: [35, 320], z: [0, 0.7], hid: false },
      { shape: 'arc', c: [4.7, 2.3], r: [0.95, 1.5], a: [-150, 170], z: [0, 0.7], hid: false },
      { shape: 'arc', c: [1.3, 4.9], r: [0.55, 1.0], a: [20, 330], z: [0, 0.7], hid: false },
      { shape: 'cyl', c: [0, 0], r: 0.55, z: [0, 0.15], accent: true, g: 1 },
      { shape: 'cyl', c: [4.7, 2.3], r: 0.42, z: [0, 0.15], accent: true, g: 2 },
      { shape: 'cyl', c: [1.3, 4.9], r: 0.3, z: [0, 0.15], accent: true, g: 3 },
    ],
    moves: {
      1: { s: [1, 1, 15], span: [0, 0.8] },
      2: { s: [1, 1, 11], span: [0.1, 0.9] },
      3: { s: [1, 1, 9], span: [0.2, 1] },
    },
  };

  // River Lantern：岸边码头 + 漂浮的卫生单元。动作：一个单元离岸漂出去（Detach）
  M['river-lantern'] = {
    op: { en: 'Detach', zh: '离岸' },
    parts: [
      box([-1, -2.2, 0], [9, 2.2, 0.6], W),
      box([0.5, 0.15, 0], [2.4, 2.2, 0.15], W),
      { shape: 'cyl', c: [1.2, 1.0], r: 0.55, z: [0.15, 1.3], hid: false },
      box([1.9, 0.5, 0.15], [0.8, 1.3, 0.9], W),
      box([4.2, 0.15, 0], [2.6, 2.6, 0.15], { accent: true, g: 1 }),
      box([4.45, 0.4, 0.15], [1.25, 1.25, 1.0], { accent: true, g: 1 }),
      { shape: 'cyl', c: [6.1, 2.0], r: 0.5, z: [0.15, 1.15], accent: true, g: 1 },
    ],
    moves: { 1: { t: [0.6, 2.4, 0], rz: 14, o: [5.5, 1.45, 0] } },
  };

  // 798 Collage Community：一期是均质的格子，住户各自改造。动作：三格被住户"换掉"，往外推出（Insert）
  {
    const parts = [], A = { '1,0': 1, '3,1': 2, '5,1': 3 };
    for (let z = 0; z < 2; z++) for (let x = 0; x < 6; x++) {
      const g = A[x + ',' + z];
      parts.push(box([x, 0, z], [1, 1, 1], g ? { accent: true, g } : W));
    }
    M['798-artist-district'] = {
      op: { en: 'Insert', zh: '置换' },
      parts,
      moves: {
        1: { t: [0, 0.9, 0], span: [0, 0.7] },
        2: { t: [0, 0, 0.9], span: [0.15, 0.85] },
        3: { t: [0.9, 0, 0], span: [0.3, 1] },
      },
    };
  }

  // Downstairs Bazaar：旧场站的裙房 + 上面的商业塔楼。动作：从中间剖开，市集层长出来（Incision）
  {
    const parts = [box([0, 0, 0], [7, 4, 0.9], W)];
    for (const x of [0.5, 2.05, 3.6, 5.15]) for (const y of [0.55, 2.2])
      parts.push(box([x, y, 0.9], [1.25, 1.25, 0.3], { accent: true, g: 1, hid: false }));
    parts.push(box([1.3, 1.1, 1.2], [4.4, 2.0, 2.6], { hid: false, g: 2 }));
    M['downstairs-bazaar'] = {
      op: { en: 'Incision', zh: '切入' },
      parts,
      moves: { 1: { s: [1, 1, 3], o: [0, 0, 0.9] }, 2: { t: [0, 0, 0.6] } },
    };
  }

  // Ashton House：老房子拆到只剩临街一面墙，重建成两层 + 屋顶平台 + ADU。动作：新加的二层和楼梯间提起来（Stack）
  M['ashton-house-remodel'] = {
    op: { en: 'Stack', zh: '叠加' },
    parts: [
      box([0, 0, 0], [4.4, 3.4, 1.0], W),
      box([-1.6, 0.7, 0], [1.6, 2.3, 0.8], W),
      box([0.1, 3.4, 0.92], [2.6, 0.55, 0.08], W),
      box([-4.2, -3.0, 0], [2.4, 2.0, 0.9], W),
      box([0.3, 0.25, 1.0], [3.2, 2.6, 1.0], { accent: true, g: 1 }),
      { shape: 'prism', axis: 'y', poly: [[2.0, 1.2], [2.0, 2.1], [2.85, 2.1], [3.3, 1.2]], z: [0.45, 1.35], accent: true, g: 1 },
    ],
    moves: { 1: { t: [0, 0, 0.9] } },
  };

  // PKU：两栋楼隔着马路，一条连廊连起来。动作：两楼拉开，连廊跟着伸长，始终连着（Bridge）
  M['pku-marxism-school-building'] = {
    op: { en: 'Bridge', zh: '连接' },
    parts: [
      box([0, 0, 0], [3.6, 2.8, 1.6], { hid: false, g: 1 }),
      { shape: 'prism', poly: [[5.4, 0], [11, 0], [11, 6], [9.6, 6], [9.6, 1.4], [6.8, 1.4], [6.8, 6], [5.4, 6]], z: [0, 1.6], hid: false },
      { shape: 'cyl', c: [8.2, 4.0], r: 1.0, z: [0, 1.1], hid: false },
      box([3.6, 0.8, 0.95], [1.8, 0.9, 0.5], { accent: true, g: 2 }),
    ],
    moves: { 1: { t: [-1.2, 0, 0] }, 2: { s: [3.0 / 1.8, 1, 1], o: [5.4, 0, 0] } },
  };

  // Westfall：陡坡上一级级落下的房子，借"地下室"的定义把面积几乎翻倍。
  // 静止时埋在山里的地下室只露出虚线；动作：把它从山体里抽出来（Excavate）
  M['westfall-hillside-house'] = {
    op: { en: 'Excavate', zh: '掘出' },
    parts: [
      { shape: 'prism', axis: 'x', poly: [[0, 0], [9.2, 0], [1.2, 6.0], [0, 6.0]], z: [0, 4.6], terrain: true, hid: false },
      box([0.8, 7.0, 0], [3, 2.6, 1.1], W),
      box([0.8, 5.8, 1.1], [3, 2.6, 1.1], W),
      box([0.8, 4.4, 2.2], [3, 2.6, 1.1], W),
      box([1.2, 3.4, 3.3], [2.2, 2.2, 0.9], W),
      box([0.8, 4.4, 0], [3, 2.6, 1.1], { accent: true, g: 1 }),
      box([0.8, 3.4, 1.1], [3, 2.4, 1.1], { accent: true, g: 1 }),
    ],
    moves: { 1: { t: [5.2, 0, 0] } },
  };

  // Beck：三层的长条保障住房，街角一块木头包的圆角体量。动作：街角这块"嫁接"上去的材料拔出来（Graft）
  {
    const parts = [
      box([0, 0, 0], [7, 2.2, 2.4], W),
      box([-1.2, 0.2, 0], [1.2, 1.6, 3.3], W),
    ];
    for (const x of [1.4, 3.0, 4.6]) for (const z of [0.85, 1.65]) parts.push(box([x, 2.2, z], [1.0, 0.35, 0.45], W));
    parts.push({ shape: 'round', rect: [7, -0.2, 8.4, 2.6], r: 1.0, z: [0, 2.7], accent: true, g: 1 });
    M['beck-corner-apartment'] = {
      op: { en: 'Graft', zh: '嫁接' },
      parts,
      moves: { 1: { t: [0.9, 0.9, 0.3] } },
    };
  }

  root.MASSING = M;
  if (typeof module !== 'undefined' && module.exports) module.exports = M;
})(typeof window !== 'undefined' ? window : globalThis);
