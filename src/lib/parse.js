// Parser narasi bertag. Satu-satunya sumber kebenaran: dipakai dashboard, plan.mjs, stills.mjs.
//
//  @judul: KONON, RUMAH NO. 13 | TIDAK PERNAH KOSONG      <- header (opsional)
//
//  [latar: ruang-tamu; tokoh: menunjuk/kaget; kamera: zoom-in]   <- tag adegan (opsional)
//  Teks narasi adegan ini.
//
//  Baris kosong memisahkan adegan. Baris berawal # adalah komentar.
import { LATAR, POSE, EKSPRESI, OBJEK, KAMERA, EFEK, UKURAN, POSISI, HADAP, MASUK, HEADER_KEYS, KAMERA_DEFAULT } from '../art/catalog.js'

const norm = s => String(s || '').trim().toLowerCase().replace(/\s+/g, '-')
const KEY_ALIAS = {
  bg: 'latar', background: 'latar', char: 'tokoh', karakter: 'tokoh', pos: 'posisi', size: 'ukuran',
  obj: 'objek', cam: 'kamera', fx: 'efek', pause: 'jeda', face: 'hadap',
}
const NONE = new Set(['tidak-ada', 'tanpa', 'kosong', '-', 'none', 'nihil'])

export function parseTags(src, warn) {
  const t = {}
  for (const part of src.split(';')) {
    if (!part.trim()) continue
    const m = part.match(/^\s*([^:=]+?)\s*[:=]\s*([\s\S]*?)\s*$/)
    if (!m) { warn(`tag "${part.trim()}" tidak punya nilai (format: kunci: nilai)`); continue }
    let k = norm(m[1]); k = KEY_ALIAS[k] || k
    t[k] = m[2]
  }
  return t
}

export function parsePoll(v, warn) {
  const opts = v.split('|').map(x => x.trim()).filter(Boolean).map(x => {
    const m = x.match(/^(.*?)\s*=\s*(\d{1,3})\s*%?$/)
    return m ? { label: m[1].trim(), pct: +m[2] } : { label: x, pct: null }
  })
  if (opts.length < 2 || opts.length > 4) { warn('poll butuh 2 sampai 4 pilihan, dipisah tanda |'); return null }
  if (opts.some(o => o.pct == null)) opts.forEach(o => (o.pct = Math.round(100 / opts.length)))
  return opts
}

