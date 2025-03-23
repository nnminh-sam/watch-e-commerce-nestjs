import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@root/commons/filters/http-exception.filter';
import { EnvironmentService } from '@root/environment/environment.service';
import {
  INestApplication,
  INestMicroservice,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { SnakeCaseApiResponseInterceptor } from '@root/commons/interceptors/snake-case-api-response.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CamelCaseApiRequestInterceptor } from '@root/commons/interceptors/camel-case-api-request.interceptor';
import { CamelCaseApiParamInterceptor } from '@root/commons/interceptors/camel-case-api-param.interceptor';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MicroservicesModule } from '@root/microservices.module';

async function bootstrap() {
  const logger: Logger = new Logger('API Service');

  const app: INestApplication = await NestFactory.create(AppModule);
  const environmentService: EnvironmentService = app.get(EnvironmentService);
  const port = environmentService.port;

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalInterceptors(new CamelCaseApiParamInterceptor());
  app.useGlobalInterceptors(new CamelCaseApiRequestInterceptor());
  app.useGlobalInterceptors(new SnakeCaseApiResponseInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Watch E-Commerce API Service')
    .setDescription('API Service for Watch E-Commerce store')
    .addBearerAuth()
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-document', app, documentFactory, {
    swaggerOptions: {
      tagsSorter: 'alpha',
    },
  });

  const microservices: INestMicroservice =
    await NestFactory.createMicroservice<MicroserviceOptions>(
      MicroservicesModule,
      {
        transport: Transport.REDIS,
        options: {
          host: environmentService.redisHost,
          port: environmentService.redisPort,
          db: environmentService.redisDbRpc,
        },
      },
    );

  await Promise.all([
    await app.listen(port, () => {
      logger.log(`Server is running on http://localhost:${port}`);
      logger.log(`API document is at http://localhost:${port}/api-document`);
    }),
    await microservices.listen(),
  ]);
}
bootstrap();
