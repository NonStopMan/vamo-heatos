import { Test } from '@nestjs/testing';
import { LeadCreateDto } from './dto';
import { SalesforceAuthClient, SalesforceCrmAdapter } from './crm.adapter';

describe('SalesforceCrmAdapter DI', () => {
  const payload: LeadCreateDto = {
    version: '1.2.0',
    contact: {
      contactInformation: {
        firstName: 'Ada',
        lastName: 'Lovelace',
        phone: '+49 00000000000',
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

  it('injects SalesforceAuthClient into SalesforceCrmAdapter', async () => {
    const authClient = {
      getToken: jest.fn().mockResolvedValue({
        accessToken: 'token-123',
        instanceUrl: 'https://instance.salesforce.com',
        expiresAt: Date.now() + 1000,
      }),
    };

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    });

    global.fetch = fetchMock as unknown as typeof fetch;

    const moduleRef = await Test.createTestingModule({
      providers: [
        SalesforceCrmAdapter,
        {
          provide: SalesforceAuthClient,
          useValue: authClient,
        },
      ],
    }).compile();

    const adapter = moduleRef.get(SalesforceCrmAdapter);
    await adapter.forwardLead(payload);

    expect(authClient.getToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
