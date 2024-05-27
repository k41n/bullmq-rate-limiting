import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { JobProducerService } from './job-producer.service';
import { RateLimiterService } from './rate-limiter.service';
import { AppProcessor } from './app.processor';
import { RedisProvider } from './redis.provider';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'rate-limited-queue',
    }),
  ],
  controllers: [AppController],
  providers: [
    AppProcessor,
    AppService,
    JobProducerService,
    RateLimiterService,
    RedisProvider,
  ],
})
export class AppModule {
  constructor(private jobProducerService: JobProducerService) {}

  onModuleInit() {
    this.jobProducerService.addJobs();
  }
}
