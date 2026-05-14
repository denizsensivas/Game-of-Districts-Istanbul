const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const mapData = require('../data/mapData');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const TURN_DURATION_MS = 30_000;
const MAX_ROUNDS = 12;
const PURCHASE_COST_RED = 2;
const RENT_COST_RED = 3;
const SABOTAGE_COST_BLUE = 2;
const FORTUNE_COST_GREEN = 2;
const TAXI_COST_GREEN = 1;

const connectedUsers = new Map();
const roomStates = new Map();
const matchmakingQueue = [];
let matchmakingTimer = null;

async function startMatchmakingGame(io) {
  if (matchmakingQueue.length < 2) return;
  const playersInMatch = matchmakingQueue.splice(0, 8);
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room = await prisma.room.create({ data: { inviteCode, status: 'playing' } });
  const players = [];
  
  for (let i = 0; i < playersInMatch.length; i++) {
    const p = playersInMatch[i];
    const bonus = getCharacterBonus(p.character);
    const player = await prisma.player.create({
      data: {
        userId: p.userId, roomId: room.id, character: p.character,
        isTurn: i === 0, position: 'kadikoy', ...bonus
      }
    });
    players.push(player);
  }
  
  const roomState = createInitialRoomState(room.id, players[0].id, players.length);
  roomStates.set(room.id, roomState);
  
  for (const p of playersInMatch) {
    p.socket.join(room.id);
    connectedUsers.set(p.socket.id, { userId: p.userId, roomId: room.id });
    p.socket.emit('roomJoined', { room, player: players.find(x => x.userId === p.userId), players });
  }
  
  await emitGameState(io, room.id);
  await startTurnTimer(io, room.id, players[0].userId);
}

function getMapTypeForPlayerCount(playerCount) {
  return playerCount <= 4 ? 'Kucuk_idli.svg' : 'buyuk.svg';
}

function getCharacterBonus(character) {
  const base = { redTickets: 10, blueTickets: 10, greenTickets: 10 };
  const c = character?.toLowerCase() || '';
  if (c.includes('ogrenci') || c.includes('öğrenci')) return { ...base, blueTickets: 13 };
  if (c.includes('turist')) return { ...base, greenTickets: 13 };
  if (c.includes('esnaf')) return { ...base, redTickets: 13 };
  if (c.includes('beyaz')) return { redTickets: 11, blueTickets: 11, greenTickets: 11 };
  return base;
}



function createInitialRoomState(roomId, firstPlayerId, playerCount = 1) {
  return {
    roomId,
    currentRound: 1,
    maxRounds: MAX_ROUNDS,
    mapType: getMapTypeForPlayerCount(playerCount),
    ticketRates: { red: 1, blue: 2, green: 4 },
    activeEvent: 'Oyun başladı',
    districts: {},
    lastRoll: null,
    turnEndsAt: null,
    timer: null,
    gameOver: false,
    firstPlayerId,
  };
}

function getRoomState(roomId, firstPlayerId) {
  if (!roomStates.has(roomId)) {
    roomStates.set(roomId, createInitialRoomState(roomId, firstPlayerId));
  }
  return roomStates.get(roomId);
}

function serializeMapState(districts) {
  return Object.fromEntries(
    Object.entries(districts).map(([districtId, district]) => [
      districtId,
      {
        ownerId: district.ownerId,
        remainingTurns: district.remainingTurns,
        type: district.type || 'normal',
      },
    ])
  );
}

function findReachableDistricts(startNode, steps) {
  return mapData.findReachableDistricts(startNode, steps);
}

function rollTicketRates(currentRates) {
  const colors = ['red', 'blue', 'green'];
  const nextRates = { ...currentRates };
  const changedColor = colors[Math.floor(Math.random() * colors.length)];
  const direction = Math.random() > 0.45 ? 1 : -1;

  nextRates[changedColor] = Math.min(5, Math.max(1, nextRates[changedColor] + direction));

  return {
    rates: nextRates,
    event: `${changedColor.toUpperCase()} kur ${direction > 0 ? 'yükseldi' : 'düştü'}`,
  };
}

