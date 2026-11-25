# Studio Serial

Bot pembuat video animasi serial untuk YouTube (Shorts 1080x1920), dirender dengan **Remotion**. Berjalan penuh di GitHub Actions tanpa server, dengan pola yang sama seperti Auto-uploader: Telegram sebagai kotak masuk dan tempat hasil, `data/jobs.json` sebagai database, `index.html` (GitHub Pages) sebagai dashboard.

Tidak ada upload otomatis. Hasil akhir hanya dikirim ke Telegram.

## Alur

1. **Buat Gambar**: tempel narasi (bertag) di dashboard. Bot memecahnya menjadi adegan, merender satu gambar PNG per adegan, lalu mengirim semuanya ke Telegram sebagai dokumen (ukuran asli, tidak dikompres).
2. Unduh gambar-gambar itu dari Telegram.
3. **Buat Video**: tempel narasi yang sama dan pilih suara **wanita** (`id-ID-GadisNeural`) atau **pria** (`id-ID-ArdiNeural`). Bot membuat suara, memasang judul, HUD, subtitle, poll, dan transisi, lalu mengirim MP4 ke Telegram.
   - **Tanpa gambar unggahan** (disarankan): adegan dirender langsung dan beranimasi. Tokoh bernapas dan berkedip, uap naik, lampu berkedip, tokoh bisa berjalan masuk (`masuk: kiri`), adegan bisa menyala bertahap (`efek: menyala`), dan kamera bergerak berlapis (latar dan tokoh bergeser berbeda).
   - **Dengan gambar unggahan**: gambar dari Telegram (atau gambar buatan Anda sendiri) dipakai apa adanya dengan gerak kamera sederhana. Jumlahnya harus sama dengan jumlah adegan.

Judul, jam, subtitle, dan poll selalu dipasang saat video dirender, supaya tetap diam di tempatnya ketika adegan bergerak.

## Setup

1. Buat repo baru, unggah seluruh isi folder ini, aktifkan **GitHub Pages** (Settings, Pages, branch `main`, folder root).
2. Buat bot lewat @BotFather. Buat token GitHub fine-grained untuk repo ini dengan izin **Contents**, **Actions**, **Secrets** (read/write).
3. Buka dashboard, menu **Profil & Token**, isi repo, token GitHub, token bot, lalu ketuk **Deteksi Chat ID** (kirim satu pesan ke bot dulu). Tekan **Simpan & sinkronkan**. Secret `TG_TOKEN` dan `TG_CHAT_ID` dibuat otomatis.
4. Opsional: taruh musik latar bebas hak cipta di folder `music/`.
5. Disarankan: jalankan `npm install` sekali di komputer Anda dan commit `package-lock.json`, supaya versi Remotion terkunci. Semua paket `remotion` dan `@remotion/*` harus berversi sama.

## Format narasi

Satu paragraf = satu adegan. Tag opsional di baris sendiri sebelum teks:

```
@judul: KONON, RUMAH NO. 13 | TIDAK PERNAH KOSONG
@hari: HARI 7
@jam: 23.49
@part: PART 2

[latar: pintu; tokoh: menunjuk/biasa]
Kamu melangkah masuk.

[latar: tangga; tokoh: menunjuk/takut; objek: bayangan; poll: Naik=52 | Keluar=48; cta: komen 1 atau 2]
Kamu pilih apa?
```

Panduan langkah demi langkah dari nol ada di **PANDUAN.md**. Daftar lengkap tag ada di menu **Panduan Tag** dan di `src/art/catalog.js`. Yang tersedia: 24 latar (rumah, jalan, persimpangan, halte, lift, kantor, kamar mandi, kelas, rumah sakit, atap, minimarket, dst.), 9 pose, 6 ekspresi, 8 objek, 9 suasana warna, 9 warna baju.

**Variasi otomatis.** Tag yang tidak ditulis tidak lagi menyalin adegan sebelumnya: latar, ekspresi, pose, objek, dan suasana disimpulkan dari isi teks, posisi/ukuran/kamera bergantian, dan latar yang dipakai berulang diberi nuansa warna berbeda. Matikan dengan header `@variasi: tidak`. Tag yang salah ditulis tidak membuat bot gagal; dashboard menampilkan peringatan dan **Pratinjau cepat** memperlihatkan hasilnya langsung di browser.

## Paket adegan buatan sendiri

Semua gambar adalah SVG yang dihasilkan fungsi JavaScript murni di `src/art/`. Untuk cerita baru, buat paket di `src/art/custom/` (contoh lengkap: `gudang.js`), lalu daftarkan di `custom/index.js`. Latar dan objek di paket otomatis muncul di tag, Panduan Tag, dan pratinjau. Coba hasilnya lokal tanpa Remotion:

```
npm test                      # tes parser
node test/preview.mjs out     # perlu Playwright; render semua latar dan contoh adegan ke PNG
node test/frames.mjs out      # perlu Playwright + ffmpeg; video uji tanpa suara (animasi, kamera)
```

## Catatan penting

- Video dan gambar dikirim lewat bot Telegram: batas unggah 50 MB, batas unduh bot 20 MB per gambar. Bot mengecilkan video ke 720p otomatis bila lebih dari 49 MB.
- Suara memakai edge-tts (layanan suara Microsoft). Kalau gagal tiga kali, job ditandai Gagal dan pesan error dikirim ke Telegram.
- Jika Anda mengunggah gambar di Buat Video, jumlahnya harus sama dengan jumlah adegan. Tanpa gambar, tidak ada syarat ini.
- Waktu render 1 sampai 10 menit tergantung panjang video. Setiap job memulai runner baru, jadi menit pertama dipakai memasang dependensi.
- Hanya satu token bot per bot. Jangan jalankan program lain yang memakai token yang sama.

## File

| File | Fungsi |
|---|---|
| `bot.py` | pengatur job, suara, timeline, kirim ke Telegram |
| `render/*.mjs` | skrip Node: `plan` (parse), `stills` (gambar), `video` (MP4) |
| `src/lib/parse.js` | parser narasi bertag (dipakai bot dan dashboard) |
| `src/art/` | tokoh, latar, overlay (SVG murni); `custom/` untuk paket sendiri |
| `src/*.jsx` | komposisi Remotion (`SceneArt`, `Video`) |
| `index.html` | dashboard |
| `data/jobs.json` | antrean dan riwayat job |
