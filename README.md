# Pinjem100

Laboratorium Virtual Simulasi Kas Proyek Konstruksi.

Simulasi arus kas untuk kontraktor kecil: satu proyek, portofolio tiga job, kebijakan
ekuitas/utang, dan cadangan. Laba di laporan belum tentu ada uang di rekening.

## Ruang kerja

- **Proyek** — satu kontrak: RAB A–G, Gantt, tempo bayar, grafik, laba rugi, spreadsheet
- **Portofolio** — tiga proyek dalam satu tahun anggaran (satu pasar atau berbagai pasar)
- **Keuangan** — ekuitas, fasilitas utang, cadangan; grafik satu proyek atau portofolio

Alias lama `/akumulasi` dan `/pinjam` dialihkan ke Portofolio dan Keuangan.

Panduan ada di beranda (kanan atas: Panduan).

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:8080](http://localhost:8080).

## Skrip berguna

```bash
npm test          # unit test (engine + platform scripts)
npm run typecheck
npm run lint
```

## Catatan

Pinjem100 adalah nama laboratorium, bukan batas pinjaman.
Modul tugas lab ada di dokumen terpisah.
Untuk pengampu: halaman `/rekap` menampilkan journal browser dan, jika database
tersedia, agregat `lab_events`.
