import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { initSocket } from './socket';
import { startCleanupJob } from './jobs/cleanupJob';
import redis from './redis/client';
import { ROOM_TTL } from './redis/roomRepository';
import { participants } from './services/roomServices';

const origin = [process.env.CLIENT_URL ?? '', "http://localhost:5173"].filter(Boolean);
const app = express();
app.use(cors({
  origin: origin,
  credentials: true,
}));
app.use(express.json());

const httpServer = http.createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: origin,
    methods: ['GET', 'POST']
  }
});

initSocket();
startCleanupJob();

app.get('/', (req, res) => res.json('Socket Server is Live'));

app.post('/room/create', async (req, res) => {
  const { roomId, name, theme } = req.body;
  const exists = await redis.exists(`room:${roomId}:meta`);
  if (exists) return res.status(409).json({ error: 'Room already exists' });
  await redis.set(`room:${roomId}:meta`, JSON.stringify({ name, theme }), 'EX', ROOM_TTL);
  console.log(`${name} created, Id: ${roomId}`);
  res.json({ ok: true });
});

app.get('/room/:roomId/exists', async (req, res) => {
  try {
    const { roomId } = req.params;
    const meta = await redis.get(`room:${roomId}:meta`);

    if (!meta) res.status(404).json({ error: 'Room not found' });

    const roomParticipants = participants.get(roomId);
    const count = roomParticipants?.size ?? 0;

    if (count >= 10) {
      return res.status(403).json({ error: 'Room is full' });
    }

    return res.json({ 
      ok: true, 
      meta: JSON.parse(meta!)
    });

  } catch (err) {
    console.error('Redis Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/room/:roomId/exists/:username', async (req, res) => {
  try {
    const { roomId, username } = req.params;
    const roomParticipants = participants.get(roomId);

    const usernameTaken = [...(roomParticipants?.values() ?? [])].some(
      p => p.username.toLowerCase() === username.toLowerCase()
    );

    if (usernameTaken) {
      return res.status(409).json({ error: 'Username already taken in this room' });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Redis Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));