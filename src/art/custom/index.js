// Daftar paket adegan buatan sendiri. Tambah paket baru: import lalu masukkan ke array.
import gudang from './gudang.js'

const packs = [gudang]

export const custom = { latar: {}, objek: {} }
for (const p of packs) { Object.assign(custom.latar, p.latar || {}); Object.assign(custom.objek, p.objek || {}) }
