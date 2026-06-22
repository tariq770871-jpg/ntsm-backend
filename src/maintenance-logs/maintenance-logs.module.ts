import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceLogsService } from './maintenance-logs.service';
import { MaintenanceLogsController } from './maintenance-logs.controller';
import { MaintenanceLog } from './maintenance-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceLog])],
  providers: [MaintenanceLogsService],
  controllers: [MaintenanceLogsController],
  exports: [MaintenanceLogsService],
})
export class MaintenanceLogsModule {}
