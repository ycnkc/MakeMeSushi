// src/components/Dashboard.jsx
import menuIcon from '../assets/menu-btn.png';
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
import { useState, useEffect, useRef } from 'react';
import './Dashboard.css';

let isSavingGlobal = false;

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
  
  // 1. TÜM STATE'LER
  const [displayedText, setDisplayedText] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const isSavingRef = useRef(false);
  
  const [dailyQuest, setDailyQuest] = useState({
    requirements: [],
    reward: 0,
    isCompleted: false
  });

  // MANEKİ CHAT STATE'LERİ
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'maneki', text: "Welcome back! Ready to make some sushi?" }
  ]);
  const [isChatClosing, setIsChatClosing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null); 

  // YENİ MESAJ ATILDIĞINDA EN ALTA KAYDIR
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');

    try {
      const response = await fetch('http://localhost:5008/api/Chat/maneki', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ Message: userMessage.text })
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages(prev => [...prev, { sender: 'maneki', text: data.reply }]);
      }
    } catch (err) {
      console.error("Ollama Chat Error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleChat = () => {
    if (dashboardMode === 'dialogue') {
      handleDialogueClick();
    } else {
      if (isChatOpen) {
        // Kapanış animasyonunu tetikle
        setIsChatClosing(true);
        // Animasyon süresi (200ms) bitince elementi tamamen gizle
        setTimeout(() => {
          setIsChatOpen(false);
          setIsChatClosing(false);
        }, 200); 
      } else {
        // Normal şekilde aç
        setIsChatOpen(true);
      }
    }
  };
  // 2. MODAL AÇMA KONTROLLERİ (Açılırken sayacı otomatik durdurur)
  const handleOpenMenu = () => { setIsTimerRunning(false); setIsMenuOpen(true); };
  const handleOpenMusic = () => { setIsTimerRunning(false); setShowMusicModal(true); };
  const handleOpenStore = () => { setIsTimerRunning(false); setShowStore(true); };

  // 3. FONKSİYONLAR
  const saveQuestRewardToDb = async (rewardAmount) => {
    setCoins(prevCoins => prevCoins + rewardAmount);

    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
    try {
      const response = await fetch(`http://localhost:5008/api/User/add-reward-coins`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rewardAmount })
      });

      if (response.ok) {
        const data = await response.json();
        setCoins(data.newBalance); 
        console.log("Quest reward successfully saved to database! New Balance:", data.newBalance);
      } else {
        const errorText = await response.text();
        console.error("Backend'e kaydedilemedi! Hata detayı:", errorText);
      }
    } catch (err) {
      console.error("Failed to save quest reward to DB:", err);
    }
  };

  const completeSession = async () => {
    if (!targetSushi) return;

    if (isSavingGlobal) {
      console.log("Spam engellendi! Zaten kaydediliyor...");
      return;
    }
    isSavingGlobal = true; 
    
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

        if (!dailyQuest.isCompleted) {
          const updatedReqs = dailyQuest.requirements.map(req => {
            if (req.id === sushiId && req.current < req.target) {
              return { ...req, current: req.current + 1 };
            }
            return req;
          });

          const allDone = updatedReqs.every(req => req.current >= req.target);

          setDailyQuest(prev => ({
            ...prev,
            requirements: updatedReqs,
            isCompleted: allDone
          }));

          if (allDone) {
            console.log("Tüm siparişler başarıyla tamamlandı! Ödül yükleniyor: ", dailyQuest.reward);
            await saveQuestRewardToDb(dailyQuest.reward);
          }
        }

        setTargetSushi(null); 
        setTimeLeft(25 * 60);
      }
    } catch (err) {
      console.error("DB update error:", err);
    } finally {
      setTimeout(() => {
        isSavingGlobal = false;
      }, 2000);
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

  // 4. EFFECT'LER (TETİKLEYİCİLER)
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
      if (isSavingRef.current) return; 

      isSavingRef.current = true; 

      const audio = new Audio(dingSound);
      audio.volume = 0.1; 
      audio.play().catch(err => console.log("Ses çalma hatası:", err));

      completeSession(); 
      setIsTimerRunning(false);
    } 
    else if (timeLeft > 0) {
      isSavingRef.current = false; 
    }
  }, [timeLeft, isTimerRunning, setIsTimerRunning, targetSushi]);

  useEffect(() => {
    if (sushiMenu && sushiMenu.length > 0 && dailyQuest.requirements.length === 0) {
      generateRandomQuest();
    }
  }, [sushiMenu]);

  // 5. DEĞİŞKENLER VE HESAPLAMALAR
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

  // 6. RENDER BÖLÜMÜ
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
        <button className="hud-action-btn hud-menu-btn-wrap" onClick={handleOpenMenu}>
          <img src={menuIcon} alt="Menu" className="hud-icon-btn" />
        </button>

        <button className="hud-action-btn hud-music-btn" onClick={handleOpenMusic}>
          <img src={cdImg} alt="Music" className="cd-icon" />
        </button>

        <button className="hud-action-btn hud-store-btn" onClick={handleOpenStore}>
          <img src={coinIcon} alt="Coin" className="hud-coin-icon" />
          <span className="hud-coin-text">{coins}</span>
        </button>
      </div>

      <MusicPlayer 
        musicFiles={[lofi1, lofi2]} 
        showMusicModal={showMusicModal} 
        setShowMusicModal={setShowMusicModal} 
      />

      {/* SİPARİŞ KAĞIDI */}
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

      {/* HAZIRLANAN SUSHİ ALANI */}
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

      {/* SAĞ ALT SÜTUN: SAAT VE MANEKİ */}
      <div className="dashboard-right-column" style={{ zIndex: 20 }}>
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

        <div className="dialogue-maneki-row">
          
          {/* 1. KLASİK HOŞ GELDİN BALONU */}
          {dashboardMode === 'dialogue' && (
            <div 
              className="text-box-wrapper fade-in-bubble"
              onClick={handleDialogueClick}
              style={{ cursor: 'pointer' }}
            >
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

          {/* 2. YAPAY ZEKA SOHBET KUTUSU */}
          {dashboardMode !== 'dialogue' && (
            <div className={`maneki-chat-box ${isChatOpen ? 'open' : 'closed'}`}>
              <div className="chat-messages">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`chat-bubble ${msg.sender}`}>
                    {msg.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="chat-bubble maneki typing-indicator">
                    <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <form className="chat-input-area" onSubmit={handleSendMessage}>
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask the chef..." 
                  maxLength={100}
                />
                <button type="submit">SEND</button>
              </form>
            </div>
          )}

          {/* 3. MANEKİ KEDİSİ (Sadeleştirilmiş Tıklama) */}
          <img 
            id="maneki-dashboard" 
            src={manekiHappy} 
            alt="Maneki Happy" 
            onClick={() => {
              if (dashboardMode === 'dialogue') {
                handleDialogueClick();
              } else {
                setIsChatOpen(!isChatOpen); // Direkt state'i tersine çeviriyoruz
              }
            }}
          />
        </div>
      </div> 

      {/* --- MODALLAR --- */}
      {isMenuOpen && (
        <PauseMenu
          setIsMenuOpen={setIsMenuOpen}
          setIsTimerRunning={setIsTimerRunning}
          setStage={setStage}
          setUsername={setUsername}
          setPassword={setPassword}
          setShowStats={setShowStats}
          sushiImages={sushiImages}
          targetSushi={targetSushi}
        />
      )}

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