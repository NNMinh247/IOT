import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Droplets, Sun, Fan, Lightbulb, CloudRain } from 'lucide-react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { io } from 'socket.io-client';
import './Dashboard.css';

const socket = io('http://localhost:5000');

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('temperature');
  const [currentValues, setCurrentValues] = useState({ temp: 0, hum: 0, light: 0 });
  
  const [devices, setDevices] = useState({ fan: false, pump: false ,light: false });
  const [loadingDevices, setLoadingDevices] = useState({ fan: false, pump: false, light: false });

  const getNowStr = (dateObj) => dateObj.toLocaleTimeString('en-GB');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/sensors/data?limit=90&sortKey=time&sortDir=desc');
        const result = await res.json();

        if (result.success && result.data.length > 0) {
          const groupedData = {};

          result.data.forEach(item => {
            const d = new Date(item.time);
            const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

            if (!groupedData[timeStr]) {
              groupedData[timeStr] = { time: timeStr, temp: 0, hum: 0, light: 0 };
            }

            if (item.name.toLowerCase().includes('nhiệt')) groupedData[timeStr].temp = item.value;
            else if (item.name.toLowerCase().includes('ẩm')) groupedData[timeStr].hum = item.value;
            else if (item.name.toLowerCase().includes('sáng')) groupedData[timeStr].light = item.value;
          });

          const chartData = Object.values(groupedData).reverse();
          const finalData = chartData.slice(-30);
          
          setData(finalData);

          if (finalData.length > 0) {
            const latest = finalData[finalData.length - 1];
            setCurrentValues({ temp: latest.temp, hum: latest.hum, light: latest.light });
          }
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu ban đầu:', error);
      }
    };
    fetchInitialData();

    const fetchDeviceStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/devices/status');
        const result = await res.json();
        if (result.success) setDevices(result.data);
      } catch (err) { console.error(err); }
    };
    fetchDeviceStatus();

    socket.on('device_timeout', (data) => {
        alert(data.message);
        setLoadingDevices(prev => ({ ...prev, [data.device]: false }));
    });

    socket.on('update_dashboard', (newDataPoint) => {
      setCurrentValues({
        temp: newDataPoint.temp,
        hum: newDataPoint.hum,
        light: newDataPoint.light
      });

      setData(prevData => {
        const updatedData = [...prevData, newDataPoint];
        return updatedData.length > 30 ? updatedData.slice(1) : updatedData;
      });
    });

    socket.on('device_status_update', (response) => {
      setDevices({
        fan: response.led1 === "ON",
        pump: response.led2 === "ON",
        light: response.led3 === "ON"
      });
      setLoadingDevices({ fan: false, pump: false, light: false });
    });

    return () => {
      socket.off('update_dashboard');
      socket.off('device_status_update');
      socket.off('device_timeout');
    };
  }, []);

  const handleDeviceControl = async (deviceName, deviceId) => {
    if (loadingDevices[deviceName]) return;
    setLoadingDevices(prev => ({ ...prev, [deviceName]: true}));

    const currentStatus = devices[deviceName];
    const actionToSend = currentStatus ? 'Tắt' : 'Bật';

    try {
      const res = await fetch('http://localhost:5000/api/devices/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId, action: actionToSend })
      });
      const result = await res.json();

      if (!result.success) {
        alert('Có lỗi xảy ra khi gửi lệnh!');
        setLoadingDevices({ ...prev, [deviceName]: false});
      }

    }
    catch (error) {
      console.error(error);
      setLoadingDevices(prev => ({ ...prev, [deviceName]: false }));
    }
  };
  
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
            
            <button 
              className={`control-btn btn-fan ${devices.fan ? 'on' : ''} ${loadingDevices.fan ? 'is-waiting' : ''}`} 
              onClick={() => handleDeviceControl('fan', 1)}
            >
              <div className="btn-icon">
                <Fan size={24} className={devices.fan && !loadingDevices.fan ? 'spin-anim' : ''} />
              </div>
              <div className="btn-meta">
                <span className="btn-name">Quạt</span>
                <span className="btn-status">
                  {loadingDevices.fan ? 'ĐANG CHỜ...' : devices.fan ? 'ĐANG CHẠY' : 'ĐÃ TẮT'}
                </span>
              </div>
              <div className="btn-toggle"></div>
            </button>

            <button 
              className={`control-btn btn-pump ${devices.pump ? 'on' : ''} ${loadingDevices.pump ? 'is-waiting' : ''}`} 
              onClick={() => handleDeviceControl('pump', 2)}
            >
              <div className="btn-icon">
                <CloudRain size={24} className={devices.pump && !loadingDevices.pump ? 'bounce-anim' : ''} />
              </div>
              <div className="btn-meta">
                <span className="btn-name">Máy bơm</span>
                <span className="btn-status">
                  {loadingDevices.pump ? 'ĐANG CHỜ...' : devices.pump ? 'ĐANG TƯỚI' : 'ĐÃ TẮT'}
                </span>
              </div>
              <div className="btn-toggle"></div>
            </button>

            <button 
              className={`control-btn btn-light ${devices.light ? 'on' : ''} ${loadingDevices.light ? 'is-waiting' : ''}`} 
              onClick={() => handleDeviceControl('light', 3)}
            >
              <div className="btn-icon">
                <Lightbulb size={24} className={devices.light && !loadingDevices.light ? 'glow-anim' : ''} />
              </div>
              <div className="btn-meta">
                <span className="btn-name">Đèn</span>
                <span className="btn-status">
                  {loadingDevices.light ? 'ĐANG CHỜ...' : devices.light ? 'ĐANG SÁNG' : 'ĐÃ TẮT'}
                </span>
              </div>
              <div className="btn-toggle"></div>
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}