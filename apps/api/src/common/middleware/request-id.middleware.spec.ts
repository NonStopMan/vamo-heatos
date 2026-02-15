import type { Request, Response } from 'express';
import { requestIdMiddleware, REQUEST_ID_HEADER } from './request-id.middleware';

describe('requestIdMiddleware', () => {
  it('adds a request id when missing', () => {
    const req = { headers: {} } as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;
    const next = jest.fn();

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBeDefined();
    expect(res.setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, req.requestId);
    expect(next).toHaveBeenCalled();
  });

  it('reuses incoming request id', () => {
    const req = { headers: { [REQUEST_ID_HEADER]: 'req-123' } } as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;
    const next = jest.fn();

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBe('req-123');
    expect(res.setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, 'req-123');
  });
});
