import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './SearchPage.css';

// Icons
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const SearchIcon = () => <>&#128269;</>;
const UserIcon = () => <>&#128100;</>;
const RecipeIcon = () => <>&#127858;</>;
const BookIcon = () => <>&#128214;</>;


const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});

const SearchPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('recipe');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


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
                : `/users/search?keyword=${searchTerm}`; 

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

// Component này KHÔNG đổi (Avatar của công thức)
const RecipeResultCard = ({ recipe }) => (
    <Link to={`/recipe/${recipe.id}`} className="result-card">
        <img src={recipe.medias?.[0]?.media?.url || 'https://via.placeholder.com/60'} alt={recipe.title} />
        <div className="result-info">
            <h4>{recipe.title}</h4>
            <p>bởi {recipe.user?.username || 'Ẩn danh'}</p>
        </div>
    </Link>
);


const UserResultCard = ({ user }) => {
   
    const latestAvatar = user.medias?.slice().reverse().find(m => m.type === 'AVATAR');
   
    const avatarUrl = latestAvatar ? `${latestAvatar.media.url}?t=${new Date().getTime()}` : null;

    return (
        <Link to={`/profile/${user.id}`} className="result-card">
            <img 
                src={avatarUrl || 'https://via.placeholder.com/60'} 
                alt={user.username} 
                key={avatarUrl} 
            />
            <div className="result-info">
                <h4>{user.username}</h4>
                <p>{user.firstName} {user.lastName}</p>
            </div>
        </Link>
    );
};


export default SearchPage;
