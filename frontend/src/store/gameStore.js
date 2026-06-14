import { create } from 'zustand';
import { io } from 'socket.io-client';

function getDefaultApiUrl() {
  if (typeof window === 'undefined') return 'http://localhost:3001';

  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  return isLocalHost ? 'http://localhost:3001' : window.location.origin;
}

const API_URL = import.meta.env.VITE_API_URL || getDefaultApiUrl();
const socket = io(API_URL);

const freshGameSession = {
  diceValue: null,
  possibleMoves: [],
  possibleMoveDetails: {},
  pendingMove: null,
  mapState: {},
  mapType: 'Kucuk_idli.svg',
  gameOver: false,
  rankings: [],
  activeEvent: 'Oyun başladı',
  activeEventStatus: 'ready',
  activeEventType: 'system',
};

const leftRoomState = {
  ...freshGameSession,
  user: null,
  character: null,
  room: null,
  players: [],
  myPlayer: null,
  isTestMode: false,
  controlledUserIds: [],
  currentRound: 1,
  maxRounds: 12,
  currentTurnUserId: null,
  turnTimeRemaining: 30,
  turnEndsAt: null,
  ticketRates: {
    red: 1,
    blue: 2,
    green: 4
  },
};

export const MAP_TYPES = {
  small: 'Kucuk_idli.svg',
  big: 'buyuk.svg',
};

