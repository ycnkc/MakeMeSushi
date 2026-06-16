// src/components/AuthScreens.jsx
import maneki from '../assets/maneki.png';
import manekiHappy from '../assets/maneki_happy.png';
import textBox from '../assets/textbox.png';
import nameBox from '../assets/name_box.png';
import './AuthScreens.css';

// 1. İSİM SORMA EKRANI
export function IntroScreen({ username, setUsername, handleNameSubmit }) {
  return (
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
            onKeyDown={(e) => { if(e.key === 'Enter') handleNameSubmit(); }}
          />
        </div>
        <p className="hint">press enter to continue</p>
      </div>
    </div>
  );
}

// 2. GİRİŞ YAPMA EKRANI
export function LoginScreen({ username, password, setPassword, handleLogin }) {
  return (
    <div className="fade-in intro-screen">
      <div className="dialogue-row">
        <img id="maneki" src={manekiHappy} alt="Maneki-neko Happy" />
        <div className="text-box-wrapper">
          <img id="text-box" src={textBox} alt="Speech Bubble" />
          <h2 className="intro-text">
            Oh hello {username}. <br/>I didn't recognize you for a second there.
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
            onKeyDown={(e) => { if(e.key === 'Enter' && password.trim() !== "") handleLogin(); }}
          />
        </div>
        <p className="hint pulse-hint">press enter to login</p>
      </div>
    </div>
  );
}

// 3. KAYIT OLMA EKRANI
export function RegisterScreen({ username, password, setPassword, handleRegister }) {
  return (
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
            onKeyDown={(e) => { if(e.key === 'Enter' && password.trim() !== "") handleRegister(); }}
          />
        </div>
        <p className="hint pulse-hint">press enter to register</p>
      </div>
    </div>
  );
}