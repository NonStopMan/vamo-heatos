import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  it('records http request metrics', async () => {
    const service = new MetricsService();

    service.recordHttpRequest('GET', '/health', 200, 42);

    const metrics = await service.getMetrics();
    expect(metrics).toContain('http_request_total');
    expect(metrics).toContain('http_request_duration_ms');
  });
});
