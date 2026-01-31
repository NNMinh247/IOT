import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './ActionHistory.css';

export default function ActionHistory() {
  const [allData, setAllData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filters, setFilters] = useState({
    date: '',
    time: ''
  });

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

    const reversed = fakeData.reverse();
    setAllData(reversed);
    setDisplayData(reversed);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    let result = [...allData];

    if (filters.date) {
      result = result.filter(item => item.date.includes(filters.date));
    }
    if (filters.time) {
      result = result.filter(item => item.time.includes(filters.time));
    }

    setDisplayData(result);
    setCurrentPage(1);
  };

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
    <div className="history-page-layout">
      <Sidebar />
      
      <div className="history-main-content">
        <div className="history-container">
          
          <div className="history-toolbar">
            <div className="spacer"></div>
            
            <input 
              type="text" name="date" placeholder="Nhập ngày: dd / mm / yyyy" 
              className="pill-input" value={filters.date} onChange={handleInputChange}
            />
            <input 
              type="text" name="time" placeholder="Nhập giờ: hh : mm : ss" 
              className="pill-input" value={filters.time} onChange={handleInputChange}
            />
            
            <button className="pill-btn-search" onClick={handleSearch}>
              Tìm kiếm
            </button>
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
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td style={{fontWeight: '500'}}>{item.device}</td>
                      <td>{item.action}</td>
                      <td>{item.status}</td>
                      <td>{item.date} - {item.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">Không tìm thấy lịch sử phù hợp</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

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