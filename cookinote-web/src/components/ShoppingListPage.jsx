import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ShoppingListPage.css'; // File CSS mới

// --- Icons ---
const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff4757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);
// ---

const apiClient = axios.create({
    baseURL: '/api/v1',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` }
});

const ShoppingListPage = () => {
    const navigate = useNavigate();
    const [shoppingLists, setShoppingLists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Hàm tải dữ liệu chính
    const fetchShoppingLists = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('jwt_token');
            if (!token) {
                navigate('/login');
                return;
            }
            apiClient.defaults.headers['Authorization'] = `Bearer ${token}`;

            // 1. Gọi API từ ShoppingListController
            const res = await apiClient.get('/shopping-list/me');
            setShoppingLists(res.data?.data || []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách mua sắm:", err);
            setError("Không thể tải danh sách. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    // Tải dữ liệu khi vào trang và khi quay lại tab
    useEffect(() => {
        fetchShoppingLists(); // Tải lần đầu
        window.addEventListener('focus', fetchShoppingLists); // Tải lại khi focus
        return () => {
            window.removeEventListener('focus', fetchShoppingLists);
        };
    }, [navigate]);

    // 2. Xử lý Xóa danh sách (DELETE /shopping-list/{id})
    const handleDeleteList = async (listId) => {
        if (!window.confirm("Bạn có chắc muốn xóa danh sách này?")) return;

        // Cập nhật giao diện trước
        const originalLists = [...shoppingLists];
        setShoppingLists(prevLists => prevLists.filter(list => list.id !== listId));

        try {
            await apiClient.delete(`/shopping-list/${listId}`);
        } catch (err) {
            console.error("Lỗi khi xóa danh sách:", err);
            setError("Xóa thất bại, vui lòng thử lại.");
            setShoppingLists(originalLists); // Trả lại nếu lỗi
        }
    };

    // 3. Xử lý Checkbox (PATCH /shopping-items)
    const handleTogglePurchased = async (item, listId, newCheckedState) => {
        
        // Cập nhật giao diện trước (Optimistic Update)
        setShoppingLists(currentLists => 
            currentLists.map(list => {
                if (list.id === listId) {
                    return {
                        ...list,
                        items: list.items.map(i => 
                            i.ingredient.id === item.ingredient.id 
                            ? { ...i, purchased: newCheckedState } 
                            : i
                        )
                    };
                }
                return list;
            })
        );

        // Chuẩn bị DTO dựa trên ShoppingItemDto1
        const payload = {
            shoppingList: { id: listId },
            ingredient: { id: item.ingredient.id },
            quantity: item.quantity,
            unit: item.unit,
            purchased: newCheckedState // Gửi trạng thái mới
        };

        try {
            // Gọi API từ ShoppingItemController
            await apiClient.patch('/shopping-items', payload);
        } catch (err) {
            console.error("Lỗi khi cập nhật mục:", err);
            setError("Cập nhật thất bại.");
            // Rollback (tải lại toàn bộ) nếu lỗi
            fetchShoppingLists(); 
        }
    };

    // Render
    const renderContent = () => {
        if (loading) {
            return <p className="loading-message">Đang tải danh sách...</p>;
        }
        if (error) {
            return <p className="error-message">{error}</p>;
        }
        if (shoppingLists.length === 0) {
            return (
                <p className="empty-message">
                    Bạn chưa có danh sách đi chợ nào.
                </p>
            );
        }
        return (
            <div className="list-container">
                {shoppingLists.map(list => (
                    <ShoppingListComponent 
                        key={list.id} 
                        list={list} 
                        onDelete={handleDeleteList}
                        onToggleItem={handleTogglePurchased}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="shopping-list-page">
            <header className="shopping-list-header">
                <button onClick={() => navigate(-2)} className="back-button">
                    <ArrowLeftIcon />
                </button>
                <h1>Danh sách đi chợ</h1>
                <div style={{ width: '24px' }}></div> 
            </header>
            <main>
                {renderContent()}
            </main>
        </div>
    );
};


// --- Component con: Hiển thị 1 danh sách  ---
const ShoppingListComponent = ({ list, onDelete, onToggleItem }) => {
    
    // Tách riêng 2 nhóm
    const pendingItems = list.items.filter(item => !item.purchased);
    const purchasedItems = list.items.filter(item => item.purchased);

    return (
        <div className="shopping-list-card">
            <div className="card-header">
                <div className="card-title">
                    <h3>{list.title}</h3>
                    <span>{new Date(list.plannedDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <button onClick={() => onDelete(list.id)} className="delete-button">
                    <TrashIcon />
                </button>
            </div>
            
            <div className="items-container">
                {/* Mục chưa mua */}
                {pendingItems.map(item => (
                    <ShoppingItemComponent 
                        key={item.ingredient.id} 
                        item={item} 
                        listId={list.id} 
                        onToggle={onToggleItem} 
                    />
                ))}
                
                {/* Mục đã mua (có đường gạch) */}
                {purchasedItems.length > 0 && (
                    <>
                        <h4 className="purchased-title">Đã mua ({purchasedItems.length})</h4>
                        {purchasedItems.map(item => (
                            <ShoppingItemComponent 
                                key={item.ingredient.id} 
                                item={item} 
                                listId={list.id} 
                                onToggle={onToggleItem} 
                            />
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

// --- Component con: Hiển thị 1 nguyên liệu (1 dòng) ---
const ShoppingItemComponent = ({ item, listId, onToggle }) => {
    const [isChecked, setIsChecked] = useState(item.purchased);

    const handleChange = (e) => {
        const newCheckedState = e.target.checked;
        setIsChecked(newCheckedState); // Cập nhật UI ngay
        onToggle(item, listId, newCheckedState); // Gọi API
    };

    return (
        <div className={`shopping-item ${isChecked ? 'purchased' : ''}`}>
            <label className="checkbox-container">
                <input 
                    type="checkbox" 
                    checked={isChecked} 
                    onChange={handleChange} 
                />
                <span className="checkmark"></span>
            </label>
            <span className="item-name">{item.ingredient.name}</span>
            <span className="item-quantity">{item.quantity} {item.unit}</span>
        </div>
    );
};

export default ShoppingListPage;
