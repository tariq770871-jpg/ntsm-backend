import { Controller, Get, Post, Body, Param, Put, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CoordinateRequestsService } from './coordinate-requests.service';
import { CoordinateRequest } from './coordinate-request.entity';

@Controller('coordinate-requests')
@UseGuards(AuthGuard('jwt'))
export class CoordinateRequestsController {
  constructor(private requestsService: CoordinateRequestsService) {}

  @Get()
  async findAll(@Query('status') status?: 'pending' | 'approved' | 'rejected'): Promise<CoordinateRequest[]> {
    return this.requestsService.findAll(status);
  }

  @Get('engineer/:engineerId')
  async findByEngineer(@Param('engineerId') engineerId: string): Promise<CoordinateRequest[]> {
    return this.requestsService.findByEngineer(engineerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CoordinateRequest> {
    return this.requestsService.findById(id);
  }

  @Post()
  async create(@Body() data: Partial<CoordinateRequest>): Promise<CoordinateRequest> {
    return this.requestsService.create(data);
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string, @Body('reviewerId') reviewerId: string): Promise<CoordinateRequest> {
    return this.requestsService.approve(id, reviewerId);
  }

  @Put(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body('reviewerId') reviewerId: string,
    @Body('reason') reason: string,
  ): Promise<CoordinateRequest> {
    return this.requestsService.reject(id, reviewerId, reason);
  }
}
