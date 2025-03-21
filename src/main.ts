import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@root/commons/filters/http-exception.filter';
import { EnvironmentService } from '@root/environment/environment.service';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger: Logger = new Logger('Application');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(EnvironmentService);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api/v1');

  const port = configService.port;
  await app.listen(port, () => {
    logger.log(`Server is running on http://localhost:${port}`);
    logger.log(`Database URI: ${configService.databaseUrl}`);
    logger.log(`Database Host: ${configService.redisHost}`);
    logger.log(`Database Port: ${configService.databasePort}`);
    logger.log(`Database Name: ${configService.databaseName}`);
    logger.log(`Database Username: ${configService.databaseUsername}`);
    logger.log(`Database Password: ${configService.databasePassword}`);
  });
}
bootstrap();
