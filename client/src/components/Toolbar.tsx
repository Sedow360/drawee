import { useEffect, useState } from 'react';
import socket from '../lib/socket';
import { useRoomContext } from '../context/RoomContext';

const PALETTES = {
  dark: [
    '#FFFFFF', '#6272A4', '#FF5555', '#FFB86C', '#F1FA8C', '#50FA7B', '#8BE9FD', '#BD93F9', '#FF79C6'
  ],
  light: [
    '#1A1A1A', '#424242', '#D32F2F', '#F57C00', '#FBC02D', '#388E3C', '#1976D2', '#7B1FA2', '#C2185B'
  ]
};


export default function Toolbar() {
  const { toolRef, colorRef, widthRef, canvasRef, dark } = useRoomContext();
  const [width, setWidth] = useState(4);
  const [tool, setTool] = useState<'draw' | 'erase' | 'null'>('draw');
  const [color, setColor] = useState('#f87171');

  const COLORS = dark ? PALETTES.dark : PALETTES.light;
  const containerStyle = !dark 
    ? 'bg-white border-slate-200 text-slate-600 shadow-sm' 
    : 'bg-black border-slate-800 text-slate-400 shadow-lg';

  const dividerStyle = !dark ? 'bg-slate-200' : 'bg-white/20';

  useEffect(() => {
    setTool(toolRef.current);
    setColor(colorRef.current);
  }, []);

  function setToolVal(t: 'draw' | 'erase' | 'null') {
    const nextTool = toolRef.current === t ? 'null' : t;

    canvasRef.current!.style.cursor = (nextTool === 'draw' || nextTool === 'erase') ? 'crosshair' : 'default';
    toolRef.current = nextTool;
    setTool(nextTool);

    socket.emit('update_presence', { tool: nextTool, color: colorRef.current });
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
    <div className={`shrink-0 flex flex-wrap items-center justify-center gap-3
                    border-b px-4 py-3 transition-colors duration-200 ${containerStyle}`}>
      
      {/* Erase Button */}
      <button onClick={() => setToolVal('erase')}
        className={`text-sm px-3 py-1 rounded-full transition-colors
          ${tool === 'erase' 
            ? (dark ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-900') 
            : (dark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}>
        Erasure
      </button>

      <div className={`w-px h-4 ${dividerStyle}`} />

      {/* Color Palette */}
      {COLORS.map(c => (
        <button key={c} onClick={() => {
          if (color === c) setToolVal('draw');
          else {
            setColorVal(c); 
            if (tool !== 'draw') setToolVal('draw');
          }
        }}
          className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
          style={{
            background: c,
            boxShadow: color === c && tool === 'draw'
              ? `0 0 0 2px ${dark ? '#000' : '#fff'}, 0 0 0 3.5px ${dark ? '#fff' : '#64748b'}` 
              : 'none'
          }}
          aria-label={c}
        />
      ))}

      <div className={`w-px h-4 ${dividerStyle}`} />

      {/* Width Slider */}
      <input type="range" min={2} max={24} value={width}
        onChange={e => setWidthVal(Number(e.target.value))}
        className={`w-20 cursor-pointer ${dark ? 'accent-white' : 'accent-slate-600'}`} />
    </div>
  );
}