import { io } from '../index';
import { registerRoomHandlers } from '../handlers/roomHandlers';

export const initSocket = () => {
  io.on('connection', (socket) => {
    registerRoomHandlers(socket);
  });
};