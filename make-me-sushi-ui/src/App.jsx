// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import dingSound from './assets/ding.mp3';
import "./App.css";

// --- SUSHİ RESİMLERİ ---
import californiaRoll from './assets/california-roll.png';
import dragonRoll from './assets/dragon-roll.png';
import ebiNigiri from './assets/ebi-nigiri.png';
import kappaMaki from './assets/kappa-maki.png';
import maguroNigiri from './assets/maguro-nigiri.png';
import rainbowRoll from './assets/rainbow-roll.png';
import sakeNigiri from './assets/sake-nigiri.png';
import tamagoNigiri from './assets/tamago-nigiri.png';
import tekkaMaki from './assets/tekka-maki.png';
import unagiNigiri from './assets/unagi-nigiri.png';

// --- DEKORASYON RESİMLERİ ---
import decorBamboo from './assets/decoration_bamboo.png';
import decorBanner from './assets/decoration_banner.png';
import decorChairs from './assets/decoration_chairs_table.png';
import decorKatana from './assets/decoration_katana.png';
import decorLights1 from './assets/decoration_lights1.png';
import decorLights2 from './assets/decoration_lights2.png';
import decorLights3 from './assets/decoration_lights3.png';
import decorSakura from './assets/decoration_sakura_painting.png';
import bgGreen from './assets/bg_dashboard_green.png';
import bgPink from './assets/bg_dashboard_pink.png';

// Bileşenler
import StartScreen from './components/StartScreen';
import { IntroScreen, LoginScreen, RegisterScreen } from './components/AuthScreens';
import Dashboard from './components/Dashboard';

const SUSHI_IMAGES = {
  "california": californiaRoll, "dragon": dragonRoll, "ebi": ebiNigiri,
  "kappa": kappaMaki, "maguro": maguroNigiri, "rainbow": rainbowRoll,
  "sake": sakeNigiri, "tamago": tamagoNigiri, "tekka": tekkaMaki, "unagi": unagiNigiri
};

const DECOR_IMAGES = {
  'decoration_bamboo.png': decorBamboo,
  'decoration_banner.png': decorBanner,
  'decoration_chairs_table.png': decorChairs,
  'decoration_katana.png': decorKatana,
  'decoration_lights1.png': decorLights1,
  'decoration_lights2.png': decorLights2,
  'decoration_lights3.png': decorLights3,
  'decoration_sakura_painting.png': decorSakura,
  'bg_dashboard_green.png': bgGreen,
  'bg_dashboard_pink.png': bgPink
};

function App() {
  const [stage, setStage] = useState('start');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [isNewUser, setIsNewUser] = useState(false); 
  const [dashboardMode, setDashboardMode] = useState('dialogue'); 
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isTimerRunning, setIsTimerRunning] = useState(false); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSushiSelector, setShowSushiSelector] = useState(false); 
  const [targetSushi, setTargetSushi] = useState(null); 
  const [coins, setCoins] = useState(0);
  const [sushiMenu, setSushiMenu] = useState([]); 
  const [unlockedSushiIds, setUnlockedSushiIds] = useState([1, 2]);
  const [isMenuLoading, setIsMenuLoading] = useState(true); 
  const [decorationsMenu, setDecorationsMenu] = useState([]);
  const [unlockedDecorationIds, setUnlockedDecorationIds] = useState([]);
  const [equippedDecorationIds, setEquippedDecorationIds] = useState([]);
  const [showStore, setShowStore] = useState(false);

  // --- VERİLERİ YÜKLEME ---
