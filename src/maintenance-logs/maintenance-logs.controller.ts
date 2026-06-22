import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MaintenanceLogsService } from './maintenance-logs.service';
import { MaintenanceLog } from './maintenance-log.entity';

@Controller('maintenance-logs')
@UseGuards(AuthGuard('jwt'))
export class MaintenanceLogsController {
  constructor(private logsService: MaintenanceLogsService) {}

  @Get()
  async findAll(@Query('limit') limit: number): Promise<MaintenanceLog[]> {
    return this.logsService.findAll(limit || 50);
  }

  @Get('device/:deviceId')
  async findByDevice(@Param('deviceId') deviceId: string, @Query('limit') limit: number): Promise<MaintenanceLog[]> {
    return this.logsService.findByDevice(deviceId, limit || 50);
  }

  @Get('engineer/:engineerId')
  async findByEngineer(@Param('engineerId') engineerId: string, @Query('limit') limit: number): Promise<MaintenanceLog[]> {
    return this.logsService.findByEngineer(engineerId, limit || 50);
  }

  @Post()
  async create(@Body() data: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
    return this.logsService.create(data);
  }

  @Get('device/:deviceId/costs')
  async getCostsByDevice(@Param('deviceId') deviceId: string): Promise<any> {
    return this.logsService.getCostsByDevice(deviceId);
  }

  @Get('costs/range')
  async getCostsByRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ): Promise<any> {
    return this.logsService.getCostsByDateRange(new Date(start), new Date(end));
  }
}
