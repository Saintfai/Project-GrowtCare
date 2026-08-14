# PRODUCT REQUIREMENTS DOCUMENT
# Growth Chart Simulator

*Simulasi Grafik Pertumbuhan Anak Berbasis Standar Antropometri Kemenkes (PMK No. 2 Tahun 2020)*

| Item | Detail |
|---|---|
| Versi Dokumen | 1.0 |
| Tanggal | 13 Agustus 2026 |
| Penulis | Fairuz Sheva Muhammad (Pairus) |
| Status | Draft |
| Tipe Proyek | Aplikasi web edukasi/simulasi (standalone, bukan bagian dari sistem RS produksi) |

---

## 1. Ringkasan Produk

Growth Chart Simulator adalah aplikasi web sederhana yang mensimulasikan cara kerja grafik pertumbuhan anak (BB/U, TB-PB/U, BB/TB-PB, IMT/U) sesuai Standar Antropometri Anak Kemenkes (PMK No. 2 Tahun 2020). Pengguna dapat memasukkan data pengukuran seorang anak (tanggal lahir, jenis kelamin, riwayat pengukuran berat/tinggi) dan aplikasi akan memplot titik-titik pengukuran tersebut di atas kurva referensi standar, menghitung Z-score, serta menampilkan kategori status gizi sesuai ambang batas resmi.

Aplikasi ini bersifat edukatif dan eksploratif ("simulator") — cocok untuk mendemonstrasikan cara pembacaan grafik pertumbuhan kepada mahasiswa, sebagai proof-of-concept sebelum diintegrasikan ke sistem yang lebih besar (mis. modul anthropometric growth chart RS), atau sebagai alat bantu belajar mandiri.

### 1.1 Latar Belakang

Pembacaan grafik pertumbuhan anak (growth chart) adalah keterampilan klinis penting bagi tenaga kesehatan, tetapi kurva referensi dan perhitungan Z-score seringkali abstrak jika hanya dipelajari dari tabel angka. Aplikasi simulasi ini membantu memvisualisasikan bagaimana satu titik pengukuran (atau serangkaian pengukuran dari waktu ke waktu) diposisikan relatif terhadap kurva persentil/Z-score standar, sehingga proses interpretasi menjadi lebih intuitif.

### 1.2 Tujuan

- Menyediakan alat visualisasi interaktif untuk memplot data antropometri satu anak pada kurva referensi Kemenkes.
- Menghitung Z-score secara otomatis menggunakan metode LMS dari data yang dimasukkan pengguna.
- Menampilkan kategori status gizi sesuai ambang batas resmi PMK No. 2 Tahun 2020.
- Memberikan pengalaman yang sangat sederhana — tanpa login, tanpa database kompleks, tanpa alur multi-role.

### 1.3 Non-Tujuan (Out of Scope)

- Bukan sistem rekam medis / SIMRS — tidak menyimpan data pasien sungguhan secara permanen di server.
- Tidak menangani multi-pasien dalam satu akun, multi-role (dokter/perawat/admin), atau autentikasi.
- Tidak dimaksudkan untuk pengambilan keputusan klinis nyata — hanya simulasi/edukasi.
- Tidak mencakup indikator LiLA/U dan lingkar kepala pada versi awal (dapat ditambahkan di iterasi berikutnya).

---

## 2. Target Pengguna

| Persona | Kebutuhan |
|---|---|
| Mahasiswa kesehatan/gizi/kedokteran | Belajar cara membaca grafik pertumbuhan & memahami perhitungan Z-score secara visual |
| Pengembang (Pairus) | Proof-of-concept & validasi logika perhitungan sebelum diimplementasikan ke sistem RS yang lebih besar |
| Tenaga kesehatan (perawat/bidan/ahli gizi) | Simulasi cepat tanpa perlu membuka sistem RS penuh, mis. untuk pelatihan/demo |

---

## 3. Alur Pengguna (User Flow)

1. Pengguna membuka aplikasi — langsung disambut form input tanpa login.
2. Pengguna mengisi data dasar anak: jenis kelamin (Laki-laki/Perempuan) dan tanggal lahir.
3. Pengguna memilih indikator grafik yang ingin disimulasikan: BB/U, TB-PB/U, BB/TB-PB, atau IMT/U.
4. Pengguna menambahkan satu atau beberapa titik pengukuran (tanggal ukur + nilai berat/tinggi), bisa menambah baris pengukuran secara dinamis (mis. simulasi kunjungan bulan 1, 2, 3, dst).
5. Aplikasi otomatis: menghitung usia anak pada setiap tanggal ukur, menghitung Z-score tiap titik, menentukan kategori status gizi, dan memplot titik pada grafik kurva referensi (garis median, ±1SD, ±2SD, ±3SD).
6. Pengguna dapat melihat ringkasan hasil (tabel Z-score & kategori) di samping/bawah grafik, serta mengubah data untuk melihat perubahan hasil secara real-time.
7. (Opsional) Pengguna dapat mereset form atau memuat beberapa skenario contoh ("contoh anak normal", "contoh anak stunting", dll.) untuk keperluan demo cepat.

