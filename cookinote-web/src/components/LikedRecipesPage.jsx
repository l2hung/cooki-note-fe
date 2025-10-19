import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LikedRecipesPage.css'; // File CSS riêng

// === SỬ DỤNG ICON MŨI TÊN BẠN CUNG CẤP ===
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
// ===================================

const SearchIcon = () => <>&#128269;</>; // Icon kính lúp
const BookIcon = () => <>&#128214;</>; // Icon sách/kho

const LikedRecipesPage = () => {
    const [likedRecipes, setLikedRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); // State cho ô tìm kiếm
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const apiClient = axios.create({
            baseURL: '/api/v1',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const fetchLikedRecipes = async () => {
            setLoading(true);
            setError(''); // Reset lỗi
            try {
                const response = await apiClient.get('/recipes/like'); // Endpoint lấy công thức đã thích
                setLikedRecipes(response.data?.data || []);
            } catch (err) {
                console.error("Lỗi khi tải công thức đã thích:", err);
                setError("Không thể tải danh sách công thức đã lưu. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchLikedRecipes();
    }, [navigate]);

    // Lọc danh sách công thức dựa trên searchTerm
    const filteredRecipes = useMemo(() => {
        if (!searchTerm) {
            return likedRecipes; // Trả về toàn bộ nếu không có tìm kiếm
        }
        return likedRecipes.filter(recipe =>
            recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, likedRecipes]);

    return (
        <div className="liked-recipes-wrapper">
            {/* Header với nút Back và Search */}
            <header className="liked-recipes-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeftIcon /> {/* <-- SỬ DỤNG ICON MỚI */}
                </button>
                <div className="search-bar">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder="Tìm trong công thức đã lưu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="header-placeholder"></div> {/* Giữ khoảng trống */}
            </header>

            <main className="liked-recipes-container">
                {loading && <p className="loading-message">Đang tải...</p>}
                {error && <p className="error-message">{error}</p>}

                {!loading && likedRecipes.length === 0 && (
                    <div className="empty-state">
                        <span className="empty-icon"><BookIcon /></span>
                        <p>Bạn chưa lưu công thức nào.</p>
                        <p>Hãy khám phá và nhấn thích nhé!</p>
                    </div>
                )}

                {!loading && filteredRecipes.length === 0 && searchTerm && (
                     <p className="no-results-message">Không tìm thấy công thức nào khớp.</p>
                )}

                {/* Hiển thị danh sách đã lọc */}
                <div className="recipes-grid">
                    {filteredRecipes.map(recipe => (
                        <Link to={`/recipe/${recipe.id}`} key={recipe.id} className="recipe-card-link">
                            <div className="recipe-card">
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
            </main>
        </div>
    );
};

export default LikedRecipesPage;