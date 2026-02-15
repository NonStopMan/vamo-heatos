import {
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { ApiKeyGuard } from './api-key.guard';
import { PUBLIC_KEY } from './public.decorator';

describe('ApiKeyGuard', () => {
  const buildContext = (headers: Record<string, string | undefined>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
      getHandler: () => 'handler',
      getClass: () => 'class',
    }) as ExecutionContext;

  it('throws when API_KEY is missing', () => {
    const guard = new ApiKeyGuard(
      { get: () => undefined } as ConfigService,
      { getAllAndOverride: () => false } as Reflector,
    );
    const context = buildContext({ 'x-api-key': 'test' });

    expect(() => guard.canActivate(context)).toThrow(InternalServerErrorException);
  });

  it('rejects when API key does not match', () => {
    const guard = new ApiKeyGuard(
      { get: () => 'expected' } as ConfigService,
      { getAllAndOverride: () => false } as Reflector,
    );
    const context = buildContext({ 'x-api-key': 'wrong' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('accepts when API key matches', () => {
    const guard = new ApiKeyGuard(
      { get: () => 'expected' } as ConfigService,
      { getAllAndOverride: () => false } as Reflector,
    );
    const context = buildContext({ 'x-api-key': 'expected' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('accepts when API key matches via Authorization header', () => {
    const guard = new ApiKeyGuard(
      { get: () => 'expected' } as ConfigService,
      { getAllAndOverride: () => false } as Reflector,
    );
    const context = buildContext({ authorization: 'ApiKey expected' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows requests marked as public', () => {
    const guard = new ApiKeyGuard(
      { get: () => undefined } as ConfigService,
      {
        getAllAndOverride: (key: string) =>
          key === PUBLIC_KEY ? true : false,
      } as Reflector,
    );
    const context = buildContext({});

    expect(guard.canActivate(context)).toBe(true);
  });
});
