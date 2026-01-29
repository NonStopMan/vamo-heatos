# Infrastructure & Scalability Strategy

## Stage A (≈ 5,000 leads/month)
Focus: speed to market, low cost, simplicity.

**Hosting**
- Frontend: static hosting on Vercel or Netlify.
- Backend: single container on Render/Fly.io/Heroku.
- Database: MongoDB Atlas M0/M2.

**Estimated monthly cost (rough)**
- Frontend: $0–$20
- Backend: $7–$25
- MongoDB: $0–$25
- Total: $7–$70

**Operational notes**
- Single region.
- Basic logging with provider defaults.
- Backups via MongoDB Atlas automated backups (or daily dumps).

## Stage B (≈ 50,000 leads/month)
Focus: reliability, observability, stability.

**Hosting**
- Frontend: CDN-backed static hosting (Vercel/CloudFront).
- Backend: 2+ instances behind a load balancer.
- Database: MongoDB Atlas M10+ with dedicated backups.

**Reliability & Observability**
- Enable structured logging + request correlation IDs.
- Centralized logging (Datadog, Grafana Loki, or ELK).
- Metrics and alerts on request latency, error rate, and queue depth.
- Backups with point-in-time restore enabled.

**Scaling considerations**
- Rate-limit API ingestion.
- Use background jobs for CRM forwarding on high failure rates.
- Introduce durable queues if CRM is a bottleneck.
