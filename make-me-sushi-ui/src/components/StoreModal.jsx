import React, { useState, useEffect } from 'react';
import './StoreModal.css';

export default function StoreModal({ onClose, currentCoins, setCoins, sushiImages, onPurchaseSuccess }) {
  const [storeItems, setStoreItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mağaza açıldığında ürünleri çek
  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    const rawToken = localStorage.getItem('token');
    if (!rawToken) return;
    const cleanToken = rawToken.replace(/^"|"$/g, '');

    try {
      const res = await fetch('http://localhost:5008/api/Store/sushis', {
        headers: { 'Authorization': `Bearer ${cleanToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStoreItems(data);
      }
    } catch (err) {
      console.error("Mağaza yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (sushi) => {
    if (currentCoins < sushi.unlockPrice) {
      alert("Not enough coins! 🪙");
      return;
    }

    const rawToken = localStorage.getItem('token');
    const cleanToken = rawToken.replace(/^"|"$/g, '');

    try {
      const res = await fetch(`http://localhost:5008/api/Store/buy-sushi/${sushi.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${cleanToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCoins(data.newBalance); // Bakiyeyi güncelle
        fetchStoreData(); // Mağazayı yenile (buton OWNED'a dönsün)
        onPurchaseSuccess(); // App.jsx'teki ana menüyü yenilemesi için haber ver
        alert(data.message);
      } else {
        alert(await res.text());
      }
    } catch (err) {
      console.error("Satın alma hatası:", err);
    }
  };

  return (
    <div className="menu-overlay">
      <div className="store-modal fade-in">
        <div className="store-header">
          <h2>SHOP</h2>
          <button className="close-btn" onClick={onClose}>X</button>
        </div>

        {loading ? <p>Loading catalog...</p> : (
          <div className="store-grid">
            {storeItems.map((sushi) => (
              <div key={sushi.id} className={`store-card ${!sushi.isUnlocked ? 'locked' : ''}`}>
                <img 
                  src={sushiImages[sushi.imagePath]} 
                  alt={sushi.name} 
                  className={!sushi.isUnlocked ? 'locked-img' : ''} 
                />
                <p className="item-name">{sushi.name}</p>
                
                {sushi.isUnlocked ? (
                  <div className="owned-badge">OWNED</div>
                ) : (
                  <button 
                    className="buy-btn" 
                    disabled={currentCoins < sushi.unlockPrice}
                    onClick={() => handleBuy(sushi)}
                  >
                    BUY ({sushi.unlockPrice} 🪙)
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}