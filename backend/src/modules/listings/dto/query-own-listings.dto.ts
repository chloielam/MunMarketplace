import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ListingStatus } from '../entities/listing.entity';
import { QueryListingDto } from './query-listing.dto';

export class QueryOwnListingsDto extends QueryListingDto {
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    return value.toLowerCase() === 'true' || value === '1';
  })
  @IsBoolean()
  includeDeleted?: boolean;
}
