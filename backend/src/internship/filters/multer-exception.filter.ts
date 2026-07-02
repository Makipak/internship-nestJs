import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { MulterError } from 'multer';

/**
 * Menerjemahkan error Multer menjadi respons 422 dengan pesan yang sama seperti
 * FormRequest Laravel lama (mis. batas ukuran file terlampaui).
 */
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const message =
      exception.code === 'LIMIT_FILE_SIZE'
        ? 'Ukuran resume tidak boleh melebihi 5MB.'
        : 'Berkas tidak valid.';

    response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({ message });
  }
}
