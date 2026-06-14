// src/components/PauseMenu.jsx
import './Modals.css';

export default function PauseMenu({ setIsMenuOpen, setIsTimerRunning, setStage, setUsername, setPassword }) {
  return (
    <div className="menu-overlay">
      <div className="menu-modal fade-in">
        <h2>PAUSE MENU</h2>
        <div className="menu-options">
          <button className="pixel-btn" onClick={() => setIsMenuOpen(false)}>RESUME</button>
          <button className="pixel-btn" onClick={() => alert("Your Sushi Collection: 🍣 🍱 (Coming Soon!)")}>SUSHIS</button>
          <button className="pixel-btn" onClick={() => alert("Total Focus Time: 00:00")}>STATS</button>
          <button className="pixel-btn logout-btn" onClick={() => {
            localStorage.removeItem('token');
            setIsMenuOpen(false);
            setIsTimerRunning(false); 
            setStage('start'); 
            setUsername('');
            setPassword('');
          }}>LOGOUT</button>
        </div>
      </div>
    </div>
  );
}