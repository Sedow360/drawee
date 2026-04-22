import { RoomContext, type RoomContextValue } from './RoomContext';

export function RoomProvider({ children, value }: { children: React.ReactNode; value: RoomContextValue }) {
  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}