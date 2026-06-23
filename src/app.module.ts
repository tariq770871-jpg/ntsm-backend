import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';
import { MikrotikModule } from './mikrotik/mikrotik.module';
import { MaintenanceLogsModule } from './maintenance-logs/maintenance-logs.module';
import { MessagesModule } from './messages/messages.module';
import { EngineerLocationsModule } from './engineer-locations/engineer-locations.module';
import { CoordinateRequestsModule } from './coordinate-requests/coordinate-requests.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
      migrations: ['dist/migrations/*{.ts,.js}'],
      migrationsRun: process.env.NODE_ENV === 'production',
    }),
    AuthModule, UsersModule, DevicesModule, MikrotikModule,
    MaintenanceLogsModule, MessagesModule, EngineerLocationsModule,
    CoordinateRequestsModule, HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
