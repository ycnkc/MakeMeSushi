// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import futomakiIcon from '../assets/futomaki.png';
import timerClock from '../assets/clock.png';
import textBox from '../assets/textbox.png';
import manekiHappy from '../assets/maneki_happy.png';
import coinIcon from '../assets/coin.png';
import defaultBg from '../assets/bg_dashboard.png';
import PauseMenu from './PauseMenu';
import SushiModal from './SushiModal';
import StoreModal from './StoreModal';
import StatsModal from './StatsModal';
import dingSound from '../assets/ding.mp3';
import './Dashboard.css';

export default function Dashboard({
  coins,
  setCoins,
  isMenuOpen,
  setIsMenuOpen,
  setIsTimerRunning,
  setStage,
  setUsername,
  setPassword,
  dashboardMode,
  setDashboardMode,
  isTimerRunning,
  timeLeft,
  formatTime,
  targetSushi,
  setTargetSushi,
  showSushiSelector,
  setShowSushiSelector,
  isNewUser,
  username,
  sushiMenu,
  isMenuLoading,
  sushiImages,
  setTimeLeft,
  showStore = false,
  setShowStore = () => {},
  unlockedSushiIds = [],
  setUnlockedSushiIds = () => {},

  // Dekorasyon propları
  decorationsMenu = [],
  decorImages = {},
  unlockedDecorationIds = [],
  setUnlockedDecorationIds = () => {},
  equippedDecorationIds = [],
  setEquippedDecorationIds = () => {},
}) {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = `Preparing ${targetSushi ? targetSushi.name : ''}...`;
const [showStats, setShowStats] = useState(false);

  
useEffect(() => {
  if (!isTimerRunning || !targetSushi) {
    setDisplayedText("");
    return;
  }

  const fullText = `Preparing ${targetSushi.name}...`;
  let i = 0;
  let isDeleting = false;
  let timeout;

  const animate = () => {
    // Yazıyı ekle
    if (!isDeleting && i < fullText.length) {
      setDisplayedText(fullText.substring(0, i));
      i++;
      timeout = setTimeout(animate, 100);
    } 
    // Yazıyı sil (Döngü için)
    else if (isDeleting && i >= 0) {
      setDisplayedText(fullText.substring(0, i));
      i--;
      timeout = setTimeout(animate, 50);
    } 
    // Durum değiştir
    else {
  isDeleting = !isDeleting;
  if (isDeleting) {
    i = fullText.length; // silmeye başlamadan önce sona git
  } else {
    i = 0; // yazmaya başlamadan önce başa dön
  }
  timeout = setTimeout(animate, isDeleting ? 2000 : 500);
}
  };

  animate();
  return () => clearTimeout(timeout);
}, [isTimerRunning, targetSushi]);

useEffect(() => {
  if (timeLeft === 0 && isTimerRunning) {
    const audio = new Audio(dingSound);
    audio.volume = 0.1; 
    audio.play().catch(err => console.log("Ses çalma hatası:", err));

    completeSession();

    setIsTimerRunning(false);
    
    // (İleride backend'e CompleteFocus isteği atacağımız yer tam olarak burası olacak!)
  }
}, [timeLeft, isTimerRunning, setIsTimerRunning]);
  // Sadece 'equipped' (takılı olan) eşyaları bul
  const activeDecorations = decorationsMenu.filter((decor) =>
    equippedDecorationIds.includes(decor.id ?? decor.Id)
  );

  // Takılı eşyalar arasında type'ı 'background' olanı bul
  const equippedBackground = activeDecorations.find(
    (decor) => (decor.type ?? decor.Type ?? '').toLowerCase() === 'background'
  );

  // Normal (duvara/yere konan) eşyaları ayır
  const normalDecorations = activeDecorations.filter(
    (decor) => (decor.type ?? decor.Type ?? '').toLowerCase() !== 'background'
  );

  // Arka plan URL'sini belirle
  const currentBgUrl = equippedBackground
    ? decorImages[equippedBackground.imagePath ?? equippedBackground.ImagePath]
    : defaultBg;

  const handleCancelOrder = (e) => {
    e.stopPropagation();
    setTargetSushi(null);
    setIsTimerRunning(false);
    setTimeLeft(25 * 60);
  };

  const completeSession = async () => {
    if (!targetSushi) return;
    
    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
    const sushiId = targetSushi.id || targetSushi.Id;

    try {
      const response = await fetch(`http://localhost:5008/api/User/complete-focus/${sushiId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCoins(data.newBalance); // Coinleri güncelleyelim
        console.log("Database updated:", data.message);
      }
    } catch (err) {
      console.error("DB update error:", err);
    }
  };

  const handleClockClick = () => {
    if (!targetSushi) setShowSushiSelector(true);
    else setIsTimerRunning((prev) => !prev);
  };

  const handleDialogueClick = () => {
    if (dashboardMode === 'dialogue') setDashboardMode('focus');
  };

  return (
    <div
      className="fade-in dashboard-screen"
      style={{ backgroundImage: `url(${currentBgUrl})` }}
    >
      {/* Normal dekorasyonların ekrana yerleştirilmesi */}
      {normalDecorations.map((decor) => {
        const imageKey = decor.imagePath ?? decor.ImagePath;
        const customClass = imageKey
          .replace('decoration_', 'decor-')
          .replace('.png', '');

        return (
          <img
            key={decor.id ?? decor.Id}
            src={decorImages[imageKey]}
            alt={decor.name ?? decor.Name}
            className={`placed-decor-item ${customClass}`}
          />
        );
      })}

      {/* Sipariş kağıdı HUD paneli */}
      <div className="hud-order-paper fade-in" style={{ zIndex: 10 }}>
        <h3 className="order-title">ORDER</h3>

        <div className="order-item" onClick={() => setIsMenuOpen(true)}>
          <img src={futomakiIcon} alt="Menu" className="hud-icon-btn" />
          <span className="order-item-text">MENU</span>
        </div>

        <div className="order-item-divider" />

        <div
          className="order-item"
          onClick={() => setShowStore(true)}
          title="Open Store"
        >
          <img src={coinIcon} alt="Coin" className="hud-coin-icon" />
          <span className="hud-coin-text">{coins}</span>
        </div>
      </div>

      {/* Pause menüsü */}
      {isMenuOpen && (
        <PauseMenu
          setIsMenuOpen={setIsMenuOpen}
          setIsTimerRunning={setIsTimerRunning}
          setStage={setStage}
          setUsername={setUsername}
          setPassword={setPassword}
          setShowStats={setShowStats}
          sushiImages={sushiImages} /* <--- BUNU EKLE */
        />
      )}

      {/* Hazırlanan sushi alanı */}
      {targetSushi && (
        <div className="preparing-container fade-in" style={{ zIndex: 5 }}>
          <img
            src={sushiImages[targetSushi.imagePath]}
            alt="Preparing"
            className={`preparing-sushi-img ${isTimerRunning ? 'float-sushi' : ''}`}
          />
          <div className="preparing-label-box">
            <p className="preparing-text">
              {isTimerRunning ? displayedText : 'Paused'}
            </p>
            <button
              className="cancel-order-btn fade-in"
              onClick={handleCancelOrder}
            >
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Sağ sütun: Saat ve kedi */}
      <div className="dashboard-right-column" style={{ zIndex: 5 }}>
        {dashboardMode === 'focus' && (
          <div className="dashboard-timer-section fade-in">
            <div
              className="dashboard-clock-wrapper"
              onClick={handleClockClick}
            >
              <img
                id="timer-clock-image"
                src={timerClock}
                alt="Timer Clock Image"
              />
              <h1 className="digital-clock-text">{formatTime(timeLeft)}</h1>
            </div>
            <p className="hint pulse-hint">
              {!targetSushi
                ? 'click to choose sushi'
                : isTimerRunning
                ? 'click to pause'
                : 'click to resume'}
            </p>
          </div>
        )}

        <div
          className="dialogue-maneki-row"
          onClick={handleDialogueClick}
          style={{ cursor: dashboardMode === 'dialogue' ? 'pointer' : 'default' }}
        >
          {dashboardMode === 'dialogue' && (
            <div className="text-box-wrapper fade-in-bubble">
              <img id="text-box" src={textBox} alt="Speech Bubble" />
              <h2 className="introduction-text">
                {isNewUser
                  ? 'This is your counter. You can start working by clicking on the clock.'
                  : `Welcome back, ${username}! Ready to make some sushi?`}
                <br />
                <br />
                <span style={{ fontSize: '8px', opacity: 0.6 }}>
                  (click to dismiss)
                </span>
              </h2>
            </div>
          )}
          <img
            id="maneki-dashboard"
            src={manekiHappy}
            alt="Maneki-neko Happy"
          />
        </div>
      </div>

      {/* Sushi seçim modal'ı */}
      {showSushiSelector && (
        <SushiModal
          isMenuLoading={isMenuLoading}
          sushiMenu={sushiMenu}
          sushiImages={sushiImages}
          setTargetSushi={setTargetSushi}
          setTimeLeft={setTimeLeft}
          setShowSushiSelector={setShowSushiSelector}
          setIsTimerRunning={setIsTimerRunning}
          unlockedSushiIds={unlockedSushiIds}
        />
      )}

      {/* Mağaza (Store) modal'ı */}
      {showStore && (
        <StoreModal
          sushiMenu={sushiMenu}
          sushiImages={sushiImages}
          coins={coins}
          setCoins={setCoins}
          unlockedSushiIds={unlockedSushiIds}
          setUnlockedSushiIds={setUnlockedSushiIds}
          setShowStore={setShowStore}
          decorationsMenu={decorationsMenu}
          decorImages={decorImages}
          unlockedDecorationIds={unlockedDecorationIds}
          setUnlockedDecorationIds={setUnlockedDecorationIds}
          equippedDecorationIds={equippedDecorationIds}
          setEquippedDecorationIds={setEquippedDecorationIds}
        />
      )}

      {showStats && <StatsModal setShowStats={setShowStats} sushiImages={sushiImages}/>}
    </div>
  );
}
