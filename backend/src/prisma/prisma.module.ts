import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule dibuat @Global agar PrismaService dapat di-inject
 * di seluruh modul tanpa perlu meng-import modul ini berulang kali.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
