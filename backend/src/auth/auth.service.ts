import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { parseDurationMs } from './duration.util';
import { AuthUser, JwtPayload } from './types/jwt-payload';

/** Hasil autentikasi yang dipakai controller untuk men-set cookie. */
export interface AuthTokens {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Memverifikasi kredensial username + password.
   *
   * Password lama dibuat Laravel dengan prefix bcrypt `$2y$`. Library `bcrypt`
   * Node hanya mengenali `$2a$`/`$2b$`, padahal algoritmanya identik. Maka
   * prefix dinormalisasi ke `$2b$` sebelum dibandingkan.
   */
  async validateUser(username: string, password: string): Promise<AuthUser> {
    // Fortify lama: lowercase_usernames => true.
    const normalizedUsername = username.toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { username: normalizedUsername },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    const storedHash = user.password.startsWith('$2y$')
      ? `$2b$${user.password.slice(4)}`
      : user.password;

    const passwordMatches = await bcrypt.compare(password, storedHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Username atau password salah');
    }

    return {
      id: Number(user.id),
      name: user.name,
      username: user.username,
      email: user.email,
    };
  }

  /** Login: verifikasi kredensial lalu terbitkan pasangan token baru. */
  async login(username: string, password: string): Promise<AuthTokens> {
    const user = await this.validateUser(username, password);
    return this.issueTokens(user);
  }

  /**
   * Refresh: validasi refresh token dari cookie, pastikan masih cocok dengan
   * hash di DB (belum di-revoke), lalu rotasi menjadi pasangan token baru.
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(payload.sub) },
    });

    if (!user || !user.refresh_token_hash) {
      throw new UnauthorizedException('Sesi sudah berakhir, silakan login ulang');
    }

    // Bandingkan hash token yang masuk dengan hash tersimpan (constant-time).
    if (!this.hashMatches(refreshToken, user.refresh_token_hash)) {
      // Hash tidak cocok: token lama/diretas. Revoke paksa demi keamanan.
      await this.revokeTokens(user.id);
      throw new UnauthorizedException('Refresh token sudah tidak berlaku');
    }

    return this.issueTokens({
      id: Number(user.id),
      name: user.name,
      username: user.username,
      email: user.email,
    });
  }

  /** Logout: hapus hash refresh token sehingga token lama tidak bisa dipakai. */
  async logout(userId: number): Promise<void> {
    await this.revokeTokens(BigInt(userId));
  }

  /** Menerbitkan access + refresh token dan menyimpan hash refresh di DB. */
  private async issueTokens(user: AuthUser): Promise<AuthTokens> {
    const payload: JwtPayload = { sub: String(user.id), username: user.username };

    // expiresIn dalam detik (number) agar selaras dengan tipe JwtSignOptions.
    const accessTtlSec = Math.floor(
      parseDurationMs(this.config.get<string>('JWT_ACCESS_TTL') ?? '15m') / 1000,
    );
    const refreshTtlSec = Math.floor(
      parseDurationMs(this.config.get<string>('JWT_REFRESH_TTL') ?? '7d') / 1000,
    );

    // jwtid (jti) unik memastikan setiap token berbeda byte-nya, sehingga rotasi
    // saat refresh selalu menghasilkan token baru meski dibuat pada detik yang sama.
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_SECRET'),
      expiresIn: accessTtlSec,
      jwtid: randomUUID(),
    });

    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshTtlSec,
      jwtid: randomUUID(),
    });

    await this.prisma.user.update({
      where: { id: BigInt(user.id) },
      data: { refresh_token_hash: this.hashToken(refreshToken) },
    });

    return { user, accessToken, refreshToken };
  }

  private async revokeTokens(userId: bigint): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refresh_token_hash: null },
    });
  }

  /** SHA-256 (hex) dari token. Refresh token high-entropy, tidak perlu bcrypt. */
  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private hashMatches(token: string, storedHash: string): boolean {
    const incoming = Buffer.from(this.hashToken(token));
    const stored = Buffer.from(storedHash);
    return (
      incoming.length === stored.length && timingSafeEqual(incoming, stored)
    );
  }
}
