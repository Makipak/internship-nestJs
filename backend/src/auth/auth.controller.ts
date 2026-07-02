import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_COOKIE_PATH,
  REFRESH_TOKEN_COOKIE,
} from './auth.constants';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { parseDurationMs } from './duration.util';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { AuthUser } from './types/jwt-payload';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  /** POST /auth/login — login dengan username + password. */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: AuthUser }> {
    const { user, accessToken, refreshToken } = await this.authService.login(
      dto.username,
      dto.password,
    );
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  /** POST /auth/refresh — tukar refresh token (dari cookie) dengan token baru. */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: AuthUser }> {
    const token = (req.cookies as Record<string, string> | undefined)?.[
      REFRESH_TOKEN_COOKIE
    ];
    if (!token) {
      throw new UnauthorizedException('Refresh token tidak ada');
    }

    const { user, accessToken, refreshToken } =
      await this.authService.refresh(token);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  /** GET /auth/me — cek status login, dipakai frontend untuk protected route. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser): { user: AuthUser } {
    return { user };
  }

  /** POST /auth/logout — revoke refresh token dan bersihkan cookie. */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(
    @CurrentUser() user: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    await this.authService.logout(user.id);
    this.clearAuthCookies(res);
    return { message: 'Logout berhasil' };
  }

  /** Opsi dasar cookie httpOnly (secure hanya di production / HTTPS). */
  private baseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      ...this.baseCookieOptions(),
      path: '/',
      maxAge: parseDurationMs(
        this.config.get<string>('JWT_ACCESS_TTL') ?? '15m',
      ),
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.baseCookieOptions(),
      path: REFRESH_COOKIE_PATH,
      maxAge: parseDurationMs(
        this.config.get<string>('JWT_REFRESH_TTL') ?? '7d',
      ),
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      ...this.baseCookieOptions(),
      path: '/',
    });
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      ...this.baseCookieOptions(),
      path: REFRESH_COOKIE_PATH,
    });
  }
}
