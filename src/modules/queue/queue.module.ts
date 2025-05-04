import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { EnvironmentModule } from '@root/environment/environment.module';
import { QueueNameEnum } from '@root/modules/queue';

@Module({
  imports: [
    EnvironmentModule,
    BullModule.registerQueue({
      name: QueueNameEnum.UPLOAD,
      defaultJobOptions: {
        priority: 0,
        attempts: 3,
        removeOnComplete: false,
        removeOnFail: false,
      },
    }),
    BullModule.registerQueue({
      name: QueueNameEnum.EMAIL,
      defaultJobOptions: {
        priority: 0,
        attempts: 3,
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  exports: [BullModule],
})
export class QueueModule {}
