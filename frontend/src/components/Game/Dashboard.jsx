import { useEffect, useState } from 'react';
import useGameStore from '../../store/gameStore';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Dice5, AlertTriangle, Car, Coffee, Sparkles, X } from 'lucide-react';
import IstanbulMap from '../Map/IstanbulMap';
import { getCharacterTheme } from '../../utils/characterColors';

export default function Dashboard() {
  const {
    room,
    players,
    myPlayer,
    diceValue,
    rollDice,
    pendingMove,
    cancelMove,
    commitMove,
    mapState,
    ticketRates,
    currentRound,
    maxRounds,
    activeEvent,
    turnEndsAt,
    gameOver,
    rankings,
    isTestMode,
    fortuneCoffee,
    sabotageDistrict,
    useTaxi: requestTaxi,
  } = useGameStore();
  const [showCoffeeMenu, setShowCoffeeMenu] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);

  const isMyTurn = myPlayer?.isTurn;
  const canRoll = isMyTurn && !diceValue;
  const canUseTurnAction = isMyTurn && !pendingMove;
  const tickets = {
    red: myPlayer?.redTickets || 10,
    blue: myPlayer?.blueTickets || 10,
    green: myPlayer?.greenTickets || 10,
  };
  const coffeeAbilities = [
    {
      id: 'market',
      title: 'Kur Falı',
      description: 'Kırmızı, mavi veya yeşil bilet kurunu değiştirir.',
      cost: '2 Yeşil',
      icon: Coffee,
      enabled: canUseTurnAction && tickets.green >= 2,
      action: fortuneCoffee,
      color: 'bg-amber-100 border-amber-300 text-amber-800',
    },
    {
      id: 'sabotage',
      title: 'Zabıta İşareti',
      description: 'Rakibin en güçlü açık masasını dağıtır.',
      cost: '2 Mavi',
      icon: AlertTriangle,
      enabled: canUseTurnAction && tickets.blue >= 2,
      action: sabotageDistrict,
      color: 'bg-purple-100 border-purple-300 text-purple-800',
    },
    {
      id: 'route',
      title: 'Yol Falı',
      description: 'Riskli bir rota açar; tutarsa haritada tek hedef belirir.',
      cost: '1 Yeşil',
      icon: Car,
      enabled: canRoll && tickets.green >= 1,
      action: requestTaxi,
      color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    },
  ];

  useEffect(() => {
    if (!turnEndsAt) return;

    const updateTimer = () => {
      setSecondsLeft(Math.max(0, Math.ceil((turnEndsAt - Date.now()) / 1000)));
    };

    updateTimer();
    const timer = window.setInterval(updateTimer, 500);
    return () => window.clearInterval(timer);
  }, [turnEndsAt]);

  if (!room) return null;

  return (
    <div className="relative w-full h-screen flex flex-col bg-blue-50">
      {/* Top Header - Room Info & Leaderboard snippet */}
      <div className="absolute top-0 w-full z-10 p-4 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur rounded-2xl p-3 shadow-lg pointer-events-auto border-2 border-gray-100 flex items-center gap-3">
          <div className="bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-1 rounded-lg">ODA: {room.inviteCode}</div>
          {isTestMode && (
            <div
              className="text-xs font-black px-2 py-1 rounded-lg"
              style={{
                color: getCharacterTheme(myPlayer?.character).text,
                backgroundColor: getCharacterTheme(myPlayer?.character).soft,
              }}
            >
              TEST: {myPlayer?.character}
            </div>
          )}
          <div className="bg-gray-900 text-white text-xs font-black px-2 py-1 rounded-lg">{currentRound}/{maxRounds}</div>
          <div className={`text-xs font-black px-2 py-1 rounded-lg ${secondsLeft <= 8 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
            {secondsLeft}s
          </div>
          <div className="flex -space-x-2">
            {players.map((p, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold text-white ${
                  p.isTurn ? 'border-white shadow-md scale-105' : 'border-white/80 opacity-80'
                }`}
                style={{ backgroundColor: getCharacterTheme(p.character).fill }}
                title={p.character}
              >
                {p.character.substring(0, 1)}
              </div>
            ))}
          </div>
        </div>

        {/* Currency Rates */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-2 shadow-lg pointer-events-auto border-2 border-gray-100 flex flex-col gap-1">
          <div className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider">Güncel Kur</div>
          <div className="flex gap-2 text-xs font-bold">
            <span className="text-[var(--color-ticket-red)]">1 K: {ticketRates.red}₺</span>
            <span className="text-[var(--color-ticket-blue)]">1 M: {ticketRates.blue}₺</span>
            <span className="text-[var(--color-ticket-green)]">1 Y: {ticketRates.green}₺</span>
          </div>
        </div>
      </div>

      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-10 bg-gray-950/85 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none max-w-[82vw] truncate">
        {activeEvent}
      </div>

      <AnimatePresence>
        {showCoffeeMenu && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/50 p-4 pointer-events-auto"
          >
            <Motion.div
              initial={{ y: 28, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 28, scale: 0.96 }}
              className="w-full max-w-md bg-white rounded-2xl p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Kahve Falı</h2>
                  <p className="text-xs font-bold text-gray-500">Bilet harcayarak tek seferlik özellik kullan.</p>
                </div>
                <button
                  onClick={() => setShowCoffeeMenu(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center game-btn"
                  aria-label="Kahve falı penceresini kapat"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-2">
                {coffeeAbilities.map((ability) => {
                  const Icon = ability.icon;

                  return (
                    <button
                      key={ability.id}
                      disabled={!ability.enabled}
                      onClick={() => {
                        ability.action();
                        setShowCoffeeMenu(false);
                      }}
                      className={`text-left border-2 rounded-xl p-3 transition-all active:scale-[0.98] disabled:opacity-45 disabled:active:scale-100 ${ability.color}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/75 flex items-center justify-center shrink-0">
                          <Icon size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-black text-sm">{ability.title}</span>
                            <span className="text-[11px] font-black bg-white/75 px-2 py-1 rounded-full whitespace-nowrap">{ability.cost}</span>
                          </div>
                          <p className="text-xs font-semibold leading-snug mt-1 opacity-80">{ability.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {gameOver && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          >
            <div className="w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl">
              <h2 className="text-2xl font-black text-gray-900 text-center mb-4">Oyun Bitti</h2>
              <div className="space-y-2">
                {rankings.map((rank, index) => (
                  <div key={rank.playerId} className="flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2">
                    <span className="font-black text-gray-800">#{index + 1} {rank.character}</span>
                    <span className="font-black text-[var(--color-primary)]">{rank.score}₺</span>
                  </div>
                ))}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Action Preview Modal (Vazgeç veya Onayla) */}
      <AnimatePresence>
        {pendingMove && (
          <Motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto"
          >
            <div className="bg-white rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center">
              {(() => {
                const districtStatus = mapState[pendingMove];
                const isOwned = districtStatus?.ownerId;
                const isMyDistrict = isOwned && districtStatus.ownerId === myPlayer?.id;
                
                if (!isOwned) {
                  return (
                    <>
                      <div className="text-4xl">🏷️</div>
                      <h3 className="text-xl font-black text-gray-800 uppercase">Boş Arazi</h3>
                      <p className="text-sm font-medium text-gray-600">Burayı rezerve edip masayı kapatmak zorundasınız.</p>
                      <p className="font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg">Maliyet: 2 Kırmızı Bilet</p>
                      <div className="flex gap-3 w-full mt-2">
                        <button onClick={cancelMove} className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95 transition-transform">Vazgeç</button>
                        <button onClick={commitMove} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform">Masayı Kapat</button>
                      </div>
                    </>
                  );
                } else if (!isMyDistrict) {
                  return (
                    <>
                      <div className="text-4xl">☕</div>
                      <h3 className="text-xl font-black text-gray-800 uppercase">Ödeme Vakti</h3>
                      <p className="text-sm font-medium text-gray-600">Başkasının mekanına geldiniz. Ayakbastı ödemek zorundasınız.</p>
                      <p className="font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg">Ceza: 3 Kırmızı Bilet</p>
                      <div className="flex gap-3 w-full mt-2">
                        <button onClick={cancelMove} className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95 transition-transform">Vazgeç</button>
                        <button onClick={commitMove} className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform">Öde ve Git</button>
                      </div>
                    </>
                  );
                } else {
                  return (
                    <>
                      <div className="text-4xl">🏠</div>
                      <h3 className="text-xl font-black text-gray-800 uppercase">Kendi Mekanın</h3>
                      <p className="text-sm font-medium text-gray-600">Burası zaten senin. Dinlenebilirsin.</p>
                      <div className="flex gap-3 w-full mt-2">
                        <button onClick={cancelMove} className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95 transition-transform">Vazgeç</button>
                        <button onClick={commitMove} className="flex-1 py-3 bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-transform">Buraya Git</button>
                      </div>
                    </>
                  );
                }
              })()}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

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
                <Motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: -20, opacity: 1 }}
                  className="absolute -top-16 bg-white border-4 border-[var(--color-secondary)] text-[var(--color-secondary)] font-black text-4xl w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl rotate-12"
                >
                  {diceValue}
                </Motion.div>
              )}
              <Motion.button 
                whileTap={canRoll ? { scale: 0.9 } : {}}
                onClick={() => { if(canRoll) rollDice() }}
                aria-label="Zar at"
                className={`w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-white relative z-10 transition-all ${
                  canRoll 
                  ? 'bg-gradient-to-t from-[var(--color-primary)] to-[#ff8c8f] shadow-[0_8px_0_0_#d32f2f,0_15px_20px_rgba(0,0,0,0.4)] cursor-pointer' 
                  : 'bg-gray-400 shadow-[0_8px_0_0_#888,0_15px_20px_rgba(0,0,0,0.4)] cursor-not-allowed opacity-80'
                }`}
              >
                <Dice5 size={48} strokeWidth={2.5} />
              </Motion.button>
              <div className="mt-4 font-black text-gray-800 text-lg uppercase tracking-wide">
                {canRoll ? 'Zar At' : isMyTurn ? 'İlçe Seç' : 'Sıranı Bekle'}
              </div>
            </div>

            {/* Coffee Fortune Menu Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowCoffeeMenu(true)}
                className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-white shadow-lg game-btn"
                aria-label="Kahve falı özelliklerini aç"
              >
                <Sparkles size={24} />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
