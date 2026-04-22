const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// In-memory state for fast access
const connectedUsers = new Map(); // socketId -> { userId, roomId }

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Lobi işlemleri
    socket.on('joinLobby', async ({ username, character }) => {
      try {
        // Misafir kullanıcı oluştur veya bul
        let user = await prisma.user.upsert({
          where: { username },
          update: {},
          create: { username }
        });
        
        socket.emit('lobbyJoined', { user, character });
      } catch (err) {
        socket.emit('error', { message: 'Kullanıcı oluşturulamadı.' });
      }
    });

    socket.on('createRoom', async ({ userId, character }) => {
      try {
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = await prisma.room.create({
          data: { inviteCode }
        });

        const player = await prisma.player.create({
          data: {
            userId,
            roomId: room.id,
            character,
            isTurn: true // Odayı kuran ilk oyuncu sırayı alır
          }
        });

        socket.join(room.id);
        connectedUsers.set(socket.id, { userId, roomId: room.id });
        
        socket.emit('roomCreated', { room, player });
      } catch (err) {
        socket.emit('error', { message: 'Oda oluşturulamadı.' });
      }
    });

    socket.on('joinRoom', async ({ userId, character, inviteCode }) => {
      try {
        const room = await prisma.room.findUnique({
          where: { inviteCode },
          include: { players: true }
        });

        if (!room) return socket.emit('error', { message: 'Oda bulunamadı.' });
        if (room.players.length >= 8) return socket.emit('error', { message: 'Oda dolu.' });

        const player = await prisma.player.create({
          data: {
            userId,
            roomId: room.id,
            character
          }
        });

        socket.join(room.id);
        connectedUsers.set(socket.id, { userId, roomId: room.id });
        
        // Diğer oyunculara haber ver
        io.to(room.id).emit('playerJoined', { player });
        socket.emit('roomJoined', { room, player, players: [...room.players, player] });
      } catch (err) {
        socket.emit('error', { message: 'Odaya katılınamadı.' });
      }
    });

    // Oyun Mekanikleri
    socket.on('rollDice', async ({ roomId, userId }) => {
      // RNG (1-6)
      const diceValue = Math.floor(Math.random() * 6) + 1;
      
      // Tüm odaya zar atışını ve sonucunu bildir
      io.to(roomId).emit('diceRolled', { userId, value: diceValue });
      
      // TODO: Komşuluk hesaplamasını yapıp gidilebilecek yerleri emit et (Highlighting)
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      connectedUsers.delete(socket.id);
      // TODO: Eğer oyundaysa durumu güncelle
    });
  });
};
