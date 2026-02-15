import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap } from 'rxjs';
import type { Request, Response } from 'express';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const start = Date.now();

    const logRequest = (statusCode: number, error?: unknown) => {
      const durationMs = Date.now() - start;
      const logPayload = {
        requestId: request.requestId,
        method: request.method,
        path: request.originalUrl,
        statusCode,
        durationMs,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };

      if (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(JSON.stringify({ ...logPayload, error: errorMessage }));
        return;
      }

      this.logger.log(JSON.stringify(logPayload));
    };

    return next.handle().pipe(
      tap(() => logRequest(response.statusCode)),
      catchError((error) => {
        const statusCode =
          typeof (error as { status?: number })?.status === 'number'
            ? (error as { status: number }).status
            : response.statusCode;
        logRequest(statusCode, error);
        throw error;
      }),
    );
  }
}
