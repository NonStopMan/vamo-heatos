# Deployment Guide (Render-first)

This project ships as a Dockerized NestJS API + Vue web app. The current infra plan targets Render for the first production version.

## API (Render)

1. Create a new **Web Service** on Render.
2. Connect the GitHub repository.
3. Build command:
   - `pnpm install && pnpm --filter api build`
4. Start command:
   - `pnpm --filter api start:prod`
5. Health check path:
   - `/health`
6. Environment variables (required):
   - `MONGODB_URI`
   - `API_KEY`
   - `AZURE_STORAGE_CONNECTION_STRING`
   - `AZURE_STORAGE_CONTAINER`
   - `WEB_ORIGIN` (set to the deployed web URL)
7. Optional Salesforce variables (only if enabled):
   - `SALESFORCE_ENABLED=true`
   - `SALESFORCE_LOGIN_URL`
   - `SALESFORCE_CLIENT_ID`
   - `SALESFORCE_CLIENT_SECRET`
   - `SALESFORCE_USERNAME`
   - `SALESFORCE_PASSWORD`
   - `SALESFORCE_SECURITY_TOKEN`
   - `SALESFORCE_API_VERSION`

## Web (Render)

1. Create a new **Static Site** on Render.
2. Build command:
   - `pnpm install && pnpm --filter web build`
3. Publish directory:
   - `apps/web/dist`
4. Environment variables:
   - `VITE_API_URL` (set to the deployed API URL)

## Notes

- Copy `.env.example` to `.env` for local development.
- Never commit real secrets into the repository.
- `GET /metrics` exposes Prometheus metrics for scraping when needed.
