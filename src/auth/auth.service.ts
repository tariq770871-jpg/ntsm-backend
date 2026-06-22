import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

export interface LoginResult {
  access_token: string;
  user: Pick<User, 'id' | 'name' | 'role' | 'phone'>;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByPhone(phone);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      return user;
    }
    return null;
  }

  async login(phone: string, password: string): Promise<LoginResult> {
    const user = await this.validateUser(phone, password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  async register(name: string, phone: string, password: string, role: string): Promise<LoginResult> {
    const hashed = await bcrypt.hash(password, 12);
    const user = await this.usersService.create({ name, phone, passwordHash: hashed, role });
    return this.login(phone, password);
  }
}
