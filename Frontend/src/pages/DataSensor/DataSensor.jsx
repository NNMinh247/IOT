import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { ArrowUpDown, ChevronDown } from 'lucide-react'; 
import './DataSensor.css';

export default function DataSensor() {
  // --- logic: Khởi tạo dữ liệu (100 bản ghi) ---
  const [allData, setAllData] = useState([]);      
  const [displayData, setDisplayData] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- logic: Quản lý Dropdown ---
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);

  // --- logic: Lọc dữ liệu (Phân đoạn Ngày và Giờ) ---
  const [filters, setFilters] = useState({
    dateDD: '', dateMM: '', dateYYYY: '',
    timeHH: '', timeMM: '', timeSS: '',
    name: '', value: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });

  const filterRef = useRef(null);
  const sortRef = useRef(null);

  // Khởi tạo dữ liệu giả (Giữ nguyên logic cũ của bạn)
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
      const month = "01";
      const year = "2026";
      const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
      const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      const sec = String(Math.floor(Math.random() * 60)).padStart(2, '0');

      return {
        id: id,
        name: sensor,
        value: val,
        date: `${day} / ${month} / ${year}`,
        time: `${hour} : ${min} : ${sec}`,
        fullDateTime: `${year}-${month}-${day}T${hour}:${min}:${sec}` 
      };
    });
    const reversed = [...fakeData].reverse();
    setAllData(reversed);
    setDisplayData(reversed);
  }, []);

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilter(false);
      if (sortRef.current && !sortRef.current.contains(event.target)) setShowSort(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // HÀM TÌM KIẾM & TRUY VẤN
  const handleSearch = () => {
    let result = [...allData];

    // Lọc Ngày (DD / MM / YYYY) - Kiểm tra từng phần nếu có nhập
    if (filters.dateDD || filters.dateMM || filters.dateYYYY) {
      result = result.filter(item => {
        const [d, m, y] = item.date.split(' / ');
        return (!filters.dateDD || d.includes(filters.dateDD)) &&
               (!filters.dateMM || m.includes(filters.dateMM)) &&
               (!filters.dateYYYY || y.includes(filters.dateYYYY));
      });
    }

    // Lọc Giờ (HH : MM : SS) - Kiểm tra từng phần nếu có nhập
    if (filters.timeHH || filters.timeMM || filters.timeSS) {
      result = result.filter(item => {
        const [h, mi, s] = item.time.split(' : ');
        return (!filters.timeHH || h.includes(filters.timeHH)) &&
               (!filters.timeMM || mi.includes(filters.timeMM)) &&
               (!filters.timeSS || s.includes(filters.timeSS));
      });
    }

    if (filters.name) result = result.filter(item => item.name.toLowerCase().includes(filters.name.toLowerCase()));
    if (filters.value) result = result.filter(item => String(item.value).includes(filters.value));

    // Sắp xếp
    result.sort((a, b) => {
      let valA = a[sortConfig.key], valB = b[sortConfig.key];
      if (sortConfig.key === 'time') { valA = a.fullDateTime; valB = b.fullDateTime; }
      else if (['value', 'id'].includes(sortConfig.key)) { valA = parseFloat(valA); valB = parseFloat(valB); }
      
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setDisplayData(result);
    setCurrentPage(1);
    setShowFilter(false);
    setShowSort(false);
  };

  const getSortLabel = () => {
    const labels = { id: 'ID', time: 'Thời gian', name: 'Tên', value: 'Giá trị' };
    return `Sắp xếp theo ${labels[sortConfig.key]}`;
  };

  // --- logic: Phân trang (Giữ nguyên 1 2 3... 10) ---
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const currentItems = displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const renderPaginationButtons = () => {
    const buttons = [];
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) buttons.push(i); }
    else {
      if (currentPage <= 4) buttons.push(1, 2, 3, 4, 5, '...', totalPages);
      else if (currentPage >= totalPages - 3) buttons.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      else buttons.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return buttons;
  };

  return (
    <div className="datasensor-layout">
      <Sidebar />
      <div className="datasensor-main">
        <div className="datasensor-card">
          <div className="filter-bar">
            
            {/* DROPDOWN LỌC */}
            <div className="dropdown-container" ref={filterRef}>
              <button className={`pill-btn-dropdown ${showFilter ? 'active' : ''}`} onClick={() => setShowFilter(!showFilter)}>
                Lọc <ChevronDown size={16} />
              </button>
              {/* Thay thế phần Dropdown Menu Lọc trong file DataSensor.jsx */}
              {showFilter && (
                <div className="dropdown-menu filter-menu">
                  
                  {/* Hàng Ngày */}
                  <div className="filter-row">
                    <span className="row-label">Ngày</span>
                    <div className="input-group-wrapper">
                      <input type="text" maxLength="2" placeholder="Ngày" value={filters.dateDD} onChange={(e) => setFilters({...filters, dateDD: e.target.value})} />
                      <span className="sep">/</span>
                      <input type="text" maxLength="2" placeholder="Tháng" value={filters.dateMM} onChange={(e) => setFilters({...filters, dateMM: e.target.value})} />
                      <span className="sep">/</span>
                      <input type="text" maxLength="4" placeholder="Năm" className="year-input" value={filters.dateYYYY} onChange={(e) => setFilters({...filters, dateYYYY: e.target.value})} />
                    </div>
                  </div>

                  {/* Hàng Giờ */}
                  <div className="filter-row">
                    <span className="row-label">Giờ</span>
                    <div className="input-group-wrapper">
                      <input type="text" maxLength="2" placeholder="Giờ" value={filters.timeHH} onChange={(e) => setFilters({...filters, timeHH: e.target.value})} />
                      <span className="sep">:</span>
                      <input type="text" maxLength="2" placeholder="Phút" value={filters.timeMM} onChange={(e) => setFilters({...filters, timeMM: e.target.value})} />
                      <span className="sep">:</span>
                      <input type="text" maxLength="2" placeholder="Giây" value={filters.timeSS} onChange={(e) => setFilters({...filters, timeSS: e.target.value})} />
                    </div>
                  </div>

                  <div className="filter-row">
                    <span className="row-label">Tên</span>
                    <input className="modern-single-input" type="text" placeholder="Tên cảm biến..." value={filters.name} onChange={(e) => setFilters({...filters, name: e.target.value})} />
                  </div>

                  <div className="filter-row">
                    <span className="row-label">Giá trị</span>
                    <input className="modern-single-input" type="text" placeholder="Nhập giá trị..." value={filters.value} onChange={(e) => setFilters({...filters, value: e.target.value})} />
                  </div>
                </div>
              )}
            </div>

            {/* DROPDOWN SẮP XẾP */}
            <div className="dropdown-container" ref={sortRef}>
              <button className={`pill-btn-dropdown wide ${showSort ? 'active' : ''}`} onClick={() => setShowSort(!showSort)}>
                {getSortLabel()} <ChevronDown size={16} />
              </button>
              {showSort && (
                <div className="dropdown-menu">
                  <div className="sort-option" onClick={() => setSortConfig({...sortConfig, key: 'time'})}>Sắp xếp theo thời gian</div>
                  <div className="sort-option" onClick={() => setSortConfig({...sortConfig, key: 'name'})}>Sắp xếp theo tên</div>
                  <div className="sort-option" onClick={() => setSortConfig({...sortConfig, key: 'value'})}>Sắp xếp giá trị</div>
                </div>
              )}
            </div>

            <button className="pill-btn-toggle-sort" onClick={() => setSortConfig({...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}>
              {sortConfig.direction === 'asc' ? 'Bé → Lớn' : 'Lớn → Bé'} <ArrowUpDown size={16} />
            </button>

            <button className="pill-btn-search" onClick={handleSearch}>Tìm kiếm</button>
          </div>

          {/* BẢNG DỮ LIỆU */}
          <div className="table-wrapper">
            <table className="sensor-table">
              <thead>
                <tr>
                  <th style={{width: '10%'}}>ID</th>
                  <th style={{width: '35%'}}>TÊN CẢM BIẾN</th>
                  <th style={{width: '25%'}}>GIÁ TRỊ</th>
                  <th style={{width: '30%'}}>THỜI GIAN</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? currentItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td><td>{item.name}</td><td>{item.value}</td><td>{item.date} - {item.time}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="no-data">Không tìm thấy dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>

          {/* PHÂN TRANG */}
          <div className="pagination-wrapper">
            {renderPaginationButtons().map((btn, index) => (
              <button key={index} className={`page-btn ${btn === currentPage ? 'active' : ''} ${btn === '...' ? 'dots' : ''}`}
                onClick={() => typeof btn === 'number' && setCurrentPage(btn)} disabled={btn === '...'}>
                {btn}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}