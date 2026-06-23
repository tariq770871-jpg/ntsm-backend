import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private devicesRepo: Repository<Device>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.devicesRepo.findAndCount({ skip, take: limit, order: { id: 'DESC' } });
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getStats() {
    const total = await this.devicesRepo.count();
    const online = await this.devicesRepo.count({ where: { status: 'online' } });
    const offline = await this.devicesRepo.count({ where: { status: 'offline' } });
    const archived = await this.devicesRepo.count({ where: { status: 'archived' } });
    return { total, online, offline, archived };
  }

  create(data: any) { return this.devicesRepo.save(data); }
  update(id: string, data: any) { return this.devicesRepo.update(id, data); }
  remove(id: string) { return this.devicesRepo.delete(id); }
}
