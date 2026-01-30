import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import type { Connection } from 'mongoose';
import { SalesforceAuthClient, isSalesforceEnabled } from '../leads/crm.adapter';
import { HealthResponse } from './health.types';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly config: ConfigService,
    private readonly salesforceAuth: SalesforceAuthClient,
  ) {}

  async check(): Promise<HealthResponse> {
    const mongodb = await this.checkMongo();
    const salesforce = await this.checkSalesforce();

    const status = [mongodb, salesforce].some((check) => check.status === 'error')
      ? 'error'
      : 'ok';

    return {
      status,
      checks: {
        mongodb,
        salesforce,
      },
      timestamp: new Date().toISOString(),
    };
  }

  private async checkMongo() {
    if (this.connection.readyState !== 1) {
      return { status: 'error', message: 'MongoDB not connected' } as const;
    }

    try {
      if (!this.connection.db) {
        return { status: 'error', message: 'MongoDB connection missing' } as const;
      }
      await this.connection.db.admin().ping();
      return { status: 'ok' } as const;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'MongoDB ping failed',
      } as const;
    }
  }

  private async checkSalesforce() {
    if (!isSalesforceEnabled(this.config)) {
      return { status: 'disabled' } as const;
    }

    try {
      await this.salesforceAuth.getToken();
      return { status: 'ok' } as const;
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Salesforce auth failed',
      } as const;
    }
  }
}
