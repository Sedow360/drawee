import { useState } from 'react';
import Toolbar from './Toolbar';
import Chat from './Chat';
import { useRoomContext } from '../context/RoomContext';
import { type Message, type Participant } from '../types';

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
  const { canvasRef, drawerOpenRef } = useRoomContext();
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
        className="fixed top-2 left-4 z-50 w-9 h-9 flex items-center justify-center
                   rounded-lg bg-[#1a1a1a] text-white/70 hover:text-white
                   hover:bg-white/10 transition-colors"
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
        <div className="fixed inset-y-0 right-0 z-40 flex flex-col w-full md:w-72 bg-[#1a1a1a] border-l border-white/5">

          <div className="shrink-0 flex items-center gap-2 pl-4 pr-12 py-3 border-b border-white/5">
            <div className="relative group min-w-0 flex-1">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${url}${roomId}`).catch(console.error);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors truncate max-w-full"
              >
                {copied ? 'Copied!' : roomName}
              </button>

              <div className="
                absolute top-full left-0 mt-1 w-52
                bg-[#222] border border-white/10 rounded-lg py-1.5 z-50 shadow-xl
                opacity-0 pointer-events-none
                group-hover:opacity-100 group-hover:pointer-events-auto
                transition-opacity duration-150
              ">
                {participants.length === 0 && (
                  <p className="px-3 py-1.5 text-xs text-white/30">No participants</p>
                )}
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5">
                    <span className="text-sm truncate flex-1" style={{ color: p.color }}>{p.username}</span>
                    <span className="text-xs">
                      {p.tool === 'draw' ? '✏️' : p.tool === 'erase' ? '🧹' : '🤔'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleLeave}
              className="text-xs text-red-400/70 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-400/10 shrink-0"
            >
              Leave
            </button>
          </div>

          <Toolbar />
          <Chat messages={messages} username={username} />
        </div>
      )}
    </>
  );
}