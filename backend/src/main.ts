import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

// Prisma mengembalikan kolom BigInt (mis. id) sebagai BigInt JavaScript yang
// tidak bisa di-serialize JSON.stringify secara default. Konversi ke number agar
// shape respons (id numerik) tetap sama seperti backend Laravel lama.
(BigInt.prototype as unknown as { toJSON: () => number }).toJSON = function (
  this: bigint,
) {
  return Number(this);
};

// Ubah error class-validator jadi { field: pesan } -- shape ala Laravel FormRequest
// yang dipakai komponen form lama (LoginForm, FormSection), bukan default NestJS
// yang berupa array string tanpa nama field.
function toFieldErrors(
  validationErrors: ValidationError[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const error of validationErrors) {
    const messages = error.constraints
      ? Object.values(error.constraints)
      : [];
    if (messages.length > 0) {
      errors[error.property] = messages[0];
    }
  }
  return errors;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Membaca cookie httpOnly (access_token / refresh_token) dari request.
  app.use(cookieParser());

  // Validasi & transformasi DTO global berbasis class-validator.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // Laravel FormRequest mengembalikan 422 + { errors: { field: pesan } }.
      exceptionFactory: (validationErrors) =>
        new UnprocessableEntityException({
          message: 'Validasi gagal',
          errors: toFieldErrors(validationErrors),
        }),
    }),
  );

  // CORS dengan credentials agar browser mengirim & menerima cookie httpOnly
  // dari SPA yang berjalan di origin terpisah (Vite).
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
