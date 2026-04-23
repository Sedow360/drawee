import { useRoomContext } from '../context/RoomContext';
import { useCanvas } from '../hooks/useCanvas';
import Drawer from './Drawer';
import { type Message, type Participant } from '../types';
import { useEffect, useRef } from 'react';

interface Props {
  roomReady: boolean;
  messages: Message[];
  participants: Participant[];
  username: string;
  roomName: string;
  roomId: string;
  handleLeave: () => void;
}

export default function Canvas({ roomReady, messages, participants, username, roomName, roomId, handleLeave }: Props) {
  const { canvasRef, strokesRef, toolRef, colorRef, widthRef } = useRoomContext();
  useCanvas(canvasRef, strokesRef,  toolRef, colorRef, widthRef);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      if (!containerRef.current) return;
      containerRef.current.style.top = `${vv!.offsetTop}px`;
      containerRef.current.style.height = `${vv!.height}px`;
    }

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    update();

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className="fixed inset-x-0" style={{ top: 0, height: '100dvh' }}>
        <canvas ref={canvasRef} className="absolute inset-0 touch-none" />
      </div>
      {roomReady && (
          <Drawer
            messages={messages}
            participants={participants}
            username={username}
            roomName={roomName}
            roomId={roomId}
            handleLeave={handleLeave}
          />
      )}
    </>
  );
}