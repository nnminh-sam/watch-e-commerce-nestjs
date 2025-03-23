import { Module } from '@nestjs/common';
import { Client, ClientsModule, Transport } from '@nestjs/microservices';
import { EnvironmentModule } from '@root/environment/environment.module';
import { EnvironmentService } from '@root/environment/environment.service';
import { ClientsEnum } from '@root/microservices/clients.enum';
import { CartModule } from '@root/modules/cart/cart.module';
import { MicroserviceCartController } from '@root/modules/cart/microservices-cart.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [EnvironmentModule],
        inject: [EnvironmentService],
        name: ClientsEnum.REDIS_RPC,
        useFactory: (environmentService: EnvironmentService) => {
          return {
            transport: Transport.REDIS,
            options: {
              host: environmentService.redisHost,
              port: environmentService.redisPort,
              db: environmentService.redisDbRpc,
            },
          };
        },
      },
    ]),
    CartModule,
  ],
  providers: [],
  controllers: [MicroserviceCartController],
  exports: [ClientsModule],
})
export class MicroservicesModule {}
