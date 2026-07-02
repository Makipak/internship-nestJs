import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

/**
 * AuthModule menangani autentikasi berbasis JWT yang disimpan di httpOnly cookie.
 *
 * - JwtModule didaftarkan tanpa secret default; setiap penandatanganan token
 *   memakai secret + masa berlaku eksplisit (access vs refresh) di AuthService.
 * - PassportModule + JwtStrategy memvalidasi access token dari cookie.
 */
@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
