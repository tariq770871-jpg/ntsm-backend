import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Device } from '../devices/device.entity';

@Entity('maintenance_logs')
@Index(['deviceId'])
@Index(['engineerId'])
@Index(['createdAt'])
export class MaintenanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'device_id' })
  deviceId: string;

  @ManyToOne(() => Device, d => d.id)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ name: 'engineer_id' })
  engineerId: string;

  @ManyToOne(() => User, u => u.maintenanceLogs)
  @JoinColumn({ name: 'engineer_id' })
  engineer: User;

  @Column({ name: 'cost_fuel', type: 'decimal', precision: 10, scale: 2, default: 0 })
  costFuel: number;

  @Column({ name: 'cost_parts', type: 'decimal', precision: 10, scale: 2, default: 0 })
  costParts: number;

  @Column({ name: 'cost_other', type: 'decimal', precision: 10, scale: 2, default: 0 })
  costOther: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
