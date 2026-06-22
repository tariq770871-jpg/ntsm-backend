import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('device_status_history')
@Index(['deviceId'])
@Index(['checkedAt'])
export class DeviceStatusHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @CreateDateColumn({ name: 'checked_at' })
  checkedAt: Date;

  @Column({ name: 'latency_ms', type: 'int', nullable: true })
  latencyMs: number;

  @Column({ name: 'loss_percentage', type: 'decimal', precision: 5, scale: 2, nullable: true })
  lossPercentage: number;

  @Column({ name: 'rtt_min', type: 'decimal', precision: 10, scale: 3, nullable: true })
  rttMin: number;

  @Column({ name: 'rtt_max', type: 'decimal', precision: 10, scale: 3, nullable: true })
  rttMax: number;

  @Column({ name: 'rtt_avg', type: 'decimal', precision: 10, scale: 3, nullable: true })
  rttAvg: number;

  @Column({ name: 'session_id', length: 36, nullable: true })
  sessionId: string;

  @Column({ name: 'user_agent', length: 100, nullable: true })
  userAgent: string;

  @Column({ name: 'geo_country', length: 2, nullable: true })
  geoCountry: string;
}
