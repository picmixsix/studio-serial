import { W, H, lin, rad, r2 } from './util.js'
import { custom } from './custom/index.js'

const wall = (u, y0, y1, c1 = '#7b5646', c3 = '#4a3027') =>
  `<defs>${lin(u + 'w', 0, 0, 0, 1, [[0, c1], [1, c3]])}<pattern id="${u}ws" width="90" height="10" patternUnits="userSpaceOnUse"><rect width="45" height="10" fill="#000" opacity=".08"/></pattern></defs>` +
  `<rect y="${y0}" width="${W}" height="${y1 - y0}" fill="url(#${u}w)"/><rect y="${y0}" width="${W}" height="${y1 - y0}" fill="url(#${u}ws)"/>`

const floor = (u, y0, c1 = '#4b3027', c2 = '#25150f') => {
  let l = ''
  for (let i = 1; i < 9; i++) l += `<line x1="0" y1="${y0 + i * i * 9}" x2="${W}" y2="${y0 + i * i * 9}" stroke="#000" stroke-opacity=".18" stroke-width="3"/>`
  return `<defs>${lin(u + 'f', 0, 0, 0, 1, [[0, c1], [1, c2]])}</defs><rect y="${y0}" width="${W}" height="${H - y0}" fill="url(#${u}f)"/>${l}` +
    `<rect y="${y0 - 16}" width="${W}" height="18" fill="#2b1a14"/>`
}

const clock = (cx, cy, r, t) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#f1ebe0" stroke="#3b2a22" stroke-width="8"/>` +
  [0, 90, 180, 270].map(a => `<line x1="${cx}" y1="${cy - r + 10}" x2="${cx}" y2="${cy - r + 22}" stroke="#3b2a22" stroke-width="5" transform="rotate(${a} ${cx} ${cy})"/>`).join('') +
  `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * 0.55}" stroke="#3b2a22" stroke-width="7" stroke-linecap="round" transform="rotate(${r2(330 + Math.sin(t) * 1)} ${cx} ${cy})"/>` +
  `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r * 0.78}" stroke="#3b2a22" stroke-width="5" stroke-linecap="round" transform="rotate(${r2(t * 6)} ${cx} ${cy})"/><circle cx="${cx}" cy="${cy}" r="6" fill="#3b2a22"/>`

const lamp = (u, x, y, h = 380, t = 0) => {
  const fl = 0.85 + Math.sin(t * 7) * 0.03
  return `<defs>${rad(u + 'lg' + x, 0.5, 0.5, 0.5, [[0, '#ffd88a', 0.55 * fl], [1, '#ffd88a', 0]])}</defs>` +
    `<circle cx="${x}" cy="${y - h + 40}" r="260" fill="url(#${u}lg${x})"/>` +
    `<rect x="${x - 6}" y="${y - h + 80}" width="12" height="${h - 80}" fill="#2b2220"/><ellipse cx="${x}" cy="${y}" rx="52" ry="12" fill="#2b2220"/>` +
    `<path d="M${x - 62},${y - h + 90} L${x - 36},${y - h} L${x + 36},${y - h} L${x + 62},${y - h + 90} Z" fill="#e7c27a"/>`
}

const person = (x, y, s, { hood = false, shirt = '#5b7fa6', hair = '#2b1d17', skin = '#e8b895' } = {}) =>
  `<g transform="translate(${x},${y}) scale(${s})">` +
  `<path d="M-60,0 Q-60,-70 0,-76 Q60,-70 60,0 Z" fill="${hood ? '#e8632b' : shirt}"/>` +
  (hood ? `<circle cx="0" cy="-118" r="62" fill="#e8632b" stroke="#c24d1d" stroke-width="5"/>` : '') +
  `<circle cx="0" cy="-116" r="${hood ? 46 : 52}" fill="${skin}"/>` +
  (hood ? '' : `<path d="M-52,-118 Q-48,-172 0,-172 Q48,-172 52,-118 Q30,-146 0,-146 Q-30,-146 -52,-118Z" fill="${hair}"/>`) +
  `<circle cx="-17" cy="-114" r="5" fill="#2b1d17"/><circle cx="17" cy="-114" r="5" fill="#2b1d17"/><path d="M-14,-92 Q0,-80 14,-92" fill="none" stroke="#2b1d17" stroke-width="4" stroke-linecap="round"/></g>`

