import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ProfileMenu.css'; 

// Icons
const UserIcon = () => <>&#128100;</>;
const FriendsIcon = () => <>&#128101;</>;
const StatsIcon = () => <>&#128202;</>;
const ClockIcon = () => <>&#9200;</>;
const SettingsIcon = () => <>&#9881;&#65039;</>;
const LogoutIcon = () => <>&#128682;</>; 
const CartIcon = () => <>&#128722;</>; 
const SparkleIcon = () => <>&#10024;</>; 


const ProfileMenu = ({ user, onClose }) => {
    const navigate = useNavigate();

    
    const handleNavigate = (path) => {
        navigate(path);
        if (onClose) onClose();
    };


    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_id');
        
        console.log("Đã dọn dẹp localStorage và đăng xuất.");

        if (onClose) onClose();
        
        navigate('/login', { replace: true }); 
    };

    
    const displayUser = user || {
        firstName: "Guest",
        lastName: "User",
        username: "guest_user",
        medias: [],
        followers: [], 
        followings: [] 
    };


    const avatarLetter = displayUser.firstName ? displayUser.firstName.charAt(0).toUpperCase() : (displayUser.username ? displayUser.username.charAt(0).toUpperCase() : 'G');
    const latestAvatar = displayUser.medias?.slice().reverse().find(m => m.type === 'AVATAR');
    const avatarUrl = latestAvatar ? `${latestAvatar.media.url}?t=${new Date().getTime()}` : null;


    return (
       
        <div className="profile-menu-overlay" onClick={onClose}>
            
            <div className="profile-menu-container" onClick={(e) => e.stopPropagation()}>
                <div className="user-info-section">
                    
                    {avatarUrl ? (
                        <img src={avatarUrl} key={avatarUrl} alt="User Avatar" className="profile-avatar" />
                    ) : (
                       
                        <div className="profile-avatar">{avatarLetter}</div>
                    )}
                   

                    <div className="user-details">
                        <span className="user-name">{`${displayUser.firstName || ''} ${displayUser.lastName || ''}`.trim()}</span>
                        <span className="user-username">@{displayUser.username}</span>
                        <div className="user-stats">
                            <span>{displayUser.followers?.length || 0} Người quan tâm</span>
                            <span>{displayUser.followings?.length || 0} Bạn bếp</span>
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
                 
                    <Link to="/shopping-list" className="menu-item" onClick={() => handleNavigate('/shopping-list')}>
                        <CartIcon /> Danh sách đi chợ
                    </Link>
                    <Link to="/ai-suggest" className="menu-item" onClick={() => handleNavigate('/ai-suggest')}>
                        <SparkleIcon /> AI Gợi ý món ăn
                    </Link>
                    
                    <hr className="menu-divider" />
                    <div className="menu-item menu-item-logout" onClick={handleLogout}>
                        <LogoutIcon /> Đăng xuất
                    </div>

                </nav>
            </div>
        </div>
    );
};

export default ProfileMenu;
