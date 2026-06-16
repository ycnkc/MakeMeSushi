// src/components/Dashboard.jsx
import futomakiIcon from '../assets/futomaki.png';
import timerClock from '../assets/clock.png';
import textBox from '../assets/textbox.png';
import manekiHappy from '../assets/maneki_happy.png';
import coinIcon from '../assets/coin.png';
import defaultBg from '../assets/bg_dashboard.png'; // Orijinal varsayılan arka plan
import PauseMenu from './PauseMenu';
import SushiModal from './SushiModal';
import StoreModal from './StoreModal';
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
  
  // DEKORASYON PROPLARI
  decorationsMenu = [],
  decorImages = {},
  unlockedDecorationIds = [],
  setUnlockedDecorationIds = () => {},
  equippedDecorationIds = [], 
  setEquippedDecorationIds = () => {}
}) {

  // 1. Sadece 'equipped' (takılı olan) eşyaları bul
  const activeDecorations = decorationsMenu.filter(decor => 
    equippedDecorationIds.includes(decor.id || decor.Id)
  );

  // 2. Takılı eşyalar arasında Type'ı 'Background' olanı bul
  const equippedBackground = activeDecorations.find(decor => 
    (decor.type || decor.Type || '').toLowerCase() === 'background'
  );

  // 3. Normal (duvara/yere konan) eşyaları ayır
  const normalDecorations = activeDecorations.filter(decor => 
    (decor.type || decor.Type || '').toLowerCase() !== 'background'
  );

  // 4. Arka plan URL'sini belirle (Kullanıcı bir şey taktıysa onu, takmadıysa default olanı kullan)
  const currentBgUrl = equippedBackground 
    ? decorImages[equippedBackground.imagePath || equippedBackground.ImagePath] 
    : defaultBg;

  return (
    <div 
      className="fade-in dashboard-screen" 
      style={{ backgroundImage: `url(${currentBgUrl})` }}
    >
      
      {/* =======================================================
          NORMAL DEKORASYONLARIN EKRANA YERLEŞTİRİLMESİ
      ======================================================= */}
      {normalDecorations.map(decor => {
        const imageKey = decor.imagePath || decor.ImagePath;
        
        // Dosya isminden benzersiz bir sınıf üretiyoruz. 
        // Örn: 'decoration_bamboo.png' -> 'decor-bamboo'
        const customClass = imageKey.replace('decoration_', 'decor-').replace('.png', '');
        
        return (
          <img 
            key={decor.id || decor.Id}
            src={decorImages[imageKey]} 
            alt={decor.name || decor.Name}
            className={`placed-decor-item ${customClass}`}
          />
        );
      })}

      {/* --- SİPARİŞ KAĞIDI HUD PANELİ --- */}
      <div className="hud-order-paper fade-in" style={{ zIndex: 10 }}>
        <h3 className="order-title">ORDER</h3>

        {/* MENÜ BUTONU */}
        <div className="order-item" onClick={() => setIsMenuOpen(true)}>
          <img src={futomakiIcon} alt="Menu" className="hud-icon-btn" />
          <span className="order-item-text">MENU</span>
        </div>

        <div className="order-item-divider"></div>

        {/* COIN GÖSTERGESİ (MAĞAZAYI AÇAR) */}
        <div className="order-item" onClick={() => setShowStore(true)} title="Open Store">
          <img src={coinIcon} alt="Coin" className="hud-coin-icon" />
          <span className="hud-coin-text">{coins}</span>
        </div>
      </div>

      {/* PAUSE MENÜSÜ */}
      {isMenuOpen && (
        <PauseMenu 
          setIsMenuOpen={setIsMenuOpen} 
          setIsTimerRunning={setIsTimerRunning} 
          setStage={setStage} 
          setUsername={setUsername} 
          setPassword={setPassword} 
        />
      )}

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
               {isTimerRunning ? `Preparing ${targetSushi.name}...` : "Paused"}
             </p>
             <button className="pixel-btn cancel-order-btn fade-in" onClick={(e) => {
                 e.stopPropagation(); 
                 setTargetSushi(null);
                 setIsTimerRunning(false);
                 setTimeLeft(25 * 60); 
               }}>
               CANCEL
             </button>
           </div>
        </div>
      )}

      {/* SAĞ SÜTUN: Saat ve Kedi */}
      <div className="dashboard-right-column" style={{ zIndex: 5 }}>
          {dashboardMode === 'focus' && (
            <div className="dashboard-timer-section fade-in">
                <div className="dashboard-clock-wrapper" onClick={() => {
                    if (!targetSushi) setShowSushiSelector(true);
                    else setIsTimerRunning(!isTimerRunning);
                }}>
                  <img id="timer-clock-image" src={timerClock} alt="Timer Clock Image" />
                  <h1 className="digital-clock-text">{formatTime(timeLeft)}</h1>
                </div>
                <p className="hint pulse-hint">
                    {!targetSushi ? "click to choose sushi" : (isTimerRunning ? "click to pause" : "click to resume")}
                </p>
            </div>
          )}
          
          <div className="dialogue-maneki-row" onClick={() => { if(dashboardMode === 'dialogue') setDashboardMode('focus'); }} style={{ cursor: dashboardMode === 'dialogue' ? 'pointer' : 'default' }}>
            {dashboardMode === 'dialogue' && (
              <div className="text-box-wrapper fade-in-bubble">
                <img id="text-box" src={textBox} alt="Speech Bubble" />
                <h2 className="introduction-text">
                  {isNewUser ? "This is your counter. You can start working by clicking on the clock." : `Welcome back, ${username}! Ready to make some sushi?`}
                  <br/><br/><span style={{fontSize: '8px', opacity: 0.6}}>(click to dismiss)</span>
                </h2>
              </div>
            )}
            <img id="maneki-dashboard" src={manekiHappy} alt="Maneki-neko Happy" />
          </div>
      </div>

      {/* SUSHİ SEÇİM MODAL'I */}
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

      {/* MAĞAZA (STORE) MODAL'I */}
      {showStore && (
        <StoreModal 
          sushiMenu={sushiMenu} 
          sushiImages={sushiImages}
          coins={coins} 
          setCoins={setCoins}
          unlockedSushiIds={unlockedSushiIds} 
          setUnlockedSushiIds={setUnlockedSushiIds}
          setShowStore={setShowStore}
          
          // Mağazaya gönderilen dekorasyon propları
          decorationsMenu={decorationsMenu}
          decorImages={decorImages}
          unlockedDecorationIds={unlockedDecorationIds}
          setUnlockedDecorationIds={setUnlockedDecorationIds}
          equippedDecorationIds={equippedDecorationIds}
          setEquippedDecorationIds={setEquippedDecorationIds}
        />
      )}

    </div>
  );
}