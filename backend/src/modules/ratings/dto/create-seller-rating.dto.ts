import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateSellerRatingDto {
  @IsUUID()
  listingId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  review?: string;
}
