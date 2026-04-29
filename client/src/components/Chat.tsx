import { useState } from 'react';
import socket from '../lib/socket';
import { useRoomContext } from '../context/RoomContext';
import { type Message } from '../types';

interface Props {
  messages: Message[];
  username: string;
  roomId: string;
}

const API = import.meta.env.VITE_SOCKET_URL

function AIres(text: string, dark: boolean): Message {
  return { senderName: 'drawee🎨', text: `${text}`, color: `${dark ? '#ffffff' : '#000000'}`};
}

export default function Chat({ messages, username, roomId }: Props) {
  const { colorRef, dark, canvasRef } = useRoomContext();
  const [input, setInput] = useState('');

  async function sendMessage() {
    if (!input.trim()) return;
    const msg: Message = { senderName: username, text: input.trim(), color: colorRef.current };
    socket.emit('send_message', msg);
    setInput('');

    if (input.trim().startsWith('/describe')) {
      const prompt = input.trim().slice('/describe'.length).trim();
      
      const canvas = canvasRef.current;
      if (!canvas) {
        const msg: Message = AIres(`Can't get the snapshot chief`, dark);
        socket.emit('send_message', msg);
        return;
      }
      const temp = document.createElement('canvas');
      temp.width = canvas.width;
      temp.height = canvas.height;
      const ctx = temp.getContext('2d')!;

      ctx.fillStyle = dark ? '#000000' : '#ffffff';
      ctx.fillRect(0, 0, temp.width, temp.height);
      ctx.drawImage(canvas, 0, 0);

      const imageBase64 = temp.toDataURL('image/png').split(',')[1];

      await fetch(`${API}/room/${roomId}/describe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, prompt, username }),
      })
      .then(async res => {
        const data = await res.json();
        const msg: Message = AIres(data.description, dark)
        socket.emit('send_message', msg);
      })
      .catch(e => {
        const msg: Message = AIres(`I am as confused as you are buddy...(${e})`, dark);
        socket.emit('send_message', msg);
        return;
      });
    }
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