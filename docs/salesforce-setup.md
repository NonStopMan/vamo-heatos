# Salesforce Setup (Sandbox)

This guide explains how to configure Salesforce credentials for the Lead Intake API.

## 1) Create a Connected App
1. Go to **Setup → App Manager → New Connected App**.
2. Enable **OAuth Settings**.
3. Callback URL: `http://localhost`
4. OAuth scopes: **Access and manage your data (api)** (or Full access).
5. Save and wait a few minutes for activation.

From the Connected App details:
- **Consumer Key** → `SALESFORCE_CLIENT_ID`
- **Consumer Secret** → `SALESFORCE_CLIENT_SECRET`

## 2) Reset Security Token
User menu → **Settings** → **Reset My Security Token**.
You will receive it by email.

## 3) Fill .env
Use the sandbox login endpoint:
```
SALESFORCE_LOGIN_URL=https://test.salesforce.com
```

## 4) Enable API Access
Ensure your profile has **API Enabled** permission.

## 5) Verify
Run the API and submit a lead. If `SALESFORCE_ENABLED=true`, the adapter will forward leads to Salesforce.
You can also verify connectivity via:
- `GET /health` → `checks.salesforce.status` should be `ok`.
