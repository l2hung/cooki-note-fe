import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './FriendsPage.css'; // Đảm bảo import file CSS

// --- Icons ---
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
// Icon cho thẻ Bạn Bếp (lấy từ ảnh)
const RecipeCountIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#666" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12c0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4 4-1.79 4-4zM8 12c0 2.21-1.79 4-4 4s-4-1.79-4-4 1.79-4 4-4 4 1.79 4 4zM12 20c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
    </svg>
);
// Icons cho thẻ Feed (từ bước trước)
const HeartIcon = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" 
        fill={filled ? '#ff4757' : 'none'} 
        stroke={filled ? '#ff4757' : 'currentColor'} 
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);

// --- API Client ---
const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});

// --- Component Chính ---
const FriendsPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('feed'); // 'feed' hoặc 'list'
    
    const [feedRecipes, setFeedRecipes] = useState([]);
    const [followingList, setFollowingList] = useState([]); // State mới cho danh sách bạn
    const [likedRecipeIds, setLikedRecipeIds] = useState(new Set());
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }
        apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;

        const fetchFeed = async () => {
            setLoading(true);
            setError('');
            try {
                // Gọi 3 API cùng lúc
                const fetchCurrentUser = apiClient.get('/users/me');
                const fetchAllRecipes = apiClient.get('/recipes?sort=createdAt,desc&size=50');
                const fetchMyLikes = apiClient.get('/recipes/like'); 

                const [userRes, recipeRes, likeRes] = await Promise.all([
                    fetchCurrentUser,
                    fetchAllRecipes,
                    fetchMyLikes
                ]);

                // 1. Xử lý Like
                const myLikedRecipes = likeRes.data?.data || [];
                const likedIds = new Set(myLikedRecipes.map(recipe => recipe.id));
                setLikedRecipeIds(likedIds);

                // 2. Lấy danh sách đang theo dõi
                const myFollowings = userRes.data?.data?.followings || [];
                setFollowingList(myFollowings); // <-- LƯU VÀO STATE MỚI
                
                const followedUserIds = new Set(
                    myFollowings.map(follow => follow.following.id)
                );

                if (followedUserIds.size === 0) {
                    setFeedRecipes([]);
                    // Không set loading false ở đây
                } else {
                    // 3. Lọc công thức cho Feed
                    const allRecentRecipes = recipeRes.data?.data || [];
                    const feed = allRecentRecipes.filter(recipe => 
                        followedUserIds.has(recipe.user.id)
                    );
                    setFeedRecipes(feed);
                }

            } catch (err) {
                console.error("Lỗi khi tải feed:", err);
                setError("Không thể tải feed của bạn bếp.");
            } finally {
                setLoading(false);
            }
        };

        window.addEventListener('focus', fetchFeed);
        fetchFeed(); 

        return () => {
            window.removeEventListener('focus', fetchFeed);
        };
    }, [navigate]);

    const renderContent = () => {
        if (loading) {
            return <div className="loading-container">Đang tải...</div>;
        }
        if (error) {
            return <p className="error-message">{error}</p>;
        }

        // Render Tab Feed
        if (activeTab === 'feed') {
            if (feedRecipes.length === 0) {
                return (
                    <div className="empty-feed">
                        <h4>Feed đang trống</h4>
                        <p>Hãy theo dõi thêm nhiều bạn bếp để xem công thức mới nhất của họ tại đây!</p>
                        <Link to="/search" className="find-friends-button">Tìm bạn bếp</Link>
                    </div>
                );
            }
            return (
                <div className="feed-container">
                    {feedRecipes.map(recipe => (
                        <RecipeFeedCard 
                            key={recipe.id} 
                            recipe={recipe} 
                            initialIsLiked={likedRecipeIds.has(recipe.id)}
                        />
                    ))}
                </div>
            );
        }

        // Render Tab Danh Sách Bạn
        if (activeTab === 'list') {
            return <FollowingList users={followingList} />;
        }

        return null;
    };

    return (
        <div className="friends-page">
            <header className="friends-page-header">
                <button onClick={() => navigate(-2)} className="back-button">
                    <ArrowLeftIcon />
                </button>
        
            </header>
            
         
            <nav className="friends-tabs">
                <button 
                    className={`tab-button ${activeTab === 'feed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feed')}
                >
                    Hoạt động
                </button>
                <button 
                    className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
                    onClick={() => setActiveTab('list')}
                >
                    Các Bạn Bếp ({followingList.length})
                </button>
            </nav>
        

            <main>
                {renderContent()}
            </main>
        </div>
    );
};


const RecipeFeedCard = ({ recipe, initialIsLiked }) => {

    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const author = recipe.user;
    const latestAvatar = author.medias?.slice().reverse().find(m => m.type === 'AVATAR');
    const avatarUrl = latestAvatar ? `${latestAvatar.media.url}?t=${new Date().getTime()}` : null;
    const avatarLetter = author.firstName ? author.firstName.charAt(0).toUpperCase() : (author.username ? author.username.charAt(0).toUpperCase() : '?');
    const handleNavigateToRecipe = () => navigate(`/recipe/${recipe.id}`);
    const handleNavigateToProfile = (e) => { e.stopPropagation(); navigate(`/profile/${author.id}`); };
    const handleLike = async (e) => { 
        e.stopPropagation(); 
        if (isLikeLoading) return;
        setIsLikeLoading(true);
        const originalIsLiked = isLiked;
        setIsLiked(!originalIsLiked);
        try {
            if (originalIsLiked) { await apiClient.delete(`/like/recipe/${recipe.id}`); }
            else { await apiClient.post(`/like/recipe/${recipe.id}`); }
        } catch (err) {
            console.error("Lỗi khi like/unlike:", err);
            setIsLiked(originalIsLiked); 
            alert(err.response?.data?.message || "Đã xảy ra lỗi.");
        } finally {
            setIsLikeLoading(false);
        }
    };

    return (
        <div className="feed-card" onClick={handleNavigateToRecipe}>
            <div className="feed-card-header">
                <div className="feed-author-info" onClick={handleNavigateToProfile}>
                    {avatarUrl ? (
                        <img src={avatarUrl} key={avatarUrl} alt={author.username} className="feed-author-avatar" />
                    ) : (
                        <div className="feed-author-avatar-letter">{avatarLetter}</div>
                    )}
                    <span className="feed-author-name">{author.username}</span>
                </div>
            </div>
            <img 
                src={recipe.medias?.[0]?.media?.url || 'https://via.placeholder.com/400x250'} 
                alt={recipe.title} 
                className="feed-card-image" 
            />
            <div className="feed-card-content">
                <div className="feed-card-actions">
                    <button className="feed-action-button" onClick={handleLike} disabled={isLikeLoading}>
                        <HeartIcon filled={isLiked} />
                    </button>
                </div>
                <h3 className="feed-card-title">{recipe.title}</h3>
            </div>
        </div>
    );
};


// --- Component MỚI: Danh sách Bạn Bếp (Tab 2) ---
const FollowingList = ({ users }) => {
    if (users.length === 0) {
        return (
            <div className="empty-feed">
                <h4>Bạn chưa theo dõi ai</h4>
                <p>Hãy tìm kiếm và theo dõi các bạn bếp để xem danh sách của họ tại đây!</p>
                <Link to="/search" className="find-friends-button">Tìm bạn bếp</Link>
            </div>
        );
    }
    return (
        <div className="friends-list-container">
            {/* Thanh sắp xếp giống ảnh */}
            <div className="friends-list-options">
                <span>Sắp xếp theo thứ tự tương tác mới nhất</span>
            </div>
            {/* Danh sách người dùng */}
            {users.map(follow => (
                <UserFollowCard key={follow.following.id} user={follow.following} />
            ))}
        </div>
    );
};


const UserFollowCard = ({ user }) => {
    const navigate = useNavigate();
    
    // Logic avatar mới nhất
    const latestAvatar = user.medias?.slice().reverse().find(m => m.type === 'AVATAR');
    const avatarUrl = latestAvatar ? `${latestAvatar.media.url}?t=${new Date().getTime()}` : null;
    const avatarLetter = user.firstName ? user.firstName.charAt(0).toUpperCase() : (user.username ? user.username.charAt(0).toUpperCase() : '?');

    const goToProfile = () => navigate(`/profile/${user.id}`);


    const recipeCount = user.recipes?.length || 0; 

    return (
        <div className="user-follow-card" onClick={goToProfile}>
            {/* Avatar */}
            {avatarUrl ? (
                <img src={avatarUrl} key={avatarUrl} alt={user.username} className="user-card-avatar" />
            ) : (
                <div className="user-card-avatar-letter">{avatarLetter}</div>
            )}
            {/* Thông tin */}
            <div className="user-card-info">
                <span className="user-card-name">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username}</span>
                <span className="user-card-username">@{user.username}</span>
                {/* Sửa: Hiển thị số lượng công thức nếu có */}
                {recipeCount > 0 && (
                    <span className="user-card-recipes">
                        <RecipeCountIcon /> {recipeCount} món
                    </span>
                )}
            </div>
            {/* Nút "Bạn bếp" (như trong ảnh) */}
            <button className="follow-status-button" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${user.id}`); }}>
                Bạn bếp
            </button>
        </div>
    );
};

export default FriendsPage;
