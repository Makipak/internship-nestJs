import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InternshipModule } from './internship/internship.module';
import { ResumeExtractionModule } from './resume-extraction/resume-extraction.module';

@Module({
  imports: [
    // Memuat variabel dari .env dan tersedia global tanpa re-import.
    ConfigModule.forRoot({ isGlobal: true }),
    // Melayani file upload (PDF resume) di URL /storage/{filename}.
    // rootPath mengarah ke direktori penyimpanan Multer (backend/storage/app/public/).
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'storage', 'app', 'public'),
      serveRoot: '/storage',
    }),
    // Melayani hasil build frontend React sebagai file statis.
    // Rute /api, /auth, /apply, /storage ditangani module lain atau controller NestJS.
    // Semua rute lain (/, /login, /admin, dll.) dikembalikan index.html untuk SPA routing.
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'frontend', 'dist'),
      exclude: ['/api{/*path}', '/auth{/*path}', '/apply', '/storage{/*path}'],
    }),
    // Koneksi Redis untuk antrian BullMQ (mis. proses ekstraksi resume).
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: Number(process.env.REDIS_PORT ?? 6379),
        // Default ioredis mencoba reconnect tiap ~2 detik (times*50, maks 2000ms).
        // Diperlambat jadi naik 1 detik per percobaan, maks 30 detik, supaya tidak
        // membombardir proses koneksi saat Redis mati/belum terpasang.
        retryStrategy: (times: number) => Math.min(times * 1000, 30000),
      },
    }),
    PrismaModule,
    AuthModule,
    InternshipModule,
    ResumeExtractionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
