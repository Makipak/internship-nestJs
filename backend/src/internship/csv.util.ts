/**
 * Utilitas pembuatan CSV yang aman terhadap CSV injection dan formula injection.
 *
 * Versi Laravel lama hanya memakai addslashes() yang TIDAK mencegah formula
 * injection (mis. nilai "=cmd|..." yang dieksekusi spreadsheet) maupun
 * meng-escape tanda kutip ganda sesuai standar. Versi ini:
 * - Membungkus SEMUA field dengan double quote (RFC 4180).
 * - Meng-escape double quote di dalam field dengan menggandakannya ("").
 * - Memberi prefix tanda kutip tunggal pada field yang diawali = + - @
 *   agar spreadsheet memperlakukannya sebagai teks, bukan formula.
 */

/** Karakter pemicu formula injection di awal sebuah sel. */
const FORMULA_TRIGGERS = ['=', '+', '-', '@'];

/** Membersihkan dan membungkus satu sel CSV. */
export function csvCell(value: unknown): string {
  let text = value === null || value === undefined ? '' : String(value);

  // Cegah formula injection: netralkan dengan prefix kutip tunggal.
  if (text.length > 0 && FORMULA_TRIGGERS.includes(text[0])) {
    text = `'${text}`;
  }

  // Escape double quote sesuai RFC 4180, lalu bungkus dengan double quote.
  text = text.replace(/"/g, '""');
  return `"${text}"`;
}

/** Menyusun satu baris CSV dari kumpulan sel. */
export function csvRow(values: unknown[]): string {
  return values.map(csvCell).join(',');
}
