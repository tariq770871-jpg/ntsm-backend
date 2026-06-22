import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EngineerLocationsService } from './engineer-locations.service';
import { EngineerLocationsController } from './engineer-locations.controller';
import { EngineerLocation } from './engineer-location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EngineerLocation])],
  providers: [EngineerLocationsService],
  controllers: [EngineerLocationsController],
  exports: [EngineerLocationsService],
})
export class EngineerLocationsModule {}
