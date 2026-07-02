import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { RESUME_QUEUE } from '../internship/internship.constants';
import { ResumeExtractionProcessor } from './resume-extraction.processor';

/**
 * ResumeExtractionModule mendaftarkan worker BullMQ untuk queue RESUME_QUEUE.
 * Queue yang sama diisi oleh InternshipModule (producer), sehingga setiap
 * lamaran baru otomatis memicu ekstraksi teks PDF di sini.
 */
@Module({
  imports: [BullModule.registerQueue({ name: RESUME_QUEUE })],
  providers: [ResumeExtractionProcessor],
})
export class ResumeExtractionModule {}
