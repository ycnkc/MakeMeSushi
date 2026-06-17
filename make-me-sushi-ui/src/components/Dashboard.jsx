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
import lofi1 from '../assets/lofi1.mp3';
import lofi2 from '../assets/lofi2.mp3';
import cdImg from '../assets/cd.png'; 
import MusicPlayer from "./MusicPlayer";
import './Dashboard.css';

export default function Dashboard({
  coins, setCoins, isMenuOpen, setIsMenuOpen, setIsTimerRunning,
  setStage, setUsername, setPassword, dashboardMode, setDashboardMode,
  isTimerRunning, timeLeft, formatTime, targetSushi, setTargetSushi,
  showSushiSelector, setShowSushiSelector, isNewUser, username,
  sushiMenu, isMenuLoading, sushiImages, setTimeLeft,
  showStore = false, setShowStore = () => {},
  unlockedSushiIds = [], setUnlockedSushiIds = () => {},
  decorationsMenu = [], decorImages = {},
  unlockedDecorationIds = [], setUnlockedDecorationIds = () => {},
  equippedDecorationIds = [], setEquippedDecorationIds = () => {},
}) {
  
  // 1. TÜM STATE'LER EN ÜSTTE OLMALI
  const [displayedText, setDisplayedText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  
  // Görev state'i başlangıçta BOŞ olmalı ki useEffect yeni görev üretebilsin
  const [dailyQuest, setDailyQuest] = useState({
    requirements: [],
    reward: 0,
    isCompleted: false
  });

  // 2. FONKSİYONLAR
  const saveQuestRewardToDb = async (rewardAmount) => {
    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
    try {
      const response = await fetch(`http://localhost:5008/api/User/add-reward-coins`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rewardAmount)
      });

      if (response.ok) {
        const data = await response.json();
        setCoins(data.newBalance); 
        console.log("Quest reward successfully saved to database!");
      }
    } catch (err) {
      console.error("Failed to save quest reward to DB:", err);
    }
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
        setCoins(data.newBalance); 
        console.log("Database updated:", data.message);

        // --- GÖREV İLERLEME MANTIĞI ---
        setDailyQuest(prevQuest => {
          if (prevQuest.isCompleted) return prevQuest;

          const updatedReqs = prevQuest.requirements.map(req => {
            if (req.id === sushiId && req.current < req.target) {
              return { ...req, current: req.current + 1 };
            }
            return req;
          });

          const allDone = updatedReqs.every(req => req.current >= req.target);
          
          if (allDone && !prevQuest.isCompleted) {
            // Görev BİTTİ! Ödülü veritabanına kaydet
            saveQuestRewardToDb(prevQuest.reward);
          }

          return {
            ...prevQuest,
            requirements: updatedReqs,
            isCompleted: allDone
          };
        });
        // ---------------------------------------------
      }
    } catch (err) {
      console.error("DB update error:", err);
    }
  };

  const handleCancelOrder = (e) => {
    e.stopPropagation();
    setTargetSushi(null);
    setIsTimerRunning(false);
    setTimeLeft(25 * 60);
  };

  const handleClockClick = () => {
    if (!targetSushi) setShowSushiSelector(true);
    else setIsTimerRunning((prev) => !prev);
  };

  const handleDialogueClick = () => {
    if (dashboardMode === 'dialogue') setDashboardMode('focus');
  };

  const generateRandomQuest = () => {
    if (!sushiMenu || sushiMenu.length === 0) return;

    const numRequirements = Math.floor(Math.random() * 2) + 1; 
    const shuffledMenu = [...sushiMenu].sort(() => 0.5 - Math.random());
    const selectedSushis = shuffledMenu.slice(0, numRequirements);

    let totalTarget = 0;
    const requirements = selectedSushis.map(sushi => {
      const target = Math.floor(Math.random() * 3) + 2;
      totalTarget += target;
      return {
        id: sushi.id || sushi.Id,
        name: sushi.name || sushi.Name,
        target: target,
        current: 0
      };
    });

    const rewardAmount = totalTarget * 50;

    setDailyQuest({
      requirements: requirements,
      reward: rewardAmount,
      isCompleted: false
    });
  };

  // 3. EFFECT'LER (TETİKLEYİCİLER)
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
      if (!isDeleting && i < fullText.length) {
        setDisplayedText(fullText.substring(0, i));
        i++;
        timeout = setTimeout(animate, 100);
      } else if (isDeleting && i >= 0) {
        setDisplayedText(fullText.substring(0, i));
        i--;
        timeout = setTimeout(animate, 50);
      } else {
        isDeleting = !isDeleting;
        if (isDeleting) i = fullText.length;
        else i = 0;
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
    }
  }, [timeLeft, isTimerRunning, setIsTimerRunning, targetSushi]);

  useEffect(() => {
    if (sushiMenu && sushiMenu.length > 0 && dailyQuest.requirements.length === 0) {
      generateRandomQuest();
    }
  }, [sushiMenu]);

  // 4. DEĞİŞKENLER VE HESAPLAMALAR
  const activeDecorations = decorationsMenu.filter((decor) =>
    equippedDecorationIds.includes(decor.id ?? decor.Id)
  );

  const equippedBackground = activeDecorations.find(
    (decor) => (decor.type ?? decor.Type ?? '').toLowerCase() === 'background'
  );

  const normalDecorations = activeDecorations.filter(
    (decor) => (decor.type ?? decor.Type ?? '').toLowerCase() !== 'background'
  );

  const currentBgUrl = equippedBackground
    ? decorImages[equippedBackground.imagePath ?? equippedBackground.ImagePath]
    : defaultBg;

  // 5. RENDER BÖLÜMÜ
  return (
    <div
      className="fade-in dashboard-screen"
      style={{ backgroundImage: `url(${currentBgUrl})` }}
    >
      {/* Normal dekorasyonlar */}
      {normalDecorations.map((decor) => {
        const imageKey = decor.imagePath ?? decor.ImagePath;
        const customClass = imageKey.replace('decoration_', 'decor-').replace('.png', '');
        return (
          <img
            key={decor.id ?? decor.Id}
            src={decorImages[imageKey]}
            alt={decor.name ?? decor.Name}
            className={`placed-decor-item ${customClass}`}
          />
        );
      })}

      {/* SOL ÜST HUD PANELI */}
      <div className="hud-top-left">
        {/* Menü Butonu */}
        <button className="hud-action-btn hud-menu-btn-wrap" onClick={() => setIsMenuOpen(true)}>
          <img src={futomakiIcon} alt="Menu" className="hud-icon-btn" />
        </button>

        {/* Müzik Butonu */}
        <button className="hud-action-btn hud-music-btn" onClick={() => setShowMusicModal(true)}>
          <img src={cdImg} alt="Music" className="cd-icon" />
        </button>

        {/* Store Butonu */}
        <button className="hud-action-btn hud-store-btn" onClick={() => setShowStore(true)}>
          <img src={coinIcon} alt="Coin" className="hud-coin-icon" />
          <span className="hud-coin-text">{coins}</span>
        </button>
      </div>

      {/* Müzik Çalar Sistemi */}
      <MusicPlayer 
        musicFiles={[lofi1, lofi2]} 
        showMusicModal={showMusicModal} 
        setShowMusicModal={setShowMusicModal} 
      />

      {/* SİPARİŞ KAĞIDI - GÜNLÜK GÖREVLER */}
      <div className="hud-order-paper fade-in" style={{ zIndex: 10 }}>
        

        <h3 className="order-title">ORDERS</h3>

        <div className="quest-list">
          {dailyQuest.requirements?.map((req, idx) => {
            const isDone = req.current >= req.target;
            
            return (
              <div key={idx} className={`quest-item ${isDone ? 'completed-task' : ''}`}>
                <span className="quest-name">{req.name}</span>
                <span className="quest-progress">{req.current}/{req.target}</span>
              </div>
            );
          })}
        </div>

        <div className="order-item-divider" />

        <div className="quest-reward">
          <span className="reward-value">REWARD: 🪙 {dailyQuest.reward}</span>
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
          sushiImages={sushiImages}
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
            <button className="cancel-order-btn fade-in" onClick={handleCancelOrder}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      {/* Sağ alt sütun: Saat ve kedi */}
      <div className="dashboard-right-column" style={{ zIndex: 5 }}>
        {dashboardMode === 'focus' && (
          <div className="dashboard-timer-section fade-in">
            <div className="dashboard-clock-wrapper" onClick={handleClockClick}>
              <img id="timer-clock-image" src={timerClock} alt="Timer" />
              <h1 className="digital-clock-text">{formatTime(timeLeft)}</h1>
            </div>
            <p className="hint pulse-hint">
              {!targetSushi ? 'click to choose sushi' : isTimerRunning ? 'click to pause' : 'click to resume'}
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
                <br /><br />
                <span style={{ fontSize: '8px', opacity: 0.6 }}>(click to dismiss)</span>
              </h2>
            </div>
          )}
          <img id="maneki-dashboard" src={manekiHappy} alt="Maneki Happy" />
        </div>
      </div>

      {showSushiSelector && (
        <SushiModal
          isMenuLoading={isMenuLoading} sushiMenu={sushiMenu} sushiImages={sushiImages}
          setTargetSushi={setTargetSushi} setTimeLeft={setTimeLeft}
          setShowSushiSelector={setShowSushiSelector} setIsTimerRunning={setIsTimerRunning}
          unlockedSushiIds={unlockedSushiIds}
        />
      )}

      {showStore && (
        <StoreModal
          sushiMenu={sushiMenu} sushiImages={sushiImages} coins={coins} setCoins={setCoins}
          unlockedSushiIds={unlockedSushiIds} setUnlockedSushiIds={setUnlockedSushiIds}
          setShowStore={setShowStore} decorationsMenu={decorationsMenu} decorImages={decorImages}
          unlockedDecorationIds={unlockedDecorationIds} setUnlockedDecorationIds={setUnlockedDecorationIds}
          equippedDecorationIds={equippedDecorationIds} setEquippedDecorationIds={setEquippedDecorationIds}
        />
      )}

      {showStats && <StatsModal setShowStats={setShowStats} sushiImages={sushiImages}/>}
    </div>
  );
}