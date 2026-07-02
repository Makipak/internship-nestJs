import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AdminInternshipController } from './admin-internship.controller';
import { InternshipApplicationController } from './internship-application.controller';
import { InternshipService } from './internship.service';
import { RESUME_QUEUE } from './internship.constants';

/**
 * InternshipModule menangani fitur lamaran magang: submit publik (/apply) dan
 * pengelolaan admin (list, hapus, unduh resume, export CSV).
 *
 * Queue RESUME_QUEUE didaftarkan sebagai producer; consumer/worker-nya dibuat
 * di modul resume-extraction.
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: RESUME_QUEUE,
      defaultJobOptions: {
        // Retry beberapa kali dengan backoff eksponensial bila ekstraksi gagal
        // (mis. file belum tersinkron). Bersihkan job sukses, simpan yang gagal.
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [InternshipApplicationController, AdminInternshipController],
  providers: [InternshipService],
  exports: [InternshipService],
})
export class InternshipModule {}
