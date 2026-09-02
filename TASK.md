# Take-Home Test — Backend Engineer

Selamat datang! Repo ini adalah aplikasi autentikasi fullstack sederhana
(React + Vite di frontend, Express + SQLite di backend, monorepo npm workspaces).
Frontend dan alur auth dasar (register, login, JWT, `/me`) **sudah tersedia dan
berfungsi**.

Tugas Anda ada di **sisi backend**. Kerjakan task di bawah ini. Fokus penilaian
kami: kualitas kode, keamanan, penanganan error, dan pengujian — bukan sekadar
"jalan".

---

## Aturan main

- Waktu pengerjaan: **±4–6 jam**. Tidak perlu menyelesaikan semuanya; kerjakan
  sebanyak yang Anda bisa dengan rapi.
- Buat branch baru dan kerjakan di sana. Commit secara bertahap dengan pesan
  yang jelas (kami membaca riwayat commit Anda).
- Silakan tambah dependency bila perlu, tapi jelaskan alasannya di PR/README.
- Tulis catatan singkat di `SOLUTION.md`: keputusan desain, trade-off, dan
  apa yang belum sempat dikerjakan.

---

## Cara menjalankan

```bash
npm install
cp packages/backend/.env.example packages/backend/.env   # isi JWT_SECRET
npm run dev        # backend :4000, frontend :5173
```

Endpoint yang sudah ada: `GET /api/health`, `POST /api/auth/register`,
`POST /api/auth/login`, `GET /api/auth/me`.

---

## Bagian A — Wajib

### A1. Logout & invalidasi token

Saat ini logout hanya menghapus token di sisi klien; token yang bocor tetap
valid sampai kedaluwarsa.

- Buat endpoint `POST /api/auth/logout` (terproteksi).
- Terapkan mekanisme agar token yang sudah logout **tidak bisa dipakai lagi**
  (mis. tabel denylist / blacklist token, atau pendekatan lain yang Anda pilih).
- `GET /api/auth/me` harus menolak token yang sudah di-logout dengan `401`.

### A2. Ubah password

- Buat endpoint `PATCH /api/auth/password` (terproteksi).
- Body: `{ "currentPassword": "...", "newPassword": "..." }`.
- Validasi `currentPassword` benar sebelum mengganti; kembalikan `400/401`
  sesuai kasus. Hash password baru sebelum disimpan.

### A3. Rate limiting pada endpoint auth

- Batasi percobaan pada `POST /api/auth/login` (mis. maksimal 5 percobaan gagal
  per IP dalam 15 menit) untuk mencegah brute force.
- Kembalikan `429 Too Many Requests` dengan pesan yang jelas ketika limit
  terlampaui.

### A4. Pengujian otomatis

- Tambahkan test suite untuk endpoint auth (disarankan **Vitest + Supertest**).
- Minimal cakup: register (sukses, email duplikat, input invalid),
  login (sukses, password salah), `/me` (token valid, tanpa token, token
  invalid), serta task yang Anda kerjakan di atas.
- Tambahkan script `npm test` di workspace backend.

---

## Bagian B — Pilih minimal 1

### B1. Refresh token

- Terbitkan pasangan **access token** (umur pendek, mis. 15 menit) dan
  **refresh token** (umur panjang).
- Buat endpoint `POST /api/auth/refresh` untuk menukar refresh token dengan
  access token baru. Pertimbangkan rotasi refresh token.

### B2. Verifikasi email

- Saat register, buat token verifikasi dan endpoint
  `GET /api/auth/verify?token=...`.
- Tandai kolom `email_verified` pada user. Tidak perlu kirim email sungguhan —
  cukup kembalikan/log token-nya (jelaskan di `SOLUTION.md`).

### B3. Struktur error & logging

- Buat format response error yang konsisten di seluruh API
  (mis. `{ error: { code, message } }`).
- Tambahkan request logging (mis. `morgan` / logger pilihan Anda) dan pastikan
  data sensitif (password, token) **tidak pernah** ikut ter-log.

---

## Bagian C — Bonus (opsional)

- Migrasi database yang terversioning (bukan sekadar `CREATE TABLE IF NOT EXISTS`).
- Dockerfile + `docker-compose` untuk menjalankan backend.
- Dokumentasi API dengan OpenAPI/Swagger.
- CI sederhana (GitHub Actions) yang menjalankan lint + test.

---

## Kriteria penilaian

| Aspek                        | Bobot |
| ---------------------------- | ----- |
| Kebenaran & kelengkapan      | 30%   |
| Keamanan (hashing, token, validasi, kebocoran data) | 25% |
| Kualitas & kerapian kode     | 20%   |
| Pengujian                    | 15%   |
| Dokumentasi & komunikasi (commit, SOLUTION.md) | 10% |

---

## Pengumpulan

1. Push branch Anda dan buka Pull Request ke repo ini (atau kirim tautan repo
   fork Anda).
2. Pastikan `SOLUTION.md` sudah terisi.
3. Pastikan `npm install` lalu `npm test` berjalan tanpa langkah manual tambahan.

Selamat mengerjakan! 🚀