function calculateScore(player, roomState) {
  const ticketScore =
    player.redTickets * roomState.ticketRates.red +
    player.blueTickets * roomState.ticketRates.blue +
    player.greenTickets * roomState.ticketRates.green;

  const districtScore = Object.values(roomState.districts)
    .filter((district) => district.ownerId === player.id && district.remainingTurns > 0)
    .reduce((total, district) => total + district.remainingTurns * 4, 0);

  return ticketScore + districtScore;
}

async function emitGameState(io, roomId) {
  const roomState = getRoomState(roomId);
  const players = await prisma.player.findMany({ where: { roomId }, orderBy: { id: 'asc' } });
  const currentPlayer = players.find((player) => player.isTurn);

  io.to(roomId).emit('gameStateUpdated', {
    players,
    currentTurnUserId: currentPlayer?.userId || null,
    currentRound: roomState.currentRound,
    maxRounds: roomState.maxRounds,
    mapType: roomState.mapType,
    ticketRates: roomState.ticketRates,
    activeEvent: roomState.activeEvent,
    turnEndsAt: roomState.turnEndsAt,
    mapState: serializeMapState(roomState.districts),
    gameOver: roomState.gameOver,
  });
}

async function endGame(io, roomId) {
  const roomState = getRoomState(roomId);
  if (roomState.gameOver) return;

  roomState.gameOver = true;
  clearTimeout(roomState.timer);

  await prisma.room.update({ where: { id: roomId }, data: { status: 'finished' } });
  await prisma.player.updateMany({ where: { roomId }, data: { isTurn: false } });

  const players = await prisma.player.findMany({ where: { roomId }, orderBy: { id: 'asc' } });
  const rankings = players
    .map((player) => ({
      playerId: player.id,
      userId: player.userId,
      character: player.character,
      score: calculateScore(player, roomState),
      tickets: {
        red: player.redTickets,
        blue: player.blueTickets,
        green: player.greenTickets,
      },
    }))
    .sort((a, b) => b.score - a.score);

  io.to(roomId).emit('gameEnded', { rankings });
  await emitGameState(io, roomId);
}

async function advanceTurn(io, roomId, currentUserId) {
  const roomState = getRoomState(roomId);
  if (roomState.gameOver) return;

  clearTimeout(roomState.timer);
  roomState.lastRoll = null;

  const playerList = await prisma.player.findMany({ where: { roomId }, orderBy: { id: 'asc' } });
  const currentIndex = Math.max(0, playerList.findIndex((player) => player.userId === currentUserId));
  const nextIndex = (currentIndex + 1) % playerList.length;
  const nextPlayer = playerList[nextIndex];

  if (nextIndex === 0 && playerList.length > 1) {
    roomState.currentRound += 1;
    for (const [districtId, district] of Object.entries(roomState.districts)) {
      if (district.remainingTurns > 0) {
        district.remainingTurns -= 1;
      }
      if (district.remainingTurns <= 0) {
        delete roomState.districts[districtId];
      }
    }
  }

  if (roomState.currentRound > roomState.maxRounds) {
    await endGame(io, roomId);
    return;
  }

  await prisma.player.updateMany({ where: { roomId }, data: { isTurn: false } });
  await prisma.player.update({ where: { id: nextPlayer.id }, data: { isTurn: true } });

  roomState.turnEndsAt = Date.now() + TURN_DURATION_MS;
  roomState.timer = setTimeout(async () => {
    await advanceTurn(io, roomId, nextPlayer.userId);
  }, TURN_DURATION_MS + 250);

  io.to(roomId).emit('turnChanged', {
    currentTurnUserId: nextPlayer.userId,
    currentRound: roomState.currentRound,
    turnEndsAt: roomState.turnEndsAt,
    mapState: serializeMapState(roomState.districts),
  });
  await emitGameState(io, roomId);
}

