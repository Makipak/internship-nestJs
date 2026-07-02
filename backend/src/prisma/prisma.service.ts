import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

/**
 * PrismaService membungkus PrismaClient sebagai provider NestJS.
 *
 * Prisma 7 menghapus query engine bawaan, sehingga koneksi wajib lewat
 * driver adapter. Untuk MySQL dipakai adapter MariaDB (@prisma/adapter-mariadb)
 * dengan connection string dari DATABASE_URL.
 *
 * Koneksi dibuka saat modul diinisialisasi dan ditutup saat aplikasi berhenti
 * agar pool koneksi dikelola mengikuti lifecycle Nest.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      adapter: new PrismaMariaDb(process.env.DATABASE_URL as string),
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
