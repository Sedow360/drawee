import { io } from 'socket.io-client';

const socket_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
const socket = io(socket_URL, { autoConnect: false });

export default socket;