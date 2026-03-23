import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { ChevronDown } from 'lucide-react';
import './ActionHistory.css';

export default function ActionHistory() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  const [filters, setFilters] = useState({
    dateDD: '', dateMM: '', dateYYYY: '',
    timeHH: '', timeMM: '', timeSS: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const activeFilters = {};
      Object.entries(filters).forEach(([key, val]) => {
        if (val.trim() !== '') activeFilters[key] = val.trim();
      });

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...activeFilters
      });

      const response = await fetch(`http://localhost:5000/api/actions/history?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        const formattedData = result.data.map(item => {
          const d = new Date(item.time);
          const pad = (n) => String(n).padStart(2, '0');

          return {
            id: item.id,
            device: item.device,
            action: item.action,
            status: item.status,
            date: `${pad(d.getDate())} / ${pad(d.getMonth() + 1)} / ${d.getFullYear()}`,
            time: `${pad(d.getHours())} : ${pad(d.getMinutes())} : ${pad(d.getSeconds())}`
          };
        });

        setData(formattedData);
        setTotalPages(result.pagination.totalPages);
      }
    }
    catch (error) {
      console.error("Error: ", error);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mosedown', handleClickOutside);
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
    <div className="history-page-layout">
      <Sidebar />
      <div className="history-main-content">
        <div className="history-container">
          <div className="history-toolbar">
            <div className="spacer"></div>
            
            <div className="dropdown-container" ref={filterRef}>
              <button className={`pill-btn-dropdown ${showFilter ? 'active' : ''}`} onClick={() => setShowFilter(!showFilter)}>
                Lọc <ChevronDown size={16} />
              </button>
              
              {showFilter && (
                <div className="dropdown-menu filter-menu">
                  <div className="filter-row">
                    <span className="row-label">Ngày</span>
                    <div className="input-group-wrapper">
                      <input type="text" maxLength="2" placeholder="Ngày" value={filters.dateDD} onChange={(e) => setFilters({...filters, dateDD: e.target.value})} />
                      <span className="sep">/</span>
                      <input type="text" maxLength="2" placeholder="Tháng" value={filters.dateMM} onChange={(e) => setFilters({...filters, dateMM: e.target.value})} />
                      <span className="sep">/</span>
                      <input type="text" maxLength="4" placeholder="Năm" value={filters.dateYYYY} onChange={(e) => setFilters({...filters, dateYYYY: e.target.value})} />
                    </div>
                  </div>

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
                </div>
              )}
            </div>
            
            <button className="pill-btn-search" onClick={handleSearch}>Tìm kiếm</button>
          </div>

          <div className="table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th style={{width: '10%'}}>ID</th>
                  <th style={{width: '30%'}}>TÊN THIẾT BỊ</th>
                  <th style={{width: '15%'}}>HÀNH ĐỘNG</th>
                  <th style={{width: '15%'}}>TRẠNG THÁI</th>
                  <th style={{width: '30%'}}>THỜI GIAN</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? data.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td style={{ fontWeight: '600' }}>{item.device}</td>
                    <td>
                      <span className={`status-badge ${item.action.toLowerCase() === 'bật' ? 'bg-green' : 'bg-red'}`}>
                        {item.action}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${
                        item.status.toLowerCase() === 'thành công' || item.status.toLowerCase() === 'bật' ? 'bg-green' : 
                        item.status.toLowerCase() === 'tắt' ? 'bg-red' : 'bg-gray'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.date} - {item.time}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="no-data">Không tìm thấy lịch sử phù hợp</td></tr>
                )}
              </tbody>
            </table>
          </div>

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