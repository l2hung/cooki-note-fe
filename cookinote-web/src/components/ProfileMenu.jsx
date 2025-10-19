import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProfileMenu.css'; // File CSS riêng cho menu

// Icons
const UserIcon = () => <>&#128100;</>;
const FriendsIcon = () => <>&#128101;</>;
const StatsIcon = () => <>&#128202;</>;
const ClockIcon = () => <>&#9200;</>;
const SettingsIcon = () => <>&#9881;&#65039;</>;
const QuestionIcon = () => <>&#10067;</>;
const SendIcon = () => <>&#128319;</>;

const ProfileMenu = ({ user, onClose }) => {
    const navigate = useNavigate();

    // Hàm này giúp đóng menu sau khi người dùng chọn một mục
    const handleNavigate = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    // Dữ liệu mẫu để hiển thị trong trường hợp `user` chưa được tải
    const displayUser = user || {
        firstName: "Guest",
        lastName: "User",
        username: "guest_user",
        medias: [],
        followerCount: 0,
        followingCount: 0
    };

    const avatarLetter = displayUser.firstName ? displayUser.firstName.charAt(0).toUpperCase() : 'G';
    const avatarUrl = displayUser.medias?.[0]?.media?.url;

    return (
        // Lớp phủ mờ phía sau, khi click sẽ đóng menu
        <div className="profile-menu-overlay" onClick={onClose}>
            {/* Container chính của menu, ngăn sự kiện click lan ra ngoài */}
            <div className="profile-menu-container" onClick={(e) => e.stopPropagation()}>
                <div className="user-info-section">
                    {avatarUrl ? (
                         <img src={avatarUrl} alt="User Avatar" className="profile-avatar" />
                    ) : (
                        <div className="profile-avatar-letter">{avatarLetter}</div>
                    )}
                   
                    <div className="user-details">
                        <span className="user-name">{`${displayUser.firstName || ''} ${displayUser.lastName || ''}`.trim()}</span>
                        <span className="user-username">@{displayUser.username}</span>
                        <div className="user-stats">
                            <span>{displayUser.followerCount || 0} Người quan tâm</span>
                            <span>{displayUser.followingCount || 0} Bạn bếp</span>
                        </div>
                    </div>
                </div>

                <nav className="menu-options">
                    <Link to={`/profile/${displayUser.id || 'me'}`} className="menu-item" onClick={() => handleNavigate(`/profile/${displayUser.id || 'me'}`)}>
                        <UserIcon /> Bếp Cá Nhân
                    </Link>
                    <Link to="/friends" className="menu-item" onClick={() => handleNavigate('/friends')}>
                        <FriendsIcon /> Các Bạn Bếp
                    </Link>
                    <Link to="/stats" className="menu-item" onClick={() => handleNavigate('/stats')}>
                        <StatsIcon /> Thống Kê Bếp
                    </Link>
                    <Link to="/history" className="menu-item" onClick={() => handleNavigate('/history')}>
                        <ClockIcon /> Món đã xem gần đây
                    </Link>
                    <hr className="menu-divider" />
                    <Link to="/settings" className="menu-item" onClick={() => handleNavigate('/settings')}>
                        <SettingsIcon /> Cài Đặt
                    </Link>
                    <Link to="/faq" className="menu-item" onClick={() => handleNavigate('/faq')}>
                        <QuestionIcon /> Những Câu Hỏi Thường Gặp
                    </Link>
                    <Link to="/feedback" className="menu-item" onClick={() => handleNavigate('/feedback')}>
                        <SendIcon /> Gửi phản hồi
                    </Link>
                </nav>
            </div>
        </div>
    );
};

export default ProfileMenu;
