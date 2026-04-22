import { Socket } from 'socket.io';
import { saveStroke, markStrokeDeleted } from '../redis/roomRepository';
import { Stroke } from '../types';

export const registerStrokeHandlers = (socket: Socket, roomId: string) => {
  socket.on('send_stroke', async (stroke: Stroke) => {
    await saveStroke(roomId, stroke);
    socket.to(roomId).emit('receive_stroke', stroke);
  });

  socket.on('delete_stroke', async ({ strokeId }: { strokeId: string }) => {
    await markStrokeDeleted(roomId, strokeId);
    socket.to(roomId).emit('receive_delete_stroke', { strokeId });
  });
};