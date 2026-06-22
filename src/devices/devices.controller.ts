import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DevicesService } from './devices.service';
import { Device } from './device.entity';

@Controller('devices')
@UseGuards(AuthGuard('jwt'))
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Get()
  async findAll(): Promise<Device[]> {
    return this.devicesService.findAll();
  }

  @Get('stats')
  async getStats() {
    return this.devicesService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Device> {
    return this.devicesService.findById(id);
  }

  @Get('engineer/:engineerId')
  async findByEngineer(@Param('engineerId') engineerId: string): Promise<Device[]> {
    return this.devicesService.findByEngineer(engineerId);
  }

  @Post()
  async create(@Body() data: Partial<Device>): Promise<Device> {
    return this.devicesService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<Device>): Promise<Device> {
    return this.devicesService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.devicesService.delete(id);
  }

  @Get(':id/history')
  async getHistory(@Param('id') id: string, @Query('limit') limit: number): Promise<any[]> {
    return this.devicesService.getHistory(id, limit || 100);
  }

  @Post('archive/run')
  async runArchive(): Promise<{ archived: number }> {
    const count = await this.devicesService.archiveOldDevices();
    return { archived: count };
  }
}