useEffect(() => {
    const fetchAllData = async () => {
      try {
        const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' 
        };

        const [sushiRes, decorRes, userDecorRes, statsRes] = await Promise.all([
          fetch('http://localhost:5008/api/Store/sushis', { headers }),
          fetch('http://localhost:5008/api/Store', { headers }),
          fetch('http://localhost:5008/api/User/my-decorations', { headers }),
          fetch('http://localhost:5008/api/User/stats', { headers })
        ]);

        // 1. SUSHİLER (Eski listeye ekleme YAPMA, direkt sıfırdan ez)
        if (sushiRes.ok) {
          const sData = await sushiRes.json();
          setSushiMenu(sData);
          const unlockedIds = sData.filter(s => s.isUnlocked || s.IsUnlocked).map(s => s.id || s.Id);
          // 'prev' kullanmıyoruz. Sadece default 1,2 ve backendden gelenleri koyuyoruz:
          setUnlockedSushiIds([...new Set([1, 2, ...unlockedIds])]); 
        }

        // 2. DEKORASYON MENÜSÜ
        if (decorRes.ok) setDecorationsMenu(await decorRes.json());

        // 3. KULLANICININ DEKORASYONLARI
        if (userDecorRes.ok) {
          const uData = await userDecorRes.json();
          if (uData && uData.length > 0) {
            setUnlockedDecorationIds(uData.map(d => d.decorationId || d.DecorationId));
            setEquippedDecorationIds(uData.filter(d => d.isEquipped || d.IsEquipped).map(d => d.decorationId || d.DecorationId));
          } else {
            // 🚀 EĞER YENİ KULLANICIYSA VE DEKORU YOKSA, ESKİ KULLANICININ EŞYALARINI SIFIRLA!
            setUnlockedDecorationIds([]);
            setEquippedDecorationIds([]);
          }
        }

        // 4. KULLANICI COINLERİ
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setCoins(statsData.currentCoins || 0); // Para yoksa 0 yap
        }
          
      } catch (error) { console.error("Veri yükleme hatası:", error); }
      finally { setIsMenuLoading(false); }
    };

    if (stage === 'dashboard') {
      fetchAllData();
    } else {
      // 🚀 KULLANICI ÇIKIŞ YAPTIĞINDA VEYA START EKRANINDAYKEN UYGULAMAYI TEMİZLE
      setUnlockedSushiIds([1, 2]);
      setUnlockedDecorationIds([]);
      setEquippedDecorationIds([]);
      setCoins(0);
    }
  }, [stage]);
  // --- TIMER MANTIĞI ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } 
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // --- AUTH FONKSİYONLARI ---
  const handleNameSubmit = async () => {
    if (username.trim() === "") return;
    const response = await fetch(`http://localhost:5008/api/Auth/check-user/${username.trim()}`);
    if (response.ok) {
      const data = await response.json(); 
      if (data.exists) setStage('login'); else setStage('register'); 
    } else {
      // Alert sildik, yerine hata fırlatıyoruz!
      throw new Error("Server is sleeping! Cannot connect.");
    }
  };

  const handleRegister = async () => {
    const response = await fetch('http://localhost:5008/api/Auth/register', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), passwordHash: password })
    });
    
    if (response.ok) { 
      setIsNewUser(true); 
      await handleLogin(); 
    } else {
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed");
    }
  };

  const handleLogin = async () => {
    const response = await fetch('http://localhost:5008/api/Auth/login', {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), passwordHash: password })
    });
    
    if (response.ok) {
      localStorage.setItem('token', await response.text()); 
      setStage('dashboard');
    } else {
      const errorText = await response.text();
      throw new Error(errorText || "Login failed");
    }
  };

  return (
    <div className="game-container">
      {stage === 'start' && <StartScreen setStage={setStage} />}
      {stage === 'intro' && <IntroScreen username={username} setUsername={setUsername} handleNameSubmit={handleNameSubmit} />}
      {stage === 'login' && <LoginScreen username={username} password={password} setPassword={setPassword} handleLogin={handleLogin} />}
      {stage === 'register' && <RegisterScreen username={username} password={password} setPassword={setPassword} handleRegister={handleRegister} />}
      
      {stage === 'dashboard' && (
        <Dashboard 
          coins={coins} setCoins={setCoins} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} 
          setIsTimerRunning={setIsTimerRunning} setStage={setStage} setUsername={setUsername} 
          setPassword={setPassword} dashboardMode={dashboardMode} setDashboardMode={setDashboardMode} 
          isTimerRunning={isTimerRunning} timeLeft={timeLeft} formatTime={(s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`} 
          targetSushi={targetSushi} setTargetSushi={setTargetSushi} showSushiSelector={showSushiSelector} 
          setShowSushiSelector={setShowSushiSelector} isNewUser={isNewUser} username={username} 
          sushiMenu={sushiMenu} isMenuLoading={isMenuLoading} sushiImages={SUSHI_IMAGES} setTimeLeft={setTimeLeft}
          showStore={showStore} setShowStore={setShowStore}
          unlockedSushiIds={unlockedSushiIds} setUnlockedSushiIds={setUnlockedSushiIds}
          decorationsMenu={decorationsMenu} decorImages={DECOR_IMAGES}
          unlockedDecorationIds={unlockedDecorationIds} setUnlockedDecorationIds={setUnlockedDecorationIds}
          equippedDecorationIds={equippedDecorationIds} setEquippedDecorationIds={setEquippedDecorationIds}
        />
      )}
    </div>
  );
}

export default App;