import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { MessagesModule } from './messages/messages.module';
import { EngineerLocationsModule } from './engineer-locations/engineer-locations.module';
import { CoordinateRequestsModule } from './coordinate-requests/coordinate-requests.module';
import { MaintenanceLogsModule } from './maintenance-logs/maintenance-logs.module';
import { MikrotikModule } from './mikrotik/mikrotik.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    DevicesModule,
    MessagesModule,
    EngineerLocationsModule,
    CoordinateRequestsModule,
    MaintenanceLogsModule,
    MikrotikModule,
    HealthModule,
  ],
})
export class AppModule {}
