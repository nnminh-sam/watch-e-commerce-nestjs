import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEmailDto {
  @ApiProperty({
    description: 'Email address which this email is sent from',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  from?: string;

  @ApiProperty({
    description: 'Email address which email is sending to',
  })
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @ApiProperty({
    description: 'Email subject',
  })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Email body in form of HTML',
  })
  @IsNotEmpty()
  @IsString()
  template: string;

  @ApiProperty({
    description: 'Context for the email template',
    required: false,
  })
  @IsOptional()
  context?: Record<string, any>;
}
