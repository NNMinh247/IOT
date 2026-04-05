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

  const [selectedDevices, setSelectedDevices] = useState([1, 2, 3]);
  const [selectedActions, setSelectedActions] = useState(['Bật', 'Tắt']);
  const [selectedStatuses, setSelectedStatuses] = useState(['Thành công', 'Thất bại', 'Chờ']);

  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const deviceRef = useRef(null);
  const actionRef = useRef(null);
  const statusRef = useRef(null);

  const toggleFilter = (val, list, setList, allValues) => {
    if (val === 'all') {
      if (list.length === allValues.length) setList([]);
      else setList([...allValues]);
    } else {
      if (list.includes(val)) setList(list.filter(item => item !== val));
      else setList([...list, val]);
    }
    setCurrentPage(1);
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
    if (!isNaN(num) && num > 0 && num <= 1000) { setItemsPerPage(num); setCurrentPage(1); } 
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
        devices: selectedDevices.join(','),
        actions: selectedActions.join(','),
        statuses: selectedStatuses.join(',')
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
                Tất cả thiết bị <ChevronDown size={16} />
              </button>
              {showDeviceMenu && (
                <div className="dropdown-menu filter-menu">
                   <div className={`filter-checkbox-item ${selectedDevices.length === deviceOptions.length ? 'selected' : ''}`} 
                        onClick={() => toggleFilter('all', selectedDevices, setSelectedDevices, deviceOptions.map(o=>o.id))}>
                     <div className="custom-checkbox"></div>
                     <span style={{fontWeight: 800, color: 'var(--primary-blue)'}}>Tất cả</span>
                   </div>
                   <div className="filter-section-divider"></div>
                   {deviceOptions.map(opt => (
                      <div key={opt.id} className={`filter-checkbox-item ${selectedDevices.includes(opt.id) ? 'selected' : ''}`}
                        onClick={() => toggleFilter(opt.id, selectedDevices, setSelectedDevices, deviceOptions.map(o=>o.id))}>
                        <div className="custom-checkbox"></div>
                        <span>{opt.label}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>

            <div className="dropdown-container" ref={actionRef}>
              <button className={`pill-btn-dropdown ${showActionMenu ? 'active' : ''}`} onClick={() => setShowActionMenu(!showActionMenu)}>
                Tất cả hành động <ChevronDown size={16} />
              </button>
              {showActionMenu && (
                <div className="dropdown-menu filter-menu">
                   <div className={`filter-checkbox-item ${selectedActions.length === actionOptions.length ? 'selected' : ''}`} 
                        onClick={() => toggleFilter('all', selectedActions, setSelectedActions, actionOptions.map(o=>o.id))}>
                     <div className="custom-checkbox"></div>
                     <span style={{fontWeight: 800, color: 'var(--primary-blue)'}}>Tất cả</span>
                   </div>
                   <div className="filter-section-divider"></div>
                   {actionOptions.map(opt => (
                      <div key={opt.id} className={`filter-checkbox-item ${selectedActions.includes(opt.id) ? 'selected' : ''}`}
                        onClick={() => toggleFilter(opt.id, selectedActions, setSelectedActions, actionOptions.map(o=>o.id))}>
                        <div className="custom-checkbox"></div>
                        <span>{opt.label}</span>
                      </div>
                   ))}
                </div>
              )}
            </div>

            <div className="dropdown-container" ref={statusRef}>
              <button className={`pill-btn-dropdown ${showStatusMenu ? 'active' : ''}`} onClick={() => setShowStatusMenu(!showStatusMenu)}>
                Tất cả trạng thái <ChevronDown size={16} />
              </button>
              {showStatusMenu && (
                <div className="dropdown-menu filter-menu">
                   <div className={`filter-checkbox-item ${selectedStatuses.length === statusOptions.length ? 'selected' : ''}`} 
                        onClick={() => toggleFilter('all', selectedStatuses, setSelectedStatuses, statusOptions.map(o=>o.id))}>
                     <div className="custom-checkbox"></div><span style={{fontWeight: 800, color: 'var(--primary-blue)'}}>Tất cả</span>
                   </div>
                   <div className="filter-section-divider"></div>
                   {statusOptions.map(opt => (
                      <div key={opt.id} className={`filter-checkbox-item ${selectedStatuses.includes(opt.id) ? 'selected' : ''}`}
                        onClick={() => toggleFilter(opt.id, selectedStatuses, setSelectedStatuses, statusOptions.map(o=>o.id))}>
                        <div className="custom-checkbox"></div>
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
              <button className="apply-limit-btn" onClick={applyLimit}>Hiển thị:</button>
              <input type="number" min="1" max="1000" value={limitInput} onChange={handleLimitChange} className="limit-input" />
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