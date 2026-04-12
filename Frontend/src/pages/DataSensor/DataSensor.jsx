import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { ChevronDown, Search, Copy, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import './DataSensor.css';

export default function DataSensor() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [limitInput, setLimitInput] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearchTerm = useDebounce(searchInput, 500); 
  
  const [showFilter, setShowFilter] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });

  const filterRef = useRef(null);
  const criteriaRef = useRef(null);

  const [selectedSensor, setSelectedSensor] = useState('all'); 
  const [selectedCriteria, setSelectedCriteria] = useState('time'); 

  const getSensorLabel = () => {
    if (selectedSensor === 'temp') return 'Nhiệt độ';
    if (selectedSensor === 'hum') return 'Độ ẩm';
    if (selectedSensor === 'light') return 'Ánh sáng';
    return 'Tất cả cảm biến';
  };

  const getCriteriaLabel = () => {
    if (selectedCriteria === 'value') return 'Giá trị';
    return 'Thời gian';
  };

  const sensorOptions = [
    { id: 'temp', label: 'Nhiệt độ' },
    { id: 'hum', label: 'Độ ẩm' },
    { id: 'light', label: 'Ánh sáng' }
  ];

  const criteriaOptions = [
    { id: 'value', label: 'Giá trị' },
    { id: 'time', label: 'Thời gian' }
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const applyLimit = () => {
    const num = parseInt(limitInput);
    if (!isNaN(num) && num > 0 && num <= 1000) {
      setItemsPerPage(num); 
      setCurrentPage(1);    
    } else {
      setLimitInput(itemsPerPage); 
    }
  };

  const handleLimitChange = (e) => setLimitInput(e.target.value);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const fetchData = useCallback(async () => {
    try {
      let filterByArray = [];
      if (selectedSensor === 'all') filterByArray.push('temp', 'hum', 'light');
      else filterByArray.push(selectedSensor);
      filterByArray.push(selectedCriteria);

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage || 10,
        sortKey: sortConfig.key,
        sortDir: sortConfig.direction,
        searchText: debouncedSearchTerm, 
        filterBy: filterByArray.join(',') 
      });

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
            date: `${d.getFullYear()} / ${pad(d.getMonth() + 1)} / ${pad(d.getDate())}`,
            time: `${pad(d.getHours())} : ${pad(d.getMinutes())} : ${pad(d.getSeconds())}`
          };
        });
        setData(formattedData);
        setTotalPages(result.pagination.totalPages);
        setTotalItems(result.pagination.totalItems || result.pagination.total || 0);
      } else {
        setData([]); 
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Lỗi khi fetch dữ liệu cảm biến:", error);
    }
  }, [currentPage, sortConfig, itemsPerPage, debouncedSearchTerm, selectedSensor, selectedCriteria]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilter(false);
      if (criteriaRef.current && !criteriaRef.current.contains(event.target)) setShowCriteria(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) buttons.push(i);
    } else {
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
            
            <div className="search-container">
              <input type="text" className="search-input" placeholder="Tìm kiếm ..." 
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <Search size={18} className="search-icon" />
            </div>

            {/* 1. MENU TIÊU CHÍ */}
            <div className="dropdown-container" ref={criteriaRef}>
              <button className={`pill-btn-dropdown wide ${showCriteria ? 'active' : ''}`} onClick={() => setShowCriteria(!showCriteria)}>
                {getCriteriaLabel()} <ChevronDown size={16} />
              </button>
              {showCriteria && (
                <div className="dropdown-menu filter-menu">
                   {criteriaOptions.map(opt => (
                      <div key={opt.id} className={`single-select-item ${selectedCriteria === opt.id ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedCriteria(opt.id);
                          setCurrentPage(1);
                          setShowCriteria(false); // Chọn xong tự đóng menu
                        }}>
                        <span>{opt.label}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>

            {/* 2. MENU CẢM BIẾN */}
            <div className="dropdown-container" ref={filterRef}>
              <button className={`pill-btn-dropdown wide ${showFilter ? 'active' : ''}`} onClick={() => setShowFilter(!showFilter)}>
                {getSensorLabel()} <ChevronDown size={16} />
              </button>
              {showFilter && (
                <div className="dropdown-menu filter-menu">
                   <div className={`single-select-item ${selectedSensor === 'all' ? 'selected' : ''}`} 
                        onClick={() => { setSelectedSensor('all'); setCurrentPage(1); setShowFilter(false); }}>
                     <span>Tất cả cảm biến</span>
                   </div>
                   <div className="filter-section-divider"></div>
                   {sensorOptions.map(opt => (
                      <div key={opt.id} className={`single-select-item ${selectedSensor === opt.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedSensor(opt.id); setCurrentPage(1); setShowFilter(false); }}>
                        <span>{opt.label}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="sensor-table">
              <thead>
                <tr>
                  <th style={{width: '10%'}} className="sortable-header" onClick={() => handleSort('id')}>
                    <div className="header-content">
                      ID 
                      {sortConfig.key === 'id' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} className="active-icon"/> : <ArrowDown size={14} className="active-icon"/>) : <ArrowUpDown size={14} className="inactive-icon"/>}
                    </div>
                  </th>
                  <th style={{width: '35%'}} className="sortable-header" onClick={() => handleSort('name')}>
                    <div className="header-content">
                      TÊN CẢM BIẾN 
                      {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} className="active-icon"/> : <ArrowDown size={14} className="active-icon"/>) : <ArrowUpDown size={14} className="inactive-icon"/>}
                    </div>
                  </th>
                  <th style={{width: '25%'}} className="sortable-header" onClick={() => handleSort('value')}>
                    <div className="header-content">
                      GIÁ TRỊ 
                      {sortConfig.key === 'value' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} className="active-icon"/> : <ArrowDown size={14} className="active-icon"/>) : <ArrowUpDown size={14} className="inactive-icon"/>}
                    </div>
                  </th>
                  <th style={{width: '30%'}} className="sortable-header" onClick={() => handleSort('time')}>
                    <div className="header-content">
                      THỜI GIAN 
                      {sortConfig.key === 'time' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} className="active-icon"/> : <ArrowDown size={14} className="active-icon"/>) : <ArrowUpDown size={14} className="inactive-icon"/>}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? data.map(item => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.value}</td>
                    <td>
                      <div className="time-cell">
                        <span>{item.date} - {item.time}</span>
                        <button
                          className="copy-btn"
                          onClick={() => handleCopy(`${item.date} - ${item.time}`)}
                          title="Copy thời gian"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" className="no-data">Không tìm thấy dữ liệu</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="pagination-wrapper">
            <div className="limit-selector">
              <span className="limit-label">Hiển thị</span>
              <input 
                type="number" 
                min="1" max="1000" 
                value={limitInput} 
                onChange={handleLimitChange} 
                onKeyDown={(e) => { if (e.key === 'Enter') applyLimit(); }} 
                onBlur={applyLimit} 
                className="limit-input" 
              />
              <span>dữ liệu trong tổng số {totalItems} bản ghi</span>
            </div>
            <div className="page-buttons">
              {renderPaginationButtons().map((btn, index) => (
                <button key={index} className={`page-btn ${btn === currentPage ? 'active' : ''} ${btn === '...' ? 'dots' : ''}`}
                  onClick={() => typeof btn === 'number' && setCurrentPage(btn)} disabled={btn === '...'}> {btn} </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}