# Panduan dari nol sampai berhasil (lewat HP)

Kerjakan berurutan. Jangan lanjut ke tahap berikutnya sebelum tahap sebelumnya berhasil.
Jangan pernah menempel token (bot, GitHub) ke chat atau tempat umum.

## Tahap 1. Buat bot Telegram
1. Buka Telegram, cari **@BotFather**, ketuk Start.
2. Kirim `/newbot`. Isi nama bot (bebas), lalu username yang berakhiran `bot` (misal `studioserial_saya_bot`).
3. BotFather membalas **token** (seperti `123456:ABC...`). Salin dan simpan di catatan pribadi.
4. Buka bot Anda (ketuk tautan dari BotFather), ketuk **Start**, lalu kirim satu pesan apa saja ("halo"). Ini wajib supaya Chat ID bisa dideteksi nanti.

Berhasil jika: Anda punya token dan sudah mengirim "halo" ke bot Anda.

## Tahap 2. Buat repositori GitHub
1. Buka github.com di browser HP, masuk ke akun Anda (daftar dulu jika belum punya).
2. Ketuk **+** (kanan atas), **New repository**.
3. Nama: `studio-serial`. Pilih **Public** (GitHub Pages gratis hanya untuk repo publik). **Jangan** centang Add a README. Ketuk **Create repository**.

Berhasil jika: halaman repo kosong terbuka dengan petunjuk "Quick setup".

## Tahap 3. Buat token GitHub
1. GitHub, foto profil, **Settings**, paling bawah **Developer settings**, **Personal access tokens**, **Fine-grained tokens**, **Generate new token**.
2. Nama: `studio-serial`. Expiration: 90 days (atau lebih).
3. **Repository access**: Only select repositories, pilih `studio-serial`.
4. **Permissions**, **Repository permissions**, set **Read and write** untuk: **Contents**, **Actions**, **Secrets**, **Workflows**. (Metadata otomatis Read.)
5. **Generate token**, salin (diawali `github_pat_`). Simpan di catatan pribadi. Token ini hanya tampil sekali.

## Tahap 4. Unggah kode lewat Termux
Unduh `serial-bot.zip` dari chat ini ke HP (biasanya masuk folder Downloads). Lalu di Termux:

```
termux-setup-storage
pkg install -y git unzip
cd ~
ls ~/storage/downloads | grep serial
```
Jika `serial-bot.zip` muncul (nama bisa sedikit berbeda), lanjut:
```
cp ~/storage/downloads/serial-bot.zip ~
unzip -o serial-bot.zip
cd serial-bot
git init -b main
git config user.name "NAMA_ANDA"
git config user.email "EMAIL_ANDA"
git add .
git commit -m "awal"
git remote add origin https://github.com/USERNAME_GITHUB/studio-serial.git
git push -u origin main
```
Saat diminta **Username**: username GitHub Anda. **Password**: tempel token `github_pat_...` dari Tahap 3 (huruf tidak tampil, itu normal).

Berhasil jika: refresh halaman repo di GitHub dan file-filenya muncul (`index.html`, `bot.py`, folder `src`, dst).

## Tahap 5. Aktifkan GitHub Pages
1. Repo, **Settings**, **Pages**.
2. Source: **Deploy from a branch**. Branch: **main**, folder **/(root)**. **Save**.
3. Tunggu 1 sampai 2 menit, refresh. Muncul alamat `https://USERNAME.github.io/studio-serial/`. Itu dashboard Anda.

## Tahap 6. Isi Profil & Token di dashboard
1. Buka alamat dashboard. Karena belum diatur, Anda dibawa ke **Profil & Token**.
2. Repo: `USERNAME/studio-serial`. Token GitHub: token Tahap 3. Token bot Telegram: token Tahap 1.
3. Ketuk **Deteksi Chat ID** (ini berhasil karena Anda sudah kirim "halo").
4. Ketuk **Simpan & sinkronkan ke GitHub**.

Berhasil jika: muncul "Tersimpan dan disinkronkan". Cek: repo, Settings, Secrets and variables, Actions, ada `TG_TOKEN` dan `TG_CHAT_ID`.

## Tahap 7. Uji Buat Gambar
1. Menu **Buat Gambar**, ketuk **Isi contoh**, lalu **Pratinjau cepat** (cek tampilannya di dashboard).
2. Ketuk **Render & kirim ke Telegram**.
3. Pantau di GitHub, tab **Actions**, run "bot". Pertama kali butuh sekitar 5 sampai 10 menit (memasang dependensi).
4. Hasil: 7 file PNG masuk ke bot Telegram Anda.

Jika run **gagal (merah)**: buka run itu, ketuk langkah "Kerjakan job" atau "Pasang dependensi", salin 20 baris terakhir lognya (tanpa token), kirim ke Claude.

## Tahap 8. Uji Buat Video
1. Menu **Buat Video**. Narasi terisi otomatis dari tahap 7.
2. Pilih suara **Wanita** atau **Pria**. Kosongkan gambar (render langsung, beranimasi).
3. Ketuk **Buat video & kirim ke Telegram**. Tunggu 5 sampai 15 menit.
4. Hasil: video MP4 masuk ke Telegram.

## Tahap 9. Pakai untuk episode Anda
- Tulis narasi dengan tag (lihat menu **Panduan Tag**). Satu paragraf = satu adegan.
- Pratinjau dulu di **Buat Gambar**, lalu buat video.
- Perlu latar/objek baru untuk cerita Anda? Kirim narasi ke Claude, minta dibuatkan paket adegan (`src/art/custom/`), lalu unggah file barunya ke repo.

## Masalah umum
| Gejala | Penyebab / solusi |
|---|---|
| Deteksi Chat ID gagal | Kirim satu pesan ke bot Anda dulu, ulangi. |
| "Token GitHub ditolak" | Token salah/kedaluwarsa, atau salah salin. Buat ulang (Tahap 3). |
| "Token GitHub belum punya izin Secrets" | Tambahkan izin Secrets read/write pada token. |
| `git push` ditolak soal workflow | Token belum punya izin **Workflows**. |
| Bot tidak membalas apa pun | Cek tab Actions: apakah ada run baru setelah Anda menekan tombol. |
| Error 409 Telegram | Ada program lain yang memakai token bot yang sama. |
| Video tidak masuk, "terlalu besar" | Telegram membatasi 50 MB. Persingkat narasi. |
