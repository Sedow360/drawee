import { Socket } from 'socket.io';
import { saveMessage } from '../redis/roomRepository';
import { Message } from '../types';
import { io } from '..';

export const registerChatHandlers = (socket: Socket, roomId: string) => {
  socket.on('send_message', async (data: Message) => {
    await saveMessage(roomId, data);
    io.to(roomId).emit('receive_message', data);
  });
};