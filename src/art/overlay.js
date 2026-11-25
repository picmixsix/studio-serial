import { W, H, FONT, esc, clamp, r2, lin } from './util.js'

const YELLOW = '#f5c542'

export function wrapText(text, max = 34) {
  const words = String(text || '').split(/\s+/).filter(Boolean), lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

// Bagian yang tetap di layar sepanjang video: gradien, penanda hari/jam, tag part, judul.
export function hud(header, u) {
  const h = header || {}
  const tl = (h.titleLines && h.titleLines.length ? h.titleLines : (h.judul ? [h.judul] : [])).map(s => s.toUpperCase())
  let out = `<defs>${lin(u + 'tg', 0, 0, 0, 1, [[0, '#000', 0.7], [1, '#000', 0]])}${lin(u + 'bg', 0, 0, 0, 1, [[0, '#000', 0], [1, '#000', 0.72]])}</defs>` +
    `<rect width="${W}" height="620" fill="url(#${u}tg)"/><rect y="1280" width="${W}" height="640" fill="url(#${u}bg)"/>`
  if (h.hari) out += `<text x="56" y="112" font-family="${FONT}" font-weight="800" font-size="30" fill="#fff">${esc(h.hari.toUpperCase())}</text>`
  if (h.jam) out += `<text x="56" y="174" font-family="${FONT}" font-weight="800" font-size="64" fill="#fff">${esc(h.jam)}</text>`
  if (h.lokasi) out += `<text x="56" y="208" font-family="${FONT}" font-weight="600" font-size="20" fill="#fff" fill-opacity=".6">${esc(h.lokasi.toUpperCase())}</text>`
  if (h.part) {
    const w = Math.max(150, h.part.length * 20 + 56)
    out += `<rect x="${W - 56 - w}" y="84" width="${w}" height="52" rx="10" fill="#d8402f"/><text x="${W - 56 - w / 2}" y="119" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="26" fill="#fff">${esc(h.part.toUpperCase())}</text>`
  }
  if (h.watermark) out += `<text x="${W - 56}" y="170" text-anchor="end" font-family="${FONT}" font-weight="600" font-size="20" fill="#fff" fill-opacity=".55">${esc(h.watermark)}</text>`
  if (tl.length) {
    const size = clamp(Math.min(...tl.map(s => 940 / (s.length * 0.66)), 112), 52, 112)
    const y0 = 400
    tl.forEach((s, i) => {
      const last = i === tl.length - 1 && tl.length > 1
      out += `<text x="${W / 2}" y="${r2(y0 + i * size * 1.1)}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="${r2(size)}" fill="${last ? YELLOW : '#fff'}" stroke="#000" stroke-opacity=".4" stroke-width="10" stroke-linejoin="round" paint-order="stroke">${esc(s)}</text>`
    })
  }
  return out
}

// Bagian yang melekat pada satu adegan: ringkasan (adegan pertama), poll, ajakan komentar.
export function extras(scene, header, { index = 0, p = 1 } = {}) {
  let out = ''
  const h = header || {}
  if (index === 0 && h.ringkasan) {
    const w = Math.min(980, h.ringkasan.length * 13 + 60)
    out += `<rect x="${r2(W / 2 - w / 2)}" y="236" width="${r2(w)}" height="46" rx="23" fill="#000" fill-opacity=".45"/><text x="${W / 2}" y="268" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="23" fill="#fff" fill-opacity=".88">${esc(h.ringkasan)}</text>`
  }
  let bottom = 1560
  if (scene.poll) {
    const n = scene.poll.length, rowH = 66, gap = 14, bh = 92 + n * (rowH + gap), x = 300, w = 700, y = 1290
    const win = Math.max(...scene.poll.map(o => o.pct))
    const e = 1 - Math.pow(1 - clamp(p, 0, 1), 3)
    out += `<g opacity="${r2(clamp(p * 4, 0, 1))}"><rect x="${x}" y="${y}" width="${w}" height="${bh}" rx="22" fill="#0e1318" fill-opacity=".86" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>` +
      `<text x="${x + w / 2}" y="${y + 46}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="22" letter-spacing="4" fill="#fff" fill-opacity=".62">KAMU PILIH</text>`
    scene.poll.forEach((o, i) => {
      const ry = y + 70 + i * (rowH + gap), bw = (w - 48) * o.pct / 100 * e
      const col = o.pct === win ? '#35c46a' : '#4a5560'
      out += `<rect x="${x + 24}" y="${ry}" width="${w - 48}" height="${rowH}" rx="14" fill="#fff" fill-opacity=".07"/><rect x="${x + 24}" y="${ry}" width="${r2(Math.max(0, bw))}" height="${rowH}" rx="14" fill="${col}"/>` +
        `<text x="${x + 44}" y="${ry + 43}" font-family="${FONT}" font-weight="600" font-size="27" fill="#fff">${i + 1}. ${esc(o.label.length > 30 ? o.label.slice(0, 29) + '…' : o.label)}</text>` +
        `<text x="${x + w - 44}" y="${ry + 43}" text-anchor="end" font-family="${FONT}" font-weight="800" font-size="26" fill="#fff">${Math.round(o.pct * e)}%</text>`
    })
    out += '</g>'
    bottom = y + bh
  }
  if (scene.cta) {
    const y = scene.poll ? bottom + 96 : 1680
    out += `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${FONT}" font-weight="800" font-size="62" fill="${YELLOW}" stroke="#000" stroke-opacity=".4" stroke-width="10" stroke-linejoin="round" paint-order="stroke" opacity="${r2(clamp(p * 3 - 0.5, 0, 1))}">${esc(scene.cta)}</text>`
  }
  return out
}

export function subtitle(text) {
  const lines = wrapText(text, 36)
  const y0 = 1700 - (lines.length - 1) * 26
  return lines.map((l, i) => `<text x="${W / 2}" y="${y0 + i * 52}" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="40" fill="#fff" stroke="#000" stroke-opacity=".55" stroke-width="8" stroke-linejoin="round" paint-order="stroke">${esc(l)}</text>`).join('')
}
