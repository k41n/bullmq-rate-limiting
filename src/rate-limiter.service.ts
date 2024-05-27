import { Inject, Injectable } from '@nestjs/common';
import { RedisClient } from './redis.provider';

export type RateLimiterOptions = {
  intervalMs: number;
  limit: number;
};

@Injectable()
export class RateLimiterService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClient,
  ) {}

  async getToken(key: string, options: RateLimiterOptions): Promise<boolean> {
    const tokenKey = `rate-limiter:${key}}`;
    const usedTokens = Number(await this.redisClient.get(tokenKey));
    if (usedTokens >= options.limit) return false;
    this.redisClient
      .multi()
      .incr(tokenKey)
      .pexpire(tokenKey, options.intervalMs, 'NX')
      .exec();

    return true;
  }
}
