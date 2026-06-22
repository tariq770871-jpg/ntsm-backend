import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, ChatType } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messageRepo: Repository<Message>,
  ) {}

  async findByDevice(deviceId: string, limit: number = 50): Promise<Message[]> {
    return this.messageRepo.find({
      where: { deviceId },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['sender', 'receiver'],
    });
  }

  async findByChatType(chatType: ChatType, userId: string, limit: number = 50): Promise<Message[]> {
    if (chatType === 'private') {
      return this.messageRepo.find({
        where: [
          { senderId: userId, chatType: 'private' },
          { receiverId: userId, chatType: 'private' },
        ],
        order: { createdAt: 'DESC' },
        take: limit,
        relations: ['sender', 'receiver'],
      });
    }

    return this.messageRepo.find({
      where: { chatType },
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['sender'],
    });
  }

  async create(data: Partial<Message>): Promise<Message> {
    const message = this.messageRepo.create(data);
    return this.messageRepo.save(message);
  }

  async markAsRead(messageId: string): Promise<Message> {
    await this.messageRepo.update(messageId, { isRead: true, readAt: new Date() });
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messageRepo.count({
      where: { receiverId: userId, isRead: false },
    });
  }
}
