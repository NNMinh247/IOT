import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, History, User, LogOut } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">IoT</div>
        <span className="logo-text">MinhFarm</span>
      </div>

      {/* Menu */}
      <nav className="sidebar-nav">
        <Link to="/" className={`nav-item ${isActive('/')}`}>
          <LayoutDashboard size={22} />
          <span>Bảng điều khiển</span>
        </Link>
        
        <Link to="/datasensor" className={`nav-item ${isActive('/datasensor')}`}>
          <Database size={22} />
          <span>Dữ liệu cảm biến</span>
        </Link>
        
        <Link to="/actionhistory" className={`nav-item ${isActive('/actionhistory')}`}>
          <History size={22} />
          <span>Lịch sử hoạt động</span>
        </Link>
        
        <Link to="/profile" className={`nav-item ${isActive('/profile')}`}>
          <User size={22} />
          <span>Hồ sơ</span>
        </Link>
      </nav>
      
    </aside>
  );
}