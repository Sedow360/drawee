import { Socket } from 'socket.io';
import { getStrokes, getMessages, saveMessage } from '../redis/roomRepository';
import { registerStrokeHandlers } from './strokeHandlers';
import { registerChatHandlers } from './chatHandlers';
import { broadcastParticipants, cancelCleanup, participants, scheduleCleanup } from '../services/roomServices';

export const registerRoomHandlers = (socket: Socket) => {
  socket.on('join_room', async ({ roomId, roomName, username }) => {
    socket.join(roomId);
    console.log(`${username} has joined.`);
    cancelCleanup(roomId);

    if (!participants.has(roomId)) participants.set(roomId, new Map());
    participants.get(roomId)!.set(socket.id, { username, tool: 'null', color: '#e74c3c' });
    broadcastParticipants(roomId);

    const [strokes, messages] = await Promise.all([getStrokes(roomId), getMessages(roomId)]);
    socket.emit('sync_room', { strokes, messages });

    const systemMsg = { senderName: 'System', text: `${username} joined ${roomName}` };
    await saveMessage(roomId, systemMsg);
    socket.to(roomId).emit('receive_message', systemMsg);

    registerStrokeHandlers(socket, roomId);
    registerChatHandlers(socket, roomId);

    socket.on('update_presence', ({ tool, color }) => {
      const p = participants.get(roomId)?.get(socket.id);
      if (p) { p.tool = tool; p.color = color; }
      broadcastParticipants(roomId);
    });

    socket.on('disconnect', async () => {
        const roomParticipants = participants.get(roomId);
        roomParticipants?.delete(socket.id);

        if (!roomParticipants || roomParticipants.size === 0) {
            participants.delete(roomId);
            scheduleCleanup(roomId);
        }
        
        broadcastParticipants(roomId);
        console.log(`${username} has left.`);

        const leaveMsg = { senderName: 'System', text: `${username} left ${roomName}` };
        await saveMessage(roomId, leaveMsg);
        socket.to(roomId).emit('receive_message', leaveMsg);
    });
  });
};