import { IsOptional, IsString, IsBoolean, IsUrl, IsPhoneNumber } from 'class-validator';

export class UpdateUserDto {
  @IsOptional() @IsString() first_name?: string;
  @IsOptional() @IsString() last_name?: string;
  @IsOptional() @IsPhoneNumber('CA') phone_number?: string; // adjust region as needed
  @IsOptional() @IsUrl() profile_picture_url?: string;
  @IsOptional() @IsBoolean() is_active?: boolean; // optional admin use
  // NOTE: no password or mun_email here
}