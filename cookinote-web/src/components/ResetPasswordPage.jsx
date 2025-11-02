import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './ResetPasswordPage.css'; // Import file CSS

const ResetPasswordPage = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Lấy email từ trang "Quên mật khẩu"
  const email = location.state?.email;

  // Nếu không có email (người dùng vào thẳng trang này), đá về trang login
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleResetPassword = async (event) => {
    event.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Lỗi: Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // BƯỚC 2: GỌI API TỪ UserController.java
      const payload = {
        email: email,
        otpCode: otp,
        newPassword: newPassword,
        confirmPassword: confirmPassword
      };
      
      const response = await fetch('/api/v1/users/reset-password', {
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (response.ok) {
        setSuccess('Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(json.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
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
      <form className="auth-form" onSubmit={handleResetPassword}>
        <img
          src="https://res.cloudinary.com/dqegnnt2w/image/upload/v1755990799/logo.png"
          alt="Cookinote Logo"
          className="logo"
        />
        <h2>Đặt lại mật khẩu</h2>
        <p style={{ color: '#555', fontSize: '15px', marginTop: '-15px', marginBottom: '20px' }}>
          Mã OTP đã được gửi đến: <strong>{email || '...'}</strong>
        </p>

        {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}
        {success && <p style={{ color: 'green', fontSize: '14px' }}>{success}</p>}

        <input
          type="text"
          className="input-field"
          placeholder="Nhập mã OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          disabled={loading || !!success}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={loading || !!success}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={loading || !!success}
          required
        />

        <button type="submit" className="submit-button" disabled={loading || !!success}>
          {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        </button>
        <p className="switch-form-link">
          <Link to="/login">Quay lại Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPasswordPage;