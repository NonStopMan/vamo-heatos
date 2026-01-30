import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { SalesforceAuthClient } from '../leads/crm.adapter';

@Module({
  controllers: [HealthController],
  providers: [HealthService, SalesforceAuthClient],
})
export class HealthModule {}
