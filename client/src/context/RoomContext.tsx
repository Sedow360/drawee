import { createContext, useContext } from 'react';
import { type Stroke } from '../types';

export interface RoomContextValue {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  strokesRef: React.MutableRefObject<Stroke[]>;
  toolRef: React.MutableRefObject<'draw' | 'erase' | 'null'>;
  colorRef: React.MutableRefObject<string>;
  widthRef: React.MutableRefObject<number>;
  drawerOpenRef: React.MutableRefObject<boolean>;
}

export const RoomContext = createContext<RoomContextValue | null>(null);

export function useRoomContext() {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error('useRoomContext must be used inside RoomProvider');
  return ctx;
}