# Aissential Internship Application

Aplikasi pendaftaran magang berbasis web. Migrasi dari Laravel + Inertia.js ke NestJS + React SPA.

## Tech Stack

**Backend**
- NestJS 11 + Prisma 7 (MySQL)
- JWT auth (httpOnly cookie — access token 15m, refresh token 7d)
- BullMQ + Redis untuk antrian ekstraksi teks resume
- Multer untuk upload file PDF
- pdf-parse untuk ekstraksi teks dari PDF

**Frontend**
- React 19 + TypeScript + Vite
- Tailwind CSS v4
- react-router-dom v7
- @tanstack/react-query v5

## Struktur Folder

```
internship-nestjs/
├── backend/          # NestJS API server
│   ├── prisma/       # Schema database
│   ├── src/
│   │   ├── auth/              # Login, JWT, refresh token
│   │   ├── internship/        # Submit & admin CRUD
│   │   ├── resume-extraction/ # BullMQ worker pdf-parse
│   │   ├── prisma/            # PrismaService
│   │   └── common/            # Shared utilities
│   └── storage/      # File upload resume (tidak di-commit)
└── frontend/         # React SPA
    └── src/
        ├── pages/
        ├── components/
        ├── hooks/
        └── lib/
```

## Prerequisites

- Node.js 20+
- MySQL (database: `intership`)
- Redis / Memurai (untuk antrian BullMQ)

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Generate Prisma client:

```bash
npx prisma generate
```

### 2. Frontend

```bash
cd frontend
npm install
```

## Menjalankan (Development)

```bash
# Terminal 1 — backend
cd backend
npm run start:dev

# Terminal 2 — frontend
cd frontend
npm run dev
```

Frontend tersedia di `http://localhost:5173`, backend di `http://localhost:3000`.