async function startTurnTimer(io, roomId, currentUserId) {
  const roomState = getRoomState(roomId);
  clearTimeout(roomState.timer);
  roomState.turnEndsAt = Date.now() + TURN_DURATION_MS;
  roomState.timer = setTimeout(async () => {
    await advanceTurn(io, roomId, currentUserId);
  }, TURN_DURATION_MS + 250);
  await emitGameState(io, roomId);
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('joinLobby', async ({ username, character }) => {
      try {
        const user = await prisma.user.upsert({
          where: { username },
          update: {},
          create: { username },
        });
        socket.emit('lobbyJoined', { user, character });
      } catch (err) {
        socket.emit('error', { message: 'Kullanıcı oluşturulamadı.' });
      }
    });

    socket.on('createRoom', async ({ userId, character }) => {
      try {
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = await prisma.room.create({ data: { inviteCode, status: 'playing' } });
        const bonus = getCharacterBonus(character);
        const player = await prisma.player.create({
          data: { userId, roomId: room.id, character, isTurn: true, position: 'kadikoy', ...bonus },
        });

        const roomState = createInitialRoomState(room.id, player.id, 1);
        roomStates.set(room.id, roomState);
        socket.join(room.id);
        connectedUsers.set(socket.id, { userId, roomId: room.id });

        socket.emit('roomCreated', { room, player });
        await startTurnTimer(io, room.id, userId);
      } catch (err) {
        socket.emit('error', { message: 'Oda oluşturulamadı.' });
      }
    });

    socket.on('createTestRoom', async () => {
      try {
        const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const [firstUser, secondUser] = await Promise.all([
          prisma.user.create({ data: { username: `TestKurucu${suffix}` } }),
          prisma.user.create({ data: { username: `TestRakip${suffix}` } }),
        ]);
        const room = await prisma.room.create({ data: { inviteCode, status: 'playing' } });
        const [firstPlayer, secondPlayer] = await Promise.all([
          prisma.player.create({
            data: { userId: firstUser.id, roomId: room.id, character: 'Ogrenci', isTurn: true, position: 'kadikoy', ...getCharacterBonus('Ogrenci') },
          }),
          prisma.player.create({
            data: { userId: secondUser.id, roomId: room.id, character: 'Esnaf', position: 'kadikoy', ...getCharacterBonus('Esnaf') },
          }),
        ]);
        const players = await prisma.player.findMany({ where: { roomId: room.id }, orderBy: { id: 'asc' } });

        const roomState = createInitialRoomState(room.id, firstPlayer.id, 2);
        roomStates.set(room.id, roomState);
        socket.join(room.id);
        connectedUsers.set(socket.id, { userId: firstUser.id, roomId: room.id, testMode: true });

        socket.emit('testRoomCreated', {
          room,
          user: firstUser,
          player: firstPlayer,
          players,
          mapType: getRoomState(room.id).mapType,
          controlledUserIds: [firstUser.id, secondUser.id],
        });
        await startTurnTimer(io, room.id, firstUser.id);
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Test odası oluşturulamadı.' });
      }
    });

    socket.on('resumeRoom', async ({ roomId, userId }) => {
      try {
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        const player = await prisma.player.findFirst({ where: { roomId, userId } });
        if (!room || !player) return socket.emit('error', { message: 'Oyun oturumu yenilenemedi.' });

        socket.join(roomId);
        connectedUsers.set(socket.id, { userId, roomId });
        getRoomState(roomId, player.id);
        await emitGameState(io, roomId);
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Oyun oturumu yenilenemedi.' });
      }
    });

    socket.on('joinRoom', async ({ userId, character, inviteCode }) => {
      try {
        const room = await prisma.room.findUnique({ where: { inviteCode }, include: { players: true } });
        if (!room) return socket.emit('error', { message: 'Oda bulunamadı.' });
        if (room.status === 'finished') return socket.emit('error', { message: 'Bu oyun bitmiş.' });
        if (room.players.length >= 8) return socket.emit('error', { message: 'Oda dolu.' });

        const bonus = getCharacterBonus(character);
        const player = await prisma.player.create({
          data: { userId, roomId: room.id, character, position: 'kadikoy', ...bonus },
        });

        const roomState = getRoomState(room.id, room.players[0]?.id);
        socket.join(room.id);
        connectedUsers.set(socket.id, { userId, roomId: room.id });

        const players = await prisma.player.findMany({ where: { roomId: room.id }, orderBy: { id: 'asc' } });
        roomState.mapType = getMapTypeForPlayerCount(players.length);

        io.to(room.id).emit('playerJoined', { player });
        socket.emit('roomJoined', { room, player, players });
        await emitGameState(io, room.id);
      } catch (err) {
        socket.emit('error', { message: 'Odaya katılınamadı.' });
      }
    });

    socket.on('rollDice', async ({ roomId, userId }) => {
      try {
        const roomState = getRoomState(roomId);
        const player = await prisma.player.findFirst({ where: { userId, roomId } });

        if (!player || !player.isTurn) return socket.emit('error', { message: 'Sıra sizde değil.' });
        if (roomState.lastRoll?.userId === userId) {
          return socket.emit('error', { message: 'Bu turda zaten zar attınız.' });
        }

        const moveOptions = Array.from({ length: 6 }, (_, index) => {
          const diceValue = index + 1;
          return {
            diceValue,
            possibleMoves: findReachableDistricts(player.position, diceValue),
          };
        }).filter((option) => option.possibleMoves.length > 0);

        if (moveOptions.length === 0) {
          return socket.emit('error', { message: 'Bu konumdan gidilebilir ilçe bulunamadı.' });
        }

        const { diceValue, possibleMoves } = moveOptions[Math.floor(Math.random() * moveOptions.length)];
        roomState.lastRoll = { userId, diceValue, possibleMoves };

        io.to(roomId).emit('diceRolled', { userId, value: diceValue, possibleMoves });
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Zar atılamadı.' });
      }
    });

    socket.on('commitMove', async ({ roomId, userId, targetDistrictId }) => {
      try {
        const roomState = getRoomState(roomId);
        const playerList = await prisma.player.findMany({ where: { roomId }, orderBy: { id: 'asc' } });
        const player = playerList.find((item) => item.userId === userId);

        if (!player || !player.isTurn) return socket.emit('error', { message: 'Sıra sizde değil.' });
        if (!roomState.lastRoll || roomState.lastRoll.userId !== userId) {
          return socket.emit('error', { message: 'Önce zar atmalısınız.' });
        }
        if (!roomState.lastRoll.possibleMoves.includes(targetDistrictId)) {
          return socket.emit('error', { message: 'Bu ilçe zar sonucuna göre erişilebilir değil.' });
        }

        const districtState = roomState.districts[targetDistrictId];
        const updates = { position: targetDistrictId };

        if (!districtState || districtState.remainingTurns <= 0 || !districtState.ownerId) {
          if (player.redTickets < PURCHASE_COST_RED) {
            return socket.emit('error', { message: 'Masayı kapatmak için yeterli kırmızı bilet yok.' });
          }

          updates.redTickets = player.redTickets - PURCHASE_COST_RED;
          roomState.districts[targetDistrictId] = {
            ownerId: player.id,
            remainingTurns: 3,
            type: 'normal',
          };
          roomState.activeEvent = `${player.character} bir masayı kapattı`;
        } else if (districtState.ownerId !== player.id) {
          const owner = playerList.find((item) => item.id === districtState.ownerId);
          const payment = Math.min(player.redTickets, RENT_COST_RED);

          updates.redTickets = player.redTickets - payment;
          if (owner && payment > 0) {
            await prisma.player.update({
              where: { id: owner.id },
              data: { redTickets: owner.redTickets + payment },
            });
          }
          roomState.activeEvent = `${player.character} çay ısmarladı`;
        } else {
          roomState.activeEvent = `${player.character} kendi mekanına uğradı`;
        }

        await prisma.player.update({ where: { id: player.id }, data: updates });
        io.to(roomId).emit('playerMoved', { userId, targetDistrictId });
        await emitGameState(io, roomId);
        await advanceTurn(io, roomId, userId);
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Hamle tamamlanamadı.' });
      }
    });

    socket.on('fortuneCoffee', async ({ roomId, userId }) => {
      try {
        const roomState = getRoomState(roomId);
        const player = await prisma.player.findFirst({ where: { userId, roomId } });
        if (!player || !player.isTurn) return socket.emit('error', { message: 'Sadece kendi sıranızda fal bakabilirsiniz.' });
        if (player.greenTickets < FORTUNE_COST_GREEN) return socket.emit('error', { message: 'Fal için yeterli yeşil bilet yok.' });

        const { rates, event } = rollTicketRates(roomState.ticketRates);
        roomState.ticketRates = rates;
        roomState.activeEvent = `Kahve falı: ${event}`;

        await prisma.player.update({
          where: { id: player.id },
          data: { greenTickets: player.greenTickets - FORTUNE_COST_GREEN },
        });
        await emitGameState(io, roomId);
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Kahve falı çalışmadı.' });
      }
    });

    socket.on('sabotageDistrict', async ({ roomId, userId }) => {
      try {
        const roomState = getRoomState(roomId);
        const player = await prisma.player.findFirst({ where: { userId, roomId } });
        if (!player || !player.isTurn) return socket.emit('error', { message: 'Sadece kendi sıranızda zabıta çağırabilirsiniz.' });
        if (player.blueTickets < SABOTAGE_COST_BLUE) return socket.emit('error', { message: 'Zabıta için yeterli mavi bilet yok.' });

        const targetEntry = Object.entries(roomState.districts)
          .filter(([, district]) => district.ownerId && district.ownerId !== player.id && district.remainingTurns > 0)
          .sort((a, b) => b[1].remainingTurns - a[1].remainingTurns)[0];

        if (!targetEntry) return socket.emit('error', { message: 'Sabote edilecek rakip masası yok.' });

        const [targetDistrictId] = targetEntry;
        delete roomState.districts[targetDistrictId];
        roomState.activeEvent = `Zabıta ${targetDistrictId} masasını dağıttı`;

        await prisma.player.update({
          where: { id: player.id },
          data: { blueTickets: player.blueTickets - SABOTAGE_COST_BLUE },
        });
        await emitGameState(io, roomId);
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Zabıta çağrılamadı.' });
      }
    });

    socket.on('useTaxi', async ({ roomId, userId }) => {
      try {
        const roomState = getRoomState(roomId);
        const player = await prisma.player.findFirst({ where: { userId, roomId } });
        if (!player || !player.isTurn) return socket.emit('error', { message: 'Taksi sadece kendi sıranızda kullanılabilir.' });
        if (player.greenTickets < TAXI_COST_GREEN) return socket.emit('error', { message: 'Taksi için yeterli yeşil bilet yok.' });

        await prisma.player.update({
          where: { id: player.id },
          data: { greenTickets: player.greenTickets - TAXI_COST_GREEN },
        });

        if (Math.random() < 0.65) {
          const twoSteps = mapData.findReachableDistricts(player.position, 2);
          const threeSteps = mapData.findReachableDistricts(player.position, 3);
          const possibleTargets = [...new Set([...twoSteps, ...threeSteps])];
          
          if (possibleTargets.length > 0) {
            const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
            roomState.lastRoll = { userId, diceValue: 0, possibleMoves: [target] };
            roomState.activeEvent = 'Taksi tuttu, rota açıldı';
            io.to(roomId).emit('diceRolled', { userId, value: 'T', possibleMoves: [target] });
          } else {
            roomState.activeEvent = 'Değişim saati: uygun taksi rotası yok';
            await emitGameState(io, roomId);
            await advanceTurn(io, roomId, userId);
            return;
          }
        } else {
          roomState.activeEvent = 'Değişim saati: taksi iptal';
          await emitGameState(io, roomId);
          await advanceTurn(io, roomId, userId);
          return;
        }

        await emitGameState(io, roomId);
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Taksi kullanılamadı.' });
      }
    });

    socket.on('quickMatch', ({ userId, character }) => {
      if (matchmakingQueue.find(p => p.userId === userId)) return;
      matchmakingQueue.push({ socket, userId, character });
      
      if (matchmakingQueue.length >= 4) {
        clearTimeout(matchmakingTimer);
        matchmakingTimer = null;
        startMatchmakingGame(io);
      } else if (matchmakingQueue.length >= 2) {
        if (!matchmakingTimer) {
          matchmakingTimer = setTimeout(() => {
            startMatchmakingGame(io);
            matchmakingTimer = null;
          }, 10000);
        }
      }
      socket.emit('quickMatchJoined', { queueLength: matchmakingQueue.length });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      connectedUsers.delete(socket.id);
      
      const qIndex = matchmakingQueue.findIndex(p => p.socket.id === socket.id);
      if (qIndex !== -1) {
        matchmakingQueue.splice(qIndex, 1);
        if (matchmakingQueue.length < 2 && matchmakingTimer) {
          clearTimeout(matchmakingTimer);
          matchmakingTimer = null;
        }
      }
    });
  });
};
