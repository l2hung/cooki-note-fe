import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css'; 

// --- Icons ---
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const EditIcon = () => <>&#9999;&#65039;</>;
const ShareIcon = () => <>&#128279;</>;
const UserIcon = () => <>&#128100;</>;
const CameraIcon = () => <>&#128247;</>;
const BioIcon = () => <>&#128172;</>;
const FindFriendsIcon = () => <>&#128101;</>;
const RecipeIcon = () => <>&#127858;</>;
// --- KẾT THÚC VÙNG SỬA ---


const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});



// --- ProfilePage Component ---
const ProfilePage = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [userRecipes, setUserRecipes] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState('');

    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

   // Dùng useMemo để isOwnProfile chỉ tính lại khi userId thay đổi
    const isOwnProfile = useMemo(() => {
        const currentUserId = localStorage.getItem('user_id');
        return userId === 'me' || String(userId) === String (currentUserId);
    }, [userId]);
    
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }

        apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
        let isMounted = true; 

        const fetchUserProfileAndRecipes = async () => {
            if (isMounted) {
                setLoading(true);
                setError('');
            }

            try {
                // Bước 1: Luôn lấy thông tin của hồ sơ đang xem
                const profileEndpoint = isOwnProfile ? '/users/me' : `/users/${userId}`;
                const profileRes = await apiClient.get(profileEndpoint);
                const profileData = profileRes.data?.data;

                if (!isMounted) return;

                if (profileData) {
                    setUserProfile(profileData);

                    // Bước 2: Lấy công thức của người đó
                    const recipesRes = await apiClient.get(`/recipes/user/${profileData.id}?size=10&sort=createdAt,desc`);
                    if (isMounted) {
                        setUserRecipes(recipesRes.data?.data || []);
                    }

                    // Bước 3: Nếu đây KHÔNG phải hồ sơ của tôi, kiểm tra trạng thái follow
                    if (!isOwnProfile) {
                        const currentUserRes = await apiClient.get('/users/me');
                        const currentUserData = currentUserRes.data?.data;
                        if (!isMounted) return;

                    
                        if (currentUserData && currentUserData.followings) { 
                            const amIFollowing = currentUserData.followings.some(
                                (followedUser) => followedUser?.following?.id === profileData.id 
                            );
                            setIsFollowing(amIFollowing);
                        }
                       
                    }
                } else {
                    setError("Không tìm thấy thông tin người dùng.");
                    setUserProfile(null);
                    setUserRecipes([]);
                }

            } catch (err) {
                 if (!isMounted) return;
                console.error("Lỗi khi tải dữ liệu trang hồ sơ:", err);
                setError(err.response?.data?.message || "Không thể tải hồ sơ người dùng. Vui lòng thử lại.");
                setUserProfile(null);
                setUserRecipes([]);
            } finally {
                 if (isMounted) {
                    setLoading(false);
                 }
            }
        };

        fetchUserProfileAndRecipes();

        // Listener để tải lại dữ liệu khi quay lại tab/trang
        window.addEventListener('focus', fetchUserProfileAndRecipes);

        return () => {
            isMounted = false;
            window.removeEventListener('focus', fetchUserProfileAndRecipes);
        };

    }, [userId, navigate, isOwnProfile]);


    // --- Helper Functions ---
    const calculateProfileCompletion = (user) => {
        if (!user) return { completed: 0, total: 3 };
        let completed = 0;
        const hasName = user.firstName || user.lastName;
        const hasAvatar = user.medias?.slice().reverse().find(m => m.type === 'AVATAR')?.media?.url;
        const hasBio = user.biography && user.biography.trim() !== '';
        if (hasName) completed++;
        if (hasAvatar) completed++; 
        if (hasBio) completed++;
        return { completed: completed, total: 3 };
    };

    // Các hàm điều hướng
    const handleEditProfile = () => navigate('/profile/edit'); 
    const handleShareProfile = () => {
        const profileUrl = window.location.href;
        navigator.clipboard.writeText(profileUrl)
            .then(() => alert('Đã sao chép liên kết hồ sơ!'))
            .catch(() => alert('Không thể sao chép liên kết.'));
    };
    const handleEditName = () => navigate('/profile/edit'); 
    const handleChangeAvatar = () => navigate('/profile/edit'); 
    const handleAddBio = () => navigate('/profile/edit'); 
    const handleFindFriends = () => navigate('/search'); 
    
    // Hàm Follow/Unfollow 
    const handleFollowToggle = async () => {
        if (isFollowLoading || !userProfile) return; 

        setIsFollowLoading(true);
        const originalFollowState = isFollowing;
        const originalFollowerCount = userProfile.followerCount;

        setIsFollowing(!originalFollowState);
        setUserProfile(prev => ({
            ...prev,
            followerCount: originalFollowState ? prev.followerCount - 1 : prev.followerCount + 1
        }));

        try {
            const targetId = userProfile.id;
            if (originalFollowState) {
                await apiClient.delete(`/follow/${targetId}`);
            } else {
                await apiClient.post(`/follow/${targetId}`);
            }
        } catch (err) {
            console.error("Lỗi khi follow/unfollow:", err);
            setIsFollowing(originalFollowState);
            setUserProfile(prev => ({
                ...prev,
                followerCount: originalFollowerCount
            }));
            alert(err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
        } finally {
            setIsFollowLoading(false);
        }
    };

    // --- Render Logic ---
    const profileCompletion = calculateProfileCompletion(userProfile);
    const displayUser = userProfile || { firstName: "", lastName: "", username: "...", medias: [], followerCount: 0, followingCount: 0 };
    const avatarLetter = displayUser.firstName ? displayUser.firstName.charAt(0).toUpperCase() : (displayUser.username ? displayUser.username.charAt(0).toUpperCase() : '?');

    const latestAvatar = displayUser.medias?.slice().reverse().find(m => m.type === 'AVATAR');
    const avatarUrl = latestAvatar ? `${latestAvatar.media.url}?t=${new Date().getTime()}` : null;
    

    if (loading) return <div className="loading-container">Đang tải hồ sơ...</div>;
    if (error) return <p className="error-message">{error}</p>;
    if (!userProfile) return <p className="error-message">Không tìm thấy thông tin người dùng.</p>;

    return (
        <div className="profile-page-wrapper">
            <header className="profile-page-header">
                <button
                    onClick={() => navigate(-2)}
                    className="back-button"
                    aria-label="Quay lại"
                    title="Quay lại"
                >
                    <ArrowLeftIcon />
                </button>
                <div className="header-placeholder"></div>
                <div className="header-placeholder"></div>
            </header>

            <main className="profile-content">
                {/* User Summary Section */}
                <section className="user-summary">
                     {avatarUrl ? (
                        <img src={avatarUrl} key={avatarUrl} alt="User Avatar" className="profile-avatar-large" />
                    ) : (
                        <div className="profile-avatar-letter-large">{avatarLetter}</div>
                    )}
                    <h1 className="profile-name">{`${displayUser.firstName || ''} ${displayUser.lastName || ''}`.trim() || displayUser.username}</h1>
                    <p className="profile-username">@{displayUser.username}</p>
                  <div className="profile-stats">
                       
                        <span>{displayUser.followers?.length || 0} Người quan tâm</span>
                        <span>&bull;</span>
                        <span>{displayUser.followings?.length || 0} Bạn bếp</span>
                    </div>
                    <div className="profile-actions">
                        {isOwnProfile ? (
                            <button onClick={handleEditProfile} className="action-button edit-button"><EditIcon /> Chỉnh sửa</button>
                        ) : (
                            <button 
                                onClick={handleFollowToggle}
                                className={`action-button ${isFollowing ? 'unfollow-button' : 'follow-button'}`}
                                disabled={isFollowLoading}
                            >
                                {isFollowLoading ? "Đang xử lý..." : (isFollowing ? "Đang theo dõi" : "Theo dõi")}
                            </button>
                        )}
                        <button onClick={handleShareProfile} className="action-button share-button"><ShareIcon /> Chia sẻ</button>
                    </div>
                </section>

                {/* Completion Section */}
                {isOwnProfile && profileCompletion.completed < profileCompletion.total && (
                     <section className="completion-section">
                        <h3>Hoàn thiện hồ sơ bếp của bạn</h3>
                        <p>{profileCompletion.completed} của {profileCompletion.total} Hoàn thiện</p>
                        <div className="completion-cards">
                            {(!userProfile?.firstName && !userProfile?.lastName) && (
                                <div className="completion-card">
                                    <UserIcon /> <h4>Thêm tên của bạn</h4>
                                    <p>Thêm tên để bạn bè biết đó là bạn.</p>
                                    <button onClick={handleEditName} className="card-action-button">Sửa tên</button>
                                </div>
                            )}
                            {!avatarUrl && (
                                <div className="completion-card">
                                    <CameraIcon /> <h4>Thêm 1 ảnh đại diện</h4>
                                    <p>Chọn một bức ảnh đại diện cho bạn.</p>
                                    <button onClick={handleChangeAvatar} className="card-action-button">Thay đổi ảnh</button>
                                </div>
                            )}
                            {(!userProfile?.biography || userProfile.biography.trim() === '') && (
                                <div className="completion-card">
                                    <BioIcon /> <h4>Thêm tiểu sử</h4>
                                    <p>Cho các bạn bếp biết thêm về bạn.</p>
                                    <button onClick={handleAddBio} className="card-action-button">Thêm tiểu sử</button>
                                </div>
                            )}
                            <div className="completion-card">
                                <FindFriendsIcon /> <h4>Tìm bạn bè để kết nối</h4>
                                <p>Kết thêm bạn bếp để vui nhiều hơn.</p>
                                <button onClick={handleFindFriends} className="card-action-button">Tìm bạn bè</button>
                            </div>
                        </div>
                    </section>
                )}

                {/* Profile Tabs */}
                <section className="profile-tabs single-tab">
                    <button className="tab-button active">
                       <RecipeIcon /> Công thức đã đăng tải ({userRecipes.length})
                    </button>
                </section>

                {/* Tab Content */}
                <section className="tab-content">
                    <div className="recipes-content">
                        {userRecipes.length > 0 ? (
                            <div className="recipes-grid">
                                {userRecipes.map(recipe => (
                                     <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="recipe-card-link">
                                        <div className="recipe-card">
                                            <img src={recipe.medias?.[0]?.media?.url || 'https://via.placeholder.com/150'} alt={recipe.title}/>
                                            <h3>{recipe.title}</h3>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="empty-tab-message">
                                {isOwnProfile ? "Bạn chưa đăng công thức nào." : "Người dùng này chưa đăng công thức nào."}
                            </p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProfilePage;
