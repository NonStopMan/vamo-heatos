import { BadRequestException, ConflictException, HttpStatus } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const buildHost = () => {
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const host = {
      switchToHttp: () => ({ getResponse: () => response }),
    } as never;
    return { host, response };
  };

  it('maps validation errors to ErrorResponse', () => {
    const filter = new HttpExceptionFilter();
    const { host, response } = buildHost();

    filter.catch(
      new BadRequestException({ message: ['firstName should not be empty'] }),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(response.json).toHaveBeenCalledWith({
      reason: 'Validation Error',
      issues: ['firstName should not be empty'],
    });
  });

  it('preserves provided reason/issues for conflict', () => {
    const filter = new HttpExceptionFilter();
    const { host, response } = buildHost();

    filter.catch(
      new ConflictException({ reason: 'Already Exists', issues: ['lead already exists'] }),
      host,
    );

    expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(response.json).toHaveBeenCalledWith({
      reason: 'Already Exists',
      issues: ['lead already exists'],
    });
  });
});