const frame = (x, y, w, h, scale = 1) => {
  const pw = w - 40 * scale, ph = h - 40 * scale
  const k = w / 260
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="#4a2e1c" stroke="#2b1a10" stroke-width="${6 * k}"/>` +
    `<rect x="${x + 16 * k}" y="${y + 16 * k}" width="${w - 32 * k}" height="${h - 32 * k}" fill="#cfc3ad"/>` +
    person(x + w * 0.2, y + h * 0.9, 0.36 * k, { shirt: '#6f6f7a' }) + person(x + w * 0.4, y + h * 0.9, 0.36 * k, { shirt: '#4f6f8f', hair: '#1c1410' }) +
    person(x + w * 0.6, y + h * 0.9, 0.32 * k, { shirt: '#8a6f5a', hair: '#3a2a1d' }) + person(x + w * 0.8, y + h * 0.9, 0.36 * k, { hood: true })
}

const BG = {}

BG['ruang-tamu'] = (u, t) => ({
  anchor: { x: 270, y: 1560, s: 1 }, props: { bayangan: { x: 880, y: 1260, s: 1 }, mata: { x: 540, y: 1000, s: 1.2 } },
  svg: wall(u, 0, 1290) + floor(u, 1290) + clock(180, 640, 58, t) + frame(640, 560, 300, 230) +
    `<defs>${rad(u + 'rg', 0.5, 0.5, 0.5, [[0, '#8a2f2f'], [1, '#5c1f22']])}</defs><ellipse cx="560" cy="1500" rx="400" ry="84" fill="url(#${u}rg)"/>` +
    `<g><rect x="520" y="1130" width="380" height="190" rx="22" fill="#a5554a"/><rect x="500" y="1220" width="420" height="120" rx="20" fill="#b9665a"/><rect x="486" y="1180" width="56" height="170" rx="22" fill="#94473e"/><rect x="880" y="1180" width="56" height="170" rx="22" fill="#94473e"/></g>` +
    `<g><rect x="380" y="1390" width="330" height="24" rx="5" fill="#9b7452"/><rect x="396" y="1414" width="16" height="110" fill="#6d4f35"/><rect x="678" y="1414" width="16" height="110" fill="#6d4f35"/>` +
    `<ellipse cx="545" cy="1388" rx="48" ry="9" fill="#f1ebe0"/><path d="M510,1330 h70 l-8,50 h-54 z" fill="#f7f2e8"/></g>` + lamp(u, 990, 1330, 420, t)
})

BG['pintu'] = (u, t) => ({
  anchor: { x: 560, y: 1560, s: 1 }, props: { bayangan: { x: 860, y: 1300, s: 1 }, mata: { x: 300, y: 1000, s: 1.2 } },
  svg: wall(u, 0, 1290, '#7a5848', '#4a3027') + floor(u, 1290) +
    `<defs>${lin(u + 'dr', 0, 0, 1, 0, [[0, '#16224a'], [1, '#233470']])}</defs><rect x="-10" y="470" width="330" height="830" fill="#2b1a14"/><rect x="0" y="490" width="300" height="810" fill="url(#${u}dr)"/>` +
    `<rect x="26" y="540" width="190" height="300" rx="6" fill="#000" opacity=".14"/><rect x="26" y="900" width="190" height="320" rx="6" fill="#000" opacity=".14"/><circle cx="236" cy="900" r="19" fill="#d4b06a"/>` +
    `<polygon points="300,1300 560,1300 760,1920 120,1920" fill="#e8c27a" opacity=".08"/>` +
    `<rect x="720" y="760" width="14" height="110" fill="#2b2220"/><rect x="690" y="760" width="74" height="14" rx="7" fill="#2b2220"/>` +
    `<rect x="780" y="620" width="200" height="270" rx="6" fill="#3a2a22"/><rect x="796" y="636" width="168" height="238" fill="#c9bda5"/>` + person(880, 850, 0.9, { shirt: '#6f6f7a' }) + lamp(u, 990, 1300, 360, t)
})

BG['meja'] = (u, t) => {
  const steam = [0, 1, 2].map(i => {
    const x0 = 470 + i * 70, ph = t * 1.6 + i * 1.7
    return `<path d="M${x0},900 q${r2(Math.sin(ph) * 30)},-60 0,-120 q${r2(-Math.sin(ph + 1) * 30)},-60 0,-120" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="12" stroke-linecap="round"/>`
  }).join('')
  return {
    anchor: { x: 270, y: 1560, s: 1 }, props: { bayangan: { x: 150, y: 1100, s: 1 }, mata: { x: 540, y: 700, s: 1.2 } },
    svg: wall(u, 0, 1290, '#79503f', '#3d2820') + floor(u, 1290, '#3d261e', '#1a0f0b') +
      `<defs>${rad(u + 'sp', 0.5, 0.5, 0.6, [[0, '#ffe2a0', 0.28], [1, '#ffe2a0', 0]])}</defs><rect width="${W}" height="${H}" fill="url(#${u}sp)"/>` +
      `<ellipse cx="540" cy="1560" rx="520" ry="110" fill="#7a2f2f"/>` +
      `<rect x="70" y="1160" width="26" height="480" fill="#5e432c"/><rect x="984" y="1160" width="26" height="480" fill="#5e432c"/>` +
      `<rect x="-20" y="1120" width="${W + 40}" height="48" rx="8" fill="#9b7452"/><rect x="-20" y="1160" width="${W + 40}" height="20" fill="#6d4f35"/>` + steam +
      `<ellipse cx="540" cy="1112" rx="270" ry="50" fill="#000" opacity=".2"/><ellipse cx="540" cy="1100" rx="250" ry="46" fill="#f7f2e8"/><ellipse cx="540" cy="1096" rx="150" ry="26" fill="#ddd4c2"/>` +
      `<path d="M380,880 h320 l-30,200 q-130,34 -260,0 z" fill="#f7f2e8"/><ellipse cx="540" cy="880" rx="160" ry="26" fill="#d9d0be"/><ellipse cx="540" cy="884" rx="140" ry="20" fill="#6b3f26"/>` +
      `<path d="M700,920 q110,0 100,70 q-10,70 -120,64" fill="none" stroke="#f7f2e8" stroke-width="34" stroke-linecap="round"/>`
  }
}

BG['foto'] = (u, t) => ({
  anchor: { x: 270, y: 1560, s: 1 }, props: { bayangan: { x: 120, y: 1400, s: 1 }, mata: { x: 540, y: 1500, s: 1.2 } },
  svg: wall(u, 0, H, '#5a3b2f', '#2a1a15') +
    `<defs>${rad(u + 'sl', 0.5, 0.45, 0.55, [[0, '#ffe9b0', 0.5], [1, '#ffe9b0', 0]])}</defs><rect x="20" y="560" width="1040" height="800" fill="url(#${u}sl)"/>` +
    `<rect x="70" y="650" width="940" height="620" rx="12" fill="#4a2e1c" stroke="#2b1a10" stroke-width="14"/><rect x="118" y="698" width="844" height="524" fill="#d8ccb4"/>` +
    person(280, 1200, 1.25, { shirt: '#6f6f7a' }) + person(480, 1200, 1.28, { shirt: '#4f6f8f', hair: '#1c1410' }) + person(670, 1200, 1.1, { shirt: '#8a6f5a', hair: '#3a2a1d' }) + person(850, 1200, 1.3, { hood: true }) +
    `<rect x="118" y="698" width="844" height="524" fill="#000" opacity=".1"/>` +
    `<rect y="1330" width="${W}" height="590" fill="#1c110d"/><rect y="1330" width="${W}" height="14" fill="#2b1a14"/>`
})

BG['tangga'] = (u, t) => {
  let steps = ''
  const n = 11, x0 = 460, y0 = 1380, dx = 56, dy = 46
  for (let i = 0; i < n; i++) {
    const x = x0 + i * dx, y = y0 - i * dy
    steps += `<rect x="${x}" y="${y}" width="${W - x + 40}" height="${dy + 4}" fill="${i % 2 ? '#6d4a37' : '#7a5642'}"/><rect x="${x}" y="${y}" width="${W - x + 40}" height="8" fill="#a07a5e"/>`
  }
  let rail = `<line x1="${x0}" y1="${y0 - 120}" x2="${x0 + n * dx}" y2="${y0 - n * dy - 120}" stroke="#2b1a10" stroke-width="14" stroke-linecap="round"/>`
  for (let i = 0; i < n; i += 2) rail += `<line x1="${x0 + i * dx + 20}" y1="${y0 - i * dy}" x2="${x0 + i * dx + 20}" y2="${y0 - i * dy - 118}" stroke="#2b1a10" stroke-width="8"/>`
  return {
    anchor: { x: 250, y: 1560, s: 1 }, props: { bayangan: { x: 960, y: 930, s: 1 }, mata: { x: 900, y: 760, s: 1 } },
    svg: wall(u, 0, 1290, '#6e4b3d', '#3d2820') + floor(u, 1290) +
      `<defs>${lin(u + 'up', 0, 0, 0, 1, [[0, '#000', 0.95], [1, '#000', 0.35]])}</defs><polygon points="520,1340 ${W},880 ${W},540 700,540" fill="#0b0605"/>` + steps +
      `<rect x="640" y="440" width="${W - 640}" height="500" fill="url(#${u}up)"/>` + rail +
      `<g><rect x="30" y="1170" width="360" height="170" rx="22" fill="#a5554a"/><rect x="10" y="1250" width="400" height="110" rx="20" fill="#b9665a"/></g>` + lamp(u, 420, 1330, 400, t) + clock(130, 700, 52, t)
  }
}

BG['lorong'] = (u, t) => {
  const vx = 540, vy = 900
  const door = (side, k) => {
    const x1 = side < 0 ? 0 : W, x2 = side < 0 ? 330 : W - 330
    const xa = x1 + (x2 - x1) * (0.12 + 0.3 * k), xb = x1 + (x2 - x1) * (0.12 + 0.3 * k + 0.26)
    const ya = (v) => vy + (v - vy) * 0.9
    return `<polygon points="${xa},${vy - 190 + (vy - 190 - vy) * 0} ${xb},${vy - 120} ${xb},${vy + 130} ${xa},${vy + 215}" fill="#2a1c16" stroke="#120a07" stroke-width="5" opacity="${0.55 + 0.1 * k}"/>`
  }
  return {
    anchor: { x: 540, y: 1700, s: 0.85 }, props: { bayangan: { x: 540, y: 1010, s: 0.45 }, mata: { x: 540, y: 880, s: 1 } },
    svg: `<defs>${lin(u + 'lw', 0, 0, 1, 0, [[0, '#4a3027'], [1, '#6e4b3d']])}${rad(u + 'ld', 0.5, 0.47, 0.35, [[0, '#ffdca0', 0.8], [1, '#000', 0]])}</defs>` +
      `<rect width="${W}" height="${H}" fill="#2a1a15"/>` +
      `<polygon points="0,0 ${W},0 ${vx + 120},${vy - 120} ${vx - 120},${vy - 120}" fill="#1f1310"/>` +
      `<polygon points="0,0 ${vx - 120},${vy - 120} ${vx - 120},${vy + 160} 0,${H}" fill="url(#${u}lw)"/>` +
      `<polygon points="${W},0 ${vx + 120},${vy - 120} ${vx + 120},${vy + 160} ${W},${H}" fill="url(#${u}lw)" opacity=".8"/>` +
      `<polygon points="0,${H} ${vx - 120},${vy + 160} ${vx + 120},${vy + 160} ${W},${H}" fill="#3a251d"/>` +
      `<rect x="${vx - 120}" y="${vy - 120}" width="240" height="280" fill="#0a0605"/>` +
      [0, 1].map(k => door(-1, k) + door(1, k)).join('') +
      `<circle cx="${vx}" cy="${vy - 40}" r="520" fill="url(#${u}ld)" opacity=".35"/>` +
      `<rect x="${vx - 60}" y="40" width="120" height="14" fill="#e8c27a"/>`
  }
}

BG['kamar'] = (u, t) => ({
  anchor: { x: 330, y: 1580, s: 1 }, props: { bayangan: { x: 180, y: 1300, s: 1 }, mata: { x: 540, y: 1000, s: 1.2 } },
  svg: wall(u, 0, 1300, '#4b4a6a', '#2b2a40') + floor(u, 1300, '#3a2a26', '#1a1210') +
    `<defs>${lin(u + 'sk', 0, 0, 0, 1, [[0, '#0f1730'], [1, '#2b3a68']])}${rad(u + 'mn', 0.5, 0.5, 0.5, [[0, '#fff8d8', 0.7], [1, '#fff8d8', 0]])}</defs>` +
    `<rect x="90" y="470" width="330" height="430" fill="url(#${u}sk)" stroke="#2b1a10" stroke-width="16"/><circle cx="310" cy="600" r="110" fill="url(#${u}mn)"/><circle cx="310" cy="600" r="42" fill="#fff8d8"/>` +
    `<line x1="255" y1="470" x2="255" y2="900" stroke="#2b1a10" stroke-width="10"/><line x1="90" y1="685" x2="420" y2="685" stroke="#2b1a10" stroke-width="10"/>` +
    `<rect x="590" y="1100" width="520" height="260" rx="18" fill="#6a3f4a"/><rect x="590" y="1040" width="520" height="120" rx="40" fill="#d8d2c8"/><rect x="570" y="980" width="40" height="400" rx="12" fill="#3b2a22"/>` +
    `<rect x="470" y="1210" width="110" height="150" fill="#5e432c"/><rect x="498" y="1130" width="54" height="80" fill="#e7c27a"/>`
})

BG['dapur'] = (u, t) => ({
  anchor: { x: 330, y: 1580, s: 1 }, props: { bayangan: { x: 900, y: 1300, s: 1 }, mata: { x: 540, y: 1000, s: 1.2 } },
  svg: wall(u, 0, 1300, '#6b6a56', '#3b3a30') + floor(u, 1300, '#3e3a34', '#1c1a17') +
    `<rect x="40" y="520" width="260" height="780" rx="14" fill="#d8d6cf"/><line x1="40" y1="900" x2="300" y2="900" stroke="#9a978f" stroke-width="6"/><rect x="262" y="640" width="12" height="120" rx="6" fill="#8a877f"/><rect x="262" y="940" width="12" height="160" rx="6" fill="#8a877f"/>` +
    `<rect x="340" y="1090" width="740" height="220" fill="#6d4f35"/><rect x="340" y="1070" width="740" height="30" fill="#c9c2b4"/>` +
    `<rect x="380" y="560" width="300" height="230" rx="10" fill="#7d5b3e"/><rect x="710" y="560" width="300" height="230" rx="10" fill="#7d5b3e"/><circle cx="660" cy="680" r="9" fill="#d4b06a"/><circle cx="730" cy="680" r="9" fill="#d4b06a"/>` +
    `<line x1="860" y1="0" x2="860" y2="300" stroke="#2b2220" stroke-width="6"/><path d="M780,300 L940,300 L910,230 L810,230 Z" fill="#e7c27a"/><circle cx="860" cy="330" r="200" fill="#ffd88a" opacity=".12"/>`
})

BG['luar'] = (u, t, hd) => {
  let stars = ''
  for (let i = 0; i < 40; i++) stars += `<circle cx="${(i * 197) % W}" cy="${(i * 331) % 700 + 40}" r="${i % 5 === 0 ? 3 : 2}" fill="#fff" opacity="${0.4 + ((i * 13) % 6) / 10}"/>`
  const nomor = hd && hd.nomor ? `<rect x="420" y="1140" width="90" height="60" rx="8" fill="#e7c27a"/><text x="465" y="1184" text-anchor="middle" font-family="Poppins, sans-serif" font-weight="800" font-size="40" fill="#2b1a10">${String(hd.nomor).replace(/[<&>]/g, '')}</text>` : ''
  return {
    anchor: { x: 240, y: 1640, s: 0.95 }, props: { bayangan: { x: 720, y: 1660, s: 0.62 }, mata: { x: 540, y: 1400, s: 0.8 } },
    svg: `<defs>${lin(u + 'ns', 0, 0, 0, 1, [[0, '#080d20'], [1, '#2b3a63']])}${rad(u + 'mo', 0.5, 0.5, 0.5, [[0, '#fff8d8', 0.6], [1, '#fff8d8', 0]])}</defs>` +
      `<rect width="${W}" height="${H}" fill="url(#${u}ns)"/>${stars}<circle cx="840" cy="420" r="150" fill="url(#${u}mo)"/><circle cx="840" cy="420" r="62" fill="#fff8d8"/>` +
      `<polygon points="200,1230 540,860 880,1230" fill="#1b1424"/><rect x="230" y="1230" width="620" height="420" fill="#2a1d2c"/>` +
      `<rect x="300" y="1300" width="110" height="120" fill="#e7c27a"/><line x1="355" y1="1300" x2="355" y2="1420" stroke="#2a1d2c" stroke-width="8"/><line x1="300" y1="1360" x2="410" y2="1360" stroke="#2a1d2c" stroke-width="8"/>` +
      `<rect x="640" y="1300" width="110" height="120" fill="#15101a"/><rect x="420" y="1330" width="150" height="320" fill="#13202f"/><circle cx="552" cy="1500" r="9" fill="#d4b06a"/>` + nomor +
      `<rect y="1650" width="${W}" height="270" fill="#14121b"/><path d="M0,1650 H${W}" stroke="#2b2840" stroke-width="10"/>` +
      `<g fill="#0b0912"><rect x="960" y="1250" width="26" height="410"/><circle cx="975" cy="1210" r="110"/><circle cx="920" cy="1290" r="80"/></g>`
  }
}

BG['gelap'] = (u, t) => ({
  anchor: { x: 540, y: 1560, s: 1 }, props: { bayangan: { x: 540, y: 1500, s: 1.1 }, mata: { x: 540, y: 1000, s: 1.4 } },
  svg: `<defs>${rad(u + 'gl', 0.5, 0.55, 0.7, [[0, '#2a2330'], [1, '#050407']])}</defs><rect width="${W}" height="${H}" fill="url(#${u}gl)"/>`
})

BG['loteng'] = (u, t) => {
  let beams = ''
  for (let i = 0; i < 6; i++) beams += `<line x1="${i * 216}" y1="0" x2="${540 + (i - 2.5) * 80}" y2="900" stroke="#1d130d" stroke-width="22"/>`
  let dust = ''
  for (let i = 0; i < 18; i++) dust += `<circle cx="${(300 + (i * 97) % 480 + Math.sin(t * 0.6 + i) * 14).toFixed(1)}" cy="${(700 + (i * 151) % 600 - (t * 14 + i * 40) % 80).toFixed(1)}" r="${i % 3 + 2}" fill="#fff" opacity=".35"/>`
  return {
    anchor: { x: 760, y: 1600, s: 1 }, props: { bayangan: { x: 240, y: 1300, s: 1 }, mata: { x: 300, y: 900, s: 1.2 } },
    svg: `<defs>${lin(u + 'lw', 0, 0, 0, 1, [[0, '#2a1d15'], [1, '#4a3426']])}</defs><rect width="${W}" height="${H}" fill="url(#${u}lw)"/>` + beams +
      `<circle cx="300" cy="620" r="130" fill="#0c1020" stroke="#1d130d" stroke-width="18"/><polygon points="230,640 370,640 700,1500 120,1500" fill="#cfe0ff" opacity=".1"/>` +
      `<rect y="1330" width="${W}" height="590" fill="#2b1e16"/><rect y="1330" width="${W}" height="14" fill="#16100b"/>` +
      `<rect x="640" y="1190" width="320" height="170" rx="10" fill="#6d4f35" stroke="#3a281b" stroke-width="8"/><rect x="640" y="1190" width="320" height="40" fill="#7d5b3e"/><rect x="780" y="1250" width="40" height="40" fill="#c9a874"/>` +
      `<rect x="80" y="1210" width="150" height="130" fill="#8a6644"/><rect x="120" y="1090" width="130" height="120" fill="#9b7452"/>` + dust
  }
}

BG['hutan'] = (u, t) => {
  let far = '', near = ''
  for (let i = 0; i < 9; i++) far += `<rect x="${i * 130 - 20}" y="500" width="${28 + i % 3 * 8}" height="900" fill="#0f1a24" opacity=".7"/>`
  for (let i = 0; i < 6; i++) near += `<rect x="${i * 230 - 60}" y="260" width="${70 + i % 2 * 30}" height="1200" fill="#070d12"/>`
  return {
    anchor: { x: 270, y: 1650, s: 1 }, props: { bayangan: { x: 760, y: 1480, s: 0.8 }, mata: { x: 760, y: 1000, s: 1.2 } },
    svg: `<defs>${lin(u + 'hs', 0, 0, 0, 1, [[0, '#070d1c'], [1, '#233654']])}${rad(u + 'hm', 0.5, 0.5, 0.5, [[0, '#fff8d8', 0.55], [1, '#fff8d8', 0]])}${lin(u + 'hg', 0, 0, 0, 1, [[0, '#1b2a24'], [1, '#0a100e']])}</defs>` +
      `<rect width="${W}" height="${H}" fill="url(#${u}hs)"/><circle cx="780" cy="380" r="190" fill="url(#${u}hm)"/><circle cx="780" cy="380" r="64" fill="#fff8d8"/>` + far +
      `<rect y="1400" width="${W}" height="520" fill="url(#${u}hg)"/><path d="M360,1920 Q520,1600 700,1400 L760,1400 Q640,1620 760,1920Z" fill="#3a3a33" opacity=".55"/>` + near +
      `<ellipse cx="${(540 + Math.sin(t * 0.3) * 60).toFixed(1)}" cy="1480" rx="620" ry="90" fill="#cfd8e2" opacity=".1"/>`
  }
}

BG['jalan'] = (u, t) => {
  let b = ''
  const hs = [760, 980, 640, 1100, 860]
  hs.forEach((h, i) => {
    const x = i * 230 - 40
    b += `<rect x="${x}" y="${1300 - h}" width="220" height="${h}" fill="#17141f"/>`
    for (let k = 0; k < 7; k++) for (let j = 0; j < 3; j++) if ((i * 7 + k * 3 + j) % 4 === 0) b += `<rect x="${x + 28 + j * 62}" y="${1300 - h + 40 + k * 110}" width="40" height="56" fill="#e7c27a" opacity=".85"/>`
  })
  const fl = 0.85 + Math.sin(t * 9) * 0.04
  return {
    anchor: { x: 270, y: 1660, s: 1 }, props: { bayangan: { x: 800, y: 1560, s: 0.8 }, mata: { x: 780, y: 1000, s: 1.2 } },
    svg: `<defs>${lin(u + 'js', 0, 0, 0, 1, [[0, '#0b1020'], [1, '#2a3050']])}${rad(u + 'jl', 0.5, 0.5, 0.5, [[0, '#ffd88a', 0.55 * fl], [1, '#ffd88a', 0]])}</defs>` +
      `<rect width="${W}" height="${H}" fill="url(#${u}js)"/>` + b +
      `<rect y="1300" width="${W}" height="140" fill="#2b2a33"/><rect y="1440" width="${W}" height="480" fill="#17161c"/>` +
      [0, 1, 2, 3].map(i => `<rect x="${60 + i * 270}" y="1660" width="150" height="18" fill="#c9c2a0" opacity=".6"/>`).join('') +
      `<rect x="900" y="700" width="16" height="640" fill="#0b0b10"/><rect x="850" y="690" width="110" height="18" rx="9" fill="#0b0b10"/><circle cx="870" cy="730" r="300" fill="url(#${u}jl)"/><circle cx="870" cy="722" r="20" fill="#fff3c4"/>`
  }
}

BG['bawah-tanah'] = (u, t) => {
  const fl = Math.sin(t * 11) > 0.92 ? 0.35 : 1
  return {
    anchor: { x: 300, y: 1590, s: 1 }, props: { bayangan: { x: 860, y: 1330, s: 1 }, mata: { x: 640, y: 900, s: 1.2 } },
    svg: `<defs>${lin(u + 'bw', 0, 0, 0, 1, [[0, '#3a4048'], [1, '#1d2127']])}${rad(u + 'bl', 0.5, 0.5, 0.5, [[0, '#ffe2a0', 0.5 * fl], [1, '#ffe2a0', 0]])}</defs>` +
      `<rect width="${W}" height="1300" fill="url(#${u}bw)"/><rect y="1300" width="${W}" height="${H - 1300}" fill="#1a1c20"/>` +
      `<rect y="260" width="${W}" height="36" fill="#6b4a3a"/><rect y="340" width="${W}" height="24" fill="#6b4a3a"/>` +
      [0, 1, 2, 3, 4].map(i => `<rect x="${i * 260 + 40}" y="250" width="16" height="130" fill="#4a3226"/>`).join('') +
      `<line x1="540" y1="0" x2="540" y2="540" stroke="#111" stroke-width="5"/><ellipse cx="540" cy="560" rx="30" ry="40" fill="#ffe9a0" opacity="${fl}"/><circle cx="540" cy="620" r="420" fill="url(#${u}bl)"/>` +
      `<rect x="760" y="1120" width="240" height="190" fill="#6d4f35" stroke="#3a281b" stroke-width="7"/><rect x="800" y="940" width="190" height="180" fill="#7d5b3e" stroke="#3a281b" stroke-width="7"/>` +
      `<rect x="60" y="1000" width="230" height="300" fill="#2b2f36" stroke="#14161a" stroke-width="8"/><line x1="60" y1="1100" x2="290" y2="1100" stroke="#14161a" stroke-width="8"/>`
  }
}

export const drawBackground = (name, u, t, header) => (custom.latar[name] || BG[name] || BG['gelap'])(u, t, header)
