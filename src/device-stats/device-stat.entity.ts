import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from '../devices/device.entity';

@Entity('device_stats')
export class DeviceStat {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' }) device: Device;
  @Column({ type: 'int' }) cpu: number;
  @Column({ type: 'int' }) memory: number;
  @Column() uptime: string;
  @CreateDateColumn({ name: 'checked_at' }) checkedAt: Date;
}
