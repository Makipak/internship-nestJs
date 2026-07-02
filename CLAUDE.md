# CLAUDE.md

# Migration Context

Migrasi backend dari Laravel + Inertia.js ke NestJS + React SPA.
Project masih tahap *development*, belum production — strategi migrasi: big bang
(bukan strangler/bertahap), karena tidak ada user/data production yang harus dijaga live.

Referensi kode lama (READ-ONLY, jangan diedit): D:\projek\interhsip-application

## Database

MySQL. Database name: `intership` (perhatikan: tanpa huruf "n" kedua — ini nama asli,
bukan typo yang perlu diperbaiki).

Kredensial:
- Host: 127.0.0.1
- Port: 3306
- Database: intership
- User: root
- Password: (kosong)

Provider di `schema.prisma` HARUS `mysql`. Koneksi ke database yang SUDAH ADA
(dipakai Laravel lama) — jangan buat database baru.

Tabel yang ADA di database tapi BUKAN bagian dari domain aplikasi (infrastruktur
khusus Laravel — session driver, cache driver, queue driver, migration tracker):
- sessions
- cache, cache_locks
- jobs, job_batches, failed_jobs
- password_reset_tokens
- migrations

Tabel-tabel ini TIDAK perlu di-manage Prisma. Setelah `prisma db pull`, hapus
model-model ini dari schema.prisma. Sisakan hanya:
- User
- InternshipApplication

## Stack Baru

**Backend:**
- NestJS
- Prisma ORM (provider: mysql)
- Auth: JWT (access token 15 menit + refresh token 7 hari, keduanya httpOnly cookie)
- Upload: Multer
- Queue: BullMQ + Redis (pengganti Laravel Queue database driver)
- PDF parsing: pdf-parse (pengganti smalot/pdfparser)
- Validation: class-validator + class-transformer (pengganti Laravel FormRequest)

**Frontend:**
- React 19 + TypeScript + Vite (tetap)
- Tailwind CSS v4 + shadcn/ui (tetap)
- react-router-dom (pengganti routing Inertia)
- @tanstack/react-query (pengganti manual fetch() + useState loading di dashboard.tsx)
- Native React 19 `<title>` (pengganti @inertiajs/react Head, tidak perlu react-helmet-async)

## Struktur Folder

```
internship-nestjs/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── internship/
│   │   └── resume-extraction/
│   └── prisma/
│       └── schema.prisma
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/   <- copy dari resources/js/components/ Laravel lama
│       ├── hooks/         <- copy dari resources/js/hooks/ Laravel lama
│       └── lib/           <- copy dari resources/js/lib/ Laravel lama
└── CLAUDE.md
```

## Aturan Migrasi

1. Setiap endpoint di `routes/web.php` (Laravel lama) harus punya equivalent
   NestJS controller.
2. Response JSON shape HARUS sama persis (field names, struktur pagination
   `{ data, meta: { current_page, last_page, per_page, total }, sort }`)
   supaya komponen frontend yang sudah pakai fetch() manual (dashboard.tsx,
   ApplicationsTable.tsx, dll) tidak perlu diubah logic fetching-nya.
3. DTO validation di NestJS harus mirroring rules yang ada di FormRequest
   Laravel lama (lihat StoreInternshipApplicationRequest.php).
4. Saat porting export CSV: JANGAN copy bug dari versi Laravel-nya yang cuma
   pakai addslashes() — itu rawan CSV/formula injection. Versi baru WAJIB:
   - Wrap semua field dengan double quote standar CSV
   - Escape field yang diawali karakter =, +, -, @ dengan prefix single quote
5. Endpoint admin (semua kecuali POST /apply) WAJIB di-protect JwtAuthGuard.
6. JANGAN edit apapun di D:\projek\interhsip-application — itu read-only
   reference untuk porting logic, bukan project aktif.
7. untuk setiap kode diberikan documentasi singkat namun jelas tanpa emoji 
8. kode harus terbaru 2026 yang tidak depcreated

## Mapping Modul Laravel → NestJS

| Laravel | NestJS |
|---|---|
| Eloquent | Prisma |
| Fortify session | @nestjs/passport + passport-jwt |
| FormRequest | DTO + class-validator |
| Queue (database driver) | BullMQ + Redis |
| smalot/pdfparser | pdf-parse |
| Storage facade | Multer + static serve controller |
| auth middleware | @UseGuards(JwtAuthGuard) |
| Inertia::render() | React Router route component |
| @inertiajs/react useForm | useState manual + fetch() |

