import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Device, DeviceStatus } from './device.entity';
import { DeviceStatusHistory } from './device-status-history.entity';
import { MikrotikService } from '../mikrotik/mikrotik.service';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import * as ping from 'ping';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

interface NodeState {
  isUnstable: boolean;
  unstableDuration: number;
  pollInterval: number;
  lastStatus: DeviceStatus | null;
  lastEmitAt: number;
  consecutiveSuccess: number;
  lastCheckedAt: number;
  sessionId: string;
}

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class PingService {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(PingService.name);
  private readonly nodeStates = new Map<string, NodeState>();
  private readonly DEBOUNCE_MS = 3000;
  private readonly CIRCUIT_BREAKER_THRESHOLD_MS: number;
  private readonly MAX_POLL_INTERVAL_MS: number;
  private readonly BASE_POLL_INTERVAL_MS: number;
  private readonly PING_TIMEOUT: number;

  constructor(
    @InjectRepository(Device) private deviceRepo: Repository<Device>,
    @InjectRepository(DeviceStatusHistory) private historyRepo: Repository<DeviceStatusHistory>,
    private mikrotikService: MikrotikService,
    private config: ConfigService,
  ) {
    this.CIRCUIT_BREAKER_THRESHOLD_MS = parseInt(config.get('CIRCUIT_BREAKER_THRESHOLD', '300000'));
    this.MAX_POLL_INTERVAL_MS = parseInt(config.get('MAX_POLL_INTERVAL', '30000'));
    this.BASE_POLL_INTERVAL_MS = parseInt(config.get('PING_INTERVAL', '60000'));
    this.PING_TIMEOUT = parseInt(config.get('PING_TIMEOUT', '2000'));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkDevices() {
    const sessionId = uuidv4();
    const devices = await this.deviceRepo.find({ where: { status: 'online' } });

    for (const device of devices) {
      if (!device.ipAddress) continue;

      const state = this.getNodeState(device.id);
      state.sessionId = sessionId;

      // Circuit Breaker: تأخير تصاعدي إذا استمر عدم الاستقرار
      if (state.isUnstable && state.unstableDuration > this.CIRCUIT_BREAKER_THRESHOLD_MS) {
        state.pollInterval = Math.min(state.pollInterval * 1.5, this.MAX_POLL_INTERVAL_MS);
        this.logger.warn(`Circuit breaker: ${device.ipAddress} interval ${state.pollInterval}ms`);
      }

      // Jitter: تشويش عشوائي
      const jitterRange = state.isUnstable ? 400 : 2000;
      const jitter = (Math.random() - 0.5) * jitterRange;
      const delay = Math.max(0, state.pollInterval + jitter);

      setTimeout(async () => {
        await this.probeDevice(device, state);
      }, delay);
    }
  }

  private async probeDevice(device: Device, state: NodeState) {
    try {
      const probeResults: ping.PingResponse[] = [];
      for (let i = 0; i < 5; i++) {
        const res = await ping.promise.probe(device.ipAddress, { 
          timeout: this.PING_TIMEOUT / 1000,
          extra: ['-c', '1']
        });
        probeResults.push(res);
        if (!res.alive) break;
      }

      const successfulProbes = probeResults.filter(r => r.alive);
      const isAlive = successfulProbes.length > 0;
      const lossPercentage = ((5 - successfulProbes.length) / 5) * 100;

      const latencies = successfulProbes
        .map(r => r.time ? parseFloat(r.time) : null)
        .filter((t): t is number => t !== null);

      const rttMin = latencies.length > 0 ? Math.min(...latencies) : null;
      const rttMax = latencies.length > 0 ? Math.max(...latencies) : null;
      const rttAvg = latencies.length > 0 
        ? latencies.reduce((a, b) => a + b, 0) / latencies.length 
        : null;

      const latencyMs = latencies.length > 0 ? latencies[0] : null;

      await this.historyRepo.save({
        deviceId: device.id,
        status: isAlive ? 'online' : 'offline',
        checkedAt: new Date(),
        latencyMs,
        lossPercentage: Math.round(lossPercentage * 100) / 100,
        rttMin,
        rttMax,
        rttAvg: rttAvg ? Math.round(rttAvg * 100) / 100 : null,
        sessionId: state.sessionId,
        userAgent: 'NOC-PingService/1.0',
        geoCountry: 'YE',
      });

      if (isAlive) {
        state.consecutiveSuccess++;
        state.isUnstable = false;
        state.unstableDuration = 0;
        state.pollInterval = this.BASE_POLL_INTERVAL_MS;
        device.lastSeenAt = new Date();

        if (device.isMikrotikLinked) {
          try {
            const ssid = await this.mikrotikService.getSSID(device);
            if (ssid) device.ssid = ssid;
          } catch (e) {
            this.logger.warn(`MikroTik SSID failed for ${device.ipAddress}: ${e.message}`);
          }
        }
      } else {
        state.consecutiveSuccess = 0;
        state.isUnstable = true;
        state.unstableDuration += Date.now() - state.lastCheckedAt;

        if (device.status === 'online') {
          device.status = 'offline';
        }
      }

      state.lastCheckedAt = Date.now();

      const shouldEmit = state.lastStatus !== device.status || 
                        (Date.now() - state.lastEmitAt) > this.DEBOUNCE_MS;

      if (shouldEmit && this.server) {
        this.server.emit('device:status', {
          deviceId: device.id,
          status: device.status,
          ssid: device.ssid,
          latencyMs,
          lossPercentage: Math.round(lossPercentage * 100) / 100,
          rttMin,
          rttMax,
          rttAvg: rttAvg ? Math.round(rttAvg * 100) / 100 : null,
          timestamp: new Date().toISOString(),
          sessionId: state.sessionId,
        });
        state.lastEmitAt = Date.now();
        state.lastStatus = device.status;
      }

      await this.deviceRepo.save(device);

    } catch (e) {
      this.logger.error(`Probe failed ${device.ipAddress}: ${e.message}`);
      state.consecutiveSuccess = 0;
      state.isUnstable = true;
    }
  }

  private getNodeState(deviceId: string): NodeState {
    if (!this.nodeStates.has(deviceId)) {
      this.nodeStates.set(deviceId, {
        isUnstable: false,
        unstableDuration: 0,
        pollInterval: this.BASE_POLL_INTERVAL_MS,
        lastStatus: null,
        lastEmitAt: 0,
        consecutiveSuccess: 0,
        lastCheckedAt: Date.now(),
        sessionId: '',
      });
    }
    return this.nodeStates.get(deviceId)!;
  }
}