const useGameStore = create((set, get) => ({
  socket,
  user: null,
  character: null,
  room: null,
  players: [],
  myPlayer: null,
  isTestMode: false,
  controlledUserIds: [],
  currentRound: 1,
  maxRounds: 12,
  mapType: 'Kucuk_idli.svg',
  activeEvent: 'Oyun başladı',
  activeEventStatus: 'ready',
  activeEventType: 'system',
  gameOver: false,
  rankings: [],
  
  // Economy State
  ticketRates: {
    red: 1,
    blue: 2,
    green: 4
  },
  
  // Game State
  currentTurnUserId: null,
  turnTimeRemaining: 30,
  turnEndsAt: null,
  diceValue: null,
  possibleMoves: [],
  possibleMoveDetails: {},
  pendingMove: null, // Hedef ilçe seçildiğinde onay bekleyen durum
  mapState: {}, // districtId -> { ownerId, remainingTurns, type }

  // Actions
  getActiveUserId: () => {
    const { isTestMode, myPlayer, user } = get();
    return isTestMode ? myPlayer?.userId : user?.id;
  },

  joinLobby: (username, character) => {
    socket.emit('joinLobby', { username, character });
  },

  createRoom: (mapType = MAP_TYPES.small) => {
    const { user, character } = get();
    if (user) {
      socket.emit('createRoom', { userId: user.id, character, mapType });
    }
  },

  createTestRoom: (mapType = MAP_TYPES.small) => {
    socket.emit('createTestRoom', { mapType });
  },

  quitTestMode: () => {
    const { room, isTestMode } = get();
    if (room?.id && isTestMode) {
      socket.emit('quitTestRoom', { roomId: room.id });
    }
    set(leftRoomState);
  },

  joinRoom: (inviteCode) => {
    const { user, character } = get();
    if (user) {
      socket.emit('joinRoom', { userId: user.id, character, inviteCode });
    }
  },

  rollDice: () => {
    const { room, getActiveUserId } = get();
    const userId = getActiveUserId();
    if (room && userId) {
      socket.emit('rollDice', { roomId: room.id, userId });
    }
  },

  syncGameState: () => {
    const { room, getActiveUserId } = get();
    const userId = getActiveUserId();
    if (room?.id && userId) {
      socket.emit('resumeRoom', { roomId: room.id, userId });
    }
  },

  fortuneCoffee: () => {
    const { room, getActiveUserId } = get();
    const userId = getActiveUserId();
    if (room && userId) {
      socket.emit('fortuneCoffee', { roomId: room.id, userId });
    }
  },

  sabotageDistrict: () => {
    const { room, getActiveUserId } = get();
    const userId = getActiveUserId();
    if (room && userId) {
      socket.emit('sabotageDistrict', { roomId: room.id, userId });
    }
  },

  useTaxi: () => {
    const { room, getActiveUserId } = get();
    const userId = getActiveUserId();
    if (room && userId) {
      socket.emit('useTaxi', { roomId: room.id, userId });
    }
  },

  exchangeTickets: ({ fromColor, toColor, amount }) => {
    const { room, getActiveUserId } = get();
    const userId = getActiveUserId();
    if (room && userId) {
      socket.emit('exchangeTickets', { roomId: room.id, userId, fromColor, toColor, amount });
    }
  },

  movePlayer: (targetDistrictId) => {
    // Backend'e hemen göndermek yerine pending state'e al
    set({ pendingMove: targetDistrictId });
  },

  cancelMove: () => {
    set({ pendingMove: null });
  },

  commitMove: () => {
    const { room, pendingMove, getActiveUserId } = get();
    const userId = getActiveUserId();
    if (room && userId && pendingMove) {
      socket.emit('commitMove', { roomId: room.id, userId, targetDistrictId: pendingMove });
    }
  },

  // Socket Listeners (Setup logic)
  setupSocketListeners: () => {
    socket.removeAllListeners();

    socket.on('connect', () => {
      const { room, getActiveUserId } = get();
      const userId = getActiveUserId();
      if (room?.id && userId) {
        socket.emit('resumeRoom', { roomId: room.id, userId });
      }
    });

    socket.on('lobbyJoined', ({ user, character }) => {
      set({ user, character });
    });

    socket.on('roomCreated', ({ room, player, mapType }) => {
      set({
        ...freshGameSession,
        room,
        myPlayer: player,
        players: [player],
        mapType: mapType || MAP_TYPES.small,
        isTestMode: false,
        controlledUserIds: [],
      });
    });

    socket.on('roomJoined', ({ room, player, players, mapType }) => {
      set({
        ...freshGameSession,
        room,
        myPlayer: player,
        players,
        mapType: mapType || MAP_TYPES.small,
        isTestMode: false,
        controlledUserIds: [],
      });
    });

    socket.on('testRoomCreated', ({ room, user, player, players, mapType, controlledUserIds }) => {
      set({
        ...freshGameSession,
        user,
        character: player.character,
        room,
        myPlayer: player,
        players,
        mapType: mapType || MAP_TYPES.small,
        isTestMode: true,
        controlledUserIds,
      });
    });

    socket.on('playerJoined', ({ player }) => {
      set((state) => ({ players: [...state.players, player] }));
    });

    socket.on('diceRolled', ({ userId, value, possibleMoves, possibleMoveDetails }) => {
      set({ diceValue: value });
      const { isTestMode, controlledUserIds, user } = get();
      const controlsPlayer = isTestMode ? controlledUserIds.includes(userId) : user?.id === userId;
      if (controlsPlayer && possibleMoves) {
        set({ possibleMoves, possibleMoveDetails: possibleMoveDetails || {} });
      }
    });

    socket.on('playerMoved', ({ userId, targetDistrictId }) => {
      const { isTestMode, controlledUserIds, user } = get();
      const controlsPlayer = isTestMode ? controlledUserIds.includes(userId) : user?.id === userId;
      set((state) => ({
        players: state.players.map(p => 
          p.userId === userId ? { ...p, position: targetDistrictId } : p
        ),
        myPlayer: state.myPlayer?.userId === userId ? { ...state.myPlayer, position: targetDistrictId } : state.myPlayer,
        ...(controlsPlayer ? { possibleMoves: [], possibleMoveDetails: {}, pendingMove: null } : {})
      }));
    });

    socket.on('turnChanged', ({ currentTurnUserId }) => {
      set({ currentTurnUserId, diceValue: null, possibleMoves: [], possibleMoveDetails: {}, pendingMove: null });
      set((state) => ({
        players: state.players.map(p => ({ ...p, isTurn: p.userId === currentTurnUserId })),
        myPlayer: state.isTestMode
          ? state.players.find(p => p.userId === currentTurnUserId) || state.myPlayer
          : state.myPlayer
            ? { ...state.myPlayer, isTurn: state.myPlayer.userId === currentTurnUserId }
            : state.myPlayer
      }));
    });

    socket.on('districtUpdated', ({ districtId, ownerId }) => {
      set((state) => ({
        mapState: {
          ...state.mapState,
          [districtId]: { ...state.mapState[districtId], ownerId }
        }
      }));
    });

    socket.on('playersUpdated', ({ players }) => {
      set({ players });
      const { isTestMode, currentTurnUserId, user } = get();
      const myPlayer = isTestMode
        ? players.find(p => p.userId === currentTurnUserId) || players[0]
        : players.find(p => p.userId === user?.id);
      if(myPlayer) set({ myPlayer });
    });

    socket.on('gameStateUpdated', ({
      players,
      currentTurnUserId,
      currentRound,
      maxRounds,
      ticketRates,
      mapType,
      activeEvent,
      activeEventStatus,
      activeEventType,
      turnEndsAt,
      mapState,
      gameOver,
      activeRoll
    }) => {
      const { isTestMode, controlledUserIds, user } = get();
      const myPlayer = isTestMode
        ? players.find(p => p.userId === currentTurnUserId) || players[0]
        : players.find(p => p.userId === user?.id);
      const controlsActiveRoll = Boolean(
        activeRoll?.userId &&
        (isTestMode ? controlledUserIds.includes(activeRoll.userId) : activeRoll.userId === user?.id)
      );
      set({
        players,
        myPlayer: myPlayer
          ? { ...myPlayer, isTurn: myPlayer.userId === currentTurnUserId }
          : get().myPlayer,
        currentTurnUserId,
        currentRound,
        maxRounds,
        mapType: mapType || get().mapType,
        ticketRates,
        activeEvent,
        activeEventStatus: activeEventStatus || 'ready',
        activeEventType: activeEventType || 'system',
        turnEndsAt,
        mapState,
        gameOver,
        ...(controlsActiveRoll ? {
          diceValue: activeRoll.diceValue || 'T',
          possibleMoves: activeRoll.possibleMoves || [],
          possibleMoveDetails: activeRoll.possibleMoveDetails || {},
        } : {}),
      });
    });

    socket.on('gameEnded', ({ rankings }) => {
      set({
        rankings,
        gameOver: true,
        possibleMoves: [],
        possibleMoveDetails: {},
        pendingMove: null,
        diceValue: null,
      });
    });

    socket.on('error', ({ message }) => {
      alert(message);
    });
  }
}));

export default useGameStore;
