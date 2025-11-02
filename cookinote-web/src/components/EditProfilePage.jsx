import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditProfilePage.css'; 

// Icon Quay lại
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});

const EditProfilePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [error, setError] = useState('');
    
    // State cho các trường trong form
    const [avatarUrl, setAvatarUrl] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState(''); 
    const [biography, setBiography] = useState(''); 
    const [gender, setGender] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');

    // 1. Tải thông tin người dùng hiện tại
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
        
        apiClient.get('/users/me')
            .then(res => {
                const user = res.data?.data;
                if (user) {
                    setFirstName(user.firstName || '');
                    setLastName(user.lastName || '');
                    setUsername(user.username || '');
                    setBiography(user.biography || '');
                    setGender(user.gender || ''); 
                    setDateOfBirth(user.dateOfBirth || ''); 

                    // --- SỬA LỖI LOGIC (1) ---
                    // Tìm ảnh đại diện MỚI NHẤT (cuối cùng) thay vì ảnh đầu tiên
                    const avatar = user.medias?.slice().reverse().find(m => m.type === 'AVATAR')?.media?.url;
                    
                    if (avatar) {
                        setAvatarUrl(`${avatar}?t=${new Date().getTime()}`);
                    } else {
                        setAvatarUrl('');
                    }
                }
            })
            .catch(err => {
                console.error("Lỗi khi tải thông tin:", err);
                setError("Không thể tải thông tin hồ sơ.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    // 2. Xử lý khi nhấn nút "Cập nhật" (Profile info)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError('');

        const updateData = {
            firstName,
            lastName,
            username, 
            biography, 
            gender,      
            dateOfBirth: dateOfBirth ? dateOfBirth : null 
        };

        try {
            await apiClient.patch('/users/update-profile', updateData);
            alert("Cập nhật hồ sơ thành công!");
        } catch (err) {
            console.error("Lỗi khi cập nhật:", err);
            setError(err.response?.data?.message || "Cập nhật thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 3. Xử lý đổi ảnh đại diện
    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsAvatarUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file); 

        try {
            // Bước 1: Tải ảnh lên
            await apiClient.patch('/users/upload-avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Bước 2: Tải lên thành công, gọi GET /users/me để lấy URL mới
            const res = await apiClient.get('/users/me');
            const user = res.data?.data;

            if (user && user.medias) {
                // --- SỬA LỖI LOGIC (2) ---
                // Tìm ảnh đại diện MỚI NHẤT (cuối cùng)
                const newAvatarUrl = user.medias.slice().reverse().find(m => m.type === 'AVATAR')?.media?.url;
                
                if (newAvatarUrl) {
                    setAvatarUrl(`${newAvatarUrl}?t=${new Date().getTime()}`);
                    alert("Ảnh đại diện đã được cập nhật!");
                } else {
                    setError("Tải ảnh thành công, nhưng không thể làm mới ảnh đại diện.");
                }
            }
        } catch (err) {
            console.error("Lỗi khi upload avatar:", err);
            setError(err.response?.data?.message || "Tải ảnh đại diện thất bại. Vui lòng thử lại.");
        } finally {
            setIsAvatarUploading(false);
        }
    };

    if (loading) {
        return <div className="loading-container">Đang tải...</div>;
    }

    const avatarLetter = firstName ? firstName.charAt(0).toUpperCase() : (username ? username.charAt(0).toUpperCase() : '?');

    return (
        <form className="edit-profile-page" onSubmit={handleSubmit}>
            {/* Header */}
            <header className="edit-profile-header">
                <button type="button" onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeftIcon />
                </button>
                <h2>Chỉnh sửa hồ sơ</h2>
                <button type="submit" className="update-button" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Cập nhật"}
                </button>
            </header>

            {/* Avatar Section */}
            <section className="profile-avatar-section">
                {avatarUrl ? (
                    <img src={avatarUrl} key={avatarUrl} alt="Avatar" className="profile-avatar-edit" />
                ) : (
                    <div className="profile-avatar-letter-edit">
                        {avatarLetter}
                    </div>
                )}
                {/* Nút upload avatar */}
                <input 
                    type="file" 
                    id="avatar-upload" 
                    accept="image/*" 
                    style={{ display: 'none' }} 
                    onChange={handleAvatarChange}
                    disabled={isAvatarUploading}
                />
                <label htmlFor="avatar-upload" className={`change-avatar-button ${isAvatarUploading ? 'disabled' : ''}`}>
                    {isAvatarUploading ? "Đang tải ảnh..." : "Thay đổi ảnh đại diện"}
                </label>
            </section>

            {/* Form Fields */}
            <main className="form-content">
                {error && <p className="error-message">{error}</p>}

                <div className="form-group">
                    <label htmlFor="firstName">Tên</label>
                    <input
                        id="firstName"
                        type="text"
                        placeholder="Họ và Tên"
                        value={`${firstName} ${lastName}`}
                        onChange={(e) => {
                            const value = e.target.value;
                            const parts = value.split(' ');
                            setFirstName(parts[0] || '');
                            setLastName(parts.slice(1).join(' ') || '');
                        }}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="username">ID Cookpad (Username)</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="gender">Giới tính</label>
                    <select
                        id="gender"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                    >
                        <option value="">Chọn giới tính</option>
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                        <option value="UNDEFINED">Không tiết lộ</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="dateOfBirth">Ngày sinh</label>
                    <input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        max={new Date().toISOString().split('T')[0]} 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="biography">Vài dòng về bạn và đam mê nấu nướng</label>
                    <textarea
                        id="biography"
                        rows="3"
                        value={biography}
                        placeholder="Chia sẻ về bản thân..."
                        onChange={(e) => setBiography(e.g.target.value)}
                    />
                </div>
            </main>
        </form>
    );
};

export default EditProfilePage;