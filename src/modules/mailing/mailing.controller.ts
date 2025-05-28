import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { HasRoles } from '@root/commons/decorators/has-role.decorator';
import { ProtectedApi } from '@root/commons/decorators/protected-api.decorator';
import { SuccessApiResponse } from '@root/commons/decorators/success-response.decorator';
import { JwtGuard } from '@root/commons/guards/jwt.guard';
import { RoleGuard } from '@root/commons/guards/role.guard';
import { Role } from '@root/models/enums/role.enum';
import { CreateEmailDto } from '@root/modules/mailing/dtos/create-email.dto';
import { MailingResponseDto } from '@root/modules/mailing/dtos/mailing-response.dto';
import { MailingService } from '@root/modules/mailing/mailing.service';

@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('emails')
export class MailingController {
  constructor(private readonly mailingService: MailingService) {}

  @HasRoles([Role.ADMIN, Role.EMPLOYEE])
  @UseGuards(RoleGuard)
  @Post()
  @ProtectedApi({
    summary: 'Sent test email',
    roles: [Role.ADMIN, Role.EMPLOYEE],
  })
  @SuccessApiResponse({
    model: MailingResponseDto,
    key: 'mail',
    description: 'Email sent',
  })
  sendEmail(@Body() createEmailDto: CreateEmailDto) {
    return this.mailingService.sendMail(createEmailDto);
  }
}
