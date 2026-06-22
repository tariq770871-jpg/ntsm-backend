import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoordinateRequest, RequestStatus } from './coordinate-request.entity';

@Injectable()
export class CoordinateRequestsService {
  constructor(
    @InjectRepository(CoordinateRequest) private requestRepo: Repository<CoordinateRequest>,
  ) {}

  async create(data: Partial<CoordinateRequest>): Promise<CoordinateRequest> {
    const request = this.requestRepo.create(data);
    return this.requestRepo.save(request);
  }

  async findAll(status?: RequestStatus): Promise<CoordinateRequest[]> {
    const where = status ? { status } : {};
    return this.requestRepo.find({
      where,
      relations: ['engineer', 'reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEngineer(engineerId: string): Promise<CoordinateRequest[]> {
    return this.requestRepo.find({
      where: { engineerId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<CoordinateRequest> {
    const request = await this.requestRepo.findOne({
      where: { id },
      relations: ['engineer', 'reviewer'],
    });
    if (!request) throw new NotFoundException('Request not found');
    return request;
  }

  async approve(id: string, reviewerId: string): Promise<CoordinateRequest> {
    await this.requestRepo.update(id, {
      status: 'approved',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    });
    return this.findById(id);
  }

  async reject(id: string, reviewerId: string, reason: string): Promise<CoordinateRequest> {
    await this.requestRepo.update(id, {
      status: 'rejected',
      reviewedBy: reviewerId,
      rejectionReason: reason,
      reviewedAt: new Date(),
    });
    return this.findById(id);
  }
}
