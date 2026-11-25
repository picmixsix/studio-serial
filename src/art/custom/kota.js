// Paket latar kota & tempat umum: warna dan suasana berbeda dari rumah cokelat bawaan.
// Format sama dengan gudang.js. Kanvas 1080 x 1920.
import { W, H, lin, rad, r2 } from '../util.js'

const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`
const circ = (x, y, r, fill, extra = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" ${extra}/>`
const poly = (pts, fill, extra = '') => `<polygon points="${pts}" fill="${fill}" ${extra}/>`

// deret gedung siluet dengan jendela menyala (deterministik)
const skyline = (y0, color, win, seed = 0) => {
  let b = ''
  const hs = [520, 760, 430, 880, 600, 700, 480]
  hs.forEach((h, i) => {
    const x = i * 165 - 30, w = 150
    b += rect(x, y0 - h, w, h + 400, color)
    for (let k = 0; k < Math.floor(h / 90); k++) for (let j = 0; j < 3; j++) if ((i * 5 + k * 3 + j + seed) % 3 === 0) b += rect(x + 22 + j * 40, y0 - h + 30 + k * 90, 22, 34, win, 'opacity=".8"')
  })
  return b
}

const fluor = (t, k = 0) => (Math.sin(t * 17 + k) > 0.985 ? 0.55 : 1)

