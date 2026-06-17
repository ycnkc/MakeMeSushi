import React, { useState, useEffect, useRef } from 'react';
import './Modals.css';

export default function MusicPlayer({ musicFiles, showMusicModal, setShowMusicModal }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef(new Audio());

  // Müzik Çalma Mantığı
  useEffect(() => {
    const audio = audioRef.current;
    audio.src = musicFiles[currentTrack];
    audio.loop = true;
    
    if (isPlaying) {
      audio.play().catch(e => console.log("Müzik çalma hatası:", e));
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying, musicFiles]);

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
        setIsPlaying(true);
      }}
    >
      {/* Yazı ve butonun sol tarafta durması için */}
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

        <button className="carousel-close-text " onClick={() => setShowMusicModal(false)}>
          [ CLOSE ]
        </button>
      </div>
    </div>
  );
}