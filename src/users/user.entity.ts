import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ unique: true }) phone: string;
  @Column({ name: 'password_hash' }) password: string;
  @Column({ type: 'enum', enum: ['admin', 'support', 'engineer'], default: 'engineer' }) role: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
