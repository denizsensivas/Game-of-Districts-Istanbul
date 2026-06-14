const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const mapData = require('../data/mapData');
const { narrateActiveEvent } = require('../services/llmNarrator');

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
const FERRY_COST_GREEN = 1;
const TICKET_FIELDS = {
  red: 'redTickets',
  blue: 'blueTickets',
  green: 'greenTickets',
};

const connectedUsers = new Map();
const roomStates = new Map();
const matchmakingQueue = [];
let matchmakingTimer = null;
let activeEventTokenCounter = 0;

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
    p.socket.emit('roomJoined', { room, player: players.find(x => x.userId === p.userId), players, mapType: roomState.mapType });
  }
  
  await emitGameState(io, room.id);
  await startTurnTimer(io, room.id, players[0].userId);
}

const MAP_TYPES = {
  small: 'Kucuk_idli.svg',
  big: 'buyuk.svg',
};

function normalizeMapType(mapType) {
  return Object.values(MAP_TYPES).includes(mapType) ? mapType : null;
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



function createInitialRoomState(roomId, firstPlayerId, playerCount = 1, requestedMapType = null) {
  return {
    roomId,
    currentRound: 1,
    maxRounds: MAX_ROUNDS,
    mapType: normalizeMapType(requestedMapType) || getMapTypeForPlayerCount(playerCount),
    ticketRates: { red: 1, blue: 2, green: 4 },
    activeEvent: 'Oyun başladı',
    activeEventStatus: 'ready',
    activeEventType: 'system',
    activeEventToken: null,
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

function setStaticActiveEvent(roomState, activeEvent, activeEventType = 'system') {
  roomState.activeEvent = activeEvent;
  roomState.activeEventStatus = 'ready';
  roomState.activeEventType = activeEventType;
  roomState.activeEventToken = null;
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

function getReachableMoveDetails(startNode, steps, player, mapType) {
  return mapData.findReachableRouteDetails(startNode, steps, mapType)
    .filter((route) => !route.ferryRequired || player.greenTickets >= FERRY_COST_GREEN)
    .map((route) => ({
      districtId: route.districtId,
      ferryRequired: route.ferryRequired,
      ferryCostGreen: route.ferryRequired ? FERRY_COST_GREEN : 0,
    }));
}

function indexMoveDetails(moveDetails) {
  return Object.fromEntries(moveDetails.map((move) => [move.districtId, move]));
}

function getDistrictName(districtId) {
  return mapData.districts.find((district) => district.id === districtId)?.name || districtId;
}

function getPlayerDisplayName(player) {
  return player?.user?.username || player?.username || player?.character || 'Oyuncu';
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

function getTicketName(color) {
  return { red: 'Kırmızı', blue: 'Mavi', green: 'Yeşil' }[color] || color;
}

function getTicketNameLower(color) {
  return { red: 'kırmızı', blue: 'mavi', green: 'yeşil' }[color?.toLowerCase()] || color?.toLowerCase() || 'bilet';
}

function getFortuneFallback(event) {
  const [rawColor] = String(event || '').split(' ');
  const color = rawColor?.toLowerCase();
  const ticketName = getTicketNameLower(rawColor);
  const wentUp = String(event || '').includes('yükseldi');
  const resultText = wentUp ? `${ticketName} biletler zamlandı` : `${ticketName} biletler ucuzladı`;
  const causesByColor = {
    red: wentUp
      ? ['Mekan kiraları uçtu', 'Çay hesapları kabardı', 'Masalar kapış kapış gitti']
      : ['Esnaf kepenkleri erken açtı', 'Çaylar şirketten yazıldı', 'Boş masa bolluğu çıktı'],
    blue: wentUp
      ? ['Zabıta denetimi arttı', 'Ruhsat kontrolü sıkılaştı', 'Masa dağıtma söylentisi yayıldı']
      : ['Zabıta çay molasına çıktı', 'Denetim dosyaları karıştı', 'Mühürler çekmeceye kalktı'],
    green: wentUp
      ? ['Lodos çıktı, vapur seferleri iptal', 'Köprüde kaza oldu', 'Taksi durağında kuyruk uzadı']
      : ['Boğaz trafiği açıldı', 'Vapur iskelesinde sıra kalmadı', 'Falda boş taksi çıktı'],
  };
  const causes = causesByColor[color] || ['Fincanda tuhaf bir işaret belirdi'];
  const cause = causes[Math.floor(Math.random() * causes.length)];

  return `${cause}, ${resultText}`;
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
    activeEventStatus: roomState.activeEventStatus,
    activeEventType: roomState.activeEventType,
    turnEndsAt: roomState.turnEndsAt,
    mapState: serializeMapState(roomState.districts),
    gameOver: roomState.gameOver,
    activeRoll: roomState.lastRoll,
  });
}

async function revealActiveEvent(io, roomId, context, loadingEvent, fallbackEvent) {
  const roomState = roomStates.get(roomId);
  if (!roomState) return;

  const eventToken = `${Date.now()}-${activeEventTokenCounter += 1}`;
  roomState.activeEvent = loadingEvent;
  roomState.activeEventStatus = 'loading';
  roomState.activeEventType = context.eventType;
  roomState.activeEventToken = eventToken;
  await emitGameState(io, roomId);

  narrateActiveEvent(context).then(async (narratedEvent) => {
    const roomState = roomStates.get(roomId);
    if (!roomState || roomState.activeEventToken !== eventToken) return;

    roomState.activeEvent = narratedEvent || fallbackEvent;
    roomState.activeEventStatus = 'ready';
    roomState.activeEventType = context.eventType;
    roomState.activeEventToken = null;
    await emitGameState(io, roomId);
  }).catch((err) => {
    console.warn('Active event narration failed:', err.message);
  });
}

async function endGame(io, roomId) {
  const roomState = getRoomState(roomId);
  if (roomState.gameOver) return;

  roomState.gameOver = true;
  clearTimeout(roomState.timer);

  await prisma.room.update({ where: { id: roomId }, data: { status: 'finished' } });
  await prisma.player.updateMany({ where: { roomId }, data: { isTurn: false } });

  const players = await prisma.player.findMany({
    where: { roomId },
    orderBy: { id: 'asc' },
    include: { user: true },
  });
  const rankings = players
    .map((player) => ({
      playerId: player.id,
      userId: player.userId,
      username: getPlayerDisplayName(player),
      character: player.character,
      score: calculateScore(player, roomState),
      tickets: {
        red: player.redTickets,
        blue: player.blueTickets,
        green: player.greenTickets,
      },
    }))
    .sort((a, b) => b.score - a.score);

  const winner = rankings[0] || null;
  const staticEvent = winner ? `${winner.username} oyunu kazandı` : 'Oyun sona erdi';

  io.to(roomId).emit('gameEnded', { rankings });
  await revealActiveEvent(io, roomId, {
    eventType: 'endGame',
    staticEvent,
    ticketRates: roomState.ticketRates,
    outcome: 'gameEnded',
    winner,
  }, 'Skor defteri açılıyor', winner ? 'Kazanan belli, İstanbul alkışta' : 'Oyun bitti, masa dağıldı');
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

    socket.on('createRoom', async ({ userId, character, mapType }) => {
      try {
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = await prisma.room.create({ data: { inviteCode, status: 'playing' } });
        const bonus = getCharacterBonus(character);
        const player = await prisma.player.create({
          data: { userId, roomId: room.id, character, isTurn: true, position: 'kadikoy', ...bonus },
        });

        const roomState = createInitialRoomState(room.id, player.id, 1, mapType);
        roomStates.set(room.id, roomState);
        socket.join(room.id);
        connectedUsers.set(socket.id, { userId, roomId: room.id });

        socket.emit('roomCreated', { room, player, mapType: roomState.mapType });
        await startTurnTimer(io, room.id, userId);
      } catch (err) {
        socket.emit('error', { message: 'Oda oluşturulamadı.' });
      }
    });

    socket.on('createTestRoom', async ({ mapType } = {}) => {
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

        const roomState = createInitialRoomState(room.id, firstPlayer.id, 2, mapType);
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
        io.to(room.id).emit('playerJoined', { player });
        socket.emit('roomJoined', { room, player, players, mapType: roomState.mapType });
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
          const moveDetails = getReachableMoveDetails(player.position, diceValue, player, roomState.mapType);
          return {
            diceValue,
            possibleMoves: moveDetails.map((move) => move.districtId),
            possibleMoveDetails: indexMoveDetails(moveDetails),
          };
        }).filter((option) => option.possibleMoves.length > 0);

        if (moveOptions.length === 0) {
          return socket.emit('error', { message: 'Bu konumdan gidilebilir ilçe bulunamadı.' });
        }

        const { diceValue, possibleMoves, possibleMoveDetails } = moveOptions[Math.floor(Math.random() * moveOptions.length)];
        roomState.lastRoll = { userId, diceValue, possibleMoves, possibleMoveDetails };

        io.to(roomId).emit('diceRolled', { userId, value: diceValue, possibleMoves, possibleMoveDetails });
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Zar atılamadı.' });
      }
    });

    socket.on('commitMove', async ({ roomId, userId, targetDistrictId }) => {
      try {
        const roomState = getRoomState(roomId);
        const playerList = await prisma.player.findMany({
          where: { roomId },
          orderBy: { id: 'asc' },
          include: { user: true },
        });
        const player = playerList.find((item) => item.userId === userId);
        const playerName = getPlayerDisplayName(player);
        const districtName = getDistrictName(targetDistrictId);

        if (!player || !player.isTurn) return socket.emit('error', { message: 'Sıra sizde değil.' });
        if (!roomState.lastRoll || roomState.lastRoll.userId !== userId) {
          return socket.emit('error', { message: 'Önce zar atmalısınız.' });
        }
        if (!roomState.lastRoll.possibleMoves.includes(targetDistrictId)) {
          return socket.emit('error', { message: 'Bu ilçe zar sonucuna göre erişilebilir değil.' });
        }

        const moveDetail = roomState.lastRoll.possibleMoveDetails?.[targetDistrictId] || {};
        const ferryCostGreen = moveDetail.ferryRequired ? FERRY_COST_GREEN : 0;
        if (ferryCostGreen > 0 && player.greenTickets < ferryCostGreen) {
          return socket.emit('error', { message: 'Karşı yakaya vapurla geçmek için yeterli yeşil bilet yok.' });
        }

        const districtState = roomState.districts[targetDistrictId];
        const updates = { position: targetDistrictId };
        let nextRedTickets = player.redTickets;
        let nextGreenTickets = player.greenTickets - ferryCostGreen;

        if (!districtState || districtState.remainingTurns <= 0 || !districtState.ownerId) {
          if (nextRedTickets < PURCHASE_COST_RED) {
            return socket.emit('error', { message: 'Masayı kapatmak için yeterli kırmızı bilet yok.' });
          }

          nextRedTickets -= PURCHASE_COST_RED;
          roomState.districts[targetDistrictId] = {
            ownerId: player.id,
            remainingTurns: 3,
            type: 'normal',
          };
          setStaticActiveEvent(roomState, `${playerName} ${districtName} masasını kapattı`);
        } else if (districtState.ownerId !== player.id) {
          const owner = playerList.find((item) => item.id === districtState.ownerId);
          const payment = Math.min(nextRedTickets, RENT_COST_RED);

          nextRedTickets -= payment;
          if (owner && payment > 0) {
            await prisma.player.update({
              where: { id: owner.id },
              data: { redTickets: owner.redTickets + payment },
            });
          }
          setStaticActiveEvent(roomState, `${playerName} ${getPlayerDisplayName(owner)} için çay ısmarladı`);
        } else {
          setStaticActiveEvent(roomState, `${playerName} ${districtName} mekanına uğradı`);
        }

        updates.redTickets = nextRedTickets;
        updates.greenTickets = nextGreenTickets;
        if (ferryCostGreen > 0) {
          setStaticActiveEvent(roomState, `${roomState.activeEvent} - vapur kullandı`);
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
        const staticEvent = `Kahve falı: ${event}`;

        await prisma.player.update({
          where: { id: player.id },
          data: { greenTickets: player.greenTickets - FORTUNE_COST_GREEN },
        });
        await revealActiveEvent(io, roomId, {
          eventType: 'fortuneCoffee',
          staticEvent,
          player,
          ticketRates: rates,
          outcome: event,
        }, 'Fincan ters çevrildi, fal bekleniyor', getFortuneFallback(event));
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Kahve falı çalışmadı.' });
      }
    });

    socket.on('exchangeTickets', async ({ roomId, userId, fromColor, toColor, amount }) => {
      try {
        const roomState = getRoomState(roomId);
        const player = await prisma.player.findFirst({ where: { userId, roomId } });
        const fromField = TICKET_FIELDS[fromColor];
        const toField = TICKET_FIELDS[toColor];
        const sellAmount = Math.floor(Number(amount));

        if (!player) return socket.emit('error', { message: 'Oyuncu bulunamadı.' });
        if (!fromField || !toField || fromColor === toColor) return socket.emit('error', { message: 'Geçersiz bilet dönüşümü.' });
        if (!Number.isInteger(sellAmount) || sellAmount <= 0) return socket.emit('error', { message: 'Bozdurulacak bilet miktarı geçersiz.' });
        if (player[fromField] < sellAmount) return socket.emit('error', { message: `${getTicketName(fromColor)} biletiniz yeterli değil.` });

        const sellValue = sellAmount * roomState.ticketRates[fromColor];
        const buyAmount = Math.floor(sellValue / roomState.ticketRates[toColor]);
        if (buyAmount <= 0) return socket.emit('error', { message: 'Bu kurla en az 1 bilet alınamıyor.' });

        await prisma.player.update({
          where: { id: player.id },
          data: {
            [fromField]: player[fromField] - sellAmount,
            [toField]: player[toField] + buyAmount,
          },
        });

        setStaticActiveEvent(roomState, `${player.character} ${sellAmount} ${getTicketName(fromColor)} bozdurup ${buyAmount} ${getTicketName(toColor)} aldı`);
        await emitGameState(io, roomId);
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Bilet bozdurma yapılamadı.' });
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
        const staticEvent = `Zabıta ${targetDistrictId} masasını dağıttı`;

        await prisma.player.update({
          where: { id: player.id },
          data: { blueTickets: player.blueTickets - SABOTAGE_COST_BLUE },
        });
        await revealActiveEvent(io, roomId, {
          eventType: 'sabotageDistrict',
          staticEvent,
          player,
          targetDistrictId,
          ticketRates: roomState.ticketRates,
          outcome: 'districtCleared',
        }, 'Zabıta telsizi cızırdıyor', 'Zabıta esnafı denetledi, masa mühürlendi');
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
          const possibleTargets = mapData.getMapDistricts(roomState.mapType)
            .filter((district) => district.id !== player.position)
            .map((district) => ({
              districtId: district.id,
              ferryRequired: false,
              ferryCostGreen: 0,
            }));
          
          if (possibleTargets.length > 0) {
            const possibleMoves = possibleTargets.map((target) => target.districtId);
            const possibleMoveDetails = indexMoveDetails(possibleTargets);
            const staticEvent = 'Taksi tuttu, rota açıldı';
            roomState.lastRoll = { userId, diceValue: 0, possibleMoves, possibleMoveDetails };
            io.to(roomId).emit('diceRolled', { userId, value: 'T', possibleMoves, possibleMoveDetails });
            await revealActiveEvent(io, roomId, {
              eventType: 'useTaxi',
              staticEvent,
              player,
              ticketRates: roomState.ticketRates,
              outcome: 'success',
            }, 'Taksi kontağı çeviriyor', 'Taksici tamam abla dedi, rota açıldı');
            return;
          } else {
            const staticEvent = 'Değişim saati: taksici o yöne gitmedi, bilet yandı';
            await revealActiveEvent(io, roomId, {
              eventType: 'useTaxi',
              staticEvent,
              player,
              ticketRates: roomState.ticketRates,
              outcome: 'cancelled',
            }, 'Taksi durağına bağlanılıyor', 'Değişim saati abla, o yöne gitmiyorum; bilet yandı');
            await advanceTurn(io, roomId, userId);
            return;
          }
        } else {
          const staticEvent = 'Değişim saati: taksici o yöne gitmedi, bilet yandı';
          await revealActiveEvent(io, roomId, {
            eventType: 'useTaxi',
            staticEvent,
            player,
            ticketRates: roomState.ticketRates,
            outcome: 'cancelled',
          }, 'Taksi durağına bağlanılıyor', 'Değişim saati abla, o yöne gitmiyorum; bilet yandı');
          await advanceTurn(io, roomId, userId);
          return;
        }
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

    socket.on('quitTestRoom', async ({ roomId }) => {
      try {
        const connection = connectedUsers.get(socket.id);
        if (!connection?.testMode || connection.roomId !== roomId) {
          return socket.emit('error', { message: 'Sadece test modundan çıkılabilir.' });
        }

        const roomState = roomStates.get(roomId);
        if (roomState?.timer) clearTimeout(roomState.timer);
        roomStates.delete(roomId);

        await prisma.room.update({ where: { id: roomId }, data: { status: 'finished' } });
        await prisma.player.updateMany({ where: { roomId }, data: { isTurn: false } });

        socket.leave(roomId);
        connectedUsers.delete(socket.id);
        socket.emit('testRoomQuit');
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Test modundan çıkılamadı.' });
      }
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
