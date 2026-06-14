import { useState, useEffect } from 'react';
import dingSound from './assets/ding.mp3';
import "./App.css";

// Sushi Resimleri (Bunu alt bileşenlere Props olarak yollayacağız)
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

// Bileşenlerimiz
import StartScreen from './components/StartScreen';
import { IntroScreen, LoginScreen, RegisterScreen } from './components/AuthScreens';
import Dashboard from './components/Dashboard';

const SUSHI_IMAGES = {
  "california": californiaRoll, "dragon": dragonRoll, "ebi": ebiNigiri,
  "kappa": kappaMaki, "maguro": maguroNigiri, "rainbow": rainbowRoll,
  "sake": sakeNigiri, "tamago": tamagoNigiri, "tekka": tekkaMaki, "unagi": unagiNigiri
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
  const [isMenuLoading, setIsMenuLoading] = useState(true); 

  // API'den Sushileri Çekme
  useEffect(() => {
    const fetchSushis = async () => {
      try {
        const response = await fetch('http://localhost:5008/api/Sushi'); 
        if (response.ok) {
          const data = await response.json();
          setSushiMenu(data);
        }
      } catch (error) {
        console.error("Sushiler çekilemedi:", error);
      } finally {
        setIsMenuLoading(false);
      }
    };
    fetchSushis();
  }, []);

  // Timer ve Kazanım Mantığı
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (timeLeft === 0 && targetSushi) {
      setIsTimerRunning(false);
      clearInterval(interval);
      
      const audio = new Audio(dingSound);
      audio.play().catch(e => console.log(e)); 

      const reward = targetSushi.coinReward;
      setCoins(prevCoins => prevCoins + reward);

      alert(`Ding! ${targetSushi.name} is ready! You earned ${reward} coins! 🪙`); 
      setTargetSushi(null); 
      setTimeLeft(25 * 60); 
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, targetSushi]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Auth Fonksiyonları
  const handleNameSubmit = async () => {
    if (username.trim() === "") return;
    try {
      const response = await fetch(`http://localhost:5008/api/Auth/check-user/${username.trim()}`);
      if (!response.ok) throw new Error("Network");
      const data = await response.json(); 
      if (data.exists) setStage('login'); else setStage('register'); 
    } catch (error) { alert("Backend Error"); }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5008/api/User/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), passwordHash: password })
      });
      if (response.ok) { setIsNewUser(true); setStage('dashboard'); } 
      else alert(await response.text());
    } catch (error) { console.error(error); }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5008/api/Auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), passwordHash: password })
      });
      if (response.ok) { setIsNewUser(false); setStage('dashboard'); } 
      else alert(await response.text());
    } catch (error) { console.error(error); }
  };

  return (
    <div className="game-container">
      {stage === 'start' && <StartScreen setStage={setStage} />}
      {stage === 'intro' && <IntroScreen username={username} setUsername={setUsername} handleNameSubmit={handleNameSubmit} />}
      {stage === 'login' && <LoginScreen username={username} password={password} setPassword={setPassword} handleLogin={handleLogin} />}
      {stage === 'register' && <RegisterScreen username={username} password={password} setPassword={setPassword} handleRegister={handleRegister} />}
      
      {stage === 'dashboard' && (
        <Dashboard 
          coins={coins} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} 
          setIsTimerRunning={setIsTimerRunning} setStage={setStage} setUsername={setUsername} 
          setPassword={setPassword} dashboardMode={dashboardMode} setDashboardMode={setDashboardMode} 
          isTimerRunning={isTimerRunning} timeLeft={timeLeft} formatTime={formatTime} 
          targetSushi={targetSushi} setTargetSushi={setTargetSushi} showSushiSelector={showSushiSelector} 
          setShowSushiSelector={setShowSushiSelector} isNewUser={isNewUser} username={username} 
          sushiMenu={sushiMenu} isMenuLoading={isMenuLoading} sushiImages={SUSHI_IMAGES} setTimeLeft={setTimeLeft}
        />
      )}
    </div>
  );
}

export default App;