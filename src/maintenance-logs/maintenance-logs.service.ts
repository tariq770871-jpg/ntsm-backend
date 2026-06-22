import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MaintenanceLog } from './maintenance-log.entity';

@Injectable()
export class MaintenanceLogsService {
  constructor(
    @InjectRepository(MaintenanceLog) private logRepo: Repository<MaintenanceLog>,
  ) {}

  async create(data: Partial<MaintenanceLog>): Promise<MaintenanceLog> {
    const log = this.logRepo.create(data);
    return this.logRepo.save(log);
  }

  async findByDevice(deviceId: string, limit: number = 50): Promise<MaintenanceLog[]> {
    return this.logRepo.find({
      where: { deviceId },
      relations: ['engineer', 'device'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findByEngineer(engineerId: string, limit: number = 50): Promise<MaintenanceLog[]> {
    return this.logRepo.find({
      where: { engineerId },
      relations: ['device'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async findAll(limit: number = 50): Promise<MaintenanceLog[]> {
    return this.logRepo.find({
      relations: ['engineer', 'device'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getCostsByDevice(deviceId: string): Promise<{ fuel: number; parts: number; other: number; total: number }> {
    const logs = await this.logRepo.find({ where: { deviceId } });
    const fuel = logs.reduce((sum, l) => sum + Number(l.costFuel), 0);
    const parts = logs.reduce((sum, l) => sum + Number(l.costParts), 0);
    const other = logs.reduce((sum, l) => sum + Number(l.costOther), 0);
    return { fuel, parts, other, total: fuel + parts + other };
  }

  async getCostsByDateRange(start: Date, end: Date): Promise<{ fuel: number; parts: number; other: number; total: number }> {
    const logs = await this.logRepo.find({
      where: { createdAt: Between(start, end) },
    });
    const fuel = logs.reduce((sum, l) => sum + Number(l.costFuel), 0);
    const parts = logs.reduce((sum, l) => sum + Number(l.costParts), 0);
    const other = logs.reduce((sum, l) => sum + Number(l.costOther), 0);
    return { fuel, parts, other, total: fuel + parts + other };
  }
}
