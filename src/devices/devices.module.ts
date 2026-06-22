import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { PingService } from './ping.service';
import { Device } from './device.entity';
import { DeviceStatusHistory } from './device-status-history.entity';
import { MikrotikModule } from '../mikrotik/mikrotik.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, DeviceStatusHistory]),
    MikrotikModule,
  ],
  providers: [DevicesService, PingService],
  controllers: [DevicesController],
  exports: [DevicesService],
})
export class DevicesModule {}