export default {
  latar: {
    persimpangan: (u, t) => {
      const ph = Math.floor(t * 1.4) % 3
      const cols = ['#ff3b30', '#ffc21a', '#2ee27a']
      const on = ph === 0 ? 0 : ph === 1 ? 2 : 1 // merah -> hijau -> kuning, tanpa pemicu
      const lamp = (cx, cy, i) => circ(cx, cy, 24, i === ph ? cols[i] : '#262626') + (i === ph ? circ(cx, cy, 120, `url(#${u}pg${i})`) : '')
      const stripes = Array.from({ length: 9 }, (_, i) => rect(40 + i * 115, 1390, 80, 120, '#d8d8cf', 'opacity=".78"')).join('')
      return {
        anchor: { x: 250, y: 1660, s: 1 }, props: { bayangan: { x: 780, y: 1580, s: 0.8 }, mata: { x: 560, y: 980, s: 1.2 } },
        svg: `<defs>${lin(u + 'ps', 0, 0, 0, 1, [[0, '#040716'], [1, '#1d2b58']])}${lin(u + 'pr', 0, 0, 0, 1, [[0, '#262b3a'], [1, '#12151f']])}` +
          [0, 1, 2].map(i => rad(u + 'pg' + i, 0.5, 0.5, 0.5, [[0, cols[i], 0.55], [1, cols[i], 0]])).join('') + '</defs>' +
          rect(0, 0, W, H, `url(#${u}ps)`) + skyline(1280, '#0b1130', '#9fd0ff', 1) +
          rect(0, 1280, W, 640, `url(#${u}pr)`) + rect(0, 1270, W, 22, '#3a3f52') + stripes +
          [0, 1, 2, 3].map(i => rect(80 + i * 270, 1700, 150, 16, '#c9c2a0', 'opacity=".55"')).join('') +
          rect(822, 460, 24, 840, '#101216') + rect(560, 500, 286, 20, '#101216') + rect(560, 520, 14, 40, '#101216') +
          rect(540, 556, 120, 280, '#16181d', 'rx="18"') + lamp(600, 610, 0) + lamp(600, 696, 1) + lamp(600, 782, 2) +
          rect(790, 900, 88, 200, '#16181d', 'rx="14"') + circ(834, 940, 18, ph === 0 ? '#ff3b30' : '#262626') + circ(834, 1000, 18, ph === 1 ? '#ffc21a' : '#262626') + circ(834, 1060, 18, ph === 2 ? '#2ee27a' : '#262626'),
      }
    },

    halte: (u, t) => ({
      anchor: { x: 300, y: 1640, s: 1 }, props: { bayangan: { x: 860, y: 1560, s: 0.85 }, mata: { x: 560, y: 980, s: 1.2 } },
      svg: `<defs>${lin(u + 'hs', 0, 0, 0, 1, [[0, '#2a2052'], [0.55, '#8a4a78'], [1, '#f39a62']])}${lin(u + 'hg', 0, 0, 0, 1, [[0, '#ff7ab8'], [1, '#6a3aff']])}${rad(u + 'hl', 0.5, 0.5, 0.5, [[0, '#ffe2a0', 0.5], [1, '#ffe2a0', 0]])}</defs>` +
        rect(0, 0, W, H, `url(#${u}hs)`) + skyline(1300, '#2a1c3f', '#ffd08a', 2) +
        rect(0, 1300, W, 620, '#2d2c36') + rect(0, 1380, W, 540, '#3b3a46') + rect(0, 1370, W, 16, '#7a7a88') +
        rect(90, 650, 900, 36, '#37424f') + rect(104, 686, 22, 700, '#37424f') + rect(954, 686, 22, 700, '#37424f') +
        rect(126, 690, 828, 690, '#9fd0e8', 'opacity=".14"') + rect(690, 740, 230, 400, `url(#${u}hg)`, 'rx="8" opacity=".9"') + rect(702, 752, 206, 376, '#12121a', 'rx="4" opacity=".25"') +
        rect(190, 1240, 440, 26, '#5a4a3a') + rect(210, 1266, 18, 120, '#2b2b33') + rect(590, 1266, 18, 120, '#2b2b33') + rect(190, 1160, 440, 18, '#6b5a48') +
        rect(1000, 560, 16, 820, '#1d1d24') + rect(930, 520, 160, 120, '#2a62d8', 'rx="14"') + circ(1010, 580, 34, '#fff') + `<circle cx="${r2(500 + Math.sin(t) * 0)}" cy="640" r="0"/>` +
        rect(40, 380, 14, 1000, '#15151b') + circ(47, 380, 240, `url(#${u}hl)`),
    }),

    lift: (u, t) => {
      const f = fluor(t)
      const lvl = 13 + (Math.floor(t * 0.6) % 2)
      return {
        anchor: { x: 270, y: 1640, s: 1.05 }, props: { bayangan: { x: 810, y: 1580, s: 0.9 }, mata: { x: 540, y: 900, s: 1.2 } },
        svg: `<defs>${lin(u + 'lw', 0, 0, 1, 0, [[0, '#6f757c'], [0.5, '#b4b9bf'], [1, '#6f757c']])}${lin(u + 'ld', 0, 0, 1, 0, [[0, '#8c9298'], [0.5, '#c7ccd2'], [1, '#8c9298']])}</defs>` +
          rect(0, 0, W, H, `url(#${u}lw)`) + rect(0, 0, W, 130, '#e9edf0', `opacity="${f}"`) + rect(0, 120, W, 200, '#fff', `opacity="${0.18 * f}"`) +
          rect(280, 360, 520, 1060, '#4b5056') + rect(296, 376, 244, 1030, `url(#${u}ld)`) + rect(540, 376, 244, 1030, `url(#${u}ld)`) + rect(536, 376, 8, 1030, '#2b2f33') +
          rect(380, 230, 320, 90, '#0a0a0c', 'rx="8"') + `<text x="540" y="298" text-anchor="middle" font-family="monospace" font-size="70" font-weight="700" fill="#ff5a3a" opacity="${f}">${lvl}</text>` +
          rect(880, 640, 130, 360, '#2b2f33', 'rx="14"') + [0, 1, 2, 3, 4].map(i => circ(945, 690 + i * 62, 18, i === 2 ? '#ffd27a' : '#9aa0a6')).join('') +
          rect(0, 960, 280, 14, '#d4d8dd') + rect(800, 960, 280, 14, '#d4d8dd') +
          rect(0, 1420, W, 500, '#34383e') + [0, 1, 2, 3, 4, 5].map(i => `<line x1="0" y1="${1440 + i * i * 14}" x2="${W}" y2="${1440 + i * i * 14}" stroke="#000" stroke-opacity=".25" stroke-width="3"/>`).join(''),
      }
    },

    kantor: (u, t) => {
      const f = fluor(t, 2)
      return {
        anchor: { x: 250, y: 1640, s: 1 }, props: { bayangan: { x: 880, y: 1380, s: 0.9 }, mata: { x: 540, y: 880, s: 1.2 } },
        svg: `<defs>${lin(u + 'kw', 0, 0, 0, 1, [[0, '#cfd6dd'], [1, '#8f99a5']])}${lin(u + 'kc', 0, 0, 0, 1, [[0, '#06103a'], [1, '#2347a0']])}${lin(u + 'km', 0, 0, 0, 1, [[0, '#3a7bff'], [1, '#0b1f6a']])}${rad(u + 'kg', 0.5, 0.5, 0.5, [[0, '#7fb0ff', 0.45], [1, '#7fb0ff', 0]])}</defs>` +
          rect(0, 0, W, 1380, `url(#${u}kw)`) + [0, 1, 2].map(i => rect(60 + i * 340, 40, 280, 40, '#fff', `opacity="${0.95 * f}"`)).join('') +
          rect(40, 280, 380, 700, '#3a4048') + rect(56, 296, 348, 668, `url(#${u}kc)`) + skyline(960, '#0a1236', '#ffe29a', 3).replace(/x="(-?\d+)"/g, (m, a) => `x="${Math.max(0, Math.min(330, +a * 0.4 + 56))}"`) +
          rect(228, 296, 8, 668, '#3a4048') + rect(56, 620, 348, 8, '#3a4048') +
          circ(640, 960, 330, `url(#${u}kg)`) + rect(520, 860, 300, 210, `url(#${u}km)`, 'rx="10" stroke="#1b1f26" stroke-width="12"') + rect(652, 1070, 36, 110, '#1b1f26') + rect(590, 1176, 160, 18, '#1b1f26') +
          rect(430, 1190, 640, 36, '#6b5a4a') + rect(450, 1226, 22, 190, '#4a3d31') + rect(1030, 1226, 22, 190, '#4a3d31') +
          rect(880, 1100, 80, 100, '#e8e8ee', 'rx="6"') + rect(0, 1380, W, 540, '#2f343c') + rect(0, 1372, W, 14, '#1c2026'),
      }
    },

    'kamar-mandi': (u, t) => {
      const f = Math.sin(t * 13) > 0.93 ? 0.4 : 1
      let tiles = ''
      for (let i = 1; i < 9; i++) tiles += `<line x1="0" y1="${i * 140}" x2="${W}" y2="${i * 140}" stroke="#7fb3ad" stroke-width="3"/>`
      for (let i = 1; i < 8; i++) tiles += `<line x1="${i * 140}" y1="0" x2="${i * 140}" y2="1340" stroke="#7fb3ad" stroke-width="3"/>`
      return {
        anchor: { x: 230, y: 1650, s: 1 }, props: { bayangan: { x: 880, y: 1560, s: 0.9 }, mata: { x: 540, y: 700, s: 1.2 } },
        svg: `<defs>${lin(u + 'tw', 0, 0, 0, 1, [[0, '#cdeee9'], [1, '#8ec7c0']])}${lin(u + 'tm', 0, 0, 1, 1, [[0, '#e8f6f7'], [1, '#9cc2c8']])}${rad(u + 'tl', 0.5, 0.5, 0.5, [[0, '#fff6d0', 0.6], [1, '#fff6d0', 0]])}</defs>` +
          rect(0, 0, W, 1340, `url(#${u}tw)`) + tiles + rect(0, 1340, W, 580, '#4b7f7c') +
          [0, 1, 2, 3, 4, 5, 6, 7].map(i => rect(i * 140, 1340 + (i % 2) * 0, 140, 580, i % 2 ? '#5f9591' : '#4b7f7c', 'opacity=".55"')).join('') +
          rect(340, 330, 380, 580, '#5a4636', 'rx="10"') + rect(360, 350, 340, 540, `url(#${u}tm)`, 'rx="4"') + poly('380,880 520,360 600,360 440,880', '#fff', 'opacity=".35"') +
          rect(320, 1000, 420, 50, '#e8edef', 'rx="8"') + rect(380, 1050, 300, 280, '#dfe5e8') + `<ellipse cx="530" cy="1010" rx="120" ry="18" fill="#bfc8cc"/>` + rect(522, 940, 16, 70, '#9aa4a8') + rect(500, 936, 60, 12, '#9aa4a8', 'rx="6"') +
          circ(530, 250, 280, `url(#${u}tl)`) + rect(440, 230, 180, 40, '#fff', `rx="20" opacity="${f}"`) +
          rect(790, 80, 330, 1280, '#7db8d8', 'opacity=".42"') + [0, 1, 2, 3, 4].map(i => `<line x1="${830 + i * 70}" y1="90" x2="${830 + i * 70}" y2="1340" stroke="#fff" stroke-opacity=".35" stroke-width="6"/>`).join('') +
          [0, 1, 2, 3, 4, 5].map(i => circ(810 + i * 60, 92, 10, '#c9d3d8')).join('') + `<line x1="780" y1="92" x2="1080" y2="92" stroke="#c9d3d8" stroke-width="8"/>`,
      }
    },

    kelas: (u, t) => {
      let desks = ''
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const x = 90 + c * 330 + r * 20, y = 1180 + r * 190, sc = 1 + r * 0.14
        desks += rect(x, y, 230 * sc, 22 * sc, '#b98a56') + rect(x + 14, y + 22 * sc, 12, 120 * sc, '#5d4630') + rect(x + 204 * sc, y + 22 * sc, 12, 120 * sc, '#5d4630')
      }
      return {
        anchor: { x: 260, y: 1700, s: 1 }, props: { bayangan: { x: 880, y: 1330, s: 0.9 }, mata: { x: 540, y: 600, s: 1.2 } },
        svg: `<defs>${lin(u + 'cw', 0, 0, 0, 1, [[0, '#ecdca8'], [1, '#bda56a']])}${lin(u + 'cb', 0, 0, 1, 1, [[0, '#35654f'], [1, '#24453a']])}${rad(u + 'cl', 0.5, 0.5, 0.5, [[0, '#fff4c0', 0.4], [1, '#fff4c0', 0]])}</defs>` +
          rect(0, 0, W, 1280, `url(#${u}cw)`) + rect(90, 300, 900, 520, '#7a5836', 'rx="8"') + rect(112, 322, 856, 476, `url(#${u}cb)`) +
          `<g stroke="#e8f0e8" stroke-opacity=".7" stroke-width="6" stroke-linecap="round" fill="none"><path d="M170,420 q60,-30 120,0 t120,0"/><path d="M170,500 h300"/><path d="M170,560 h220"/><path d="M560,430 l60,60 l60,-60"/></g>` +
          rect(112, 800, 856, 14, '#e8e0d0') + circ(540, 140, 70, '#f6f0e2', 'stroke="#3b2a22" stroke-width="8"') + `<line x1="540" y1="140" x2="540" y2="94" stroke="#3b2a22" stroke-width="6" stroke-linecap="round"/><line x1="540" y1="140" x2="${r2(540 + Math.sin(t * 0.4) * 36)}" y2="${r2(140 - Math.cos(t * 0.4) * 36)}" stroke="#3b2a22" stroke-width="5" stroke-linecap="round"/>` +
          circ(540, 700, 480, `url(#${u}cl)`) + rect(0, 1280, W, 640, '#8a6a46') + [0, 1, 2, 3, 4, 5].map(i => `<line x1="0" y1="${1290 + i * i * 14}" x2="${W}" y2="${1290 + i * i * 14}" stroke="#000" stroke-opacity=".18" stroke-width="3"/>`).join('') + desks,
      }
    },

    'rumah-sakit': (u, t) => {
      const f = fluor(t, 5)
      const top = x => x * (640 / 340), bot = x => 1920 - x * (760 / 340)
      const doorL = (x1, x2) => poly(`${x1},${r2(top(x1) + 0.2 * (bot(x1) - top(x1)))} ${x2},${r2(top(x2) + 0.2 * (bot(x2) - top(x2)))} ${x2},${r2(top(x2) + 0.95 * (bot(x2) - top(x2)))} ${x1},${r2(top(x1) + 0.95 * (bot(x1) - top(x1)))}`, '#6aa6b8', 'stroke="#2f5a68" stroke-width="5"')
      const mirror = d => d.replace(/points="([^"]+)"/, (m, pts) => `points="${pts.split(' ').map(p => { const [a, b] = p.split(','); return `${W - a},${b}` }).join(' ')}"`)
      let lights = ''
      for (let i = 0; i < 5; i++) { const k = i / 5, y = 40 + k * k * 600, w = 560 - k * 360; lights += rect(540 - w / 2, y, w, 28 - i * 3, '#fff', `opacity="${0.9 * f}"`) }
      return {
        anchor: { x: 540, y: 1720, s: 1 }, props: { bayangan: { x: 540, y: 1180, s: 0.45 }, mata: { x: 540, y: 800, s: 1 } },
        svg: `<defs>${lin(u + 'rf', 0, 0, 0, 1, [[0, '#7fa59b'], [1, '#c4ddd5']])}${rad(u + 'rg', 0.5, 0.5, 0.5, [[0, '#d6fff0', 0.5], [1, '#d6fff0', 0]])}</defs>` +
          rect(0, 0, W, H, '#dff0ea') + poly(`0,0 ${W},0 740,640 340,640`, '#eef5f2') + poly(`0,0 340,640 340,1160 0,1920`, '#c3dcd3') + poly(`${W},0 740,640 740,1160 ${W},1920`, '#b6d2c8') +
          poly(`0,1920 340,1160 740,1160 ${W},1920`, `url(#${u}rf)`) + rect(340, 640, 400, 520, '#e8f4ef') + rect(470, 760, 140, 400, '#6aa6b8', 'stroke="#2f5a68" stroke-width="5"') +
          rect(480, 690, 120, 44, '#1c8f5a', 'rx="6"') + rect(490, 700, 100, 24, '#8dffc0', `opacity="${0.8 * f}" rx="4"`) +
          doorL(40, 120) + doorL(170, 250) + mirror(doorL(40, 120)) + mirror(doorL(170, 250)) +
          poly(`0,${r2(bot(0) - 110)} 340,${r2(bot(340) - 70)} 340,1160 0,1920`, '#7fa59b', 'opacity=".55"') + lights + circ(540, 900, 460, `url(#${u}rg)`),
      }
    },

    atap: (u, t) => ({
      anchor: { x: 300, y: 1700, s: 1 }, props: { bayangan: { x: 860, y: 1620, s: 0.9 }, mata: { x: 700, y: 900, s: 1.2 } },
      svg: `<defs>${lin(u + 'as', 0, 0, 0, 1, [[0, '#231a55'], [0.5, '#e0566a'], [0.78, '#ffa062'], [1, '#ffd08a']])}${rad(u + 'sn', 0.5, 0.5, 0.5, [[0, '#fff0c0', 0.9], [1, '#ffb070', 0]])}</defs>` +
        rect(0, 0, W, H, `url(#${u}as)`) + circ(740, 980, 300, `url(#${u}sn)`) + circ(740, 980, 110, '#ffe3a8') +
        skyline(1330, '#3a1c46', '#ffd08a', 4) + skyline(1330, '#2a1236', '#ffd08a', 7).replace(/x="(-?\d+)"/g, (m, a) => `x="${+a + 70}"`) +
        rect(0, 1330, W, 590, '#4a4452') + rect(0, 1320, W, 36, '#6b6676') + [0, 1, 2, 3, 4, 5, 6].map(i => rect(i * 170, 1356, 4, 560, '#000', 'opacity=".25"')).join('') +
        rect(70, 760, 230, 320, '#4a3a38', 'rx="12"') + poly('50,770 185,690 320,770', '#3a2c2a') + [0, 1, 2].map(i => rect(70, 840 + i * 90, 230, 8, '#2a1f1d')).join('') + rect(100, 1080, 14, 260, '#2a1f1d') + rect(256, 1080, 14, 260, '#2a1f1d') +
        rect(900, 520, 8, 800, '#16121c') + rect(850, 640, 110, 6, '#16121c') + rect(870, 740, 70, 6, '#16121c') +
        `<line x1="0" y1="1190" x2="${W}" y2="1190" stroke="#1c1822" stroke-width="12"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map(i => rect(i * 150 + 20, 1190, 10, 150, '#1c1822')).join(''),
    }),

    minimarket: (u, t) => {
      const f = fluor(t, 9)
      const cols = ['#e84a4a', '#f2c230', '#3aa0e8', '#4ac27a', '#e8e8ee', '#d86ac8', '#ff9a3a']
      const shelf = (x, w) => {
        let s = rect(x, 520, w, 840, '#cfd4da', 'stroke="#8a9096" stroke-width="6"')
        for (let r = 0; r < 4; r++) {
          s += rect(x, 640 + r * 190, w, 10, '#8a9096')
          for (let i = 0; i < Math.floor(w / 48); i++) s += rect(x + 12 + i * 48, 560 + r * 190 + ((i * 7 + r) % 3) * 12, 34, 70 - ((i * 7 + r) % 3) * 12, cols[(i * 3 + r * 2) % cols.length])
        }
        return s
      }
      return {
        anchor: { x: 540, y: 1700, s: 1 }, props: { bayangan: { x: 880, y: 1420, s: 0.8 }, mata: { x: 540, y: 800, s: 1.2 } },
        svg: `<defs>${lin(u + 'mw', 0, 0, 0, 1, [[0, '#f2f6f8'], [1, '#c6d0d8']])}${lin(u + 'mf', 0, 0, 0, 1, [[0, '#d6d9de'], [1, '#9ea3ab']])}${lin(u + 'mc', 0, 0, 0, 1, [[0, '#8fd8ff'], [1, '#2a6ab0']])}</defs>` +
          rect(0, 0, W, 1380, `url(#${u}mw)`) + rect(0, 0, W, 120, '#e6e9ec') + [0, 1, 2].map(i => rect(80 + i * 330, 30, 260, 36, '#fff', `opacity="${f}"`)).join('') +
          rect(330, 380, 420, 760, '#2a3038') + rect(346, 396, 192, 728, `url(#${u}mc)`, 'opacity=".85"') + rect(542, 396, 192, 728, `url(#${u}mc)`, 'opacity=".85"') +
          rect(300, 230, 480, 90, '#a81e1e', 'rx="14"') + `<text x="540" y="294" text-anchor="middle" font-family="Poppins, Arial, sans-serif" font-weight="800" font-size="52" fill="#ffe9e0" opacity="${f}">BUKA 24 JAM</text>` +
          shelf(0, 280) + shelf(800, 280) + rect(0, 1380, W, 540, `url(#${u}mf)`) +
          [0, 1, 2, 3, 4].map(i => `<line x1="0" y1="${1400 + i * i * 22}" x2="${W}" y2="${1400 + i * i * 22}" stroke="#000" stroke-opacity=".12" stroke-width="3"/>`).join('') +
          [0, 1, 2, 3, 4, 5].map(i => `<line x1="${i * 216}" y1="1380" x2="${540 + (i * 216 - 540) * 2.6}" y2="${H}" stroke="#000" stroke-opacity=".1" stroke-width="3"/>`).join(''),
      }
    },
  },

  objek: {
    // hujan deras yang turun terus (animasi dari t)
    hujan: ({ t = 0 }) => {
      let s = '<g stroke="#bcd4ff" stroke-width="3" stroke-linecap="round" opacity=".38">'
      for (let i = 0; i < 70; i++) {
        const x = (i * 97) % 1200 - 60 + ((t * 120) % 60) * 0, y = ((i * 211 + t * 1500) % 2100) - 100
        s += `<line x1="${r2(x)}" y1="${r2(y)}" x2="${r2(x - 34)}" y2="${r2(y + 96)}"/>`
      }
      return s + '</g>'
    },
  },
}
