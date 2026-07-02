/**
 * Mengubah string durasi gaya JWT ("15m", "7d", "30s", "12h") menjadi
 * milidetik, dipakai untuk maxAge cookie agar selaras dengan masa berlaku token.
 */
export function parseDurationMs(value: string): number {
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(value.trim());
  if (!match) {
    throw new Error(`Format durasi tidak valid: "${value}"`);
  }

  const amount = Number(match[1]);
  const unitMs: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return amount * unitMs[match[2]];
}
