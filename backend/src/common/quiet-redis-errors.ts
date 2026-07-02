import { Logger } from '@nestjs/common';

/**
 * Redam log error koneksi Redis dari BullMQ. Queue/Worker BullMQ men-console.error
 * setiap event 'error' yang tidak punya listener lain (lihat queue-base.js di
 * package bullmq) -- tanpa ini, setiap percobaan reconnect yang gagal (mis. Redis
 * belum dijalankan) mencetak satu baris ECONNREFUSED. Listener ini melampirkan
 * handler 'error' agar bullmq tidak jatuh ke fallback console.error-nya, lalu
 * hanya mencatat peringatan sekali di kegagalan pertama; sisanya didiamkan dan
 * retry tetap berjalan di background.
 */
export function quietRedisErrors(
  source: { on(event: 'error', listener: (err: Error) => void): unknown },
  logger: Logger,
  label: string,
): void {
  let warned = false;
  source.on('error', (err: Error) => {
    if (warned) {
      return;
    }
    warned = true;
    logger.warn(
      `${label}: Redis tidak terhubung (${err.message}). Percobaan ulang akan terus dicoba diam-diam di background.`,
    );
  });
}
