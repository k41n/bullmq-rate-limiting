import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { DelayedError, Job } from 'bullmq';
import { RateLimiterOptions, RateLimiterService } from './rate-limiter.service';
import { Logger } from '@nestjs/common';

const rateLimiterOptions: Record<string, RateLimiterOptions> = {
  key1: {
    intervalMs: 15000,
    limit: 1,
  },
  key2: {
    intervalMs: 10000,
    limit: 1,
  },
  key3: {
    intervalMs: 5000,
    limit: 1,
  },
};

@Processor('rate-limited-queue')
export class AppProcessor extends WorkerHost {
  private logger = new Logger('PROCESSOR');
  constructor(private rateLimiterService: RateLimiterService) {
    super();
  }

  async process(job: Job<any, any, string>, token: string): Promise<any> {
    const key = job.data.key;
    const optionsPerKey = rateLimiterOptions[key];
    if (await this.rateLimiterService.getToken(key, optionsPerKey)) {
      this.logger.log(`Job ${job.data.key} is being processed!`);
    } else {
      await job.moveToDelayed(
        Date.now() + optionsPerKey.intervalMs / 1000,
        token,
      );
      throw new DelayedError();
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<any, any, string>) {
    this.logger.log(`Job ${job.data.key} completed!`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<any, any, string>) {
    this.logger.log(`Job ${job.data.key} failed!`);
  }
}
