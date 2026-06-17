import React, { useState, useEffect, useRef } from 'react';
import './Modals.css';

export default function MusicPlayer({ musicFiles, showMusicModal, setShowMusicModal }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef(new Audio());

  // 1. SADECE ŞARKI DEĞİŞTİĞİNDE ÇALIŞIR
  // (Timer yüzünden her saniye src'nin sıfırlanmasını engeller)
  useEffect(() => {
    const audio = audioRef.current;
    audio.src = musicFiles[currentTrack];
    audio.loop = true;
    
    // Şarkıyı değiştirdiğimizde müzik zaten açıksa yeni şarkıyı direkt çalmaya başlasın
    if (isPlaying) {
      audio.play().catch(e => console.log("Müzik çalma hatası:", e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack]); // SADECE currentTrack değişirse tetiklenir!

  // 2. SADECE PLAY/PAUSE DURUMUNDA ÇALIŞIR
  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.play().catch(e => console.log("Müzik çalma hatası:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Modal Kapalıyken hiçbir şey render etme (Sadece müzik çalar arkada)
  if (!showMusicModal) return null;

  return (
    <div className="menu-overlay" onClick={() => setShowMusicModal(false)}>
      <div className="music-modal-box fade-in" onClick={(e) => e.stopPropagation()}>
        <h2 className="carousel-title">SELECT VIBE</h2>
        
        <div className="music-selection-list">
          {musicFiles.map((_, index) => (
            <button 
              key={index} 
              className={`music-track-btn ${currentTrack === index && isPlaying ? 'active-track' : ''}`}
              onClick={() => {
                setCurrentTrack(index);
                setIsPlaying(true); // Şarkıya tıklandığı an otomatik çalmaya başla
              }}
            >
              <span className="track-label">
                {currentTrack === index && isPlaying ? '🔊 ' : '🎵 '} LOFI TRACK {index + 1}
              </span>
            </button>
          ))}
          
          <hr className="music-divider" />
          
          <button 
            className="custom-pixel-btn stop-btn" 
            onClick={() => setIsPlaying(false)}
          >
            {isPlaying ? "STOP MUSIC" : "MUSIC STOPPED"}
          </button>
        </div>

        <button className="carousel-close-text" onClick={() => setShowMusicModal(false)}>
          [ CLOSE ]
        </button>
      </div>
    </div>
  );
}