import { isSalesforceEnabled } from './crm.adapter';

describe('CRM adapter selection', () => {
  it('treats truthy values case-insensitively', () => {
    const config = {
      get: (key: string) => ({ SALESFORCE_ENABLED: 'true' })[key],
    } as never;
    expect(isSalesforceEnabled(config)).toBe(true);
    const configUpper = {
      get: (key: string) => ({ SALESFORCE_ENABLED: 'TRUE' })[key],
    } as never;
    expect(isSalesforceEnabled(configUpper)).toBe(true);
    const configMixed = {
      get: (key: string) => ({ SALESFORCE_ENABLED: 'TrUe' })[key],
    } as never;
    expect(isSalesforceEnabled(configMixed)).toBe(true);
  });

  it('treats other values as disabled', () => {
    const configFalse = {
      get: (key: string) => ({ SALESFORCE_ENABLED: 'false' })[key],
    } as never;
    expect(isSalesforceEnabled(configFalse)).toBe(false);
    const configEmpty = {
      get: (key: string) => ({ SALESFORCE_ENABLED: '' })[key],
    } as never;
    expect(isSalesforceEnabled(configEmpty)).toBe(false);
    const configMissing = {
      get: (_key: string) => undefined,
    } as never;
    expect(isSalesforceEnabled(configMissing)).toBe(false);
  });
});
