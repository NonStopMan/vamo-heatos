import { Module } from '@nestjs/common';
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
      useFactory: (salesforceAdapter: SalesforceCrmAdapter) => {
        console.log('CRM Adapter Factory invoked', isSalesforceEnabled());
        if (isSalesforceEnabled()) {
          return salesforceAdapter;
        }
        return new NoopCrmAdapter();
      },
      inject: [SalesforceCrmAdapter],
    },
    LeadsSyncService,
    SalesforceAuthClient,
    SalesforceCrmAdapter,
  ],
})
export class LeadsModule {}
