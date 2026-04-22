import { useState } from 'react';
import useGameStore from '../../store/gameStore';
import { motion } from 'framer-motion';
import { Users, UserPlus, LogIn } from 'lucide-react';

const characters = [
  { id: 'Ogrenci', label: 'Öğrenci', bonus: 'Bilet alımlarında %10 indirim', color: 'bg-blue-100 border-blue-500' },
  { id: 'Turist', label: 'Turist', bonus: 'Taksilerde %20 başarı şansı', color: 'bg-orange-100 border-orange-500' },
  { id: 'Esnaf', label: 'Esnaf', bonus: 'Dükkanlardan 2 kat kira alır', color: 'bg-green-100 border-green-500' },
  { id: 'BeyazYakali', label: 'Beyaz Yakalı', bonus: 'Hafta sonu zar x2', color: 'bg-purple-100 border-purple-500' }
];

export default function Lobby() {
  const [username, setUsername] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0].id);
  const [inviteCode, setInviteCode] = useState('');
  
  const { user, joinLobby, createRoom, joinRoom } = useGameStore();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      joinLobby(username, selectedCharacter);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] text-white">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 text-gray-800"
      >
        <h1 className="text-3xl font-black text-center mb-6 text-[var(--color-primary)]">Game of Districts</h1>
        
        {!user ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Kullanıcı Adı</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] outline-none text-lg"
                placeholder="Örn: VapurluMarti"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2">Karakter Seçimi</label>
              <div className="grid grid-cols-2 gap-2">
                {characters.map(c => (
                  <div 
                    key={c.id}
                    onClick={() => setSelectedCharacter(c.id)}
                    className={`p-2 rounded-xl border-2 cursor-pointer transition-all ${selectedCharacter === c.id ? c.color : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
                  >
                    <div className="font-bold text-center">{c.label}</div>
                    <div className="text-[10px] text-center text-gray-600 leading-tight mt-1">{c.bonus}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-[var(--color-secondary)] text-white text-xl game-btn flex items-center justify-center gap-2">
              <LogIn size={24} /> Oyuna Gir
            </button>
          </form>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="text-center p-3 bg-gray-100 rounded-xl">
              <p className="text-sm text-gray-500">Hoş geldin,</p>
              <p className="text-xl font-bold">{user.username}</p>
            </div>
            
            <div className="space-y-3">
              <button onClick={createRoom} className="w-full py-4 bg-[var(--color-primary)] text-white text-xl game-btn flex items-center justify-center gap-2">
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
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
