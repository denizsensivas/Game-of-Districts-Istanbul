import { useEffect, useState } from 'react';
import useGameStore from '../../store/gameStore';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Dice5, AlertTriangle, Car, Coffee, Info, LogOut, Repeat2, Ship, Sparkles, Trophy, X } from 'lucide-react';
import IstanbulMap from '../Map/IstanbulMap';
import { getCharacterTheme } from '../../utils/characterColors';

const activeEventThemes = {
  fortuneCoffee: {
    Icon: Coffee,
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.42)',
    particles: ['#f7d794', '#c084fc', '#fb7185'],
  },
  sabotageDistrict: {
    Icon: AlertTriangle,
    accent: '#8b5cf6',
    glow: 'rgba(139,92,246,0.38)',
    particles: ['#c084fc', '#f87171', '#facc15'],
  },
  useTaxi: {
    Icon: Car,
    accent: '#16b6aa',
    glow: 'rgba(22,182,170,0.38)',
    particles: ['#facc15', '#38bdf8', '#34d399'],
  },
  endGame: {
    Icon: Trophy,
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.44)',
    particles: ['#facc15', '#fb7185', '#60a5fa'],
  },
  system: {
    Icon: Sparkles,
    accent: '#fff8e8',
    glow: 'rgba(255,248,232,0.32)',
    particles: ['#fff8e8', '#dbf2fe', '#f59e0b'],
  },
};

