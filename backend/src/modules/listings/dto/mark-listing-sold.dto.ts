import { IsUUID } from 'class-validator';

export class MarkListingSoldDto {
  @IsUUID()
  buyerId: string;
}
