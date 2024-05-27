import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class JobProducerService {
  constructor(@InjectQueue('rate-limited-queue') private appQueue: Queue) {}

  async addJobs() {
    console.log('Adding jobs');
    for (let i = 0; i < 10; i++) {
      await this.appQueue.add('key1', { key: 'key1' });
      await this.appQueue.add('key2', { key: 'key2' });
      await this.appQueue.add('key3', { key: 'key3' });
    }
  }
}
