import { useRoomContext } from '../context/RoomContext';
import { useCanvas } from '../hooks/useCanvas';
import Drawer from './Drawer';
import { type Message, type Participant } from '../types';

interface Props {
  roomReady: boolean;
  messages: Message[];
  participants: Participant[];
  username: string;
  roomName: string;
  handleLeave: () => void;
}

export default function Canvas({ roomReady, messages, participants, username, roomName, handleLeave }: Props) {
  const { canvasRef, strokesRef, toolRef, colorRef, widthRef } = useRoomContext();
  useCanvas(canvasRef, strokesRef,  toolRef, colorRef, widthRef);

  return (
    <>
      <div className="absolute inset-0">
        <canvas ref={canvasRef} className="absolute inset-0 touch-none"/>
      </div>
      {roomReady && (
          <Drawer
            messages={messages}
            participants={participants}
            username={username}
            roomName={roomName}
            handleLeave={handleLeave}
          />
      )}
    </>
  );
}