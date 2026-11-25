import { lin, rad, r2 } from './util.js'

const SKIN = '#e2a27b', HOOD = '#e8632b', HOOD_D = '#c24d1d', LEG = '#1f2d5c', INK = '#3a2018', MOUTH = '#5a2a22'

function face(ex, blink) {
  const brow = (a, b, c, d) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`
  const shut = (x, y, w = 12) => `<line x1="${x - w}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
  const dot = (x, y, r) => blink ? shut(x, y, r + 3) : `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/>`
  const wide = (x, y) => blink ? shut(x, y, 14) : `<circle cx="${x}" cy="${y}" r="15" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="${x}" cy="${y + 1}" r="6" fill="${INK}"/>`
  switch (ex) {
    case 'kaget':
      return brow(-46, -514, -16, -522) + brow(16, -522, 46, -514) + wide(-30, -474) + wide(30, -474) +
        `<ellipse cx="0" cy="-428" rx="13" ry="19" fill="${MOUTH}"/>`
    case 'takut':
      return brow(-46, -496, -16, -516) + brow(16, -516, 46, -496) + wide(-30, -474) + wide(30, -474) +
        `<path d="M-22,-430 q7,-10 14,0 t14,0 t14,0" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M70,-530 q-12,20 0,28 q12,-8 0,-28z" fill="#7cc8ff" stroke="#3a7fb5" stroke-width="2"/>`
    case 'sedih':
      return brow(-46, -498, -16, -510) + brow(16, -510, 46, -498) + dot(-30, -470, 7) + dot(30, -470, 7) +
        `<path d="M-17,-428 Q0,-446 17,-428" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
    case 'senang':
      return `<path d="M-42,-470 Q-30,-486 -18,-470" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="M18,-470 Q30,-486 42,-470" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="M-22,-442 Q0,-412 22,-442 Z" fill="${MOUTH}"/>`
    case 'marah':
      return brow(-46, -512, -16, -498) + brow(16, -498, 46, -512) + dot(-30, -472, 7) + dot(30, -472, 7) +
        `<path d="M-16,-430 Q0,-440 16,-430" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
    default:
      return brow(-46, -500, -16, -504) + brow(16, -504, 46, -500) + dot(-30, -474, 7) + dot(30, -474, 7) +
        `<path d="M-14,-436 Q0,-431 14,-436" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
  }
}

// Tokoh berhoodie oranye. Titik (0,0) = tengah telapak kaki. Tinggi sekitar 580 satuan. Semua gerak fungsi dari t (detik).
export function tokoh({ pose = 'berdiri', ekspresi = 'biasa', x = 540, y = 1560, s = 1, flip = false, t = 0, u = 'c' }) {
  const limb = (x1, y1, x2, y2, c, w = 44) => `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`
  const hand = (hx, hy) => `<circle cx="${r2(hx)}" cy="${r2(hy)}" r="21" fill="${SKIN}"/>`
  const shoe = (sx, sy) => `<ellipse cx="${r2(sx)}" cy="${r2(sy)}" rx="34" ry="15" fill="#2a2a2a"/>`
  const walking = pose === 'jalan'
  const sw = Math.sin(t * 8)
  const br = walking ? r2(-Math.abs(sw) * 7) : r2(Math.sin(t * 2.2) * 3)
  const sway = Math.sin(t * 1.6) * 5
  const blink = (t % 3.7) > 3.58
  let legs, armL, armR, extra = ''
  if (walking) {
    const a = sw * 0.5, fx = k => -24 * k + Math.sin(k * a) * 150 * -1, fy = k => -175 + Math.cos(a) * 150
    const lf = [-24 + Math.sin(a) * 150, -175 + Math.cos(a) * 150], rf = [24 + Math.sin(-a) * 150, -175 + Math.cos(a) * 150]
    legs = limb(-24, -175, lf[0], lf[1], LEG, 40) + limb(24, -175, rf[0], rf[1], LEG, 40) + shoe(lf[0] + 6, lf[1] + 12) + shoe(rf[0] + 6, rf[1] + 12)
    armL = limb(-78, -360, -78 + Math.sin(-a) * 120, -360 + Math.cos(a) * 120, HOOD) + hand(-78 + Math.sin(-a) * 124, -360 + Math.cos(a) * 124)
    armR = limb(78, -360, 78 + Math.sin(a) * 120, -360 + Math.cos(a) * 120, HOOD) + hand(78 + Math.sin(a) * 124, -360 + Math.cos(a) * 124)
  } else {
    legs = limb(-24, -175, -26, -26, LEG, 40) + limb(24, -175, 26, -26, LEG, 40) + shoe(-30, -14) + shoe(30, -14)
    armL = limb(-78, -360, -98 - sway * 0.4, -236, HOOD) + hand(-100 - sway * 0.4, -220)
    armR = limb(78, -360, 98 + sway * 0.4, -236, HOOD) + hand(100 + sway * 0.4, -220)
  }
  if (pose === 'menunjuk') {
    const lift = Math.sin(t * 1.4) * 5
    armR = limb(70, -362, 292, -346 + lift, HOOD) + hand(300, -345 + lift)
    const fl = 0.5 + Math.sin(t * 9) * 0.04 + (Math.sin(t * 2.3) > 0.97 ? -0.2 : 0)
    extra = `<g transform="translate(0,${r2(lift)})"><defs>${lin(u + 'bm', 0, 0, 1, 0, [[0, '#fff6c8', r2(fl + 0.05)], [1, '#fff6c8', 0]])}</defs>` +
      `<polygon points="352,-348 1250,-640 1250,-60" fill="url(#${u}bm)"/>` +
      `<rect x="296" y="-360" width="56" height="26" rx="7" fill="#3b3f46"/><rect x="344" y="-364" width="12" height="34" rx="4" fill="#ffe9a0"/></g>`
  }
  if (pose === 'tangan-naik') {
    const sh = Math.sin(t * 14) * 4
    armL = limb(-78, -360, -165 + sh, -560, HOOD) + hand(-168 + sh, -582)
    armR = limb(78, -360, 165 - sh, -560, HOOD) + hand(168 - sh, -582)
  }
  const back = pose === 'membelakangi'
  const body = `<path d="M-90,-150 L-90,-330 Q-90,-412 0,-412 Q90,-412 90,-330 L90,-150 Z" fill="${HOOD}"/>` +
    `<rect x="-90" y="-176" width="180" height="26" fill="${HOOD_D}"/>` +
    (back ? `<line x1="0" y1="-405" x2="0" y2="-176" stroke="${HOOD_D}" stroke-width="5"/>` :
      `<path d="M-54,-268 h108 l-12,54 h-84 z" fill="${HOOD_D}" opacity=".35"/><path d="M-54,-268 h108 l-12,54 h-84 z" fill="none" stroke="${HOOD_D}" stroke-width="5" stroke-linejoin="round"/>` +
      `<line x1="-20" y1="-398" x2="-22" y2="-318" stroke="#f3e0c8" stroke-width="5" stroke-linecap="round"/><line x1="20" y1="-398" x2="22" y2="-318" stroke="#f3e0c8" stroke-width="5" stroke-linecap="round"/>`)
  const fx = pose === 'menoleh' ? `translate(34,0) scale(.8,1)` : ''
  const faceSvg = back ? '' :
    `<circle cx="0" cy="-466" r="82" fill="${SKIN}"/><g${fx ? ` transform="${fx}"` : ''}>${face(ekspresi, blink)}</g>`
  const tilt = r2(Math.sin(t * 1.3) * 1.6)
  const head = `<g transform="rotate(${tilt} 0 -400)"><ellipse cx="0" cy="-400" rx="104" ry="40" fill="${HOOD}"/>` +
    `<circle cx="0" cy="-470" r="114" fill="${HOOD}" stroke="${HOOD_D}" stroke-width="6"/>` +
    (back ? `<path d="M0,-584 Q-30,-480 0,-380" fill="none" stroke="${HOOD_D}" stroke-width="5"/>` : '') + faceSvg + '</g>'
  return `<g transform="translate(${r2(x)},${r2(y)}) scale(${flip ? -s : s},${s})">` +
    `<ellipse cx="0" cy="-4" rx="120" ry="18" fill="#000" opacity=".28"/>` +
    legs + `<g transform="translate(0,${br})">${armL}${body}${armR}${extra}${head}</g></g>`
}

export function bayangan({ x, y, s = 1, t = 0 }) {
  const sw = Math.sin(t * 1.1) * 3
  return `<g transform="translate(${r2(x + sw)},${r2(y)}) scale(${s})" fill="#050505" stroke="#050505">` +
    `<circle cx="0" cy="-292" r="34" stroke="none"/><path d="M-46,-250 Q0,-270 46,-250 L38,-120 L-38,-120 Z" stroke="none"/>` +
    `<line x1="-46" y1="-244" x2="-56" y2="-130" stroke-width="22" stroke-linecap="round"/><line x1="46" y1="-244" x2="56" y2="-130" stroke-width="22" stroke-linecap="round"/>` +
    `<rect x="-36" y="-124" width="30" height="124" rx="10" stroke="none"/><rect x="6" y="-124" width="30" height="124" rx="10" stroke="none"/></g>`
}

export function mata({ x, y, s = 1, u = 'm', t = 0 }) {
  const open = (t % 4.2) > 4.05 ? 0.15 : 1
  return `<defs><filter id="${u}mg" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter></defs>` +
    `<g transform="translate(${r2(x)},${r2(y)}) scale(${s},${r2(s * open)})"><g filter="url(#${u}mg)" fill="#ffe27a" opacity=".85"><ellipse cx="-34" cy="0" rx="22" ry="10"/><ellipse cx="34" cy="0" rx="22" ry="10"/></g>` +
    `<g fill="#fff8d0"><ellipse cx="-34" cy="0" rx="16" ry="6"/><ellipse cx="34" cy="0" rx="16" ry="6"/></g></g>`
}

export function kabut({ t = 0, u = 'k' }) {
  const blob = (cx, cy, rx, ry, sp, ph) => `<ellipse cx="${r2(cx + Math.sin(t * sp + ph) * 60)}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${u}kb)"/>`
  return `<defs><radialGradient id="${u}kb"><stop offset="0" stop-color="#dfe6ee" stop-opacity=".34"/><stop offset="1" stop-color="#dfe6ee" stop-opacity="0"/></radialGradient></defs>` +
    blob(220, 1450, 520, 150, 0.35, 0) + blob(820, 1560, 560, 170, 0.28, 2) + blob(540, 1300, 640, 130, 0.22, 4)
}

// Orang lain: berdiri menghadap penonton, warna baju berbeda dari tokoh utama.
export function orang({ x, y, s = 1, t = 0, shirt = '#4f6f8f', hair = '#1c1410' }) {
  const br = r2(Math.sin(t * 2 + 1) * 3)
  return `<g transform="translate(${r2(x)},${r2(y)}) scale(${s})"><ellipse cx="0" cy="-4" rx="110" ry="16" fill="#000" opacity=".28"/>` +
    `<line x1="-24" y1="-175" x2="-26" y2="-26" stroke="#2b2b3a" stroke-width="40" stroke-linecap="round"/><line x1="24" y1="-175" x2="26" y2="-26" stroke="#2b2b3a" stroke-width="40" stroke-linecap="round"/>` +
    `<ellipse cx="-30" cy="-14" rx="34" ry="15" fill="#222"/><ellipse cx="30" cy="-14" rx="34" ry="15" fill="#222"/><g transform="translate(0,${br})">` +
    `<line x1="-78" y1="-360" x2="-96" y2="-236" stroke="${shirt}" stroke-width="44" stroke-linecap="round"/><line x1="78" y1="-360" x2="96" y2="-236" stroke="${shirt}" stroke-width="44" stroke-linecap="round"/>` +
    `<circle cx="-98" cy="-220" r="21" fill="#e8b895"/><circle cx="98" cy="-220" r="21" fill="#e8b895"/>` +
    `<path d="M-90,-150 L-90,-330 Q-90,-412 0,-412 Q90,-412 90,-330 L90,-150 Z" fill="${shirt}"/>` +
    `<circle cx="0" cy="-470" r="84" fill="#e8b895"/><path d="M-86,-470 Q-86,-570 0,-570 Q86,-570 86,-470 Q50,-520 0,-520 Q-50,-520 -86,-470Z" fill="${hair}"/>` +
    `<circle cx="-28" cy="-466" r="7" fill="#2b1d17"/><circle cx="28" cy="-466" r="7" fill="#2b1d17"/><path d="M-16,-430 Q0,-424 16,-430" fill="none" stroke="#2b1d17" stroke-width="5" stroke-linecap="round"/></g></g>`
}

export function lilin({ x, y, s = 1, t = 0, u = 'l' }) {
  const fl = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06, sx = Math.sin(t * 9) * 3
  return `<defs>${rad(u + 'lg', 0.5, 0.5, 0.5, [[0, '#ffd88a', 0.6], [1, '#ffd88a', 0]])}</defs><g transform="translate(${r2(x)},${r2(y)}) scale(${s})">` +
    `<circle cx="0" cy="-120" r="${r2(190 * fl)}" fill="url(#${u}lg)"/><rect x="-18" y="-100" width="36" height="100" rx="6" fill="#efe6d2"/>` +
    `<ellipse cx="${r2(sx)}" cy="-124" rx="${r2(12 * fl)}" ry="${r2(26 * fl)}" fill="#ffb347"/><ellipse cx="${r2(sx)}" cy="-120" rx="6" ry="14" fill="#fff3c4"/></g>`
}

export function kilat({ t = 0 }) {
  const k = t % 4.6
  const op = k < 0.07 ? 0.75 : k > 0.22 && k < 0.27 ? 0.5 : 0
  return op ? `<rect width="1080" height="1920" fill="#dfe8ff" opacity="${op}"/>` : ''
}