---

## 4. Kebutuhan Fungsional

Prioritas mengikuti MoSCoW — **Must**: wajib ada di rilis pertama. **Should**: penting, ditambahkan bila waktu memungkinkan. **Could**: nice-to-have untuk iterasi berikutnya.

### 4.1 Input Data Anak

| ID | Requirement | Prioritas |
|---|---|---|
| F-01 | Form input jenis kelamin (Laki-laki / Perempuan) — wajib, menentukan tabel referensi LMS yang dipakai | Must |
| F-02 | Form input tanggal lahir anak — wajib, dipakai menghitung usia saat pengukuran | Must |
| F-03 | Nama anak — opsional, hanya label tampilan (tidak disimpan permanen) | Should |

### 4.2 Input Data Pengukuran

| ID | Requirement | Prioritas |
|---|---|---|
| F-04 | Tambah baris pengukuran: tanggal ukur, berat badan (kg), panjang/tinggi badan (cm) | Must |
| F-05 | Validasi rentang nilai wajar (mis. BB 0.5–40 kg, PB/TB 30–150 cm) dengan pesan peringatan bila di luar rentang | Must |
| F-06 | Tambah/hapus baris pengukuran secara dinamis (minimal 1, tanpa batas atas yang ketat, disarankan maks. 20 titik untuk kejelasan grafik) | Must |
| F-07 | Deteksi otomatis metode ukur (panjang telentang vs tinggi berdiri) berdasarkan usia (<24 bulan = PB, ≥24 bulan = TB), dengan opsi override manual | Should |

### 4.3 Pemilihan & Tampilan Grafik

| ID | Requirement | Prioritas |
|---|---|---|
| F-08 | Pilihan tab/dropdown indikator: BB/U, PB-TB/U, BB/PB-TB, IMT/U | Must |
| F-09 | Render kurva referensi (garis median dan Z-score ±1, ±2, ±3) sesuai indikator & jenis kelamin terpilih | Must |
| F-10 | Plot titik pengukuran anak di atas kurva, dihubungkan garis tren bila lebih dari 1 titik | Must |
| F-11 | Interaksi hover/tap pada titik menampilkan detail: tanggal, usia, nilai, Z-score, kategori | Should |
| F-12 | Pewarnaan zona kategori pada grafik (mis. area merah untuk <-2SD, kuning, hijau) agar mudah dibaca awam | Should |
| F-13 | Grafik responsif — dapat digunakan di layar desktop maupun mobile/tablet | Must |

### 4.4 Perhitungan & Hasil

| ID | Requirement | Prioritas |
|---|---|---|
| F-14 | Hitung Z-score menggunakan rumus LMS (Lambda-Mu-Sigma) berdasarkan tabel referensi Kemenkes per indikator/usia/jenis kelamin | Must |
| F-15 | Tentukan kategori status gizi otomatis berdasarkan ambang batas resmi PMK No. 2/2020 per indikator | Must |
| F-16 | Tabel ringkasan hasil per titik pengukuran: usia, nilai ukur, Z-score, kategori | Must |
| F-17 | Interpolasi linear untuk usia yang jatuh di antara titik referensi (tabel LMS biasanya per bulan penuh) | Must |

### 4.5 Fitur Pendukung

| ID | Requirement | Prioritas |
|---|---|---|
| F-18 | Tombol "Reset" untuk mengosongkan seluruh form | Should |
| F-19 | Beberapa skenario contoh siap pakai (dropdown "Muat Contoh") untuk demo cepat tanpa input manual | Could |
| F-20 | Ekspor grafik sebagai gambar (PNG) untuk keperluan presentasi/laporan | Could |
| F-21 | Toggle satuan tampilan usia (bulan vs tahun-bulan) | Could |

---

## 5. Kebutuhan Data

### 5.1 Tabel Referensi LMS

Aplikasi membutuhkan tabel referensi Lambda-Mu-Sigma (L, M, S per titik usia) untuk setiap kombinasi indikator × jenis kelamin, bersumber dari lampiran resmi PMK No. 2 Tahun 2020 (yang mengadopsi WHO Child Growth Standards 2006 & Growth Reference 2007):

- BB/U — Laki-laki & Perempuan, 0–60 bulan
- PB-TB/U — Laki-laki & Perempuan, 0–60 bulan
- BB/PB-TB — Laki-laki & Perempuan, per panjang/tinggi 45–110 cm (bukan per usia)
- IMT/U — Laki-laki & Perempuan, 0–60 bulan (versi awal cukup 0–60 bulan; ekstensi 5–18 tahun untuk iterasi berikutnya)

> Karena aplikasi ini "sangat simpel" dan berjalan client-side, tabel referensi disarankan disimpan sebagai file JSON statis (bukan database), di-bundle bersama aplikasi.

### 5.2 Struktur Data Input (client-side, tidak persisten)

