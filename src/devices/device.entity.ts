import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() location: string;
  @Column() ip: string;
  @Column() type: string;
  @Column({ default: 'offline' }) status: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
