import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { EnvironmentService } from '@root/environment/environment.service';
import { Job, Queue, tryCatch } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { QueueNameEnum } from '@root/modules/queue';
import { MailingJob } from '@root/modules/mailing/interfaces/mailing-job.interface';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { v4 as uuid } from 'uuid';
import { MailingResponseDto } from '@root/modules/mailing/dtos/mailing-response.dto';
import { CreateEmailDto } from '@root/modules/mailing/dtos/create-email.dto';

@Injectable()
export class MailingService {
  constructor(
    private readonly environmentService: EnvironmentService,
    @InjectQueue(QueueNameEnum.EMAIL)
    private readonly emailQueue: Queue,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async sendMail({ from, to, subject, html }: CreateEmailDto) {
    const jobId: string = uuid();
    const fromEmail = from ? from : this.environmentService.mailFrom;
    const jobData: MailingJob = {
      from: fromEmail,
      to,
      subject,
      html,
    };
    try {
      const job: Job = await this.emailQueue.add('email', jobData, { jobId });

      this.logger.log(
        `An email as been scheduled to send to ${to} with subject: ${subject}`,
        MailingService.name,
      );

      const state = await job.getState();

      const response: MailingResponseDto = {
        trackingId: jobId,
        state: state.toString(),
        message: `An email with subject: ${subject} is sending to ${to}`,
      };
      return response;
    } catch (error: any) {
      this.logger.error(
        `Cannot send email: ${error.message}`,
        MailingService.name,
      );
      throw new InternalServerErrorException('Cannot send email');
    }
  }
}