export function parseNarasi(raw) {
  const header = {}, scenes = [], warnings = []
  let cur = null
  let carry = { latar: 'ruang-tamu', tokoh: { pose: 'berdiri', ekspresi: 'biasa' }, posisi: 'kiri' }

  const flush = () => {
    if (!cur) return
    const text = cur.text.join(' ').replace(/\s+/g, ' ').trim()
    if (!text && !Object.keys(cur.tags).length) { cur = null; return }
    const n = scenes.length + 1
    const warn = m => warnings.push(`Adegan ${n}: ${m}`)
    const tg = cur.tags
    const sc = { index: scenes.length, text }

    let latar = carry.latar
    if (tg.latar != null) {
      const v = norm(tg.latar)
      if (LATAR.includes(v)) latar = v
      else warn(`latar "${tg.latar}" tidak dikenal (pilihan: ${LATAR.join(', ')}). Dipakai: ${carry.latar}`)
    }
    sc.latar = latar

    let tokoh = carry.tokoh
    if (tg.tokoh != null) {
      const toks = String(tg.tokoh).split(/[\/,\s]+/).map(norm).filter(Boolean)
      if (toks.length && toks.every(x => NONE.has(x))) tokoh = null
      else {
        let pose = null, ekspresi = null
        for (const x of toks) {
          if (POSE.includes(x)) pose = x
          else if (EKSPRESI.includes(x)) ekspresi = x
          else warn(`tokoh "${x}" tidak dikenal (pose: ${POSE.join(', ')}; ekspresi: ${EKSPRESI.join(', ')})`)
        }
        tokoh = { pose: pose || (carry.tokoh && carry.tokoh.pose) || 'berdiri', ekspresi: ekspresi || 'biasa' }
      }
    }
    sc.tokoh = tokoh

    sc.posisi = carry.posisi
    if (tg.posisi != null) { const v = norm(tg.posisi); POSISI.includes(v) ? (sc.posisi = v) : warn(`posisi "${tg.posisi}" tidak dikenal (${POSISI.join(', ')})`) }
    sc.ukuran = 'sedang'
    if (tg.ukuran != null) { const v = norm(tg.ukuran); UKURAN.includes(v) ? (sc.ukuran = v) : warn(`ukuran "${tg.ukuran}" tidak dikenal (${UKURAN.join(', ')})`) }
    sc.hadap = null
    if (tg.hadap != null) { const v = norm(tg.hadap); HADAP.includes(v) ? (sc.hadap = v) : warn(`hadap "${tg.hadap}" tidak dikenal (${HADAP.join(', ')})`) }

    sc.masuk = null
    if (tg.masuk != null) { const v = norm(tg.masuk); NONE.has(v) ? null : MASUK.includes(v) ? (sc.masuk = v) : warn(`masuk "${tg.masuk}" tidak dikenal (${MASUK.join(', ')})`) }

    sc.masuk = null
    if (tg.masuk != null) { const v = norm(tg.masuk); NONE.has(v) ? 0 : MASUK.includes(v) ? (sc.masuk = v) : warn(`masuk "${tg.masuk}" tidak dikenal (${MASUK.join(', ')})`) }
    sc.objek = []
    if (tg.objek != null) for (const x of String(tg.objek).split(',').map(norm).filter(Boolean)) {
      if (NONE.has(x)) continue
      OBJEK.includes(x) ? sc.objek.push(x) : warn(`objek "${x}" tidak dikenal (${OBJEK.join(', ')})`)
    }
    sc.efek = []
    if (tg.efek != null) for (const x of String(tg.efek).split(',').map(norm).filter(Boolean)) {
      if (NONE.has(x)) continue
      EFEK.includes(x) ? sc.efek.push(x) : warn(`efek "${x}" tidak dikenal (${EFEK.join(', ')})`)
    }
    sc.kamera = KAMERA_DEFAULT[scenes.length % KAMERA_DEFAULT.length]
    if (tg.kamera != null) { const v = norm(tg.kamera); KAMERA.includes(v) ? (sc.kamera = v) : warn(`kamera "${tg.kamera}" tidak dikenal (${KAMERA.join(', ')})`) }
    sc.jeda = 0
    if (tg.jeda != null) { const v = parseFloat(String(tg.jeda).replace(',', '.')); isNaN(v) ? warn(`jeda "${tg.jeda}" harus angka detik`) : (sc.jeda = Math.min(10, Math.max(0, v))) }
    sc.poll = tg.poll != null ? parsePoll(tg.poll, warn) : null
    sc.cta = tg.cta != null ? String(tg.cta).toUpperCase() : ''

    const known = ['latar', 'tokoh', 'posisi', 'ukuran', 'hadap', 'masuk', 'objek', 'efek', 'kamera', 'jeda', 'poll', 'cta']
    for (const k of Object.keys(tg)) if (!known.includes(k)) warn(`kunci tag "${k}" tidak dikenal (${known.join(', ')})`)
    if (!text && !sc.poll && !sc.cta && !sc.jeda) warn('adegan tanpa teks, akan tampil singkat tanpa suara')

    carry = { latar: sc.latar, tokoh: sc.tokoh, posisi: sc.posisi }
    scenes.push(sc)
    cur = null
  }

  for (const line0 of String(raw || '').replace(/\r/g, '').split('\n')) {
    const line = line0.trim()
    if (!line) { flush(); continue }
    if (line.startsWith('#')) continue
    let m = line.match(/^@([a-zA-Z]+)\s*[:=]\s*(.*)$/)
    if (m) {
      const k = norm(m[1])
      HEADER_KEYS.includes(k) ? (header[k] = m[2].trim()) : warnings.push(`Header "@${m[1]}" tidak dikenal (${HEADER_KEYS.join(', ')})`)
      continue
    }
    m = line.match(/^\[([^\]]*)\]\s*(.*)$/)
    if (m) {
      flush()
      const n = scenes.length + 1
      cur = { tags: parseTags(m[1], x => warnings.push(`Adegan ${n}: ${x}`)), text: m[2] ? [m[2]] : [] }
      continue
    }
    if (!cur) cur = { tags: {}, text: [] }
    cur.text.push(line)
  }
  flush()

  header.titleLines = (header.judul || '').split(/\s*(?:\||\/\/)\s*/).map(s => s.trim()).filter(Boolean).slice(0, 3)
  if (!scenes.length) warnings.push('Narasi kosong: tidak ada adegan.')
  return { header, scenes, warnings }
}
