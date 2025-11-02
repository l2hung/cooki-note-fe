import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import './NotificationPage.css'; // Import file CSS

// Icon Quay lại (Đã sửa viewBox)
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);

// Tách apiClient ra ngoài component
const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});

const NotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Thêm navigate

    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
            navigate('/login');
            return;
        }
        
        apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;

        const fetchNotifications = async () => {
            setLoading(true);
            try {
               
                const res = await apiClient.get('/notification/me'); 
                setNotifications(res.data?.data || []);
               
            } catch (err) {
                console.error("Lỗi khi tải thông báo:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [navigate]); 

    
    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="notification-page">
           
            <header className="notification-page-header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <ArrowLeftIcon />
                </button>
                <h1>Thông báo</h1>
            
                <div style={{ width: '24px' }}></div> 
            </header>

            <main>
                <div className="notification-list">
                    {loading && <p className="loading-message">Đang tải thông báo...</p>}
                    
                    {!loading && notifications.length === 0 && (
                        <p className="empty-message">
                            Bạn không có thông báo nào.
                        </p>
                    )}

                    {notifications.map(noti => (
                       
                        <div key={noti.id} className={`notification-item ${noti.read ? '' : 'unread'}`}>
                           
                            <div className="noti-content">
                                <p>{noti.message}</p>
                                <span className="notification-time">{formatTime(noti.createdAt)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default NotificationPage;
