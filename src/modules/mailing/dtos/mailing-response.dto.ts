import { ApiProperty } from '@nestjs/swagger';

export class MailingResponseDto {
  @ApiProperty({
    name: 'tracking_id',
    description: 'ID for tracking email sending process',
  })
  trackingId: string;

  @ApiProperty({
    description: 'Mail sending state',
  })
  state: string;

  @ApiProperty({
    description: 'Initial email processor message',
  })
  message: string;
}
