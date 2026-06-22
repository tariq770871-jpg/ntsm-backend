import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth.token || client.handshake.query.token;

    if (!token) throw new WsException('Missing token');

    try {
      const payload = this.jwtService.verify(token, { secret: this.config.get('JWT_SECRET') });
      client.user = payload;
      return true;
    } catch {
      throw new WsException('Invalid token');
    }
  }
}
