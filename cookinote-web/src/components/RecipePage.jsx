import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecipePage.css';

// Icons
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
);
const HeartIcon = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#ff4757' : 'none'} stroke={filled ? '#ff4757' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);
const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
);

const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});

const RecipePage = () => {
    const { recipeId } = useParams();
    const navigate = useNavigate();
    
    const [recipe, setRecipe] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isAddingToList, setIsAddingToList] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }
        apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;

        const fetchAllData = async () => {
            setLoading(true);
            setError(''); 
            try {
                const [recipeRes, userRes] = await Promise.all([
                    apiClient.get(`/recipes/${recipeId}`),
                    apiClient.get(`/users/me`)
                ]);

                if (userRes.data?.data) setCurrentUser(userRes.data.data);

                if (recipeRes.data?.data) {
                    const recipeData = recipeRes.data.data;
                    setRecipe(recipeData);

                    const likes = recipeData.likes || [];
                    setLikeCount(likes.length);

                    if (userRes.data?.data) {
                        const currentUserId = userRes.data.data.id;
                        setIsLiked(likes.some(like => like.user?.id === currentUserId));
                    }
                } else {
                    setError("Không tìm thấy công thức.");
                }
            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [recipeId, navigate]);

    const handleLikeToggle = async () => {
        const originalLikedState = isLiked;
        const originalLikeCount = likeCount;

        setIsLiked(!originalLikedState);
        setLikeCount(originalLikedState ? originalLikeCount - 1 : originalLikeCount + 1);

        try {
            if (originalLikedState) {
                await apiClient.delete(`/like/recipe/${recipeId}`);
            } else {
                await apiClient.post(`/like/recipe/${recipeId}`);
            }
        } catch (err) {
            console.error(err);
            setIsLiked(originalLikedState);
            setLikeCount(originalLikeCount);
            alert("Đã xảy ra lỗi, vui lòng thử lại.");
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const response = await apiClient.post(`/comment/recipe/${recipeId}`, { content: newComment });
            if (response.data?.data) {
                setRecipe(prev => ({
                    ...prev,
                    comments: [response.data.data, ...prev.comments]
                }));
                setNewComment("");
            }
        } catch (err) {
            console.error(err);
            alert("Không thể gửi bình luận, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddToShoppingList = async () => {
        if (isAddingToList) return;
        setIsAddingToList(true);
        try {
            await apiClient.post('/shopping-list', { recipeId: recipe.id });
            alert("Đã thêm nguyên liệu vào danh sách đi chợ!");
            navigate('/shopping-list');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Không thể thêm vào danh sách.");
        } finally {
            setIsAddingToList(false);
        }
    };

    const sortedSteps = useMemo(() => {
        if (!recipe?.steps) return [];
        return [...recipe.steps].sort((a,b) => a.stepOrder - b.stepOrder);
    }, [recipe?.steps]);

    if (loading) return <div className="loading-spinner">Đang tải...</div>;
    if (error) return <p className="error-message">{error}</p>;
    if (!recipe) return <p className="error-message">Không có dữ liệu công thức.</p>;

    const formattedDate = new Date(recipe.createdAt).toLocaleDateString('vi-VN');

    const author = recipe.user;
    const authorAvatar = author.medias?.slice().reverse().find(m => m.type === 'AVATAR');
    const authorAvatarUrl = authorAvatar ? `${authorAvatar.media.url}?t=${new Date().getTime()}` : null;
    const authorAvatarLetter = author.firstName ? author.firstName.charAt(0).toUpperCase() : (author.username ? author.username.charAt(0).toUpperCase() : '?');

    const currentUserAvatar = currentUser?.medias?.slice().reverse().find(m => m.type === 'AVATAR');
    const currentUserAvatarUrl = currentUserAvatar ? `${currentUserAvatar.media.url}?t=${new Date().getTime()}` : null;
    const currentUserAvatarLetter = currentUser?.firstName ? currentUser.firstName.charAt(0).toUpperCase() : (currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : '?');

    return (
        <div className="recipe-page-container">
            <header className="recipe-page-header">
                <button onClick={() => navigate(-1)} className="back-button"><ArrowLeftIcon /></button>
            </header>

            <main>
                <img src={recipe.medias?.[0]?.media?.url || 'https://via.placeholder.com/400x250'} alt={recipe.title} className="recipe-main-image" />

                <div className="recipe-title-section">
                    <h1>{recipe.title}</h1>
                    <button onClick={handleLikeToggle} className={`like-button ${isLiked ? 'liked' : ''}`}>
                        <HeartIcon filled={isLiked} /> {likeCount}
                    </button>
                </div>

                <div className="author-info">
                    {authorAvatarUrl ? (
                        <img src={authorAvatarUrl} alt={author.username} className="author-avatar" />
                    ) : (
                        <div className="author-avatar-letter">{authorAvatarLetter}</div>
                    )}
                    <div>
                        <span className="author-name">{author.username || 'Ẩn danh'}</span>
                        <span className="recipe-date">{formattedDate}</span>
                    </div>
                </div>

                <div className="recipe-meta">
                    <div><ClockIcon /> {recipe.cookTimeMinutes} phút</div>
                    <div>Độ khó: {recipe.difficulty}</div>
                    <div>Khẩu phần: {recipe.servings}</div>
                </div>

                <section className="recipe-details-section">
                    <div className="section-header-with-button"> 
                        <h2>Nguyên liệu</h2>
                        <button className="add-to-list-button" onClick={handleAddToShoppingList} disabled={isAddingToList}>
                            <CartIcon />
                            <span>{isAddingToList ? 'Đang thêm...' : 'Thêm vào danh sách'}</span>
                        </button>
                    </div>
                    <ul className="ingredients-list">
                        {recipe.ingredients?.map(item => (
                            <li key={item.ingredient.id}>
                                <span>{item.ingredient.name}</span>
                                <span>{item.quantity} {item.unit}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="recipe-details-section">
                    <h2>Các bước làm</h2>
                    <ol className="steps-list">
                        {sortedSteps.map(step => (
                            <li key={step.id}>
                                <p>{step.description}</p>
                                {step.medias?.[0]?.media?.url && (
                                    <img src={step.medias[0].media.url} alt={`Step ${step.stepOrder}`} className="step-image" />
                                )}
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="recipe-details-section">
                    <h2>Bình luận</h2>
                    <div className="comments-section">
                        {recipe.comments?.map(comment => {
                            const cAuthor = comment.user;
                            const cAvatar = cAuthor?.medias?.slice().reverse().find(m => m.type === 'AVATAR');
                            const cAvatarUrl = cAvatar ? `${cAvatar.media.url}?t=${new Date().getTime()}` : null;
                            const cAvatarLetter = cAuthor?.firstName ? cAuthor.firstName.charAt(0).toUpperCase() : (cAuthor?.username ? cAuthor.username.charAt(0).toUpperCase() : '?');

                            return (
                                <div key={comment.id} className="comment-item">
                                    {cAvatarUrl ? (
                                        <img src={cAvatarUrl} alt={cAuthor.username} className="comment-avatar" />
                                    ) : (
                                        <div className="comment-avatar-letter">{cAvatarLetter}</div>
                                    )}
                                    <div className="comment-content">
                                        <strong>{cAuthor?.username}</strong>
                                        <p>{comment.content}</p>
                                    </div>
                                </div>
                            );
                        })}
                        {(!recipe.comments || recipe.comments.length === 0) && <p>Chưa có bình luận nào.</p>}
                    </div>
                    
                    <form className="comment-form" onSubmit={handleCommentSubmit}>
                        <div className="comment-form-user">
                            {currentUserAvatarUrl ? (
                                <img src={currentUserAvatarUrl} alt="Your Avatar" className="comment-form-avatar" />
                            ) : (
                                <div className="comment-form-avatar-letter">{currentUserAvatarLetter}</div>
                            )}
                            <span className="comment-form-name">{currentUser?.username}</span>
                        </div>

                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Viết bình luận..."
                            rows="2"
                            disabled={isSubmitting}
                        />

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? '...' : <SendIcon />}
                        </button>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default RecipePage;
