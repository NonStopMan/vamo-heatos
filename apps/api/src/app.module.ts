import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { defaultEnvPaths } from './config/env';
import { HealthModule } from './health/health.module';
import { LeadsModule } from './leads/leads.module';
import { MetricsModule } from './metrics/metrics.module';
import { HttpMetricsInterceptor } from './common/interceptors/http-metrics.interceptor';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: defaultEnvPaths(),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60,
          limit: 60,
        },
      ],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: (() => {
          const uri = config.get<string>('MONGODB_URI');
          if (!uri) {
            throw new Error('MONGODB_URI is required');
          }
          return uri;
        })(),
      }),
    }),
    HealthModule,
    LeadsModule,
    MetricsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    RequestLoggingInterceptor,
    HttpMetricsInterceptor,
  ],
})
export class AppModule {}
