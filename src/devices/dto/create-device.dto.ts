import { IsString, IsNotEmpty, IsOptional, IsIP } from 'class-validator';

export class CreateDeviceDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() location: string;
  @IsIP() @IsNotEmpty() ip: string;
  @IsString() @IsNotEmpty() type: string;
  @IsString() @IsOptional() status?: string;
}
