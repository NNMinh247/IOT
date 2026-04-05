import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { ArrowUpDown, ChevronDown, Search, Copy } from 'lucide-react'; 
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
  
  const [selectedFilters, setSelectedFilters] = useState(['temp', 'hum', 'light', 'value', 'time']);

  const [showFilter, setShowFilter] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'time', direction: 'desc' });

  const filterRef = useRef(null);
  const criteriaRef = useRef(null);
  const sortRef = useRef(null);

  const sensorOptions = [
    { id: 'temp', label: 'Nhiệt độ' },
    { id: 'hum', label: 'Độ ẩm' },
    { id: 'light', label: 'Ánh sáng' }
  ];

  const criteriaOptions = [
    { id: 'value', label: 'Giá trị' },
    { id: 'time', label: 'Thời gian' }
  ];

  const isAllSensors = ['temp', 'hum', 'light'].every(s => selectedFilters.includes(s));

  const handleFilterToggle = (val) => {
    let newFilters = [...selectedFilters];

    if (['value', 'time'].includes(val)) {
      if (newFilters.includes(val)) {
        const criteriaCount = newFilters.filter(item => ['value', 'time'].includes(item)).length;
        if (criteriaCount > 1) {
          newFilters = newFilters.filter(item => item !== val);
        } else {
          alert("Vui lòng để lại ít nhất 1 tiêu chí tìm kiếm!");
        }
      } else {
        newFilters.push(val);
      }
    } else if (val === 'all_sensors') {
      if (isAllSensors) {
        newFilters = newFilters.filter(item => !['temp', 'hum', 'light'].includes(item));
      } else {
        ['temp', 'hum', 'light'].forEach(s => {
          if (!newFilters.includes(s)) newFilters.push(s);
        });
      }
    } else {
      if (newFilters.includes(val)) {
        newFilters = newFilters.filter(item => item !== val);
      } else {
        newFilters.push(val);
      }
    }
    
    setSelectedFilters(newFilters);
    setCurrentPage(1);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const applyLimit = () => {
    const num = parseInt(limitInput);
    if (!isNaN(num) && num > 0 && num <= 1000) {
      setItemsPerPage(num); setCurrentPage(1);    
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
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage || 10,
        sortKey: sortConfig.key,
        sortDir: sortConfig.direction,
        searchText: debouncedSearchTerm,
        filterBy: selectedFilters.join(',')
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
  }, [currentPage, sortConfig, itemsPerPage, debouncedSearchTerm, selectedFilters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) setShowFilter(false);
      if (criteriaRef.current && !criteriaRef.current.contains(event.target)) setShowCriteria(false);
      if (sortRef.current && !sortRef.current.contains(event.target)) setShowSort(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSortLabel = () => {
    const labels = { id: 'ID', time: 'Thời gian', name: 'Tên', value: 'Giá trị' };
    return `Sắp xếp theo ${labels[sortConfig.key]}`;
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

            <div className="dropdown-container" ref={criteriaRef}>
              <button className={`pill-btn-dropdown wide ${showCriteria ? 'active' : ''}`} onClick={() => setShowCriteria(!showCriteria)}>
                Tiêu chí<ChevronDown size={16} />
              </button>
              {showCriteria && (
                <div className="dropdown-menu filter-menu">
                   {criteriaOptions.map(opt => (
                      <div key={opt.id} className={`filter-checkbox-item ${selectedFilters.includes(opt.id) ? 'selected' : ''}`}
                        onClick={() => handleFilterToggle(opt.id)}>
                        <div className="custom-checkbox"></div>
                        <span>{opt.label}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>

            <div className="dropdown-container" ref={filterRef}>
              <button className={`pill-btn-dropdown wide ${showFilter ? 'active' : ''}`} onClick={() => setShowFilter(!showFilter)}>
                Tất cả cảm biến <ChevronDown size={16} />
              </button>
              {showFilter && (
                <div className="dropdown-menu filter-menu">
                   <div className={`filter-checkbox-item ${isAllSensors ? 'selected' : ''}`} onClick={() => handleFilterToggle('all_sensors')}>
                     <div className="custom-checkbox"></div>
                     <span style={{fontWeight: 800, color: 'var(--primary-blue)'}}>Tất cả</span>
                   </div>
                   <div className="filter-section-divider"></div>
                   {sensorOptions.map(opt => (
                      <div key={opt.id} className={`filter-checkbox-item ${selectedFilters.includes(opt.id) ? 'selected' : ''}`}
                        onClick={() => handleFilterToggle(opt.id)}>
                        <div className="custom-checkbox"></div>
                        <span>{opt.label}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>

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

          </div>

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
              <button className="apply-limit-btn" onClick={applyLimit}>Hiển thị:</button>
              <input type="number" min="1" max="1000" value={limitInput} onChange={handleLimitChange} className="limit-input" />
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