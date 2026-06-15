// src/components/SushiModal.jsx
import './Modals.css';

export default function SushiModal({ 
  isMenuLoading, 
  sushiMenu, 
  sushiImages, 
  setTargetSushi, 
  setTimeLeft, 
  setShowSushiSelector, 
  setIsTimerRunning,
  unlockedSushiIds // DÜZELTME 1: Eksik olan prop buraya eklendi!
}) {
  return (
    <div className="menu-overlay" onClick={() => setShowSushiSelector(false)}>
      <div className="sushi-modal fade-in" onClick={(e) => e.stopPropagation()}>
        <h2>WHAT TO MAKE?</h2>
        
        {/* DÜZELTME 2: Yanlış yorum satırı formatı düzeltildi veya silindi */}
        <div className="sushi-grid">
          {sushiMenu.map((sushi) => {
            const isUnlocked = unlockedSushiIds.includes(sushi.id);

            return (
              <div 
                key={sushi.id} 
                className={`sushi-card ${!isUnlocked ? 'sushi-card-locked' : ''}`}
                onClick={() => {
                  if (isUnlocked) {
                    setTargetSushi(sushi);
                    setTimeLeft(25 * 60); // Veya suşinin kendi süresi varsa o
                    setShowSushiSelector(false);
                    setIsTimerRunning(true);
                  }
                }}
              >
                <img 
                  src={sushiImages[sushi.imagePath]} 
                  alt={sushi.name} 
                  style={{ filter: isUnlocked ? 'none' : 'brightness(0.2) grayscale(1)' }} // Kilitliyse siyah siluet yapma hilesi
                />
                <p>{sushi.name}</p>
                {!isUnlocked && <span className="lock-badge">🔒 LOCKED</span>}
              </div>
            );
          })}
        </div>
        
        <button className="pixel-btn logout-btn" onClick={() => setShowSushiSelector(false)}>
          CANCEL
        </button>
      </div>
    </div>
  );
}