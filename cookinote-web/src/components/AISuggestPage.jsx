import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AISuggestPage.css'; // File CSS mới

// --- Icons ---
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const SparkleIcon = () => <>&#10024;</>; // Icon AI
// ---

const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});

const AISuggestPage = () => {
    const navigate = useNavigate();
    const [prompt, setPrompt] = useState(''); // Nội dung người dùng nhập
    const [result, setResult] = useState(null); // Kết quả (công thức) từ AI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Kiểm tra token khi vào trang
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }
        apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;
    }, [navigate]);

    // Xử lý khi người dùng gửi yêu cầu
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!prompt.trim()) {
            setError('Vui lòng nhập nguyên liệu bạn có.');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null); // Xóa kết quả cũ

        try {
            // 1. Gọi API backend mới của bạn
            const res = await apiClient.post('/ai/suggest', { 
                prompt: prompt // Gửi nội dung prompt lên
            });

            // 2. Nhận kết quả (giả định là một đối tượng Recipe)
            if (res.data?.data) {
                setResult(res.data.data);
            } else {
                setError("AI không thể tìm thấy công thức phù hợp.");
            }
        } catch (err) {
            console.error("Lỗi khi gọi AI:", err);
            setError(err.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ai-suggest-page">
            <header className="ai-suggest-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeftIcon />
                </button>
                <h1>AI Gợi ý món ăn</h1>
                <div style={{ width: '24px' }}></div> 
            </header>

            <main>
                {/* --- Form nhập liệu --- */}
                <form className="ai-prompt-form" onSubmit={handleSubmit}>
                    <textarea
                        placeholder="Nhập các nguyên liệu bạn đang có (ví dụ: thịt gà, nấm, cà rốt)..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows="3"
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading} className="ai-submit-button">
                        {loading ? '...' : <SparkleIcon />}
                        <span>{loading ? 'Đang suy nghĩ...' : 'Gợi ý'}</span>
                    </button>
                </form>

                {/* --- Khu vực hiển thị kết quả --- */}
                <div className="ai-result-container">
                    {loading && <div className="loading-spinner"></div>}
                    {error && <p className="error-message">{error}</p>}
                    
                    {!loading && !result && !error && (
                        <p className="empty-message">
                            Hãy cho AI biết bạn có gì, AI sẽ gợi ý món ngon cho bạn!
                        </p>
                    )}

                    {result && <RecipeResult recipe={result} />}
                </div>
            </main>
        </div>
    );
};

// --- Component con: Hiển thị kết quả công thức từ AI ---
// (Giả định AI trả về cấu trúc: { title, ingredients: [...], steps: [...] })
const RecipeResult = ({ recipe }) => {
    return (
        <div className="ai-recipe-result">
            <h2>{recipe.title}</h2>
            
            <section className="ai-result-section">
                <h3>Nguyên liệu</h3>
                <ul className="ai-ingredients-list">
                    {recipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                    ))}
                </ul>
            </section>

            <section className="ai-result-section">
                <h3>Cách làm</h3>
                <ol className="ai-steps-list">
                    {recipe.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                    ))}
                </ol>
            </section>
        </div>
    );
};

export default AISuggestPage;