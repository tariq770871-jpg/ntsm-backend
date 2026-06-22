import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

export type DeviceStatus = 'online' | 'offline' | 'archived';
export type DeviceType = 'mikrotik' | 'modem' | 'router' | 'tower';

@Entity('devices')
@Index(['status'])
@Index(['assignedEngineerId'])
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  ssid: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  type: DeviceType;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  lng: number;

  @Column({ type: 'varchar', length: 20, default: 'offline' })
  status: DeviceStatus;

  @Column({ name: 'is_mikrotik_linked', default: false })
  isMikrotikLinked: boolean;

  @Column({ name: 'mikrotik_username', length: 100, nullable: true })
  mikrotikUsername: string;

  @Column({ name: 'mikrotik_password_encrypted', type: 'text', nullable: true })
  mikrotikPasswordEncrypted: string;

  @Column({ name: 'mikrotik_api_port', type: 'int', default: 8728 })
  mikrotikApiPort: number;

  @Column({ name: 'last_seen_at', type: 'timestamp', nullable: true })
  lastSeenAt: Date;

  @Column({ name: 'archived_at', type: 'timestamp', nullable: true })
  archivedAt: Date;

  @Column({ name: 'assigned_engineer_id', nullable: true })
  assignedEngineerId: string;

  @ManyToOne(() => User, u => u.assignedDevices)
  @JoinColumn({ name: 'assigned_engineer_id' })
  assignedEngineer: User;

  @Column({ name: 'location_description', type: 'text', nullable: true })
  locationDescription: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
