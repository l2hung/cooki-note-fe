import React from 'react';
import { Link } from 'react-router-dom'; 
import './Welcome.css';

export default function Welcome() {
  return (
    <div className="welcome-container">
      <img
        src="https://res.cloudinary.com/dqegnnt2w/image/upload/v1755990799/logo.png"
        alt="Cookinote Logo"
        className="welcome-logo"
      />
      <h1 className="welcome-title">Chào mừng bạn đến với Cookinote!</h1>
      <p className="welcome-subtitle">Đăng nhập để khám phá nhiều công thức món ăn ngon.</p>
      <Link to="/login" className="welcome-button">
        Đăng ký hoặc đăng nhập
      </Link>
    </div>
  );
}