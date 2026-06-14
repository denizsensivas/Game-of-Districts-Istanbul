import { useState } from 'react';
import useGameStore, { MAP_TYPES } from '../../store/gameStore';
import { motion as Motion } from 'framer-motion';
import { ArrowLeftRight, ChevronLeft, ChevronRight, FlaskConical, LogIn, Map, Users, UserPlus, X } from 'lucide-react';
import { getCharacterTheme } from '../../utils/characterColors';
import { characterOptions, getCharacterMeta } from '../../utils/characters';

export default function Lobby() {
  const [username, setUsername] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(characterOptions[0].id);
  const [characterPickerOpen, setCharacterPickerOpen] = useState(false);
  const [characterSlide, setCharacterSlide] = useState(0);
  const [characterDragStart, setCharacterDragStart] = useState(null);
  const [selectedMapType, setSelectedMapType] = useState(MAP_TYPES.small);
  const [inviteCode, setInviteCode] = useState('');

  const { user, joinLobby, createRoom, joinRoom, createTestRoom } = useGameStore();
  const searchParams = new URLSearchParams(window.location.search);
  const canSeeTestMode =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    searchParams.get('testMode') === '1';

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      joinLobby(username, selectedCharacter);
    }
  };

  const mapOptions = [
    { id: MAP_TYPES.small, label: 'Küçük', description: 'Daha hızlı ve yakın oyun' },
    { id: MAP_TYPES.big, label: 'Büyük', description: 'Daha geniş masa alanı' },
  ];
  const selectedCharacterMeta = getCharacterMeta(selectedCharacter);
  const activeCharacter = characterOptions[characterSlide] || characterOptions[0];

  const openCharacterPicker = () => {
    setCharacterSlide(Math.max(0, characterOptions.findIndex((option) => option.id === selectedCharacter)));
    setCharacterPickerOpen(true);
  };

  const moveCharacterSlide = (direction) => {
    setCharacterSlide((current) => (
      (current + direction + characterOptions.length) % characterOptions.length
    ));
  };

  const finishCharacterDrag = (clientX) => {
    if (characterDragStart === null) return;

    const dragDistance = clientX - characterDragStart;
    if (Math.abs(dragDistance) > 45) {
      moveCharacterSlide(dragDistance < 0 ? 1 : -1);
    }
    setCharacterDragStart(null);
  };

  const testModeButtons = canSeeTestMode ? (
    <div className="grid grid-cols-2 gap-2">
      {mapOptions.map((option) => (
        <button
          key={`test-${option.id}`}
          type="button"
          onClick={() => createTestRoom(option.id)}
          className="py-4 bg-[#3b2417] text-white text-sm game-btn flex flex-col items-center justify-center gap-1 shadow-[0_7px_0_#22140d]"
        >
          <span className="flex items-center justify-center gap-2 font-black">
            <FlaskConical size={20} /> Test
          </span>
          <span className="text-xs font-black opacity-90">{option.label} Harita</span>
        </button>
      ))}
    </div>
  ) : null;

  const mapPicker = (
    <div>
      <label className="block text-sm font-bold mb-2">Harita Boyutu</label>
      <div className="grid grid-cols-2 gap-2">
        {mapOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSelectedMapType(option.id)}
            className={`p-3 rounded-2xl border-2 text-left transition-all ${selectedMapType === option.id
                ? 'bg-[#fff4d7] border-[var(--color-accent)] shadow-[0_4px_0_#d89313]'
                : 'bg-gray-50 border-transparent hover:bg-gray-100'
              }`}
          >
            <div className="flex items-center gap-2 font-black">
              <Map size={18} />
              <span>{option.label}</span>
            </div>
            <div className="text-[10px] text-gray-600 leading-tight mt-1">{option.description}</div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#dbf2fe] text-white">
      <Motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md game-panel rounded-[2rem] p-6 text-[#3b2417]"
      >
        <h1 className="text-3xl font-black text-center mb-6 text-[#3b2417] drop-shadow-[0_3px_0_#fff4d7]">Game of Districts</h1>

        {!user ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-2xl border-4 border-white focus:border-[var(--color-primary)] outline-none text-lg bg-[#fffdf6] shadow-inner"
                placeholder="Örn: İstanbulunSefiri"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Karakter Seçimi</label>
              <button
                type="button"
                onClick={openCharacterPicker}
                className={`w-full min-h-[108px] p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 group ${getCharacterTheme(selectedCharacter).className
                  }`}
              >
                <div className="w-20 h-20 rounded-2xl bg-white/85 border-2 border-white overflow-hidden shrink-0 flex items-end justify-center">
                  <img
                    src={selectedCharacterMeta.icon}
                    alt={`${selectedCharacterMeta.label} ${selectedCharacterMeta.variant}`}
                    className="w-full h-full object-contain scale-[2.05]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black opacity-70">Seçili Karakter</div>
                  <div className="text-xl font-black leading-tight">
                    {selectedCharacterMeta.label}
                  </div>
                  <div className="text-xs font-bold opacity-80">{selectedCharacterMeta.variant}</div>
                  <div className="text-[11px] leading-tight mt-1 text-gray-700">{selectedCharacterMeta.bonus}</div>
                </div>
                <div className="shrink-0 flex flex-col items-center gap-1 text-[#3b2417]">
                  <div className="w-11 h-11 rounded-2xl bg-white border-2 border-white shadow-[0_4px_0_rgba(88,64,36,0.18)] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <ArrowLeftRight size={22} strokeWidth={3} />
                  </div>
                  <div className="text-[10px] font-black uppercase leading-none">Değiştir</div>
                </div>
              </button>
            </div>

            {mapPicker}

            <button type="submit" className="w-full py-4 bg-[var(--color-secondary)] text-white text-xl game-btn flex items-center justify-center gap-2 shadow-[0_7px_0_#0f8078]">
              <LogIn size={24} /> Oyuna Gir
            </button>

            {testModeButtons}
          </form>
        ) : (
          <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="text-center p-3 bg-[#fffdf6] rounded-2xl border-2 border-white">
              <p className="text-sm text-gray-500">Hoş geldin,</p>
              <p className="text-xl font-bold">{user.username}</p>
            </div>

            <div className="space-y-3">
              {mapPicker}

              {testModeButtons}

              <button onClick={() => createRoom(selectedMapType)} className="w-full py-4 bg-[var(--color-primary)] text-white text-xl game-btn flex items-center justify-center gap-2 shadow-[0_7px_0_#d94c4c]">
                <UserPlus size={24} /> Oda Kur (Max 8)
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-300 w-full absolute"></div>
                <div className="bg-white px-3 relative text-sm text-gray-400 font-bold">VEYA</div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="flex-1 p-3 rounded-xl border-2 border-gray-200 text-center text-xl font-bold tracking-widest outline-none focus:border-[var(--color-secondary)]"
                  placeholder="KOD-6H"
                />
                <button onClick={() => joinRoom(inviteCode)} className="px-6 bg-[var(--color-secondary)] text-white game-btn flex items-center justify-center">
                  <Users size={24} />
                </button>
              </div>
            </div>
          </Motion.div>
        )}
      </Motion.div>

      {characterPickerOpen && (
        <div className="fixed inset-0 z-50 bg-[#2b1a12]/55 backdrop-blur-sm flex items-center justify-center p-4">
          <Motion.div
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="w-full max-w-md game-panel rounded-[2rem] p-4 text-[#3b2417]"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-black text-gray-500 uppercase">Karakter</div>
                <div className="text-2xl font-black">{activeCharacter.label}</div>
              </div>
              <button
                type="button"
                onClick={() => setCharacterPickerOpen(false)}
                className="w-10 h-10 rounded-2xl bg-white border-2 border-[#3b2417] flex items-center justify-center shadow-[0_4px_0_rgba(88,64,36,0.25)]"
                aria-label="Karakter seçimini kapat"
                title="Kapat"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="relative overflow-hidden rounded-2xl bg-[#fffdf6] border-2 border-white touch-pan-y"
              onPointerDown={(event) => setCharacterDragStart(event.clientX)}
              onPointerUp={(event) => finishCharacterDrag(event.clientX)}
              onPointerCancel={() => setCharacterDragStart(null)}
            >
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${characterSlide * 100}%)` }}
              >
                {characterOptions.map((character) => (
                  <div key={character.id} className="min-w-full p-4 flex flex-col items-center">
                    <div className="w-full aspect-[4/3] rounded-2xl bg-[#dbf2fe] border-2 border-white flex items-end justify-center overflow-hidden">
                      <img
                        src={character.selectionImage}
                        alt={`${character.label} ${character.variant}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center mt-3">
                      <div className="text-2xl font-black">{character.label}</div>
                      <div className="text-sm font-black text-gray-500">{character.variant}</div>
                      <div className="text-xs font-bold text-gray-600 mt-1">{character.bonus}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => moveCharacterSlide(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-white/95 text-[#3b2417] border-2 border-white shadow flex items-center justify-center"
                aria-label="Önceki karakter"
                title="Önceki"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={() => moveCharacterSlide(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-white/95 text-[#3b2417] border-2 border-white shadow flex items-center justify-center"
                aria-label="Sonraki karakter"
                title="Sonraki"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            <div className="flex justify-center gap-1.5 mt-3">
              {characterOptions.map((character, index) => (
                <button
                  key={`${character.id}-dot`}
                  type="button"
                  onClick={() => setCharacterSlide(index)}
                  className={`h-2.5 rounded-full transition-all ${characterSlide === index ? 'w-7 bg-[#3b2417]' : 'w-2.5 bg-[#d6c1a1]'
                    }`}
                  aria-label={`${character.label} ${character.variant}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCharacter(activeCharacter.id);
                setCharacterPickerOpen(false);
              }}
              className="w-full mt-4 py-4 bg-[var(--color-secondary)] text-white text-lg game-btn shadow-[0_7px_0_#0f8078]"
            >
              {activeCharacter.label} Seç
            </button>
          </Motion.div>
        </div>
      )}
    </div>
  );
}
