import { Redis } from 'ioredis';

import { redisUrl } from './config';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 2,
  lazyConnect: true,
  connectTimeout: 5000,
  enableReadyCheck: false,
});

redis.on('error', () => {
  console.error('Redis connection unavailable');
});
