import { ApiProperty } from '@nestjs/swagger';
import { Spec } from '@root/models/spec.model';

export class SpecOptionDto {
  @ApiProperty({
    description: 'Product specification key',
    example: 'Size',
  })
  key: string;

  @ApiProperty({
    description: 'List of corresponding options of the specification',
    type: Spec,
    isArray: true,
  })
  options: Spec[];
}
