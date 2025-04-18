import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import FeedsList from './components/Feeds/FeedsList';
import DashboardList from './components/Dashboard/DashboardList';
import LoginPage from './components/Auth/LoginPage';
import DashboardView from './components/Dashboard/DashboardView';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start with false
  
  //chaque fois que l'etat isDarkMode change l'attribut data-theme est mis à jour dans le HTML pour appliquer le bon thème via CSS.
  useEffect(() => {document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');}, [isDarkMode]);

  //inverser le mode claire et sombre et le Sauvegarde dans locaStorage
  const toggleTheme = () => {
    setIsDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  // Check authentication status whenever the component mounts or localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);
    };

    // Check initial auth status
    checkAuth();

    // Add event listener for localStorage changes
    window.addEventListener('storage', checkAuth);

    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    // Cleanup
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`} >
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage 
                  isDarkMode={isDarkMode} 
                  toggleTheme={toggleTheme}
                />
              )
            } 
          />
          <Route
            path="/*"
            element={
              isAuthenticated ? (
                <MainLayout isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardList />} />
                    <Route path="/setup/feeds" element={<FeedsList />} />
                    <Route path="/dashboard/:type" element={<DashboardView />} />
                  </Routes>
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;