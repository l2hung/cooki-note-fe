import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecipePage.css';

// Icons
const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const HeartIcon = ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? '#ff4757' : 'none'} stroke={filled ? '#ff4757' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

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

    const apiClient = axios.create({
        baseURL: '/api/v1',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
    });

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchAllData = async () => {
            setLoading(true);
            setError(''); // Reset error on new fetch
            try {
                const [recipeRes, likesRes, userRes] = await Promise.all([
                    apiClient.get(`/recipes/${recipeId}`),
                    apiClient.get(`/like/recipe/${recipeId}`),
                    apiClient.get(`/users/me`)
                ]);

                if (recipeRes.data?.data) {
                    setRecipe(recipeRes.data.data);
                } else {
                    setError("Không tìm thấy công thức.");
                }

                if (userRes.data?.data) {
                    setCurrentUser(userRes.data.data);
                }

                if (likesRes.data?.data) {
                    const likedUsers = likesRes.data.data;
                    setLikeCount(likedUsers.length);

                    if (userRes.data?.data) {
                        const currentUserId = userRes.data.data.id;
                        setIsLiked(likedUsers.some(user => user.id === currentUserId));
                    }
                }

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu:", err);
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
            console.error("Lỗi khi like/unlike:", err);
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
                setRecipe(prevRecipe => ({
                    ...prevRecipe,
                    comments: [...prevRecipe.comments, response.data.data]
                }));
                setNewComment("");
            }
        } catch (err) {
            console.error("Lỗi khi gửi bình luận:", err);
            alert("Không thể gửi bình luận, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div className="loading-spinner"></div>;
    if (error) return <p className="error-message">{error}</p>;
    if (!recipe) return <p className="error-message">Không có dữ liệu công thức.</p>;

    const formattedDate = new Date(recipe.createdAt).toLocaleDateString('vi-VN');

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
                    <img src={recipe.user?.medias?.[0]?.media?.url || 'https://via.placeholder.com/40'} alt={recipe.user?.username} className="author-avatar" />
                    <div>
                        <span className="author-name">{recipe.user?.username || 'Ẩn danh'}</span>
                        <span className="recipe-date">{formattedDate}</span>
                    </div>
                </div>

                <div className="recipe-meta">
                    <div><ClockIcon /> {recipe.cookTimeMinutes} phút</div>
                    <div>Độ khó: {recipe.difficulty}</div>
                    <div>Khẩu phần: {recipe.servings}</div>
                </div>

                <section className="recipe-details-section">
                    <h2>Nguyên liệu</h2>
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
                        {recipe.steps?.sort((a, b) => a.stepOrder - b.stepOrder).map(step => (
                            <li key={step.id}>
                                <p>{step.description}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="recipe-details-section">
                    <h2>Bình luận</h2>
                    <div className="comments-section">
                        {recipe.comments?.map(comment => (
                            <div key={comment.id} className="comment-item">
                                <img src={comment.user?.medias?.[0]?.media?.url || 'https://via.placeholder.com/30'} alt={comment.user?.username} className="comment-avatar" />
                                <div className="comment-content">
                                    <strong>{comment.user?.username}</strong>
                                    <p>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                        {(!recipe.comments || recipe.comments.length === 0) && <p>Chưa có bình luận nào.</p>}
                    </div>
                    
                  <form className="comment-form" onSubmit={handleCommentSubmit}>
                        <div className="comment-form-left">
                            <img
                            src={currentUser?.medias?.[0]?.media?.url || 'https://via.placeholder.com/40'}
                            alt="Your Avatar"
                            className="comment-form-avatar"
                            />
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