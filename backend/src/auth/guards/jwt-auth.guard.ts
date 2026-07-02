import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard untuk memproteksi route admin. Memvalidasi access token (JWT) yang
 * dibaca dari cookie httpOnly lewat JwtStrategy. Pakai dengan @UseGuards(JwtAuthGuard).
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
