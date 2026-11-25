// Daftar nilai yang dikenali tag adegan. Dipakai parser, dashboard, dan penggambar.
import { custom } from './custom/index.js'

export const LATAR = ['ruang-tamu', 'pintu', 'meja', 'foto', 'tangga', 'lorong', 'kamar', 'dapur', 'luar', 'gelap',
  'loteng', 'hutan', 'jalan', 'bawah-tanah', ...Object.keys(custom.latar)]
export const POSE = ['berdiri', 'menunjuk', 'jalan', 'tangan-naik', 'membelakangi', 'menoleh', 'berlari', 'melambai', 'menutup-wajah']
export const EKSPRESI = ['biasa', 'kaget', 'takut', 'sedih', 'senang', 'marah']
export const OBJEK_BAWAAN = ['bayangan', 'mata', 'kabut', 'orang', 'lilin', 'kilat']
export const OBJEK = [...OBJEK_BAWAAN, ...Object.keys(custom.objek)]
export const KAMERA = ['zoom-in', 'zoom-out', 'geser-kiri', 'geser-kanan', 'naik', 'turun', 'diam']
export const EFEK = ['gelap', 'merah', 'biru', 'menyala']
export const UKURAN = ['kecil', 'sedang', 'besar', 'dekat']
export const POSISI = ['kiri', 'tengah', 'kanan']
export const HADAP = ['kiri', 'kanan']
export const MASUK = ['kiri', 'kanan']
export const SUASANA = ['normal', 'pagi', 'siang', 'senja', 'malam', 'dingin', 'hangat', 'neon', 'hijau']
export const BAJU = ['oranye', 'biru', 'hijau', 'kuning', 'ungu', 'merah', 'hitam', 'putih', 'pink']
export const HEADER_KEYS = ['judul', 'hari', 'jam', 'lokasi', 'part', 'ringkasan', 'watermark', 'nomor', 'variasi']
export const KAMERA_DEFAULT = ['zoom-in', 'geser-kiri', 'zoom-out', 'geser-kanan', 'naik', 'zoom-in', 'turun', 'geser-kiri']
