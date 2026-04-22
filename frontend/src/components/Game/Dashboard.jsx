import { useState } from 'react';
import useGameStore from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice5, AlertTriangle, Car, Users } from 'lucide-react';
import IstanbulMap from '../Map/IstanbulMap';

export default function Dashboard() {
  const { room, players, myPlayer, diceValue, rollDice } = useGameStore();
  const [showSabotage, setShowSabotage] = useState(false);

  // Economy mock data for MVP UI
  const tickets = {
    red: myPlayer?.redTickets || 10,
    blue: myPlayer?.blueTickets || 10,
    green: myPlayer?.greenTickets || 10,
  };

  const currentRates = {
    red: 1, blue: 2, green: 4
  };

  if (!room) return null;

  return (
    <div className="relative w-full h-screen flex flex-col bg-blue-50">
      {/* Top Header - Room Info & Leaderboard snippet */}
      <div className="absolute top-0 w-full z-10 p-4 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur rounded-2xl p-3 shadow-lg pointer-events-auto border-2 border-gray-100 flex items-center gap-3">
          <div className="bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-1 rounded-lg">ODA: {room.inviteCode}</div>
          <div className="flex -space-x-2">
            {players.map((p, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-bold" title={p.character}>
                {p.character.substring(0, 1)}
              </div>
            ))}
          </div>
        </div>

        {/* Currency Rates */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-2 shadow-lg pointer-events-auto border-2 border-gray-100 flex flex-col gap-1">
          <div className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider">Güncel Kur</div>
          <div className="flex gap-2 text-xs font-bold">
            <span className="text-[var(--color-ticket-red)]">1 K: {currentRates.red}₺</span>
            <span className="text-[var(--color-ticket-blue)]">1 M: {currentRates.blue}₺</span>
            <span className="text-[var(--color-ticket-green)]">1 Y: {currentRates.green}₺</span>
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <IstanbulMap />
      </div>

      {/* Bottom Dashboard - Player UI */}
      <div className="absolute bottom-0 w-full z-10 p-4 pointer-events-none">
        <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] pointer-events-auto flex flex-col">
          
          {/* Action Area */}
          <div className="flex justify-between items-end p-4 -mt-10">
            {/* Wallet */}
            <div className="bg-gray-100 rounded-2xl p-3 shadow-inner flex flex-col gap-2 min-w-[120px]">
              <div className="text-xs font-bold text-gray-500 text-center uppercase">Cüzdan</div>
              <div className="flex justify-between items-center bg-white rounded-lg px-2 py-1 shadow-sm border border-[var(--color-ticket-red)]">
                <div className="w-3 h-3 rounded-full bg-[var(--color-ticket-red)]"></div>
                <span className="font-bold text-sm">{tickets.red}</span>
              </div>
              <div className="flex justify-between items-center bg-white rounded-lg px-2 py-1 shadow-sm border border-[var(--color-ticket-blue)]">
                <div className="w-3 h-3 rounded-full bg-[var(--color-ticket-blue)]"></div>
                <span className="font-bold text-sm">{tickets.blue}</span>
              </div>
              <div className="flex justify-between items-center bg-white rounded-lg px-2 py-1 shadow-sm border border-[var(--color-ticket-green)]">
                <div className="w-3 h-3 rounded-full bg-[var(--color-ticket-green)]"></div>
                <span className="font-bold text-sm">{tickets.green}</span>
              </div>
            </div>

            {/* Central Roll Button */}
            <div className="flex flex-col items-center">
              {diceValue && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: -20, opacity: 1 }}
                  className="absolute -top-16 bg-white border-4 border-[var(--color-secondary)] text-[var(--color-secondary)] font-black text-4xl w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl rotate-12"
                >
                  {diceValue}
                </motion.div>
              )}
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={rollDice}
                className="w-24 h-24 bg-gradient-to-t from-[var(--color-primary)] to-[#ff8c8f] rounded-full border-4 border-white shadow-[0_8px_0_0_#d32f2f,0_15px_20px_rgba(0,0,0,0.4)] flex items-center justify-center text-white relative z-10"
              >
                <Dice5 size={48} strokeWidth={2.5} />
              </motion.button>
              <div className="mt-4 font-black text-gray-800 text-lg uppercase tracking-wide">Zar At</div>
            </div>

            {/* Sabotage Menu Toggle */}
            <div className="relative">
              <AnimatePresence>
                {showSabotage && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-full right-0 mb-4 bg-white p-3 rounded-2xl shadow-xl border-2 border-gray-100 flex flex-col gap-2 min-w-[150px]"
                  >
                    <button className="game-btn bg-purple-100 border-2 border-purple-300 text-purple-700 py-2 px-3 text-sm flex items-center gap-2">
                      <AlertTriangle size={16} /> Zabıta Çağır
                    </button>
                    <button className="game-btn bg-yellow-100 border-2 border-yellow-300 text-yellow-700 py-2 px-3 text-sm flex items-center gap-2">
                      <Car size={16} /> Taksi (Riskli)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setShowSabotage(!showSabotage)}
                className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-white shadow-lg game-btn"
              >
                <AlertTriangle size={24} />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
