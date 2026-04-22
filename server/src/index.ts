import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { initSocket } from './socket';
import { startCleanupJob } from './jobs/cleanupJob';
import redis from './redis/client';
import { ROOM_TTL } from './redis/roomRepository';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

initSocket();
startCleanupJob();

app.get('/', (req, res) => res.json('Socket Server is Live'));

app.post('/room/create', async (req, res) => {
  const { roomId, name } = req.body;
  const exists = await redis.exists(`room:${roomId}:meta`);
  if (exists) return res.status(409).json({ error: 'Room already exists' });
  await redis.set(`room:${roomId}:meta`, name, 'EX', ROOM_TTL);
  console.log(`${name} created, Id: ${roomId}`);
  res.json({ ok: true });
});

app.get('/room/:roomId/exists', async (req, res) => {
  const name = await redis.get(`room:${req.params.roomId}:meta`);
  name ? res.json({ ok: true, name: name }) : res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));