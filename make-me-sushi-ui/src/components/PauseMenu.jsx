// src/components/PauseMenu.jsx
import React from 'react';
import './Modals.css';

export default function PauseMenu({ 
  setIsMenuOpen, 
  setIsTimerRunning, 
  setStage, 
  setUsername, 
  setPassword,
  setShowStats={setShowStats}
}) {
  
  const handleResume = () => {
    setIsMenuOpen(false);
    if (targetSushi) {
    setIsTimerRunning(true);
  }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUsername('');
    setPassword('');
    setStage('start'); 
    setIsMenuOpen(false);
  };

  return (
    <div className="menu-overlay" onClick={handleResume}>
      <div className="menu-modal fade-in" onClick={(e) => e.stopPropagation()}>
        <h2>PAUSED</h2>
        
        <div className="menu-options">
          {/* Sadece yazı gibi görünen yeni buton sınıfları */}
          <button className="text-menu-btn" onClick={handleResume}>
            RESUME
          </button>
          
          <button className="text-menu-btn" onClick={() => { setShowStats(true); setIsMenuOpen(false); }}>
  STATS
</button>

          
          <button className="text-menu-btn logout-text-btn" onClick={handleLogout}>
            LOGOUT
          </button>
        </div>

      </div>
    </div>
  );
}