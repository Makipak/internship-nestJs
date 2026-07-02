import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthUser } from '../types/jwt-payload';

/**
 * Mengambil user terautentikasi (hasil JwtStrategy.validate) dari request.
 * Pakai di handler yang diproteksi JwtAuthGuard: `@CurrentUser() user: AuthUser`.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user as AuthUser;
  },
);
