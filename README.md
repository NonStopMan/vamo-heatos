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

## API (Planned)
- `POST /leads` — create a lead (spec v1.2.0)

## Notes
- Server-side validation is authoritative.
- Leads must be persisted before any CRM forwarding.
- Unknown fields are only allowed under `metadata` or must be explicitly ignored and documented.

## AI Assistance
This repo is developed with AI assistance. See `AGENTS.md` for rules and constraints.
