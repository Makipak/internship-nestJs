import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Validasi field teks form lamaran (mirror StoreInternshipApplicationRequest).
 * File resume divalidasi terpisah di service (mime, magic byte, ukuran).
 */
export class StoreInternshipApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  first_name!: string;

  // last_name: sometimes|nullable|max:100 -> opsional, default '' di service.
  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  @IsEmail({}, { message: 'Masukkan alamat email yang valid.' })
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  about!: string;
}
