import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Sun, Fan, Lightbulb, CloudRain } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './Dashboard.css';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('temperature');
  const [currentValues, setCurrentValues] = useState({ temp: 30, hum: 50, light: 247 });
  const [devices, setDevices] = useState({ fan: false, light: false, pump: false });

  const getNowStr = (dateObj) => dateObj.toLocaleTimeString('en-GB');

  useEffect(() => {
    const now = new Date();
    const initialData = Array.from({ length: 31 }, (_, i) => ({
      time: getNowStr(new Date(now.getTime() - (30 - i) * 2000)),
      temp: 0, hum: 0, light: 0
    }));
    setData(initialData);

    const interval = setInterval(() => {
      const newTemp = +(Math.random() * (35 - 20) + 20).toFixed(1);
      const newHum = Math.floor(Math.random() * (90 - 40) + 40);
      const newLight = Math.floor(Math.random() * (1000 - 100) + 100);
      
      setCurrentValues({ temp: newTemp, hum: newHum, light: newLight });

      setData(prevData => {
        const newDataPoint = {
          time: getNowStr(new Date()),
          temp: newTemp, hum: newHum, light: newLight
        };
        return [...prevData.slice(1), newDataPoint];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleDevice = (device) => setDevices(prev => ({ ...prev, [device]: !prev[device] }));

  // Cấu hình màu sắc RỰC RỠ cho biểu đồ
  const getChartConfig = () => {
    switch (selectedSensor) {
      case 'temperature': 
        return { color: '#FF416C', colorEnd: '#FF4B2B', id: 'temp', label: 'Nhiệt độ', unit: '°C', yDomain: [10, 45] };
      case 'humidity': 
        return { color: '#00c6ff', colorEnd: '#0072ff', id: 'hum', label: 'Độ ẩm', unit: '%', yDomain: [0, 100] };
      case 'light': 
        return { color: '#F7971E', colorEnd: '#FFD200', id: 'light', label: 'Ánh sáng', unit: 'Lux', yDomain: [0, 1200] };
      default: 
        return { color: '#FF416C', colorEnd: '#FF4B2B', id: 'temp', label: 'Nhiệt độ', unit: '°C', yDomain: [0, 100] };
    }
  };
  const config = getChartConfig();

  return (
    <div className="page-layout">
      <Sidebar />
      <div className="page-content">

        {/* Cards Grid */}
        <div className="cards-grid">
          <div 
            className={`sensor-card card-temp ${selectedSensor === 'temperature' ? 'active' : ''}`}
            onClick={() => setSelectedSensor('temperature')}
          >
            <div className="card-bg-decoration"></div>
            <div className="icon-box">
              <Thermometer size={28} color="#fff" />
            </div>
            <div className="card-info">
              <span className="label">Nhiệt độ</span>
              <div className="value-box">
                {currentValues.temp} <span className="unit">°C</span>
              </div>
            </div>
          </div>

          <div 
            className={`sensor-card card-hum ${selectedSensor === 'humidity' ? 'active' : ''}`}
            onClick={() => setSelectedSensor('humidity')}
          >
            <div className="card-bg-decoration"></div>
            <div className="icon-box">
              <Droplets size={28} color="#fff" />
            </div>
            <div className="card-info">
              <span className="label">Độ ẩm</span>
              <div className="value-box">
                {currentValues.hum} <span className="unit">%</span>
              </div>
            </div>
          </div>

          <div 
            className={`sensor-card card-light ${selectedSensor === 'light' ? 'active' : ''}`}
            onClick={() => setSelectedSensor('light')}
          >
            <div className="card-bg-decoration"></div>
            <div className="icon-box">
              <Sun size={28} color="#fff" />
            </div>
            <div className="card-info">
              <span className="label">Ánh sáng</span>
              <div className="value-box">
                {currentValues.light} <span className="unit">Lux</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="main-section">
          
          {/* Chart */}
          <div className="chart-container">
            <div className="chart-header-row">
              <h3 className="section-title">Biểu đồ {config.label}</h3>
              
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 25, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={config.color} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={config.colorEnd} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="time" tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} interval={4} />
                  <YAxis domain={config.yDomain} tick={{fontSize: 12, fill: '#888'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey={config.id} 
                    stroke={config.color} 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#chartGradient)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Controls */}
          <div className="controls-container">
            <h3 className="section-title">Điều khiển</h3>
            
            <button className={`control-btn btn-fan ${devices.fan ? 'on' : ''}`} onClick={() => toggleDevice('fan')}>
              <div className="btn-icon">
                <Fan size={24} className={devices.fan ? 'spin-anim' : ''} />
              </div>
              <div className="btn-meta">
                <span className="btn-name">Quạt</span>
                <span className="btn-status">{devices.fan ? 'ĐANG CHẠY' : 'ĐÃ TẮT'}</span>
              </div>
              <div className="btn-toggle"></div>
            </button>

            <button className={`control-btn btn-pump ${devices.pump ? 'on' : ''}`} onClick={() => toggleDevice('pump')}>
              <div className="btn-icon">
                <CloudRain size={24} className={devices.pump ? 'bounce-anim' : ''} />
              </div>
              <div className="btn-meta">
                <span className="btn-name">Máy bơm</span>
                <span className="btn-status">{devices.pump ? 'ĐANG TƯỚI' : 'ĐÃ TẮT'}</span>
              </div>
              <div className="btn-toggle"></div>
            </button>

            <button className={`control-btn btn-light ${devices.light ? 'on' : ''}`} onClick={() => toggleDevice('light')}>
              <div className="btn-icon">
                <Lightbulb size={24} className={devices.light ? 'glow-anim' : ''} />
              </div>
              <div className="btn-meta">
                <span className="btn-name">Đèn</span>
                <span className="btn-status">{devices.light ? 'ĐANG SÁNG' : 'ĐÃ TẮT'}</span>
              </div>
              <div className="btn-toggle"></div>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}