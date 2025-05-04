import { ApiProperty } from '@nestjs/swagger';

export class FileUploadResponseDto {
  @ApiProperty({
    name: 'tracking_id',
    description: 'ID for tracking upload process',
  })
  trackingId: string;

  @ApiProperty({
    description: 'Upload process state',
  })
  state: string;

  @ApiProperty({
    description: 'Initial upload processor message',
  })
  message: string;
}
