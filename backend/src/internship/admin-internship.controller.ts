import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { createReadStream } from 'node:fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InternshipService } from './internship.service';

/**
 * Endpoint admin untuk mengelola lamaran. Seluruh route diproteksi JwtAuthGuard.
 * Bentuk respons dijaga identik dengan controller Laravel lama.
 */
@Controller('api/admin/internships')
@UseGuards(JwtAuthGuard)
export class AdminInternshipController {
  constructor(private readonly internshipService: InternshipService) {}

  /** GET /api/admin/internships?page&sort_by&sort_dir */
  @Get()
  index(
    @Query('page') page?: string,
    @Query('sort_by') sortBy?: string,
    @Query('sort_dir') sortDir?: string,
  ) {
    return this.internshipService.findPaginated(page, sortBy, sortDir);
  }

  /** GET /api/admin/internships/export?ids=1,2,3 */
  @Get('export')
  export(@Query('ids') ids?: string) {
    return this.internshipService.exportCsv(ids);
  }

  /** GET /api/admin/internships/:id/resume — unduh file PDF resume. */
  @Get(':id/resume')
  async downloadResume(
    @Param('id', ParseIntPipe) id: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const { absolutePath, downloadName } =
      await this.internshipService.getResumeFile(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${downloadName}"`,
    });

    return new StreamableFile(createReadStream(absolutePath));
  }

  /** DELETE /api/admin/internships/:id */
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.internshipService.remove(id);
  }
}
