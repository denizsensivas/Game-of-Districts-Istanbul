import { create } from 'zustand';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const socket = io(API_URL);

const useGameStore = create((set, get) => ({
  socket,
  user: null,
  character: null,
  room: null,
  players: [],
  myPlayer: null,
  
  // Economy State
  ticketRates: {
    red: 1,
    blue: 1,
    green: 1
  },
  
  // Game State
  currentTurnUserId: null,
  turnTimeRemaining: 30,
  diceValue: null,
  mapState: {}, // districtId -> { ownerId, remainingTurns, type }

  // Actions
  joinLobby: (username, character) => {
    socket.emit('joinLobby', { username, character });
  },

  createRoom: () => {
    const { user, character } = get();
    if (user) {
      socket.emit('createRoom', { userId: user.id, character });
    }
  },

  joinRoom: (inviteCode) => {
    const { user, character } = get();
    if (user) {
      socket.emit('joinRoom', { userId: user.id, character, inviteCode });
    }
  },

  rollDice: () => {
    const { room, user } = get();
    if (room && user) {
      socket.emit('rollDice', { roomId: room.id, userId: user.id });
    }
  },

  // Socket Listeners (Setup logic)
  setupSocketListeners: () => {
    socket.on('lobbyJoined', ({ user, character }) => {
      set({ user, character });
    });

    socket.on('roomCreated', ({ room, player }) => {
      set({ room, myPlayer: player, players: [player] });
    });

    socket.on('roomJoined', ({ room, player, players }) => {
      set({ room, myPlayer: player, players });
    });

    socket.on('playerJoined', ({ player }) => {
      set((state) => ({ players: [...state.players, player] }));
    });

    socket.on('diceRolled', ({ userId, value }) => {
      set({ diceValue: value });
      // TODO: Handle highlighting logic or moving animations
    });

    socket.on('error', ({ message }) => {
      alert(message);
    });
  }
}));

export default useGameStore;
