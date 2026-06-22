import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoordinateRequestsService } from './coordinate-requests.service';
import { CoordinateRequestsController } from './coordinate-requests.controller';
import { CoordinateRequest } from './coordinate-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoordinateRequest])],
  providers: [CoordinateRequestsService],
  controllers: [CoordinateRequestsController],
  exports: [CoordinateRequestsService],
})
export class CoordinateRequestsModule {}
