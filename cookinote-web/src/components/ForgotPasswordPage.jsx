import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPasswordPage.css'; 

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = async (event) => {
    event.preventDefault();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Lỗi: Vui lòng nhập một địa chỉ email hợp lệ.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // BƯỚC 1: GỌI API GỬI OTP
      const response = await fetch('/api/v1/users/send-otp', { // endpoint giả lập gửi OTP
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await response.json();

      if (response.ok) {
        setSuccess('Đã gửi mã OTP. Vui lòng kiểm tra email của bạn.');
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 2000);
      } else {
        setError(json.message || 'Email không tồn tại trong hệ thống.');
      }
    } catch (err) {
      console.error('Lỗi kết nối:', err);
      setError('Lỗi kết nối: Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form className="auth-form" onSubmit={handleSendOtp}>
        <img
          src="https://res.cloudinary.com/dqegnnt2w/image/upload/v1755990799/logo.png"
          alt="Cookinote Logo"
          className="logo"
        />
        <h2>Quên mật khẩu?</h2>
        <p style={{ color: '#555', fontSize: '15px', marginTop: '-15px', marginBottom: '20px' }}>
          Đừng lo! Nhập email của bạn để nhận mã OTP.
        </p>

        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        {success && <p style={{ color: 'green', fontSize: '14px' }}>{success}</p>}

        <input
          type="email"
          className="input-field"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || !!success} 
          required
        />
        <button type="submit" className="submit-button" disabled={loading || !!success}>
          {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
        </button>
        <p className="switch-form-link">
          <Link to="/login">Quay lại Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPasswordPage;
