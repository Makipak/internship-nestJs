import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PDFParse } from 'pdf-parse';
import { quietRedisErrors } from '../common/quiet-redis-errors';
import { PrismaService } from '../prisma/prisma.service';
import {
  RESUME_EXTRACT_JOB,
  RESUME_QUEUE,
  STORAGE_ROOT,
} from '../internship/internship.constants';

/** Payload job ekstraksi resume. */
interface ExtractJobData {
  applicationId: number;
}

/**
 * Worker BullMQ yang mengekstrak teks dari file PDF resume lalu menyimpannya
 * ke kolom resume_text. Pengganti job Laravel ExtractResumeText (smalot/pdfparser
 * -> pdf-parse). Dipicu otomatis oleh producer di InternshipService.create().
 */
@Processor(RESUME_QUEUE)
export class ResumeExtractionProcessor
  extends WorkerHost
  implements OnApplicationBootstrap
{
  private readonly logger = new Logger(ResumeExtractionProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    // @nestjs/bullmq mensyaratkan registerQueue() di modul ini supaya @Processor
    // bisa resolve konfigurasi koneksinya -- itu membuat Queue terpisah dari
    // milik InternshipModule, dengan koneksi Redis-nya sendiri. Diinject di sini
    // hanya supaya listener error-nya bisa diredam juga, bukan untuk add job.
    @InjectQueue(RESUME_QUEUE) private readonly queue: Queue,
  ) {
    super();
  }

  // this.worker baru tersedia setelah fase onModuleInit selesai untuk semua
  // modul, jadi listener dipasang di onApplicationBootstrap (lihat WorkerHost).
  onApplicationBootstrap(): void {
    quietRedisErrors(this.worker, this.logger, 'Worker resume-extraction');
    quietRedisErrors(this.queue, this.logger, 'Queue resume-extraction (consumer-side)');
  }

  async process(job: Job<ExtractJobData>): Promise<void> {
    if (job.name !== RESUME_EXTRACT_JOB) {
      return;
    }

    const { applicationId } = job.data;

    const application = await this.prisma.internshipApplication.findUnique({
      where: { id: BigInt(applicationId) },
    });

    // Data hilang/terhapus sebelum diproses: tidak ada gunanya retry.
    if (!application) {
      this.logger.warn(
        `Lamaran ${applicationId} tidak ditemukan, ekstraksi dilewati.`,
      );
      return;
    }
    if (!application.resume_path) {
      this.logger.warn(
        `Lamaran ${applicationId} tidak punya resume_path, ekstraksi dilewati.`,
      );
      return;
    }

    const absolutePath = join(STORAGE_ROOT, application.resume_path);
    if (!existsSync(absolutePath)) {
      this.logger.warn(
        `File resume untuk lamaran ${applicationId} tidak ada di ${absolutePath}, dilewati.`,
      );
      return;
    }

    // Baca PDF dan ambil teksnya. Error parsing dibiarkan menyebar agar job
    // ditandai gagal dan bisa di-retry sesuai konfigurasi queue.
    const buffer = await readFile(absolutePath);
    const parser = new PDFParse({ data: buffer });
    let text: string;
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      // Bebaskan resource pdf.js (worker/dokumen) apapun hasilnya.
      await parser.destroy();
    }

    await this.prisma.internshipApplication.update({
      where: { id: application.id },
      data: { resume_text: text, updated_at: new Date() },
    });

    this.logger.log(
      `Teks resume lamaran ${applicationId} berhasil diekstrak (${text.length} karakter).`,
    );
  }
}
