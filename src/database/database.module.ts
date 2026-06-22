import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Device } from '../devices/device.entity';
import { DeviceStatusHistory } from '../devices/device-status-history.entity';
import { CoordinateRequest } from '../coordinate-requests/coordinate-request.entity';
import { EngineerLocation } from '../engineer-locations/engineer-location.entity';
import { Message } from '../messages/message.entity';
import { MaintenanceLog } from '../maintenance-logs/maintenance-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [
          User, Device, DeviceStatusHistory, CoordinateRequest,
          EngineerLocation, Message, MaintenanceLog,
        ],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
        ssl: config.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
