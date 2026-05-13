import { create } from 'zustand';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(API_URL);

const freshGameSession = {
  diceValue: null,
  possibleMoves: [],
  pendingMove: null,
  mapState: {},
  mapType: 'smallMap.svg',
  gameOver: false,
  rankings: [],
  activeEvent: 'Oyun başladı',
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
  mapType: 'smallMap.svg',
  activeEvent: 'Oyun başladı',
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

  createRoom: () => {
    const { user, character } = get();
    if (user) {
      socket.emit('createRoom', { userId: user.id, character });
    }
  },

  createTestRoom: () => {
    socket.emit('createTestRoom');
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
      set({ possibleMoves: [], pendingMove: null });
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

    socket.on('roomCreated', ({ room, player }) => {
      set({ ...freshGameSession, room, myPlayer: player, players: [player], isTestMode: false, controlledUserIds: [] });
    });

    socket.on('roomJoined', ({ room, player, players }) => {
      set({ ...freshGameSession, room, myPlayer: player, players, isTestMode: false, controlledUserIds: [] });
    });

    socket.on('testRoomCreated', ({ room, user, player, players, mapType, controlledUserIds }) => {
      set({
        ...freshGameSession,
        user,
        character: player.character,
        room,
        myPlayer: player,
        players,
        mapType: mapType || 'smallMap.svg',
        isTestMode: true,
        controlledUserIds,
      });
    });

    socket.on('playerJoined', ({ player }) => {
      set((state) => ({ players: [...state.players, player] }));
    });

    socket.on('diceRolled', ({ userId, value, possibleMoves }) => {
      set({ diceValue: value });
      const { isTestMode, controlledUserIds, user } = get();
      const controlsPlayer = isTestMode ? controlledUserIds.includes(userId) : user?.id === userId;
      if (controlsPlayer && possibleMoves) {
        set({ possibleMoves });
      }
    });

    socket.on('playerMoved', ({ userId, targetDistrictId }) => {
      set((state) => ({
        players: state.players.map(p => 
          p.userId === userId ? { ...p, position: targetDistrictId } : p
        ),
        myPlayer: state.myPlayer?.userId === userId ? { ...state.myPlayer, position: targetDistrictId } : state.myPlayer
      }));
    });

    socket.on('turnChanged', ({ currentTurnUserId }) => {
      set({ currentTurnUserId, diceValue: null, possibleMoves: [], pendingMove: null });
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
      turnEndsAt,
      mapState,
      gameOver
    }) => {
      const { isTestMode, user } = get();
      const myPlayer = isTestMode
        ? players.find(p => p.userId === currentTurnUserId) || players[0]
        : players.find(p => p.userId === user?.id);
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
        turnEndsAt,
        mapState,
        gameOver,
      });
    });

    socket.on('gameEnded', ({ rankings }) => {
      set({
        rankings,
        gameOver: true,
        possibleMoves: [],
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
