import React from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { 
  GraduationCap, Phone, Mail, MapPin, 
  Github, Figma, FileText, Code, Database 
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
  return (
    <div className="profile-layout">
      <Sidebar />
      
      <div className="profile-main">
        <div className="profile-grid">
          
          {/* --- CỘT TRÁI: IDENTITY CARD --- */}
          <div className="card-box identity-card">
            {/* Banner trang trí */}
            <div className="card-banner"></div>
            
            <div className="avatar-container">
              <img 
                src="https://img.freepik.com/free-vector/young-man-with-glasses-avatar_1308-175763.jpg" 
                alt="User Avatar" 
                className="avatar-img" 
              />
            </div>

            <h2 className="user-name">Nguyễn Ngọc Minh</h2>
            <p className="user-role">Fullstack & Game Developer</p>

            {/* Chỉ số nhỏ */}
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-num">12</span>
                <span className="stat-label">Dự án</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">3+</span>
                <span className="stat-label">Năm KN</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">PTIT</span>
                <span className="stat-label">Đại học</span>
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div className="contact-list">
              <div className="contact-item">
                <GraduationCap size={18} className="contact-icon" />
                <span>B22DCPT169 - D22PTDPT01</span>
              </div>
              <div className="contact-item">
                <Phone size={18} className="contact-icon" />
                <span>0962 713 426</span>
              </div>
              <div className="contact-item">
                <Mail size={18} className="contact-icon" />
                <span>nnminh240704@gmail.com</span>
              </div>
              <div className="contact-item">
                <MapPin size={18} className="contact-icon" />
                <span>Hà Nội, Việt Nam</span>
              </div>
            </div>
          </div>

          {/* --- CỘT PHẢI: CHI TIẾT --- */}
          <div className="right-column">
            
            {/* Section 1: Giới thiệu */}
            <div className="card-box">
              <h3 className="section-title">Giới thiệu</h3>
              <p className="bio-text">
                Xin chào, mình là Minh. Mình là sinh viên Học viện Công nghệ Bưu chính Viễn thông với niềm đam mê lớn trong việc xây dựng các ứng dụng Web và Game. 
                Mình có kinh nghiệm làm việc với Unreal Engine, ReactJS, Node.js và các hệ thống IoT. 
                Mục tiêu của mình là trở thành một lập trình viên đa năng, có thể xây dựng các sản phẩm công nghệ hoàn chỉnh từ phần cứng đến phần mềm.
              </p>
            </div>

            {/* Section 2: Kỹ năng & Công nghệ (MỚI) */}
            <div className="card-box">
              <h3 className="section-title">Kỹ năng & Công nghệ</h3>
              <div className="skills-container">
                <span className="skill-tag">C++ / C#</span>
                <span className="skill-tag">Unreal Engine 5</span>
                <span className="skill-tag">ReactJS</span>
                <span className="skill-tag">Node.js / Express</span>
                <span className="skill-tag">MySQL / MongoDB</span>
                <span className="skill-tag">IoT / Arduino</span>
                <span className="skill-tag">UI/UX Design</span>
                <span className="skill-tag">Git / Github</span>
              </div>
            </div>

            {/* Section 3: Tài liệu & Liên kết */}
            <div className="card-box">
              <h3 className="section-title">Tài liệu & Báo cáo</h3>
              <div className="doc-grid">
                
                <a href="#" className="doc-card">
                  <div className="doc-icon-box bg-light-blue">
                    <Figma />
                  </div>
                  <div className="doc-info">
                    <span className="doc-name">Figma Design</span>
                    <span className="doc-desc">UI/UX Prototype</span>
                  </div>
                </a>

                <a href="#" className="doc-card">
                  <div className="doc-icon-box bg-light-dark">
                    <Github />
                  </div>
                  <div className="doc-info">
                    <span className="doc-name">Source Code</span>
                    <span className="doc-desc">Repository</span>
                  </div>
                </a>

                <a href="#" className="doc-card">
                  <div className="doc-icon-box bg-light-orange">
                    <FileText />
                  </div>
                  <div className="doc-info">
                    <span className="doc-name">Báo cáo PDF</span>
                    <span className="doc-desc">Đồ án môn học</span>
                  </div>
                </a>

                <a href="#" className="doc-card">
                  <div className="doc-icon-box bg-light-green">
                    <Database />
                  </div>
                  <div className="doc-info">
                    <span className="doc-name">API Docs</span>
                    <span className="doc-desc">Swagger UI</span>
                  </div>
                </a>

              </div>
            </div>

          </div> {/* End Right Column */}

        </div>
      </div>
    </div>
  );
}