# Vamo HeatOS Lead Intake Funnel (Prototype)

Prototype for a multi-channel lead intake funnel for HeatOS Sales at Vamo GmbH.

## Goals
- Correctness over completeness
- Reliability over cleverness
- Clear architecture over premature optimization

## Tech Stack
- Backend: NestJS (TypeScript)
- Frontend: Vue 3 (TypeScript)
- Database: MongoDB
- Runtime: Node.js
- Containerization: Docker

## Project Structure
- `apps/api` — NestJS backend
- `apps/web` — Vue 3 frontend
- `packages/shared` — shared types
- `docs/lead-creation-v1.2.0.from-mhtml.txt` — Lead Creation v1.2.0 API spec
- `docs/architecture/README.md` — Architecture overview
- `docs/infra-plan.md` — Infrastructure & scalability strategy

## Architecture
See `docs/architecture/README.md` for component and data-flow diagrams.

## Development
### Prerequisites
- Node.js
- pnpm

### Install
```bash
pnpm install
```

### Run backend
```bash
pnpm --filter api start:dev
```

### Run frontend
```bash
pnpm --filter web dev
```

### Run tests
```bash
pnpm --filter api test
pnpm --filter web test:unit
```

## API (Planned)
- `POST /leads` — create a lead (spec v1.2.0)
- `POST /leads/uploads` — upload pictures (prototype)

## Salesforce CRM Adapter
Set `SALESFORCE_ENABLED=true` to use the Salesforce adapter. Required env vars:
- `SALESFORCE_LOGIN_URL` (default: `https://login.salesforce.com`)
- `SALESFORCE_CLIENT_ID`
- `SALESFORCE_CLIENT_SECRET`
- `SALESFORCE_USERNAME`
- `SALESFORCE_PASSWORD`
- `SALESFORCE_SECURITY_TOKEN`
- `SALESFORCE_API_VERSION` (default: `v61.0`)
For setup steps, see `docs/salesforce-setup.md`.

## CI/CD
- GitHub Actions workflow in `.github/workflows/ci.yml`.
- Runs build + API tests + web unit tests on PRs and main.
- Recommended branch protection: require `CI / build-and-test` to pass before merge.

## Notes
- Server-side validation is authoritative.
- Leads must be persisted before any CRM forwarding.
- Unknown fields are only allowed under `metadata` or must be explicitly ignored and documented.

## AI Assistance
This repo is developed with AI assistance. See `AGENTS.md` for rules and constraints.
