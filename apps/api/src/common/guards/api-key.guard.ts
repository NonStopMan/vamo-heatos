import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PUBLIC_KEY } from './public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const expected = this.config.get<string>('API_KEY');

    if (!expected) {
      this.logger.error('API_KEY is missing; rejecting request');
      throw new InternalServerErrorException({
        reason: 'Internal Server Error',
        issues: [],
      });
    }

    const provided = this.extractApiKey(request);
    if (!provided || provided !== expected) {
      throw new UnauthorizedException({
        reason: 'Unauthorized',
        issues: ['invalid api key'],
      });
    }

    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    const headerValue = request.headers['x-api-key'];
    if (typeof headerValue === 'string' && headerValue.trim()) {
      return headerValue.trim();
    }

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme?.toLowerCase() === 'apikey' && token?.trim()) {
      return token.trim();
    }

    return undefined;
  }
}
