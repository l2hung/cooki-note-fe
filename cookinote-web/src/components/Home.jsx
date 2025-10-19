import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProfileMenu from './ProfileMenu'; // <-- IMPORT MENU MỚI
import './Home.css'; 


const SearchIcon = () => <>&#128269;</>;
const BellIcon = () => <>&#128276;</>;
const BookIcon = () => <>&#128214;</>;


const Home = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [categories, setCategories] = useState([]);
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false); // State để quản lý menu

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) { return; }

        const apiClient = axios.create({
            baseURL: '/api/v1',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const fetchCurrentUser = apiClient.get(`/users/me`);
        const fetchCategories = apiClient.get(`/category`);
        const fetchRecentRecipes = apiClient.get(`/recipes?size=6`);

        Promise.all([fetchCurrentUser, fetchCategories, fetchRecentRecipes])
            .then(([userRes, categoryRes, recipeRes]) => {
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
    }, []);

    if (loading) {
        return <div className="loading-container">Đang tải...</div>;
    }

    return (
        <div className="home-wrapper">
            {/* Render menu nếu isProfileMenuOpen là true */}
            {isProfileMenuOpen && <ProfileMenu user={currentUser} onClose={() => setIsProfileMenuOpen(false)} />}

            <header className="home-header">
                <img
                    src={currentUser?.medias?.[0]?.media?.url || 'https://via.placeholder.com/40'}
                    alt="User Avatar"
                    className="user-avatar"
                    onClick={() => setIsProfileMenuOpen(true)} // Mở menu khi click
                />
                <Link to="/search" className="search-bar-link">
                    <div className="search-bar">
                        <SearchIcon />
                        <input type="text" placeholder="Tìm kiếm công thức,nguyên liệu..." readOnly />
                    </div>
                </Link>
                <div className="notification-icon">
                    <BellIcon />
                </div>
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
