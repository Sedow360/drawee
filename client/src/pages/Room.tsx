import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import Canvas from '../components/Canvas';
import { RoomProvider } from '../context/RoomProvider';
import { ToastContainer, toast } from 'react-toastify';

const API = import.meta.env.VITE_SOCKET_URL

export default function Room() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [username, setUsername] = useState(sessionStorage.getItem('username') ?? '');
  const [dark, setDark] = useState(() => {
    const stored = sessionStorage.getItem('theme');
    return stored === null ? true : stored === 'true';
  });

  const [nameInput, setNameInput] = useState('');
  const [roomName, setRoomName] = useState(sessionStorage.getItem('roomName') ?? '');
  const [roomReady, setRoomReady] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef([]);
  const toolRef = useRef<'draw' | 'erase' | 'null'>('draw');
  const colorRef = useRef(`${dark ? '#ffffff' : '#000000'}`);
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
        const meta = typeof data.meta === 'string' ? JSON.parse(data.meta) : data.meta;
        sessionStorage.setItem('roomName', meta.name);
        sessionStorage.setItem('theme', JSON.stringify(meta.theme));
        setRoomName(meta.name);
        setDark(meta.theme)
        setRoomReady(true);
      })
      .catch(() => { if (!cancelled) setNotFound(true); });

    return () => { cancelled = true; };
  }, [roomId, roomName, navigate, dark]);

  useEffect(() => {
      document.title =`${roomName}`;
    }, [roomName]);

  function confirmUsername() {
    const name = nameInput.trim();
    if (!name) return;
    sessionStorage.setItem('username', name);
    setUsername(name);
  }

  function handleLeave() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('roomName');
    sessionStorage.removeItem('theme');
    navigate('/');
  }

  const { messages, participants, synced, latestToast } = useSocket(
    roomReady && !!username ? roomId! : '',
    roomName,
    username,
    strokesRef
  );

  useEffect(() => {
    if (latestToast) 
      toast(`💫 ${latestToast}`, {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: false,
              progress: 0,
              // theme: "dark"
              theme: dark ? "dark" : "light"
              }
      );
  }, [latestToast, dark]);

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
    <div className={`w-screen h-screen flex items-center justify-center transition-colors duration-300
      ${!dark ? 'bg-slate-50' : 'bg-[#111]'}`}>
      
      <div className="flex flex-col gap-3 w-64">
        <p className={`text-sm ${!dark ? 'text-slate-500' : 'text-white/50'}`}>
          Choose a display name
        </p>
        
        <input 
          autoFocus
          value={nameInput} 
          onChange={e => setNameInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && confirmUsername()}
          placeholder="Your name"
          className={`text-sm rounded-md px-3 py-2 border transition-all focus:outline-none
            ${!dark 
              ? 'bg-white text-slate-900 border-slate-200 placeholder:text-slate-300 focus:border-slate-400' 
              : 'bg-white/5 text-white/80 border-white/10 placeholder:text-white/20 focus:border-white/25'}`} 
        />
        
        <button 
          onClick={confirmUsername}
          className={`py-2 rounded-md text-sm font-medium transition-all
            ${!dark 
              ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm' 
              : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'}`}
        >
          Join
        </button>
      </div>
    </div>
  );


  return (
    <RoomProvider value={{ canvasRef, strokesRef, toolRef, colorRef, widthRef, drawerOpenRef, dark }}>
      <div className="w-screen h-screen bg-[#111] relative">
        {!synced && (
          <div className={`absolute inset-0 z-50 flex items-center justify-center ${dark ? 'bg-[#111]' : 'bg-[#a8a5a5]'}`}>
            <p className={`text-sm ${dark ? 'text-white/40' : 'text-black/40'}`}>Syncing…</p>
          </div>
        )}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          newestOnTop
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover
          theme={`${dark ? "dark" : "light"}`}
        />
        <Canvas
          roomReady={roomReady}
          messages={messages}
          participants={participants}
          username={username}
          roomName={roomName!}
          roomId={roomId!}
          handleLeave={handleLeave}
        />
      </div>
    </RoomProvider>
  );
}