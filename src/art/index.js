import { W, H, uid, lin, rad, clamp, r2 } from './util.js'
import { drawBackground } from './backgrounds.js'
import { tokoh, bayangan, mata, kabut, orang, lilin, kilat } from './chars.js'
import { hud, extras, subtitle } from './overlay.js'
import { custom } from './custom/index.js'
export * from './catalog.js'
export { hud, extras, subtitle, wrapText } from './overlay.js'

const MULT = { kecil: 0.7, sedang: 1, besar: 1.5, dekat: 2.4 }
// Pewarnaan suasana: [warna atas, warna bawah, opasitas atas, opasitas bawah]
const SUASANA_FX = {
  pagi: ['#bfe0ff', '#ffe0a8', 0.16, 0.2], siang: ['#ffffff', '#fff4c8', 0.1, 0.1], senja: ['#7a3aa8', '#ff8a3d', 0.22, 0.24],
  malam: ['#0a1048', '#050a28', 0.38, 0.3], dingin: ['#4a8fe0', '#2a4a9a', 0.2, 0.2], hangat: ['#ffb060', '#ff8a3a', 0.18, 0.14],
  neon: ['#ff2bd6', '#18e0ff', 0.22, 0.22], hijau: ['#3aff8a', '#0a5a3a', 0.14, 0.22],
}
// Latar yang dipakai berulang diberi nuansa warna berbeda (putaran rona), supaya tidak terlihat sama.
const VARIAN_HUE = [0, -32, 38, 170, -90, 110]
const smooth = x => { const k = clamp(x, 0, 1); return k * k * (3 - 2 * k) }

