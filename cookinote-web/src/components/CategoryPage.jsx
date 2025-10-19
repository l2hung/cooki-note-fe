import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CategoryPage.css'; // Quan trọng: Đảm bảo bạn import file CSS

const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

const CategoryPage = () => {
    const { categoryId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const categoryName = location.state?.categoryName;

    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecipes = async () => {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                navigate('/login');
                return;
            }

            setLoading(true);
            try {
                const apiClient = axios.create({
                    baseURL: '/api/v1',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const response = await apiClient.get(`/recipes/category/${categoryId}`);
                if (response.data?.data) {
                    setRecipes(response.data.data);
                }
            } catch (err) {
                console.error("Lỗi khi tải công thức theo danh mục:", err);
                setError("Không thể tải dữ liệu. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [categoryId, navigate]);

    return (
        <div className="category-page-container">
            <header className="category-page-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeftIcon />
                </button>
                <h1>{categoryName || 'Công thức'}</h1>
                <div className="placeholder"></div> {/* For alignment */}
            </header>
            
            <main className="category-page-content">
                {loading && <div className="loading-spinner"></div>}
                {error && <p className="error-message">{error}</p>}
                
                {!loading && !error && (
                    <div className="recipes-grid-category"> {/* Đổi tên class để tránh xung đột */}
                        {recipes.length > 0 ? (
                            recipes.map(recipe => (
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
                            ))
                        ) : (
                            <p className="no-recipes-message">Chưa có công thức nào trong danh mục này.</p>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CategoryPage;
