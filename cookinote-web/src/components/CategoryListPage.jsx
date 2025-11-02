import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './CategoryListPage.css'; // Tạo file CSS mới cho trang này

// Icon Quay lại
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

const CategoryListPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login'); // Chuyển về trang login nếu chưa đăng nhập
            return;
        }

        const apiClient = axios.create({
            baseURL: '/api/v1',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Gọi API để lấy TẤT CẢ danh mục
        apiClient.get('/category')
            .then(res => {
                if (res.data?.data) {
                    setCategories(res.data.data);
                } else {
                    setError("Không tìm thấy danh mục nào.");
                }
            })
            .catch(err => {
                console.error("Lỗi khi tải danh mục:", err);
                setError("Không thể tải dữ liệu. Vui lòng thử lại.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]); // Thêm navigate vào dependency array

    if (loading) {
        return <div className="loading-container">Đang tải...</div>;
    }

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    return (
        <div className="category-list-page">
            <header className="category-list-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeftIcon />
                </button>
                <h1>Tất cả danh mục</h1>
            </header>
            
            <main>
            
                <div className="category-grid">
                    {categories.map(category => (
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
            </main>
        </div>
    );
};

export default CategoryListPage;