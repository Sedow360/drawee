import { useEffect, useState } from 'react';
import socket from '../lib/socket';
import { useRoomContext } from '../context/RoomContext';

const COLORS = ['#ffffff', '#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc', 
  '#f472b6', '#78350f', '#6504c0', '#2dd4bf', 
];

export default function Toolbar() {
  const { toolRef, colorRef, widthRef, canvasRef } = useRoomContext();
  const [width, setWidth] = useState(4);
  const [tool, setTool] = useState<'draw' | 'erase' | 'null'>('draw');
  const [color, setColor] = useState('#f87171');

  useEffect(() => {
    setTool(toolRef.current);
    setColor(colorRef.current);
  }, []);

  function setToolVal(t: 'draw' | 'erase' | 'null') {
    if (t == 'erase') {
      if (toolRef.current === 'erase') {
        setTool('null');
        canvasRef.current!.style.cursor = 'default';
        return;
      }
      canvasRef.current!.style.cursor = 'default';
    }
    toolRef.current = t;
    setTool(t);
    socket.emit('update_presence', { tool: t, color: colorRef.current });
  }

  function setColorVal(c: string) {
    colorRef.current = c;
    canvasRef.current!.style.cursor = 'crosshair';
    setColor(c);
    socket.emit('update_presence', { tool: toolRef.current, color: c });
  }

  function setWidthVal(w: number) {
    widthRef.current = w;
    setWidth(w);
  }

  return (
    <div className="shrink-0 flex flex-wrap items-center justify-center gap-3
                    border-b border-white/5 px-4 py-3">
      <button onClick={() => setToolVal('erase')}
        className={`text-sm px-3 py-1 rounded-full transition-colors
          ${tool === 'erase' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'}`}>
        Erasure
      </button>

      <div className="w-px h-4 bg-white/20" />

      {COLORS.map(c => (
        <button key={c} onClick={() => {setColorVal(c); setToolVal('draw');}}
          className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
          style={{
            background: c,
            boxShadow: color === c && tool === 'draw'
              ? '0 0 0 2px #1a1a1a, 0 0 0 3.5px white' : 'none'
          }}
          aria-label={c}
        />
      ))}

      <div className="w-px h-4 bg-white/20" />

      <input type="range" min={2} max={24} value={width}
        onChange={e => setWidthVal(Number(e.target.value))}
        className="w-20 accent-white" />
    </div>
  );
}