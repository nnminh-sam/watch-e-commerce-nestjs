import { Module } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { EnvironmentModule } from '@root/environment/environment.module';
import { QueueModule } from '@root/modules/queue/queue.module';
import { MailingController } from './mailing.controller';
import { MailingProcessor } from '@root/modules/mailing/workers/mailing.worker';
import { TemplateService } from './services/template.service';

@Module({
  imports: [EnvironmentModule, QueueModule],
  providers: [MailingService, MailingProcessor, TemplateService],
  exports: [MailingService, TemplateService],
  controllers: [MailingController],
})
export class MailingModule {}
