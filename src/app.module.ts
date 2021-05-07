import { Module, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import { ExceptionFilter } from './commom/filters/exception.filter';
// import { DbModule } from './core/db/db.module';
import { LoggerModule } from './core/logger/logger.module';
// import { RedisModule } from './core/redis/redis.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      expandVariables: true,
    }),
    LoggerModule,
    // DbModule,
    // RedisModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          stopAtFirstError: true,
          whitelist: true,
        }),
    },
    {
      provide: APP_FILTER,
      useClass: ExceptionFilter,
    },
  ],
})
export class AppModule {}
