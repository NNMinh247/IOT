import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const location = useLocation();
  
  // Hàm kiểm tra active để bôi đậm tab đang chọn
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="header-wrapper">
      <nav className="header-nav">
        <Link to="/" className={`nav-link ${isActive('/')}`}>
          Bảng điều khiển
        </Link>
        <Link to="/datasensor" className={`nav-link ${isActive('/datasensor')}`}>
          Dữ liệu cảm biến
        </Link>
        <Link to="/actionhistory" className={`nav-link ${isActive('/actionhistory')}`}>
          Lịch sử hoạt động
        </Link>
        <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>
          Hồ sơ
        </Link>
      </nav>
    </header>
  );
}