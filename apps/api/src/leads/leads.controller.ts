import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LeadCreateDto } from './dto';
import { LeadsService } from './leads.service';
import { LeadCreationResult } from './leads.types';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(201)
  async createLead(@Body() payload: LeadCreateDto): Promise<LeadCreationResult> {
    return this.leadsService.createLead(payload);
  }
}
