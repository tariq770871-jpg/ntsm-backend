import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Device } from '../devices/device.entity';
import * as CryptoJS from 'crypto-js';
const { RouterOSAPI } = require('node-routeros');

@Injectable()
export class MikrotikService {
  private readonly logger = new Logger(MikrotikService.name);
  private readonly encryptionKey: string;

  constructor(private config: ConfigService) {
    this.encryptionKey = this.config.get('MIKROTIK_ENCRYPTION_KEY', 'default_key_change_me');
  }

  async getSSID(device: Device): Promise<string | null> {
    if (!device.isMikrotikLinked || !device.ipAddress) return null;

    const password = this.decrypt(device.mikrotikPasswordEncrypted || '');
    if (!password) {
      this.logger.warn(`No password for ${device.ipAddress}`);
      return null;
    }

    const conn = new RouterOSAPI({
      host: device.ipAddress,
      port: device.mikrotikApiPort || 8728,
      user: device.mikrotikUsername || 'monitor',
      password: password,
      timeout: 5000,
    });

    try {
      await conn.connect();
      const interfaces = await conn.write('/interface/wireless/print');
      await conn.close();

      const running = interfaces.find((i: any) => 
        i.status === 'running' || i['running'] === 'true' || i.disabled === 'false'
      );

      return running?.ssid || running?.['ssid'] || running?.['name'] || null;
    } catch (e: any) {
      this.logger.error(`MikroTik error ${device.ipAddress}: ${e.message}`);
      return null;
    }
  }

  async testConnection(device: Device): Promise<{ success: boolean; ssid?: string; error?: string }> {
    try {
      const ssid = await this.getSSID(device);
      return { success: !!ssid, ssid: ssid || undefined };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  private decrypt(encrypted: string): string {
    if (!encrypted) return '';
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return '';
    }
  }

  encrypt(plain: string): string {
    return CryptoJS.AES.encrypt(plain, this.encryptionKey).toString();
  }
}
