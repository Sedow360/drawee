export interface Stroke {
  id: string;
  points: [number, number][];
  color: string;
  width: number;
  isDeleted: boolean;
}

export interface Message {
  senderName: string;
  color?: string;
  text: string;
}

export interface Participant {
  username: string;
  tool: 'draw' | 'erase' | 'null';
  color: string;
}