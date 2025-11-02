import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import CategoryPage from './components/CategoryPage';
import RecipePage from './components/RecipePage';
import SearchPage from './components/SearchPage';
import MainLayout from './components/MainLayout'; 
import AddRecipe from './components/AddRecipe';
import LikedRecipesPage from './components/LikedRecipesPage';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import FriendsPage from './components/FriendsPage';
import StatsPage from './components/StatsPage';
import HistoryPage from './components/HistoryPage';
import NotificationPage from './components/NotificationPage';
import CategoryListPage from './components/CategoryListPage';
import EditProfilePage from './components/EditProfilePage';
import ShoppingListPage from './components/ShoppingListPage'; 
import AISuggestPage from './components/AISuggestPage'; 
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';


import './App.css';


const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jwt_token');
  return token ? children : <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
};

function App() {
  return (
    <Routes>
      {/* Các route công khai */}
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />


      {/* Route cha sử dụng MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        
        <Route path="home" element={<Home />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="category/:categoryId" element={<CategoryPage />} />
        <Route path="recipe/:recipeId" element={<RecipePage />} />
        <Route path="recipes/new" element={<AddRecipe />} />
        <Route path="liked" element={<LikedRecipesPage />} />

        
        <Route path="profile/:userId" element={<ProfilePage />} />
        <Route path="friends" element={<FriendsPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="notifications" element={<NotificationPage />} />
        <Route path="categories" element={<CategoryListPage />} />
        <Route path="profile/edit" element={<EditProfilePage />} />

        <Route path="shopping-list" element={<ShoppingListPage />} />
        <Route path="ai-suggest" element={<AISuggestPage />} />
        
      </Route>

      {/* Route bắt lỗi cuối cùng */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}

export default App;
