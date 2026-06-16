// src/components/StatsModal.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import arrowImg from '../assets/arrow.png'; 
import './Modals.css'; 

export default function StatsModal({ setShowStats, sushiImages }) {
  const [isClosing, setIsClosing] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0); 
  
  // Gerçek veriler için state'ler
  const [weeklyData, setWeeklyData] = useState([]);
  const [todaySushis, setTodaySushis] = useState([]);
  const [summary, setSummary] = useState({ today: 0, month: 0, total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setShowStats(false), 250);
  };

  const nextSlide = () => setActiveSlide((prev) => (prev === 0 ? 1 : 0));
  const prevSlide = () => setActiveSlide((prev) => (prev === 1 ? 0 : 1));

  // Veritabanından istatistikleri çekme
  useEffect(() => {
    const fetchStatsData = async () => {
      const token = localStorage.getItem('token')?.replace(/^"|"$/g, '');
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:5008/api/User/stats', {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Backend'den gelen verileri state'lere dağıtıyoruz
          setWeeklyData(data.weeklyChart || []);
          setTodaySushis(data.todaySushis || []);
          setSummary({
            today: data.todayMinutes || 0,
            month: data.monthMinutes || 0,
            total: data.totalMinutes || 0
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="stats-tooltip">
          <p className="tooltip-label">{`${payload[0].value} mins`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`menu-overlay ${isClosing ? 'fade-out' : ''}`} onClick={handleClose}>
      <div className={`stats-modal ${isClosing ? 'pop-out' : 'fade-in'}`} onClick={(e) => e.stopPropagation()}>
        
        {/* CAROUSEL HEADER */}
        <div className="carousel-header">
          <button className="custom-arrow-btn" onClick={prevSlide}>
            <img src={arrowImg} alt="Previous" style={{ transform: 'scaleX(-1)' }} />
          </button>
          <h2>{activeSlide === 0 ? "FOCUS STATS" : "TODAY'S KITCHEN"}</h2>
          <button className="custom-arrow-btn" onClick={nextSlide}>
            <img src={arrowImg} alt="Next" />
          </button>
        </div>

        {/* YÜKLENİYOR EKRANI */}
        {isLoading ? (
          <div className="slide-content" style={{ justifyContent: 'center', alignItems: 'center' }}>
            <p className="empty-log-msg">Loading data...</p>
          </div>
        ) : (
          <div className="carousel-content-wrapper">
            
            {/* SLAYT 0: GRAFİKLER VE ÖZETLER */}
            {activeSlide === 0 && (
              <div className="slide-content fade-in">
                <div className="stats-summary-row">
                  <div className="stat-box">
                    <span className="stat-title">TODAY</span>
                    <span className="stat-value">{summary.today}<small>m</small></span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-title">MONTH</span>
                    <span className="stat-value">{summary.month}<small>m</small></span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-title">TOTAL</span>
                    <span className="stat-value">{summary.total}<small>m</small></span>
                  </div>
                </div>

                <div className="stats-chart-container">
                  <h3 className="chart-title">LAST 7 DAYS</h3>
                  <div style={{ width: '100%', height: 180 }}>
                    <ResponsiveContainer>
                      <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="day" stroke="#8c7a65" tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <YAxis stroke="#8c7a65" tick={{fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(201, 168, 124, 0.2)'}} />
                        <Bar dataKey="minutes" fill="#4caf50" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* SLAYT 1: BUGÜN YAPILAN SUSHİLER */}
            {/* SLAYT 1: BUGÜN YAPILAN SUSHİLER */}
{activeSlide === 1 && (
  <div className="slide-content fade-in">
    <div className="sushi-log-list">
      {todaySushis.length === 0 ? (
        <p className="empty-log-msg">You haven't made any sushi today yet!</p>
      ) : (
        todaySushis.map((item, idx) => {
          // Değişkenleri burada güvenle tanımlıyoruz
          const path = item.imagePath || item.ImagePath;
          const name = item.name || item.Name;
          const count = item.count || item.Count;

          return (
            <div key={item.id || idx} className="sushi-log-item">
              <div className="sushi-log-icon-bg">
                <img 
                  src={sushiImages[path] || ''} 
                  alt={name} 
                  className="sushi-log-img" 
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="sushi-log-info">
                <p className="sushi-log-name">{name}</p>
              </div>
              <div className="sushi-log-multiplier">
                x{count}
              </div>
            </div>
          );
        })
      )}
    </div>
  </div>
)}

          </div>
        )}

        <button className="custom-pixel-btn cancel-btn close-stats-btn" onClick={handleClose} style={{ marginTop: '25px', width: '120px' }}>
          CLOSE
        </button>

      </div>
    </div>
  );
}