import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

@Entity('coordinate_requests')
@Index(['status'])
@Index(['engineerId'])
export class CoordinateRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'engineer_id' })
  engineerId: string;

  @ManyToOne(() => User, u => u.coordinateRequests)
  @JoinColumn({ name: 'engineer_id' })
  engineer: User;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  lng: number;

  @Column({ name: 'device_name', length: 100, nullable: true })
  deviceName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'photo_url', length: 255, nullable: true })
  photoUrl: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: RequestStatus;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string;

  @ManyToOne(() => User, u => u.id)
  @JoinColumn({ name: 'reviewed_by' })
  reviewer: User;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt: Date;
}
