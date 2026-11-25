// Daftar paket adegan buatan sendiri. Tambah paket baru: import lalu masukkan ke array.
import gudang from './gudang.js'
import kota from './kota.js'

const packs = [gudang, kota]

export const custom = { latar: {}, objek: {} }
for (const p of packs) { Object.assign(custom.latar, p.latar || {}); Object.assign(custom.objek, p.objek || {}) }
