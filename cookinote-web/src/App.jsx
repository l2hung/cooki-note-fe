import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import CategoryPage from './components/CategoryPage';
import RecipePage from './components/RecipePage';
import SearchPage from './components/SearchPage';
import MainLayout from './components/MainLayout'; 
import AddRecipe from './components/AddRecipe';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('jwt_token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Routes>
      
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      
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
      </Route>

      {/* Route bắt lỗi cuối cùng */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;