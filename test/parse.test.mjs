import assert from 'node:assert/strict'
import fs from 'node:fs'
import { parseNarasi } from '../src/lib/parse.js'

const r = parseNarasi(fs.readFileSync(new URL('./contoh.txt', import.meta.url), 'utf8'))
assert.equal(r.scenes.length, 7)
assert.deepEqual(r.header.titleLines, ['KONON, RUMAH NO. 13', 'TIDAK PERNAH KOSONG'])
assert.equal(r.scenes[0].latar, 'pintu'); assert.equal(r.scenes[0].masuk, 'kiri'); assert.deepEqual(r.scenes[3].efek, ['gelap', 'menyala'])
assert.deepEqual(r.scenes[0].tokoh, { pose: 'berdiri', ekspresi: 'biasa' })
assert.equal(r.scenes[1].latar, 'ruang-tamu'); assert.equal(r.scenes[1].kamera, 'zoom-in')
assert.deepEqual(r.scenes[1].tokoh, { pose: 'berdiri', ekspresi: 'biasa' }, 'tokoh diwarisi')
assert.equal(r.scenes[2].tokoh, null)
assert.equal(r.scenes[3].tokoh, null, 'tanpa tokoh diwarisi')
assert.equal(r.scenes[4].ukuran, 'dekat'); assert.equal(r.scenes[4].tokoh.ekspresi, 'kaget')
assert.deepEqual(r.scenes[5].objek, ['bayangan'])
assert.equal(r.scenes[6].poll.length, 2); assert.equal(r.scenes[6].poll[0].pct, 52); assert.equal(r.scenes[6].cta, 'KOMEN 1 ATAU 2')
assert.equal(r.scenes[0].text, 'Kamu melangkah masuk.')
console.log('peringatan contoh:', r.warnings)

// tanpa tag: tiap paragraf satu adegan, teks multi-baris digabung
const p = parseNarasi('Satu.\nDua.\n\nTiga.')
assert.equal(p.scenes.length, 2); assert.equal(p.scenes[0].text, 'Satu. Dua.')
// tag salah menghasilkan peringatan, bukan crash
const w = parseNarasi('[latar: surga; tokoh: gajah; foo: 1; poll: A]\nHalo')
assert.ok(w.warnings.length >= 4, w.warnings.join('|')); assert.equal(w.scenes[0].latar, 'ruang-tamu')
// tag + teks sebaris, komentar, header salah
const q = parseNarasi('# komentar\n@aneh: x\n[latar: dapur] Teks sebaris')
assert.equal(q.scenes[0].text, 'Teks sebaris'); assert.equal(q.scenes[0].latar, 'dapur'); assert.equal(q.warnings.length, 1)
assert.equal(parseNarasi('').warnings.length, 1)
// karakter tak terlihat (zero-width space) di depan tag tidak boleh membuat tag bocor ke teks
const z = parseNarasi('\u200B[latar: jalan; tokoh: berdiri/biasa]\nHalo dunia')
assert.equal(z.scenes[0].text, 'Halo dunia'); assert.equal(z.scenes[0].latar, 'jalan')
console.log('semua tes parser lulus')
