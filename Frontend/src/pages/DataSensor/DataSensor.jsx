import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { ArrowUpDown } from 'lucide-react'; 
import './DataSensor.css';

export default function DataSensor() {
  // 1. STATE QUẢN LÝ DỮ LIỆU
  const [allData, setAllData] = useState([]);      
  const [displayData, setDisplayData] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 2. STATE INPUT TÌM KIẾM
  const [filters, setFilters] = useState({
    date: '',   
    time: '',   
    name: '',
    value: ''
  });

  // 3. STATE SẮP XẾP
  const [sortConfig, setSortConfig] = useState({
    key: 'id', 
    direction: 'asc' 
  });

  // 4. KHỞI TẠO 100 DỮ LIỆU GIẢ LẬP
  useEffect(() => {
    const sensors = ['Cảm biến nhiệt độ - DHT11', 'Cảm biến độ ẩm - DHT11', 'Quang trở - LDR'];
    const fakeData = Array.from({ length: 100 }, (_, i) => {
      const id = i + 1;
      const sensor = sensors[Math.floor(Math.random() * sensors.length)];
      
      let val = 0;
      if (sensor.includes('nhiệt')) val = (Math.random() * (35 - 20) + 20).toFixed(1);
      else if (sensor.includes('ẩm')) val = Math.floor(Math.random() * (90 - 40) + 40);
      else val = Math.floor(Math.random() * (900 - 100) + 100);

      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
      const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      const sec = String(Math.floor(Math.random() * 60)).padStart(2, '0');

      return {
        id: id,
        name: sensor,
        value: val,
        date: `${day} / 01 / 2026`,
        time: `${hour} : ${min} : ${sec}`,
        fullDateTime: `2026-01-${day}T${hour}:${min}:${sec}` 
      };
    });
    
    const reversed = fakeData.reverse();
    setAllData(reversed);
    setDisplayData(reversed);
  }, []);

  // 5. XỬ LÝ NHẬP INPUT
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // 6. HÀM TÌM KIẾM & SẮP XẾP
  const handleSearch = () => {
    let result = [...allData];

    if (filters.date) {
      result = result.filter(item => item.date.includes(filters.date));
    }
    if (filters.time) {
      result = result.filter(item => item.time.includes(filters.time));
    }
    if (filters.name) {
      result = result.filter(item => item.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.value) {
      result = result.filter(item => String(item.value).includes(filters.value));
    }

    result.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === 'time') {
        valA = a.fullDateTime;
        valB = b.fullDateTime;
      }
      if (sortConfig.key === 'value' || sortConfig.key === 'id') {
        valA = parseFloat(valA);
        valB = parseFloat(valB);
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayData(result);
    setCurrentPage(1); 
  };

  // 7. XỬ LÝ ĐỔI HƯỚNG SẮP XẾP
  const toggleSortDirection = () => {
    setSortConfig(prev => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setTimeout(handleSearch, 0); 
  };

  // 8. TÍNH TOÁN PHÂN TRANG
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayData.slice(indexOfFirstItem, indexOfLastItem);

  const renderPaginationButtons = () => {
    const buttons = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else {
      if (currentPage <= 4) {
        buttons.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        buttons.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        buttons.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return buttons;
  };

  return (
    <div className="datasensor-layout">
      <Sidebar />
      
      <div className="datasensor-main">
        <div className="datasensor-card">
          
          {/* --- THANH CÔNG CỤ --- */}
          <div className="filter-bar">
            <input 
              type="text" name="date" placeholder="Nhập ngày: dd / mm / yyyy" 
              className="pill-input" value={filters.date} onChange={handleInputChange}
            />
            <input 
              type="text" name="time" placeholder="Nhập giờ: hh : mm : ss" 
              className="pill-input" value={filters.time} onChange={handleInputChange}
            />
            <input 
              type="text" name="name" placeholder="Nhập tên cảm biến" 
              className="pill-input" value={filters.name} onChange={handleInputChange}
            />
            <input 
              type="text" name="value" placeholder="Nhập giá trị" 
              className="pill-input" value={filters.value} onChange={handleInputChange}
            />

            <select 
              className="pill-select"
              value={sortConfig.key}
              onChange={(e) => setSortConfig(prev => ({ ...prev, key: e.target.value }))}
            >
              <option value="id">Sắp xếp: ID</option>
              <option value="time">Sắp xếp: Thời gian</option>
              <option value="name">Sắp xếp: Tên</option>
              <option value="value">Sắp xếp: Giá trị</option>
            </select>

            <button className="pill-btn-sort" onClick={toggleSortDirection}>
              {sortConfig.direction === 'asc' ? 'Bé → Lớn' : 'Lớn → Bé'}
              <ArrowUpDown size={16} style={{marginLeft: 5}}/>
            </button>

            <button className="pill-btn-search" onClick={handleSearch}>
              Tìm kiếm
            </button>
          </div>

          {/* --- BẢNG DỮ LIỆU --- */}
          <div className="table-wrapper">
            <table className="sensor-table">
              <thead>
                <tr>
                  <th style={{width: '10%'}}>ID</th>
                  <th style={{width: '35%'}}>Tên cảm biến</th>
                  <th style={{width: '25%'}}>Giá trị</th>
                  <th style={{width: '30%'}}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{item.value}</td>
                      <td>{item.date} - {item.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="no-data">Không tìm thấy dữ liệu phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* --- PHÂN TRANG --- */}
          <div className="pagination-wrapper">
             {renderPaginationButtons().map((btn, index) => (
               <button
                  key={index}
                  className={`page-btn ${btn === currentPage ? 'active' : ''} ${btn === '...' ? 'dots' : ''}`}
                  onClick={() => typeof btn === 'number' && setCurrentPage(btn)}
                  disabled={btn === '...'}
               >
                 {btn}
               </button>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
}