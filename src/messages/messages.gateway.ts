import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/chat',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private messagesService: MessagesService) {}

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.join(room);
    client.emit('joined', room);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave')
  handleLeave(@ConnectedSocket() client: Socket, @MessageBody() room: string) {
    client.leave(room);
    client.emit('left', room);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string; content: string; senderId: string; deviceId?: string; chatType: string },
  ) {
    const message = await this.messagesService.create({
      senderId: payload.senderId,
      content: payload.content,
      deviceId: payload.deviceId,
      chatType: payload.chatType as any,
      createdAt: new Date(),
    });

    this.server.to(payload.room).emit('message', {
      id: message.id,
      senderId: payload.senderId,
      content: payload.content,
      deviceId: payload.deviceId,
      chatType: payload.chatType,
      createdAt: message.createdAt,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { room: string; userId: string; isTyping: boolean },
  ) {
    client.to(payload.room).emit('typing', {
      userId: payload.userId,
      isTyping: payload.isTyping,
    });
  }
}
