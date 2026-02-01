import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { ChevronDown } from 'lucide-react';
import './ActionHistory.css';

export default function ActionHistory() {
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);

  const [filters, setFilters] = useState({
    dateDD: '', dateMM: '', dateYYYY: '',
    timeHH: '', timeMM: '', timeSS: ''
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const devices = ['Đèn', 'Quạt', 'Máy phun sương'];
    const actions = ['Bật', 'Tắt'];
    
    const fakeData = Array.from({ length: 100 }, (_, i) => {
      const id = i + 1;
      const device = devices[Math.floor(Math.random() * devices.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      const isSuccess = Math.random() > 0.2;
      const status = isSuccess ? action : 'Chờ'; 

      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
      const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      const sec = String(Math.floor(Math.random() * 60)).padStart(2, '0');

      return {
        id: id,
        device: device,
        action: action,
        status: status,
        date: `${day} / 01 / 2026`,
        time: `${hour} : ${min} : ${sec}`
      };
    });

    const reversed = [...fakeData].reverse();
    setAllData(reversed);
    setDisplayData(reversed);
  }, []);

  const handleSearch = () => {
    let result = [...allData];

    if (filters.dateDD || filters.dateMM || filters.dateYYYY) {
      result = result.filter(item => {
        const [d, m, y] = item.date.split(' / ');
        return (!filters.dateDD || d.includes(filters.dateDD)) &&
              (!filters.dateMM || m.includes(filters.dateMM)) &&
              (!filters.dateYYYY || y.includes(filters.dateYYYY));
      });
    }

    if (filters.timeHH || filters.timeMM || filters.timeSS) {
      result = result.filter(item => {
        const [h, mi, s] = item.time.split(' : ');
        return (!filters.timeHH || h.includes(filters.timeHH)) &&
              (!filters.timeMM || mi.includes(filters.timeMM)) &&
              (!filters.timeSS || s.includes(filters.timeSS));
      });
    }

    setDisplayData(result);
    setCurrentPage(1);
    setShowFilter(false);
  };

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
    <div className="history-page-layout">
      <Sidebar />
      <div className="history-main-content">
        <div className="history-container">
          <div className="history-toolbar">
            <div className="spacer"></div>
            
            <div className="dropdown-container" ref={filterRef}>
              <button 
                className={`pill-btn-dropdown ${showFilter ? 'active' : ''}`} 
                onClick={() => setShowFilter(!showFilter)}
              >
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
                  <th style={{width: '30%'}}>Tên thiết bị</th>
                  <th style={{width: '15%'}}>Hành động</th>
                  <th style={{width: '15%'}}>Trạng thái</th>
                  <th style={{width: '30%'}}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? currentItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td style={{fontWeight: '600'}}>{item.device}</td>
                    <td>{item.action}</td>
                    <td>{item.status}</td>
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