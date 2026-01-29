import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

const normalizeIssues = (message: unknown): string[] => {
  if (Array.isArray(message)) {
    return message.map((item) => String(item));
  }
  if (typeof message === 'string') {
    return [message];
  }
  return [];
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const payload = exceptionResponse as { message?: unknown; reason?: string; issues?: string[] };
        if (payload.reason || payload.issues) {
          response.status(status).json({
            reason: payload.reason ?? 'Request Error',
            issues: payload.issues ?? normalizeIssues(payload.message),
          });
          return;
        }

        response.status(status).json({
          reason: status === HttpStatus.BAD_REQUEST ? 'Validation Error' : exception.message,
          issues: normalizeIssues(payload.message),
        });
        return;
      }

      response.status(status).json({
        reason: exception.message,
        issues: [],
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      reason: 'Internal Server Error',
      issues: [],
    });
  }
}
