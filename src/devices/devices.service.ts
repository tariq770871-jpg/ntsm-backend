import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { Device, DeviceStatus } from './device.entity';
import { DeviceStatusHistory } from './device-status-history.entity';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device) private deviceRepo: Repository<Device>,
    @InjectRepository(DeviceStatusHistory) private historyRepo: Repository<DeviceStatusHistory>,
  ) {}

  async findAll(): Promise<Device[]> {
    return this.deviceRepo.find({ relations: ['assignedEngineer'] });
  }

  async findById(id: string): Promise<Device> {
    const device = await this.deviceRepo.findOne({ where: { id }, relations: ['assignedEngineer'] });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  async findByEngineer(engineerId: string): Promise<Device[]> {
    return this.deviceRepo.find({ where: { assignedEngineerId: engineerId }, relations: ['assignedEngineer'] });
  }

  async create(data: Partial<Device>): Promise<Device> {
    const device = this.deviceRepo.create(data);
    return this.deviceRepo.save(device);
  }

  async update(id: string, data: Partial<Device>): Promise<Device> {
    await this.deviceRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.deviceRepo.delete(id);
  }

  async archiveOldDevices(): Promise<number> {
    const seventyTwoDaysAgo = new Date();
    seventyTwoDaysAgo.setDate(seventyTwoDaysAgo.getDate() - 72);

    const result = await this.deviceRepo.update(
      { status: 'offline', lastSeenAt: LessThan(seventyTwoDaysAgo), archivedAt: IsNull() },
      { status: 'archived', archivedAt: new Date() },
    );

    return result.affected || 0;
  }

  async getHistory(deviceId: string, limit: number = 100): Promise<DeviceStatusHistory[]> {
    return this.historyRepo.find({
      where: { deviceId },
      order: { checkedAt: 'DESC' },
      take: limit,
    });
  }

  async getStats(): Promise<{ total: number; online: number; offline: number; archived: number }> {
    const [total, online, offline, archived] = await Promise.all([
      this.deviceRepo.count(),
      this.deviceRepo.count({ where: { status: 'online' } }),
      this.deviceRepo.count({ where: { status: 'offline' } }),
      this.deviceRepo.count({ where: { status: 'archived' } }),
    ]);
    return { total, online, offline, archived };
  }
}
