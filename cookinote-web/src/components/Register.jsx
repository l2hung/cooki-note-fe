import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      alert('Lỗi 😟: Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Lỗi 😟: Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, confirmPassword }),
        credentials: 'include', // Thêm để hỗ trợ cookies
      });

      const json = await response.json();

      if (response.status === 201) {
        alert('Thành công! 🎉: Tài khoản đã được tạo. Hãy quay lại trang đăng nhập.');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        alert(`Đăng ký thất bại: ${json.message || 'Đã có lỗi xảy ra.'}`);
      }
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
      alert('Lỗi kết nối: Không thể kết nối đến máy chủ. Hãy kiểm tra Console (F12) để xem chi tiết.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form className="auth-form" onSubmit={handleRegister}>
        <img
          src="https://res.cloudinary.com/dqegnnt2w/image/upload/v1755990799/logo.png"
          alt="Cookinote Logo"
          className="logo"
        />
        <h2>Tạo tài khoản mới</h2>

        <input
          type="text"
          className="input-field"
          placeholder="Tên người dùng"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />
        <input
          type="email"
          className="input-field"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          className="input-field"
          placeholder="Mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <input
          type="password"
          className="input-field"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading}
        />

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </button>

        <p className="switch-form-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}