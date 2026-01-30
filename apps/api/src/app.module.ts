import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { defaultEnvPaths } from './config/env';
import { HealthModule } from './health/health.module';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: defaultEnvPaths(),
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ??
          'mongodb+srv://mohammedthabet2010_db_user:XCmjibL28bGqmx8H@cluster0.ttwo2iy.mongodb.net/vamo-heatos?retryWrites=true&w=majority&appName=Cluster0',
      }),
    }),
    HealthModule,
    LeadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
