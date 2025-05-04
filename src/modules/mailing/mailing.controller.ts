import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CreateEmailDto } from '@root/modules/mailing/dtos/create-email.dto';
import { MailingService } from '@root/modules/mailing/mailing.service';

@ApiBearerAuth()
@Controller('emails')
export class MailingController {
  constructor(private readonly mailingService: MailingService) {}

  @Post()
  sendEmail(@Body() createEmailDto: CreateEmailDto) {
    return this.mailingService.sendMail(createEmailDto);
  }
}
