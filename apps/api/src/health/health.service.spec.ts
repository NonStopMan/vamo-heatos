import { ConfigService } from '@nestjs/config';
import type { Connection } from 'mongoose';
import { HealthService } from './health.service';

describe('HealthService', () => {
  const buildConnection = (readyState: number, pingError?: Error) =>
    ({
      readyState,
      db: {
        admin: () => ({
          ping: jest.fn(async () => {
            if (pingError) {
              throw pingError;
            }
            return { ok: 1 };
          }),
        }),
      },
    }) as unknown as Connection;

  const buildConfig = (enabled: boolean) =>
    ({
      get: (key: string) => (key === 'SALESFORCE_ENABLED' ? String(enabled) : undefined),
    }) as unknown as ConfigService;

  it('returns ok when mongodb is connected and salesforce disabled', async () => {
    const connection = buildConnection(1);
    const config = buildConfig(false);
    const salesforceAuth = { getToken: jest.fn() };
    const service = new HealthService(connection, config, salesforceAuth as never);

    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.checks.mongodb.status).toBe('ok');
    expect(result.checks.salesforce.status).toBe('disabled');
  });

  it('returns error when mongodb is disconnected', async () => {
    const connection = buildConnection(0);
    const config = buildConfig(false);
    const salesforceAuth = { getToken: jest.fn() };
    const service = new HealthService(connection, config, salesforceAuth as never);

    const result = await service.check();

    expect(result.status).toBe('error');
    expect(result.checks.mongodb.status).toBe('error');
  });

  it('returns error when salesforce auth fails', async () => {
    const connection = buildConnection(1);
    const config = buildConfig(true);
    const salesforceAuth = { getToken: jest.fn().mockRejectedValue(new Error('auth failed')) };
    const service = new HealthService(connection, config, salesforceAuth as never);

    const result = await service.check();

    expect(result.status).toBe('error');
    expect(result.checks.salesforce.status).toBe('error');
  });
});
