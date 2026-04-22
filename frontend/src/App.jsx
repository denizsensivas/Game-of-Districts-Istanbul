import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useGameStore from './store/gameStore';
import Lobby from './components/Lobby/Lobby';
import Dashboard from './components/Game/Dashboard';

function App() {
  const setupSocketListeners = useGameStore(state => state.setupSocketListeners);
  const room = useGameStore(state => state.room);

  useEffect(() => {
    setupSocketListeners();
  }, [setupSocketListeners]);

  return (
    <Router>
      <div className="w-full h-screen overflow-hidden bg-[var(--color-background)]">
        <Routes>
          <Route path="/" element={room ? <Navigate to="/game" /> : <Lobby />} />
          <Route path="/game" element={!room ? <Navigate to="/" /> : <Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
