import { Controller, Get, Post, Body, Param, Put, UseGuards, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';
import { Message } from './message.entity';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('device/:deviceId')
  async findByDevice(@Param('deviceId') deviceId: string, @Query('limit') limit: number): Promise<Message[]> {
    return this.messagesService.findByDevice(deviceId, limit || 50);
  }

  @Get('chat/:type')
  async findByChatType(
    @Param('type') type: 'device' | 'team' | 'private',
    @Query('userId') userId: string,
    @Query('limit') limit: number,
  ): Promise<Message[]> {
    return this.messagesService.findByChatType(type, userId, limit || 50);
  }

  @Post()
  async create(@Body() data: Partial<Message>): Promise<Message> {
    return this.messagesService.create(data);
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string): Promise<Message> {
    return this.messagesService.markAsRead(id);
  }

  @Get('unread/:userId')
  async getUnreadCount(@Param('userId') userId: string): Promise<{ count: number }> {
    const count = await this.messagesService.getUnreadCount(userId);
    return { count };
  }
}
