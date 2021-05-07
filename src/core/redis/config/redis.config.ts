import { registerAs } from '@nestjs/config';
import { RedisOptions } from 'ioredis';

export default registerAs('core-redis-config', () => ({
  options: JSON.parse(process.env.REDIS_CONFIGURATION) as RedisOptions,
}));
