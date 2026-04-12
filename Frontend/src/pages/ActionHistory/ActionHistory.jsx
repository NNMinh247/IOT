import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { Search, ChevronDown, Copy } from 'lucide-react'; 
import useDebounce from '../../hooks/useDebounce';
import './ActionHistory.css';

export default function ActionHistory() {
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [limitInput, setLimitInput] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearchTerm = useDebounce(searchInput, 500);

  const deviceOptions = [ { id: 1, label: 'Quạt' }, { id: 2, label: 'Máy bơm' }, { id: 3, label: 'Đèn' } ];
  const actionOptions = [ { id: 'Bật', label: 'Bật' }, { id: 'Tắt', label: 'Tắt' } ];
  const statusOptions = [ 
    { id: 'Thành công', label: 'Thành công' }, 
    { id: 'Thất bại', label: 'Thất bại' },
    { id: 'Chờ', label: 'Chờ' }
  ];

  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const deviceRef = useRef(null);
  const actionRef = useRef(null);
  const statusRef = useRef(null);

  const [selectedDevices, setSelectedDevices] = useState('all');
  const [selectedActions, setSelectedActions] = useState('all');
  const [selectedStatuses, setSelectedStatuses] = useState('all');

  const getDeviceLabel = () => {
    if (selectedDevices === 'all') return 'Tất cả thiết bị';
    return deviceOptions.find(opt => opt.id === selectedDevices)?.label || 'Tất cả thiết bị';
  };

  const getActionLabel = () => {
    if (selectedActions === 'all') return 'Tất cả hành động';
    return actionOptions.find(opt => opt.id === selectedActions)?.label || 'Tất cả hành động';
  };

  const getStatusLabel = () => {
    if (selectedStatuses === 'all') return 'Tất cả trạng thái';
    return statusOptions.find(opt => opt.id === selectedStatuses)?.label || 'Tất cả trạng thái';
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deviceRef.current && !deviceRef.current.contains(event.target)) setShowDeviceMenu(false);
      if (actionRef.current && !actionRef.current.contains(event.target)) setShowActionMenu(false);
      if (statusRef.current && !statusRef.current.contains(event.target)) setShowStatusMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLimitChange = (e) => setLimitInput(e.target.value);
  const applyLimit = () => {
    const num = parseInt(limitInput);
    if (!isNaN(num) && num > 0 && num <= 1000) { 
      setItemsPerPage(num); 
      setCurrentPage(1); 
    } 
    else setLimitInput(itemsPerPage); 
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const fetchData = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage || 10,
        searchTime: debouncedSearchTerm, 
        devices: selectedDevices === 'all' ? '1,2,3' : selectedDevices,
        actions: selectedActions === 'all' ? 'Bật,Tắt' : selectedActions,
        statuses: selectedStatuses === 'all' ? 'Thành công,Thất bại,Chờ' : selectedStatuses
      });

      const response = await fetch(`http://localhost:5000/api/actions/history?${queryParams.toString()}`);
      const result = await response.json();

      if (result.success) {
        const formattedData = result.data.map(item => {
          const d = new Date(item.time);
          const pad = (n) => String(n).padStart(2, '0');
          return {
            id: item.id,
            device: item.device || item.name,
            action: item.action,
            status: item.status,
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
    } catch (error) { console.error("Error: ", error); }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, selectedDevices, selectedActions, selectedStatuses]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    <div className="history-page-layout">
      <Sidebar />
      <div className="history-main-content">
        <div className="history-container">
          
          <div className="history-toolbar filter-bar">
            
            <div className="search-container">
              <input type="text" className="search-input" placeholder="Tìm kiếm ..." 
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <Search size={16} className="search-icon" />
            </div>

            <div className="dropdown-container" ref={deviceRef}>
              <button className={`pill-btn-dropdown ${showDeviceMenu ? 'active' : ''}`} onClick={() => setShowDeviceMenu(!showDeviceMenu)}>
                {getDeviceLabel()} <ChevronDown size={16} />
              </button>
              {showDeviceMenu && (
                <div className="dropdown-menu filter-menu">
                   <div className={`single-select-item ${selectedDevices === 'all' ? 'selected' : ''}`} 
                        onClick={() => { setSelectedDevices('all'); setCurrentPage(1); setShowDeviceMenu(false); }}>
                     <span>Tất cả thiết bị</span>
                   </div>
                   <div className="filter-section-divider"></div>
                   {deviceOptions.map(opt => (
                      <div key={opt.id} className={`single-select-item ${selectedDevices === opt.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedDevices(opt.id); setCurrentPage(1); setShowDeviceMenu(false); }}>
                        <span>{opt.label}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>

            {/* 2. MENU HÀNH ĐỘNG */}
            <div className="dropdown-container" ref={actionRef}>
              <button className={`pill-btn-dropdown ${showActionMenu ? 'active' : ''}`} onClick={() => setShowActionMenu(!showActionMenu)}>
                {getActionLabel()} <ChevronDown size={16} />
              </button>
              {showActionMenu && (
                <div className="dropdown-menu filter-menu">
                   <div className={`single-select-item ${selectedActions === 'all' ? 'selected' : ''}`} 
                        onClick={() => { setSelectedActions('all'); setCurrentPage(1); setShowActionMenu(false); }}>
                     <span>Tất cả hành động</span>
                   </div>
                   <div className="filter-section-divider"></div>
                   {actionOptions.map(opt => (
                      <div key={opt.id} className={`single-select-item ${selectedActions === opt.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedActions(opt.id); setCurrentPage(1); setShowActionMenu(false); }}>
                        <span>{opt.label}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>

            {/* 3. MENU TRẠNG THÁI */}
            <div className="dropdown-container" ref={statusRef}>
              <button className={`pill-btn-dropdown ${showStatusMenu ? 'active' : ''}`} onClick={() => setShowStatusMenu(!showStatusMenu)}>
                {getStatusLabel()} <ChevronDown size={16} />
              </button>
              {showStatusMenu && (
                <div className="dropdown-menu filter-menu">
                   <div className={`single-select-item ${selectedStatuses === 'all' ? 'selected' : ''}`} 
                        onClick={() => { setSelectedStatuses('all'); setCurrentPage(1); setShowStatusMenu(false); }}>
                     <span>Tất cả trạng thái</span>
                   </div>
                   <div className="filter-section-divider"></div>
                   {statusOptions.map(opt => (
                      <div key={opt.id} className={`single-select-item ${selectedStatuses === opt.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedStatuses(opt.id); setCurrentPage(1); setShowStatusMenu(false); }}>
                        <span>{opt.label}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>

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
                        item.status.toLowerCase() === 'thành công' ? 'bg-green' : 
                        item.status.toLowerCase() === 'thất bại' ? 'bg-red' : 'bg-gray'
                      }`}>
                        {item.status}
                      </span>
                    </td>
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
                )) : (
                  <tr><td colSpan="5" className="no-data">Không tìm thấy lịch sử phù hợp</td></tr>
                )}
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
                  onClick={() => typeof btn === 'number' && setCurrentPage(btn)} disabled={btn === '...'}>{btn}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}