| Field | Tipe | Keterangan |
|---|---|---|
| jenisKelamin | enum: L / P | Menentukan tabel referensi |
| tanggalLahir | date | Dasar perhitungan usia |
| namaAnak | string (opsional) | Label tampilan saja |
| pengukuran[] | array of object | Daftar titik pengukuran |
| &nbsp;&nbsp;↳ tanggalUkur | date | Dipakai hitung usia saat ukur |
| &nbsp;&nbsp;↳ beratBadan | number (kg) | Untuk BB/U, BB/TB, IMT/U |
| &nbsp;&nbsp;↳ panjangTinggi | number (cm) | Untuk TB/U, BB/TB, IMT/U |
| &nbsp;&nbsp;↳ metodeUkur | enum: telentang / berdiri | Default otomatis dari usia, bisa override |

> Catatan: karena tidak ada kebutuhan multi-user atau riwayat lintas sesi, data cukup disimpan di state aplikasi (in-memory) selama sesi berjalan. Tidak diperlukan backend/database untuk versi simulator ini.

---

## 6. Kebutuhan Teknis

### 6.1 Arsitektur

Aplikasi berupa Single Page Application (SPA) yang berjalan sepenuhnya di sisi klien (client-side only) — tanpa backend, tanpa database. Semua perhitungan Z-score dan rendering grafik dilakukan di browser.

| Komponen | Rekomendasi |
|---|---|
| Framework frontend | React (Vite) — ringan dan cepat untuk SPA sederhana |
| Library grafik | Recharts atau Chart.js — cukup untuk kurva + scatter plot |
| Styling | Tailwind CSS — mempercepat pengembangan UI simpel |
| Data referensi | File JSON statis (hasil ekstraksi tabel LMS resmi Kemenkes/WHO) |
| Hosting | Static hosting (Vercel/Netlify/GitHub Pages) — tidak butuh server |

### 6.2 Non-Functional Requirements

| Aspek | Kebutuhan |
|---|---|
| Performa | Perhitungan & render grafik harus terasa instan (<300ms) setelah input berubah |
| Kompatibilitas | Berfungsi baik di browser modern (Chrome, Firefox, Safari, Edge) versi 2 tahun terakhir |
| Responsif | Layout menyesuaikan dari layar mobile (360px) hingga desktop |
| Aksesibilitas | Kontras warna kategori cukup jelas; label grafik terbaca; form dapat dinavigasi keyboard |
| Privasi | Tidak ada data pribadi yang dikirim/disimpan ke server manapun — semua di sisi klien |
| Ukuran aplikasi | Bundle ringan; tabel referensi JSON dioptimalkan (mis. presisi desimal secukupnya) agar tidak membengkak |

---

## 7. Kebutuhan UI/UX

Karena sifatnya simulator, tata letak diusahakan satu halaman (single view), tanpa navigasi berlapis:

- Panel kiri/atas: form input (jenis kelamin, tanggal lahir, daftar pengukuran dengan tombol tambah/hapus baris).
- Panel kanan/bawah: area grafik dengan tab pemilihan indikator di atasnya.
- Di bawah grafik: tabel ringkasan hasil (usia, nilai, Z-score, kategori) dengan pewarnaan sesuai kategori.
- Desain minimal, palet warna netral untuk UI, dengan warna semantik (hijau/kuning/merah) khusus dipakai untuk indikasi kategori status gizi agar tidak membingungkan.
- Semua perubahan input langsung memperbarui grafik & tabel secara real-time, tanpa perlu tombol "submit" terpisah.

---

## 8. Metrik Keberhasilan

- Pengguna dapat menghasilkan grafik yang benar (tervalidasi terhadap kalkulator Z-score resmi/WHO Anthro) untuk minimal 5 skenario uji berbeda.
- Waktu dari buka aplikasi hingga melihat grafik pertama < 1 menit tanpa dokumentasi tambahan (UI cukup intuitif).
- Aplikasi tetap responsif meski pengguna menambahkan hingga 20 titik pengukuran sekaligus.

---

## 9. Pertanyaan Terbuka

- Apakah versi awal cukup mendukung indikator BB/U, TB-PB/U, BB/PB-TB, IMT/U saja, atau perlu langsung menyertakan LiLA/U dan Lingkar Kepala/U?
- Apakah dibutuhkan mode perbandingan dua anak sekaligus dalam satu grafik (mis. untuk kebutuhan edukasi kelas)?
- Apakah tabel referensi IMT/U untuk usia >5–18 tahun perlu dimasukkan di versi pertama, mengingat cakupan utama kasus RS biasanya balita?
- Apakah hasil simulasi perlu bisa diekspor (PNG/PDF) untuk laporan tugas kuliah/demo, atau cukup tampil di layar saja?

---

## 10. Roadmap Singkat (Opsional)

| Fase | Cakupan |
|---|---|
| Fase 1 — MVP | Input 1 anak, 4 indikator utama (BB/U, TB-PB/U, BB/PB-TB, IMT/U 0-60 bln), grafik + tabel Z-score, tanpa ekspor |
| Fase 2 | Tambah LiLA/U, ekspor PNG, skenario contoh siap pakai |
| Fase 3 | Perluasan IMT/U 5-18 tahun, mode bandingkan 2 anak, opsi override metode ukur manual |

---

*— Selesai —*