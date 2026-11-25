// Parser narasi bertag. Satu-satunya sumber kebenaran: dipakai dashboard, plan.mjs, stills.mjs.
//
//  @judul: KONON, RUMAH NO. 13 | TIDAK PERNAH KOSONG      <- header (opsional)
//
//  [latar: ruang-tamu; tokoh: menunjuk/kaget; kamera: zoom-in]   <- tag adegan (opsional)
//  Teks narasi adegan ini.
//
//  Baris kosong memisahkan adegan. Baris berawal # adalah komentar.
import { LATAR, POSE, EKSPRESI, OBJEK, OBJEK_BAWAAN, KAMERA, EFEK, UKURAN, POSISI, HADAP, MASUK, HEADER_KEYS, KAMERA_DEFAULT, SUASANA, BAJU } from '../art/catalog.js'

const norm = s => String(s || '').trim().toLowerCase().replace(/\s+/g, '-')
const KEY_ALIAS = {
  bg: 'latar', background: 'latar', char: 'tokoh', karakter: 'tokoh', pos: 'posisi', size: 'ukuran',
  obj: 'objek', cam: 'kamera', fx: 'efek', pause: 'jeda', face: 'hadap',
}
// Nama latar lain yang sering ditulis (juga oleh AI) dipetakan ke latar yang ada, supaya tidak jatuh ke latar sebelumnya.
const LATAR_ALIAS = {
  jalanan: 'jalan', 'jalan-raya': 'jalan', aspal: 'jalan', trotoar: 'jalan',
  perempatan: 'persimpangan', simpang: 'persimpangan', 'lampu-lalu-lintas': 'persimpangan', 'lampu-merah': 'persimpangan', 'lampu-jalan': 'persimpangan', 'traffic-light': 'persimpangan', 'tiang-sinyal': 'persimpangan',
  bus: 'halte', 'halte-bus': 'halte', terminal: 'halte', stasiun: 'halte',
  elevator: 'lift', 'ruang-kerja': 'kantor', 'ruang-rapat': 'kantor', office: 'kantor',
  toilet: 'kamar-mandi', wc: 'kamar-mandi', 'kamar-kecil': 'kamar-mandi',
  sekolah: 'kelas', 'ruang-kelas': 'kelas', rs: 'rumah-sakit', klinik: 'rumah-sakit', igd: 'rumah-sakit',
  rooftop: 'atap', 'atap-gedung': 'atap', toko: 'minimarket', warung: 'minimarket', supermarket: 'minimarket', swalayan: 'minimarket',
  halaman: 'luar', teras: 'luar', pagar: 'luar', kebun: 'hutan', taman: 'hutan', rimba: 'hutan',
  'ruang-keluarga': 'ruang-tamu', 'ruang-tengah': 'ruang-tamu', rumah: 'ruang-tamu', 'kamar-tidur': 'kamar', 'ruang-makan': 'dapur',
  basement: 'bawah-tanah', parkiran: 'bawah-tanah', 'lantai-atas': 'tangga', koridor: 'lorong',
}
// Petunjuk dari isi teks adegan (urutan = prioritas). Hanya dipakai bila tag terkait tidak ditulis.
const KW_LATAR = [
  ['persimpangan', /persimpangan|perempatan|lampu (lalu lintas|merah|hijau|sinyal)|tiang sinyal|penyeberangan/],
  ['halte', /halte|menunggu bus|bus kota/], ['lift', /\blift\b|elevator/],
  ['kamar-mandi', /kamar mandi|toilet|wastafel|shower/], ['rumah-sakit', /rumah sakit|\bigd\b|perawat|infus|bangsal|ambulans/],
  ['kelas', /\bkelas\b|sekolah|papan tulis|murid/], ['kantor', /kantor|meja kerja|\brapat\b|lembur/],
  ['minimarket', /minimarket|supermarket|kasir|rak belanja|toko 24/], ['atap', /rooftop|atap gedung|puncak gedung/],
  ['loteng', /loteng|plafon/], ['gudang', /gudang/], ['bawah-tanah', /bawah tanah|basement|parkiran bawah/],
  ['hutan', /\bhutan\b|pepohonan|\bsemak\b|\brimba\b/], ['tangga', /tangga|lantai atas/], ['lorong', /lorong|koridor/],
  ['dapur', /dapur|kompor|kulkas/], ['kamar', /kamar tidur|\bkamar\b|ranjang|kasur/], ['foto', /\bfoto\b|bingkai/],
  ['pintu', /\bpintu\b|bel rumah|ketukan/], ['jalan', /jalan raya|jalanan|trotoar|dashcam/],
  ['luar', /halaman|pagar|teras/], ['ruang-tamu', /ruang tamu|sofa/],
]
const KW_EKSPRESI = [
  ['kaget', /tiba-tiba|mendadak|terkejut|kaget|berteriak|menjerit|astaga|detik berikutnya|ternyata/],
  ['takut', /takut|gemetar|merinding|bayangan|mengintip|menghilang|seram|ngeri|panik|bisikan|suara aneh|sosok/],
  ['sedih', /sedih|menangis|air mata|kehilangan|menyesal|rindu/], ['marah', /marah|membentak|geram|emosi|dendam/],
  ['senang', /senang|tersenyum|tertawa|lega|bahagia|selamat/],
]
const KW_POSE = [
  ['menunjuk', /menunjuk|mengarahkan|senter|menyorot/], ['menutup-wajah', /menutup (mata|wajah)|menutupi wajah|bersembunyi/],
  ['melambai', /melambai|memanggil|menyapa/], ['tangan-naik', /mengangkat (kedua )?tangan|menyerah/],
  ['menoleh', /menoleh|berbalik|menengok|melihat ke belakang/], ['membelakangi', /membelakangi|punggungnya/],
]
const KW_LARI = /berlari|lari\b|kabur|mengejar|melarikan/, KW_JALAN = /melangkah|berjalan|menyusuri|menghampiri|mendekati|menaiki|menuruni/
const KW_OBJEK = [
  ['bayangan', /bayangan|siluet|sosok/], ['mata', /sepasang mata|mengintip|menatap/], ['kabut', /kabut|berkabut|embun/],
  ['lilin', /lilin/], ['kilat', /kilat|kilatan|petir|menyambar/], ['hujan', /hujan|gerimis/],
]
const KW_SUASANA = [
  ['malam', /tengah malam|larut malam|malam hari|dini hari|gelap gulita/], ['senja', /senja|sore hari|matahari terbenam|petang/],
  ['pagi', /\bpagi\b|subuh|fajar/], ['siang', /\bsiang\b|terik|tengah hari/], ['dingin', /dingin|hujan|beku/], ['neon', /neon|diskotek/],
]
const firstMatch = (table, txt) => { for (const [k, re] of table) if (re.test(txt)) return k; return null }
// untuk latar: tempat yang disebut paling awal di teks menang (seri: urutan tabel)
const earliestMatch = (table, txt) => {
  let best = null, at = Infinity
  for (const [k, re] of table) { const m = re.exec(txt); if (m && m.index < at) { best = k; at = m.index } }
  return best
}
const GENERIK = new Set(['jalan', 'luar', 'ruang-tamu', 'gelap'])
const SPESIFIK = () => KW_LATAR.filter(([k]) => !GENERIK.has(k))
const aliasLatar = v => {
  if (LATAR.includes(v)) return v
  if (LATAR_ALIAS[v] && LATAR.includes(LATAR_ALIAS[v])) return LATAR_ALIAS[v]
  for (const k of Object.keys(LATAR_ALIAS)) if (v.includes(k) && LATAR.includes(LATAR_ALIAS[k])) return LATAR_ALIAS[k]
  for (const l of LATAR) if (v.includes(l)) return l
  return null
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
  let carry = { latar: 'ruang-tamu', tokoh: { pose: 'berdiri', ekspresi: 'biasa' }, posisi: 'kiri', baju: 'oranye' }

  const hist = [] // adegan sebelumnya (untuk variasi otomatis)
  const flush = () => {
    if (!cur) return
    const text = cur.text.join(' ').replace(/\s+/g, ' ').trim()
    if (!text && !Object.keys(cur.tags).length) { cur = null; return }
    const n = scenes.length + 1
    const warn = m => warnings.push(`Adegan ${n}: ${m}`)
    const tg = cur.tags
    const sc = { index: scenes.length, text }
    const txt = ' ' + text.toLowerCase() + ' '
    const auto = !/^(tidak|mati|off|no|nonaktif)/.test(norm(header.variasi || ''))
    const prev = hist[hist.length - 1]
    const ex = {} // tag yang ditulis eksplisit (tidak boleh ditimpa variasi otomatis)

    // --- latar
    let latar = carry.latar
    if (tg.latar != null) {
      const v = norm(tg.latar), hit = aliasLatar(v)
      if (hit) {
        latar = hit; ex.latar = 1
        // latar generik (jalan, luar, dst.) dipertajam bila teks jelas menyebut tempat yang lebih spesifik, mis. persimpangan
        if (auto && GENERIK.has(hit)) { const lebih = earliestMatch(SPESIFIK(), txt); if (lebih && LATAR.includes(lebih)) latar = lebih }
      }
      else {
        const dari = auto ? (earliestMatch(KW_LATAR, ' ' + v.replace(/-/g, ' ') + ' ') || earliestMatch(KW_LATAR, txt)) : null
        if (dari && LATAR.includes(dari)) { latar = dari; warn(`latar "${tg.latar}" tidak dikenal, dipilihkan "${dari}" dari isi teks (pilihan: ${LATAR.join(', ')})`) }
        else warn(`latar "${tg.latar}" tidak dikenal (pilihan: ${LATAR.join(', ')}). Dipakai: ${carry.latar}`)
      }
    } else if (auto) {
      const dari = earliestMatch(KW_LATAR, txt)
      if (dari && LATAR.includes(dari)) latar = dari
    }
    sc.latar = latar

    // --- tokoh
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
        ex.tokoh = 1
      }
    }
    let lari = false, masukAuto = null
    if (tg.tokoh == null && tokoh && auto) {
      // tokoh tidak ditulis: ekspresi dan pose mengikuti isi teks, bukan menyalin adegan sebelumnya
      const eks = firstMatch(KW_EKSPRESI, txt) || 'biasa'
      let pose = firstMatch(KW_POSE, txt)
      if (!pose) {
        pose = tokoh.pose
        const run = hist.slice(-2)
        if (run.length === 2 && run.every(h => h.tokoh && h.tokoh.pose === pose)) pose = ['menoleh', 'berdiri', 'menunjuk'].find(p => p !== pose) // jangan 3 adegan berturut-turut pose sama
      }
      if (KW_LARI.test(txt)) { lari = true; masukAuto = 1 } else if (KW_JALAN.test(txt)) masukAuto = 1
      tokoh = { pose, ekspresi: eks }
    }
    sc.tokoh = tokoh

    // --- tampilan tokoh
    sc.baju = carry.baju
    if (tg.baju != null) { const v = norm(tg.baju); BAJU.includes(v) ? (sc.baju = v) : warn(`baju "${tg.baju}" tidak dikenal (${BAJU.join(', ')})`) }

    const POS_SEQ = ['kiri', 'kanan', 'tengah']
    sc.posisi = carry.posisi
    if (tg.posisi != null) { const v = norm(tg.posisi); POSISI.includes(v) ? (sc.posisi = v, ex.posisi = 1) : warn(`posisi "${tg.posisi}" tidak dikenal (${POSISI.join(', ')})`) }
    if (!ex.posisi && auto && prev) sc.posisi = POS_SEQ[(POS_SEQ.indexOf(prev.posisi) + 1) % 3]

    sc.ukuran = 'sedang'
    if (tg.ukuran != null) { const v = norm(tg.ukuran); UKURAN.includes(v) ? (sc.ukuran = v, ex.ukuran = 1) : warn(`ukuran "${tg.ukuran}" tidak dikenal (${UKURAN.join(', ')})`) }
    if (!ex.ukuran && auto) {
      const UK_SEQ = ['sedang', 'besar', 'sedang', 'kecil', 'sedang', 'besar']
      let u = UK_SEQ[scenes.length % UK_SEQ.length]
      if (tokoh && tokoh.ekspresi === 'kaget' && !(prev && prev.ukuran === 'dekat')) u = 'dekat'
      if (prev && prev.ukuran === u && u !== 'sedang') u = 'sedang'
      sc.ukuran = u
    }

    sc.hadap = null
    if (tg.hadap != null) { const v = norm(tg.hadap); HADAP.includes(v) ? (sc.hadap = v) : warn(`hadap "${tg.hadap}" tidak dikenal (${HADAP.join(', ')})`) }

    sc.masuk = null
    if (tg.masuk != null) { const v = norm(tg.masuk); NONE.has(v) ? 0 : MASUK.includes(v) ? (sc.masuk = v) : warn(`masuk "${tg.masuk}" tidak dikenal (${MASUK.join(', ')})`) }
    else if (masukAuto && tokoh) { sc.masuk = sc.posisi === 'kanan' ? 'kanan' : 'kiri'; if (lari) sc.lari = true }

    // --- objek
    sc.objek = []
    if (tg.objek != null) for (const x of String(tg.objek).split(',').map(norm).filter(Boolean)) {
      if (NONE.has(x)) continue
      OBJEK.includes(x) ? sc.objek.push(x) : warn(`objek "${x}" tidak dikenal (${OBJEK.join(', ')})`)
    } else if (auto) {
      for (const [k, re] of KW_OBJEK) if (re.test(txt) && OBJEK.includes(k) && sc.objek.length < 2) sc.objek.push(k)
      for (const o of OBJEK) if (!OBJEK_BAWAAN.includes(o) && o !== 'hujan' && new RegExp('\\b' + o + '\\b').test(txt) && sc.objek.length < 3) sc.objek.push(o)
    }

    sc.efek = []
    if (tg.efek != null) for (const x of String(tg.efek).split(',').map(norm).filter(Boolean)) {
      if (NONE.has(x)) continue
      EFEK.includes(x) ? sc.efek.push(x) : warn(`efek "${x}" tidak dikenal (${EFEK.join(', ')})`)
    }

    // --- suasana warna
    sc.suasana = null
    if (tg.suasana != null) { const v = norm(tg.suasana); NONE.has(v) || v === 'normal' ? 0 : SUASANA.includes(v) ? (sc.suasana = v) : warn(`suasana "${tg.suasana}" tidak dikenal (${SUASANA.join(', ')})`) }
    else if (auto) sc.suasana = firstMatch(KW_SUASANA, txt)

    // --- kamera
    sc.kamera = KAMERA_DEFAULT[scenes.length % KAMERA_DEFAULT.length]
    if (tg.kamera != null) { const v = norm(tg.kamera); KAMERA.includes(v) ? (sc.kamera = v) : warn(`kamera "${tg.kamera}" tidak dikenal (${KAMERA.join(', ')})`) }
    else if (auto && tokoh && (tokoh.ekspresi === 'kaget' || tokoh.ekspresi === 'takut') && !(prev && prev.kamera === 'zoom-in')) sc.kamera = 'zoom-in'

    sc.jeda = 0
    if (tg.jeda != null) { const v = parseFloat(String(tg.jeda).replace(',', '.')); isNaN(v) ? warn(`jeda "${tg.jeda}" harus angka detik`) : (sc.jeda = Math.min(10, Math.max(0, v))) }
    sc.poll = tg.poll != null ? parsePoll(tg.poll, warn) : null
    sc.cta = tg.cta != null ? String(tg.cta).toUpperCase() : ''

    // latar yang sudah pernah dipakai di adegan sebelumnya mendapat nuansa warna berbeda
    sc.varian = auto ? hist.filter(h => h.latar === sc.latar).length : 0

    const known = ['latar', 'tokoh', 'posisi', 'ukuran', 'hadap', 'masuk', 'objek', 'efek', 'kamera', 'jeda', 'poll', 'cta', 'suasana', 'baju']
    for (const k of Object.keys(tg)) if (!known.includes(k)) warn(`kunci tag "${k}" tidak dikenal (${known.join(', ')})`)
    if (!text && !sc.poll && !sc.cta && !sc.jeda) warn('adegan tanpa teks, akan tampil singkat tanpa suara')

    carry = { latar: sc.latar, tokoh: ex.tokoh || tg.tokoh != null ? sc.tokoh : carry.tokoh, posisi: ex.posisi ? sc.posisi : carry.posisi, baju: sc.baju }
    hist.push(sc)
    scenes.push(sc)
    cur = null
  }

  // buang karakter tak terlihat (zero-width space, BOM, dll.) yang sering ikut tersalin dari chat/AI
  // dan membuat baris "[latar: ...]" tidak dikenali sebagai tag
  const clean = String(raw || '').replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, '').replace(/\u00A0/g, ' ')
  for (const line0 of clean.replace(/\r/g, '').split('\n')) {
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
