import { Injectable } from '@nestjs/common';
import { importPKCS8, SignJWT } from 'jose';
import { LeadCreateDto } from './dto';

export const CRM_ADAPTER = 'CRM_ADAPTER';

export interface CrmAdapter {
  forwardLead(payload: LeadCreateDto): Promise<void>;
}

export const isSalesforceEnabled = (
  env: NodeJS.ProcessEnv = process.env,
): boolean => {
  return (env.SALESFORCE_ENABLED ?? '').toLowerCase() === 'true';
};

export class NoopCrmAdapter implements CrmAdapter {
  async forwardLead(payload: LeadCreateDto): Promise<void> {
    // Intentionally minimal stub; replace with real CRM integration.
    // eslint-disable-next-line no-console
    console.info('CRM forwarding stub', { id: payload.id ?? null });
  }
}

type SalesforceToken = {
  accessToken: string;
  instanceUrl: string;
  expiresAt: number;
};

@Injectable()
export class SalesforceAuthClient {
  private token?: SalesforceToken;

  private loadPrivateKey(): string {
    const inlineKey = process.env.SALESFORCE_JWT_PRIVATE_KEY;
    if (inlineKey && inlineKey.trim().length > 0) {
      return inlineKey.replace(/\\n/g, '\n');
    }

    throw new Error('Salesforce JWT private key is missing');
  }

  async getToken(): Promise<SalesforceToken> {
    if (this.token && Date.now() < this.token.expiresAt) {
      return this.token;
    }

    const loginUrl =
      process.env.SALESFORCE_LOGIN_URL ?? 'https://login.salesforce.com';
    const clientId = process.env.SALESFORCE_CLIENT_ID ?? '';
    const username = process.env.SALESFORCE_USERNAME ?? '';
    const privateKey = this.loadPrivateKey();
    const now = Math.floor(Date.now() / 1000);
    const key = await importPKCS8(privateKey, 'RS256');
    const assertion = await new SignJWT({})
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(clientId)
      .setSubject(username)
      .setAudience(loginUrl)
      .setIssuedAt(now)
      .setExpirationTime(now + 180)
      .sign(key);

    const body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    });

    const response = await fetch(`${loginUrl}/services/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Salesforce auth failed: ${response.status} ${errorText}`,
      );
    }

    const payload = (await response.json()) as {
      access_token: string;
      instance_url: string;
      issued_at: string;
      expires_in?: number;
    };

    const expiresIn = Number(payload.expires_in ?? 3600);
    this.token = {
      accessToken: payload.access_token,
      instanceUrl: payload.instance_url,
      expiresAt: Date.now() + expiresIn * 1000 - 30_000,
    };
    return this.token;
  }
}

@Injectable()
export class SalesforceCrmAdapter implements CrmAdapter {
  constructor(private readonly authClient: SalesforceAuthClient) {}

  async forwardLead(payload: LeadCreateDto): Promise<void> {
    const token = await this.authClient.getToken();
    const apiVersion = process.env.SALESFORCE_API_VERSION ?? 'v61.0';
    const url = `${token.instanceUrl}/services/data/${apiVersion}/sobjects/Lead/`;

    const leadPayload = this.mapLead(payload);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
        ...this.duplicateRuleHeader(),
      },
      body: JSON.stringify(leadPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Salesforce lead create failed: ${response.status} ${errorText}`,
      );
    }
  }

  private mapLead(payload: LeadCreateDto): Record<string, unknown> {
    const contact = payload.contact?.contactInformation;
    const address = payload.contact?.address;

    return {
      FirstName: contact?.firstName ?? '',
      LastName: contact?.lastName ?? '',
      Email: contact?.email ?? '',
      Phone: contact?.phone ?? '',
      MobilePhone: contact?.mobile ?? '',
      LeadSource: 'Web',
      Website: 'HeatOS Website',
      Company: 'Private Lead',
      Street: address?.street ?? undefined,
      City: address?.city ?? undefined,
      PostalCode: address?.postalCode ?? undefined,
      Country: address?.countryCode ?? undefined,
      Description: JSON.stringify(payload),
    };
  }

  private duplicateRuleHeader(): Record<string, string> {
    const allowDuplicates =
      (process.env.SALESFORCE_ALLOW_DUPLICATES ?? '').toLowerCase() === 'true';
    if (!allowDuplicates) {
      return {};
    }
    return {
      'Sforce-Duplicate-Rule-Header': 'allowSave=true',
    };
  }
}
