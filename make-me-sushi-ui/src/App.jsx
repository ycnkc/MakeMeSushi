import startButton from './assets/start-button.png';
import maneki from './assets/maneki.png';
import manekiHappy from './assets/maneki_happy.png';
import textBox from './assets/textbox.png';
import nameBox from './assets/name_box.png';
import futomakiIcon from './assets/futomaki.png';
import timerClock from './assets/clock.png'; 
import { useState, useEffect } from 'react';
import "./App.css";

function App() {
  const [stage, setStage] = useState('start');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [isNewUser, setIsNewUser] = useState(false); 

  const [dashboardMode, setDashboardMode] = useState('dialogue'); 
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isTimerRunning, setIsTimerRunning] = useState(false); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    let interval = null;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      clearInterval(interval);
      
      alert("Pomodoro tamamlandı! Yeni bir sushi kazandın! Maneki seni bekliyor."); 
    }
    
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleNameSubmit = async () => {
    if (username.trim() === "") return;
    try {
      const response = await fetch(`http://localhost:5008/api/Auth/check-user/${username.trim()}`);
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json(); 

      if (data.exists) {
        setStage('login'); 
      } else {
        setStage('register'); 
      }
    } catch (error) {
      console.error("Backend API'ye ulaşılamadı:", error);
      alert("Maneki veritabanına bağlanamıyor. Backend çalışıyor mu?");
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:5008/api/User/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), passwordHash: password })
      });

      if (response.ok) {
        setIsNewUser(true); 
        setStage('dashboard'); 
      } else {
        const errorMessage = await response.text();
        alert(`.NET hatası: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Register hatası:", error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5008/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), passwordHash: password })
      });

      if (response.ok) {
        setIsNewUser(false); 
        setStage('dashboard'); 
      } else {
        const errorMessage = await response.text();
        alert(`.NET'in Cevabı: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Login hatası:", error);
    }
  };

  return (
    <div className="game-container">
      
      {/* 1. START */}
      {stage === 'start' && (
        <div className="fade-in start-screen">
          <div className="start-content">
            <h1 className='app-title'>make<br/>me<br/>sushi</h1>
            <div className='start-button-container' onClick={() => setStage('intro')}>
              <img src={startButton} alt="Start Button" className="button-image" />
              <h2 className='start-text'>start</h2>
            </div>
          </div>
        </div>
      )}
      
      {/* 2. INTRO */}
      {stage === 'intro' && (
        <div className="fade-in intro-screen">
          <div className="dialogue-row">
            <img id="maneki" src={maneki} alt="Maneki-neko" />
            <div className="text-box-wrapper">
              <img id="text-box" src={textBox} alt="Speech Bubble" />
              <h2 className="intro-text">
                I haven't seen you<br/>around before...<br/>Who are you?
              </h2>
            </div>
          </div>
          <div className="input-row">
            <h1 className="input-title">What's your name?</h1>
            <div className="name-box-wrapper">
              <img id="name-box" src={nameBox} alt="Input Box" />
              <input 
                type="text" 
                spellCheck="false"
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter') {
                    handleNameSubmit();
                  }
                }}
              />
            </div>
            <p className="hint">press enter to continue</p>
          </div>
        </div>
      )}

      {/* 3. LOGIN */}
      {stage === 'login' && (
        <div className="fade-in intro-screen">
          <div className="dialogue-row">
            <img id="maneki" src={manekiHappy} alt="Maneki-neko Happy" />
            <div className="text-box-wrapper">
              <img id="text-box" src={textBox} alt="Speech Bubble" />
              <h2 className="intro-text">
                Oh hello {username.toUpperCase()}. <br/>I didn't recognize you for a second there.
              </h2>
            </div>
          </div>
          <div className="input-row">
            <h1 className="input-title">Enter your password:</h1>
            <div className="name-box-wrapper">
              <img id="name-box" src={nameBox} alt="Input Box" />
              <input 
                type="password" 
                spellCheck="false"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && password.trim() !== "") {
                    handleLogin();
                  }
                }}
              />
            </div>
            <p className="hint pulse-hint">press enter to login</p>
          </div>
        </div>
      )}

      {/* 4. REGISTER  */}
      {stage === 'register' && (
        <div className="fade-in intro-screen">
          <div className="dialogue-row">
            <img id="maneki" src={manekiHappy} alt="Maneki-neko Happy" />
            <div className="text-box-wrapper">
              <img id="text-box" src={textBox} alt="Speech Bubble" />
              <h2 className="intro-text">
                Oh hello {username.toUpperCase()}! I'm maneki.<br/>
                I didn't know you were the new sushi chef.
              </h2>
            </div>
          </div>
          <div className="input-row">
            <h1 className="input-title">Choose a password:</h1>
            <div className="name-box-wrapper">
              <img id="name-box" src={nameBox} alt="Input Box" />
              <input 
                type="password" 
                spellCheck="false"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if(e.key === 'Enter' && password.trim() !== "") {
                    handleRegister();
                  }
                }}
              />
            </div>
            <p className="hint pulse-hint">press enter to register</p>
          </div>
        </div>
      )}

      {/* 5. DASHBOARD */}
      {stage === 'dashboard' && (
        <div className="fade-in dashboard-screen">
          
          {/* --- menu button --- */}
          <div className="menu-button" onClick={() => setIsMenuOpen(true)}>
            <img src={futomakiIcon} alt="Menu" className="menu-icon-img" />
          </div>

          {/* --- modal --- */}
          {isMenuOpen && (
            <div className="menu-overlay">
              <div className="menu-modal fade-in">
                <h2>PAUSE MENU</h2>
                <div className="menu-options">
                  
                  {/* 1. RESUME  */}
                  <button className="pixel-btn" onClick={() => setIsMenuOpen(false)}>
                    RESUME
                  </button>

                  {/* 2. SUSHIS  */}
                  <button className="pixel-btn" onClick={() => alert("Your Sushi Collection: 🍣 🍱 (Coming Soon!)")}>
                    SUSHIS
                  </button>

                  {/* 3. STATS  */}
                  <button className="pixel-btn" onClick={() => alert("Total Focus Time: 00:00")}>
                    STATS
                  </button>

                  {/* 4. LOGOUT  */}
                  <button className="pixel-btn logout-btn" onClick={() => {
                    setIsMenuOpen(false);
                    setIsTimerRunning(false); 
                    setStage('start'); 
                    setUsername('');
                    setPassword('');
                  }}>
                    LOGOUT
                  </button>

                </div>
              </div>
            </div>
          )}

          {/* column layout */}
          <div className="dashboard-right-column">
              
              {/* 1. TIMER SECTION */}
              {dashboardMode === 'focus' && (
                <div className="dashboard-timer-section fade-in">
                    <div className="dashboard-clock-wrapper" onClick={() => setIsTimerRunning(!isTimerRunning)}>
                      <img id="timer-clock-image" src={timerClock} alt="Timer Clock Image" />
                      <h1 className="digital-clock-text">{formatTime(timeLeft)}</h1>
                    </div>
                    
                    <p className="hint pulse-hint">
                        {isTimerRunning ? "click to pause" : "click to start focusing"}
                    </p>
                </div>
              )}

              <div 
                  className="dialogue-maneki-row" 
                  onClick={() => { if(dashboardMode === 'dialogue') setDashboardMode('focus'); }}
                  style={{ cursor: dashboardMode === 'dialogue' ? 'pointer' : 'default' }}
              >
                {dashboardMode === 'dialogue' && (
                  <div className="text-box-wrapper fade-in-bubble">
                    <img id="text-box" src={textBox} alt="Speech Bubble" />
                    <h2 className="intro-text">
                      {isNewUser 
                        ? "This is your counter. You can start working by clicking on the clock." 
                        : `Welcome back, ${username.toUpperCase()}! Ready to make some sushi?`}
                      <br/><br/>
                      <span style={{fontSize: '10px', opacity: 0.6}}>(click to dismiss)</span>
                    </h2>
                  </div>
                )}
                
                <img id="maneki-dashboard" src={manekiHappy} alt="Maneki-neko Happy" />
              </div>

          </div>
        </div>
      )}
      
    </div>
  );
}

export default App;