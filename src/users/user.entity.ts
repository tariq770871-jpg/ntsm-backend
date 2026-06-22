import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Device } from '../devices/device.entity';
import { CoordinateRequest } from '../coordinate-requests/coordinate-request.entity';
import { EngineerLocation } from '../engineer-locations/engineer-location.entity';
import { Message } from '../messages/message.entity';
import { MaintenanceLog } from '../maintenance-logs/maintenance-log.entity';

export type UserRole = 'admin' | 'support' | 'engineer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20, unique: true, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 20 })
  role: UserRole;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Device, d => d.assignedEngineer)
  assignedDevices: Device[];

  @OneToMany(() => CoordinateRequest, cr => cr.engineer)
  coordinateRequests: CoordinateRequest[];

  @OneToMany(() => EngineerLocation, el => el.engineer)
  locations: EngineerLocation[];

  @OneToMany(() => Message, m => m.sender)
  sentMessages: Message[];

  @OneToMany(() => MaintenanceLog, ml => ml.engineer)
  maintenanceLogs: MaintenanceLog[];
}
