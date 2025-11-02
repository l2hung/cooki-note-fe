import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './HistoryPage.css'; 

// Icon Quay lại
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

// Tạo apiClient bên ngoài để tránh vòng lặp re-render
const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});

const HistoryPage = () => {
    const navigate = useNavigate();
    const [recentRecipes, setRecentRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }

        apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;

        apiClient.get('/recipes/recent-views')
            .then(res => {
                if (res.data?.data) {
                    // Loại bỏ các recipe có id trùng
                    const uniqueRecipes = Array.from(
                        new Map(res.data.data.map((r) => [r.id, r])).values()
                    );
                    setRecentRecipes(uniqueRecipes);
                }
            })
            .catch(err => {
                console.error("Lỗi khi tải lịch sử xem:", err);
                setError("Không thể tải lịch sử xem. Vui lòng thử lại.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    const renderContent = () => {
        if (loading) return <p>Đang tải lịch sử...</p>;
        if (error) return <p className="error-message" style={{ color: 'red' }}>{error}</p>;
        if (recentRecipes.length === 0) return <p>Bạn chưa xem công thức nào gần đây.</p>;

        return (
            <div className="history-results-list">
                {recentRecipes.map((recipe, index) => (
                    <RecipeResultCard key={`${recipe.id}-${index}`} recipe={recipe} />
                ))}
            </div>
        );
    };

    return (
        <div className="history-page">
            <header className="history-page-header">
                <button
                    onClick={() => navigate(-2)}
                    className="back-button"
                    aria-label="Quay lại"
                >
                    <ArrowLeftIcon />
                </button>
                <h1>Món đã xem gần đây</h1>
            </header>
            <main>
                {renderContent()}
            </main>
        </div>
    );
};

const RecipeResultCard = ({ recipe }) => (
    <Link to={`/recipe/${recipe.id}`} className="result-card">
        <img
            src={recipe.medias?.[0]?.media?.url || 'https://via.placeholder.com/60'}
            alt={recipe.title}
        />
        <div className="result-info">
            <h4>{recipe.title}</h4>
            <p>bởi {recipe.user?.username || 'Ẩn danh'}</p>
        </div>
    </Link>
);

export default HistoryPage;
