import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { fastifyPlugin as rTracerPlugin } from 'cls-rtracer';
import { fastifyHelmet as helmetPlugin } from 'fastify-helmet';
import multipartPlugin from 'fastify-multipart';
import hexoid from 'hexoid';

import { AppModule } from './app.module';
import { LoggerService } from './core/logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: false },
  );

  const loggerService = await app.resolve(LoggerService);
  app.useLogger(loggerService);

  app.enableCors();
  app.register(helmetPlugin);
  app.register(rTracerPlugin, {
    echoHeader: true,
    requestIdFactory: hexoid(32),
  });
  app.register(multipartPlugin);

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
