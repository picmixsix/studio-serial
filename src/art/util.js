export const W = 1080
export const H = 1920
export const FONT = "Poppins, 'Segoe UI', Arial, sans-serif"
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
export const r2 = x => Math.round(x * 100) / 100
let n = 0
export const uid = () => 'u' + (++n).toString(36)
export const lin = (id, x1, y1, x2, y2, stops) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`
export const rad = (id, cx, cy, r, stops) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`
