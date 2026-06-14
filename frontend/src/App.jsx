import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useGameStore from './store/gameStore';
import Lobby from './components/Lobby/Lobby';
import Dashboard from './components/Game/Dashboard';

function App() {
  const setupSocketListeners = useGameStore(state => state.setupSocketListeners);
  const room = useGameStore(state => state.room);
  const search = typeof window !== 'undefined' ? window.location.search : '';

  useEffect(() => {
    setupSocketListeners();
  }, [setupSocketListeners]);

  return (
    <Router>
      <div className="w-full h-screen overflow-hidden bg-[var(--color-background)]">
        <Routes>
          <Route path="/" element={room ? <Navigate to={{ pathname: '/game', search }} /> : <Lobby />} />
          <Route path="/game" element={!room ? <Navigate to={{ pathname: '/', search }} /> : <Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
