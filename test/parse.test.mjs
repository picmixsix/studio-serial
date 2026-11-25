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
// variasi otomatis: tanpa tag, adegan berurutan tidak boleh identik
const v = parseNarasi('Ia masuk ke dalam lift dan tiba-tiba lampu mati.\n\nDi halte bus kota hujan turun deras.\n\nDi kantor yang sepi ia takut, lalu menuju kamar mandi.\n\nDi rooftop senja terlihat indah.')
assert.deepEqual(v.scenes.map(x => x.latar), ['lift', 'halte', 'kantor', 'atap'], 'latar dari isi teks, tempat yang disebut paling awal menang')
assert.equal(v.scenes[0].tokoh.ekspresi, 'kaget'); assert.ok(v.scenes[1].objek.includes('hujan')); assert.equal(v.scenes[3].suasana, 'senja')
assert.equal(new Set(v.scenes.map(x => x.posisi)).size, 3, 'posisi bergantian')
// header variasi: tidak -> perilaku lama (mewarisi)
const m = parseNarasi('@variasi: tidak\nDi lift sepi.\n\nDi halte hujan.')
assert.ok(m.scenes.every(x => x.latar === 'ruang-tamu' && x.objek.length === 0 && x.posisi === 'kiri'))
// nama latar tak dikenal dipetakan lewat alias; latar generik dipertajam oleh teks
assert.equal(parseNarasi('[latar: lampu-lalu-lintas]\nHalo').scenes[0].latar, 'persimpangan')
assert.equal(parseNarasi('[latar: jalan]\nKamera merekam persimpangan sepi.').scenes[0].latar, 'persimpangan')
// latar sama berulang mendapat nuansa berbeda; baju bisa diganti dan diwarisi
const r2 = parseNarasi('[latar: kamar; baju: biru]\nSatu.\n\n[latar: kamar]\nDua.')
assert.equal(r2.scenes[0].varian, 0); assert.equal(r2.scenes[1].varian, 1); assert.equal(r2.scenes[1].baju, 'biru')
console.log('semua tes parser lulus')
