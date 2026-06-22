import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EngineerLocationsService } from './engineer-locations.service';
import { EngineerLocation } from './engineer-location.entity';

@Controller('engineer-locations')
@UseGuards(AuthGuard('jwt'))
export class EngineerLocationsController {
  constructor(private locationsService: EngineerLocationsService) {}

  @Post()
  async create(@Body() data: Partial<EngineerLocation>): Promise<EngineerLocation> {
    return this.locationsService.create(data);
  }

  @Get('engineer/:engineerId')
  async findByEngineer(
    @Param('engineerId') engineerId: string,
    @Query('limit') limit: number,
  ): Promise<EngineerLocation[]> {
    return this.locationsService.findByEngineer(engineerId, limit || 100);
  }

  @Get('engineer/:engineerId/latest')
  async findLatest(@Param('engineerId') engineerId: string): Promise<EngineerLocation | null> {
    return this.locationsService.findLatest(engineerId);
  }

  @Get('all/latest')
  async findAllLatest(): Promise<EngineerLocation[]> {
    return this.locationsService.findAllLatest();
  }

  @Delete('cleanup')
  async cleanup(@Query('days') days: number): Promise<{ deleted: number }> {
    const deleted = await this.locationsService.cleanupOld(days || 7);
    return { deleted };
  }
}
