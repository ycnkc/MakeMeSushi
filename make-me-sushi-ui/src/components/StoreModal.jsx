// src/components/StoreModal.jsx
import React, { useState } from 'react';
import './Modals.css';

export default function StoreModal({ 
  sushiMenu, 
  sushiImages, 
  coins, 
  setCoins, 
  unlockedSushiIds, 
  setUnlockedSushiIds, 
  setShowStore 
}) {
  const [activeTab, setActiveTab] = useState('sushi');
  // YENİ: Tarayıcı alert() yerine kendi bildirim ekranımızı kontrol edeceğimiz state
  const [notification, setNotification] = useState(null); 

  // --- SUSHİ (RECIPES) MANTIĞI ---
  const lockedSushis = sushiMenu.filter(sushi => !unlockedSushiIds.includes(sushi.id));

  const handleBuySushi = (sushi) => {
    const price = sushi.price || sushi.Price || 100; 
    const sushiId = sushi.id || sushi.Id;

    if (Number(coins) >= Number(price)) {
      setCoins(prev => Number(prev) - Number(price));
      
      setUnlockedSushiIds(prev => {
        if (!prev.includes(sushiId)) return [...prev, sushiId];
        return prev;
      });
      
      // YENİ: alert() yerine estetik bildirim
      setNotification({
        type: 'success',
        text: "You purchased a new recipe! Let's try it 🍣",
        action: 'closeStore' // Buna basılınca mağazayı kapatıp denemeye gideceğiz
      });
    } else {
      setNotification({
        type: 'error',
        text: `Not enough coins! You need ${price} 🪙`,
        action: 'closeNotification'
      });
    }
  };

  // --- DEKORASYON (DECOR) MANTIĞI ---
  const DUMMY_DECORATIONS = [
    { id: 'dec1', name: 'Paper Lantern', price: 150, icon: '🏮', desc: 'Adds a warm, cozy glow to your shop.' },
    { id: 'dec2', name: 'Bonsai Tree', price: 250, icon: '🌳', desc: 'A tiny tree for maximum zen vibes.' },
    { id: 'dec3', name: 'Golden Maneki', price: 500, icon: '🐈', desc: 'Brings immense luck and wealthy customers!' },
    { id: 'dec4', name: 'Katana Stand', price: 800, icon: '⚔️', desc: 'An honorable display piece for a true chef.' }
  ];

  const handleBuyDecoration = (decor) => {
    if (Number(coins) >= Number(decor.price)) {
      setCoins(prev => Number(prev) - Number(decor.price));
      setNotification({
        type: 'success',
        text: `You purchased ${decor.name}! Your shop looks cozier 🏮`,
        action: 'closeNotification'
      });
    } else {
      setNotification({
        type: 'error',
        text: `Not enough coins for ${decor.name}! 🪙`,
        action: 'closeNotification'
      });
    }
  };

  // Bildirim butonuna tıklandığında ne olacağını belirleyen fonksiyon
  const handleNotificationClick = () => {
    if (notification.action === 'closeStore') {
      setShowStore(false); // Yeni tarif alındıysa mağazayı kapatıp oyuna dön
    } else {
      setNotification(null); // Sadece bildirimi kapat
    }
  };

  return (
    <div className="menu-overlay" onClick={() => setShowStore(false)}>
      {/* inline CSS ile position: relative ekledik ki bildirim tam bu kutunun içine hapsolsun */}
      <div className="store-modal fade-in" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', overflow: 'hidden' }}>
        
        {/* =======================================================
            YENİ: ÖZEL BİLDİRİM (CUSTOM ALERT) OVERLAY EKRANI
        ======================================================= */}
        {notification && (
          <div className="custom-alert-overlay">
            <div className="custom-alert-box">
              <h3 style={{ color: notification.type === 'error' ? '#d32f2f' : '#2e7d32' }}>
                {notification.type === 'error' ? 'Oops!' : 'YAY!'}
              </h3>
              <p>{notification.text}</p>
              <button className="buy-btn" onClick={handleNotificationClick}>
                {notification.type === 'error' ? 'OK' : "LET'S GO"}
              </button>
            </div>
          </div>
        )}

        <div className="store-header">
          <h2>SUSHI BAR STORE</h2>
          <div className="store-coins-display">🪙{coins}</div>
        </div>

        <div className="store-tabs">
          <button 
            className={`tab-btn ${activeTab === 'sushi' ? 'active' : ''}`} 
            onClick={() => setActiveTab('sushi')}
          >
            🍙 RECIPES
          </button>
          <button 
            className={`tab-btn ${activeTab === 'decor' ? 'active' : ''}`} 
            onClick={() => setActiveTab('decor')}
          >
            🏮 DECOR
          </button>
        </div>

        {/* --- RECIPES (SUSHİ) İÇERİĞİ --- */}
        {activeTab === 'sushi' && (
          <div className="store-content-area">
            <p className="store-desc-main">Unlock new recipes to expand your menu!</p>
            {lockedSushis.length === 0 ? (
              <p className="empty-store-msg">🎉 You unlocked all recipes!</p>
            ) : (
              <div className="store-list">
                {lockedSushis.map((sushi) => (
                  <div key={sushi.id} className="store-list-item">
                    <div className="item-icon-wrapper">
                      <img src={sushiImages[sushi.imagePath]} alt={sushi.name} className="store-sushi-img locked-img" />
                    </div>
                    <div className="item-info-wrapper">
                      <p className="item-name">{sushi.name.toUpperCase()}</p>
                      <p className="item-desc">{sushi.description || 'A delicious classic recipe.'}</p>
                    </div>
                    <div className="item-action-wrapper">
                      <button className="buy-btn" onClick={() => handleBuySushi(sushi)}>
                        🪙 {sushi.price || sushi.Price || 100}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- DECOR İÇERİĞİ --- */}
        {activeTab === 'decor' && (
          <div className="store-content-area">
            <p className="store-desc-main">Decorate your shop to make it cozy!</p>
            <div className="store-list">
              {DUMMY_DECORATIONS.map((decor) => (
                <div key={decor.id} className="store-list-item">
                  <div className="item-icon-wrapper">
                    <div className="decor-icon">{decor.icon}</div>
                  </div>
                  <div className="item-info-wrapper">
                    <p className="item-name">{decor.name.toUpperCase()}</p>
                    <p className="item-desc">{decor.desc}</p>
                  </div>
                  <div className="item-action-wrapper">
                    <button className="buy-btn" onClick={() => handleBuyDecoration(decor)}>
                      🪙 {decor.price}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="pixel-btn cancel-order-btn" style={{ width: '100%', marginTop: '15px' }} onClick={() => setShowStore(false)}>
          CLOSE STORE
        </button>
      </div>
    </div>
  );
}