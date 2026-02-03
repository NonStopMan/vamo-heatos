import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';
import type { Request, Response } from 'express';
import { MetricsService } from '../../metrics/metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const start = Date.now();

    const record = (statusCode: number) => {
      const durationMs = Date.now() - start;
      const route = request.route?.path ?? request.path ?? request.originalUrl;
      this.metrics.recordHttpRequest(
        request.method,
        route,
        statusCode,
        durationMs,
      );
    };

    return next.handle().pipe(
      tap(() => record(response.statusCode)),
      catchError((error) => {
        const statusCode =
          typeof (error as { status?: number })?.status === 'number'
            ? (error as { status: number }).status
            : response.statusCode;
        record(statusCode);
        throw error;
      }),
    );
  }
}
