import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.devicesService.findAll(+page, +limit);
  }

  @Get('stats')
  getStats() {
    return this.devicesService.getStats();
  }

  @Post()
  create(@Body() body: CreateDeviceDto) {
    return this.devicesService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateDeviceDto) {
    return this.devicesService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }
}
