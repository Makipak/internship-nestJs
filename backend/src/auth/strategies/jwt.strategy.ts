import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser, JwtPayload } from '../types/jwt-payload';

/**
 * Mengambil access token dari cookie httpOnly `access_token`.
 */
function accessTokenFromCookie(req: Request): string | null {
  const token = (req.cookies as Record<string, string> | undefined)
    ?.access_token;
  return token ?? null;
}

/**
 * Strategy passport-jwt untuk memvalidasi access token.
 * Token dibaca dari cookie (bukan header Authorization) karena disimpan
 * sebagai httpOnly cookie. Payload diverifikasi lalu user dipastikan masih ada.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: accessTokenFromCookie,
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(payload.sub) },
      select: { id: true, name: true, username: true, email: true },
    });

    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }

    return {
      id: Number(user.id),
      name: user.name,
      username: user.username,
      email: user.email,
    };
  }
}