// sized: true = ukuran tetap 1080x1920 (untuk PNG), false = hanya viewBox (dashboard), 'fill' = 100% (untuk video)
export const svgDoc = (inner, { sized = true } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"${sized === 'fill' ? ' width="100%" height="100%"' : sized ? ` width="${W}" height="${H}"` : ''} style="display:block">${inner}</svg>`

// Kamera berlapis: latar bergerak lebih sedikit daripada tokoh/objek (parallax).
function camera(cam) {
  if (!cam || !cam.kind || cam.kind === 'diam') return { bg: '', fg: '' }
  const e = smooth(cam.p ?? 0)
  const g = (s, tx, ty) => `translate(540 960) scale(${r2(s)}) translate(${r2(tx)} ${r2(ty)}) translate(-540 -960)`
  switch (cam.kind) {
    case 'zoom-in': return { bg: g(1.02 + 0.06 * e, 0, 0), fg: g(1 + 0.13 * e, 0, 0) }
    case 'zoom-out': return { bg: g(1.08 - 0.06 * e, 0, 0), fg: g(1.13 - 0.13 * e, 0, 0) }
    case 'geser-kiri': return { bg: g(1.08, 24 - 48 * e, 0), fg: g(1.08, 50 - 100 * e, 0) }
    case 'geser-kanan': return { bg: g(1.08, -24 + 48 * e, 0), fg: g(1.08, -50 + 100 * e, 0) }
    case 'naik': return { bg: g(1.08, 0, 20 - 40 * e), fg: g(1.08, 0, 40 - 80 * e) }
    case 'turun': return { bg: g(1.08, 0, -20 + 40 * e), fg: g(1.08, 0, -40 + 80 * e) }
    default: return { bg: '', fg: '' }
  }
}

// Isi SVG gambar adegan (tanpa judul/HUD/subtitle).
//   t   = waktu animasi berulang (napas, uap, kedip lampu)
//   ta  = waktu sejak adegan mulai, untuk gerak sekali jalan (masuk, menyala). Bawaan: tak terhingga = keadaan akhir (PNG)
//   cam = { kind, p } kamera pada kemajuan adegan p (0..1)
export function artInner(scene, { t = 0, ta = Infinity, header = {}, cam = null } = {}) {
  const u = uid()
  const bg = drawBackground(scene.latar, u, t, header)
  const objs = scene.objek || []
  const c = camera(cam)
  const dekat = scene.ukuran === 'dekat'
  let out = `<defs><filter id="${u}db" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="9"/></filter></defs>`
  const hue = VARIAN_HUE[(scene.varian || 0) % VARIAN_HUE.length]
  out += `<g${hue ? ` style="filter:hue-rotate(${hue}deg)"` : ''}><g${c.bg ? ` transform="${c.bg}"` : ''}${dekat && scene.tokoh ? ` filter="url(#${u}db)"` : ''}>${bg.svg}</g></g>`
  let fg = ''
  const P = bg.props || {}
  if (objs.includes('bayangan')) fg += bayangan({ ...P.bayangan, t })
  if (objs.includes('orang')) fg += orang({ ...(P.bayangan || { x: 880, y: 1300, s: 1 }), t })
  if (objs.includes('lilin')) fg += lilin({ x: bg.anchor.x + 420, y: bg.anchor.y - 120, s: 1, t, u })
  if (objs.includes('mata')) fg += mata({ ...P.mata, u, t })
  for (const name of objs) if (custom.objek[name]) fg += custom.objek[name]({ ...(P.bayangan || {}), t, u, bg })
  if (scene.tokoh) {
    const m = MULT[scene.ukuran] || 1, a = bg.anchor
    const posisi = scene.posisi || 'kiri'
    let x = posisi === 'tengah' ? 540 : posisi === 'kanan' ? W - a.x : a.x
    let y = a.y
    if (scene.ukuran === 'kecil') y = a.y - 60
    if (scene.ukuran === 'besar') y = a.y + 200
    if (dekat) { y = 2300; x = posisi === 'tengah' ? 540 : posisi === 'kanan' ? 700 : 380 }
    let flip = scene.hadap ? scene.hadap === 'kiri' : posisi === 'kanan'
    let pose = scene.tokoh.pose
    if (scene.masuk) { // berjalan masuk dari tepi layar menuju posisi akhir
      const k = smooth(ta / 1.8)
      const from = scene.masuk === 'kiri' ? -x - 300 : W - x + 300
      x += from * (1 - k)
      if (k < 1) { pose = scene.lari ? 'berlari' : 'jalan'; flip = scene.masuk === 'kanan' }
    }
    fg += tokoh({ pose, ekspresi: scene.tokoh.ekspresi, x, y, s: a.s * m, flip, t: scene.masuk && ta < 1.8 ? ta : t, u, baju: scene.baju })
  }
  if (objs.includes('kabut')) fg += kabut({ t, u })
  out += `<g${c.fg ? ` transform="${c.fg}"` : ''}>${fg}</g>`
  if (objs.includes('kilat')) out += kilat({ t })
  const sf = SUASANA_FX[scene.suasana]
  if (sf) out += `<defs>${lin(u + 'sg', 0, 0, 0, 1, [[0, sf[0], sf[2]], [1, sf[1], sf[3]]])}</defs><rect width="${W}" height="${H}" fill="url(#${u}sg)"/>`
  const ef = scene.efek || []
  out += `<defs>${rad(u + 'vg', 0.5, 0.5, 0.78, [[0.45, '#000', 0], [1, '#000', ef.includes('gelap') ? 0.92 : 0.55]])}</defs><rect width="${W}" height="${H}" fill="url(#${u}vg)"/>`
  if (ef.includes('gelap')) out += `<rect width="${W}" height="${H}" fill="#000" opacity=".38"/>`
  if (ef.includes('merah')) out += `<rect width="${W}" height="${H}" fill="#c01818" opacity=".24"/>`
  if (ef.includes('biru')) out += `<rect width="${W}" height="${H}" fill="#1a3bb0" opacity=".22"/>`
  if (ef.includes('menyala')) { const o = 0.94 * (1 - smooth((ta - 0.3) / 1.8)); if (o > 0.004) out += `<rect width="${W}" height="${H}" fill="#000" opacity="${r2(o)}"/>` }
  return out
}

export const renderArt = (scene, opts = {}) => svgDoc(artInner(scene, opts), { sized: opts.sized === undefined ? true : opts.sized })

// Pratinjau gabungan (gambar + judul + HUD + poll + subtitle) untuk dashboard.
export function renderPreview(scene, header, { t = 1, ta, index = 0, count = 1, sized = false, cam = null } = {}) {
  const u = uid()
  return svgDoc(artInner(scene, { t, ta, header, cam }) + hud(header, u) + extras(scene, header, { index, p: 1 }) + (scene.cta ? '' : subtitle(scene.text)), { sized })
}
