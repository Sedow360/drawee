import { useState } from 'react';
import socket from '../lib/socket';
import { useRoomContext } from '../context/RoomContext';
import { type Message } from '../types';

interface Props {
  messages: Message[];
  username: string;
}

export default function Chat({ messages, username }: Props) {
  const { colorRef, dark } = useRoomContext();
  const [input, setInput] = useState('');

  function sendMessage() {
    if (!input.trim()) return;
    const msg: Message = { senderName: username, text: input.trim(), color: colorRef.current };
    socket.emit('send_message', msg);
    setInput('');
  }

  return (
    <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-200
      ${!dark ? 'bg-white' : 'bg-black'}`}>
      
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
        {messages.map((m, i) => (
          <div key={i} className="text-xs">
            {m.senderName === 'System'
              ? <span className={`italic ${!dark ? 'text-slate-400' : 'text-white/30'}`}>{m.text}</span>
              : <>
                  <span style={{ color: m.color }} className="font-semibold">{m.senderName}: </span>
                  <span className={!dark ? 'text-slate-700' : 'text-white/70'}>{m.text}</span>
                </>
            }
          </div>
        ))}
      </div>

      <div className={`flex border-t shrink-0 ${!dark ? 'border-slate-200' : 'border-white/10'}`}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Message..."
          className={`flex-1 bg-transparent text-xs px-3 py-2 focus:outline-none
                    ${!dark 
                      ? 'text-slate-700 placeholder:text-slate-400' 
                      : 'text-white/70 placeholder:text-white/20'}`} 
        />
        <button 
          onClick={sendMessage}
          className={`px-3 text-xs transition-colors font-medium
            ${!dark 
              ? 'text-slate-400 hover:text-slate-900' 
              : 'text-white/40 hover:text-white'}`}
        >
          Send
        </button>
      </div>
    </div>
  );

}