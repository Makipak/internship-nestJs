import { InjectQueue } from '@nestjs/bullmq';
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Queue } from 'bullmq';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { quietRedisErrors } from '../common/quiet-redis-errors';
import { PrismaService } from '../prisma/prisma.service';
import { csvRow } from './csv.util';
import {
  ALLOWED_SORT_FIELDS,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_DIR,
  PER_PAGE,
  RESUME_EXTRACT_JOB,
  RESUME_QUEUE,
  RESUME_SUBDIR,
  STORAGE_ROOT,
} from './internship.constants';
import { StoreInternshipApplicationDto } from './dto/store-internship-application.dto';

type SortDir = 'asc' | 'desc';

@Injectable()
export class InternshipService implements OnModuleInit {
  private readonly logger = new Logger(InternshipService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(RESUME_QUEUE) private readonly resumeQueue: Queue,
  ) {}

  onModuleInit(): void {
    quietRedisErrors(this.resumeQueue, this.logger, 'Queue resume-extraction');
  }

  /**
   * Menyimpan lamaran baru beserta file resume, lalu mengantrekan ekstraksi teks.
   * File divalidasi sebagai PDF (mime + magic byte) dan disimpan ke storage.
   */
  async create(
    dto: StoreInternshipApplicationDto,
    file?: Express.Multer.File,
  ): Promise<unknown> {
    if (!file) {
      throw new UnprocessableEntityException('Resume wajib diunggah.');
    }

    // Validasi tipe: mime harus PDF dan isi diawali magic byte %PDF.
    const isPdfMime = file.mimetype === 'application/pdf';
    const isPdfMagic = file.buffer.subarray(0, 5).toString('latin1') === '%PDF-';
    if (!isPdfMime || !isPdfMagic) {
      throw new UnprocessableEntityException('Resume harus berformat PDF.');
    }

    // Simpan file dengan nama acak agar tidak bisa ditebak/menimpa.
    const fileName = `${randomUUID()}.pdf`;
    const resumePath = `${RESUME_SUBDIR}/${fileName}`;
    const targetDir = join(STORAGE_ROOT, RESUME_SUBDIR);
    await mkdir(targetDir, { recursive: true });
    await writeFile(join(targetDir, fileName), file.buffer);

    const now = new Date();
    const application = await this.prisma.internshipApplication.create({
      data: {
        first_name: dto.first_name,
        last_name: dto.last_name ?? '',
        email: dto.email,
        phone: dto.phone,
        about: dto.about,
        resume_path: resumePath,
        created_at: now,
        updated_at: now,
      },
    });

    // Dispatch ekstraksi resume secara fire-and-forget: kegagalan antrian
    // (mis. Redis belum jalan) tidak boleh menggagalkan submit lamaran.
    void this.resumeQueue
      .add(RESUME_EXTRACT_JOB, { applicationId: Number(application.id) })
      .catch((err: unknown) => {
        this.logger.warn(
          `Gagal mengantrekan ekstraksi resume untuk aplikasi ${application.id}: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      });

    return application;
  }

  /**
   * Daftar lamaran dengan pagination + sorting. Parameter sort yang tidak valid
   * di-fallback ke default (bukan error), mengikuti perilaku Laravel lama.
   * Bentuk respons identik: { data, meta, sort }.
   */
  async findPaginated(
    pageRaw?: string,
    sortByRaw?: string,
    sortDirRaw?: string,
  ): Promise<{
    data: unknown[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
    sort: { by: string; direction: SortDir };
  }> {
    const sortBy = (
      ALLOWED_SORT_FIELDS as readonly string[]
    ).includes(sortByRaw ?? '')
      ? (sortByRaw as string)
      : DEFAULT_SORT_BY;
    const sortDir: SortDir =
      sortDirRaw === 'asc' || sortDirRaw === 'desc'
        ? sortDirRaw
        : DEFAULT_SORT_DIR;

    const parsedPage = Number.parseInt(pageRaw ?? '1', 10);
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

    const total = await this.prisma.internshipApplication.count();
    const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

    const data = await this.prisma.internshipApplication.findMany({
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    });

    return {
      data,
      meta: {
        current_page: page,
        last_page: lastPage,
        per_page: PER_PAGE,
        total,
      },
      sort: { by: sortBy, direction: sortDir },
    };
  }

  /** Hapus lamaran beserta file resume-nya. */
  async remove(id: number): Promise<{ message: string }> {
    const application = await this.prisma.internshipApplication.findUnique({
      where: { id: BigInt(id) },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.resume_path) {
      const absolute = join(STORAGE_ROOT, application.resume_path);
      if (existsSync(absolute)) {
        await unlink(absolute);
      }
    }

    await this.prisma.internshipApplication.delete({
      where: { id: BigInt(id) },
    });

    return { message: 'Application deleted successfully' };
  }

  /** Mengembalikan lokasi file resume dan nama unduhan yang ramah. */
  async getResumeFile(
    id: number,
  ): Promise<{ absolutePath: string; downloadName: string }> {
    const application = await this.prisma.internshipApplication.findUnique({
      where: { id: BigInt(id) },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const absolutePath = application.resume_path
      ? join(STORAGE_ROOT, application.resume_path)
      : '';
    if (!application.resume_path || !existsSync(absolutePath)) {
      throw new NotFoundException('Resume not found');
    }

    return {
      absolutePath,
      downloadName: `${application.first_name}_${application.last_name}_resume.pdf`,
    };
  }

  /**
   * Export lamaran terpilih ke CSV (aman dari CSV/formula injection).
   * Mengembalikan { csv, fileName } seperti endpoint Laravel.
   */
  async exportCsv(idsRaw?: string): Promise<{ csv: string; fileName: string }> {
    if (!idsRaw) {
      throw new HttpException(
        { message: 'No Data Selected' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const ids = idsRaw
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value !== '' && Number.isFinite(Number(value)))
      .map((value) => BigInt(value));

    if (ids.length === 0) {
      throw new HttpException(
        { message: 'Invalid Data Selected' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const applications = await this.prisma.internshipApplication.findMany({
      where: { id: { in: ids } },
      orderBy: { created_at: 'desc' },
    });

    if (applications.length === 0) {
      throw new HttpException(
        { message: 'No Data Found' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const header = 'first_name,last_name,email,phone,about,created_at\n';
    const rows = applications
      .map((app) =>
        csvRow([
          app.first_name,
          app.last_name,
          app.email,
          app.phone,
          app.about,
          app.created_at ? this.formatDateTime(app.created_at) : '',
        ]),
      )
      .join('\n');
    const csv = `${header}${rows}\n`;

    const fileName = `internship_applications_${this.formatTimestamp(
      new Date(),
    )}.csv`;

    return { csv, fileName };
  }

  /** Format tanggal "YYYY-MM-DD HH:mm:ss" (UTC), mirror Carbon format('Y-m-d H:i:s'). */
  private formatDateTime(date: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return (
      `${date.getUTCFullYear()}-${p(date.getUTCMonth() + 1)}-${p(date.getUTCDate())} ` +
      `${p(date.getUTCHours())}:${p(date.getUTCMinutes())}:${p(date.getUTCSeconds())}`
    );
  }

  /** Timestamp aman untuk nama file "YYYY-MM-DD_HH-mm-ss". */
  private formatTimestamp(date: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return (
      `${date.getUTCFullYear()}-${p(date.getUTCMonth() + 1)}-${p(date.getUTCDate())}_` +
      `${p(date.getUTCHours())}-${p(date.getUTCMinutes())}-${p(date.getUTCSeconds())}`
    );
  }
}
