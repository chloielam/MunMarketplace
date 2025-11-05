import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class SeedUserDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}
