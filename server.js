const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const rooms = new Map();
const socketRoom = new Map();

app.use(express.static(__dirname));
app.get('/health', (_req, res) => res.json({ ok: true, app: 'Callclone' }));

function makeCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}
function leaveRoom(socket) {
  const code = socketRoom.get(socket.id);
  if (!code) return;
  const room = rooms.get(code);
  socketRoom.delete(socket.id);
  socket.leave(code);
  if (room) {
    room.delete(socket.id);
    socket.to(code).emit('peer-left', socket.id);
    if (room.size === 0) rooms.delete(code);
  }
}
io.on('connection', socket => {
  socket.on('create-room', ({ name } = {}) => {
    let code = makeCode();
    while (rooms.has(code)) code = makeCode();
    rooms.set(code, new Map([[socket.id, { name: String(name || 'Guest').slice(0, 32) }]]));
    socket.join(code);
    socketRoom.set(socket.id, code);
    socket.emit('room-created', code);
  });

  socket.on('join-room', ({ code, name } = {}) => {
    code = String(code || '').trim().toUpperCase();
    const room = rooms.get(code);
    if (!room) return socket.emit('room-error', 'That room was not found. Ask the host for a current room code.');
    if (room.size >= 2) return socket.emit('room-error', 'This room is full. Callclone currently supports two people per room.');
    leaveRoom(socket);
    const peers = [...room.entries()].map(([id, info]) => ({ id, name: info.name }));
    room.set(socket.id, { name: String(name || 'Guest').slice(0, 32) });
    socket.join(code);
    socketRoom.set(socket.id, code);
    socket.emit('room-ready', { code, peers });
    peers.forEach(peer => io.to(peer.id).emit('peer-joined', { id: socket.id, name: String(name || 'Guest').slice(0, 32) }));
  });

  for (const event of ['offer', 'answer', 'ice-candidate']) {
    socket.on(event, payload => {
      const target = payload && payload.to;
      const ownRoom = socketRoom.get(socket.id);
      if (!target || !ownRoom || socketRoom.get(target) !== ownRoom) return;
      io.to(target).emit(event, { ...payload, from: socket.id });
    });
  }
  socket.on('leave-room', () => leaveRoom(socket));
  socket.on('disconnect', () => leaveRoom(socket));
});

server.listen(PORT, '0.0.0.0', () => console.log(`Callclone is running on port ${PORT}`));
