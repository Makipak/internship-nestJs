import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StoreInternshipApplicationDto } from './dto/store-internship-application.dto';
import { MulterExceptionFilter } from './filters/multer-exception.filter';
import { InternshipService } from './internship.service';
import { MAX_RESUME_BYTES } from './internship.constants';

/**
 * Endpoint publik untuk submit lamaran magang (tanpa autentikasi).
 * File ditahan di memori lalu divalidasi & disimpan oleh service.
 */
@Controller()
export class InternshipApplicationController {
  constructor(private readonly internshipService: InternshipService) {}

  @Post('apply')
  @HttpCode(HttpStatus.CREATED)
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('resume', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_RESUME_BYTES },
    }),
  )
  async apply(
    @Body() dto: StoreInternshipApplicationDto,
    @UploadedFile() resume?: Express.Multer.File,
  ): Promise<{ message: string; data: unknown }> {
    const data = await this.internshipService.create(dto, resume);
    return { message: 'Application submitted successfully!', data };
  }
}
