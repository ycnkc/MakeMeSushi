// src/components/SushiModal.jsx
import React, { useState } from 'react';
import arrowIcon from '../assets/arrow.png';
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
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!sushiMenu || sushiMenu.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sushiMenu.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? sushiMenu.length - 1 : prevIndex - 1));
  };

  const currentSushi = sushiMenu[currentIndex];
  
  const sushiId = currentSushi.id || currentSushi.Id;
  const sushiName = currentSushi.name || currentSushi.Name;
  const imagePath = currentSushi.imagePath || currentSushi.ImagePath;
  const coinReward = currentSushi.coinReward || currentSushi.CoinReward || 0;
  const focusTime = currentSushi.requiredFocusTime || currentSushi.RequiredFocusTime || 25;
  const isUnlocked = unlockedSushiIds.includes(sushiId);

  return (
    <div className="menu-overlay" onClick={() => setShowSushiSelector(false)}>
      <div className="carousel-modal fade-in" onClick={(e) => e.stopPropagation()}>
        
        <h2 className="carousel-title">WHAT TO MAKE?</h2>

        <div className="carousel-container">
<button className="carousel-arrow arrow-left" onClick={handlePrev}>
            <img src={arrowIcon} alt="Previous" />
          </button>
          {/* SİHİRLİ DOKUNUŞ: key={sushiId} ve carousel-swipe sınıfı eklendi */}
          <div key={sushiId} className="carousel-center-focus carousel-swipe">
            
            <div className="carousel-image-wrapper">
              <img 
                src={sushiImages[imagePath]} 
                alt={sushiName} 
                className={`carousel-sushi-img ${isUnlocked ? 'floating-anim' : ''}`}
                style={{ filter: isUnlocked ? 'none' : 'brightness(0) opacity(0.6)' }}
              />
              {!isUnlocked && <div className="carousel-lock-icon">🔒</div>}
            </div>

            <div className="carousel-info-box">
              <h3 className="carousel-sushi-name">{sushiName.toUpperCase()}</h3>
              <div className="carousel-stats">
                <span className="stat-coin">🪙 +{coinReward}</span>
                <span className="stat-time">⏱️ {focusTime} mins</span>
              </div>
            </div>

            <div className="carousel-action-area">
              {isUnlocked ? (
                <button 
                  className="custom-pixel-btn prepare-btn"
                  onClick={() => {
                    setTargetSushi(currentSushi);
                    setTimeLeft(5);
                    setShowSushiSelector(false);
                    setIsTimerRunning(true);
                  }}
                >
                  PREPARE
                </button>
              ) : (
                <button className="custom-pixel-btn locked-btn" disabled>
                  LOCKED
                </button>
              )}
            </div>
          </div>

          <button className="carousel-arrow arrow-right" onClick={handleNext}>
            <img src={arrowIcon} alt="Next" />
          </button>        </div>
        
        <button className="carousel-close-text" onClick={() => setShowSushiSelector(false)}>
          [ CLICK HERE TO CANCEL ]
        </button>
      </div>
    </div>
  );
}