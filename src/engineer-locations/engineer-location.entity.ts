import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('engineer_locations')
@Index(['engineerId'])
@Index(['recordedAt'])
export class EngineerLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'engineer_id' })
  engineerId: string;

  @ManyToOne(() => User, u => u.locations)
  @JoinColumn({ name: 'engineer_id' })
  engineer: User;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  lat: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  lng: number;

  @Column({ name: 'accuracy_meters', type: 'int', nullable: true })
  accuracyMeters: number;

  @Column({ name: 'battery_level', type: 'int', nullable: true })
  batteryLevel: number;

  @CreateDateColumn({ name: 'recorded_at' })
  recordedAt: Date;
}
