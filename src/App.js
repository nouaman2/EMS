import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import FeedsList from './components/Feeds/FeedsList';
import DashboardList from './components/Dashboard/DashboardList';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import DashboardView from './components/Dashboard/DashboardView';
import InputList from './components/inputs/inputList';
import ProfilePage from './components/Auth/ProfilePage';
import EquilibriumDashboard from './components/Chart/EquilibriumDashboard';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const checkAuth = () => {
    const auth = localStorage.getItem('isAuthenticated') === 'true' && sessionStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(auth);
    setLoading(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');

    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('auth-change', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const updateAuth = (status) => {
    setIsAuthenticated(status);
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('auth'));
  };

  if (loading) return null;

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage isDarkMode={isDarkMode} toggleTheme={toggleTheme} updateAuth={updateAuth} />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />} />

          {isAuthenticated && (
            <Route path="/" element={<MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} />}>
              <Route path="dashboard" element={<DashboardList />} />
              <Route path="setup/feeds" element={<FeedsList />} />
              <Route path="dashboard/:type" element={<DashboardView />} />
              <Route path="dashboard/3_EQUILIBRAGE" element={<EquilibriumDashboard />} />
              <Route path="setup/inputs" element={<InputList />} />
            </Route>
          )}

          {!isAuthenticated && <Route path="*" element={<Navigate to="/login" replace />} />}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
