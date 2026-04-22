import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import Canvas from '../components/Canvas';
import { RoomProvider } from '../context/RoomProvider';

const API = import.meta.env.VITE_SOCKET_URL;

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [username, setUsername] = useState(sessionStorage.getItem('username') ?? '');
  const [nameInput, setNameInput] = useState('');
  const [roomName, setRoomName] = useState(sessionStorage.getItem('roomName') ?? '');
  const [roomReady, setRoomReady] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef([]);
  const toolRef = useRef<'draw' | 'erase' | 'null'>('draw');
  const colorRef = useRef('#ffffff');
  const widthRef = useRef(4);
  const drawerOpenRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    if (!roomId) { navigate('/'); return; }

    if (roomName) {
      const t = setTimeout(() => setRoomReady(true), 0);
      return () => clearTimeout(t);
    }

    fetch(`${API}/room/${roomId}/exists`)
      .then(res => {
        if (!res.ok) { if (!cancelled) setNotFound(true); return null; }
        return res.json();
      })
      .then(data => {
        if (!data || cancelled) return;
        sessionStorage.setItem('roomName', data.name);
        setRoomName(data.name);
        setRoomReady(true);
      })
      .catch(() => { if (!cancelled) setNotFound(true); });

    return () => { cancelled = true; };
  }, [roomId]);

  useEffect(() => {
      document.title =`${roomName}`;
    }, [roomName])

  function confirmUsername() {
    const name = nameInput.trim();
    if (!name) return;
    sessionStorage.setItem('username', name);
    setUsername(name);
  }

  function handleLeave() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('roomName');
    navigate('/');
  }

  // useSocket writes into strokesRef directly — same ref object passed to context
  const { messages, participants, synced } = useSocket(
    roomReady && !!username ? roomId! : '',
    roomName,
    username,
    strokesRef
  );

  if (notFound) return (
    <div className="w-screen h-screen bg-[#111] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <p className="text-white/40 text-sm">Room not found</p>
        <button onClick={() => navigate('/')}
          className="text-white/30 hover:text-white text-xs transition-colors">
          Go home
        </button>
      </div>
    </div>
  );

  if (!username) return (
    <div className="w-screen h-screen bg-[#111] flex items-center justify-center">
      <div className="flex flex-col gap-3 w-64">
        <p className="text-white/50 text-sm">Choose a display name</p>
        <input value={nameInput} onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && confirmUsername()}
          placeholder="Your name"
          className="bg-white/5 text-white/80 text-sm rounded-md px-3 py-2
                     placeholder:text-white/20 border border-white/10
                     focus:outline-none focus:border-white/25" />
        <button onClick={confirmUsername}
          className="py-2 rounded-md bg-white/10 text-white/70 hover:bg-white/15 hover:text-white text-sm transition-colors">
          Join
        </button>
      </div>
    </div>
  );

  return (
    <RoomProvider value={{ canvasRef, strokesRef, toolRef, colorRef, widthRef, drawerOpenRef }}>
      <div className="w-screen h-screen bg-[#111] relative">
        {!synced && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#111]">
            <p className="text-white/40 text-sm">Syncing…</p>
          </div>
        )}
        <Canvas
          roomReady={roomReady}
          messages={messages}
          participants={participants}
          username={username}
          roomName={roomName}
          handleLeave={handleLeave}
        />
      </div>
    </RoomProvider>
  );
}