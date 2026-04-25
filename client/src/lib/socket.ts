import { io } from 'socket.io-client';

const socket_URL = import.meta.env.VITE_SOCKET_URL

const socket = io(socket_URL, { autoConnect: false });

export default socket;