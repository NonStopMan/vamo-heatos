import { isSalesforceEnabled } from './crm.adapter';

describe('CRM adapter selection', () => {
  it('treats truthy values case-insensitively', () => {
    expect(isSalesforceEnabled({ SALESFORCE_ENABLED: 'true' } as NodeJS.ProcessEnv)).toBe(true);
    expect(isSalesforceEnabled({ SALESFORCE_ENABLED: 'TRUE' } as NodeJS.ProcessEnv)).toBe(true);
    expect(isSalesforceEnabled({ SALESFORCE_ENABLED: 'TrUe' } as NodeJS.ProcessEnv)).toBe(true);
  });

  it('treats other values as disabled', () => {
    expect(isSalesforceEnabled({ SALESFORCE_ENABLED: 'false' } as NodeJS.ProcessEnv)).toBe(false);
    expect(isSalesforceEnabled({ SALESFORCE_ENABLED: '' } as NodeJS.ProcessEnv)).toBe(false);
    expect(isSalesforceEnabled({} as NodeJS.ProcessEnv)).toBe(false);
  });
});
