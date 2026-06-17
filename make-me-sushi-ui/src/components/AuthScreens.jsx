// src/components/AuthScreens.jsx
import { useState } from 'react';
import maneki from '../assets/maneki.png';
import manekiHappy from '../assets/maneki_happy.png';
import textBox from '../assets/textbox.png';
import nameBox from '../assets/name_box.png';
import './AuthScreens.css';

// --- ORTAK HATA POP-UP BİLEŞENİ ---
const RetroErrorPopup = ({ errorPopup, setErrorPopup }) => {
  return (
    <div 
      className={`menu-overlay modal-overlay-fade ${errorPopup.isOpen ? 'open' : 'closed'}`}
      style={{ zIndex: 9999 }} 
    >
      <div className="error-popup-box modal-box-pop" onClick={(e) => e.stopPropagation()}>
        <h2 className="error-title">! OOPS !</h2>
        <p className="error-message">{errorPopup.message}</p>
        <button 
          className="error-ok-btn"
          onClick={() => setErrorPopup({ isOpen: false, message: "" })}
        >
          UNDERSTOOD
        </button>
      </div>
    </div>
  );
};

// 1. İSİM SORMA EKRANI
export function IntroScreen({ username, setUsername, handleNameSubmit }) {
  const [errorPopup, setErrorPopup] = useState({ isOpen: false, message: "" });

  const attemptSubmit = async () => {
    if (username.trim() === "") return;
    try {
      await handleNameSubmit();
    } catch (err) {
      setErrorPopup({ isOpen: true, message: err.message });
    }
  };

  return (
    <div className="fade-in intro-screen">
      <RetroErrorPopup errorPopup={errorPopup} setErrorPopup={setErrorPopup} />
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
            key="username-input" /* Hayalet tıklamaları engellemek için anahtar */
            type="text" 
            autoFocus
            spellCheck="false"
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => { 
              if(e.key === 'Enter') { 
                e.preventDefault(); // Sızıntıyı engeller
                attemptSubmit(); 
              } 
            }}
          />
        </div>
        <p className="hint">press enter to continue</p>
      </div>
    </div>
  );
}

// 2. GİRİŞ YAPMA EKRANI
export function LoginScreen({ username, password, setPassword, handleLogin }) {
  const [errorPopup, setErrorPopup] = useState({ isOpen: false, message: "" });

  const attemptLogin = async () => {
    if (password.trim() === "") return;
    try {
      await handleLogin();
    } catch (err) {
      setErrorPopup({ 
        isOpen: true, 
        message: err.message || "Wrong password, chef! Check your ingredients." 
      });
    }
  };

  return (
    <div className="fade-in intro-screen">
      <RetroErrorPopup errorPopup={errorPopup} setErrorPopup={setErrorPopup} />
      
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
            key="login-password-input"
            type="password" 
            autoFocus
            spellCheck="false"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { 
              if(e.key === 'Enter') { 
                e.preventDefault(); 
                attemptLogin(); 
              } 
            }}
          />
        </div>
        <p className="hint pulse-hint">press enter to login</p>
      </div>
    </div>
  );
}

// 3. KAYIT OLMA EKRANI
export function RegisterScreen({ username, password, setPassword, handleRegister }) {
  const [errorPopup, setErrorPopup] = useState({ isOpen: false, message: "" });

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pwd);
  };

  const attemptRegister = async () => {
    if (password.trim() === "") return;

    if (!validatePassword(password)) {
      setErrorPopup({
        isOpen: true,
        message: "Password must be at least 8 chars, contain 1 uppercase, 1 lowercase, and 1 number!"
      });
      return; 
    }

    try {
      await handleRegister();
    } catch (err) {
      setErrorPopup({ 
        isOpen: true, 
        message: err.message || "Something went wrong with the oven! Registration failed." 
      });
    }
  };

  return (
    <div className="fade-in intro-screen">
      <RetroErrorPopup errorPopup={errorPopup} setErrorPopup={setErrorPopup} />

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
            key="register-password-input"
            type="password" 
            autoFocus
            spellCheck="false"
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { 
              if(e.key === 'Enter') { 
                e.preventDefault(); 
                attemptRegister(); 
              } 
            }}
          />
        </div>
        <p className="hint pulse-hint">press enter to register</p>
      </div>
    </div>
  );
}