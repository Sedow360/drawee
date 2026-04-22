import redis from './client';
import { Stroke, Message } from '../types';

export const ROOM_TTL = 7200; // 2hrs
const MAX_MESSAGES = 100;

const keys = {
  meta: (roomId: string) => `room:${roomId}:meta`,
  strokes: (roomId: string) => `room:${roomId}:strokes`,
  messages: (roomId: string) => `room:${roomId}:messages`,
};

// Room
export const createRoom = (roomId: string, name: string) =>
  redis.set(keys.meta(roomId), name, 'EX', ROOM_TTL);

export const getRoomName = (roomId: string) =>
  redis.get(keys.meta(roomId));

export const deleteRoom = (roomId: string) =>
  redis.del(keys.meta(roomId), keys.strokes(roomId), keys.messages(roomId));

// Strokes
export const getStrokes = async (roomId: string): Promise<Stroke[]> => {
  const raw = await redis.lrange(keys.strokes(roomId), 0, -1);
  return raw.map(s => JSON.parse(s));
};

export const saveStroke = (roomId: string, stroke: Stroke) =>
  redis.multi()
    .rpush(keys.strokes(roomId), JSON.stringify(stroke))
    .expire(keys.strokes(roomId), ROOM_TTL)
    .exec();

export const markStrokeDeleted = async (roomId: string, strokeId: string) => {
  const raw = await redis.lrange(keys.strokes(roomId), 0, -1);
  const updated = raw.map(s => {
    const parsed = JSON.parse(s) as Stroke;
    if (parsed.id === strokeId) parsed.isDeleted = true;
    return JSON.stringify(parsed);
  });
  return redis.multi()
    .del(keys.strokes(roomId))
    .rpush(keys.strokes(roomId), ...updated)
    .expire(keys.strokes(roomId), ROOM_TTL)
    .exec();
};

// Messages
export const getMessages = async (roomId: string): Promise<Message[]> => {
  const raw = await redis.lrange(keys.messages(roomId), 0, -1);
  return raw.map(m => JSON.parse(m));
};

export const saveMessage = (roomId: string, msg: Message) =>
  redis.multi()
    .rpush(keys.messages(roomId), JSON.stringify(msg))
    .ltrim(keys.messages(roomId), -MAX_MESSAGES, -1)
    .expire(keys.messages(roomId), ROOM_TTL)
    .exec();