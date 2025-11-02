import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); 
  const location = useLocation(); 

  const from = location.state?.from || '/home'; 

  const handleLogin = async (event) => {
    event.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Lỗi: Vui lòng nhập một địa chỉ email hợp lệ.');
      return;
    }


    if (!email || !password) {
      alert('Lỗi: Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);
    let loginSuccess = false; 

    try {
      const response = await fetch('/api/v1/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();
      const token = json.data?.token;

      if (response.ok && token) {
        // 1. Lưu token JWT
        localStorage.setItem('jwt_token', token);

        // 2. Giải mã token
        try {
            const decodedToken = jwtDecode(token);
            
            // 3. Lấy và lưu user_id
            const currentUserId = decodedToken.userId; 

            if (currentUserId) {
                localStorage.setItem('user_id', currentUserId);
                console.log('✅ Đã lưu user_id vào localStorage:', currentUserId);
                loginSuccess = true; 
                // 4. Điều hướng
                navigate(from, { replace: true }); 
            } else {
                console.error("Lỗi: Không tìm thấy claim 'userId' trong token.");
                alert('Đăng nhập thất bại: Token không hợp lệ.');
            }
        } catch (decodeError) {
             console.error("Lỗi giải mã token:", decodeError);
             alert('Đăng nhập thất bại: Token không hợp lệ.');
        }

      } else {
        alert(`Đăng nhập thất bại: ${json.message || 'Email hoặc mật khẩu không đúng.'}`);
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      alert('Lỗi kết nối: Không thể kết nối đến máy chủ.');
    } finally {
      if (!loginSuccess) {
        setLoading(false);
      }
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
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
        

        <p className="forgot-password-link">
          <Link to="/forgot-password">Quên mật khẩu?</Link>
        </p>

        <p className="switch-form-link">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </form>
    </div>
  );
}
