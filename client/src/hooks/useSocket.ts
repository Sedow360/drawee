import { useEffect, useState } from 'react';
import socket from '../lib/socket';
import { type Stroke, type Message, type Participant } from '../types';

export function useSocket(
  roomId: string,
  roomName: string,
  username: string,
  strokesRef: React.MutableRefObject<Stroke[]>
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!roomId || !username || !roomName) return;
    socket.connect();

    socket.on('connect', () => {
      socket.emit('join_room', { roomId, roomName, username });
    });

    socket.on('sync_room', ({ strokes, messages }) => {
      strokesRef.current = strokes;
      setMessages(messages);
      setSynced(true);
    });

    socket.on('receive_stroke', (stroke: Stroke) => {
      strokesRef.current.push(stroke);
    });

    socket.on('receive_delete_stroke', ({ strokeId }: { strokeId: string }) => {
      const s = strokesRef.current.find(s => s.id === strokeId);
      if (s) s.isDeleted = true;
    });

    socket.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('participants_update', (p: Participant[]) => {
      setParticipants(p);
    });

    return () => {
      socket.off('connect');
      socket.off('sync_room');
      socket.off('receive_stroke');
      socket.off('receive_delete_stroke');
      socket.off('receive_message');
      socket.off('participants_update');
      socket.disconnect();
    };
  }, [roomId, username, roomName]);

  return { messages, participants, synced };
}