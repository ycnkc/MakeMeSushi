// src/components/StoreModal.jsx
import React, { useState } from 'react';
import './Modals.css';
import purchaseSoundFile from '../assets/purchase-success.mp3';

export default function StoreModal({ 
  sushiMenu, decorationsMenu, sushiImages, decorImages, 
  coins, setCoins, unlockedSushiIds, setUnlockedSushiIds,
  unlockedDecorationIds, setUnlockedDecorationIds, 
  equippedDecorationIds = [], setEquippedDecorationIds, 
  setShowStore 
}) {
  const [activeTab, setActiveTab] = useState('sushi');
  const [notification, setNotification] = useState(null); 
  const [isClosing, setIsClosing] = useState(false);

  const playSuccessSound = () => {
    const audio = new Audio(purchaseSoundFile);
    audio.volume = 0.5; // Sesi çok patlamaması için yarı yarıya kısıyoruz (isteğe bağlı)
    audio.play().catch(err => console.log("Ses çalınamadı:", err));
  };
  // --- KAPANIŞ ANİMASYONU ---
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setShowStore(false), 250);
  };

  // --- SUSHİ SATIN ALMA ---
  const handleBuySushi = async (sushi) => {
    const sushiId = sushi.id || sushi.Id;
    
    // GÜNCELLEME: Sabit 100 yerine doğrudan veritabanındaki fiyatı alıyoruz
    const price = sushi.unlockPrice || sushi.UnlockPrice || sushi.price || sushi.Price; 
    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');

    if (Number(coins) < Number(price)) {
      setNotification({ type: 'error', text: `Not enough coins!`, action: 'closeNotification' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5008/api/Store/buy-sushi/${sushiId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setCoins(data.newBalance);
        setUnlockedSushiIds(prev => [...prev, sushiId]);
        setNotification({ type: 'success', text: `Unlocked ${sushi.name || sushi.Name}!`, action: 'closeNotification' });
        playSuccessSound();
      }
    } catch (err) { console.error(err); }
  };

  // --- DEKORASYON SATIN ALMA ---
  const handleBuyDecoration = async (decor) => {
    const decorId = decor.id || decor.Id;
    const price = decor.price || decor.Price;
    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');

    if (Number(coins) < Number(price)) {
      setNotification({ type: 'error', text: `Not enough coins!`, action: 'closeNotification' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5008/api/Store/buy-decoration/${decorId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setCoins(data.newBalance);
        setUnlockedDecorationIds(prev => [...prev, decorId]);
        setNotification({ type: 'success', text: `Purchased ${decor.name || decor.Name}!`, action: 'closeNotification' });
        playSuccessSound();
      }
    } catch (err) { console.error(err); }
  };

  // --- DEKORASYON TAK/ÇIKAR (TOGGLE) ---
  const handleToggleDecoration = async (decor) => {
    const decorId = decor.id || decor.Id;
    const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');

    try {
      const response = await fetch(`http://localhost:5008/api/Store/toggle-decoration/${decorId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isEquipped) {
          setEquippedDecorationIds(prev => [...prev, decorId]); // Listeye ekle
        } else {
          setEquippedDecorationIds(prev => prev.filter(id => id !== decorId)); // Listeden çıkar
        }
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className={`menu-overlay ${isClosing ? 'fade-out' : ''}`} onClick={handleClose}>
      <div className={`store-modal ${isClosing ? 'pop-out' : 'fade-in'}`} onClick={(e) => e.stopPropagation()}>
        
        {/* --- BİLDİRİM EKRANI --- */}
        {notification && (
          <div className="custom-alert-overlay">
            <div className="custom-alert-box">
              <h3>{notification.type === 'error' ? 'Oops!' : 'YAY!'}</h3>
              <p>{notification.text}</p>
              <button className="buy-btn ok-btn" onClick={() => setNotification(null)}>OK</button>
            </div>
          </div>
        )}

        <div className="store-header">
          <h2>SUSHI BAR STORE</h2>
          <div className="store-coins-display">🪙 {coins}</div>
        </div>

        <div className="store-tabs">
          <button className={`tab-btn ${activeTab === 'sushi' ? 'active' : ''}`} onClick={() => setActiveTab('sushi')}>RECIPES</button>
          <button className={`tab-btn ${activeTab === 'decor' ? 'active' : ''}`} onClick={() => setActiveTab('decor')}>DECOR</button>
        </div>

        {/* ==========================================
            SUSHİ (RECIPES) SEKMESİ
        ========================================== */}
        {activeTab === 'sushi' && (
          <div className="store-content-area">
            {sushiMenu.filter(s => !unlockedSushiIds.includes(s.id || s.Id)).length === 0 ? (
              <p className="empty-store-msg">🎉 You unlocked all recipes!</p>
            ) : (
              <div className="store-list">
                {sushiMenu.filter(s => !unlockedSushiIds.includes(s.id || s.Id)).map((sushi) => (
                  <div key={sushi.id || sushi.Id} className="store-list-item">
                    <div className="item-icon-wrapper">
                      <img src={sushiImages[sushi.imagePath || sushi.ImagePath]} alt={sushi.name} className="store-sushi-img" />
                    </div>
                    <div className="item-info-wrapper">
                      <p className="item-name">{(sushi.name || sushi.Name).toUpperCase()}</p>
                      <p className="item-desc">{sushi.description || 'A delicious sushi recipe.'}</p>
                    </div>
                    <div className="item-action-wrapper">
                      <button className="buy-btn" onClick={() => handleBuySushi(sushi)}>
                        {/* GÜNCELLEME: Fiyatı ekrana doğru basıyoruz */}
                        🪙 {sushi.unlockPrice || sushi.UnlockPrice || sushi.price || sushi.Price}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            DEKORASYON (DECOR) SEKMESİ
        ========================================== */}
        {activeTab === 'decor' && (
          <div className="store-content-area">
            <div className="store-list">
              {/* Dekorasyonların HEPSİNİ listeliyoruz ki takıp çıkarabilelim */}
              {decorationsMenu?.map((decor) => {
                const decorId = decor.id || decor.Id;
                const isUnlocked = unlockedDecorationIds.includes(decorId);
                const isEquipped = equippedDecorationIds.includes(decorId);

                return (
                  <div key={decorId} className="store-list-item">
                    <div className="item-icon-wrapper">
                      <img src={decorImages[decor.imagePath || decor.ImagePath]} alt={decor.name} className="decor-image-style" />
                    </div>
                    <div className="item-info-wrapper">
                      <p className="item-name">{(decor.name || decor.Name).toUpperCase()}</p>
                      <p className="item-desc">Type: {decor.type || decor.Type}</p>
                    </div>
                    <div className="item-action-wrapper">
                      
                      {!isUnlocked ? (
                        // 1. DURUM: Satın Alınmamış
                        <button className="buy-btn" onClick={() => handleBuyDecoration(decor)}>
                          🪙 {decor.price || decor.Price}
                        </button>
                      ) : (
                        // 2. DURUM: Satın Alınmış (TAK / ÇIKAR MANTIĞI)
                        <button 
                          className="buy-btn" 
                          onClick={() => handleToggleDecoration(decor)}
                          style={{ 
                            backgroundColor: isEquipped ? '#f44336' : '#4caf50', 
                            borderColor: '#2d2a2e',
                            minWidth: '85px'
                          }}
                        >
                          {isEquipped ? 'REMOVE' : 'EQUIP'}
                        </button>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <button className="custom-pixel-btn close-store-btn" onClick={handleClose}>CLOSE STORE</button>
      </div>
    </div>
  );
}