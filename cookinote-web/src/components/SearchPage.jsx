import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './SearchPage.css';

// Icons
const ArrowLeftIcon = () => <>&#8592;</>;
const SearchIcon = () => <>&#128269;</>;
const UserIcon = () => <>&#128100;</>;
const RecipeIcon = () => <>&#127858;</>;
const BookIcon = () => <>&#128214;</>;

const SearchPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('recipe');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const apiClient = axios.create({
        baseURL: '/api/v1',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
    });

    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([]);
            return;
        }
        setLoading(true);
        setError('');

        const delayDebounceFn = setTimeout(() => {
            const endpoint = searchType === 'recipe'
                ? `/recipes/search?keyword=${searchTerm}`
                : `/users/search?username=${searchTerm}`;

            apiClient.get(endpoint)
                .then(res => setResults(res.data?.data || []))
                .catch(err => {
                    console.error("Lỗi khi tìm kiếm:", err);
                    setError("Không thể thực hiện tìm kiếm.");
                })
                .finally(() => setLoading(false));
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, searchType]);

    return (
        <div className="search-page-wrapper">
            <header className="search-page-header">
                <button onClick={() => navigate(-1)} className="icon-button">
                    <ArrowLeftIcon />
                </button>
                <div className="search-bar">
                    <SearchIcon />
                    <input
                        type="text"
                        placeholder={searchType === 'recipe' ? "Gõ vào tên các nguyên liệu..." : "Gõ vào tên bạn bếp..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>
                {/* Nút FilterIcon đã được xóa khỏi đây */}
            </header>

            <div className="search-toggle-container">
                 <button 
                    onClick={() => setSearchType(searchType === 'recipe' ? 'user' : 'recipe')} 
                    className="user-search-button"
                 >
                    <UserIcon />
                    <span>{searchType === 'recipe' ? 'Tìm bạn bếp' : 'Tìm công thức'}</span>
                </button>
            </div>

            <main className="search-results-container">
                {loading && <p>Đang tìm kiếm...</p>}
                {error && <p className="error-message">{error}</p>}
                
                {!loading && results.length === 0 && searchTerm.trim() && (
                    <p>Không tìm thấy kết quả nào.</p>
                )}

                {results.map(item => (
                    searchType === 'recipe'
                        ? <RecipeResultCard key={item.id} recipe={item} />
                        : <UserResultCard key={item.id} user={item} />
                ))}
            </main>

         
        </div>
    );
};

// Các component con không thay đổi
const RecipeResultCard = ({ recipe }) => (
    <Link to={`/recipe/${recipe.id}`} className="result-card">
        <img src={recipe.medias?.[0]?.media?.url || 'https://via.placeholder.com/60'} alt={recipe.title} />
        <div className="result-info">
            <h4>{recipe.title}</h4>
            <p>bởi {recipe.user?.username || 'Ẩn danh'}</p>
        </div>
    </Link>
);

const UserResultCard = ({ user }) => (
    <Link to={`/profile/${user.id}`} className="result-card">
        <img src={user.medias?.[0]?.media?.url || 'https://via.placeholder.com/60'} alt={user.username} />
        <div className="result-info">
            <h4>{user.username}</h4>
            <p>{user.firstName} {user.lastName}</p>
        </div>
    </Link>
);

export default SearchPage;