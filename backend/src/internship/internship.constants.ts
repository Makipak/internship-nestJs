import { join } from 'node:path';

/** Nama queue BullMQ untuk ekstraksi teks resume (consumer dibuat di modul resume-extraction). */
export const RESUME_QUEUE = 'resume-extraction';

/** Nama job ekstraksi resume. */
export const RESUME_EXTRACT_JOB = 'extract';

/** Jumlah item per halaman, sama dengan paginate(10) Laravel lama. */
export const PER_PAGE = 10;

/** Field yang boleh dipakai untuk sorting (mirror $allowedSortFields Laravel). */
export const ALLOWED_SORT_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'created_at',
] as const;

export const DEFAULT_SORT_BY = 'first_name';
export const DEFAULT_SORT_DIR = 'asc';

/** Batas ukuran resume: 5MB (Laravel max:5120 KB). */
export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

/**
 * Root penyimpanan file. Mengikuti layout Laravel (storage/app/public) sehingga
 * nilai resume_path tetap berbentuk "resumes/<file>.pdf" seperti data lama.
 */
export const STORAGE_ROOT =
  process.env.UPLOAD_DIR ?? join(process.cwd(), 'storage', 'app', 'public');

/** Subfolder tempat resume disimpan, relatif terhadap STORAGE_ROOT. */
export const RESUME_SUBDIR = 'resumes';
