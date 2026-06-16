// src/components/SushiModal.jsx
import React, { useState } from 'react';
import './Modals.css';

export default function SushiModal({ 
  isMenuLoading, 
  sushiMenu, 
  sushiImages, 
  setTargetSushi, 
  setTimeLeft, 
  setShowSushiSelector, 
  setIsTimerRunning,
  unlockedSushiIds
}) {
  // Hangi suşiye baktığımızı takip eden state
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!sushiMenu || sushiMenu.length === 0) return null;

  // Sağ ve Sol ok fonksiyonları
  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sushiMenu.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? sushiMenu.length - 1 : prevIndex - 1));
  };

  // Şu an ekranda olan suşiyi seç
  const currentSushi = sushiMenu[currentIndex];
  
  // Güvenlik değişkenleri
  const sushiId = currentSushi.id || currentSushi.Id;
  const sushiName = currentSushi.name || currentSushi.Name;
  const imagePath = currentSushi.imagePath || currentSushi.ImagePath;
  const coinReward = currentSushi.coinReward || currentSushi.CoinReward || 0;
  const focusTime = currentSushi.requiredFocusTime || currentSushi.RequiredFocusTime || 25;
  const isUnlocked = unlockedSushiIds.includes(sushiId);

  return (
    <div className="menu-overlay" onClick={() => setShowSushiSelector(false)}>
      
      {/* Saydam ve esnek yeni modal kapsayıcımız */}
      <div className="carousel-modal fade-in" onClick={(e) => e.stopPropagation()}>
        
        <h2 className="carousel-title">WHAT TO MAKE?</h2>

        <div className="carousel-container">
          {/* SOL OK */}
          <button className="carousel-arrow" onClick={handlePrev}>◀</button>

          {/* MERKEZDEKİ SUŞİ (Süzülen Kısım) */}
          <div className="carousel-center-focus">
            <div className="carousel-image-wrapper">
              <img 
                src={sushiImages[imagePath]} 
                alt={sushiName} 
                className={`carousel-sushi-img ${isUnlocked ? 'floating-anim' : ''}`}
                style={{ filter: isUnlocked ? 'none' : 'brightness(0) opacity(0.6)' }} // Kilitliyse tam bir gölge/siluet olur
              />
              {!isUnlocked && <div className="carousel-lock-icon">🔒</div>}
            </div>

            <div className="carousel-info-box">
              <h3 className="carousel-sushi-name">{sushiName.toUpperCase()}</h3>
              <div className="carousel-stats">
                <span className="stat-coin">🪙 +{coinReward}</span>
                <span className="stat-time">{focusTime} mins</span>
              </div>
            </div>

            {/* BUTON ALANI */}
            <div className="carousel-action-area">
              {isUnlocked ? (
                <button 
                  className="pixel-btn prepare-btn"
                  onClick={() => {
                    setTargetSushi(currentSushi);
                    setTimeLeft(focusTime * 60);
                    setShowSushiSelector(false);
                    setIsTimerRunning(true);
                  }}
                >
                  PREPARE
                </button>
              ) : (
                <button className="pixel-btn locked-btn" disabled>
                  LOCKED
                </button>
              )}
            </div>
          </div>

          {/* SAĞ OK */}
          <button className="carousel-arrow" onClick={handleNext}>▶</button>
        </div>
        
        <button className="carousel-close-text" onClick={() => setShowSushiSelector(false)}>
          [ CLICK HERE TO CANCEL ]
        </button>
      </div>
    </div>
  );
}