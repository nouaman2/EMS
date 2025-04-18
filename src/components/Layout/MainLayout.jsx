import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout = ({ children, isDarkMode, toggleTheme }) => {
  return (
    <div className="main-layout">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;