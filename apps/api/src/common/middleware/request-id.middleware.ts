import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const headerValue = req.headers[REQUEST_ID_HEADER];
  const incoming = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const requestId = incoming?.trim() ? incoming : randomUUID();

  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
};
