import { LeadCreateDto } from './dto';
import { SalesforceAuthClient, SalesforceCrmAdapter } from './crm.adapter';

jest.mock('jose', () => {
  return {
    importPKCS8: jest.fn(async () => 'key'),
    SignJWT: class {
      setProtectedHeader() {
        return this;
      }
      setIssuer() {
        return this;
      }
      setSubject() {
        return this;
      }
      setAudience() {
        return this;
      }
      setIssuedAt() {
        return this;
      }
      setExpirationTime() {
        return this;
      }
      async sign() {
        return 'jwt-token';
      }
    },
  };
});

describe('SalesforceCrmAdapter', () => {
  const payload: LeadCreateDto = {
    version: '1.2.0',
    contact: {
      contactInformation: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        phone: '+49 00000000000',
        mobile: '+49 11111111111',
        email: 'ada@example.com',
      },
      address: {
        street: 'Main St',
        city: 'Cologne',
        postalCode: '50676',
        countryCode: 'DE',
      },
    },
  };

  beforeEach(() => {
    process.env.SALESFORCE_LOGIN_URL = 'https://login.salesforce.com';
    process.env.SALESFORCE_CLIENT_ID = 'client';
    process.env.SALESFORCE_USERNAME = 'user';
    process.env.SALESFORCE_JWT_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\\nkey\\n-----END PRIVATE KEY-----';
    process.env.SALESFORCE_API_VERSION = 'v61.0';
    delete process.env.SALESFORCE_ALLOW_DUPLICATES;
  });

  it('authenticates and posts lead', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token-123',
          instance_url: 'https://instance.salesforce.com',
          expires_in: 3600,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '',
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    const authClient = new SalesforceAuthClient();
    const adapter = new SalesforceCrmAdapter(authClient);

    await adapter.forwardLead(payload);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe(
      'https://instance.salesforce.com/services/data/v61.0/sobjects/Lead/',
    );
    const body = fetchMock.mock.calls[1][1]?.body as string;
    const parsed = JSON.parse(body) as Record<string, string>;
    expect(parsed.MobilePhone).toBe('+49 11111111111');
    expect(parsed.LeadSource).toBe('Web');
    expect(parsed.Website).toBe('HeatOS Website');
  });

  it('adds duplicate rule header when enabled', async () => {
    process.env.SALESFORCE_ALLOW_DUPLICATES = 'true';

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token-123',
          instance_url: 'https://instance.salesforce.com',
          expires_in: 3600,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => '',
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    const authClient = new SalesforceAuthClient();
    const adapter = new SalesforceCrmAdapter(authClient);

    await adapter.forwardLead(payload);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const headers = fetchMock.mock.calls[1][1]?.headers as Record<string, string>;
    expect(headers['Sforce-Duplicate-Rule-Header']).toBe('allowSave=true');
  });

  it('caches tokens between calls', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'token-123',
          instance_url: 'https://instance.salesforce.com',
          expires_in: 3600,
        }),
      })
      .mockResolvedValue({
        ok: true,
        text: async () => '',
      });

    global.fetch = fetchMock as unknown as typeof fetch;

    const authClient = new SalesforceAuthClient();
    const adapter = new SalesforceCrmAdapter(authClient);

    await adapter.forwardLead(payload);
    await adapter.forwardLead(payload);

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
