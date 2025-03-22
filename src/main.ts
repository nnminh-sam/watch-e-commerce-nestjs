import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@root/commons/filters/http-exception.filter';
import { EnvironmentService } from '@root/environment/environment.service';
import { Logger, VersioningType } from '@nestjs/common';
import { SnakeCaseApiResponseInterceptor } from '@root/commons/interceptors/snake-case-api-response.interceptor';
import { ApiResponseWrapperInterceptor } from '@root/commons/interceptors/api-response-wrapper.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CamelCaseApiRequestInterceptor } from '@root/commons/interceptors/camel-case-api-request.interceptor';

async function bootstrap() {
  const logger: Logger = new Logger('Application');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(EnvironmentService);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalInterceptors(new CamelCaseApiRequestInterceptor());
  app.useGlobalInterceptors(new SnakeCaseApiResponseInterceptor());

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Watch E-Commerce API Service')
    .setDescription('API Service for Watch E-Commerce store')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-document', app, documentFactory);

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
