// src/components/Dashboard.jsx
import futomakiIcon from '../assets/futomaki.png';
import timerClock from '../assets/clock.png';
import textBox from '../assets/textbox.png';
import manekiHappy from '../assets/maneki_happy.png';
import coinIcon from '../assets/coin.png';
import orderPaper from '../assets/paper.png';
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
  showStore = false, // Varsayılan değerler ekleyerek çökmeleri önlüyoruz
  setShowStore = () => {},
  unlockedSushiIds = [], 
  setUnlockedSushiIds = () => {}
}) {
  return (
    <div className="fade-in dashboard-screen">
      
      {/* --- SİPARİŞ KAĞIDI HUD PANELİ --- */}
      <div className="hud-order-paper fade-in">
        <h3 className="order-title">ORDER</h3>

        {/* MENÜ BUTONU */}
        <div className="order-item" onClick={() => setIsMenuOpen(true)}>
          <img src={futomakiIcon} alt="Menu" className="hud-icon-btn" />
          <span className="order-item-text">MENU</span>
        </div>

        <div className="order-item-divider"></div>

        {/* COIN GÖSTERGESİ */}
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
        <div className="preparing-container fade-in">
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
      <div className="dashboard-right-column">
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
                <h2 className="intro-text">
                  {isNewUser ? "This is your counter. You can start working by clicking on the clock." : `Welcome back, ${username.toUpperCase()}! Ready to make some sushi?`}
                  <br/><br/><span style={{fontSize: '10px', opacity: 0.6}}>(click to dismiss)</span>
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
        />
      )}

    </div>
  );
}