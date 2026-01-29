# Architecture Overview

This prototype consists of a Vue 3 client, a NestJS API, and a MongoDB database.
Leads are accepted through a REST API, validated, persisted, and then forwarded
as a downstream side-effect to a CRM adapter.

## Component Diagram (Mermaid)

```mermaid
flowchart LR
  User((User)) --> Web[Vue 3 Lead Form]
  Web -->|POST /leads| API[NestJS API]
  API -->|Persist| Mongo[(MongoDB)]
  API -->|Forward| CRM[CRM Adapter]
  API -->|Store images| Uploads[/Uploads or Object Storage/]
```

## Data Flow
1. User submits lead form to the API.
2. API validates request (server-side authoritative).
3. API persists lead to MongoDB.
4. API forwards lead to CRM adapter with retry/backoff.
5. API returns lead stage + follow-up links.

## Deployment Topology (High Level)
- `web` served as a static SPA.
- `api` served as a container.
- `mongo` as managed service.
