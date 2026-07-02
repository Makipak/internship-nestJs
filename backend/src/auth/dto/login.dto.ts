import { IsString, MaxLength, MinLength } from 'class-validator';

/**
 * Payload login. Memakai `username` (bukan email) mengikuti konfigurasi
 * Fortify lama (config/fortify.php: 'username' => 'username').
 */
export class LoginDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  username!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  password!: string;
}
