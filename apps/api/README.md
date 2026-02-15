# API Service (NestJS)

Backend for the HeatOS lead intake funnel. Accepts lead payloads, persists them to MongoDB,
uploads pictures to Azure Blob Storage, and optionally forwards leads to Salesforce.

## Key Endpoints
- `POST /leads` — create a lead (spec v1.2.0)
- `POST /leads/uploads` — upload pictures to Azure Blob Storage
- `GET /health` — MongoDB + Salesforce auth status
- `GET /metrics` — Prometheus metrics

## Authentication
- `POST /leads` is public to allow anonymous lead submissions.
- `POST /leads/uploads` still requires an API key.
- Send `x-api-key: <API_KEY>` (or `Authorization: ApiKey <API_KEY>`) for protected routes.

## Development
```bash
pnpm install
pnpm start:dev
```

## Tests
```bash
pnpm test
```

## Required Environment Variables
- `MONGODB_URI`
- `API_KEY`
- `AZURE_STORAGE_CONNECTION_STRING`
- `AZURE_STORAGE_CONTAINER` (public access set to `blob`)
- `WEB_ORIGIN` (CORS allowlist)

## Salesforce (optional)
Set `SALESFORCE_ENABLED=true` and provide:
- `SALESFORCE_LOGIN_URL`
- `SALESFORCE_CLIENT_ID`
- `SALESFORCE_CLIENT_SECRET`
- `SALESFORCE_USERNAME`
- `SALESFORCE_PASSWORD`
- `SALESFORCE_SECURITY_TOKEN`
- `SALESFORCE_API_VERSION`

Setup details: `docs/salesforce-setup.md`
