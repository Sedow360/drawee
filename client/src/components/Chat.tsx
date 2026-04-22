import { useState } from 'react';
import socket from '../lib/socket';
import { useRoomContext } from '../context/RoomContext';
import { type Message } from '../types';

interface Props {
  messages: Message[];
  username: string;
}

export default function Chat({ messages, username }: Props) {
  const { colorRef } = useRoomContext();
  const [input, setInput] = useState('');

  function sendMessage() {
    if (!input.trim()) return;
    const msg: Message = { senderName: username, text: input.trim(), color: colorRef.current };
    console.log(colorRef.current);
    socket.emit('send_message', msg);
    setInput('');
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
        {messages.map((m, i) => (
          <div key={i} className="text-xs">
            {m.senderName === 'System'
              ? <span className="text-white/30 italic">{m.text}</span>
              : <>
                  <span style={{ color: m.color }} className="font-medium">{m.senderName}: </span>
                  <span className="text-white/70">{m.text}</span>
                </>
            }
          </div>
        ))}
      </div>

      <div className="flex border-t border-white/10 shrink-0">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Message..."
          className="flex-1 bg-transparent text-white/70 text-xs px-3 py-2
                     placeholder:text-white/20 focus:outline-none" />
        <button onClick={sendMessage}
          className="px-3 text-white/40 hover:text-white text-xs transition-colors">
          Send
        </button>
      </div>
    </div>
  );
}