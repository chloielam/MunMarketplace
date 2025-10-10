import { IsOptional, IsString, IsNumber, IsInt, Max, Min } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() bio?: string;
  // rating is stored as DECIMAL(3,2) string in your schema; accept number and convert
  @IsOptional() @IsNumber() @Min(0) @Max(5) rating?: number;
  @IsOptional() @IsInt() @Min(0) total_ratings?: number;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() study_program?: string;
  @IsOptional() @IsString() department?: string;
}