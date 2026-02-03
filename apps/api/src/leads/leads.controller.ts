import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { Public } from '../common/guards/public.decorator';
import { LeadCreateDto } from './dto';
import { LeadsService } from './leads.service';
import { LeadCreationResult } from './leads.types';

@Controller('leads')
@UseGuards(ApiKeyGuard)
@Throttle({ default: { limit: 10, ttl: 60 } })
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(201)
  @Public()
  async createLead(
    @Body() payload: LeadCreateDto,
    @Req() request: Request,
  ): Promise<LeadCreationResult> {
    return this.leadsService.createLead(payload, {
      requestId: request.requestId,
      sourceIp: this.resolveSourceIp(request),
      userAgent: request.headers['user-agent'],
    });
  }

  private resolveSourceIp(request: Request): string | undefined {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.trim()) {
      return forwarded.split(',')[0]?.trim();
    }
    return request.ip;
  }
}
