import { Module } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { EnvironmentModule } from '@root/environment/environment.module';
import { QueueModule } from '@root/modules/queue/queue.module';
import { MailingController } from './mailing.controller';
import { MailingProcessor } from '@root/modules/mailing/workers/mailing.worker';

@Module({
  imports: [EnvironmentModule, QueueModule],
  providers: [MailingService, MailingProcessor],
  exports: [MailingService],
  controllers: [MailingController],
})
export class MailingModule {}