function ActiveEventBanner({ text, status, type }) {
  const theme = activeEventThemes[type] || activeEventThemes.system;
  const Icon = theme.Icon;
  const isLoading = status === 'loading';

  return (
    <Motion.div
      key={`${status}-${type}-${text}`}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      className="game-display-text absolute top-24 left-1/2 -translate-x-1/2 z-10 bg-[#3b2417]/92 text-white text-xs font-black px-5 py-3 rounded-full shadow-[0_6px_0_rgba(88,64,36,0.25)] pointer-events-none max-w-[86vw] border-2 border-white/80 overflow-hidden"
      style={{ boxShadow: `0 6px 0 rgba(88,64,36,0.25), 0 0 24px ${theme.glow}` }}
    >
      <div className="relative z-10 flex items-center gap-2 min-w-0">
        <Motion.span
          animate={isLoading ? { rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }}
          transition={isLoading ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
          className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0"
          style={{ color: theme.accent }}
        >
          <Icon size={15} strokeWidth={3} />
        </Motion.span>
        <span className="truncate">{text}</span>
        {isLoading && (
          <span className="flex items-center gap-1 shrink-0">
            {[0, 1, 2].map((dot) => (
              <Motion.span
                key={dot}
                className="w-1.5 h-1.5 rounded-full bg-white"
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.15 }}
              />
            ))}
          </span>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0">
          <Motion.div
            className="absolute inset-y-0 -left-1/2 w-1/2 bg-white/15 skew-x-[-18deg]"
            animate={{ x: ['0%', '310%'] }}
            transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
          />
          {theme.particles.map((color, index) => (
            <Motion.span
              key={color}
              className="absolute top-1/2 w-2 h-2 rounded-full"
              style={{ backgroundColor: color, left: `${24 + index * 24}%` }}
              animate={{ y: [8, -10, 8], opacity: [0.25, 0.95, 0.25], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.18 }}
            />
          ))}
        </div>
      )}
    </Motion.div>
  );
}

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
    activeEventStatus,
    activeEventType,
    turnEndsAt,
    gameOver,
    rankings,
    isTestMode,
    quitTestMode,
    fortuneCoffee,
    sabotageDistrict,
    useTaxi: requestTaxi,
    exchangeTickets,
    possibleMoveDetails,
  } = useGameStore();
  const [showCoffeeMenu, setShowCoffeeMenu] = useState(false);
  const [showTicketInfo, setShowTicketInfo] = useState(false);
  const [exchangeFrom, setExchangeFrom] = useState('blue');
  const [exchangeTo, setExchangeTo] = useState('red');
  const [exchangeAmount, setExchangeAmount] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(30);

  const isMyTurn = myPlayer?.isTurn;
  const isEventRevealing = activeEventStatus === 'loading';
  const canRoll = isMyTurn && !diceValue && !isEventRevealing;
  const canUseTurnAction = isMyTurn && !pendingMove && !isEventRevealing;
  const tickets = {
    red: myPlayer?.redTickets ?? 10,
    blue: myPlayer?.blueTickets ?? 10,
    green: myPlayer?.greenTickets ?? 10,
  };
  const pendingMoveDetail = pendingMove ? possibleMoveDetails[pendingMove] : null;
  const ferryCostGreen = pendingMoveDetail?.ferryCostGreen || 0;
  const ticketColors = [
    { id: 'red', label: 'Kırmızı', short: 'K', css: 'var(--color-ticket-red)' },
    { id: 'blue', label: 'Mavi', short: 'M', css: 'var(--color-ticket-blue)' },
    { id: 'green', label: 'Yeşil', short: 'Y', css: 'var(--color-ticket-green)' },
  ];
  const exchangeSellValue = exchangeAmount * ticketRates[exchangeFrom];
  const exchangeBuyAmount = exchangeFrom === exchangeTo ? 0 : Math.floor(exchangeSellValue / ticketRates[exchangeTo]);
  const canExchangeTickets = exchangeFrom !== exchangeTo && exchangeAmount > 0 && tickets[exchangeFrom] >= exchangeAmount && exchangeBuyAmount > 0;
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
  const ticketInfo = [
    {
      id: 'red',
      title: 'Kırmızı Bilet',
      description: 'Boş ilçede masa kapatır; rakip ilçeye girince çay ödemesi için kullanılır.',
      colorClass: 'text-[var(--color-ticket-red)] border-[var(--color-ticket-red)]',
    },
    {
      id: 'blue',
      title: 'Mavi Bilet',
      description: 'Zabıta işaretiyle rakibin en güçlü açık masasını dağıtır.',
      colorClass: 'text-[var(--color-ticket-blue)] border-[var(--color-ticket-blue)]',
    },
    {
      id: 'green',
      title: 'Yeşil Bilet',
      description: 'Kahve falı, yol/taksi falı ve karşı yakaya vapur geçişi için harcanır.',
      colorClass: 'text-[var(--color-ticket-green)] border-[var(--color-ticket-green)]',
    },
  ];
  const getRankBadgeSrc = (rankIndex) => {
    const rank = rankIndex + 1;
    return rank <= 3 ? `/rank-badge-${rank}.png` : null;
  };

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
    <div className="relative w-full h-screen flex flex-col bg-[#dbf2fe]">
      {/* Top Header - Room Info & Leaderboard snippet */}
      <div className="absolute top-0 w-full z-10 p-4 flex justify-between items-start pointer-events-none">
        <div className="game-panel game-display-text rounded-[1.6rem] px-4 py-3 pointer-events-auto flex items-center gap-3">
          <div className="bg-[var(--color-primary)] text-white text-xs font-black px-3 py-2 rounded-2xl shadow-[0_4px_0_#d94c4c]">ODA: {room.inviteCode}</div>
          {isTestMode && (
            <>
              <div
                className="text-xs font-black px-3 py-2 rounded-2xl border-2 border-white"
                style={{
                  color: getCharacterTheme(myPlayer?.character).text,
                  backgroundColor: getCharacterTheme(myPlayer?.character).soft,
                }}
              >
                TEST: {myPlayer?.character?.toLocaleUpperCase('tr-TR')}
              </div>
              <button
                type="button"
                onClick={quitTestMode}
                className="bg-white text-[#3b2417] text-xs font-black px-3 py-2 rounded-2xl border-2 border-[#3b2417] shadow-[0_4px_0_rgba(88,64,36,0.25)] flex items-center gap-1 game-btn"
                aria-label="Test modundan çık"
                title="Test modundan çık"
              >
                <LogOut size={14} />
                Çık
              </button>
            </>
          )}
          <div className="bg-[#3b2417] text-white text-xs font-black px-3 py-2 rounded-2xl shadow-[0_4px_0_#22140d]">{currentRound}/{maxRounds}</div>
          <div className={`text-xs font-black px-3 py-2 rounded-2xl border-2 border-white ${secondsLeft <= 8 ? 'bg-red-100 text-red-600' : 'bg-[#f7e9c5] text-[#3b2417]'}`}>
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
        <div className="game-panel game-display-text rounded-[1.6rem] px-4 py-3 pointer-events-auto flex flex-col gap-1">
          <div className="text-[10px] font-black text-[#7c6449] text-center uppercase tracking-wider">Güncel Kur</div>
          <div className="flex gap-2 text-xs font-bold">
            <span className="text-[var(--color-ticket-red)]">1 K: {ticketRates.red}₺</span>
            <span className="text-[var(--color-ticket-blue)]">1 M: {ticketRates.blue}₺</span>
            <span className="text-[var(--color-ticket-green)]">1 Y: {ticketRates.green}₺</span>
          </div>
        </div>
      </div>

      <ActiveEventBanner text={activeEvent} status={activeEventStatus} type={activeEventType} />

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

              <div className="mt-4 rounded-2xl border-2 border-[#f1dfb9] bg-[#fff8e8] p-3">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="game-display-text text-base font-black text-[#3b2417]">Bilet Bozdur</h3>
                    <p className="text-xs font-bold text-[#7c6449]">Güncel kura göre bir bilet rengini diğerine çevir.</p>
                  </div>
                  <Repeat2 size={22} className="text-[#7c6449]" />
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                  <label className="grid gap-1">
                    <span className="text-[10px] font-black uppercase text-[#7c6449]">Sat</span>
                    <select
                      value={exchangeFrom}
                      onChange={(event) => {
                        const nextFrom = event.target.value;
                        setExchangeFrom(nextFrom);
                        if (nextFrom === exchangeTo) {
                          setExchangeTo(ticketColors.find((color) => color.id !== nextFrom)?.id || 'red');
                        }
                      }}
                      className="w-full rounded-xl border-2 border-white bg-white px-2 py-2 text-xs font-black text-[#3b2417] outline-none"
                    >
                      {ticketColors.map((color) => (
                        <option key={color.id} value={color.id}>{color.label}</option>
                      ))}
                    </select>
                  </label>

                  <div className="pb-2 text-[#7c6449]">
                    <Repeat2 size={18} />
                  </div>

                  <label className="grid gap-1">
                    <span className="text-[10px] font-black uppercase text-[#7c6449]">Al</span>
                    <select
                      value={exchangeTo}
                      onChange={(event) => setExchangeTo(event.target.value)}
                      className="w-full rounded-xl border-2 border-white bg-white px-2 py-2 text-xs font-black text-[#3b2417] outline-none"
                    >
                      {ticketColors.map((color) => (
                        <option key={color.id} value={color.id} disabled={color.id === exchangeFrom}>{color.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2 items-center">
                  <label className="grid gap-1">
                    <span className="text-[10px] font-black uppercase text-[#7c6449]">Miktar</span>
                    <input
                      type="number"
                      min="1"
                      max={Math.max(1, tickets[exchangeFrom])}
                      value={exchangeAmount}
                      onChange={(event) => setExchangeAmount(Math.max(1, Number(event.target.value) || 1))}
                      className="w-full rounded-xl border-2 border-white bg-white px-3 py-2 text-sm font-black text-[#3b2417] outline-none"
                    />
                  </label>

                  <button
                    disabled={!canExchangeTickets}
                    onClick={() => {
                      exchangeTickets({ fromColor: exchangeFrom, toColor: exchangeTo, amount: exchangeAmount });
                      setShowCoffeeMenu(false);
                    }}
                    className="self-end rounded-xl bg-[#3b2417] px-4 py-2 text-xs font-black text-white shadow-[0_4px_0_#22140d] disabled:bg-gray-300 disabled:shadow-none disabled:text-gray-500"
                  >
                    Bozdur
                  </button>
                </div>

                <div className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-black text-[#3b2417]">
                  {exchangeFrom === exchangeTo
                    ? 'Farklı iki bilet rengi seç.'
                    : canExchangeTickets
                      ? `${exchangeAmount} ${ticketColors.find((color) => color.id === exchangeFrom)?.label} sat -> ${exchangeBuyAmount} ${ticketColors.find((color) => color.id === exchangeTo)?.label} al`
                      : tickets[exchangeFrom] < exchangeAmount
                        ? `Elinde yeterli ${ticketColors.find((color) => color.id === exchangeFrom)?.label} bilet yok.`
                        : 'Bu kurla en az 1 bilet alınamıyor.'}
                </div>
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
                {rankings.map((rank, index) => {
                  const badgeSrc = getRankBadgeSrc(index);

                  return (
                    <div key={rank.playerId} className="flex items-center justify-between bg-gray-100 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {badgeSrc ? (
                          <img
                            src={badgeSrc}
                            alt={`${index + 1}. sıra`}
                            className="w-10 h-10 object-contain shrink-0 drop-shadow-sm"
                          />
                        ) : (
                          <span className="font-black text-gray-800 shrink-0">#{index + 1}</span>
                        )}
                        <span className="font-black text-gray-800 truncate">{rank.character}</span>
                      </div>
                      <span className="font-black text-[var(--color-primary)] shrink-0">{rank.score}₺</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTicketInfo && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[55] flex items-end sm:items-center justify-center bg-black/45 p-4 pointer-events-auto"
          >
            <Motion.div
              initial={{ y: 28, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 28, scale: 0.96 }}
              className="w-full max-w-md bg-[#fff8e8] rounded-2xl p-4 shadow-2xl border-2 border-white"
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="game-display-text text-xl font-black text-[#3b2417]">Biletler</h2>
                  <p className="text-xs font-bold text-[#7c6449]">Her renk farklı hamlelerde harcanır.</p>
                </div>
                <button
                  onClick={() => setShowTicketInfo(false)}
                  className="w-10 h-10 rounded-full bg-white text-[#3b2417] flex items-center justify-center game-btn"
                  aria-label="Bilet açıklamasını kapat"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid gap-2">
                {ticketInfo.map((ticket) => (
                  <div key={ticket.id} className={`bg-white rounded-xl border-2 p-3 ${ticket.colorClass}`}>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-current shrink-0" />
                      <span className="game-display-text text-sm font-black">{ticket.title}</span>
                    </div>
                    <p className="text-xs font-bold leading-snug mt-1 text-[#3b2417]">{ticket.description}</p>
                  </div>
                ))}
              </div>
            </Motion.div>
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
                const needsRedTickets = !isOwned && tickets.red < 2;
                const FerryCost = ferryCostGreen > 0 ? (
                  <p className="font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg flex items-center gap-2">
                    <Ship size={16} />
                    Vapur: {ferryCostGreen} Yeşil Bilet
                  </p>
                ) : null;
                
                if (!isOwned) {
                  return (
                    <>
                      <div className="text-4xl">🏷️</div>
                      <h3 className="text-xl font-black text-gray-800 uppercase">Boş Arazi</h3>
                      <p className="text-sm font-medium text-gray-600">Burayı rezerve edip masayı kapatmak zorundasınız.</p>
                      <p className="font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg">Maliyet: 2 Kırmızı Bilet</p>
                      {FerryCost}
                      {needsRedTickets && (
                        <p className="text-xs font-black text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                          Kırmızı bilet yetmiyor. Bilet bozdurup bu seçimi tekrar onaylayabilirsin.
                        </p>
                      )}
                      <div className="flex gap-3 w-full mt-2">
                        <button onClick={cancelMove} className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-95 transition-transform">Vazgeç</button>
                        {needsRedTickets ? (
                          <button
                            onClick={() => setShowCoffeeMenu(true)}
                            className="flex-1 py-3 bg-[#3b2417] text-white font-bold rounded-xl shadow-lg shadow-amber-100 active:scale-95 transition-transform"
                          >
                            Bilet Bozdur
                          </button>
                        ) : (
                          <button onClick={commitMove} className="flex-1 py-3 bg-green-500 text-white font-bold rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform">Masayı Kapat</button>
                        )}
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
                      {FerryCost}
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
                      {FerryCost}
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
        <div className="game-panel rounded-t-[2rem] pointer-events-auto flex flex-col">
          
          {/* Action Area */}
          <div className="flex justify-between items-end p-4 -mt-10">
            {/* Wallet */}
            <button
              type="button"
              onClick={() => setShowTicketInfo(true)}
              className="bg-[#fff8e8] rounded-3xl p-3 shadow-inner flex flex-col gap-2 min-w-[120px] border-2 border-white text-left game-btn"
              aria-label="Bilet açıklamalarını aç"
            >
              <div className="game-display-text text-xs font-black text-[#7c6449] text-center uppercase flex items-center justify-center gap-1">
                Cüzdan
                <Info size={13} />
              </div>
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
            </button>

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
                  ? 'bg-gradient-to-t from-[var(--color-primary)] to-[#ff9b9b] shadow-[0_10px_0_0_#d94c4c,0_16px_22px_rgba(88,64,36,0.35)] cursor-pointer'
                  : 'bg-[#b6bbc5] shadow-[0_10px_0_0_#858b96,0_16px_22px_rgba(88,64,36,0.25)] cursor-not-allowed opacity-80'
                }`}
              >
                <Dice5 size={48} strokeWidth={2.5} />
              </Motion.button>
              <div className="game-display-text mt-4 font-black text-[#3b2417] text-lg uppercase tracking-wide">
                {canRoll ? 'Zar At' : isMyTurn ? 'İlçe Seç' : 'Sıranı Bekle'}
              </div>
            </div>

            {/* Coffee Fortune Menu Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowCoffeeMenu(true)}
                className="w-14 h-14 bg-[#3b2417] rounded-2xl flex items-center justify-center text-white shadow-[0_6px_0_#22140d] game-btn"
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
