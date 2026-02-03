import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CRM_ADAPTER,
  NoopCrmAdapter,
  SalesforceAuthClient,
  SalesforceCrmAdapter,
  isSalesforceEnabled,
} from './crm.adapter';
import { LeadsController } from './leads.controller';
import { LeadsUploadsController } from './uploads.controller';
import { Lead, LeadSchema } from './lead.schema';
import { LEADS_REPOSITORY, MongooseLeadsRepository } from './leads.repository';
import { LeadsService } from './leads.service';
import { LeadsSyncService } from './leads.sync.service';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
  ],
  controllers: [LeadsController, LeadsUploadsController],
  providers: [
    LeadsService,
    {
      provide: LEADS_REPOSITORY,
      useClass: MongooseLeadsRepository,
    },
    {
      provide: CRM_ADAPTER,
      useFactory: (
        salesforceAdapter: SalesforceCrmAdapter,
        config: ConfigService,
      ) => {
        const logger = new Logger('CRMAdapterFactory');
        const enabled = isSalesforceEnabled(config);
        logger.log(`Salesforce integration enabled: ${enabled}`);
        if (enabled) {
          return salesforceAdapter;
        }
        return new NoopCrmAdapter();
      },
      inject: [SalesforceCrmAdapter, ConfigService],
    },
    LeadsSyncService,
    SalesforceAuthClient,
    SalesforceCrmAdapter,
    Reflector,
    ApiKeyGuard,
  ],
})
export class LeadsModule {}
