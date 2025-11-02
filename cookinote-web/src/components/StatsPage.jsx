import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './StatsPage.css'; // File CSS

// --- Icons ---
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
// Icons cho thẻ thống kê
const RecipeIcon = () => <>&#127858;</>; // Công thức
const HeartIcon = () => <>&#10084;&#65039;</>; // Thích
const CommentIcon = () => <>&#128172;</>; // Bình luận
const ViewIcon = () => <>&#128065;&#65039;</>; // Lượt xem
// ---

const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});

// Hàm helper lấy ngày (format YYYY-MM-DD)
const getToday = () => new Date().toISOString().split('T')[0];
const getFirstDayOfMonth = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
};

const StatsPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null); // { recipeCount, totalLikes, ..., recipes: [...] }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State cho bộ lọc ngày
    const [startDate, setStartDate] = useState(getFirstDayOfMonth());
    const [endDate, setEndDate] = useState(getToday());

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }
        apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
    }, [navigate]);

    // Hàm gọi API khi nhấn nút
    const handleFetchStats = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setStats(null); 

        try {
            // Gọi API từ RecipeController
            const res = await apiClient.get('/recipes/stats/created-between', {
                params: {
                    createdAtAfter: startDate,
                    createdAtBefore: endDate
                }
            });
            
            setStats(res.data?.data); // Lưu toàn bộ object (bao gồm cả mảng 'recipes')

        } catch (err) {
            console.error("Lỗi khi tải thống kê:", err);
            if (err.response && err.response.status === 404) {
                setError('Không tìm thấy công thức nào trong khoảng thời gian này.');
            } else {
                setError('Không thể tải thống kê. Vui lòng thử lại.');
            }
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stats-page">
            <header className="stats-page-header">
                <button onClick={() => navigate(-2)} className="back-button">
                    <ArrowLeftIcon />
                </button>
                <h1>Thống Kê Bếp</h1>
                <div style={{ width: '24px' }}></div> 
            </header>

            <main>
                {/* --- Form chọn ngày --- */}
                <form className="date-filter-form" onSubmit={handleFetchStats}>
                    <div className="date-input-group">
                        <label htmlFor="start-date">Từ ngày</label>
                        <input 
                            type="date" 
                            id="start-date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            max={endDate} 
                        />
                    </div>
                    <div className="date-input-group">
                        <label htmlFor="end-date">Đến ngày</label>
                        <input 
                            type="date" 
                            id="end-date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate} 
                            max={getToday()} 
                        />
                    </div>
                    <button type="submit" className="stats-submit-button" disabled={loading}>
                        {loading ? 'Đang tải...' : 'Xem thống kê'}
                    </button>
                </form>

                {/* --- Khu vực kết quả --- */}
                <div className="stats-result-container">
                    {loading && <div className="loading-spinner"></div>}
                    {error && <p className="error-message">{error}</p>}
                    
                    {/* Thống kê tổng quan */}
                    {stats && (
                        <div className="stats-grid">
                            <StatCard icon={<RecipeIcon />} value={stats.recipeCount} label="Công thức đã đăng" color="blue"/>
                            <StatCard icon={<HeartIcon />} value={stats.totalLikes} label="Tổng lượt thích" color="red"/>
                            <StatCard icon={<CommentIcon />} value={stats.totalComments} label="Tổng bình luận" color="green"/>
                            <StatCard icon={<ViewIcon />} value={stats.totalViews} label="Tổng lượt xem" color="purple"/>
                        </div>
                    )}
                    
                    {/* --- VÙNG MỚI: Thống kê chi tiết --- */}
                    {stats && stats.recipes && stats.recipes.length > 0 && (
                        <section className="stats-details-section">
                            <h2>Chi tiết công thức ({stats.recipes.length})</h2>
                            <div className="stats-recipe-list">
                                {stats.recipes.map(recipe => (
                                    <RecipeStatCard key={recipe.id} recipe={recipe} />
                                ))}
                            </div>
                        </section>
                    )}
                    {/* --- KẾT THÚC VÙNG MỚI --- */}
                </div>
            </main>
        </div>
    );
};

// --- Component con: Thẻ thống kê tổng quan (Giữ nguyên) ---
const StatCard = ({ icon, value, label, color }) => {
    return (
        <div className={`stat-card ${color}`}>
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
        </div>
    );
};
// Dữ liệu 'recipe' ở đây là RecipeDto1
const RecipeStatCard = ({ recipe }) => (
    <Link to={`/recipe/${recipe.id}`} className="recipe-stat-card">
        <span className="recipe-stat-title">{recipe.title}</span>
        <div className="recipe-stat-numbers">
     
            <span>&#10084;&#65039; {recipe.likes?.length || 0}</span>
            <span>&#128172; {recipe.comments?.length || 0}</span>
            <span>&#128065;&#65039; {recipe.viewsCount || 0}</span>
        </div>
    </Link>
);

export default StatsPage;
