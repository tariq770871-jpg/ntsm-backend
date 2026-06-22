import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { EngineerLocation } from './engineer-location.entity';

@Injectable()
export class EngineerLocationsService {
  constructor(
    @InjectRepository(EngineerLocation) private locationRepo: Repository<EngineerLocation>,
  ) {}

  async create(data: Partial<EngineerLocation>): Promise<EngineerLocation> {
    const location = this.locationRepo.create(data);
    return this.locationRepo.save(location);
  }

  async findByEngineer(engineerId: string, limit: number = 100): Promise<EngineerLocation[]> {
    return this.locationRepo.find({
      where: { engineerId },
      order: { recordedAt: 'DESC' },
      take: limit,
    });
  }

  async findLatest(engineerId: string): Promise<EngineerLocation | null> {
    return this.locationRepo.findOne({
      where: { engineerId },
      order: { recordedAt: 'DESC' },
    });
  }

  async findAllLatest(): Promise<EngineerLocation[]> {
    const subQuery = this.locationRepo
      .createQueryBuilder('loc')
      .select('MAX(loc.recorded_at)', 'maxDate')
      .addSelect('loc.engineer_id', 'engineerId')
      .groupBy('loc.engineer_id');

    return this.locationRepo
      .createQueryBuilder('el')
      .innerJoin(
        '(' + subQuery.getQuery() + ')',
        'latest',
        'el.engineer_id = latest.engineerId AND el.recorded_at = latest.maxDate',
      )
      .getMany();
  }

  async cleanupOld(days: number = 7): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const result = await this.locationRepo.delete({
      recordedAt: LessThan(cutoff),
    });

    return result.affected || 0;
  }
}
