import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Tái sử dụng CSS từ trang Login

export default function ForgotPassword() {
  // Trạng thái cho quy trình nhiều bước
  // 'enterEmail' -> 'enterOtp'
  const [stage, setStage] = useState('enterEmail'); 
  
  // Dữ liệu form
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Trạng thái UI
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Để hiển thị lỗi hoặc thành công
  
  const navigate = useNavigate();

  // BƯỚC 1 & 2: Gửi yêu cầu OTP
  const handleSendOtp = async (event) => {
    event.preventDefault();
    setMessage('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage('Lỗi: Vui lòng nhập một địa chỉ email hợp lệ.');
      return;
    }

    setLoading(true);

    try {
      // SỬA ĐỔI: Gọi đúng endpoint từ EmailController.java
      const params = new URLSearchParams({ email: email });
      const response = await fetch(`/api/v1/email/request-otp?${params.toString()}`, {
        method: 'GET',
      });

      const json = await response.json();

      if (response.ok) {
        setMessage('Đã gửi mã OTP thành công. Vui lòng kiểm tra email.');
        setStage('enterOtp'); // Chuyển sang bước 2
      } else {
        setMessage(`Lỗi: ${json.message || 'Email không tồn tại hoặc có lỗi xảy ra.'}`);
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      setMessage('Lỗi kết nối: Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  // BƯỚC 3 & 4: Gửi OTP và Mật khẩu mới
  // (Phần này đã chính xác, khớp với UserController.java)
  const handleResetPassword = async (event) => {
    event.preventDefault();
    setMessage('');

    // Kiểm tra phía client (backend cũng kiểm tra)
    if (newPassword !== confirmPassword) {
      setMessage('Lỗi: Mật khẩu và xác nhận mật khẩu không khớp.');
      return;
    }
    if (!otpCode || !newPassword) {
        setMessage('Lỗi: Vui lòng nhập đủ mã OTP và mật khẩu mới.');
      return;
    }

    setLoading(true);

    try {
      // Gọi API từ UserController của bạn
      const response = await fetch('/api/v1/users/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          otpCode: otpCode,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        }),
      });

      const json = await response.json();

      if (response.ok) {
        setMessage('Đặt lại mật khẩu thành công! Đang chuyển hướng bạn về trang đăng nhập...');
        // Chờ vài giây rồi chuyển về trang login
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
         // Hiển thị lỗi từ API (ví dụ: "Mã OTP không hợp lệ...")
        setMessage(`Lỗi: ${json.message || 'Đặt lại mật khẩu thất bại.'}`);
      }
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      setMessage('Lỗi kết nối: Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      {/* Sử dụng 'onSubmit' khác nhau tùy theo giai đoạn (stage)
      */}
      <form 
        className="auth-form" 
        onSubmit={stage === 'enterEmail' ? handleSendOtp : handleResetPassword}
      >
        <img
          src="https://res.cloudinary.com/dqegnnt2w/image/upload/v1755990799/logo.png"
          alt="Cookinote Logo"
          className="logo"
        />
        <h2>Đặt lại mật khẩu</h2>
        
        {/* Trường Email luôn hiển thị, nhưng sẽ bị vô hiệu hóa ở bước 2 */}
        <input
          type="email"
          className="input-field"
          placeholder="Nhập email của bạn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading || stage === 'enterOtp'} // Vô hiệu hóa khi đã gửi OTP
          required
        />

        {/* Chỉ hiển thị các trường này ở BƯỚC 2 ('enterOtp')
        */}
        {stage === 'enterOtp' && (
          <>
            <input
              type="text"
              className="input-field"
              placeholder="Nhập mã OTP từ email"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              disabled={loading}
              required
            />
            <input
              type="password"
              className="input-field"
              placeholder="Nhập mật khẩu mới"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              required
            />
            <input
              type="password"
              className="input-field"
              placeholder="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </>
        )}
        
        {/* Hiển thị thông báo lỗi/thành công */}
        {message && <p className="form-message">{message}</p>}

        {/* Thay đổi nút bấm tùy theo giai đoạn
        */}
        {stage === 'enterEmail' && (
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
          </button>
        )}

        {stage === 'enterOtp' && (
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        )}

        <p className="switch-form-link">
          Nhớ rồi? <Link to="/login">Quay lại Đăng nhập</Link>
        </p>
      </form>
    </div>
  );
}
