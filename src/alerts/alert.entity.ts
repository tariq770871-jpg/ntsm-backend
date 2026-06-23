import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() message: string;
  @Column({ type: 'enum', enum: ['critical', 'warning', 'info'], default: 'info' }) type: string;
  @Column({ default: 'unread' }) status: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
