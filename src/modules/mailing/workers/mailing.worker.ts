import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { EnvironmentService } from '@root/environment/environment.service';
import { MailingConfig } from '@root/modules/mailing/interfaces/mailing-config.interface';
import { MailingJob } from '@root/modules/mailing/interfaces/mailing-job.interface';
import { QueueNameEnum } from '@root/modules/queue';
import { Job } from 'bullmq';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { createTransport, Transporter } from 'nodemailer';

@Processor(QueueNameEnum.EMAIL, {
  concurrency: 3,
  limiter: {
    max: 3,
    duration: 1000,
  },
})
export class MailingProcessor extends WorkerHost {
  private transporter: Transporter;

  constructor(
    private readonly environmentService: EnvironmentService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {
    super();

    const config: MailingConfig = {
      host: this.environmentService.mailHost,
      port: this.environmentService.mailPort,
      secure: this.environmentService.mailSecure,
      auth: {
        user: this.environmentService.mailUser,
        pass: this.environmentService.mailPassword,
      },
      from: this.environmentService.mailFrom,
    };

    this.transporter = createTransport(config);
    this.logger.log('Mailing woker started');
  }

  async process(job: Job<MailingJob>) {
    const { from, to, subject, html } = job.data;
    try {
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      this.logger.log(`Email sent for job ${job.id}`, MailingProcessor.name);
    } catch (error: any) {
      this.logger.error(
        `Failed to process job ${job.id}: ${error.message}`,
        MailingProcessor.name,
      );
      throw error;
    }
  }

  @OnWorkerEvent('active')
  onAdded(job: Job<MailingJob>) {
    this.logger.log(`Starting upload for job ${job.id}`, MailingProcessor.name);
  }
}
