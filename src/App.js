import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import FeedsList from './components/Feeds/FeedsList';
import DashboardList from './components/Dashboard/DashboardList';
import LoginPage from './components/Auth/LoginPage';
import DashboardView from './components/Dashboard/DashboardView';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(null); // ← null = not yet checked
  const [loading, setLoading] = useState(true); // ← new loading state

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);
      setLoading(false); // ← we're done checking
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  if (loading) return null; // ← wait before rendering routes (or show spinner)

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`}>
      <BrowserRouter>
        <Routes>
          {/* Login Route */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              )
            }
          />

          {/* Protected Routes */}
          {isAuthenticated && (
            <Route
              path="/"
              element={
                <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
              }
            >
              <Route path="dashboard" element={<DashboardList />} />
              <Route path="setup/feeds" element={<FeedsList />} />
              <Route path="dashboard/:type" element={<DashboardView />} />
            </Route>
          )}

          {/* Catch unauthenticated access */}
          {!isAuthenticated && (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
