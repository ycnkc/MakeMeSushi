// src/components/SushiModal.jsx
import './Modals.css';

export default function SushiModal({ 
  isMenuLoading, sushiMenu, sushiImages, setTargetSushi, setTimeLeft, setShowSushiSelector, setIsTimerRunning 
}) {
  return (
    <div className="menu-overlay">
      <div className="sushi-modal fade-in">
        <h2>WHAT TO MAKE?</h2>
        <div className="sushi-grid">
          {isMenuLoading ? (
            <p style={{fontSize: '12px'}}>Loading sushis from DB...</p>
          ) : (
            sushiMenu.map(sushi => (
              <div 
                key={sushi.id} 
                className="sushi-card" 
                onClick={() => {
                  setTargetSushi(sushi); 
                  setTimeLeft(sushi.requiredFocusTime * 60); 
                  setShowSushiSelector(false); 
                  setIsTimerRunning(true); 
                }}
              >
                <img src={sushiImages[sushi.imagePath]} alt={sushi.name} />
                <p>{sushi.name}</p>
                <p style={{fontSize: '8px', opacity: 0.7}}>
                  ⏱️ {sushi.requiredFocusTime}m | 🪙 {sushi.coinReward}
                </p>
              </div>
            ))
          )}
        </div>
        <button className="pixel-btn logout-btn" onClick={() => setShowSushiSelector(false)}>
          CANCEL
        </button>
      </div>
    </div>
  );
}