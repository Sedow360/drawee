import { io } from '../index';
import { deleteRoom } from '../redis/roomRepository';
import { Participant } from '../types';

const timers = new Map<string, ReturnType<typeof setTimeout>>();
export const participants = new Map<string, Map<string, Participant>>();

export const broadcastParticipants = (roomId: string) => {
  io.in(roomId).emit('participants_update', [...(participants.get(roomId)?.values() || [])]);
};

export const scheduleCleanup = (roomId: string) => {
  const timer = setTimeout(async () => {
    await deleteRoom(roomId);
    participants.delete(roomId);
    timers.delete(roomId);
    console.log(`Room ${roomId} purged.`);
  }, 20_000);
  timers.set(roomId, timer);
};

export const cancelCleanup = (roomId: string) => {
  if (timers.has(roomId)) {
    clearTimeout(timers.get(roomId));
    timers.delete(roomId);
  }
};