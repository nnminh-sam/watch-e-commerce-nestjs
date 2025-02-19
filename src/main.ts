import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from '@root/app-config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  const configService = app.get(AppConfigService);
  const port = configService.port;

  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Database URI: ${configService.databaseUrl}`);
  });
}
bootstrap();
