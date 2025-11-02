import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SettingsPage.css'; 

// --- Icons ---
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const PasswordIcon = () => <>&#128274;</>; 
const DeleteIcon = () => <>&#128465;&#65039;</>; 
const ArrowRightIcon = () => <>&#8250;</>;  


const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});

const SettingsPage = () => {
    const navigate = useNavigate();
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }
        apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
    }, [navigate]);


    return (
        <div className="settings-page">
            <header className="settings-page-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeftIcon />
                </button>
                <h1>Cài Đặt</h1>
                <div style={{ width: '24px' }}></div> 
            </header>

            <main>
                {/* --- Phần Tài khoản --- */}
                <h2 className="section-title">Tài khoản</h2>
                <div className="settings-group">
                    <div 
                        className="setting-item" 
                        onClick={() => setShowChangePasswordModal(true)}
                    >
                        <span className="setting-icon"><PasswordIcon /></span>
                        <span className="setting-label">Đổi mật khẩu</span>
                        <span className="setting-arrow"><ArrowRightIcon /></span>
                    </div>
                </div>

                {/* --- Phần Xóa tài khoản --- */}
                <h2 className="section-title">Nguy hiểm</h2>
                <div className="settings-group">
                    <div 
                        className="setting-item delete-item"
                        onClick={() => setShowDeleteAccountModal(true)}
                    >
                        <span className="setting-icon"><DeleteIcon /></span>
                        <span className="setting-label">Xóa tài khoản</span>
                        <span className="setting-arrow"><ArrowRightIcon /></span>
                    </div>
                </div>
            </main>

            {showChangePasswordModal && (
                <ChangePasswordModal 
                    onClose={() => setShowChangePasswordModal(false)} 
                />
            )}
            {showDeleteAccountModal && (
                <DeleteAccountModal 
                    onClose={() => setShowDeleteAccountModal(false)} 
                    navigate={navigate}
                />
            )}
        </div>
    );
};

const ChangePasswordModal = ({ onClose }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmNewPassword) {
            setError("Mật khẩu mới không khớp. Vui lòng nhập lại.");
            return;
        }

        setLoading(true);
        try {
            // Gọi API từ UserController.java
            const payload = { currentPassword, newPassword, confirmNewPassword };
            await apiClient.patch('/users/change-password', payload);
            
            alert("Đổi mật khẩu thành công!");
            onClose();
        } catch (err) {
            console.error("Lỗi khi đổi mật khẩu:", err);
            setError(err.response?.data?.message || "Đổi mật khẩu thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <h2>Đổi mật khẩu</h2>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="currentPass">Mật khẩu hiện tại</label>
                        <input type="password" id="currentPass" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPass">Mật khẩu mới</label>
                        <input type="password" id="newPass" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPass">Xác nhận mật khẩu mới</label>
                        <input type="password" id="confirmPass" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required />
                    </div>
                    
                    {error && <p className="modal-error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="modal-button secondary" onClick={onClose}>Hủy</button>
                        <button type="submit" className="modal-button primary" disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- Component Modal Xóa Tài Khoản ---
const DeleteAccountModal = ({ onClose, navigate }) => {
    const [confirmText, setConfirmText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (confirmText !== 'XÓA') {
            setError('Vui lòng gõ chính xác "XÓA" để xác nhận.');
            return;
        }

        setLoading(true);
        try {
            // Giả định API là DELETE /users/me
            await apiClient.delete('/users/me'); 
            
            alert("Tài khoản của bạn đã được xóa vĩnh viễn.");
            // Xóa token và điều hướng về trang login
            localStorage.clear();
            navigate('/login', { replace: true });

        } catch (err) {
            console.error("Lỗi khi xóa tài khoản:", err);
            setError(err.response?.data?.message || "Xóa tài khoản thất bại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <h2>Bạn có chắc chắn?</h2>
                <p>Hành động này **không thể hoàn tác**. Tất cả công thức và dữ liệu của bạn sẽ bị xóa vĩnh viễn. </p>
                <p>Vui lòng gõ <strong style={{ color: '#ff4757' }}>XÓA</strong> vào ô bên dưới để xác nhận.</p>
                
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="confirmDelete">Nhập "XÓA"</label>
                        <input type="text" id="confirmDelete" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
                    </div>
                    
                    {error && <p className="modal-error">{error}</p>}

                    <div className="modal-actions">
                        <button type="button" className="modal-button secondary" onClick={onClose}>Hủy</button>
                        <button type="submit" className="modal-button danger" disabled={loading}>
                            {loading ? 'Đang xóa...' : 'Xóa tài khoản'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsPage;
