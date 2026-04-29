import { useState } from 'react';
import Toolbar from './Toolbar';
import Chat from './Chat';
import { useRoomContext } from '../context/RoomContext';
import { type Message, type Participant } from '../types';
import ParticipantsList from './ParticipantsList';

interface Props {
  messages: Message[];
  participants: Participant[];
  username: string;
  roomName: string;
  roomId: string;
  handleLeave: () => void;
}

const url = import.meta.env.VITE_CLIENT_URL

export default function Drawer({ messages, participants, username, roomName, roomId, handleLeave }: Props) {
  const { canvasRef, drawerOpenRef, dark } = useRoomContext();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function openDrawer() {
    drawerOpenRef.current = true;
    if (canvasRef.current) canvasRef.current.style.cursor = 'default';
    setDrawerOpen(true);
  }

  function closeDrawer() {
    drawerOpenRef.current = false;
    setDrawerOpen(false);
  }

  return (
    <>
      {/* Toggle button — always fixed top-right, shows hamburger or X */}
      <button
        onClick={() => drawerOpen ? closeDrawer() : openDrawer()}
        style={{ top: 'calc(env(safe-area-inset-top) + 8px)' }}
        className={`fixed right-2 z-50 w-9 h-9 flex items-center justify-center rounded-lg 
                  ${!dark ? 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200' :
                    'bg-black text-slate-400 hover:bg-slate-800 hover:text-slate-100 border-slate-800'}
                  transition-colors shadow-sm border`}
        aria-label="Toggle drawer"
      >
        {drawerOpen ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/>
          </svg>
        )}
      </button>

      {/* Mobile backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={closeDrawer} />
      )}

      {/* Drawer panel */}
      {drawerOpen && (
        <div className="fixed inset-y-0 right-0 z-40 flex flex-col w-full sm:w-72 bg-[#1a1a1a] border-l border-white/5">

          <div className={`shrink-0 flex items-center gap-2 pl-4 pr-12 py-3 border-b transition-colors duration-200
            ${!dark ? 'bg-white border-slate-200' : 'bg-black border-white/5'}`}>
            
            <div className="relative group min-w-0 flex-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${url}/${roomId}`).catch(console.error);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`text-sm font-medium transition-colors truncate max-w-full
                  ${!dark ? 'text-slate-600 hover:text-slate-900' : 'text-white/80 hover:text-white'}`}
              >
                {copied ? (
                  <span className={!dark ? 'text-green-600' : 'text-green-400'}>Copied!</span>
                ) : (
                  roomName
                )}
              </button>
            </div>

            <button
              onClick={handleLeave}
              className={`text-xs transition-colors px-2 py-1 rounded shrink-0
                ${!dark 
                  ? 'text-red-600/70 hover:text-red-600 hover:bg-red-50' 
                  : 'text-red-400/70 hover:text-red-400 hover:bg-red-400/10'}`}
            >
              Leave
            </button>
          </div>

          <Toolbar />
          <ParticipantsList participants={participants} dark={dark}/>
          <Chat messages={messages} username={username} roomId={roomId} />
        </div>
      )}
    </>
  );
}