import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Link đã được import sẵn
import ProfileMenu from './ProfileMenu'; 
import './Home.css'; 


const SearchIcon = () => <>&#128269;</>;
const BellIcon = () => <>&#128276;</>;
const BookIcon = () => <>&#128214;</>;

// --- SỬA: Tách apiClient ra ngoài ---
const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});


const Home = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); 


    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) { return; }

        // 1. Tách hàm fetch data ra
        const fetchAllData = () => {
            // Cập nhật token mới nhất 
            apiClient.defaults.headers['Authorization'] = `Bearer ${localStorage.getItem('jwt_token')}`;

            const fetchCurrentUser = apiClient.get(`/users/me`);
            const fetchCategories = apiClient.get(`/category`);
            const fetchRecentRecipes = apiClient.get(`/recipes?size=6`);

            Promise.all([fetchCurrentUser, fetchCategories, fetchRecentRecipes])
                .then(([userRes, categoryRes, recipeRes]) => {
                    // Cập nhật state (React sẽ tự động render lại các component con)
                    if (userRes.data?.data) setCurrentUser(userRes.data.data);
                    if (categoryRes.data?.data) setCategories(categoryRes.data.data);
                    if (recipeRes.data?.data) setRecentRecipes(recipeRes.data.data);
                })
                .catch(err => {
                    console.error("Lỗi khi tải dữ liệu:", err);
                    setError("Không thể tải dữ liệu trang chủ. Vui lòng thử lại.");
                })
                .finally(() => {
                    setLoading(false); 
                });
        };

        // 2. Chạy lần đầu
        fetchAllData();

        // 3. Thêm listener để tự động cập nhật khi quay lại tab
        window.addEventListener('focus', fetchAllData);

        // 4. Cleanup
        return () => {
            window.removeEventListener('focus', fetchAllData);
        };
    }, []); 
    


    if (loading) {
        return <div className="loading-container">Đang tải...</div>;
    }

    // Logic lấy avatar MỚI NHẤT (
    const displayUser = currentUser || { medias: [] }; 
    const avatarLetter = displayUser.firstName ? displayUser.firstName.charAt(0).toUpperCase() : (displayUser.username ? displayUser.username.charAt(0).toUpperCase() : '?');
    const latestAvatar = displayUser.medias?.slice().reverse().find(m => m.type === 'AVATAR');
    const avatarUrl = latestAvatar ? `${latestAvatar.media.url}?t=${new Date().getTime()}` : null;
    

    return (
        <div className="home-wrapper">
        
            {isProfileMenuOpen && <ProfileMenu user={currentUser} onClose={() => setIsProfileMenuOpen(false)} />}

            <header className="home-header">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        key={avatarUrl} 
                        alt="User Avatar"
                        className="user-avatar"
                        onClick={() => setIsProfileMenuOpen(true)}
                    />
                ) : (
                    <div 
                        className="user-avatar" 
                        onClick={() => setIsProfileMenuOpen(true)}
                    >
                        {avatarLetter}
                    </div>
                )}

                <Link to="/search" className="search-bar-link">
                    <div className="search-bar">
                        <SearchIcon />
                        <input type="text" placeholder="Tìm kiếm công thức,nguyên liệu..." readOnly />
                    </div>
                </Link>
                
             
                <Link to="/notifications" className="notification-icon">
                    <BellIcon />
                </Link>
             
            </header>

            <main>
                <section className="category-section">
                    <div className="section-title">
                        <h2>Danh mục</h2>
                        <Link to="/categories">Xem tất cả &rarr;</Link>
                    </div>
                    <div className="category-grid">
                        {categories.slice(0, 9).map(category => (
                            <Link
                                key={category.id}
                                to={`/category/${category.id}`}
                                state={{ categoryName: category.name }}
                                className="category-card-link"
                            >
                                <div className="category-card">
                                    <span>{category.name}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="recipes-section">
                    <div className="section-title">
                        <h2>Công thức mới</h2>
                    </div>
                    <div className="recipes-grid">
                        {recentRecipes.map(recipe => (
                            <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="recipe-card-link">
                                <div className="recipe-card-home">
                                    <img
                                        src={recipe.medias?.[0]?.media?.url || 'https://via.placeholder.com/150'}
                                        alt={recipe.title}
                                    />
                                    <h3>{recipe.title}</h3>
                                    <p>bởi {recipe.user?.username || 'Ẩn danh'}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
                {error && <p className="error-message">{error}</p>}
            </main>
        </div>
    );
};

export default Home;
