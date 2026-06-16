// src/components/Dashboard.jsx
import futomakiIcon from '../assets/futomaki.png';
import timerClock from '../assets/clock.png';
import textBox from '../assets/textbox.png';
import manekiHappy from '../assets/maneki_happy.png';
import coinIcon from '../assets/coin.png';
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
  equippedDecorationIds = [], // Varsayılan değer eklendi
  setEquippedDecorationIds = () => {}
}) {

  // KRİTİK DEĞİŞİKLİK: Artık 'unlocked' (sahip olunan) listesine değil, 
  // 'equipped' (takılı olan) listesine bakarak ekrana çiziyoruz.
  const activeDecorations = decorationsMenu.filter(decor => 
    equippedDecorationIds.includes(decor.id || decor.Id)
  );

  return (
    <div className="fade-in dashboard-screen">
      
      {/* =======================================================
          TAKILI DEKORASYONLARIN EKRANA YERLEŞTİRİLMESİ
      ======================================================= */}
      {/* İleride CSS ile ".decor-type-floor", ".decor-type-wall" gibi sınıfları 
          özelleştirip eşyaları dükkanın istediğin yerine dizebilirsin. */}
      {activeDecorations.map(decor => {
        const typeClass = (decor.type || decor.Type || 'general').toLowerCase();
        
        return (
          <img 
            key={decor.id || decor.Id}
            src={decorImages[decor.imagePath || decor.ImagePath]} 
            alt={decor.name || decor.Name}
            className={`placed-decor-item decor-type-${typeClass}`}
            style={{ position: 'absolute', zIndex: 1 }} // CSS ile düzenlenene kadar sol üste atar
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