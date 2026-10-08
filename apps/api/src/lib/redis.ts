import { Redis } from 'ioredis';

import { redisUrl } from './config';
import { attachRedisDiagnostics, redisOptions } from './redis-connection';

export const redis = new Redis(redisUrl, redisOptions(redisUrl));
attachRedisDiagnostics(redis);
