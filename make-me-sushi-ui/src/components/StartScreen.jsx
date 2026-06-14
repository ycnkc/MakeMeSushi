import startButton from '../assets/start-button.png';
import './StartScreen.css';

export default function StartScreen({ setStage }) {
  return (
    <div className="fade-in start-screen">
      <div className="start-content">
        <h1 className='app-title'>make<br/>me<br/>sushi</h1>
        <div className='start-button-container' onClick={() => setStage('intro')}>
          <img src={startButton} alt="Start Button" className="button-image" />
          <h2 className='start-text'>start</h2>
        </div>
      </div>
    </div>
  );
}