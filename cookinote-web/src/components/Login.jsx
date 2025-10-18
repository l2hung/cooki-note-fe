import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import './Login.css';

// Biến này không cần thiết khi dùng proxy
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleLogin = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      alert('Lỗi: Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      // Đảm bảo request đi qua proxy của Vite
      const response = await fetch('/api/v1/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();

      // Giả sử backend trả về token trong `json.data.accessToken` hoặc `json.data.token`
      // Bạn hãy kiểm tra lại cấu trúc response từ API login cho chính xác
      const token = json.data?.token || json.data?.accessToken;

      if (response.ok && token) {
        // === SỬA LỖI TẠI ĐÂY ===
        // Lưu token vào localStorage với đúng key là 'jwt_token'
        localStorage.setItem('jwt_token', token);
        
        // Không nên dùng alert(), nó làm gián đoạn luồng ứng dụng
        // alert('Đăng nhập thành công!'); 
        navigate('/home'); // Chuyển đến trang Home
      } else {
        alert(`Đăng nhập thất bại: ${json.message || 'Email hoặc mật khẩu không đúng.'}`);
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      alert('Lỗi kết nối: Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form className="auth-form" onSubmit={handleLogin}>
        <img
          src="https://res.cloudinary.com/dqegnnt2w/image/upload/v1755990799/logo.png"
          alt="Cookinote Logo"
          className="logo"
        />
        <h2>Chào mừng trở lại!</h2>
        <input
          type="email"
          className="input-field"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          className="input-field"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
        <p className="switch-form-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </form>
    </div>
  );
}

