import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './MainLayout.css';


const SearchIcon = () => <>&#128269;</>; // 🔎
const BookIcon = () => <>&#128214;</>; // 📖

const MainLayout = () => {
    const location = useLocation(); // Hook để biết trang hiện tại

    return (
        <div className="layout-wrapper">
            <main className="layout-content">
                {/* Nội dung của các trang con sẽ hiển thị ở đây */}
                <Outlet />
            </main>

            {/* Nút "+" nổi */}
            <Link to="/recipes/new" className="floating-add-button">+</Link>

           
            <footer className="main-footer">
                <Link to="/search" className={`footer-item ${location.pathname.startsWith('/search') ? 'active' : ''}`}>
                    <SearchIcon />
                    <span>Tìm Kiếm</span>
                </Link>

                
                <Link
                    to="/liked" 
                    className={`footer-item ${location.pathname.startsWith('/liked') ? 'active' : ''}`} 
                >
                    <BookIcon />
                    <span>Công thức đã lưu</span>
                </Link>
                 {/* =============================== */}
            </footer>
        </div>
    );
};

export default MainLayout;