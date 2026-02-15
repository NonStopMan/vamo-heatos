import { Injectable } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry = new Registry();
  private readonly httpRequestDuration: Histogram<'method' | 'route' | 'status'>;
  private readonly httpRequestCount: Counter<'method' | 'route' | 'status'>;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_ms',
      help: 'Duration of HTTP requests in ms',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
      buckets: [25, 50, 100, 200, 400, 800, 1600, 3200],
    });

    this.httpRequestCount = new Counter({
      name: 'http_request_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });
  }

  recordHttpRequest(
    method: string,
    route: string,
    status: number,
    durationMs: number,
  ) {
    const labels = {
      method,
      route,
      status: String(status),
    } as const;

    this.httpRequestDuration.observe(labels, durationMs);
    this.httpRequestCount.inc(labels, 1);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
