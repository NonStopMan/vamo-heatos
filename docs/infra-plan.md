# Infrastructure & Scalability Strategy

## Stage A (≈ 5,000 leads/month)

Focus: speed to market, low cost, simplicity.

**Hosting**

- Frontend: static hosting on Vercel or Netlify.
- Backend: single container on Render/Fly.io/Heroku.
- Database: MongoDB Atlas M0/M2.
- Object storage: Azure Blob Storage (public blob access for images).
- Current choice: Render for API and web hosting.

**Estimated monthly cost (rough)**

- Frontend: $0–$20
- Backend: $7–$25
- MongoDB: $0–$25
- Blob storage: $0–$10
- Total: $7–$70

**Data volume estimate**

- Approx. 2.6 KB per lead document (based on current payload shape).
- 5,000 leads/month → ~13 MB/month raw data.
- With index + storage overhead (~1.5–3x): ~20–40 MB/month.
- Yearly estimate: ~240–480 MB/year.

**Operational notes**

- Single region.
- Basic structured logging with request IDs.
- Backups via MongoDB Atlas automated backups (or daily dumps).
- Add `/health` checks for MongoDB and Salesforce auth in monitoring.
- Expose `/metrics` for Prometheus scraping when available.

## Stage B (≈ 50,000 leads/month)

Focus: reliability, observability, stability.

**Hosting**

- Frontend: CDN-backed static hosting (Vercel/CloudFront).
- Backend: 2+ instances behind a load balancer.
- Database: MongoDB Atlas M10+ with dedicated backups.
- Object storage: Azure Blob Storage with CDN in front if needed.
- Current choice: Render for API and web hosting (can evolve with scale).

**Reliability & Observability**

- Enable structured logging + request correlation IDs.
- Centralized logging (Datadog, Grafana Loki, or ELK).
- Metrics and alerts on request latency, error rate, and queue depth.
- Backups with point-in-time restore enabled.
- Monitor `/health` for MongoDB connectivity and Salesforce auth failures.

**Data volume estimate**

- Approx. 2.6 KB per lead document (based on current payload shape).
- 50,000 leads/month → ~130 MB/month raw data.
- With index + storage overhead (~1.5–3x): ~200–400 MB/month.
- Yearly estimate: ~2.4–4.8 GB/year.

**Reliability metrics (targets)**

- API availability: ≥ 99.5%
- 95th percentile API latency: ≤ 500ms
- Error rate (5xx): ≤ 1%
- CRM sync success rate: ≥ 98%
- CRM backlog: ≤ 1 hour of pending leads
- MongoDB saving latency (p95): ≤ 100ms
- Salesforce auth latency (p95): ≤ 2s
- Salesforce sync latency (p95): ≤ 2s

**Scaling considerations**

- Rate-limit API ingestion.
- Use background jobs for CRM forwarding on high failure rates.
- Introduce durable queues if CRM is a bottleneck.
