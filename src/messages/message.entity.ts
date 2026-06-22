import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../users/user.entity';
import { Device } from '../devices/device.entity';

export type ChatType = 'device' | 'team' | 'private';

@Entity('messages')
@Index(['senderId'])
@Index(['receiverId'])
@Index(['deviceId'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sender_id' })
  senderId: string;

  @ManyToOne(() => User, u => u.sentMessages)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'receiver_id', nullable: true })
  receiverId: string;

  @ManyToOne(() => User, u => u.sentMessages)
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ name: 'device_id', nullable: true })
  deviceId: string;

  @ManyToOne(() => Device, d => d.id)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'varchar', length: 20 })
  chatType: ChatType;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'attachment_url', length: 255, nullable: true })
  attachmentUrl: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
