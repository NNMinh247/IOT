import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { ArrowUpDown, ChevronDown } from 'lucide-react'; 
import './DataSensor.css';

export default function DataSensor() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [limitInput, setLimitInput] = useState(10);

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);

  const [filters, setFilters] = useState({
    dateDD: '', dateMM: '', dateYYYY: '',
    timeHH: '', timeMM: '', timeSS: '',
    name: '', value: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });

  const filterRef = useRef(null);
  const sortRef = useRef(null);

  const handleLimitChange = (e) => {
    setLimitInput(e.target.value); // Chỉ cập nhật số đang gõ trên màn hình, CHƯA gọi API
  };

  const applyLimit = () => {
    const num = parseInt(limitInput);
    if (!isNaN(num) && num > 0 && num <= 1000) {
      setItemsPerPage(num); // Chốt số lượng thật
      setCurrentPage(1);    // Quay về trang 1
    } else {
      setLimitInput(itemsPerPage); // Nếu người dùng xóa trắng hoặc nhập chữ, tự reset về số cũ
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const activeFilters = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val.trim() !== '') activeFilters[key] = val.trim();
      });

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage || 10,
        sortKey: sortConfig.key,
        sortDir: sortConfig.direction,
        ...activeFilters
      })

      const response = await fetch(`http://localhost:5000/api/sensors/data?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        const formattedData = result.data.map(item => {
          const d = new Date(item.time);
          const pad = (n) => String(n).padStart(2, '0');
          return {
            id: item.id,
            name: item.name,
            value: item.value,
            date: `${pad(d.getDate())} / ${pad(d.getMonth() + 1)} / ${d.getFullYear()}`,
            time: `${pad(d.getHours())} : ${pad(d.getMinutes())} : ${pad(d.getSeconds())}`
          };
        });
        setData(formattedData);
        setTotalPages(result.pagination.totalPages);
      }

    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu cảm biến:", error);
    }
  }, [currentPage, sortConfig.key, sortConfig.direction, filters, itemsPerPage]);

  useEffect(() => {
    fetchData();
  }, [currentPage, sortConfig.key, sortConfig.direction, itemsPerPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilter(false);
      if (sortRef.current && !sortRef.current.contains(event.target)) setShowSort(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (currentPage === 1) {
      fetchData();
    }
    else {
      setCurrentPage(1);
    }
    setShowFilter(false);
  };

  const getSortLabel = () => {
    const labels = { id: 'ID', time: 'Thời gian', name: 'Tên', value: 'Giá trị' };
    return `Sắp xếp theo ${labels[sortConfig.key]}`;
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    }
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
                  <div className="sort-option" onClick={() => setSortConfig({...sortConfig, key: 'id'})}>Sắp xếp theo ID</div>
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
                {data.length > 0 ? data.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td><td>{item.name}</td><td>{item.value}</td><td>{item.date} - {item.time}</td>
                  </tr>
                )) : <tr><td colSpan="4" className="no-data">Không tìm thấy dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>

          {/* PHÂN TRANG */}
          <div className="pagination-wrapper">
            <div className="limit-selector">
              {/* Thay thẻ <span> thành thẻ <button> và gắn hàm onClick */}
              <button className="apply-limit-btn" onClick={applyLimit}>Hiển thị:</button>
              
              <input 
                type="number" 
                min="1" 
                max="1000"
                value={limitInput} 
                onChange={handleLimitChange}
                /* Đã xóa onBlur và onKeyDown ở đây */
                className="limit-input"
              />

              <span>dòng / trang</span>
            </div>

            <div className="page-buttons">
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
    </div>
  );
}