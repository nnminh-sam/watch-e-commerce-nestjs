import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBrandDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
