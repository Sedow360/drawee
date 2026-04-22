import redis from '../redis/client';
import { ROOM_TTL } from '../redis/roomRepository';

export const startCleanupJob = () => {
  setInterval(async () => {
    const keys = await redis.keys('room:*:strokes');
    for (const key of keys) {
      const raw = await redis.lrange(key, 0, -1);
      const cleaned = raw.filter(s => !JSON.parse(s).isDeleted);
      if (cleaned.length === raw.length) continue;
      await redis.multi().del(key).rpush(key, ...cleaned).expire(key, ROOM_TTL).exec();
    }
  }, 5 * 60 * 1000);
};